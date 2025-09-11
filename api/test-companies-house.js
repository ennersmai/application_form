const axios = require('axios')

const COMPANIES_HOUSE_API_BASE = 'https://api.company-information.service.gov.uk'
const API_KEY = process.env.COMPANIES_HOUSE_API_KEY

export default async function handler(req, res) {
  try {
    console.log('Testing Companies House API...')

    if (!API_KEY) {
      return res.status(500).json({
        error: 'Companies House API key not configured',
        hasApiKey: false
      })
    }

    console.log('API key found, length:', API_KEY.length)

    // Test with a well-known company (Virgin Media)
    const testCompanyNumber = '03182297'

    console.log('Testing with company number:', testCompanyNumber)

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

    console.log('Making test request...')

    const response = await companiesHouseApi.get(`/company/${testCompanyNumber}`, {
      timeout: 10000
    })

    console.log('Test successful! Response:', {
      status: response.status,
      companyName: response.data?.company_name,
      companyNumber: response.data?.company_number
    })

    res.status(200).json({
      message: 'Companies House API test successful',
      company: {
        number: response.data.company_number,
        name: response.data.company_name,
        status: response.data.company_status
      }
    })

  } catch (error) {
    console.error('Companies House test error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })

    res.status(500).json({
      message: 'Companies House API test failed',
      error: error.message,
      status: error.response?.status,
      hasApiKey: !!API_KEY
    })
  }
}
