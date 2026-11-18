import { expect, test } from 'claude-code/testing'

import { leerAvance, leerRutaLocal, padre, porcentaje, recienAceptadas, rutaAbsoluta, siguiente, unir } from './plan'

// Como el plan de mcp-proyectos-dwh: título con paréntesis y columna «Depende de».
const SEIS = `# Plan

## Relevo
- Avance: 5 de 6.

## Rebanadas (plan aprobado por JD el 2026-11-13, \`ti-plan\`)

| # | Qué verás | Rama | Quién | Depende de | Estado |
|---|---|---|---|---|---|
| R1 | Frescura | \`feat/x-r1\` | Claude | — | aceptada |
| R2 | Instalador | \`feat/x-r2\` | Claude | R1 | aceptada |
| R3 | Métricas | \`feat/x-r3\` | Claude | R1 | aceptada |
| R4 | Catálogo | \`feat/x-r4\` | Claude | R1 | aceptada |
| R5 | Otras 6 | \`feat/x-r5\` | Claude | R3 | aceptada |
| R6 | La guía y la 1.0.0 | \`feat/x-r6\` | Claude | todas | pendiente |

**Archivos compartidos:**
- algo

### R1 — Frescura
- tabla que no cuenta:

| # | Estado |
|---|---|
| X | aceptada |
`

// Como el de bienvenida-credenciales: texto antes de la tabla y sin «Depende de».
const DOS = `## Rebanadas (1.0.1: configurar el envío desde la app)
Plan aprobado por JD. Las dos rebanadas van en serie.

| # | Qué verás | Rama | Quién | Estado |
|---|---|---|---|---|
| R1 | Menú → «Configurar envío» | \`feat/b-r1\` | Claude (delicada) | en revisión |
| R2 | Sin credenciales, el aviso | \`feat/b-r2\` | Claude | pendiente |
`

test('la tabla de seis rebanadas da 5/6 y la siguiente es R6', () => {
  const a = leerAvance(SEIS)
  expect(a?.aceptadas).toBe(5)
  expect(a?.total).toBe(6)
  expect(porcentaje(a!)).toBe(83)
  expect(siguiente(a!)?.id).toBe('R6')
  expect(siguiente(a!)?.queVeras).toBe('La guía y la 1.0.0')
})

test('texto antes de la tabla y estado «en revisión»', () => {
  const a = leerAvance(DOS)
  expect(a?.aceptadas).toBe(0)
  expect(a?.total).toBe(2)
  expect(a?.rebanadas[0]?.estado).toBe('en revisión')
  expect(siguiente(a!)?.id).toBe('R1')
})

test('con dos secciones de rebanadas manda la última', () => {
  const a = leerAvance(`${SEIS}\n${DOS}`)
  expect(a?.total).toBe(2)
})

test('sin sección, sin tabla o sin columna Estado no hay avance', () => {
  expect(leerAvance('# Plan\n\n## Fases\n| # | Estado |\n|---|---|\n| F1 | hecha |\n')).toBe(null)
  expect(leerAvance('## Rebanadas\nNada todavía.\n\n## Plan de pruebas\n| a | b |\n')).toBe(null)
  expect(leerAvance('## Rebanadas\n| # | Qué verás |\n|---|---|\n| R1 | algo |\n')).toBe(null)
})

test('encabezado y estado con mayúsculas, negritas o sin tilde', () => {
  const a = leerAvance('## Rebanadas\n| # | Que Veras | **ESTADO** |\n|---|---|---|\n| R1 | a | **Aceptada** |\n| R2 | b | En Revision |\n| R3 | c | ??? |\n')
  expect(a?.rebanadas.map(r => r.estado)).toEqual(['aceptada', 'en revisión', 'pendiente'])
})

test('una barra escapada en el texto no corre las columnas', () => {
  const a = leerAvance('## Rebanadas\n| # | Qué verás | Estado |\n|---|---|---|\n| R1 | a \\| b | aceptada |\n')
  expect(a?.rebanadas[0]?.queVeras).toBe('a | b')
  expect(a?.aceptadas).toBe(1)
})

test('rutas de Windows con / y sin / final', () => {
  expect(unir('C:\\Users\\jossa\\TI\\', 'docs/plan.md')).toBe('C:/Users/jossa/TI/docs/plan.md')
  expect(padre('C:\\Users\\jossa')).toBe('C:/Users')
  expect(padre('C:/Users')).toBe('C:/')
  expect(padre('C:/')).toBe(null)
  expect(padre('/repo')).toBe(null)
})

test('ruta_local de una ficha, con o sin comillas', () => {
  expect(leerRutaLocal('---\nslug: x\nruta_local: 10-proyectos/mcps/x\n---')).toBe('10-proyectos/mcps/x')
  expect(leerRutaLocal('ruta_local: "40-ia/mods/claude-kit"\r\n')).toBe('40-ia/mods/claude-kit')
  expect(leerRutaLocal('slug: x')).toBe(null)
})

test('una ruta relativa se toma desde la carpeta de la sesión', () => {
  expect(rutaAbsoluta('C:/TI', '10-proyectos/ti/otro')).toBe('C:/TI/10-proyectos/ti/otro')
  expect(rutaAbsoluta('C:/TI', 'D:\\x\\y.md')).toBe('D:/x/y.md')
  expect(rutaAbsoluta('/repo', '/otro/a.md')).toBe('/otro/a.md')
})

test('recién aceptadas: solo las que cambiaron, y nada sin lectura anterior', () => {
  const antes = leerAvance(DOS)
  const despues = leerAvance(DOS.replace('en revisión', 'aceptada'))
  expect(recienAceptadas(antes, despues).map(r => r.id)).toEqual(['R1'])
  expect(recienAceptadas(null, despues)).toEqual([])
  expect(recienAceptadas(despues, despues)).toEqual([])
})
