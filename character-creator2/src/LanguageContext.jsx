import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('dnd_lang') || 'en' } catch { return 'en' }
  })

  const toggle = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'es' : 'en'
      try { localStorage.setItem('dnd_lang', next) } catch {}
      return next
    })
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
