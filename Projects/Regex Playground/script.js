(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const patternInput = $('#patternInput');
  const testInput = $('#testInput');
  const outputContainer = $('#outputContainer');
  const tState = $('#tState');
  const tMatches = $('#tMatches');
  const tGroups = $('#tGroups');
  const tSpeed = $('#tSpeed');
  const tFlags = $('#tFlags');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const flagBtns = $$('.flag-btn');
  const btnExecute = $('#btnExecute');
  const btnInject = $('#btnInject');
  const btnFlush = $('#btnFlush');

  let activeFlags = new Set();

  /* ─── FLAG TOGGLES ─── */
  flagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const flag = btn.dataset.flag;
      if (activeFlags.has(flag)) {
        activeFlags.delete(flag);
        btn.classList.remove('active');
      } else {
        activeFlags.add(flag);
        btn.classList.add('active');
      }
      runEvaluation();
    });
  });

  /* ─── GET FLAGS STRING ─── */
  function getFlags() {
    return Array.from(activeFlags).sort().join('');
  }

  /* ─── TRY/CATCH REGEX EVALUATION ─── */
  function evaluateRegex(pattern, flags) {
    const start = performance.now();
    try {
      const re = new RegExp(pattern, flags);
      const elapsed = performance.now() - start;
      return { valid: true, regex: re, error: null, time: elapsed };
    } catch (e) {
      const elapsed = performance.now() - start;
      return { valid: false, regex: null, error: e.message, time: elapsed };
    }
  }

  /* ─── COMPUTE MATCHES WITH CAPTURE GROUPS ─── */
  function computeMatches(regex, text) {
    const matches = [];
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    let m;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        index: m.index,
        length: m[0].length,
        text: m[0],
        groups: m.slice(1)
      });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    return matches;
  }

  /* ─── BUILD HIGHLIGHTED OUTPUT ─── */
  function buildHighlighted(text, matches) {
    if (!matches || matches.length === 0) {
      return '<span class="hl-plain">' + escapeHTML(text) + '</span>';
    }

    /* sort matches by index */
    const sorted = matches.slice().sort((a, b) => a.index - b.index);
    const parts = [];
    let pos = 0;

    sorted.forEach((match, mi) => {
      /* non-match segment before this match */
      if (match.index > pos) {
        parts.push('<span class="hl-plain">' + escapeHTML(text.slice(pos, match.index)) + '</span>');
      }

      const matchText = match.text;
      const groupColor = mi % 3;

      /* check if any capture groups exist within this match */
      const hasGroups = match.groups && match.groups.some(g => g !== undefined);
      const groupColors = ['hl-group-1', 'hl-group-2', 'hl-group-3'];

      if (hasGroups) {
        /* rebuild match segmenting capture groups */
        /* Find capture group positions by re-matching with explicit group tracking */
        /* Use a simpler approach: rebuild groups from match object */
        let innerPos = match.index;
        let innerHtml = '';

        /* We need to find each group's position within the match */
        /* Re-execute the regex without global flag to get group indices */
        const singleRe = new RegExp(regex.source, regex.flags.replace('g',''));
        const singleMatch = singleRe.exec(text.slice(innerPos));

        if (singleMatch) {
          /* Segment by full match with groups highlighted */
          const fullLen = singleMatch[0].length;
          let cursor = 0;

          /* For each group, highlight its span within the match */
          const groupRanges = [];
          for (let gi = 1; gi < singleMatch.length; gi++) {
            if (singleMatch[gi] !== undefined) {
              const gIndex = text.indexOf(singleMatch[gi], innerPos + cursor);
              if (gIndex >= 0) {
                const gOffset = gIndex - innerPos;
                groupRanges.push({ start: gOffset, end: gOffset + singleMatch[gi].length, gi: gi });
              }
            }
          }

          groupRanges.sort((a, b) => a.start - b.start);

          /* Build the match segment with group highlights */
          let segPos = 0;
          groupRanges.forEach(gr => {
            if (gr.start > segPos) {
              innerHtml += '<span class="hl-match">' + escapeHTML(singleMatch[0].slice(segPos, gr.start)) + '</span>';
            }
            const gColor = groupColors[(gr.gi - 1) % groupColors.length];
            innerHtml += '<span class="' + gColor + '">' + escapeHTML(singleMatch[0].slice(gr.start, gr.end)) + '</span>';
            segPos = gr.end;
          });
          if (segPos < fullLen) {
            innerHtml += '<span class="hl-match">' + escapeHTML(singleMatch[0].slice(segPos)) + '</span>';
          }
        } else {
          innerHtml = '<span class="hl-match">' + escapeHTML(matchText) + '</span>';
        }

        parts.push(innerHtml);
      } else {
        parts.push('<span class="hl-match">' + escapeHTML(matchText) + '</span>');
      }

      pos = match.index + match.length;
    });

    /* trailing non-match */
    if (pos < text.length) {
      parts.push('<span class="hl-plain">' + escapeHTML(text.slice(pos)) + '</span>');
    }

    return parts.join('');
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'&#10;');
  }

  /* ─── MAIN EVALUATION ─── */
  let regex = null;

  function runEvaluation() {
    const pattern = patternInput.value;
    const text = testInput.value;
    const flags = getFlags();

    tFlags.textContent = flags || 'none';

    if (!pattern) {
      outputContainer.innerHTML = '<div class="output-empty">INPUT PATTERN &amp; STRING TO GENERATE HIGHLIGHTS</div>';
      tState.textContent = '--';
      tMatches.textContent = '--';
      tGroups.textContent = '--';
      tSpeed.textContent = '--';
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY';
      errorDetail.className = 'error-detail';
      errorDetail.textContent = '';
      regex = null;
      return;
    }

    const result = evaluateRegex(pattern, flags);

    if (!result.valid) {
      regex = null;
      tState.textContent = 'ERROR';
      tState.style.color = '#ffc800';
      tMatches.textContent = '--';
      tGroups.textContent = '--';
      tSpeed.textContent = result.time.toFixed(2) + 'ms';
      tBadge.className = 'tele-badge invalid';
      tBadge.textContent = 'REGEX COMPILATION FAILED';
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = result.error;
      outputContainer.innerHTML = '<div class="output-line" style="color:#ffc800;">' + escapeHTML(result.error) + '</div>';
      return;
    }

    regex = result.regex;

    /* compute matches */
    const matches = computeMatches(regex, text);
    const matchCount = matches.length;

    /* count capture groups */
    let groupCount = 0;
    matches.forEach(m => {
      if (m.groups) {
        groupCount += m.groups.filter(g => g !== undefined).length;
      }
    });

    /* build highlighted output */
    const highlighted = buildHighlighted(text, matches);
    outputContainer.innerHTML = highlighted;

    /* update telemetry */
    tState.textContent = 'VALID';
    tState.style.color = '#00e676';
    tMatches.textContent = matchCount;
    tGroups.textContent = groupCount || '0';
    tSpeed.textContent = result.time.toFixed(2) + 'ms';
    tBadge.className = 'tele-badge valid';
    tBadge.textContent = '[ REGEX STABILIZED: EXPRESSION STRUCTURE OPTIMAL ]';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  /* ─── SAMPLE DATA INJECTOR ─── */
  const SAMPLE_PATTERN = '[\\w.-]+@[\\w.-]+\\.\\w+';
  const SAMPLE_TEXT = 'Deployment Report — 2026-06-15\n' +
    '==============================\n\n' +
    'User Registrations:\n' +
    '  alice@example.com          2026-06-01T08:30:00Z\n' +
    '  bob.smith@company.org      2026-06-02T14:15:00Z\n' +
    '  charlie_dev@mail.io        2026-06-03T09:45:00Z\n\n' +
    'Server Access Logs:\n' +
    '  192.168.1.10 — admin@internal.corp — 2026-06-10\n' +
    '  10.0.0.55   — service@monitor.net — 2026-06-11\n' +
    '  172.16.0.1  — root@localhost       2026-06-12\n\n' +
    'Error Reports:\n' +
    '  2026-06-13 22:14:33 ERROR — dns_resolve failed for backup@relay.io\n' +
    '  2026-06-14 01:02:17 WARN  — timeout contacting deploy@ci.pipeline.dev\n' +
    '  2026-06-15 05:30:00 INFO  — sync complete: data@aggregator.internal\n';

  function injectSample() {
    patternInput.value = SAMPLE_PATTERN;
    testInput.value = SAMPLE_TEXT;
    /* reset flags */
    activeFlags.clear();
    flagBtns.forEach(b => b.classList.remove('active'));
    runEvaluation();
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    patternInput.value = '';
    testInput.value = 'Enter your test string here...';
    activeFlags.clear();
    flagBtns.forEach(b => b.classList.remove('active'));
    regex = null;
    outputContainer.innerHTML = '<div class="output-empty">INPUT PATTERN &amp; STRING TO GENERATE HIGHLIGHTS</div>';
    tState.textContent = '--';
    tState.style.color = '';
    tMatches.textContent = '--';
    tGroups.textContent = '--';
    tSpeed.textContent = '--';
    tFlags.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
  }

  /* ─── EVENTS ─── */
  patternInput.addEventListener('input', runEvaluation);
  testInput.addEventListener('input', runEvaluation);
  btnExecute.addEventListener('click', runEvaluation);
  btnInject.addEventListener('click', injectSample);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    patternInput.value = '\\d{4}-\\d{2}-\\d{2}';
    activeFlags.add('g');
    document.querySelector('.flag-btn[data-flag="g"]').classList.add('active');
    runEvaluation();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
