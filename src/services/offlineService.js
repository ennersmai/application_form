import Dexie from 'dexie'

// IndexedDB database for offline storage
class OfflineDatabase extends Dexie {
  constructor() {
    super('AgentApplicationsDB')
    
    this.version(1).stores({
      applications: '++id, applicationId, agentId, status, formData, createdAt, lastModified, lastSyncAttempt, syncError'
    })
    
    // Version 2 with compound index for better performance
    this.version(2).stores({
      applications: '++id, applicationId, agentId, status, [agentId+status], formData, createdAt, lastModified, lastSyncAttempt, syncError'
    })
  }
}

const db = new OfflineDatabase()

// Application statuses
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  QUEUED: 'queued',
  SYNCING: 'syncing', 
  SYNCED: 'synced',
  FAILED: 'failed'
}

export const offlineService = {
  /**
   * Remove duplicate rows for the same applicationId, keeping the most recent by lastModified/createdAt
   */
  async _dedupeApplication(applicationId) {
    try {
      const all = await db.applications
        .where('applicationId')
        .equals(applicationId)
        .toArray()

      if (all.length <= 1) return

      // Sort by lastModified or createdAt desc
      const sorted = all.sort((a, b) => {
        const aTime = new Date(a.lastModified || a.createdAt || 0).getTime()
        const bTime = new Date(b.lastModified || b.createdAt || 0).getTime()
        return bTime - aTime
      })

      const keep = sorted[0]
      const toDelete = sorted.slice(1)
      await Promise.all(toDelete.map(row => db.applications.delete(row.id)))
    } catch (e) {
      console.warn('Deduplication failed for application:', applicationId, e)
    }
  },
  /**
   * Save application as draft (auto-save while editing)
   * @param {Object} formData - Complete form data from formStore
   * @param {string} agentId - Current user ID
   * @returns {Promise<Object>} Saved application
   */
  async saveDraft(formData, agentId) {
    try {
      const applicationData = {
        applicationId: formData.applicationId,
        agentId,
        status: APPLICATION_STATUS.DRAFT,
        formData: JSON.parse(JSON.stringify(formData)), // Deep clone
        createdAt: formData.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        lastSyncAttempt: null,
        syncError: null
      }

      // Upsert (update if exists, insert if new)
      const existing = await db.applications
        .where('applicationId')
        .equals(formData.applicationId)
        .first()

      if (existing) {
        await db.applications.update(existing.id, {
          formData: applicationData.formData,
          lastModified: applicationData.lastModified
        })
        await this._dedupeApplication(formData.applicationId)
        return { ...existing, ...applicationData }
      } else {
        const id = await db.applications.add(applicationData)
        await this._dedupeApplication(formData.applicationId)
        return { ...applicationData, id }
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      throw new Error('Failed to save application draft')
    }
  },

  /**
   * Queue application for submission
   * @param {Object} formData - Complete form data
   * @param {string} agentId - Current user ID
   * @returns {Promise<Object>} Queued application
   */
  async queueForSubmission(formData, agentId) {
    try {
      const applicationData = {
        applicationId: formData.applicationId,
        agentId,
        status: APPLICATION_STATUS.QUEUED,
        formData: JSON.parse(JSON.stringify(formData)),
        createdAt: formData.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        lastSyncAttempt: null,
        syncError: null
      }

      const existing = await db.applications
        .where('applicationId')
        .equals(formData.applicationId)
        .first()

      if (existing) {
        await db.applications.update(existing.id, applicationData)
        await this._dedupeApplication(formData.applicationId)
        return { ...existing, ...applicationData }
      } else {
        const id = await db.applications.add(applicationData)
        await this._dedupeApplication(formData.applicationId)
        return { ...applicationData, id }
      }
    } catch (error) {
      console.error('Error queuing application:', error)
      throw new Error('Failed to queue application for submission')
    }
  },

  /**
   * Get all draft applications for current agent
   * @param {string} agentId 
   * @returns {Promise<Array>} Draft applications
   */
  async getDrafts(agentId) {
    try {
      return await db.applications
        .where('agentId')
        .equals(agentId)
        .filter(app => app.status === APPLICATION_STATUS.DRAFT)
        .reverse()
        .sortBy('lastModified')
    } catch (error) {
      console.error('Error getting drafts:', error)
      return []
    }
  },

  /**
   * Get all queued applications for current agent
   * @param {string} agentId 
   * @returns {Promise<Array>} Queued applications
   */
  async getQueued(agentId) {
    try {
      return await db.applications
        .where('agentId')
        .equals(agentId)
        .filter(app => app.status === APPLICATION_STATUS.QUEUED)
        .reverse()
        .sortBy('lastModified')
    } catch (error) {
      console.error('Error getting queued applications:', error)
      return []
    }
  },

  /**
   * Get all failed applications for current agent
   * @param {string} agentId 
   * @returns {Promise<Array>} Failed applications
   */
  async getFailed(agentId) {
    try {
      return await db.applications
        .where('agentId')
        .equals(agentId)
        .filter(app => app.status === APPLICATION_STATUS.FAILED)
        .reverse()
        .sortBy('lastSyncAttempt')
    } catch (error) {
      console.error('Error getting failed applications:', error)
      return []
    }
  },

  /**
   * Get synced (successfully submitted) applications for an agent
   * @param {string} agentId 
   * @returns {Promise<Array>}
   */
  async getSynced(agentId) {
    try {
      return await db.applications
        .where('agentId')
        .equals(agentId)
        .filter(app => app.status === APPLICATION_STATUS.SYNCED)
        .reverse()
        .sortBy('lastSyncAttempt')
    } catch (error) {
      console.error('Error getting synced applications:', error)
      return []
    }
  },

  /**
   * Get all applications (for overview)
   * @param {string} agentId 
   * @returns {Promise<Array>} All applications
   */
  async getAllApplications(agentId) {
    try {
      return await db.applications
        .where('agentId')
        .equals(agentId)
        .reverse()
        .sortBy('lastModified')
    } catch (error) {
      console.error('Error getting all applications:', error)
      return []
    }
  },

  /**
   * Update application status
   * @param {string} applicationId 
   * @param {string} status 
   * @param {string} syncError 
   * @returns {Promise<void>}
   */
  async updateApplicationStatus(applicationId, status, syncError = null) {
    try {
      const matches = await db.applications
        .where('applicationId')
        .equals(applicationId)
        .toArray()

      const now = new Date().toISOString()
      await Promise.all(matches.map(row => db.applications.update(row.id, {
        status,
        lastSyncAttempt: now,
        syncError
      })))

      await this._dedupeApplication(applicationId)
    } catch (error) {
      console.error('Error updating application status:', error)
      throw new Error('Failed to update application status')
    }
  },

  /**
   * Delete application
   * @param {string} applicationId 
   * @returns {Promise<void>}
   */
  async deleteApplication(applicationId) {
    try {
      await db.applications
        .where('applicationId')
        .equals(applicationId)
        .delete()
    } catch (error) {
      console.error('Error deleting application:', error)
      throw new Error('Failed to delete application')
    }
  },

  /**
   * Get application by ID
   * @param {string} applicationId 
   * @returns {Promise<Object|null>} Application data
   */
  async getApplication(applicationId) {
    try {
      return await db.applications
        .where('applicationId')
        .equals(applicationId)
        .first()
    } catch (error) {
      console.error('Error getting application:', error)
      return null
    }
  },

  /**
   * Clear all data (for testing/reset)
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      await db.applications.clear()
    } catch (error) {
      console.error('Error clearing applications:', error)
      throw new Error('Failed to clear applications')
    }
  },

  /**
   * Get database statistics
   * @param {string} agentId 
   * @returns {Promise<Object>} Statistics
   */
  async getStats(agentId) {
    try {
      const all = await this.getAllApplications(agentId)
      
      return {
        total: all.length,
        drafts: all.filter(app => app.status === APPLICATION_STATUS.DRAFT).length,
        queued: all.filter(app => app.status === APPLICATION_STATUS.QUEUED).length,
        failed: all.filter(app => app.status === APPLICATION_STATUS.FAILED).length,
        synced: all.filter(app => app.status === APPLICATION_STATUS.SYNCED).length
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return { total: 0, drafts: 0, queued: 0, failed: 0, synced: 0 }
    }
  }
}
