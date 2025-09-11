<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Equipment Pricing</h2>
      <p class="text-gray-600">Select equipment and set monthly pricing for this merchant.</p>
    </div>

    <!-- Equipment Pricing List -->
    <div class="space-y-4">
      <div 
        v-for="device in availableDevices" 
        :key="device.id"
        class="bg-white border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start space-x-4">
          <!-- Device Image -->
          <div class="flex-shrink-0">
            <img
              :src="device.image"
              :alt="device.name"
              class="h-16 w-16 object-contain rounded-lg"
              @error="handleImageError($event, device.id)"
            />
          </div>

          <!-- Device Details -->
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900">{{ device.name }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ device.description }}</p>
            
            <!-- Quantity and Pricing Controls -->
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Quantity -->
              <div>
                <label :for="`quantity-${device.id}`" class="block text-xs font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm">
                  <button
                    type="button"
                    @click="decrementQuantity(device.id)"
                    class="px-3 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-r border-gray-300 rounded-l-md"
                    :disabled="getDeviceQuantity(device.id) <= 0"
                  >
                    <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    :id="`quantity-${device.id}`"
                    v-model.number="devicePricing[device.id].quantity"
                    type="number"
                    min="0"
                    class="flex-1 min-w-0 px-3 py-2 border-0 text-center focus:outline-none focus:ring-0 text-base"
                    @input="updateDevicePricing(device.id)"
                  />
                  <button
                    type="button"
                    @click="incrementQuantity(device.id)"
                    class="px-3 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-l border-gray-300 rounded-r-md"
                  >
                    <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Contract Type -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Contract Type
                </label>
                <select
                  v-model="devicePricing[device.id].contractType"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base"
                  @change="updateDevicePricing(device.id)"
                  :disabled="getDeviceQuantity(device.id) === 0"
                >
                  <option v-for="option in getDeviceOptions(device)" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- Monthly Price -->
              <div>
                <label :for="`price-${device.id}`" class="block text-xs font-medium text-gray-700 mb-1">
                  Price per month
                </label>
                <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm">
                  <div class="px-2 py-2 bg-gray-100 border-r border-gray-300 rounded-l-md flex items-center text-gray-700 text-sm">
                    £
                  </div>
                  <input
                    :id="`price-${device.id}`"
                    v-model.number="devicePricing[device.id].monthlyPrice"
                    type="number"
                    :min="getDeviceMinPrice(device.id)"
                    :max="getDeviceMaxPrice(device.id)"
                    step="0.01"
                    class="flex-1 min-w-0 px-3 py-2 border-0 text-center focus:outline-none focus:ring-0 text-base"
                    :placeholder="getDeviceDefaultPrice(device.id).toString()"
                    @input="updateDevicePricing(device.id)"
                    :disabled="getDeviceQuantity(device.id) === 0 || isUpfrontPurchase(device.id)"
                  />
                </div>
                <p v-if="!isUpfrontPurchase(device.id)" class="text-xs text-gray-500 mt-1">
                  Range: £{{ getDeviceMinPrice(device.id) }} - £{{ getDeviceMaxPrice(device.id) }}
                </p>
                <p v-else class="text-xs text-gray-500 mt-1">
                  One-time purchase: £{{ getDeviceDefaultPrice(device.id) }}
                </p>
              </div>
            </div>

            <!-- Device Total -->
            <div v-if="getDeviceQuantity(device.id) > 0" class="mt-2 text-sm text-gray-600">
              <span v-if="isUpfrontPurchase(device.id)">
                Total: <span class="font-medium text-gray-900">£{{ getDeviceTotal(device.id).toFixed(2) }}</span> (One-time)
              </span>
              <span v-else>
                Total: <span class="font-medium text-gray-900">£{{ getDeviceTotal(device.id).toFixed(2) }}</span>/month
              </span>
              <span v-if="devicePricing[device.id].contractType === 'promo'" class="text-xs text-green-600 ml-1">(6 months @ £1)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Summary -->
    <div v-if="hasSelectedDevices" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800 mb-3">Monthly Pricing Summary</h3>
      
      <!-- Selected Devices -->
      <div class="space-y-2 mb-3">
        <div 
          v-for="device in selectedDevices" 
          :key="device.id"
          class="flex justify-between text-sm"
        >
          <span class="text-blue-700">
            {{ device.name }} ({{ devicePricing[device.id].quantity }}x @ £{{ devicePricing[device.id].monthlyPrice.toFixed(2) }})
            <span v-if="devicePricing[device.id].contractType === 'promo'" class="text-xs">[6mo@£1]</span>
            <span v-if="isUpfrontPurchase(device.id)" class="text-xs">[One-time]</span>
          </span>
          <span class="font-medium text-blue-900">£{{ getDeviceTotal(device.id).toFixed(2) }}</span>
        </div>
      </div>
      
      <!-- Total -->
      <div class="pt-3 border-t border-blue-300">
        <div class="flex justify-between">
          <span class="text-base font-medium text-blue-800">Total Monthly Cost:</span>
          <span class="text-base font-bold text-blue-900">£{{ totalMonthlyCost.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- No Selection Warning -->
    <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-yellow-800">No Equipment Selected</h3>
          <p class="text-sm text-yellow-700 mt-1">Please select at least one device and set its pricing to continue.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { equipmentData } from '@/data/equipmentData'

const formStore = useFormStore()
const uiStore = useUiStore()

// Include all equipment devices for pricing
const availableDevices = computed(() => equipmentData)

// Initialize device pricing
const devicePricing = reactive({})

// Device pricing configurations based on client specifications
const deviceConfigurations = {
  'clover-flex': {
    defaultPrice: 25.00,
    minPrice: 13,
    maxPrice: 30,
    options: [
      { value: 'standard', label: '48 Month Contract' },
      { value: 'promo', label: '48 Month - 6 months at £1pm' }
    ]
  },
  'clover-mini': {
    defaultPrice: 25.00,
    minPrice: 13,
    maxPrice: 30,
    options: [
      { value: 'standard', label: '48 Month Contract' },
      { value: 'promo', label: '48 Month - 6 months at £1pm' }
    ]
  },
  'clover-station-duo': {
    defaultPrice: 40.00,
    minPrice: 30,
    maxPrice: 50,
    options: [
      { value: 'standard', label: '48 Month Contract' },
      { value: 'promo', label: '48 Month - 6 months at £1pm' }
    ]
  },
  'clover-kitchen-printer': {
    defaultPrice: 252.99,
    minPrice: 252.99,
    maxPrice: 252.99,
    options: [
      { value: 'purchase', label: 'Upfront Purchase' }
    ]
  },
  'clover-cash-drawer': {
    defaultPrice: 40.00,
    minPrice: 40.00,
    maxPrice: 40.00,
    options: [
      { value: 'purchase', label: 'Upfront Purchase' }
    ]
  }
}

availableDevices.value.forEach(device => {
  const existing = formStore.pricing.devicePricing?.[device.id]
  const config = deviceConfigurations[device.id]
  
  devicePricing[device.id] = {
    quantity: existing?.quantity || 0,
    monthlyPrice: existing?.monthlyPrice || config?.defaultPrice || 0,
    contractType: existing?.contractType || config?.options?.[0]?.value || 'standard'
  }
})

// Computed properties
const selectedDevices = computed(() => 
  availableDevices.value.filter(device => devicePricing[device.id].quantity > 0)
)

const hasSelectedDevices = computed(() => selectedDevices.value.length > 0)

const totalMonthlyCost = computed(() => {
  return selectedDevices.value.reduce((total, device) => {
    return total + getDeviceTotal(device.id)
  }, 0)
})

const isStepValid = computed(() => {
  return hasSelectedDevices.value && totalMonthlyCost.value > 0
})

// Methods
const getDeviceQuantity = (deviceId) => {
  return devicePricing[deviceId]?.quantity || 0
}

const getDeviceTotal = (deviceId) => {
  const pricing = devicePricing[deviceId]
  if (!pricing || pricing.quantity === 0) return 0
  return pricing.quantity * pricing.monthlyPrice
}

const getDeviceOptions = (device) => {
  const config = deviceConfigurations[device.id]
  return config?.options || [{ value: 'standard', label: 'Standard Contract' }]
}

const getDeviceDefaultPrice = (deviceId) => {
  const config = deviceConfigurations[deviceId]
  return config?.defaultPrice || 0
}

const getDeviceMinPrice = (deviceId) => {
  const config = deviceConfigurations[deviceId]
  return config?.minPrice || 0
}

const getDeviceMaxPrice = (deviceId) => {
  const config = deviceConfigurations[deviceId]
  return config?.maxPrice || 999
}

const isUpfrontPurchase = (deviceId) => {
  const pricing = devicePricing[deviceId]
  return pricing?.contractType === 'purchase'
}

const incrementQuantity = (deviceId) => {
  devicePricing[deviceId].quantity++
  updateDevicePricing(deviceId)
}

const decrementQuantity = (deviceId) => {
  if (devicePricing[deviceId].quantity > 0) {
    devicePricing[deviceId].quantity--
    updateDevicePricing(deviceId)
  }
}

const handleImageError = (event, deviceId) => {
  console.error(`Failed to load image for device ${deviceId}`)
  // Placeholder image
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMjAgMjBINDRDNDUuMTA0NiAyMCA0NiAyMC44OTU0IDQ2IDIyVjQyQzQ2IDQzLjEwNDYgNDUuMTA0NiA0NCA0NCA0NEgyMEMxOC44OTU0IDQ0IDE4IDQzLjEwNDYgMTggNDJWMjJDMTggMjAuODk1NCAxOC44OTU0IDIwIDIwIDIwWiIgc3Ryb2tlPSIjOUIzMkI0IiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTI2IDM0TDMwIDMwTDM2IDM2TDQwIDMyIiBzdHJva2U9IiM5QjMyQjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg=='
}

const updateDevicePricing = (deviceId) => {
  // Update form store
  if (!formStore.pricing.devicePricing) {
    formStore.pricing.devicePricing = {}
  }
  
  formStore.pricing.devicePricing[deviceId] = {
    quantity: devicePricing[deviceId].quantity,
    monthlyPrice: devicePricing[deviceId].monthlyPrice,
    contractType: devicePricing[deviceId].contractType
  }
  
  // Update legacy pricing fields for compatibility
  formStore.pricing.totalMonthlyCost = totalMonthlyCost.value
  formStore.touch()
}

// Watchers
watch(isStepValid, (newValue) => {
  uiStore.setStepValid(5, newValue)
})

// Initialize validation
uiStore.setStepValid(5, isStepValid.value)
</script>

<style scoped>
/* Hide default number input arrows/spinners */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}
</style>