import { useLanguage } from './LanguageContext'
import T from './translations'
import './LanguageToggle.css'

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage()
  const t = T[lang]
  return (
    <button
      className="lang-toggle"
      onClick={toggle}
      aria-label={t.langToggleLabel}
      title={t.langToggleLabel}
    >
      <span className="lang-toggle-flag">{lang === 'en' ? '🇪🇸' : '🇺🇸'}</span>
      <span className="lang-toggle-text">{t.langToggle}</span>
    </button>
  )
}
