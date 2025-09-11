<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Pricing</h2>
      <p class="text-gray-600">Set the card processing rates and fees for this merchant account.</p>
    </div>

    <!-- Pricing Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Consumer Debit -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <label for="consumerDebit" class="text-sm font-medium text-gray-900">
            Consumer Debit %
          </label>
          <span class="text-xs text-gray-500">Min: 0.25%</span>
        </div>
        
        <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500" :class="{ 'border-red-300': consumerDebitError }">
          <input
            id="consumerDebit"
            v-model.number="consumerDebit"
            type="number"
            min="0.25"
            step="0.01"
            required
            class="flex-1 min-w-0 px-3 py-3 border-0 rounded-l-md focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            placeholder="0.40"
            @input="validateConsumerDebit"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button
              type="button"
              @click="incrementConsumerDebit"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              @click="decrementConsumerDebit"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center"
              :disabled="consumerDebit <= 0.25"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div class="px-2 py-3 bg-gray-100 border-l border-gray-300 rounded-r-md flex items-center text-gray-700 font-medium flex-shrink-0">
            %
          </div>
        </div>
        
        <div class="mt-2 flex items-center justify-between text-xs">
          <span class="text-gray-500">Default: 0.40%</span>
          <button
            v-if="consumerDebit !== 0.40"
            @click="resetConsumerDebit"
            class="text-primary-600 hover:text-primary-700"
          >
            Reset to default
          </button>
        </div>
        
        <p v-if="consumerDebitError" class="mt-1 text-sm text-red-600">{{ consumerDebitError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">Rate for UK debit card transactions</p>
      </div>

      <!-- Consumer Credit -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <label for="consumerCredit" class="text-sm font-medium text-gray-900">
            Consumer Credit %
          </label>
          <span class="text-xs text-gray-500">Min: 0.43%</span>
        </div>
        
        <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500" :class="{ 'border-red-300': consumerCreditError }">
          <input
            id="consumerCredit"
            v-model.number="consumerCredit"
            type="number"
            min="0.43"
            step="0.01"
            required
            class="flex-1 min-w-0 px-3 py-3 border-0 rounded-l-md focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            placeholder="0.65"
            @input="validateConsumerCredit"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button
              type="button"
              @click="incrementConsumerCredit"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              @click="decrementConsumerCredit"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center"
              :disabled="consumerCredit <= 0.43"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div class="px-2 py-3 bg-gray-100 border-l border-gray-300 rounded-r-md flex items-center text-gray-700 font-medium flex-shrink-0">
            %
          </div>
        </div>
        
        <div class="mt-2 flex items-center justify-between text-xs">
          <span class="text-gray-500">Default: 0.65%</span>
          <button
            v-if="consumerCredit !== 0.65"
            @click="resetConsumerCredit"
            class="text-primary-600 hover:text-primary-700"
          >
            Reset to default
          </button>
        </div>
        
        <p v-if="consumerCreditError" class="mt-1 text-sm text-red-600">{{ consumerCreditError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">Rate for UK credit card transactions</p>
      </div>

      <!-- Commercial Card -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <label for="commercialCard" class="text-sm font-medium text-gray-900">
            Commercial Card %
          </label>
          <span class="text-xs text-gray-500">Min: 1.6%</span>
        </div>
        
        <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500" :class="{ 'border-red-300': commercialCardError }">
          <input
            id="commercialCard"
            v-model.number="commercialCard"
            type="number"
            min="1.6"
            step="0.01"
            required
            class="flex-1 min-w-0 px-3 py-3 border-0 rounded-l-md focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            placeholder="2.00"
            @input="validateCommercialCard"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button
              type="button"
              @click="incrementCommercialCard"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              @click="decrementCommercialCard"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center"
              :disabled="commercialCard <= 1.6"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div class="px-2 py-3 bg-gray-100 border-l border-gray-300 rounded-r-md flex items-center text-gray-700 font-medium flex-shrink-0">
            %
          </div>
        </div>
        
        <div class="mt-2 flex items-center justify-between text-xs">
          <span class="text-gray-500">Default: 2.00%</span>
          <button
            v-if="commercialCard !== 2.00"
            @click="resetCommercialCard"
            class="text-primary-600 hover:text-primary-700"
          >
            Reset to default
          </button>
        </div>
        
        <p v-if="commercialCardError" class="mt-1 text-sm text-red-600">{{ commercialCardError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">Rate for business/corporate cards</p>
      </div>

      <!-- Authorization Fee -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <label for="authFee" class="text-sm font-medium text-gray-900">
            Authorization Fee
          </label>
          <span class="text-xs text-gray-500">Min: £0.01</span>
        </div>
        
        <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500" :class="{ 'border-red-300': authFeeError }">
          <div class="px-2 py-3 bg-gray-100 border-r border-gray-300 rounded-l-md flex items-center text-gray-700 font-medium flex-shrink-0">
            £
          </div>
          <input
            id="authFee"
            v-model.number="authFee"
            type="number"
            min="0.01"
            step="0.01"
            required
            class="flex-1 min-w-0 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            placeholder="0.04"
            @input="validateAuthFee"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button
              type="button"
              @click="incrementAuthFee"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              @click="decrementAuthFee"
              class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-md"
              :disabled="authFee <= 0.01"
            >
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="mt-2 flex items-center justify-between text-xs">
          <span class="text-gray-500">Default: £0.04</span>
          <button
            v-if="authFee !== 0.04"
            @click="resetAuthFee"
            class="text-primary-600 hover:text-primary-700"
          >
            Reset to default
          </button>
        </div>
        
        <p v-if="authFeeError" class="mt-1 text-sm text-red-600">{{ authFeeError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">Fee charged per transaction authorization</p>
      </div>
    </div>

    <!-- Pricing Summary -->
    <div v-if="isStepValid" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800 mb-3">Pricing Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-blue-700">Consumer Debit:</span>
            <span class="font-medium text-blue-900">{{ consumerDebit }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Consumer Credit:</span>
            <span class="font-medium text-blue-900">{{ consumerCredit }}%</span>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-blue-700">Commercial Card:</span>
            <span class="font-medium text-blue-900">{{ commercialCard }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Authorization Fee:</span>
            <span class="font-medium text-blue-900">£{{ authFee }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-2 justify-center">
      <button
        @click="resetAllToDefaults"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Reset All to Defaults
      </button>
      <button
        @click="setCompetitiveRates"
        class="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Set Competitive Rates
      </button>
    </div>

    <!-- Validation Errors Summary -->
    <div v-if="hasValidationErrors && showValidation" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Pricing Validation Errors</h3>
          <ul class="text-sm text-red-700 mt-1 list-disc list-inside">
            <li v-if="consumerDebitError">{{ consumerDebitError }}</li>
            <li v-if="consumerCreditError">{{ consumerCreditError }}</li>
            <li v-if="commercialCardError">{{ commercialCardError }}</li>
            <li v-if="authFeeError">{{ authFeeError }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'

const formStore = useFormStore()
const uiStore = useUiStore()

// Pricing constants
const DEFAULTS = {
  consumerDebit: 0.40,
  consumerCredit: 0.65,
  commercialCard: 2.00,
  authFee: 0.04
}

const MINIMUMS = {
  consumerDebit: 0.25,
  consumerCredit: 0.43,
  commercialCard: 1.60,
  authFee: 0.01
}

// Local reactive data
const consumerDebit = ref(formStore.pricing.consumerDebit)
const consumerCredit = ref(formStore.pricing.consumerCredit)
const commercialCard = ref(formStore.pricing.commercialCard)
const authFee = ref(formStore.pricing.authorisationFee)
const showValidation = ref(false)

// Error states
const consumerDebitError = ref('')
const consumerCreditError = ref('')
const commercialCardError = ref('')
const authFeeError = ref('')

// Computed properties
const hasValidationErrors = computed(() => {
  return !!(consumerDebitError.value || consumerCreditError.value || commercialCardError.value || authFeeError.value)
})

const isStepValid = computed(() => {
  return !hasValidationErrors.value &&
         consumerDebit.value >= MINIMUMS.consumerDebit &&
         consumerCredit.value >= MINIMUMS.consumerCredit &&
         commercialCard.value >= MINIMUMS.commercialCard &&
         authFee.value >= MINIMUMS.authFee
})

// Validation methods
const validateConsumerDebit = () => {
  if (!consumerDebit.value || consumerDebit.value < MINIMUMS.consumerDebit) {
    consumerDebitError.value = `Consumer Debit rate must be at least ${MINIMUMS.consumerDebit}%`
  } else {
    consumerDebitError.value = ''
  }
  updateFormStore()
}

const validateConsumerCredit = () => {
  if (!consumerCredit.value || consumerCredit.value < MINIMUMS.consumerCredit) {
    consumerCreditError.value = `Consumer Credit rate must be at least ${MINIMUMS.consumerCredit}%`
  } else {
    consumerCreditError.value = ''
  }
  updateFormStore()
}

const validateCommercialCard = () => {
  if (!commercialCard.value || commercialCard.value < MINIMUMS.commercialCard) {
    commercialCardError.value = `Commercial Card rate must be at least ${MINIMUMS.commercialCard}%`
  } else {
    commercialCardError.value = ''
  }
  updateFormStore()
}

const validateAuthFee = () => {
  if (!authFee.value || authFee.value < MINIMUMS.authFee) {
    authFeeError.value = `Authorization fee must be at least £${MINIMUMS.authFee}`
  } else {
    authFeeError.value = ''
  }
  updateFormStore()
}

// Reset methods
const resetConsumerDebit = () => {
  consumerDebit.value = DEFAULTS.consumerDebit
  validateConsumerDebit()
}

const resetConsumerCredit = () => {
  consumerCredit.value = DEFAULTS.consumerCredit
  validateConsumerCredit()
}

const resetCommercialCard = () => {
  commercialCard.value = DEFAULTS.commercialCard
  validateCommercialCard()
}

const resetAuthFee = () => {
  authFee.value = DEFAULTS.authFee
  validateAuthFee()
}

const resetAllToDefaults = () => {
  consumerDebit.value = DEFAULTS.consumerDebit
  consumerCredit.value = DEFAULTS.consumerCredit
  commercialCard.value = DEFAULTS.commercialCard
  authFee.value = DEFAULTS.authFee
  
  // Validate all fields
  validateConsumerDebit()
  validateConsumerCredit()
  validateCommercialCard()
  validateAuthFee()
}

const setCompetitiveRates = () => {
  // Set competitive rates (at minimum levels)
  consumerDebit.value = MINIMUMS.consumerDebit
  consumerCredit.value = MINIMUMS.consumerCredit
  commercialCard.value = MINIMUMS.commercialCard
  authFee.value = MINIMUMS.authFee
  
  // Validate all fields
  validateConsumerDebit()
  validateConsumerCredit()
  validateCommercialCard()
  validateAuthFee()
}

// Increment/Decrement methods for mobile buttons
const incrementConsumerDebit = () => {
  consumerDebit.value = Math.round((consumerDebit.value + 0.01) * 100) / 100
  validateConsumerDebit()
}

const decrementConsumerDebit = () => {
  if (consumerDebit.value > MINIMUMS.consumerDebit) {
    consumerDebit.value = Math.round((consumerDebit.value - 0.01) * 100) / 100
    validateConsumerDebit()
  }
}

const incrementConsumerCredit = () => {
  consumerCredit.value = Math.round((consumerCredit.value + 0.01) * 100) / 100
  validateConsumerCredit()
}

const decrementConsumerCredit = () => {
  if (consumerCredit.value > MINIMUMS.consumerCredit) {
    consumerCredit.value = Math.round((consumerCredit.value - 0.01) * 100) / 100
    validateConsumerCredit()
  }
}

const incrementCommercialCard = () => {
  commercialCard.value = Math.round((commercialCard.value + 0.01) * 100) / 100
  validateCommercialCard()
}

const decrementCommercialCard = () => {
  if (commercialCard.value > MINIMUMS.commercialCard) {
    commercialCard.value = Math.round((commercialCard.value - 0.01) * 100) / 100
    validateCommercialCard()
  }
}

const incrementAuthFee = () => {
  authFee.value = Math.round((authFee.value + 0.01) * 100) / 100
  validateAuthFee()
}

const decrementAuthFee = () => {
  if (authFee.value > MINIMUMS.authFee) {
    authFee.value = Math.round((authFee.value - 0.01) * 100) / 100
    validateAuthFee()
  }
}

// Update form store
const updateFormStore = () => {
  formStore.pricing.consumerDebit = consumerDebit.value || 0
  formStore.pricing.consumerCredit = consumerCredit.value || 0
  formStore.pricing.commercialCard = commercialCard.value || 0
  formStore.pricing.authorisationFee = authFee.value || 0
  formStore.touch()
}

// Watchers
watch(isStepValid, (newValue) => {
  uiStore.setStepValid(5, newValue)
})

// Show validation errors after user tries to proceed
watch(() => uiStore.currentStep, (newStep, oldStep) => {
  if (oldStep === 5 && newStep !== 5) {
    showValidation.value = true
  }
})

// Initialize validation
validateConsumerDebit()
validateConsumerCredit()
validateCommercialCard()
validateAuthFee()
uiStore.setStepValid(5, isStepValid.value)
</script>

<style scoped>
/* Hide default number input arrows/spinners */
.number-input-no-arrows::-webkit-outer-spin-button,
.number-input-no-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input-no-arrows {
  -moz-appearance: textfield; /* Firefox */
}
</style>
