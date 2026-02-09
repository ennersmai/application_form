const GETADDRESS_API_BASE = 'https://api.getaddress.io'
const DOMAIN_TOKEN = 'dtoken_hEDzcyiWMr04G83aOMG06tg7U8V1surOzSScLE8TG22r2EYfOhrRnI1eyhADhPZydlrST5mHKhaz65Ek-zuggxend96czT6RvJ2vyKl4u1B38sYTHPHh3SdQhBbFuQoImNi61tN6m5XR56rkuMJkNKSVHGGAEy0UWwnjS3ZhPpNPE0ukSDsnx1UhFrJRGAULiqcsJWLQf-RfEuYthehMN0745oaySDWP'

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

      // Step 1: Autocomplete to get suggestions
      const autocompleteUrl = `${GETADDRESS_API_BASE}/autocomplete/${encodeURIComponent(query.trim())}?api-key=${DOMAIN_TOKEN}&all=true&top=10`
      const response = await fetch(autocompleteUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.suggestions && data.suggestions.length > 0) {
        // Step 2: Resolve each suggestion to get full address details
        const resolvedAddresses = await Promise.all(
          data.suggestions.map(async (suggestion) => {
            try {
              const getUrl = `${GETADDRESS_API_BASE}/get/${suggestion.id}?api-key=${DOMAIN_TOKEN}`
              const getResponse = await fetch(getUrl)
              if (!getResponse.ok) {
                // Fallback: parse from the suggestion text
                return this._parseSuggestion(suggestion, query)
              }
              const fullAddr = await getResponse.json()
              return {
                id: suggestion.id,
                formatted: suggestion.address,
                line1: fullAddr.line_1 || '',
                line2: fullAddr.line_2 || '',
                city: fullAddr.town_or_city || '',
                county: fullAddr.county || '',
                postcode: fullAddr.postcode || '',
                country: 'United Kingdom'
              }
            } catch {
              return this._parseSuggestion(suggestion, query)
            }
          })
        )

        return {
          success: true,
          data: { addresses: resolvedAddresses }
        }
      } else {
        return {
          success: false,
          error: 'No addresses found for this search'
        }
      }
    } catch (error) {
      console.error('Address lookup error:', error)

      if (error.message?.includes('429')) {
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again.'
        }
      } else {
        return {
          success: false,
          error: error.message || 'Address lookup failed. Please try again or enter manually.'
        }
      }
    }
  },

  /**
   * Fallback parser for when /get endpoint fails
   */
  _parseSuggestion(suggestion, originalQuery) {
    const text = suggestion.address || ''
    const parts = text.split(',').map(p => p.trim()).filter(Boolean)
    const postcodeRegex = /\b[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}\b/i

    let postcode = ''
    for (let i = parts.length - 1; i >= 0; i--) {
      const match = parts[i].match(postcodeRegex)
      if (match) {
        postcode = match[0].trim()
        parts.splice(i, 1)
        break
      }
    }

    return {
      id: suggestion.id,
      formatted: suggestion.address,
      line1: parts[0] || '',
      line2: parts[1] || '',
      city: parts.length >= 3 ? parts[parts.length - 1] : (parts[1] || ''),
      county: parts.length >= 4 ? parts[parts.length - 1] : '',
      postcode: postcode || originalQuery || '',
      country: 'United Kingdom'
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
