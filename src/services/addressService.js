export const addressService = {
  /**
   * Look up addresses by search query
   * @param {string} query - Search query (postcode, street name, etc.)
   * @returns {Promise<Object>} Address lookup results
   */
  async getAddresses(query) {
    try {
      if (!query || query.trim().length < 3) {
        return {
          success: false,
          error: 'Please enter at least 3 characters to search'
        }
      }

      const response = await fetch('/api/address-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          top: 10
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data.suggestions) {
        return {
          success: true,
          data: {
            addresses: data.data.suggestions.map(suggestion => {
              const address = suggestion.address || suggestion.text || suggestion
              const parts = address.split(',').map(part => part.trim())
              
              // Extract postcode (UK format: SW1A 1AA pattern)
              const postcodeRegex = /\b[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}\b/i
              let postcode = ''
              let addressParts = [...parts]
              
              // Find postcode anywhere in the address
              for (let i = parts.length - 1; i >= 0; i--) {
                const match = parts[i].match(postcodeRegex)
                if (match) {
                  postcode = match[0].trim()
                  // Remove the part containing postcode
                  addressParts.splice(i, 1)
                  break
                }
              }
              
              // Remove business names and clean up address parts
              const cleanedParts = addressParts.filter(part => {
                // Skip empty parts
                if (!part) return false
                // Skip parts that look like business names (containing "Ltd", "Limited", etc.)
                if (/\b(ltd|limited|plc|llc|inc|corp|company)\b/i.test(part)) return false
                // Skip obvious business names at start
                if (part.includes(' Ltd,') || part.includes(' Limited,')) return false
                return true
              })
              
              // Structure the clean address parts
              let line1 = ''
              let line2 = ''
              let city = ''
              let county = ''
              
              if (cleanedParts.length >= 1) {
                line1 = cleanedParts[0]
              }
              if (cleanedParts.length >= 2) {
                line2 = cleanedParts[1]
              }
              if (cleanedParts.length >= 3) {
                city = cleanedParts[cleanedParts.length - 2] || cleanedParts[cleanedParts.length - 1]
                county = cleanedParts[cleanedParts.length - 1]
              } else if (cleanedParts.length >= 2) {
                city = cleanedParts[cleanedParts.length - 1]
              }
              
              // If no postcode found, use the original search query
              if (!postcode && parts.length > 0) {
                const lastPart = parts[parts.length - 1]
                const match = lastPart.match(postcodeRegex)
                if (match) postcode = match[0].trim()
              }
              
              return {
                id: suggestion.id,
                formatted: address,
                line1: line1,
                line2: line2,
                city: city,
                county: county,
                postcode: postcode,
                country: 'United Kingdom'
              }
            })
          }
        }
      } else {
        return {
          success: false,
          error: 'No addresses found for this search'
        }
      }
    } catch (error) {
      console.error('Address lookup error:', error)

      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Address not found. Please check and try again.'
        }
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        }
      } else {
        return {
          success: false,
          error: error.message || 'Address lookup failed. Please try again or enter manually.'
        }
      }
    }
  },

  /**
   * Validate UK postcode format
   * @param {string} postcode 
   * @returns {boolean}
   */
  validatePostcode(postcode) {
    if (!postcode) return false
    
    // UK postcode regex - covers all valid formats
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i
    return ukPostcodeRegex.test(postcode)
  },

  /**
   * Format postcode with proper spacing
   * @param {string} postcode 
   * @returns {string}
   */
  formatPostcode(postcode) {
    if (!postcode) return ''
    
    const clean = postcode.replace(/\s+/g, '').toUpperCase()
    
    // Add space before last 3 characters for proper UK postcode format
    if (clean.length >= 5) {
      return clean.slice(0, -3) + ' ' + clean.slice(-3)
    }
    
    return clean
  },

  /**
   * Format address for display
   * @param {Object} addr 
   * @returns {string}
   */
  formatAddress(addr) {
    const parts = [
      addr.line_1,
      addr.line_2,
      addr.line_3,
      addr.locality,
      addr.town_or_city,
      addr.county
    ].filter(part => part && part.trim())
    
    return parts.join(', ')
  }
}
