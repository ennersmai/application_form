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
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isSignUp ? 'Create your agent account' : 'Sign in to submit merchant applications' }}
        </p>
      </div>

      <!-- Login/SignUp Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <!-- Full Name Input (only for sign up) -->
          <div v-if="isSignUp">
            <label for="fullName" class="sr-only">Full Name</label>
            <input
              id="fullName"
              v-model="credentials.fullName"
              name="fullName"
              type="text"
              autocomplete="name"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Full Name"
              :disabled="loading"
            />
          </div>

          <!-- Email Input -->
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="credentials.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              :class="[
                'appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm',
                !isSignUp ? 'rounded-t-md' : ''
              ]"
              placeholder="Email address"
              :disabled="loading"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="credentials.password"
              name="password"
              type="password"
              :autocomplete="isSignUp ? 'new-password' : 'current-password'"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
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
            {{ loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign in') }}
          </button>
        </div>

        <!-- Toggle Sign Up/Sign In -->
        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            {{ isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}
          </button>
        </div>
      </form>


    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isSignUp = ref(false)
const credentials = ref({
  email: '',
  password: '',
  fullName: ''
})

const loading = computed(() => authStore.loading)
const error = ref('')
const isDevelopment = import.meta.env.DEV
import logoImg from '@/assets/images/the_payments_expert.png'
const logoUrl = computed(() => logoImg)

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  error.value = ''
  // Clear form when switching modes
  credentials.value = {
    email: '',
    password: '',
    fullName: ''
  }
}

const handleSubmit = async () => {
  error.value = ''
  
  if (isSignUp.value) {
    await handleSignUp()
  } else {
    await handleLogin()
  }
}

const handleLogin = async () => {
  const result = await authStore.login(credentials.value.email, credentials.value.password)
  
  if (result.success) {
    router.push({ name: 'Home' })
  } else {
    error.value = result.error
  }
}

const handleSignUp = async () => {
  const result = await authStore.signUp(credentials.value.email, credentials.value.password, credentials.value.fullName)
  
  if (result.success) {
    error.value = ''
    // Switch to login mode
    isSignUp.value = false
    credentials.value.password = ''
    credentials.value.fullName = ''
  } else {
    error.value = result.error
  }
}

const handleLogoError = (event) => {
  // Fallback to text if logo fails to load
  event.target.style.display = 'none'
  const fallbackText = document.createElement('h2')
  fallbackText.className = 'text-center text-3xl font-extrabold text-gray-900'
  fallbackText.textContent = 'The Payments Expert'
  event.target.parentNode.appendChild(fallbackText)
}
</script>
