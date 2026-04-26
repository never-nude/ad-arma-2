((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AdArmaScenarioMeta = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const DEFAULT_VICTORY_TYPE = 'decapitation';
  const VICTORY_TYPES = Object.freeze(['clear', 'decapitation', 'annihilation', 'points', 'keyground', 'strategic']);
  const GROUPS = Object.freeze(['tutorial', 'demo', 'grand', 'terrain', 'berserker', 'history', 'other']);
  const LESSONS = Object.freeze(['lines', 'center', 'screen', 'envelopment', 'corridor', 'river', 'terrain', 'general']);
  const DOCTRINE_PRESETS = Object.freeze({
    defensivePass: Object.freeze([
      'close_ranks', 'hold_fast', 'signal_call',
      'shield_wall', 'strengthen_center', 'refuse_flank',
      'grand_shield_wall', 'stand_or_die', 'collapse_center',
    ]),
    cavalryEnvelopment: Object.freeze([
      'spur_horses', 'quick_withdraw', 'javelin_volley',
      'cavalry_exploit', 'wing_screen', 'jaws_inward',
      'all_out_cavalry_sweep', 'commit_reserves', 'last_push',
    ]),
    riverCoordination: Object.freeze([
      'signal_call', 'covering_fire', 'quick_dress',
      'forced_march', 'strengthen_center', 'local_reserve',
      'general_assault', 'command_surge', 'reforge_line',
    ]),
    linePressure: Object.freeze([
      'close_ranks', 'spur_horses', 'hold_fast',
      'shield_wall', 'cavalry_exploit', 'drive_them_back',
      'full_line_advance', 'general_assault', 'last_push',
    ]),
  });

  function clone(value, fallback = null) {
    if (value == null) return fallback;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'scenario';
  }

  function sides(blue = 'Blue Army', red = 'Red Army', named = false) {
    return Object.freeze({ blue, red, named });
  }

  function base(title, group, lesson, description, extras = {}) {
    const sideLabels = extras.sideLabels || sides();
    return Object.freeze({
      id: extras.id || slugify(title),
      title,
      group,
      lesson,
      victoryType: extras.victoryType || DEFAULT_VICTORY_TYPE,
      terrainType: extras.terrainType || extras.terrain || '',
      description,
      historical: extras.historical || '',
      sideLabels,
      factions: extras.factions || sideLabels,
      objectives: clone(extras.objectives, []),
      checkpointTurn: extras.checkpointTurn || 8,
      pointTarget: extras.pointTarget || null,
      specialRules: clone(extras.specialRules, []),
      doctrinePreset: clone(extras.doctrinePreset, null),
      notes: extras.notes || '',
    });
  }

  const SCENARIO_METADATA_BY_NAME = Object.freeze({
    'Empty (Island)': base(
      'Empty (Island)',
      'other',
      'general',
      'Blank island board for setup, tests, and custom placement.',
      { victoryType: DEFAULT_VICTORY_TYPE, terrainType: 'open' }
    ),
    'Tutorial — Piece Walkthrough (Mirrored)': base(
      'Tutorial — Piece Walkthrough (Mirrored)',
      'tutorial',
      'general',
      'Mirrored instructional line used by the guided piece tutorial.',
      { terrainType: 'mixed', sideLabels: sides('Blue Trainees', 'Red Trainees', true) }
    ),
    'Demo A — Line Clash': base(
      'Demo A — Line Clash',
      'demo',
      'lines',
      'Small mirrored line clash for learning basic movement, missile pressure, and first contact.',
      { terrainType: 'open' }
    ),
    'Demo B — Center Push': base(
      'Demo B — Center Push',
      'demo',
      'center',
      'Compact center-pressure exercise with a cavalry wing and simple decision lanes.',
      { terrainType: 'open' }
    ),
    'Demo C — Skirmisher Screen': base(
      'Demo C — Skirmisher Screen',
      'demo',
      'screen',
      'Screening battle built around skirmish spacing, missile tempo, and flank protection.',
      { terrainType: 'open' }
    ),

    'Grand A — Even Lines (30v30, mirrored)': base(
      'Grand A — Even Lines (30v30, mirrored)',
      'grand',
      'lines',
      'Large mirrored line battle on open ground.',
      { terrainType: 'open' }
    ),
    'Grand B — Center Push (28v28, mirrored)': base(
      'Grand B — Center Push (28v28, mirrored)',
      'grand',
      'center',
      'Large mirrored battle focused on the central high ground.',
      { terrainType: 'mixed' }
    ),
    'Grand C — Double Envelopment (30v30, mirrored)': base(
      'Grand C — Double Envelopment (30v30, mirrored)',
      'grand',
      'envelopment',
      'Large mirrored battle built around wing pressure and encirclement threats.',
      { terrainType: 'open' }
    ),
    'Grand D — Massive Screen (26v26, mirrored)': base(
      'Grand D — Massive Screen (26v26, mirrored)',
      'grand',
      'screen',
      'Large mirrored battle with a heavier light-troop screen.',
      { terrainType: 'open' }
    ),
    'Grand E — River Fords (24v24, mirrored)': base(
      'Grand E — River Fords (24v24, mirrored)',
      'grand',
      'river',
      'Large mirrored fight over passable river gaps.',
      { terrainType: 'water', doctrinePreset: DOCTRINE_PRESETS.riverCoordination }
    ),
    'Grand F — Corridor Pass (22v22, mirrored)': base(
      'Grand F — Corridor Pass (22v22, mirrored)',
      'grand',
      'corridor',
      'Large mirrored fight through a constrained pass.',
      { terrainType: 'mountains' }
    ),

    'Terrain A — Ridge Line (30v30, mirrored)': base(
      'Terrain A — Ridge Line (30v30, mirrored)',
      'terrain',
      'terrain',
      'Terrain variant of Grand A with a ridge-line emphasis.',
      { terrainType: 'hills' }
    ),
    'Terrain B — Woods Belt (28v28, mirrored)': base(
      'Terrain B — Woods Belt (28v28, mirrored)',
      'terrain',
      'terrain',
      'Terrain variant of Grand B with a woods-belt emphasis.',
      { terrainType: 'woods' }
    ),
    'Terrain C — Broken Ground (30v30, mirrored)': base(
      'Terrain C — Broken Ground (30v30, mirrored)',
      'terrain',
      'terrain',
      'Terrain variant of Grand C with broken-ground pressure.',
      { terrainType: 'rough' }
    ),
    'Terrain D — Marsh Edge (26v26, mirrored)': base(
      'Terrain D — Marsh Edge (26v26, mirrored)',
      'terrain',
      'terrain',
      'Terrain variant of Grand D with marsh-edge friction.',
      { terrainType: 'mixed' }
    ),
    'Terrain E — River Fords (24v24, mirrored)': base(
      'Terrain E — River Fords (24v24, mirrored)',
      'terrain',
      'river',
      'Terrain variant of Grand E over river fords.',
      { terrainType: 'water', doctrinePreset: DOCTRINE_PRESETS.riverCoordination }
    ),
    'Terrain F — Corridor Pass (22v22, mirrored)': base(
      'Terrain F — Corridor Pass (22v22, mirrored)',
      'terrain',
      'corridor',
      'Terrain variant of Grand F through a corridor pass.',
      { terrainType: 'mountains' }
    ),
    'Terrain G — Tuderberg Ring Ambush': base(
      'Terrain G — Tuderberg Ring Ambush',
      'history',
      'terrain',
      'Column under ambush pressure in constricted terrain with danger on every shoulder.',
      {
        historical: '9 CE',
        terrainType: 'mixed',
        sideLabels: sides('Roman', 'Germanic', true),
        objectives: [
          { id: 'ambush-corridor', name: 'Ambush Corridor', value: 2, contestAdjacent: true, hexes: [{ q: 7, r: 5 }, { q: 8, r: 5 }] },
        ],
      }
    ),
    'Terrain H — Feigned Retreat In The Narrows': base(
      'Terrain H — Feigned Retreat In The Narrows',
      'terrain',
      'corridor',
      'Narrow terrain exercise for retreat baiting and congestion.',
      { terrainType: 'mixed' }
    ),
    'Terrain I — Veteran Ridge Breakthrough': base(
      'Terrain I — Veteran Ridge Breakthrough',
      'terrain',
      'terrain',
      'Ridge assault exercise built around veteran infantry pressure.',
      { terrainType: 'hills' }
    ),
    'Terrain J — Twin Fords Veteran Stand': base(
      'Terrain J — Twin Fords Veteran Stand',
      'terrain',
      'river',
      'Twin-ford exercise with veteran infantry trying to hold crossings.',
      { terrainType: 'water', doctrinePreset: DOCTRINE_PRESETS.riverCoordination }
    ),
    'Terrain K — Marathon (490 BCE)': base(
      'Terrain K — Marathon (490 BCE)',
      'history',
      'envelopment',
      'Fast closing battle over open ground with strong flanks.',
      {
        historical: '490 BCE',
        terrainType: 'open',
        checkpointTurn: 7,
        pointTarget: 22,
        sideLabels: sides('Greek', 'Persian', true),
        doctrinePreset: DOCTRINE_PRESETS.linePressure,
        objectives: [
          { id: 'center-plain', name: 'Center Plain', value: 2, contestAdjacent: true, hexes: [{ q: 6, r: 5 }, { q: 7, r: 5 }, { q: 8, r: 5 }] },
          { id: 'left-wing', name: 'West Wing Ground', value: 1, contestAdjacent: false, hexes: [{ q: 3, r: 5 }, { q: 3, r: 6 }] },
          { id: 'right-wing', name: 'East Wing Ground', value: 1, contestAdjacent: false, hexes: [{ q: 11, r: 5 }, { q: 11, r: 6 }] },
        ],
      }
    ),
    'Terrain L — Granicus River (334 BCE)': base(
      'Terrain L — Granicus River (334 BCE)',
      'history',
      'river',
      'River crossing pressure and a decisive cavalry breach.',
      {
        historical: '334 BCE',
        terrainType: 'water',
        checkpointTurn: 8,
        sideLabels: sides('Macedonian', 'Persian', true),
        doctrinePreset: DOCTRINE_PRESETS.riverCoordination,
        objectives: [
          { id: 'ford', name: 'River Ford', value: 2, contestAdjacent: true, hexes: [{ q: 7, r: 4 }, { q: 7, r: 5 }, { q: 8, r: 5 }] },
          { id: 'north-bank', name: 'North Bank', value: 1, contestAdjacent: false, hexes: [{ q: 7, r: 2 }, { q: 8, r: 2 }] },
        ],
      }
    ),
    'Terrain M — Cannae Double Envelopment (216 BCE)': base(
      'Terrain M — Cannae Double Envelopment (216 BCE)',
      'history',
      'envelopment',
      'Deep center push under risk of double envelopment.',
      {
        historical: '216 BCE',
        terrainType: 'open',
        checkpointTurn: 7,
        pointTarget: 24,
        sideLabels: sides('Roman', 'Carthaginian', true),
        doctrinePreset: DOCTRINE_PRESETS.cavalryEnvelopment,
        objectives: [
          { id: 'kill-zone', name: 'Center Kill Zone', value: 2, contestAdjacent: true, hexes: [{ q: 7, r: 5 }, { q: 8, r: 5 }, { q: 7, r: 6 }, { q: 8, r: 6 }] },
          { id: 'left-horn', name: 'Western Horn', value: 1, contestAdjacent: false, hexes: [{ q: 3, r: 5 }, { q: 2, r: 5 }] },
          { id: 'right-horn', name: 'Eastern Horn', value: 1, contestAdjacent: false, hexes: [{ q: 12, r: 5 }, { q: 13, r: 5 }] },
        ],
      }
    ),
    'Terrain N — Pharsalus Reserve Counterstroke (48 BCE)': base(
      'Terrain N — Pharsalus Reserve Counterstroke (48 BCE)',
      'history',
      'envelopment',
      'Reserve timing and cavalry wing stability decide the line.',
      {
        historical: '48 BCE',
        terrainType: 'open',
        checkpointTurn: 8,
        sideLabels: sides('Caesarian', 'Pompeian', true),
        doctrinePreset: DOCTRINE_PRESETS.linePressure,
        objectives: [
          { id: 'center-line', name: 'Center Line', value: 2, contestAdjacent: true, hexes: [{ q: 6, r: 5 }, { q: 7, r: 5 }, { q: 8, r: 5 }, { q: 9, r: 5 }] },
          { id: 'reserve-wing', name: 'Reserve Wing', value: 1, contestAdjacent: false, hexes: [{ q: 11, r: 4 }, { q: 11, r: 5 }] },
        ],
      }
    ),
    'Terrain O — Zama (202 BCE)': base(
      'Terrain O — Zama (202 BCE)',
      'history',
      'lines',
      'Open lanes for maneuver and a late cavalry decision.',
      {
        historical: '202 BCE',
        terrainType: 'open',
        sideLabels: sides('Roman', 'Carthaginian', true),
        doctrinePreset: DOCTRINE_PRESETS.cavalryEnvelopment,
        objectives: [
          { id: 'main-lanes', name: 'Battle Lanes', value: 2, contestAdjacent: true, hexes: [{ q: 6, r: 5 }, { q: 7, r: 5 }, { q: 8, r: 5 }] },
        ],
      }
    ),
    'Terrain P — Ilipa Reverse Deployment (206 BCE)': base(
      'Terrain P — Ilipa Reverse Deployment (206 BCE)',
      'history',
      'envelopment',
      'Reverse deployment and wing timing over broken approach terrain.',
      {
        historical: '206 BCE',
        terrainType: 'mixed',
        sideLabels: sides('Roman', 'Carthaginian', true),
        doctrinePreset: DOCTRINE_PRESETS.cavalryEnvelopment,
        objectives: [
          { id: 'center-open', name: 'Open Center', value: 2, contestAdjacent: true, hexes: [{ q: 7, r: 5 }, { q: 8, r: 5 }] },
        ],
      }
    ),
    'Terrain Q — Carhae (Carrhae, 53 BCE)': base(
      'Terrain Q — Carhae (Carrhae, 53 BCE)',
      'history',
      'screen',
      'Missile pressure and mobility over exposed terrain.',
      {
        historical: '53 BCE',
        terrainType: 'open',
        sideLabels: sides('Roman', 'Parthian', true),
        objectives: [
          { id: 'exposed-center', name: 'Exposed Center', value: 2, contestAdjacent: true, hexes: [{ q: 7, r: 5 }, { q: 8, r: 5 }] },
        ],
      }
    ),
    'Terrain R — Thapsus Coastal Pressure (46 BCE)': base(
      'Terrain R — Thapsus Coastal Pressure (46 BCE)',
      'history',
      'terrain',
      'Coastal pressure and rough-ground friction on the center push.',
      {
        historical: '46 BCE',
        terrainType: 'mixed',
        sideLabels: sides('Caesarian', 'Optimates', true),
        doctrinePreset: DOCTRINE_PRESETS.linePressure,
        objectives: [
          { id: 'coast-road', name: 'Coastal Road', value: 1, contestAdjacent: true, hexes: [{ q: 12, r: 5 }, { q: 13, r: 5 }] },
          { id: 'center-rough', name: 'Rough Center', value: 2, contestAdjacent: false, hexes: [{ q: 7, r: 5 }, { q: 8, r: 5 }] },
        ],
      }
    ),
    'Terrain S — Philippi Twin Camps (42 BCE)': base(
      'Terrain S — Philippi Twin Camps (42 BCE)',
      'history',
      'terrain',
      'Twin camps and contested approaches split the battle line.',
      {
        historical: '42 BCE',
        terrainType: 'mixed',
        sideLabels: sides('Triumvir', 'Liberator', true),
        doctrinePreset: DOCTRINE_PRESETS.linePressure,
        objectives: [
          { id: 'west-camp', name: 'West Camp', value: 1, contestAdjacent: false, hexes: [{ q: 3, r: 8 }, { q: 3, r: 9 }] },
          { id: 'east-camp', name: 'East Camp', value: 1, contestAdjacent: false, hexes: [{ q: 12, r: 3 }, { q: 12, r: 2 }] },
          { id: 'marsh-line', name: 'Marsh Crossing', value: 2, contestAdjacent: true, hexes: [{ q: 7, r: 5 }, { q: 8, r: 5 }] },
        ],
      }
    ),
    'Terrain T — Twin Tree-Line Crossfire (Archer Test)': base(
      'Terrain T — Twin Tree-Line Crossfire (Archer Test)',
      'terrain',
      'screen',
      'Tree-line exercise for testing archer lanes and crossfire pressure.',
      { terrainType: 'woods' }
    ),

    'Berserker A — Wedge vs Shieldwall (26v26)': base(
      'Berserker A — Wedge vs Shieldwall (26v26)',
      'berserker',
      'envelopment',
      'Asymmetric wedge assault against a shieldwall shape.',
      { terrainType: 'open' }
    ),
    'Berserker B — Crescent vs Columns (28v28)': base(
      'Berserker B — Crescent vs Columns (28v28)',
      'berserker',
      'envelopment',
      'Asymmetric crescent pressure against column formations.',
      { terrainType: 'open' }
    ),
    'Berserker C — Checkerboard vs Line (26v26)': base(
      'Berserker C — Checkerboard vs Line (26v26)',
      'berserker',
      'lines',
      'Asymmetric checkerboard deployment against a line.',
      { terrainType: 'open' }
    ),
    'Berserker D — Refused Flank vs Wide Wings (28v28)': base(
      'Berserker D — Refused Flank vs Wide Wings (28v28)',
      'berserker',
      'envelopment',
      'Asymmetric refused flank against wide wing pressure.',
      { terrainType: 'open' }
    ),

    'History A — Thermopylae Hot Gates (480 BCE)': base(
      'History A — Thermopylae Hot Gates (480 BCE)',
      'history',
      'corridor',
      'Narrow pass defense between sea edge and impassable heights.',
      {
        historical: '480 BCE',
        terrainType: 'mountains',
        checkpointTurn: 6,
        sideLabels: sides('Greek', 'Persian', true),
        doctrinePreset: DOCTRINE_PRESETS.defensivePass,
        objectives: [
          { id: 'hot-gate-pass', name: 'Hot Gates Pass', value: 3, contestAdjacent: true, hexes: [{ q: 7, r: 5 }, { q: 8, r: 5 }] },
        ],
      }
    ),
  });

  function normalizeGroup(group) {
    return GROUPS.includes(group) ? group : 'other';
  }

  function normalizeLesson(lesson) {
    return LESSONS.includes(lesson) ? lesson : 'general';
  }

  function normalizeVictoryType(victoryType) {
    return VICTORY_TYPES.includes(victoryType) ? victoryType : DEFAULT_VICTORY_TYPE;
  }

  function normalizeSideLabels(raw) {
    const labels = raw && typeof raw === 'object' ? raw : sides();
    return {
      blue: String(labels.blue || 'Blue Army'),
      red: String(labels.red || 'Red Army'),
      named: !!labels.named,
    };
  }

  function firstDefined(...values) {
    return values.find((value) => value !== undefined && value !== null);
  }

  function mergeScenarioMetadata(name, explicitMeta = null) {
    const explicit = (explicitMeta && typeof explicitMeta === 'object') ? explicitMeta : {};
    const byName = SCENARIO_METADATA_BY_NAME[name] || {};
    const title = String(firstDefined(explicit.title, byName.title, name) || name || 'Scenario');
    const sideLabels = normalizeSideLabels(firstDefined(explicit.sideLabels, explicit.factions, byName.sideLabels, byName.factions));
    const objectives = Array.isArray(explicit.objectives)
      ? explicit.objectives
      : (Array.isArray(byName.objectives) ? byName.objectives : []);
    const specialRules = Array.isArray(explicit.specialRules)
      ? explicit.specialRules
      : (Array.isArray(byName.specialRules) ? byName.specialRules : []);
    const doctrinePreset = firstDefined(explicit.doctrinePreset, byName.doctrinePreset, null);

    return {
      id: String(firstDefined(explicit.id, byName.id, slugify(title))),
      title,
      group: normalizeGroup(firstDefined(explicit.group, byName.group, 'other')),
      lesson: normalizeLesson(firstDefined(explicit.lesson, byName.lesson, 'general')),
      victoryType: normalizeVictoryType(firstDefined(explicit.victoryType, byName.victoryType, DEFAULT_VICTORY_TYPE)),
      terrainType: firstDefined(explicit.terrainType, explicit.terrain, byName.terrainType, byName.terrain, ''),
      description: String(firstDefined(explicit.description, byName.description, '')),
      historical: String(firstDefined(explicit.historical, byName.historical, '')),
      sideLabels,
      factions: clone(firstDefined(explicit.factions, byName.factions, sideLabels), sideLabels),
      objectives: clone(objectives, []),
      checkpointTurn: Number.isFinite(Number(firstDefined(explicit.checkpointTurn, byName.checkpointTurn)))
        ? Math.max(1, Math.trunc(Number(firstDefined(explicit.checkpointTurn, byName.checkpointTurn))))
        : 8,
      pointTarget: Number.isFinite(Number(firstDefined(explicit.pointTarget, byName.pointTarget)))
        ? Math.max(1, Math.trunc(Number(firstDefined(explicit.pointTarget, byName.pointTarget))))
        : null,
      specialRules: clone(specialRules, []),
      doctrinePreset: clone(doctrinePreset, null),
      notes: String(firstDefined(explicit.notes, byName.notes, '')),
    };
  }

  function resolveScenarioMetadata(name, explicitMeta = null) {
    return mergeScenarioMetadata(name, explicitMeta);
  }

  function normalizeScenarioRecord(name, record = {}) {
    const meta = mergeScenarioMetadata(name, record && record.meta);
    const recordObjectives = Array.isArray(record?.objectives) ? record.objectives : [];
    return {
      ...meta,
      objectives: clone(recordObjectives.length ? recordObjectives : meta.objectives, []),
      startingUnits: clone(Array.isArray(record?.units) ? record.units : [], []),
      terrain: clone(Array.isArray(record?.terrain) ? record.terrain : [], []),
      specialRules: clone(meta.specialRules, []),
      doctrinePreset: clone(meta.doctrinePreset, null),
    };
  }

  function validateScenarioMetadata(meta) {
    if (!meta || typeof meta !== 'object') return false;
    if (!meta.id || !meta.title) return false;
    if (!GROUPS.includes(meta.group)) return false;
    if (!LESSONS.includes(meta.lesson)) return false;
    if (!VICTORY_TYPES.includes(meta.victoryType)) return false;
    if (!meta.factions || !meta.factions.blue || !meta.factions.red) return false;
    if (!Array.isArray(meta.objectives)) return false;
    if (!Array.isArray(meta.specialRules)) return false;
    if (meta.doctrinePreset != null && !Array.isArray(meta.doctrinePreset) && typeof meta.doctrinePreset !== 'object') return false;
    if (meta.startingUnits != null && !Array.isArray(meta.startingUnits)) return false;
    for (const obj of meta.objectives) {
      if (!obj || !obj.id || !obj.name || !Array.isArray(obj.hexes)) return false;
    }
    return true;
  }

  return {
    DEFAULT_VICTORY_TYPE,
    VICTORY_TYPES,
    GROUPS,
    LESSONS,
    DOCTRINE_PRESETS,
    SCENARIO_METADATA_BY_NAME,
    resolveScenarioMetadata,
    normalizeScenarioRecord,
    validateScenarioMetadata,
  };
});
