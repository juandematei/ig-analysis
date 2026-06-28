import { useState, useCallback } from 'react'

export default function DropZone({ label, hint, loaded, error, onFile }) {
  const [dragging, setDragging] = useState(false)

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }, [onFile])

  const borderColor = error ? '#ff3b30' : dragging ? '#007aff' : loaded ? '#34c759' : '#d0d0d0'
  const bg = dragging ? '#f0f7ff' : loaded ? '#f2fff5' : '#fafafa'

  return (
    <label
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 8, padding: '24px 16px',
        border: `2px dashed ${borderColor}`, borderRadius: 14,
        cursor: 'pointer', minHeight: 130, background: bg,
        transition: 'all 0.15s', userSelect: 'none', textAlign: 'center',
      }}
    >
      <input type="file" accept=".json" onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]) }} style={{ display: 'none' }} />
      <div style={{ fontSize: 22, color: loaded ? '#34c759' : '#bbb', fontWeight: 700 }}>
        {loaded ? '✓' : '+'}
      </div>
      <div style={{ fontWeight: 600, fontSize: 13, color: loaded ? '#2d9e4e' : '#444', wordBreak: 'break-all' }}>
        {loaded || label}
      </div>
      <div style={{ fontSize: 11, color: error ? '#ff3b30' : '#999' }}>
        {error || hint}
      </div>
    </label>
  )
}
