import axios from 'axios'

const COMPANIES_HOUSE_API_BASE = 'https://api.company-information.service.gov.uk'
const API_KEY = import.meta.env.VITE_COMPANIES_HOUSE_API_KEY

// Create axios instance with auth
const companiesHouseApi = axios.create({
  baseURL: COMPANIES_HOUSE_API_BASE,
  auth: {
    username: API_KEY,
    password: ''
  },
  headers: {
    'Accept': 'application/json'
  }
})

export const companiesHouseService = {
  /**
   * Look up company by company number
   * @param {string} companyNumber - The company number (e.g., "08123456")
   * @returns {Promise<Object>} Company details including directors
   */
  async getCompanyDetails(companyNumber) {
    try {
      // Remove any spaces and convert to uppercase
      const cleanCompanyNumber = companyNumber.replace(/\s+/g, '').toUpperCase()
      
      // Get basic company information
      const companyResponse = await companiesHouseApi.get(`/company/${cleanCompanyNumber}`)
      const company = companyResponse.data

      // Get officers (directors) information
      const officersResponse = await companiesHouseApi.get(`/company/${cleanCompanyNumber}/officers`)
      const officers = officersResponse.data

      return {
        success: true,
        data: {
          company_number: company.company_number,
          company_name: company.company_name,
          company_status: company.company_status,
          incorporation_date: company.date_of_creation,
          company_type: company.type,
          registered_office_address: company.registered_office_address,
          officers: officers.items?.map(officer => ({
            name: officer.name,
            officer_role: officer.officer_role,
            appointed_on: officer.appointed_on,
            date_of_birth: officer.date_of_birth ? {
              month: officer.date_of_birth.month,
              year: officer.date_of_birth.year
            } : null
          })) || []
        }
      }
    } catch (error) {
      console.error('Companies House API error:', error)
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Company not found. Please check the company number and try again.'
        }
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Companies House API key is invalid or missing.'
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
