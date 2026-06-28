import { useState, useMemo } from 'react'
import DropZone from '../components/DropZone'
import UserRow from '../components/UserRow'
import Pagination from '../components/Pagination'
import { parseFollowers, diffSnapshots } from '../utils/parseInstagram'
import { exportToCsv } from '../utils/exportCsv'

async function readJson(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = e => {
      try { resolve(JSON.parse(e.target.result)) }
      catch { reject(new Error('JSON inválido')) }
    }
    r.onerror = reject
    r.readAsText(file)
  })
}

const EMPTY_SNAP = {
  followers: null, followersName: '', followersError: null,
}

const PER_PAGE = 50

function ResultList({ title, subtitle, color, users, dateLabel, csvName }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil((users?.length || 0) / PER_PAGE)
  const paginated = (users || []).slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700, color }}>{title}</span>
          <span style={{ fontSize: 13, color: '#aaa', marginLeft: 8 }}>({users?.length ?? 0})</span>
          {subtitle && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {users?.length > 0 && (
          <button
            onClick={() => exportToCsv(users, csvName)}
            style={{
              fontSize: 12, color: '#007aff', background: '#f0f7ff',
              border: 'none', padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
            }}
          >
            Exportar CSV
          </button>
        )}
      </div>

      {!users?.length ? (
        <p style={{ color: '#bbb', fontSize: 13, margin: 0 }}>Sin cambios en esta categoría.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {paginated.map((u, i) => (
            <UserRow key={u.username} user={u} isLast={i === paginated.length - 1} dateLabel={dateLabel} />
          ))}
          <Pagination page={page} totalPages={totalPages} total={users.length} perPage={PER_PAGE} onPage={setPage} />
        </div>
      )}
    </div>
  )
}

function SnapshotPanel({ label, snap, onFile }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 }}>{label}</div>
      <DropZone
        label="followers_1.json"
        hint="Archivo de seguidores"
        loaded={snap.followersName}
        error={snap.followersError}
        onFile={f => onFile(f)}
      />
      {snap.followers && (
        <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0' }}>
          {snap.followers.length.toLocaleString()} seguidores
        </p>
      )}
    </div>
  )
}

export default function CompareView() {
  const [snap1, setSnap1] = useState(EMPTY_SNAP)
  const [snap2, setSnap2] = useState(EMPTY_SNAP)

  const loadSnap = (setter) => async (file) => {
    if (!file) return
    try {
      const json = await readJson(file)
      const parsed = parseFollowers(json)
      if (!parsed.length) throw new Error('No se encontraron datos')
      setter({ followers: parsed, followersName: file.name, followersError: null })
    } catch (err) {
      setter(s => ({ ...s, followersError: err.message }))
    }
  }

  const diff = useMemo(() => {
    if (!snap1.followers || !snap2.followers) return null
    return diffSnapshots(snap1.followers, snap2.followers)
  }, [snap1.followers, snap2.followers])

  return (
    <div style={{ padding: '24px 16px', maxWidth: 760, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>Comparar descargas</h2>
        <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
          Subí dos archivos <code style={{ background: '#f0f0f0', padding: '1px 5px', borderRadius: 4 }}>followers_1.json</code> de distintos momentos para ver quién te dejó de seguir.
        </p>
      </div>

      <div style={{
        background: '#fff', borderRadius: 16, padding: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 28,
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <SnapshotPanel label="Descarga anterior (más vieja)" snap={snap1} onFile={loadSnap(setSnap1)} />
          <div style={{ width: 1, background: '#f0f0f0', alignSelf: 'stretch' }} />
          <SnapshotPanel label="Descarga reciente (más nueva)" snap={snap2} onFile={loadSnap(setSnap2)} />
        </div>
      </div>

      {!diff && (
        <div style={{ textAlign: 'center', color: '#bbb', fontSize: 14, padding: '32px 0' }}>
          Cargá ambos archivos para ver los cambios.
        </div>
      )}

      {diff && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <ResultList
            title="Te dejaron de seguir"
            subtitle="Estaban en la descarga antigua, no en la nueva"
            color="#ff3b30"
            users={diff.unfollowers}
            dateLabel="Te seguía desde"
            csvName={`ig_unfollowers_${new Date().toISOString().slice(0, 10)}.csv`}
          />
          <ResultList
            title="Nuevos seguidores"
            subtitle="No estaban en la descarga antigua, aparecen en la nueva"
            color="#34c759"
            users={diff.newFollowers}
            dateLabel="Te sigue desde"
            csvName={`ig_new_followers_${new Date().toISOString().slice(0, 10)}.csv`}
          />
        </div>
      )}
    </div>
  )
}
