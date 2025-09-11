<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Review & Submit</h2>
      <p class="text-gray-600">Please review all information before submitting your merchant application.</p>
    </div>

    <!-- Agent Information -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium text-gray-900">Agent Information</h3>
        <button
          @click="editSection(1)"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Agent Name:</span>
          <span class="font-medium ml-2">{{ formStore.agentInfo.name }}</span>
        </div>
        <div>
          <span class="text-gray-600">Agent Email:</span>
          <span class="font-medium ml-2">{{ formStore.agentInfo.email }}</span>
        </div>
        <div class="md:col-span-2">
          <span class="text-gray-600">Urgent Processing:</span>
          <span class="font-medium ml-2">
            {{ formStore.agentInfo.isUrgent ? 'Yes (+£20.00)' : 'No' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Business Type -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium text-gray-900">Business Type</h3>
        <button
          @click="editSection(0)"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div class="text-sm space-y-2">
        <div>
          <span class="text-gray-600">Type:</span>
          <span class="font-medium ml-2">{{ businessTypeDisplay }}</span>
        </div>
        <div v-if="formStore.businessTypeCheck.companyDetails">
          <span class="text-gray-600">Company Number:</span>
          <span class="font-medium ml-2">{{ formStore.businessTypeCheck.companyDetails.company_number }}</span>
        </div>
        <div v-if="formStore.businessTypeCheck.directorsVerified">
          <span class="text-green-600">✓</span>
          <span class="text-green-700 ml-1">Directors verified</span>
        </div>
      </div>
    </div>

    <!-- Principal Information -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium text-gray-900">Principal Information</h3>
        <button
          @click="editSection(2)"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(principal, index) in formStore.principals"
          :key="principal.id"
          class="border border-gray-100 rounded p-3"
        >
          <h4 class="font-medium text-gray-900 mb-2">Principal {{ index + 1 }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-600">Name:</span>
              <span class="font-medium ml-2">{{ principal.firstName }} {{ principal.lastName }}</span>
            </div>
            <div>
              <span class="text-gray-600">Email:</span>
              <span class="font-medium ml-2">{{ principal.email }}</span>
            </div>
            <div>
              <span class="text-gray-600">Phone:</span>
              <span class="font-medium ml-2">{{ principal.phone }}</span>
            </div>
            <div>
              <span class="text-gray-600">Position:</span>
              <span class="font-medium ml-2">{{ formatPosition(principal.position) }}</span>
            </div>
            <div class="md:col-span-2">
              <span class="text-gray-600">Ownership:</span>
              <span class="font-medium ml-2">{{ principal.ownershipPercentage }}%</span>
              <span v-if="principal.ownershipPercentage > 25" class="text-orange-600 ml-2 text-xs">
                (Beneficial Owner)
              </span>
            </div>
            <div v-if="principal.homeAddress" class="md:col-span-2">
              <span class="text-gray-600">Home Address:</span>
              <span class="font-medium ml-2">{{ formatAddress(principal.homeAddress) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Business Information -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium text-gray-900">Business Information</h3>
        <button
          @click="editSection(3)"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Legal Name:</span>
          <span class="font-medium ml-2">{{ formStore.businessInfo.legalName }}</span>
        </div>
        <div v-if="formStore.businessInfo.tradingName">
          <span class="text-gray-600">Trading Name:</span>
          <span class="font-medium ml-2">{{ formStore.businessInfo.tradingName }}</span>
        </div>
        <div class="md:col-span-2">
          <span class="text-gray-600">Trading Address:</span>
          <div class="font-medium ml-2 mt-1">
            {{ formatAddress(formStore.businessInfo.tradingAddress) }}
          </div>
        </div>
        <div>
          <span class="text-gray-600">VAT Registered:</span>
          <span class="font-medium ml-2">{{ formStore.businessInfo.vatRegistered ? 'Yes' : 'No' }}</span>
        </div>
      </div>
    </div>

    <!-- Trading Information -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium text-gray-900">Trading Information</h3>
        <button
          @click="editSection(4)"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div class="md:col-span-2">
          <span class="text-gray-600">Business Type:</span>
          <span class="font-medium ml-2">{{ formStore.tradingInfo.mccCode }} - {{ formStore.tradingInfo.mccDescription }}</span>
        </div>
        <div>
          <span class="text-gray-600">American Express:</span>
          <span class="font-medium ml-2">{{ formStore.tradingInfo.amexRequired ? 'Required' : 'Not Required' }}</span>
        </div>
        <div>
          <span class="text-gray-600">Annual Turnover:</span>
          <span class="font-medium ml-2">£{{ formStore.tradingInfo.projectedAnnualTurnover?.toLocaleString() || '0' }}</span>
        </div>
        <div>
          <span class="text-gray-600">Average Transaction:</span>
          <span class="font-medium ml-2">£{{ formStore.tradingInfo.estimatedAverageTransaction || '0' }}</span>
        </div>
      </div>
    </div>

    <!-- Pricing -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium text-gray-900">Equipment Pricing</h3>
        <button
          @click="editSection(5)"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div v-if="selectedPricingDevices.length > 0" class="space-y-2">
        <div
          v-for="device in selectedPricingDevices"
          :key="device.id"
          class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
        >
          <div>
            <span class="font-medium">{{ device.name }}</span>
            <span v-if="device.contractType === 'purchase'" class="text-gray-600 ml-2">({{ device.quantity }}x @ £{{ (device.monthlyPrice || 0).toFixed(2) }} one-time)</span>
            <span v-else class="text-gray-600 ml-2">({{ device.quantity }}x @ £{{ (device.monthlyPrice || 0).toFixed(2) }}/month)</span>
            <span v-if="device.contractType === 'promo'" class="text-xs text-green-600 ml-1">[6 months @ £1]</span>
          </div>
          <span class="font-medium">£{{ (device.totalMonthly || 0).toFixed(2) }}/month</span>
        </div>
        <div class="border-t border-gray-200 pt-2 flex justify-between font-medium">
          <span>Total Monthly Cost:</span>
          <span>£{{ totalMonthlyCost.toFixed(2) }}/month</span>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">No pricing configured</div>
    </div>


    <!-- Banking Details -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium text-gray-900">Banking Details</h3>
        <button
          @click="editSection(6)"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Account Name:</span>
          <span class="font-medium ml-2">{{ formStore.banking.accountName }}</span>
        </div>
        <div>
          <span class="text-gray-600">Sort Code:</span>
          <span class="font-medium ml-2">{{ formatSortCode(formStore.banking.sortCode) }}</span>
        </div>
        <div>
          <span class="text-gray-600">Account Number:</span>
          <span class="font-medium ml-2">{{ formStore.banking.accountNumber }}</span>
        </div>
      </div>
    </div>

    <!-- Total Summary -->
    <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <h3 class="text-lg font-medium text-primary-900 mb-3">Application Summary</h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-primary-700">Monthly Equipment Cost:</span>
          <span class="font-medium text-primary-900">£{{ totalMonthlyCost.toFixed(2) }}/month</span>
        </div>
        <div v-if="formStore.agentInfo.isUrgent" class="flex justify-between">
          <span class="text-primary-700">Urgent Processing Fee:</span>
          <span class="font-medium text-primary-900">£20.00</span>
        </div>
        <div class="border-t border-primary-200 pt-2 flex justify-between font-bold text-base">
          <span class="text-primary-800">Total Monthly Cost:</span>
          <span class="text-primary-900">£{{ totalFees.toFixed(2) }}/month</span>
        </div>
      </div>
    </div>

    <!-- Confirmation Checkbox -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <label class="flex items-start cursor-pointer">
        <input
          v-model="confirmationChecked"
          type="checkbox"
          required
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
          @change="updateConfirmation"
        />
        <div class="ml-3">
          <div class="text-sm font-medium text-gray-900">
            I confirm the information provided is accurate
          </div>
          <div class="text-xs text-gray-600 mt-1">
            By checking this box, you confirm that all information provided in this application is accurate and complete.
            You understand that providing false information may result in application rejection or account termination.
          </div>
        </div>
      </label>
    </div>

    <!-- Application ID Display -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-blue-800 mb-1">Application Reference</h3>
          <p class="text-sm text-blue-700 font-mono">{{ formStore.applicationId }}</p>
          <p class="text-xs text-blue-600 mt-1">Save this reference number for your records</p>
        </div>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="!isStepValid && showValidation" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Please Complete Required Fields</h3>
          <p class="text-sm text-red-700 mt-1">You must confirm that the information provided is accurate before submitting.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { equipmentData } from '@/data/equipmentData'

const formStore = useFormStore()
const uiStore = useUiStore()

// Local reactive data
const confirmationChecked = ref(false)
const showValidation = ref(false)

// Computed properties
const businessTypeDisplay = computed(() => {
  switch (formStore.businessTypeCheck.type) {
    case 'sole_trader': return 'Sole Trader'
    case 'limited_company': return 'Limited Company'
    case 'partnership': return 'Partnership'
    default: return 'Unknown'
  }
})

const selectedPricingDevices = computed(() => {
  const devicePricing = formStore.pricing.devicePricing || {}
  const devices = []
  
  Object.entries(devicePricing).forEach(([deviceId, pricing]) => {
    if (pricing.quantity > 0) {
      const equipmentItem = equipmentData.find(item => item.id === deviceId)
      if (equipmentItem) {
        devices.push({
          id: deviceId,
          name: equipmentItem.name,
          quantity: pricing.quantity,
          monthlyPrice: pricing.monthlyPrice,
          contractType: pricing.contractType,
          totalMonthly: pricing.quantity * pricing.monthlyPrice
        })
      }
    }
  })
  
  return devices
})

const totalMonthlyCost = computed(() => {
  return selectedPricingDevices.value.reduce((total, device) => {
    return total + device.totalMonthly
  }, 0)
})

const totalFees = computed(() => {
  let total = totalMonthlyCost.value
  if (formStore.agentInfo.isUrgent) {
    total += 20.00
  }
  return total
})

const isStepValid = computed(() => {
  return confirmationChecked.value
})

// Methods
const editSection = (stepNumber) => {
  uiStore.goToStep(stepNumber)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatPosition = (position) => {
  const positions = {
    sole_trader: 'Sole Trader',
    director: 'Director',
    ultimate_owner: 'Director/Ultimate Owner',
    partner: 'Partner'
  }
  return positions[position] || position
}

const formatAddress = (address) => {
  if (!address) return 'No address provided'
  
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.county,
    address.postcode
  ].filter(part => part && part.trim())
  
  return parts.join(', ')
}

const formatSortCode = (sortCode) => {
  if (!sortCode) return ''
  const cleaned = sortCode.replace(/\D/g, '')
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`
  }
  return sortCode
}

const updateConfirmation = () => {
  // Update validation when confirmation changes
  uiStore.setStepValid(7, isStepValid.value)
}

// Watchers
watch(isStepValid, (newValue) => {
  uiStore.setStepValid(7, newValue)
})

// Show validation errors after user tries to proceed
watch(() => uiStore.currentStep, (newStep, oldStep) => {
  if (oldStep === 7 && newStep !== 7) {
    showValidation.value = true
  }
})

// Initialize validation
uiStore.setStepValid(7, isStepValid.value)
</script>
