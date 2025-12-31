import { Navigate, Route, Routes } from 'react-router-dom'

import { NavBar } from '../components/NavBar'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth, isAdmin } from '../state/auth'
import { RequireAdmin, RequireAuth } from './guards'

import { LoginPage } from '../views/LoginPage'
import { SignupPage } from '../views/SignupPage'
import { AdminDashboard } from '../views/AdminDashboard'
import { ProfilePage } from '../views/ProfilePage'

function DashboardRedirect() {
	const { user, loading } = useAuth()
	if (loading) return null
	if (!user) return <Navigate to="/login" replace />
	return <Navigate to={isAdmin(user) ? '/admin' : '/profile'} replace />
}

export default function App() {
	const { user } = useAuth()
	return (
		<div>
			{user ? <NavBar /> : null}
			<ThemeToggle />
			<div className="container">
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />

					<Route element={<RequireAuth />}>
						<Route path="/dashboard" element={<DashboardRedirect />} />
						<Route path="/profile" element={<ProfilePage />} />
					</Route>

					<Route element={<RequireAdmin />}>
						<Route path="/admin" element={<AdminDashboard />} />
					</Route>

					<Route path="/" element={<Navigate to="/dashboard" replace />} />
					<Route path="*" element={<Navigate to="/dashboard" replace />} />
				</Routes>
			</div>
		</div>
	)
}
