const GETADDRESS_API_BASE = 'https://api.getaddress.io'
const API_KEY = process.env.GETADDRESS_API_KEY

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, top = 10 } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    if (!API_KEY) {
      return res.status(500).json({ error: 'GetAddress API key not configured' })
    }

    // Make request to GetAddress API using native fetch
    // Try autocomplete endpoint first - /autocomplete/{query}?api-key={key}
    const url = new URL(`${GETADDRESS_API_BASE}/autocomplete/${encodeURIComponent(query)}`)
    url.searchParams.append('api-key', API_KEY)
    url.searchParams.append('all', 'true')
    url.searchParams.append('top', top.toString())

    console.log('GetAddress API URL:', url.toString())
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    })

    console.log('GetAddress API Response Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('GetAddress API Error Response:', errorText)
      throw new Error(`GetAddress API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    // GetAddress autocomplete returns an array of suggestions directly
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions.map((suggestion, index) => ({
      id: suggestion.id || `addr_${index}`,
      address: suggestion.address || suggestion.text || suggestion,
      url: suggestion.url || null
    })) : []

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions
      }
    })

  } catch (error) {
    console.error('GetAddress API error:', error)

    if (error.message?.includes('400')) {
      return res.status(200).json({
        success: false,
        error: 'Invalid search query. Please try a different address.'
      })
    } else if (error.message?.includes('401')) {
      return res.status(500).json({
        success: false,
        error: 'GetAddress API key is invalid or missing.'
      })
    } else if (error.message?.includes('429')) {
      return res.status(200).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      })
    } else {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to lookup address. Please try again.'
      })
    }
  }
}
