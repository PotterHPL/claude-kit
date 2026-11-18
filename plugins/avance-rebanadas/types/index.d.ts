export type Estado = 'aceptada' | 'en revisión' | 'en curso' | 'pendiente'

export type Rebanada = { id: string; queVeras: string; estado: Estado }

export type Avance = { rebanadas: Rebanada[]; aceptadas: number; total: number }

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
    }
  }
}
