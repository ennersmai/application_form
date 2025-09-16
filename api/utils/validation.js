// Server-side validation for application data
function validateApplicationData(data) {
  const errors = []

  try {
    // Validate required top-level structure
    if (!data.applicationId) errors.push('Application ID is required')
    if (!data.agentInfo) errors.push('Agent information is required')
    if (!data.principals || !Array.isArray(data.principals)) errors.push('Principal information is required')
    if (!data.businessInfo) errors.push('Business information is required')
    if (!data.tradingInfo) errors.push('Trading information is required')
    if (!data.pricing) errors.push('Pricing information is required')
    if (!data.banking) errors.push('Banking information is required')
    // Note: additionalInfo and outlets are optional and don't require validation

    // Validate agent information
    if (data.agentInfo) {
      if (!data.agentInfo.name) errors.push('Agent name is required')
      if (!data.agentInfo.email) errors.push('Agent email is required')
      if (!isValidEmail(data.agentInfo.email)) errors.push('Agent email format is invalid')
    }

    // Validate principals
    if (data.principals && Array.isArray(data.principals)) {
      if (data.principals.length === 0) {
        errors.push('At least one principal is required')
      }

      data.principals.forEach((principal, index) => {
        const prefix = `Principal ${index + 1}`
        
        if (!principal.firstName) errors.push(`${prefix}: First name is required`)
        if (!principal.lastName) errors.push(`${prefix}: Last name is required`)
        if (!principal.email) errors.push(`${prefix}: Email is required`)
        if (principal.email && !isValidEmail(principal.email)) errors.push(`${prefix}: Email format is invalid`)
        if (!principal.phone) errors.push(`${prefix}: Phone number is required`)
        if (!principal.position) errors.push(`${prefix}: Position is required`)
        
        if (typeof principal.ownershipPercentage !== 'number' || principal.ownershipPercentage < 0 || principal.ownershipPercentage > 100) {
          errors.push(`${prefix}: Ownership percentage must be between 0 and 100`)
        }
        
        // Validate home address
        if (!principal.homeAddress) {
          errors.push(`${prefix}: Home address is required`)
        } else {
          const addr = principal.homeAddress
          if (!addr.line1) errors.push(`${prefix}: Home address line 1 is required`)
          if (!addr.city) errors.push(`${prefix}: Home address city is required`)
          if (!addr.postcode) errors.push(`${prefix}: Home address postcode is required`)
          if (addr.postcode && !isValidUKPostcode(addr.postcode)) {
            errors.push(`${prefix}: Invalid home address postcode format`)
          }
        }
      })

      // Validate total ownership for multiple principals
      if (data.principals.length > 1) {
        const totalOwnership = data.principals.reduce((sum, p) => sum + (p.ownershipPercentage || 0), 0)
        if (Math.abs(totalOwnership - 100) > 0.01) { // Allow small floating point differences
          errors.push('Total ownership percentage must equal 100%')
        }
      }
    }

    // Validate business information
    if (data.businessInfo) {
      if (!data.businessInfo.legalName) errors.push('Legal business name is required')
      if (!data.businessInfo.businessType) errors.push('Business type is required')
      
      // Validate address
      if (!data.businessInfo.tradingAddress) {
        errors.push('Trading address is required')
      } else {
        const addr = data.businessInfo.tradingAddress
        if (!addr.line1) errors.push('Address line 1 is required')
        if (!addr.city) errors.push('City is required')
        if (!addr.postcode) errors.push('Postcode is required')
        if (addr.postcode && !isValidUKPostcode(addr.postcode)) {
          errors.push('Invalid UK postcode format')
        }
      }
    }

    // Validate trading information
    if (data.tradingInfo) {
      if (!data.tradingInfo.mccCode) errors.push('MCC code is required')
      if (!data.tradingInfo.mccDescription) errors.push('MCC description is required')
      
      if (typeof data.tradingInfo.projectedAnnualTurnover !== 'number' || data.tradingInfo.projectedAnnualTurnover <= 0) {
        errors.push('Projected annual turnover must be a positive number')
      }
      
      if (typeof data.tradingInfo.estimatedAverageTransaction !== 'number' || data.tradingInfo.estimatedAverageTransaction <= 0) {
        errors.push('Estimated average transaction must be a positive number')
      }
    }

    // Validate pricing
    if (data.pricing) {
      // Always enforce PRD min thresholds for card rates
      if (typeof data.pricing.consumerDebit !== 'number' || data.pricing.consumerDebit < 0.25) {
        errors.push('Consumer debit rate must be at least 0.25%')
      }
      if (typeof data.pricing.consumerCredit !== 'number' || data.pricing.consumerCredit < 0.43) {
        errors.push('Consumer credit rate must be at least 0.43%')
      }
      if (typeof data.pricing.commercialCard !== 'number' || data.pricing.commercialCard < 1.6) {
        errors.push('Commercial card rate must be at least 1.6%')
      }
      if (typeof data.pricing.authorisationFee !== 'number' || data.pricing.authorisationFee < 0.01) {
        errors.push('Authorization fee must be at least £0.01')
      }

      // Validate device pricing (new structure)
      if (data.pricing.devicePricing && typeof data.pricing.devicePricing === 'object') {
        const deviceEntries = Object.entries(data.pricing.devicePricing)
        
        // Check if at least one device has quantity > 0 (coerce numeric strings)
        const hasSelectedDevices = deviceEntries.some(([_, device]) => Number(device?.quantity) > 0)
        if (!hasSelectedDevices) {
          errors.push('At least one device must be selected for pricing')
        }
        
        // Default monthly prices for devices (fallback if missing)
        const defaultDevicePrices = {
          'clover-flex': 25.00,
          'clover-mini': 25.00,
          'clover-station-duo': 40.00,
          'clover-kitchen-printer': 252.99,
          'clover-cash-drawer': 40.00
        }

        deviceEntries.forEach(([deviceId, device]) => {
          const prefix = `Device ${deviceId}`

          // Only validate devices with quantity > 0
          const quantityNumber = Number(device?.quantity)
          let monthlyPriceNumber = Number(device?.monthlyPrice)

          if (quantityNumber > 0) {
            if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
              errors.push(`${prefix}: Quantity must be greater than 0`)
            }

            // Fallback to default price only when the field is absent or empty string (not when 0 or some other explicit value)
            const isEmpty = device?.monthlyPrice === undefined || device?.monthlyPrice === null || device?.monthlyPrice === ''
            if ((isEmpty || !Number.isFinite(monthlyPriceNumber)) && device.contractType !== 'purchase') {
              const fallback = defaultDevicePrices[deviceId]
              if (Number.isFinite(fallback) && fallback > 0) {
                monthlyPriceNumber = fallback
              }
            }

            if (!Number.isFinite(monthlyPriceNumber) || monthlyPriceNumber <= 0) {
              errors.push(`${prefix}: Monthly price must be a positive number`)
            }

            if (!device.contractType) {
              errors.push(`${prefix}: Contract type is required`)
            }
          }
        })

        // Validate total monthly cost - only if there are devices with quantity > 0
        const totalMonthlyCostNumber = Number(data.pricing.totalMonthlyCost)
        if (hasSelectedDevices && (!Number.isFinite(totalMonthlyCostNumber) || totalMonthlyCostNumber <= 0)) {
          errors.push('Total monthly cost must be greater than 0')
        }
      }
    }

    // Validate banking
    if (data.banking) {
      if (!data.banking.accountName) errors.push('Account name is required')
      if (!data.banking.sortCode) errors.push('Sort code is required')
      if (!data.banking.accountNumber) errors.push('Account number is required')
      
      if (data.banking.sortCode && !isValidUKSortCode(data.banking.sortCode)) {
        errors.push('Invalid UK sort code format')
      }
      
      if (data.banking.accountNumber && !isValidUKAccountNumber(data.banking.accountNumber)) {
        errors.push('Invalid UK account number format')
      }
    }

    // Validate outlets (optional)
    if (data.outlets && Array.isArray(data.outlets)) {
      data.outlets.forEach((outlet, index) => {
        const prefix = `Outlet ${index + 1}`
        
        // Validate trading address (required if outlet exists)
        if (!outlet.tradingAddress) {
          errors.push(`${prefix}: Trading address is required`)
        } else {
          if (!outlet.tradingAddress.line1) errors.push(`${prefix}: Address line 1 is required`)
          if (!outlet.tradingAddress.city) errors.push(`${prefix}: City is required`)
          if (!outlet.tradingAddress.postcode) errors.push(`${prefix}: Postcode is required`)
          
          if (outlet.tradingAddress.postcode && !isValidUKPostcode(outlet.tradingAddress.postcode)) {
            errors.push(`${prefix}: Invalid UK postcode format`)
          }
        }
        
        // Validate device pricing for outlet (if any devices are selected)
        if (outlet.devicePricing && typeof outlet.devicePricing === 'object') {
          const deviceEntries = Object.entries(outlet.devicePricing)
          const hasSelectedDevices = deviceEntries.some(([_, device]) => Number(device?.quantity) > 0)
          
          if (hasSelectedDevices) {
            deviceEntries.forEach(([deviceId, device]) => {
              const devicePrefix = `${prefix} Device ${deviceId}`
              const quantityNumber = Number(device?.quantity)
              let monthlyPriceNumber = Number(device?.monthlyPrice)
              
              if (quantityNumber > 0) {
                if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
                  errors.push(`${devicePrefix}: Quantity must be greater than 0`)
                }
                
                // Check for valid monthly price
                if (!Number.isFinite(monthlyPriceNumber) || monthlyPriceNumber <= 0) {
                  errors.push(`${devicePrefix}: Monthly price must be a positive number`)
                }
                
                if (!device.contractType) {
                  errors.push(`${devicePrefix}: Contract type is required`)
                }
              }
            })
          }
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }

  } catch (error) {
    console.error('Validation error:', error)
    return {
      valid: false,
      errors: ['Validation failed due to server error']
    }
  }
}

// Helper validation functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidUKPostcode(postcode) {
  if (!postcode) return false
  // More comprehensive UK postcode regex that handles all valid formats
  // Formats: A9 9AA, A99 9AA, AA9 9AA, AA99 9AA, A9A 9AA, AA9A 9AA
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i
  return ukPostcodeRegex.test(postcode.trim())
}

function isValidUKSortCode(sortCode) {
  if (!sortCode) return false
  const cleaned = sortCode.replace(/\D/g, '')
  return cleaned.length === 6 && /^\d{6}$/.test(cleaned)
}

function isValidUKAccountNumber(accountNumber) {
  if (!accountNumber) return false
  return accountNumber.length === 8 && /^\d{8}$/.test(accountNumber)
}

// CommonJS exports
module.exports = {
  validateApplicationData,
  isValidEmail,
  isValidUKPostcode,
  isValidUKSortCode,
  isValidUKAccountNumber
}
