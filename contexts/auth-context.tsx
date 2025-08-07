"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, getCurrentUser, signOut as authSignOut, isGuestMode } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  loading: boolean
  isGuest: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setIsGuest(isGuestMode())
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes (only for non-guest sessions)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip auth state changes if in guest mode
        if (isGuestMode()) {
          return
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
          setIsGuest(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsGuest(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = (user: User) => {
    setUser(user)
    setIsGuest(isGuestMode())
  }

  const logout = async () => {
    await authSignOut()
    setUser(null)
    setIsGuest(false)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
