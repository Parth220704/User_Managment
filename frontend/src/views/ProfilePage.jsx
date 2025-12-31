import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useAuth } from '../state/auth'

export function ProfilePage() {
	const { user, api, fetchMe } = useAuth()

	const [editing, setEditing] = useState(false)
	const [fullName, setFullName] = useState(user?.fullName || '')
	const [email, setEmail] = useState(user?.email || '')

	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')

	const [saving, setSaving] = useState(false)
	const [changingPw, setChangingPw] = useState(false)

	const changedProfile = useMemo(
		() => fullName !== (user?.fullName || '') || email !== (user?.email || ''),
		[email, fullName, user],
	)

	async function saveProfile() {
		try {
			setSaving(true)
			await api.put('/api/users/me', { fullName, email })
			await fetchMe()
			toast.success('Profile updated')
			setEditing(false)
		} catch (err) {
			toast.error(err?.response?.data?.error?.message || 'Update failed')
		} finally {
			setSaving(false)
		}
	}

	function cancelEdit() {
		setFullName(user?.fullName || '')
		setEmail(user?.email || '')
		setEditing(false)
	}

	async function changePassword() {
		try {
			setChangingPw(true)
			await api.put('/api/users/me/password', { currentPassword, newPassword })
			toast.success('Password updated')
			setCurrentPassword('')
			setNewPassword('')
		} catch (err) {
			toast.error(err?.response?.data?.error?.message || 'Change password failed')
		} finally {
			setChangingPw(false)
		}
	}

	if (!user) return null

	return (
		<div>
			<h2>User Profile</h2>
			<div className="card">
				<div className="form">
					<label>
						Full name
						<input disabled={!editing} value={fullName} onChange={(e) => setFullName(e.target.value)} />
					</label>
					<label>
						Email
						<input disabled={!editing} value={email} onChange={(e) => setEmail(e.target.value)} />
					</label>

					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
						{!editing ? (
							<button className="btn primary" onClick={() => setEditing(true)}>
								Edit
							</button>
						) : (
							<>
								<button
									className="btn primary"
									disabled={!changedProfile || saving}
									onClick={saveProfile}
								>
									{saving ? 'Saving…' : 'Save'}
								</button>
								<button className="btn secondary" onClick={cancelEdit} disabled={saving}>
									Cancel
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="card" style={{ marginTop: 16 }}>
				<h3 style={{ marginTop: 0 }}>Change password</h3>
				<div className="form">
					<label>
						Current password
						<input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" />
					</label>
					<label>
						New password
						<input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
					</label>
					<button
						className="btn primary"
						disabled={changingPw || !currentPassword || !newPassword}
						onClick={changePassword}
					>
						{changingPw ? 'Updating…' : 'Update password'}
					</button>
				</div>
			</div>
		</div>
	)
}
