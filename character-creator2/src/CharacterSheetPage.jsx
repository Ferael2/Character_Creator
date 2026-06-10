import { useState, useEffect, useRef } from 'react'
import './CharacterSheetPage.css'
import { PROF_BY_LEVEL, SPELL_SLOTS_BY_CLASS_LEVEL, CANTRIPS_BY_CLASS_LEVEL, HIT_DIE_AVG } from './levelUpData.js'

const ABILITIES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
const ABILITY_ABBR = { Strength: 'STR', Dexterity: 'DEX', Constitution: 'CON', Intelligence: 'INT', Wisdom: 'WIS', Charisma: 'CHA' }
const ABILITY_ICONS = { Strength: '⚔️', Dexterity: '🏹', Constitution: '🛡️', Intelligence: '📖', Wisdom: '🔮', Charisma: '✨' }

const SKILL_ABILITY = {
  'Acrobatics': 'Dexterity', 'Animal Handling': 'Wisdom', 'Arcana': 'Intelligence',
  'Athletics': 'Strength', 'Deception': 'Charisma', 'History': 'Intelligence',
  'Insight': 'Wisdom', 'Intimidation': 'Charisma', 'Investigation': 'Intelligence',
  'Medicine': 'Wisdom', 'Nature': 'Intelligence', 'Perception': 'Wisdom',
  'Performance': 'Charisma', 'Persuasion': 'Charisma', 'Religion': 'Intelligence',
  'Sleight of Hand': 'Dexterity', 'Stealth': 'Dexterity', 'Survival': 'Wisdom',
}

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']
const getMod  = (s) => Math.floor((s - 10) / 2)
const fmtMod  = (m) => m >= 0 ? `+${m}` : `${m}`
const DMG_COLOR  = { Slashing: '#e8cc7a', Piercing: '#a8d0e8', Bludgeoning: '#d4a0a0' }

const ELDRITCH_INVOCATION_DESCRIPTIONS = {
  // No-prereq invocations
  'Agonizing Blast':      'When you cast Eldritch Blast, add your Charisma modifier to the damage it deals on a hit.',
  'Armor of Shadows':     'You can cast Mage Armor on yourself at will, without expending a spell slot or material components.',
  'Beast Speech':         'You can cast Speak with Animals at will, without expending a spell slot.',
  'Beguiling Influence':  'You gain proficiency in the Deception and Persuasion skills. If you are already proficient, you gain expertise instead.',
  "Devil's Sight":        'You can see normally in Darkness, both magical and nonmagical, to a distance of 120 feet.',
  'Eldritch Mind':        'You have Advantage on Constitution saving throws that you make to maintain Concentration.',
  'Gaze of Two Minds':    'You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn. (Req: Level 5)',
  'Mask of Many Faces':   'You can cast Disguise Self at will, without expending a spell slot.',
  'Misty Visions':        'You can cast Silent Image at will, without expending a spell slot or material components.',
  'One with Shadows':     'While in an area of Dim Light or Darkness, you can cast Invisibility on yourself without expending a spell slot. (Req: Level 5)',
  'Repelling Blast':      'When you hit a Large or smaller creature with Eldritch Blast, you can push the creature up to 10 feet straight away from you.',
  'Thief of Five Fates':  "You can cast Bane once using a Warlock spell slot. You can't do so again until you finish a Long Rest.",
  // Level 2+ invocations
  'Eldritch Spear':       'Choose one of your known Warlock cantrips that deals damage and has a range of 10+ feet. When you cast that spell, its range increases by 30 times your Warlock level.',
  'Fiendish Vigor':       'You can cast False Life on yourself without expending a spell slot. You automatically get the highest number on the die for its Temporary Hit Points.',
  'Lessons of the First Ones': 'You gain one Origin feat of your choice. Repeatable.',
  'Otherworldly Leap':    'You can cast Jump on yourself without expending a spell slot.',
  // Level 5+ invocations
  'Ascendant Step':       'You can cast Levitate on yourself without expending a spell slot. (Req: Level 5)',
  'Master of Myriad Forms': 'You can cast Alter Self without expending a spell slot. (Req: Level 5)',
  'Gift of the Depths':   'You can breathe underwater and gain a Swim Speed equal to your Speed. You can also cast Water Breathing once without a spell slot per Long Rest. (Req: Level 5)',
  // Level 7+ invocations
  'Whispers of the Grave': 'You can cast Speak with Dead without expending a spell slot. (Req: Level 7)',
  // Level 9+ invocations
  'Gift of the Protectors': 'A page in your Book of Shadows can hold names equal to your Charisma modifier. Creatures whose names are on that page drop to 1 HP instead of dying once per Long Rest. (Req: Level 9, Pact of the Tome)',
  'Visions of Distant Realms': 'You can cast Arcane Eye without expending a spell slot. (Req: Level 9)',
  // Level 12+ invocations
  'Devouring Blade':      'The Extra Attack of your Thirsting Blade invocation confers two extra attacks rather than one. (Req: Level 12, Pact of the Blade)',
  // Level 15+ invocations
  'Witch Sight':          'You have Truesight with a range of 30 feet. (Req: Level 15)',
  // Pact of the Blade invocations
  'Pact of the Blade':    'You can conjure a pact weapon — a Simple or Martial Melee weapon of your choice — as a Bonus Action, and use Charisma for its attack and damage rolls.',
  'Thirsting Blade':      'You gain the Extra Attack feature for your pact weapon only — you can attack twice when you take the Attack action. (Req: Level 5, Pact of the Blade)',
  'Eldritch Smite':       'Once per turn when you hit a creature with your pact weapon, you can expend a Pact Magic spell slot to deal an extra 1d8 Force damage per spell slot level and knock a Huge or smaller creature Prone. (Req: Level 5, Pact of the Blade)',
  'Lifedrinker':          'Once per turn when you hit with your pact weapon, you can deal an extra 1d6 Necrotic/Psychic/Radiant damage (your choice) and expend a Hit Point Die to regain HP equal to the roll plus your Constitution modifier. (Req: Level 9, Pact of the Blade)',
  // Pact of the Chain invocations
  'Pact of the Chain':    'You learn Find Familiar and can cast it as a Magic action without expending a spell slot, with access to special familiar forms: Imp, Pseudodragon, Quasit, Skeleton, Slaad Tadpole, Sphinx of Wonder, Sprite, or Venomous Snake.',
  'Investment of the Chain Master': 'Your familiar gains a Fly or Swim Speed of 40 ft., can attack as a Bonus Action command, deals Necrotic or Radiant damage, uses your spell save DC, and you can grant it Resistance as a Reaction. (Req: Level 5, Pact of the Chain)',
  // Pact of the Tome invocations
  'Pact of the Tome':     "Your Book of Shadows contains three cantrips from any class list and two 1st-level ritual spells. While it's on your person, you have the chosen spells prepared as Warlock spells.",
}

const ARMOR_PROF_MAP = {
  Barbarian: ['Light','Medium','Heavy','Shields'],
  Bard:      ['Light','Shields'],
  Cleric:    ['Light','Medium','Shields'],
  Druid:     ['Light','Medium','Shields (non-metal)'],
  Fighter:   ['Light','Medium','Heavy','Shields'],
  Monk:      ['None'],
  Paladin:   ['Light','Medium','Heavy','Shields'],
  Ranger:    ['Light','Medium','Shields'],
  Rogue:     ['Light'],
  Sorcerer:  ['None'],
  Warlock:   ['Light'],
  Wizard:    ['None'],
}

// ── AC calculation (accounts for special class rules) ─────────────────────────
function computeAC(cls, abilityScores, equipment) {
  const dexMod = getMod(abilityScores?.Dexterity     || 10)
  const conMod = getMod(abilityScores?.Constitution  || 10)
  const wisMod = getMod(abilityScores?.Wisdom        || 10)
  const armor  = equipment?.armor
  const shield = equipment?.shield ? 2 : 0

  if (!armor || armor.category === 'None') {
    // Monk: 10 + DEX + WIS (Unarmored Defense)
    if (cls?.name === 'Monk')      return 10 + dexMod + wisMod
    // Barbarian: 10 + DEX + CON (Unarmored Defense)
    if (cls?.name === 'Barbarian') return 10 + dexMod + conMod + shield
    return 10 + dexMod + shield
  }
  if (armor.category === 'Light')  return armor.ac + dexMod + shield
  if (armor.category === 'Medium') return armor.ac + Math.min(dexMod, 2) + shield
  return armor.ac + shield  // Heavy
}

// ── Small reusable pieces ─────────────────────────────────────────────────────
function AbilityBlock({ ability, score }) {
  const mod = getMod(score)
  return (
    <div className="cs-ability-block">
      <div className="cs-ability-icon">{ABILITY_ICONS[ability]}</div>
      <div className="cs-ability-abbr">{ABILITY_ABBR[ability]}</div>
      <div className="cs-ability-score">{score}</div>
      <div className={`cs-ability-mod ${mod >= 0 ? 'pos' : 'neg'}`}>{fmtMod(mod)}</div>
    </div>
  )
}

function SkillRow({ skill, abilityScores, proficient, expertise, profBonus }) {
  const ability = SKILL_ABILITY[skill]
  const mod     = getMod(abilityScores?.[ability] || 10)
  const bonus   = mod + (expertise ? profBonus * 2 : proficient ? profBonus : 0)
  return (
    <div className={`cs-skill-row ${proficient ? 'prof' : ''} ${expertise ? 'exp' : ''}`}>
      <span className={`cs-skill-dot ${proficient || expertise ? 'filled' : ''} ${expertise ? 'exp-dot' : ''}`} />
      <span className="cs-skill-name">{skill}</span>
      <span className="cs-skill-ability">{ABILITY_ABBR[ability]}</span>
      <span className={`cs-skill-bonus ${bonus >= 0 ? 'pos' : 'neg'}`}>{fmtMod(bonus)}</span>
    </div>
  )
}

function SaveRow({ ability, abilityScores, proficient, profBonus }) {
  const mod   = getMod(abilityScores?.[ability] || 10)
  const bonus = mod + (proficient ? profBonus : 0)
  return (
    <div className={`cs-skill-row ${proficient ? 'prof' : ''}`}>
      <span className={`cs-skill-dot ${proficient ? 'filled' : ''}`} />
      <span className="cs-skill-name">{ability}</span>
      <span className={`cs-skill-bonus ${bonus >= 0 ? 'pos' : 'neg'}`}>{fmtMod(bonus)}</span>
    </div>
  )
}

// ── Tab system ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'combat',      label: 'Combat',      icon: '⚔️' },
  { id: 'skills',      label: 'Skills',      icon: '🎯' },
  { id: 'features',    label: 'Features',    icon: '✨' },
  { id: 'background',  label: 'Background',  icon: '📜' },
  { id: 'proficiency', label: 'Proficiencies', icon: '🎓' },
]

function TabBar({ active, onChange }) {
  return (
    <div className="cs-tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`cs-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="cs-tab-icon">{tab.icon}</span>
          <span className="cs-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Tab panes ─────────────────────────────────────────────────────────────────

const SLOT_LEVEL_LABELS = { 1:'1st',2:'2nd',3:'3rd',4:'4th',5:'5th',6:'6th',7:'7th',8:'8th',9:'9th' }

const SPELL_META = {
  Bard:     { ability:'Charisma',     type:'Full Caster'  },
  Cleric:   { ability:'Wisdom',       type:'Full Caster'  },
  Druid:    { ability:'Wisdom',       type:'Full Caster'  },
  Paladin:  { ability:'Charisma',     type:'Half Caster'  },
  Ranger:   { ability:'Wisdom',       type:'Half Caster'  },
  Sorcerer: { ability:'Charisma',     type:'Full Caster'  },
  Warlock:  { ability:'Charisma',     type:'Pact Magic', note:'Slots recharge on a Short or Long Rest.' },
  Wizard:   { ability:'Intelligence', type:'Full Caster'  },
}

function SpellSlotsSection({ cls, level }) {
  const meta = SPELL_META[cls?.name]
  if (!meta) return null

  const slotTable  = SPELL_SLOTS_BY_CLASS_LEVEL[cls.name]
  const slotMap    = slotTable?.[level] || {}
  const cantripRow = CANTRIPS_BY_CLASS_LEVEL[cls.name]
  // cantrips: find the highest threshold <= level
  const cantrips = cantripRow
    ? Object.entries(cantripRow).filter(([l]) => Number(l) <= level).sort((a,b)=>b[0]-a[0])[0]?.[1] ?? 0
    : 0

  const slotEntries = Object.entries(slotMap).map(([l,c]) => ({ level: Number(l), count: c }))

  return (
    <div className="cs-info-section cs-spell-section">
      <div className="cs-info-section-title">✨ Spellcasting</div>
      <div className="cs-spell-meta">
        <div className="cs-spell-meta-item">
          <span className="cs-spell-meta-label">Ability</span>
          <span className="cs-spell-meta-value">{meta.ability}</span>
        </div>
        <div className="cs-spell-meta-item">
          <span className="cs-spell-meta-label">Type</span>
          <span className="cs-spell-meta-value">{meta.type}</span>
        </div>
        {cantrips > 0 && (
          <div className="cs-spell-meta-item">
            <span className="cs-spell-meta-label">Cantrips</span>
            <span className="cs-spell-meta-value">{cantrips}</span>
          </div>
        )}
      </div>

      <div className="cs-spell-slots-label">Spell Slots — Character Level {level}</div>
      {slotEntries.length > 0 ? (
        <div className="cs-spell-slots-row">
          {slotEntries.map(({ level: slotLvl, count }) => (
            <div key={slotLvl} className="cs-spell-slot-group">
              <div className="cs-slot-level-label">{SLOT_LEVEL_LABELS[slotLvl]}-level</div>
              <div className="cs-slot-pips">
                {Array.from({ length: count }).map((_, i) => (
                  <span key={i} className="cs-slot-pip" />
                ))}
                <span className="cs-slot-count">× {count}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cs-empty-note">No spell slots at this level.</div>
      )}
      {meta.note && <div className="cs-spell-note">{meta.note}</div>}
    </div>
  )
}

function CombatTab({ equipment, totalAC, cls, abilityScores, level }) {
  const dexMod = getMod(abilityScores?.Dexterity || 10)
  const acNote = (() => {
    const armor = equipment?.armor
    if (!armor || armor.category === 'None') {
      if (cls?.name === 'Monk')      return `10 + DEX (${fmtMod(dexMod)}) + WIS (${fmtMod(getMod(abilityScores?.Wisdom||10))})`
      if (cls?.name === 'Barbarian') return `10 + DEX (${fmtMod(dexMod)}) + CON (${fmtMod(getMod(abilityScores?.Constitution||10))})`
      return `10 + DEX modifier (${fmtMod(dexMod)})`
    }
    if (armor.category === 'Light')  return `${armor.ac} + DEX (${fmtMod(dexMod)})`
    if (armor.category === 'Medium') return `${armor.ac} + DEX up to +2`
    return `${armor.ac} (fixed)`
  })()

  return (
    <div className="cs-tab-pane">
      {/* Weapon */}
      <div className="cs-info-section">
        <div className="cs-info-section-title">Weapon</div>
        {equipment?.weapon ? (
          <div className="cs-equip-card">
            <div className="cs-equip-card-top">
              <span className="cs-equip-big-icon">{equipment.weapon.icon}</span>
              <div>
                <div className="cs-equip-card-name">{equipment.weapon.name}</div>
                <div className="cs-equip-card-cat">{equipment.weapon.category}</div>
              </div>
              <div className="cs-equip-card-dice">
                <span className="cs-dice-val">{equipment.weapon.damage}</span>
                <span className="cs-dice-type" style={{ color: DMG_COLOR[equipment.weapon.damageType] || '#c4a87a' }}>
                  {equipment.weapon.damageType}
                </span>
              </div>
            </div>
            {equipment.weapon.properties?.length > 0 && (
              <div className="cs-equip-props">
                {equipment.weapon.properties.map(p => <span key={p} className="cs-prop-tag">{p}</span>)}
              </div>
            )}
          </div>
        ) : <div className="cs-empty-note">No weapon selected.</div>}
      </div>

      {/* Armor */}
      <div className="cs-info-section">
        <div className="cs-info-section-title">Armor</div>
        {equipment?.armor ? (
          <div className="cs-equip-card">
            <div className="cs-equip-card-top">
              <span className="cs-equip-big-icon">{equipment.armor.icon}</span>
              <div>
                <div className="cs-equip-card-name">
                  {equipment.armor.name}
                  {equipment.shield && <span className="cs-shield-chip">+ 🛡️ Shield</span>}
                </div>
                <div className="cs-equip-card-cat">{equipment.armor.category}</div>
              </div>
              <div className="cs-equip-card-dice">
                <span className="cs-dice-val" style={{ color: '#a8c0d0' }}>{totalAC}</span>
                <span className="cs-dice-type" style={{ color: '#a8c0d0' }}>Total AC</span>
              </div>
            </div>
            <div className="cs-ac-formula">{acNote}{equipment?.shield ? ' + 2 (shield)' : ''}</div>
            <div className="cs-equip-desc">{equipment.armor.description}</div>
          </div>
        ) : <div className="cs-empty-note">No armor selected.</div>}
      </div>

      <SpellSlotsSection cls={cls} level={level} />
    </div>
  )
}

function SkillsTab({ abilityScores, allProficientSkills, expertiseSkills, savingThrows, profBonus }) {
  return (
    <div className="cs-tab-pane cs-tab-pane-two-col">
      <div>
        <div className="cs-info-section-title" style={{ marginBottom: '10px' }}>Saving Throws</div>
        <div className="cs-skill-list">
          {ABILITIES.map(ability => (
            <SaveRow
              key={ability} ability={ability} abilityScores={abilityScores}
              proficient={savingThrows.includes(ability)} profBonus={profBonus}
            />
          ))}
        </div>

        <div className="cs-info-section-title" style={{ margin: '20px 0 10px' }}>Passive Perception</div>
        <div className="cs-passive-block">
          <span className="cs-passive-val">
            {10 + getMod(abilityScores?.Wisdom || 10) + (allProficientSkills.includes('Perception') ? profBonus : 0)}
          </span>
          <span className="cs-passive-label">10 + Perception bonus</span>
        </div>
      </div>

      <div>
        <div className="cs-info-section-title" style={{ marginBottom: '10px' }}>Skills</div>
        <div className="cs-skill-list">
          {Object.keys(SKILL_ABILITY).sort().map(skill => (
            <SkillRow
              key={skill} skill={skill} abilityScores={abilityScores}
              proficient={allProficientSkills.includes(skill)}
              expertise={expertiseSkills.includes(skill)}
              profBonus={profBonus}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeaturesTab({ cls, proficiencies, levelUpData, level }) {
  const fightingStyle      = proficiencies?.fightingStyle
  const divineOrder        = proficiencies?.divineOrder
  const primalOrder        = proficiencies?.primalOrder

  const FEAT_DESCS = {
    'Alert':               "You gain +5 to initiative. You can't be surprised while conscious. Other creatures don't gain advantage on attack rolls against you as a result of being unseen by you.",
    'Athlete':             "Increase Strength or Dexterity by 1. Climbing costs no extra movement, standing up costs only 5 ft. of movement, and you can make a running long jump or high jump after moving only 5 ft.",
    'Actor':               "Increase Charisma by 1. You have advantage on Deception and Performance checks when trying to pass as a different person. You can mimic voices and sounds you have heard.",
    'Charger':             "When you use your action to Dash, you can use a bonus action to make one melee weapon attack or shove a creature. If you move 10 ft. in a straight line first, the attack deals +5 damage or the shove pushes 10 ft.",
    'Crossbow Expert':     "Ignore the loading quality of crossbows. Being within 5 ft. of a hostile creature doesn't impose disadvantage on ranged attack rolls. When you attack with a one-handed weapon, you can use a bonus action to attack with a hand crossbow.",
    'Defensive Duelist':   "Prerequisite: Dexterity 13+. When wielding a finesse weapon you are proficient with, you can use your reaction to add your proficiency bonus to your AC against one melee attack that would hit you.",
    'Dual Wielder':        "You gain +1 to AC while wielding two melee weapons. You can use two-weapon fighting even when your weapons aren't light. You can draw or stow two weapons when you would normally draw one.",
    'Dungeon Delver':      "Advantage on Perception and Investigation checks to detect secret doors. Advantage on saves vs. traps. Resistance to trap damage. You can search for traps while traveling at a normal pace.",
    'Durable':             "Increase Constitution by 1. When you roll a Hit Die to regain hit points, the minimum number of hit points you regain equals twice your Constitution modifier (minimum of 2).",
    'Elemental Adept':     "Spells you cast ignore resistance to one damage type you choose (acid, cold, fire, lightning, or thunder). Rolls of 1 on damage dice for that type count as 2.",
    'Grappler':            "Prerequisite: Strength 13+. Advantage on attack rolls against creatures you are grappling. You can use your action to pin a grappled creature — it becomes restrained until the grapple ends.",
    'Great Weapon Master': "When you score a critical hit or reduce a creature to 0 HP with a melee weapon, you can make one melee weapon attack as a bonus action. Before attacking with a heavy weapon you are proficient with, you can take a −5 penalty to the roll to gain +10 damage on a hit.",
    'Healer':              "You can stabilize a creature with a healer's kit as a bonus action. Using a healer's kit to restore hit points restores 1d6 + 4 HP, plus HP equal to the creature's maximum number of Hit Dice (once per short rest per creature).",
    'Heavily Armored':     "Prerequisite: proficiency with medium armor. Increase Strength by 1. You gain proficiency with heavy armor.",
    'Heavy Armor Master':  "Prerequisite: proficiency with heavy armor. Increase Strength by 1. While wearing heavy armor, bludgeoning, piercing, and slashing damage from non-magical weapons is reduced by 3.",
    'Inspiring Leader':    "Prerequisite: Charisma 13+. Spend 10 minutes inspiring companions. Up to 6 friendly creatures who can see or hear you and understand you gain temporary HP equal to your level + your Charisma modifier.",
    'Keen Mind':           "Increase Intelligence by 1. You always know which way is north, the number of hours before the next sunrise or sunset, and you can recall anything you have seen or heard within the past month.",
    'Lightly Armored':     "Increase Strength or Dexterity by 1. You gain proficiency with light armor.",
    'Linguist':            "Increase Intelligence by 1. Learn 3 additional languages. You can create written ciphers. Others can't decipher the code unless they know the cipher or succeed on an Intelligence check (DC = your Intelligence score + proficiency bonus).",
    'Lucky':               "You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend one luck point to roll an additional d20 and choose which die to use. You regain all luck points after a long rest.",
    'Mage Slayer':         "When a creature within 5 ft. casts a spell, you can use your reaction to make a melee weapon attack. When you damage a concentrating caster, they have disadvantage on the saving throw. You have advantage on saving throws against spells cast by creatures within 5 ft.",
    'Magic Initiate':      "Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. Learn 2 cantrips and 1 1st-level spell from that class's list. You can cast the 1st-level spell once per long rest without a spell slot.",
    'Martial Adept':       "Learn 2 maneuvers from the Battle Master archetype. You gain 1 superiority die (d6) to fuel them. The die is expended on use and regained on a short or long rest.",
    'Medium Armor Master': "Prerequisite: proficiency with medium armor. Wearing medium armor doesn't impose disadvantage on Stealth checks. You can add up to +3 from Dexterity (instead of +2) to AC when wearing medium armor.",
    'Mobile':              "Your speed increases by 10 ft. When you use the Dash action, difficult terrain doesn't cost extra movement for the rest of the turn. When you make a melee attack against a creature, you don't provoke opportunity attacks from it for the rest of that turn.",
    'Moderately Armored':  "Prerequisite: proficiency with light armor. Increase Strength or Dexterity by 1. You gain proficiency with medium armor and shields.",
    'Mounted Combatant':   "Advantage on melee attack rolls against unmounted creatures smaller than your mount. Force attacks targeting your mount to target you instead. If your mount fails a Dexterity save, it takes no damage on a success (you take half).",
    'Observant':           "Increase Intelligence or Wisdom by 1. If you can see a creature's mouth while it speaks a language you know, you can interpret what it's saying. +5 bonus to passive Perception and Investigation.",
    'Polearm Master':      "When you take the Attack action with a glaive, halberd, pike, or quarterstaff, you can use a bonus action to make a melee attack with the opposite end (1d4 bludgeoning). You can also make opportunity attacks when creatures enter your reach.",
    'Resilient':           "Increase one ability score by 1. You gain proficiency in saving throws using that ability.",
    'Ritual Caster':       "Prerequisite: Intelligence or Wisdom 13+. You learn 2 ritual spells from any class. You can cast them as rituals. You can add more ritual spells from scrolls you find.",
    'Savage Attacker':     "Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon's damage dice and use either total.",
    'Sentinel':            "When you hit a creature with an opportunity attack, its speed drops to 0. Creatures within 5 ft. provoke opportunity attacks from you even when they Disengage. When a creature attacks a target other than you within 5 ft., you can use your reaction to make a melee attack.",
    'Sharpshooter':        "Attacking at long range doesn't impose disadvantage. Ranged attacks ignore half and three-quarters cover. Before attacking with a ranged weapon you are proficient with, you can take a −5 penalty to gain +10 damage on a hit.",
    'Shield Master':       "If you take the Attack action, you can use a bonus action to try to shove a creature within 5 ft. Add your shield's AC bonus to Dexterity saving throws. If a Dex save would deal half damage, you take no damage on a success.",
    'Skilled':             "Gain proficiency in any combination of 3 skills or tools of your choice.",
    'Skulker':             "Prerequisite: Dexterity 13+. You can try to hide when only lightly obscured. When you are hidden and miss with a ranged attack, you don't reveal your position. Dim light doesn't impose disadvantage on your Perception checks.",
    'Spell Sniper':        "Prerequisite: ability to cast at least one spell. Learn one attack-roll cantrip. Double the range of your spell attack rolls. Your ranged spell attacks ignore half and three-quarters cover.",
    'Tavern Brawler':      "Increase Strength or Constitution by 1. Proficiency with improvised weapons. Unarmed strikes deal 1d4 damage. When you hit with an unarmed strike or improvised weapon, you can use a bonus action to attempt to grapple.",
    'Tough':               "Your hit point maximum increases by twice your level. Whenever you gain a level, your hit point maximum increases by an additional 2 HP.",
    'War Caster':          "Prerequisite: ability to cast at least one spell. Advantage on Constitution saves to maintain concentration. You can perform somatic components even when holding weapons or a shield. You can cast a reaction spell as an opportunity attack.",
    'Weapon Master':       "Increase Strength or Dexterity by 1. You gain proficiency with 4 weapons of your choice.",
  }

  // All features auto-granted per level from levelUpData.featuresLog
  const featuresLog = levelUpData?.featuresLog || {}
  const allAutoFeatures = Object.entries(featuresLog)
    .sort((a,b) => Number(a[0]) - Number(b[0]))
    .flatMap(([lvl, feats]) => feats.map(f => ({ ...f, atLevel: Number(lvl) })))

  const metamagic   = levelUpData?.metamagic || []
  const invocations = [
    ...(proficiencies?.eldritchInvocation ? [proficiencies.eldritchInvocation] : []),
    ...(levelUpData?.eldritchInvocations || []),
  ]
  const feats       = levelUpData?.feats || []
  const epicBoons   = levelUpData?.epicBoons || []
  const fightingStyles = [
    ...(fightingStyle ? [fightingStyle] : []),
    ...(levelUpData?.fightingStyles || []),
  ]
  const subclass    = levelUpData?.subclass

  return (
    <div className="cs-tab-pane">
      <div className="cs-info-section-title">{cls?.icon} {cls?.name} — Features (Level {level})</div>
      <div className="cs-features-list">
        {/* Level 1 core features */}
        {cls?.coreTrait && (
          <div className="cs-feature-card">
            <div className="cs-feature-card-name">{cls.coreTrait.name}</div>
            <div className="cs-feature-card-desc">{cls.coreTrait.description}</div>
          </div>
        )}
        {(cls?.level1Features || cls?.features || []).map(feat => (
          <div key={feat.name} className="cs-feature-card">
            <div className="cs-feature-card-name">{feat.name}</div>
            <div className="cs-feature-card-desc">{feat.description}</div>
          </div>
        ))}

        {/* Subclass */}
        {subclass && (
          <div className="cs-feature-card cs-feature-choice">
            <div className="cs-feature-card-badge">Subclass</div>
            <div className="cs-feature-card-name">{subclass}</div>
            <div className="cs-feature-card-desc">You have joined the {subclass} subclass.</div>
          </div>
        )}

        {/* Level-up auto features */}
        {allAutoFeatures.map((feat, i) => (
          <div key={i} className="cs-feature-card">
            <div className="cs-feature-card-badge">Level {feat.atLevel}</div>
            <div className="cs-feature-card-name">{feat.name}</div>
            <div className="cs-feature-card-desc">{feat.description}</div>
          </div>
        ))}

        {/* Fighting styles */}
        {fightingStyles.map(fs => (
          <div key={fs} className="cs-feature-card cs-feature-choice">
            <div className="cs-feature-card-name">⚔ Fighting Style — {fs}</div>
          </div>
        ))}

        {/* Divine / Primal order */}
        {divineOrder && (
          <div className="cs-feature-card cs-feature-choice">
            <div className="cs-feature-card-name">✝ Divine Order — {divineOrder}</div>
          </div>
        )}
        {primalOrder && (
          <div className="cs-feature-card cs-feature-choice">
            <div className="cs-feature-card-name">🌿 Primal Order — {primalOrder}</div>
          </div>
        )}

        {/* Warlock Pact */}
        {proficiencies?.warlockPact && (
          <div className="cs-feature-card cs-feature-invocation">
            <div className="cs-feature-card-badge">Pact Boon</div>
            <div className="cs-feature-card-name">📖 {proficiencies.warlockPact}</div>
            <div className="cs-feature-card-desc">
              {ELDRITCH_INVOCATION_DESCRIPTIONS[proficiencies.warlockPact] ?? ''}
            </div>
          </div>
        )}

        {/* Eldritch Invocations */}
        {invocations.map(inv => (
          <div key={inv} className="cs-feature-card cs-feature-invocation">
            <div className="cs-feature-card-name">🔮 Eldritch Invocation — {inv}</div>
            <div className="cs-feature-card-desc">
              {ELDRITCH_INVOCATION_DESCRIPTIONS[inv] ?? ''}
            </div>
          </div>
        ))}

        {/* Metamagic */}
        {metamagic.map(m => (
          <div key={m} className="cs-feature-card cs-feature-metamagic">
            <div className="cs-feature-card-name">🌀 Metamagic — {m}</div>
          </div>
        ))}

        {/* Feats */}
        {feats.map(f => (
          <div key={f} className="cs-feature-card cs-feature-feat">
            <div className="cs-feature-card-badge">Feat</div>
            <div className="cs-feature-card-name">{f}</div>
            {FEAT_DESCS[f] && <div className="cs-feature-card-desc">{FEAT_DESCS[f]}</div>}
          </div>
        ))}

        {/* Epic Boons */}
        {epicBoons.map(b => (
          <div key={b} className="cs-feature-card cs-feature-epic">
            <div className="cs-feature-card-badge">Epic Boon</div>
            <div className="cs-feature-card-name">⬡ {b}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BackgroundTab({ race, background }) {
  return (
    <div className="cs-tab-pane">
      <div className="cs-info-section">
        <div className="cs-info-section-title">{background?.icon} Background — {background?.name}</div>
        <p className="cs-prose">{background?.description}</p>

        {background?.feat && (
          <div className="cs-feature-card" style={{ marginTop: '12px' }}>
            <div className="cs-feature-card-badge">Origin Feat</div>
            <div className="cs-feature-card-name">{background.feat}</div>
            <div className="cs-feature-card-desc">{background.featDescription}</div>
          </div>
        )}

        <div className="cs-info-section-title" style={{ marginTop: '20px' }}>Skill Proficiencies</div>
        <div className="cs-tag-row">
          {(background?.skillProficiencies || []).map(s => (
            <span key={s} className="cs-tag gold">{s}</span>
          ))}
        </div>
      </div>

      <div className="cs-info-section" style={{ marginTop: '24px' }}>
        <div className="cs-info-section-title">{race?.icon} Race Traits — {race?.name}</div>
        <div className="cs-features-list">
          {race?.traits?.map(trait => (
            <div key={trait.name} className="cs-feature-card">
              <div className="cs-feature-card-name">{trait.name}</div>
              <div className="cs-feature-card-desc">{trait.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProficiencyTab({ cls, allProficientSkills, expertiseSkills, savingThrows }) {
  return (
    <div className="cs-tab-pane">
      <div className="cs-prof-section">
        <div className="cs-info-section-title">Skills</div>
        <div className="cs-tag-row">
          {allProficientSkills.length > 0
            ? allProficientSkills.map(s => (
                <span key={s} className={`cs-tag ${expertiseSkills.includes(s) ? 'expertise' : 'gold'}`}>
                  {expertiseSkills.includes(s) ? '◈ ' : ''}{s}
                </span>
              ))
            : <span className="cs-empty-note">None</span>
          }
        </div>
      </div>
      <div className="cs-prof-section">
        <div className="cs-info-section-title">Saving Throws</div>
        <div className="cs-tag-row">
          {savingThrows.map(s => <span key={s} className="cs-tag gold">{s}</span>)}
        </div>
      </div>
      <div className="cs-prof-section">
        <div className="cs-info-section-title">Armor</div>
        <div className="cs-tag-row">
          {(ARMOR_PROF_MAP[cls?.name] || ['—']).map(a => (
            <span key={a} className="cs-tag steel">{a}</span>
          ))}
        </div>
      </div>
      <div className="cs-prof-section">
        <div className="cs-info-section-title">Weapons</div>
        <div className="cs-tag-row">
          {(() => {
            const weapMap = {
              Barbarian: ['Simple','Martial'],
              Bard:      ['Simple','Martial'],
              Cleric:    ['Simple'],
              Druid:     ['Simple'],
              Fighter:   ['Simple','Martial'],
              Monk:      ['Simple','Shortswords'],
              Paladin:   ['Simple','Martial'],
              Ranger:    ['Simple','Martial'],
              Rogue:     ['Simple','Martial Ranged','Longswords','Rapiers','Shortswords'],
              Sorcerer:  ['Daggers','Darts','Slings','Quarterstaves','Light Crossbows'],
              Warlock:   ['Simple'],
              Wizard:    ['Daggers','Darts','Slings','Quarterstaves','Light Crossbows'],
            }
            return (weapMap[cls?.name] || ['—']).map(w => (
              <span key={w} className="cs-tag steel">{w}</span>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CharacterSheetPage({ race, background, cls, proficiencies, abilityScores, equipment, charName, onCharNameChange, portrait, onPortraitChange, level, levelUpData, onLevelUp, onNewCharacter }) {
  const [visible,    setVisible]    = useState(false)
  const [dragging,   setDragging]   = useState(false)
  const [activeTab,  setActiveTab]  = useState('combat')
  const fileRef = useRef(null)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const allProficientSkills = [
    ...(proficiencies?.backgroundSkills || []),
    ...(proficiencies?.classSkills || []),
    ...(proficiencies?.skilledSkills || []),
  ]
  const expertiseSkills = proficiencies?.expertise || []
  const savingThrows    = cls?.savingThrows || []
  const hitDie          = cls?.hitDie || 'd8'
  const hitDieMax       = parseInt(hitDie.replace('d', ''))
  const conMod          = getMod(abilityScores?.Constitution || 10)
  const dexMod          = getMod(abilityScores?.Dexterity    || 10)
  const profBonus       = PROF_BY_LEVEL[level] || 2
  // Level 1 HP = max hit die + CON mod; each subsequent level = avg + CON mod
  const baseHP  = hitDieMax + conMod
  const maxHP   = baseHP + (levelUpData?.hpBonus || 0)
  const totalAC = computeAC(cls, abilityScores, equipment)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader(); r.onload = ev => onPortraitChange(ev.target.result); r.readAsDataURL(file)
  }
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const r = new FileReader(); r.onload = ev => onPortraitChange(ev.target.result); r.readAsDataURL(file)
  }

  return (
    <div className={`cs-root ${visible ? 'visible' : ''}`}>
      <div className="cs-rune-border top">
        {RUNES.map((r,i) => <span key={i} className="cs-rune" style={{ animationDelay: `${i*0.12}s` }}>{r}</span>)}
      </div>
      <div className="cs-rune-border bottom">
        {[...RUNES].reverse().map((r,i) => <span key={i} className="cs-rune" style={{ animationDelay: `${i*0.12}s` }}>{r}</span>)}
      </div>
      <div className="cs-corner tl">✦</div><div className="cs-corner tr">✦</div>
      <div className="cs-corner bl">✦</div><div className="cs-corner br">✦</div>
      <div className="cs-particles" aria-hidden="true">
        {Array.from({length:12}).map((_,i) => (
          <span key={i} className="cs-particle" style={{
            left:`${Math.random()*100}%`,
            animationDelay:`${Math.random()*8}s`,
            animationDuration:`${8+Math.random()*10}s`,
            fontSize:`${7+Math.random()*8}px`,
          }}>{RUNES[Math.floor(Math.random()*RUNES.length)]}</span>
        ))}
      </div>

      <main className="cs-main">
        {/* Eyebrow */}
        <header className="cs-eyebrow-row">
          <p className="cs-eyebrow">Character Sheet</p>
          <div className="cs-header-right">
            <span className="cs-save-badge" title="Character saved to browser storage">
              <span className="cs-save-dot" />
              Saved
            </span>
            <div className="cs-identity-badges">
              {race       && <span className="cs-badge">{race.icon} {race.name}</span>}
              {background && <span className="cs-badge">{background.icon} {background.name}</span>}
              {cls        && <span className="cs-badge">{cls.icon} {cls.name}</span>}
            </div>
            {onNewCharacter && (
              <button className="cs-new-char-btn" onClick={() => {
                if (window.confirm('Start a new character? Your current character will be deleted.')) {
                  onNewCharacter()
                }
              }}>
                <span>⊕</span> New Character
              </button>
            )}
          </div>
        </header>

        {/* Zone 1: Portrait + Identity + Combat strip */}
        <section className="cs-zone cs-zone-top">
          <div className="cs-portrait-col">
            <div
              className={`cs-portrait-drop ${dragging?'dragging':''} ${portrait?'has-image':''}`}
              onDragOver={e=>{e.preventDefault();setDragging(true)}}
              onDragLeave={()=>setDragging(false)}
              onDrop={handleDrop}
              onClick={()=>fileRef.current?.click()}
              role="button" tabIndex={0}
              onKeyDown={e=>e.key==='Enter'&&fileRef.current?.click()}
            >
              {portrait
                ? <img src={portrait} alt="Character portrait" className="cs-portrait-img" />
                : <div className="cs-portrait-placeholder">
                    <div className="cs-portrait-rune">ᚹ</div>
                    <p className="cs-portrait-hint">Click or drop<br/><span>to upload portrait</span></p>
                  </div>
              }
              {portrait && (
                <button className="cs-portrait-change" onClick={e=>{e.stopPropagation();fileRef.current?.click()}}>
                  Change
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="cs-file-hidden" onChange={handleFileChange} />
          </div>

          <div className="cs-identity-col">
            <div className="cs-name-wrap">
              <label className="cs-name-label">Character Name</label>
              <input
                className="cs-name-input" type="text" value={charName}
                onChange={e=>onCharNameChange(e.target.value)}
                placeholder="Enter your name…" maxLength={40}
              />
              <div className="cs-name-underline" />
            </div>

            <div className="cs-identity-grid">
              {[
                ['Race',        `${race?.icon||''} ${race?.name||'—'}`],
                ['Background',  `${background?.icon||''} ${background?.name||'—'}`],
                ['Class',       `${cls?.icon||''} ${cls?.name||'—'}`],
                ['Level',       String(level || 1)],
                ['Hit Die',     hitDie],
                ['Prof. Bonus', `+${profBonus}`],
              ].map(([label, value]) => (
                <div key={label} className="cs-identity-cell">
                  <span className="cs-id-label">{label}</span>
                  <span className="cs-id-value">{value}</span>
                </div>
              ))}
            </div>

            {/* Level Up button */}
            {onLevelUp && level < 20 && (
              <button className="cs-levelup-btn" onClick={onLevelUp}>
                <span>⬡</span> Level Up → {(level||1) + 1}
              </button>
            )}
            {level >= 20 && <div className="cs-max-level">⬡ Maximum Level Reached</div>}

            <div className="cs-combat-strip">
              {[
                { label: 'Armor Class',  value: totalAC,           sub: equipment?.armor?.name || 'Unarmored', cls: 'ac'    },
                { label: 'Max HP',       value: maxHP,             sub: `${hitDie} + CON mod`,                cls: 'hp'    },
                { label: 'Initiative',   value: fmtMod(dexMod),    sub: 'DEX modifier',                       cls: 'init'  },
                { label: 'Speed',        value: race?.speed || 30, sub: 'feet per turn',                      cls: 'speed' },
              ].map((stat, i, arr) => (
                <>
                  <div key={stat.label} className={`cs-combat-stat ${stat.cls}`}>
                    <div className="cs-combat-value">{stat.value}</div>
                    <div className="cs-combat-label">{stat.label}</div>
                    <div className="cs-combat-sub">{stat.sub}</div>
                  </div>
                  {i < arr.length - 1 && <div key={`div-${i}`} className="cs-combat-divider" />}
                </>
              ))}
            </div>
          </div>
        </section>

        <div className="cs-ornament" aria-hidden="true">
          <span className="cs-orn-line"/><span className="cs-orn-diamond">◆</span>
          <span className="cs-orn-rune">ᚠ</span>
          <span className="cs-orn-diamond">◆</span><span className="cs-orn-line"/>
        </div>

        {/* Zone 2: Ability Scores */}
        <section className="cs-zone cs-zone-abilities">
          <div className="cs-zone-title">Ability Scores</div>
          <div className="cs-abilities-row">
            {ABILITIES.map(ability => (
              <AbilityBlock key={ability} ability={ability} score={abilityScores?.[ability] || 10} />
            ))}
          </div>
        </section>

        <div className="cs-ornament" aria-hidden="true">
          <span className="cs-orn-line"/><span className="cs-orn-diamond">◆</span>
          <span className="cs-orn-rune">ᚢ</span>
          <span className="cs-orn-diamond">◆</span><span className="cs-orn-line"/>
        </div>

        {/* Zone 3: Tabbed content */}
        <section className="cs-zone cs-zone-tabs">
          <TabBar active={activeTab} onChange={setActiveTab} />
          <div className="cs-tab-content">
            {activeTab === 'combat' && (
              <CombatTab equipment={equipment} totalAC={totalAC} cls={cls} abilityScores={abilityScores} level={level||1} />
            )}
            {activeTab === 'skills' && (
              <SkillsTab
                abilityScores={abilityScores}
                allProficientSkills={allProficientSkills}
                expertiseSkills={expertiseSkills}
                savingThrows={savingThrows}
                profBonus={profBonus}
              />
            )}
            {activeTab === 'features' && (
              <FeaturesTab cls={cls} proficiencies={proficiencies} levelUpData={levelUpData} level={level||1} />
            )}
            {activeTab === 'background' && (
              <BackgroundTab race={race} background={background} />
            )}
            {activeTab === 'proficiency' && (
              <ProficiencyTab
                cls={cls}
                allProficientSkills={allProficientSkills}
                expertiseSkills={expertiseSkills}
                savingThrows={savingThrows}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
