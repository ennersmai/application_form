import axios from 'axios'

const GETADDRESS_API_BASE = 'https://api.getaddress.io'
const API_KEY = import.meta.env.VITE_GETADDRESS_API_KEY

export const addressService = {
  /**
   * Look up addresses by postcode
   * @param {string} postcode - UK postcode (e.g., "SW1A 1AA")
   * @returns {Promise<Object>} Address lookup results
   */
  async getAddresses(postcode) {
    try {
      // Clean and validate postcode
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase()
      
      if (!this.validatePostcode(cleanPostcode)) {
        return {
          success: false,
          error: 'Please enter a valid UK postcode'
        }
      }

      // Format postcode for API (add space if needed)
      const formattedPostcode = this.formatPostcode(cleanPostcode)
      
      const response = await axios.get(`${GETADDRESS_API_BASE}/find/${encodeURIComponent(formattedPostcode)}`, {
        params: {
          'api-key': API_KEY,
          expand: true
        }
      })

      if (response.data && response.data.addresses) {
        return {
          success: true,
          data: {
            postcode: formattedPostcode,
            addresses: response.data.addresses.map(addr => ({
              line1: addr.line_1 || '',
              line2: addr.line_2 || '',
              line3: addr.line_3 || '',
              locality: addr.locality || '',
              city: addr.town_or_city || '',
              county: addr.county || '',
              country: 'United Kingdom',
              formatted: this.formatAddress(addr)
            }))
          }
        }
      } else {
        return {
          success: false,
          error: 'No addresses found for this postcode'
        }
      }
    } catch (error) {
      console.error('Address lookup error:', error)
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Postcode not found. Please check and try again.'
        }
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Address lookup service is unavailable.'
        }
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        }
      } else {
        return {
          success: false,
          error: 'Address lookup failed. Please try again or enter manually.'
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
