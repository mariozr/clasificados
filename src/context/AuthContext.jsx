import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithPassword = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.href.split('#')[0].split('?')[0]
      }
    })
    if (error) throw error
    return data
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href.split('#')[0].split('?')[0] },
    })
    if (error) throw error
  }, [])

  const signInWithFacebook = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.href.split('#')[0].split('?')[0] },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const getUserName = useCallback(() => {
    if (!user) return ''
    return user.user_metadata?.full_name || user.email.split('@')[0]
  }, [user])

  const isSuperUser = Boolean(
    user?.email && (
      import.meta.env.VITE_ADMIN_EMAIL === user.email ||
      import.meta.env.VITE_ADMIN_EMAILS?.split(',').includes(user.email) ||
      user.email === 'admin@clasificados.com' // Fallback for testing
    )
  )

  const value = {
    user,
    loading,
    isSuperUser,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    getUserName,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
