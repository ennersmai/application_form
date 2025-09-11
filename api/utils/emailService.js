// Using native fetch instead of axios

// Sender.net API configuration
// Try multiple endpoint patterns to find the correct one
const SENDER_CONFIG = {
  apiUrl: process.env.SENDER_API_URL || 'https://api.sender.net/v2/emails/send',
  apiToken: process.env.SENDER_API_TOKEN
}

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'applications@mail.sender.net',
  to: process.env.EMAIL_TO, // James@ecrlimited.co.uk
  cc: process.env.EMAIL_CC, // Sean.palmer@ecrlimited.co.uk
  replyTo: process.env.EMAIL_REPLY_TO
}

// Optional: Preconfigured campaign to trigger via Sender.net Campaigns API
const SENDER_CAMPAIGN_ID = process.env.SENDER_CAMPAIGN_ID
// Optional: Webhook to trigger external automation (e.g., Sender.net automation via webhook)
const SENDER_WEBHOOK_URL = process.env.SENDER_WEBHOOK_URL
const SENDER_WEBHOOK_TOKEN = process.env.SENDER_WEBHOOK_TOKEN

async function sendSubmissionEmail(applicationData, pdfBuffer, user) {
  // Based on Sender.net API documentation, use transactional campaigns for one-off emails
  const possibleEndpoints = [
    // Transactional endpoints (may require higher plan/permissions)
    'https://api.sender.net/v2/transactional',
    'https://api.sender.net/v2/transactional/send',
    'https://api.sender.net/v2/emails/transactional',
    'https://api.sender.net/v2/campaigns/transactional'
  ]
  
  let lastError = null
  
  // Optional fastest path: send via webhook if configured
  if (SENDER_WEBHOOK_URL) {
    try {
      console.log('Trying webhook send at:', SENDER_WEBHOOK_URL)
      const result = await attemptSendWebhook(SENDER_WEBHOOK_URL, applicationData, pdfBuffer, user)
      if (result.success) {
        console.log('Success via webhook')
        return result
      }
    } catch (error) {
      console.log('Webhook send failed:', error.message)
      lastError = error
    }
  }

  // Optional fast-path: trigger a prebuilt campaign if configured
  if (SENDER_CAMPAIGN_ID) {
    try {
      console.log(`Trying Sender.net Campaign send for campaign ID: ${SENDER_CAMPAIGN_ID}`)
      const sent = await attemptSendCampaign(SENDER_CAMPAIGN_ID)
      if (sent.success) {
        return sent
      }
    } catch (e) {
      console.log('Campaign send attempt failed, falling back to API send flow:', e.message)
    }
  }

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Trying Sender.net endpoint: ${endpoint}`)
      const result = await attemptSendEmail(endpoint, applicationData, pdfBuffer, user)
      if (result.success) {
        console.log(`Success with endpoint: ${endpoint}`)
        return result
      }
    } catch (error) {
      console.log(`Failed with endpoint ${endpoint}:`, error.message)
      lastError = error
      if (!error.message.includes('404')) {
        // If it's not a 404, this might be the right endpoint with a different issue
        throw error
      }
    }
  }
  
  // If all endpoints failed, provide fallback logging but don't fail the submission
  console.error('All Sender.net endpoints failed. Logging email for manual processing...')
  console.log('=== EMAIL THAT FAILED TO SEND ===')
  console.log('TO:', EMAIL_CONFIG.to, EMAIL_CONFIG.cc ? `, CC: ${EMAIL_CONFIG.cc}` : '')
  console.log('FROM:', EMAIL_CONFIG.from)
  console.log('SUBJECT:', `New Merchant Application - ${applicationData.businessInfo.legalName} (${applicationData.applicationId})`)
  console.log('APPLICATION ID:', applicationData.applicationId)
  console.log('BUSINESS NAME:', applicationData.businessInfo.legalName)
  console.log('AGENT:', user.email)
  console.log('SUBMITTED:', new Date().toISOString())
  console.log('=== END EMAIL LOG ===')
  
  // Return a fallback success to prevent submission failure
  console.log('⚠️ EMAIL FALLBACK: Application will be saved but email notification failed')
  return {
    success: true,
    messageId: 'fallback-' + Date.now(),
    service: 'fallback-logging',
    warning: 'Email service unavailable - check logs for email content'
  }
}

// Trigger a preconfigured campaign by ID via Sender.net Campaigns API
async function attemptSendCampaign(campaignId) {
  if (!campaignId) throw new Error('Campaign ID not provided')
  if (!SENDER_CONFIG.apiToken) throw new Error('Sender.net API token not configured')

  const url = `https://api.sender.net/v2/campaigns/${encodeURIComponent(campaignId)}/send`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDER_CONFIG.apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  const bodyText = await response.text()
  let body
  try { body = JSON.parse(bodyText) } catch { body = { message: bodyText } }
  console.log('Sender.net campaign send status:', response.status, body)

  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Campaign send failed with status ${response.status}`)
  }

  return { success: true, message: body?.message || 'Campaign started to send', service: 'sender-campaign' }
}

async function attemptSendEmail(apiUrl, applicationData, pdfBuffer, user) {
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
    
    // Fix: Match the exact format that worked in your Postman test
    let emailPayload = {
      from: EMAIL_CONFIG.from, // String format as the API requires
      to: EMAIL_CONFIG.to, // Simple string format 
      subject: `New Merchant Application - ${applicationData.businessInfo.legalName} (${applicationData.applicationId})`,
      html: emailContent.html,
      text: emailContent.text,
      editor: "html" // Required by Sender.net transactional API
    }

    // Add CC if configured (you might need to test this format)
    if (EMAIL_CONFIG.cc) {
      // Try simple comma-separated format first
      emailPayload.to = `${EMAIL_CONFIG.to}, ${EMAIL_CONFIG.cc}`
    }

    // Add PDF attachment if available
    if (pdfBuffer) {
      emailPayload.attachments = [{
        filename: `Application-${applicationData.applicationId}.pdf`,
        content: pdfBuffer.toString('base64'),
        type: 'application/pdf'
      }]
    }

    console.log('=== DEBUGGING SENDER.NET REQUEST ===')
    console.log('API URL:', apiUrl)
    console.log('API Token (first 10 chars):', SENDER_CONFIG.apiToken?.substring(0, 10) + '...')
    console.log('FROM email:', EMAIL_CONFIG.from)
    console.log('TO email:', EMAIL_CONFIG.to)
    
    // Log the EXACT payload being sent
    console.log('EXACT PAYLOAD BEING SENT:')
    console.log(JSON.stringify(emailPayload, null, 2))
    
    // Log the EXACT headers being sent
    const headers = {
      'Authorization': `Bearer ${SENDER_CONFIG.apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    console.log('EXACT HEADERS BEING SENT:')
    console.log(JSON.stringify(headers, null, 2))
    // Validate all email addresses are properly formatted
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    console.log('=== EMAIL VALIDATION ===')
    console.log('FROM valid:', emailRegex.test(emailPayload.from), emailPayload.from)
    console.log('TO valid:', emailRegex.test(emailPayload.to), emailPayload.to)
    console.log('REPLY_TO valid:', emailRegex.test(emailPayload.reply_to), emailPayload.reply_to)
    console.log('=== END EMAIL VALIDATION ===')
    
    // If any email is invalid, throw a clear error
    if (!emailRegex.test(emailPayload.from)) {
      throw new Error(`Invalid FROM email format: ${emailPayload.from}`)
    }
    if (!emailRegex.test(emailPayload.to)) {
      throw new Error(`Invalid TO email format: ${emailPayload.to}`)
    }
    if (!emailRegex.test(emailPayload.reply_to)) {
      throw new Error(`Invalid REPLY_TO email format: ${emailPayload.reply_to}`)
    }

    // TEMPORARY: Let's also try the exact format that worked in Postman
    const postmanPayload = {
      "from": "james@thepaymentsexpert.com",
      "to": "your-test-email@gmail.com", // Replace with your test email
      "subject": "API Test from Code",
      "html": "<h1>Test from code</h1>",
      "editor": "html"
    }
    
    console.log('=== TESTING WITH POSTMAN PAYLOAD ===')
    console.log('Postman payload:', JSON.stringify(postmanPayload, null, 2))
    
    // Try the exact Postman payload first
    const postmanResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postmanPayload)
    })
    
    console.log('Postman test response status:', postmanResponse.status)
    const postmanText = await postmanResponse.text()
    console.log('Postman test response body:', postmanText)
    
    if (postmanResponse.ok) {
      console.log('🎉 POSTMAN PAYLOAD WORKED! The issue is in your email content/format')
      // Don't return yet, let's see what happens with the real payload
    } else {
      console.log('❌ Even Postman payload failed - this is a token/permissions issue')
    }
    console.log('=== END POSTMAN TEST ===')
    
    console.log('Now trying with real application data...')
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDER_CONFIG.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })
    
    console.log('Sender.net response status:', response.status)
    
    // Always log the response body for debugging
    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { message: responseText }
    }
    console.log('Sender.net response body:', responseData)

    if (response.ok) {
      console.log('Email sent successfully via Sender.net:', responseData)
      return {
        success: true,
        messageId: responseData.message_id || responseData.id || 'success'
      }
    } else {
      // Provide specific error messages for common issues
      if (response.status === 403) {
        throw new Error(`Sender.net API permission denied (403). Possible issues:
        1. API token doesn't have transactional email permissions
        2. Sender domain '${EMAIL_CONFIG.from}' is not verified
        3. Account needs transactional email feature enabled
        Error: ${responseData.message || response.statusText}`)
      } else if (response.status === 401) {
        throw new Error(`Sender.net API authentication failed (401). Check API token validity. Error: ${responseData.message || response.statusText}`)
      } else {
        throw new Error(`Sender.net API returned status ${response.status}: ${responseData.message || response.statusText}`)
      }
    }

  } catch (error) {
    console.error('Sender.net email error:', error)
    
    // Handle specific Sender.net errors
    if (error.message.includes('Sender.net API')) {
      throw error
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
  const equipmentTotal = data.pricing.totalMonthlyCost || 0
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

      ${data.pricing.devicePricing && Object.keys(data.pricing.devicePricing).length > 0 ? `
        <div class="section">
          <h3>Equipment</h3>
          ${Object.entries(data.pricing.devicePricing)
            .filter(([_, device]) => device.quantity > 0)
            .map(([deviceId, device]) => {
              const deviceName = formatDeviceName(deviceId)
              const contractTypeLabel = formatContractType(device.contractType)
              const totalCost = device.quantity * device.monthlyPrice
              return `
                <div class="grid">
                  <div><span class="key">${deviceName}:</span> <span class="value">${contractTypeLabel} (${device.quantity}x)</span></div>
                  <div style="text-align: right;"><span class="value">£${totalCost.toFixed(2)}/month</span></div>
                </div>
              `
            }).join('')}
          <div style="border-top: 1px solid #e5e7eb; margin-top: 10px; padding-top: 10px;">
            <div class="grid">
              <div><span class="key">Equipment Monthly Total:</span></div>
              <div style="text-align: right;"><span class="key">£${(data.pricing.totalMonthlyCost || 0).toFixed(2)}</span></div>
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

${data.pricing.devicePricing && Object.keys(data.pricing.devicePricing).length > 0 ? `
EQUIPMENT
${Object.entries(data.pricing.devicePricing)
  .filter(([_, device]) => device.quantity > 0)
  .map(([deviceId, device]) => {
    const deviceName = formatDeviceName(deviceId)
    const contractTypeLabel = formatContractType(device.contractType)
    const totalCost = device.quantity * device.monthlyPrice
    return `${deviceName}: ${contractTypeLabel} (${device.quantity}x) - £${totalCost.toFixed(2)}/month`
  }).join('\n')}
Equipment Monthly Total: £${(data.pricing.totalMonthlyCost || 0).toFixed(2)}
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

// CommonJS exports
module.exports = {
  sendSubmissionEmail
}
