export function Spinner({ label = 'Loading…' }) {
	return (
		<div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
			<div className="spinner" aria-hidden="true" />
			<span>{label}</span>
		</div>
	)
}
