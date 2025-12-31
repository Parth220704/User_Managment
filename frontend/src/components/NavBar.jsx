import { Link, useNavigate } from 'react-router-dom'

import { useAuth, isAdmin } from '../state/auth'

export function NavBar() {
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	if (!user) return null

	async function handleLogout() {
		await logout()
		navigate('/login')
	}

	return (
		<header className="nav">
			<div className="navLeft">
				<strong>User Management</strong>
				<nav className="navLinks">
					{user ? <Link to="/profile">Profile</Link> : null}
					{user && isAdmin(user) ? <Link to="/admin">Admin</Link> : null}
				</nav>
			</div>
			<div className="navRight">
				<span>
					{user.fullName} ({user.role})
				</span>
				<button className="btn secondary" onClick={handleLogout}>
					Logout
				</button>
			</div>
		</header>
	)
}
