import axios from 'axios'

// Sender.net API configuration
const SENDER_CONFIG = {
  apiUrl: 'https://api.sender.net/v2',
  apiToken: process.env.SENDER_API_TOKEN
}

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'applications@mail.sender.net',
  to: process.env.EMAIL_TO, // James@ecrlimited.co.uk
  cc: process.env.EMAIL_CC, // Sean.palmer@ecrlimited.co.uk
  replyTo: process.env.EMAIL_REPLY_TO
}

export async function sendSubmissionEmail(applicationData, pdfBuffer, user) {
  try {
    // Validate configuration
    if (!SENDER_CONFIG.apiToken) {
      throw new Error('Sender.net API token not configured')
    }
    if (!EMAIL_CONFIG.to) {
      throw new Error('Email destination not configured')
    }

    // Prepare email content
    const emailContent = generateEmailContent(applicationData)
    
    // Prepare recipients
    const recipients = [EMAIL_CONFIG.to]
    if (EMAIL_CONFIG.cc) {
      recipients.push(EMAIL_CONFIG.cc)
    }

    // Prepare Sender.net API payload
    const emailPayload = {
      to: recipients,
      from: {
        email: EMAIL_CONFIG.from,
        name: 'Agent Application System'
      },
      reply_to: EMAIL_CONFIG.replyTo || user.email,
      subject: `New Merchant Application - ${applicationData.businessInfo.legalName} (${applicationData.applicationId})`,
      html: emailContent.html,
      text: emailContent.text
    }

    // Add PDF attachment if available
    if (pdfBuffer) {
      emailPayload.attachments = [{
        filename: `Application-${applicationData.applicationId}.pdf`,
        content: pdfBuffer.toString('base64'),
        type: 'application/pdf'
      }]
    }

    // Send via Sender.net API
    const response = await axios.post(`${SENDER_CONFIG.apiUrl}/send`, emailPayload, {
      headers: {
        'Authorization': `Bearer ${SENDER_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    if (response.status === 200 || response.status === 201) {
      console.log('Email sent successfully via Sender.net:', response.data)
      return {
        success: true,
        messageId: response.data.message_id || response.data.id
      }
    } else {
      throw new Error(`Sender.net API returned status ${response.status}`)
    }

  } catch (error) {
    console.error('Sender.net email error:', error)
    
    // Handle specific Sender.net errors
    if (error.response?.data) {
      throw new Error(`Sender.net API error: ${error.response.data.message || error.response.data.error}`)
    }
    
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

function generateEmailContent(data) {
  const businessName = data.businessInfo.legalName
  const applicationId = data.applicationId
  const agentName = data.agentInfo.name
  const agentEmail = data.agentInfo.email
  
  // Calculate totals
  const equipmentTotal = data.totalEquipmentCost || 0
  const urgentFee = data.agentInfo.isUrgent ? 20.00 : 0
  const totalFees = equipmentTotal + urgentFee

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .key { font-weight: bold; }
        .value { color: #666; }
        .total { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .urgent { color: #dc2626; font-weight: bold; }
        @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>New Merchant Application Received</h2>
        <p><strong>Application ID:</strong> ${applicationId}</p>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Submitted by:</strong> ${agentName} (${agentEmail})</p>
        ${data.agentInfo.isUrgent ? '<p class="urgent">⚡ URGENT PROCESSING REQUESTED (+£20 fee)</p>' : ''}
      </div>

      <div class="section">
        <h3>Business Information</h3>
        <div class="grid">
          <div><span class="key">Legal Name:</span> <span class="value">${data.businessInfo.legalName}</span></div>
          <div><span class="key">Business Type:</span> <span class="value">${formatBusinessType(data.businessTypeCheck.type)}</span></div>
          ${data.businessInfo.tradingName ? `<div><span class="key">Trading Name:</span> <span class="value">${data.businessInfo.tradingName}</span></div>` : ''}
          <div><span class="key">VAT Registered:</span> <span class="value">${data.businessInfo.vatRegistered ? 'Yes' : 'No'}</span></div>
        </div>
        <p><strong>Trading Address:</strong><br>${formatAddress(data.businessInfo.tradingAddress)}</p>
      </div>

      <div class="section">
        <h3>Principal Information</h3>
        ${data.principals.map((principal, index) => `
          <div style="margin-bottom: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px;">
            <h4>Principal ${index + 1}</h4>
            <div class="grid">
              <div><span class="key">Name:</span> <span class="value">${principal.firstName} ${principal.lastName}</span></div>
              <div><span class="key">Email:</span> <span class="value">${principal.email}</span></div>
              <div><span class="key">Phone:</span> <span class="value">${principal.phone}</span></div>
              <div><span class="key">Position:</span> <span class="value">${formatPosition(principal.position)}</span></div>
              <div><span class="key">Ownership:</span> <span class="value">${principal.ownershipPercentage}%</span></div>
            </div>
            ${principal.ownershipPercentage > 25 ? '<p style="color: #dc2626; font-size: 12px;">⚠️ Beneficial Owner (>25% ownership)</p>' : ''}
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h3>Trading Information</h3>
        <div class="grid">
          <div><span class="key">MCC Code:</span> <span class="value">${data.tradingInfo.mccCode} - ${data.tradingInfo.mccDescription}</span></div>
          <div><span class="key">American Express:</span> <span class="value">${data.tradingInfo.amexRequired ? 'Required' : 'Not Required'}</span></div>
          <div><span class="key">Annual Turnover:</span> <span class="value">£${data.tradingInfo.projectedAnnualTurnover?.toLocaleString() || '0'}</span></div>
          <div><span class="key">Average Transaction:</span> <span class="value">£${data.tradingInfo.estimatedAverageTransaction || '0'}</span></div>
        </div>
      </div>

      <div class="section">
        <h3>Pricing</h3>
        <div class="grid">
          <div><span class="key">Consumer Debit:</span> <span class="value">${data.pricing.consumerDebit}%</span></div>
          <div><span class="key">Consumer Credit:</span> <span class="value">${data.pricing.consumerCredit}%</span></div>
          <div><span class="key">Commercial Card:</span> <span class="value">${data.pricing.commercialCard}%</span></div>
          <div><span class="key">Authorization Fee:</span> <span class="value">£${data.pricing.authorisationFee}</span></div>
        </div>
      </div>

      ${data.equipment.selectedDevices.length > 0 ? `
        <div class="section">
          <h3>Equipment</h3>
          ${data.equipment.selectedDevices.map(device => `
            <div class="grid">
              <div><span class="key">${device.name}:</span> <span class="value">${device.optionDescription} (${device.quantity}x)</span></div>
              <div style="text-align: right;"><span class="value">£${(device.totalCost || 0).toFixed(2)}</span></div>
            </div>
          `).join('')}
          <div style="border-top: 1px solid #e5e7eb; margin-top: 10px; padding-top: 10px;">
            <div class="grid">
              <div><span class="key">Equipment Total:</span></div>
              <div style="text-align: right;"><span class="key">£${equipmentTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="section">
        <h3>Banking Details</h3>
        <div class="grid">
          <div><span class="key">Account Name:</span> <span class="value">${data.banking.accountName}</span></div>
          <div><span class="key">Sort Code:</span> <span class="value">${formatSortCode(data.banking.sortCode)}</span></div>
          <div><span class="key">Account Number:</span> <span class="value">${data.banking.accountNumber}</span></div>
        </div>
      </div>

      <div class="total">
        <h3>Application Summary</h3>
        <div class="grid">
          <div><span class="key">Equipment Total:</span> <span class="value">£${equipmentTotal.toFixed(2)}</span></div>
          ${urgentFee > 0 ? `<div><span class="key">Urgent Processing Fee:</span> <span class="value">£${urgentFee.toFixed(2)}</span></div>` : ''}
          <div style="border-top: 2px solid #2563eb; padding-top: 10px; margin-top: 10px;">
            <span class="key" style="font-size: 16px;">Total Fees: £${totalFees.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Review the application details above</li>
          <li>Verify all information is accurate</li>
          <li>Process the merchant application according to internal procedures</li>
          <li>Contact the agent if any information needs clarification</li>
        </ol>
      </div>
    </body>
    </html>
  `

  // Generate plain text version
  const text = `
MERCHANT APPLICATION SUBMISSION

Application ID: ${applicationId}
Business: ${businessName}
Submitted by: ${agentName} (${agentEmail})
${data.agentInfo.isUrgent ? 'URGENT PROCESSING REQUESTED (+£20 fee)' : ''}

BUSINESS INFORMATION
Legal Name: ${data.businessInfo.legalName}
Business Type: ${formatBusinessType(data.businessTypeCheck.type)}
${data.businessInfo.tradingName ? `Trading Name: ${data.businessInfo.tradingName}` : ''}
Trading Address: ${formatAddress(data.businessInfo.tradingAddress)}
VAT Registered: ${data.businessInfo.vatRegistered ? 'Yes' : 'No'}

PRINCIPAL INFORMATION
${data.principals.map((principal, index) => `
Principal ${index + 1}:
  Name: ${principal.firstName} ${principal.lastName}
  Email: ${principal.email}
  Phone: ${principal.phone}
  Position: ${formatPosition(principal.position)}
  Ownership: ${principal.ownershipPercentage}%
  ${principal.ownershipPercentage > 25 ? '  Status: Beneficial Owner (>25%)' : ''}
`).join('')}

TRADING INFORMATION
MCC Code: ${data.tradingInfo.mccCode} - ${data.tradingInfo.mccDescription}
American Express: ${data.tradingInfo.amexRequired ? 'Required' : 'Not Required'}
Annual Turnover: £${data.tradingInfo.projectedAnnualTurnover?.toLocaleString() || '0'}
Average Transaction: £${data.tradingInfo.estimatedAverageTransaction || '0'}

PRICING
Consumer Debit: ${data.pricing.consumerDebit}%
Consumer Credit: ${data.pricing.consumerCredit}%
Commercial Card: ${data.pricing.commercialCard}%
Authorization Fee: £${data.pricing.authorisationFee}

${data.equipment.selectedDevices.length > 0 ? `
EQUIPMENT
${data.equipment.selectedDevices.map(device => `${device.name}: ${device.optionDescription} (${device.quantity}x) - £${(device.totalCost || 0).toFixed(2)}`).join('\n')}
Equipment Total: £${equipmentTotal.toFixed(2)}
` : ''}

BANKING DETAILS
Account Name: ${data.banking.accountName}
Sort Code: ${formatSortCode(data.banking.sortCode)}
Account Number: ${data.banking.accountNumber}

APPLICATION SUMMARY
Equipment Total: £${equipmentTotal.toFixed(2)}
${urgentFee > 0 ? `Urgent Processing Fee: £${urgentFee.toFixed(2)}` : ''}
Total Fees: £${totalFees.toFixed(2)}

---
This email was automatically generated by the Agent Application System.
Generated on ${new Date().toLocaleString('en-GB')}
  `.trim()

  return { html, text }
}

// Helper functions (same as PDF service)
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

function formatAddress(address) {
  if (!address) return 'No address provided'
  
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.county,
    address.postcode
  ].filter(part => part && part.trim())
  
  return parts.join(', ')
}

function formatSortCode(sortCode) {
  if (!sortCode) return ''
  const cleaned = sortCode.replace(/\D/g, '')
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`
  }
  return sortCode
}
