export type Estado = 'aceptada' | 'en revisión' | 'en curso' | 'pendiente'

export type Rebanada = { id: string; queVeras: string; estado: Estado }

export type Avance = { rebanadas: Rebanada[]; aceptadas: number; total: number }

// De quién es el turno: lo que muestra la segunda línea de la barra, en orden de prioridad.
export type Turno =
  | { tipo: 'te-toca'; rebanada: Rebanada; mas: number }
  | { tipo: 'trabajando'; rebanada: Rebanada; mas: number }
  | { tipo: 'sigue'; rebanada: Rebanada }
  | { tipo: 'lista' }

export type Proyecto = {
  // Ruta del docs/plan.md, con `/`.
  plan: string
  // Nombre que muestra la barra (la carpeta del proyecto o el slug).
  nombre: string
  // Fijado con `/avance <slug>`.
  fijado: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'avance-rebanadas': {
      proyecto: Proyecto | null
      avance: Avance | null
      oculto: boolean
      // La tarea en curso de la lista de tareas del agente (TodoWrite o TaskUpdate).
      tarea: string | null
      // Lo último que hizo el agente: la descripción de un comando o el archivo que editó.
      accion: string | null
    }
  }
}
