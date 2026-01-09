import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email || '',
    userName: (state) => state.user?.user_metadata?.full_name || state.user?.email || ''
  },

  actions: {
    async checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session) {
          this.session = session
          this.user = session.user
        }
      } catch (error) {
        console.error('Session check error:', error)
        this.error = error.message
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        this.session = data.session
        this.user = data.user
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async signUp(email, password, fullName) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        })
        
        if (error) throw error
        
        return { success: true, data }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        this.user = null
        this.session = null
      } catch (error) {
        console.error('Logout error:', error)
        this.error = error.message
      }
    },

    async resetPassword(email) {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })
        
        if (error) throw error
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updatePassword(newPassword) {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (error) throw error
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    }
  }
})
