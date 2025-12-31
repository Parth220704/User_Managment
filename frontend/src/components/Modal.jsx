export function Modal({ open, title, children, onClose, actions }) {
	if (!open) return null
	return (
		<div className="modalOverlay" role="dialog" aria-modal="true">
			<div className="modal">
				<div className="modalHeader">
					<h3 style={{ margin: 0 }}>{title}</h3>
				</div>
				<div className="modalBody">{children}</div>
				<div className="modalFooter">
					<button className="btn secondary" onClick={onClose}>
						Cancel
					</button>
					{actions}
				</div>
			</div>
		</div>
	)
}
