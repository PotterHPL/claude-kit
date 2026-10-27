import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const PLUGIN = 'savvy-progress'
const pane = (bodyColumns: number) =>
  ({ title: '', isFocused: false, bodyColumns, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} }) as const

// One running worker, on the mocked clock.
const worker = async ($: Engine, on: On) => {
  mock.clock(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: 'a1' }))
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'p', description: 'Walking work', subagentType: 'general-purpose', provider: 'engine', parentModel: 'claude-opus-5-5', background: true, fork: false } as never)
}

const mount = ($: Engine, surface: 'terminal' | 'desktop', columns: number) =>
  $.ui.mount({ plugin: PLUGIN, surface, component: 'Pane', requestId: 'savvy-agents', props: pane(columns) })

test('terminal, row: each agent has a 12 × 4 mini crab beside its lines', { options: { terminalCrabs: 'row' } }, async ($, on) => {
  await worker($, on)
  const ui = await mount($, 'terminal', 60)
  const crab = await ui.find({ type: 'Raster', key: 'crab-a1' })
  expect(crab).toBeDefined()
  expect(crab?.props).toMatchObject({ columns: 12, rows: 4 })
  expect(await ui.find({ type: 'Text', text: /Walking work/ })).toBeDefined()
})

test('terminal, row: a narrow panel keeps text only', { options: { terminalCrabs: 'row' } }, async ($, on) => {
  await worker($, on)
  const ui = await mount($, 'terminal', 30)
  expect(await ui.find({ type: 'Raster', key: 'crab-a1' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /Walking work/ })).toBeDefined()
})

test('terminal, stage: the running crab is drawn at full size above the list', { options: { terminalCrabs: 'stage' } }, async ($, on) => {
  await worker($, on)
  const ui = await mount($, 'terminal', 60)
  expect((await ui.find({ type: 'Raster', key: 'crab-a1' }))?.props).toMatchObject({ columns: 30, rows: 14 })
})

test('terminal, off: no crabs', { options: { terminalCrabs: 'off' } }, async ($, on) => {
  await worker($, on)
  const ui = await mount($, 'terminal', 60)
  expect(await ui.find({ type: 'Raster', key: 'crab-a1' })).toBeUndefined()
})

test('desktop: no Raster, the SVG rows as before', async ($, on) => {
  await worker($, on)
  const ui = await mount($, 'desktop', 60)
  expect(await ui.find({ type: 'Raster' })).toBeUndefined()
  expect(await ui.find({ type: 'Svg' })).toBeDefined()
})

test('terminal: agents are numbered and the model is painted in its family color', async ($, on) => {
  await worker($, on)
  const ui = await mount($, 'terminal', 60)
  expect(await ui.find({ type: 'Text', text: /^1\. Walking work$/ })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /^Haiku 5\.5$/ }))?.props).toMatchObject({ color: '#1D9E75', bold: true })
})
