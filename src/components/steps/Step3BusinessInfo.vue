<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Business Information</h2>
      <p class="text-gray-600">Details about the business structure and trading address.</p>
    </div>

    <!-- Business Type Display -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-blue-800 mb-1">Business Type</h3>
          <p class="text-sm text-blue-700">
            {{ businessTypeDisplay }} 
            <span v-if="companyDetails" class="font-medium">({{ companyDetails.company_number }})</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Legal Name -->
    <div>
      <label for="legalName" class="block text-sm font-medium text-gray-700 mb-2">
        Legal Name *
      </label>
      <input
        id="legalName"
        v-model="legalName"
        type="text"
        required
        :readonly="isLegalNameReadonly"
        class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
        :class="{ 
          'bg-gray-50 text-gray-500 cursor-not-allowed': isLegalNameReadonly,
          'border-red-300': !legalName && showValidation
        }"
        placeholder="Enter legal business name"
        @input="updateLegalName"
      />
      <p class="mt-1 text-sm text-gray-500">
        <span v-if="isLegalNameReadonly">Auto-populated based on business type and principals</span>
        <span v-else>Enter the legal name of the business</span>
      </p>
    </div>

    <!-- Trading Name -->
    <div>
      <label for="tradingName" class="block text-sm font-medium text-gray-700 mb-2">
        Trading Name
      </label>
      <input
        id="tradingName"
        v-model="tradingName"
        type="text"
        class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
        placeholder="Enter trading name (if different from legal name)"
        @input="updateTradingName"
      />
      <p class="mt-1 text-sm text-gray-500">Only fill this if the business trades under a different name</p>
    </div>

    <!-- Company Number (for LTD companies) -->
    <div v-if="businessType === 'ltd'" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-green-800 mb-1">Company Number</h3>
          <p class="text-sm text-green-700">{{ companyNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Trading Address -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">Trading Address</h3>
      
      <!-- Postcode Lookup -->
      <div>
        <label for="postcode" class="block text-sm font-medium text-gray-700 mb-2">
          Lookup Postcode *
        </label>
        <div class="flex space-x-2">
          <input
            id="postcode"
            v-model="postcodeLookup"
            type="text"
            required
            class="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
            :class="{ 'border-red-300': postcodeError }"
            placeholder="e.g., SW1A 1AA"
            @input="handlePostcodeInput"
          />
          <button
            v-if="postcodeLookup && !isLoadingAddresses"
            @click="lookupAddresses"
            :disabled="!isValidPostcode"
            class="px-6 py-3 bg-primary-600 text-white text-base font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lookup
          </button>
          <div v-if="isLoadingAddresses" class="flex items-center px-4">
            <svg class="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <p v-if="postcodeError" class="mt-1 text-sm text-red-600">{{ postcodeError }}</p>
        <p v-else class="mt-1 text-sm text-gray-500">Enter postcode to find and select your address</p>
      </div>

      <!-- Address Selection -->
      <div v-if="addresses.length > 0" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Select Address *</label>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <label 
            v-for="(address, index) in addresses" 
            :key="index"
            class="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <input
              v-model="selectedAddressIndex"
              type="radio"
              :value="index"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
              @change="selectAddress(index)"
            />
            <div class="ml-3">
              <p class="text-sm text-gray-900">{{ address.formatted }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Manual Address Entry -->
      <div v-if="!addresses.length || showManualEntry" class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-900">
            {{ addresses.length > 0 ? 'Or enter manually:' : 'Address Details *' }}
          </h4>
          <button
            v-if="addresses.length > 0"
            @click="showManualEntry = !showManualEntry"
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            {{ showManualEntry ? 'Hide manual entry' : 'Enter manually' }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label for="addressLine1" class="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              id="addressLine1"
              v-model="tradingAddress.line1"
              type="text"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
              :class="{ 'border-red-300': !tradingAddress.line1 && showValidation }"
              placeholder="Enter address line 1"
              @input="updateAddress"
            />
          </div>

          <div>
            <label for="addressLine2" class="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              id="addressLine2"
              v-model="tradingAddress.line2"
              type="text"
              class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
              placeholder="Enter address line 2 (optional)"
              @input="updateAddress"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                id="city"
                v-model="tradingAddress.city"
                type="text"
                required
                class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
                :class="{ 'border-red-300': !tradingAddress.city && showValidation }"
                placeholder="Enter city"
                @input="updateAddress"
              />
            </div>

            <div>
              <label for="county" class="block text-sm font-medium text-gray-700 mb-2">
                County
              </label>
              <input
                id="county"
                v-model="tradingAddress.county"
                type="text"
                class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
                placeholder="Enter county"
                @input="updateAddress"
              />
            </div>
          </div>

          <div>
            <label for="finalPostcode" class="block text-sm font-medium text-gray-700 mb-2">
              Postcode *
            </label>
            <input
              id="finalPostcode"
              v-model="tradingAddress.postcode"
              type="text"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base min-h-[44px]"
              :class="{ 'border-red-300': !tradingAddress.postcode && showValidation }"
              placeholder="Enter postcode"
              @input="updateAddress"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- VAT Registration -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div class="flex items-start">
        <input
          id="vatRegistered"
          v-model="vatRegistered"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
          @change="updateVatRegistered"
        />
        <div class="ml-3">
          <label for="vatRegistered" class="block text-sm font-medium text-gray-900">
            Is this business VAT registered?
          </label>
          <p class="text-sm text-gray-600 mt-1">
            Check this if the business is registered for VAT with HMRC.
          </p>
        </div>
      </div>
    </div>

    <!-- Address Lookup Error -->
    <div v-if="addressError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Address Lookup Error</h3>
          <p class="text-sm text-red-700 mt-1">{{ addressError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { addressService } from '@/services/addressService'

const formStore = useFormStore()
const uiStore = useUiStore()

// Local reactive data
const legalName = ref(formStore.businessInfo.legalName)
const tradingName = ref(formStore.businessInfo.tradingName)
const tradingAddress = ref({ ...formStore.businessInfo.tradingAddress })
const vatRegistered = ref(formStore.businessInfo.vatRegistered)

// Address lookup
const postcodeLookup = ref('')
const addresses = ref([])
const selectedAddressIndex = ref(-1)
const showManualEntry = ref(false)
const isLoadingAddresses = ref(false)
const postcodeError = ref('')
const addressError = ref('')
const showValidation = ref(false)

// Computed properties
const businessType = computed(() => formStore.businessInfo.businessType)
const companyDetails = computed(() => formStore.businessTypeCheck.companyDetails)
const companyNumber = computed(() => formStore.businessInfo.companyNumber)

const businessTypeDisplay = computed(() => {
  switch (businessType.value) {
    case 'sole_trader': return 'Sole Trader'
    case 'ltd': return 'Limited Company'
    case 'partnership': return 'Partnership'
    default: return 'Unknown'
  }
})

const isLegalNameReadonly = computed(() => {
  // Legal name is auto-populated for sole traders and partnerships
  return businessType.value === 'sole_trader' || businessType.value === 'partnership'
})

const isValidPostcode = computed(() => {
  return addressService.validatePostcode(postcodeLookup.value)
})

const isStepValid = computed(() => {
  const hasLegalName = legalName.value && legalName.value.trim().length > 0
  const hasAddress = tradingAddress.value.line1 && 
                    tradingAddress.value.city && 
                    tradingAddress.value.postcode
  
  return hasLegalName && hasAddress
})

// Methods
const updateLegalName = () => {
  formStore.businessInfo.legalName = legalName.value
  formStore.touch()
}

const updateTradingName = () => {
  formStore.businessInfo.tradingName = tradingName.value
  formStore.touch()
}

const updateAddress = () => {
  formStore.setTradingAddress(tradingAddress.value)
  formStore.touch()
}

const updateVatRegistered = () => {
  formStore.businessInfo.vatRegistered = vatRegistered.value
  formStore.touch()
}

const handlePostcodeInput = () => {
  postcodeError.value = ''
  addressError.value = ''
  
  // Reset addresses when postcode changes
  if (addresses.value.length > 0) {
    addresses.value = []
    selectedAddressIndex.value = -1
  }
}

const lookupAddresses = async () => {
  if (!isValidPostcode.value) {
    postcodeError.value = 'Please enter a valid UK postcode'
    return
  }

  isLoadingAddresses.value = true
  postcodeError.value = ''
  addressError.value = ''

  try {
    const result = await addressService.getAddresses(postcodeLookup.value)
    
    if (result.success) {
      addresses.value = result.data.addresses
      selectedAddressIndex.value = -1
      showManualEntry.value = false
      
      // Keep the original postcode used for lookup
      tradingAddress.value.postcode = addressService.formatPostcode(postcodeLookup.value)
      updateAddress()
    } else {
      addressError.value = result.error
      addresses.value = []
    }
  } catch (err) {
    addressError.value = 'Address lookup failed. Please try again.'
    console.error('Address lookup error:', err)
  } finally {
    isLoadingAddresses.value = false
  }
}

const selectAddress = (index) => {
  if (index >= 0 && index < addresses.value.length) {
    const selectedAddress = addresses.value[index]
    console.log('Selected address:', selectedAddress)
    
    tradingAddress.value = {
      line1: selectedAddress.line1 || '',
      line2: selectedAddress.line2 || '',
      city: selectedAddress.city || '',
      county: selectedAddress.county || '',
      postcode: selectedAddress.postcode || addressService.formatPostcode(postcodeLookup.value) || 'SW1A 1AA',
      country: 'UK'
    }
    
    console.log('Updated trading address:', tradingAddress.value)
    selectedAddressIndex.value = index
    updateAddress()
  }
}

// Auto-populate legal name based on business type and principals
const autoPopulateLegalName = () => {
  if (businessType.value === 'sole_trader' && formStore.principals.length > 0) {
    const principal = formStore.principals[0]
    if (principal.firstName || principal.lastName) {
      legalName.value = `${principal.firstName} ${principal.lastName}`.trim()
      updateLegalName()
    }
  } else if (businessType.value === 'partnership' && formStore.principals.length >= 2) {
    const names = formStore.principals
      .slice(0, 2)
      .map(p => `${p.firstName} ${p.lastName}`.trim())
      .filter(n => n)
    if (names.length >= 2) {
      legalName.value = names.join(' & ')
      updateLegalName()
    }
  } else if (businessType.value === 'ltd' && companyDetails.value) {
    legalName.value = companyDetails.value.company_name
    updateLegalName()
  }
}

// Watchers
watch(isStepValid, (newValue) => {
  uiStore.setStepValid(3, newValue)
})

watch([() => formStore.principals, businessType, companyDetails], () => {
  autoPopulateLegalName()
}, { deep: true })

// Show validation errors after user tries to proceed
watch(() => uiStore.currentStep, (newStep, oldStep) => {
  if (oldStep === 3 && newStep !== 3) {
    showValidation.value = true
  }
})

// Initialize
onMounted(() => {
  autoPopulateLegalName()
  uiStore.setStepValid(3, isStepValid.value)
})
</script>
