<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
  
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const appError = ref('')

onMounted(async () => {
  try {
    // Check for missing environment variables first
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      appError.value = 'Missing Supabase environment variables. Please configure your .env file.'
      return
    }

    // Check for existing session on app load
    await authStore.checkSession()
    
    // Handle initial routing
    const currentPath = router.currentRoute.value.path
    
    if (currentPath === '/' && !authStore.user) {
      // Not authenticated and on home page, redirect to login
      router.push('/login')
    } else if (currentPath === '/login' && authStore.user) {
      // Authenticated but on login page, redirect to home
      router.push('/')
    }
    
  } catch (error) {
    appError.value = error.message || 'Failed to initialize application'
  }
})
</script>
