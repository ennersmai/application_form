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
    const url = new URL(`${GETADDRESS_API_BASE}/find/${encodeURIComponent(query)}`)
    url.searchParams.append('api-key', API_KEY)
    url.searchParams.append('expand', 'true')
    url.searchParams.append('top', top.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`GetAddress API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    const suggestions = data.suggestions?.map(suggestion => ({
      id: suggestion.id,
      address: suggestion.address,
      url: suggestion.url
    })) || []

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
