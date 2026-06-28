export function exportToCsv(users, filename = 'ig_export.csv') {
  const rows = [
    ['usuario', 'perfil', 'fecha_seguimiento'],
    ...users.map(u => [
      u.username,
      (u.href || '').replace('/_u/', '/'),
      u.timestamp ? new Date(u.timestamp * 1000).toLocaleDateString('es-AR') : '',
    ]),
  ]
  // Quote every field and join; BOM ensures Excel opens UTF-8 correctly
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), { href: url, download: filename }).click()
  URL.revokeObjectURL(url)
}
