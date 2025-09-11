import axios from 'axios'

export const companiesHouseService = {
  /**
   * Look up company by company number
   * @param {string} companyNumber - The company number (e.g., "08123456")
   * @returns {Promise<Object>} Company details including directors
   */
  async getCompanyDetails(companyNumber) {
    try {
      const response = await axios.post('/api/companies-house', {
        companyNumber: companyNumber
      })

      return response.data
    } catch (error) {
      console.error('Companies House API error:', error)

      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Company not found. Please check the company number and try again.'
        }
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        }
      } else {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to lookup company. Please try again.'
        }
      }
    }
  },

  /**
   * Validate company number format
   * @param {string} companyNumber 
   * @returns {boolean}
   */
  validateCompanyNumber(companyNumber) {
    if (!companyNumber) return false
    
    // Remove spaces and convert to uppercase
    const clean = companyNumber.replace(/\s+/g, '').toUpperCase()
    
    // UK company numbers are typically 8 characters (can be 2-8 chars, padded with zeros)
    // Format: 2 letters followed by 6 digits, or 8 digits
    const ukPattern = /^([A-Z]{2}\d{6}|\d{8})$/
    
    return ukPattern.test(clean) && clean.length <= 8
  }
}
