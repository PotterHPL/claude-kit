import { expect, mock, test } from 'claude-code/testing'

// The fork re-reads the main thread's whole context: it should run after the main
// thread's turns only, never after a subagent's.
for (const [who, agentId, forks] of [['main thread', undefined, 1], ['subagent', 'a1', 0]] as const) {
  test(`a ${who}'s long answer ${forks ? 'is' : 'is not'} followed by a fork`, async ($, on) => {
    mock.clock(on)
    let forked = 0
    on('model.fork', () => {
      forked++
      return { value: { isAnswered: true, text: '[]', usage: null } } as never
    })
    on('command.list', () => ({ value: [] }) as never)
    on('turn.complete', () => ({ text: '' }) as never)
    await ($.turn.complete as (e: unknown) => Promise<unknown>)({
      turnId: 't1',
      reason: 'answer',
      answer: 'x'.repeat(200),
      ...(agentId ? { agentId } : {}),
    })
    // The fork runs detached: let it settle.
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(forked).toBe(forks)
  })
}
