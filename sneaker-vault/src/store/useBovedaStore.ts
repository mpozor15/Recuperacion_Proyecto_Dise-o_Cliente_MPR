import { create } from 'zustand'

interface BovedaState {
  busqueda: string
  setBusqueda: (texto: string) => void
  borrarBusqueda: () => void
}

export const useBovedaStore = create<BovedaState>((set) => ({
  busqueda: "",
  setBusqueda: (texto) => set({ busqueda: texto }),
  borrarBusqueda: () => set({ busqueda: "" }),
}))