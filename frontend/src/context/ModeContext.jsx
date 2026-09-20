import { createContext, useContext, useState } from 'react'

const ModeContext = createContext(null)

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(() => localStorage.getItem('kaam_mode') || 'jobseeker')

  const setMode = (nextMode) => {
    setModeState(nextMode)
    localStorage.setItem('kaam_mode', nextMode)
  }

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>
}

export function useMode() {
  return useContext(ModeContext)
}
