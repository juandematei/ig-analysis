import { useState, useMemo } from 'react'
import StatCard from '../components/StatCard'
import UserRow from '../components/UserRow'
import Pagination from '../components/Pagination'
import { exportToCsv } from '../utils/exportCsv'

const PER_PAGE = 50

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más reciente' },
  { value: 'oldest', label: 'Más antiguo' },
  { value: 'alpha', label: 'Alfabético' },
]

const inputStyle = {
  padding: '7px 11px', borderRadius: 8,
  border: '1px solid #e0e0e0', fontSize: 13, outline: 'none',
  background: '#f9f9f9', color: '#111',
}

function applyFilters(list, search, dateFrom, dateTo, sort) {
  return list
    .filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()))
    .filter(u => !dateFrom || u.timestamp >= new Date(dateFrom + 'T00:00:00').getTime() / 1000)
    .filter(u => !dateTo || u.timestamp <= new Date(dateTo + 'T23:59:59').getTime() / 1000)
    .sort((a, b) => {
      if (sort === 'oldest') return a.timestamp - b.timestamp
      if (sort === 'alpha') return a.username.localeCompare(b.username)
      return b.timestamp - a.timestamp
    })
}

export default function DashboardView({ stats, whitelist, onToggleWhitelist }) {
  const [tab, setTab] = useState('notFollowing')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [showWhitelisted, setShowWhitelisted] = useState(false)

  const resetPage = () => setPage(1)

  const whitelistedList = useMemo(
    () => stats.notFollowingBack.filter(u => whitelist.has(u.username)),
    [stats.notFollowingBack, whitelist]
  )

  const filtered = useMemo(() => {
    const base = tab === 'notFollowing'
      ? stats.notFollowingBack.filter(u => !whitelist.has(u.username))
      : stats.fans
    return applyFilters(base, search, dateFrom, dateTo, sort)
  }, [tab, stats.notFollowingBack, stats.fans, whitelist, search, dateFrom, dateTo, sort])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const activeCount = stats.notFollowingBack.length - whitelistedList.length
  const dateLabel = tab === 'fans' ? 'Te sigue desde' : 'Seguido el'

  const hasFilters = search || dateFrom || dateTo

  return (
    <div style={{ padding: '24px 16px', maxWidth: 760, margin: '0 auto' }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Seguidores" value={stats.followersCount} color="#007aff" />
        <StatCard label="Seguidos" value={stats.followingCount} color="#5856d6" />
        <StatCard label="Mutuos" value={stats.mutual.length} color="#34c759" />
        <StatCard
          label="No te siguen de vuelta"
          value={activeCount}
          color="#ff3b30"
          sub={
            (stats.deletedCount > 0 ? `+ ${stats.deletedCount} eliminadas` : '') +
            (whitelistedList.length > 0 ? (stats.deletedCount > 0 ? ', ' : '') + `${whitelistedList.length} excluidas` : '') ||
            null
          }
        />
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Tabs + Export */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          {[
            { id: 'notFollowing', label: `No te siguen (${activeCount})` },
            { id: 'fans', label: `Fans (${stats.fans.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); resetPage() }}
              style={{
                padding: '14px 18px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? '#007aff' : '#666',
                borderBottom: `2px solid ${tab === t.id ? '#007aff' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => exportToCsv(filtered, `ig_${tab}_${new Date().toISOString().slice(0, 10)}.csv`)}
            style={{
              margin: '10px 14px', padding: '5px 12px', borderRadius: 8,
              border: '1px solid #e0e0e0', background: '#f9f9f9',
              fontSize: 12, cursor: 'pointer', color: '#333', fontWeight: 500,
            }}
          >
            Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid #f5f5f5',
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <input
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            style={{ ...inputStyle, flex: 1, minWidth: 140 }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); resetPage() }}
            title="Desde"
            style={{ ...inputStyle, width: 148 }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); resetPage() }}
            title="Hasta"
            style={{ ...inputStyle, width: 148 }}
          />
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); resetPage() }}
            style={{ ...inputStyle, width: 148, cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); resetPage() }}
              style={{ fontSize: 12, color: '#ff3b30', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Row count + whitelist toggle */}
        <div style={{
          padding: '7px 20px', borderBottom: '1px solid #f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>
            {hasFilters ? `${filtered.length} de ` : ''}{tab === 'notFollowing' ? activeCount : stats.fans.length} cuentas
          </span>
          {tab === 'notFollowing' && whitelistedList.length > 0 && (
            <button
              onClick={() => setShowWhitelisted(v => !v)}
              style={{ fontSize: 12, color: '#ff9500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {showWhitelisted ? 'Ocultar' : 'Ver'} {whitelistedList.length} excluida{whitelistedList.length !== 1 ? 's' : ''} (whitelist)
            </button>
          )}
        </div>

        {/* List */}
        {paginated.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#bbb', fontSize: 14 }}>
            {hasFilters ? 'Sin resultados para estos filtros.' : 'No hay cuentas en esta lista.'}
          </div>
        ) : (
          paginated.map((u, i) => (
            <UserRow
              key={u.username}
              user={u}
              isWhitelisted={whitelist.has(u.username)}
              onToggleWhitelist={tab === 'notFollowing' ? onToggleWhitelist : null}
              isLast={i === paginated.length - 1 && !showWhitelisted}
              dateLabel={dateLabel}
            />
          ))
        )}

        {/* Whitelisted section */}
        {showWhitelisted && whitelistedList.length > 0 && (
          <div style={{ borderTop: '1px solid #f5f5f5' }}>
            <div style={{ padding: '8px 20px', background: '#fffbf0', borderTop: '1px solid #f5e8b0', borderBottom: '1px solid #f5e8b0' }}>
              <span style={{ fontSize: 12, color: '#996600', fontWeight: 500 }}>
                Excluidas de la lista — clic en la estrella para restaurar
              </span>
            </div>
            {whitelistedList.map((u, i) => (
              <UserRow
                key={u.username}
                user={u}
                isWhitelisted
                onToggleWhitelist={onToggleWhitelist}
                isLast={i === whitelistedList.length - 1}
                dateLabel={dateLabel}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPage={setPage} />
      </div>

      <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 16 }}>
        Procesado 100% en tu navegador · nada se envía a servidores
      </p>
    </div>
  )
}
