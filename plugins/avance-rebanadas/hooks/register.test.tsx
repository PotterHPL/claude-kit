import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const BANDA = {
  plugin: 'avance-rebanadas',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 10, bodyColumns: 100 } as never,
} as const

const plan = (estados: string[]) =>
  `## Rebanadas\n\n| # | Qué verás | Estado |\n|---|---|---|\n${estados
    .map((e, i) => `| R${i + 1} | Pantalla ${i + 1} | ${e} |`)
    .join('\n')}\n`

const PLAN_MCP = 'C:/TI/10-proyectos/mcps/mcp-x/docs/plan.md'

// Un disco en memoria: rutas con `/`, carpetas como claves sin contenido.
const disco = (): Map<string, string | null> =>
  new Map<string, string | null>([
    ['C:/TI/AGENTS.md', '# AGENTS'],
    ['C:/TI/50-conocimiento/proyectos', null],
    ['C:/TI/50-conocimiento/proyectos/mcp-x.md', '---\nslug: mcp-x\nruta_local: 10-proyectos/mcps/mcp-x\n---\n'],
    [PLAN_MCP, plan(['aceptada', 'aceptada', 'aceptada', 'aceptada', 'aceptada', 'pendiente'])],
    ['C:/TI/10-proyectos/ti/viejo/docs/plan.md', '# Plan\n\n## Fases\n- F1\n'],
  ])

async function sesion($: Engine, on: On, cwd: string, archivos = disco()) {
  const reloj = mock.clock(on, { now: Date.parse('2026-11-18T15:00:00Z') })
  const limpia = (p: string) => p.replace(/\\/g, '/')
  on('fs.exists', (_, e) => ({ value: archivos.has(limpia(e.path)) }))
  on('fs.read', (_, e) => {
    const t = archivos.get(limpia(e.path))
    if (typeof t !== 'string') throw new Error(`ENOENT ${e.path}`)
    return { value: t }
  })
  on('session.cwd', () => ({ value: cwd }))
  on('command.register', () => ({ value: { command: 'avance' } }) as never)
  on('session.start', (_, e) => ({ cwd: e.cwd }) as never)
  await $.session.start({ source: 'startup', cwd, surface: 'terminal', isInteractive: true } as never)
  return { reloj, archivos }
}

async function textos($: Engine, surface: 'terminal' | 'desktop') {
  const ui = await $.ui.mount({ ...BANDA, surface })
  const todos = (await ui.findAll({ type: 'Text' })).map(t => String(t.text ?? ''))
  await ui.unmount()
  return todos
}

const avance = ($: Engine, args: string) => $.command.run({ command: 'avance', args } as never)

test('en la carpeta del proyecto la barra muestra 5/6 y la siguiente, en terminal y escritorio', async ($, on) => {
  await sesion($, on, 'C:\\TI\\10-proyectos\\mcps\\mcp-x\\src')
  for (const surface of ['terminal', 'desktop'] as const) {
    const t = await textos($, surface)
    expect(t).toContain('mcp-x')
    expect(t).toContain('5/6 aceptadas (83 %)')
    expect(t).toContain('Siguiente: R6 · Pantalla 6')
    expect(t.filter(x => x === '■').length).toBe(5)
    expect(t.filter(x => x === '□').length).toBe(1)
  }
})

test('en la raíz de TI, sin plan, no hay barra', async ($, on) => {
  await sesion($, on, 'C:/TI')
  expect(await textos($, 'terminal')).toEqual([])
})

test('un plan por fases, sin rebanadas, no pinta barra', async ($, on) => {
  await sesion($, on, 'C:/TI/10-proyectos/ti/viejo')
  expect(await textos($, 'terminal')).toEqual([])
})

test('/avance <slug> desde la raíz de TI fija el proyecto por su ficha', async ($, on) => {
  await sesion($, on, 'C:/TI')
  const r = await avance($, 'mcp-x')
  expect(String((r as { text?: string }).text)).toContain('5/6')
  expect(await textos($, 'terminal')).toContain('5/6 aceptadas (83 %)')
})

test('/avance con un slug sin ficha lo dice y no pinta barra', async ($, on) => {
  await sesion($, on, 'C:/TI')
  const r = await avance($, 'no-existe')
  expect(String((r as { text?: string }).text)).toContain('No hay ficha')
  expect(await textos($, 'terminal')).toEqual([])
})

test('/avance sin nada oculta y vuelve a mostrar', async ($, on) => {
  await sesion($, on, 'C:/TI/10-proyectos/mcps/mcp-x')
  await avance($, '')
  expect(await textos($, 'terminal')).toEqual([])
  await avance($, '')
  expect(await textos($, 'terminal')).toContain('mcp-x')
})

test('al cambiar un estado en el plan la barra cambia en la siguiente relectura', async ($, on) => {
  const { reloj, archivos } = await sesion($, on, 'C:/TI/10-proyectos/mcps/mcp-x')
  archivos.set(PLAN_MCP, plan(['aceptada', 'aceptada', 'aceptada', 'aceptada', 'aceptada', 'en curso']))
  await reloj.advance(3000)
  const t = await textos($, 'terminal')
  expect(t).toContain('Siguiente: R6 (en curso) · Pantalla 6')
  archivos.set(PLAN_MCP, plan(['aceptada', 'aceptada', 'aceptada', 'aceptada', 'aceptada', 'aceptada']))
  await reloj.advance(3000)
  expect(await textos($, 'terminal')).toContain('6/6 aceptadas (100 %)')
})
