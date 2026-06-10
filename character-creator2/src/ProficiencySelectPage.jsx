import { useState, useEffect } from 'react'
import BackButton from './BackButton'
import './ProficiencySelectPage.css'

const CLASS_PROFICIENCY_OPTIONS = {
  Barbarian: { count: 2, skills: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
  Bard:      { count: 3, skills: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History',
                                   'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception',
                                   'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'] },
  Cleric:    { count: 2, skills: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
  Druid:     { count: 2, skills: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
  Fighter:   { count: 2, skills: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
  Monk:      { count: 2, skills: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
  Paladin:   { count: 2, skills: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
  Ranger:    { count: 3, skills: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
  Rogue:     { count: 4, skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation',
                                   'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
  Sorcerer:  { count: 2, skills: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
  Warlock:   { count: 2, skills: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
  Wizard:    { count: 2, skills: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
}

// All skills available for the Skilled feat bonus picks
const ALL_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History',
  'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival',
]

const SKILL_DESCRIPTIONS = {
  'Acrobatics':      'Dexterity — Balance, tumbling, and agile movement.',
  'Animal Handling': 'Wisdom — Calming and controlling animals.',
  'Arcana':          'Intelligence — Knowledge of magic, spells, and planes.',
  'Athletics':       'Strength — Climbing, jumping, and swimming.',
  'Deception':       'Charisma — Misleading others through lies or misdirection.',
  'History':         'Intelligence — Recalling lore about events, people, and places.',
  'Insight':         'Wisdom — Reading a creature\'s intentions and emotions.',
  'Intimidation':    'Charisma — Influencing others through threats or fear.',
  'Investigation':   'Intelligence — Searching for clues and deducing conclusions.',
  'Medicine':        'Wisdom — Stabilizing the dying and diagnosing illnesses.',
  'Nature':          'Intelligence — Knowledge of terrain, plants, and animals.',
  'Perception':      'Wisdom — Noticing things in your environment.',
  'Performance':     'Charisma — Entertaining an audience through art or music.',
  'Persuasion':      'Charisma — Influencing others through tact and diplomacy.',
  'Religion':        'Intelligence — Knowledge of deities, rites, and holy symbols.',
  'Sleight of Hand': 'Dexterity — Pickpocketing, prestidigitation, and fine manipulation.',
  'Stealth':         'Dexterity — Moving without being noticed.',
  'Survival':        'Wisdom — Tracking, hunting, and navigating the wilderness.',
}

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

const SKILLED_FEAT   = 'Skilled'
const EXPERTISE_COUNT = 2

const FIGHTING_STYLES = [
  { name: 'Archery',                  description: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.' },
  { name: 'Blind Fighting',           description: 'You have Blindsight with a range of 10 feet. Within that range, you can see anything not behind total cover, even if you are Blinded or in Darkness.' },
  { name: 'Defense',                  description: 'While you are wearing armor, you gain a +1 bonus to your Armor Class.' },
  { name: 'Dueling',                  description: 'When you are wielding a Melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.' },
  { name: 'Great Weapon Fighting',    description: 'When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can reroll any damage die that shows a 1 or 2, and you must use the new roll.' },
  { name: 'Interception',             description: 'When a creature you can see hits a target, other than you, within 5 feet of you with an attack, you can use your Reaction to reduce the damage the target takes by 1d10 + your Proficiency Bonus.' },
  { name: 'Protection',               description: 'When a creature you can see attacks a target other than you within 5 feet of you, you can use your Reaction to interpose your shield. The attacker has Disadvantage on the attack roll. You must be wielding a Shield.' },
  { name: 'Thrown Weapon Fighting',   description: 'You can draw a weapon that has the Thrown property as part of the attack you make with the weapon. In addition, when you hit with a ranged attack using a Thrown weapon, you gain a +2 bonus to the damage roll.' },
  { name: 'Two-Weapon Fighting',      description: 'When you make an extra attack as a result of using a weapon with the Light property, you can add your ability modifier to the damage of that attack.' },
  { name: 'Unarmed Fighting',         description: 'Your unarmed strikes can deal Bludgeoning damage equal to 1d6 + your Strength modifier. If you have two free hands when you make the strike, the d6 becomes a d8. At the start of each of your turns, you can deal 1d4 Bludgeoning damage to one creature Grappled by you.' },
]

const DIVINE_ORDERS = [
  {
    name: 'Protector',
    description: 'Trained for battle, you gain proficiency with Martial weapons and Heavy armor. Your faith is your shield, and you wade into the frontlines to defend the faithful and crush the wicked.',
  },
  {
    name: 'Thaumaturge',
    description: 'A student of the divine mysteries, you know one extra cantrip from the Cleric spell list. You also gain Expertise in the Arcana or Religion skill (your choice), doubling your Proficiency Bonus for checks using that skill.',
  },
]

const PRIMAL_ORDERS = [
  {
    name: 'Magician',
    description: 'You know one extra cantrip from the Druid spell list. In addition, you gain Expertise in the Arcana skill, doubling your Proficiency Bonus for any Intelligence (Arcana) check you make.',
  },
  {
    name: 'Warden',
    description: 'Trained for battle, you gain proficiency with Martial weapons. You also gain proficiency in the Dexterity (Stealth) skill if you don\'t already have it.',
  },
]

const ELDRITCH_INVOCATIONS = [
  {
    name: 'Agonizing Blast',
    description: 'When you cast Eldritch Blast, add your Charisma modifier to the damage it deals on a hit.',
  },
  {
    name: 'Armor of Shadows',
    description: 'You can cast Mage Armor on yourself at will, without expending a spell slot or material components.',
  },
  {
    name: 'Beast Speech',
    description: 'You can cast Speak with Animals at will, without expending a spell slot.',
  },
  {
    name: 'Beguiling Influence',
    description: 'You gain proficiency in the Deception and Persuasion skills. If you are already proficient, you gain expertise instead.',
  },
  {
    name: 'Devil\'s Sight',
    description: 'You can see normally in Darkness, both magical and nonmagical, to a distance of 120 feet.',
  },
  {
    name: 'Eldritch Mind',
    description: 'You have Advantage on Constitution saving throws that you make to maintain Concentration.',
  },
  {
    name: 'Gaze of Two Minds',
    description: 'You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn.',
  },
  {
    name: 'Mask of Many Faces',
    description: 'You can cast Disguise Self at will, without expending a spell slot.',
  },
  {
    name: 'Misty Visions',
    description: 'You can cast Silent Image at will, without expending a spell slot or material components.',
  },
  {
    name: 'One with Shadows',
    description: 'When you are in an area of Dim Light or Darkness, you can use your action to become Invisible until you move or take an action.',
  },
  {
    name: 'Repelling Blast',
    description: 'When you hit a creature with Eldritch Blast, you can push the creature up to 10 feet away from you in a straight line.',
  },
  {
    name: 'Thief of Five Fates',
    description: 'You can cast Bane once using a Warlock spell slot. You can\'t do so again until you finish a Long Rest.',
  },
]

export default function ProficiencySelectPage({ race, background, cls, onConfirm, onBack }) {
  const [visible,       setVisible]      = useState(false)
  const [selected,      setSelected]     = useState([])
  const [skilled,       setSkilled]      = useState([])
  const [expertise,     setExpertise]    = useState([])
  const [fightingStyle, setFightingStyle]       = useState(null)
  const [divineOrder,   setDivineOrder]          = useState(null)
  const [primalOrder,   setPrimalOrder]          = useState(null)
  const [eldritchInvocation, setEldritchInvocation] = useState(null)
  const [warlockPact, setWarlockPact] = useState(null)
  const [confirmed,     setConfirmed]            = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const options        = CLASS_PROFICIENCY_OPTIONS[cls?.name] ?? { count: 2, skills: [] }
  const bgSkills       = background?.skillProficiencies ?? []
  const hasSkilledFeat = background?.feat === SKILLED_FEAT
  const isRogue        = cls?.name === 'Rogue'
  const isFighter      = cls?.name === 'Fighter'
  const isCleric       = cls?.name === 'Cleric'
  const isDruid        = cls?.name === 'Druid'
  const isWarlock      = cls?.name === 'Warlock'

  const maxClassPicks   = options.count
  const maxSkilledPicks = hasSkilledFeat ? 3 : 0
  const availableSkills = options.skills

  // All proficient skills for expertise eligibility
  const allProficientSkills = [...new Set([...bgSkills, ...selected, ...skilled])]

  // ── Class skill helpers ──
  const isFromBackground  = (s) => bgSkills.includes(s)
  const isFromSkilled     = (s) => skilled.includes(s)
  const isClassSelected   = (s) => selected.includes(s)
  const canClassSelect    = (s) => !isFromBackground(s) && !isClassSelected(s) && selected.length < maxClassPicks

  const toggleClass = (skill) => {
    if (isFromBackground(skill)) return
    if (isClassSelected(skill)) {
      setSelected(prev => prev.filter(s => s !== skill))
      // if this skill was expertise'd, remove it from expertise too
      setExpertise(prev => prev.filter(s => s !== skill))
    } else if (selected.length < maxClassPicks) {
      setSelected(prev => [...prev, skill])
    }
  }

  // ── Skilled feat helpers ──
  // Skilled picks can be any skill not already proficient from background or class
  const isSkilledSelected = (s) => skilled.includes(s)
  const isSkilledLocked   = (s) => isFromBackground(s) || isClassSelected(s)
  const canSkilledSelect  = (s) => !isSkilledLocked(s) && !isSkilledSelected(s) && skilled.length < maxSkilledPicks

  const toggleSkilled = (skill) => {
    if (isSkilledLocked(skill)) return
    if (isSkilledSelected(skill)) {
      setSkilled(prev => prev.filter(s => s !== skill))
      setExpertise(prev => prev.filter(s => s !== skill))
    } else if (skilled.length < maxSkilledPicks) {
      setSkilled(prev => [...prev, skill])
    }
  }

  // ── Expertise helpers (Rogue only) ──
  // Can only expertise a skill you are proficient in
  const isExpertise       = (s) => expertise.includes(s)
  const canExpertise      = (s) => allProficientSkills.includes(s) && !isExpertise(s) && expertise.length < EXPERTISE_COUNT

  const toggleExpertise = (skill) => {
    if (!allProficientSkills.includes(skill)) return
    if (isExpertise(skill)) {
      setExpertise(prev => prev.filter(s => s !== skill))
    } else if (expertise.length < EXPERTISE_COUNT) {
      setExpertise(prev => [...prev, skill])
    }
  }

  // ── Done checks ──
  const classPicksDone     = selected.length === maxClassPicks
  const skilledPicksDone   = !hasSkilledFeat || skilled.length === maxSkilledPicks
  const expertiseDone      = !isRogue   || expertise.length === EXPERTISE_COUNT
  const fightingStyleDone  = !isFighter || fightingStyle !== null
  const divineOrderDone    = !isCleric  || divineOrder !== null
  const primalOrderDone    = !isDruid   || primalOrder !== null
  const invocationDone     = !isWarlock || eldritchInvocation !== null
  const pactDone           = !isWarlock || warlockPact !== null
  const allDone            = classPicksDone && skilledPicksDone && expertiseDone && fightingStyleDone && divineOrderDone && primalOrderDone && invocationDone && pactDone

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => {
      if (onConfirm) onConfirm({ classSkills: selected, backgroundSkills: bgSkills, skilledSkills: skilled, expertise, fightingStyle, divineOrder, primalOrder, eldritchInvocation, warlockPact })
    }, 600)
  }

  // Summary: remaining slots as placeholders
  const classSlotsLeft   = maxClassPicks - selected.length
  const skilledSlotsLeft = maxSkilledPicks - skilled.length
  const expertiseSlotsLeft = EXPERTISE_COUNT - expertise.length

  return (
    <div className={`prof-root ${visible ? 'visible' : ''}`}>
      {onBack && <BackButton onClick={onBack} />}
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

      <main className="prof-main">

        <header className="prof-header">
          <p className="eyebrow">Character Creation — Step IV</p>
          <h1 className="prof-title">Choose Your <span className="accent">Proficiencies</span></h1>
          <div className="selections-reminder">
            {race       && <span className="sel-item">{race.icon} {race.name}</span>}
            {race       && background && <span className="sel-sep">◆</span>}
            {background && <span className="sel-item">{background.icon} {background.name}</span>}
            {background && cls        && <span className="sel-sep">◆</span>}
            {cls        && <span className="sel-item">{cls.icon} {cls.name}</span>}
          </div>
          <p className="prof-subtitle">
            As a <strong>{cls?.name}</strong>, choose <strong>{maxClassPicks}</strong> skill{maxClassPicks !== 1 ? 's' : ''} from your class list.
            {hasSkilledFeat && <> Your <strong>Skilled</strong> feat grants <strong>3 additional</strong> skills from any list.</>}
            {isRogue   && <> Then choose <strong>2 skills</strong> to gain <strong>Expertise</strong> in.</>}
            {isFighter && <> Then choose your <strong>Fighting Style</strong>.</>}
            {isCleric  && <> Then choose your <strong>Divine Order</strong>.</>}
            {isDruid   && <> Then choose your <strong>Primal Order</strong>.</>}
            {isWarlock && <> Then choose your first <strong>Eldritch Invocation</strong>.</>}
            {' '}Skills from your background are locked in automatically.
          </p>
        </header>

        <div className="prof-layout">

          {/* ── Left column ── */}
          <div className="skills-column">

            {/* Section 1 — Class skills */}
            <section className="skills-section">
              <div className="panel-title-row">
                <h2 className="panel-title">Class Skills</h2>
                <span className={`pick-counter ${classPicksDone ? 'done' : ''}`}>
                  {selected.length} / {maxClassPicks} chosen
                </span>
              </div>
              <div className="skills-grid">
                {availableSkills.map(skill => {
                  const fromBg  = isFromBackground(skill)
                  const picked  = isClassSelected(skill)
                  const blocked = !fromBg && !picked && !canClassSelect(skill)
                  return (
                    <button
                      key={skill}
                      className={`skill-card ${picked ? 'picked' : ''} ${fromBg ? 'from-bg' : ''} ${blocked ? 'blocked' : ''}`}
                      onClick={() => toggleClass(skill)}
                      disabled={fromBg}
                      aria-pressed={picked}
                      title={fromBg ? 'Already granted by your background' : undefined}
                    >
                      <div className="skill-card-top">
                        <span className="skill-name">{skill}</span>
                        <span className="skill-badge">
                          {fromBg ? '⚑ Background' : picked ? '✦ Chosen' : ''}
                        </span>
                      </div>
                      <p className="skill-desc">{SKILL_DESCRIPTIONS[skill]}</p>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Section 2 — Skilled feat bonus (conditional) */}
            {hasSkilledFeat && (
              <section className="skills-section">
                <div className="panel-title-row">
                  <h2 className="panel-title">
                    Skilled Feat
                    <span className="panel-title-sub">— choose any 3 skills</span>
                  </h2>
                  <span className={`pick-counter ${skilledPicksDone ? 'done' : ''}`}>
                    {skilled.length} / {maxSkilledPicks} chosen
                  </span>
                </div>
                <p className="section-note">
                  Your <strong>Skilled</strong> feat lets you gain proficiency in any 3 skills not already proficient.
                </p>
                <div className="skills-grid">
                  {ALL_SKILLS.map(skill => {
                    const locked  = isSkilledLocked(skill)
                    const picked  = isSkilledSelected(skill)
                    const blocked = !locked && !picked && !canSkilledSelect(skill)
                    return (
                      <button
                        key={skill}
                        className={`skill-card ${picked ? 'picked' : ''} ${locked ? 'from-bg' : ''} ${blocked ? 'blocked' : ''}`}
                        onClick={() => toggleSkilled(skill)}
                        disabled={locked}
                        aria-pressed={picked}
                        title={locked ? 'Already proficient in this skill' : undefined}
                      >
                        <div className="skill-card-top">
                          <span className="skill-name">{skill}</span>
                          <span className="skill-badge">
                            {locked ? '⚑ Already proficient' : picked ? '✦ Chosen' : ''}
                          </span>
                        </div>
                        <p className="skill-desc">{SKILL_DESCRIPTIONS[skill]}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Section 3 — Expertise (Rogue only) */}
            {isRogue && (
              <section className="skills-section expertise-section">
                <div className="panel-title-row">
                  <h2 className="panel-title expertise-title">
                    ◈ Expertise
                    <span className="panel-title-sub">— double your proficiency bonus</span>
                  </h2>
                  <span className={`pick-counter ${expertiseDone ? 'done' : ''}`}>
                    {expertise.length} / {EXPERTISE_COUNT} chosen
                  </span>
                </div>
                <p className="section-note">
                  Choose <strong>2 skills</strong> you are proficient in. Your proficiency bonus is doubled for checks using those skills.
                  You can only pick from skills you have already chosen above (including background skills).
                </p>
                <div className="skills-grid">
                  {ALL_SKILLS.map(skill => {
                    const proficient = allProficientSkills.includes(skill)
                    const picked     = isExpertise(skill)
                    const blocked    = proficient && !picked && !canExpertise(skill)
                    const unavailable = !proficient
                    return (
                      <button
                        key={skill}
                        className={`skill-card
                          ${picked      ? 'expertise-picked' : ''}
                          ${unavailable ? 'blocked'          : ''}
                          ${blocked     ? 'blocked'          : ''}
                        `}
                        onClick={() => toggleExpertise(skill)}
                        disabled={unavailable}
                        aria-pressed={picked}
                        title={unavailable ? 'You are not proficient in this skill yet' : undefined}
                      >
                        <div className="skill-card-top">
                          <span className="skill-name">{skill}</span>
                          <span className="skill-badge">
                            {picked      ? '◈ Expertise' : ''}
                            {unavailable ? '— Not proficient' : ''}
                          </span>
                        </div>
                        <p className="skill-desc">{SKILL_DESCRIPTIONS[skill]}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Section 4 — Fighting Style (Fighter only) */}
            {isFighter && (
              <section className="skills-section fighting-style-section">
                <div className="panel-title-row">
                  <h2 className="panel-title fighting-style-title">
                    ⚔ Fighting Style
                    <span className="panel-title-sub">— choose one</span>
                  </h2>
                  <span className={`pick-counter ${fightingStyleDone ? 'done' : ''}`}>
                    {fightingStyleDone ? '1 / 1 chosen' : '0 / 1 chosen'}
                  </span>
                </div>
                <p className="section-note">
                  Choose one <strong>Fighting Style</strong> that defines your martial specialty. You cannot take the same style more than once.
                </p>
                <div className="fighting-styles-grid">
                  {FIGHTING_STYLES.map(style => {
                    const picked = fightingStyle === style.name
                    return (
                      <button
                        key={style.name}
                        className={`fighting-style-card ${picked ? 'picked' : ''}`}
                        onClick={() => setFightingStyle(picked ? null : style.name)}
                        aria-pressed={picked}
                      >
                        <div className="skill-card-top">
                          <span className="skill-name">{style.name}</span>
                          {picked && <span className="skill-badge">✦ Chosen</span>}
                        </div>
                        <p className="skill-desc">{style.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Section 5 — Divine Order (Cleric only) */}
            {isCleric && (
              <section className="skills-section divine-order-section">
                <div className="panel-title-row">
                  <h2 className="panel-title divine-order-title">
                    ✝ Divine Order
                    <span className="panel-title-sub">— choose one</span>
                  </h2>
                  <span className={`pick-counter ${divineOrderDone ? 'done' : ''}`}>
                    {divineOrderDone ? '1 / 1 chosen' : '0 / 1 chosen'}
                  </span>
                </div>
                <p className="section-note">
                  Choose the divine calling that shapes your role as a Cleric — whether you are a martial <strong>Protector</strong> or an arcane <strong>Thaumaturge</strong>.
                </p>
                <div className="fighting-styles-grid">
                  {DIVINE_ORDERS.map(order => {
                    const picked = divineOrder === order.name
                    return (
                      <button
                        key={order.name}
                        className={`fighting-style-card divine-order-card ${picked ? 'picked' : ''}`}
                        onClick={() => setDivineOrder(picked ? null : order.name)}
                        aria-pressed={picked}
                      >
                        <div className="skill-card-top">
                          <span className="skill-name">{order.name}</span>
                          {picked && <span className="skill-badge">✦ Chosen</span>}
                        </div>
                        <p className="skill-desc">{order.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Section 6 — Primal Order (Druid only) */}
            {isDruid && (
              <section className="skills-section primal-order-section">
                <div className="panel-title-row">
                  <h2 className="panel-title primal-order-title">
                    🌿 Primal Order
                    <span className="panel-title-sub">— choose one</span>
                  </h2>
                  <span className={`pick-counter ${primalOrderDone ? 'done' : ''}`}>
                    {primalOrderDone ? '1 / 1 chosen' : '0 / 1 chosen'}
                  </span>
                </div>
                <p className="section-note">
                  Choose the primal calling that defines your connection to nature — the arcane <strong>Magician</strong> or the martial <strong>Warden</strong>.
                </p>
                <div className="fighting-styles-grid">
                  {PRIMAL_ORDERS.map(order => {
                    const picked = primalOrder === order.name
                    return (
                      <button
                        key={order.name}
                        className={`fighting-style-card primal-order-card ${picked ? 'picked' : ''}`}
                        onClick={() => setPrimalOrder(picked ? null : order.name)}
                        aria-pressed={picked}
                      >
                        <div className="skill-card-top">
                          <span className="skill-name">{order.name}</span>
                          {picked && <span className="skill-badge">✦ Chosen</span>}
                        </div>
                        <p className="skill-desc">{order.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Section 7 — Eldritch Invocations (Warlock only) */}
            {isWarlock && (
              <section className="skills-section invocation-section">
                <div className="panel-title-row">
                  <h2 className="panel-title invocation-title">
                    📖 Warlock's Pact
                    <span className="panel-title-sub">— choose one</span>
                  </h2>
                  <span className={`pick-counter ${pactDone ? 'done' : ''}`}>
                    {pactDone ? '1 / 1 chosen' : '0 / 1 chosen'}
                  </span>
                </div>
                <p className="section-note">
                  Your patron grants you a <strong>Pact Boon</strong> — a special gift that shapes the form of your eldritch power. This also determines which advanced invocations become available to you.
                </p>
                <div className="fighting-styles-grid">
                  {[
                    { name: 'Pact of the Blade', description: 'You can conjure a pact weapon — a Simple or Martial Melee weapon of your choice — as a Bonus Action, and you can use Charisma for its attack and damage rolls. Unlocks blade-focused invocations like Thirsting Blade and Eldritch Smite.' },
                    { name: 'Pact of the Chain', description: 'You learn Find Familiar and can cast it as a Magic action without expending a spell slot, summoning special forms like an Imp, Pseudodragon, or Sprite. Unlocks invocations that empower your familiar.' },
                    { name: 'Pact of the Tome', description: 'Your patron gives you a Book of Shadows containing three cantrips from any class list and two 1st-level ritual spells. Unlocks invocations that expand your tome\'s power.' },
                  ].map(pact => {
                    const picked = warlockPact === pact.name
                    return (
                      <button
                        key={pact.name}
                        className={`fighting-style-card invocation-card ${picked ? 'picked' : ''}`}
                        onClick={() => setWarlockPact(picked ? null : pact.name)}
                        aria-pressed={picked}
                      >
                        <div className="skill-card-top">
                          <span className="skill-name">{pact.name}</span>
                          {picked && <span className="skill-badge">✦ Chosen</span>}
                        </div>
                        <p className="skill-desc">{pact.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {isWarlock && (
              <section className="skills-section invocation-section">
                <div className="panel-title-row">
                  <h2 className="panel-title invocation-title">
                    🔮 Eldritch Invocations
                    <span className="panel-title-sub">— choose one</span>
                  </h2>
                  <span className={`pick-counter ${invocationDone ? 'done' : ''}`}>
                    {invocationDone ? '1 / 1 chosen' : '0 / 1 chosen'}
                  </span>
                </div>
                <p className="section-note">
                  Your pact with your patron grants you an <strong>Eldritch Invocation</strong> — a fragment of forbidden knowledge that reshapes your power. Choose one to shape your patron's gift at level 1.
                </p>
                <div className="fighting-styles-grid">
                  {ELDRITCH_INVOCATIONS.map(inv => {
                    const picked = eldritchInvocation === inv.name
                    return (
                      <button
                        key={inv.name}
                        className={`fighting-style-card invocation-card ${picked ? 'picked' : ''}`}
                        onClick={() => setEldritchInvocation(picked ? null : inv.name)}
                        aria-pressed={picked}
                      >
                        <div className="skill-card-top">
                          <span className="skill-name">{inv.name}</span>
                          {picked && <span className="skill-badge">✦ Chosen</span>}
                        </div>
                        <p className="skill-desc">{inv.description}</p>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

          </div>

          {/* ── Right column — summary ── */}
          <div className="summary-panel">

            <h2 className="panel-title">Your Proficiencies</h2>

            {/* Background */}
            <div className="summary-section">
              <h3 className="summary-section-title">
                <span className="section-icon">⚑</span> Background
                <span className="section-sub">({background?.name})</span>
              </h3>
              <ul className="summary-list">
                {bgSkills.length > 0
                  ? bgSkills.map(s => <li key={s} className="summary-item locked"><span className="item-dot">◆</span>{s}</li>)
                  : <li className="summary-empty">None</li>
                }
              </ul>
            </div>

            <div className="summary-divider" aria-hidden="true">
              <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
            </div>

            {/* Class picks */}
            <div className="summary-section">
              <h3 className="summary-section-title">
                <span className="section-icon">✦</span> Class
                <span className="section-sub">({cls?.name})</span>
              </h3>
              <ul className="summary-list">
                {selected.map(s => <li key={s} className="summary-item chosen"><span className="item-dot">◆</span>{s}</li>)}
                {Array.from({ length: classSlotsLeft }).map((_, i) => <li key={i} className="summary-empty">— Empty slot —</li>)}
              </ul>
            </div>

            {/* Skilled picks */}
            {hasSkilledFeat && (
              <>
                <div className="summary-divider" aria-hidden="true">
                  <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
                </div>
                <div className="summary-section">
                  <h3 className="summary-section-title">
                    <span className="section-icon">★</span> Skilled Feat
                  </h3>
                  <ul className="summary-list">
                    {skilled.map(s => <li key={s} className="summary-item skilled"><span className="item-dot">◆</span>{s}</li>)}
                    {Array.from({ length: skilledSlotsLeft }).map((_, i) => <li key={i} className="summary-empty">— Empty slot —</li>)}
                  </ul>
                </div>
              </>
            )}

            {/* Expertise */}
            {isRogue && (
              <>
                <div className="summary-divider" aria-hidden="true">
                  <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
                </div>
                <div className="summary-section">
                  <h3 className="summary-section-title">
                    <span className="section-icon">◈</span> Expertise
                  </h3>
                  <ul className="summary-list">
                    {expertise.map(s => <li key={s} className="summary-item expertise"><span className="item-dot">◆</span>{s}</li>)}
                    {Array.from({ length: expertiseSlotsLeft }).map((_, i) => <li key={i} className="summary-empty">— Empty slot —</li>)}
                  </ul>
                </div>
              </>
            )}

            {/* Fighting Style */}
            {isFighter && (
              <>
                <div className="summary-divider" aria-hidden="true">
                  <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
                </div>
                <div className="summary-section">
                  <h3 className="summary-section-title">
                    <span className="section-icon">⚔</span> Fighting Style
                  </h3>
                  <ul className="summary-list">
                    {fightingStyle
                      ? <li className="summary-item fighting-style"><span className="item-dot">◆</span>{fightingStyle}</li>
                      : <li className="summary-empty">— Not chosen —</li>
                    }
                  </ul>
                </div>
              </>
            )}

            {/* Divine Order */}
            {isCleric && (
              <>
                <div className="summary-divider" aria-hidden="true">
                  <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
                </div>
                <div className="summary-section">
                  <h3 className="summary-section-title">
                    <span className="section-icon">✝</span> Divine Order
                  </h3>
                  <ul className="summary-list">
                    {divineOrder
                      ? <li className="summary-item divine-order"><span className="item-dot">◆</span>{divineOrder}</li>
                      : <li className="summary-empty">— Not chosen —</li>
                    }
                  </ul>
                </div>
              </>
            )}

            {/* Primal Order */}
            {isDruid && (
              <>
                <div className="summary-divider" aria-hidden="true">
                  <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
                </div>
                <div className="summary-section">
                  <h3 className="summary-section-title">
                    <span className="section-icon">🌿</span> Primal Order
                  </h3>
                  <ul className="summary-list">
                    {primalOrder
                      ? <li className="summary-item primal-order"><span className="item-dot">◆</span>{primalOrder}</li>
                      : <li className="summary-empty">— Not chosen —</li>
                    }
                  </ul>
                </div>
              </>
            )}

            {/* Eldritch Invocation */}
            {isWarlock && (
              <>
                <div className="summary-divider" aria-hidden="true">
                  <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
                </div>
                <div className="summary-section">
                  <h3 className="summary-section-title">
                    <span className="section-icon">📖</span> Warlock's Pact
                  </h3>
                  <ul className="summary-list">
                    {warlockPact
                      ? <li className="summary-item invocation"><span className="item-dot">◆</span>{warlockPact}</li>
                      : <li className="summary-empty">— Not chosen —</li>
                    }
                  </ul>
                </div>
                <div className="summary-divider" aria-hidden="true">
                  <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
                </div>
                <div className="summary-section">
                  <h3 className="summary-section-title">
                    <span className="section-icon">🔮</span> Eldritch Invocation
                  </h3>
                  <ul className="summary-list">
                    {eldritchInvocation
                      ? <li className="summary-item invocation"><span className="item-dot">◆</span>{eldritchInvocation}</li>
                      : <li className="summary-empty">— Not chosen —</li>
                    }
                  </ul>
                </div>
              </>
            )}

            <div className="summary-divider" aria-hidden="true">
              <span className="divider-line" /><span className="divider-diamond">◆</span><span className="divider-line" />
            </div>

            <button
              className={`confirm-btn ${allDone ? 'ready' : ''} ${confirmed ? 'confirmed' : ''}`}
              onClick={handleConfirm}
              disabled={!allDone || confirmed}
            >
              <span className="confirm-btn-inner">
                <span className="confirm-icon">⬡</span>
                {allDone
                  ? 'Confirm Proficiencies'
                  : !classPicksDone
                    ? `Choose ${maxClassPicks - selected.length} more skill${maxClassPicks - selected.length !== 1 ? 's' : ''}`
                    : !skilledPicksDone
                      ? `Choose ${maxSkilledPicks - skilled.length} more (Skilled)`
                      : !expertiseDone
                        ? `Choose ${EXPERTISE_COUNT - expertise.length} more (Expertise)`
                        : !fightingStyleDone
                          ? 'Choose a Fighting Style'
                          : !divineOrderDone
                            ? 'Choose a Divine Order'
                            : !primalOrderDone
                              ? 'Choose a Primal Order'
                          : !invocationDone
                              ? 'Choose an Eldritch Invocation'
                              : 'Choose a Warlock Pact'
                }
              </span>
            </button>

          </div>
        </div>

      </main>
    </div>
  )
}
