import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    currentStep: 0,
    totalSteps: 10, // Steps 0-9
    isSubmitting: false,
    globalError: null,
    stepValidation: {
      0: false, // Business Type
      1: false, // Agent Info
      2: false, // Principals
      3: false, // Business Info
      4: false, // Trading Info
      5: false, // Equipment Pricing
      6: false, // Card Rates
      7: false, // Additional Info
      8: false, // Banking
      9: false  // Review
    }
  }),

  getters: {
    // Get current step title
    currentStepTitle: (state) => {
      const titles = [
        'Business Type Verification',
        'Agent Information',
        'Principal Information',
        'Business Information',
        'Trading Information',
        'Equipment Pricing',
        'Card Processing Rates',
        'Additional Information',
        'Banking Details',
        'Review & Submit'
      ]
      return titles[state.currentStep] || 'Unknown Step'
    },

    // Check if can proceed to next step
    canProceed: (state) => {
      return state.stepValidation[state.currentStep]
    },

    // Check if can go back
    canGoBack: (state) => {
      return state.currentStep > 0
    },

    // Calculate progress percentage
    progressPercentage: (state) => {
      return Math.round((state.currentStep / (state.totalSteps - 1)) * 100)
    }
  },

  actions: {
    // Navigate to specific step
    goToStep(step) {
      if (step >= 0 && step < this.totalSteps) {
        this.currentStep = step
      }
    },

    // Go to next step
    nextStep() {
      if (this.currentStep < this.totalSteps - 1 && this.canProceed) {
        this.currentStep++
      }
    },

    // Go to previous step
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    // Set step validation status
    setStepValid(step, isValid) {
      this.stepValidation[step] = isValid
    },

    // Set global error
    setError(error) {
      this.globalError = error
    },

    // Clear global error
    clearError() {
      this.globalError = null
    },

    // Set submitting state
    setSubmitting(isSubmitting) {
      this.isSubmitting = isSubmitting
    },

    // Reset UI state
    reset() {
      this.currentStep = 0
      this.isSubmitting = false
      this.globalError = null
      this.stepValidation = {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false
      }
    }
  }
})
