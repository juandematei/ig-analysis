const btnStyle = (disabled) => ({
  padding: '6px 14px', borderRadius: 8, border: '1px solid #e0e0e0',
  background: disabled ? '#f5f5f5' : '#fff',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: 13, color: disabled ? '#bbb' : '#111',
})

export default function Pagination({ page, totalPages, total, perPage, onPage }) {
  if (totalPages <= 1) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  return (
    <div style={{
      padding: '12px 20px', borderTop: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <span style={{ fontSize: 13, color: '#888' }}>{from}–{to} de {total}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} style={btnStyle(page === 1)}>
          Anterior
        </button>
        <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={btnStyle(page === totalPages)}>
          Siguiente
        </button>
      </div>
    </div>
  )
}
