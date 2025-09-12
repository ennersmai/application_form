<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Card Processing Rates</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Consumer Debit -->
      <div>
        <label for="consumerDebit" class="block text-sm font-medium text-gray-700 mb-2">
          Consumer Debit %
        </label>
        <div class="flex items-stretch border border-gray-300 rounded-lg shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500">
          <input
            id="consumerDebit"
            v-model.number="consumerDebit"
            type="number"
            step="0.01"
            min="0"
            class="flex-1 min-w-0 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            :class="{ 'border-red-300': showValidation && debitError }"
            @input="updateRates"
            @blur="validateField('debit')"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button type="button" @click="consumerDebit = +(consumerDebit || 0) + 0.05; updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button type="button" @click="consumerDebit = Math.max(0, +(consumerDebit || 0) - 0.05); updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-lg">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Default 0.40%. Minimum 0.25%.</p>
        <p v-if="debitError" class="mt-1 text-sm text-red-600">{{ debitError }}</p>
      </div>

      <!-- Consumer Credit -->
      <div>
        <label for="consumerCredit" class="block text-sm font-medium text-gray-700 mb-2">
          Consumer Credit %
        </label>
        <div class="flex items-stretch border border-gray-300 rounded-lg shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500">
          <input
            id="consumerCredit"
            v-model.number="consumerCredit"
            type="number"
            step="0.01"
            min="0"
            class="flex-1 min-w-0 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            :class="{ 'border-red-300': showValidation && creditError }"
            @input="updateRates"
            @blur="validateField('credit')"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button type="button" @click="consumerCredit = +(consumerCredit || 0) + 0.05; updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button type="button" @click="consumerCredit = Math.max(0, +(consumerCredit || 0) - 0.05); updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-lg">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Default 0.65%. Minimum 0.43%.</p>
        <p v-if="creditError" class="mt-1 text-sm text-red-600">{{ creditError }}</p>
      </div>

      <!-- Commercial Card -->
      <div>
        <label for="commercialCard" class="block text-sm font-medium text-gray-700 mb-2">
          Commercial Card %
        </label>
        <div class="flex items-stretch border border-gray-300 rounded-lg shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500">
          <input
            id="commercialCard"
            v-model.number="commercialCard"
            type="number"
            step="0.01"
            min="0"
            class="flex-1 min-w-0 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            :class="{ 'border-red-300': showValidation && commercialError }"
            @input="updateRates"
            @blur="validateField('commercial')"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button type="button" @click="commercialCard = +(commercialCard || 0) + 0.1; updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button type="button" @click="commercialCard = Math.max(0, +(commercialCard || 0) - 0.1); updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-lg">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Default 2.00%. Minimum 1.60%.</p>
        <p v-if="commercialError" class="mt-1 text-sm text-red-600">{{ commercialError }}</p>
      </div>

      <!-- Authorization Fee -->
      <div>
        <label for="authorisationFee" class="block text-sm font-medium text-gray-700 mb-2">
          Authorization Fee (£)
        </label>
        <div class="flex items-stretch border border-gray-300 rounded-lg shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500">
          <span class="mr-2 text-gray-500">£</span>
          <input
            id="authorisationFee"
            v-model.number="authorisationFee"
            type="number"
            step="0.01"
            min="0"
            class="flex-1 min-w-0 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
            :class="{ 'border-red-300': showValidation && authFeeError }"
            @input="updateRates"
            @blur="validateField('auth')"
          />
          <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
            <button type="button" @click="authorisationFee = +(authorisationFee || 0) + 0.01; updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button type="button" @click="authorisationFee = Math.max(0, +(authorisationFee || 0) - 0.01); updateRates()" class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-lg">
              <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Default £0.04. Minimum £0.01.</p>
        <p v-if="authFeeError" class="mt-1 text-sm text-red-600">{{ authFeeError }}</p>
      </div>
    </div>

    <div v-if="!isStepValid && showValidation" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Please correct rate values</h3>
          <ul class="text-sm text-red-700 mt-1 list-disc list-inside">
            <li v-if="debitError">{{ debitError }}</li>
            <li v-if="creditError">{{ creditError }}</li>
            <li v-if="commercialError">{{ commercialError }}</li>
            <li v-if="authFeeError">{{ authFeeError }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button type="button" @click="restoreDefaults" class="inline-flex items-center px-5 py-3 border border-blue-300 text-base font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 min-h-[44px]">
        Restore defaults
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'

const formStore = useFormStore()
const uiStore = useUiStore()

// Local state with defaults from PRD
const consumerDebit = ref(formStore.pricing.consumerDebit ?? 0.40)
const consumerCredit = ref(formStore.pricing.consumerCredit ?? 0.65)
const commercialCard = ref(formStore.pricing.commercialCard ?? 2.00)
const authorisationFee = ref(formStore.pricing.authorisationFee ?? 0.04)

const debitError = ref('')
const creditError = ref('')
const commercialError = ref('')
const authFeeError = ref('')
const showValidation = ref(false)

const isStepValid = computed(() => {
  const ok =
    isFinite(consumerDebit.value) && consumerDebit.value >= 0.25 &&
    isFinite(consumerCredit.value) && consumerCredit.value >= 0.43 &&
    isFinite(commercialCard.value) && commercialCard.value >= 1.6 &&
    isFinite(authorisationFee.value) && authorisationFee.value >= 0.01 &&
    !debitError.value && !creditError.value && !commercialError.value && !authFeeError.value
  return ok
})

const updateRates = () => {
  formStore.pricing.consumerDebit = Number(consumerDebit.value)
  formStore.pricing.consumerCredit = Number(consumerCredit.value)
  formStore.pricing.commercialCard = Number(commercialCard.value)
  formStore.pricing.authorisationFee = Number(authorisationFee.value)
  formStore.touch()
}

const validateField = (field) => {
  if (field === 'debit') {
    debitError.value = consumerDebit.value >= 0.25 ? '' : 'Consumer debit rate must be at least 0.25%'
  } else if (field === 'credit') {
    creditError.value = consumerCredit.value >= 0.43 ? '' : 'Consumer credit rate must be at least 0.43%'
  } else if (field === 'commercial') {
    commercialError.value = commercialCard.value >= 1.6 ? '' : 'Commercial card rate must be at least 1.6%'
  } else if (field === 'auth') {
    authFeeError.value = authorisationFee.value >= 0.01 ? '' : 'Authorization fee must be at least £0.01'
  }
}

watch(isStepValid, (v) => uiStore.setStepValid(6, v))

// Show validation on leaving the step
watch(() => uiStore.currentStep, (newStep, oldStep) => {
  if (oldStep === 6 && newStep !== 6) {
    showValidation.value = true
    validateField('debit')
    validateField('credit')
    validateField('commercial')
    validateField('auth')
  }
})

// Initialize
uiStore.setStepValid(6, isStepValid.value)

const restoreDefaults = () => {
  consumerDebit.value = 0.40
  consumerCredit.value = 0.65
  commercialCard.value = 2.00
  authorisationFee.value = 0.04
  debitError.value = ''
  creditError.value = ''
  commercialError.value = ''
  authFeeError.value = ''
  updateRates()
}
</script>

<style scoped>
/* Hide default number input arrows/spinners */
.number-input-no-arrows::-webkit-outer-spin-button,
.number-input-no-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input-no-arrows {
  appearance: textfield; /* Standard */
  -moz-appearance: textfield; /* Firefox */
}
</style>


