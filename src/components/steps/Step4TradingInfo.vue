<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Trading Information</h2>
      <p class="text-gray-600">Details about the business trading activities and transaction expectations.</p>
    </div>

    <!-- MCC Code Selection -->
    <div class="space-y-4">
      <div>
        <label for="mccSearch" class="block text-sm font-medium text-gray-700 mb-2">
          Type of Business (MCC Code) *
        </label>
        
        <!-- Industry Group Filter -->
        <div class="mb-3">
          <select
            v-model="selectedIndustryGroup"
            class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
            @change="filterMccCodes"
          >
            <option value="">All Industries</option>
            <option v-for="group in industryGroups" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
          <p class="mt-1 text-sm text-gray-500">Filter by industry group to narrow down options</p>
        </div>

        <!-- MCC Code Search -->
        <div class="flex items-center space-x-2">
          <div class="flex-1 relative">
            <input
              id="mccSearch"
              v-model="mccSearchTerm"
              type="text"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
              :class="{ 'border-red-300': !selectedMccCode && showValidation }"
              placeholder="Search for business type..."
              @input="searchMccCodes"
              @focus="showMccDropdown = true"
            />
          </div>
          <div v-if="selectedMccCode" class="flex-shrink-0">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- MCC Code Dropdown -->
        <div v-if="showMccDropdown && filteredMccCodes.length > 0" class="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div
            v-for="mcc in filteredMccCodes.slice(0, 10)"
            :key="mcc.code"
            @click="selectMccCode(mcc)"
            class="px-4 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 min-h-[60px] flex flex-col justify-center"
          >
            <div class="font-medium text-gray-900 leading-tight mb-1">
              <span class="text-primary-600 font-bold">{{ mcc.code }}</span> - {{ mcc.description }}
            </div>
            <div v-if="mcc.group" class="text-xs text-gray-500 uppercase tracking-wide">{{ mcc.group }}</div>
          </div>
          <div v-if="filteredMccCodes.length > 10" class="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
            Showing first 10 results. Continue typing to narrow down...
          </div>
        </div>

        <p v-if="!selectedMccCode" class="mt-1 text-sm text-gray-500">
          Search and select the business type that best describes your activities
        </p>
      </div>

      <!-- Selected MCC Display -->
      <div v-if="selectedMccCode" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <h3 class="text-sm font-medium text-green-800 mb-1">Selected Business Type</h3>
            <p class="text-sm text-green-700">
              <strong>{{ selectedMccCode.code }}</strong> - {{ selectedMccCode.description }}
            </p>
            <p v-if="selectedMccCode.group" class="text-xs text-green-600 mt-1">{{ selectedMccCode.group }}</p>
          </div>
          <button
            @click="clearMccSelection"
            class="ml-2 text-green-600 hover:text-green-800"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Amex Required -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <input
          id="amexRequired"
          v-model="amexRequired"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
          @change="updateAmexRequired"
        />
        <div class="ml-3">
          <label for="amexRequired" class="block text-sm font-medium text-gray-900">
            American Express required?
          </label>
          <p class="text-sm text-gray-600 mt-1">
            Check this if the business needs to accept American Express cards. Additional fees may apply.
          </p>
        </div>
      </div>
    </div>

    <!-- Financial Projections -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">Financial Projections</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Projected Annual Turnover -->
        <div>
          <label for="annualTurnover" class="block text-sm font-medium text-gray-700 mb-2">
            Projected Annual Turnover (£) *
          </label>
          <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500" :class="{ 'border-red-300': (!projectedAnnualTurnover || projectedAnnualTurnover <= 0) && showValidation }">
            <div class="px-2 py-3 bg-gray-100 border-r border-gray-300 rounded-l-md flex items-center text-gray-700 font-medium flex-shrink-0">
              £
            </div>
            <input
              id="annualTurnover"
              v-model.number="projectedAnnualTurnover"
              type="number"
              min="0"
              step="1000"
              required
              class="flex-1 min-w-0 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
              placeholder="0"
              @input="updateProjectedTurnover"
            />
            <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
              <button
                type="button"
                @click="incrementTurnover"
                class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center"
              >
                <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                @click="decrementTurnover"
                class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-md"
                :disabled="projectedAnnualTurnover <= 0"
              >
                <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-500">Expected total revenue for the next 12 months</p>
        </div>

        <!-- Estimated Average Transaction -->
        <div>
          <label for="avgTransaction" class="block text-sm font-medium text-gray-700 mb-2">
            Estimated Average Transaction (£) *
          </label>
          <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500" :class="{ 'border-red-300': (!estimatedAverageTransaction || estimatedAverageTransaction <= 0) && showValidation }">
            <div class="px-2 py-3 bg-gray-100 border-r border-gray-300 rounded-l-md flex items-center text-gray-700 font-medium flex-shrink-0">
              £
            </div>
            <input
              id="avgTransaction"
              v-model.number="estimatedAverageTransaction"
              type="number"
              min="0"
              step="1"
              required
              class="flex-1 min-w-0 px-3 py-3 border-0 focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-no-arrows"
              placeholder="0.00"
              @input="updateAverageTransaction"
            />
            <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
              <button
                type="button"
                @click="incrementTransaction"
                class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center"
              >
                <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                @click="decrementTransaction"
                class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-md"
                :disabled="estimatedAverageTransaction <= 0"
              >
                <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-500">Typical transaction amount</p>
        </div>
      </div>

      <!-- Financial Summary -->
      <div v-if="projectedAnnualTurnover > 0 && estimatedAverageTransaction > 0" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Projected Transaction Volume</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-gray-600">Annual Transactions:</span>
            <span class="font-medium ml-2">{{ Math.round(projectedAnnualTurnover / estimatedAverageTransaction).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-gray-600">Monthly Average:</span>
            <span class="font-medium ml-2">{{ Math.round(projectedAnnualTurnover / estimatedAverageTransaction / 12).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-gray-600">Daily Average:</span>
            <span class="font-medium ml-2">{{ Math.round(projectedAnnualTurnover / estimatedAverageTransaction / 365).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { mccCodes, industryGroups as allIndustryGroups } from '@/data/mccCodes'

const formStore = useFormStore()
const uiStore = useUiStore()

// Sample MCC codes (will be replaced with real data)
const sampleMccCodes = [
  { code: '5411', description: 'Grocery Stores, Supermarkets', group: 'Retail' },
  { code: '5812', description: 'Eating Places, Restaurants', group: 'Food & Dining' },
  { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', group: 'Retail' },
  { code: '8021', description: 'Dentists, Orthodontists', group: 'Healthcare' },
  { code: '7372', description: 'Computer Programming, Data Processing', group: 'Technology' },
  { code: '5691', description: 'Mens and Womens Clothing Stores', group: 'Retail' },
  { code: '7299', description: 'Miscellaneous Personal Services', group: 'Services' },
  { code: '5542', description: 'Automated Fuel Dispensers', group: 'Automotive' },
  { code: '8011', description: 'Doctors, Physicians', group: 'Healthcare' },
  { code: '5311', description: 'Department Stores', group: 'Retail' },
  { code: '7011', description: 'Hotels, Motels, Resorts', group: 'Hospitality' },
  { code: '5814', description: 'Fast Food Restaurants', group: 'Food & Dining' },
  { code: '0742', description: 'Veterinary Services', group: 'Healthcare' },
  { code: '5944', description: 'Jewelry, Watches, Silverware', group: 'Retail' },
  { code: '7832', description: 'Motion Picture Theaters', group: 'Entertainment' }
]

// Local reactive data
const selectedMccCode = ref(null)
const mccSearchTerm = ref('')
const selectedIndustryGroup = ref('')
const showMccDropdown = ref(false)
const amexRequired = ref(formStore.tradingInfo.amexRequired)
const projectedAnnualTurnover = ref(formStore.tradingInfo.projectedAnnualTurnover)
const estimatedAverageTransaction = ref(formStore.tradingInfo.estimatedAverageTransaction)
const showValidation = ref(false)

// Computed properties
const industryGroups = computed(() => allIndustryGroups)

const filteredMccCodes = computed(() => {
  let codes = mccCodes

  // Filter by industry group
  if (selectedIndustryGroup.value) {
    codes = codes.filter(mcc => mcc.group === selectedIndustryGroup.value)
  }

  // Filter by search term
  if (mccSearchTerm.value) {
    const searchLower = mccSearchTerm.value.toLowerCase()
    codes = codes.filter(mcc => 
      mcc.searchText.includes(searchLower)
    )
  }

  return codes
})

const isStepValid = computed(() => {
  return selectedMccCode.value && 
         projectedAnnualTurnover.value > 0 && 
         estimatedAverageTransaction.value > 0
})

// Methods
const searchMccCodes = () => {
  showMccDropdown.value = true
}

const selectMccCode = (mcc) => {
  selectedMccCode.value = mcc
  mccSearchTerm.value = `${mcc.code} - ${mcc.description}`
  showMccDropdown.value = false
  
  // Update form store
  formStore.tradingInfo.mccCode = mcc.code
  formStore.tradingInfo.mccDescription = mcc.description
  formStore.touch()
}

const clearMccSelection = () => {
  selectedMccCode.value = null
  mccSearchTerm.value = ''
  formStore.tradingInfo.mccCode = ''
  formStore.tradingInfo.mccDescription = ''
  formStore.touch()
}

const filterMccCodes = () => {
  // Reset search when industry group changes
  if (mccSearchTerm.value && !selectedMccCode.value) {
    mccSearchTerm.value = ''
  }
}

const updateAmexRequired = () => {
  formStore.tradingInfo.amexRequired = amexRequired.value
  formStore.touch()
}

const updateProjectedTurnover = () => {
  formStore.tradingInfo.projectedAnnualTurnover = projectedAnnualTurnover.value || 0
  formStore.touch()
}

const updateAverageTransaction = () => {
  formStore.tradingInfo.estimatedAverageTransaction = estimatedAverageTransaction.value || 0
  formStore.touch()
}

const incrementTurnover = () => {
  const currentValue = projectedAnnualTurnover.value || 0
  projectedAnnualTurnover.value = currentValue + 10000 // Increment by £10k
  updateProjectedTurnover()
}

const decrementTurnover = () => {
  const currentValue = projectedAnnualTurnover.value || 0
  if (currentValue >= 10000) {
    projectedAnnualTurnover.value = currentValue - 10000 // Decrement by £10k
    updateProjectedTurnover()
  }
}

const incrementTransaction = () => {
  const currentValue = estimatedAverageTransaction.value || 0
  estimatedAverageTransaction.value = currentValue + 10 // Increment by £10
  updateAverageTransaction()
}

const decrementTransaction = () => {
  const currentValue = estimatedAverageTransaction.value || 0
  if (currentValue >= 10) {
    estimatedAverageTransaction.value = currentValue - 10 // Decrement by £10
    updateAverageTransaction()
  }
}

const handleClickOutside = (event) => {
  if (!event.target.closest('#mccSearch') && !event.target.closest('.absolute.z-10')) {
    showMccDropdown.value = false
  }
}

// Initialize from existing form data
const initializeFromStore = () => {
  if (formStore.tradingInfo.mccCode && formStore.tradingInfo.mccDescription) {
    const existingMcc = mccCodes.find(mcc => mcc.code === formStore.tradingInfo.mccCode)
    if (existingMcc) {
      selectedMccCode.value = existingMcc
      mccSearchTerm.value = `${existingMcc.code} - ${existingMcc.description}`
    }
  }
}

// Watchers
watch(isStepValid, (newValue) => {
  uiStore.setStepValid(4, newValue)
})

// Show validation errors after user tries to proceed
watch(() => uiStore.currentStep, (newStep, oldStep) => {
  if (oldStep === 4 && newStep !== 4) {
    showValidation.value = true
  }
})

// Lifecycle
onMounted(() => {
  initializeFromStore()
  uiStore.setStepValid(4, isStepValid.value)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
