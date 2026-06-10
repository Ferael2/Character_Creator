import { useState, useEffect } from 'react'
import WelcomePage from './WelcomePage'
import RaceSelectPage from './RaceSelectPage'
import BackgroundSelectPage from './BackgroundSelectPage'
import ClassSelectPage from './ClassSelectPage'
import ProficiencySelectPage from './ProficiencySelectPage'
import AbilityScorePage from './AbilityScorePage'
import EquipmentSelectPage from './EquipmentSelectPage'
import CharacterSheetPage from './CharacterSheetPage'
import LevelUpPage from './LevelUpPage'
import { CLASS_LEVEL_FEATURES, HIT_DIE_AVG, PROF_BY_LEVEL } from './levelUpData.js'
import './App.css'

const SAVE_KEY = 'dnd_character_v1'

const STEP_ORDER = [
  'welcome','race-select','background-select','class-select',
  'proficiency-select','ability-scores','equipment-select','character-sheet',
]
const PREV_VIEW = Object.fromEntries(STEP_ORDER.slice(1).map((step,i) => [step, STEP_ORDER[i]]))

function loadSave() {
  try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
function writeSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)) } catch {}
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY) } catch {}
}

export default function App() {
  const [view,               setView]               = useState('welcome')
  const [selectedRace,       setSelectedRace]        = useState(null)
  const [selectedBackground, setSelectedBackground]  = useState(null)
  const [selectedClass,      setSelectedClass]       = useState(null)
  const [proficiencies,      setProficiencies]       = useState(null)
  const [abilityScores,      setAbilityScores]       = useState(null)
  const [equipment,          setEquipment]           = useState(null)
  const [charName,           setCharName]            = useState('')
  const [portrait,           setPortrait]            = useState(null)
  const [level,              setLevel]               = useState(1)
  const [levelUpData,        setLevelUpData]         = useState({
    // accumulated over time: subclass, metamagic[], eldritchInvocations[], feats[], features by level
    subclass: null, metamagic: [], eldritchInvocations: [], feats: [],
    fightingStyles: [], epicBoons: [], abilityScoreIncreases: {},
    featuresLog: {},   // { [level]: [{name,description}] }
  })
  const [saveLoaded,         setSaveLoaded]          = useState(false)

  // ── Load save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const save = loadSave()
    if (save?.view === 'character-sheet' && save.selectedRace) {
      setView(save.view)
      setSelectedRace(save.selectedRace)
      setSelectedBackground(save.selectedBackground)
      setSelectedClass(save.selectedClass)
      setProficiencies(save.proficiencies)
      setAbilityScores(save.abilityScores)
      setEquipment(save.equipment)
      if (save.charName)   setCharName(save.charName)
      if (save.portrait)   setPortrait(save.portrait)
      if (save.level)      setLevel(save.level)
      if (save.levelUpData) setLevelUpData(save.levelUpData)
    }
    setSaveLoaded(true)
  }, [])

  // ── Persist ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!saveLoaded) return
    if (view === 'character-sheet') {
      writeSave({ view, selectedRace, selectedBackground, selectedClass,
                  proficiencies, abilityScores, equipment, charName, portrait,
                  level, levelUpData })
    }
  }, [view, charName, portrait, level, levelUpData, saveLoaded]) // eslint-disable-line

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goBack = () => { const prev = PREV_VIEW[view]; if (prev) setView(prev) }

  const handleNewCharacter = () => {
    clearSave()
    setSelectedRace(null); setSelectedBackground(null); setSelectedClass(null)
    setProficiencies(null); setAbilityScores(null); setEquipment(null)
    setCharName(''); setPortrait(null); setLevel(1)
    setLevelUpData({ subclass: null, metamagic: [], eldritchInvocations: [], feats: [], fightingStyles: [], epicBoons: [], abilityScoreIncreases: {}, featuresLog: {} })
    setView('welcome')
  }

  // ── Creation handlers ──────────────────────────────────────────────────────
  const handleBegin              = ()     => setView('race-select')
  const handleRaceSelect         = (r)    => { setSelectedRace(r);            setView('background-select') }
  const handleBackgroundSelect   = (bg)   => { setSelectedBackground(bg);     setView('class-select') }
  const handleClassSelect        = (cls)  => { setSelectedClass(cls);         setView('proficiency-select') }
  const handleProficiencyConfirm = (data) => { setProficiencies(data);        setView('ability-scores') }
  const handleAbilityConfirm     = (data) => { setAbilityScores(data.scores); setView('equipment-select') }
  const handleEquipmentConfirm   = (data) => { setEquipment(data);            setView('character-sheet') }

  // ── Level up ───────────────────────────────────────────────────────────────
  const handleLevelUp = () => {
    const newLevel = level + 1
    const clsName  = selectedClass?.name
    const levelData = CLASS_LEVEL_FEATURES[clsName]?.[newLevel]
    const choices   = levelData?.choices || []

    if (choices.length > 0) {
      // Go to decision screen
      setView('level-up')
    } else {
      // Apply automatically
      applyLevelUp(newLevel, levelData, {})
    }
  }

  const applyLevelUp = (newLevel, levelData, answers) => {
    const clsName   = selectedClass?.name
    const hitDie    = selectedClass?.hitDie || 'd8'
    const hpGain    = HIT_DIE_AVG[hitDie] + Math.floor(((abilityScores?.Constitution || 10) - 10) / 2)
    const autoFeatures = levelData?.features || []
    const choices      = levelData?.choices   || []

    setLevelUpData(prev => {
      const next = { ...prev }

      // ── Auto features log ──
      if (autoFeatures.length > 0) {
        next.featuresLog = { ...next.featuresLog, [newLevel]: autoFeatures }
      }

      // ── Process choices ──
      choices.forEach((choice, idx) => {
        const val = answers[idx]
        if (!val) return

        if (choice.type === 'subclass') {
          next.subclass = val
          if (!next.featuresLog[newLevel]) next.featuresLog[newLevel] = []
          next.featuresLog[newLevel] = [
            ...next.featuresLog[newLevel],
            { name: `Subclass: ${val}`, description: `You join the ${val} subclass of ${clsName}.` }
          ]
        }
        if (choice.type === 'fighting_style') {
          next.fightingStyles = [...(next.fightingStyles || []), val]
          if (!next.featuresLog[newLevel]) next.featuresLog[newLevel] = []
          next.featuresLog[newLevel] = [
            ...next.featuresLog[newLevel],
            { name: `Fighting Style: ${val}`, description: choice.options ? '' : '' }
          ]
        }
        if (choice.type === 'asi') {
          if (val.type === 'feat') {
            next.feats = [...(next.feats || []), val.feat]
          } else if (val.type === 'asi' && val.scores) {
            const inc = { ...(next.abilityScoreIncreases || {}) }
            Object.entries(val.scores).forEach(([ability, n]) => {
              inc[ability] = (inc[ability] || 0) + n
            })
            next.abilityScoreIncreases = inc
            // Apply to abilityScores immediately
            setAbilityScores(prev => {
              const updated = { ...prev }
              Object.entries(val.scores).forEach(([ability, n]) => {
                updated[ability] = Math.min(20, (updated[ability] || 10) + n)
              })
              return updated
            })
          }
        }
        if (choice.type === 'metamagic') {
          next.metamagic = [...(next.metamagic || []), ...(val || [])]
        }
        if (choice.type === 'eldritch_invocation') {
          next.eldritchInvocations = [...(next.eldritchInvocations || []), ...(val || [])]
        }
        if (choice.type === 'epic_boon') {
          next.epicBoons = [...(next.epicBoons || []), val]
        }
      })

      next.hpBonus = (prev.hpBonus || 0) + hpGain
      return next
    })

    setLevel(newLevel)
    setView('character-sheet')
  }

  const handleLevelUpConfirm = (answers) => {
    const newLevel  = level + 1
    const clsName   = selectedClass?.name
    const levelData = CLASS_LEVEL_FEATURES[clsName]?.[newLevel]
    applyLevelUp(newLevel, levelData, answers)
  }

  if (!saveLoaded) return null

  if (view === 'race-select')
    return <RaceSelectPage onSelect={handleRaceSelect} onBack={goBack} />
  if (view === 'background-select')
    return <BackgroundSelectPage race={selectedRace} onSelect={handleBackgroundSelect} onBack={goBack} />
  if (view === 'class-select')
    return <ClassSelectPage race={selectedRace} background={selectedBackground} onSelect={handleClassSelect} onBack={goBack} />
  if (view === 'proficiency-select')
    return <ProficiencySelectPage race={selectedRace} background={selectedBackground} cls={selectedClass} onConfirm={handleProficiencyConfirm} onBack={goBack} />
  if (view === 'ability-scores')
    return <AbilityScorePage race={selectedRace} background={selectedBackground} cls={selectedClass} onConfirm={handleAbilityConfirm} onBack={goBack} />
  if (view === 'equipment-select')
    return <EquipmentSelectPage race={selectedRace} background={selectedBackground} cls={selectedClass} abilityScores={abilityScores} onConfirm={handleEquipmentConfirm} onBack={goBack} />

  if (view === 'level-up') {
    const newLevel  = level + 1
    const clsName   = selectedClass?.name
    const levelData = CLASS_LEVEL_FEATURES[clsName]?.[newLevel]
    return <LevelUpPage
      cls={selectedClass} newLevel={newLevel}
      choices={levelData?.choices || []}
      abilityScores={abilityScores}
      levelUpData={levelUpData}
      proficiencies={proficiencies}
      onConfirm={handleLevelUpConfirm}
      onBack={() => setView('character-sheet')}
    />
  }

  if (view === 'character-sheet')
    return <CharacterSheetPage
      race={selectedRace} background={selectedBackground} cls={selectedClass}
      proficiencies={proficiencies} abilityScores={abilityScores} equipment={equipment}
      charName={charName} onCharNameChange={setCharName}
      portrait={portrait} onPortraitChange={setPortrait}
      level={level} levelUpData={levelUpData}
      onLevelUp={handleLevelUp}
      onNewCharacter={handleNewCharacter}
    />

  return <WelcomePage onBegin={handleBegin} />
}
