import { defineStore } from 'pinia'
import { offlineService, APPLICATION_STATUS } from '@/services/offlineService'
import { syncService } from '@/services/syncService'
import { useAuthStore } from './authStore'
import { useFormStore } from './formStore'

export const useOfflineStore = defineStore('offline', {
  state: () => ({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    applications: {
      drafts: [],
      queued: [],
      failed: [],
      synced: []
    },
    stats: {
      total: 0,
      drafts: 0,
      queued: 0,
      failed: 0,
      synced: 0
    },
    autoSaveEnabled: true,
    autoSaveDelay: 2000 // 2 seconds
  }),

  getters: {
    totalPendingSync: (state) => state.stats.queued + state.stats.failed,
    hasPendingApplications: (state) => state.stats.queued > 0 || state.stats.failed > 0,
    networkStatus: (state) => ({
      online: state.isOnline,
      statusText: state.isOnline ? 'Online' : 'Offline',
      canSync: state.isOnline && !state.isSyncing
    })
  },

  actions: {
    /**
     * Initialize offline store
     */
    async initialize() {
      console.log('Initializing offline store...')
      
      // Set up network status listeners
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      
      // Set up sync completion listener
      window.addEventListener('syncCompleted', this.handleSyncCompleted)
      
      // Initialize sync service
      syncService.init()
      
      // Load existing applications
      await this.loadApplications()
      
      console.log('Offline store initialized')
    },

    /**
     * Load applications from IndexedDB
     */
    async loadApplications() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      try {
        const [drafts, queued, failed, synced] = await Promise.all([
          offlineService.getDrafts(authStore.user.id),
          offlineService.getQueued(authStore.user.id),
          offlineService.getFailed(authStore.user.id),
          offlineService.getSynced(authStore.user.id)
        ])

        this.applications.drafts = drafts
        this.applications.queued = queued
        this.applications.failed = failed
        this.applications.synced = synced

        // Update stats
        const stats = await offlineService.getStats(authStore.user.id)
        this.stats = stats

        console.log('Loaded applications:', stats)
      } catch (error) {
        console.error('Error loading applications:', error)
      }
    },

    /**
     * Save application as draft
     * @param {Object} formData 
     */
    async saveDraft(formData) {
      const authStore = useAuthStore()
      if (!authStore.user) return

      try {
        await offlineService.saveDraft(formData, authStore.user.id)
        await this.loadApplications() // Refresh the lists
      } catch (error) {
        console.error('Error saving draft:', error)
        throw error
      }
    },

    /**
     * Queue application for submission
     * @param {Object} formData 
     */
    async queueForSubmission(formData) {
      const authStore = useAuthStore()
      if (!authStore.user) return

      try {
        await offlineService.queueForSubmission(formData, authStore.user.id)
        await this.loadApplications()

        // Try to sync immediately if online
        if (this.isOnline) {
          await this.syncNow()
        }
      } catch (error) {
        console.error('Error queuing application:', error)
        throw error
      }
    },

    /**
     * Trigger manual sync
     */
    async syncNow() {
      if (!this.isOnline) {
        throw new Error('Cannot sync while offline')
      }

      if (this.isSyncing) {
        throw new Error('Sync already in progress')
      }

      this.isSyncing = true
      this.syncError = null

      try {
        const results = await syncService.processQueue()
        this.lastSyncTime = new Date().toISOString()
        
        await this.loadApplications() // Refresh after sync
        
        return results
      } catch (error) {
        this.syncError = error.message
        throw error
      } finally {
        this.isSyncing = false
      }
    },

    /**
     * Retry a specific failed application
     * @param {string} applicationId 
     */
    async retryApplication(applicationId) {
      try {
        const success = await syncService.retryApplication(applicationId)
        await this.loadApplications() // Refresh lists
        return success
      } catch (error) {
        console.error('Error retrying application:', error)
        throw error
      }
    },

    /**
     * Load an application for editing
     * @param {string} applicationId 
     * @returns {Promise<boolean>} Success status
     */
    async editApplication(applicationId) {
      try {
        const applicationData = await syncService.editApplication(applicationId)
        if (applicationData) {
          const formStore = useFormStore()
          formStore.loadDraft(applicationData)
          return true
        }
        return false
      } catch (error) {
        console.error('Error loading application for editing:', error)
        throw error
      }
    },

    /**
     * Delete an application
     * @param {string} applicationId 
     */
    async deleteApplication(applicationId) {
      try {
        await offlineService.deleteApplication(applicationId)
        await this.loadApplications()
      } catch (error) {
        console.error('Error deleting application:', error)
        throw error
      }
    },

    /**
     * Handle online event
     */
    handleOnline() {
      console.log('Device came online')
      this.isOnline = true
      this.syncError = null
    },

    /**
     * Handle offline event  
     */
    handleOffline() {
      console.log('Device went offline')
      this.isOnline = false
    },

    /**
     * Handle sync completion
     * @param {CustomEvent} event 
     */
    handleSyncCompleted(event) {
      console.log('Sync completed:', event.detail)
      this.loadApplications() // Refresh applications after sync
    },

    /**
     * Get application by ID
     * @param {string} applicationId 
     * @returns {Promise<Object|null>} Application data
     */
    async getApplicationById(applicationId) {
      return await offlineService.getApplication(applicationId)
    },

    /**
     * Set auto-save configuration
     * @param {boolean} enabled 
     * @param {number} delay 
     */
    setAutoSave(enabled, delay = 2000) {
      this.autoSaveEnabled = enabled
      this.autoSaveDelay = delay
    }
  }
})
