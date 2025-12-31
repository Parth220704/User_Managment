import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth, isAdmin } from '../state/auth'
import { isValidEmail } from './validation'

export function LoginPage() {
	const { login } = useAuth()
	const navigate = useNavigate()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const emailError = useMemo(() => {
		if (!email) return 'Email is required'
		if (!isValidEmail(email)) return 'Invalid email format'
		return ''
	}, [email])

	const passwordError = useMemo(() => {
		if (!password) return 'Password is required'
		return ''
	}, [password])

	async function onSubmit(e) {
		e.preventDefault()
		if (emailError || passwordError) return

		try {
			setSubmitting(true)
			const user = await login({ email, password })
			toast.success('Logged in')
			navigate(isAdmin(user) ? '/admin' : '/dashboard')
		} catch (err) {
			const message = err?.response?.data?.error?.message || 'Login failed'
			toast.error(message)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="authWrap">
			<div className="card authCard">
				<h2>Login</h2>
				<form onSubmit={onSubmit} className="form">
				<label>
					Email
					<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
					{emailError ? <div className="fieldError">{emailError}</div> : null}
				</label>

				<label>
					Password
					<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
					{passwordError ? <div className="fieldError">{passwordError}</div> : null}
				</label>

					<button className="btn primary" disabled={submitting} type="submit">
						{submitting ? 'Signing in…' : 'Login'}
					</button>
				</form>
				<p style={{ marginTop: 12, color: 'var(--muted)' }}>
					No account? <Link to="/signup">Sign up</Link>
				</p>
			</div>
		</div>
	)
}
