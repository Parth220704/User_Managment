import { Navigate, Outlet } from 'react-router-dom'

import { isAdmin, useAuth } from '../state/auth'
import { Spinner } from '../components/Spinner'

export function RequireAuth() {
	const { token, loading } = useAuth()
	if (loading) return <Spinner />
	if (!token) return <Navigate to="/login" replace />
	return <Outlet />
}

export function RequireAdmin() {
	const { user, loading } = useAuth()
	if (loading) return <Spinner />
	if (!user) return <Navigate to="/login" replace />
	if (!isAdmin(user)) return <Navigate to="/profile" replace />
	return <Outlet />
}
