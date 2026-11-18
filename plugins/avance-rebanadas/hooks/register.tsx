import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Avance, Estado, Proyecto } from '../types'
import {
  leerAvance,
  leerRutaLocal,
  nombre,
  padre,
  porcentaje,
  recienAceptadas,
  rutaAbsoluta,
  siguiente,
  unir,
} from './plan'

// Herramientas cuyo archivo dice en qué proyecto se está trabajando.
const HERRAMIENTAS_CON_RUTA = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'NotebookEdit']
// Al 100 %: la barra completa cambia a este color.
const COMPLETA = '#d4a72c'

// Cada cuánto se vuelve a leer el plan: lo bastante seguido para verlo «en vivo».
const RELECTURA_MS = 3000
// Cuántas carpetas se sube buscando docs/plan.md o la raíz de TI.
const NIVELES = 12

const COLOR: Record<Estado, string> = {
  aceptada: '#4caf6e',
  'en revisión': '#e2a94e',
  'en curso': '#5fa8d3',
  pendiente: '#8a8f8c',
}

const proyecto = atom({ plugin: 'avance-rebanadas', key: 'proyecto' } as const, null as Proyecto | null)
const avance = atom({ plugin: 'avance-rebanadas', key: 'avance' } as const, null as Avance | null)
// Cerrada con × o con `/avance`: oculta hasta que se vuelva a pedir.
const oculto = atom({ plugin: 'avance-rebanadas', key: 'oculto' } as const, false)

// Sube desde `desde` hasta encontrar una carpeta para la que `cumple` responde true.
const subir = async (desde: string, cumple: (dir: string) => Promise<boolean>) => {
  let dir: string | null = unir(desde)
  for (let n = 0; dir !== null && n < NIVELES; n++) {
    if (await cumple(dir)) return dir
    dir = padre(dir)
  }
  return null
}

const existe = ($: EngineInterface, ruta: string) => $.fs.exists(ruta).catch(() => false)

// El docs/plan.md más cercano hacia arriba desde `desde`, si tiene `## Rebanadas`.
export const buscarPlan = async ($: EngineInterface, desde: string): Promise<Proyecto | null> => {
  const dir = await subir(desde, d => existe($, unir(d, 'docs/plan.md')))
  if (dir === null) return null
  const plan = unir(dir, 'docs/plan.md')
  const texto = await $.fs.read(plan).catch(() => null)
  if (typeof texto !== 'string' || leerAvance(texto) === null) return null
  return { plan, nombre: nombre(dir), fijado: false }
}

// La raíz de TI: la carpeta con AGENTS.md y 50-conocimiento/proyectos.
const raizTI = ($: EngineInterface, desde: string) =>
  subir(
    desde,
    async d => (await existe($, unir(d, 'AGENTS.md'))) && (await existe($, unir(d, '50-conocimiento/proyectos'))),
  )

const releer = async ($: EngineInterface) => {
  const p = await read($, proyecto)
  if (p === null) return
  const texto = await $.fs.read(p.plan).catch(() => null)
  const nuevo = typeof texto === 'string' ? leerAvance(texto) : null
  const antes = await read($, avance)
  if (JSON.stringify(nuevo) === JSON.stringify(antes)) return
  await update($, avance, () => nuevo)

  // El momento de aceptar: un aviso por cada rebanada que pasó a aceptada.
  if (nuevo === null) return
  for (const r of recienAceptadas(antes, nuevo)) {
    $.ui.toast(`✔ ${r.id} aceptada · ${nuevo.aceptadas}/${nuevo.total} (${porcentaje(nuevo)} %)`, { timeoutMs: 8000 })
  }
}

// Carpetas ya revisadas en esta sesión: no se vuelve a subir por el mismo camino en cada llamada.
const revisadas = new Map<string, string | null>()

// Un archivo que tocó una herramienta: si es de un proyecto con rebanadas, la barra pasa a ese proyecto.
// `/avance <slug>` fijado manda sobre esto.
const seguirArchivo = async ($: EngineInterface, ruta: string) => {
  const actual = await read($, proyecto)
  if (actual?.fijado) return

  const absoluta = rutaAbsoluta(await $.session.cwd(), ruta)
  const carpeta = padre(absoluta) ?? absoluta
  let plan = revisadas.get(carpeta)
  if (plan === undefined) {
    const p = await buscarPlan($, absoluta)
    plan = p?.plan ?? null
    revisadas.set(carpeta, plan)
  }
  if (plan === null || plan === actual?.plan) return

  const dir = padre(padre(plan) ?? plan) ?? plan
  await fijar($, { plan, nombre: nombre(dir), fijado: false })
}

const fijar = async ($: EngineInterface, p: Proyecto | null) => {
  await update($, proyecto, () => p)
  await update($, avance, () => null)
  await releer($)
}

// `/avance <slug o ruta>`: el slug se busca en la ficha de la wiki (ruta_local).
const fijarPorArgumento = async ($: EngineInterface, arg: string): Promise<string> => {
  const cwd = await $.session.cwd()

  let carpeta: string
  let etiqueta: string
  if (/[\\/]/.test(arg)) {
    carpeta = /^([A-Za-z]:)?[\\/]/.test(arg) ? unir(arg) : unir(cwd, arg)
    etiqueta = nombre(carpeta)
  } else {
    const raiz = await raizTI($, cwd)
    if (raiz === null) return `No encontré la raíz de TI (AGENTS.md y 50-conocimiento) desde ${unir(cwd)}.`
    const ficha = await $.fs.read(unir(raiz, `50-conocimiento/proyectos/${arg}.md`)).catch(() => null)
    if (typeof ficha !== 'string') return `No hay ficha 50-conocimiento/proyectos/${arg}.md.`
    const ruta = leerRutaLocal(ficha)
    if (ruta === null) return `La ficha de ${arg} no tiene ruta_local.`
    carpeta = unir(raiz, ruta)
    etiqueta = arg
  }

  const plan = unir(carpeta, 'docs/plan.md')
  const texto = await $.fs.read(plan).catch(() => null)
  if (typeof texto !== 'string') return `No hay ${plan}.`
  const leido = leerAvance(texto)
  if (leido === null) return `${plan} no tiene una tabla «## Rebanadas» con columna Estado.`

  await fijar($, { plan, nombre: etiqueta, fijado: true })
  await update($, oculto, () => false)
  return `Barra de avance: ${etiqueta}, ${leido.aceptadas}/${leido.total} aceptadas (${porcentaje(leido)} %).`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    revisadas.clear()

    await $.command.register({
      name: 'avance',
      description: 'Barra de avance por rebanadas: sin nada la muestra u oculta; con un slug o una ruta la fija en ese proyecto; «auto» vuelve al de la carpeta',
    })

    const actual = await read($, proyecto)
    if (actual === null || !actual.fijado) await fijar($, await buscarPlan($, await $.session.cwd()))

    $.clock.every(RELECTURA_MS, () => releer($))

    return result
  })

  on('command.run', { command: 'avance' }, async ($, e) => {
    const arg = e.args.trim()

    if (arg === '') {
      if ((await read($, proyecto)) === null) {
        return { text: 'Esta carpeta no tiene docs/plan.md con rebanadas. Usa /avance <slug> para fijar un proyecto.' }
      }
      const ocultar = !(await read($, oculto))
      await update($, oculto, () => ocultar)
      return { text: ocultar ? 'Barra de avance oculta.' : 'Barra de avance visible.' }
    }

    if (arg === 'auto') {
      const p = await buscarPlan($, await $.session.cwd())
      await fijar($, p)
      await update($, oculto, () => false)
      return { text: p ? `Barra de avance: ${p.nombre}.` : 'Esta carpeta no tiene docs/plan.md con rebanadas.' }
    }

    return { text: await fijarPorArgumento($, arg) }
  })

  // Solo observa: siempre entrega la llamada intacta y mira el archivo después.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    if (HERRAMIENTAS_CON_RUTA.includes(e.tool)) {
      const campos = e as unknown as { file_path?: unknown; path?: unknown; notebook_path?: unknown }
      const ruta = [campos.file_path, campos.path, campos.notebook_path].find(v => typeof v === 'string' && v !== '')
      if (typeof ruta === 'string') await seguirArchivo($, ruta).catch(() => undefined)
    }
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const p = await read($, proyecto)
    const a = await read($, avance)
    if (e.props.hasSurvey || p === null || a === null || (await read($, oculto))) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const sig = siguiente(a)
    const completa = sig === null
    const angosto = e.props.bodyColumns < 60
    const cuenta = angosto ? `${a.aceptadas}/${a.total}` : `${a.aceptadas}/${a.total} aceptadas (${porcentaje(a)} %)`
    const detalle =
      completa
        ? 'Todas las rebanadas aceptadas · lista para entregar'
        : `Siguiente: ${sig.id}${sig.estado === 'pendiente' ? '' : ` (${sig.estado})`}${sig.queVeras ? ` · ${sig.queVeras}` : ''}`

    return (
      <Box flexDirection="column" paddingX={1}>
        <Box flexDirection="row" alignItems="center" columnGap={2} flexWrap="nowrap" overflow="hidden">
          <Text bold wrap="truncate-end">{p.nombre}</Text>
          <Box flexDirection="row" flexShrink={0}>
            {a.rebanadas.map(r => (
              <Text color={completa ? COMPLETA : COLOR[r.estado]}>{r.estado === 'pendiente' ? '□' : '■'}</Text>
            ))}
          </Box>
          <Text bold color={completa ? COMPLETA : COLOR.aceptada}>{cuenta}</Text>
          <Box flexGrow={1} flexShrink={1} />
          <Button key="ocultar" label="×" role="dismiss" plain dimColor onPress={() => update($, oculto, () => true)} />
        </Box>
        {completa ? (
          <Text bold color={COMPLETA} wrap="truncate-end">{detalle}</Text>
        ) : (
          <Text dimColor wrap="truncate-end">{detalle}</Text>
        )}
      </Box>
    )
  })
}
