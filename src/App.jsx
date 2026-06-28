import { useState, useEffect, useMemo } from 'react'
import UploadView from './views/UploadView'
import DashboardView from './views/DashboardView'
import CompareView from './views/CompareView'
import { computeStats } from './utils/parseInstagram'

const WHITELIST_KEY = 'ig_whitelist_v1'

function loadWhitelist() {
  try { return new Set(JSON.parse(localStorage.getItem(WHITELIST_KEY) || '[]')) }
  catch { return new Set() }
}

const navBtn = (active) => ({
  background: active ? '#f0f7ff' : 'none',
  border: 'none', cursor: 'pointer', padding: '5px 12px', borderRadius: 8,
  fontSize: 14, fontWeight: active ? 600 : 400,
  color: active ? '#007aff' : '#555',
})

export default function App() {
  const [data, setData] = useState(null)
  const [whitelist, setWhitelist] = useState(loadWhitelist)
  const [view, setView] = useState('upload')

  useEffect(() => {
    localStorage.setItem(WHITELIST_KEY, JSON.stringify([...whitelist]))
  }, [whitelist])

  const stats = useMemo(
    () => data ? computeStats(data.followers, data.following) : null,
    [data]
  )

  const handleDataLoaded = (followers, following) => {
    setData({ followers, following })
    setView('dashboard')
  }

  const toggleWhitelist = (username) => {
    setWhitelist(prev => {
      const next = new Set(prev)
      next.has(username) ? next.delete(username) : next.add(username)
      return next
    })
  }

  if (view === 'upload') {
    return <UploadView onDataLoaded={handleDataLoaded} />
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f5f5f7', minHeight: '100vh' }}>
      <nav style={{
        background: '#fff', borderBottom: '1px solid #ebebeb',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{
          maxWidth: 760, margin: '0 auto', padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 6, height: 52,
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111', marginRight: 6 }}>IG Analysis</span>
          <button onClick={() => setView('dashboard')} style={navBtn(view === 'dashboard')}>
            Análisis
          </button>
          <button onClick={() => setView('compare')} style={navBtn(view === 'compare')}>
            Comparar
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setView('upload')}
            style={{
              background: 'none', border: '1px solid #e0e0e0', cursor: 'pointer',
              fontSize: 12, color: '#666', padding: '4px 10px', borderRadius: 6,
            }}
          >
            Nueva carga
          </button>
        </div>
      </nav>

      {view === 'dashboard' && stats && (
        <DashboardView stats={stats} whitelist={whitelist} onToggleWhitelist={toggleWhitelist} />
      )}
      {view === 'compare' && <CompareView />}
    </div>
  )
}
