export function Pagination({ page, total, limit, onPageChange }) {
	const totalPages = Math.max(Math.ceil(total / limit), 1)
	return (
		<div className="pagination">
			<button className="btn secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
				Prev
			</button>
			<span>
				Page {page} / {totalPages}
			</span>
			<button
				className="btn secondary"
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}
			>
				Next
			</button>
		</div>
	)
}
