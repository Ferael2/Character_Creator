import { useState, useEffect } from 'react'
import BackButton from './BackButton'
import './LevelUpPage.css'

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

const ABILITIES = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma']
const getMod = (s) => Math.floor((s - 10) / 2)
const fmtMod = (m) => m >= 0 ? `+${m}` : `${m}`

// ── Choice-type renderers ─────────────────────────────────────────────────────

function SubclassChoice({ choice, value, onChange }) {
  return (
    <div className="lu-choice-block">
      <div className="lu-choice-title">{choice.label}</div>
      <p className="lu-choice-desc">Your dedication and training grant you membership in a specialized group. Choose your subclass — it will define your most powerful abilities in the levels to come.</p>
      <div className="lu-option-grid">
        {choice.options.map(opt => (
          <button
            key={opt}
            className={`lu-option-card ${value === opt ? 'selected' : ''}`}
            onClick={() => onChange(value === opt ? null : opt)}
          >
            {value === opt && <span className="lu-check">✓</span>}
            <span className="lu-option-name">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function FightingStyleChoice({ choice, value, onChange }) {
  const STYLES = {
    'Archery':                 'You gain a +2 bonus to attack rolls you make with ranged weapons.',
    'Blind Fighting':          'You have blindsight with a range of 10 feet. Within that range, you can see any creature that isn\'t behind total cover even if it\'s invisible or if you\'re blinded or in darkness.',
    'Defense':                 'While you are wearing armor, you gain a +1 bonus to AC.',
    'Dueling':                 'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
    'Great Weapon Fighting':   'When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon you are wielding with two hands, you can reroll the die and must use the new roll.',
    'Interception':            'When a creature you can see hits a target other than you within 5 feet of you with an attack, you can use your reaction to reduce the damage by 1d10 + your proficiency bonus.',
    'Protection':              'When a creature you can see attacks a target other than you within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.',
    'Thrown Weapon Fighting':  'You can draw a weapon that has the thrown property as part of the attack you make with the weapon. In addition, when you hit with a ranged attack using a thrown weapon, you gain a +2 bonus to the damage roll.',
    'Two-Weapon Fighting':     'When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.',
    'Unarmed Fighting':        'Your unarmed strikes can deal bludgeoning damage equal to 1d6 + your Strength modifier on a hit. If you aren\'t wielding any weapons or a shield when you make the attack roll, the d6 becomes a d8.',
  }
  return (
    <div className="lu-choice-block">
      <div className="lu-choice-title">{choice.label}</div>
      <div className="lu-option-grid">
        {choice.options.map(opt => (
          <button
            key={opt}
            className={`lu-option-card ${value === opt ? 'selected' : ''}`}
            onClick={() => onChange(value === opt ? null : opt)}
          >
            {value === opt && <span className="lu-check">✓</span>}
            <span className="lu-option-name">{opt}</span>
            {STYLES[opt] && <span className="lu-option-desc">{STYLES[opt]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function ASIChoice({ choice, abilityScores, value = {}, onChange }) {
  // value = { type: 'asi' | 'feat', scores?: {ability: +n}, feat?: string }
  const [mode, setMode] = useState(value.type || null)
  const [increments, setIncrements] = useState(value.scores || {})
  const FEAT_DESCS = {
    'Alert':               'You gain +5 to initiative. You can\'t be surprised while conscious. Other creatures don\'t gain advantage on attack rolls against you as a result of being unseen by you.',
    'Athlete':             'Increase Strength or Dexterity by 1. Climbing costs no extra movement, standing up costs only 5 ft. of movement, and you can make a running long jump or high jump after moving only 5 ft.',
    'Actor':               'Increase Charisma by 1. You have advantage on Deception and Performance checks when trying to pass as a different person. You can mimic voices and sounds you have heard.',
    'Charger':             'When you use your action to Dash, you can use a bonus action to make one melee weapon attack or shove a creature. If you move 10 ft. in a straight line first, the attack deals +5 damage or the shove pushes 10 ft.',
    'Crossbow Expert':     'Ignore the loading quality of crossbows. Being within 5 ft. of a hostile creature doesn\'t impose disadvantage on ranged attack rolls. When you attack with a one-handed weapon, you can use a bonus action to attack with a hand crossbow.',
    'Defensive Duelist':   'Prerequisite: Dexterity 13+. When wielding a finesse weapon you are proficient with, you can use your reaction to add your proficiency bonus to your AC against one melee attack that would hit you.',
    'Dual Wielder':        'You gain +1 to AC while wielding two melee weapons. You can use two-weapon fighting even when your weapons aren\'t light. You can draw or stow two weapons when you would normally draw one.',
    'Dungeon Delver':      'Advantage on Perception and Investigation checks to detect secret doors. Advantage on saves vs. traps. Resistance to trap damage. You can search for traps while traveling at a normal pace.',
    'Durable':             'Increase Constitution by 1. When you roll a Hit Die to regain hit points, the minimum number of hit points you regain equals twice your Constitution modifier (minimum of 2).',
    'Elemental Adept':     'Spells you cast ignore resistance to one damage type you choose (acid, cold, fire, lightning, or thunder). Rolls of 1 on damage dice for that type count as 2.',
    'Grappler':            'Prerequisite: Strength 13+. Advantage on attack rolls against creatures you are grappling. You can use your action to pin a grappled creature — it becomes restrained until the grapple ends.',
    'Great Weapon Master': 'When you score a critical hit or reduce a creature to 0 HP with a melee weapon, you can make one melee weapon attack as a bonus action. Before attacking with a heavy weapon you are proficient with, you can take a −5 penalty to the roll to gain +10 damage on a hit.',
    'Healer':              'You can stabilize a creature with a healer\'s kit as a bonus action. Using a healer\'s kit to restore hit points restores 1d6 + 4 HP, plus HP equal to the creature\'s maximum number of Hit Dice (once per short rest per creature).',
    'Heavily Armored':     'Prerequisite: proficiency with medium armor. Increase Strength by 1. You gain proficiency with heavy armor.',
    'Heavy Armor Master':  'Prerequisite: proficiency with heavy armor. Increase Strength by 1. While wearing heavy armor, bludgeoning, piercing, and slashing damage from non-magical weapons is reduced by 3.',
    'Inspiring Leader':    'Prerequisite: Charisma 13+. Spend 10 minutes inspiring companions. Up to 6 friendly creatures who can see or hear you and understand you gain temporary HP equal to your level + your Charisma modifier.',
    'Keen Mind':           'Increase Intelligence by 1. You always know which way is north, the number of hours before the next sunrise or sunset, and you can recall anything you have seen or heard within the past month.',
    'Lightly Armored':     'Increase Strength or Dexterity by 1. You gain proficiency with light armor.',
    'Linguist':            'Increase Intelligence by 1. Learn 3 additional languages. You can create written ciphers. Others can\'t decipher the code unless they know the cipher or succeed on an Intelligence check (DC = your Intelligence score + proficiency bonus).',
    'Lucky':               'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend one luck point to roll an additional d20 and choose which die to use. You regain all luck points after a long rest.',
    'Mage Slayer':         'When a creature within 5 ft. casts a spell, you can use your reaction to make a melee weapon attack. When you damage a concentrating caster, they have disadvantage on the saving throw. You have advantage on saving throws against spells cast by creatures within 5 ft.',
    'Magic Initiate':      'Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. Learn 2 cantrips and 1 1st-level spell from that class\'s list. You can cast the 1st-level spell once per long rest without a spell slot.',
    'Martial Adept':       'Learn 2 maneuvers from the Battle Master archetype. You gain 1 superiority die (d6) to fuel them. The die is expended on use and regained on a short or long rest.',
    'Medium Armor Master': 'Prerequisite: proficiency with medium armor. Wearing medium armor doesn\'t impose disadvantage on Stealth checks. You can add up to +3 from Dexterity (instead of +2) to AC when wearing medium armor.',
    'Mobile':              'Your speed increases by 10 ft. When you use the Dash action, difficult terrain doesn\'t cost extra movement for the rest of the turn. When you make a melee attack against a creature, you don\'t provoke opportunity attacks from it for the rest of that turn.',
    'Moderately Armored':  'Prerequisite: proficiency with light armor. Increase Strength or Dexterity by 1. You gain proficiency with medium armor and shields.',
    'Mounted Combatant':   'Advantage on melee attack rolls against unmounted creatures smaller than your mount. Force attacks targeting your mount to target you instead. If your mount fails a Dexterity save, it takes no damage on a success (you take half).',
    'Observant':           'Increase Intelligence or Wisdom by 1. If you can see a creature\'s mouth while it speaks a language you know, you can interpret what it\'s saying. +5 bonus to passive Perception and Investigation.',
    'Polearm Master':      'When you take the Attack action with a glaive, halberd, pike, or quarterstaff, you can use a bonus action to make a melee attack with the opposite end (1d4 bludgeoning). You can also make opportunity attacks when creatures enter your reach.',
    'Resilient':           'Increase one ability score by 1. You gain proficiency in saving throws using that ability.',
    'Ritual Caster':       'Prerequisite: Intelligence or Wisdom 13+. You learn 2 ritual spells from any class. You can cast them as rituals. You can add more ritual spells from scrolls you find.',
    'Savage Attacker':     'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon\'s damage dice and use either total.',
    'Sentinel':            'When you hit a creature with an opportunity attack, its speed drops to 0. Creatures within 5 ft. provoke opportunity attacks from you even when they Disengage. When a creature attacks a target other than you within 5 ft., you can use your reaction to make a melee attack.',
    'Sharpshooter':        'Attacking at long range doesn\'t impose disadvantage. Ranged attacks ignore half and three-quarters cover. Before attacking with a ranged weapon you are proficient with, you can take a −5 penalty to gain +10 damage on a hit.',
    'Shield Master':       'If you take the Attack action, you can use a bonus action to try to shove a creature within 5 ft. Add your shield\'s AC bonus to Dexterity saving throws. If a Dex save would deal half damage, you take no damage on a success.',
    'Skilled':             'Gain proficiency in any combination of 3 skills or tools of your choice.',
    'Skulker':             'Prerequisite: Dexterity 13+. You can try to hide when only lightly obscured. When you are hidden and miss with a ranged attack, you don\'t reveal your position. Dim light doesn\'t impose disadvantage on your Perception checks.',
    'Spell Sniper':        'Prerequisite: ability to cast at least one spell. Learn one attack-roll cantrip. Double the range of your spell attack rolls. Your ranged spell attacks ignore half and three-quarters cover.',
    'Tavern Brawler':      'Increase Strength or Constitution by 1. Proficiency with improvised weapons. Unarmed strikes deal 1d4 damage. When you hit with an unarmed strike or improvised weapon, you can use a bonus action to attempt to grapple.',
    'Tough':               'Your hit point maximum increases by twice your level. Whenever you gain a level, your hit point maximum increases by an additional 2 HP.',
    'War Caster':          'Prerequisite: ability to cast at least one spell. Advantage on Constitution saves to maintain concentration. You can perform somatic components even when holding weapons or a shield. You can cast a reaction spell as an opportunity attack.',
    'Weapon Master':       'Increase Strength or Dexterity by 1. You gain proficiency with 4 weapons of your choice.',
  }
  const FEATS = Object.keys(FEAT_DESCS)
  const [feat, setFeat] = useState(value.feat || null)

  const totalSpent = Object.values(increments).reduce((s,n) => s+n, 0)
  const BUDGET = 2

  const bump = (ability) => {
    const cur = increments[ability] || 0
    const score = (abilityScores?.[ability] || 10) + cur
    if (totalSpent >= BUDGET || score >= 20) return
    const next = { ...increments, [ability]: cur + 1 }
    setIncrements(next)
    onChange({ type: 'asi', scores: next })
  }
  const lower = (ability) => {
    const cur = increments[ability] || 0
    if (cur <= 0) return
    const next = { ...increments, [ability]: cur - 1 }
    if (next[ability] === 0) delete next[ability]
    setIncrements(next)
    onChange({ type: 'asi', scores: next })
  }
  const pickFeat = (f) => {
    setFeat(f)
    onChange({ type: 'feat', feat: f })
  }

  return (
    <div className="lu-choice-block">
      <div className="lu-choice-title">{choice.label}</div>
      <p className="lu-choice-desc">Increase two ability scores by 1 each (or one score by 2), or take a feat instead.</p>
      <div className="lu-asi-mode-row">
        <button className={`lu-mode-btn ${mode === 'asi' ? 'active' : ''}`} onClick={() => { setMode('asi'); setFeat(null); setIncrements({}); onChange({ type: 'asi', scores: {} }) }}>
          +2 to Ability Scores
        </button>
        <button className={`lu-mode-btn ${mode === 'feat' ? 'active' : ''}`} onClick={() => { setMode('feat'); setIncrements({}); onChange({ type: 'feat', feat: null }) }}>
          Take a Feat
        </button>
      </div>

      {mode === 'asi' && (
        <>
          <div className="lu-budget-bar">
            <span className="lu-budget-label">Points remaining: <strong>{BUDGET - totalSpent}</strong></span>
            <div className="lu-budget-pips">
              {Array.from({ length: BUDGET }).map((_, i) => (
                <span key={i} className={`lu-budget-pip ${i < totalSpent ? 'used' : ''}`} />
              ))}
            </div>
          </div>
          <div className="lu-asi-grid">
            {ABILITIES.map(ability => {
              const base  = abilityScores?.[ability] || 10
              const inc   = increments[ability] || 0
              const total = base + inc
              const canUp = totalSpent < BUDGET && total < 20
              return (
                <div key={ability} className={`lu-asi-card ${inc > 0 ? 'boosted' : ''}`}>
                  <div className="lu-asi-name">{ability.slice(0,3).toUpperCase()}</div>
                  <div className="lu-asi-score">{total}</div>
                  <div className={`lu-asi-mod ${getMod(total) >= 0 ? 'pos' : 'neg'}`}>{fmtMod(getMod(total))}</div>
                  {inc > 0 && <div className="lu-asi-badge">+{inc}</div>}
                  <div className="lu-asi-btns">
                    <button className="lu-asi-btn" onClick={() => lower(ability)} disabled={inc <= 0}>−</button>
                    <button className="lu-asi-btn" onClick={() => bump(ability)}  disabled={!canUp}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {mode === 'feat' && (
        <div className="lu-option-grid">
          {FEATS.map(f => (
            <button
              key={f}
              className={`lu-option-card ${feat === f ? 'selected' : ''}`}
              onClick={() => pickFeat(feat === f ? null : f)}
            >
              {feat === f && <span className="lu-check">✓</span>}
              <span className="lu-option-name">{f}</span>
              {FEAT_DESCS[f] && <span className="lu-option-desc">{FEAT_DESCS[f]}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MetamagicChoice({ choice, existing = [], onChange }) {
  const count  = choice.count || 1
  const [selected, setSelected] = useState([])

  const toggle = (opt) => {
    let next
    if (selected.includes(opt)) {
      next = selected.filter(s => s !== opt)
    } else {
      if (selected.length >= count) next = [...selected.slice(1), opt]
      else next = [...selected, opt]
    }
    setSelected(next)
    onChange(next)
  }

  const METAMAGIC_DESCS = {
    'Careful Spell':     'When you cast a spell that forces creatures to make a saving throw, you can protect some targets. Spend 1 sorcery point to choose creatures equal to your Charisma modifier — they automatically succeed.',
    'Distant Spell':     'Spend 1 sorcery point to double a spell\'s range, or if touch range, make it 30 feet.',
    'Empowered Spell':   'Spend 1 sorcery point to reroll a number of damage dice up to your Charisma modifier. You must use the new rolls.',
    'Extended Spell':    'Spend 1 sorcery point to double a concentration spell\'s duration (max 24 hours).',
    'Heightened Spell':  'Spend 3 sorcery points to give one creature disadvantage on its first saving throw against a spell.',
    'Quickened Spell':   'Spend 2 sorcery points to change a spell\'s casting time from 1 action to 1 bonus action.',
    'Subtle Spell':      'Spend 1 sorcery point to cast a spell without somatic or verbal components.',
    'Twinned Spell':     'Spend sorcery points equal to the spell\'s level (min 1) to target two creatures with a single-target spell.',
    'Seeking Spell':     'Spend 2 sorcery points to reroll an attack roll for a spell that misses.',
    'Transmuted Spell':  'Spend 1 sorcery point to change a spell\'s damage type to acid, cold, fire, lightning, poison, or thunder.',
  }

  return (
    <div className="lu-choice-block">
      <div className="lu-choice-title">{choice.label} <span className="lu-choice-count">(choose {count})</span></div>
      <p className="lu-choice-desc">Metamagic options let you twist your spells in subtle ways using sorcery points.</p>
      <div className="lu-option-grid">
        {choice.options.filter(o => !existing.includes(o)).map(opt => (
          <button
            key={opt}
            className={`lu-option-card ${selected.includes(opt) ? 'selected' : ''} ${!selected.includes(opt) && selected.length >= count ? 'dim' : ''}`}
            onClick={() => toggle(opt)}
          >
            {selected.includes(opt) && <span className="lu-check">✓</span>}
            <span className="lu-option-name">{opt}</span>
            {METAMAGIC_DESCS[opt] && <span className="lu-option-desc">{METAMAGIC_DESCS[opt]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// Full invocation list with prereqs for runtime filtering
const ALL_INVOCATIONS = [
  // No-prereq
  { name: 'Agonizing Blast',     minLevel: 1, pact: null, desc: 'When you cast Eldritch Blast, add your Charisma modifier to the damage it deals on a hit.' },
  { name: 'Armor of Shadows',    minLevel: 1, pact: null, desc: 'You can cast Mage Armor on yourself at will, without expending a spell slot or material components.' },
  { name: 'Beast Speech',        minLevel: 1, pact: null, desc: 'You can cast Speak with Animals at will, without expending a spell slot.' },
  { name: 'Beguiling Influence', minLevel: 1, pact: null, desc: 'You gain proficiency in Deception and Persuasion. If already proficient, you gain expertise instead.' },
  { name: "Devil's Sight",       minLevel: 1, pact: null, desc: 'You can see normally in Darkness, both magical and nonmagical, to a distance of 120 feet.' },
  { name: 'Eldritch Mind',       minLevel: 1, pact: null, desc: 'You have Advantage on Constitution saving throws to maintain Concentration.' },
  { name: 'Mask of Many Faces',  minLevel: 1, pact: null, desc: 'You can cast Disguise Self at will, without expending a spell slot.' },
  { name: 'Misty Visions',       minLevel: 1, pact: null, desc: 'You can cast Silent Image at will, without expending a spell slot or material components.' },
  { name: 'Repelling Blast',     minLevel: 1, pact: null, desc: 'When Eldritch Blast hits a Large or smaller creature, you can push it up to 10 feet straight away from you.' },
  { name: 'Thief of Five Fates', minLevel: 1, pact: null, desc: 'You can cast Bane once using a Warlock spell slot. You cannot do so again until you finish a Long Rest.' },
  // Level 2+ no-pact
  { name: 'Eldritch Spear',      minLevel: 2, pact: null, desc: 'Choose one of your Warlock damage cantrips with a range of 10+ feet. Its range increases by 30 times your Warlock level.' },
  { name: 'Fiendish Vigor',      minLevel: 2, pact: null, desc: 'You can cast False Life on yourself without a spell slot. You automatically get the highest number on its die for Temporary HP.' },
  { name: 'Lessons of the First Ones', minLevel: 2, pact: null, desc: 'You gain one Origin feat of your choice. Repeatable — each time you take this, choose a different feat.' },
  { name: 'Otherworldly Leap',   minLevel: 2, pact: null, desc: 'You can cast Jump on yourself without expending a spell slot.' },
  // Level 5+ no-pact
  { name: 'Ascendant Step',      minLevel: 5, pact: null, desc: 'You can cast Levitate on yourself without expending a spell slot.' },
  { name: 'Gaze of Two Minds',   minLevel: 5, pact: null, desc: 'You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn.' },
  { name: 'Master of Myriad Forms', minLevel: 5, pact: null, desc: 'You can cast Alter Self without expending a spell slot.' },
  { name: 'One with Shadows',    minLevel: 5, pact: null, desc: 'While in an area of Dim Light or Darkness, you can cast Invisibility on yourself without expending a spell slot.' },
  { name: 'Gift of the Depths',  minLevel: 5, pact: null, desc: 'You can breathe underwater and gain a Swim Speed equal to your Speed. You can also cast Water Breathing once per Long Rest without a spell slot.' },
  // Level 7+
  { name: 'Whispers of the Grave', minLevel: 7, pact: null, desc: 'You can cast Speak with Dead without expending a spell slot.' },
  // Level 9+ no-pact
  { name: 'Visions of Distant Realms', minLevel: 9, pact: null, desc: 'You can cast Arcane Eye without expending a spell slot.' },
  // Level 15+
  { name: 'Witch Sight',         minLevel: 15, pact: null, desc: 'You have Truesight with a range of 30 feet.' },
  // Pact of the Blade
  { name: 'Thirsting Blade',     minLevel: 5,  pact: 'Pact of the Blade', desc: 'You gain the Extra Attack feature for your pact weapon — you can attack twice when you take the Attack action.' },
  { name: 'Eldritch Smite',      minLevel: 5,  pact: 'Pact of the Blade', desc: 'Once per turn when you hit with your pact weapon, you can expend a Pact Magic spell slot to deal extra 1d8 Force damage per slot level and knock Huge or smaller creatures Prone.' },
  { name: 'Devouring Blade',     minLevel: 12, pact: 'Pact of the Blade', desc: 'The Extra Attack from Thirsting Blade now confers two extra attacks instead of one.' },
  { name: 'Lifedrinker',         minLevel: 9,  pact: 'Pact of the Blade', desc: 'Once per turn when you hit with your pact weapon, deal extra 1d6 Necrotic/Psychic/Radiant damage and expend a Hit Die to regain HP equal to the roll + your Constitution modifier.' },
  // Pact of the Chain
  { name: 'Investment of the Chain Master', minLevel: 5, pact: 'Pact of the Chain', desc: 'Your familiar gains a 40-ft Fly or Swim Speed, can Attack as your Bonus Action command, deals Necrotic or Radiant damage, uses your spell save DC, and you can grant it Resistance as a Reaction.' },
  // Pact of the Tome
  { name: 'Gift of the Protectors', minLevel: 9, pact: 'Pact of the Tome', desc: 'A page in your Book of Shadows holds names (up to your Charisma modifier). Creatures on the list drop to 1 HP instead of dying — once per Long Rest.' },
]

function EldritchInvocationChoice({ choice, existing = [], warlockLevel = 1, warlockPact = null, onChange }) {
  const count  = choice.count || 1
  const [selected, setSelected] = useState([])

  // Filter by level prereq, pact prereq, and not already taken
  const available = ALL_INVOCATIONS.filter(inv => {
    if (existing.includes(inv.name)) return false
    if (inv.minLevel > warlockLevel) return false
    if (inv.pact && inv.pact !== warlockPact) return false
    return true
  })

  const toggle = (name) => {
    let next
    if (selected.includes(name)) {
      next = selected.filter(s => s !== name)
    } else {
      if (selected.length >= count) next = [...selected.slice(1), name]
      else next = [...selected, name]
    }
    setSelected(next)
    onChange(next)
  }

  return (
    <div className="lu-choice-block">
      <div className="lu-choice-title">{choice.label} <span className="lu-choice-count">(choose {count})</span></div>
      <p className="lu-choice-desc">
        Your patron grants you additional forbidden knowledge. Choose {count === 1 ? 'an invocation' : `${count} invocations`} from the list below.
        {warlockPact && <span className="lu-invoc-pact-note"> Pact of the {warlockPact.replace('Pact of the ', '')} invocations are included.</span>}
      </p>
      <div className="lu-option-grid">
        {available.map(inv => (
          <button
            key={inv.name}
            className={`lu-option-card ${selected.includes(inv.name) ? 'selected' : ''} ${!selected.includes(inv.name) && selected.length >= count ? 'dim' : ''}`}
            onClick={() => toggle(inv.name)}
          >
            {selected.includes(inv.name) && <span className="lu-check">✓</span>}
            <span className="lu-option-name">{inv.name}</span>
            {inv.pact && <span className="lu-option-prereq">Requires: {inv.pact}</span>}
            {inv.desc && <span className="lu-option-desc">{inv.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function EpicBoonChoice({ choice, value, onChange }) {
  const BOON_DESCS = {
    'Boon of Combat Prowess':    'When you miss with a melee attack, you can choose to hit instead. Once you use this boon, you can\'t use it again until you roll Initiative.',
    'Boon of Dimensional Travel':'As a Bonus Action, you can teleport up to 30 feet to an unoccupied space you can see.',
    'Boon of Energy Resistance': 'You gain resistance to one damage type of your choice (acid, cold, fire, force, lightning, necrotic, poison, psychic, radiant, or thunder). Whenever you finish a Long Rest, you can change the damage type.',
    'Boon of Fate':              'When another creature you can see makes an ability check, attack roll, or saving throw, you can roll 2d4 and apply it as a bonus or penalty to the total. Once you use this boon, you can\'t use it again until you roll Initiative or finish a Short Rest.',
    'Boon of Fortitude':         'Your hit point maximum increases by 40.',
    'Boon of Irresistible Offense':'Your weapon attacks score a critical hit on a roll of 19 or 20.',
    'Boon of Luck':              'Immediately after you roll a d20 for a D20 Test, you can roll a d10 and add it to the result.',
    'Boon of Recovery':          'You can use a Bonus Action to regain a number of Hit Points equal to half your Hit Point maximum. Once you use this boon, you can\'t use it again until you finish a Long Rest.',
    'Boon of Skill':             'You gain proficiency in all skills.',
    'Boon of Speed':             'Your Speed increases by 30 feet.',
    'Boon of Spell Recall':      'You can cast any spell you have prepared without expending a spell slot. Once you use this boon, you can\'t use it again until you finish a Long Rest.',
    'Boon of the Night Spirit':  'You can merge with shadows as a Bonus Action, becoming Invisible in Dim Light or Darkness. The Invisibility ends if you roll Initiative or are in Bright Light.',
    'Boon of Truesight':         'You have Truesight with a range of 60 feet.',
    'Boon of Undetectability':   'You gain a +10 bonus to Dexterity (Stealth) checks, and you can\'t be detected or targeted by Divination magic.',
  }
  return (
    <div className="lu-choice-block">
      <div className="lu-choice-title">{choice.label}</div>
      <p className="lu-choice-desc">You have reached legendary power. Choose one of the following Epic Boons to permanently enhance your abilities.</p>
      <div className="lu-option-grid">
        {choice.options.map(opt => (
          <button
            key={opt}
            className={`lu-option-card lu-option-epic ${value === opt ? 'selected' : ''}`}
            onClick={() => onChange(value === opt ? null : opt)}
          >
            {value === opt && <span className="lu-check">✓</span>}
            <span className="lu-option-name">{opt}</span>
            {BOON_DESCS[opt] && <span className="lu-option-desc">{BOON_DESCS[opt]}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LevelUpPage({ cls, newLevel, choices, abilityScores, levelUpData, proficiencies, onConfirm, onBack }) {
  const [visible, setVisible] = useState(false)
  const [answers, setAnswers] = useState({})

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const setAnswer = (idx, val) => setAnswers(prev => ({ ...prev, [idx]: val }))

  // Check all choices are complete
  const allDone = choices.every((choice, idx) => {
    const val = answers[idx]
    if (choice.type === 'subclass')            return !!val
    if (choice.type === 'fighting_style')      return !!val
    if (choice.type === 'epic_boon')           return !!val
    if (choice.type === 'asi') {
      if (!val) return false
      if (val.type === 'feat') return !!val.feat
      if (val.type === 'asi')  return Object.values(val.scores || {}).reduce((s,n)=>s+n,0) === 2
      return false
    }
    if (choice.type === 'metamagic') {
      const arr = val || []
      return arr.length === (choice.count || 1)
    }
    if (choice.type === 'eldritch_invocation') {
      const arr = val || []
      return arr.length === (choice.count || 1)
    }
    return true
  })

  const existingMetamagic    = levelUpData?.metamagic    || []
  const existingInvocations  = [
    ...(proficiencies?.eldritchInvocation ? [proficiencies.eldritchInvocation] : []),
    ...(levelUpData?.eldritchInvocations || []),
  ]

  const handleConfirm = () => {
    if (!allDone) return
    onConfirm(answers)
  }

  return (
    <div className={`lu-root ${visible ? 'visible' : ''}`}>
      <div className="lu-rune-border top">
        {RUNES.map((r,i) => <span key={i} className="lu-rune" style={{ animationDelay:`${i*0.12}s` }}>{r}</span>)}
      </div>
      <div className="lu-rune-border bottom">
        {[...RUNES].reverse().map((r,i) => <span key={i} className="lu-rune" style={{ animationDelay:`${i*0.12}s` }}>{r}</span>)}
      </div>
      <div className="lu-corner tl">✦</div><div className="lu-corner tr">✦</div>
      <div className="lu-corner bl">✦</div><div className="lu-corner br">✦</div>
      <BackButton onClick={onBack} label="Back to Sheet" />

      <main className="lu-main">
        <header className="lu-header">
          <p className="lu-eyebrow">Level Up</p>
          <h1 className="lu-title">
            {cls?.icon} {cls?.name}
            <span className="lu-level-badge">Level {newLevel}</span>
          </h1>
          <p className="lu-subtitle">
            Power surges through you. Before you advance, make your choices for this level.
          </p>
        </header>

        <div className="lu-choices-list">
          {choices.map((choice, idx) => {
            const val = answers[idx]
            if (choice.type === 'subclass')
              return <SubclassChoice key={idx} choice={choice} value={val} onChange={v => setAnswer(idx, v)} />
            if (choice.type === 'fighting_style')
              return <FightingStyleChoice key={idx} choice={choice} value={val} onChange={v => setAnswer(idx, v)} />
            if (choice.type === 'asi')
              return <ASIChoice key={idx} choice={choice} abilityScores={abilityScores} value={val} onChange={v => setAnswer(idx, v)} />
            if (choice.type === 'metamagic')
              return <MetamagicChoice key={idx} choice={choice} existing={existingMetamagic} onChange={v => setAnswer(idx, v)} />
            if (choice.type === 'eldritch_invocation')
              return <EldritchInvocationChoice key={idx} choice={choice} existing={existingInvocations} warlockLevel={newLevel} warlockPact={proficiencies?.warlockPact || null} onChange={v => setAnswer(idx, v)} />
            if (choice.type === 'epic_boon')
              return <EpicBoonChoice key={idx} choice={choice} value={val} onChange={v => setAnswer(idx, v)} />
            return null
          })}
        </div>

        <div className="lu-confirm-area">
          <button
            className={`lu-confirm-btn ${allDone ? 'ready' : 'dim'}`}
            onClick={handleConfirm}
            disabled={!allDone}
          >
            <span className="lu-confirm-inner">
              <span>⬡</span>
              {allDone ? `Advance to Level ${newLevel}` : 'Complete all choices to advance'}
            </span>
          </button>
        </div>
      </main>
    </div>
  )
}
