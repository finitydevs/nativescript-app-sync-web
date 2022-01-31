/* eslint-disable react/jsx-no-constructed-context-values */
import {
  createContext,
  useEffect,
  useState
} from 'react'
import type { ReactNode } from 'react'
import jwtDecode from 'jwt-decode'
import { setTokens } from 'src/utils/auth'
import type { User } from 'src/types/user'
import * as api from 'src/api'

interface AuthState {
  isInitialized: boolean
  isAuthenticated: boolean
  user: User | null
}

interface SignIn {
  email: string
  password: string
}

interface AuthContextValue extends AuthState {
  login: (data: SignIn) => Promise<any>,
  logout: () => void,
  register: (email: string, name: string, password: string) => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null
}

const isValidToken = (accessToken: string): boolean => {
  if (!accessToken) {
    return false
  }

  const decoded = jwtDecode<{ exp: number }>(accessToken)
  const currentTime = Date.now() / 1000

  return decoded.exp > currentTime
}

const AuthContext = createContext<AuthContextValue>({
  ...initialAuthState,
  login: () => Promise.resolve(),
  logout: () => { },
  register: () => Promise.resolve()
})

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isInitialized: false,
    isAuthenticated: false,
    user: null
  })

  const login = async (data: SignIn) => {
    const res = await api.login(data.email, data.password)

    if (res.data.tokens) {
      setTokens(res.data.tokens)

      const auth = {
        ...state,
        isAuthenticated: true,
        user: null,
      }

      setState(auth)
      return res
    }

    return res
  }

  const logout = () => {
    setTokens('')
    setState({
      ...state,
      isInitialized: true,
      isAuthenticated: false,
      user: null
    })
  }

  const register = async (_email: string, _name: string, _password: string) => { }

  useEffect(() => {
    const initialise = () => {
      const accessToken = window.localStorage.getItem('token')

      if (accessToken && isValidToken(accessToken)) {
        // TODO implement a getCurrentUser
        // client.query<GetCurrentUserQuery>({
        //   query: QUERY_GET_CURRENT_USER,
        //   fetchPolicy: 'no-cache'
        // }).then((t) => {
        //   // Token most likely valid but not for the server
        //   if (!t.data.getCurrentUser) {
        //     setState({
        //       ...state,
        //       isInitialized: true,
        //       isAuthenticated: false
        //     })
        //   } else {
        //     setState({
        //       ...state,
        //       isInitialized: true,
        //       isAuthenticated: true,
        //       user: t.data.getCurrentUser
        //     })
        //   }
        // })
        //   .catch(() => {
        //     setState({
        //       ...state,
        //       isInitialized: true,
        //       isAuthenticated: false
        //     })
        //   })
      } else {
        setState({
          ...state,
          isInitialized: true,
          isAuthenticated: false
        })
      }
    }

    initialise()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
