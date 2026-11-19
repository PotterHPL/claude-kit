# savvy-progress

A Claude Code mod: a progress bar above the prompt and a live panel of subagents. Made for the [savvy-flow](../savvy-flow) skill, and useful with any subagents.

- **Progress bar**: the flow's title, phase, accepted tasks out of planned, and a button with the crew size that opens the panel. It appears once something reports progress (savvy-flow does) or a `savvy-*` worker starts.
- **Agents panel** (`/agents-info` toggles it; `/agents-info open` opens it or brings it forward without toggling): running, finished and planned subagents with model, effort, task progress, context, estimated cost and time. Working crabs walk, and each savvy tier animates its prop: the astronaut floats, the detective sweeps the magnifier, the engineer turns the wrench, the chef tosses the omelette, the racer runs with a fluttering flag. `prefers-reduced-motion` stops them.

## Tools it adds

- `mcp__savvy-progress__progress`: the orchestrator reports the plan, phase and accepted tasks. Only the main session can: a call from a subagent is ignored, so a worker cannot rename, finish or reset the flow.
- `mcp__savvy-progress__step`: a worker reports its own steps (`done`, `total`, `note`). A worker that does not report shows its context fill in grey instead. The tool is listed up front rather than behind ToolSearch, and each `savvy-*` worker gets one line at the end of its brief asking for these reports.

Cost is a rough estimate from token counts and a built-in per-model price table (`PRICES` in `hooks/register.tsx`, list prices as of 2026-10-10), not a bill. Cache writes are priced at the 1-hour rate, which is what Claude Code writes on a subscription; a session that writes 5-minute entries is overestimated there.

## Settings

`language`: `auto` (default), `en`, `ru`, `he` or `es`. Hebrew draws the bar and the panel right to left. `auto` follows Claude Code's `language` setting, then the system locale, and falls back to English. Set it in `/config`, or, for a mod loaded by hand, in `~/.claude/settings.json`:

```json
{ "pluginConfigs": { "savvy-progress": { "options": { "language": "ru" } } } }
```

`autoOpen`: `savvy` (default) or `any`. With `savvy` the panel opens by itself when a `savvy-*` worker starts or a plan is reported. With `any` it also opens, once per session, when any other subagent starts. With `always` it opens every time a batch of subagents starts (one starts while none is running), even if it was closed before; closed by hand mid-batch, it waits for the next batch. `/agents-info` toggles it either way.

`band`: `savvy` or `any` (this fork's default). With `savvy` the band above the prompt shows only while a savvy flow reports its progress. With `any` it also shows while a batch of other subagents works (agents launched together, or one after another while others work): done out of total, with the crew button that opens the panel. It goes when the batch is done.

`terminalCrabs`: `row` (default), `stage` or `off`. In the terminal the crabs are pixel art, two pixels to a cell (half blocks in true color), and the running ones walk. `row` puts a small crab beside each agent (9 columns by 3 rows; text only when the panel is narrower than 34 columns): as the desktop draws a row: the task and its time; the tier word in its color (for an agent that is not a savvy worker, its type, in the color of the tier its model and effort match) and the model; its steps and numbers; and, while it runs, a bar in that color. Each agent is numbered in the order it started; `stage` draws the running agents' crabs at full size (30 by 14) side by side above the list; `off` keeps the text rows only. The desktop's crabs do not change. Docked beside a fullscreen transcript (`/tui fullscreen`, 110 columns or more) the panel asks for 56 columns; elsewhere it sits above the prompt.

`reportSteps`: `savvy` (default) or `any`. Savvy workers are asked in their brief to report their steps (the `step` tool), which the panel shows as `1/4 · note` and as the bar. With `any` every other subagent is asked too, when the tool is among its tools.

`costumes`: `type=costume` pairs, comma-separated, for example `explorador=explore,revisor=heavy`. An agent of a listed type wears that costume (`fable`, `heavy`, `careful`, `medium`, `light`, `explore` or `other`) and, for a tier, its color. Any other agent dresses for its savvy tier; `Explore` is the pirate; the rest dress for their model and effort: Fable is the astronaut, and on another model `xhigh` or `max` is the detective, `high` the engineer, `medium` the chef and `low` the racer. Before an agent's first model request its effort is unknown, and it is the plain crab.

Install instructions are in the [repository README](../../README.md).

## Conaltura fork

This fork dresses the agent types of TI's method with one of two crews, chosen by the style that `/estilo` writes to `~/.claude/estilo-cierre.txt` (`clasico` or `cyberpunk`; no file, or anything else, is classic). The mod rereads the file every two seconds, so a change shows without restarting.

- **Classic** (the default): the savvy crew, dealt by how often each type runs, so the favourites show most. `general-purpose` (44 % of agents) is the author's astronaut, `revisor` a referee (shows the yellow card, blows the whistle, shows the red), `explorador` the author's pirate, `ejecutor` a robot, `fork` a superhero, `Plan` a captain, `Explore` a safari explorer, `claude-code-guide` a lighthouse keeper (lantern and pipe) and `consejero` a wizard.
- **Cyberpunk**: the cyber crew below («Cuadrilla Neón», plan in `docs/plan.md`).

The `costumes` option still wins over the crew. Any other agent dresses as before: its savvy tier, `Explore` as the pirate, or its model and effort.

A finished agent's steps read as complete (`3/3`), since an agent may end without reporting its last step.

### The cyber crew

| Agent type | Costume | Work cycle (4 frames) |
|---|---|---|
| `explorador` | `cyber-netrunner`: hood and visor | a glint runs the visor, a packet goes down the cable |
| `ejecutor` | `cyber-brazo`: pink crest, chrome arm | raises the arm, strikes a spark off the floor |
| `revisor` | `cyber-cazador`: glitch hunter, red monocle | scans with the reader, cyan then green |
| `consejero` | `cyber-oraculo`: AI oracle, purple hood | a hologram orb flickers above |
| `Plan` | `cyber-fixer`: dark shades | opens a cyan holomap, the shades glint |
| `claude-code-guide` | `cyber-guia`: neon guide, a sign on a pole | the neon flickers and sparks |
| `general-purpose` | `cyber-samurai`: topknot, pink sash, light katana | the blade gleams, slashes, rests |
| `fork` | `cyber-cromo`: an all-chrome crab, legs too, the copy of the session | a shine runs over it, the eyes flash |
| `Explore` | `cyber-camuflaje`: optical camouflage | turns to an outline, vanishes but for the eyes, comes back by halves |

In the cyberpunk style a failed agent becomes `cyber-calavera`, a floating servo skull with a red optic, in place of the crouching crab.

While agents work, the band above the prompt is two rows tall with an animated mascot at its end (drawn by hand at 9 × 4 pixels; it keeps moving as long as the band shows, agents running or not): the wizard in the classic style, the servo skull in cyberpunk (it replaces the crab on the desktop's band too). Set the `bandMascot` option to `off` for the one-row band; a window under 60 columns also leaves the mascot out. In cyberpunk the band's accents turn neon pink (cyan once finished) and braille rain falls on the part still to do.

Every terminal crab blinks once every three seconds (a visor or an eyepatch stays open), and a failed agent's crab crouches with a drop of sweat. A finished one stands still. On the desktop the crew is the terminal costume at three times its size.

