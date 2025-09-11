<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Banking Details</h2>
      <p class="text-gray-600">Bank account information where payments will be deposited.</p>
    </div>

    <!-- Account Name (Locked from Legal Name) -->
    <div>
      <label for="accountName" class="block text-sm font-medium text-gray-700 mb-2">
        Account Name *
      </label>
      <input
        id="accountName"
        v-model="accountName"
        type="text"
        readonly
        required
        class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none text-base min-h-[44px]"
        placeholder="Auto-populated from legal business name"
      />
      <p class="mt-1 text-sm text-gray-500">
        This is automatically filled from the legal name in Step 3 and cannot be changed to prevent errors.
      </p>
    </div>

    <!-- Banking Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Sort Code -->
      <div>
        <label for="sortCode" class="block text-sm font-medium text-gray-700 mb-2">
          Sort Code *
        </label>
        <input
          id="sortCode"
          v-model="sortCode"
          type="text"
          required
          maxlength="8"
          pattern="[0-9-]{6,8}"
          class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
          :class="{ 'border-red-300': sortCodeError && showValidation }"
          placeholder="12-34-56 or 123456"
          @input="handleSortCodeInput"
          @blur="validateSortCode"
        />
        <p v-if="sortCodeError" class="mt-1 text-sm text-red-600">{{ sortCodeError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">6 digits, with or without dashes (e.g., 12-34-56)</p>
      </div>

      <!-- Account Number -->
      <div>
        <label for="accountNumber" class="block text-sm font-medium text-gray-700 mb-2">
          Account Number *
        </label>
        <input
          id="accountNumber"
          v-model="accountNumber"
          type="text"
          required
          maxlength="8"
          pattern="[0-9]{8}"
          class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
          :class="{ 'border-red-300': accountNumberError && showValidation }"
          placeholder="12345678"
          @input="handleAccountNumberInput"
          @blur="validateAccountNumber"
        />
        <p v-if="accountNumberError" class="mt-1 text-sm text-red-600">{{ accountNumberError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">Exactly 8 digits</p>
      </div>
    </div>

    <!-- Banking Information Panel -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-blue-800 mb-1">Banking Information</h3>
          <div class="text-sm text-blue-700 space-y-1">
            <p>• Account name is automatically set to match your legal business name</p>
            <p>• Sort code must be exactly 6 digits (with or without dashes)</p>
            <p>• Account number must be exactly 8 digits</p>
            <p>• Ensure the account can receive business payments</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Banking Summary (when valid) -->
    <div v-if="isStepValid" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-green-800 mb-2">Banking Details Confirmed</h3>
          <div class="space-y-1 text-sm text-green-700">
            <p><strong>Account Name:</strong> {{ accountName }}</p>
            <p><strong>Sort Code:</strong> {{ formattedSortCode }}</p>
            <p><strong>Account Number:</strong> {{ accountNumber }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="(sortCodeError || accountNumberError) && showValidation" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Banking Validation Errors</h3>
          <ul class="text-sm text-red-700 mt-1 list-disc list-inside">
            <li v-if="sortCodeError">{{ sortCodeError }}</li>
            <li v-if="accountNumberError">{{ accountNumberError }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'

const formStore = useFormStore()
const uiStore = useUiStore()

// Local reactive data
const accountName = ref(formStore.banking.accountName)
const sortCode = ref(formStore.banking.sortCode)
const accountNumber = ref(formStore.banking.accountNumber)
const sortCodeError = ref('')
const accountNumberError = ref('')
const showValidation = ref(false)

// Computed properties
const legalName = computed(() => formStore.businessInfo.legalName)

const formattedSortCode = computed(() => {
  if (!sortCode.value) return ''
  const cleaned = sortCode.value.replace(/\D/g, '')
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`
  }
  return sortCode.value
})

const isValidSortCode = computed(() => {
  const cleaned = sortCode.value.replace(/\D/g, '')
  return cleaned.length === 6 && /^\d{6}$/.test(cleaned)
})

const isValidAccountNumber = computed(() => {
  return accountNumber.value.length === 8 && /^\d{8}$/.test(accountNumber.value)
})

const isStepValid = computed(() => {
  return accountName.value.length > 0 && 
         isValidSortCode.value && 
         isValidAccountNumber.value &&
         !sortCodeError.value && 
         !accountNumberError.value
})

// Methods
const handleSortCodeInput = (event) => {
  let value = event.target.value
  
  // Remove any non-digits
  const digitsOnly = value.replace(/\D/g, '')
  
  // Limit to 6 digits
  if (digitsOnly.length > 6) {
    value = digitsOnly.slice(0, 6)
  } else {
    value = digitsOnly
  }
  
  // Auto-format with dashes
  if (value.length >= 3) {
    value = value.slice(0, 2) + '-' + value.slice(2)
  }
  if (value.length >= 6) {
    value = value.slice(0, 5) + '-' + value.slice(5)
  }
  
  sortCode.value = value
  sortCodeError.value = ''
  updateBanking()
}

const validateSortCode = () => {
  if (!sortCode.value) {
    sortCodeError.value = 'Sort code is required'
  } else if (!isValidSortCode.value) {
    sortCodeError.value = 'Sort code must be exactly 6 digits'
  } else {
    sortCodeError.value = ''
  }
}

const handleAccountNumberInput = (event) => {
  let value = event.target.value
  
  // Remove any non-digits and limit to 8 digits
  value = value.replace(/\D/g, '').slice(0, 8)
  
  accountNumber.value = value
  accountNumberError.value = ''
  updateBanking()
}

const validateAccountNumber = () => {
  if (!accountNumber.value) {
    accountNumberError.value = 'Account number is required'
  } else if (!isValidAccountNumber.value) {
    accountNumberError.value = 'Account number must be exactly 8 digits'
  } else {
    accountNumberError.value = ''
  }
}

const updateBanking = () => {
  formStore.banking.accountName = accountName.value
  formStore.banking.sortCode = sortCode.value
  formStore.banking.accountNumber = accountNumber.value
  formStore.touch()
}

// Auto-populate account name from legal name
const updateAccountName = () => {
  if (legalName.value && legalName.value !== accountName.value) {
    accountName.value = legalName.value
    updateBanking()
  }
}

// Watchers
watch(legalName, updateAccountName)

watch(isStepValid, (newValue) => {
  uiStore.setStepValid(7, newValue)
})

// Show validation errors after user tries to proceed
watch(() => uiStore.currentStep, (newStep, oldStep) => {
  if (oldStep === 7 && newStep !== 7) {
    showValidation.value = true
    validateSortCode()
    validateAccountNumber()
  }
})

// Initialize
onMounted(() => {
  updateAccountName()
  validateSortCode()
  validateAccountNumber()
  uiStore.setStepValid(7, isStepValid.value)
})
</script>
