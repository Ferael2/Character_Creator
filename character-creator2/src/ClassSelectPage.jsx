import { useState, useEffect, useCallback } from 'react'
import BackButton from './BackButton'
import './ClassSelectPage.css'
import { useLanguage } from './LanguageContext'
import T from './translations'
import fighterImage from '../src/assets/Fighter.png';
import rogueImage from '../src/assets/Rogue.png';
import barbarianImage from '../src/assets/Barbarian.png';
import bardImage from '../src/assets/Bard.png';
import clericImage from '../src/assets/Cleric.png';
import druidImage from '../src/assets/Druid.png';
import monkImage from '../src/assets/Monk.png';
import paladinImage from '../src/assets/Paladin.png';
import rangerImage from '../src/assets/Ranger.png';
import sorcererImage from '../src/assets/Sorcerer.png';
import warlockImage from '../src/assets/Warlock.png';
import wizardImage from '../src/assets/Wizard.png';

const CLASSES = [
  {
    name: 'Barbarian',
    icon: '🪓',
    image: barbarianImage,
    role: 'Striker / Defender',
    hitDie: 'd12',
    primaryAbility: 'Strength',
    savingThrows: ['Strength', 'Constitution'],
    description: 'Barbarians are fierce warriors of the wilderness who channel primal rage into devastating combat power. They shrug off blows that would fell lesser warriors and charge headlong into battle with savage fury, drawing strength from the wildness within.',
    coreTrait: {
      name: 'Rage',
      description: 'You can enter a Rage as a Bonus Action. While raging you gain Advantage on Strength checks and saves, a bonus to damage rolls, and Resistance to Bludgeoning, Piercing, and Slashing damage. Rage lasts 1 minute and ends early if you are Incapacitated or don\'t attack or take damage on your turn.',
    },
    level1Features: [
      { name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.' },
      { name: 'Weapon Mastery', description: 'You can use the Mastery properties of two kinds of Simple or Martial Melee weapons of your choice. You can change your chosen weapons when you finish a Long Rest.' },
    ],
  },
  {
    name: 'Bard',
    icon: '🎶',
    image: bardImage,
    role: 'Support / Utility',
    hitDie: 'd8',
    primaryAbility: 'Charisma',
    savingThrows: ['Dexterity', 'Charisma'],
    description: 'Bards are magical entertainers who weave spells through music, poetry, and song. Masters of lore and inspiration, they bolster allies, confound enemies, and unravel mysteries, drawing power from the fundamental magic of the multiverse.',
    coreTrait: {
      name: 'Bardic Inspiration',
      description: 'You can inspire others through stirring words or music. As a Bonus Action, choose one creature within 60 feet who can hear you. That creature gains a Bardic Inspiration die (d6) they can add to one ability check, attack roll, or saving throw within 10 minutes. You can use this a number of times equal to your Charisma modifier per Long Rest.',
    },
    level1Features: [
      { name: 'Spellcasting', description: 'You can cast Bard spells using Charisma as your spellcasting ability. You know two cantrips and four 1st-level spells from the Bard spell list, and you have two 1st-level spell slots.' },
      { name: 'Weapon Mastery', description: 'You can use the Mastery properties of two kinds of weapons you are proficient with. You can change your chosen weapons when you finish a Long Rest.' },
    ],
  },
  {
    name: 'Cleric',
    icon: '✝️',
    image: clericImage,
    role: 'Healer / Support',
    hitDie: 'd8',
    primaryAbility: 'Wisdom',
    savingThrows: ['Wisdom', 'Charisma'],
    description: 'Clerics are conduits of divine power, wielding the blessings of their deity to heal the wounded, smite the wicked, and protect the faithful. They stand at the boundary between the mortal and divine, channeling holy energy through prayer and conviction.',
    coreTrait: {
      name: 'Divine Order',
      description: 'You have dedicated yourself to one of two divine roles. Protector grants you proficiency with Martial weapons and Heavy armor. Thaumaturge gives you one extra prepared cantrip from the Cleric list and grants Expertise in the Arcana or Religion skill.',
    },
    level1Features: [
      { name: 'Spellcasting', description: 'You can cast Cleric spells using Wisdom as your spellcasting ability. You prepare a number of spells equal to your Wisdom modifier + your Cleric level, choosing from the full Cleric spell list each Long Rest.' },
      { name: 'Channel Divinity', description: 'You can channel divine energy to fuel magical effects. You begin with the Divine Spark and Turn Undead options, and you have two uses per Short or Long Rest.' },
    ],
  },
  {
    name: 'Druid',
    icon: '🌿',
    image: druidImage,
    role: 'Controller / Support',
    hitDie: 'd8',
    primaryAbility: 'Wisdom',
    savingThrows: ['Intelligence', 'Wisdom'],
    description: 'Druids are guardians of the natural world who draw magic from the land itself. They commune with beasts and plants, call down storms, and shift into animal forms, serving as protectors of the balance between civilization and wilderness.',
    coreTrait: {
      name: 'Wild Shape',
      description: 'You can use your action to magically assume the shape of a Beast you have seen before. Your Beast form retains your personality and memories. You can use Wild Shape twice, regaining uses on a Short or Long Rest. At level 1 the Beast\'s CR can be up to 1/4 and it cannot have a Fly or Swim speed.',
    },
    level1Features: [
      { name: 'Spellcasting', description: 'You can cast Druid spells using Wisdom as your spellcasting ability. You prepare a number of spells equal to your Wisdom modifier + your Druid level, choosing from the full Druid spell list each Long Rest.' },
      { name: 'Primal Order', description: 'You choose a specialty: Magician gives you one extra prepared cantrip and Expertise in Arcana. Warden gives you proficiency with Martial weapons and the Dexterity (Stealth) skill.' },
    ],
  },
  {
    name: 'Fighter',
    icon: '⚔️',
    image: fighterImage,
    role: 'Striker / Defender',
    hitDie: 'd10',
    primaryAbility: 'Strength or Dexterity',
    savingThrows: ['Strength', 'Constitution'],
    description: 'Fighters are unmatched warriors who have mastered a broad range of weapons and armor. Whether relying on brute strength, precision archery, or nimble bladework, Fighters endure and excel where others fall, defined by an unbreakable fighting spirit.',
    coreTrait: {
      name: 'Second Wind',
      description: 'You can use a Bonus Action to regain hit points equal to 1d10 + your Fighter level. You can use this feature a number of times equal to your proficiency bonus, and you regain all uses when you finish a Short or Long Rest.',
    },
    level1Features: [
      { name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty. Choose one Fighting Style feat to gain: Archery, Blind Fighting, Defense, Dueling, Great Weapon Fighting, Interception, Protection, Thrown Weapon Fighting, Two-Weapon Fighting, or Unarmed Fighting. You can\'t take the same Fighting Style feat more than once.' },
      { name: 'Weapon Mastery', description: 'You can use the Mastery properties of three kinds of weapons you are proficient with. You can change your chosen weapons when you finish a Long Rest.' },
    ],
  },
  {
    name: 'Monk',
    icon: '👊',
    image: monkImage,
    role: 'Striker / Skirmisher',
    hitDie: 'd8',
    primaryAbility: 'Dexterity & Wisdom',
    savingThrows: ['Strength', 'Dexterity'],
    description: 'Monks harness the mystic energy of ki to augment their unarmed combat into a deadly art form. Through rigorous discipline and inner focus, they strike with breathtaking speed, deflect missiles, and perform feats that border on the supernatural.',
    coreTrait: {
      name: 'Martial Arts',
      description: 'You can use Dexterity instead of Strength for unarmed strikes and Monk weapons. Your unarmed strikes deal 1d6 damage at level 1. When you use the Attack action with a Monk weapon or unarmed strike, you can make one unarmed strike as a Bonus Action.',
    },
    level1Features: [
      { name: 'Unarmored Defense', description: 'While not wearing armor or wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.' },
      { name: 'Weapon Mastery', description: 'You can use the Mastery properties of two kinds of Simple weapons of your choice. You can change your chosen weapons when you finish a Long Rest.' },
    ],
  },
  {
    name: 'Paladin',
    icon: '🛡️',
    image: paladinImage,
    role: 'Defender / Striker',
    hitDie: 'd10',
    primaryAbility: 'Strength & Charisma',
    savingThrows: ['Wisdom', 'Charisma'],
    description: 'Paladins are holy warriors bound by a sacred oath to fight for justice and righteousness. They channel divine magic to smite enemies, protect allies, and heal the wounded, drawing power from their unwavering commitment to their oath.',
    coreTrait: {
      name: 'Lay On Hands',
      description: 'Your blessed touch can heal wounds. You have a pool of healing power equal to 5 × your Paladin level. As an Action, you can touch a creature and restore any number of hit points from this pool, or expend 5 points to cure one disease or neutralize one poison.',
    },
    level1Features: [
      { name: 'Spellcasting', description: 'You can cast Paladin spells using Charisma as your spellcasting ability. You prepare a number of spells equal to half your Paladin level + your Charisma modifier.' },
      { name: 'Weapon Mastery', description: 'You can use the Mastery properties of two kinds of weapons you are proficient with. You can change your chosen weapons when you finish a Long Rest.' },
    ],
  },
  {
    name: 'Ranger',
    icon: '🏹',
    image: rangerImage,
    role: 'Striker / Scout',
    hitDie: 'd10',
    primaryAbility: 'Dexterity & Wisdom',
    savingThrows: ['Strength', 'Dexterity'],
    description: 'Rangers are warriors of the wilderness, skilled hunters who use their knowledge of nature to track, trap, and slay their quarry. They blend martial skill with nature magic, equally deadly in dense forest or open plain.',
    coreTrait: {
      name: 'Favored Enemy',
      description: 'You always have the Hunter\'s Mark spell prepared. You can cast it twice without expending a spell slot, regaining uses on a Long Rest. Wisdom is your spellcasting ability for this spell.',
    },
    level1Features: [
      { name: 'Spellcasting', description: 'You can cast Ranger spells using Wisdom as your spellcasting ability. You know two 1st-level spells and have two 1st-level spell slots.' },
      { name: 'Weapon Mastery', description: 'You can use the Mastery properties of two kinds of weapons you are proficient with. You can change your chosen weapons when you finish a Long Rest.' },
    ],
  },
  {
    name: 'Rogue',
    icon: '🗡️',
    image: rogueImage,
    role: 'Striker / Skill Expert',
    hitDie: 'd8',
    primaryAbility: 'Dexterity',
    savingThrows: ['Dexterity', 'Intelligence'],
    description: 'Rogues rely on cunning, agility, and deception to overcome their foes. Masters of stealth and subterfuge, they strike from the shadows with deadly precision, pick any lock, and navigate social situations with ease.',
    coreTrait: {
      name: 'Sneak Attack',
      description: 'Once per turn, you deal extra damage to one creature you hit with an attack if you have Advantage on the roll or if an ally is adjacent to the target. The extra damage is 1d6 at level 1 and grows as you level up.',
    },
    level1Features: [
      { name: 'Thieves\' Cant', description: 'You have learned the secret language of rogues. You can communicate covertly with other rogues using signs, codewords, and gestures invisible to others.' },
      { name: 'Expertise', description: 'You gain Expertise in two skills you are proficient with, doubling your proficiency bonus for those skills.' },
      { name: 'Weapon Mastery', description: 'You can use the Mastery property of one kind of weapon you are proficient with, and can change your choice on a Long Rest.' },
    ],
  },
  {
    name: 'Sorcerer',
    icon: '✨',
    image: sorcererImage,
    role: 'Blaster / Controller',
    hitDie: 'd6',
    primaryAbility: 'Charisma',
    savingThrows: ['Constitution', 'Charisma'],
    description: 'Sorcerers wield magic that flows from an innate power within them — a gift, a birthright, or a curse. Unlike wizards who study, sorcerers feel magic instinctively, shaping spells with raw force of will and bending the weave in ways no textbook can teach.',
    coreTrait: {
      name: 'Innate Sorcery',
      description: 'Once per Long Rest, as a Bonus Action, you can unleash the sorcerous power within for 1 minute. During this time you have Advantage on attack rolls for Sorcerer spells, and the saving throw DC of your Sorcerer spells increases by 1.',
    },
    level1Features: [
      { name: 'Spellcasting', description: 'You can cast Sorcerer spells using Charisma as your spellcasting ability. You know four cantrips and two 1st-level spells, and have two 1st-level spell slots.' },
      { name: 'Sorcerous Origin', description: 'Choose a Sorcerous Origin that represents the source of your magic: Draconic Bloodline, Wild Magic, or another subclass. This shapes bonus spells and innate abilities you gain going forward.' },
    ],
  },
  {
    name: 'Warlock',
    icon: '🔮',
    image: warlockImage,
    role: 'Blaster / Utility',
    hitDie: 'd8',
    primaryAbility: 'Charisma',
    savingThrows: ['Wisdom', 'Charisma'],
    description: 'Warlocks have struck a bargain with a powerful otherworldly patron — a devil, a great old one, or an archfey — in exchange for magical power. They replenish their limited but potent spell slots with short rests, and channel their patron\'s will through eldritch invocations.',
    coreTrait: {
      name: 'Eldritch Blast & Pact Magic',
      description: 'Eldritch Blast is your signature cantrip, dealing Force damage and scaling to multiple beams at higher levels. Your Pact Magic spell slots recharge on a Short or Long Rest, keeping you effective through a full adventuring day with fewer slots than other casters.',
    },
    level1Features: [
      { name: 'Spellcasting (Pact Magic)', description: 'You know two cantrips and two 1st-level Warlock spells. You have one spell slot at level 1, which recharges on a Short or Long Rest. Charisma is your spellcasting ability.' },
      { name: 'Eldritch Invocations', description: 'You learn one Eldritch Invocation of your choice from the Warlock list. Invocations grant you persistent magical abilities, from seeing in magical darkness to casting spells at will.' },
    ],
  },
  {
    name: 'Wizard',
    icon: '📖',
    image: wizardImage,
    role: 'Controller / Blaster',
    hitDie: 'd6',
    primaryAbility: 'Intelligence',
    savingThrows: ['Intelligence', 'Wisdom'],
    description: 'Wizards are supreme masters of arcane magic, commanding spells through decades of study and practice. Their spellbook holds the secrets to reshaping reality, and their methodical preparation means they always have the right tool for any situation.',
    coreTrait: {
      name: 'Spellbook & Arcane Recovery',
      description: 'Your spellbook contains the spells you have collected and studied. Once per Long Rest, when you finish a Short Rest, you can recover expended spell slots with a combined level equal to half your Wizard level (rounded up).',
    },
    level1Features: [
      { name: 'Spellcasting', description: 'You can cast Wizard spells using Intelligence as your spellcasting ability. You start with six 1st-level spells in your spellbook, know three cantrips, and prepare a number of spells equal to your Intelligence modifier + your Wizard level.' },
      { name: 'Ritual Adept', description: 'You can cast any spell as a Ritual if that spell has the Ritual tag and the spell is in your spellbook. You need not have the spell prepared.' },
      { name: 'Arcane Recovery', description: 'Once per day after a Short Rest, you recover spent spell slots whose total levels equal up to half your Wizard level (rounded up).' },
    ],
  },
]

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

export default function ClassSelectPage({ race, background, onSelect, onBack }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const TABS = [t.class_tabDesc, t.class_coreTrait, t.class_tabFeatures]
  const [visible, setVisible]     = useState(false)
  const [current, setCurrent]     = useState(0)
  const [direction, setDirection] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [chosen, setChosen]       = useState(null)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])
  useEffect(() => { setActiveTab(0) }, [current])

  const navigate = useCallback((dir) => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(prev =>
        dir === 'right'
          ? (prev + 1) % CLASSES.length
          : (prev - 1 + CLASSES.length) % CLASSES.length
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
    const cls = CLASSES[current]
    setChosen(cls.name)
    setTimeout(() => { if (onSelect) onSelect(cls) }, 650)
  }

  const cls = CLASSES[current]

  return (
    <div className={`class-root ${visible ? 'visible' : ''}`}>
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

      <main className="class-main">

        <header className="class-header">
          <p className="eyebrow">{t.class_eyebrow}</p>
          <h1 className="class-title">{t.class_title} <span className="accent">{t.class_titleAccent}</span></h1>
          {(race || background) && (
            <p className="selections-reminder">
              {race && <span className="sel-item">{race.icon} {race.name}</span>}
              {race && background && <span className="sel-sep">◆</span>}
              {background && <span className="sel-item">{background.icon} {background.name}</span>}
            </p>
          )}
          <p className="class-subtitle">{t.class_subtitle}</p>
        </header>

        {/* Carousel */}
        <div className="carousel-wrap">
          <button className="nav-arrow left" onClick={() => navigate('left')} aria-label={t.class_prevLabel}>
            <span className="arrow-inner">&#10094;</span>
          </button>

          <div className="card-stage" aria-live="polite" aria-atomic="true">
            <div
              className={`class-card ${animating ? `exit-${direction}` : 'enter'} ${chosen === cls.name ? 'chosen' : ''}`}
              key={cls.name}
            >
              {/* Two-column layout: image left, info right */}
              <div className="card-body">

                {/* Left — image panel */}
                <div className="card-image-panel">
                  {cls.image
                    ? <img src={cls.image} alt={cls.name} className="card-image" />
                    : (
                      <div className="card-image-placeholder">
                        <span className="placeholder-icon">{cls.icon}</span>
                        <span className="placeholder-label">Art coming soon</span>
                      </div>
                    )
                  }
                  <div className="image-panel-footer">
                    <span className="card-counter">{current + 1} / {CLASSES.length}</span>
                  </div>
                </div>

                {/* Right — info panel */}
                <div className="card-info-panel">

                  {/* Class name & quick stats */}
                  <div className="card-head">
                    <div className="card-title-row">
                      <h2 className="card-title">{cls.name}</h2>
                    </div>
                    <span className="card-role">{cls.role}</span>
                    <div className="quick-stats">
                      <div className="stat-chip">
                        <span className="stat-label">{t.class_hitDie}</span>
                        <span className="stat-value">{cls.hitDie}</span>
                      </div>
                      <div className="stat-chip">
                        <span className="stat-label">{t.class_primaryAbility}</span>
                        <span className="stat-value">{cls.primaryAbility}</span>
                      </div>
                      <div className="stat-chip">
                        <span className="stat-label">{t.class_savingThrows}</span>
                        <span className="stat-value">{cls.savingThrows.join(' & ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-divider">
                    <span className="divider-line" />
                    <span className="divider-diamond">◆</span>
                    <span className="divider-line" />
                  </div>

                  {/* Tabs */}
                  <div className="tabs-bar" role="tablist">
                    {TABS.map((tab, i) => (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === i}
                        className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                        onClick={() => setActiveTab(i)}
                      >{tab}</button>
                    ))}
                  </div>

                  {/* Tab panels */}
                  <div className="tab-panel" role="tabpanel">

                    {activeTab === 0 && (
                      <div className="panel-content">
                        <p className="class-description">{cls.description}</p>
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div className="panel-content">
                        <div className="trait-block">
                          <div className="trait-header">
                            <span className="trait-star">✦</span>
                            <span className="trait-name">{cls.coreTrait.name}</span>
                          </div>
                          <p className="trait-desc">{cls.coreTrait.description}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 2 && (
                      <div className="panel-content features-list">
                        {cls.level1Features.map(f => (
                          <div key={f.name} className="feature-block">
                            <div className="feature-header">
                              <span className="feature-dot">◈</span>
                              <span className="feature-name">{f.name}</span>
                            </div>
                            <p className="feature-desc">{f.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Choose button */}
                  <div className="card-foot">
                    <div className="card-divider">
                      <span className="divider-line" />
                      <span className="divider-diamond">◆</span>
                      <span className="divider-line" />
                    </div>
                    <button
                      className={`choose-btn ${chosen === cls.name ? 'chosen' : ''}`}
                      onClick={handleChoose}
                    >
                      <span className="choose-btn-inner">
                        <span className="choose-icon">⬡</span>
                        {t.class_chooseBtn} {cls.name}
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <button className="nav-arrow right" onClick={() => navigate('right')} aria-label={t.class_nextLabel}>
            <span className="arrow-inner">&#10095;</span>
          </button>
        </div>

        {/* Index */}
        <nav className="class-index" aria-label="Class index">
          {CLASSES.map((c, i) => (
            <button
              key={c.name}
              className={`index-pip ${i === current ? 'active' : ''}`}
              onClick={() => jumpTo(i)}
              title={c.name}
              aria-label={c.name}
            >
              <span className="pip-icon">{c.icon}</span>
              <span className="pip-name">{c.name}</span>
            </button>
          ))}
        </nav>

      </main>
    </div>
  )
}
