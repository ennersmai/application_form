<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile-optimized Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-4">
          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-lg font-semibold text-gray-900">{{ currentStepTitle }}</h1>
              <span class="text-sm text-gray-500">Step {{ currentStep + 1 }} of {{ totalSteps }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                :style="`width: ${progressPercentage}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Form Container -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Error Alert -->
      <div v-if="globalError" class="mb-6 rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ globalError }}</p>
          </div>
          <div class="ml-auto pl-3">
            <button @click="uiStore.clearError()" class="text-red-400 hover:text-red-500">
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Dynamic Step Component -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <keep-alive>
          <component :is="currentStepComponent" />
        </keep-alive>
      </div>

      <!-- Navigation Buttons -->
      <div class="mt-6">
        <!-- 3-Column Layout for Steps 0-7 -->
        <div v-if="currentStep < totalSteps - 1" class="grid grid-cols-3 gap-3">
          <!-- Back Button -->
          <button
            v-if="canGoBack"
            @click="previousStep"
            class="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px]"
          >
            <svg class="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="hidden sm:inline">Back</span>
          </button>
          <div v-else></div>

          <!-- Save & Exit Button (Center) -->
          <button
            @click="saveAndExit"
            class="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px]"
          >
            <svg class="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
            </svg>
            Save
          </button>

          <!-- Next Button -->
          <button
            @click="nextStep"
            :disabled="!canProceed || isSubmitting"
            class="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <span class="hidden sm:inline">Next</span>
            <svg class="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- 2-Column Layout for Final Step (Review & Submit) -->
        <div v-else class="grid grid-cols-2 gap-3">
          <!-- Back Button -->
          <button
            @click="previousStep"
            class="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px]"
          >
            <svg class="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Back
          </button>

          <!-- Submit Button -->
          <button
            @click="submitApplication"
            :disabled="!canProceed || isSubmitting"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
            <span v-else>Submit Application</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Save Confirmation Modal -->
    <ConfirmationModal
      :show="showSaveConfirmation"
      type="info"
      title="Save Application"
      message="Your application will be saved as a draft and you can continue editing it later from the Offline Queue."
      confirm-text="Save & Exit"
      cancel-text="Continue Editing"
      @confirm="confirmSave"
      @cancel="cancelSave"
    />

    <!-- Submission Modal -->
    <SubmissionModal
      :is-visible="showSubmissionModal"
      :type="submissionModalData.type"
      :title="submissionModalData.title"
      :message="submissionModalData.message"
      :primary-button-text="submissionModalData.primaryButtonText"
      :secondary-button-text="submissionModalData.secondaryButtonText"
      @primary-action="() => handleSubmissionModalAction('primary')"
      @secondary-action="() => handleSubmissionModalAction('secondary')"
      @close="() => handleSubmissionModalAction('close')"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '@/stores/formStore'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useOfflineStore } from '@/stores/offlineStore'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import SubmissionModal from '@/components/SubmissionModal.vue'

// Import step components (we'll create these next)
import Step0BusinessType from '@/components/steps/Step0BusinessType.vue'
import Step1AgentInfo from '@/components/steps/Step1AgentInfo.vue'
import Step2PrincipalInfo from '@/components/steps/Step2PrincipalInfo.vue'
import Step3BusinessInfo from '@/components/steps/Step3BusinessInfo.vue'
import Step4TradingInfo from '@/components/steps/Step4TradingInfo.vue'
import Step5Pricing from '@/components/steps/Step5Pricing.vue'
import Step6Banking from '@/components/steps/Step7Banking.vue'
import Step7Review from '@/components/steps/Step8Review.vue'

const router = useRouter()
const formStore = useFormStore()
const uiStore = useUiStore()
const authStore = useAuthStore()
const offlineStore = useOfflineStore()

// Modal state
const showSaveConfirmation = ref(false)

// Submission modal state
const showSubmissionModal = ref(false)
const submissionModalData = ref({
  type: 'loading',
  title: '',
  message: '',
  primaryButtonText: 'OK',
  secondaryButtonText: 'Cancel'
})

// Step components mapping
const stepComponents = {
  0: Step0BusinessType,
  1: Step1AgentInfo,
  2: Step2PrincipalInfo,
  3: Step3BusinessInfo,
  4: Step4TradingInfo,
  5: Step5Pricing,
  6: Step6Banking,
  7: Step7Review
}

// Computed properties
const currentStep = computed(() => uiStore.currentStep)
const totalSteps = computed(() => uiStore.totalSteps)
const currentStepTitle = computed(() => uiStore.currentStepTitle)
const progressPercentage = computed(() => uiStore.progressPercentage)
const canProceed = computed(() => uiStore.canProceed)
const canGoBack = computed(() => uiStore.canGoBack)
const globalError = computed(() => uiStore.globalError)
const isSubmitting = computed(() => uiStore.isSubmitting)

const currentStepComponent = computed(() => {
  return stepComponents[currentStep.value] || null
})

// Methods
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextStep = () => {
  uiStore.nextStep()
  scrollToTop()
}

const previousStep = () => {
  uiStore.previousStep()
  scrollToTop()
}

const saveAndExit = () => {
  showSaveConfirmation.value = true
}

const confirmSave = async () => {
  try {
    const draftData = formStore.getSubmissionData()
    console.log('Saving draft...', draftData)
    
    // Save as draft
    await offlineStore.saveDraft(draftData)
    
    // Close modal and redirect
    showSaveConfirmation.value = false
    router.push({ name: 'Home' })
    
  } catch (error) {
    console.error('Save error:', error)
    showSaveConfirmation.value = false
    uiStore.setError(`Save failed: ${error.message}`)
  }
}

const cancelSave = () => {
  showSaveConfirmation.value = false
}

const submitApplication = async () => {
  try {
    // Show loading modal
    submissionModalData.value = {
      type: 'loading',
      title: 'Submitting Application',
      message: 'Please wait while we process your merchant application...',
      primaryButtonText: 'OK',
      secondaryButtonText: 'Cancel'
    }
    showSubmissionModal.value = true
    uiStore.setSubmitting(true)
    
    const submissionData = formStore.getSubmissionData()
    console.log('Submitting application...', submissionData)
    
    // Queue for submission (will sync immediately if online)
    await offlineStore.queueForSubmission(submissionData)
    
    // Show success modal
    submissionModalData.value = {
      type: 'success',
      title: 'Application Submitted Successfully!',
      message: 'Your merchant application has been submitted and will be processed shortly. You will receive confirmation via email.',
      primaryButtonText: 'Continue',
      secondaryButtonText: ''
    }
    
  } catch (error) {
    console.error('Submission error:', error)
    
    // Show error modal
    submissionModalData.value = {
      type: 'error',
      title: 'Submission Failed',
      message: 'There was an error submitting your application. Please check your connection and try again.',
      primaryButtonText: 'Try Again',
      secondaryButtonText: 'Cancel'
    }
    uiStore.setError(`Submission failed: ${error.message}`)
  } finally {
    uiStore.setSubmitting(false)
  }
}

const handleSubmissionModalAction = (action) => {
  showSubmissionModal.value = false
  
  if (submissionModalData.value.type === 'success') {
    // Redirect to home after success
    router.push({ name: 'Home' })
  } else if (submissionModalData.value.type === 'error' && action === 'primary') {
    // Retry submission
    submitApplication()
  }
}

// Auto-save on form changes (debounced)
let autoSaveTimeout = null
watch(() => formStore.$state, () => {
  formStore.touch()
  
  // Debounced auto-save to prevent excessive saves
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  
  autoSaveTimeout = setTimeout(async () => {
    try {
      if (offlineStore.autoSaveEnabled && formStore.applicationId && !uiStore.isSubmitting) {
        // Check if this application has already been submitted
        const existingApp = await offlineStore.getApplicationById(formStore.applicationId)
        if (!existingApp || existingApp.status === 'draft') {
          await offlineStore.saveDraft(formStore.getSubmissionData())
          console.log('Auto-saved draft')
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    }
  }, offlineStore.autoSaveDelay)
}, { deep: true })

// Initialize form with user data
onMounted(async () => {
  formStore.initializeWithAgent(authStore.user)
  await offlineStore.initialize()
})
</script>
