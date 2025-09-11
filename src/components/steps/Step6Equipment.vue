<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Equipment Selection</h2>
      <p class="text-gray-600">Choose the payment equipment that best fits your business needs.</p>
    </div>

    <!-- Equipment Category Filter -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="category in equipmentCategories"
        :key="category.id"
        @click="selectedCategory = category.id"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
        :class="selectedCategory === category.id 
          ? 'bg-primary-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Equipment Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="equipment in filteredEquipment"
        :key="equipment.id"
        class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Equipment Image -->
        <div class="h-48 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
          <img
            :src="equipment.image"
            :alt="equipment.name"
            class="max-w-full max-h-full object-contain"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <!-- Fallback if image fails to load -->
          <div v-if="imageErrors[equipment.id]" class="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div class="text-center">
              <svg class="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="text-xs text-gray-500">{{ equipment.name }}</p>
            </div>
          </div>
        </div>

        <!-- Equipment Info -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ equipment.name }}</h3>
          <p class="text-sm text-gray-600 mb-3">{{ equipment.description }}</p>

          <!-- Pricing Options -->
          <div class="space-y-3">
            <div
              v-for="option in equipment.options"
              :key="`${equipment.id}-${option.type}`"
              class="border border-gray-200 rounded-lg p-3"
            >
              <div class="flex items-start justify-between mb-2">
                <label class="flex items-center cursor-pointer">
                  <input
                    :value="`${equipment.id}-${option.type}`"
                    v-model="selectedEquipmentOptions[equipment.id]"
                    type="radio"
                    :name="`equipment-${equipment.id}`"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    @change="selectEquipmentOption(equipment, option)"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ option.description }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <span v-if="option.type === 'rental'">
                        £{{ option.price }}/month for {{ option.duration }} months
                      </span>
                      <span v-else-if="option.type === 'step_up'">
                        £{{ option.price }}/month then £{{ option.stepUpPrice }}/month
                      </span>
                      <span v-else>
                        £{{ option.price }} upfront purchase
                      </span>
                    </div>
                  </div>
                </label>
                <div class="text-right">
                  <div class="text-sm font-bold text-gray-900">
                    £{{ option.totalCost.toFixed(2) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ option.type === 'purchase' ? 'upfront' : 'total' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quantity Selector (if equipment is selected) -->
          <div v-if="selectedEquipmentOptions[equipment.id]" class="mt-4 pt-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">Quantity</label>
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  @click="decrementQuantity(equipment.id)"
                  :disabled="getEquipmentQuantity(equipment.id) <= 1"
                  class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="w-8 text-center font-medium">{{ getEquipmentQuantity(equipment.id) }}</span>
                <button
                  type="button"
                  @click="incrementQuantity(equipment.id)"
                  class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add-ons (for compatible equipment) -->
          <div v-if="selectedEquipmentOptions[equipment.id] && equipment.addOns?.length > 0" class="mt-4 pt-3 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Add-ons</h4>
            <div class="space-y-2">
              <label 
                v-for="addOn in equipment.addOns"
                :key="addOn.id"
                class="flex items-center"
              >
                <input
                  v-model="selectedAddOns[addOn.id]"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  @change="updateAddOns"
                />
                <span class="ml-2 text-sm text-gray-700">{{ addOn.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Add-ons -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-lg font-medium text-gray-900 mb-3">Additional Services</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="flex items-start">
          <input
            v-model="motoEnabled"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            @change="updateMoto"
          />
          <div class="ml-3">
            <div class="text-sm font-medium text-gray-900">MOTO (Mail Order/Telephone Order)</div>
            <div class="text-xs text-gray-600 mt-1">Accept payments over phone or mail</div>
          </div>
        </label>

        <label class="flex items-start">
          <input
            v-model="cashbackEnabled"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            @change="updateCashback"
          />
          <div class="ml-3">
            <div class="text-sm font-medium text-gray-900">Cashback Service</div>
            <div class="text-xs text-gray-600 mt-1">Allow customers to get cash back with purchases</div>
          </div>
        </label>
      </div>
    </div>

    <!-- Equipment Summary -->
    <div v-if="selectedEquipmentList.length > 0" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 class="text-lg font-medium text-gray-900 mb-3">Equipment Summary</h3>
      <div class="space-y-3">
        <div 
          v-for="item in selectedEquipmentList" 
          :key="item.equipmentId"
          class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
        >
          <div class="flex-1">
            <div class="font-medium text-gray-900">{{ item.name }}</div>
            <div class="text-sm text-gray-600">{{ item.optionDescription }}</div>
            <div class="text-xs text-gray-500">Quantity: {{ item.quantity }}</div>
          </div>
          <div class="text-right">
            <div class="font-bold text-gray-900">£{{ (item.totalCost * item.quantity).toFixed(2) }}</div>
            <button
              @click="removeEquipment(item.equipmentId)"
              class="text-xs text-red-600 hover:text-red-800 mt-1"
            >
              Remove
            </button>
          </div>
        </div>
        
        <div class="border-t border-gray-300 pt-3 flex justify-between items-center font-bold text-lg">
          <span>Total Equipment Cost:</span>
          <span class="text-primary-600">£{{ totalEquipmentCost.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- No Equipment Selected -->
    <div v-if="selectedEquipmentList.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No equipment selected</h3>
      <p class="mt-1 text-sm text-gray-500">Choose equipment options above to see pricing summary</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { equipmentData, equipmentCategories, availableAddOns } from '@/data/equipmentData'

const formStore = useFormStore()
const uiStore = useUiStore()

// Local reactive data
const selectedCategory = ref('all')
const selectedEquipmentOptions = ref({}) // { equipmentId: 'equipmentId-optionType' }
const equipmentQuantities = ref({}) // { equipmentId: quantity }
const selectedAddOns = ref({
  moto: formStore.equipment.motoEnabled,
  cashback: formStore.equipment.cashbackEnabled
})

const motoEnabled = ref(formStore.equipment.motoEnabled)
const cashbackEnabled = ref(formStore.equipment.cashbackEnabled)
const imageErrors = ref({})

// Computed properties
const filteredEquipment = computed(() => {
  if (selectedCategory.value === 'all') {
    return equipmentData
  }
  return equipmentData.filter(eq => eq.category === selectedCategory.value)
})

const selectedEquipmentList = computed(() => {
  const selected = []
  
  console.log('Computing selected equipment list...')
  console.log('Selected options:', selectedEquipmentOptions.value)
  console.log('Quantities:', equipmentQuantities.value)
  
  for (const [equipmentId, optionKey] of Object.entries(selectedEquipmentOptions.value)) {
    if (!optionKey) continue
    
    const equipment = equipmentData.find(eq => eq.id === equipmentId)
    // Fix: Get the option type from the end of the optionKey
    const optionType = optionKey.split('-').pop() // Gets the last part after splitting
    const option = equipment?.options.find(opt => opt.type === optionType)
    
    console.log('Processing:', { equipmentId, optionKey, optionType, equipment: !!equipment, option: !!option })
    
    if (equipment && option) {
      selected.push({
        equipmentId,
        name: equipment.name,
        optionDescription: option.description,
        totalCost: option.totalCost,
        quantity: equipmentQuantities.value[equipmentId] || 1,
        equipment,
        option
      })
    }
  }
  
  console.log('Final selected list:', selected)
  return selected
})

const totalEquipmentCost = computed(() => {
  return selectedEquipmentList.value.reduce((total, item) => {
    return total + (item.totalCost * item.quantity)
  }, 0)
})

const isStepValid = computed(() => {
  // Equipment selection is optional, so step is always valid
  // But we could add business rules here if needed
  return true
})

// Methods
const selectEquipmentOption = (equipment, option) => {
  console.log('Selecting equipment:', equipment.name, 'Option:', option.type)
  
  // Set the selected option
  selectedEquipmentOptions.value[equipment.id] = `${equipment.id}-${option.type}`
  
  // Initialize quantity if not set
  if (!equipmentQuantities.value[equipment.id]) {
    equipmentQuantities.value[equipment.id] = 1
  }
  
  console.log('Selected equipment options:', selectedEquipmentOptions.value)
  console.log('Selected equipment list:', selectedEquipmentList.value)
  
  updateFormStore()
}

const getEquipmentQuantity = (equipmentId) => {
  return equipmentQuantities.value[equipmentId] || 1
}

const incrementQuantity = (equipmentId) => {
  equipmentQuantities.value[equipmentId] = (equipmentQuantities.value[equipmentId] || 1) + 1
  updateFormStore()
}

const decrementQuantity = (equipmentId) => {
  const current = equipmentQuantities.value[equipmentId] || 1
  if (current > 1) {
    equipmentQuantities.value[equipmentId] = current - 1
    updateFormStore()
  }
}

const removeEquipment = (equipmentId) => {
  delete selectedEquipmentOptions.value[equipmentId]
  delete equipmentQuantities.value[equipmentId]
  updateFormStore()
}

const updateMoto = () => {
  formStore.equipment.motoEnabled = motoEnabled.value
  updateFormStore()
}

const updateCashback = () => {
  formStore.equipment.cashbackEnabled = cashbackEnabled.value
  updateFormStore()
}

const updateAddOns = () => {
  // Update form store with selected add-ons
  updateFormStore()
}

const handleImageError = (event) => {
  const img = event.target
  const equipmentId = img.alt.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  imageErrors.value[equipmentId] = true
}

const handleImageLoad = (event) => {
  const img = event.target
  const equipmentId = img.alt.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  imageErrors.value[equipmentId] = false
}

const updateFormStore = () => {
  // Convert selected equipment to form store format
  formStore.equipment.selectedDevices = selectedEquipmentList.value.map(item => ({
    id: item.equipmentId,
    name: item.name,
    option: item.option.type,
    optionDescription: item.optionDescription,
    quantity: item.quantity,
    price: item.option.totalCost,
    totalCost: item.totalCost * item.quantity
  }))
  
  formStore.touch()
}

// Initialize from existing form data
const initializeFromStore = () => {
  // Restore selected equipment if any
  formStore.equipment.selectedDevices.forEach(device => {
    selectedEquipmentOptions.value[device.id] = `${device.id}-${device.option}`
    equipmentQuantities.value[device.id] = device.quantity
  })
}

// Watchers
watch(isStepValid, (newValue) => {
  uiStore.setStepValid(6, newValue)
})

watch(totalEquipmentCost, updateFormStore)

// Initialize
initializeFromStore()
uiStore.setStepValid(6, isStepValid.value)
</script>
