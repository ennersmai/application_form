<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Additional Information</h2>
      <p class="text-gray-600">
        Provide any additional information you'd like us to know about this application.
        This is optional but can help us process your application more effectively.
      </p>
    </div>

    <!-- Additional Notes -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
      
      <div class="space-y-4">
        <div>
          <label for="additionalNotes" class="block text-sm font-medium text-gray-700 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            id="additionalNotes"
            v-model="formStore.additionalInfo.notes"
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter any additional information that might be helpful for processing this application..."
          ></textarea>
          <p class="mt-2 text-sm text-gray-500">
            You can include special requirements, timeline considerations, or any other relevant details.
          </p>
        </div>
      </div>
    </div>

    <!-- Multiple Outlets Section -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Multiple Outlets</h3>
          <p class="text-sm text-gray-600 mt-1">
            Add additional outlets that share the same legal business information but have different trading addresses and equipment requirements.
          </p>
        </div>
        <button
          @click="addOutlet"
          type="button"
          class="inline-flex items-center px-3 py-2 border border-primary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Outlet
        </button>
      </div>

      <!-- Outlets List -->
      <div v-if="formStore.outlets.length > 0" class="space-y-4">
        <div
          v-for="outlet in formStore.outlets"
          :key="outlet.id"
          class="border border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-md font-medium text-gray-900">Outlet {{ outlet.id }}</h4>
            <button
              @click="removeOutlet(outlet.id)"
              type="button"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Trading Name -->
            <div class="md:col-span-2">
              <label :for="'outlet-trading-name-' + outlet.id" class="block text-sm font-medium text-gray-700 mb-1">
                Trading Name (Optional)
              </label>
              <input
                :id="'outlet-trading-name-' + outlet.id"
                v-model="outlet.tradingName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter trading name for this outlet (if different)"
              />
            </div>

            <!-- Trading Address -->
            <div class="md:col-span-2">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Trading Address</h5>
              
              <!-- Address Line 1 -->
              <div class="mb-2">
                <input
                  v-model="outlet.tradingAddress.line1"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Address Line 1"
                  required
                />
              </div>

              <!-- Address Line 2 -->
              <div class="mb-2">
                <input
                  v-model="outlet.tradingAddress.line2"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Address Line 2 (Optional)"
                />
              </div>

              <!-- City, County, Postcode -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  v-model="outlet.tradingAddress.city"
                  type="text"
                  class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City"
                  required
                />
                <input
                  v-model="outlet.tradingAddress.county"
                  type="text"
                  class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="County"
                />
                <input
                  v-model="outlet.tradingAddress.postcode"
                  type="text"
                  class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Postcode"
                  required
                />
              </div>
            </div>

            <!-- Equipment Requirements -->
            <div class="md:col-span-2">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Equipment Requirements</h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="equipment in equipmentData"
                  :key="equipment.id"
                  class="border border-gray-200 rounded-lg p-3 bg-white"
                >
                  <h6 class="font-medium text-gray-900 text-sm mb-2">{{ equipment.name }}</h6>
                  
                  <!-- Quantity -->
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div class="flex rounded-md shadow-sm border border-gray-300">
                      <button
                        type="button"
                        @click="decrementOutletQuantity(outlet.id, equipment.id)"
                        class="px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-r border-gray-300 rounded-l-md min-h-[44px]"
                      >
                        <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        v-model.number="getOutletDevice(outlet, equipment.id).quantity"
                        type="number"
                        min="0"
                        class="flex-1 min-w-0 px-3 py-3 border-0 text-center focus:outline-none focus:ring-0 text-base outlet-quantity-input"
                        @input="updateOutletPricing(outlet.id, equipment.id)"
                      />
                      <button
                        type="button"
                        @click="incrementOutletQuantity(outlet.id, equipment.id)"
                        class="px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-l border-gray-300 rounded-r-md min-h-[44px]"
                      >
                        <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Contract Type (if quantity > 0) -->
                  <div v-if="hasDeviceQuantity(outlet, equipment.id)" class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                    <select
                      v-model="getOutletDevice(outlet, equipment.id).contractType"
                      class="w-full px-3 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      @change="updateOutletPricing(outlet.id, equipment.id)"
                    >
                      <option v-for="option in getDeviceOptions(equipment.id)" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Monthly Price (if quantity > 0) -->
                  <div v-if="hasDeviceQuantity(outlet, equipment.id)" class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Price</label>
                    <select
                      v-model.number="getOutletDevice(outlet, equipment.id).monthlyPrice"
                      class="w-full px-3 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      @change="updateOutletPricing(outlet.id, equipment.id)"
                    >
                      <option value="">Select price</option>
                      <option v-for="price in getPriceOptions(equipment.id, getOutletDevice(outlet, equipment.id).contractType)" :key="price" :value="price">
                        £{{ price.toFixed(2) }}{{ getOutletDevice(outlet, equipment.id).contractType === 'purchase' ? ' (one-time)' : '/month' }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Outlet Total Cost -->
              <div v-if="getOutletMonthlyCost(outlet.id) > 0" class="mt-4 p-3 bg-blue-50 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-blue-900">Outlet {{ outlet.id }} Monthly Cost:</span>
                  <span class="text-sm font-bold text-blue-900">£{{ getOutletMonthlyCost(outlet.id).toFixed(2) }}/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0h2a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2z"></path>
        </svg>
        <p class="text-sm">No additional outlets added.</p>
        <p class="text-xs text-gray-400 mt-1">Click "Add Outlet" to add multiple locations with different equipment requirements.</p>
      </div>
    </div>

    <!-- Total Summary for All Outlets -->
    <div v-if="formStore.outlets.length > 0 && getTotalOutletCost() > 0" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 class="text-lg font-medium text-green-900 mb-2">Additional Outlets Summary</h3>
      <div class="space-y-1 text-sm">
        <div v-for="outlet in formStore.outlets" :key="outlet.id" class="flex justify-between">
          <span class="text-green-700">Outlet {{ outlet.id }}:</span>
          <span class="font-medium text-green-900">£{{ getOutletMonthlyCost(outlet.id).toFixed(2) }}/month</span>
        </div>
        <div class="border-t border-green-200 pt-2 flex justify-between font-bold">
          <span class="text-green-800">Total Additional Outlets Cost:</span>
          <span class="text-green-900">£{{ getTotalOutletCost().toFixed(2) }}/month</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { equipmentData } from '@/data/equipmentData'

const formStore = useFormStore()
const uiStore = useUiStore()

// This step is always valid since everything is optional
const isStepValid = computed(() => true)

// Helper function to check if device has quantity
const hasDeviceQuantity = (outlet, equipmentId) => {
  const device = getOutletDevice(outlet, equipmentId)
  return device && device.quantity > 0
}

// Methods
const addOutlet = () => {
  formStore.addOutlet()
}

const removeOutlet = (id) => {
  formStore.removeOutlet(id)
}

const getOutletDevice = (outlet, equipmentId) => {
  if (!outlet.devicePricing) {
    outlet.devicePricing = {}
  }
  if (!outlet.devicePricing[equipmentId]) {
    // Use Vue's reactivity system to ensure the object is reactive
    outlet.devicePricing[equipmentId] = reactive({
      quantity: 0,
      monthlyPrice: null,
      contractType: null
    })
  }
  return outlet.devicePricing[equipmentId]
}

// Device configurations matching Step5Pricing
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
    options: [
      { value: 'purchase', label: 'Upfront Purchase' }
    ]
  },
  'clover-cash-drawer': {
    defaultPrice: 40.00,
    options: [
      { value: 'purchase', label: 'Upfront Purchase' }
    ]
  }
}

const getDeviceOptions = (equipmentId) => {
  const config = deviceConfigurations[equipmentId]
  return config?.options || [{ value: 'standard', label: 'Standard Contract' }]
}

const getPriceOptions = (deviceId, contractType) => {
  const config = deviceConfigurations[deviceId]
  if (!config || !contractType) return []
  
  if (contractType === 'purchase') {
    return [config.defaultPrice]
  }
  
  // Generate price range for rental contracts
  const prices = []
  const min = config.minPrice
  const max = config.maxPrice
  
  if (min && max) {
    for (let price = min; price <= max; price++) {
      prices.push(price)
    }
  }
  return prices
}

const incrementOutletQuantity = (outletId, equipmentId) => {
  const device = getOutletDevice(formStore.outlets.find(o => o.id === outletId), equipmentId)
  device.quantity = (device.quantity || 0) + 1
  updateOutletPricing(outletId, equipmentId)
}

const decrementOutletQuantity = (outletId, equipmentId) => {
  const device = getOutletDevice(formStore.outlets.find(o => o.id === outletId), equipmentId)
  device.quantity = Math.max(0, (device.quantity || 0) - 1)
  updateOutletPricing(outletId, equipmentId)
}

const updateOutletPricing = (outletId, equipmentId) => {
  const outlet = formStore.outlets.find(o => o.id === outletId)
  if (!outlet) return
  
  // Ensure device pricing exists and is reactive
  const device = getOutletDevice(outlet, equipmentId)
  const config = deviceConfigurations[equipmentId]
  
  if (device.quantity > 0) {
    // Set default contract type if not set
    if (!device.contractType && config) {
      device.contractType = config.options[0].value
    }
    
    // Set default price if not set
    if ((!device.monthlyPrice || device.monthlyPrice === null) && config && device.contractType) {
      device.monthlyPrice = config.defaultPrice
    }
  } else {
    // Reset if quantity is 0
    device.monthlyPrice = null
    device.contractType = null
  }
  
  // Update total cost for outlet
  outlet.totalMonthlyCost = getOutletMonthlyCost(outletId)
}

const getOutletMonthlyCost = (outletId) => {
  const outlet = formStore.outlets.find(o => o.id === outletId)
  if (!outlet) return 0
  
  let total = 0
  Object.entries(outlet.devicePricing || {}).forEach(([deviceId, pricing]) => {
    if (pricing.quantity > 0 && pricing.monthlyPrice) {
      total += pricing.quantity * pricing.monthlyPrice
    }
  })
  
  return total
}

const getTotalOutletCost = () => {
  return formStore.outlets.reduce((total, outlet) => total + getOutletMonthlyCost(outlet.id), 0)
}

// Initialize validation
uiStore.setStepValid(7, isStepValid.value)
</script>

<style scoped>
/* Hide number input spinners on ALL devices and browsers */
.outlet-quantity-input {
  appearance: textfield;
  -moz-appearance: textfield;
  -webkit-appearance: none;
}

.outlet-quantity-input::-webkit-outer-spin-button,
.outlet-quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
  display: none;
}

.outlet-quantity-input::-moz-outer-spin-button,
.outlet-quantity-input::-moz-inner-spin-button {
  -moz-appearance: none;
  margin: 0;
  display: none;
}

/* Firefox specific */
input[type="number"].outlet-quantity-input {
  -moz-appearance: textfield;
}

/* Ensure no spinners show anywhere */
input[type="number"].outlet-quantity-input::-webkit-outer-spin-button,
input[type="number"].outlet-quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
  display: none;
}
</style>
