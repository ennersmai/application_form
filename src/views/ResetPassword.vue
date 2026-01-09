<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo/Header -->
      <div>
        <div class="flex justify-center mb-4">
          <img
            :src="logoUrl"
            alt="The Payments Expert"
            class="h-16 sm:h-20 md:h-24 w-auto"
            @error="handleLogoError"
          />
        </div>
        <h2 class="mt-2 text-center text-2xl font-extrabold text-gray-900">
          {{ isResetMode ? 'Reset Your Password' : 'Forgot Password' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isResetMode 
            ? 'Enter your new password below' 
            : 'Enter your email address and we\'ll send you a password reset link' }}
        </p>
      </div>

      <!-- Reset Password Form -->
      <form v-if="isResetMode" class="mt-8 space-y-6" @submit.prevent="handlePasswordReset">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="newPassword" class="sr-only">New Password</label>
            <input
              id="newPassword"
              v-model="password"
              name="newPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="New Password"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="confirmPassword" class="sr-only">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Confirm New Password"
              :disabled="loading"
              :class="{ 'border-red-300': passwordMismatch }"
            />
            <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">
              Passwords do not match
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800">Password reset successfully! Redirecting to login...</p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading || passwordMismatch || !password || !confirmPassword"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Resetting Password...' : 'Reset Password' }}
          </button>
        </div>
      </form>

      <!-- Forgot Password Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <div class="rounded-md shadow-sm">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800">
                Password reset email sent! Please check your inbox and follow the link to reset your password.
              </p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </div>
      </form>

      <!-- Back to Login -->
      <div class="text-center">
        <router-link
          to="/login"
          class="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/services/supabase'

const router = useRouter()
const authStore = useAuthStore()

const isResetMode = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = computed(() => authStore.loading)
const error = ref('')
const success = ref(false)

import logoImg from '@/assets/images/the_payments_expert.png'
const logoUrl = computed(() => logoImg)

const passwordMismatch = computed(() => {
  return confirmPassword.value && password.value !== confirmPassword.value
})

// Check if we're in password reset mode (has recovery session)
const checkResetMode = async () => {
  try {
    // Check URL hash for type=recovery (this is how Supabase sends the reset link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = hashParams.get('type')
    
    if (type === 'recovery') {
      // Recovery token in URL hash - Supabase should automatically process this
      // Wait briefly for Supabase to process the hash tokens and create a session
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        error.value = 'Invalid or expired reset link. Please request a new one.'
        isResetMode.value = false
      } else if (session) {
        // Session created from recovery token
        isResetMode.value = true
      } else {
        // No session yet, but we have the token - wait a bit more
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (retrySession) {
            isResetMode.value = true
          } else {
            error.value = 'Unable to process reset link. Please request a new one.'
            isResetMode.value = false
          }
        }, 1000)
      }
    } else {
      // No recovery token, show forgot password form
      isResetMode.value = false
    }
  } catch (err) {
    console.error('Error checking reset mode:', err)
    error.value = 'Error processing reset link. Please try again.'
    isResetMode.value = false
  }
}

const handleForgotPassword = async () => {
  error.value = ''
  success.value = false
  
  const result = await authStore.resetPassword(email.value)
  
  if (result.success) {
    success.value = true
    email.value = ''
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } else {
    error.value = result.error
  }
}

const handlePasswordReset = async () => {
  error.value = ''
  success.value = false
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  const result = await authStore.updatePassword(password.value)
  
  if (result.success) {
    success.value = true
    
    // Sign out after password reset to force login with new password
    await authStore.logout()
    
    // Clear URL hash to remove tokens
    window.history.replaceState(null, '', window.location.pathname)
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    error.value = result.error
  }
}

const handleLogoError = (event) => {
  event.target.style.display = 'none'
  const fallbackText = document.createElement('h2')
  fallbackText.className = 'text-center text-3xl font-extrabold text-gray-900'
  fallbackText.textContent = 'The Payments Expert'
  event.target.parentNode.appendChild(fallbackText)
}

onMounted(async () => {
  // Check for password reset mode
  await checkResetMode()
  
  // Listen for auth state changes (Supabase processes hash tokens asynchronously)
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || (event === 'TOKEN_REFRESHED' && session)) {
      // Recovery token processed, enable reset mode
      isResetMode.value = true
    }
  })
})
</script>
