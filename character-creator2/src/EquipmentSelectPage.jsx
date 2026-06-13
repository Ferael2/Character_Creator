import { useState, useEffect } from 'react'
import BackButton from './BackButton'
import './EquipmentSelectPage.css'
import { useLanguage } from './LanguageContext'
import T from './translations'

// ─── Armor data ───────────────────────────────────────────────────────────────
const ALL_ARMOR = [
  // Light
  { id: 'padded',      name: 'Padded Armor',      category: 'Light',   ac: 11, icon: '🧥', description: 'Quilted layers of cloth and batting.' },
  { id: 'leather',     name: 'Leather Armor',      category: 'Light',   ac: 11, icon: '🥼', description: 'Chest and shoulders of stiffened leather.' },
  { id: 'studded',     name: 'Studded Leather',    category: 'Light',   ac: 12, icon: '🛡️', description: 'Leather armor reinforced with close-set rivets.' },
  // Medium
  { id: 'hide',        name: 'Hide Armor',         category: 'Medium',  ac: 12, icon: '🦌', description: 'Crude armor of thick furs and pelts.' },
  { id: 'chainshirt',  name: 'Chain Shirt',        category: 'Medium',  ac: 13, icon: '⛓️', description: 'Interlocking metal rings worn over padding.' },
  { id: 'scaleMail',   name: 'Scale Mail',         category: 'Medium',  ac: 14, icon: '🐉', description: 'Overlapping metal scales on leather backing.' },
  { id: 'breastplate', name: 'Breastplate',        category: 'Medium',  ac: 14, icon: '🔶', description: 'A fitted metal chest piece with flexible leather.' },
  { id: 'halfPlate',   name: 'Half Plate',         category: 'Medium',  ac: 15, icon: '⚔️', description: 'Metal plates covering most of the body.' },
  // Heavy
  { id: 'ringMail',    name: 'Ring Mail',          category: 'Heavy',   ac: 14, icon: '💍', description: 'Leather with heavy rings sewn on to reinforce it.' },
  { id: 'chainMail',   name: 'Chain Mail',         category: 'Heavy',   ac: 16, icon: '🔗', description: 'Interlocking metal rings with thick padding.' },
  { id: 'splint',      name: 'Splint Armor',       category: 'Heavy',   ac: 17, icon: '📐', description: 'Narrow vertical strips of metal riveted to backing.' },
  { id: 'plate',       name: 'Plate Armor',        category: 'Heavy',   ac: 18, icon: '🏰', description: 'Interlocking shaped plates covering the entire body.' },
  // Special
  { id: 'shield',      name: 'Shield',             category: 'Shield',  ac:  2, icon: '🛡️', description: '+2 AC bonus (can pair with any armor).' },
  { id: 'unarmored',   name: 'No Armor',           category: 'None',    ac: 10, icon: '👕', description: 'AC equals 10 + Dex modifier.' },
]

// ─── Weapon data ──────────────────────────────────────────────────────────────
const ALL_WEAPONS = [
  // Simple melee
  { id: 'club',        name: 'Club',           category: 'Simple Melee',   damage: '1d4',  damageType: 'Bludgeoning', icon: '🪵', properties: ['Light'] },
  { id: 'dagger',      name: 'Dagger',         category: 'Simple Melee',   damage: '1d4',  damageType: 'Piercing',    icon: '🗡️', properties: ['Finesse', 'Light', 'Thrown'] },
  { id: 'greatclub',   name: 'Greatclub',      category: 'Simple Melee',   damage: '1d8',  damageType: 'Bludgeoning', icon: '🏑', properties: ['Two-handed'] },
  { id: 'handaxe',     name: 'Handaxe',        category: 'Simple Melee',   damage: '1d6',  damageType: 'Slashing',    icon: '🪓', properties: ['Light', 'Thrown'] },
  { id: 'javelin',     name: 'Javelin',        category: 'Simple Melee',   damage: '1d6',  damageType: 'Piercing',    icon: '🎯', properties: ['Thrown'] },
  { id: 'quarterstaff',name: 'Quarterstaff',   category: 'Simple Melee',   damage: '1d6',  damageType: 'Bludgeoning', icon: '🪄', properties: ['Versatile (1d8)'] },
  { id: 'spear',       name: 'Spear',          category: 'Simple Melee',   damage: '1d6',  damageType: 'Piercing',    icon: '🔱', properties: ['Thrown', 'Versatile (1d8)'] },
  { id: 'lighthammer', name: 'Light Hammer',   category: 'Simple Melee',   damage: '1d4',  damageType: 'Bludgeoning', icon: '🔨', properties: ['Light', 'Thrown'] },
  { id: 'mace',        name: 'Mace',           category: 'Simple Melee',   damage: '1d6',  damageType: 'Bludgeoning', icon: '⚙️', properties: [] },
  // Simple ranged
  { id: 'shortbow',    name: 'Shortbow',       category: 'Simple Ranged',  damage: '1d6',  damageType: 'Piercing',    icon: '🏹', properties: ['Ammunition', 'Two-handed'] },
  { id: 'sling',       name: 'Sling',          category: 'Simple Ranged',  damage: '1d4',  damageType: 'Bludgeoning', icon: '⭕', properties: ['Ammunition'] },
  { id: 'crossbow_lt', name: 'Light Crossbow', category: 'Simple Ranged',  damage: '1d8',  damageType: 'Piercing',    icon: '🎯', properties: ['Ammunition', 'Loading', 'Two-handed'] },
  // Martial melee
  { id: 'battleaxe',   name: 'Battleaxe',      category: 'Martial Melee',  damage: '1d8',  damageType: 'Slashing',    icon: '🪓', properties: ['Versatile (1d10)'] },
  { id: 'flail',       name: 'Flail',          category: 'Martial Melee',  damage: '1d8',  damageType: 'Bludgeoning', icon: '⛓️', properties: [] },
  { id: 'glaive',      name: 'Glaive',         category: 'Martial Melee',  damage: '1d10', damageType: 'Slashing',    icon: '⚔️', properties: ['Heavy', 'Reach', 'Two-handed'] },
  { id: 'greataxe',    name: 'Greataxe',       category: 'Martial Melee',  damage: '1d12', damageType: 'Slashing',    icon: '🪓', properties: ['Heavy', 'Two-handed'] },
  { id: 'greatsword',  name: 'Greatsword',     category: 'Martial Melee',  damage: '2d6',  damageType: 'Slashing',    icon: '⚔️', properties: ['Heavy', 'Two-handed'] },
  { id: 'longsword',   name: 'Longsword',      category: 'Martial Melee',  damage: '1d8',  damageType: 'Slashing',    icon: '🗡️', properties: ['Versatile (1d10)'] },
  { id: 'maul',        name: 'Maul',           category: 'Martial Melee',  damage: '2d6',  damageType: 'Bludgeoning', icon: '🔨', properties: ['Heavy', 'Two-handed'] },
  { id: 'rapier',      name: 'Rapier',         category: 'Martial Melee',  damage: '1d8',  damageType: 'Piercing',    icon: '🗡️', properties: ['Finesse'] },
  { id: 'scimitar',    name: 'Scimitar',       category: 'Martial Melee',  damage: '1d6',  damageType: 'Slashing',    icon: '🌙', properties: ['Finesse', 'Light'] },
  { id: 'shortsword',  name: 'Shortsword',     category: 'Martial Melee',  damage: '1d6',  damageType: 'Piercing',    icon: '🗡️', properties: ['Finesse', 'Light'] },
  { id: 'warhammer',   name: 'Warhammer',      category: 'Martial Melee',  damage: '1d8',  damageType: 'Bludgeoning', icon: '🔨', properties: ['Versatile (1d10)'] },
  { id: 'waraxe',      name: 'War Pick',       category: 'Martial Melee',  damage: '1d8',  damageType: 'Piercing',    icon: '⛏️', properties: [] },
  { id: 'halberd',     name: 'Halberd',        category: 'Martial Melee',  damage: '1d10', damageType: 'Slashing',    icon: '🔱', properties: ['Heavy', 'Reach', 'Two-handed'] },
  // Martial ranged
  { id: 'longbow',     name: 'Longbow',        category: 'Martial Ranged', damage: '1d8',  damageType: 'Piercing',    icon: '🏹', properties: ['Ammunition', 'Heavy', 'Two-handed'] },
  { id: 'crossbow_hv', name: 'Heavy Crossbow', category: 'Martial Ranged', damage: '1d10', damageType: 'Piercing',    icon: '🎯', properties: ['Ammunition', 'Heavy', 'Loading', 'Two-handed'] },
  { id: 'handcrossbow',name: 'Hand Crossbow',  category: 'Martial Ranged', damage: '1d6',  damageType: 'Piercing',    icon: '🎯', properties: ['Ammunition', 'Light', 'Loading'] },
]

// ─── Class proficiency restrictions ──────────────────────────────────────────
const CLASS_RESTRICTIONS = {
  Barbarian: {
    armor:   ['Light', 'Medium', 'Shield', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'],
    note:    'Proficient with all armor, shields, simple and martial weapons.',
  },
  Bard: {
    armor:   ['Light', 'Shield', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'],
    note:    'Light armor, shields, simple weapons, and several martial weapons.',
  },
  Cleric: {
    armor:   ['Light', 'Medium', 'Shield', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged'],
    note:    'Light and medium armor, shields, simple weapons.',
  },
  Druid: {
    armor:   ['Light', 'Medium', 'Shield', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged'],
    note:    'Light and medium armor, shields (non-metal), simple weapons.',
  },
  Fighter: {
    armor:   ['Light', 'Medium', 'Heavy', 'Shield', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'],
    note:    'All armor, shields, simple and martial weapons.',
  },
  Monk: {
    armor:   ['None'],
    weapons: ['Simple Melee', 'Simple Ranged'],
    note:    'No armor or shields. Simple weapons and shortswords.',
    extraWeaponIds: ['shortsword'],
  },
  Paladin: {
    armor:   ['Light', 'Medium', 'Heavy', 'Shield', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'],
    note:    'All armor, shields, simple and martial weapons.',
  },
  Ranger: {
    armor:   ['Light', 'Medium', 'Shield', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'],
    note:    'Light and medium armor, shields, simple and martial weapons.',
  },
  Rogue: {
    armor:   ['Light', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged', 'Martial Ranged'],
    note:    'Light armor, simple weapons, hand crossbows, longswords, rapiers, shortswords.',
    extraWeaponIds: ['longsword', 'rapier', 'shortsword', 'handcrossbow'],
  },
  Sorcerer: {
    armor:   ['None'],
    weapons: ['Simple Melee', 'Simple Ranged'],
    note:    'No armor. Daggers, darts, slings, quarterstaves, light crossbows.',
    restrictedWeaponIds: ['dagger', 'quarterstaff', 'shortbow', 'sling', 'crossbow_lt'],
  },
  Warlock: {
    armor:   ['Light', 'None'],
    weapons: ['Simple Melee', 'Simple Ranged'],
    note:    'Light armor, simple weapons.',
  },
  Wizard: {
    armor:   ['None'],
    weapons: ['Simple Melee', 'Simple Ranged'],
    note:    'No armor. Daggers, darts, slings, quarterstaves, light crossbows.',
    restrictedWeaponIds: ['dagger', 'quarterstaff', 'shortbow', 'sling', 'crossbow_lt'],
  },
}

// ─── Filter helpers ───────────────────────────────────────────────────────────
function getAvailableArmor(cls) {
  const restriction = CLASS_RESTRICTIONS[cls?.name] || CLASS_RESTRICTIONS.Fighter
  return ALL_ARMOR.filter(a => restriction.armor.includes(a.category))
}

function getAvailableWeapons(cls) {
  const restriction = CLASS_RESTRICTIONS[cls?.name] || CLASS_RESTRICTIONS.Fighter
  // If class has a restricted list (like Wizard), use that
  if (restriction.restrictedWeaponIds) {
    return ALL_WEAPONS.filter(w => restriction.restrictedWeaponIds.includes(w.id))
  }
  // Otherwise filter by allowed categories, plus any extras
  const byCategory = ALL_WEAPONS.filter(w => restriction.weapons.includes(w.category))
  const extras = restriction.extraWeaponIds
    ? ALL_WEAPONS.filter(w => restriction.extraWeaponIds.includes(w.id))
    : []
  // Deduplicate
  const ids = new Set(byCategory.map(w => w.id))
  return [...byCategory, ...extras.filter(w => !ids.has(w.id))]
}

// ─── Rune chrome ─────────────────────────────────────────────────────────────
const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

function Chrome() {
  return (
    <>
      <div className="eq-rune-border top">
        {RUNES.map((r, i) => <span key={i} className="eq-rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>)}
      </div>
      <div className="eq-rune-border bottom">
        {[...RUNES].reverse().map((r, i) => <span key={i} className="eq-rune" style={{ animationDelay: `${i * 0.15}s` }}>{r}</span>)}
      </div>
      <div className="eq-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="eq-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${7 + Math.random() * 8}s`,
            fontSize: `${8 + Math.random() * 9}px`,
          }}>{RUNES[Math.floor(Math.random() * RUNES.length)]}</span>
        ))}
      </div>
      <div className="eq-corner tl">✦</div>
      <div className="eq-corner tr">✦</div>
      <div className="eq-corner bl">✦</div>
      <div className="eq-corner br">✦</div>
    </>
  )
}

// ─── Damage type color ────────────────────────────────────────────────────────
const DMG_COLOR = {
  Slashing:    '#e8cc7a',
  Piercing:    '#a8d0e8',
  Bludgeoning: '#d4a0a0',
}

// ─── Armor card ───────────────────────────────────────────────────────────────
function ArmorCard({ armor, selected, onClick, dexMod, hasShield, isShield }) {
  const displayAC = isShield
    ? null
    : armor.category === 'None'
      ? 10 + dexMod
      : armor.category === 'Light'
        ? armor.ac + dexMod
        : armor.ac

  const totalAC = isShield ? null : displayAC + (hasShield && !isShield ? 2 : 0)

  return (
    <div
      className={`eq-card armor-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {selected && <div className="eq-selected-mark">✓</div>}
      <div className="eq-card-icon">{armor.icon}</div>
      <div className="eq-card-name">{armor.name}</div>
      <div className="eq-card-sub">{armor.category === 'None' ? 'Unarmored' : armor.category}</div>

      {isShield ? (
        <div className="eq-ac-display shield-bonus">
          <span className="eq-ac-num">+2</span>
          <span className="eq-ac-label">AC Bonus</span>
        </div>
      ) : (
        <div className="eq-ac-display">
          <span className="eq-ac-num">{displayAC}</span>
          <span className="eq-ac-label">
            {armor.category === 'Light' || armor.category === 'None' ? '+ Dex mod' : 'Base AC'}
          </span>
        </div>
      )}

      <div className="eq-card-desc">{armor.description}</div>
    </div>
  )
}

// ─── Weapon card ─────────────────────────────────────────────────────────────
function WeaponCard({ weapon, selected, onClick, disabled }) {
  return (
    <div
      className={`eq-card weapon-card ${selected ? 'selected' : ''} ${disabled ? 'eq-card-disabled' : ''}`}
      onClick={onClick}
    >
      {selected && <div className="eq-selected-mark">✓</div>}
      <div className="eq-card-icon">{weapon.icon}</div>
      <div className="eq-card-name">{weapon.name}</div>
      <div className="eq-card-sub">{weapon.category}</div>

      <div className="eq-damage-display">
        <span className="eq-damage-dice">{weapon.damage}</span>
        <span className="eq-damage-type" style={{ color: DMG_COLOR[weapon.damageType] || '#c4a87a' }}>
          {weapon.damageType}
        </span>
      </div>

      {weapon.properties.length > 0 && (
        <div className="eq-props">
          {weapon.properties.map(p => <span key={p} className="eq-prop-tag">{p}</span>)}
        </div>
      )}
    </div>
  )
}

// ─── AC Summary bar ───────────────────────────────────────────────────────────
function ACSummary({ armor, shield, dexMod, className }) {
  if (!armor) return null
  const base = armor.category === 'None'
    ? 10 + dexMod
    : armor.category === 'Light'
      ? armor.ac + dexMod
      : armor.ac
  const total = base + (shield ? 2 : 0)

  return (
    <div className={`eq-ac-summary ${className || ''}`}>
      <span className="acs-label">Current AC</span>
      <div className="acs-breakdown">
        <span className="acs-part">{armor.name}</span>
        <span className="acs-op">→</span>
        {shield && <>
          <span className="acs-base">{base}</span>
          <span className="acs-op">+</span>
          <span className="acs-part">Shield</span>
          <span className="acs-op">=</span>
        </>}
        <span className="acs-total">{total}</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EquipmentSelectPage({ race, background, cls, abilityScores, onConfirm, onBack }) {
  const { lang } = useLanguage()
  const t = T[lang]
  const [visible, setVisible]         = useState(false)
  const [selectedArmor, setArmor]     = useState(null)
  const [selectedShield, setShield]   = useState(false)
  const [selectedWeapon, setWeapon]   = useState(null)
  const [armorFilter, setArmorFilter] = useState('All')
  const [weapFilter, setWeapFilter]   = useState('All')

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const availableArmor   = getAvailableArmor(cls)
  const availableWeapons = getAvailableWeapons(cls)
  const restriction      = CLASS_RESTRICTIONS[cls?.name] || {}

  // Armor without shields, then shields separately
  const wearableArmor  = availableArmor.filter(a => a.category !== 'Shield')
  const canUseShield   = availableArmor.some(a => a.category === 'Shield')

  // Dex mod for AC display
  const dexScore = abilityScores?.Dexterity || 10
  const dexMod   = Math.floor((dexScore - 10) / 2)

  // Armor category filter options
  const armorCategories = ['All', ...new Set(wearableArmor.map(a => a.category === 'None' ? 'Unarmored' : a.category))]
  const filteredArmor   = armorFilter === 'All'
    ? wearableArmor
    : wearableArmor.filter(a => (a.category === 'None' ? 'Unarmored' : a.category) === armorFilter)

  // Weapon category filter options
  const weapCategories = ['All', ...new Set(availableWeapons.map(w => w.category))]
  const filteredWeapons = weapFilter === 'All'
    ? availableWeapons
    : availableWeapons.filter(w => w.category === weapFilter)

  // Final AC calculation
  const finalAC = selectedArmor
    ? (selectedArmor.category === 'None'
        ? 10 + dexMod
        : selectedArmor.category === 'Light'
          ? selectedArmor.ac + dexMod
          : selectedArmor.ac)
      + (selectedShield ? 2 : 0)
    : null

  const canConfirm = selectedArmor && selectedWeapon

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({
      armor:  selectedArmor,
      shield: selectedShield,
      weapon: selectedWeapon,
      ac:     finalAC,
    })
  }

  return (
    <div className={`eq-root ${visible ? 'visible' : ''}`}>
      {onBack && <BackButton onClick={onBack} />}
      <Chrome />

      <main className="eq-main">
        {/* Header */}
        <header className="eq-header">
          <p className="eq-eyebrow">{t.eq_eyebrow}</p>
          <h1 className="eq-title">{t.eq_title} <span className="eq-accent">{t.eq_titleAccent}</span></h1>
          <div className="eq-selections-reminder">
            {race       && <span className="eq-sel-item">{race.icon} {race.name}</span>}
            {background && <><span className="eq-sel-sep">◆</span><span className="eq-sel-item">{background.icon} {background.name}</span></>}
            {cls        && <><span className="eq-sel-sep">◆</span><span className="eq-sel-item">{cls.icon} {cls.name}</span></>}
          </div>
          <p className="eq-subtitle">
            {t.eq_subtitle}
          </p>
          <div className="eq-class-note">
            <span className="eq-note-icon">{cls?.icon}</span>
            <span className="eq-note-text">{restriction.note}</span>
          </div>
        </header>

        {/* ── Armor section ── */}
        <section className="eq-section">
          <div className="eq-section-header">
            <h2 className="eq-section-title">
              <span className="eq-section-icon">🛡️</span>
              Armor
            </h2>
            {selectedArmor && (
              <ACSummary armor={selectedArmor} shield={selectedShield} dexMod={dexMod} />
            )}
          </div>

          {/* Category filter tabs */}
          {armorCategories.length > 2 && (
            <div className="eq-filter-tabs">
              {armorCategories.map(cat => (
                <button
                  key={cat}
                  className={`eq-filter-tab ${armorFilter === cat ? 'active' : ''}`}
                  onClick={() => setArmorFilter(cat)}
                >{cat}</button>
              ))}
            </div>
          )}

          <div className="eq-card-grid">
            {filteredArmor.map(armor => (
              <ArmorCard
                key={armor.id}
                armor={armor}
                selected={selectedArmor?.id === armor.id}
                onClick={() => setArmor(prev => prev?.id === armor.id ? null : armor)}
                dexMod={dexMod}
                hasShield={selectedShield}
                isShield={false}
              />
            ))}

            {/* Shield card inline if allowed */}
            {canUseShield && (armorFilter === 'All') && (
              <div
                className={`eq-card armor-card shield-card ${selectedShield ? 'selected' : ''}`}
                onClick={() => {
                  const next = !selectedShield
                  setShield(next)
                  // Can't use a two-handed weapon with a shield
                  if (next && selectedWeapon?.properties?.includes('Two-handed')) {
                    setWeapon(null)
                  }
                }}
              >
                {selectedShield && <div className="eq-selected-mark">✓</div>}
                <div className="eq-card-icon">🛡️</div>
                <div className="eq-card-name">Shield</div>
                <div className="eq-card-sub">Shield</div>
                <div className="eq-ac-display shield-bonus">
                  <span className="eq-ac-num">+2</span>
                  <span className="eq-ac-label">AC Bonus</span>
                </div>
                <div className="eq-card-desc">Can be paired with any one-handed weapon or no weapon.</div>
              </div>
            )}
          </div>
        </section>

        {/* ── Weapon section ── */}
        <section className="eq-section">
          <div className="eq-section-header">
            <h2 className="eq-section-title">
              <span className="eq-section-icon">⚔️</span>
              Weapon
            </h2>
            {selectedWeapon && (
              <div className="eq-weap-summary">
                <span className="acs-label">Selected</span>
                <span className="acs-part">{selectedWeapon.name}</span>
                <span className="acs-op">·</span>
                <span className="eq-damage-dice">{selectedWeapon.damage}</span>
                <span className="acs-op" style={{ color: DMG_COLOR[selectedWeapon.damageType] }}>
                  {selectedWeapon.damageType}
                </span>
              </div>
            )}
          </div>

          {/* Weapon filter tabs */}
          {weapCategories.length > 2 && (
            <div className="eq-filter-tabs">
              {weapCategories.map(cat => (
                <button
                  key={cat}
                  className={`eq-filter-tab ${weapFilter === cat ? 'active' : ''}`}
                  onClick={() => setWeapFilter(cat)}
                >{cat}</button>
              ))}
            </div>
          )}

          {selectedShield && (
            <div className="eq-shield-warning">
              🛡️ Shield equipped — two-handed weapons are unavailable
            </div>
          )}

          <div className="eq-card-grid">
            {filteredWeapons.map(weapon => {
              const isTwoHanded = weapon.properties?.includes('Two-handed')
              const blocked     = selectedShield && isTwoHanded
              return (
                <WeaponCard
                  key={weapon.id}
                  weapon={weapon}
                  selected={selectedWeapon?.id === weapon.id}
                  disabled={blocked}
                  onClick={() => { if (!blocked) setWeapon(prev => prev?.id === weapon.id ? null : weapon) }}
                />
              )
            })}
          </div>
        </section>

        {/* ── Summary & Confirm ── */}
        <div className="eq-confirm-area">
          {selectedArmor && selectedWeapon && (
            <div className="eq-final-summary">
              <div className="eq-final-item">
                <span className="eq-final-label">Armor</span>
                <span className="eq-final-value">{selectedArmor.icon} {selectedArmor.name}{selectedShield ? ' + Shield' : ''}</span>
              </div>
              <div className="eq-final-divider" />
              <div className="eq-final-item">
                <span className="eq-final-label">AC</span>
                <span className="eq-final-value eq-final-ac">{finalAC}</span>
              </div>
              <div className="eq-final-divider" />
              <div className="eq-final-item">
                <span className="eq-final-label">Weapon</span>
                <span className="eq-final-value">{selectedWeapon.icon} {selectedWeapon.name}</span>
              </div>
              <div className="eq-final-divider" />
              <div className="eq-final-item">
                <span className="eq-final-label">Damage</span>
                <span className="eq-final-value" style={{ color: DMG_COLOR[selectedWeapon.damageType] }}>
                  {selectedWeapon.damage} {selectedWeapon.damageType}
                </span>
              </div>
            </div>
          )}

          <button
            className={`eq-confirm-btn ${canConfirm ? 'ready' : 'dim'}`}
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            <span className="eq-confirm-inner">
              <span className="eq-confirm-hex">⬡</span>
              {canConfirm ? t.eq_confirmReady : t.eq_confirmWaiting}
            </span>
          </button>
        </div>
      </main>
    </div>
  )
}
