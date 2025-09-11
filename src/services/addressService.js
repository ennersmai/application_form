import axios from 'axios'

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

      const response = await axios.post('/api/address-lookup', {
        query: query.trim(),
        top: 10
      })

      if (response.data.success && response.data.data.suggestions) {
        return {
          success: true,
          data: {
            addresses: response.data.data.suggestions.map(suggestion => ({
              id: suggestion.id,
              formatted: suggestion.address,
              line1: suggestion.address.split(',')[0]?.trim() || '',
              city: suggestion.address.split(',')[1]?.trim() || '',
              country: 'United Kingdom'
            }))
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
          error: error.response?.data?.error || 'Address lookup failed. Please try again or enter manually.'
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
