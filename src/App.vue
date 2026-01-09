<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
  
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/services/supabase'

const router = useRouter()
const authStore = useAuthStore()
const appError = ref('')
let authSubscription = null

onMounted(async () => {
  try {
    // Check for missing environment variables first
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
      appError.value = 'Missing Supabase environment variables. Please configure your .env file.'
      return
    }

    // Check for password reset token in URL hash first
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = hashParams.get('type')
    
    if (type === 'recovery') {
      // Password reset link detected, route to reset password page
      router.push('/reset-password')
      return
    }

    // Check for existing session on app load
    await authStore.checkSession()
    
    // Listen for auth state changes (e.g., when Supabase processes hash tokens)
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Password recovery token detected, route to reset password
        router.push('/reset-password')
      }
    })
    
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

onUnmounted(() => {
  // Cleanup subscription
  if (authSubscription?.data?.subscription) {
    authSubscription.data.subscription.unsubscribe()
  }
})
    
  } catch (error) {
    appError.value = error.message || 'Failed to initialize application'
  }
})
</script>
