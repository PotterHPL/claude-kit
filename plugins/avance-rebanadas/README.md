# avance-rebanadas

Mod de Claude Code de TI Conaltura. Pone encima del prompt la barra de avance del proyecto en que trabajas:

```
mcp-proyectos-dwh  ■■■■■□  5/6 aceptadas (83 %)                                ×
Siguiente: R6 · La guía para Financiera y Gerencia y el .mcpb 1.0.0 instalado…
```

- Un segmento por rebanada: morado = `aceptada`, magenta = `en revisión`, cyan = `en curso`, gris (□) = `pendiente` (paleta Netrun, la del Neovim).
- La cuenta es de rebanadas **aceptadas** sobre el total (ciclo v3, ADR-0033 D5).
- Se lee de la tabla `## Rebanadas` de `docs/plan.md` (la que deja `ti-plan`), por su columna **Estado**. Si hay varias
  secciones `## Rebanadas`, cuenta la última. Un plan por fases, sin esa tabla, no muestra barra.
- Vuelve a leer el plan cada 3 segundos: al marcar una rebanada como aceptada, la barra cambia sola y sale el aviso
  «✔ R6 aceptada · 6/6 (100 %)».
- Con todas aceptadas, la barra entera pasa a amarillo neón y dice «lista para entregar».

## De qué proyecto

- Al abrir la sesión, sube desde la carpeta de trabajo hasta el primer `docs/plan.md`.
- Sola, mientras trabajas: cuando la sesión lee o edita un archivo (Read, Edit, Write, Glob, Grep, NotebookEdit) de
  un proyecto con rebanadas, la barra pasa a ese proyecto. Sirve trabajando desde la raíz de `TI`.
- `/avance <slug>`: fija el proyecto (la detección automática ya no lo cambia) por su ficha de la wiki (`50-conocimiento/proyectos/<slug>.md`, campo
  `ruta_local`). Sirve desde la raíz de `TI`. También acepta una ruta: `/avance 10-proyectos/mcps/mcp-proyectos-dwh`.
- `/avance auto`: vuelve al proyecto de la carpeta de trabajo.
- `/avance`: oculta o muestra la barra. La × de la barra también la oculta.

## Qué toca

Solo lee archivos (`$.fs.read`, `$.fs.exists`: `docs/plan.md`, fichas de la wiki y `AGENTS.md`) y la carpeta de la
sesión. Observa las llamadas a herramientas (`tool.call`) solo para saber qué archivo se tocó: siempre las entrega
intactas con `next(e)`, sin aprobar ni negar nada. No sale a la red, no ejecuta procesos ni escribe archivos.

## Pruebas

```
claude plugin validate plugins/avance-rebanadas
claude plugin test plugins/avance-rebanadas
```
