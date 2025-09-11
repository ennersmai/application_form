<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Business Type Verification</h2>
      <p class="text-gray-600">First, we need to verify the business type to ensure correct director verification.</p>
    </div>

    <!-- Business Type Selection -->
    <div class="space-y-4">
      <label class="text-base font-medium text-gray-900">Is this a Sole Trader or a Limited Company?</label>
      
      <div class="space-y-3">
        <label class="flex items-center">
          <input
            v-model="businessType"
            type="radio"
            value="sole_trader"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span class="ml-3">
            <span class="block text-sm font-medium text-gray-900">Sole Trader</span>
            <span class="block text-sm text-gray-500">Individual trading on their own</span>
          </span>
        </label>

        <label class="flex items-center">
          <input
            v-model="businessType"
            type="radio"
            value="limited_company"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span class="ml-3">
            <span class="block text-sm font-medium text-gray-900">Limited Company</span>
            <span class="block text-sm text-gray-500">Registered company with directors</span>
          </span>
        </label>
      </div>
    </div>

    <!-- Company Name Search (only for Limited Company) -->
    <div v-if="businessType === 'limited_company'" class="space-y-4">
      <div>
        <label for="companySearch" class="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <div class="relative">
          <input
            id="companySearch"
            v-model="companySearch"
            type="text"
            placeholder="Enter company name to search"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            :class="{ 'border-red-300': searchError }"
            @input="handleSearchInput"
            @keyup.enter="searchCompanies"
          />
          <button
            v-if="companySearch && !isLoading && !isSearching"
            @click="searchCompanies"
            :disabled="!companySearch.trim() || companySearch.trim().length < 2"
            class="absolute inset-y-0 right-0 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
          <div v-if="isSearching" class="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg class="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <p v-if="searchError" class="mt-1 text-sm text-red-600">{{ searchError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">Search for your company by name</p>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Select your company</label>
        <div class="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
          <label 
            v-for="company in searchResults" 
            :key="company.company_number"
            class="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-primary-50 border-primary-300': selectedCompany?.company_number === company.company_number }"
          >
            <input
              v-model="selectedCompany"
              type="radio"
              :value="company"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
              @change="selectCompany(company)"
            />
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ company.company_name }}</p>
              <p class="text-xs text-gray-500">Company No: {{ company.company_number }} • Status: {{ company.company_status }}</p>
              <p v-if="company.address_snippet" class="text-xs text-gray-500 mt-1">{{ company.address_snippet }}</p>
            </div>
          </label>
        </div>
        <button 
          v-if="selectedCompany"
          @click="lookupCompanyDetails"
          :disabled="isLoading"
          class="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {{ isLoading ? 'Loading Details...' : 'Get Company Details' }}
        </button>
      </div>
    </div>

    <!-- Company Details Display -->
    <div v-if="companyDetails" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-green-800 mb-2">Company Found</h3>
          <div class="space-y-1 text-sm text-green-700">
            <p><strong>Name:</strong> {{ companyDetails.company_name }}</p>
            <p><strong>Number:</strong> {{ companyDetails.company_number }}</p>
            <p><strong>Status:</strong> {{ companyDetails.company_status }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Directors List -->
    <div v-if="companyDetails?.officers?.length" class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Directors Verification</h3>
        <p class="text-sm text-gray-600 mb-4">
          Please confirm that the directors listed below match the principals being signed up:
        </p>
      </div>

      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div class="space-y-3">
          <div v-for="officer in companyDetails.officers" :key="officer.name" class="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
            <div>
              <p class="font-medium text-gray-900">{{ officer.name }}</p>
              <p class="text-sm text-gray-500">{{ officer.officer_role }}</p>
              <p v-if="officer.appointed_on" class="text-xs text-gray-400">
                Appointed: {{ formatDate(officer.appointed_on) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Directors Verification Checkbox -->
      <div class="flex items-start">
        <input
          id="directorsVerified"
          v-model="directorsVerified"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
        />
        <label for="directorsVerified" class="ml-3 text-sm text-gray-700">
          I confirm that the directors listed above match the principals being signed up for this merchant account.
        </label>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { companiesHouseService } from '@/services/companiesHouseService'

const formStore = useFormStore()
const uiStore = useUiStore()

// Local reactive data
const businessType = ref(formStore.businessTypeCheck.type)
const companyNumber = ref(formStore.businessTypeCheck.companyNumber)
const companyDetails = ref(formStore.businessTypeCheck.companyDetails)
const directorsVerified = ref(formStore.businessTypeCheck.directorsVerified)
const isLoading = ref(false)
const isSearching = ref(false)
const error = ref('')
const searchError = ref('')
const companySearch = ref('')
const searchResults = ref([])
const selectedCompany = ref(null)

// Computed properties

const isStepValid = computed(() => {
  if (businessType.value === 'sole_trader') {
    return true
  } else if (businessType.value === 'limited_company') {
    return companyDetails.value && directorsVerified.value
  }
  return false
})

// Methods
const updateStepValidation = () => {
  uiStore.setStepValid(0, isStepValid.value)
}

const handleSearchInput = () => {
  searchError.value = ''
  error.value = ''
  searchResults.value = []
  selectedCompany.value = null
  
  // Reset company details when search changes
  if (companyDetails.value) {
    companyDetails.value = null
    directorsVerified.value = false
  }
}

const searchCompanies = async () => {
  const query = companySearch.value.trim()
  if (!query || query.length < 2) {
    searchError.value = 'Please enter at least 2 characters to search'
    return
  }

  isSearching.value = true
  searchError.value = ''
  error.value = ''

  try {
    const result = await companiesHouseService.searchCompaniesByName(query)
    
    if (result.success) {
      searchResults.value = result.data.companies || []
      if (searchResults.value.length === 0) {
        searchError.value = 'No companies found matching your search'
      }
    } else {
      searchError.value = result.error
      searchResults.value = []
    }
  } catch (err) {
    searchError.value = 'An unexpected error occurred. Please try again.'
    console.error('Company search error:', err)
  } finally {
    isSearching.value = false
  }
}

const selectCompany = (company) => {
  selectedCompany.value = company
  companyNumber.value = company.company_number
  error.value = ''
}

const lookupCompanyDetails = async () => {
  if (!selectedCompany.value) return

  isLoading.value = true
  error.value = ''

  try {
    const result = await companiesHouseService.getCompanyDetails(selectedCompany.value.company_number)
    
    if (result.success) {
      companyDetails.value = result.data
      formStore.setCompanyDetails(result.data)
      formStore.businessTypeCheck.companyNumber = selectedCompany.value.company_number
      
      // Auto-populate principal information from company officers/directors
      if (result.data.officers && result.data.officers.length > 0) {
        autoPopulatePrincipals(result.data)
        // Show success message
        setTimeout(() => {
          alert(`✅ Auto-populated ${result.data.officers.length} principal(s) from company records. Please review and complete the missing information (email, phone, address) in the Principal Information step.`)
        }, 500)
      }
      
      // Auto-check directors verified if no directors (shouldn't happen for active companies)
      if (!result.data.officers || result.data.officers.length === 0) {
        directorsVerified.value = true
      }
    } else {
      error.value = result.error
      companyDetails.value = null
      directorsVerified.value = false
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Company lookup error:', err)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB')
}

const autoPopulatePrincipals = (companyData) => {
  if (!companyData.officers || companyData.officers.length === 0) return
  
  // Clear existing principals first
  formStore.clearPrincipals()
  
  // Add principals from company officers/directors
  companyData.officers.forEach((officer, index) => {
    if (index === 0) {
      // Update the first principal that already exists
      const principal = formStore.principals[0]
      updatePrincipalFromOfficer(principal, officer, index === 0)
    } else {
      // Add new principals for additional officers
      formStore.addPrincipal()
      const principal = formStore.principals[formStore.principals.length - 1]
      updatePrincipalFromOfficer(principal, officer, false)
    }
  })
  
  // Distribute ownership equally among all principals
  const numberOfPrincipals = formStore.principals.length
  const equalShare = Math.floor(100 / numberOfPrincipals)
  const remainder = 100 - (equalShare * numberOfPrincipals)
  
  formStore.principals.forEach((principal, index) => {
    principal.ownershipPercentage = equalShare + (index < remainder ? 1 : 0)
  })
}

const updatePrincipalFromOfficer = (principal, officer, isFirst) => {
  // Parse name (Companies House format is "SURNAME, Forename")
  const nameParts = officer.name.split(', ')
  if (nameParts.length >= 2) {
    principal.lastName = nameParts[0].trim()
    principal.firstName = nameParts[1].trim()
  } else {
    // Fallback if name format is different
    const nameWords = officer.name.split(' ')
    if (nameWords.length >= 2) {
      principal.firstName = nameWords[0].trim()
      principal.lastName = nameWords.slice(1).join(' ').trim()
    } else {
      principal.firstName = officer.name.trim()
      principal.lastName = ''
    }
  }
  
  // Set position based on officer role
  if (officer.officer_role === 'director') {
    principal.position = 'director'
  } else if (officer.officer_role === 'secretary') {
    principal.position = 'director' // Default to director for secretaries
  } else {
    principal.position = 'director' // Default to director
  }
  
  // Set ownership percentage (will be updated after all principals are added)
  principal.ownershipPercentage = 0
  
  // Initialize empty home address (user will need to fill this)
  if (!principal.homeAddress) {
    principal.homeAddress = {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postcode: ''
    }
  }
}

// Watchers
watch(businessType, (newValue) => {
  formStore.businessTypeCheck.type = newValue
  formStore.updateBusinessType(newValue)
  
  // Reset company-specific data when switching to sole trader
  if (newValue === 'sole_trader') {
    companyNumber.value = ''
    companySearch.value = ''
    searchResults.value = []
    selectedCompany.value = null
    companyDetails.value = null
    directorsVerified.value = false
    error.value = ''
    searchError.value = ''
  }
  
  updateStepValidation()
})

watch(directorsVerified, (newValue) => {
  formStore.businessTypeCheck.directorsVerified = newValue
  updateStepValidation()
})

watch(isStepValid, updateStepValidation)

// Initialize validation on mount
updateStepValidation()
</script>
