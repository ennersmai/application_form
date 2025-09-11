<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile-first Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <img 
              src="images/the_payments_expert.png" 
              alt="The Payments Expert" 
              class="h-8 sm:h-10 w-auto"
              @error="handleLogoError"
            />
            <span v-if="showFallbackText" class="text-xl font-semibold">The Payments Expert</span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700 hidden sm:block">{{ userName }}</span>
            <button
              @click="handleLogout"
              class="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Welcome Section -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {{ userName }}
          </h2>
          <p class="text-gray-600">
            Submit new merchant applications or manage your pending submissions.
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- New Application Card -->
          <div 
            @click="router.push({ name: 'NewApplication' })"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">New Application</h3>
                <p class="text-sm text-gray-500">Start a new merchant application</p>
              </div>
            </div>
          </div>

          <!-- Offline Queue Card -->
          <div 
            @click="router.push({ name: 'OfflineQueue' })"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Offline Queue</h3>
                <p class="text-sm text-gray-500">
                  <span v-if="offlineCount > 0" class="text-orange-600 font-medium">
                    {{ offlineCount }} pending submission{{ offlineCount !== 1 ? 's' : '' }}
                  </span>
                  <span v-else>
                    View saved applications
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity (placeholder for future) -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Submissions</h3>
          <p class="text-gray-500 text-sm">Your recent submissions will appear here.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useOfflineStore } from '@/stores/offlineStore'

const router = useRouter()
const authStore = useAuthStore()
const offlineStore = useOfflineStore()

const userName = computed(() => authStore.userName)
const offlineCount = computed(() => offlineStore.totalPendingSync)
const showFallbackText = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'Login' })
}

const handleLogoError = () => {
  showFallbackText.value = true
}

// Initialize offline store on home page
onMounted(async () => {
  await offlineStore.initialize()
  await offlineStore.loadApplications()
})
</script>
