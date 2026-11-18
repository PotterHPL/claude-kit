# avance-rebanadas

Mod de Claude Code de TI Conaltura. Pone encima del prompt la barra de avance del proyecto en que trabajas:

```
mcp-proyectos-dwh  ■■■■■□  5/6 aceptadas (83 %)                                ×
Siguiente: R6 · La guía para Financiera y Gerencia y el .mcpb 1.0.0 instalado…
```

- Un segmento por rebanada: verde = `aceptada`, ámbar = `en revisión`, azul = `en curso`, gris (□) = `pendiente`.
- La cuenta es de rebanadas **aceptadas** sobre el total (ciclo v3, ADR-0033 D5).
- Se lee de la tabla `## Rebanadas` de `docs/plan.md` (la que deja `ti-plan`), por su columna **Estado**. Si hay varias
  secciones `## Rebanadas`, cuenta la última. Un plan por fases, sin esa tabla, no muestra barra.
- Vuelve a leer el plan cada 3 segundos: al marcar una rebanada como aceptada, la barra cambia sola.

## De qué proyecto

- Al abrir la sesión, sube desde la carpeta de trabajo hasta el primer `docs/plan.md`.
- `/avance <slug>`: fija el proyecto por su ficha de la wiki (`50-conocimiento/proyectos/<slug>.md`, campo
  `ruta_local`). Sirve desde la raíz de `TI`. También acepta una ruta: `/avance 10-proyectos/mcps/mcp-proyectos-dwh`.
- `/avance auto`: vuelve al proyecto de la carpeta de trabajo.
- `/avance`: oculta o muestra la barra. La × de la barra también la oculta.

## Qué toca

Solo lee archivos (`$.fs.read`, `$.fs.exists`) y la carpeta de la sesión. No sale a la red, no ejecuta procesos, no
escribe archivos ni intercepta herramientas.

## Pruebas

```
claude plugin validate plugins/avance-rebanadas
claude plugin test plugins/avance-rebanadas
```
