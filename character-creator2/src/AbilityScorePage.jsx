import { useState, useEffect } from 'react'
import BackButton from './BackButton'
import './AbilityScorePage.css'
import { useLanguage } from './LanguageContext'
import T from './translations'

const ABILITIES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
const ABILITY_ABBR = { Strength: 'STR', Dexterity: 'DEX', Constitution: 'CON', Intelligence: 'INT', Wisdom: 'WIS', Charisma: 'CHA' }
const ABILITY_ICONS = { Strength: '⚔️', Dexterity: '🏹', Constitution: '🛡️', Intelligence: '📖', Wisdom: '🔮', Charisma: '✨' }

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

const MAX_REROLLS = 3

const getMod = (score) => Math.floor((score - 10) / 2)
const fmtMod = (mod) => mod >= 0 ? `+${mod}` : `${mod}`

const PB_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
const PB_MIN = 8
const PB_MAX = 15
const PB_BUDGET = 27

const rollAbilityScore = () => {
  const dice = Array.from({ length: 4 }, () => Math.ceil(Math.random() * 6))
  dice.sort((a, b) => a - b)
  const dropped = dice[0]
  const kept = dice.slice(1)
  const total = kept.reduce((s, d) => s + d, 0)
  return { dice, dropped, kept, total }
}

function Chrome({ race, background, cls }) {
  return (
    <>
      <div className="rune-border top">
        {RUNES.map((r, i) => <span key={i} className="rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>)}
      </div>
      <div className="rune-border bottom">
        {[...RUNES].reverse().map((r, i) => <span key={i} className="rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>)}
      </div>
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${7 + Math.random() * 8}s`,
            fontSize: `${8 + Math.random() * 9}px`,
          }}>{RUNES[Math.floor(Math.random() * RUNES.length)]}</span>
        ))}
      </div>
      <div className="corner tl" aria-hidden="true">✦</div>
      <div className="corner tr" aria-hidden="true">✦</div>
      <div className="corner bl" aria-hidden="true">✦</div>
      <div className="corner br" aria-hidden="true">✦</div>
    </>
  )
}

// ─── Method picker ────────────────────────────────────────────────────────────
function MethodPicker({ onChoose }) {
  const { lang } = useLanguage()
  const t = T[lang]
  return (
    <div className="method-picker">
      <div className="method-card" onClick={() => onChoose('roll')}>
        <div className="method-icon">🎲</div>
        <h2 className="method-name">{t.ability_methodRollTitle}</h2>
        <p className="method-desc">
          {t.ability_methodRollDesc}
        </p>
        <div className="method-tags">
          <span className="method-tag">High variance</span>
          <span className="method-tag">Classic</span>
          <span className="method-tag">Exciting</span>
        </div>
        <div className="method-cta">{t.ability_methodChoose}</div>
      </div>

      <div className="method-divider" aria-hidden="true">
        <span className="divider-line-v" />
        <span className="divider-or">or</span>
        <span className="divider-line-v" />
      </div>

      <div className="method-card" onClick={() => onChoose('pointbuy')}>
        <div className="method-icon">⚖️</div>
        <h2 className="method-name">{t.ability_methodPointTitle}</h2>
        <p className="method-desc">
          {t.ability_methodPointDesc}
        </p>
        <div className="method-tags">
          <span className="method-tag">Balanced</span>
          <span className="method-tag">Tactical</span>
          <span className="method-tag">Controlled</span>
        </div>
        <div className="method-cta">{t.ability_methodChoose}</div>
      </div>
    </div>
  )
}

// ─── Background bonus picker ──────────────────────────────────────────────────
function BackgroundBonusPicker({ background, baseScores, onConfirm }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const eligibleStats = background?.abilityScores || ABILITIES
  const [bonusMode, setBonusMode] = useState(null) // null | 'spread' | 'focused'
  // spread: +1 to all eligible stats
  // focused: +2 to one, +1 to another (both from eligible)
  const [plusTwo, setPlusTwo] = useState(null)
  const [plusOne, setPlusOne] = useState(null)

  const finalScores = { ...baseScores }
  if (bonusMode === 'spread') {
    eligibleStats.forEach(s => { finalScores[s] = (finalScores[s] || 0) + 1 })
  } else if (bonusMode === 'focused') {
    if (plusTwo) finalScores[plusTwo] = (finalScores[plusTwo] || 0) + 2
    if (plusOne) finalScores[plusOne] = (finalScores[plusOne] || 0) + 1
  }

  const focusedReady = bonusMode === 'focused' && plusTwo && plusOne && plusTwo !== plusOne
  const spreadReady  = bonusMode === 'spread'
  const canConfirm   = spreadReady || focusedReady

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm(finalScores)
  }

  return (
    <div className="bonus-picker-wrap">
      <div className="bonus-picker-header">
        <div className="bonus-bg-badge">
          <span className="bonus-bg-icon">{background?.icon}</span>
          <span className="bonus-bg-name">{background?.name}</span>
        </div>
        <p className="bonus-picker-subtitle">
          {t.ability_bonusSubtitle}
        </p>
        <p className="bonus-eligible-label">
          Eligible abilities: {eligibleStats.map(s => ABILITY_ABBR[s]).join(', ')}
        </p>
      </div>

      {/* Mode selection */}
      {!bonusMode && (
        <div className="bonus-mode-picker">
          <div className="bonus-mode-card" onClick={() => setBonusMode('spread')}>
            <div className="bonus-mode-icon">🌟</div>
            <div className="bonus-mode-title">Even Spread</div>
            <div className="bonus-mode-desc">
              +1 to <strong>all three</strong> eligible abilities
            </div>
            <div className="bonus-mode-pills">
              {eligibleStats.map(s => (
                <span key={s} className="bonus-pill">{ABILITY_ABBR[s]} +1</span>
              ))}
            </div>
            <div className="method-cta">{t.ability_methodChoose}</div>
          </div>

          <div className="method-divider" aria-hidden="true">
            <span className="divider-line-v" />
            <span className="divider-or">or</span>
            <span className="divider-line-v" />
          </div>

          <div className="bonus-mode-card" onClick={() => setBonusMode('focused')}>
            <div className="bonus-mode-icon">🎯</div>
            <div className="bonus-mode-title">Focused</div>
            <div className="bonus-mode-desc">
              +2 to one ability, +1 to another
            </div>
            <div className="bonus-mode-pills">
              <span className="bonus-pill bonus-pill-2">One stat +2</span>
              <span className="bonus-pill">One stat +1</span>
            </div>
            <div className="method-cta">{t.ability_methodChoose}</div>
          </div>
        </div>
      )}

      {/* Spread mode: just preview & confirm */}
      {bonusMode === 'spread' && (
        <div className="bonus-spread-preview">
          <button className="back-method-btn" onClick={() => setBonusMode(null)}>← Change mode</button>
          <p className="bonus-spread-info">
            Each of your three background abilities receives <strong>+1</strong>.
          </p>
          <div className="bonus-preview-grid">
            {ABILITIES.map(ability => {
              const base  = baseScores[ability]
              const bonus = eligibleStats.includes(ability) ? 1 : 0
              const total = base + bonus
              return (
                <div key={ability} className={`bonus-prev-card ${bonus > 0 ? 'has-bonus' : ''}`}>
                  <div className="roll-card-header">
                    <span className="roll-icon">{ABILITY_ICONS[ability]}</span>
                    <span className="roll-abbr">{ABILITY_ABBR[ability]}</span>
                  </div>
                  <div className="bonus-prev-score">{total}</div>
                  <div className={`bonus-prev-mod ${getMod(total) >= 0 ? 'pos' : 'neg'}`}>{fmtMod(getMod(total))}</div>
                  {bonus > 0 && <div className="bonus-badge">+{bonus}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Focused mode: pick +2 then +1 */}
      {bonusMode === 'focused' && (
        <div className="bonus-focused-wrap">
          <button className="back-method-btn" onClick={() => { setBonusMode(null); setPlusTwo(null); setPlusOne(null) }}>← Change mode</button>

          <div className="bonus-focused-steps">
            {/* +2 selection */}
            <div className="bonus-step">
              <div className="bonus-step-label">
                <span className="bonus-step-badge">+2</span>
                Choose which ability gets the bigger bonus
              </div>
              <div className="bonus-stat-row">
                {eligibleStats.map(stat => (
                  <button
                    key={stat}
                    className={`bonus-stat-btn ${plusTwo === stat ? 'selected-2' : ''} ${plusOne === stat ? 'locked' : ''}`}
                    onClick={() => { if (plusOne !== stat) setPlusTwo(plusTwo === stat ? null : stat) }}
                    disabled={plusOne === stat}
                  >
                    <span className="bsb-icon">{ABILITY_ICONS[stat]}</span>
                    <span className="bsb-abbr">{ABILITY_ABBR[stat]}</span>
                    {plusTwo === stat && <span className="bsb-bonus">+2</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* +1 selection */}
            <div className={`bonus-step ${!plusTwo ? 'step-locked' : ''}`}>
              <div className="bonus-step-label">
                <span className="bonus-step-badge bonus-step-badge-1">+1</span>
                Choose which ability gets the smaller bonus
              </div>
              <div className="bonus-stat-row">
                {eligibleStats.map(stat => (
                  <button
                    key={stat}
                    className={`bonus-stat-btn ${plusOne === stat ? 'selected-1' : ''} ${plusTwo === stat ? 'locked' : ''}`}
                    onClick={() => { if (plusTwo !== stat) setPlusOne(plusOne === stat ? null : stat) }}
                    disabled={!plusTwo || plusTwo === stat}
                  >
                    <span className="bsb-icon">{ABILITY_ICONS[stat]}</span>
                    <span className="bsb-abbr">{ABILITY_ABBR[stat]}</span>
                    {plusOne === stat && <span className="bsb-bonus">+1</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {(plusTwo || plusOne) && (
            <div className="bonus-preview-grid" style={{ marginTop: '1.5rem' }}>
              {ABILITIES.map(ability => {
                const base  = baseScores[ability]
                const bonus = ability === plusTwo ? 2 : ability === plusOne ? 1 : 0
                const total = base + bonus
                return (
                  <div key={ability} className={`bonus-prev-card ${bonus > 0 ? 'has-bonus' : ''}`}>
                    <div className="roll-card-header">
                      <span className="roll-icon">{ABILITY_ICONS[ability]}</span>
                      <span className="roll-abbr">{ABILITY_ABBR[ability]}</span>
                    </div>
                    <div className="bonus-prev-score">{total}</div>
                    <div className={`bonus-prev-mod ${getMod(total) >= 0 ? 'pos' : 'neg'}`}>{fmtMod(getMod(total))}</div>
                    {bonus > 0 && <div className="bonus-badge bonus-badge-num">+{bonus}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {canConfirm && (
        <div className="roll-actions" style={{ marginTop: '2rem' }}>
          <button className="confirm-scores-btn" onClick={handleConfirm}>
            <span className="confirm-scores-inner">
              <span>⬡</span>
              {t.ability_confirmFinal}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Rolling method ───────────────────────────────────────────────────────────
function RollingMethod({ onConfirm }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const emptyScores = () => ABILITIES.map(() => null)
  const [rolls, setRolls]       = useState(emptyScores)
  const [rolling, setRolling]   = useState(false)
  const [rolled, setRolled]     = useState(false)
  const [animIdx, setAnimIdx]   = useState(-1)
  const [rerollsUsed, setRerollsUsed] = useState(0)

  const rerollsLeft = MAX_REROLLS - rerollsUsed
  const canReroll   = rerollsLeft > 0

  const rollAll = () => {
    if (rolling) return
    if (rolled && !canReroll) return
    setRolling(true)
    setRolled(false)
    if (rolled) setRerollsUsed(prev => prev + 1)
    const results = emptyScores()

    ABILITIES.forEach((_, i) => {
      setTimeout(() => {
        setAnimIdx(i)
        results[i] = rollAbilityScore()
        setRolls([...results])
        if (i === ABILITIES.length - 1) {
          setTimeout(() => {
            setRolling(false)
            setRolled(true)
            setAnimIdx(-1)
          }, 400)
        }
      }, i * 320)
    })
  }

  const allRolled = rolls.every(r => r !== null)

  return (
    <div className="rolling-wrap">
      <p className="method-note">
        Roll <strong>4d6</strong> for each ability score. The <strong>lowest die is dropped</strong> and the remaining three are summed. Click the button to roll all at once.
      </p>

      <div className="roll-grid">
        {ABILITIES.map((ability, i) => {
          const r = rolls[i]
          const isAnimating = animIdx === i
          return (
            <div key={ability} className={`roll-card ${r ? 'has-result' : ''} ${isAnimating ? 'animating' : ''}`}>
              <div className="roll-card-header">
                <span className="roll-icon">{ABILITY_ICONS[ability]}</span>
                <span className="roll-abbr">{ABILITY_ABBR[ability]}</span>
              </div>
              {r ? (
                <>
                  <div className="roll-dice-row">
                    {r.dice.map((d, di) => (
                      <span key={di} className={`die ${d === r.dropped && di === r.dice.indexOf(r.dropped) ? 'dropped' : 'kept'}`}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="roll-total">{r.total}</div>
                  <div className="roll-mod">{fmtMod(getMod(r.total))}</div>
                </>
              ) : (
                <div className="roll-empty">—</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="roll-actions">
        <div className="roll-btn-group">
          <button
            className={`roll-btn ${rolling ? 'rolling' : ''} ${rolled && !canReroll ? 'roll-btn-disabled' : ''}`}
            onClick={rollAll}
            disabled={rolling || (rolled && !canReroll)}
          >
            <span className="roll-btn-inner">
              <span className="roll-btn-icon">🎲</span>
              {rolling ? t.ability_rollingBtn : rolled ? t.ability_rerollBtn : t.ability_rollBtn}
            </span>
          </button>
          {rolled && (
            <div className={`reroll-counter ${rerollsLeft === 0 ? 'reroll-counter-empty' : rerollsLeft === 1 ? 'reroll-counter-low' : ''}`}>
              {rerollsLeft === 0
                ? 'No rerolls left'
                : `${rerollsLeft} reroll${rerollsLeft !== 1 ? 's' : ''} remaining`
              }
            </div>
          )}
        </div>

        {allRolled && (
          <button className="confirm-scores-btn" onClick={() => onConfirm(rolls.map(r => r.total))}>
            <span className="confirm-scores-inner">
              <span>⬡</span>
              Confirm Scores
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Point buy method ─────────────────────────────────────────────────────────
function PointBuyMethod({ onConfirm }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const [scores, setScores] = useState(
    Object.fromEntries(ABILITIES.map(a => [a, 8]))
  )

  const spent = Object.values(scores).reduce((s, v) => s + PB_COST[v], 0)
  const remaining = PB_BUDGET - spent

  const increase = (ability) => {
    const cur = scores[ability]
    if (cur >= PB_MAX) return
    const nextCost = PB_COST[cur + 1] - PB_COST[cur]
    if (remaining < nextCost) return
    setScores(prev => ({ ...prev, [ability]: cur + 1 }))
  }

  const decrease = (ability) => {
    const cur = scores[ability]
    if (cur <= PB_MIN) return
    setScores(prev => ({ ...prev, [ability]: cur - 1 }))
  }

  const allSpent = remaining === 0

  return (
    <div className="pointbuy-wrap">
      <div className="pb-budget-bar">
        <span className="pb-budget-label">Points Remaining</span>
        <div className="pb-pips">
          {Array.from({ length: PB_BUDGET }).map((_, i) => (
            <span key={i} className={`pb-pip ${i < remaining ? 'active' : ''}`} />
          ))}
        </div>
        <span className={`pb-budget-count ${remaining === 0 ? 'spent' : ''}`}>{remaining} / {PB_BUDGET}</span>
      </div>

      <p className="method-note">
        Every score starts at <strong>8</strong>. Scores from 8–13 cost <strong>1 point</strong> per step; 14 costs <strong>2 extra</strong>, and 15 costs <strong>2 more</strong>. Maximum score is <strong>15</strong> before bonuses.
      </p>

      <div className="pb-grid">
        {ABILITIES.map(ability => {
          const score = scores[ability]
          const mod   = getMod(score)
          const canUp   = score < PB_MAX && remaining >= (PB_COST[score + 1] - PB_COST[score])
          const canDown = score > PB_MIN

          return (
            <div key={ability} className="pb-card">
              <div className="pb-card-header">
                <span className="roll-icon">{ABILITY_ICONS[ability]}</span>
                <span className="roll-abbr">{ABILITY_ABBR[ability]}</span>
              </div>

              <div className="pb-controls">
                <button
                  className={`pb-btn ${!canDown ? 'disabled' : ''}`}
                  onClick={() => decrease(ability)}
                  disabled={!canDown}
                  aria-label={`Decrease ${ability}`}
                >−</button>

                <div className="pb-score-block">
                  <span className="pb-score">{score}</span>
                  <span className={`pb-mod ${mod >= 0 ? 'pos' : 'neg'}`}>{fmtMod(mod)}</span>
                </div>

                <button
                  className={`pb-btn ${!canUp ? 'disabled' : ''}`}
                  onClick={() => increase(ability)}
                  disabled={!canUp}
                  aria-label={`Increase ${ability}`}
                >+</button>
              </div>

              <div className="pb-cost-label">
                Cost: {PB_COST[score]} pt{PB_COST[score] !== 1 ? 's' : ''}
              </div>
            </div>
          )
        })}
      </div>

      <div className="roll-actions">
        <button
          className={`confirm-scores-btn ${allSpent ? '' : 'dim'}`}
          onClick={() => onConfirm(ABILITIES.map(a => scores[a]))}
        >
          <span className="confirm-scores-inner">
            <span>⬡</span>
            {allSpent ? 'Confirm Scores' : `Confirm (${remaining} pts unspent)`}
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AbilityScorePage({ race, background, cls, onConfirm, onBack }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const [visible, setVisible]       = useState(false)
  const [method, setMethod]         = useState(null)   // null | 'roll' | 'pointbuy'
  const [baseScores, setBaseScores] = useState(null)   // null until method confirmed

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  // Called when the user confirms base scores from rolling or point buy
  const handleBaseScoresConfirm = (scoreArray) => {
    // scoreArray may be an array (roll) or already a map (pointbuy)
    const scoreMap = Array.isArray(scoreArray)
      ? Object.fromEntries(ABILITIES.map((a, i) => [a, scoreArray[i]]))
      : Object.fromEntries(ABILITIES.map((a, i) => [a, scoreArray[i]]))
    setBaseScores(scoreMap)
  }

  const handlePointBuyConfirm = (scoresArr) => {
    const scoreMap = Object.fromEntries(ABILITIES.map((a, i) => [a, scoresArr[i]]))
    setBaseScores(scoreMap)
  }

  // Called when background bonuses are finalized
  const handleFinalConfirm = (finalScoreMap) => {
    if (onConfirm) onConfirm({ method, scores: finalScoreMap })
  }

  const subtitle = baseScores
    ? 'Apply your background ability score bonuses before finalizing.'
    : !method
      ? 'Choose how you will determine the six ability scores that define your character\'s raw capabilities.'
      : method === 'roll'
        ? 'The dice decide your fate — roll 4d6 and drop the lowest.'
        : 'Spend your 27 points wisely — every score matters.'

  return (
    <div className={`as-root ${visible ? 'visible' : ''}`}>
      {onBack && <BackButton onClick={onBack} />}
      <Chrome race={race} background={background} cls={cls} />

      <main className="as-main">
        <header className="as-header">
          <p className="eyebrow">{t.ability_eyebrow}</p>
          <h1 className="as-title">{t.ability_title} <span className="accent">{t.ability_titleAccent}</span></h1>
          <div className="selections-reminder">
            {race       && <span className="sel-item">{race.icon} {race.name}</span>}
            {race       && background && <span className="sel-sep">◆</span>}
            {background && <span className="sel-item">{background.icon} {background.name}</span>}
            {background && cls        && <span className="sel-sep">◆</span>}
            {cls        && <span className="sel-item">{cls.icon} {cls.name}</span>}
          </div>
          <p className="as-subtitle">{subtitle}</p>

          {method && !baseScores && (
            <button className="back-method-btn" onClick={() => setMethod(null)}>
              ← Change method
            </button>
          )}
          {baseScores && (
            <button className="back-method-btn" onClick={() => setBaseScores(null)}>
              ← Back to scores
            </button>
          )}
        </header>

        {!method && !baseScores && <MethodPicker onChoose={setMethod} />}

        {method === 'roll' && !baseScores && (
          <RollingMethod onConfirm={(arr) => setBaseScores(Object.fromEntries(ABILITIES.map((a, i) => [a, arr[i]])))} />
        )}
        {method === 'pointbuy' && !baseScores && (
          <PointBuyMethod onConfirm={(arr) => setBaseScores(Object.fromEntries(ABILITIES.map((a, i) => [a, arr[i]])))} />
        )}

        {baseScores && (
          <BackgroundBonusPicker
            background={background}
            baseScores={baseScores}
            onConfirm={handleFinalConfirm}
          />
        )}
      </main>
    </div>
  )
}
