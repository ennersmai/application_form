import { defineStore } from 'pinia'

export const useFormStore = defineStore('form', {
  state: () => ({
    // Step 0: Business Type
    businessTypeCheck: {
      type: 'sole_trader', // 'sole_trader' or 'limited_company'
      companyNumber: '',
      companyDetails: null,
      directorsVerified: false
    },

    // Step 1: Agent Information
    agentInfo: {
      name: '', // Auto-populated from auth
      email: '', // Auto-populated from auth
      isUrgent: false
    },

    // Step 2: Principal Information
    principals: [
      {
        id: 1,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: 'sole_trader', // sole_trader, director, ultimate_owner
        ownershipPercentage: 100,
        homeAddress: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postcode: ''
        }
      }
    ],

    // Step 3: Business Information
    businessInfo: {
      businessType: 'sole_trader', // sole_trader, ltd, partnership
      legalName: '',
      tradingName: '',
      companyNumber: '',
      tradingAddress: {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'UK'
      },
      vatRegistered: false
    },

    // Step 4: Trading Information
    tradingInfo: {
      mccCode: '',
      mccDescription: '',
      amexRequired: false,
      projectedAnnualTurnover: '',
      estimatedAverageTransaction: ''
    },

    // Step 5: Pricing
    pricing: {
      devicePricing: {},  // Device-based pricing: { deviceId: { quantity, monthlyPrice, contractType } }
      totalMonthlyCost: 0,
      // Legacy fields for backward compatibility
      consumerDebit: 0.40,
      consumerCredit: 0.65,
      commercialCard: 2.00,
      authorisationFee: 0.04
    },

    // Step 6: Banking
    banking: {
      accountName: '', // Auto-populated from legal name
      sortCode: '',
      accountNumber: ''
    },

    // Step 7: Additional Information (Optional)
    additionalInfo: {
      notes: '' // Optional free text field for additional information
    },

    // Multiple Outlets (Optional)
    outlets: [], // Array of additional outlets with same legal info but different trading addresses and equipment

    // Meta
    applicationId: null,
    createdAt: null,
    lastModified: null
  }),

  getters: {
    // Check if sole trader has only one principal
    isValidSoleTrader: (state) => {
      return state.businessInfo.businessType !== 'sole_trader' || state.principals.length === 1
    },

    // Check if all principals with >25% are marked
    beneficialOwners: (state) => {
      return state.principals.filter(p => p.ownershipPercentage > 25)
    },


    // Check if urgent fee applies
    urgentFee: (state) => {
      return state.agentInfo.isUrgent ? 20 : 0
    }
  },

  actions: {
    // Add a new principal
    addPrincipal() {
      const newId = Math.max(...this.principals.map(p => p.id)) + 1
      this.principals.push({
        id: newId,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: 'director',
        ownershipPercentage: 0,
        homeAddress: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postcode: ''
        }
      })
    },

    // Remove a principal
    removePrincipal(id) {
      if (this.principals.length > 1) {
        this.principals = this.principals.filter(p => p.id !== id)
      }
    },

    // Clear all principals and reset to initial state
    clearPrincipals() {
      this.principals = [{
        id: 1,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: 'director',
        ownershipPercentage: 100,
        homeAddress: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postcode: ''
        }
      }]
    },

    // Update business info based on type
    updateBusinessType(type) {
      this.businessInfo.businessType = type
      
      // Auto-populate legal name based on type
      if (type === 'sole_trader' && this.principals.length > 0) {
        const principal = this.principals[0]
        this.businessInfo.legalName = `${principal.firstName} ${principal.lastName}`.trim()
      } else if (type === 'partnership' && this.principals.length >= 2) {
        const names = this.principals
          .slice(0, 2)
          .map(p => `${p.firstName} ${p.lastName}`.trim())
          .filter(n => n)
        this.businessInfo.legalName = names.join(' & ')
      }
    },

    // Set company details from Companies House API
    setCompanyDetails(details) {
      this.businessTypeCheck.companyDetails = details
      if (details) {
        this.businessInfo.legalName = details.company_name
        this.businessInfo.companyNumber = details.company_number
      }
    },

    // Update trading address
    setTradingAddress(address) {
      this.businessInfo.tradingAddress = { ...this.businessInfo.tradingAddress, ...address }
    },

    // Add a new outlet
    addOutlet() {
      const newId = this.outlets.length + 1
      this.outlets.push({
        id: newId,
        tradingName: '',
        tradingAddress: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postcode: '',
          country: 'UK'
        },
        devicePricing: {},
        totalMonthlyCost: 0
      })
    },

    // Remove an outlet
    removeOutlet(id) {
      this.outlets = this.outlets.filter(outlet => outlet.id !== id)
    },

    // Update outlet trading address
    setOutletTradingAddress(outletId, address) {
      const outlet = this.outlets.find(o => o.id === outletId)
      if (outlet) {
        outlet.tradingAddress = { ...outlet.tradingAddress, ...address }
      }
    },


    // Initialize form with agent details
    initializeWithAgent(user) {
      this.agentInfo.name = user.user_metadata?.full_name || user.email
      this.agentInfo.email = user.email
      this.applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      this.createdAt = new Date().toISOString()
      this.lastModified = new Date().toISOString()
    },

    // Update last modified
    touch() {
      this.lastModified = new Date().toISOString()
    },

    // Reset form
    resetForm() {
      this.$reset()
    },

    // Get form data for submission
    getSubmissionData() {
      return {
        applicationId: this.applicationId,
        businessTypeCheck: this.businessTypeCheck,
        agentInfo: this.agentInfo,
        principals: this.principals,
        businessInfo: this.businessInfo,
        tradingInfo: this.tradingInfo,
        pricing: this.pricing,
        banking: this.banking,
        additionalInfo: this.additionalInfo,
        outlets: this.outlets,
        urgentFee: this.urgentFee,
        createdAt: this.createdAt,
        submittedAt: new Date().toISOString()
      }
    }
  }
})
