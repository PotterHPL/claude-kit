# Plan: mascotas de Savvy Progress en la terminal, con el equipo de obra

Fork de `johnnyvizz/claude-kit` (MIT) para Conaltura. Ficha: `50-conocimiento/proyectos/savvy-progress-conaltura.md`
en el repo TI. Regla de mods: ADR-0026. Este archivo vive solo en la rama `conaltura`; las ramas que van al autor
salen de su `main` y no lo llevan.

## Contexto
- Savvy Progress dibuja los cangrejos (pixel art 24×18 en una rejilla de 30×28, un disfraz por nivel) solo como SVG
  en el escritorio (`hooks/register.tsx:1065`, `:1233`). En la terminal el panel es texto.
- La terminal tiene `Raster` (celdas con carácter, color de frente y de fondo; 1024 pares de color a la vez) y
  `$.ui.blit` para repintar sin redibujar (hasta 120 por segundo). `Image` solo sirve en kitty, Ghostty e iTerm2:
  no en Windows Terminal.
- Los disfraces se definen con `Fill(x, y, w, h, color, clase)`, así que la misma definición puede pintar SVG o una
  rejilla de pixeles.
- Base: `claude plugin test plugins/savvy-progress` → 24 pasan, 0 fallan (2026-10-26, commit `c871c15`).

## Decisiones (JD, 2026-10-26)
- **D1** · Fork propio + PR al autor.
- **D2** · Disfraces «Obra + extras»: explorador = topógrafo, ejecutor = obrero, revisor = interventor,
  consejero = arquitecto con planos, Plan = arquitecto con escuadra, claude-code-guide = guía con banderín,
  general-purpose = maestro de obra. Los 6 del autor se quedan.
- **D3** · Disfraz por tarea primero (tipo de agente) y por modelo/esfuerzo de respaldo.
- **D4** · Al autor: PR 1 mascotas en terminal; PR 2 disfraz por esfuerzo + opción de mapa. Los trajes de obra quedan
  en el fork.
- Savvy Flow no se instala (ADR-0026).

## Fases

### F1 · Bala trazadora: un cangrejo en la terminal
- **Objetivo:** en `/agents-info`, dentro de la terminal de JD (herdr sobre Windows Terminal), cada agente lleva un
  cangrejo `other` en pixel art que camina mientras el agente trabaja y se queda quieto al terminar. JD elige el
  tamaño: **A** uno por fila (sprite a media resolución, 15×7 celdas) o **B** un escenario arriba del panel con los
  cangrejos de los agentes en curso a 30×14 y un punto de color en cada fila.
- **Archivos:** modifica `plugins/savvy-progress/hooks/register.tsx` (rama de la terminal del panel); crea
  `hooks/raster.ts` (rejilla de pixeles → celdas ▀) si el motor acepta imports relativos, si no va dentro de
  `register.tsx`; crea `hooks/raster.test.ts`. No toca el dibujo SVG del escritorio. Fuera del fork: `.gitignore`,
  `AGENTS.md` y ficha en el repo TI; instalación desde el marketplace local `claude-kit-conaltura`.
- **Contratos:** `rasterize(draw, opts) → { columns, rows, cells }` (cells en base64, tripletas u32
  `[codePoint, fg, bg]`, `0x01000000` = color por defecto para lo transparente); `Raster key="crab-<id>"`;
  `$.clock.every(250, …)` solo mientras haya agentes en curso y el panel esté puesto; si `$.ui.blit` responde
  `{ deny }`, el temporizador se detiene sin error.
- **Pruebas:** `raster.test.ts` (una celda, transparencia arriba/abajo, par ▀ con dos colores, tamaño fuera de rango,
  base64 que el motor decodifica). Terminado = `claude plugin test plugins/savvy-progress` → 24 + nuevas, 0 fallan;
  `tsc -p plugins/savvy-progress` sin errores; `claude plugin validate plugins/savvy-progress` limpio; JD lo ve en su
  terminal.
- **Riesgos:** herdr no pasa el color verdadero (se detecta lo primero, con un Raster de 1 celda); al reducir a la mitad
  se pierden accesorios de 1 pixel (por eso JD elige A o B); el motor no acepta imports relativos (todo en
  `register.tsx`, como lo tiene el autor).
- **Rama y PR:** `feat/terminal-crabs-f1`, desde `upstream/main` → PR a `conaltura` en el fork.
- **Quién:** Claude.
- **Revisión:** `ti-revisar` normal. Nada delicado (sin red, procesos ni secretos).

### F2 · Los 6 disfraces del autor en la terminal
- **Objetivo:** astronauta, detective, ingeniero, chef, piloto y pirata se ven en la terminal con el movimiento de su
  accesorio; modo compacto con mini cangrejos; tareas planeadas atenuadas; espejo en hebreo.
- **Archivos:** modifica `hooks/register.tsx` (o `raster.ts`); crea `hooks/frames.ts` y `hooks/frames.test.ts`.
- **Contratos:** `frame(costume, n, { mirror, dim }) → pixeles` con 4 cuadros por segundo: patas alternan, el cuerpo
  sube y baja, y cada accesorio pasa las animaciones CSS a desplazamientos o parpadeos (las rotaciones se aproximan
  con cuadros alternos). Atenuado = mezclar con el fondo por defecto al 45 %.
- **Pruebas:** `frames.test.ts` (los cuadros de cada disfraz son fijos y distintos entre sí; el espejo invierte las
  columnas; atenuado). Terminado = `claude plugin test` en verde, `tsc` y `validate` limpios.
- **Riesgos:** las rotaciones (llave, sartén, tortilla) no se leen a media resolución → cuadros dibujados a mano para
  esos accesorios.
- **Rama y PR:** `feat/terminal-crabs-f2`, desde `feat/terminal-crabs-f1` → PR a `conaltura`. Después, **PR 1 al
  autor** desde `upstream/terminal-crabs` (F1 + F2 sobre `upstream/main`); JD lee el texto antes de abrirlo.
- **Quién:** Claude.
- **Revisión:** `ti-revisar` normal.

### F3 · Disfraz por tarea y por esfuerzo, y panel en español
- **Objetivo:** todo agente lleva un disfraz: primero por su tipo (opción `costumes`, por ejemplo
  `explorador=explore,revisor=heavy`), después por nivel `savvy-*`, `Explore` = pirata y, si no, por modelo y esfuerzo
  (Fable = astronauta, Opus xhigh = detective, high = ingeniero, medium = chef, low = piloto). El panel queda en
  español (`language: es`).
- **Archivos:** modifica `hooks/register.tsx` (`costumeOf`, `STRINGS`, opciones), `.claude-plugin/plugin.json`
  (`userConfig.costumes`, `language` con `es`), `README.md`; crea `hooks/costume.test.ts`.
- **Contratos:** `costumeOf(type, model, effort, map) → costume`; `userConfig.costumes`: texto `tipo=disfraz`
  separado por comas; un disfraz desconocido cae al siguiente criterio.
- **Pruebas:** `costume.test.ts` (tabla de tipos y de modelo/esfuerzo, mapa con errores, prefijo de plugin
  `x:savvy-careful`); prueba de textos en español. Terminado = `claude plugin test` en verde.
- **Riesgos:** el esfuerzo de un agente no siempre llega en el evento (`a.effort` vacío) → cae al modelo solo.
- **Rama y PR:** `feat/costume-map-f3` → PR a `conaltura`. Después, **PR 2 al autor**; JD lee el texto antes.
- **Quién:** Claude.
- **Revisión:** `ti-revisar` normal.

### F4 · Maqueta del equipo de obra
- **Objetivo:** JD ve los 7 trajes de obra lado a lado, en escritorio (SVG) y en terminal (simulación de celdas ▀), y
  los aprueba o ajusta.
- **Archivos:** Artifact (HTML en el scratchpad); no toca el fork.
- **Contratos:** cada traje en la rejilla de 30×28 con `Fill`, clases de accesorio para su movimiento; colores de
  `conaltura-web-design`.
- **Pruebas:** puerta de JD sobre la maqueta (cada fase republica en la misma URL).
- **Riesgos:** a media resolución los trajes se confunden → se valida en la vista de terminal de la maqueta.
- **Rama y PR:** sin rama (solo Artifact). Puede ir en paralelo a F2 o F3.
- **Quién:** Claude.
- **Revisión:** puerta de diseño con JD.

### F5 · Trajes de obra en el fork y cierre
- **Objetivo:** el equipo de obra trabaja en el panel (escritorio y terminal) y el mapa por defecto del fork lo asigna
  a nuestros agentes; documentación cerrada.
- **Archivos:** modifica `hooks/register.tsx` (`COSTUMES`, `CRAB_CSS`, frames de terminal) y `plugin.json` (valor por
  defecto de `costumes` en el fork, versión `1.x.y-conaltura.1`); crea `hooks/costumes-obra.test.ts`. En TI:
  `references/mods.md` de `ti-guardarrailes`, nota en el ADR-0026, ficha a `produccion`, `_meta/log.md`.
- **Contratos:** disfraces `obra-topografo`, `obra-obrero`, `obra-interventor`, `obra-arquitecto`, `obra-plan`,
  `obra-guia`, `obra-maestro`.
- **Pruebas:** `costumes-obra.test.ts` (cada traje cabe en la rejilla, tiene cuadros de terminal y el mapa por
  defecto cubre los 7 tipos). Terminado = `claude plugin test` en verde y JD los ve en su terminal.
- **Riesgos:** conflicto al traer cambios del autor → los trajes viven en un bloque propio del archivo.
- **Rama y PR:** `feat/obra-f5` → PR a `conaltura`.
- **Quién:** Claude.
- **Revisión:** `ti-revisar` normal.

**Dependencias:** F1 → F2 → F3 → F5 (mismo archivo). F4 puede adelantarse en paralelo.

## Plan de pruebas
| Prueba | Fase | Comando |
|---|---|---|
| 24 pruebas del autor (base) | todas | `claude plugin test plugins/savvy-progress` |
| `raster.test.ts` | F1 | idem |
| `frames.test.ts` | F2 | idem |
| `costume.test.ts` | F3 | idem |
| `costumes-obra.test.ts` | F5 | idem |
| Tipos | todas | `tsc -p plugins/savvy-progress` |
| Validación del mod | todas | `claude plugin validate plugins/savvy-progress` |
| Secretos | cada PR | `gitleaks detect` a mano (el fork no lleva pre-commit para no mandarlo al autor) |
| Visual | F1, F2, F5 | JD abre `/agents-info` en su terminal con un agente en curso |

## Supuestos
- El fork `PotterHPL/claude-kit` es público (viene de un repo público).
- `conaltura` es la rama principal del fork; `main` sigue al autor.
- El repo vive en `40-ia/mods/claude-kit`, excluido del repo TI como `mcps-personales`.

## Relevo
- **2026-10-27 · F1 cerrada** (PR #1 fusionado). Decisiones de JD en las iteraciones visuales:
  - `row` (cangrejo por fila) en vez de `stage`; cangrejo pequeño de 9 × 6 pixeles (3 filas), dibujado a mano para la
    terminal (la media resolución del sprite quedaba grande y pesada). Patas de 2 pixeles que se acortan por turnos.
  - Fila calcada del escritorio: título numerado y tiempo; nivel en su color (para agentes que no son de Savvy, su
    tipo en el color del nivel que corresponde a su modelo y esfuerzo) y modelo atenuado; pasos `n/total · nota` y
    cifras; barra `▃` de lado a lado en el color del nivel. Dos líneas entre agentes y una bajo cada encabezado.
  - `reportSteps: any`: todo subagente reporta sus pasos (instalación de JD). Panel acoplado a 56 columnas.
  - Validación visual con un simulador de la cuadrícula de la terminal (scratchpad) antes de cada iteración.
- **Para F2:** barra también en los terminados (llena, en su color), como el escritorio; cangrejo atenuado con disfraz
  en «Planned»; disfraces a la escala del cangrejo pequeño (los sombreros necesitan filas encima: decidir con JD si
  la fila crece a 4).
- **Idea anotada (sin fase):** que la sesión principal reporte su plan con `progress` al delegar varias tareas, para ver
  «Planned» sin Savvy Flow.
- Siguiente: **F2**.
