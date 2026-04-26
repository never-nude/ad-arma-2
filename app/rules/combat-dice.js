((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AdArmaCombatDice = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const COMBAT_DIE_RESULTS = Object.freeze({
    1: Object.freeze({ hits: 0, retreats: 0, disarrays: 0, misses: 1, badge: 'M', outcome: 'miss', label: 'miss' }),
    2: Object.freeze({ hits: 0, retreats: 0, disarrays: 0, misses: 1, badge: 'M', outcome: 'miss', label: 'miss' }),
    3: Object.freeze({ hits: 0, retreats: 0, disarrays: 1, misses: 0, badge: 'D', outcome: 'disarray', label: 'disarray' }),
    4: Object.freeze({ hits: 0, retreats: 1, disarrays: 0, misses: 0, badge: 'R', outcome: 'retreat', label: 'retreat' }),
    5: Object.freeze({ hits: 1, retreats: 0, disarrays: 0, misses: 0, badge: 'H', outcome: 'hit', label: 'hit' }),
    6: Object.freeze({ hits: 1, retreats: 0, disarrays: 1, misses: 0, badge: 'HD', outcome: 'hit', label: 'hit + disarray' }),
  });

  function normalizeDieValue(roll) {
    const value = Math.trunc(Number(roll));
    if (!Number.isFinite(value)) return 1;
    return Math.max(1, Math.min(6, value));
  }

  function combatDieResult(roll) {
    return COMBAT_DIE_RESULTS[normalizeDieValue(roll)] || COMBAT_DIE_RESULTS[1];
  }

  function summarizeCombatRolls(rolls = []) {
    const summary = { hits: 0, retreats: 0, disarrays: 0, misses: 0 };
    if (!Array.isArray(rolls)) return summary;
    for (const roll of rolls) {
      const result = combatDieResult(roll);
      summary.hits += result.hits;
      summary.retreats += result.retreats;
      summary.disarrays += result.disarrays;
      summary.misses += result.misses;
    }
    return summary;
  }

  function combatDiceRulesText(options = {}) {
    const eq = options.compact ? '=' : ' = ';
    const comma = options.compact ? ', ' : ', ';
    return [
      `6${eq}hit + disarray`,
      `5${eq}hit`,
      `4${eq}retreat`,
      `3${eq}disarray`,
      `1-2${eq}miss`,
    ].join(comma);
  }

  function combatDieLabel(roll) {
    const label = combatDieResult(roll).label;
    return label.replace(/\b\w/g, (ch) => ch.toUpperCase());
  }

  return {
    COMBAT_DIE_RESULTS,
    combatDieResult,
    combatDieLabel,
    combatDiceRulesText,
    normalizeDieValue,
    summarizeCombatRolls,
  };
});
