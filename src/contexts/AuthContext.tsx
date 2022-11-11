import { createContext, ReactNode, useState, useEffect } from 'react'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { api } from '../services/api'

interface UserProps {
  name: string
  avatarUrl: string
}

interface AuthProviderProps {
  children: ReactNode
}

export interface AuthContextData {
  user: UserProps
  isUserLoading: boolean
  signIn: () => Promise<void>
}

WebBrowser.maybeCompleteAuthSession()

export const AuthContext = createContext({} as AuthContextData)

export function AuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>({} as UserProps)
  const [isUserLoading, setIsUserLoading] = useState(false)

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email'],
  })

  async function signIn() {
    try {
      setIsUserLoading(true)
      await promptAsync()
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  async function signInWithGoogle(access_token: string) {
    try {
      setIsUserLoading(true)

      const tokeResponse = await api.post('/users', { access_token })
      api.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${tokeResponse.data.token}`

      const userInfoResponse = await api.get('/me')
      setUser(userInfoResponse.data.user)
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken)
    }
  }, [response])

  return (
    <AuthContext.Provider
      value={{
        user,
        isUserLoading,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
