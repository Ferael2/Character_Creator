import { useState, useEffect } from 'react'
import BackButton from './BackButton'
import './LevelUpPage.css'

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

const ABILITIES = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma']
const getMod = (s) => Math.floor((s - 10) / 2)
const fmtMod = (m) => m >= 0 ? `+${m}` : `${m}`

// ── Choice-type renderers ─────────────────────────────────────────────────────

const SUBCLASS_DESCRIPTIONS = {
  // ── Barbarian ──────────────────────────────────────────────────────────────
  'Path of the Berserker':    'A path of unrelenting rage. You can enter a Frenzy while raging, making a bonus attack each turn. Higher levels grant immunity to being charmed or frightened while raging, and you can turn failed saves against fear or charm into successes.',
  'Path of the Totem Warrior':'Bond with a spirit animal that shapes your rage. Choose Bear for resistance to all damage, Eagle to move past enemies freely, or Wolf to help allies land attacks. Later totems deepen these bonds with powerful passive boons.',
  'Path of the Wild Heart':   'Your rage channels the primal spirit of a beast. You gain a bestial spirit at 3rd level granting special movement or senses, and additional creature powers as you grow stronger. Nature itself answers your fury.',
  'Path of the World Tree':   'Draw power from the great cosmic tree Yggdrasil. Your rage lets you teleport along its roots, protect allies from harm, and ultimately travel across planes. You become a living conduit between worlds.',
  'Path of the Zealot':       'Divine power fuels your rage. You deal extra radiant or necrotic damage on your first hit each rage, can fight on past death\'s threshold, and allies can resurrect you for free. Gods themselves keep you in the fight.',

  // ── Bard ───────────────────────────────────────────────────────────────────
  'College of Dance':         'Express magic through movement. Your footwork grants you Bardic Inspiration that powers nimble dodges, and you can use your reaction to deflect attacks. At higher levels your dances inspire extraordinary feats in allies.',
  'College of Glamour':       'Wield the beguiling magic of the Feywild. You can weave Bardic Inspiration into a mantle of majesty, charm crowds, and teleport allies with whispered words. Your presence is impossible to ignore or disobey.',
  'College of Lore':          'Master secrets from every tradition. You gain three extra skill proficiencies and Cutting Words — a reaction that subtracts a Bardic Inspiration die from an enemy\'s roll. Later you steal spells from any class list.',
  'College of Valor':         'A skald who fights alongside the songs you sing. You gain medium armor, shields, and martial weapons. Extra Attack arrives at 6th level, and your Bardic Inspiration can be used to boost attack rolls or AC.',
  'College of Swords':        'Combine blade and song into fluid combat artistry. Your Bardic Inspiration fuels Blade Flourishes — bonus damage plus parrying, dashing, or knocking foes away. Extra Attack at 6th level makes you a relentless duelist.',
  'College of Whispers':      'A shadow behind every smile. You can steal a creature\'s identity after killing it, use Bardic Inspiration to deal psychic damage, and eventually learn to terrify enemies with dark whispers only they can hear.',

  // ── Cleric ─────────────────────────────────────────────────────────────────
  'Life Domain':              'The patron of healers. Your healing spells restore extra HP equal to 2 + spell level. Channel Divinity restores massive HP and extends to multiple targets. At higher levels you cast healing spells on downed allies as a bonus action.',
  'Light Domain':             'Wield radiance and holy fire. You can blind attackers with a warding flare reaction, create pillars of light with Channel Divinity, and eventually summon a sphere of searing radiance that burns enemies each turn.',
  'Trickery Domain':          'A god of mischief empowers you. Create illusions of yourself, grant invisibility, and duplicate yourself into a semi-real copy. Your Channel Divinity lets you or an ally reroll any roll — a divine second chance.',
  'War Domain':   'God of battle walks with you. War Priest grants bonus weapon attacks as a bonus action. Channel Divinity adds +10 to a single attack roll, and later you gain Extra Attack and aura-like bonuses to allies\' attacks.',
  'Knowledge Domain':         'Omniscience is your gift. You learn languages and skills from enemies, and Channel Divinity lets you become temporarily proficient in any skill or tool. Eventually you peer into minds and absorb their memories.',
  'Nature Domain':            'Nature\'s warden. You learn druid cantrips and gain Heavy Armor. Channel Divinity charms animals and plants, and later you deal extra damage to elementals and fey while resisting their attacks.',
  'Tempest Domain':           'Storm and sea obey you. Wrath of the Storm deals lightning or thunder damage as a reaction when hit. Channel Divinity maximizes thunder/lightning damage, and at higher levels you fly and call down devastating strikes.',
  'Death Domain':             'Necrotic mastery. Your necromancy spells affect extra targets, and your touch delivers devastating necrotic energy. Channel Divinity auto-fails a Constitution save, and eventually your touch can drop foes to 0 HP.',
  'Arcana Domain':            'Magic itself is your domain. You prepare Wizard spells and restore spell slots via Channel Divinity. Eventually you can dispel magical effects on allies and cast portent-like protections.',
  'Forge Domain':             'Craft and creation as divine power. You gain free magical armor, and Channel Divinity lets you imbue a weapon or armor with a +1 bonus. At 8th level your weapon attacks deal extra fire damage and your forge soul resists it.',
  'Grave Domain':             'Balance life and death. You can stabilize allies from 60 ft away, and Channel Divinity negates the next damage that would kill a creature. Your spells deal extra damage to undead while protecting the living.',
  'Order Domain':             'Enforce divine law. Channel Divinity compels a creature to obey one command without a save. Allies who cast spells can make you attack as a reaction, and later you can Dominate Person as a Channel Divinity effect.',
  'Peace Domain':             'A bond of harmony. You and chosen allies share a divine connection granting advantage on checks and saves when near each other. Channel Divinity deals psychic damage to attackers who strike your bonded allies.',

  // ── Druid ──────────────────────────────────────────────────────────────────
  'Circle of the Land':       'Tie your magic to a chosen terrain — Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp, or Underdark. You regain a spell slot on a short rest, ignore difficult terrain, and gain extra spells matching your land.',
  'Circle of the Moon':       'A shapeshifter of immense power. You can Wild Shape into CR 1 beasts at level 2 (CR scales up). Combat Wild Shape lets you transform as a bonus action and spend spell slots to heal while shifted. At 10th level you become elementals.',
  'Circle of the Sea':        'Command water and storm. While Wild Shaped you gain a swim speed, and your spells can push enemies with crashing waves. Stormy waters surround you in battle, slowing and damaging those who approach.',
  'Circle of the Stars':      'Constellations guide your power. Your Starry Form (no Wild Shape needed) grants bonus healing, radiant bolts, or concentration protection depending on the constellation chosen. Eventually you can split into twin starry forms.',
  'Circle of Wildfire':       'Destruction and renewal. You summon a Wildfire Spirit that teleports allies and burns enemies. Your fire spells deal bonus fire damage, and your spirit can revive fallen allies wrapped in revitalizing flames.',
  'Circle of Spores':         'Life through decay. You deal bonus necrotic damage with cantrips and can animate corpses as zombie-like defenders. Your Halo of Spores poisons creatures who move near you, and your Wild Shape becomes a spore-infused undead form.',

  // ── Fighter ────────────────────────────────────────────────────────────────
  'Battle Master':            'Tactical superiority through maneuvers. You learn combat techniques like Disarming Strike, Feinting Attack, and Goading Attack powered by Superiority Dice. More dice and maneuvers unlock at higher levels, making you the battlefield\'s master strategist.',
  'Champion':                 'Pure martial excellence. Your critical hit range expands to 19–20 at level 3, then 18–20 later. You gain an extra Fighting Style at 10th level and begin recovering abilities on short rests. Simple, powerful, devastatingly reliable.',
  'Eldritch Knight':          'Steel and sorcery fused. You learn Wizard spells (primarily abjuration and evocation) and can bond a weapon to summon it instantly. War Magic lets you attack after a cantrip, and Arcane Charge teleports you when you Action Surge.',
  'Arcane Archer':            'Infuse your arrows with magic. Choose two Arcane Shots (Banishing, Piercing, Seeking, etc.) that apply special effects on a hit. You regain uses on short rests and learn new shots as you level, becoming an arcane marksman.',
  'Cavalier':                 'The unbreakable guardian on horseback. You can mark a target so they cannot attack others without penalty. Unwavering Mark lets you make bonus attacks against marked foes, and Ferocious Charger knocks enemies prone on a mounted charge.',
  'Echo Knight':              'Shatter reality by summoning a duplicate from an alternate timeline. Your echo can attack in your place, let you teleport to its position, and even distract enemies. Manifest Echo transforms every turn into a flanking opportunity.',
  'Psi Warrior':              'Telekinetic discipline empowers your strikes. You create a psionic shield that absorbs damage and can hurl enemies with your mind. Extra Attack synergizes with telekinetic movement, and eventually you project a psionic bubble around allies.',
  'Rune Knight':              'Carve giant runes into your equipment. Each rune grants a passive effect and a powerful activated ability — Fire Rune for restraining, Cloud Rune for redirecting attacks, Storm Rune for advantage on Initiative. You grow to giant size at higher levels.',
  'Samurai':                  'Indomitable resolve and fighting spirit. Fighting Spirit grants you advantage on all attacks and temporary HP for a turn. Elegant Courtier adds Wisdom to Persuasion. At 15th level, dropping to 0 HP triggers a final surge of three immediate attacks.',

  // ── Monk ───────────────────────────────────────────────────────────────────
  'Way of the Astral Self':   'Project your true self as an astral form. Arms of the Astral Self replace your fists with radiant force strikes that use Wisdom, and the Visage grants darkvision and advantage on Insight/Intimidation. Eventually your full astral form emerges, towering over foes.',
  'Way of the Drunken Master':'Unpredictable, fluid combat mastery. Drunken Technique grants Disengage and bonus movement with Flurry of Blows. Tipsy Sway makes enemies miss and stumble into each other. You redirect attacks and become nearly impossible to pin down.',
  'Way of the Four Elements': 'Wield the primal forces of earth, fire, water, and air. Spend ki to cast elemental disciplines — Wall of Fire, Water Whip, Breath of Winter, and more. A versatile spellcasting path powered entirely by ki points.',
  'Way of the Kensei':        'Your chosen weapons are an extension of your soul. Kensei weapons benefit from your Martial Arts die and gain bonus damage. You can deflect ranged attacks and eventually fire magic arrows from any ranged Kensei weapon.',
  'Way of the Long Death':    'Master the border between life and death. Touch of Death steals temporary HP from creatures you kill. Hour of Reaping frightens all nearby enemies. At 17th level, Mastery of Death lets you spend 1 ki to negate death outright.',
  'Way of the Mercy':         'Heal and harm with the same hands. Hands of Healing cure HP with Flurry of Blows, while Hands of Harm deliver stunning necrotic damage. Physician\'s Touch upgrades both, and Flurries of Mercy can apply both effects in a single action.',
  'Way of the Open Hand':     'The purist martial tradition. Open Hand Technique adds knock-prone, push, or prevent-reaction effects to Flurry of Blows at no extra cost. Wholeness of Body heals you, Tranquility gives you Sanctuary aura, and Quivering Palm can instantly kill.',
  'Way of the Shadow':        'Become the darkness itself. Shadow Arts lets you cast darkness, silence, and pass without trace using ki. Shadow Step teleports between shadows as a bonus action. At 17th level you drag enemies into the Shadowfell itself.',
  'Way of the Sun Soul':      'Channel inner light into radiant power. Radiant Sun Bolt gives you a ranged ki-powered attack. Searing Arc Strike unleashes a burning hands cone. Searing Sunburst fires a nuclear-bright explosion, and Sun Shield radiates blinding light on demand.',

  // ── Paladin ────────────────────────────────────────────────────────────────
  'Oath of Devotion':         'The archetype of the holy warrior. Sacred Weapon charges your blade with holy energy; Holy Nimbus wraps you in sunlight that damages fiends and undead. Your aura protects allies from enchantment and grants advantage vs. fiends.',
  'Oath of the Ancients':     'Nature\'s paladin, preserving light and life. Nature\'s Wrath entangles enemies, and your aura grants resistance to spell damage from fiends and fey. At 20th level you transform into an avatar of nature, growing large and gaining legendary resistances.',
  'Oath of Vengeance':        'Relentless hunter of the wicked. Vow of Enmity grants advantage against a single target. Avenging Angel lets you fly and frighten. Your spells emphasize control and pursuit — Hold Person, Misty Step, Banishment.',
  'Oath of Conquest':         'Rule through fear. Conquering Presence frightens enemies in an aura; Guided Strike grants +10 to a hit. Aura of Conquest immobilizes frightened creatures near you, and at 20th level you exude an overwhelming aura of dread.',
  'Oath of Glory':            'A champion who elevates others. Inspiring Smite transfers Smite damage as temporary HP to allies. Your aura grants a bonus to Athletics and Acrobatics. Glorious Defense lets you use your Charisma modifier to add AC to an ally as a reaction.',
  'Oath of Redemption':       'Convert rather than destroy. Emissary of Peace grants advantage on Persuasion. Rebuke the Violent punishes attackers with their own damage. At 20th level Emissary of Redemption makes enemies take radiant damage for every attack they land on you.',
  'Oath of the Watchers':     'Guard the mortal realm from extraplanar threats. Channel Divinity alerts allies to hidden fiends, celestials, or aberrations, and grants advantage vs. their spells. Your aura gives allies advantage on saves against those creature types.',
  'Oathbreaker':              'Power born from betrayal. Animate Dead is free; Control Undead channels your divinity to dominate undead. Aura of Hate gives nearby undead and fiends your Charisma bonus on attacks. At 20th level you become a dread champion of darkness.',

  // ── Ranger ─────────────────────────────────────────────────────────────────
  'Beast Master':             'Form a bond with a primal beast companion. Your companion fights alongside you, acting on your turn. At higher levels it can deliver your spells, gains an extra attack, and becomes tougher as your proficiency bonus grows.',
  'Fey Wanderer':             'Touched by the Feywild\'s whimsy. Add Wisdom to Charisma checks, and deal bonus psychic damage once per turn. Misty Wanderer lets you cast Misty Step and bring allies along. Your Fey Reinforcements conjure dryads when needed.',
  'Gloom Stalker':            'Predator of the dark. In darkness you are invisible to darkvision. First-round ambushes grant a bonus attack. Umbral Sight reads invisible creatures, and Iron Mind grants proficiency in Wisdom saves. Perfect for the first strike.',
  'Hunter':                   'Adaptive predator. Choose from Colossus Slayer, Giant Killer, or Horde Breaker for extra damage. Defensive Tactics add escape or protection. At 11th level Whirlwind Attack or Volley lets you hit every creature in range simultaneously.',
  'Monster Slayer':           'Expert at taking down powerful foes. Hunter\'s Sense reveals immunities and resistances; Slayer\'s Prey marks a foe for extra damage on your first hit. Magical Ambush imposes disadvantage on saves after you Hide. Slayer\'s Counter is a free attack when a marked foe fails a save.',
  'Horizon Walker':           'Guardian of the planar boundaries. Detect Portal senses rift locations. Planar Warrior deals force damage instead of weapon damage. Ethereal Step grants a free Etherealness, and at 11th level you attack twice across planes simultaneously.',
  'Swarmkeeper':              'Command a swarming mass of spirits. Gathered Swarm deals bonus damage on hits and can move foes or yourself. Writhing Tide grants fly speed, and Swarming Dispersal lets your swarm scatter to teleport you away from danger.',

  // ── Rogue ──────────────────────────────────────────────────────────────────
  'Arcane Trickster':         'Weave illusion and enchantment into your larceny. Learn Wizard spells with a focus on misdirection. Mage Hand Legerdemain steals and plants objects invisibly. Spell Thief eventually lets you steal a spell right out of a caster\'s hands.',
  'Assassin':                 'Strike before they even know you\'re there. Assassinate grants automatic critical hits against surprised creatures and advantage against anyone who hasn\'t acted yet. Infiltration Expertise lets you perfectly assume a false identity.',
  'Phantom':                  'Straddle the line between life and death. Whispers of the Dead lets you gain random skill proficiencies from nearby corpses. Tokens of the Departed store souls in trinkets granting advantage, and Ghost Walk lets you turn spectral.',
  'Scout':                    'Master of terrain and advance raiding. Skirmisher lets you Dash as a reaction when an enemy ends its move near you. Superior Mobility adds 10 ft. to your speed, and Ambush Master grants advantage on Initiative and free advantage for allies.',
  'Soulknife':                'Slice with blades of pure psychic force. Psychic Blades materialize from nothing, deal psychic damage, and vanish after the throw. Psi-Powered Leap adds a jump boost, Psychic Veil grants invisibility, and Rend Mind stuns on a failed save.',
  'Swashbuckler':             'Dashing, death-defying melee acrobat. Fancy Footwork prevents opportunity attacks against you after every melee strike. Rakish Audacity adds Charisma to Initiative, and you can Sneak Attack a single target with no ally needed.',
  'Thief':                    'The quintessential criminal. Fast Hands adds sleight-of-hand and item use to Cunning Action. Second-Story Work adds Dexterity to jump distance and climbing speed. Supreme Sneak gives advantage on Stealth when moving slowly.',

  // ── Sorcerer ───────────────────────────────────────────────────────────────
  'Aberrant Mind':            'Tentacled psionic power flows through you. Gain telepathy and learn Psionic Spells from the Warlock list. Telepathic Speech lets you link minds at will. Warped Being makes you resistant to damage from your own spells and hard to grapple.',
  'Clockwork Soul':           'Order and precision channeled as magic. Restore Balance cancels advantage or disadvantage as a reaction. Bastion of Law absorbs damage as a magical ward using sorcery points. Trance of Order grants advantage on attacks and saves.',
  'Draconic Bloodline':       'Draconic ancestry flows in your veins. Choose a dragon type for a bonus damage cantrip and resistance to that element. Your HP increases, scales emerge granting natural armor, and at 18th level you sprout wings and fly.',
  'Divine Soul':              'A sorcerer touched by the divine. Access the full Cleric spell list in addition to your own. Favored by the Gods lets you add 2d4 to a failed save or attack. Empowered Healing enhances healing spells with rerolls, and Unearthly Recovery restores HP mid-combat.',
  'Shadow Magic':             'Born of darkness and shadow. Eyes of the Dark grant 120 ft. darkvision and cast Darkness with sorcery points. Strength of the Grave negates a killing blow once per day. Hound of Ill Omen summons a shadow mastiff that hinders a target\'s saves.',
  'Storm Sorcery':            'Thunder and lightning courses through you. Wind Speaker grants all weather-related spells. Tempestuous Magic lets you fly 10 ft. after casting a spell. Heart of the Storm deals lightning or thunder damage to nearby enemies whenever you cast those spells.',
  'Wild Magic':               'Chaos is your birthright. Every spell risks a Wild Magic Surge — roll on a table of spectacular random effects. Tides of Chaos grants advantage once per rest, and Bend Luck lets you add or subtract 1d4 from any creature\'s roll.',

  // ── Warlock ────────────────────────────────────────────────────────────────
  'The Archfey':              'Pact with a lord of the Feywild. Fey Presence charms or frightens all nearby creatures. Misty Escape lets you turn invisible and teleport when taking damage. Beguiling Defenses make you immune to charm and turn it back on the charmer.',
  'The Celestial':            'A heavenly patron grants healing power. Expanded spell list includes sacred flame and lesser restoration. Healing Light lets you heal allies using a pool of d6s. Radiant Soul adds Charisma to fire and radiant damage, and Searing Vengeance revives you from 0 HP in a burst of light.',
  'The Fiend':                'Strike a deal with the Lower Planes. Dark One\'s Blessing grants temporary HP on every kill. Dark One\'s Own Luck adds 1d10 to any check or save. Fiendish Resilience grants resistance to a chosen damage type, and Hurl Through Hell teleports a foe to the planes briefly.',
  'The Great Old One':        'An unknowable entity whispers to you. Telepathic Bond lets you silently communicate with creatures you can see. Entropic Ward gives you disadvantage on a hit against you, then advantage on your next attack. Thought Shield makes you immune to telepathic intrusion.',
  'The Hexblade':             'Bond with a sentient weapon from the Shadowfell. Hexblade\'s Curse marks a foe for bonus damage, proficiency to hit, and life-steal on kill. Hex Warrior makes one weapon use Charisma for attacks. Accursed Specter raises a slain humanoid as your spectral servant.',
  'The Undead':               'Undying power beyond death. Form of Dread transforms you, frightening enemies and preventing you from dropping to 0 HP once per turn. Grave Touched negates the need to eat or breathe and deals extra necrotic damage. Necrotic Husk makes you immune to one death per long rest.',
  'The Undying':              'A pact with a deathless immortal. Among the Dead grants undead ignore you by default. Defy Death heals you when you stabilize or succeed a death save. Undying Nature lets you stop aging, eating, and breathing, and at 10th level you resist necrotic damage.',

  // ── Wizard ─────────────────────────────────────────────────────────────────
  'School of Abjuration':     'A fortress of magical wards. Arcane Ward creates a shield using spell slots that absorbs damage before it reaches you. Projected Ward extends that protection to allies. Improved Abjuration adds your proficiency bonus to counterspell and dispel magic checks.',
  'School of Conjuration':    'Master of summoning and teleportation. Minor Conjuration creates small objects from nothing. Benign Transposition swaps your position with a summoned creature or a willing ally. Focused Conjuration makes concentration on conjuration spells impossible to break with damage.',
  'School of Divination':     'See what others cannot. Portent grants two d20 rolls each long rest that can replace any roll in the game — before or after the dice fall. Expert Divination recovers spell slots when you cast divination spells.',
  'School of Enchantment':    'Rewrite minds. Hypnotic Gaze dazes a creature within 5 ft as an action, renewing automatically each turn. Instinctive Charm redirects attacks against you to another creature. Split Enchantment applies single-target enchantment spells to two targets at once.',
  'School of Evocation':      'Raw magical power, precisely delivered. Sculpt Spells automatically protects allies inside your area-of-effect spells. Potent Cantrip lets even successful saving throws suffer half damage. Empowered Evocation adds your Intelligence modifier to the damage of every Wizard evocation spell.',
  'School of Illusion':       'Bend perception to your will. Improved Minor Illusion creates both sound and image with one casting. Malleable Illusions let you alter ongoing illusions as a bonus action. Illusory Self creates a perfect decoy that causes one attack to miss per short rest.',
  'School of Necromancy':     'Life and death are yours to command. Grim Harvest restores HP each time you kill with a spell. Undead Thralls lets you animate more undead at once, adding your proficiency bonus to their damage. Command Undead permanently dominates a sentient undead creature.',
  'School of Transmutation':  'Reshape matter and bodies. Transmutation Savant halves gold and time to copy transmutation spells. Minor Alchemy temporarily transforms materials. Transmuter\'s Stone grants a persistent bonus to a carried ally, and Shapechanger lets you cast polymorph on yourself for free.',
  'Order of Scribes':         'Magic through the written word. Your spellbook awakens as a magical familiar. Awakened Spellbook lets you swap a spell\'s damage type freely and extend concentration without a slot. Manifest Mind projects your book\'s spirit to cast touch spells at range.',
  'Bladesinging':             'Dance and magic as one art. Bladesong adds Intelligence to AC and speed, grants advantage on Acrobatics, and gives you a bonus to concentration saves. Extra Attack at 6th level, and Song of Defense absorbs damage by spending spell slots.',
  'Chronurgy Magic':          'Bend time itself. Chronal Shift lets you force a reroll on any die result twice per long rest. Temporal Awareness adds Intelligence to Initiative. Momentary Stasis freezes a creature in time, and Convergent Future guarantees a specific outcome for any roll — at the cost of exhaustion.',
  'Graviturgy Magic':         'Manipulate the forces of gravity. Adjust Density increases or decreases a creature\'s weight, granting resistance or reducing speed. Gravity Well moves creatures after every spell. Violent Attraction adds 1d10 to a weapon attack or falling damage, and Event Horizon repels creatures with massive force.',
  'War Magic':                'Efficiency and durability under fire. Arcane Deflection lets you add +2 to AC or +4 to a saving throw as a reaction — but limits you to cantrips next turn. Tactical Wit adds Intelligence to Initiative. Power Surge stores charges from dispels to add bonus damage to a spell.',
}

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
            {SUBCLASS_DESCRIPTIONS[opt] && (
              <span className="lu-option-desc">{SUBCLASS_DESCRIPTIONS[opt]}</span>
            )}
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
