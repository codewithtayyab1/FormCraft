import * as XLSX from 'xlsx'

/* ── Shared helpers ─────────────────────────────────────────────────────── */

function formatValue(value) {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join('; ')
  return String(value)
}

function buildTable(form, responses) {
  const headers = [
    ...(form.fields ?? []).map(f => f.label || `Field (${f.type})`),
    'Submitted at',
  ]

  const rows = responses.map(response =>
    [
      ...(form.fields ?? []).map(field => {
        const ans = response.answers?.find(a => a.fieldId === field.id)
        return formatValue(ans?.value)
      }),
      new Date(response.createdAt).toLocaleString(),
    ]
  )

  return { headers, rows }
}

function safeFilename(title) {
  return (title || 'form')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'form'
}

/* ── CSV ────────────────────────────────────────────────────────────────── */

function csvEscape(val) {
  const s = String(val ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export function downloadCSV(form, responses) {
  const { headers, rows } = buildTable(form, responses)

  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map(row => row.map(csvEscape).join(',')),
  ]

  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, `${safeFilename(form.title)}-responses.csv`)
}

/* ── Excel ──────────────────────────────────────────────────────────────── */

export function downloadXLSX(form, responses) {
  const { headers, rows } = buildTable(form, responses)

  const wsData = [headers, ...rows]
  const ws     = XLSX.utils.aoa_to_sheet(wsData)

  // Auto column widths (capped at 50 chars)
  ws['!cols'] = headers.map((h, i) => ({
    wch: Math.min(
      Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length), 12),
      50
    ),
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Responses')

  const buf  = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  triggerDownload(blob, `${safeFilename(form.title)}-responses.xlsx`)
}

/* ── Shared download trigger ────────────────────────────────────────────── */

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
