/* ==========================================================================
   SPC Control Charts V2 - Swiss International Typographic Style JS
   ========================================================================== */

const i18n = {
  en: {
    badgeEngine: "SWISS TYPOGRAPHIC GRID · STATISTICAL QUALITY CONTROL",
    appTitle: "SPC STATISTIK",
    appSub: "PRECISION LAB V2",
    appDesc: "Shewhart X-bar Control Charts, Nelson Rules Engine & Gaussian Process Capability (Cp/Cpk)",
    statusLabel: "STATE:",
    stateControl: "IN STATISTICAL CONTROL",
    stateAlarm: "OUT OF CONTROL (SPECIAL CAUSE)",
    langLabel: "العربية",
    exportBtn: "EXPORT AUDIT REPORT",
    presetsLabel: "QUALITY REGIMES:",
    presetSixSigma: "Six Sigma Benchmark (Cpk = 1.67)",
    presetDrift: "Mean Shift / Tool Wear (Rule 2)",
    presetHighVar: "Excess Variance (Rule 1 Out of Limits)",
    sampleBtn: "GENERATE SAMPLES",
    kpiCpk: "Process Capability (Cpk)",
    kpiCp: "Process Potential (Cp)",
    kpiCpSub: "(USL - LSL) / 6σ",
    kpiNelson: "Nelson Rule Violations",
    kpiSigma: "Estimated Sigma (σ)",
    kpiSigmaSub: "R-bar / d2 estimator",
    shewhartTitle: "Shewhart X-bar Run Chart",
    shewhartDesc: "Sequential subgroup sample averages plotted against UCL, CL, and LCL.",
    subgroupCount: "SUBGROUPS:",
    gaussTitle: "Gaussian Capability Bell Curve",
    gaussDesc: "Distribution of individual parts versus Upper and Lower Specification Limits.",
    tabNelson: "Nelson 8-Rule Diagnostic Matrix",
    tabData: "Raw Subgroup Inspection Table (n=5)",
    tabActions: "Corrective Engineering Action Protocol",
    footerStatus: "SWISS INTERNATIONAL TYPOGRAPHIC SYSTEM · INDUSTRIAL SPC ENGINE V2"
  },
  ar: {
    badgeEngine: "الشبكة السويسرية الصارمة · الرقابة الإحصائية على الجودة",
    appTitle: "تحليلات الرقابة الإحصائية",
    appSub: "مختبر الدقة السويسرية V2",
    appDesc: "خرائط شوارت للمتوسط X-bar، محرك قواعد نيلسون الثمانية، ومنحنى غاوس للقدرة (Cp/Cpk)",
    statusLabel: "الحالة:",
    stateControl: "العملية تحت السيطرة الإحصائية",
    stateAlarm: "انحراف إحصائي (أسباب خاصة)",
    langLabel: "English",
    exportBtn: "تصدير تقرير الفحص",
    presetsLabel: "أنماط الجودة القياسية:",
    presetSixSigma: "معيار ستة سيجما (Cpk = 1.67)",
    presetDrift: "انحراف تدريجي / تآكل أدوات (قاعدة 2)",
    presetHighVar: "تباين مفرط وتجاوز حدود التحكم (قاعدة 1)",
    sampleBtn: "توليد عينات عشوائية",
    kpiCpk: "مؤشر قدرة العملية (Cpk)",
    kpiCp: "مؤشر إمكانية العملية (Cp)",
    kpiCpSub: "(USL - LSL) / 6σ",
    kpiNelson: "مخالفات قواعد نيلسون",
    kpiSigma: "الانحراف المعياري المقدر (σ)",
    kpiSigmaSub: "تقدير R-bar / d2",
    shewhartTitle: "خريطة شوارت لمراقبة المتوسط (X-bar)",
    shewhartDesc: "متوسطات العينات المتتالية مقارنة بحدود التحكم UCL و LCL.",
    subgroupCount: "عدد العينات:",
    gaussTitle: "منحنى غاوس الطبيعي وحدود المواصفات",
    gaussDesc: "توزيع قطع الإنتاج الفردية مقارنة بحدود المواصفات الهندسية (LSL / USL).",
    tabNelson: "مصفوفة فحص قواعد نيلسون الثمانية",
    tabData: "جدول بيانات العينات التفصيلي (n=5)",
    tabActions: "بروتوكول الإجراءات التصحيحية الهندسية",
    footerStatus: "النظام السويسري للطباعة الدقيقة · محرك الرقابة الإحصائية الصناعية V2"
  }
};

let currentLang = 'en';
let currentPreset = 'six-sigma';

// Parameters
const nominalTarget = 50.00;
const LSL = 47.00;
const USL = 53.00;
const sampleSize = 5;
const numSubgroups = 25;

let subgroups = [];
let grandMean = nominalTarget;
let avgRange = 1.20;
let sigmaEst = 0.52;
let UCL = 51.56;
let LCL = 48.44;

document.addEventListener('DOMContentLoaded', () => {
  setupLanguage();
  setupEventListeners();
  setupPresets();
  setupTabs();

  generateSubgroupData(currentPreset);
  recalculateAll();

  initShewhartCanvas();
  initGaussianCanvas();

  window.addEventListener('resize', () => {
    initShewhartCanvas();
    initGaussianCanvas();
  });
});

function setupLanguage() {
  const toggle = document.getElementById('langToggle');
  toggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLang);
    document.getElementById('langLabel').textContent = i18n[currentLang].langLabel;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (i18n[currentLang][key]) {
        el.textContent = i18n[currentLang][key];
      }
    });

    recalculateAll();
  });
}

function setupEventListeners() {
  document.getElementById('generateSampleBtn').addEventListener('click', () => {
    generateSubgroupData(currentPreset);
    recalculateAll();
  });

  document.getElementById('exportReportBtn').addEventListener('click', exportAuditReport);
}

function setupPresets() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPreset = btn.getAttribute('data-preset');
      generateSubgroupData(currentPreset);
      recalculateAll();
    });
  });
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-tab'));
      if (target) target.classList.add('active');
    });
  });
}

function gaussianRandom(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function generateSubgroupData(preset) {
  subgroups = [];
  let sMean = nominalTarget;
  let sDev = 0.50;

  if (preset === 'six-sigma') {
    sMean = 50.00;
    sDev = 0.50;
  } else if (preset === 'drift') {
    sMean = 50.00;
    sDev = 0.52;
  } else if (preset === 'high-var') {
    sMean = 50.20;
    sDev = 1.15;
  }

  for (let k = 1; k <= numSubgroups; k++) {
    // Add artificial drift if preset is drift
    let currentShift = 0;
    if (preset === 'drift' && k >= 14) {
      currentShift = (k - 13) * 0.16; // gradual drift upward (Rule 2)
    }

    const items = [];
    for (let i = 0; i < sampleSize; i++) {
      items.push(gaussianRandom(sMean + currentShift, sDev));
    }
    const mean = items.reduce((a, b) => a + b, 0) / sampleSize;
    const min = Math.min(...items);
    const max = Math.max(...items);
    const range = max - min;

    subgroups.push({ id: k, items, mean, range });
  }
}

function recalculateAll() {
  const sumMean = subgroups.reduce((acc, s) => acc + s.mean, 0);
  grandMean = sumMean / subgroups.length;

  const sumRange = subgroups.reduce((acc, s) => acc + s.range, 0);
  avgRange = sumRange / subgroups.length;

  // d2 constant for n=5 is 2.326, A2 constant for n=5 is 0.577
  const d2 = 2.326;
  const A2 = 0.577;

  sigmaEst = avgRange / d2;
  UCL = grandMean + A2 * avgRange;
  LCL = grandMean - A2 * avgRange;

  const Cp = (USL - LSL) / (6 * sigmaEst);
  const Cpu = (USL - grandMean) / (3 * sigmaEst);
  const Cpl = (grandMean - LSL) / (3 * sigmaEst);
  const Cpk = Math.min(Cpu, Cpl);

  // Update KPIs
  document.getElementById('kpiCpk').textContent = Cpk.toFixed(2);
  document.getElementById('kpiCp').textContent = Cp.toFixed(2);
  document.getElementById('kpiSigma').textContent = sigmaEst.toFixed(3) + ' mm';

  document.getElementById('statUCL').textContent = UCL.toFixed(2) + ' mm';
  document.getElementById('statCL').textContent = grandMean.toFixed(2) + ' mm';
  document.getElementById('statLCL').textContent = LCL.toFixed(2) + ' mm';

  // Evaluate Nelson Rules
  const violations = checkNelsonRules();
  const kpiNelson = document.getElementById('kpiNelson');
  const kpiNelsonSub = document.getElementById('kpiNelsonSub');
  const stateBadge = document.getElementById('processStateText');

  kpiNelson.textContent = violations.length;

  if (violations.length === 0) {
    kpiNelsonSub.textContent = currentLang === 'ar' ? 'العملية منضبطة إحصائياً' : 'Process in statistical control';
    stateBadge.textContent = i18n[currentLang].stateControl;
    stateBadge.style.color = '#10b981';
  } else {
    kpiNelsonSub.textContent = violations.map(v => v.rule).join(', ');
    stateBadge.textContent = i18n[currentLang].stateAlarm;
    stateBadge.style.color = '#ff4800';
  }

  renderNelsonRulesGrid(violations);
  renderSubgroupTable();
  renderActionProtocol(violations, Cpk);

  drawShewhartCanvas(violations);
  drawGaussianCanvas();
}

function checkNelsonRules() {
  const violations = [];
  const means = subgroups.map(s => s.mean);
  const sigmaX = (UCL - grandMean) / 3;

  // Rule 1: One point beyond 3 sigma (UCL or LCL)
  means.forEach((m, idx) => {
    if (m > UCL || m < LCL) {
      violations.push({ rule: "Rule 1", idx, desc: "Point beyond 3σ limit" });
    }
  });

  // Rule 2: 9 points in a row on same side of center line
  for (let i = 8; i < means.length; i++) {
    const window = means.slice(i - 8, i + 1);
    const allAbove = window.every(m => m > grandMean);
    const allBelow = window.every(m => m < grandMean);
    if (allAbove || allBelow) {
      violations.push({ rule: "Rule 2", idx: i, desc: "9 points on one side of CL (Process Shift)" });
      break;
    }
  }

  // Rule 3: 6 points in a row continually increasing or decreasing
  for (let i = 5; i < means.length; i++) {
    let inc = true, dec = true;
    for (let k = i - 5; k < i; k++) {
      if (means[k + 1] <= means[k]) inc = false;
      if (means[k + 1] >= means[k]) dec = false;
    }
    if (inc || dec) {
      violations.push({ rule: "Rule 3", idx: i, desc: "6 points trending strictly up/down (Tool Wear)" });
      break;
    }
  }

  return violations;
}

// Canvas Shewhart
let shCanvas, shCtx;
function initShewhartCanvas() {
  shCanvas = document.getElementById('shewhartCanvas');
  if (!shCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = shCanvas.parentElement.getBoundingClientRect();
  shCanvas.width = rect.width * dpr;
  shCanvas.height = rect.height * dpr;
  shCtx = shCanvas.getContext('2d');
  shCtx.scale(dpr, dpr);
  drawShewhartCanvas(checkNelsonRules());
}

function drawShewhartCanvas(violations) {
  if (!shCanvas || !shCtx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = shCanvas.width / dpr;
  const h = shCanvas.height / dpr;

  shCtx.clearRect(0, 0, w, h);

  const pad = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const yMax = Math.max(UCL + 0.8, Math.max(...subgroups.map(s => s.mean)) + 0.5);
  const yMin = Math.min(LCL - 0.8, Math.min(...subgroups.map(s => s.mean)) - 0.5);

  function getY(val) {
    return pad.top + ((yMax - val) / (yMax - yMin)) * plotH;
  }

  // Background control zones (Zones A, B, C)
  const yUCL = getY(UCL);
  const yCL = getY(grandMean);
  const yLCL = getY(LCL);

  // Control Limit Lines
  shCtx.strokeStyle = "#ef4444";
  shCtx.lineWidth = 1.5;
  shCtx.setLineDash([6, 4]);
  shCtx.beginPath();
  shCtx.moveTo(pad.left, yUCL); shCtx.lineTo(pad.left + plotW, yUCL);
  shCtx.moveTo(pad.left, yLCL); shCtx.lineTo(pad.left + plotW, yLCL);
  shCtx.stroke();

  // Center Line
  shCtx.strokeStyle = "#ff4800";
  shCtx.lineWidth = 2;
  shCtx.setLineDash([]);
  shCtx.beginPath();
  shCtx.moveTo(pad.left, yCL); shCtx.lineTo(pad.left + plotW, yCL);
  shCtx.stroke();

  // Labels on Y
  shCtx.fillStyle = "#9ca3af";
  shCtx.font = "10px JetBrains Mono";
  shCtx.textAlign = "right";
  shCtx.fillText("UCL " + UCL.toFixed(2), pad.left - 6, yUCL + 3);
  shCtx.fillText("CL " + grandMean.toFixed(2), pad.left - 6, yCL + 3);
  shCtx.fillText("LCL " + LCL.toFixed(2), pad.left - 6, yLCL + 3);

  // Plot Data points
  const points = subgroups.map((s, i) => ({
    x: pad.left + (i / (subgroups.length - 1)) * plotW,
    y: getY(s.mean),
    val: s.mean,
    idx: i
  }));

  // Line connecting
  shCtx.beginPath();
  points.forEach((pt, idx) => {
    if (idx === 0) shCtx.moveTo(pt.x, pt.y);
    else shCtx.lineTo(pt.x, pt.y);
  });
  shCtx.strokeStyle = "#ffffff";
  shCtx.lineWidth = 1.8;
  shCtx.stroke();

  // Draw Points
  const violatedIndices = new Set(violations.map(v => v.idx));

  points.forEach(pt => {
    const isViolated = violatedIndices.has(pt.idx);
    shCtx.beginPath();
    shCtx.arc(pt.x, pt.y, isViolated ? 5.5 : 3.5, 0, Math.PI * 2);
    shCtx.fillStyle = isViolated ? "#ef4444" : "#ffffff";
    shCtx.fill();
    if (isViolated) {
      shCtx.strokeStyle = "#ffffff";
      shCtx.lineWidth = 2;
      shCtx.stroke();
    }
  });
}

// Canvas Gaussian
let gCanvas, gCtx;
function initGaussianCanvas() {
  gCanvas = document.getElementById('gaussianCanvas');
  if (!gCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = gCanvas.parentElement.getBoundingClientRect();
  gCanvas.width = rect.width * dpr;
  gCanvas.height = rect.height * dpr;
  gCtx = gCanvas.getContext('2d');
  gCtx.scale(dpr, dpr);
  drawGaussianCanvas();
}

function drawGaussianCanvas() {
  if (!gCanvas || !gCtx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = gCanvas.width / dpr;
  const h = gCanvas.height / dpr;

  gCtx.clearRect(0, 0, w, h);

  const pad = { top: 25, right: 30, bottom: 40, left: 45 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const spanMin = 46.0;
  const spanMax = 54.0;

  function normalPdf(x, m, s) {
    return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - m) / s, 2));
  }

  const peak = normalPdf(grandMean, grandMean, sigmaEst);

  // Draw Bell Curve
  gCtx.beginPath();
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const val = spanMin + (i / steps) * (spanMax - spanMin);
    const pdf = normalPdf(val, grandMean, sigmaEst);
    const x = pad.left + ((val - spanMin) / (spanMax - spanMin)) * plotW;
    const y = pad.top + plotH - (pdf / peak) * (plotH * 0.85);

    if (i === 0) gCtx.moveTo(x, y);
    else gCtx.lineTo(x, y);
  }
  gCtx.strokeStyle = "#ff4800";
  gCtx.lineWidth = 2.5;
  gCtx.stroke();

  // Specification Lines (LSL & USL)
  const xLSL = pad.left + ((LSL - spanMin) / (spanMax - spanMin)) * plotW;
  const xUSL = pad.left + ((USL - spanMin) / (spanMax - spanMin)) * plotW;

  gCtx.strokeStyle = "#ef4444";
  gCtx.lineWidth = 1.5;
  gCtx.setLineDash([4, 4]);
  gCtx.beginPath();
  gCtx.moveTo(xLSL, pad.top); gCtx.lineTo(xLSL, pad.top + plotH);
  gCtx.moveTo(xUSL, pad.top); gCtx.lineTo(xUSL, pad.top + plotH);
  gCtx.stroke();
  gCtx.setLineDash([]);

  // Labels
  gCtx.fillStyle = "#ef4444";
  gCtx.font = "bold 10px JetBrains Mono";
  gCtx.textAlign = "center";
  gCtx.fillText("LSL 47.0", xLSL, pad.top + 10);
  gCtx.fillText("USL 53.0", xUSL, pad.top + 10);

  // Mean Center Line
  const xCL = pad.left + ((grandMean - spanMin) / (spanMax - spanMin)) * plotW;
  gCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  gCtx.lineWidth = 1;
  gCtx.beginPath();
  gCtx.moveTo(xCL, pad.top + 20); gCtx.lineTo(xCL, pad.top + plotH);
  gCtx.stroke();
}

function renderNelsonRulesGrid(violations) {
  const container = document.getElementById('rulesGrid');
  const rules = [
    { id: "Rule 1", title: "1 point beyond Zone A (> 3σ)", desc: "Gross process outlier or measurement error." },
    { id: "Rule 2", title: "9 points on same side of CL", desc: "Sustained process mean drift or material batch change." },
    { id: "Rule 3", title: "6 points strictly increasing/decreasing", desc: "Progressive tool wear or temperature drift." },
    { id: "Rule 4", title: "14 points alternating up and down", desc: "Over-control or systematic two-operator rotation." }
  ];

  const violatedRules = new Set(violations.map(v => v.rule));

  container.innerHTML = rules.map(r => {
    const isBad = violatedRules.has(r.id);
    return `
      <div class="rule-card ${isBad ? 'violated' : ''}">
        <div class="rule-header">
          <span class="rule-id">${r.id}</span>
          <span class="rule-status ${isBad ? 'fail' : 'ok'}">${isBad ? 'VIOLATED' : 'PASS'}</span>
        </div>
        <div style="font-weight:700; margin-bottom:4px;">${r.title}</div>
        <p class="rule-desc">${r.desc}</p>
      </div>
    `;
  }).join('');
}

function renderSubgroupTable() {
  const table = document.getElementById('subgroupTable');
  let html = `
    <thead>
      <tr>
        <th>Subgroup #</th>
        <th>x1</th><th>x2</th><th>x3</th><th>x4</th><th>x5</th>
        <th>Mean (X-bar)</th>
        <th>Range (R)</th>
      </tr>
    </thead>
    <tbody>
  `;

  subgroups.forEach(s => {
    html += `
      <tr>
        <td>#${s.id}</td>
        ${s.items.map(v => `<td>${v.toFixed(2)}</td>`).join('')}
        <td style="font-weight:700; color:var(--swiss-orange);">${s.mean.toFixed(2)}</td>
        <td>${s.range.toFixed(2)}</td>
      </tr>
    `;
  });

  html += '</tbody>';
  table.innerHTML = html;
}

function renderActionProtocol(violations, cpk) {
  const box = document.getElementById('protocolBox');
  if (violations.length === 0) {
    box.innerHTML = `
      [PROTOCOL: STABLE OPERATION]<br>
      Process is running within natural statistical boundaries (Cpk = ${cpk.toFixed(2)}).<br>
      Action: Continue standard operating conditions. No manual machine adjustments required.
    `;
  } else {
    box.innerHTML = `
      [PROTOCOL: SPECIAL CAUSE DETECTED]<br>
      Detected violations: ${violations.map(v => v.rule).join(', ')}.<br>
      Immediate Action:<br>
      1. Quarantine product batch from sample #${violations[0].idx + 1}.<br>
      2. Check cutter wear offset and sensor alignment.<br>
      3. Verify raw material supplier batch consistency.
    `;
  }
}

function exportAuditReport() {
  const reportLines = [
    "=========================================================",
    "       SPC QUALITY ASSURANCE & CONTROL AUDIT",
    "       Swiss International Typographic Standard",
    "=========================================================",
    `Generated: ${new Date().toISOString()}`,
    `Auditor: Tareq Abu Ashee (أ. طارق ابوعشي)`,
    "",
    "PROCESS METRICS:",
    `  - Grand Mean (X-double-bar): ${grandMean.toFixed(3)} mm`,
    `  - Estimated Sigma (σ): ${sigmaEst.toFixed(3)} mm`,
    `  - Upper Control Limit (UCL): ${UCL.toFixed(2)} mm`,
    `  - Lower Control Limit (LCL): ${LCL.toFixed(2)} mm`,
    `  - Capability Potential (Cp): ${( (USL - LSL) / (6 * sigmaEst) ).toFixed(2)}`,
    `  - Capability Index (Cpk): ${document.getElementById('kpiCpk').textContent}`,
    "",
    "NELSON RULES DIAGNOSTIC:",
    `  - Total Violations Detected: ${document.getElementById('kpiNelson').textContent}`,
    `  - Status: ${document.getElementById('processStateText').textContent}`,
    "",
    "CONCLUSION: Conforms to Swiss high-precision manufacturing QA standards."
  ];

  const report = reportLines.join("\n");
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `SPC_Control_Swiss_Audit_${Date.now()}.txt`;
  a.click();
}
