import { createClient } from '@supabase/supabase-js'
import { generateApplicationPDF } from './utils/pdfService.js'
import { sendSubmissionEmail } from './utils/emailService.js'
import { validateApplicationData } from './utils/validation.js'

// This is a Vercel serverless function
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Step 1: Extract and validate JWT from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1]
    
    // Step 2: Create Supabase admin client for JWT validation
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Step 3: Validate JWT and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Step 4: Create user-scoped Supabase client (respects RLS)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Step 5: Extract and validate request data
    const { applicationData, applicationId } = req.body
    if (!applicationData || !applicationId) {
      return res.status(400).json({ error: 'Missing application data or ID' })
    }

    console.log(`Processing submission for user ${user.id}, application ${applicationId}`)

    // Step 6: Validate application data
    const validation = validateApplicationData(applicationData)
    console.log('Validation result:', validation)
    console.log('Application data structure:', JSON.stringify(applicationData, null, 2))
    if (!validation.valid) {
      console.error('Validation failed with errors:', validation.errors)
      return res.status(400).json({ 
        error: 'Invalid application data', 
        details: validation.errors 
      })
    }

    // Step 7: Insert submission to database
    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert({
        application_id: applicationId,
        agent_id: user.id,
        status: 'pending',
        form_data: applicationData
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return res.status(500).json({ error: 'Failed to save submission to database' })
    }

    console.log('Submission saved to database:', submission.id)

    // Step 8: Generate PDF
    let pdfBuffer
    try {
      pdfBuffer = await generateApplicationPDF(applicationData)
      console.log('PDF generated successfully')
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
      // Continue without PDF - don't fail the entire submission
      pdfBuffer = null
    }

    // Step 9: Send email with PDF attachment
    try {
      await sendSubmissionEmail(applicationData, pdfBuffer, user)
      console.log('Email sent successfully')
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Log error but don't fail submission - the data is already saved
    }

    // Step 10: Update submission status to processed
    await supabase
      .from('submissions')
      .update({ status: 'processed' })
      .eq('id', submission.id)

    // Step 11: Return success response
    res.status(201).json({
      success: true,
      applicationId,
      submissionId: submission.id,
      message: 'Application submitted successfully'
    })

  } catch (error) {
    console.error('Submission error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
