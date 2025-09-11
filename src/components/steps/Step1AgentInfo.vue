<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Agent Information</h2>
      <p class="text-gray-600">Your details as the submitting agent (auto-populated from your profile).</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Agent Name -->
      <div>
        <label for="agentName" class="block text-sm font-medium text-gray-700 mb-2">
          Agent Name
        </label>
        <input
          id="agentName"
          v-model="agentName"
          type="text"
          readonly
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
          placeholder="Auto-populated from your profile"
        />
        <p class="mt-1 text-sm text-gray-500">This is automatically filled from your logged-in profile</p>
      </div>

      <!-- Agent Email -->
      <div>
        <label for="agentEmail" class="block text-sm font-medium text-gray-700 mb-2">
          Agent Email Address
        </label>
        <input
          id="agentEmail"
          v-model="agentEmail"
          type="email"
          readonly
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
          placeholder="Auto-populated from your profile"
        />
        <p class="mt-1 text-sm text-gray-500">This is automatically filled from your logged-in profile</p>
      </div>
    </div>

    <!-- Urgent Processing -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <input
          id="isUrgent"
          v-model="isUrgent"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
        />
        <div class="ml-3">
          <label for="isUrgent" class="block text-sm font-medium text-gray-900">
            Is this application urgent?
          </label>
          <p class="text-sm text-gray-600 mt-1">
            Urgent applications are processed within 24 hours for an additional £20 fee.
          </p>
          <div v-if="isUrgent" class="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
            <strong>Additional Fee:</strong> £20.00 urgent processing fee will be added to the final summary.
          </div>
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-gray-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-1">Agent Information</h3>
          <p class="text-sm text-gray-600">
            Your name and email are automatically populated from your profile. If you need to update these details, 
            please contact your administrator or update your profile settings.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const formStore = useFormStore()
const uiStore = useUiStore()
const authStore = useAuthStore()

// Local reactive data
const agentName = ref(formStore.agentInfo.name)
const agentEmail = ref(formStore.agentInfo.email)
const isUrgent = ref(formStore.agentInfo.isUrgent)

// This step is always valid since the data is auto-populated
const isStepValid = computed(() => {
  return agentName.value.length > 0 && agentEmail.value.length > 0
})

// Watchers
watch(isUrgent, (newValue) => {
  formStore.agentInfo.isUrgent = newValue
  formStore.touch()
})

watch(isStepValid, () => {
  uiStore.setStepValid(1, isStepValid.value)
})

// Initialize validation
uiStore.setStepValid(1, isStepValid.value)
</script>
