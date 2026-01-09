import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import ApplicationForm from '@/views/ApplicationForm.vue'
import OfflineQueue from '@/views/OfflineQueue.vue'
import ResetPassword from '@/views/ResetPassword.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/application/new',
    name: 'NewApplication',
    component: ApplicationForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/offline-queue',
    name: 'OfflineQueue',
    component: OfflineQueue,
    meta: { requiresAuth: true }
  },
  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Minimal auth guard: redirect protected routes to login if not authenticated
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check for password reset token in URL hash (Supabase verify endpoint redirects with hash params)
  // This MUST be checked BEFORE authentication checks to prevent redirect to login
  // Supabase redirects to: https://thepaymentsexpert.vercel.app/#access_token=...&type=recovery
  if (window.location.hash && to.path !== '/reset-password') {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const type = hashParams.get('type')
      
      if (type === 'recovery') {
        // Password reset token detected, redirect to reset password page
        // Use window.location to preserve hash explicitly (full page reload preserves hash)
        window.location.replace('/reset-password' + window.location.hash)
        return
      }
    } catch (e) {
      console.error('Error parsing hash params:', e)
    }
  }
  
  // Also check query params in case Supabase uses those instead
  if ((to.query?.type === 'recovery' || window.location.search.includes('type=recovery')) && to.path !== '/reset-password') {
    // Preserve hash if it exists
    const hashPart = window.location.hash ? window.location.hash : ''
    window.location.replace('/reset-password' + hashPart)
    return
  }
  
  // Don't redirect to login if we're on reset password page - allow unauthenticated access
  if (to.name === 'ResetPassword') {
    return next()
  }
  
  // Don't redirect authenticated users from login/reset pages
  if (to.name === 'Login' && authStore.user) {
    return next({ name: 'Home' })
  }
  
  // Redirect protected routes to login if not authenticated
  if (to.meta.requiresAuth && !authStore.user) {
    return next({ name: 'Login' })
  }
  
  next()
})

export default router
