import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const PLUGIN = 'savvy-progress'
const pane = { title: '', isFocused: false, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} } as const
const HOME = 'C:\\Users\\jd'
const ESTILO = 'C:/Users/jd/.claude/estilo-cierre.txt'

// The seven agent types of TI's method; each wears its crew costume in both styles.
const CREW = ['explorador', 'ejecutor', 'revisor', 'consejero', 'Plan', 'claude-code-guide', 'general-purpose'] as const

// The disk as the style file sees it: `null` is no file. Returned so a test can rewrite it.
const disco = (texto: string | null) => ({ texto })

// A session start that reads the style from `d`, with the engine calls session.start makes answered.
const arranca = async ($: Engine, on: On, d: { texto: string | null }) => {
  const reloj = mock.clock(on)
  on('env.get', (_, e) => ({ value: e.name === 'USERPROFILE' ? HOME : undefined }) as never)
  on('fs.read', (_, e) => {
    if (e.path.replace(/\\/g, '/') !== ESTILO || d.texto === null) throw new Error(`ENOENT ${e.path}`)
    return { value: d.texto }
  })
  on('tool.register', () => ({ value: undefined }) as never)
  on('command.register', () => ({ value: undefined }) as never)
  on('session.start', (_, e) => ({ cwd: e.cwd }) as never)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  let n = 0
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: `a${++n}` }))
  await $.session.start({ source: 'startup', cwd: 'C:/TI', surface: 'terminal', isInteractive: true } as never)
  return reloj
}

const spawnAll = async ($: Engine, _on: On, types: readonly string[]) => {
  for (const [i, type] of types.entries())
    await $.agent.spawn({ tool_use_id: `t${i}`, prompt: 'p', description: `${type} work`, subagentType: type, provider: 'engine', parentModel: 'claude-opus-5-5', background: true, fork: false } as never)
  return $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'savvy-agents', props: pane })
}

const cellsOf = async (ui: Awaited<ReturnType<typeof spawnAll>>, id: string) =>
  (await ui.find({ type: 'Raster', key: `crab-${id}` }))?.props.cells as string | undefined

const trajes = async (ui: Awaited<ReturnType<typeof spawnAll>>) => Promise.all(CREW.map((_, i) => cellsOf(ui, `a${i + 1}`)))

test('sin archivo de estilo, el método viste la cuadrilla savvy', async ($, on) => {
  await arranca($, on, disco(null))
  const ui = await spawnAll($, on, [...CREW, 'some-other-agent'])
  const cells = await trajes(ui)
  const plain = await cellsOf(ui, `a${CREW.length + 1}`)
  for (const c of cells) {
    expect(c).toBeDefined()
    expect(c).not.toBe(plain)
  }
  expect(new Set(cells).size).toBe(CREW.length)
})

test('con estilo cyberpunk, cada tipo del método viste su traje cyber', async ($, on) => {
  const d = disco('clasico')
  const reloj = await arranca($, on, d)
  const ui = await spawnAll($, on, CREW)
  const savvy = await trajes(ui)
  d.texto = 'cyberpunk\r\n'
  await reloj.advance(2500)
  const cyber = await trajes(ui)
  expect(new Set(cyber).size).toBe(CREW.length)
  cyber.forEach((c, i) => expect(c).not.toBe(savvy[i]))
})

test('un valor desconocido en el archivo cuenta como clásico', async ($, on) => {
  const d = disco('clasico')
  const reloj = await arranca($, on, d)
  const ui = await spawnAll($, on, ['revisor'])
  const clasico = await cellsOf(ui, 'a1')
  d.texto = 'vaporwave'
  await reloj.advance(2500)
  expect(await cellsOf(ui, 'a1')).toBe(clasico)
})

test('al cambiar el archivo, el panel cambia sin reiniciar', async ($, on) => {
  const d = disco('clasico')
  const reloj = await arranca($, on, d)
  const ui = await spawnAll($, on, ['revisor'])
  const antes = await cellsOf(ui, 'a1')
  d.texto = 'cyberpunk'
  await reloj.advance(2500)
  const despues = await cellsOf(ui, 'a1')
  expect(despues).toBeDefined()
  expect(despues).not.toBe(antes)
})

test('/cuadrilla ya no existe', async ($, on) => {
  const registrados: string[] = []
  mock.clock(on)
  on('env.get', () => ({ value: undefined }) as never)
  on('tool.register', () => ({ value: undefined }) as never)
  on('command.register', (_, e) => {
    registrados.push(e.name)
    return { value: undefined } as never
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }) as never)
  await $.session.start({ source: 'startup', cwd: 'C:/TI', surface: 'terminal', isInteractive: true } as never)
  expect(registrados).toContain('agents-info')
  expect(registrados).not.toContain('cuadrilla')
})

test('la opción costumes gana sobre el estilo', { options: { costumes: 'revisor=other' } }, async ($, on) => {
  await arranca($, on, disco('cyberpunk'))
  const ui = await spawnAll($, on, ['revisor', 'some-other-agent'])
  // Los dos son el cangrejo sin traje: revisor por la opción, el otro por la regla (sin esfuerzo).
  expect(await cellsOf(ui, 'a1')).toBe(await cellsOf(ui, 'a2'))
})

test('un agente fallido se agacha: se dibuja distinto de uno terminado', async ($, on) => {
  on('turn.complete', () => ({ text: '' }) as never)
  await arranca($, on, disco(null))
  const ui = await spawnAll($, on, ['ejecutor', 'ejecutor'])
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ agentId: 'a1', reason: 'answer', answer: 'ok' })
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ agentId: 'a2', reason: 'error', answer: '' })
  const done = await cellsOf(ui, 'a1')
  const failed = await cellsOf(ui, 'a2')
  expect(done).toBeDefined()
  expect(failed).toBeDefined()
  expect(failed).not.toBe(done)
})

test('escritorio: la cuadrilla se dibuja, también la cyber', async ($, on) => {
  await arranca($, on, disco('cyberpunk'))
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'p', description: 'Review', subagentType: 'revisor', provider: 'engine', parentModel: 'claude-opus-5-5', background: true, fork: false } as never)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'savvy-agents', props: pane })
  const svgs = await ui.findAll({ type: 'Svg' })
  // El cazador de glitches: cinta rosa neón sobre el cangrejo.
  expect(svgs.some(s => String(s.props.source).toUpperCase().includes('#FF2E88'))).toBe(true)
})

// Agentes de referencia: la opción `costumes` les pone un traje conocido para comparar.
const REFERENCIA = { costumes: 'ref-astronauta=fable, ref-pirata=explore, ref-heroe=savvy-heroe, ref-safari=savvy-safari' }

test('clásico: el reparto D7 viste a cada tipo por frecuencia', { options: REFERENCIA }, async ($, on) => {
  await arranca($, on, disco('clasico'))
  const ui = await spawnAll($, on, ['general-purpose', 'explorador', 'fork', 'Explore', 'ref-astronauta', 'ref-pirata', 'ref-heroe', 'ref-safari'])
  const [gp, explorador, fork, explore, astronauta, pirata, heroe, safari] = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map(i => cellsOf(ui, `a${i}`)))
  expect(gp).toBe(astronauta)
  expect(explorador).toBe(pirata)
  expect(fork).toBe(heroe)
  expect(explore).toBe(safari)
  // Explore ya no es el pirata.
  expect(explore).not.toBe(pirata)
})

test('clásico: el árbitro y el farero se dibujan en terminal y escritorio', async ($, on) => {
  await arranca($, on, disco('clasico'))
  const ui = await spawnAll($, on, ['revisor', 'claude-code-guide', 'some-other-agent'])
  const [arbitro, farero, plain] = await Promise.all([1, 2, 3].map(i => cellsOf(ui, `a${i}`)))
  expect(arbitro).toBeDefined()
  expect(farero).toBeDefined()
  expect(new Set([arbitro, farero, plain]).size).toBe(3)
  const escritorio = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'savvy-agents', props: pane })
  const svgs = (await escritorio.findAll({ type: 'Svg' })).map(s => String(s.props.source).toUpperCase())
  // El farero: sombrero de lluvia amarillo (#F5C542) y su ala ocre (#C99A1E).
  expect(svgs.some(s => s.includes('#C99A1E') && s.includes('#F5C542'))).toBe(true)
})
