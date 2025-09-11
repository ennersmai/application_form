import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import ApplicationForm from '@/views/ApplicationForm.vue'
import OfflineQueue from '@/views/OfflineQueue.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
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
  if (to.meta.requiresAuth && !authStore.user) return next({ name: 'Login' })
  if (to.name === 'Login' && authStore.user) return next({ name: 'Home' })
  next()
})

export default router
