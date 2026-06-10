import { useState, useEffect, useCallback } from 'react'
import BackButton from './BackButton'
import './BackgroundSelectPage.css'

const BACKGROUNDS = [
  {
    name: 'Acolyte',
    icon: '✨',
    summary: 'You have spent your life in service to a temple.',
    abilityScores: ['Intelligence', 'Wisdom', 'Charisma'],
    feat: 'Magic Initiate (Cleric)',
    featDescription: 'You learn two cantrips and one 1st-level spell from the Cleric spell list. You can cast the 1st-level spell once per long rest without a spell slot, and you may cast it using any spell slots you have. Your spellcasting ability for these spells is Wisdom.',
    skillProficiencies: ['Insight', 'Religion'],
    toolProficiencies: ['Calligrapher\'s Supplies'],
    equipment: ['Calligrapher\'s Supplies', 'Book (prayers)', 'Holy Symbol', '10 GP'],
  },
  {
    name: 'Artisan',
    icon: '⚒️',
    summary: 'You are an expert in a particular field of craft.',
    abilityScores: ['Strength', 'Dexterity', 'Intelligence'],
    feat: 'Crafter',
    featDescription: 'You gain proficiency with three Artisan\'s Tools of your choice. Whenever you craft an item using tools you are proficient with, the item costs you 20% less in materials. You can also craft items twice as fast as normal.',
    skillProficiencies: ['Investigation', 'Persuasion'],
    toolProficiencies: ['One Artisan\'s Tool of your choice'],
    equipment: ['Artisan\'s Tools (chosen)', 'Traveler\'s Clothes', 'Letter of Introduction', '15 GP'],
  },
  {
    name: 'Charlatan',
    icon: '🎭',
    summary: 'You have always had a way with people and a talent for deceit.',
    abilityScores: ['Dexterity', 'Constitution', 'Charisma'],
    feat: 'Skilled',
    featDescription: 'You gain proficiency in any combination of three skills or tools of your choice. This feat can be taken multiple times, each time selecting three different skills or tools.',
    skillProficiencies: ['Deception', 'Sleight of Hand'],
    toolProficiencies: ['Forgery Kit'],
    equipment: ['Forgery Kit', 'Costume', 'Con Tools', '15 GP'],
  },
  {
    name: 'Criminal',
    icon: '🗡️',
    summary: 'You are an experienced criminal with a history of breaking the law.',
    abilityScores: ['Dexterity', 'Constitution', 'Intelligence'],
    feat: 'Alert',
    featDescription: 'You gain a +5 bonus to Initiative rolls. You cannot be Surprised while you are conscious. Other creatures don\'t gain advantage on attack rolls against you as a result of being hidden from you.',
    skillProficiencies: ['Sleight of Hand', 'Stealth'],
    toolProficiencies: ['Thieves\' Tools'],
    equipment: ['Thieves\' Tools', 'Crowbar', 'Dark Clothes with Hood', '15 GP'],
  },
  {
    name: 'Entertainer',
    icon: '🎶',
    summary: 'You thrive in front of an audience, knowing how to entrance and captivate.',
    abilityScores: ['Strength', 'Dexterity', 'Charisma'],
    feat: 'Musician',
    featDescription: 'You gain proficiency with three musical instruments of your choice. You can use a musical instrument as a spellcasting focus. After performing for at least 10 minutes, you can give a number of creatures equal to your proficiency bonus the Inspired condition, granting them a d6 they can add to one ability check, saving throw, or attack roll.',
    skillProficiencies: ['Acrobatics', 'Performance'],
    toolProficiencies: ['One Musical Instrument of your choice'],
    equipment: ['Musical Instrument (chosen)', 'Costume', 'Perfume', '15 GP'],
  },
  {
    name: 'Farmer',
    icon: '🌾',
    summary: 'You grew up close to the land, learning to work the earth and tend to livestock.',
    abilityScores: ['Strength', 'Constitution', 'Wisdom'],
    feat: 'Tough',
    featDescription: 'Your hit point maximum increases by an amount equal to twice your character level when you gain this feat. Each time you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.',
    skillProficiencies: ['Animal Handling', 'Nature'],
    toolProficiencies: ['Carpenter\'s Tools'],
    equipment: ['Carpenter\'s Tools', 'Shovel', 'Iron Pot', 'Mule', '30 GP'],
  },
  {
    name: 'Guard',
    icon: '🛡️',
    summary: 'Your hardened eyes scan the horizon for any threat. Vigilance is your calling.',
    abilityScores: ['Strength', 'Intelligence', 'Wisdom'],
    feat: 'Alert',
    featDescription: 'You gain a +5 bonus to Initiative rolls. You cannot be Surprised while you are conscious. Other creatures don\'t gain advantage on attack rolls against you as a result of being hidden from you.',
    skillProficiencies: ['Athletics', 'Perception'],
    toolProficiencies: ['One Gaming Set of your choice'],
    equipment: ['Gaming Set (chosen)', 'Hooded Lantern', 'Manacles', '15 GP'],
  },
  {
    name: 'Guide',
    icon: '🧭',
    summary: 'You know the wilderness like the back of your hand, leading others through the unknown.',
    abilityScores: ['Dexterity', 'Constitution', 'Wisdom'],
    feat: 'Skilled',
    featDescription: 'You gain proficiency in any combination of three skills or tools of your choice. This feat can be taken multiple times, each time selecting three different skills or tools.',
    skillProficiencies: ['Stealth', 'Survival'],
    toolProficiencies: ['Cartographer\'s Tools'],
    equipment: ['Cartographer\'s Tools', 'Staff', 'Hunting Trap', 'Traveler\'s Clothes', '15 GP'],
  },
  {
    name: 'Hermit',
    icon: '🕯️',
    summary: 'You lived in seclusion for years, discovering profound truths in solitude.',
    abilityScores: ['Constitution', 'Intelligence', 'Wisdom'],
    feat: 'Magic Initiate (Druid)',
    featDescription: 'You learn two cantrips and one 1st-level spell from the Druid spell list. You can cast the 1st-level spell once per long rest without a spell slot, and you may cast it using any spell slots you have. Your spellcasting ability for these spells is Wisdom.',
    skillProficiencies: ['Medicine', 'Religion'],
    toolProficiencies: ['Herbalism Kit'],
    equipment: ['Herbalism Kit', 'Scroll Case with Notes', 'Winter Blanket', '5 GP'],
  },
  {
    name: 'Merchant',
    icon: '💰',
    summary: 'You brokered deals across many lands, learning that knowledge is the greatest currency.',
    abilityScores: ['Constitution', 'Intelligence', 'Charisma'],
    feat: 'Lucky',
    featDescription: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend one luck point to roll an additional d20 and choose which die to use. You can also spend a luck point when an attack is made against you to roll a d20 and choose which result applies. You regain all luck points when you finish a long rest.',
    skillProficiencies: ['Animal Handling', 'Persuasion'],
    toolProficiencies: ['Navigator\'s Tools'],
    equipment: ['Navigator\'s Tools', 'Mule & Cart', 'Business Ledger', '25 GP'],
  },
  {
    name: 'Noble',
    icon: '👑',
    summary: 'You were born into privilege, accustomed to wealth, power, and responsibility.',
    abilityScores: ['Strength', 'Intelligence', 'Charisma'],
    feat: 'Skilled',
    featDescription: 'You gain proficiency in any combination of three skills or tools of your choice. This feat can be taken multiple times, each time selecting three different skills or tools.',
    skillProficiencies: ['History', 'Persuasion'],
    toolProficiencies: ['One Gaming Set of your choice'],
    equipment: ['Gaming Set (chosen)', 'Fine Clothes', 'Signet Ring', '25 GP'],
  },
  {
    name: 'Sage',
    icon: '📜',
    summary: 'You spent years studying the lore of the multiverse, hungry for knowledge.',
    abilityScores: ['Constitution', 'Intelligence', 'Wisdom'],
    feat: 'Magic Initiate (Wizard)',
    featDescription: 'You learn two cantrips and one 1st-level spell from the Wizard spell list. You can cast the 1st-level spell once per long rest without a spell slot, and you may cast it using any spell slots you have. Your spellcasting ability for these spells is Intelligence.',
    skillProficiencies: ['Arcana', 'History'],
    toolProficiencies: ['Calligrapher\'s Supplies'],
    equipment: ['Calligrapher\'s Supplies', 'Quarterstaff', 'Robe', 'Spellbook', '5 GP'],
  },
  {
    name: 'Sailor',
    icon: '⚓',
    summary: 'You sailed the seas, weathering storms and discovering distant shores.',
    abilityScores: ['Strength', 'Dexterity', 'Wisdom'],
    feat: 'Tavern Brawler',
    featDescription: 'You are proficient with improvised weapons and unarmed strikes. Your unarmed strike deals 1d4 + Strength modifier bludgeoning damage. When you hit with an unarmed strike or improvised weapon, you can attempt to grapple the target as a bonus action.',
    skillProficiencies: ['Acrobatics', 'Perception'],
    toolProficiencies: ['Navigator\'s Tools'],
    equipment: ['Navigator\'s Tools', 'Rope (50 ft)', 'Belaying Pin', 'Silk Handkerchief', '10 GP'],
  },
  {
    name: 'Soldier',
    icon: '⚔️',
    summary: 'War was your forge. You emerged hardened, disciplined, and battle-scarred.',
    abilityScores: ['Strength', 'Dexterity', 'Constitution'],
    feat: 'Savage Attacker',
    featDescription: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon\'s damage dice and use either total. This applies to the initial attack roll only, not to additional damage from abilities like Sneak Attack.',
    skillProficiencies: ['Athletics', 'Intimidation'],
    toolProficiencies: ['One Gaming Set of your choice'],
    equipment: ['Gaming Set (chosen)', 'Healer\'s Kit', 'Rank Insignia', '15 GP'],
  },
  {
    name: 'Wayfarer',
    icon: '🌍',
    summary: 'You grew up on the road, living by your wits, never staying long in one place.',
    abilityScores: ['Dexterity', 'Wisdom', 'Charisma'],
    feat: 'Lucky',
    featDescription: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend one luck point to roll an additional d20 and choose which die to use. You can also spend a luck point when an attack is made against you to roll a d20 and choose which result applies. You regain all luck points when you finish a long rest.',
    skillProficiencies: ['Insight', 'Stealth'],
    toolProficiencies: ['Thieves\' Tools'],
    equipment: ['Thieves\' Tools', 'Bedroll', 'Cooking Utensils', '2 GP'],
  },
]

const TABS = ['Ability Scores', 'Feat', 'Skills & Tools', 'Equipment']

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

export default function BackgroundSelectPage({ race, onSelect, onBack }) {
  const [visible, setVisible]     = useState(false)
  const [current, setCurrent]     = useState(0)
  const [direction, setDirection] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [chosen, setChosen]       = useState(null)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  // Reset tab when card changes
  useEffect(() => { setActiveTab(0) }, [current])

  const navigate = useCallback((dir) => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(prev =>
        dir === 'right'
          ? (prev + 1) % BACKGROUNDS.length
          : (prev - 1 + BACKGROUNDS.length) % BACKGROUNDS.length
      )
      setAnimating(false)
      setDirection(null)
    }, 280)
  }, [animating])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  navigate('left')
      if (e.key === 'ArrowRight') navigate('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  const jumpTo = (i) => {
    if (animating || i === current) return
    setDirection(i > current ? 'right' : 'left')
    setAnimating(true)
    setTimeout(() => {
      setCurrent(i)
      setAnimating(false)
      setDirection(null)
    }, 280)
  }

  const handleChoose = () => {
    const bg = BACKGROUNDS[current]
    setChosen(bg.name)
    setTimeout(() => { if (onSelect) onSelect(bg) }, 650)
  }

  const bg = BACKGROUNDS[current]

  return (
    <div className={`bg-root ${visible ? 'visible' : ''}`}>
      {onBack && <BackButton onClick={onBack} />}
      {/* Rune borders */}
      <div className="rune-border top">
        {RUNES.map((r, i) => <span key={i} className="rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>)}
      </div>
      <div className="rune-border bottom">
        {[...RUNES].reverse().map((r, i) => <span key={i} className="rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>)}
      </div>

      {/* Particles */}
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

      {/* Corners */}
      <div className="corner tl" aria-hidden="true">✦</div>
      <div className="corner tr" aria-hidden="true">✦</div>
      <div className="corner bl" aria-hidden="true">✦</div>
      <div className="corner br" aria-hidden="true">✦</div>

      <main className="bg-main">

        <header className="bg-header">
          <p className="eyebrow">Character Creation — Step II</p>
          <h1 className="bg-title">Choose Your <span className="accent">Background</span></h1>
          {race && <p className="race-reminder">Your chosen race: <span className="race-name">{race.icon} {race.name}</span></p>}
          <p className="bg-subtitle">Your background defines your origins, shaping the skills and knowledge you bring to your adventure.</p>
        </header>

        {/* Carousel */}
        <div className="carousel-wrap">

          <button className="nav-arrow left" onClick={() => navigate('left')} aria-label="Previous background">
            <span className="arrow-inner">&#10094;</span>
          </button>

          <div className="card-stage" aria-live="polite" aria-atomic="true">
            <div
              className={`bg-card ${animating ? `exit-${direction}` : 'enter'} ${chosen === bg.name ? 'chosen' : ''}`}
              key={bg.name}
            >
              {/* Card Header */}
              <div className="card-head">
                <div className="card-head-left">
                  <span className="card-counter">{current + 1} / {BACKGROUNDS.length}</span>
                  <div className="card-title-row">
                    <span className="card-bg-icon" aria-hidden="true">{bg.icon}</span>
                    <h2 className="card-title">{bg.name}</h2>
                  </div>
                  <p className="card-summary">{bg.summary}</p>
                </div>
                <div className="card-head-runes" aria-hidden="true">
                </div>
              </div>

              <div className="card-divider" aria-hidden="true">
                <span className="divider-line" />
                <span className="divider-diamond">◆</span>
                <span className="divider-line" />
              </div>

              {/* Tabs */}
              <div className="tabs-bar" role="tablist" aria-label="Background details">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === i}
                    className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              <div className="tab-panel" role="tabpanel">

                {activeTab === 0 && (
                  <div className="panel-content">
                    <p className="panel-note">Choose two of the following ability scores to increase by +2, or all three by +1 each.</p>
                    <div className="ability-grid">
                      {bg.abilityScores.map(score => (
                        <div key={score} className="ability-chip">
                          <span className="ability-icon">◈</span>
                          <span>{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="panel-content">
                    <p className="panel-note">You gain the following feat at 1st level.</p>
                    <div className="feat-block">
                      <div className="feat-block-header">
                        <span className="feat-star">✦</span>
                        <span className="feat-name">{bg.feat}</span>
                      </div>
                      <p className="feat-desc">{bg.featDescription}</p>
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="panel-content two-col">
                    <div className="info-group">
                      <h3 className="info-group-title">Skill Proficiencies</h3>
                      <ul className="info-list">
                        {bg.skillProficiencies.map(s => (
                          <li key={s}><span className="list-dot">◆</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="info-group">
                      <h3 className="info-group-title">Tool Proficiencies</h3>
                      <ul className="info-list">
                        {bg.toolProficiencies.map(t => (
                          <li key={t}><span className="list-dot">◆</span>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="panel-content">
                    <p className="panel-note">You begin your adventure with the following equipment.</p>
                    <ul className="equipment-list">
                      {bg.equipment.map(item => (
                        <li key={item}>
                          <span className="equip-dot">⬡</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Choose button */}
              <div className="card-foot">
                <div className="card-divider" aria-hidden="true">
                  <span className="divider-line" />
                  <span className="divider-diamond">◆</span>
                  <span className="divider-line" />
                </div>
                <button
                  className={`choose-btn ${chosen === bg.name ? 'chosen' : ''}`}
                  onClick={handleChoose}
                  aria-label={`Choose ${bg.name}`}
                >
                  <span className="choose-btn-inner">
                    <span className="choose-icon" aria-hidden="true">⬡</span>
                    Choose {bg.name}
                  </span>
                </button>
              </div>

            </div>
          </div>

          <button className="nav-arrow right" onClick={() => navigate('right')} aria-label="Next background">
            <span className="arrow-inner">&#10095;</span>
          </button>
        </div>

        {/* Index */}
        <nav className="bg-index" aria-label="Background index">
          {BACKGROUNDS.map((b, i) => (
            <button
              key={b.name}
              className={`index-pip ${i === current ? 'active' : ''}`}
              onClick={() => jumpTo(i)}
              aria-label={b.name}
              title={b.name}
            >
              <span className="pip-icon">{b.icon}</span>
              <span className="pip-name">{b.name}</span>
            </button>
          ))}
        </nav>

      </main>
    </div>
  )
}
