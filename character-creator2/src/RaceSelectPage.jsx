import { useState, useEffect, useCallback } from 'react'
import BackButton from './BackButton'
import './RaceSelectPage.css'
import { useLanguage } from './LanguageContext'
import T from './translations'
import humanImage from '../src/assets/Human.png';
import elfImage from '../src/assets/Elf.png';
import dwarfImage from '../src/assets/Dwarf.png';
import halflingImage from '../src/assets/Halfling.png';
import dragonbornImage from '../src/assets/Dragonborn.png';
import tieflingImage from '../src/assets/Tiefling.png';
import gnomeImage from '../src/assets/Gnome.png';
import orcImage from '../src/assets/Orc.png';

const RACES = [
  {
    name: 'Human',
    icon: '👤',
    image: humanImage,
    en: {
      description: 'Versatile and ambitious, humans are the most widespread race in the realm — driven by boundless potential and an unyielding will to shape the world.',
      traits: [
        { name: 'Resourceful', description: 'You gain Heroic Inspiration whenever you finish a Long Rest.' },
        { name: 'Skillful', description: 'You gain proficiency in one skill of your choice.' },
        { name: 'Versatile', description: 'You gain an Origin feat of your choice.' },
      ],
    },
    es: {
      description: 'Versátiles y ambiciosos, los humanos son la raza más extendida del reino — impulsados por un potencial ilimitado y una voluntad inquebrantable de moldear el mundo.',
      traits: [
        { name: 'Ingenioso', description: 'Ganas Inspiración Heroica cada vez que terminas un Descanso Largo.' },
        { name: 'Hábil', description: 'Ganas competencia en una habilidad de tu elección.' },
        { name: 'Versátil', description: 'Ganas una dote de Origen de tu elección.' },
      ],
    },
  },
  {
    name: 'Elf',
    icon: '🌿',
    image: elfImage,
    en: {
      description: 'Graceful and ancient, elves walk the land with centuries of wisdom. Their keen senses and arcane affinity make them formidable in forest and tower alike.',
      traits: [
        { name: 'Darkvision', description: 'You have Darkvision with a range of 60 feet.' },
        { name: 'Elven Lineage', description: 'You are part of a lineage that grants you supernatural abilities. Choose a lineage: Drow, High Elf, or Wood Elf, each granting unique spells and bonuses.' },
        { name: 'Fey Ancestry', description: 'You have Advantage on saving throws you make to avoid or end the Charmed condition.' },
        { name: 'Keen Senses', description: 'You have proficiency in the Insight, Perception, or Survival skill.' },
        { name: 'Trance', description: 'You don\'t need to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation.' },
      ],
    },
    es: {
      description: 'Gráciles y ancestrales, los elfos recorren la tierra con siglos de sabiduría. Sus agudos sentidos y afinidad arcana los hacen formidables tanto en el bosque como en la torre.',
      traits: [
        { name: 'Visión en la Oscuridad', description: 'Tienes Visión en la Oscuridad con un alcance de 18 metros.' },
        { name: 'Linaje Élfico', description: 'Formas parte de un linaje que te otorga habilidades sobrenaturales. Elige: Drow, Elfo del Bosque o Alto Elfo, cada uno con conjuros y bonificaciones únicos.' },
        { name: 'Ascendencia Feérica', description: 'Tienes Ventaja en las tiradas de salvación para evitar o poner fin a la condición Encantado.' },
        { name: 'Sentidos Agudos', description: 'Tienes competencia en la habilidad Perspicacia, Percepción o Supervivencia.' },
        { name: 'Trance', description: 'No necesitas dormir. Puedes completar un Descanso Largo en 4 horas si las pasas en meditación.' },
      ],
    },
  },
  {
    name: 'Dwarf',
    icon: '⛏️',
    image: dwarfImage,
    en: {
      description: 'Stout and unyielding as the mountains they call home, dwarves possess unmatched endurance, a fierce loyalty to kin, and mastery of stone and steel.',
      traits: [
        { name: 'Darkvision', description: 'You have Darkvision with a range of 120 feet.' },
        { name: 'Dwarven Resilience', description: 'You have Advantage on saving throws you make to avoid or end the Poisoned condition. You also have Resistance to Poison damage.' },
        { name: 'Dwarven Toughness', description: 'Your hit point maximum increases by 1, and it increases by 1 again whenever you gain a level.' },
        { name: 'Stonecunning', description: 'As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching one to use this trait. Usable a number of times equal to your Proficiency Bonus per Long Rest.' },
      ],
    },
    es: {
      description: 'Corpulentos e inquebrantables como las montañas que llaman hogar, los enanos poseen una resistencia incomparable, una feroz lealtad al clan y maestría en piedra y acero.',
      traits: [
        { name: 'Visión en la Oscuridad', description: 'Tienes Visión en la Oscuridad con un alcance de 36 metros.' },
        { name: 'Resiliencia Enana', description: 'Tienes Ventaja en las tiradas de salvación para evitar o poner fin a la condición Envenenado. También tienes Resistencia al daño por veneno.' },
        { name: 'Robustez Enana', description: 'Tu máximo de puntos de golpe aumenta en 1, y vuelve a aumentar en 1 cada vez que ganas un nivel.' },
        { name: 'Astucia Pétrea', description: 'Como Acción Adicional, obtienes Sentido de Vibración con alcance de 18 metros durante 10 minutos. Debes estar sobre una superficie de piedra o tocarla.' },
      ],
    },
  },
  {
    name: 'Halfling',
    icon: '🍀',
    image: halflingImage,
    en: {
      description: 'Small in stature but enormous in luck and cheer, halflings slip through danger with uncanny fortune and a warm heart that disarms even the coldest foe.',
      traits: [
        { name: 'Brave', description: 'You have Advantage on saving throws you make to avoid or end the Frightened condition.' },
        { name: 'Halfling Nimbleness', description: 'You can move through the space of any creature that is a size larger than you, but you can\'t stop in the same space.' },
        { name: 'Luck', description: 'When you roll a 1 on the d20 for a d20 Test, you can reroll the die, and you must use the new roll.' },
        { name: 'Naturally Stealthy', description: 'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.' },
      ],
    },
    es: {
      description: 'Pequeños de estatura pero enormes en suerte y alegría, los medianos esquivan el peligro con una fortuna extraña y un corazón cálido que desarma al enemigo más frío.',
      traits: [
        { name: 'Valiente', description: 'Tienes Ventaja en las tiradas de salvación para evitar o poner fin a la condición Asustado.' },
        { name: 'Agilidad Mediana', description: 'Puedes moverte por el espacio de cualquier criatura de mayor tamaño que tú, pero no puedes detenerte en el mismo espacio.' },
        { name: 'Suerte', description: 'Cuando sacas un 1 en el d20 para una Prueba d20, puedes volver a tirar el dado y debes usar el nuevo resultado.' },
        { name: 'Sigilo Natural', description: 'Puedes realizar la acción Esconderse incluso cuando solo estás oculto por una criatura de tamaño mayor que tú.' },
      ],
    },
  },
  {
    name: 'Dragonborn',
    icon: '🐉',
    image: dragonbornImage,
    en: {
      description: 'Born of draconic blood, Dragonborn carry the proud legacy of dragons in every scale. Their breath weapon and fierce honour make them legendary warriors.',
      traits: [
        { name: 'Breath Weapon', description: 'When you take the Attack action, you can replace one of your attacks with an exhalation of destructive energy. The area, damage type, and saving throw DC are determined by your Draconic Ancestry.' },
        { name: 'Draconic Ancestry', description: 'Choose a type of dragon as your ancestor, determining your Breath Weapon\'s damage type, the area it covers, and your damage resistance.' },
        { name: 'Damage Resistance', description: 'You have Resistance to the damage type associated with your Draconic Ancestry.' },
        { name: 'Darkvision', description: 'You have Darkvision with a range of 60 feet.' },
        { name: 'Draconic Flight', description: 'Starting at level 5, you can use a Bonus Action to give yourself a Fly Speed equal to your Speed for 10 minutes. Usable once per Long Rest.' },
      ],
    },
    es: {
      description: 'Nacidos de sangre dracónica, los Dracónidos llevan el orgulloso legado de los dragones en cada escama. Su arma de aliento y su feroz honor los convierten en guerreros legendarios.',
      traits: [
        { name: 'Arma de Aliento', description: 'Cuando realizas la acción Atacar, puedes reemplazar uno de tus ataques con una exhalación de energía destructiva. El área, tipo de daño y CD están determinados por tu Ascendencia Dracónica.' },
        { name: 'Ascendencia Dracónica', description: 'Elige un tipo de dragón como ancestro, lo que determina el tipo de daño de tu Arma de Aliento, el área que cubre y tu resistencia al daño.' },
        { name: 'Resistencia al Daño', description: 'Tienes Resistencia al tipo de daño asociado con tu Ascendencia Dracónica.' },
        { name: 'Visión en la Oscuridad', description: 'Tienes Visión en la Oscuridad con un alcance de 18 metros.' },
        { name: 'Vuelo Dracónico', description: 'A partir del nivel 5, puedes usar una Acción Adicional para darte una Velocidad de Vuelo igual a tu Velocidad durante 10 minutos. Utilizable una vez por Descanso Largo.' },
      ],
    },
  },
  {
    name: 'Tiefling',
    icon: '😈',
    image: tieflingImage,
    en: {
      description: 'Touched by infernal heritage, tieflings bear horns and a burning gaze that unnerves the fearful. Yet their inner resolve can forge a destiny entirely their own.',
      traits: [
        { name: 'Darkvision', description: 'You have Darkvision with a range of 60 feet.' },
        { name: 'Fiendish Legacy', description: 'Choose one of three legacies — Abyssal, Chthonic, or Infernal — each granting you a different set of spells and a damage resistance.' },
        { name: 'Otherworldly Presence', description: 'You know the Thaumaturgy cantrip. Charisma is your spellcasting ability for it.' },
      ],
    },
    es: {
      description: 'Tocados por un linaje infernal, los tieflings portan cuernos y una mirada ardiente que inquieta a los temerosos. Sin embargo, su resolución interior puede forjar un destino completamente propio.',
      traits: [
        { name: 'Visión en la Oscuridad', description: 'Tienes Visión en la Oscuridad con un alcance de 18 metros.' },
        { name: 'Legado Infernal', description: 'Elige uno de tres legados — Abisal, Ctónico o Infernal — cada uno otorgándote un conjunto diferente de conjuros y una resistencia al daño.' },
        { name: 'Presencia Sobrenatural', description: 'Conoces el truco Taumaturgia. El Carisma es tu característica de lanzamiento para él.' },
      ],
    },
  },
  {
    name: 'Gnome',
    icon: '⚙️',
    image: gnomeImage,
    en: {
      description: 'Brimming with curiosity and invention, gnomes see the world as an endless puzzle to solve. Their cleverness and illusion magic make them unpredictable allies.',
      traits: [
        { name: 'Darkvision', description: 'You have Darkvision with a range of 60 feet.' },
        { name: 'Gnomish Lineage', description: 'Choose a lineage: Forest Gnome (know Minor Illusion, can communicate with Small or smaller beasts) or Rock Gnome (know Mending and Prestidigitation, can craft a clockwork device).' },
        { name: 'Gnomish Cunning', description: 'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.' },
      ],
    },
    es: {
      description: 'Rebosantes de curiosidad e inventiva, los gnomos ven el mundo como un rompecabezas interminable. Su inteligencia y magia de ilusión los convierten en aliados impredecibles.',
      traits: [
        { name: 'Visión en la Oscuridad', description: 'Tienes Visión en la Oscuridad con un alcance de 18 metros.' },
        { name: 'Linaje Gnómico', description: 'Elige un linaje: Gnomo del Bosque (conoces Ilusión Menor, puedes comunicarte con bestias Pequeñas o menores) o Gnomo de Roca (conoces Remendar y Prestidigitación, puedes fabricar un mecanismo de relojería).' },
        { name: 'Astucia Gnómica', description: 'Tienes Ventaja en las tiradas de salvación de Inteligencia, Sabiduría y Carisma.' },
      ],
    },
  },
  {
    name: 'Half-Orc',
    icon: '🗡️',
    image: orcImage,
    en: {
      description: 'Forged between two worlds, half-orcs channel raw orcish fury through a sharpened human mind. Few can match their ferocity or their stubborn refusal to fall.',
      traits: [
        { name: 'Adrenaline Rush', description: 'You can take the Dash action as a Bonus Action. When you do, you gain a number of Temporary Hit Points equal to your Proficiency Bonus. Usable a number of times equal to your Proficiency Bonus per Long Rest.' },
        { name: 'Darkvision', description: 'You have Darkvision with a range of 60 feet.' },
        { name: 'Relentless Endurance', description: 'When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can\'t do so again until you finish a Long Rest.' },
      ],
    },
    es: {
      description: 'Forjados entre dos mundos, los semiorcos canalizan la furia orca salvaje a través de una mente humana afilada. Pocos pueden igualar su ferocidad o su obstinada negativa a caer.',
      traits: [
        { name: 'Descarga de Adrenalina', description: 'Puedes realizar la acción Correr como Acción Adicional. Al hacerlo, ganas Puntos de Golpe Temporales iguales a tu Bonificador de Competencia. Utilizable tantas veces como tu Bonificador de Competencia por Descanso Largo.' },
        { name: 'Visión en la Oscuridad', description: 'Tienes Visión en la Oscuridad con un alcance de 18 metros.' },
        { name: 'Resistencia Implacable', description: 'Cuando te reducen a 0 Puntos de Golpe sin matarte, puedes caer a 1 Punto de Golpe en su lugar. Una vez que usas este rasgo, no puedes volver a hacerlo hasta terminar un Descanso Largo.' },
      ],
    },
  },
]

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

export default function RaceSelectPage({ onSelect, onBack }) {
  const { lang } = useLanguage()
  const t = T[lang]
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
          ? (prev + 1) % RACES.length
          : (prev - 1 + RACES.length) % RACES.length
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
    const race = RACES[current]
    setChosen(race.name)
    setTimeout(() => { if (onSelect) onSelect(race) }, 650)
  }

  const race = RACES[current]
  const raceData = race[lang] || race.en

  return (
    <div className={`race-root ${visible ? 'visible' : ''}`}>
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

      <main className="race-main">

        <header className="race-header">
          <p className="eyebrow">{t.race_eyebrow}</p>
          <h1 className="race-title">{t.race_title} <span className="accent">{t.race_titleAccent}</span></h1>
          <p className="race-subtitle">{t.race_subtitle}</p>
        </header>

        <div className="carousel-wrap">

          <button className="nav-arrow left" onClick={() => navigate('left')} aria-label={t.race_prevLabel}>
            <span className="arrow-inner">&#10094;</span>
          </button>

          <div className="card-stage" aria-live="polite" aria-atomic="true">
            <div
              className={`race-card ${animating ? `exit-${direction}` : 'enter'} ${chosen === race.name ? 'chosen' : ''}`}
              key={race.name}
            >
              <div className="card-body">

                {/* Left — image panel */}
                <div className="card-image-panel">
                  <img src={race.image} alt={race.name} className="card-image" />
                  <div className="card-image-overlay" aria-hidden="true" />
                  <div className="image-panel-footer">
                    <span className="card-counter">{current + 1} / {RACES.length}</span>
                  </div>
                </div>

                {/* Right — info panel */}
                <div className="card-info-panel">

                  <div className="card-head">
                    <div className="card-head-top">
                      <div className="card-title-row">
                        <span className="card-race-icon">{race.icon}</span>
                        <h2 className="card-title">{race.name}</h2>
                      </div>
                      <div className="card-head-runes" aria-hidden="true">
                        <span>ᛟ</span><span>ᚱ</span><span>ᚷ</span>
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
                    {[t.race_tabDesc, t.race_tabTraits].map((tab, i) => (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === i}
                        className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                        onClick={() => setActiveTab(i)}
                      >{tab}</button>
                    ))}
                  </div>

                  <div className="tab-panel" role="tabpanel">

                    {activeTab === 0 && (
                      <div className="panel-content">
                        <p className="race-description">{raceData.description}</p>
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div className="panel-content traits-list">
                        {raceData.traits.map(tr => (
                          <div key={tr.name} className="trait-block">
                            <div className="trait-header">
                              <span className="trait-dot">◈</span>
                              <span className="trait-name">{tr.name}</span>
                            </div>
                            <p className="trait-desc">{tr.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  <div className="card-foot">
                    <div className="card-divider">
                      <span className="divider-line" />
                      <span className="divider-diamond">◆</span>
                      <span className="divider-line" />
                    </div>
                    <button
                      className={`choose-btn ${chosen === race.name ? 'chosen' : ''}`}
                      onClick={handleChoose}
                      aria-label={`${t.race_chooseBtn} ${race.name}`}
                    >
                      <span className="choose-btn-inner">
                        <span className="choose-icon" aria-hidden="true">⬡</span>
                        {t.race_chooseBtn} {race.name}
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <button className="nav-arrow right" onClick={() => navigate('right')} aria-label={t.race_nextLabel}>
            <span className="arrow-inner">&#10095;</span>
          </button>
        </div>

        <nav className="race-index" aria-label="Race index">
          {RACES.map((r, i) => (
            <button
              key={r.name}
              className={`index-pip ${i === current ? 'active' : ''}`}
              onClick={() => jumpTo(i)}
              aria-label={r.name}
              title={r.name}
            >
              <span className="pip-icon">{r.icon}</span>
              <span className="pip-name">{r.name}</span>
            </button>
          ))}
        </nav>

      </main>
    </div>
  )
}
