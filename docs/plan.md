# Plan: Cuadrilla Neón (estilo clásico o cyberpunk en el panel de agentes)

Rediseño de `plugins/savvy-progress` en el fork `PotterHPL/claude-kit` (rama `conaltura`, marketplace
`claude-kit-conaltura`). Ficha: `50-conocimiento/proyectos/savvy-progress-conaltura.md` en el repo TI. Regla de mods:
ADR-0026. El estilo lo fija `/estilo` (plantilla de cierre, ADR-0037 del repo TI). Planes anteriores de este repo:
`docs/plan-savvy-progress.md` (mascotas) y `docs/plan-avance-rebanadas.md` (barra de avance).

## Relevo
- Avance: 3 de 4 rebanadas aceptadas (75 %).
- R1 (PR #16), R2 (PR #17) y R3 (PR #18) aceptadas el 2026-11-19. En R3, JD vio el cromo, el camuflaje y la calavera.
- R4 en revisión: barra de 2 líneas con un servocráneo y un mago nuevos de 9 × 4, animados todo el tiempo que
  se ve la barra, haya o no agentes (D11; JD vio grandes las de 4 y 3 líneas, y la primera de 2 líneas «no se ve bien») (`bandMascot`), acentos neón y lluvia en cyberpunk,
  versión `1.3.0-conaltura.1`. 79 pruebas pasan. Siguiente: JD la ve con `/reload-plugins` en los dos estilos.
- Pendiente fuera del fork: registrar el commit revisado en `ti-guardarrailes/references/mods.md` (TI) al cerrar R4.
- Maqueta aprobada: `docs/diseno/cuadrilla-neon.html` · https://claude.ai/code/artifact/bba422e8-5b60-4f5f-82bc-cb88b1ccfae4 (v9).
- Video de D10: `TI/60-explicaciones/savvy-progress-conaltura/mascota-en-la-barra/`.

## Decisiones (JD, 2026-11-18 y 2026-11-19)
- **D1** · En el estilo cyberpunk cambian los trajes, la barra y el panel. El clásico conserva su barra y su panel.
- **D2** · La cuadrilla `obra` se borra (queda en el historial de git).
- **D3-D4** · Cyberpunk tiene una sola cuadrilla, cyber-cangrejo. `/cuadrilla` sale del mod: la cuadrilla la decide
  `/estilo` (clásico → savvy, cyberpunk → cyber-cangrejo).
- **D5** · Cyberpunk: la calavera servo flota en la barra y reemplaza al cangrejo de un agente que falla.
- **D6** · Clásico: el árbitro reemplaza al juez (revisor) y el farero al profesor (claude-code-guide).
- **D7** · Clásico por frecuencia: astronauta en general-purpose, pirata en explorador, superhéroe en fork, safari en
  Explore.
- **D8** · Cyberpunk: cangrejo de cromo en fork, camuflaje óptico en Explore.
- **D9** · Clásico: el mago camina en la barra y sigue vistiendo al consejero.
- **D11** · La mascota de la barra es un dibujo nuevo de 9 × 4 pixeles, animado: la barra mide 2 líneas (JD,
  2026-11-19, tras ver las de 4 y 3 líneas).
- **D10** · En la terminal, la barra crece a 4 líneas con su mascota mientras trabajan agentes. Va detrás de la opción
  `bandMascot` (`on` por defecto): si no gusta, se apaga y vuelve la barra de 1 línea.

## Contexto
- Frecuencia real de agentes (333 desde el 2026-07-27): general-purpose 44 %, revisor 33 %, explorador 9 %,
  ejecutor 5 %, fork 4 %, Plan 2 %, Explore 1 %, claude-code-guide 1 %, consejero 1 %.
- Regla de traje (`runCostume`): opción `costumes` → cuadrilla por tipo → `Explore` = pirata → por modelo y esfuerzo.
- La barra de la terminal es una fila de `Raster` (`bandTrackCells`, `hooks/register.tsx:427`) con un spinner que se
  repinta con `$.ui.blit` (`BAND_SPIN_KEY`). El cangrejo de la barra solo existe en el SVG de escritorio (`:414`).
- `$.fs.read` lee rutas absolutas (lo usa `session-band`); `$.env.get` da las variables de entorno. La cuadrilla hoy se
  guarda en `$.store` (`CREW_STORE_KEY`) y `/cuadrilla` redibuja con `update($, now, …)`.
- Línea base (2026-11-19): `claude plugin test plugins/savvy-progress` → 62 pasan, 0 fallan; versión
  `1.2.1-conaltura.1`.

## Rebanadas (plan aprobado por JD el 2026-11-19, `ti-plan`)

| # | Qué verás | Rama | Quién | Depende de | Estado |
|---|---|---|---|---|---|
| R1 | /estilo cyberpunk viste a los agentes de neón | `feat/cuadrilla-neon-r1` | Claude | — | aceptada |
| R2 | El astronauta y el pirata encabezan el panel | `feat/cuadrilla-neon-r2` | Claude | R1 | aceptada |
| R3 | Un agente que falla se vuelve calavera | `feat/cuadrilla-neon-r3` | Claude | R1 | aceptada |
| R4 | La barra crece con la calavera o el mago | `feat/cuadrilla-neon-r4` | Claude | R1, R3 | en revisión |

**Archivos compartidos y su dueño.** Las cuatro tocan `hooks/register.tsx`: van en orden, ninguna en paralelo.
`hooks/crews.test.ts` y este plan: R1. `README.md` del plugin: cada rebanada suma su parte, en orden.
`.claude-plugin/plugin.json` (versión): R4.

### R1 · El interruptor y la cuadrilla cyber-cangrejo
- **Qué verás:** con `/estilo cyberpunk`, los agentes del método salen en `/agents-info` con su traje neón
  (netrunner, brazo ciborg, cazador de glitches, oráculo, fixer, guía de neón, samurái). Con `/estilo clásico`
  vuelven los de savvy, en 2 s o menos y sin reiniciar Claude Code.
- **Qué falta:** el reparto clásico nuevo (R2), fork y Explore cyber y la calavera (R3), la barra y el panel neón (R4).
- **Archivos:** modifica `hooks/register.tsx` (lectura del estilo, `CYBER_PALETTE`, 7 trajes, `CREWS` por estilo;
  borra `OBRA`, `OBRA_PALETTE`, `/cuadrilla` y `CREW_STORE_KEY`; `SAVVY_PALETTE` queda con sus colores propios) y
  `README.md`. Crea `hooks/crews.test.ts`; borra `hooks/costumes-obra.test.ts` (sus casos genéricos pasan a
  `crews.test.ts`). No toca la barra ni los otros plugins.
- **Contratos:**
  - Archivo `~/.claude/estilo-cierre.txt`: `clasico` o `cyberpunk`. Si falta o trae otra cosa, es `clasico`. La ruta
    sale de `$.env.get('USERPROFILE')`, o de `HOME` si no existe.
  - `type Estilo = 'clasico' | 'cyberpunk'`; `let estilo: Estilo`. Se lee en `session.start` y cada `ESTILO_MS = 2000`;
    si cambia, `update($, now, …)` redibuja.
  - `CREWS: Record<Estilo, Record<string, string>>`. Ids nuevos: `cyber-netrunner`, `cyber-brazo`, `cyber-cazador`,
    `cyber-oraculo`, `cyber-fixer`, `cyber-guia`, `cyber-samurai` (filas y cuadros de la maqueta, parte 2).
  - La opción `costumes` sigue ganando sobre la cuadrilla.
- **Escenarios:** ninguno (no hay regla delicada).
- **Pruebas** (`hooks/crews.test.ts`):
  - `sin archivo de estilo, el método viste la cuadrilla savvy`;
  - `con estilo cyberpunk, cada tipo del método viste su traje cyber`;
  - `un valor desconocido en el archivo cuenta como clásico`;
  - `al cambiar el archivo, el panel cambia sin reiniciar`;
  - `/cuadrilla ya no existe`;
  - `la opción costumes gana sobre el estilo`;
  - `un agente fallido se agacha` y `escritorio: la cuadrilla se dibuja` (vienen de `costumes-obra.test.ts`).
  - Terminado: `claude plugin test plugins/savvy-progress` → 0 fallan (unas 64 pasan);
    `tsc -p plugins/savvy-progress` → 0 errores; `claude plugin validate plugins/savvy-progress` → OK.
- **Riesgos:** que `$.fs.read` no lea la carpeta personal en Windows o que `USERPROFILE` no llegue. Se prueba en la
  primera hora, en el PC de JD, mostrando el estilo leído en la cabecera del panel. Si falla, se para y se vuelve a
  `ti-plan`.
- **Rama y PR:** `feat/cuadrilla-neon-r1` → PR a `conaltura`. Lleva este plan y la maqueta en `docs/diseno/`.
- **Quién:** Claude.
- **Revisión:** `ti-revisar`; además `ti-guardarrailes` (`references/mods.md`) sobre la lectura nueva de un archivo de
  la carpeta personal (ADR-0026). Transcribir los 7 trajes es mecánico.

### R2 · El reparto clásico nuevo
- **Qué verás:** en clásico, general-purpose sale de astronauta, explorador de pirata, revisor de árbitro (saca la
  amarilla y la roja), claude-code-guide de farero, fork de superhéroe y Explore de safari.
- **Qué falta:** el mago en la barra (R4).
- **Archivos:** modifica `hooks/register.tsx` (`SAVVY_CREW`: entran `savvy-arbitro` y `savvy-farero`, salen
  `savvy-juez` y `savvy-profesor`; `CREWS.clasico` con 9 tipos), `hooks/crews.test.ts` y `README.md`.
- **Contratos:** `CREWS.clasico` = general-purpose `fable`, revisor `savvy-arbitro`, explorador `explore`,
  ejecutor `savvy-robot`, fork `savvy-heroe`, Plan `savvy-capitan`, Explore `savvy-safari`, claude-code-guide
  `savvy-farero`, consejero `savvy-mago`. El orden de `runCostume` no cambia.
- **Escenarios:** ninguno.
- **Pruebas:** `clásico: los 9 tipos visten el reparto D7`; `Explore viste de safari, no de pirata`;
  `el árbitro y el farero se dibujan en terminal y escritorio`. Terminado: los tres comandos de R1 → 0 fallan.
- **Riesgos:** el astronauta flota (`walks: false`) y el pirata no parpadea: se ven distintos al resto, a propósito.
  Si `fork` no llega con ese nombre, viste por esfuerzo (supuesto 1).
- **Rama y PR:** `feat/cuadrilla-neon-r2`.
- **Quién:** Claude.
- **Revisión:** `ti-revisar`. Mecánico.

### R3 · Cyberpunk completo: fork, Explore y los caídos
- **Qué verás:** en cyberpunk, un fork sale de cangrejo de cromo con un brillo que lo recorre. Explore se vuelve
  invisible por momentos (camuflaje óptico). Un agente que falla se convierte en la calavera servo, con su ✗.
- **Qué falta:** la calavera en la barra (R4).
- **Archivos:** modifica `hooks/register.tsx` (paleta de cromo, `cyber-cromo`, `cyber-camuflaje`, `cyber-calavera`;
  el dibujo de un fallido elige la calavera en cyberpunk, en terminal y escritorio), `hooks/crews.test.ts`, `README.md`.
- **Contratos:** `CREWS.cyberpunk` suma fork `cyber-cromo` y Explore `cyber-camuflaje`. Un fallido en cyberpunk se
  dibuja con `cyber-calavera`; en clásico sigue agachado con su gota.
- **Escenarios:** ninguno.
- **Pruebas:** `cyberpunk: fork viste de cromo, con patas de cromo`; `cyberpunk: Explore desaparece en un cuadro`;
  `cyberpunk: un fallido se dibuja como calavera`; `clásico: un fallido sigue agachado`. Terminado: los tres
  comandos → 0 fallan.
- **Riesgos:** el cuadro invisible del camuflaje puede leerse como un error de dibujo; dura un cuadro de 4.
- **Rama y PR:** `feat/cuadrilla-neon-r3`.
- **Quién:** Claude.
- **Revisión:** `ti-revisar`.

### R4 · La barra y el panel en neón, con su mascota (D10)
- **Qué verás:** mientras trabajan agentes, la barra de la terminal mide 4 líneas. En cyberpunk lleva pista neón con
  lluvia y la calavera flotando al final; en clásico, la barra de siempre con el mago caminando al final. En cyberpunk,
  el panel usa acentos rosa y cian. Con `bandMascot: off`, la barra vuelve a 1 línea.
- **Qué falta:** nada del alcance.
- **Archivos:** modifica `hooks/register.tsx` (barra de la terminal: `Raster` de 9 × 4 con la mascota y su blit
  `BAND_MASCOT_KEY` en el reloj de `FRAME_MS`; colores de `bandTrackCells` y acentos por estilo; lluvia en braille en la
  pista vacía; SVG de escritorio con el mago o la calavera en vez del cangrejo), `hooks/band.test.tsx`,
  `.claude-plugin/plugin.json` (opción `bandMascot` y versión `1.3.0-conaltura.1`), `README.md`.
- **Contratos:** opción `bandMascot: on | off` (`on` por defecto). Mascota de la barra: `savvy-mago` en clásico,
  `cyber-calavera` en cyberpunk. Si la ventana no da para la barra con mascota, sale sin mascota.
- **Escenarios:** ninguno.
- **Pruebas:** `terminal: con agentes trabajando, la barra mide 4 filas y lleva la mascota del estilo`;
  `bandMascot off: la barra vuelve a una fila`; `cyberpunk: la pista usa los colores neón`;
  `escritorio: la barra lleva el mago o la calavera`; `la mascota de la barra se repinta con su propia clave`.
  Terminado: los tres comandos → 0 fallan.
- **Riesgos:** que la fila de la barra se desacomode con un `Raster` de 4 filas en ventanas angostas. Se prueba a 80
  columnas antes de lo demás; si no cabe, la mascota se omite.
- **Rama y PR:** `feat/cuadrilla-neon-r4`.
- **Quién:** Claude.
- **Revisión:** `ti-revisar`.

## Matriz decisión → rebanada
| Decisión | Rebanada |
|---|---|
| D1 trajes / barra y panel | R1 / R4 |
| D2, D3-D4 | R1 |
| D5 caídos / barra | R3 / R4 |
| D6, D7 | R2 |
| D8 | R3 |
| D9, D10 | R4 |

## Plan de pruebas
- En cada rebanada: `claude plugin test plugins/savvy-progress` y `claude plugin validate plugins/savvy-progress`,
  con 0 fallos. `tsc` no aplica: el repo no tiene `tsconfig.json` y los tipos de `claude-code` los da el runtime
  (hallazgo de R1).
- Vista previa: JD corre `/reload-plugins` con la rama de la rebanada y lanza un par de agentes en cada estilo.
- Pre-mortem: si R1 tarda tres días, es por la lectura del archivo en Windows (se prueba en la primera hora). Si R4
  tarda tres días, es por la fila de 4 líneas (se prueba antes que los colores).

## Supuestos (JD puede vetarlos)
1. El tipo de agente de un fork llega al mod como `fork`, como en los transcripts.
2. La versión sube una vez, en R4 (`1.3.0-conaltura.1`).
3. El estilo se relee cada 2 s: el cambio se ve en 2 s o menos.
4. En clásico, los colores de la barra y del panel no cambian; solo se suma el mago.
5. Nada de esto va al autor: es del fork.
