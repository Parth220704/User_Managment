import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useAuth } from '../state/auth'
import { Spinner } from '../components/Spinner'
import { Pagination } from '../components/Pagination'
import { Modal } from '../components/Modal'

export function AdminDashboard() {
	const { api } = useAuth()

	const [page, setPage] = useState(1)
	const limit = 10
	const [total, setTotal] = useState(0)
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)

	const [confirm, setConfirm] = useState({ open: false, userId: '', action: '' })

	const confirmationTitle = useMemo(() => {
		if (!confirm.open) return ''
		return confirm.action === 'activate' ? 'Activate user?' : 'Deactivate user?'
	}, [confirm])

	async function load() {
		try {
			setLoading(true)
			const res = await api.get(
				`/api/admin/users?page=${page}&limit=${limit}&excludeSelf=true&excludeRole=admin`,
			)
			// Fallback safety: never render admin accounts in the list.
			// The backend should already exclude via excludeRole=admin.
			setUsers((res.data.users || []).filter((u) => u?.role !== 'admin'))
			setTotal(res.data.total)
		} catch (err) {
			toast.error(err?.response?.data?.error?.message || 'Failed to load users')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page])

	function openConfirm(userId, action) {
		setConfirm({ open: true, userId, action })
	}

	async function runAction() {
		const { userId, action } = confirm
		try {
			const endpoint = action === 'activate' ? 'activate' : 'deactivate'
			await api.patch(`/api/admin/users/${userId}/${endpoint}`)
			toast.success(action === 'activate' ? 'User activated' : 'User deactivated')
			setConfirm({ open: false, userId: '', action: '' })
			await load()
		} catch (err) {
			toast.error(err?.response?.data?.error?.message || 'Action failed')
		}
	}

	if (loading) return <Spinner />

	return (
		<div>
			<h2>Admin Dashboard</h2>
			<div className="card" style={{ overflowX: 'auto' }}>
				<table className="table">
					<thead>
						<tr>
							<th>Email</th>
							<th>Full name</th>
							<th>Role</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u.id}>
								<td>{u.email}</td>
								<td>{u.fullName}</td>
								<td>
									<span className={`badge ${u.role === 'admin' ? 'badgeAdmin' : 'badgeUser'}`}>{u.role}</span>
								</td>
								<td>
									<span className={`badge ${u.status === 'active' ? 'badgeActive' : 'badgeInactive'}`}>
										{u.status}
									</span>
								</td>
								<td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
									<button
										className="btn primary"
										disabled={u.status === 'active'}
										onClick={() => openConfirm(u.id, 'activate')}
									>
										Activate
									</button>
									<button
										className="btn danger"
										disabled={u.status === 'inactive'}
										onClick={() => openConfirm(u.id, 'deactivate')}
									>
										Deactivate
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
			</div>

			<Modal
				open={confirm.open}
				title={confirmationTitle}
				onClose={() => setConfirm({ open: false, userId: '', action: '' })}
				actions={
					<button className={`btn ${confirm.action === 'activate' ? 'primary' : 'danger'}`} onClick={runAction}>
						Confirm
					</button>
				}
			>
				Are you sure you want to {confirm.action} this user?
			</Modal>
		</div>
	)
}
