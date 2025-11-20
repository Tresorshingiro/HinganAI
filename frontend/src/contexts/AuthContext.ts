import { createContext } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import type { UserProfile } from '../types/database'

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)