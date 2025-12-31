import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { createApiClient } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ums_token'

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	const api = useMemo(() => createApiClient({ getToken: () => token }), [token])

	const persistToken = useCallback((nextToken) => {
		setToken(nextToken)
		if (nextToken) localStorage.setItem(STORAGE_KEY, nextToken)
		else localStorage.removeItem(STORAGE_KEY)
	}, [])

	const fetchMe = useCallback(async () => {
		if (!token) {
			setUser(null)
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			const res = await api.get('/api/auth/me')
			setUser(res.data.user)
		} catch {
			persistToken('')
			setUser(null)
		} finally {
			setLoading(false)
		}
	}, [api, persistToken, token])

	useEffect(() => {
		fetchMe()
	}, [fetchMe])

	const login = useCallback(
		async ({ email, password }) => {
			const res = await api.post('/api/auth/login', { email, password })
			persistToken(res.data.token)
			setUser(res.data.user)
			return res.data.user
		},
		[api, persistToken],
	)

	const signup = useCallback(
		async ({ fullName, email, password }) => {
			const res = await api.post('/api/auth/signup', { fullName, email, password })
			// Spec says token on signup; we store it but signup page still redirects to login.
			persistToken(res.data.token)
			setUser(res.data.user)
			return res.data.user
		},
		[api, persistToken],
	)

	const logout = useCallback(async () => {
		try {
			await api.post('/api/auth/logout')
		} catch {
			// ignore
		}
		persistToken('')
		setUser(null)
		toast.success('Logged out')
	}, [api, persistToken])

	const value = useMemo(
		() => ({ token, user, loading, api, login, signup, logout, fetchMe }),
		[token, user, loading, api, login, signup, logout, fetchMe],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

export function isAdmin(user) {
	return user?.role === 'admin'
}
