<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-4 flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/" class="mr-4">
              <svg class="h-6 w-6 text-gray-600 hover:text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            <h1 class="text-xl font-semibold text-gray-900">Offline Queue</h1>
          </div>
          
          <!-- Network Status & Sync Button -->
          <div class="flex items-center space-x-3">
            <div class="flex items-center">
              <div 
                class="w-3 h-3 rounded-full mr-2"
                :class="networkStatus.online ? 'bg-green-400' : 'bg-red-400'"
              ></div>
              <span class="text-sm text-gray-600">{{ networkStatus.statusText }}</span>
            </div>
            
            <button
              v-if="networkStatus.canSync && hasPendingApplications"
              @click="syncNow"
              :disabled="isSyncing"
              class="inline-flex items-center px-3 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <svg v-if="!isSyncing" class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSyncing ? 'Syncing...' : 'Sync All' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-2xl font-bold text-gray-900">{{ stats.drafts }}</div>
          <div class="text-sm text-gray-600">Drafts</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-2xl font-bold text-orange-600">{{ stats.queued }}</div>
          <div class="text-sm text-gray-600">Queued</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-2xl font-bold text-red-600">{{ stats.failed }}</div>
          <div class="text-sm text-gray-600">Failed</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="text-2xl font-bold text-green-600">{{ stats.synced }}</div>
          <div class="text-sm text-gray-600">Synced</div>
        </div>
      </div>

      <!-- Sync Error -->
      <div v-if="syncError" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800">Sync Error</h3>
            <p class="text-sm text-red-700 mt-1">{{ syncError }}</p>
          </div>
        </div>
      </div>

      <!-- Queued Applications -->
      <div v-if="applications.queued.length > 0" class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Queued for Sync</h2>
          <p class="text-sm text-gray-600">These applications will sync when you're online</p>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="app in applications.queued"
            :key="app.applicationId"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ getApplicationTitle(app) }}</p>
                    <p class="text-sm text-gray-500">{{ app.applicationId }}</p>
                    <p class="text-xs text-gray-400">Created: {{ formatDate(app.createdAt) }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Queued
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Failed Applications -->
      <div v-if="applications.failed.length > 0" class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Failed Submissions</h2>
          <p class="text-sm text-gray-600">These applications failed to sync and need attention</p>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="app in applications.failed"
            :key="app.applicationId"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ getApplicationTitle(app) }}</p>
                    <p class="text-sm text-gray-500">{{ app.applicationId }}</p>
                    <p class="text-xs text-gray-400">Last attempt: {{ formatDate(app.lastSyncAttempt) }}</p>
                    <p v-if="app.syncError" class="text-xs text-red-600 mt-1">{{ app.syncError }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Failed
                </span>
                <div class="flex space-x-2">
                  <button
                    @click="retryApplication(app.applicationId)"
                    class="text-sm text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded border border-primary-600 hover:bg-primary-50"
                  >
                    Retry
                  </button>
                  <button
                    @click="deleteApplication(app.applicationId)"
                    class="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded border border-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Successfully Submitted Applications -->
      <div v-if="applications.synced && applications.synced.length > 0" class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Successfully Submitted</h2>
          <p class="text-sm text-gray-600">Applications that have been submitted and processed</p>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="app in applications.synced"
            :key="app.applicationId"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ getApplicationTitle(app) }}</p>
                    <p class="text-sm text-gray-500">{{ app.applicationId }}</p>
                    <p class="text-xs text-gray-400">Submitted: {{ formatDate(app.lastSyncAttempt || app.lastModified) }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Sent
                </span>
                <button
                  @click="deleteApplication(app.applicationId)"
                  class="text-sm text-gray-600 hover:text-red-600 font-medium px-2 py-1 rounded border border-gray-300 hover:border-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Draft Applications -->
      <div v-if="applications.drafts.length > 0" class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Draft Applications</h2>
          <p class="text-sm text-gray-600">Incomplete applications saved locally</p>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="app in applications.drafts"
            :key="app.applicationId"
            class="px-6 py-4 hover:bg-gray-50"
          >
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ getApplicationTitle(app) }}</p>
                  <p class="text-sm text-gray-500 break-all">{{ app.applicationId }}</p>
                  <p class="text-xs text-gray-400">Modified: {{ formatDate(app.lastModified) }}</p>
                </div>
                <div class="flex-shrink-0 ml-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Draft
                  </span>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button
                  @click="continueApplication(app)"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[40px]"
                >
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Continue
                </button>
                <button
                  @click="deleteApplication(app.applicationId)"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-h-[40px]"
                >
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="stats.total === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
        <p class="mt-1 text-sm text-gray-500">Start creating applications to see them here</p>
        <div class="mt-6">
          <router-link
            to="/application/new"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create New Application
          </router-link>
        </div>
      </div>
    </main>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteConfirmation"
      type="danger"
      title="Delete Application"
      :message="`Are you sure you want to delete this application? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOfflineStore } from '@/stores/offlineStore'
import { useFormStore } from '@/stores/formStore'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const router = useRouter()
const offlineStore = useOfflineStore()
const formStore = useFormStore()

// Modal state
const showDeleteConfirmation = ref(false)
const applicationToDelete = ref(null)

// Computed properties
const applications = computed(() => offlineStore.applications)
const stats = computed(() => offlineStore.stats)
const networkStatus = computed(() => offlineStore.networkStatus)
const isSyncing = computed(() => offlineStore.isSyncing)
const syncError = computed(() => offlineStore.syncError)
const hasPendingApplications = computed(() => offlineStore.hasPendingApplications)

// Methods
const syncNow = async () => {
  try {
    const results = await offlineStore.syncNow()
    
    if (results.successful > 0) {
      alert(`Successfully synced ${results.successful} application(s)!`)
    }
    
    if (results.failed > 0) {
      alert(`${results.failed} application(s) failed to sync. Check the failed section for details.`)
    }
  } catch (error) {
    alert(`Sync failed: ${error.message}`)
  }
}

const retryApplication = async (applicationId) => {
  try {
    const success = await offlineStore.retryApplication(applicationId)
    if (success) {
      alert('Application submitted successfully!')
    } else {
      alert('Retry failed. Please check your connection and try again.')
    }
  } catch (error) {
    alert(`Retry failed: ${error.message}`)
  }
}

const continueApplication = (app) => {
  // Load the draft into the form store and navigate to the form
  try {
    // Reset form store and load draft data
    formStore.$reset()
    
    // Load the saved form data
    Object.assign(formStore.$state, app.formData)
    
    // Navigate to the application form
    router.push({ name: 'NewApplication' })
  } catch (error) {
    console.error('Error loading draft:', error)
    alert('Error loading draft application')
  }
}

const deleteApplication = (applicationId) => {
  applicationToDelete.value = applicationId
  showDeleteConfirmation.value = true
}

const confirmDelete = async () => {
  try {
    await offlineStore.deleteApplication(applicationToDelete.value)
    showDeleteConfirmation.value = false
    applicationToDelete.value = null
    // No need for alert - the UI will update automatically
  } catch (error) {
    console.error('Error deleting application:', error)
    showDeleteConfirmation.value = false
    applicationToDelete.value = null
    alert('Failed to delete application')
  }
}

const cancelDelete = () => {
  showDeleteConfirmation.value = false
  applicationToDelete.value = null
}

const getApplicationTitle = (app) => {
  const businessName = app.formData?.businessInfo?.legalName || 'Unnamed Business'
  const businessType = app.formData?.businessTypeCheck?.type || 'unknown'
  return `${businessName} (${formatBusinessType(businessType)})`
}

const formatBusinessType = (type) => {
  switch (type) {
    case 'sole_trader': return 'Sole Trader'
    case 'limited_company': return 'Ltd Company'
    case 'partnership': return 'Partnership'
    default: return 'Unknown'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize
onMounted(async () => {
  await offlineStore.initialize()
  await offlineStore.loadApplications()
})
</script>
