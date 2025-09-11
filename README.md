# Agent Application Submission Form

A multi-step, mobile-first application form for agents with offline capabilities, API validation, and automated submission processing.

## Project Status

### ✅ Completed
- **Supabase Schema**: Database tables and RLS policies created (`supabase/schema.sql`)
- **Frontend Setup**: Vue.js project initialized with all dependencies
- **Project Structure**: Basic folder structure and configuration files created
- **Vercel API Placeholder**: Basic serverless function structure created

### 🔄 In Progress
- Awaiting Supabase project credentials
- Awaiting Vercel project setup and environment variables

## Setup Instructions

### 1. Supabase Setup (ACTION REQUIRED)
1. Create a new project in the [Supabase Dashboard](https://app.supabase.com)
2. Once created, go to the SQL Editor and run the entire contents of `supabase/schema.sql`
3. From Settings > API, copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (safe for frontend)
   - **service_role key** (SECRET - for backend only)

### 2. Local Development Setup
1. Clone this repository
2. Copy `env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Vercel Setup (ACTION REQUIRED)
1. Create a new project on [Vercel](https://vercel.com)
2. Link it to your Git repository
3. Add these environment variables in Vercel project settings:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (SECRET)
   - `COMPANIES_HOUSE_API_KEY` - Your Companies House API key
   - `GETADDRESS_API_KEY` - Your getaddress.io API key

## Next Steps

Once you provide the required credentials, we'll continue with:
1. Implementing the authentication system (Phase 2)
2. Building the multi-step form components (Phase 3)
3. Adding offline support with IndexedDB (Phase 4)
4. Completing the backend submission processing (Phase 5)

## Project Structure

```
├── api/                    # Vercel serverless functions
│   └── submit-application.js
├── src/
│   ├── components/        # Vue components
│   ├── views/            # Page components
│   ├── stores/           # Pinia stores
│   ├── services/         # API services
│   ├── router/           # Vue Router config
│   └── main.js          # App entry point
├── supabase/
│   └── schema.sql       # Database schema
└── package.json         # Dependencies
```

## Technologies Used
- **Frontend**: Vue 3, Vite, Pinia, Vue Router, Tailwind CSS
- **Backend**: Vercel Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Offline Storage**: Dexie.js (IndexedDB wrapper)
- **APIs**: Companies House, getaddress.io
