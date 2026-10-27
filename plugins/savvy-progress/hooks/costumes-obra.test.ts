import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const PLUGIN = 'savvy-progress'
const pane = { title: '', isFocused: false, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} } as const

// The seven agent types of TI's method and the crew costume the fork gives each by default.
const CREW = ['explorador', 'ejecutor', 'revisor', 'consejero', 'Plan', 'claude-code-guide', 'general-purpose'] as const

const spawnAll = async ($: Engine, on: On, types: readonly string[]) => {
  mock.clock(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  let n = 0
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: `a${++n}` }))
  for (const [i, type] of types.entries())
    await $.agent.spawn({ tool_use_id: `t${i}`, prompt: 'p', description: `${type} work`, subagentType: type, provider: 'engine', parentModel: 'claude-opus-5-5', background: true, fork: false } as never)
  return $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'savvy-agents', props: pane })
}

const cellsOf = async (ui: Awaited<ReturnType<typeof spawnAll>>, id: string) =>
  (await ui.find({ type: 'Raster', key: `crab-${id}` }))?.props.cells as string | undefined

test('by default each agent type of the method wears its own crew costume', async ($, on) => {
  const ui = await spawnAll($, on, [...CREW, 'some-other-agent'])
  const cells = await Promise.all(CREW.map((_, i) => cellsOf(ui, `a${i + 1}`)))
  const plain = await cellsOf(ui, `a${CREW.length + 1}`)
  for (const c of cells) {
    expect(c).toBeDefined()
    expect(c).not.toBe(plain)
  }
  expect(new Set(cells).size).toBe(CREW.length)
})

test('the costumes option can still send a type back to the rule', { options: { costumes: '' } }, async ($, on) => {
  const ui = await spawnAll($, on, ['revisor', 'some-other-agent'])
  // No map: both are other agents with no effort seen, the plain crab.
  expect(await cellsOf(ui, 'a1')).toBe(await cellsOf(ui, 'a2'))
})

test('a failed agent crouches: its crab is drawn differently from a finished one', async ($, on) => {
  // The engine's answer to a finished turn: registered before the test first calls $.
  on('turn.complete', () => ({ text: '' }) as never)
  const ui = await spawnAll($, on, ['ejecutor', 'ejecutor'])
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ agentId: 'a1', reason: 'answer', answer: 'ok' })
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ agentId: 'a2', reason: 'error', answer: '' })
  const done = await cellsOf(ui, 'a1')
  const failed = await cellsOf(ui, 'a2')
  expect(done).toBeDefined()
  expect(failed).toBeDefined()
  expect(failed).not.toBe(done)
})

test('desktop: the crew is drawn too', async ($, on) => {
  mock.clock(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: 'a1' }))
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'p', description: 'Review', subagentType: 'revisor', provider: 'engine', parentModel: 'claude-opus-5-5', background: true, fork: false } as never)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'savvy-agents', props: pane })
  const svgs = await ui.findAll({ type: 'Svg' })
  expect(svgs.some(s => String(s.props.source).includes('#125160'))).toBe(true)
})
