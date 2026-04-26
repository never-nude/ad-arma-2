((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AdArmaDoctrineOrders = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const DOCTRINE_TIMING_START_OF_TURN = 'startOfTurn';
  const DOCTRINE_TIERS = Object.freeze([1, 2, 3]);
  const COMMANDS_PER_TIER = 3;

  function target(summary, min, max) {
    return Object.freeze({
      summary,
      min,
      max,
    });
  }

  function order(id, name, tier, useType, category, targetSpec, effectSummary, resolver, duration) {
    const singleUse = useType === 'singleUse';
    return Object.freeze({
      id,
      name,
      tier,
      actionSpend: tier,
      timing: DOCTRINE_TIMING_START_OF_TURN,
      useType,
      reusable: !singleUse,
      singleUse,
      duration,
      target: targetSpec,
      effectSummary,
      revealOnUse: true,
      consumeOnUse: singleUse,
      category,
      resolver,
    });
  }

  const RAW_DOCTRINE_ORDERS = Object.freeze([
    order('quick_dress', 'Quick Dress', 1, 'reusable', 'formation',
      target('Up to 3 adjacent INF in same row', 1, 3),
      'Shift up to 3 adjacent infantry 1 hex sideways in formation. No attacks.',
      'quick_dress', 'immediate'),
    order('runner_burst', 'Runner Burst', 1, 'singleUse', 'command',
      target('1 RUN + nearby allies', 1, 1),
      'One runner gets +3 movement this turn; nearby allies gain temporary command relay support.',
      'runner_burst', 'thisTurn'),
    order('javelin_volley', 'Javelin Volley', 1, 'singleUse', 'skirmish',
      target('Up to 2 SKR/ARC', 1, 2),
      'Up to 2 skirmishers/archers gain +2 ranged dice on their next attack this turn.',
      'javelin_volley', 'nextAttackThisTurn'),
    order('quick_withdraw', 'Quick Withdraw', 1, 'reusable', 'positional',
      target('1 SKR/ARC not surrounded', 1, 1),
      'One unsurrounded skirmisher or archer steps back 1 hex without attacking.',
      'quick_withdraw', 'immediate'),
    order('close_ranks', 'Close Ranks', 1, 'reusable', 'infantry',
      target('1 INF', 1, 1),
      'One infantry braces: enemy melee against it is -1 die until enemy turn ends.',
      'close_ranks', 'untilEnemyTurnEnds'),
    order('spur_horses', 'Spur the Horses', 1, 'reusable', 'cavalry',
      target('1 CAV in command', 1, 1),
      'One cavalry in command gets +1 movement this turn.',
      'spur_horses', 'thisTurn'),
    order('signal_call', 'Signal Call', 1, 'singleUse', 'command',
      target('1 GEN + up to 2 nearby out-of-command units', 1, 2),
      'A general briefly extends command to up to two nearby out-of-command units this turn.',
      'signal_call', 'thisTurn'),
    order('loose_screen', 'Loose Screen', 1, 'reusable', 'skirmish',
      target('Up to 2 SKR/ARC adjacent to INF', 1, 2),
      'Up to 2 skirmishers/archers can slip through friendly infantry by 1 hex.',
      'loose_screen', 'immediate'),
    order('covering_fire', 'Covering Fire', 1, 'singleUse', 'missile',
      target('Up to 2 ARC/SKR attacks this turn', 0, 0),
      'Your next two ranged attacks ignore terrain-based ranged penalties.',
      'covering_fire', 'nextTwoRangedThisTurn'),
    order('hold_fast', 'Hold Fast', 1, 'singleUse', 'formation',
      target('1 unit', 1, 1),
      'One unit ignores two retreat results before your next turn and gains +1 melee defense.',
      'hold_fast', 'untilNextTurn'),

    order('shield_wall', 'Shield Wall', 2, 'reusable', 'infantry',
      target('3-6 contiguous INF', 3, 6),
      '3-6 connected infantry form a shield wall: enemy melee -1 die until your next turn.',
      'shield_wall', 'untilNextTurn'),
    order('cavalry_exploit', 'Cavalry Exploit', 2, 'reusable', 'cavalry',
      target('Up to 3 CAV in one sector', 1, 3),
      'Up to 3 cavalry gain shock pressure this turn when they move into clear-ground attacks.',
      'cavalry_exploit', 'thisTurn'),
    order('refuse_flank', 'Refuse the Flank', 2, 'reusable', 'formation',
      target('2-5 INF on one wing', 2, 5),
      'Pull 2-5 infantry on one wing backward/inward to avoid being wrapped.',
      'refuse_flank', 'immediate'),
    order('forced_march', 'Forced March', 2, 'reusable', 'reserve',
      target('Up to 4 INF/SKR in one sector', 1, 4),
      'Up to 4 infantry/skirmishers gain +1 move, but they cannot attack this turn.',
      'forced_march', 'thisTurn'),
    order('strengthen_center', 'Strengthen the Center', 2, 'reusable', 'infantry',
      target('Up to 4 INF within 2 of GEN', 1, 4),
      'Up to 4 central infantry ignore the first retreat result until your next turn.',
      'strengthen_center', 'untilNextTurn'),
    order('wing_screen', 'Wing Screen', 2, 'singleUse', 'missile',
      target('Up to 4 SKR/ARC on flank', 1, 4),
      'Up to 4 flank missile units may attack, then step 1 hex, with +1 move this turn.',
      'wing_screen', 'thisTurn'),
    order('countercharge', 'Countercharge', 2, 'singleUse', 'cavalry',
      target('Up to 3 CAV reaction', 1, 3),
      'Up to 3 cavalry can react with a melee strike when enemies close in, with stronger impact.',
      'countercharge', 'reactionThisTurn'),
    order('jaws_inward', 'Jaws Inward', 2, 'singleUse', 'formation',
      target('2-5 veteran/regular INF', 2, 5),
      'Experienced infantry from both sides of a fight move inward to compress the enemy line.',
      'jaws_inward', 'immediate'),
    order('local_reserve', 'Local Reserve', 2, 'singleUse', 'reserve',
      target('Up to 3 rear-line units', 1, 3),
      'Release up to 3 reserve/rear units for immediate action this turn.',
      'local_reserve', 'thisTurn'),
    order('drive_them_back', 'Drive Them Back', 2, 'singleUse', 'infantry',
      target('Up to 4 INF', 1, 4),
      'Up to 4 infantry gain disarray pressure and +1 attack die this turn.',
      'drive_them_back', 'thisTurn'),

    order('full_line_advance', 'Full Line Advance', 3, 'reusable', 'formation',
      target('One large row', 3, 8),
      'Push one major line forward together; blocked units stay put, others advance.',
      'full_line_advance', 'immediate'),
    order('grand_shield_wall', 'Grand Shield Wall', 3, 'singleUse', 'infantry',
      target('5-8 contiguous INF', 5, 8),
      '5-8 infantry form a major wall: very high melee defense, strong retreat resistance, cannot move, persists through your next turn.',
      'grand_shield_wall', 'throughNextTurn'),
    order('all_out_cavalry_sweep', 'All-Out Cavalry Sweep', 3, 'singleUse', 'cavalry',
      target('Up to 4 CAV on one wing (fallback: up to 3 INF/SKR/ARC)', 1, 4),
      'Cavalry wing gains major shock bonuses through your next turn; if cavalry are gone, convert to a strong wing assault package.',
      'all_out_cavalry_sweep', 'throughNextTurn'),
    order('commit_reserves', 'Commit Reserves', 3, 'singleUse', 'reserve',
      target('Up to 4 rear-third non-GEN units', 1, 4),
      'Commit deep reserves: selected units step toward the front and gain command/mobility/attack support through your next turn.',
      'commit_reserves', 'throughNextTurn'),
    order('general_assault', 'General Assault', 3, 'reusable', 'command',
      target('One sector around GEN (up to 4 units)', 1, 4),
      'Up to 4 units near a general each get one coordinated move or attack.',
      'general_assault', 'thisTurn'),
    order('collapse_center', 'Collapse the Center', 3, 'reusable', 'formation',
      target('Center INF + inward wings', 3, 9),
      'Center yields while wings fold inward to set a compression trap.',
      'collapse_center', 'immediate'),
    order('last_push', 'Last Push', 3, 'singleUse', 'formation',
      target('Up to 4 INF/CAV', 1, 4),
      'Up to 4 infantry/cavalry gain +2 attack dice if they attack this turn.',
      'last_push', 'thisTurn'),
    order('reforge_line', 'Reforge the Line', 3, 'reusable', 'formation',
      target('Up to 6 connected INF', 3, 6),
      'Reposition up to 6 connected infantry by 1 hex each to rebuild the line.',
      'reforge_line', 'immediate'),
    order('command_surge', 'Command Surge', 3, 'reusable', 'command',
      target('1 GEN', 1, 1),
      'One general extends command radius by +1 this turn and pulls units back in command.',
      'command_surge', 'thisTurn'),
    order('stand_or_die', 'Stand or Die', 3, 'singleUse', 'infantry',
      target('3-5 INF around GEN', 3, 5),
      '3-5 infantry near a general ignore retreat results and gain +1 melee defense until your next turn.',
      'stand_or_die', 'untilNextTurn'),
  ]);

  function clampPositiveInt(value, fallback) {
    const n = Math.trunc(Number(value));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function normalizeTarget(rawTarget, fallbackSummary = '') {
    const raw = rawTarget && typeof rawTarget === 'object'
      ? rawTarget
      : { summary: rawTarget || fallbackSummary };
    const maxRaw = Number(raw.max);
    return Object.freeze({
      summary: String(raw.summary || fallbackSummary || '').trim(),
      min: Math.max(0, Math.trunc(Number(raw.min || 0))),
      max: Number.isFinite(maxRaw) ? Math.max(0, Math.trunc(maxRaw)) : Infinity,
    });
  }

  function normalizeDoctrineOrder(raw) {
    const tier = clampPositiveInt(raw?.tier ?? raw?.cost, 1);
    const actionSpend = clampPositiveInt(raw?.actionSpend ?? raw?.cost ?? tier, tier);
    const singleUse = raw?.singleUse === true || raw?.useType === 'singleUse' || raw?.persistence === 'spent';
    const targetSpec = normalizeTarget(raw?.target, raw?.targeting);
    const useType = singleUse ? 'singleUse' : 'reusable';
    const normalized = {
      ...raw,
      id: String(raw?.id || '').trim(),
      name: String(raw?.name || raw?.id || '').trim(),
      tier,
      actionSpend,
      timing: raw?.timing || DOCTRINE_TIMING_START_OF_TURN,
      useType,
      reusable: !singleUse,
      singleUse,
      duration: raw?.duration || 'thisTurn',
      target: targetSpec,
      effectSummary: String(raw?.effectSummary || raw?.explain || '').trim(),
      revealOnUse: raw?.revealOnUse !== false,
      consumeOnUse: raw?.consumeOnUse === true || singleUse,
      category: raw?.category || 'formation',
      resolver: raw?.resolver || raw?.id,
    };

    normalized.cost = normalized.tier;
    normalized.persistence = normalized.singleUse ? 'spent' : 'persistent';
    normalized.targeting = normalized.target.summary;
    normalized.explain = normalized.effectSummary;
    return Object.freeze(normalized);
  }

  const DOCTRINE_ORDERS = Object.freeze(RAW_DOCTRINE_ORDERS.map(normalizeDoctrineOrder));
  const COMMAND_TARGET_LIMITS = Object.freeze(Object.fromEntries(
    DOCTRINE_ORDERS.map((cmd) => [cmd.id, Object.freeze({ min: cmd.target.min, max: cmd.target.max })])
  ));
  const DOCTRINE_ORDER_BY_ID = Object.freeze(Object.fromEntries(DOCTRINE_ORDERS.map((cmd) => [cmd.id, cmd])));

  function validateDoctrineOrders(orders = DOCTRINE_ORDERS) {
    if (!Array.isArray(orders) || !orders.length) return false;
    const ids = new Set();
    const perTier = new Map(DOCTRINE_TIERS.map((tier) => [tier, 0]));
    for (const raw of orders) {
      const cmd = normalizeDoctrineOrder(raw);
      if (!cmd.id || !cmd.name || ids.has(cmd.id)) return false;
      if (!DOCTRINE_TIERS.includes(cmd.tier)) return false;
      if (cmd.actionSpend !== cmd.tier) return false;
      if (cmd.timing !== DOCTRINE_TIMING_START_OF_TURN) return false;
      if (cmd.reusable === cmd.singleUse) return false;
      if (cmd.consumeOnUse !== cmd.singleUse) return false;
      if (!cmd.target || !cmd.target.summary || !Number.isFinite(cmd.target.min)) return false;
      if (!cmd.effectSummary || !cmd.duration || !cmd.resolver) return false;
      ids.add(cmd.id);
      perTier.set(cmd.tier, (perTier.get(cmd.tier) || 0) + 1);
    }
    return DOCTRINE_TIERS.every((tier) => (perTier.get(tier) || 0) >= COMMANDS_PER_TIER);
  }

  return {
    DOCTRINE_TIMING_START_OF_TURN,
    DOCTRINE_TIERS,
    COMMANDS_PER_TIER,
    RAW_DOCTRINE_ORDERS,
    DOCTRINE_ORDERS,
    DOCTRINE_ORDER_BY_ID,
    COMMAND_TARGET_LIMITS,
    normalizeDoctrineOrder,
    validateDoctrineOrders,
  };
});
