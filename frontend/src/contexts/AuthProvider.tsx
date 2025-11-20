import { useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { userService } from '@/lib/database'
import type { UserProfile } from '@/types/database'
import { AuthContext, type AuthContextType } from './AuthContext'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const loadUserProfile = useCallback(async (userId: string) => {
    // Prevent loading if already loaded for this user
    if (profileLoaded) {
      console.log('AuthProvider: Profile already loaded, skipping')
      return
    }
    
    try {
      console.log('AuthProvider: Loading profile for user', userId)
      setProfileLoaded(true) // Set this immediately to prevent duplicate calls
      
      const userProfile = await userService.getProfile(userId)
      console.log('AuthProvider: Profile loaded', userProfile?.full_name || 'No profile')
      setProfile(userProfile)
      
      // If no profile exists, create a basic one
      if (!userProfile) {
        console.log('AuthProvider: Creating basic profile')
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          const basicProfile: Omit<UserProfile, 'created_at' | 'updated_at'> = {
            id: userId,
            email: user.data.user.email!,
            full_name: user.data.user.user_metadata?.full_name || '',
            farm_location: '',
            farm_size: undefined,
            primary_crops: [],
            phone_number: '',
            avatar_url: '',
          }
          
          const result = await userService.createProfile(basicProfile)
          if (result.success && result.data) {
            setProfile(result.data)
            console.log('AuthProvider: Basic profile created')
          }
        }
      }
    } catch (error) {
      console.error('AuthProvider: Error loading profile:', error)
      setProfileLoaded(false) // Reset on error so it can be retried
    }
  }, [profileLoaded])

  useEffect(() => {
    let mounted = true;
    let initialSessionHandled = false;

    const initializeAuth = async () => {
      try {
        // Get initial session first
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return;

        console.log('AuthProvider: Checking initial session...', session ? 'Found user' : 'No user')
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          initialSessionHandled = true;
          await loadUserProfile(session.user.id)
        }
        
        setLoading(false)
        
        // Set up auth listener AFTER handling initial session
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) return;

          console.log('AuthProvider: Auth state change:', event)
          
          // Ignore the initial SIGNED_IN event that fires right after setup
          if (event === 'SIGNED_IN' && initialSessionHandled && newSession?.user?.id === session?.user?.id) {
            console.log('AuthProvider: Ignoring duplicate SIGNED_IN for current user')
            return
          }
          
          // Handle sign out
          if (event === 'SIGNED_OUT') {
            console.log('AuthProvider: User signed out')
            setSession(null)
            setUser(null)
            setProfile(null)
            setProfileLoaded(false)
            initialSessionHandled = false
            setLoading(false)
            return
          }
          
          // Handle actual new sign in
          if (event === 'SIGNED_IN' && newSession?.user && !profileLoaded) {
            console.log('AuthProvider: New user signing in')
            setSession(newSession)
            setUser(newSession.user)
            initialSessionHandled = true
            await loadUserProfile(newSession.user.id)
            setLoading(false)
            return
          }
          
          // Handle token refresh - just update session
          if (event === 'TOKEN_REFRESHED' && newSession) {
            console.log('AuthProvider: Token refreshed')
            setSession(newSession)
            setUser(newSession.user)
            return
          }
        })

        // Cleanup function
        return () => {
          subscription.unsubscribe()
        }
        
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
    // We want this to run only once on mount, ignore dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('AuthProvider: Starting signin for', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('AuthProvider: Signin response', { data, error })
      
      if (error?.message === 'Email not confirmed') {
        return { 
          error: { 
            ...error, 
            message: 'Please confirm your email or disable email confirmation in Supabase settings for development.' 
          } as AuthError 
        }
      }
      
      return { error }
    } catch (error) {
      console.error('AuthProvider: Signin error', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      setLoading(true)
      console.log('AuthProvider: Starting signup for', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || ''
          }
        }
      })

      console.log('AuthProvider: Signup response', { data, error })

      if (!error && data.user) {
        console.log('AuthProvider: User created, attempting to create profile')
        
        // Create profile regardless of email confirmation status (since we disabled it)
        const profileData: Omit<UserProfile, 'created_at' | 'updated_at'> = {
          id: data.user.id,
          email: data.user.email!,
          full_name: userData?.full_name || '',
          farm_location: userData?.farm_location || '',
          farm_size: userData?.farm_size,
          primary_crops: userData?.primary_crops || [],
          phone_number: userData?.phone_number || '',
          avatar_url: userData?.avatar_url || '',
        }

        try {
          const result = await userService.createProfile(profileData)
          if (result.success && result.data) {
            setProfile(result.data)
            console.log('AuthProvider: Profile created successfully', result.data)
          } else {
            console.error('AuthProvider: Profile creation failed', result.error)
          }
        } catch (profileError) {
          console.error('AuthProvider: Profile creation exception', profileError)
          // Don't fail the signup if profile creation fails
        }
      }

      return { error }
    } catch (error) {
      console.error('AuthProvider: Signup error', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setProfile(null)
        setSession(null)
      }
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return

    try {
      const result = await userService.updateProfile(user.id, updates)
      if (result.success && result.data) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

