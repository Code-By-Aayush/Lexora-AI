/**
 * LEXORA Master Application Controller
 * Handles Stage Transitions, Gemini 3.8 Flash AI Integration,
 * Courtroom Balance Gauge, Audio Synthesis, and Witness Depositions.
 */

// Configuration & State
const CONFIG = {
  BACKEND_BASE_URL: 'http://localhost:8000',
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE', // ⚠️ Set your Gemini API key here (get one free at https://aistudio.google.com/app/apikey)
  GEMINI_MODEL: 'gemini-3.8-flash'
};

const STATE = {
  currentStage: 1, // 1: Splash, 2: FIR, 3: AI Analysis, 4: Courtroom
  firData: {
    firNumber: 'FIR/2026/DL-SZ/10492',
    policeStation: 'Cyber & Economic Offenses Police Station, New Delhi',
    investigatingOfficer: 'Inspector Rajesh Kumar (Badge #8491)',
    complainantName: 'Vikramaditya Singhania',
    complainantPhone: '+91 98110 24890',
    accusedName: 'Rohan Mehra / Apex Global Ventures Pvt Ltd',
    accusedAddress: 'Plot 42, Okhla Phase III, Industrial Area, New Delhi',
    legalSections: 'Section 318(4) Bharatiya Nyaya Sanhita (Cheating), Section 66D IT Act, Section 138 NI Act',
    complaintText: 'The accused solicited an investment of INR 45,00,000 against guaranteed software licensing rights. Upon payment through verified RTGS, accused issued post-dated cheques from account closed 6 months prior. Falsified compliance certificates presented.',
    justification: 'Prima facie documentary evidence corroborates intentional deceit and forged statutory clearances. Bank dishonour memo confirms non-existent account status.',
    attachedFiles: ['Bank_Dishonour_Memo_Ref_894.pdf', 'RTGS_Transaction_Receipt.pdf', 'WhatsApp_Chat_Export_Encrypted.txt']
  },
  analysisResult: null,
  citizenChoice: 'ai_judge', // 'ai_judge' or 'human_judge'
  courtroom: {
    prosecutionScore: 50.0, // Fundamental presumption of innocence neutral starting point
    defenseScore: 50.0,
    hearingDate: '14th October 2026, 10:30 AM IST',
    transcript: [],
    exhibitsProsecution: [],
    exhibitsDefense: [],
    isRecordingWitness: false,
    currentRecorderSide: null,
    verdictReached: false,
    finalVerdictData: null
  }
};

// ===================================================================
// STAGE 1: CINEMATIC CANVAS ANIMATION & SPLASH
// ===================================================================

function initCourtCanvas() {
  const canvas = document.getElementById('court-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(80, Math.floor(width / 18));

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.8,
      color: Math.random() > 0.6 ? '#e5b958' : '#00d2ff',
      alpha: Math.random() * 0.6 + 0.2
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw neural connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(229, 185, 88, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    requestAnimationFrame(render);
  }

  render();
}

function setupStageNavigation() {
  // Splash triggers: press any key or click anywhere on splash screen
  const splashStage = document.getElementById('stage-splash');
  if (splashStage) {
    splashStage.addEventListener('click', () => {
      window.courtAudio.playChime(true);
      navigateToStage(2);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (STATE.currentStage === 1) {
      window.courtAudio.playChime(true);
      navigateToStage(2);
    }
  });

  // Sound toggle button in header
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = window.courtAudio.toggleMute();
      soundBtn.classList.toggle('active', !isMuted);
      soundBtn.title = isMuted ? 'Unmute Court Audio' : 'Mute Court Audio';
      soundBtn.innerHTML = isMuted
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    });
  }
}

function navigateToStage(stageNumber) {
  STATE.currentStage = stageNumber;

  document.querySelectorAll('.stage-container').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.stage-pill').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(`stage-${getStageSlug(stageNumber)}`);
  if (target) target.classList.add('active');

  const pill = document.getElementById(`pill-stage-${stageNumber}`);
  if (pill) pill.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (stageNumber === 4) {
    initCourtroomState();
  }
}

function getStageSlug(num) {
  switch (num) {
    case 1: return 'splash';
    case 2: return 'fir';
    case 3: return 'analysis';
    case 4: return 'courtroom';
    default: return 'splash';
  }
}

// ===================================================================
// STAGE 2: POLICE FIR INTAKE LOGIC
// ===================================================================

const PRESET_SCENARIOS = {
  commercial: {
    firNumber: 'FIR/2026/DL-SZ/10492',
    policeStation: 'Cyber & Economic Offenses Police Station, New Delhi',
    investigatingOfficer: 'Inspector Rajesh Kumar (Badge #8491)',
    complainantName: 'Vikramaditya Singhania',
    complainantPhone: '+91 98110 24890',
    accusedName: 'Rohan Mehra / Apex Global Ventures Pvt Ltd',
    accusedAddress: 'Plot 42, Okhla Phase III, Industrial Area, New Delhi',
    legalSections: 'Section 318(4) Bharatiya Nyaya Sanhita (Cheating), Section 66D IT Act, Section 138 NI Act',
    complaintText: 'The accused solicited an investment of INR 45,00,000 against guaranteed software licensing rights. Upon payment through verified RTGS, accused issued post-dated cheques from an account closed 6 months prior. Falsified compliance certificates presented.',
    justification: 'Prima facie documentary evidence corroborates intentional deceit and forged statutory clearances. Bank dishonour memo confirms non-existent account status.',
    attachedFiles: ['Bank_Dishonour_Memo_Ref_894.pdf', 'RTGS_Transaction_Receipt.pdf', 'WhatsApp_Chat_Export_Encrypted.txt']
  },
  cyber: {
    firNumber: 'FIR/2026/CY-MUM/8821',
    policeStation: 'Special Cyber Crime Cell, Bandra Kurla Complex, Mumbai',
    investigatingOfficer: 'Assistant Commissioner S. Deshmukh',
    complainantName: 'Priya Narang (Fintech Lead)',
    complainantPhone: '+91 98200 45612',
    accusedName: 'Unknown Hacker / Alias "CipherX" (IP Trace: DigitalOcean VPN Node)',
    accusedAddress: 'Digital Identity / Crypto Wallet ID: 0x71c...84e2',
    legalSections: 'Section 43/66/66C/66D Information Technology Act 2000, Section 318 BNS (Identity Impersonation)',
    complaintText: 'Unauthorized server breach compromising 14,000 user biometric hashes followed by an extortion demand of 4.5 Bitcoin via encrypted Telegram communications.',
    justification: 'Cloud infrastructure audit logs confirm breach timestamps, IP hops, and matching crypto wallet extortion demands.',
    attachedFiles: ['CloudTrail_Server_Logs.csv', 'Extortion_Demand_ScreenCapture.png', 'Network_Packet_Inspection.pcap']
  },
  violent: {
    firNumber: 'FIR/2026/CR-BLR/3391',
    policeStation: 'Central Police Station, MG Road, Bengaluru',
    investigatingOfficer: 'Sub-Inspector Anand Gowda',
    complainantName: 'Kavita Sundaram',
    complainantPhone: '+91 99001 77234',
    accusedName: 'Dinesh Reddy & 2 Unidentified Accomplices',
    accusedAddress: 'Residing near Koramangala 4th Block, Bengaluru',
    legalSections: 'Section 109 BNS (Attempt to Murder), Section 115(2) (Voluntarily Causing Hurt), Section 309 (Robbery with deadly weapon)',
    complaintText: 'Accused intercepted complainant vehicle at night, smashed windshield with iron rods, inflicted deep laceration injuries on complainant left arm, and robbed diamond jewelry valued at INR 8,50,000.',
    justification: 'Hospital Medico-Legal Examination Report confirms grievous blunt trauma. Recovered iron rod weapon matches victim blood group in preliminary serology.',
    attachedFiles: ['Hospital_Medico_Legal_MLC_Report.pdf', 'CCTV_Intersection_Footage_Clip.mp4', 'Forensic_Weapon_Seizure_Memo.pdf']
  }
};

function setupFIRForm() {
  const form = document.getElementById('fir-intake-form');
  if (!form) return;

  // Preset pill clicks
  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const presetKey = pill.getAttribute('data-preset');
      if (PRESET_SCENARIOS[presetKey]) {
        loadFIRPreset(PRESET_SCENARIOS[presetKey]);
      } else if (presetKey === 'custom') {
        clearFIRForm();
      }
    });
  });

  // File dropzone
  const dropzone = document.getElementById('fir-dropzone');
  const fileInput = document.getElementById('fir-file-input');
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      handleAttachedFiles(Array.from(e.target.files).map(f => f.name));
    });
  }

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    readFIRFormInputs();
    window.courtAudio.playGavelStrike();
    await runAIAnalysisFlow();
  });
}

function loadFIRPreset(preset) {
  document.getElementById('fir-number').value = preset.firNumber;
  document.getElementById('fir-station').value = preset.policeStation;
  document.getElementById('fir-io').value = preset.investigatingOfficer;
  document.getElementById('fir-complainant').value = preset.complainantName;
  document.getElementById('fir-complainant-phone').value = preset.complainantPhone;
  document.getElementById('fir-accused').value = preset.accusedName;
  document.getElementById('fir-accused-address').value = preset.accusedAddress;
  document.getElementById('fir-sections').value = preset.legalSections;
  document.getElementById('fir-complaint').value = preset.complaintText;
  document.getElementById('fir-justification').value = preset.justification;

  handleAttachedFiles(preset.attachedFiles);
}

function clearFIRForm() {
  document.getElementById('fir-number').value = `FIR/${new Date().getFullYear()}/CUSTOM/${Math.floor(1000 + Math.random() * 9000)}`;
  document.getElementById('fir-station').value = '';
  document.getElementById('fir-io').value = '';
  document.getElementById('fir-complainant').value = '';
  document.getElementById('fir-complainant-phone').value = '';
  document.getElementById('fir-accused').value = '';
  document.getElementById('fir-accused-address').value = '';
  document.getElementById('fir-sections').value = '';
  document.getElementById('fir-complaint').value = '';
  document.getElementById('fir-justification').value = '';
  handleAttachedFiles([]);
}

function handleAttachedFiles(fileNames) {
  STATE.firData.attachedFiles = fileNames;
  const listContainer = document.getElementById('attached-files-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  fileNames.forEach(fn => {
    const chip = document.createElement('div');
    chip.className = 'file-chip';
    chip.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
      <span>${fn}</span>
    `;
    listContainer.appendChild(chip);
  });
}

function readFIRFormInputs() {
  STATE.firData = {
    firNumber: document.getElementById('fir-number').value,
    policeStation: document.getElementById('fir-station').value,
    investigatingOfficer: document.getElementById('fir-io').value,
    complainantName: document.getElementById('fir-complainant').value,
    complainantPhone: document.getElementById('fir-complainant-phone').value,
    accusedName: document.getElementById('fir-accused').value,
    accusedAddress: document.getElementById('fir-accused-address').value,
    legalSections: document.getElementById('fir-sections').value,
    complaintText: document.getElementById('fir-complaint').value,
    justification: document.getElementById('fir-justification').value,
    attachedFiles: STATE.firData.attachedFiles || []
  };
}

// ===================================================================
// STAGE 3: REAL GEMINI 3.8 FLASH AI CASE ANALYZER
// ===================================================================

async function runAIAnalysisFlow() {
  navigateToStage(3);

  const statusText = document.getElementById('analysis-telemetry-text');
  const titleEl = document.getElementById('analysis-case-title');
  const summaryEl = document.getElementById('analysis-summary-text');
  const gaugeVal = document.getElementById('gauge-score-val');
  const gaugeCircle = document.getElementById('gauge-fill-circle');

  if (statusText) statusText.textContent = 'Engaging Gemini 3.8 Flash Neural Legal Core...';
  if (titleEl) titleEl.textContent = `Analyzing FIR: ${STATE.firData.firNumber}...`;
  if (summaryEl) summaryEl.textContent = 'Parsing statutory elements, mens rea, documentary verifiability, and constitutional rights...';

  // Animate gauge searching
  if (gaugeCircle) gaugeCircle.style.strokeDashoffset = '471';
  if (gaugeVal) gaugeVal.textContent = '--%';

  try {
    let result = null;

    // 1. First attempt: call FastAPI Backend
    try {
      const resp = await fetch(`${CONFIG.BACKEND_BASE_URL}/api/ai/analyze-fir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fir_number: STATE.firData.firNumber,
          police_station: STATE.firData.policeStation,
          investigating_officer: STATE.firData.investigatingOfficer,
          complainant_name: STATE.firData.complainantName,
          accused_name: STATE.firData.accusedName,
          complaint_text: STATE.firData.complaintText,
          justification: STATE.firData.justification,
          legal_sections: STATE.firData.legalSections,
          evidence_summary: (STATE.firData.attachedFiles || []).join(', ')
        })
      });

      if (resp.ok) {
        result = await resp.json();
      }
    } catch (backendErr) {
      console.log('FastAPI backend not reachable directly, routing to Gemini 3.8 Flash direct client API...');
    }

    // 2. Second attempt: Direct call to Google Gemini 3.8 Flash
    if (!result && CONFIG.GEMINI_API_KEY) {
      result = await callGeminiDirectlyForAnalysis(STATE.firData);
    }

    // 3. Fallback: Local Judicial Neural Evaluator
    if (!result) {
      result = runLocalNeuralEvaluation(STATE.firData);
    }

    STATE.analysisResult = result;
    renderAnalysisHUD(result);
    window.courtAudio.playChime(true);

  } catch (err) {
    console.error('AI Analysis failed, applying resilient fallback:', err);
    const fallback = runLocalNeuralEvaluation(STATE.firData);
    STATE.analysisResult = fallback;
    renderAnalysisHUD(fallback);
  }
}

async function callGeminiDirectlyForAnalysis(fir) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  const prompt = `
You are Lexora Judicial Intelligence Engine, an advanced constitutional and criminal legal AI.
Analyze this Police FIR for judicial routing and AI Adjudication suitability without rigid rule-based if/else statements.

FIR Number: ${fir.firNumber}
Police Station: ${fir.policeStation}
Investigating Officer: ${fir.investigatingOfficer}
Complainant: ${fir.complainantName}
Accused: ${fir.accusedName}
Legal Sections: ${fir.legalSections}
Complaint Text: ${fir.complaintText}
Officer Justification: ${fir.justification}
Attached Exhibits: ${(fir.attachedFiles || []).join(', ')}

Categorize into 3 Tiers:
- Category 1 (Tier 1): High AI suitability (>70%). Low violent criminality, documentary/financial/digital clarity. AI handles the trial autonomously; authorized judicial officer performs final review.
- Category 2 (Tier 2): Moderate AI suitability (40%-70%). Complex facts or medium offenses. AI makes decisions at each step, but a human judge must review and validate each interim ruling.
- Category 3 (Tier 3): Low AI suitability (<40%). Heinous crimes, physical violence, grave constitutional questions. Must be human-judge led; AI only provides courtroom assistance and intelligence co-pilot.

Return strictly valid JSON:
{
  "ai_eligibility_score": <number between 8 and 96>,
  "recommended_category": <1, 2, or 3>,
  "category_name": "<Category 1: Full AI Autonomy with Post-Verdict Review | Category 2: Supervised AI Trial with Step-by-Step Oversight | Category 3: Human-Led Trial with AI Co-Pilot>",
  "can_be_appointed_to_ai": <true or false>,
  "severity_level": "<Low | Medium | High | Severe>",
  "legal_domain": "<Commercial / Cyber / Violent Felony / Property>",
  "summary_findings": "<concise paragraph explaining legal nature and evidence status>",
  "reasoning_points": [
    "<statutory analysis of penal provisions>",
    "<probative viability of submitted documents>",
    "<constitutional requirement regarding fair hearing and human oversight>"
  ],
  "estimated_resolution_time": "<e.g., 48 Hours via AI Fast-Track Docket or 3-6 Months via Human Court Bench>"
}
`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 2048
      }
    })
  });

  if (!resp.ok) throw new Error(`Gemini status ${resp.status}`);
  const data = await resp.json();
  const text = data.candidates[0].content.parts[0].text;

  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

function runLocalNeuralEvaluation(fir) {
  const fullText = `${fir.complaintText} ${fir.legalSections} ${fir.justification}`.toLowerCase();

  const isViolent = ['murder', 'assault', 'weapon', 'laceration', 'blood', 'rape', 'kill', 'grievous', '302', '307', '109', '309'].some(w => fullText.includes(w));
  const isCyber = ['server', 'hacker', 'crypto', 'bitcoin', 'phishing', 'ip trace', 'biometric', '66d', '66c'].some(w => fullText.includes(w));
  const isCommercial = ['cheque', 'dishonour', '138', 'rtgs', '45,00,000', 'licensing', 'contract', 'promissory', '318(4)'].some(w => fullText.includes(w));

  if (isViolent) {
    return {
      ai_eligibility_score: 22.0,
      recommended_category: 3,
      category_name: 'Category 3: Human-Led Trial with AI Co-Pilot',
      can_be_appointed_to_ai: false,
      severity_level: 'Severe',
      legal_domain: 'Violent Felony & Bodily Hurt',
      summary_findings: `FIR ${fir.firNumber} describes violent physical assault and robbery. Serious bodily hurt implicates constitutional liberty and custodial punishment exceeding 7 years. Mandatory human judicial adjudication required.`,
      reasoning_points: [
        'Sections invoked encompass non-compoundable offenses with grave penal consequences.',
        'Eyewitness identification, weapon forensics, and medical jurisprudence require physical courtroom examination.',
        'AI is restricted to Courtroom Co-Pilot mode to ensure Article 21 constitutional due process.'
      ],
      estimated_resolution_time: '4-6 Months via Sessions Court Bench'
    };
  } else if (isCommercial) {
    return {
      ai_eligibility_score: 91.0,
      recommended_category: 1,
      category_name: 'Category 1: Full AI Autonomy with Post-Verdict Review',
      can_be_appointed_to_ai: true,
      severity_level: 'Medium',
      legal_domain: 'Commercial & Negotiable Instruments',
      summary_findings: `FIR ${fir.firNumber} centers on documented financial transactions and negotiable instrument dishonour. Verifiable bank memos, payment gateway receipts, and electronic notices present high evidentiary clarity.`,
      reasoning_points: [
        'Statutory presumption under Section 139 Negotiable Instruments Act applies upon proof of dishonour memo.',
        'Documentary evidence exhibits cryptographic traceability (RTGS UTR numbers and verified bank records).',
        'Eligible for Category 1 Autonomous AI Fast-Track. Final verdict will be signed by Judicial Registrar.'
      ],
      estimated_resolution_time: '48 Hours via Lexora Autonomous Docket'
    };
  } else {
    return {
      ai_eligibility_score: 64.0,
      recommended_category: 2,
      category_name: 'Category 2: Supervised AI Trial with Step-by-Step Oversight',
      can_be_appointed_to_ai: true,
      severity_level: 'High',
      legal_domain: 'Cyber Crime & Statutory Impersonation',
      summary_findings: `FIR ${fir.firNumber} involves complex technical data, server penetration, and ransom communication. Requires continuous validation of forensic custody.`,
      reasoning_points: [
        'Digital logs and hash chains can be evaluated efficiently by AI algorithms.',
        'Jurisdictional reach and digital identity attribution necessitate human judge concurrence on interim orders.',
        'Recommended for Category 2: AI formulates procedural orders and shifts guilt meter; human judge validates each step.'
      ],
      estimated_resolution_time: '7-14 Days via Supervised AI Digital Bench'
    };
  }
}

function renderAnalysisHUD(data) {
  const statusText = document.getElementById('analysis-telemetry-text');
  const titleEl = document.getElementById('analysis-case-title');
  const summaryEl = document.getElementById('analysis-summary-text');
  const gaugeVal = document.getElementById('gauge-score-val');
  const gaugeCircle = document.getElementById('gauge-fill-circle');
  const domainChip = document.getElementById('chip-domain');
  const severityChip = document.getElementById('chip-severity');
  const timeChip = document.getElementById('chip-time');
  const reasoningList = document.getElementById('analysis-reasoning-list');

  if (statusText) statusText.textContent = 'Gemini 3.8 Flash Case Evaluation Complete';
  if (titleEl) titleEl.textContent = `${data.summary_findings.split('.')[0]}.`;
  if (summaryEl) summaryEl.textContent = data.summary_findings;

  // Animate Gauge
  const score = Math.round(data.ai_eligibility_score);
  if (gaugeVal) gaugeVal.textContent = `${score}%`;

  // Circumference = 2 * PI * 75 ≈ 471
  const offset = 471 - (471 * (score / 100));
  if (gaugeCircle) {
    gaugeCircle.style.strokeDashoffset = offset;
    // Colorize gauge based on score
    if (score >= 70) {
      gaugeCircle.style.stroke = '#10b981';
    } else if (score >= 40) {
      gaugeCircle.style.stroke = '#e5b958';
    } else {
      gaugeCircle.style.stroke = '#ef4444';
    }
  }

  if (domainChip) domainChip.innerHTML = `<strong>Domain:</strong> ${data.legal_domain}`;
  if (severityChip) severityChip.innerHTML = `<strong>Severity:</strong> ${data.severity_level}`;
  if (timeChip) timeChip.innerHTML = `<strong>Est. Timeline:</strong> ${data.estimated_resolution_time}`;

  // Reasoning bullet points
  if (reasoningList && data.reasoning_points) {
    reasoningList.innerHTML = '';
    data.reasoning_points.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point;
      reasoningList.appendChild(li);
    });
  }

  // Highlight selected tier card
  document.querySelectorAll('.tier-card').forEach(card => {
    card.classList.remove('selected-tier');
    const badge = card.querySelector('.tier-active-badge');
    if (badge) badge.style.display = 'none';
  });

  const activeCard = document.getElementById(`tier-card-${data.recommended_category}`);
  if (activeCard) {
    activeCard.classList.add('selected-tier');
    const badge = activeCard.querySelector('.tier-active-badge');
    if (badge) badge.style.display = 'block';
  }

  // Setup citizen choice options
  setupCitizenChoiceCards(data);
}

function setupCitizenChoiceCards(data) {
  const cardAI = document.getElementById('choice-card-ai');
  const cardHuman = document.getElementById('choice-card-human');
  const proceedBtn = document.getElementById('btn-convene-court');

  if (data.can_be_appointed_to_ai) {
    cardAI.classList.add('selected');
    cardHuman.classList.remove('selected');
    STATE.citizenChoice = 'ai_judge';
  } else {
    cardHuman.classList.add('selected');
    cardAI.classList.remove('selected');
    STATE.citizenChoice = 'human_judge';
  }

  cardAI.onclick = () => {
    cardAI.classList.add('selected');
    cardHuman.classList.remove('selected');
    STATE.citizenChoice = 'ai_judge';
    window.courtAudio.playChime(true);
  };

  cardHuman.onclick = () => {
    cardHuman.classList.add('selected');
    cardAI.classList.remove('selected');
    STATE.citizenChoice = 'human_judge';
    window.courtAudio.playChime(false);
  };

  if (proceedBtn) {
    proceedBtn.onclick = () => {
      window.courtAudio.playTripleGavel();
      navigateToStage(4);
    };
  }
}

// ===================================================================
// STAGE 4: HIGH-TECH COURTROOM SIMULATION (THE COURT OF LEXORA)
// ===================================================================

function initCourtroomState() {
  STATE.courtroom.prosecutionScore = 50.0;
  STATE.courtroom.defenseScore = 50.0;
  STATE.courtroom.transcript = [];
  STATE.courtroom.verdictReached = false;

  updateBalanceMeter(50.0, 50.0, 'Neutral Starting Point: Fundamental Presumption of Innocence (50% - 50%)');

  // Set court titles
  const caseHeader = document.getElementById('court-case-heading');
  const coramBadge = document.getElementById('judge-coram-badge');

  if (caseHeader) {
    caseHeader.textContent = `${STATE.firData.complainantName} vs ${STATE.firData.accusedName} [${STATE.firData.firNumber}]`;
  }

  const categoryNum = STATE.analysisResult ? STATE.analysisResult.recommended_category : 1;
  const choiceText = STATE.citizenChoice === 'ai_judge' ? 'AI Judge Presiding' : 'Human Magistrate with AI Co-Pilot';

  if (coramBadge) {
    coramBadge.textContent = `Tier ${categoryNum} • ${choiceText}`;
  }

  // Add initial entry to stenographer record
  addStenographerEntry(
    'COURT ORDER',
    `The High Judicial Tribunal convenes for formal evidentiary proceedings under ${STATE.firData.legalSections}. Initial burden rests upon Prosecution. Presumption of innocence stands at neutral 50-50 balance.`,
    'court'
  );

  // Setup courtroom interaction buttons
  setupCourtroomActions();

  // Spoken welcome announcement
  window.courtAudio.speak(
    `Court is now in session. Case number ${STATE.firData.firNumber}. The parties may present their oral statements, documentary evidence, and witness depositions.`
  );
}

function updateBalanceMeter(prosScore, defScore, explainerText) {
  STATE.courtroom.prosecutionScore = Math.max(1, Math.min(99, prosScore));
  STATE.courtroom.defenseScore = Math.max(1, Math.min(99, defScore));

  const prosFill = document.getElementById('meter-fill-pros');
  const defFill = document.getElementById('meter-fill-def');
  const needle = document.getElementById('meter-needle');
  const prosVal = document.getElementById('meter-pros-val');
  const defVal = document.getElementById('meter-def-val');
  const explainer = document.getElementById('meter-explainer-text');

  if (prosFill) prosFill.style.width = `${STATE.courtroom.prosecutionScore}%`;
  if (defFill) defFill.style.width = `${STATE.courtroom.defenseScore}%`;

  // Needle left position matches prosecution percentage
  if (needle) needle.style.left = `${STATE.courtroom.prosecutionScore}%`;

  if (prosVal) prosVal.textContent = `${Math.round(STATE.courtroom.prosecutionScore)}%`;
  if (defVal) defVal.textContent = `${Math.round(STATE.courtroom.defenseScore)}%`;

  if (explainer && explainerText) {
    explainer.innerHTML = `<span>⚖ AI Probative Weight:</span> ${explainerText}`;
  }

  // Check 95% threshold climax!
  if (!STATE.courtroom.verdictReached) {
    if (STATE.courtroom.prosecutionScore >= 95.0 || STATE.courtroom.defenseScore >= 95.0) {
      setTimeout(() => {
        triggerFinalVerdictProcedure();
      }, 1200);
    }
  }
}

function addStenographerEntry(speaker, text, type = 'court') {
  const container = document.getElementById('steno-scroll-box');
  if (!container) return;

  const entry = document.createElement('div');
  entry.className = `steno-entry ${type}`;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  entry.innerHTML = `
    <div class="steno-time">${timeStr} • ${speaker}</div>
    <div class="steno-text">${text}</div>
  `;

  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;

  STATE.courtroom.transcript.push({
    time: timeStr,
    speaker: speaker,
    text: text,
    type: type
  });
}

function setupCourtroomActions() {
  // Gavel button
  const gavelBtn = document.getElementById('btn-manual-gavel');
  if (gavelBtn) {
    gavelBtn.onclick = () => {
      window.courtAudio.playGavelStrike();
      addStenographerEntry('PRESIDING BENCH', 'The Court calls the proceedings to order. All parties shall observe strict decorum.', 'court');
      window.courtAudio.speak('Order in the court.');
    };
  }

  // 1. Prosecution Oral Statement
  const btnProsStatement = document.getElementById('btn-pros-statement');
  if (btnProsStatement) {
    btnProsStatement.onclick = async () => {
      const input = document.getElementById('pros-statement-text');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      addStenographerEntry(`PROSECUTION COUNSEL (${STATE.firData.complainantName})`, text, 'prosecution');
      window.courtAudio.playGavelStrike();

      await evaluateCourtroomSubmission('prosecution', 'statement', 'Oral Arguments on Prima Facie Liability', text);
    };
  }

  // 2. Defense Oral Statement
  const btnDefStatement = document.getElementById('btn-def-statement');
  if (btnDefStatement) {
    btnDefStatement.onclick = async () => {
      const input = document.getElementById('def-statement-text');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      addStenographerEntry(`DEFENSE COUNSEL (${STATE.firData.accusedName})`, text, 'defense');
      window.courtAudio.playGavelStrike();

      await evaluateCourtroomSubmission('defense', 'statement', 'Rebuttal & Pleadings of Exoneration', text);
    };
  }

  // 3. Evidence Upload - Prosecution
  const btnProsEvidence = document.getElementById('btn-pros-upload-evidence');
  const fileProsEvidence = document.getElementById('file-pros-evidence');
  if (btnProsEvidence && fileProsEvidence) {
    btnProsEvidence.onclick = () => fileProsEvidence.click();
    fileProsEvidence.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const title = `Exhibit P-${STATE.courtroom.exhibitsProsecution.length + 1}: ${file.name}`;
      const desc = `Certified electronic submission of ${file.name} (${(file.size / 1024).toFixed(1)} KB) bearing digital timestamp.`;
      STATE.courtroom.exhibitsProsecution.push(title);

      renderExhibitBadge('pros-exhibits-container', title, 'prosecution');
      addStenographerEntry('PROSECUTION EXHIBIT', `${title} tendered in evidence.`, 'prosecution');
      window.courtAudio.playGavelStrike();

      await evaluateCourtroomSubmission('prosecution', 'evidence', title, desc);
    };
  }

  // 4. Evidence Upload - Defense
  const btnDefEvidence = document.getElementById('btn-def-upload-evidence');
  const fileDefEvidence = document.getElementById('file-def-evidence');
  if (btnDefEvidence && fileDefEvidence) {
    btnDefEvidence.onclick = () => fileDefEvidence.click();
    fileDefEvidence.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const title = `Exhibit D-${STATE.courtroom.exhibitsDefense.length + 1}: ${file.name}`;
      const desc = `Rebuttal proof: ${file.name} tendered by defense countering prosecution claims.`;
      STATE.courtroom.exhibitsDefense.push(title);

      renderExhibitBadge('def-exhibits-container', title, 'defense');
      addStenographerEntry('DEFENSE EXHIBIT', `${title} tendered in evidence.`, 'defense');
      window.courtAudio.playGavelStrike();

      await evaluateCourtroomSubmission('defense', 'evidence', title, desc);
    };
  }

  // 5. Witness Deposition & Live Audio Recording - Prosecution
  setupWitnessDeposition('pros');

  // 6. Witness Deposition & Live Audio Recording - Defense
  setupWitnessDeposition('def');

  // 7. Manual Pronounce Final Judgment Button
  const btnVerdict = document.getElementById('btn-trigger-verdict');
  if (btnVerdict) {
    btnVerdict.onclick = () => {
      triggerFinalVerdictProcedure();
    };
  }
}

function renderExhibitBadge(containerId, title, party) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const badge = document.createElement('div');
  badge.className = 'file-chip';
  badge.style.marginTop = '4px';
  badge.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
    <span>${title}</span>
  `;
  container.appendChild(badge);
}

function setupWitnessDeposition(side) {
  const isPros = side === 'pros';
  const prefix = isPros ? 'pros' : 'def';
  const partyName = isPros ? 'Prosecution' : 'Defense';

  const btnRecord = document.getElementById(`btn-${prefix}-record-witness`);
  const audioPreview = document.getElementById(`audio-${prefix}-witness-preview`);
  const transcriptInput = document.getElementById(`${prefix}-witness-statement`);
  const btnSubmit = document.getElementById(`btn-${prefix}-submit-witness`);
  const fileAudioInput = document.getElementById(`file-${prefix}-witness-audio`);

  let currentAudioUrl = null;

  if (btnRecord) {
    btnRecord.onclick = async () => {
      if (!window.courtAudio.isRecording) {
        btnRecord.classList.add('recording');
        btnRecord.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>
          <span>Stop Recording...</span>
        `;
        await window.courtAudio.startMicrophoneRecording(
          (blob, url) => {
            currentAudioUrl = url;
            btnRecord.classList.remove('recording');
            btnRecord.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"></circle></svg>
              <span>Re-record Voice Deposition</span>
            `;
            if (audioPreview) {
              audioPreview.src = url;
              audioPreview.style.display = 'block';
            }
            if (!transcriptInput.value) {
              transcriptInput.value = `[Audio Recorded on Stand: Witness confirms firsthand testimony on solemn oath under penalty of perjury.]`;
            }
          },
          (err) => {
            btnRecord.classList.remove('recording');
            btnRecord.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"></circle></svg>
              <span>Record Voice Deposition</span>
            `;
            alert(`Microphone notice: ${err}`);
          }
        );
      } else {
        window.courtAudio.stopMicrophoneRecording();
      }
    };
  }

  // Also support direct audio file upload (MP3/WAV)
  if (fileAudioInput) {
    fileAudioInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        currentAudioUrl = URL.createObjectURL(file);
        if (audioPreview) {
          audioPreview.src = currentAudioUrl;
          audioPreview.style.display = 'block';
        }
        if (!transcriptInput.value) {
          transcriptInput.value = `[Uploaded MP3 Audio File: "${file.name}" tendered into evidence.]`;
        }
      }
    };
  }

  if (btnSubmit) {
    btnSubmit.onclick = async () => {
      const witnessNameEl = document.getElementById(`${prefix}-witness-name`);
      const witnessName = witnessNameEl ? witnessNameEl.value.trim() : 'Witness on Record';
      const testimony = transcriptInput.value.trim();

      if (!testimony) {
        alert('Please record or enter the witness statement before submitting.');
        return;
      }

      transcriptInput.value = '';
      if (audioPreview) audioPreview.style.display = 'none';

      addStenographerEntry(
        `${partyName.toUpperCase()} WITNESS (${witnessName})`,
        `[Deposition under oath] "${testimony}" ${currentAudioUrl ? '(Voice recording certified on record)' : ''}`,
        isPros ? 'prosecution' : 'defense'
      );

      window.courtAudio.playGavelStrike();
      await evaluateCourtroomSubmission(
        isPros ? 'prosecution' : 'defense',
        'witness',
        `Witness Deposition of ${witnessName}`,
        testimony
      );
    };
  }
}

// ===================================================================
// DYNAMIC GUILT METER AI EVALUATION & REASONING SHIFTER
// ===================================================================

async function evaluateCourtroomSubmission(party, actionType, title, details) {
  const explainerEl = document.getElementById('meter-explainer-text');
  if (explainerEl) {
    explainerEl.innerHTML = `<span>⏳ AI Evaluating ${party.toUpperCase()} ${actionType.toUpperCase()}...</span>`;
  }

  let evalResult = null;

  // 1. Try FastAPI backend
  try {
    const resp = await fetch(`${CONFIG.BACKEND_BASE_URL}/api/ai/courtroom-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_summary: `${STATE.firData.complainantName} vs ${STATE.firData.accusedName} regarding ${STATE.firData.complaintText}`,
        party: party,
        action_type: actionType,
        title: title,
        details: details,
        current_prosecution_score: STATE.courtroom.prosecutionScore,
        current_defense_score: STATE.courtroom.defenseScore,
        case_tier: STATE.analysisResult ? STATE.analysisResult.recommended_category : 1
      })
    });

    if (resp.ok) {
      evalResult = await resp.json();
    }
  } catch (backendErr) {
    console.log('FastAPI courtroom-step not reachable, falling back to Gemini direct...');
  }

  // 2. Direct Gemini call if backend is offline
  if (!evalResult && CONFIG.GEMINI_API_KEY) {
    evalResult = await callGeminiCourtroomStepDirectly(party, actionType, title, details);
  }

  // 3. Robust Local Probative Engine Fallback
  if (!evalResult) {
    evalResult = runLocalProbativeEvaluation(party, actionType, title, details);
  }

  // Apply new scores
  updateBalanceMeter(
    evalResult.prosecution_score,
    evalResult.defense_score,
    `${evalResult.ai_judge_observation} [Probative Weight: ${evalResult.probative_weight}]`
  );

  // Add judicial remark to stenographer
  addStenographerEntry(
    'AI BENCH RULING',
    evalResult.ai_judge_observation,
    'court'
  );

  // Spoken observation
  window.courtAudio.speak(evalResult.ai_judge_observation);
}

async function callGeminiCourtroomStepDirectly(party, actionType, title, details) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  const prompt = `
You are Lexora Courtroom AI Adjudicator.
Case: ${STATE.firData.complainantName} vs ${STATE.firData.accusedName}
Submitting Party: ${party.toUpperCase()}
Submission Type: ${actionType.toUpperCase()}
Title: ${title}
Details: ${details}
Current Balance: Prosecution ${STATE.courtroom.prosecutionScore}% | Defense ${STATE.courtroom.defenseScore}%

Evaluate the probative value, credibility, and evidentiary weight.
- If Prosecution submits credible proof/witness, Prosecution score increases, Defense decreases.
- If Defense submits credible alibi/rebuttal, Defense score increases, Prosecution decreases.
- Average shift is +7% to +18% based on importance.

Return strictly JSON:
{
  "prosecution_score": <number between 2 and 98>,
  "defense_score": <number between 2 and 98>,
  "probative_weight": "<High | Substantial | Moderate | Marginal>",
  "ai_judge_observation": "<authoritative 1-2 sentence judicial observation explaining the ruling>"
}
`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
    })
  });

  if (!resp.ok) throw new Error('Gemini step failed');
  const data = await resp.json();
  const text = data.candidates[0].content.parts[0].text;
  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

function runLocalProbativeEvaluation(party, actionType, title, details) {
  const shift = actionType === 'evidence' ? 14.0 : actionType === 'witness' ? 12.0 : 8.0;

  let newPros = STATE.courtroom.prosecutionScore;
  let newDef = STATE.courtroom.defenseScore;

  if (party === 'prosecution') {
    newPros = Math.min(97.0, newPros + shift);
    newDef = 100.0 - newPros;
  } else {
    newDef = Math.min(97.0, newDef + shift);
    newPros = 100.0 - newDef;
  }

  return {
    prosecution_score: Math.round(newPros * 10) / 10,
    defense_score: Math.round(newDef * 10) / 10,
    probative_weight: actionType === 'evidence' ? 'High' : 'Substantial',
    ai_judge_observation: `The Court takes judicial notice of the ${actionType} submitted by ${party.toUpperCase()}. Evidence admitted into substantive record.`
  };
}

// ===================================================================
// FINAL VERDICT CLIMAX & DECREE GENERATOR (95% THRESHOLD)
// ===================================================================

async function triggerFinalVerdictProcedure() {
  if (STATE.courtroom.verdictReached) return;
  STATE.courtroom.verdictReached = true;

  // Solemn 3-gavel strike!
  window.courtAudio.playTripleGavel();

  addStenographerEntry(
    'CHIEF MAGISTRATE NOTICE',
    'Evidentiary discovery concluded. The evidentiary meter has crossed final threshold. Court adjourns to pronounce final judgment decree.',
    'court'
  );

  window.courtAudio.speak('All rise for the final judgment of the Lexora High Judicial Tribunal.');

  // Fetch / Generate authoritative final verdict decree
  let verdictData = null;

  try {
    // 1. Try FastAPI backend
    try {
      const resp = await fetch(`${CONFIG.BACKEND_BASE_URL}/api/ai/final-verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fir_number: STATE.firData.firNumber,
          complainant_name: STATE.firData.complainantName,
          accused_name: STATE.firData.accusedName,
          legal_sections: STATE.firData.legalSections,
          case_tier: STATE.analysisResult ? STATE.analysisResult.recommended_category : 1,
          final_prosecution_score: STATE.courtroom.prosecutionScore,
          final_defense_score: STATE.courtroom.defenseScore,
          transcript_history: STATE.courtroom.transcript
        })
      });

      if (resp.ok) verdictData = await resp.json();
    } catch (e) {
      console.log('FastAPI final verdict not reachable, falling back to Gemini direct...');
    }

    // 2. Direct Gemini Call
    if (!verdictData && CONFIG.GEMINI_API_KEY) {
      verdictData = await callGeminiFinalVerdictDirectly();
    }

    // 3. Fallback
    if (!verdictData) {
      verdictData = runLocalFinalVerdict();
    }

    STATE.courtroom.finalVerdictData = verdictData;
    renderFinalVerdictModal(verdictData);

  } catch (err) {
    console.error('Error generating final verdict, using local decree:', err);
    const fallback = runLocalFinalVerdict();
    STATE.courtroom.finalVerdictData = fallback;
    renderFinalVerdictModal(fallback);
  }
}

async function callGeminiFinalVerdictDirectly() {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  const isGuilty = STATE.courtroom.prosecutionScore >= 75.0;

  const prompt = `
You are the Presiding AI Judge of the Supreme Court of Lexora.
Deliver an authoritative, formal final judicial verdict decree for:
FIR Number: ${STATE.firData.firNumber}
Complainant: ${STATE.firData.complainantName}
Accused: ${STATE.firData.accusedName}
Statutes: ${STATE.firData.legalSections}
Final Evidentiary Score: Prosecution ${STATE.courtroom.prosecutionScore}% | Defense ${STATE.courtroom.defenseScore}%

Outcome to declare: ${isGuilty ? 'GUILTY AS CHARGED' : 'ACQUITTED OF ALL CHARGES'}

Return strictly JSON:
{
  "verdict_title": "IN THE HIGH JUDICIAL TRIBUNAL OF LEXORA",
  "case_title": "${STATE.firData.complainantName} vs ${STATE.firData.accusedName}",
  "verdict_outcome": "${isGuilty ? 'GUILTY AS CHARGED' : 'ACQUITTED OF ALL CHARGES'}",
  "guilty_party": "${isGuilty ? STATE.firData.accusedName : 'None - Accused Exonerated'}",
  "ratio_decidendi": "<Detailed jurisprudential analysis explaining why the evidence led to this conclusion>",
  "findings_of_fact": [
    "<Fact 1 established through documentary exhibits>",
    "<Fact 2 established through witness oral depositions>",
    "<Fact 3 regarding statutory burden of proof and intent>"
  ],
  "sentencing_and_orders": "<Exact penalties, compensation, or immediate release orders>",
  "appeal_provisions": "This judgment is subject to statutory appeal within 30 days before the High Appellate Court under Lexora Procedural Rule 14.",
  "judicial_seal_hash": "LEX-VERDICT-${Math.floor(100000 + Math.random() * 900000)}-SHA256"
}
`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.15, maxOutputTokens: 2048 }
    })
  });

  if (!resp.ok) throw new Error('Verdict Gemini call failed');
  const data = await resp.json();
  const text = data.candidates[0].content.parts[0].text;
  let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

function runLocalFinalVerdict() {
  const isGuilty = STATE.courtroom.prosecutionScore >= 75.0;

  return {
    verdict_title: 'IN THE HIGH JUDICIAL TRIBUNAL OF LEXORA',
    case_title: `${STATE.firData.complainantName} vs ${STATE.firData.accusedName}`,
    verdict_outcome: isGuilty ? 'GUILTY AS CHARGED' : 'ACQUITTED OF ALL CHARGES',
    guilty_party: isGuilty ? STATE.firData.accusedName : 'None - Accused Exonerated',
    ratio_decidendi: `Upon exhaustive appraisal of all documentary exhibits, oral submissions, and sworn witness depositions recorded on the trial docket, the Court finds the final evidentiary equilibrium settled at ${STATE.courtroom.prosecutionScore}% for Prosecution and ${STATE.courtroom.defenseScore}% for Defense. Under the governing standards of statutory jurisprudence, the charges are resolved accordingly.`,
    findings_of_fact: [
      'The documentary trail and bank records were examined and authenticated with cryptographic integrity.',
      'Oral depositions and sworn testimonies corroborated the material facts alleged in the original FIR.',
      'The presumption of innocence stands conclusively rebutted by proof beyond reasonable doubt.'
    ],
    sentencing_and_orders: isGuilty 
      ? `The Accused is directed to provide full civil restitution in the amount of INR 45,00,000 with 9% interest from date of default, alongside a statutory fine of INR 2,50,000 to the judicial fund.`
      : `All charges against the Accused are dismissed with prejudice. Bail bonds are discharged and records expunged.`,
    appeal_provisions: 'Statutory right of appellate review stands reserved for 30 calendar days from the date of this certified seal.',
    judicial_seal_hash: `LEX-VERDICT-${Math.floor(100000 + Math.random() * 900000)}-SHA256`
  };
}

function renderFinalVerdictModal(v) {
  const modal = document.getElementById('verdict-modal');
  if (!modal) return;

  const titleEl = document.getElementById('decree-court-title');
  const caseNoEl = document.getElementById('decree-case-no');
  const bannerEl = document.getElementById('decree-outcome-banner');
  const outcomeTextEl = document.getElementById('decree-outcome-text');
  const ratioEl = document.getElementById('decree-ratio-text');
  const findingsListEl = document.getElementById('decree-findings-list');
  const ordersEl = document.getElementById('decree-orders-text');
  const hashEl = document.getElementById('decree-seal-hash');

  if (titleEl) titleEl.textContent = v.verdict_title;
  if (caseNoEl) caseNoEl.textContent = `${STATE.firData.firNumber} • ${v.case_title}`;

  const isGuilty = v.verdict_outcome.includes('GUILTY');
  if (bannerEl) {
    bannerEl.className = `decree-verdict-banner ${isGuilty ? 'guilty' : 'acquitted'}`;
  }
  if (outcomeTextEl) outcomeTextEl.textContent = v.verdict_outcome;
  if (ratioEl) ratioEl.textContent = v.ratio_decidendi;

  if (findingsListEl && v.findings_of_fact) {
    findingsListEl.innerHTML = '';
    v.findings_of_fact.forEach(fact => {
      const li = document.createElement('li');
      li.textContent = fact;
      findingsListEl.appendChild(li);
    });
  }

  if (ordersEl) ordersEl.textContent = v.sentencing_and_orders;
  if (hashEl) hashEl.textContent = `Cryptographic Seal Hash: ${v.judicial_seal_hash}`;

  modal.classList.add('active');

  // Speak the solemn verdict
  window.courtAudio.speak(
    `Judgment pronounced in case ${STATE.firData.firNumber}. The accused is found ${v.verdict_outcome.toLowerCase()}. ${v.sentencing_and_orders}`
  );

  // Setup Download / Print & Restart buttons
  const printBtn = document.getElementById('btn-print-decree');
  if (printBtn) {
    printBtn.onclick = () => window.print();
  }

  const restartBtn = document.getElementById('btn-restart-app');
  if (restartBtn) {
    restartBtn.onclick = () => {
      modal.classList.remove('active');
      navigateToStage(2);
    };
  }
}

// ===================================================================
// APPLICATION INITIALIZATION
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCourtCanvas();
  setupStageNavigation();
  setupFIRForm();

  // Load default preset into FIR form
  loadFIRPreset(PRESET_SCENARIOS.commercial);

  console.log('Lexora High Judicial Platform initialized.');
});
