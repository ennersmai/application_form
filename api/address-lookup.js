const GETADDRESS_API_BASE = 'https://api.getaddress.io'
const API_KEY = process.env.GETADDRESS_API_KEY

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, postcode, top = 10 } = req.body
    const searchQuery = query || postcode

    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query or postcode is required' })
    }

    if (!API_KEY) {
      return res.status(500).json({ error: 'GetAddress API key not configured' })
    }

    // Make request to GetAddress API using native fetch
    // Try autocomplete endpoint first - /autocomplete/{query}?api-key={key}
    const url = new URL(`${GETADDRESS_API_BASE}/autocomplete/${encodeURIComponent(searchQuery)}`)
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
    const addresses = Array.isArray(data.suggestions) ? data.suggestions.map((suggestion, index) => {
      const formattedAddress = suggestion.address || suggestion.text || suggestion
      const parts = formattedAddress.split(',').map(part => part.trim())

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
        id: suggestion.id || `addr_${index}`,
        formatted_address: formattedAddress,
        line1: line1,
        line2: line2,
        city: city,
        county: county,
        postcode: postcode,
        country: 'United Kingdom',
        url: suggestion.url || null
      }
    }) : []

    res.status(200).json({
      success: true,
      addresses: addresses
    })

  } catch (error) {
    console.error('GetAddress API error:', error)

    if (error.message?.includes('400')) {
      return res.status(200).json({
        success: false,
        error: 'Invalid search query. Please try a different address.',
        addresses: []
      })
    } else if (error.message?.includes('401')) {
      return res.status(500).json({
        success: false,
        error: 'GetAddress API key is invalid or missing.',
        addresses: []
      })
    } else if (error.message?.includes('429')) {
      return res.status(200).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        addresses: []
      })
    } else {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to lookup address. Please try again.',
        addresses: []
      })
    }
  }
}
