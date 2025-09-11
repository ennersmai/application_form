import PDFDocument from 'pdfkit'

async function generateApplicationPDF(applicationData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      })

      const chunks = []
      
      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(pdfBuffer)
      })
      doc.on('error', reject)

      // PDF Header with logo
      try {
        const logoPathCandidates = [
          'public/images/the_payments_expert.png',
          'src/assets/images/the_payments_expert.png',
          'dist/images/the_payments_expert.png'
        ]
        const fs = require('fs')
        const path = require('path')
        let logoPath = null
        for (const p of logoPathCandidates) {
          const abs = path.resolve(process.cwd(), p)
          if (fs.existsSync(abs)) { logoPath = abs; break }
        }
        if (logoPath) {
          doc.image(logoPath, { fit: [220, 60], align: 'center' }).moveDown()
        }
      } catch (e) {
        // Skip logo if not found
      }

      doc.fontSize(20)
         .text('MERCHANT APPLICATION SUBMISSION', { align: 'center' })
         .moveDown()

      doc.fontSize(12)
         .text(`Application ID: ${applicationData.applicationId}`, { align: 'right' })
         .text(`Submitted: ${new Date().toLocaleDateString('en-GB')}`, { align: 'right' })
         .moveDown()

      // Agent Information
      addSection(doc, 'AGENT INFORMATION')
      addKeyValue(doc, 'Agent Name', applicationData.agentInfo.name)
      addKeyValue(doc, 'Agent Email', applicationData.agentInfo.email)
      addKeyValue(doc, 'Urgent Processing', applicationData.agentInfo.isUrgent ? 'Yes (+£20.00)' : 'No')
      doc.moveDown()

      // Business Type
      addSection(doc, 'BUSINESS TYPE')
      const businessType = formatBusinessType(applicationData.businessTypeCheck.type)
      addKeyValue(doc, 'Type', businessType)
      
      if (applicationData.businessTypeCheck.companyDetails) {
        addKeyValue(doc, 'Company Name', applicationData.businessTypeCheck.companyDetails.company_name)
        addKeyValue(doc, 'Company Number', applicationData.businessTypeCheck.companyDetails.company_number)
        addKeyValue(doc, 'Directors Verified', applicationData.businessTypeCheck.directorsVerified ? 'Yes' : 'No')
      }
      doc.moveDown()

      // Principal Information
      addSection(doc, 'PRINCIPAL INFORMATION')
      applicationData.principals.forEach((principal, index) => {
        doc.fontSize(11).text(`Principal ${index + 1}:`, { underline: true })
        addKeyValue(doc, '  Name', `${principal.firstName} ${principal.lastName}`)
        addKeyValue(doc, '  Email', principal.email)
        addKeyValue(doc, '  Phone', principal.phone)
        addKeyValue(doc, '  Position', formatPosition(principal.position))
        addKeyValue(doc, '  Ownership', `${principal.ownershipPercentage}%`)
        // Include principal home address
        const homeAddress = principal.homeAddress ? formatAddress(principal.homeAddress) : ''
        if (homeAddress) {
          addKeyValue(doc, '  Home Address', homeAddress)
        }
        if (principal.ownershipPercentage > 25) {
          addKeyValue(doc, '  Status', 'Beneficial Owner (>25%)')
        }
        doc.moveDown(0.5)
      })
      doc.moveDown()

      // Business Information
      addSection(doc, 'BUSINESS INFORMATION')
      addKeyValue(doc, 'Legal Name', applicationData.businessInfo.legalName)
      if (applicationData.businessInfo.tradingName) {
        addKeyValue(doc, 'Trading Name', applicationData.businessInfo.tradingName)
      }
      
      // Format address
      const address = applicationData.businessInfo.tradingAddress
      const formattedAddress = formatAddress(address)
      addKeyValue(doc, 'Trading Address', formattedAddress)
      addKeyValue(doc, 'VAT Registered', applicationData.businessInfo.vatRegistered ? 'Yes' : 'No')
      doc.moveDown()

      // Trading Information
      addSection(doc, 'TRADING INFORMATION')
      addKeyValue(doc, 'Business Type (MCC)', `${applicationData.tradingInfo.mccCode} - ${applicationData.tradingInfo.mccDescription}`)
      addKeyValue(doc, 'American Express', applicationData.tradingInfo.amexRequired ? 'Required' : 'Not Required')
      addKeyValue(doc, 'Projected Annual Turnover', `£${applicationData.tradingInfo.projectedAnnualTurnover?.toLocaleString() || '0'}`)
      addKeyValue(doc, 'Average Transaction', `£${applicationData.tradingInfo.estimatedAverageTransaction || '0'}`)
      doc.moveDown()

      // Pricing
      addSection(doc, 'PRICING')
      addKeyValue(doc, 'Consumer Debit', `${applicationData.pricing.consumerDebit}%`)
      addKeyValue(doc, 'Consumer Credit', `${applicationData.pricing.consumerCredit}%`)
      addKeyValue(doc, 'Commercial Card', `${applicationData.pricing.commercialCard}%`)
      addKeyValue(doc, 'Authorization Fee', `£${applicationData.pricing.authorisationFee}`)
      doc.moveDown()

      // Equipment
      addSection(doc, 'EQUIPMENT')
      if (applicationData.pricing.devicePricing && Object.keys(applicationData.pricing.devicePricing).length > 0) {
        Object.entries(applicationData.pricing.devicePricing).forEach(([deviceId, device]) => {
          if (device.quantity > 0) {
            const deviceName = formatDeviceName(deviceId)
            const contractTypeLabel = formatContractType(device.contractType)
            const totalCost = device.quantity * device.monthlyPrice
            addKeyValue(doc, deviceName, `${contractTypeLabel} (Qty: ${device.quantity}) - £${totalCost.toFixed(2)}/month`)
          }
        })
        addKeyValue(doc, 'Equipment Monthly Total', `£${applicationData.pricing.totalMonthlyCost?.toFixed(2) || '0.00'}`)
      } else {
        addKeyValue(doc, 'Equipment', 'None selected')
      }
      doc.moveDown()

      // Banking
      addSection(doc, 'BANKING DETAILS')
      addKeyValue(doc, 'Account Name', applicationData.banking.accountName)
      addKeyValue(doc, 'Sort Code', formatSortCode(applicationData.banking.sortCode))
      addKeyValue(doc, 'Account Number', applicationData.banking.accountNumber)
      doc.moveDown()

      // Summary
      addSection(doc, 'SUMMARY')
      const equipmentTotal = applicationData.pricing.totalMonthlyCost || 0
      const urgentFee = applicationData.agentInfo.isUrgent ? 20.00 : 0
      const totalFees = equipmentTotal + urgentFee

      addKeyValue(doc, 'Equipment Cost', `£${equipmentTotal.toFixed(2)}`)
      if (urgentFee > 0) {
        addKeyValue(doc, 'Urgent Processing Fee', `£${urgentFee.toFixed(2)}`)
      }
      addKeyValue(doc, 'Total Fees', `£${totalFees.toFixed(2)}`)

      // Footer
      doc.moveDown(2)
         .fontSize(10)
         .text('This document was automatically generated by the Agent Application System.', { align: 'center' })
         .text(`Generated on ${new Date().toLocaleString('en-GB')}`, { align: 'center' })

      // Finalize PDF
      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}

// Helper functions
function addSection(doc, title) {
  doc.fontSize(14)
     .text(title, { underline: true })
     .fontSize(10)
     .moveDown(0.5)
}

function addKeyValue(doc, key, value) {
  doc.text(`${key}: ${value}`, { indent: 20 })
}

function formatBusinessType(type) {
  switch (type) {
    case 'sole_trader': return 'Sole Trader'
    case 'limited_company': return 'Limited Company'
    case 'partnership': return 'Partnership'
    default: return type
  }
}

function formatPosition(position) {
  switch (position) {
    case 'sole_trader': return 'Sole Trader'
    case 'director': return 'Director'
    case 'ultimate_owner': return 'Director/Ultimate Owner'
    case 'partner': return 'Partner'
    default: return position
  }
}

function formatSortCode(sortCode) {
  if (!sortCode) return ''
  const cleaned = sortCode.replace(/\D/g, '')
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`
  }
  return sortCode
}

function formatDeviceName(deviceId) {
  const deviceNames = {
    'clover-flex': 'Clover Flex',
    'clover-mini': 'Clover Mini',
    'clover-station-duo': 'Clover Station Duo',
    'clover-kitchen-printer': 'Clover Kitchen Printer',
    'clover-cash-drawer': 'Clover Cash Drawer'
  }
  return deviceNames[deviceId] || deviceId
}

function formatContractType(contractType) {
  const contractTypes = {
    'standard': '48 Month Contract',
    'promo': '48 Month - 6 months at £1pm',
    'purchase': 'Upfront Purchase'
  }
  return contractTypes[contractType] || contractType
}

function formatAddress(address) {
  if (!address) return ''
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.county,
    address.postcode
  ].filter(part => part && String(part).trim())
  return parts.join(', ')
}

// CommonJS exports
module.exports = {
  generateApplicationPDF
}
