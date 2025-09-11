import axios from 'axios'

export default async function handler(req, res) {
  try {
    console.log('Testing HTTP request...')

    // Test a simple GET request to a public API
    const testResponse = await axios.get('https://httpbin.org/get', {
      timeout: 5000
    })

    console.log('HTTP test successful:', testResponse.status)

    // Test Companies House API structure (without auth)
    const chResponse = await axios.get('https://api.company-information.service.gov.uk/company/08123456', {
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500; // Accept any status < 500
      }
    })

    console.log('Companies House test response:', {
      status: chResponse.status,
      statusText: chResponse.statusText
    })

    res.status(200).json({
      message: 'HTTP tests completed',
      httpBin: { status: testResponse.status },
      companiesHouse: {
        status: chResponse.status,
        statusText: chResponse.statusText
      }
    })

  } catch (error) {
    console.error('HTTP test error:', error.message)

    res.status(500).json({
      message: 'HTTP test failed',
      error: error.message,
      stack: error.stack
    })
  }
}
