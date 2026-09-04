import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { spawn, ChildProcess } from 'child_process';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_WELLS, BAGHEWALA_FIELD_SUMMARY, getDynacardForWell } from './src/data/mockWells.ts';
import { simulateWellScenario } from './src/services/physicsEngine.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const FASTAPI_PORT = 8000;
const FASTAPI_HOST = '127.0.0.1';
const FASTAPI_URL = `http://${FASTAPI_HOST}:${FASTAPI_PORT}`;

// Manage FastAPI Python 3.10 ASGI server
let fastApiProcess: ChildProcess | null = null;
let fastApiReady = false;

function spawnFastApi(): void {
  try {
    console.log(`[FastAPI] Spawning Python 3.10 Uvicorn process on ${FASTAPI_HOST}:${FASTAPI_PORT}...`);
    fastApiProcess = spawn('python3', [
      '-m', 'uvicorn',
      'backend.main:app',
      '--host', FASTAPI_HOST,
      '--port', String(FASTAPI_PORT)
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    fastApiProcess.stdout?.on('data', (chunk) => {
      const msg = chunk.toString().trim();
      console.log(`[FastAPI] ${msg}`);
      if (msg.includes('Application startup complete') || msg.includes('Uvicorn running')) {
        fastApiReady = true;
      }
    });

    fastApiProcess.stderr?.on('data', (chunk) => {
      const msg = chunk.toString().trim();
      console.log(`[FastAPI info] ${msg}`);
      if (msg.includes('Application startup complete') || msg.includes('Uvicorn running')) {
        fastApiReady = true;
      }
    });

    fastApiProcess.on('exit', (code, signal) => {
      console.warn(`[FastAPI] Process exited with code ${code}, signal ${signal}`);
      fastApiReady = false;
    });
  } catch (err) {
    console.error('[FastAPI] Failed to spawn process:', err);
  }
}

// Cleanup spawned child process on node exit
process.on('SIGINT', () => {
  if (fastApiProcess) fastApiProcess.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  if (fastApiProcess) fastApiProcess.kill();
  process.exit();
});

// Launch FastAPI right away in background
spawnFastApi();

app.use(express.json());

// Forward requests to FastAPI REST API, Swagger UI (/docs), ReDoc (/redoc), and OpenAPI (/openapi.json)
app.use(async (req, res, next) => {
  const url = req.originalUrl || req.url;
  const isApiOrDocs = (
    url.startsWith('/api/') || 
    url === '/api' || 
    url === '/docs' || 
    url.startsWith('/docs') || 
    url === '/redoc' || 
    url.startsWith('/redoc') || 
    url === '/openapi.json'
  );

  if (!isApiOrDocs) {
    return next();
  }

  try {
    const targetUrl = `${FASTAPI_URL}${url}`;
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (k.toLowerCase() !== 'host' && typeof v === 'string') {
        headers[k] = v;
      }
    }

    const init: RequestInit = {
      method: req.method,
      headers: {
        ...headers,
        'host': `${FASTAPI_HOST}:${FASTAPI_PORT}`,
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
      init.body = typeof req.body === 'object' ? JSON.stringify(req.body) : String(req.body);
      headers['content-type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    init.signal = controller.signal;

    const fastApiResponse = await fetch(targetUrl, init);
    clearTimeout(timeoutId);

    res.status(fastApiResponse.status);
    fastApiResponse.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (!['transfer-encoding', 'content-encoding', 'connection'].includes(lower)) {
        res.setHeader(key, val);
      }
    });

    const buffer = await fastApiResponse.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    // If FastAPI is still initializing, gracefully proceed to Express fallback routes
    console.warn(`[FastAPI Forward] Forwarding to fallback for ${url}:`, (err as Error).message);
    next();
  }
});

// In-memory state for live interactive prototype
let wellsFleet = [...INITIAL_WELLS];

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BagheTwin',
    field: 'Baghewala Heavy Oil Field',
    operator: 'Oil India Limited',
    activeWells: wellsFleet.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. Fleet Summary & Wells
app.get('/api/fleet', (req, res) => {
  // Compute dynamically based on current fleet state
  const totalOilRate = wellsFleet.reduce((acc, w) => acc + w.production.oilRate_bopd, 0);
  const totalSteaming = wellsFleet.filter(w => w.stage === 'INJECTION').length;
  const totalSoaking = wellsFleet.filter(w => w.stage === 'SOAKING').length;
  const totalCutoff = wellsFleet.filter(w => w.stage === 'CYCLE_CUTOFF_PENDING').length;
  const totalProducing = wellsFleet.filter(w => w.stage === 'PRODUCTION').length;
  const rodAlerts = wellsFleet.filter(w => w.reliability.rodFailureProbability_pct > 60).length;

  const producingWithFill = wellsFleet.filter(w => w.srp.pumpFillage_pct > 0);
  const avgFillage = producingWithFill.length > 0 
    ? Number((producingWithFill.reduce((a, b) => a + b.srp.pumpFillage_pct, 0) / producingWithFill.length).toFixed(1))
    : 0;

  res.json({
    summary: {
      ...BAGHEWALA_FIELD_SUMMARY,
      totalOilRate_bopd: Number(totalOilRate.toFixed(1)),
      producingWells: totalProducing,
      steamingWells: totalSteaming,
      soakingWells: totalSoaking,
      cutoffPendingWells: totalCutoff,
      activeRodRiskAlerts: rodAlerts,
      averagePumpFillage_pct: avgFillage,
    },
    wells: wellsFleet,
  });
});

// 3. Single Well Deep-Dive & Dynacard
app.get('/api/wells/:id', (req, res) => {
  const well = wellsFleet.find(w => w.id === req.params.id);
  if (!well) {
    return res.status(404).json({ error: 'Well not found' });
  }
  const dynacard = getDynacardForWell(well);
  res.json({ well, dynacard });
});

// 4. Run Physics-AI Joint Optimizer
app.post('/api/optimize', (req, res) => {
  const { wellId } = req.body;
  const well = wellsFleet.find(w => w.id === wellId);
  if (!well) {
    return res.status(404).json({ error: 'Well not found' });
  }

  // If well already has recommendation, return it or generate fresh one
  if (well.activeRecommendation) {
    return res.json({ recommendation: well.activeRecommendation });
  }

  // Generate recommendation for wells without one
  const isCooling = well.reservoir.nearWellboreTemp_c < 90;
  const newSpm = isCooling ? Math.max(3.8, Number((well.srp.spm - 0.8).toFixed(1))) : Math.min(6.5, Number((well.srp.spm + 0.4).toFixed(1)));
  const newFillage = isCooling ? Math.min(95, well.srp.pumpFillage_pct + 18) : well.srp.pumpFillage_pct;
  const newOil = Number((well.production.oilRate_bopd * (isCooling ? 1.08 : 1.05)).toFixed(1));

  const recommendation = {
    id: `REC-${well.id}-${Date.now()}`,
    wellId: well.id,
    generatedAt: new Date().toISOString(),
    status: 'PENDING_APPROVAL' as const,
    current: {
      spm: well.srp.spm,
      strokeLength_in: well.srp.strokeLength_in,
      vfdFrequency_hz: well.srp.vfdFrequency_hz,
      steamVolume_m3: well.css.targetSteamVolume_m3,
      soakDays: well.css.soakDaysTotal,
      oilRate_bopd: well.production.oilRate_bopd,
      sor: well.css.currentSor,
      rodFailureRisk_pct: well.reliability.rodFailureProbability_pct,
      dailyEnergy_kwh: well.srp.dailyEnergy_kwh,
    },
    recommended: {
      spm: newSpm,
      strokeLength_in: well.srp.strokeLength_in,
      vfdFrequency_hz: Number((newSpm * 8.3).toFixed(1)),
      steamVolume_m3: 2600,
      soakDays: 5,
      projectedOilRate_bopd: newOil,
      projectedSor: Number((well.css.currentSor * 0.82).toFixed(2)),
      projectedRodFailureRisk_pct: Math.max(12, Math.round(well.reliability.rodFailureProbability_pct * 0.35)),
      projectedDailyEnergy_kwh: Math.round(well.srp.dailyEnergy_kwh * 0.85),
    },
    deltas: {
      deltaOilRate_bopd: Number((newOil - well.production.oilRate_bopd).toFixed(1)),
      deltaOilRatePct: Number((((newOil - well.production.oilRate_bopd) / Math.max(1, well.production.oilRate_bopd)) * 100).toFixed(1)),
      deltaSorPct: -18.0,
      deltaRodRiskPct: -65.0,
      deltaDailyEnergyPct: -15.0,
      projectedMonthlyNetBenefit_inr: 395000,
    },
    engineeringRationale: [
      `Adjusted pumping speed to ${newSpm} SPM to match inflow capacity and prevent viscous drag rod-float at ${well.reservoir.effectiveViscosity_cp} cP.`,
      `Estimated pump volumetric fillage increases to ${newFillage}% through smoother valve seating.`,
      `Maintains sucker rod stress below API Spec 11L limits while lowering daily motor energy by ~15%.`,
    ],
    physicsConstraintsChecks: [
      { name: 'API Goodman Tensile Stress', status: 'PASS' as const, limit: '< 85%', actual: '62.4%' },
      { name: 'VFD Inverter Thermal Window', status: 'PASS' as const, limit: '25-55 Hz', actual: `${(newSpm * 8.3).toFixed(1)} Hz` },
      { name: 'Submergence Pressure Buffer', status: 'PASS' as const, limit: '> 200 psi', actual: '340 psi' },
    ],
    shapFeatureImportance: [
      { feature: 'Effective Downhole Viscosity', importance: 0.38, direction: 'negative' as const },
      { feature: 'Pumping Velocity (SPM)', importance: 0.32, direction: 'negative' as const },
      { feature: 'Thermal Dissipation Gradient', importance: 0.18, direction: 'negative' as const },
      { feature: 'Fluid Submergence Head', importance: 0.12, direction: 'positive' as const },
    ],
  };

  res.json({ recommendation });
});

// 5. Apply Optimization Action (Human-in-the-Loop approval)
app.post('/api/apply-recommendation', (req, res) => {
  const { wellId, recommendationId } = req.body;
  const wellIndex = wellsFleet.findIndex(w => w.id === wellId);
  if (wellIndex === -1) {
    return res.status(404).json({ error: 'Well not found' });
  }

  const well = wellsFleet[wellIndex];
  if (well.activeRecommendation) {
    const rec = well.activeRecommendation;
    rec.status = 'APPLIED';
    rec.appliedAt = new Date().toISOString();

    // Update well live parameters based on recommended setpoints
    well.srp.spm = rec.recommended.spm;
    well.srp.vfdFrequency_hz = rec.recommended.vfdFrequency_hz;
    well.production.oilRate_bopd = rec.recommended.projectedOilRate_bopd;
    well.reliability.rodFailureProbability_pct = rec.recommended.projectedRodFailureRisk_pct;
    well.srp.pumpFillage_pct = Math.min(95, well.srp.pumpFillage_pct + 18);
    well.srp.rodFloatRisk_pct = Math.round(rec.recommended.projectedRodFailureRisk_pct * 0.7);
    well.status = rec.recommended.projectedRodFailureRisk_pct > 60 ? 'WARNING' : 'OPTIMAL';
    well.reliability.healthScore_pct = Math.min(98, 100 - well.reliability.rodFailureProbability_pct);

    wellsFleet[wellIndex] = { ...well };
  }

  res.json({ success: true, updatedWell: wellsFleet[wellIndex] });
});

// 6. Simulate What-If Scenarios
app.post('/api/simulate', (req, res) => {
  const { wellId, deltaSpm, deltaSteamVolume_pct, deltaSoakDays, vfdFrequency_hz } = req.body;
  const well = wellsFleet.find(w => w.id === wellId);
  if (!well) {
    return res.status(404).json({ error: 'Well not found' });
  }

  const result = simulateWellScenario(well, {
    wellId,
    deltaSpm: deltaSpm || 0,
    deltaSteamVolume_pct: deltaSteamVolume_pct || 0,
    deltaSoakDays: deltaSoakDays || 0,
    vfdFrequency_hz: vfdFrequency_hz || well.srp.vfdFrequency_hz,
  });

  res.json({ simulation: result });
});

// 7. Gemini AI Petroleum Advisor
app.post('/api/ai-advisor', async (req, res) => {
  const { question, wellId, context } = req.body;
  const targetWell = wellsFleet.find(w => w.id === wellId) || wellsFleet[0];

  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are the Lead Petroleum Reservoir & Production AI Specialist for Oil India Limited (OIL) on the Baghewala Field Digital Twin ("BagheTwin").
The reservoir is Jodhpur Sandstone at 1,150m depth with extra-heavy crude (10,000 - 13,000 cP native viscosity at 48°C, 17-19° API).
Thermal EOR uses Cyclic Steam Stimulation (CSS) and artificial lift uses Sucker Rod Pumps (SRP).

Well Context for ${targetWell.name} (${targetWell.id}):
- Pad: ${targetWell.pad}
- Current Stage: ${targetWell.stage} (Cycle #${targetWell.css.cycleNumber}, Day ${targetWell.css.stageDayCount})
- Near-Wellbore Temp: ${targetWell.reservoir.nearWellboreTemp_c}°C
- Effective Crude Viscosity: ${targetWell.reservoir.effectiveViscosity_cp} cP
- SRP Speed: ${targetWell.srp.spm} SPM, Stroke: ${targetWell.srp.strokeLength_in} in, VFD: ${targetWell.srp.vfdFrequency_hz} Hz
- Pump Fillage: ${targetWell.srp.pumpFillage_pct}%, Rod Float Risk: ${targetWell.srp.rodFloatRisk_pct}%
- Oil Rate: ${targetWell.production.oilRate_bopd} BOPD, Current SOR: ${targetWell.css.currentSor}
- Rod Failure Probability: ${targetWell.reliability.rodFailureProbability_pct}% (Predicted RUL: ${targetWell.reliability.predictedRul_days} days)
- Goodman Stress Ratio: ${targetWell.srp.goodmanStressRatio_pct}%

User Query: "${question}"

Provide a professional, rigorous, and actionable engineering diagnostic response with:
1. Root-Cause Analysis (connecting thermal cooling, viscosity changes, and mechanical SRP stress)
2. Closed-Loop Optimization Recommendation (CSS steam parameters and SRP setpoint adjustments)
3. Safety & Economic Rationale (Goodman diagram limits, SOR economic cut-off, and prevented downtime)
Keep the tone clear, authoritative, and structured with concise bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({
        answer: response.text,
        source: 'Gemini 2.5 Flash - Petroleum Copilot',
      });
    }
  } catch (error) {
    console.error('Gemini API call failed, falling back to local petroleum expert rules:', error);
  }

  // Resilient fallback rule-based expert answer
  let fallbackAnswer = '';
  if (question.toLowerCase().includes('rod') || question.toLowerCase().includes('drag') || question.toLowerCase().includes('float')) {
    fallbackAnswer = `### Diagnostic Analysis for ${targetWell.name}: Sucker Rod Fluid Drag & Rod-Float Risk
- **Root Cause**: The reservoir near-wellbore temperature has cooled to **${targetWell.reservoir.nearWellboreTemp_c}°C**, causing crude viscosity to surge to **${targetWell.reservoir.effectiveViscosity_cp} cP**.
- **Mechanical Phenomenon**: At **${targetWell.srp.spm} SPM**, the downstroke velocity of the sucker rod string exceeds its buoyant terminal velocity in viscous fluid. Viscous shear stress exerts upward resistive drag, preventing full elongation and causing rod compression/floating.
- **Goodman Stress Ratio**: Currently **${targetWell.srp.goodmanStressRatio_pct}%** (API Spec 11L threshold is 85%).
- **Corrective Action**: Reduce VFD frequency to operate at **${Math.max(3.8, targetWell.srp.spm - 0.9).toFixed(1)} SPM**. This eliminates downstroke compression, restores valve seating tension, and improves pump fillage from ${targetWell.srp.pumpFillage_pct}% to ~84%.`;
  } else if (question.toLowerCase().includes('steam') || question.toLowerCase().includes('css') || question.toLowerCase().includes('cutoff')) {
    fallbackAnswer = `### CSS Cycle & Thermal Strategy Analysis for ${targetWell.name}
- **Current Cycle**: Cycle #${targetWell.css.cycleNumber}, Day ${targetWell.css.stageDayCount} in ${targetWell.css.stage}.
- **Steam-Oil Ratio (SOR)**: Current SOR is **${targetWell.css.currentSor}** (Economic limit for Baghewala heavy oil is ~5.20).
- **Thermal Front**: Effective heated radius is **${targetWell.reservoir.thermalRadius_m} m**.
- **Optimal Cut-Off Date**: Model projects economic break-even on Day **${targetWell.css.economicCutoffPredictedDay}**.
- **Recommendation**: Plan CSS Cycle #${targetWell.css.cycleNumber + 1} with **2,650 m³ steam @ 80% quality** and 5 days soak. Pre-heating will drop crude viscosity from ${targetWell.reservoir.effectiveViscosity_cp} cP back to < 95 cP.`;
  } else {
    fallbackAnswer = `### Operational Summary for ${targetWell.name} (${targetWell.id})
- **Wellbore Depth**: ${targetWell.reservoir.reservoirDepth_m} m (Jodhpur Sandstone)
- **Current Operating Point**: ${targetWell.srp.spm} SPM | ${targetWell.production.oilRate_bopd} BOPD | SOR ${targetWell.css.currentSor}
- **Equipment Health**: Health Score ${targetWell.reliability.healthScore_pct}%, Rod Failure Risk ${targetWell.reliability.rodFailureProbability_pct}%, Estimated RUL ${targetWell.reliability.predictedRul_days} days.
- **Closed-Loop Recommendation**: Jointly adjust VFD to match thermal decline and schedule next cyclic steam injection to optimize life-cycle Net Present Value.`;
  }

  return res.json({
    answer: fallbackAnswer,
    source: 'BagheTwin Petroleum Expert Rules Engine',
  });
});

// Vite Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BagheTwin Server running on port ${PORT}`);
  });
}

startServer();
