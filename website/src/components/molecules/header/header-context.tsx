'use client'
import { createContext, Dispatch, SetStateAction, useState } from 'react'

type HeaderContextType = {
  isMenuOpen: boolean
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>
}

export const HeaderContext = createContext<HeaderContextType>({
  isMenuOpen: false,
  setIsMenuOpen: () => {}
})

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <HeaderContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      {children}
    </HeaderContext.Provider>
  )
}
