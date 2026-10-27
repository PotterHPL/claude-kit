import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const BAND = { component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100 } as never } as const

async function session($: Engine, on: On) {
  mock.clock(on, { now: Date.parse('2026-10-10T02:00:00Z') })
  mock.env(on, { LANG: 'en_US.UTF-8' })
  on('settings.read', async () => ({ value: {} }) as never)
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  await $.session.start({ source: 'startup', cwd: '/repo', surface: 'terminal', isInteractive: true } as never)
  await $.tool.call({ tool: 'mcp__savvy-progress__progress', title: 'Ship it', total: 4, done: 1, phase: 'delegate' } as never)
}

// The glyphs a Raster's cells draw, row-major: one codepoint per [codePoint, fg, bg] triplet.
const rasterText = (cells: unknown): string => {
  const bin = atob(String(cells ?? ''))
  let out = ''
  for (let i = 0; i < bin.length; i += 12)
    out += String.fromCodePoint((bin.charCodeAt(i) | (bin.charCodeAt(i + 1) << 8) | (bin.charCodeAt(i + 2) << 16) | (bin.charCodeAt(i + 3) << 24)) >>> 0)
  return out
}

// What the band shows: the label as a Text, or drawn in the terminal's track Raster.
async function bandText(ui: { find: (q: never) => Promise<{ props: Record<string, unknown> } | undefined> }) {
  const track = await ui.find({ type: 'Raster', key: 'band-track' } as never)
  return track ? rasterText(track.props.cells) : ''
}

async function band($: Engine, surface: 'terminal' | 'desktop') {
  const ui = await $.ui.mount({ plugin: 'savvy-progress', surface, ...BAND })
  const svg = await ui.findAll({ type: 'Svg' })
  const title = await ui.findAll({ type: 'Text', text: /^Ship it$/ })
  const label = (await ui.findAll({ type: 'Text', text: /^Tasks 1\/4$/ })).length + ((await bandText(ui as never)).includes('Tasks 1/4') ? 1 : 0)
  await ui.unmount()
  return { svg: svg.length, title: title.length, label }
}

test('terminal: the row draws the title as text and the bar and label in a Raster, not an Svg', async ($, on) => {
  await session($, on)
  expect(await band($, 'terminal')).toEqual({ svg: 0, title: 1, label: 1 })
})

test('desktop: the row is still one Svg', async ($, on) => {
  await session($, on)
  expect(await band($, 'desktop')).toEqual({ svg: 1, title: 0, label: 0 })
})

test('band any: a batch of agents with no savvy flow shows done out of total', { options: { band: 'any' } }, async ($, on) => {
  mock.clock(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('turn.complete', () => ({ text: '' }) as never)
  let n = 0
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: `a${++n}` }))
  for (const i of [1, 2])
    await $.agent.spawn({ tool_use_id: `t${i}`, prompt: 'p', description: `work ${i}`, subagentType: 'general-purpose', provider: 'engine', parentModel: 'claude-opus-5-5', background: true, fork: false } as never)
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ agentId: 'a1', reason: 'answer', answer: 'ok' })
  const ui = await $.ui.mount({ plugin: 'savvy-progress', surface: 'terminal', ...BAND })
  expect(await bandText(ui as never)).toContain('Tasks 1/2')
  expect(await ui.find({ type: 'Button', key: 'savvy-dismiss' })).toBeUndefined()
})

test('band savvy: no flow, no band', { options: { band: 'savvy' } }, async ($, on) => {
  mock.clock(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'claude-haiku-5-5', agentId: 'a1' }))
  // Beneath the plugin, the engine draws an empty band.
  on('ui.render', { component: 'AbovePrompt' }, () => ({ type: 'Box', props: {}, children: [] }) as never)
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'p', description: 'work', subagentType: 'general-purpose', provider: 'engine', parentModel: 'claude-opus-5-5', background: true, fork: false } as never)
  const ui = await $.ui.mount({ plugin: 'savvy-progress', surface: 'terminal', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Tasks/ })).toBeUndefined()
})
