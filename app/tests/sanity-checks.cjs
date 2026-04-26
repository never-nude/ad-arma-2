const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const doctrineUtils = require('../rules/doctrine-utils.js');
const doctrineOrders = require('../data/doctrine-orders.js');
const doctrineEffects = require('../rules/doctrine-effects.js');
const objectives = require('../rules/objectives.js');
const scenarioMeta = require('../data/scenario-meta.js');
const combatDice = require('../rules/combat-dice.js');
const iconHelper = require('../ui/icons.js');

const repoRoot = path.resolve(__dirname, '../..');
const readRepoFile = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

const commandById = new Map([
  ['c1a', { tier: 1, actionSpend: 1 }],
  ['c1b', { tier: 1, actionSpend: 1 }],
  ['c1c', { tier: 1, actionSpend: 1 }],
  ['c2a', { tier: 2, actionSpend: 2 }],
  ['c2b', { tier: 2, actionSpend: 2 }],
  ['c2c', { tier: 2, actionSpend: 2 }],
  ['c3a', { tier: 3, actionSpend: 3 }],
  ['c3b', { tier: 3, actionSpend: 3 }],
  ['c3c', { tier: 3, actionSpend: 3 }],
]);

assert.equal(doctrineUtils.commandActionSpend({ cost: 3, persistence: 'spent' }), 3);
assert.equal(doctrineUtils.commandActionSpend({ tier: 3, actionSpend: 2 }), 2);
assert.equal(doctrineUtils.commandTier({ tier: 2, cost: 3 }), 2);
assert.equal(
  doctrineUtils.validateDoctrineLoadout(
    ['c1a', 'c1b', 'c1c', 'c2a', 'c2b', 'c2c', 'c3a', 'c3b', 'c3c'],
    { commandById }
  ),
  true
);

assert.equal(doctrineOrders.validateDoctrineOrders(), true);
assert.equal(doctrineOrders.DOCTRINE_ORDERS.length, 30);
assert.equal(doctrineOrders.DOCTRINE_ORDERS.every((cmd) => cmd.timing === 'startOfTurn'), true);
assert.equal(doctrineOrders.DOCTRINE_ORDERS.every((cmd) => Number.isFinite(cmd.tier) && Number.isFinite(cmd.actionSpend)), true);
assert.equal(doctrineOrders.DOCTRINE_ORDERS.every((cmd) => cmd.actionSpend === cmd.tier), true);
assert.equal(doctrineOrders.DOCTRINE_ORDERS.every((cmd) => cmd.reusable !== cmd.singleUse), true);
assert.equal(doctrineOrders.DOCTRINE_ORDERS.every((cmd) => cmd.consumeOnUse === cmd.singleUse), true);
assert.equal(doctrineOrders.DOCTRINE_ORDERS.every((cmd) => cmd.target && cmd.target.summary), true);
assert.equal(doctrineOrders.COMMAND_TARGET_LIMITS.quick_dress.max, 3);
const realCommandById = new Map(doctrineOrders.DOCTRINE_ORDERS.map((cmd) => [cmd.id, cmd]));

const marathon = scenarioMeta.resolveScenarioMetadata('Terrain K — Marathon (490 BCE)');
assert.equal(marathon.group, 'history');
assert.equal(marathon.lesson, 'envelopment');
assert.equal(marathon.victoryType, 'decapitation');
assert.equal(marathon.objectives.length, 3);
assert.equal(marathon.sideLabels.blue, 'Greek');
const fallbackName = ['legacy', 'Fallback', 'Scenario', 'Meta'].join('');
assert.equal(fallbackName in scenarioMeta, false);
const fakeMarathon = scenarioMeta.resolveScenarioMetadata('Made Up Marathon Clone');
assert.equal(fakeMarathon.group, 'other');
assert.equal(fakeMarathon.sideLabels.blue, 'Blue Army');
assert.equal(fakeMarathon.objectives.length, 0);
assert.equal(fakeMarathon.doctrinePreset, null);
const riverPreset = scenarioMeta.resolveScenarioMetadata('Grand E — River Fords (24v24, mirrored)').doctrinePreset;
assert.equal(doctrineUtils.validateDoctrineLoadout(riverPreset, { commandById: realCommandById }), true);
const normalizedScenario = scenarioMeta.normalizeScenarioRecord('Custom Drill', {
  units: [{ q: 1, r: 1, side: 'blue', type: 'inf', quality: 'regular' }],
  objectives: [{ id: 'hill', name: 'Hill', value: 1, hexes: [{ q: 1, r: 1 }] }],
  meta: {
    id: 'custom-drill',
    title: 'Custom Drill',
    group: 'demo',
    lesson: 'terrain',
    victoryType: 'keyground',
    factions: { blue: 'Blue', red: 'Red', named: false },
  },
});
assert.equal(normalizedScenario.id, 'custom-drill');
assert.equal(normalizedScenario.victoryType, 'keyground');
assert.equal(normalizedScenario.startingUnits.length, 1);
assert.equal(normalizedScenario.objectives.length, 1);
assert.equal(scenarioMeta.validateScenarioMetadata(normalizedScenario), true);
for (const [title, meta] of Object.entries(scenarioMeta.SCENARIO_METADATA_BY_NAME)) {
  assert.equal(scenarioMeta.validateScenarioMetadata(scenarioMeta.resolveScenarioMetadata(title, meta)), true);
}
for (const preset of Object.values(scenarioMeta.DOCTRINE_PRESETS)) {
  assert.equal(doctrineUtils.validateDoctrineLoadout(preset, { commandById: realCommandById }), true);
}

const effects = doctrineEffects.createDoctrineEffectState();
effects.reserveReleaseUnitIds[7] = true;
effects.bonusAttackDice[7] = 1;
const effectSummary = doctrineEffects.activeDoctrineEffectsForUnit(
  effects,
  [{ map: 'bonusMove', unitId: 7, value: 1, side: 'blue' }],
  7,
  'blue'
);
assert.equal(effectSummary.hasAny, true);
assert.equal(effectSummary.hasPersistent, true);
assert.equal(effectSummary.reserveReleased, true);

const zones = objectives.normalizeScenarioObjectives([
  { id: 'center', name: 'Center', value: 2, contestAdjacent: true, hexes: [{ q: 1, r: 1 }] },
]);
const unitMap = new Map([
  ['1,1', { side: 'blue' }],
  ['1,2', { side: 'red' }],
]);
const neighbors = { '1,1': ['1,2'] };
const objectiveState = objectives.evaluateObjectiveControlState(zones, {
  unitAtHex: (hk) => unitMap.get(hk) || null,
  neighborHexesForKey: (hk) => neighbors[hk] || [],
});
assert.equal(objectiveState.blueValue, 0);
assert.equal(objectiveState.redValue, 0);
assert.equal(objectiveState.contested, 1);

const rootHtml = readRepoFile('index.html');
const trialHtml = readRepoFile('trial/index.html');
const mainJs = readRepoFile('app/main.js');
const buildJs = readRepoFile('build.js');

assert.match(rootHtml, /<title>Ad Arma/);
assert.match(rootHtml, /id="introOverlay"/);
assert.match(rootHtml, /id="c"/);
assert.match(rootHtml, /data-build-marker/);
assert.match(rootHtml, /app\/rules\/combat-dice\.js/);
assert.match(rootHtml, /app\/data\/doctrine-orders\.js/);
assert.match(buildJs, /AD_ARMA_BUILD_ID/);
assert.match(buildJs, /console\.info\(`\[Ad Arma\]/);
assert.match(buildJs, /20260426-phase2-data-cleanup/);

assert.match(trialHtml, /shares the root app/);
assert.match(trialHtml, /data-build-marker/);
assert.match(trialHtml, /window\.location\.replace\('\/' \+/);
assert.doesNotMatch(trialHtml, /\/app\/main\.js/);

const unitIconHelper = iconHelper.createUnitIconHelper({ assetBase: '/assets/', buildId: 'TEST' });
assert.equal(unitIconHelper.unitIconSources.inf, '/assets/icon_inf.png');
assert.equal(unitIconHelper.unitIconSources.cav, '/assets/icon_cav.png');
assert.equal(unitIconHelper.unitIconSources.skr, '/assets/icon_skr.png');
assert.equal(unitIconHelper.unitIconSources.arc, '/assets/icon_arc.png');
for (const filename of ['icon_inf.png', 'icon_cav.png', 'icon_skr.png', 'icon_arc.png']) {
  assert.equal(fs.existsSync(path.join(repoRoot, 'assets', filename)), true);
}

const six = combatDice.combatDieResult(6);
assert.equal(six.hits, 1);
assert.equal(six.retreats, 0);
assert.equal(six.disarrays, 1);
assert.match(combatDice.combatDiceRulesText(), /6 = hit \+ disarray/);
assert.doesNotMatch(combatDice.combatDiceRulesText(), /6 = hit \+ retreat/);
assert.doesNotMatch(rootHtml, /6\s*(?:=|is)\s*hit\s*\+\s*retreat\s*\+\s*disarray/i);
assert.doesNotMatch(mainJs, /6\s*(?:=|is)\s*hit\s*\+\s*retreat\s*\+\s*disarray/i);

assert.match(rootHtml, /At the start of each turn, before unit actions/);
assert.match(mainJs, /Directives can only be declared at the start of the turn/);
assert.match(mainJs, /consumeOnUse/);
assert.match(mainJs, /normalizeScenarioRecord/);
assert.doesNotMatch(rootHtml + mainJs, />\s*Cost\s*</);
assert.doesNotMatch(rootHtml + mainJs, /any time before actions run out/i);

console.log('Ad Arma sanity checks passed.');
