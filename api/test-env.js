export default async function handler(req, res) {
  const envVars = {
    COMPANIES_HOUSE_API_KEY: process.env.COMPANIES_HOUSE_API_KEY ? 'SET' : 'NOT SET',
    GETADDRESS_API_KEY: process.env.GETADDRESS_API_KEY ? 'SET' : 'NOT SET',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
    EMAIL_TO: process.env.EMAIL_TO || 'NOT SET',
    SENDER_API_TOKEN: process.env.SENDER_API_TOKEN ? 'SET' : 'NOT SET'
  }

  res.status(200).json({
    message: 'Environment variables check',
    variables: envVars
  })
}
