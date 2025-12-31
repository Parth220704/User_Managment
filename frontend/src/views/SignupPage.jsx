import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '../state/auth'
import { isValidEmail, passwordStrengthError } from './validation'

export function SignupPage() {
	const { signup, logout } = useAuth()
	const navigate = useNavigate()

	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const fullNameError = useMemo(() => (!fullName ? 'Full name is required' : ''), [fullName])
	const emailError = useMemo(() => {
		if (!email) return 'Email is required'
		if (!isValidEmail(email)) return 'Invalid email format'
		return ''
	}, [email])
	const passwordError = useMemo(() => passwordStrengthError(password), [password])
	const confirmError = useMemo(() => {
		if (!confirmPassword) return 'Confirm password is required'
		if (confirmPassword !== password) return 'Passwords do not match'
		return ''
	}, [confirmPassword, password])

	async function onSubmit(e) {
		e.preventDefault()
		if (fullNameError || emailError || passwordError || confirmError) return

		try {
			setSubmitting(true)
			await signup({ fullName, email, password })
			toast.success('Signup successful')
			// Per PDF: redirect to login on success. Ensure we are logged out.
			await logout()
			navigate('/login')
		} catch (err) {
			const message = err?.response?.data?.error?.message || 'Signup failed'
			toast.error(message)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="authWrap">
			<div className="card authCard">
				<h2>Sign up</h2>
				<form onSubmit={onSubmit} className="form">
				<label>
					Full name
					<input value={fullName} onChange={(e) => setFullName(e.target.value)} />
					{fullNameError ? <div className="fieldError">{fullNameError}</div> : null}
				</label>
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
				<label>
					Confirm password
					<input
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						type="password"
					/>
					{confirmError ? <div className="fieldError">{confirmError}</div> : null}
				</label>

					<button className="btn primary" disabled={submitting} type="submit">
						{submitting ? 'Creating…' : 'Create account'}
					</button>
				</form>
				<p style={{ marginTop: 12, color: 'var(--muted)' }}>
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</div>
		</div>
	)
}
