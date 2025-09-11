import axios from 'axios'

const COMPANIES_HOUSE_API_BASE = 'https://api.company-information.service.gov.uk'
const API_KEY = process.env.COMPANIES_HOUSE_API_KEY

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { companyNumber } = req.body

    if (!companyNumber) {
      return res.status(400).json({ error: 'Company number is required' })
    }

    if (!API_KEY) {
      return res.status(500).json({ error: 'Companies House API key not configured' })
    }

    // Remove any spaces and convert to uppercase
    const cleanCompanyNumber = companyNumber.replace(/\s+/g, '').toUpperCase()

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

    // Get basic company information
    const companyResponse = await companiesHouseApi.get(`/company/${cleanCompanyNumber}`)
    const company = companyResponse.data

    // Get officers (directors) information
    const officersResponse = await companiesHouseApi.get(`/company/${cleanCompanyNumber}/officers`)
    const officers = officersResponse.data

    const result = {
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

    res.status(200).json(result)

  } catch (error) {
    console.error('Companies House API error:', error)

    if (error.response?.status === 404) {
      return res.status(200).json({
        success: false,
        error: 'Company not found. Please check the company number and try again.'
      })
    } else if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'Companies House API key is invalid or missing.'
      })
    } else if (error.response?.status === 429) {
      return res.status(200).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      })
    } else {
      return res.status(500).json({
        success: false,
        error: error.response?.data?.error || 'Failed to lookup company. Please try again.'
      })
    }
  }
}
