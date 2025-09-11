
---

# Kanban Development Task List (Revised & Granular)

This task list is designed for an interactive AI-assisted development session. Pay close attention to the **ACTION REQUIRED** blocks.

## 🚧 Phase 1: Project Foundation & Backend Setup (Backlog)

### Task 1.1: Supabase Project Initialization & Schema
-   **Description:** Configure the database and authentication.
    -   [x] **1.1.1:** Create the new project in the Supabase dashboard.
    -   [x] **1.1.2:** **[Schema]** In the SQL Editor, create the `profiles` table to mirror user auth data (`id` (UUID, FK to `auth.users`), `full_name`, `email`).
    -   [x] **1.1.3:** **[Schema]** Create the `submissions` table (`id`, `application_id` (TEXT, unique), `agent_id` (UUID, FK to `profiles`), `status` (TEXT, default 'pending'), `form_data` (JSONB), `last_sync_error` (TEXT, nullable), `created_at`).
    -   [x] **1.1.4:** **[Security]** Create an RLS policy on `profiles` allowing users to only view/edit their own profile.
    -   [x] **1.1.5:** **[Security]** Create RLS policies on `submissions` allowing agents to `INSERT` any, but only `SELECT` and `UPDATE` their own submissions.

> **ACTION REQUIRED (Mai):**
> 1.  Complete steps 1.1.1 - 1.1.5.
> 2.  From the Supabase dashboard, provide the **Project URL** and the **`anon` public key**. These are needed for the frontend client.
> 3.  Also provide the **`service_role` key**. This is a secret key that will be used *only* by our secure backend function on Vercel.
> 4.  Confirm when you have completed this and stored the keys safely.

### Task 1.2: Frontend Project Setup
-   **Description:** Initialize the Vue.js application.
    -   [x] **1.2.1:** Initialize a Vue.js project with Vite.
    -   [x] **1.2.2:** Install dependencies: `pinia`, `@supabase/supabase-js`, `tailwindcss` (or other UI lib), `dexie` (for IndexedDB).
    -   [x] **1.2.3:** Create the initial folder structure: `/views`, `/components`, `/services`, `/stores`, `/router`.
    -   [x] **1.2.4:** Configure `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Task 1.3: Vercel Project & Backend Placeholder
-   **Description:** Set up the hosting and serverless environment.
    -   [to do later when local dev is finished] **1.3.1:** Create a new project on Vercel linked to your Git repository.
    -   [x] **1.3.2:** Create an `/api` directory and a placeholder function `/api/submit-application.js`.
    -   [ ] **1.3.3:** **[Security]** Add the Supabase `service_role` key, Companies House API Key, and getaddress.io API Key as secret environment variables in the Vercel project settings.

> **ACTION REQUIRED (Mai):**
> 1.  Confirm that the Vercel project is created and that all three secret keys (Supabase Service Role, Companies House, getaddress.io) have been added as environment variables.
> 2.  The AI will wait for your confirmation before proceeding to backend-dependent tasks.

---

## ✅ Phase 2: Authentication & Core UI (Completed)

### Task 2.1: Implement User Authentication
-   **Description:** Build the complete login/logout flow.
    -   [x] **2.1.1:** **[UI]** Create `Login.vue` with form fields, a submit button, and areas for loading and error states.
    -   [x] **2.1.2:** **[State]** Create `authStore.js` (Pinia) to hold `user`, `session`, and `loading` state.
    -   [x] **2.1.3:** **[Logic]** Create `authService.js` with `login(email, pass)`, `signUp()` and `logout()` functions that call the Supabase client.
    -   [x] **2.1.4:** **[Logic]** Connect the `Login.vue` component to the store and service, properly handling loading and error states.
    -   [x] **2.1.5:** **[Routing]** Implement a navigation guard in `router.js` to protect routes.

### Task 2.2: Build the Main Form Shell & State Management
-   **Description:** Create the form's container and its central data store.
    -   [x] **2.2.1:** **[UI]** Create `ApplicationForm.vue` with a stepper UI (e.g., "Step 1 of 8") and navigation buttons.
    -   [x] **2.2.2:** **[State]** Create `formStore.js` (Pinia). Define a comprehensive state object for the entire form's data.
    -   [x] **2.2.3:** **[State]** Create a `uiStore.js` (Pinia) to manage UI state like `currentStep`, `isSubmitting`, `globalError`.
    -   [x] **2.2.4:** **[Routing]** Implement the logic for the "Next" and "Back" buttons to update the `currentStep` in the `uiStore` and render the correct step component.

---

## 🔄 Phase 3: Form Step Component Development (In Progress)

*(This phase is highly parallelizable. Each task represents building one step.)*

### Task 3.1: Step 0 - Business Type ✅
-   [x] **3.1.1:** **[UI]** Create `Step0_BusinessType.vue` with the initial question and conditional fields.
-   [x] **3.1.2:** **[State]** Wire up the component's inputs to the `formStore`.
-   [x] **3.1.3:** **[API]** Create a `companiesHouseService.js` to handle the API call.
-   [x] **3.1.4:** **[Logic]** Implement the `onClick` handler to call the service and display the director list.
-   [x] **3.1.5:** **[UI Feedback]** Add a loading spinner while the API is fetching.

### Task 3.1.1: Step 1 - Agent Information ✅
-   [x] **3.1.1.1:** **[UI]** Create `Step1_AgentInfo.vue` with auto-populated agent details.
-   [x] **3.1.1.2:** **[State]** Wire up urgent processing toggle to `formStore`.
-   [x] **3.1.1.3:** **[UI Feedback]** Show urgent fee notification when enabled.

### Task 3.2: Step 2 - Principals ✅
-   [x] **3.2.1:** **[UI]** Create `Step2_PrincipalInfo.vue`. Build the form fields for a *single* principal.
-   [x] **3.2.2:** **[State]** The component should render a list of principals based on an array in the `formStore`.
-   [x] **3.2.3:** **[Logic]** Implement the "Add Principal" button, which pushes a new empty principal object to the array in the `formStore`.
-   [x] **3.2.4:** **[Logic]** Implement a "Remove" button for each principal (except the first).
-   [x] **3.2.5:** **[Validation]** Email validation, ownership percentage validation, and beneficial owner detection.
-   [x] **3.2.6:** **[Mobile UX]** Enhanced mobile-friendly buttons with custom increment/decrement controls for ownership percentage.

### Task 3.3: Step 3 - Business Info ✅
-   [x] **3.3.1:** **[UI]** Create `Step3_BusinessInfo.vue`.
-   [x] **3.3.2:** **[API]** Create a `addressService.js` and implement the `getAddress(postcode)` function using the getaddress.io API.
-   [x] **3.3.3:** **[Logic]** Implement the complex conditional logic from the PRD (e.g., auto-populating Legal Name based on Business Type). This logic should be in the component's script section, watching for changes in the `formStore`.
-   [x] **3.3.4:** **[UI Feedback]** Add loading/error states for the postcode lookup.
-   [x] **3.3.5:** **[Mobile UX]** Mobile-friendly address lookup with manual entry fallback and VAT registration toggle.

> **ACTION REQUIRED (Mai):**
> 1.  Provide the complete `mccCodes` list and their industry group mappings in a JSON format.
> 2.  The AI will use this exact data structure to guide the creation of the MCC selector component.

### Task 3.4: Step 4 - Trading Information ✅
-   [x] **3.4.1:** **[UI]** Build `Step4_TradingInfo.vue` with the filterable MCC selector.
-   [x] **3.4.2:** **[Data]** Integrate complete MCC codes list with intelligent categorization.
-   [x] **3.4.3:** **[Logic]** Implement searchable dropdown with industry group filtering.
-   [x] **3.4.4:** **[Validation]** Financial projections with transaction volume calculations.
-   [x] **3.4.5:** **[Features]** American Express toggle and smart MCC code search.

### Task 3.5: Step 5 - Pricing ✅
-   [x] **3.5.1:** **[UI]** Build `Step5_Pricing.vue` with client-side validation for minimums.
-   [x] **3.5.2:** **[Validation]** Enforce exact minimum rates (Consumer Debit 0.25%, Consumer Credit 0.43%, Commercial Card 1.6%, Auth Fee £0.01).
-   [x] **3.5.3:** **[Mobile UX]** Large increment/decrement buttons with no default browser arrows.
-   [x] **3.5.4:** **[Features]** Reset to defaults and competitive rates buttons.

### Task 3.6: Step 6 - Equipment ✅
-   [x] **3.6.1:** **[UI]** Build `Step6_Equipment.vue` with quantity inputs and cost calculation.
-   [x] **3.6.2:** **[Data]** Extract equipment data from Clover product images with pricing options.
-   [x] **3.6.3:** **[Logic]** Equipment selection with rental/purchase options and quantity controls.
-   [x] **3.6.4:** **[Features]** MOTO and Cashback add-on services, equipment summary with total costs.

### Task 3.7: Step 7 - Banking ✅
-   [x] **3.7.1:** **[UI]** Build `Step7_Banking.vue` with format validation and the locked Account Name field.
-   [x] **3.7.2:** **[Validation]** Smart format validation for UK sort codes (6 digits) and account numbers (8 digits).
-   [x] **3.7.3:** **[Features]** Auto-formatting sort codes and locked account name from legal business name.
-   [x] **3.7.4:** **[Mobile UX]** Large touch-friendly inputs with real-time validation feedback.

### Task 3.8: Step 8 - Review ✅
-   [x] **3.8.1:** **[UI]** Create `Step8_Review.vue` to display all data from `formStore` in a read-only view.
-   [x] **3.8.2:** **[Logic]** Implement the "Edit" buttons, which call a function in the `uiStore` to set the `currentStep` to the corresponding section.
-   [x] **3.8.3:** **[Features]** Comprehensive review with confirmation checkbox, application ID, and total cost summary.
-   [x] **3.8.4:** **[Mobile UX]** 360px mobile optimization fixes for all increment/decrement buttons across all steps.

---

## ✅ Phase 4: Offline & Synchronization Logic (Completed)

### Task 4.1: Local Persistence Service ✅
-   [x] **4.1.1:** **[Service]** Create `offlineService.js`.
-   [x] **4.1.2:** **[Logic]** Implement `saveDraft(submissionData)` using Dexie.js to upsert into an 'applications' table.
-   [x] **4.1.3:** **[Logic]** Implement `getDrafts()`, `getQueued()`, and `getFailed()` functions.
-   [x] **4.1.4:** **[State]** Watch the `formStore` for changes and automatically call `saveDraft` (debounced for performance).

### Task 4.2: Sync Manager Service ✅
-   [x] **4.2.1:** **[Service]** Create `syncService.js`.
-   [x] **4.2.2:** **[Logic]** Implement `processQueue()`. This function will get all 'queued' items from `offlineService` and POST them one-by-one to the Vercel API.
-   [x] **4.2.3:** **[Error Handling]** On a successful API response, delete the local draft. On failure, update the local draft's status to 'failed' and save the error message.
-   [x] **4.2.4:** **[Triggers]** Implement triggers to call `processQueue()`: on application load, when the browser's online status changes, and via a manual "Retry All" button.

### Task 4.3: Sync Management UI ✅
-   [x] **4.3.1:** **[UI]** Create a dedicated `OfflineQueue.vue` view.
-   [x] **4.3.2:** **[UI]** Display separate lists for "Queued" and "Failed" submissions.
-   [x] **4.3.3:** **[UI Feedback]** Show error messages next to failed items and provide a "Retry" button for individual submissions.
-   [x] **4.3.4:** **[Features]** Statistics dashboard, network status indicator, auto-sync, and draft resumption.

---

## ✅ Phase 5: Backend Orchestrator Logic (Completed)

### Task 5.1: Secure the Submission Endpoint ✅
-   [x] **5.1.1:** **[Security]** In `/api/submit-application.js`, the first step must be to get the user's JWT from the `Authorization` header.
-   [x] **5.1.2:** **[Security]** Use the Supabase Admin client to validate the JWT and retrieve the user. If invalid, return a 401 Unauthorized error immediately.
-   [x] **5.1.3:** **[Security]** Initialize a new Supabase client *scoped to that user's permissions*. This ensures all subsequent database operations respect RLS. **This is the critical step.**

### Task 5.2: Process the Submission ✅
-   [x] **5.2.1:** **[Validation]** Implement robust server-side validation of the incoming `form_data` JSON using comprehensive validation rules.
-   [x] **5.2.2:** **[Database]** Insert the validated data into the `submissions` table using the user-scoped Supabase client.
-   [x] **5.2.3:** **[PDF]** Create a `pdfService.js` utility. Write a function that accepts the form data and returns a PDF buffer using `pdfkit`.
-   [x] **5.2.4:** **[Email]** Create an `emailService.js` utility using Nodemailer. Write a function to send an email with the PDF buffer as an attachment.
-   [x] **5.2.5:** **[Database]** After the email is successfully sent, `UPDATE` the submission's status in the database from 'pending' to 'processed'.
-   [x] **5.2.6:** **[Response]** Return a 201 Created response with the `application_id` on success, or a detailed 500/400 error on failure.

### Task 5.3: UI/UX Enhancements ✅
-   [x] **5.3.1:** **[Component]** Create reusable `ConfirmationModal.vue` with mobile-friendly design and multiple types (danger, warning, info).
-   [x] **5.3.2:** **[Integration]** Replace browser alerts with custom modals for save and delete confirmations.
-   [x] **5.3.3:** **[Mobile UX]** Fix 360px mobile layout issues with increment/decrement buttons across all form steps.
-   [x] **5.3.4:** **[Validation]** Implement immediate red border feedback for invalid fields (email format, required fields).

> **ACTION REQUIRED (Mai):**
> 1.  Provide the final SMTP credentials (host, port, user, pass) and the destination email addresses (To, CC).
> 2.  These must be stored as secrets in Vercel. The AI will wait for your confirmation to proceed with the email service logic.

---

## ✅ Phase 6: Testing & Deployment (Done)
*Tasks in this phase are for final verification.*
-   [ ] **Task 6.1:** Test the complete online submission flow.
-   [ ] **Task 6.2:** Test the complete offline-to-online sync flow.
-   [ ] **Task 6.3:** Test sync failure by submitting invalid data and verifying it appears in the "Sync Failed" UI with a clear error.
-   [ ] **Task 6.4:** Deploy to production.