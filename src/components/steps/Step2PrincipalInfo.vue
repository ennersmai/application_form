<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Principal Information</h2>
      <p class="text-gray-600">Details of the business owners/directors who will be responsible for the merchant account.</p>
    </div>

    <!-- Principals List -->
    <div class="space-y-6">
      <div 
        v-for="(principal, index) in principals" 
        :key="principal.id"
        class="bg-white border border-gray-200 rounded-lg p-6 relative"
      >
        <!-- Principal Header -->
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 flex-1">
            Principal {{ index + 1 }}
            <span v-if="principal.firstName || principal.lastName" class="text-sm font-normal text-gray-500">
              - {{ principal.firstName }} {{ principal.lastName }}
            </span>
          </h3>
          <button
            v-if="principals.length > 1"
            @click="removePrincipal(principal.id)"
            class="ml-4 inline-flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Remove Principal"
          >
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Principal Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- First Name -->
          <div>
            <label :for="`firstName-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              :id="`firstName-${principal.id}`"
              v-model="principal.firstName"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-red-300': !principal.firstName && (showValidation || touchedFields[`firstName-${principal.id}`]) }"
              placeholder="Enter first name"
              @input="updatePrincipal(principal.id, 'firstName', $event.target.value)"
              @blur="touchedFields[`firstName-${principal.id}`] = true"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label :for="`lastName-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              :id="`lastName-${principal.id}`"
              v-model="principal.lastName"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-red-300': !principal.lastName && (showValidation || touchedFields[`lastName-${principal.id}`]) }"
              placeholder="Enter last name"
              @input="updatePrincipal(principal.id, 'lastName', $event.target.value)"
              @blur="touchedFields[`lastName-${principal.id}`] = true"
            />
          </div>

          <!-- Email -->
          <div>
            <label :for="`email-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              :id="`email-${principal.id}`"
              v-model="principal.email"
              type="email"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-red-300': (principal.email && !isValidEmail(principal.email)) || (!principal.email && (showValidation || touchedFields[`email-${principal.id}`])) }"
              placeholder="Enter email address"
              @input="updatePrincipal(principal.id, 'email', $event.target.value)"
              @blur="touchedFields[`email-${principal.id}`] = true"
            />
          </div>

          <!-- Phone -->
          <div>
            <label :for="`phone-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              :id="`phone-${principal.id}`"
              v-model="principal.phone"
              type="tel"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-red-300': !principal.phone && (showValidation || touchedFields[`phone-${principal.id}`]) }"
              placeholder="Enter phone number"
              @input="updatePrincipal(principal.id, 'phone', $event.target.value)"
              @blur="touchedFields[`phone-${principal.id}`] = true"
            />
          </div>

          <!-- Position -->
          <div>
            <label :for="`position-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              Position *
            </label>
            <select
              :id="`position-${principal.id}`"
              v-model="principal.position"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              @change="updatePrincipal(principal.id, 'position', $event.target.value)"
            >
              <option value="">Select position</option>
              <option value="sole_trader">Sole Trader</option>
              <option value="director">Director</option>
              <option value="ultimate_owner">Ultimate Owner</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          <!-- Ownership Percentage -->
          <div>
            <label :for="`ownership-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              Ownership % *
            </label>
            <div class="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500" :class="{ 'border-red-300': (principal.ownershipPercentage < 0 || principal.ownershipPercentage > 100) && showValidation }">
              <input
                :id="`ownership-${principal.id}`"
                v-model.number="principal.ownershipPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                class="flex-1 min-w-0 px-3 py-3 border-0 rounded-l-md focus:outline-none focus:ring-0 text-base min-h-[44px] number-input-mobile"
                placeholder="0.00"
                @input="updatePrincipal(principal.id, 'ownershipPercentage', parseFloat($event.target.value) || 0)"
              />
              <div class="flex flex-col border-l border-gray-300 flex-shrink-0">
                <button
                  type="button"
                  @click="incrementOwnership(principal.id)"
                  class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-300 flex-1 flex items-center justify-center"
                  :disabled="principal.ownershipPercentage >= 100"
                >
                  <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="decrementOwnership(principal.id)"
                  class="px-2 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex-1 flex items-center justify-center rounded-br-md"
                  :disabled="principal.ownershipPercentage <= 0"
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
            <p v-if="principal.ownershipPercentage > 25" class="mt-1 text-sm text-orange-600">
              ⚠️ Beneficial owner (>25% ownership) - additional verification may be required
            </p>
          </div>
        </div>

        <!-- Home Address Section -->
        <div class="md:col-span-2 mt-4">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Home Address</h4>
          
          <!-- Address Line 1 -->
          <div class="mb-3">
            <label :for="`addressLine1-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              :id="`addressLine1-${principal.id}`"
              v-model="principal.homeAddress.line1"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              :class="{ 'border-red-300': !principal.homeAddress.line1 && (showValidation || touchedFields[`addressLine1-${principal.id}`]) }"
              placeholder="Enter street address"
              @input="updatePrincipalAddress(principal.id, 'line1', $event.target.value)"
              @blur="touchedFields[`addressLine1-${principal.id}`] = true"
            />
          </div>

          <!-- Address Line 2 -->
          <div class="mb-3">
            <label :for="`addressLine2-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              :id="`addressLine2-${principal.id}`"
              v-model="principal.homeAddress.line2"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter address line 2 (optional)"
              @input="updatePrincipalAddress(principal.id, 'line2', $event.target.value)"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- City -->
            <div>
              <label :for="`city-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                :id="`city-${principal.id}`"
                v-model="principal.homeAddress.city"
                type="text"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                :class="{ 'border-red-300': !principal.homeAddress.city && (showValidation || touchedFields[`city-${principal.id}`]) }"
                placeholder="Enter city"
                @input="updatePrincipalAddress(principal.id, 'city', $event.target.value)"
                @blur="touchedFields[`city-${principal.id}`] = true"
              />
            </div>

            <!-- County -->
            <div>
              <label :for="`county-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
                County
              </label>
              <input
                :id="`county-${principal.id}`"
                v-model="principal.homeAddress.county"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter county"
                @input="updatePrincipalAddress(principal.id, 'county', $event.target.value)"
              />
            </div>

            <!-- Postcode -->
            <div>
              <label :for="`postcode-${principal.id}`" class="block text-sm font-medium text-gray-700 mb-2">
                Postcode *
              </label>
              <input
                :id="`postcode-${principal.id}`"
                v-model="principal.homeAddress.postcode"
                type="text"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                :class="{ 'border-red-300': !principal.homeAddress.postcode && (showValidation || touchedFields[`postcode-${principal.id}`]) }"
                placeholder="e.g., SW1A 1AA"
                @input="updatePrincipalAddress(principal.id, 'postcode', $event.target.value)"
                @blur="touchedFields[`postcode-${principal.id}`] = true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Principal Button -->
    <div class="flex justify-center">
      <button
        @click="addPrincipal"
        class="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px] touch-manipulation"
      >
        <svg class="mr-2 -ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Another Principal
      </button>
    </div>

    <!-- Ownership Summary -->
    <div v-if="principals.length > 1" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Ownership Summary</h4>
      <div class="space-y-1 text-sm">
        <div v-for="principal in principals" :key="principal.id" class="flex justify-between">
          <span class="text-gray-600">
            {{ principal.firstName }} {{ principal.lastName || 'Unnamed' }}
          </span>
          <span class="font-medium">{{ principal.ownershipPercentage }}%</span>
        </div>
        <div class="border-t border-gray-200 pt-1 flex justify-between font-medium">
          <span>Total:</span>
          <span :class="{ 'text-red-600': totalOwnership !== 100, 'text-green-600': totalOwnership === 100 }">
            {{ totalOwnership }}%
          </span>
        </div>
      </div>
      <p v-if="totalOwnership !== 100" class="mt-2 text-sm text-orange-600">
        ⚠️ Total ownership should equal 100%
      </p>
    </div>

    <!-- Beneficial Owners Alert -->
    <div v-if="beneficialOwners.length > 0" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-orange-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-orange-800 mb-1">Beneficial Owners Identified</h3>
          <p class="text-sm text-orange-700">
            The following principals own more than 25% and are considered beneficial owners:
          </p>
          <ul class="mt-1 text-sm text-orange-700 list-disc list-inside">
            <li v-for="owner in beneficialOwners" :key="owner.id">
              {{ owner.firstName }} {{ owner.lastName }} ({{ owner.ownershipPercentage }}%)
            </li>
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

// Local reactive data
const principals = ref(formStore.principals)
const showValidation = ref(false)
const touchedFields = ref({})

// Computed properties
const totalOwnership = computed(() => {
  return principals.value.reduce((total, principal) => total + (principal.ownershipPercentage || 0), 0)
})

const beneficialOwners = computed(() => {
  return principals.value.filter(p => p.ownershipPercentage > 25)
})

const isStepValid = computed(() => {
  const allFieldsValid = principals.value.every(principal => {
    const hasBasicInfo = principal.firstName && 
           principal.lastName && 
           principal.email && 
           isValidEmail(principal.email) &&
           principal.phone && 
           principal.position &&
           principal.ownershipPercentage >= 0 &&
           principal.ownershipPercentage <= 100
    
    const hasHomeAddress = principal.homeAddress &&
           principal.homeAddress.line1 &&
           principal.homeAddress.city &&
           principal.homeAddress.postcode
    
    return hasBasicInfo && hasHomeAddress
  })
  
  // For multiple principals, ownership should total 100%
  const ownershipValid = principals.value.length === 1 || totalOwnership.value === 100
  
  return allFieldsValid && ownershipValid
})

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const updatePrincipal = (id, field, value) => {
  const principal = principals.value.find(p => p.id === id)
  if (principal) {
    principal[field] = value
    formStore.touch()
  }
}

const updatePrincipalAddress = (id, field, value) => {
  const principal = principals.value.find(p => p.id === id)
  if (principal) {
    if (!principal.homeAddress) {
      principal.homeAddress = {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postcode: ''
      }
    }
    principal.homeAddress[field] = value
    formStore.touch()
  }
}

const addPrincipal = () => {
  formStore.addPrincipal()
  // Update local reference
  principals.value = formStore.principals
}

const removePrincipal = (id) => {
  if (principals.value.length > 1) {
    formStore.removePrincipal(id)
    // Update local reference
    principals.value = formStore.principals
  }
}

const incrementOwnership = (id) => {
  const principal = principals.value.find(p => p.id === id)
  if (principal && principal.ownershipPercentage < 100) {
    const newValue = Math.min(100, (principal.ownershipPercentage || 0) + 1)
    updatePrincipal(id, 'ownershipPercentage', newValue)
  }
}

const decrementOwnership = (id) => {
  const principal = principals.value.find(p => p.id === id)
  if (principal && principal.ownershipPercentage > 0) {
    const newValue = Math.max(0, (principal.ownershipPercentage || 0) - 1)
    updatePrincipal(id, 'ownershipPercentage', newValue)
  }
}

// Watchers
watch(isStepValid, (newValue) => {
  uiStore.setStepValid(2, newValue)
})

// Show validation errors after user tries to proceed or when trying to go next
watch(() => uiStore.currentStep, (newStep, oldStep) => {
  if (oldStep === 2 && newStep !== 2) {
    showValidation.value = true
  }
})

// Also show validation when step becomes invalid but user tries to proceed
watch(isStepValid, (newValue) => {
  if (!newValue && showValidation.value) {
    // Force validation display when step becomes invalid
    showValidation.value = true
  }
})

// Show validation immediately if user tries to proceed with invalid data
watch(() => uiStore.canProceed, (canProceed) => {
  if (!canProceed && uiStore.currentStep === 2) {
    showValidation.value = true
  }
})

// Initialize validation
uiStore.setStepValid(2, isStepValid.value)
</script>

<style scoped>
/* Mobile-friendly number input spinner buttons */
.number-input-mobile::-webkit-outer-spin-button,
.number-input-mobile::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Custom spinner buttons for better mobile experience */
.number-input-mobile {
  -moz-appearance: textfield; /* Firefox */
}

/* For webkit browsers, we'll use custom buttons */
@media (max-width: 768px) {
  .number-input-mobile {
    padding-right: 60px; /* Make room for custom buttons */
  }
}
</style>
