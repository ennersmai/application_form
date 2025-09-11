const COMPANIES_HOUSE_API_BASE = 'https://api.company-information.service.gov.uk'
const API_KEY = process.env.COMPANIES_HOUSE_API_KEY

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { companyNumber, searchQuery, searchByName } = req.body

    console.log('Companies House API called with:', { companyNumber, searchQuery, searchByName, hasApiKey: !!API_KEY })

    // If searching by name
    if (searchByName && searchQuery) {
      return searchCompaniesByName(searchQuery, res)
    }

    // Otherwise, get company details by number
    if (!companyNumber) {
      return res.status(400).json({ error: 'Company number is required' })
    }

    if (!API_KEY) {
      console.error('Companies House API key not found in environment')
      return res.status(500).json({ error: 'Companies House API key not configured' })
    }

    // Remove any spaces and convert to uppercase
    const cleanCompanyNumber = companyNumber.replace(/\s+/g, '').toUpperCase()

    console.log('Making request to Companies House API for company:', cleanCompanyNumber)

    // Use native fetch instead of axios
    const authString = Buffer.from(`${API_KEY}:`).toString('base64')
    
    // Get basic company information
    const companyResponse = await fetch(`${COMPANIES_HOUSE_API_BASE}/company/${cleanCompanyNumber}`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json'
      }
    })

    if (!companyResponse.ok) {
      const errorData = await companyResponse.json().catch(() => ({}))
      throw new Error(`Companies House API error: ${companyResponse.status} ${companyResponse.statusText}`)
    }

    const company = await companyResponse.json()
    console.log('Company data retrieved:', { companyNumber: company.company_number, companyName: company.company_name })

    // Get officers (directors) information
    const officersResponse = await fetch(`${COMPANIES_HOUSE_API_BASE}/company/${cleanCompanyNumber}/officers`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json'
      }
    })

    if (!officersResponse.ok) {
      const errorData = await officersResponse.json().catch(() => ({}))
      throw new Error(`Officers API error: ${officersResponse.status} ${officersResponse.statusText}`)
    }

    const officers = await officersResponse.json()
    console.log('Officers data retrieved:', { officerCount: officers.items?.length || 0 })

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
    console.error('Companies House API error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack
    })

      if (error.message?.includes('404')) {
      return res.status(200).json({
        success: false,
        error: 'Company not found. Please check the company number and try again.'
      })
    } else if (error.message?.includes('401')) {
      return res.status(500).json({
        success: false,
        error: 'Companies House API key is invalid or missing.'
      })
    } else if (error.message?.includes('429')) {
      return res.status(200).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      })
    } else {
      return res.status(500).json({
        success: false,
        error: `Failed to lookup company: ${error.message}`
      })
    }
  }
}

async function searchCompaniesByName(searchQuery, res) {
  try {
    if (!API_KEY) {
      console.error('Companies House API key not found in environment')
      return res.status(500).json({ error: 'Companies House API key not configured' })
    }

    // Clean and encode the search query
    const cleanQuery = searchQuery.trim()
    const encodedQuery = encodeURIComponent(cleanQuery)

    console.log('Searching companies by name:', cleanQuery)

    // Use native fetch for the search API
    const authString = Buffer.from(`${API_KEY}:`).toString('base64')
    
    const searchResponse = await fetch(`${COMPANIES_HOUSE_API_BASE}/search/companies?q=${encodedQuery}&items_per_page=20`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json'
      }
    })

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({}))
      throw new Error(`Companies House search error: ${searchResponse.status} ${searchResponse.statusText}`)
    }

    const searchResults = await searchResponse.json()
    console.log('Search results retrieved:', { totalResults: searchResults.total_results, itemCount: searchResults.items?.length || 0 })

    // Format the results
    const companies = searchResults.items?.map(company => ({
      company_number: company.company_number,
      company_name: company.title,
      company_status: company.company_status,
      company_type: company.company_type,
      date_of_creation: company.date_of_creation,
      address_snippet: company.address_snippet,
      matches: company.matches
    })) || []

    res.status(200).json({
      success: true,
      data: {
        total_results: searchResults.total_results,
        companies: companies
      }
    })

  } catch (error) {
    console.error('Companies House search error:', {
      message: error.message,
      stack: error.stack
    })

    if (error.message?.includes('401')) {
      return res.status(500).json({
        success: false,
        error: 'Companies House API key is invalid or missing.'
      })
    } else if (error.message?.includes('429')) {
      return res.status(200).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      })
    } else {
      return res.status(500).json({
        success: false,
        error: `Failed to search companies: ${error.message}`
      })
    }
  }
}
