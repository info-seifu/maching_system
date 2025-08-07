import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'SCHOOL' | 'STUDENT' | 'COMPANY'
}

// ゲストユーザーの定義
const GUEST_USERS = {
  admin: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@example.com',
    role: 'ADMIN' as const
  },
  student: {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'student@example.com',
    role: 'STUDENT' as const
  },
  company: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'company@example.com',
    role: 'COMPANY' as const
  }
}

export async function signInAsGuest(guestType: 'admin' | 'student' | 'company' = 'student'): Promise<User | null> {
  try {
    console.log('Signing in as guest:', guestType)
    
    // 開発環境でのみ有効
    if (process.env.NODE_ENV === 'production') {
      console.error('Guest mode is not available in production')
      return null
    }

    const guestUser = GUEST_USERS[guestType]
    
    // ローカルストレージにゲストセッション情報を保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_session', JSON.stringify({
        user: guestUser,
        timestamp: Date.now()
      }))
    }

    console.log('Guest login successful:', guestUser)
    return guestUser
  } catch (error) {
    console.error('Guest sign in error:', error)
    return null
  }
}

export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    console.log('Attempting to sign in with:', email)
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return null
    }

    console.log('Auth successful, user ID:', authData.user.id)

    // Wait a moment for potential database sync
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Try to get user profile from our users table with retry logic
    let userData = null
    let attempts = 0
    const maxAttempts = 3

    while (!userData && attempts < maxAttempts) {
      attempts++
      console.log(`Attempt ${attempts} to fetch user data...`)

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (error) {
        console.error(`Attempt ${attempts} - User data error:`, error)
        
        if (error.code === 'PGRST116') {
          // User not found, try to create it
          console.log('User not found, attempting to create...')
          
          const { data: newUserData, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email!,
              role: 'STUDENT'
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              continue
            }
          } else {
            userData = newUserData
            console.log('Created new user profile:', userData)
            break
          }
        } else if (error.message?.includes('schema cache')) {
          console.log('Schema cache issue, retrying...')
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
        }
      } else {
        userData = data
        console.log('Found existing user profile:', userData)
        break
      }
    }

    if (!userData) {
      console.error('Failed to get or create user profile after all attempts')
      return null
    }

    // Clear guest session if exists
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_session')
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return null
  }
}

export async function signUp(email: string, password: string, role: string = 'STUDENT'): Promise<User | null> {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError || !authData.user) {
      console.error('Auth signup error:', authError)
      return null
    }

    // Wait for trigger to potentially create user profile
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Try to get or create user profile
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // Create user profile manually if trigger didn't work
      const { data: newUserData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          role
        })
        .select()
        .single()

      if (insertError) {
        console.error('User profile creation error:', insertError)
        return null
      }
      userData = newUserData
    } else if (userError) {
      console.error('User profile fetch error:', userError)
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return null
  }
}

export async function signOut(): Promise<void> {
  try {
    // Clear guest session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_session')
    }
    
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Check for guest session first
    if (typeof window !== 'undefined') {
      const guestSession = localStorage.getItem('guest_session')
      if (guestSession) {
        const session = JSON.parse(guestSession)
        // Check if session is not too old (24 hours)
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
          console.log('Using guest session:', session.user)
          return session.user
        } else {
          // Remove expired session
          localStorage.removeItem('guest_session')
        }
      }
    }

    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return null
    }

    console.log('Getting current user for ID:', authUser.id)

    // Try to get user profile with retry logic
    let userData = null
    let attempts = 0
    const maxAttempts = 3

    while (!userData && attempts < maxAttempts) {
      attempts++
      console.log(`Attempt ${attempts} to fetch current user data...`)

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error(`Attempt ${attempts} - Get user error:`, error)
        
        if (error.code === 'PGRST116') {
          // User not found, try to create it
          console.log('Current user not found, attempting to create...')
          
          const { data: newUserData, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email!,
              role: 'STUDENT'
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating current user profile:', insertError)
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              continue
            }
          } else {
            userData = newUserData
            console.log('Created new current user profile:', userData)
            break
          }
        } else if (error.message?.includes('schema cache')) {
          console.log('Schema cache issue for current user, retrying...')
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
        }
      } else {
        userData = data
        console.log('Found existing current user profile:', userData)
        break
      }
    }

    if (!userData) {
      console.error('Failed to get or create current user profile after all attempts')
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// ゲストモードかどうかを判定する関数
export function isGuestMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('guest_session') !== null
}

// 開発環境かどうかを判定する関数
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production'
}
