/* ============================================================
   play2.js — overhaul UI bridge for Ad Arma.

   Pure DOM observer. Reads engine state by watching the DOM
   surfaces main.js already writes to (commandSel, hudMeta, etc.)
   and projects a friendlier UI on top. Does NOT modify main.js.

   Wiring contract:
     - Reads:  commandSel options/value/disabled, hudMeta text,
               commandUseBtn/commandSkipBtn disabled state,
               body classes, .introOverlay open state.
     - Writes: clicks on commandSel/commandUseBtn/commandSkipBtn,
               clicks on endTurnBtn, openQuickRulesBtn, etc.
   ============================================================ */
(function () {
  'use strict';

  const ACT_LIMIT = 3; // mirror main.js — see line 240 there

  function $(id) { return document.getElementById(id); }

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const k of Object.keys(props)) {
        if (k === 'class') node.className = props[k];
        else if (k === 'style') Object.assign(node.style, props[k]);
        else if (k === 'on') {
          for (const evt of Object.keys(props.on)) node.addEventListener(evt, props.on[evt]);
        }
        else if (k in node) node[k] = props[k];
        else node.setAttribute(k, props[k]);
      }
    }
    if (children != null) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c == null || c === false) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  /* ---------- Inject the phase bar + directive strip ---------- */

  function buildBar() {
    const sideChip = el('span', { class: 'p2-bar-side', id: 'p2-side-chip' }, '–');
    const chips = {
      doctrine: el('span', { class: 'p2-chip', 'data-phase': 'doctrine' }, 'Doctrine'),
      a1: el('span', { class: 'p2-chip', 'data-phase': 'a1' }, 'Action 1'),
      a2: el('span', { class: 'p2-chip', 'data-phase': 'a2' }, 'Action 2'),
      a3: el('span', { class: 'p2-chip', 'data-phase': 'a3' }, 'Action 3'),
      end: el('span', { class: 'p2-chip', 'data-phase': 'end' }, 'End'),
    };
    const chipRow = el('span', { class: 'p2-phase-chips' }, [
      chips.doctrine, chips.a1, chips.a2, chips.a3, chips.end,
    ]);

    const rulesBtn = el('button', {
      class: 'p2-bar-btn p2-icon',
      type: 'button',
      title: 'Rules reference',
      'aria-label': 'Rules reference',
      on: { click: () => clickIfPresent('openQuickRulesBtn') },
    }, '?');

    const endTurnBtn = el('button', {
      class: 'p2-bar-btn p2-primary',
      type: 'button',
      id: 'p2-end-turn',
      on: { click: () => clickIfPresent('endTurnBtn') },
    }, 'End Turn');

    const bar = el('div', { class: 'p2-bar', role: 'banner' }, [
      el('span', { class: 'p2-bar-title' }, 'Ad Arma'),
      sideChip,
      chipRow,
      el('span', { class: 'p2-bar-spacer' }),
      rulesBtn,
      endTurnBtn,
    ]);

    return { bar, chips, sideChip, endTurnBtn };
  }

  function buildStrip() {
    const strip = el('div', { class: 'p2-strip', id: 'p2-strip', role: 'region', 'aria-label': 'War Council directives' });
    return strip;
  }

  function clickIfPresent(id) {
    const node = $(id);
    if (!node) return false;
    if (node.disabled) return false;
    node.click();
    return true;
  }

  /* ---------- Parse a directive option's display text ---------- */
  /* Format from main.js line 7757:
        `[T${tier}] ${name} (${usage} · Spend ${spend} · targets ${count})`
     Title contains layman text + spend summary + targeting + when + watch. */
  function parseOption(opt) {
    const text = opt.textContent || '';
    const m = text.match(/^\[T(\d+)\]\s+(.+?)\s+\(([^·]+?)\s+·\s+Spend\s+(\d+)\s+·\s+targets\s+(\d+)\)\s*$/);
    if (!m) {
      return { tier: '?', name: text.trim(), usage: '', spend: '', targets: '0' };
    }
    return {
      tier: m[1],
      name: m[2].trim(),
      usage: m[3].trim(),       // e.g., "Reusable" / "Single use"
      spend: m[4],              // action cost
      targets: m[5],
      title: opt.title || '',
    };
  }

  /* Pull just the layman summary out of the option title (first sentence). */
  function summarize(p) {
    if (!p.title) return '';
    // Title pattern from main.js: layman + spendSummary + "Targeting:" + "Use it when:" + "Watch for:"
    const before = p.title.split(/\s+(?:Spend |Targeting:|Use it when:|Watch for:)/)[0];
    return (before || '').trim().replace(/\s+/g, ' ').slice(0, 220);
  }

  /* ---------- Render directive cards ---------- */

  let currentCards = [];
  function renderStrip(strip, opts) {
    strip.innerHTML = '';
    const sel = $('commandSel');
    if (!sel) return;

    // Strip should be hidden entirely when not in play mode — we determine
    // that via the .open class on the intro overlay (if open, we're at title).
    const isPlay = !document.querySelector('#introOverlay.open');
    if (!isPlay) {
      strip.style.display = 'none';
      document.body.classList.add('p2-no-strip');
      return;
    }
    strip.style.display = '';

    const directiveIssued = opts.directiveIssued;
    const phaseOpen = !sel.disabled && !directiveIssued;

    document.body.classList.toggle('p2-no-strip', !phaseOpen && !directiveIssued);

    // Label block
    const label = el('div', { class: 'p2-strip-label' }, [
      el('span', { class: 'p2-strip-label-tag' }, 'War Council'),
      el('span', { class: 'p2-strip-label-sub' },
        directiveIssued ? 'Directive issued.' :
        phaseOpen ? 'Pick one or skip.' :
        'No directive this turn.'),
    ]);
    strip.appendChild(label);

    if (directiveIssued) {
      strip.appendChild(el('div', { class: 'p2-strip-empty' },
        `✓ ${directiveIssued} — directive committed for this turn.`));
      strip.classList.remove('p2-strip-pulse');
      return;
    }

    if (!phaseOpen) {
      strip.appendChild(el('div', { class: 'p2-strip-empty' },
        'Directive phase only available at the start of your turn.'));
      strip.classList.remove('p2-strip-pulse');
      return;
    }

    const opts2 = [...sel.options].filter((o) => o.value);
    if (!opts2.length) {
      strip.appendChild(el('div', { class: 'p2-strip-empty' },
        'No legal directives available right now.'));
      strip.classList.remove('p2-strip-pulse');
      return;
    }

    strip.classList.add('p2-strip-pulse');

    for (const o of opts2) {
      const p = parseOption(o);
      const summary = summarize(p);
      const noTargets = (p.targets === '0');
      const card = el('button', {
        class: 'p2-card',
        type: 'button',
        title: p.title || '',
        'data-cmd-id': o.value,
        disabled: noTargets,
        on: {
          click: () => useDirective(o.value),
        },
      }, [
        el('div', { class: 'p2-card-head' }, [
          el('span', { class: 'p2-card-name' }, p.name),
          el('span', { class: 'p2-card-cost' }, `T${p.tier} · ${p.spend} action${p.spend === '1' ? '' : 's'}`),
        ]),
        el('div', { class: 'p2-card-body' }, summary || `${p.usage}.`),
        el('div', { class: 'p2-card-foot' }, [
          el('span', null, noTargets ? 'no eligible units' : `${p.targets} target${p.targets === '1' ? '' : 's'}`),
          el('span', { class: 'p2-card-use' }, noTargets ? '' : 'USE →'),
        ]),
      ]);
      strip.appendChild(card);
    }

    // Skip pseudo-card
    const skip = el('button', {
      class: 'p2-card p2-card-skip',
      type: 'button',
      title: 'Skip directive phase and act this turn without one.',
      on: { click: () => clickIfPresent('commandSkipBtn') },
    }, 'Skip · No Directive');
    strip.appendChild(skip);
  }

  /* Click a directive card -> select it on the hidden <select>, fire change,
     then click the hidden Use button. main.js takes it from there. */
  function useDirective(commandId) {
    const sel = $('commandSel');
    const useBtn = $('commandUseBtn');
    if (!sel || !useBtn) return;
    sel.value = commandId;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    if (useBtn.disabled) {
      // Engine flagged it as not committable yet (e.g. needs target picking).
      // The change event will have surfaced the targeting UI; we're done.
      return;
    }
    useBtn.click();
  }

  /* ---------- Parse hudMeta to drive phase chips ---------- */

  function readPhaseState() {
    const hud = $('hudMeta');
    const text = hud ? (hud.textContent || '') : '';
    const out = {
      mode: 'unknown',
      turn: null,
      side: null,
      actsUsed: 0,
      directiveIssued: null,
      busy: false,
    };
    if (text.includes('Battle Setup') || text.includes('Draft Setup')) out.mode = 'setup';
    else if (text.match(/Turn\s+\d+/)) out.mode = 'play';
    if (text.includes('AI thinking') || text.includes('Resolving combat')) out.busy = true;

    const m = text.match(/Turn\s+(\d+)\s+·\s+(BLUE|RED)\s+to act\s+·\s+Actions\s+(\d+)\/(\d+)/i);
    if (m) {
      out.turn = +m[1];
      out.side = m[2].toLowerCase();
      out.actsUsed = +m[3];
    }
    const dm = text.match(/Directive\s+([^·]+?)\s*\(/);
    if (dm) out.directiveIssued = dm[1].trim();
    return out;
  }

  function renderChips(chips, sideChip, state) {
    if (state.mode !== 'play') {
      for (const k of Object.keys(chips)) chips[k].classList.remove('p2-chip-active', 'p2-chip-done', 'p2-chip-skipped');
      sideChip.textContent = state.mode === 'setup' ? 'Setup' : '–';
      sideChip.classList.remove('p2-side-blue', 'p2-side-red');
      return;
    }
    sideChip.textContent = state.side ? state.side.toUpperCase() : '–';
    sideChip.classList.toggle('p2-side-blue', state.side === 'blue');
    sideChip.classList.toggle('p2-side-red', state.side === 'red');

    // doctrine chip
    const dc = chips.doctrine;
    dc.classList.remove('p2-chip-active', 'p2-chip-done', 'p2-chip-skipped');
    if (state.directiveIssued) {
      dc.classList.add('p2-chip-done');
      dc.textContent = `▸ ${state.directiveIssued}`;
    } else if (state.actsUsed === 0) {
      dc.classList.add('p2-chip-active');
      dc.textContent = 'Doctrine';
    } else {
      dc.classList.add('p2-chip-skipped');
      dc.textContent = 'Doctrine';
    }

    // action chips
    for (let i = 1; i <= ACT_LIMIT; i++) {
      const c = chips['a' + i];
      c.classList.remove('p2-chip-active', 'p2-chip-done');
      c.textContent = 'Action ' + i;
      if (state.actsUsed >= i) c.classList.add('p2-chip-done');
      else if (state.actsUsed === i - 1) c.classList.add('p2-chip-active');
    }

    chips.end.classList.remove('p2-chip-active', 'p2-chip-done');
    if (state.actsUsed >= ACT_LIMIT) chips.end.classList.add('p2-chip-active');
  }

  /* ---------- Boot ---------- */

  function boot() {
    document.body.classList.add('play2-active');
    const { bar, chips, sideChip } = buildBar();
    const strip = buildStrip();

    document.body.appendChild(bar);
    document.body.appendChild(strip);

    let scheduled = false;
    function scheduleSync() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        const state = readPhaseState();
        renderChips(chips, sideChip, state);
        renderStrip(strip, { directiveIssued: state.directiveIssued });
      });
    }

    // Watch the elements main.js writes to.
    const hudMeta = $('hudMeta');
    const commandSel = $('commandSel');
    const introOverlay = $('introOverlay');

    const obs = new MutationObserver(scheduleSync);
    if (hudMeta) obs.observe(hudMeta, { childList: true, characterData: true, subtree: true });
    if (commandSel) {
      obs.observe(commandSel, { childList: true, attributes: true, attributeFilter: ['disabled', 'value'] });
      commandSel.addEventListener('change', scheduleSync);
    }
    if (introOverlay) obs.observe(introOverlay, { attributes: true, attributeFilter: ['class'] });

    // Also poll lightly — some state isn't reflected via mutation
    // (engine may set commandSel.disabled imperatively without an attribute change).
    setInterval(scheduleSync, 500);

    scheduleSync();

    // Surface a hash-based deep link: #scenario=cannae or #play / #tutorial.
    handleDeepLink();
  }

  function handleDeepLink() {
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash) return;
    const parts = Object.fromEntries(
      hash.split('&').map((p) => {
        const i = p.indexOf('=');
        return i < 0 ? [p, ''] : [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
      })
    );
    setTimeout(() => {
      if ('tutorial' in parts) clickIfPresent('introTutorialBtn');
      else if ('setup' in parts) clickIfPresent('introSetupBtn');
      else if ('play' in parts || 'scenario' in parts) clickIfPresent('introPlayNowBtn');
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
