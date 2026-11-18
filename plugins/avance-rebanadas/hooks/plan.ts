// Lectura del avance desde la tabla `## Rebanadas` de un docs/plan.md (ciclo v3 de TI, ADR-0033).
// Sin dependencias del motor: se prueba con texto.

import type { Avance, Estado, Rebanada } from '../types'

// Minúsculas, sin tildes, sin negritas ni código, espacios simples.
export const normalizar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const ESTADOS: Record<string, Estado> = {
  aceptada: 'aceptada',
  'en revision': 'en revisión',
  'en curso': 'en curso',
  pendiente: 'pendiente',
}

export const leerEstado = (celda: string): Estado => ESTADOS[normalizar(celda)] ?? 'pendiente'

// Celdas de una fila de tabla Markdown; respeta `\|` dentro del texto.
const celdas = (fila: string): string[] => {
  const marca = '\u0000'
  const partes = fila.trim().replace(/\\\|/g, marca).replace(/^\|/, '').replace(/\|$/, '').split('|')
  return partes.map(p => p.split(marca).join('|').trim())
}

const esSeparador = (fila: string) => /^\|?\s*:?-{3,}/.test(fila.trim())

// La última sección `## Rebanadas…`, su primera tabla y la columna Estado (por nombre).
// Sin sección, sin tabla o sin columna Estado: null.
export const leerAvance = (texto: string): Avance | null => {
  const lineas = texto.split(/\r?\n/)
  let inicio = -1
  lineas.forEach((l, i) => {
    if (/^##\s+Rebanadas\b/i.test(l)) inicio = i
  })
  if (inicio < 0) return null

  const linea = (n: number) => lineas[n] ?? ''
  const esFila = (n: number) => linea(n).trim().startsWith('|')

  let i = inicio + 1
  while (i < lineas.length && !/^##\s/.test(linea(i)) && !esFila(i)) i++
  if (!esFila(i)) return null

  const encabezado = celdas(linea(i)).map(normalizar)
  const colEstado = encabezado.indexOf('estado')
  if (colEstado < 0) return null
  const colId = Math.max(0, encabezado.findIndex(c => c === '#' || c === 'rebanada'))
  const colQue = encabezado.indexOf('que veras')

  i++
  if (esSeparador(linea(i))) i++

  const rebanadas: Rebanada[] = []
  for (; esFila(i); i++) {
    const fila = celdas(linea(i))
    const id = (fila[colId] ?? '').replace(/[*`]/g, '').trim()
    if (id === '') continue
    rebanadas.push({
      id,
      queVeras: colQue >= 0 ? (fila[colQue] ?? '').replace(/[*`]/g, '').trim() : '',
      estado: leerEstado(fila[colEstado] ?? ''),
    })
  }
  if (rebanadas.length === 0) return null

  return {
    rebanadas,
    aceptadas: rebanadas.filter(r => r.estado === 'aceptada').length,
    total: rebanadas.length,
  }
}

export const siguiente = (avance: Avance): Rebanada | null =>
  avance.rebanadas.find(r => r.estado !== 'aceptada') ?? null

// Las rebanadas que pasaron a `aceptada` entre dos lecturas del mismo plan. Sin lectura anterior: ninguna.
export const recienAceptadas = (antes: Avance | null, despues: Avance | null): Rebanada[] => {
  if (antes === null || despues === null) return []
  const previas = new Map(antes.rebanadas.map(r => [r.id, r.estado]))
  return despues.rebanadas.filter(r => r.estado === 'aceptada' && previas.has(r.id) && previas.get(r.id) !== 'aceptada')
}

// La ruta de un archivo que tocó una herramienta: absoluta, con `/`.
export const rutaAbsoluta = (cwd: string, ruta: string): string =>
  /^([A-Za-z]:)?[\\/]/.test(ruta) ? unir(ruta) : unir(cwd, ruta)

export const porcentaje =(avance: Avance): number => Math.round((avance.aceptadas / avance.total) * 100)

// Rutas: siempre con `/`, sin `/` final (C:\Users\x → C:/Users/x).
export const unir = (...partes: string[]): string =>
  partes
    .map(p => p.replace(/\\/g, '/'))
    .join('/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '')

export const padre = (ruta: string): string | null => {
  const r = unir(ruta)
  const corte = r.lastIndexOf('/')
  if (corte <= 0) return null
  const arriba = r.slice(0, corte)
  return /^[A-Za-z]:$/.test(arriba) ? `${arriba}/` : arriba
}

export const nombre = (ruta: string): string => unir(ruta).split('/').filter(Boolean).pop() ?? ruta

// `ruta_local:` del frontmatter de una ficha de la wiki.
export const leerRutaLocal = (ficha: string): string | null => {
  const m = ficha.match(/^ruta_local:\s*["']?([^"'\r\n]+?)["']?\s*$/m)
  return m?.[1]?.trim() ?? null
}
