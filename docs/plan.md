# Plan: barra de avance por rebanadas aceptadas

Mod nuevo `avance-rebanadas` en el fork `PotterHPL/claude-kit` (rama `conaltura`, marketplace `claude-kit-conaltura`).
Origen: IDEA #1 del borrador de JD (`Desktop/Ideas/Metodologia IA.md:120`, «un mod de Claude que sea una barra que me
diga en tiempo real el porcentaje en el que va») y D5 del ADR-0033 (el avance se mide en rebanadas aceptadas). Regla
de mods: ADR-0026 (D3: revisión con `ti-guardarrailes` antes de entrar al marketplace). El plan anterior de este repo
(mascotas de Savvy Progress) está en `docs/plan-savvy-progress.md`.

## Relevo
- **Avance:** 2 de 2 rebanadas aceptadas (100 %). **Proyecto cerrado (2026-11-18):** v0.2.0 en producción en el PC
  de JD; ficha `avance-rebanadas` en `produccion`.
- **Plan aprobado por JD (2026-11-18, `ti-plan`):** 2 rebanadas, solo la barra (D1 de JD: «construirla ya»; el panel
  de todos los proyectos queda fuera).
- **R1 en revisión (2026-11-18):** plugin `plugins/avance-rebanadas` (lector `hooks/plan.ts`, banda y `/avance` en
  `hooks/register.tsx`), en el marketplace y en el README. `claude plugin validate` limpio; `claude plugin test` →
  15 pasan, 0 fallan. Instalado en el PC de JD (`avance-rebanadas@claude-kit-conaltura`, alcance de usuario). Falta
  que JD lo vea en su terminal: lo nuevo del motor en Windows (forma de `$.session.cwd`, rutas de `$.fs.read`) solo
  se comprueba ahí.
- **R1 aceptada por JD (2026-11-18):** vio la barra con `/avance mcp-proyectos-dwh` y funciona. PR #11 (fork) y #74
  (wiki) fusionados.
- **R2 en revisión (2026-11-18), v0.2.0:** `on('tool.call')` observa (siempre `next(e)` primero) y sigue el archivo
  de Read, Edit, Write, Glob, Grep y NotebookEdit; `/avance <slug>` fijado manda. Aviso con `$.ui.toast` por cada
  rebanada que pasa a aceptada (la primera lectura y el cambio de proyecto no avisan). Al 100 %, dorado y «lista para
  entregar». `claude plugin test` → 23 pasan, 0 fallan; `validate` limpio. Hallazgo: en `claude plugin test` una
  ruta relativa en `tool.call` no llega igual al mod (el motor la resuelve antes); se prueba `rutaAbsoluta` aparte y
  en la sesión real Read y Edit usan rutas absolutas. 
- **R2 aceptada por JD (2026-11-18):** vio la barra aparecer sola y el aviso al aceptar. PR #12 (fork) y #75 (wiki)
  fusionados.
- **Fuera del alcance, por si se retoma:** panel de todos los proyectos y barra por fases (Alertador, ConEmpeño).
- **Decisiones activas:**
  - **D1 (JD, 2026-11-18):** construir ya la barra de un proyecto; sin panel multiproyecto.
  - El dato sale de la tabla `## Rebanadas` de `docs/plan.md` del proyecto (columna **Estado**), que `ti-plan` ya
    exige. Los proyectos por fases (Alertador, ConEmpeño) no muestran barra.
  - `/avance <slug>` encuentra el proyecto por `ruta_local` de su ficha (`50-conocimiento/proyectos/<slug>.md`).
  - Se lee el archivo en disco, en la rama en que esté el repo.

## Contexto
- `plugins/session-band` ya dibuja una banda encima del prompt (`ui.render` sobre `AbovePrompt`) con `atom`,
  `$.clock.every`, `$.fs.read`, `$.session.cwd` y `$.command.register`: es el molde. `savvy-progress` también usa
  `AbovePrompt` (solo mientras trabajan agentes) y observa herramientas con `on('tool.call', …)`; ambas bandas se
  encadenan con `next(e)`.
- Instalados hoy en el PC de JD: `savvy-progress` y `next-steps` desde `claude-kit-conaltura` (marketplace local que
  apunta a `40-ia/mods/claude-kit`). `session-band` no está activo.
- Formatos reales de la tabla:
  - `mcp-proyectos-dwh`: `## Rebanadas (plan aprobado por JD el 2026-11-13, \`ti-plan\`)`, columnas
    `# · Qué verás · Rama · Quién · Depende de · Estado`, 6 filas (5 `aceptada`, 1 `pendiente`).
  - `bienvenida-credenciales`: `## Rebanadas (1.0.1: configurar el envío desde la app)`, texto antes de la tabla,
    columnas `# · Qué verás · Rama · Quién · Estado`, estados `en revisión` y `pendiente`.
- Estados de `ti-plan`: `pendiente · en curso · en revisión · aceptada`.

## Rebanadas (plan aprobado por JD el 2026-11-18, `ti-plan`)

| # | Qué verás | Rama | Quién | Depende de | Estado |
|---|---|---|---|---|---|
| R1 | Con Claude Code abierto en un proyecto con rebanadas, o tras `/avance <slug>` desde `TI`, encima del prompt sale la barra: un segmento por rebanada coloreado por estado, `5/6 aceptadas (83 %)` y la siguiente; al editar un estado en el plan cambia en segundos | `feat/avance-rebanadas-r1` | Claude | — | aceptada |
| R2 | Desde `TI` sin comando, la barra aparece sola al tocar un archivo de un proyecto con rebanadas; al aceptar una sale el aviso «R6 aceptada · 6/6 (100 %)» y al 100 % cambia de color | `feat/avance-rebanadas-r2` | Claude | R1 | aceptada |

**Archivos compartidos y su dueño:**
- `.claude-plugin/marketplace.json` y `README.md` de la raíz → R1. R2 solo sube la versión.
- `plugins/avance-rebanadas/hooks/register.tsx` → R1. R2 agrega la detección y el aviso.
- `plugins/avance-rebanadas/hooks/plan.ts` (lectura del plan) → R1. R2 no lo cambia.
- En TI: ficha `avance-rebanadas` → R1; `estandar-desarrollo-ia.md` §10 y `ti-guardarrailes/references/mods.md` → R2.

### R1 — La barra del proyecto abierto
- **Qué verás:** abre Claude Code en `10-proyectos/mcps/mcp-proyectos-dwh`, o escribe `/avance mcp-proyectos-dwh` desde
  `C:\Users\jossa\TI`. Encima del prompt: `mcp-proyectos-dwh ■■■■■□ 5/6 aceptadas (83 %) · Siguiente: R6 · La guía…`.
  Verde = aceptada, ámbar = en revisión, azul = en curso, gris = pendiente. Cambias un estado en `docs/plan.md` y la
  barra cambia en 3 s o menos, sin reiniciar. `/avance` solo muestra u oculta la barra. En un proyecto sin
  `## Rebanadas` no sale nada.
- **Qué falta:** desde `TI` hay que escribir `/avance <slug>`; no avisa al aceptar; al 100 % no cambia de color.
- **Archivos:**
  - Crea `plugins/avance-rebanadas/.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/register.tsx`,
    `hooks/plan.ts`, `hooks/plan.test.ts`, `hooks/register.test.tsx`, `README.md` y `types/index.d.ts` si hace falta.
  - Modifica `.claude-plugin/marketplace.json` (entrada nueva) y `README.md` de la raíz (lista de mods).
  - No toca `savvy-progress`, `next-steps`, `session-band` ni `savvy-flow`.
  - En TI: ficha nueva `50-conocimiento/proyectos/avance-rebanadas.md` (con § Plan), línea en `_meta/index.md` y
    entrada en `_meta/log.md`.
- **Contratos:**
  - `leerAvance(texto: string) → { rebanadas: { id, queVeras, estado }[], aceptadas, total } | null`: toma la última
    sección cuyo título empieza por `## Rebanadas`, la primera tabla después del título, la columna `#` como id, la
    columna `Qué verás` y la columna `Estado` (por nombre, sin importar mayúsculas ni tildes). Sin sección, sin tabla
    o sin columna `Estado` → `null`. Un estado que no sea de los cuatro cuenta como `pendiente`.
  - `buscarPlan(cwd) → ruta | null`: sube desde `cwd` hasta encontrar `docs/plan.md`; acepta `\` y `/`.
  - `/avance <slug>` → raíz de TI (sube desde `cwd` hasta `AGENTS.md` + `50-conocimiento/`) → lee `ruta_local:` de
    `50-conocimiento/proyectos/<slug>.md` → `<raíz>/<ruta_local>/docs/plan.md`. Slug sin ficha o sin plan → mensaje
    claro en el resultado del comando.
  - Atom `{ plugin: 'avance-rebanadas', key: 'proyecto' }` con `{ ruta, slug, avance, oculto }`; `$.clock.every(3000)`
    vuelve a leer el plan solo si hay proyecto.
- **Escenarios:** ninguno (no toca dinero, permisos, fechas ni cálculos delicados).
- **Pruebas:**
  - `plan.test.ts`: tabla de `mcp-proyectos-dwh` → 5/6 y siguiente R6; tabla de `bienvenida-credenciales` → 0/2 con
    R1 en revisión; dos secciones `## Rebanadas` → la última; sin sección o sin columna Estado → `null`; `Estado` con
    tilde o mayúsculas; filas con `|` escapado en el texto.
  - `register.test.tsx`: en terminal y en escritorio la banda muestra `5/6` y la siguiente; sin plan no hay banda;
    `/avance <slug>` fija el proyecto; `/avance` oculta y muestra.
  - **Terminado:** `claude plugin test plugins/avance-rebanadas` → todas pasan, 0 fallan;
    `claude plugin validate plugins/avance-rebanadas` limpio; `tsc` sin errores; JD ve la barra en su terminal con el
    MCP y la ve cambiar al editar un estado.
- **Riesgos:**
  - La API de mods en Windows (forma de `$.session.cwd`, rutas de `$.fs.read`) no está probada. Lo primero es una
    banda mínima que muestra la ruta del plan, instalada en el PC de JD.
  - La instalación desde el marketplace local puede pedir `claude plugin marketplace update`. Se prueba con la banda
    mínima.
  - Dos bandas a la vez (`savvy-progress` mientras trabajan agentes): se comprueba que las dos se ven.
- **Rama y PR:** `feat/avance-rebanadas-r1`, desde `conaltura` → PR a `conaltura` en el fork.
- **Quién:** Claude.
- **Revisión:** `ti-revisar` normal y revisión de mod de `ti-guardarrailes` (`references/mods.md`): solo `$.fs.read`,
  `$.fs.exists`, `$.session.cwd`, `$.clock`, `$.command.register`; sin red ni procesos.

### R2 — Aparece sola y avisa al aceptar
- **Qué verás:** abre Claude Code en `C:\Users\jossa\TI` sin comando. Al leer o editar un archivo de
  `10-proyectos/mcps/mcp-proyectos-dwh`, la barra aparece con ese proyecto. Al pasar R6 a `aceptada` sale el aviso
  «R6 aceptada · 6/6 (100 %)» y la barra completa cambia de color, con «lista para entregar».
- **Qué falta:** nada del alcance aprobado. Fuera: panel de todos los proyectos y barra por fases.
- **Archivos:** modifica `plugins/avance-rebanadas/hooks/register.tsx`, `register.test.tsx`, `README.md`,
  `plugin.json` y `marketplace.json` (versión). En TI: ficha, `estandar-desarrollo-ia.md` §10 (instalación),
  `40-ia/skills/ti-guardarrailes/references/mods.md` (tabla de mods), fila en ADR-0033 § Cómo se aplica y
  `_meta/log.md`.
- **Contratos:**
  - `on('tool.call')` solo observa (`return next(e)` siempre): toma `file_path`, `path` o `notebook_path` de Read,
    Edit, Write, Glob y Grep, busca su `docs/plan.md` con `buscarPlan` y, si tiene `## Rebanadas`, lo vuelve el
    proyecto actual. `/avance <slug>` fijado manda sobre la detección.
  - Aviso: al releer, toda rebanada que pasó a `aceptada` respecto de la lectura anterior → `$.ui.toast`. La primera
    lectura no avisa.
- **Escenarios:** ninguno.
- **Pruebas:** `register.test.tsx`: un `Read` de un archivo del proyecto fija la barra; un archivo sin plan no la
  cambia; `/avance` fijado no lo cambia la detección; pasar R6 a aceptada da un aviso y la primera lectura ninguno;
  100 % muestra «lista para entregar». **Terminado:** `claude plugin test plugins/avance-rebanadas` → 0 fallan; JD
  lo ve desde `TI`.
- **Riesgos:** el `tool.call` de un mod puede aprobar herramientas antes que el guardarraíl (ADR-0026). Se mitiga
  con que solo observa y siempre devuelve `next(e)`; la revisión del mod lo verifica.
- **Rama y PR:** `feat/avance-rebanadas-r2`, desde `conaltura` con la R1 integrada → PR a `conaltura`.
- **Quién:** Claude.
- **Revisión:** `ti-revisar` normal y revisión de mod (agrega `tool.call` en modo observar).

### Matriz requisito → rebanada
| Requisito | Rebanada |
|---|---|
| Barra que se llena con cada rebanada aceptada (IDEA #1, D5 de ADR-0033) | R1 |
| En tiempo real, sin reiniciar | R1 (lectura cada 3 s) |
| Funciona trabajando desde la raíz `TI` | R1 con `/avance`, R2 sola |
| Momento de aceptar visible | R2 (aviso y 100 %) |
| Mod revisado antes de entrar al marketplace (ADR-0026 D3) | R1 y R2 |

## Plan de pruebas
- Unitarias: `claude plugin test plugins/avance-rebanadas` (lectura del plan y banda en terminal y escritorio).
- Validación: `claude plugin validate plugins/avance-rebanadas` y `tsc`.
- De aceptación, con JD: barra del MCP en su terminal (herdr sobre Windows Terminal), cambio de estado en vivo, y en
  R2 detección desde `TI` y aviso al aceptar.

## Implementa
`claude`: es un mod pequeño sobre una API en acceso anticipado; Codex no aporta.
