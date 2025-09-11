// Using native fetch instead of axios
import { offlineService, APPLICATION_STATUS } from './offlineService'
import { supabase } from './supabase'

export const syncService = {
  /**
   * Process the submission queue - sync all queued applications
   * @returns {Promise<Object>} Sync results
   */
  async processQueue() {
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      // Get all queued applications for current user
      const queuedApps = await offlineService.getQueued(session.user.id)
      results.processed = queuedApps.length

      if (queuedApps.length === 0) {
        return results
      }

      console.log(`Processing ${queuedApps.length} queued applications...`)

      // Process each application
      for (const app of queuedApps) {
        try {
          await this.submitApplication(app)
          results.successful++
        } catch (error) {
          results.failed++
          results.errors.push({
            applicationId: app.applicationId,
            error: error.message
          })
        }
      }

      console.log('Sync results:', results)
      return results
    } catch (error) {
      console.error('Error processing queue:', error)
      results.errors.push({ error: error.message })
      return results
    }
  },

  /**
   * Submit a single application to the backend
   * @param {Object} application - Application from offline storage
   * @returns {Promise<void>}
   */
  async submitApplication(application) {
    try {
      // Update status to syncing
      await offlineService.updateApplicationStatus(
        application.applicationId, 
        APPLICATION_STATUS.SYNCING
      )

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No valid session token')
      }

      // Submit to backend API using native fetch
      const response = await fetch('/api/submit-application', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationData: application.formData,
          applicationId: application.applicationId
        })
      })

      if (response.ok) {
        // Success - mark as synced and remove any draft duplicates
        await offlineService.updateApplicationStatus(
          application.applicationId,
          APPLICATION_STATUS.SYNCED
        )

        // After marking as SYNCED, ensure only the latest record remains
        // (offlineService.updateApplicationStatus already dedupes)

        console.log(`Successfully submitted application ${application.applicationId}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Submission failed with details:', errorData)
        if (errorData.details && Array.isArray(errorData.details)) {
          console.error('Validation errors:', errorData.details)
        }
        throw new Error(`Server returned status ${response.status}: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error(`Failed to submit application ${application.applicationId}:`, error)
      
      // Update status to failed with error message
      let errorMessage = 'Submission failed'
      
      if (error.message) {
        errorMessage = error.message
      }
      
      await offlineService.updateApplicationStatus(
        application.applicationId,
        APPLICATION_STATUS.FAILED,
        errorMessage
      )
      
      throw error
    }
  },

  /**
   * Check if device is online
   * @returns {boolean}
   */
  isOnline() {
    return navigator.onLine
  },

  /**
   * Retry a specific failed application
   * @param {string} applicationId 
   * @returns {Promise<boolean>} Success status
   */
  async retryApplication(applicationId) {
    try {
      const application = await offlineService.getApplication(applicationId)
      if (!application) {
        throw new Error('Application not found')
      }

      // Reset to queued status
      await offlineService.updateApplicationStatus(
        applicationId,
        APPLICATION_STATUS.QUEUED
      )

      // Try to submit
      await this.submitApplication(application)
      return true
    } catch (error) {
      console.error(`Retry failed for ${applicationId}:`, error)
      return false
    }
  },

  /**
   * Auto-sync when coming online
   * @returns {Promise<void>}
   */
  async autoSync() {
    if (!this.isOnline()) {
      console.log('Device is offline, skipping auto-sync')
      return
    }

    try {
      console.log('Auto-sync triggered...')
      const results = await this.processQueue()
      
      if (results.processed > 0) {
        console.log(`Auto-sync completed: ${results.successful} successful, ${results.failed} failed`)
        
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('syncCompleted', { 
          detail: results 
        }))
      }
    } catch (error) {
      console.error('Auto-sync error:', error)
    }
  },

  /**
   * Initialize sync service with event listeners
   */
  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Device came online, triggering auto-sync...')
      this.autoSync()
    })

    window.addEventListener('offline', () => {
      console.log('Device went offline')
    })

    // Auto-sync on page load if online
    if (this.isOnline()) {
      setTimeout(() => this.autoSync(), 2000) // Delay to allow app initialization
    }

    console.log('Sync service initialized')
  },

  /**
   * Get network status info
   * @returns {Object} Network information
   */
  getNetworkInfo() {
    return {
      online: this.isOnline(),
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    }
  }
}
