import { useState } from 'react'
import DropZone from '../components/DropZone'
import { parseFollowers, parseFollowing } from '../utils/parseInstagram'

async function readJson(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = e => {
      try { resolve(JSON.parse(e.target.result)) }
      catch { reject(new Error('El archivo no es un JSON válido')) }
    }
    r.onerror = () => reject(new Error('Error al leer el archivo'))
    r.readAsText(file)
  })
}

export default function UploadView({ onDataLoaded }) {
  const [followers, setFollowers] = useState(null)
  const [following, setFollowing] = useState(null)
  const [names, setNames] = useState({ followers: '', following: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleFile = async (file, type) => {
    if (!file) return
    try {
      const json = await readJson(file)
      if (type === 'followers') {
        const parsed = parseFollowers(json)
        if (!parsed.length) throw new Error('No se encontraron datos de seguidores')
        setFollowers(parsed)
        setNames(n => ({ ...n, followers: file.name }))
        setErrors(e => ({ ...e, followers: null }))
      } else {
        const parsed = parseFollowing(json)
        if (!parsed.length) throw new Error('No se encontraron datos de seguidos')
        setFollowing(parsed)
        setNames(n => ({ ...n, following: file.name }))
        setErrors(e => ({ ...e, following: null }))
      }
    } catch (err) {
      setErrors(e => ({ ...e, [type]: err.message }))
    }
  }

  const handleAnalyze = () => {
    if (!followers || !following || loading) return
    setLoading(true)
    onDataLoaded(followers, following)
  }

  const ready = !!(followers && following)

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f5f7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 580 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', margin: 0 }}>IG Analysis</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 8, lineHeight: 1.6, maxWidth: 420, margin: '8px auto 0' }}>
            Subí tus archivos de Instagram para ver quién no te sigue de vuelta.
            Los datos se procesan en tu navegador y no salen de tu dispositivo.
          </p>
        </div>

        <div style={{
          background: '#fff', borderRadius: 20, padding: 28,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        }}>
          <p style={{ fontSize: 12, color: '#999', marginTop: 0, marginBottom: 18, lineHeight: 1.6 }}>
            En Instagram: <strong style={{ color: '#555' }}>Configuración → Tu actividad → Descargar tus datos</strong>.
            Seleccioná solo "Seguidores y seguidos". Los archivos quedan en{' '}
            <code style={{ background: '#f5f5f7', padding: '1px 5px', borderRadius: 4 }}>connections/followers_and_following/</code>.
          </p>

          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            <DropZone
              label="followers_1.json"
              hint="Quienes te siguen"
              loaded={names.followers}
              error={errors.followers}
              onFile={f => handleFile(f, 'followers')}
            />
            <DropZone
              label="following.json"
              hint="A quienes seguís"
              loaded={names.following}
              error={errors.following}
              onFile={f => handleFile(f, 'following')}
            />
          </div>

          {(followers || following) && (
            <p style={{ fontSize: 12, color: '#888', marginTop: -8, marginBottom: 16 }}>
              {followers ? followers.length.toLocaleString() + ' seguidores' : '—'} ·{' '}
              {following ? following.length.toLocaleString() + ' seguidos' : '—'} cargados
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!ready || loading}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
              background: ready ? '#007aff' : '#e5e5ea',
              color: ready ? '#fff' : '#aaa',
              fontSize: 15, fontWeight: 600,
              cursor: ready ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Cargando...' : 'Analizar'}
          </button>
        </div>
      </div>
    </div>
  )
}
