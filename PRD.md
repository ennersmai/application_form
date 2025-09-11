---

# Product Requirements Document (PRD): Agent Application Submission Form

**Version:** 2.4 (Definitive)
**Date:** 10/26/2023
**Author:** Mai 
**Stakeholder:** James

---

## 1. Overview & Introduction
This document defines the requirements for a **multi-step, mobile-first Agent Application Submission Form**. Built with a Vue.js frontend, a Vercel-hosted Node.js orchestrator, and a Supabase backend, this application streamlines the merchant application process while minimizing data errors, ensuring offline reliability, and automating submission processing.

---

## 2. Goals
- Reduce inaccurate submissions from agents.
- Enable offline use with a clear and robust data sync mechanism.
- Automate the generation and email delivery of a submission summary PDF.
- Deliver a fool-proof, mobile-first UX for field agents.
- Create a scalable architecture by separating concerns between the frontend, backend services, and database.

---

## 3. Technology Stack & Architecture
- **Frontend:** Vue.js (with Pinia for state management).
- **Hosting & Orchestration:** Vercel will host the Vue.js application and the primary Node.js serverless function.
- **Backend-as-a-Service (BaaS):** Supabase will provide:
    - **Authentication:** For managing agent logins.
    - **Database (PostgreSQL):** For storing all submission and user data.
- **Orchestrator (Node.js on Vercel):** A serverless function that acts as the primary API endpoint for submissions. It handles business logic, validation, PDF generation, and email dispatch.
- **External APIs:**
    - **Companies House API:** For LTD company validation.
    - **getaddress.io API:** For postcode and address lookup.

---

## 4. Functional Requirements

### Global Features
- **Authentication:** Agents log in via Supabase Auth. User sessions are managed securely.
- **Offline-First Workflow:** The application persists form data to local storage (IndexedDB), allowing agents to create and edit applications entirely offline. A dedicated UI section will show locally saved submissions, categorized as "Drafts," "Queued for Sync," and "Sync Failed."
- **Submission & Syncing Logic:**
    - When an agent submits a form, it is moved to a local "Queued for Sync" state.
    - If online, the sync process calls the **Node.js orchestrator API on Vercel**.
    - If the sync fails (e.g., API error, server validation failure), the submission is moved to a "Sync Failed" state with a clear error message, allowing the agent to edit and retry.
- **Submission Processing (Vercel Function):**
    - The Node.js orchestrator receives the submission data.
    - It performs final server-side validation.
    - It writes the data to the Supabase `submissions` table (using a JSONB column for form data).
    - It generates a simple, structured PDF summary.
    - It dispatches an email using an SMTP service to the back-office, with the PDF attached.

### Step-by-Step Form Breakdown

#### Step 0: Business Type Identification (First Question)
- **Question:** *“Is this a Sole Trader or a Limited Company?”*
- **Purpose:** Ensure correct business classification and director verification happen before any other data entry.
- **Business Rules:**
    - The form will default to 'Sole Trader'. The agent is responsible for verifying the business type from bank proof.
    - If a Limited Company is selected, the agent must:
        1. Enter the company number.
        2. Trigger a lookup via the **Companies House API**.
        3. The API will pull the official director list.
        4. The agent must visually confirm that the directors listed match the principals being signed up.

#### Step 1: Agent Information
- **Agent Name:** Read-only, auto-populated from the logged-in Supabase user's profile.
- **Agent Email Address:** Read-only, auto-populated from the logged-in Supabase user's profile.
- **Is this application urgent?** (Yes/No toggle) → If Yes, a £20 urgent processing fee is added to the summary.

#### Step 2: Principal Information
- **Fields:** First Name, Last Name, Owner Email (validated), Phone Number (validated).
- **Position:** Dropdown menu (e.g., Sole Trader, Director, Ultimate Owner).
- **Ownership %:** Numerical input with validation (e.g., must be between 0 and 100).
- **Add Principals:** A button allows the agent to add more principals. The application will enforce rules around beneficial owners (e.g., flagging anyone with >25% share).

#### Step 3: Business Information
- **Business Type:** Dropdown (Sole Trader, LTD, Partnership).
- **Business Rules:**
    - If **Sole Trader** is selected, the form will enforce a limit of **one Principal**. Legal Name will be auto-populated from the Principal's name.
    - If **Partnership** is selected, Legal Name will be auto-populated by combining the names of Principal 1 and Principal 2 (and others).
    - If **LTD** is selected, Legal Name and Company Number are auto-populated from the **Companies House API** lookup performed in Step 0.
- **Trading Name:** Manual entry, if different from Legal Name.
- **Trading Address:** Postcode lookup powered by the **getaddress.io API**, followed by address selection from a list.
- **VAT Registered?** (Yes/No toggle).

#### Step 4: Trading Information
- **Type of Business (MCC Code):**
    - A searchable dropdown powered by a provided list of MCC codes (e.g., `"0742 - Veterinary Services"`).
    - The selection must store both the **code** and the **description**.
    - Free-text entry is disabled; a selection from the list is mandatory.
    - **Optional Industry Grouping:** The UI will allow agents to first filter by a high-level group (e.g., Retail, Healthcare) and then search for a specific MCC within that group.
- **Amex Required?** (Yes/No toggle).
- **Projected Annual Turnover (£):** Numerical input.
- **Estimated Average Transaction (£):** Numerical input.

#### Step 5: Pricing
- **Consumer Debit %:** Defaults to 0.40%, minimum 0.25%.
- **Consumer Credit %:** Defaults to 0.65%, minimum 0.43%.
- **Commercial Card %:** Defaults to 2%, minimum 1.6%.
- **Authorisation Fee:** Defaults to £0.04, minimum £0.01.
- **Validation:** The form will prevent submission if any value is entered below its specified minimum threshold.

#### Step 6: Equipment
- **UI:** An equipment selection grid displaying images of devices (e.g., Clover hardware). The layout will adapt to a list view on smaller mobile screens.
- **Functionality:** Agent can select equipment, choose a rental or purchase option, and specify quantity.
- **Pricing:** The total equipment cost will auto-calculate and be displayed in a running summary.
- **Options:** Toggles for add-ons like MOTO (Mail Order/Telephone Order) and cashback.

#### Step 7: Banking
- **Account Name:** Read-only field, locked and auto-populated from the Legal Name in Step 3.
- **Sort Code:** Validated to be exactly 6 digits.
- **Account Number:** Validated to be exactly 8 digits.

#### Step 8: Submission
- **Review Screen:** A read-only summary of all entered data, with "Edit" buttons next to each section that navigate the user back to the relevant step.
- **Confirmation Checkbox:** A mandatory checkbox with the text, “I confirm the information provided is accurate.”
- **Submission Generation:** On clicking "Submit," the application is saved to the local queue and triggers the sync process, which ultimately results in:
    1. An email sent to the back-office containing structured data and the attached PDF.
    2. A record created in the local offline cache.
    3. An optional CC of the submission email sent to the agent's address.

---

## 5. Non-Functional Requirements
- **Mobile-first:** The UI and UX must be optimized for iPads and iPhones.
- **Offline support:** The application must be fully functional offline, with robust local caching and an auto-resync mechanism.
- **PDF Generation:** A standardized, clean PDF summary must be generated for compliance and record-keeping.
- **Security:** HTTPS, server-side input validation, secure API key management (on Vercel), and GDPR compliance for data handling.
- **Performance:** All external API lookups must complete in under 3 seconds and display clear loading indicators to the user.

---

## 6. Enhancements (Smart Suggestions)
- **Smart Validation:** Implement features like auto-capitalization for names and real-time formatting for bank details.
- **Error Prompts:** Display clear, user-friendly tooltips explaining exactly why a field validation has failed.
- **Guided Navigation:** Prevent agents from skipping required fields or steps.
- **Pre-filled Defaults:** Utilize defaults wherever possible (e.g., pricing, ownership rules) to speed up data entry.
- **"Idiot-proofing":** Strictly use dropdowns, toggles, and validated inputs over free-text fields to minimize human error.

---