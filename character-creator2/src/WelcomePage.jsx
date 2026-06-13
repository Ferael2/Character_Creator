import { useState, useEffect } from 'react'
import './WelcomePage.css'
import { useLanguage } from './LanguageContext'
import T from './translations'

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ']

export default function WelcomePage({ onBegin }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const [visible, setVisible] = useState(false)
  const [diceRolling, setDiceRolling] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleBegin = () => {
    setDiceRolling(true)
    setTimeout(() => {
      if (onBegin) onBegin()
    }, 900)
  }

  return (
    <div className={`welcome-root ${visible ? 'visible' : ''}`}>
      <div className="rune-border top">
        {RUNES.map((r, i) => (
          <span key={i} className="rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>
        ))}
      </div>
      <div className="rune-border bottom">
        {[...RUNES].reverse().map((r, i) => (
          <span key={i} className="rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>
        ))}
      </div>

      <div className="particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              fontSize: `${8 + Math.random() * 10}px`,
            }}
          >
            {RUNES[Math.floor(Math.random() * RUNES.length)]}
          </span>
        ))}
      </div>

      <main className="welcome-main">
        <div className="crest" aria-hidden="true">
          <div className="crest-ring outer" />
          <div className="crest-ring inner" />
          <div className="crest-d20">⬡</div>
        </div>

        <div className="title-block">
          <p className="eyebrow">{t.welcome_eyebrow}</p>
          <h1 className="title">
            <span className="title-line">{t.welcome_titleLine1}</span>
            <span className="title-line accent">{t.welcome_titleLine2}</span>
          </h1>
          <p className="subtitle">
            {t.welcome_subtitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>

        <button
          className={`begin-btn ${diceRolling ? 'rolling' : ''}`}
          onClick={handleBegin}
          aria-label={t.welcome_btn}
        >
          <span className="btn-inner">
            <span className="btn-d20" aria-hidden="true">⬡</span>
            <span className="btn-text">{t.welcome_btn}</span>
          </span>
          <span className="btn-glow" aria-hidden="true" />
        </button>

        <p className="fine-print">{t.welcome_finePrint}</p>
      </main>

      <div className="corner tl" aria-hidden="true">✦</div>
      <div className="corner tr" aria-hidden="true">✦</div>
      <div className="corner bl" aria-hidden="true">✦</div>
      <div className="corner br" aria-hidden="true">✦</div>
    </div>
  )
}
