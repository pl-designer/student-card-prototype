/* ═══════════════════════════════════════════════════
   app.js — Student Card Overview
   Fully animated prototype logic
   ═══════════════════════════════════════════════════ */

let appState = {
  mode: 'recommendations', // 'recommendations' | 'playground'
  selectedOption: null,
  overrides: {}
};

/* ─── Utility: animate a number counting up ──── */
function animateNumber(el, from, to, duration = 500) {
  if (from === to) return;
  const startTime = performance.now();
  const diff = to - from;

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = from + diff * ease;
    el.textContent = val.toFixed(1);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = to.toFixed(1);
  }
  requestAnimationFrame(update);
}

/* ─── Data calculations ─────────────────────── */
function calculateNewAverage(subjects, overrides) {
  let sum = 0;
  subjects.forEach(s => {
    let grade = overrides[s.id] !== undefined ? overrides[s.id] : s.grade;
    sum += grade;
  });
  return sum / subjects.length;
}

function calculateGaps(avg, subjects, track) {
  const gaps = [];
  if (avg < track.avgTarget) {
    const diff = (track.avgTarget - avg).toFixed(1);
    gaps.push({ text: `ממוצע — חסרות ${diff} נק׳ ליעד ${track.avgTarget}`, met: false });
  }
  const volHours = subjects[0]?.hours || 140;
  if (volHours < track.volunteeringTarget) {
    const vDiff = track.volunteeringTarget - volHours;
    gaps.push({ text: `מעורבות חברתית — חסרות ${vDiff} שעות`, met: false });
  }
  return gaps;
}

/* ─── Init ──────────────────────────────────── */
function initApp() {
  renderAll();
}

function renderAll() {
  renderGaps();
  renderTopAvg();

  if (appState.mode === 'recommendations') {
    document.getElementById('tab-recommendations').classList.add('active');
    document.getElementById('tab-playground').classList.remove('active');
    renderRecommendations();
  } else {
    document.getElementById('tab-playground').classList.add('active');
    document.getElementById('tab-recommendations').classList.remove('active');
    renderPlayground();
  }
}

/* ─── Top Bar Average (animated) ───────────── */
let _lastAvg = null;
function renderTopAvg() {
  const newAvg = calculateNewAverage(studentData.subjects, appState.overrides);
  const el = document.getElementById('status-avg-number');
  const prev = _lastAvg !== null ? _lastAvg : newAvg;

  if (_lastAvg !== null && Math.abs(newAvg - prev) > 0.01) {
    animateNumber(el, prev, newAvg, 600);
    el.classList.add('updating');
    setTimeout(() => el.classList.remove('updating'), 700);
  } else {
    el.textContent = newAvg.toFixed(1);
  }
  _lastAvg = newAvg;
}

/* ─── Gaps Banner ───────────────────────────── */
function renderGaps() {
  const avg = calculateNewAverage(studentData.subjects, appState.overrides);
  const gaps = calculateGaps(avg, studentData.subjects, track);
  const unmet = gaps.filter(g => !g.met);

  const container = document.getElementById('gaps-banner');
  const tagsEl = document.getElementById('gap-tags');

  if (unmet.length === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';

  tagsEl.innerHTML = unmet
    .map(g => `<span class="gap-pill">${g.text}</span>`)
    .join('');
}

/* ─── Tab switching ─────────────────────────── */
function switchTab(mode) {
  if (appState.mode === mode) return;
  appState.mode = mode;
  appState.selectedOption = null;
  appState.overrides = {};
  renderAll();

  if (mode === 'playground') {
    renderPlaygroundSimulator();
  } else {
    renderSimulatorEmpty();
  }
}

/* ══ RECOMMENDATIONS ════════════════════════════ */
function renderRecommendations() {
  const panel = document.getElementById('panel-content');

  let html = '<div class="rec-cards">';

  recommendations.forEach((opt, idx) => {
    const isSelected = appState.selectedOption === idx;
    const newAvg = opt.newAvg;
    const meetsTarget = newAvg >= track.avgTarget;

    html += `
    <div class="rec-card ${isSelected ? 'selected' : ''}" id="rec-card-${idx}">
      <div class="rec-card__header">
        <span class="point-pill green-pill">+${opt.totalImprovement} נק'</span>
        <div class="rec-card__title">
          <span>אפשרות ${idx + 1}</span>
          <span class="rec-card__num">${idx + 1}</span>
        </div>
      </div>

      <div class="rec-card__rows">
        ${opt.subjects.map(s => {
      const diff = s.targetGrade - s.grade;
      return `
          <div class="data-row">
            <span class="data-row__subject">${s.name}</span>
            <span class="data-row__code">${s.questionnaire}</span>
            <span class="data-row__grades">
              <span class="data-row__current">${s.grade}</span>
              <span class="data-row__arrow">←</span>
              <span class="data-row__target green-text">${s.targetGrade}</span>
            </span>
            <span class="point-pill blue-pill">+${diff}</span>
          </div>`;
    }).join('')}
      </div>

      <div class="rec-card__footer">
        <div class="avg-text">ממוצע חדש: <span class="${meetsTarget ? 'green-text' : ''}">${newAvg.toFixed(1)}</span></div>
        <button class="btn-apply" onclick="applyOption(${idx})" id="btn-apply-${idx}">
          ${isSelected ? '✓ הוחל' : 'החל'}
        </button>
      </div>
    </div>`;
  });

  html += '</div>';
  panel.innerHTML = html;

  if (appState.selectedOption !== null) {
    renderSimulatorOption(recommendations[appState.selectedOption], appState.selectedOption);
  } else {
    renderSimulatorEmpty();
  }
}

function applyOption(idx) {
  // Button click flash
  const btn = document.getElementById(`btn-apply-${idx}`);
  if (btn) {
    btn.style.transform = 'scale(0.93)';
    setTimeout(() => btn.style.transform = '', 200);
  }

  appState.selectedOption = idx;
  appState.overrides = {};
  recommendations[idx].subjects.forEach(s => {
    appState.overrides[s.id] = s.targetGrade;
  });
  renderAll();
  renderSimulatorOption(recommendations[idx], idx);
}

/* ══ SIMULATOR (from option) ═════════════════════ */
function renderSimulatorEmpty() {
  document.getElementById('sim-badge').classList.add('hidden');
  document.getElementById('sim-content').innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">🎯</div>
      <span>לחץ על ״החל״ כדי לטעון סימולציה</span>
    </div>`;
}

function renderSimulatorOption(opt, idx) {
  const badge = document.getElementById('sim-badge');
  badge.textContent = `אפשרות ${idx + 1}`;
  badge.classList.remove('hidden');
  badge.classList.add('active');

  let html = '<div class="sim-rows">';

  opt.subjects.forEach(s => {
    const target = appState.overrides[s.id] ?? s.targetGrade;
    const diff = target - s.grade;

    html += `
    <div class="sim-row">
      <span class="sim-row__subject">${s.name}</span>
      <div class="sim-row__controls">
        <span class="data-row__current">${s.grade}</span>
        <span class="data-row__arrow">←</span>
        <div class="sim-input-box">
          <input type="number"
            class="sim-input"
            value="${target}"
            onchange="updateSimInput('${s.id}', this.value, ${idx})"
            min="${s.grade}"
            max="100"
            id="sim-input-${s.id}">
        </div>
        <div style="flex:1"></div>
        <span class="point-pill green-pill">+${diff}</span>
      </div>
    </div>`;
  });

  html += '</div>';

  const newAvg = calculateNewAverage(studentData.subjects, appState.overrides);
  const meetsTarget = newAvg >= track.avgTarget;

  html += `
  <div class="sim-footer">
    <div class="avg-text">ממוצע חדש:
      <span class="${meetsTarget ? 'green-text' : ''}" id="sim-avg-display">${newAvg.toFixed(1)}</span>
    </div>
    <span class="status-pill ${meetsTarget ? 'success' : 'gap'}">
      ${meetsTarget ? '✓ עומדת ביעד' : 'לא עומדת ביעד'}
    </span>
  </div>`;

  document.getElementById('sim-content').innerHTML = html;
}

function updateSimInput(id, val, optIdx) {
  const numVal = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
  appState.overrides[id] = numVal;

  // Animate the top average change
  renderTopAvg();
  renderGaps();
  renderSimulatorOption(recommendations[optIdx], optIdx);

  // Re-highlight selected card footer avg
  const opt = recommendations[optIdx];
  const newAvg = calculateNewAverage(studentData.subjects, appState.overrides);
  const footerSpan = document.querySelector(`#rec-card-${optIdx} .avg-text span`);
  if (footerSpan) {
    footerSpan.classList.add('num-changed');
    footerSpan.textContent = newAvg.toFixed(1);
    setTimeout(() => footerSpan.classList.remove('num-changed'), 450);
  }
}

/* ══ PLAYGROUND ══════════════════════════════════ */
function sliderFill(input, grade) {
  const min = parseInt(grade, 10);
  const max = 100;
  const val = parseInt(input.value, 10);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.background = `linear-gradient(to left, #3b82f6 ${pct}%, #e9ecef ${pct}%)`;
}

function renderPlayground() {
  const panel = document.getElementById('panel-content');

  let html = '<div class="playground-list">';

  studentData.subjects.forEach(s => {
    const cur = appState.overrides[s.id] !== undefined ? appState.overrides[s.id] : s.grade;
    const diff = cur - s.grade;

    html += `
    <div class="playground-row">
      <span class="pg-pill" id="pill-${s.id}" style="visibility:${diff > 0 ? 'visible' : 'hidden'}">+${diff}</span>
      <span class="pg-current" id="val-${s.id}">${cur}</span>
      <input
        type="range"
        class="pg-slider"
        min="${s.grade}"
        max="100"
        value="${cur}"
        oninput="updatePgSlider('${s.id}', this, ${s.grade})"
        id="slider-${s.id}">
      <span class="pg-current" style="color:var(--text-secondary)">${s.grade}</span>
      <span class="pg-subject">${s.name}</span>
    </div>`;
  });

  html += '</div>';
  panel.innerHTML = html;

  // Apply initial fill to each slider
  studentData.subjects.forEach(s => {
    const slider = document.getElementById('slider-' + s.id);
    if (slider) sliderFill(slider, s.grade);
  });
}

function updatePgSlider(id, input, grade) {
  const val = parseInt(input.value, 10);
  appState.overrides[id] = val;

  // Update slider fill
  sliderFill(input, grade);

  // Update displayed value
  const valEl = document.getElementById('val-' + id);
  if (valEl) {
    valEl.textContent = val;
    valEl.classList.add('num-changed');
    setTimeout(() => valEl.classList.remove('num-changed'), 400);
  }

  // Update pill
  const diff = val - grade;
  const pill = document.getElementById('pill-' + id);
  if (pill) {
    pill.textContent = `+${diff}`;
    pill.style.visibility = diff > 0 ? 'visible' : 'hidden';
  }

  renderTopAvg();
  renderGaps();
  renderPlaygroundSimulator();
}

/* ══ PLAYGROUND SIMULATOR ═══════════════════════ */
function renderPlaygroundSimulator() {
  const badge = document.getElementById('sim-badge');
  badge.textContent = 'שינויים ידניים';
  badge.classList.remove('hidden');
  badge.classList.add('active');

  const changedSubjects = studentData.subjects.filter(s =>
    appState.overrides[s.id] && appState.overrides[s.id] > s.grade
  );

  const simContent = document.getElementById('sim-content');

  if (changedSubjects.length === 0) {
    badge.classList.remove('active');
    simContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">↔</div>
        <span>הזז סליידרים כדי לראות שינויים</span>
      </div>`;
    return;
  }

  let html = '<div class="sim-rows">';

  changedSubjects.forEach(s => {
    const newGrade = appState.overrides[s.id];
    const diff = newGrade - s.grade;

    html += `
    <div class="sim-row">
      <span class="sim-row__subject">${s.name}</span>
      <div class="sim-row__controls">
        <span class="data-row__current">${s.grade}</span>
        <span class="data-row__arrow">←</span>
        <span class="data-row__target" style="padding:4px 8px;font-variant-numeric:tabular-nums">${newGrade}</span>
        <div style="flex:1"></div>
        <span class="point-pill green-pill">+${diff}</span>
      </div>
    </div>`;
  });

  html += '</div>';

  const newAvg = calculateNewAverage(studentData.subjects, appState.overrides);
  const meetsTarget = newAvg >= track.avgTarget;

  html += `
  <div class="sim-footer">
    <div class="avg-text">ממוצע חדש:
      <span class="${meetsTarget ? 'green-text' : ''}">${newAvg.toFixed(1)}</span>
    </div>
    <span class="status-pill ${meetsTarget ? 'success' : 'gap'}">
      ${meetsTarget ? '✓ עומדת ביעד' : 'לא עומדת ביעד'}
    </span>
  </div>`;

  simContent.innerHTML = html;
}

/* ─── Boot ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initApp);
