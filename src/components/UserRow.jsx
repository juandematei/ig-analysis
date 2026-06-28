function profileUrl(href) {
  return (href || '').replace('/_u/', '/')
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function UserRow({ user, isWhitelisted, onToggleWhitelist, isLast, dateLabel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '10px 20px',
      borderBottom: isLast ? 'none' : '1px solid #f5f5f5', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: '#f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: '#888', fontWeight: 600, flexShrink: 0,
      }}>
        {(user.username?.[0] || '?').toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={profileUrl(user.href)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#111', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}
        >
          @{user.username}
        </a>
        {user.timestamp > 0 && (
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
            {dateLabel || 'Seguido el'} {formatDate(user.timestamp)}
          </div>
        )}
      </div>
      {onToggleWhitelist && (
        <button
          onClick={() => onToggleWhitelist(user.username)}
          title={isWhitelisted ? 'Quitar de exclusiones' : 'Excluir de la lista'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: isWhitelisted ? '#ff9500' : '#ddd',
            padding: '2px 6px', flexShrink: 0, lineHeight: 1,
          }}
        >
          {isWhitelisted ? '★' : '☆'}
        </button>
      )}
      <a
        href={profileUrl(user.href)}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 12, color: '#007aff', background: '#f0f7ff',
          padding: '4px 10px', borderRadius: 20, textDecoration: 'none',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        Ver perfil
      </a>
    </div>
  )
}
