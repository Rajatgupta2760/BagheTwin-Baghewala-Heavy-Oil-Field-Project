import { Well, FieldSummary, DynacardData } from '../types';

export const BAGHEWALA_FIELD_SUMMARY: FieldSummary = {
  fieldName: 'Baghewala Heavy Oil Field',
  operator: 'Oil India Limited (OIL) - Rajasthan Project',
  formation: 'Jodhpur Sandstone (Bikaner-Nagaur Basin)',
  nativeViscosityRange: '10,000 - 13,000 cP @ 50°C (17-19° API)',
  totalWells: 23,
  producingWells: 16,
  steamingWells: 3,
  soakingWells: 2,
  cutoffPendingWells: 2,
  totalOilRate_bopd: 914.5,
  totalSteamInjection_t_day: 380,
  averageSor: 3.42,
  averagePumpFillage_pct: 78.4,
  averageFleetViscosity_cp: 340, // currently producing wells with heated zones
  activeRodRiskAlerts: 3,
  dailyEnergy_mwh: 18.6,
  fleetHealthAvg_pct: 84.2,
};

// Generate realistic 30-day historical time-series for a well
function generateHistory(baseOil: number, baseTemp: number, baseVisc: number, baseSor: number, baseSpm: number, baseFillage: number, baseRisk: number) {
  const history = [];
  for (let i = 29; i >= 0; i--) {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - i);
    
    // As days pass since steam injection, temperature slowly decays, viscosity increases, oil rate declines
    const decayFactor = 1 + (i - 15) * 0.015;
    const oil = Math.max(12, Math.round(baseOil * (1 + (15 - i) * 0.02) + (Math.random() * 4 - 2)));
    const temp = Math.max(52, Math.round(baseTemp + (15 - i) * 1.8 + (Math.random() * 2 - 1)));
    // Viscosity follows Andrade-type equation ln(mu) = a + b/T
    const visc = Math.round(11000 * Math.exp(-0.028 * (temp - 48)));
    const sor = Number((baseSor + (i > 15 ? (i - 15) * 0.08 : 0) + (Math.random() * 0.2 - 0.1)).toFixed(2));
    const fillage = Math.min(98, Math.max(45, Math.round(baseFillage + (Math.random() * 6 - 3))));
    const risk = Math.min(95, Math.max(10, Math.round(baseRisk + (i < 5 ? 4 : -2) + (Math.random() * 3))));

    history.push({
      timestamp: dayAgo.toISOString().split('T')[0],
      oilRate_bopd: oil,
      temp_c: temp,
      viscosity_cp: visc,
      sor: sor,
      spm: Number((baseSpm + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      pumpFillage_pct: fillage,
      rodRisk_pct: risk,
    });
  }
  return history;
}

export const INITIAL_WELLS: Well[] = [
  {
    id: 'BGW-07',
    name: 'Baghewala Well #07',
    pad: 'Pad-North Alpha',
    status: 'WARNING',
    stage: 'PRODUCTION',
    reservoir: {
      reservoirZone: 'Jodhpur Sandstone Upper Member',
      reservoirDepth_m: 1148,
      initialPressure_psi: 1420,
      currentPressure_psi: 1180,
      nativeTemp_c: 48,
      nearWellboreTemp_c: 74, // cooling down after cycle 3
      nativeViscosity_cp: 11500,
      effectiveViscosity_cp: 820, // increased due to cooling!
      oilGravity_api: 18.2,
      permeability_md: 480,
      netPay_m: 14.5,
      productivityIndex_bopd_psi: 0.12,
      thermalRadius_m: 22.4,
    },
    wellbore: {
      casingSize_in: 9.625,
      tubingSize_in: 3.5,
      pumpDepth_m: 1080,
      fluidLevel_m: 340,
      flowingBottomholePressure_psi: 620,
      tubingHeadPressure_psi: 110,
      casingHeadPressure_psi: 45,
      wellheadTemp_c: 62,
      gasAnchorInstalled: true,
    },
    css: {
      cycleNumber: 4,
      stage: 'PRODUCTION',
      stageDayCount: 68,
      targetSteamVolume_m3: 2400,
      cumulativeSteamInjected_m3: 2420,
      steamQuality_pct: 78,
      steamInjectionPressure_psi: 1850,
      steamTemp_c: 260,
      soakDaysTotal: 5,
      soakDaysRemaining: 0,
      currentSor: 4.85, // approaching economic cut-off
      cumulativeOilThisCycle_bbl: 3840,
      economicCutoffPredictedDay: 75,
      recommendedNextCycleDate: '2026-09-12',
    },
    srp: {
      spm: 5.8, // currently running too fast for cooling crude!
      strokeLength_in: 74,
      vfdFrequency_hz: 48.3,
      motorPower_kw: 28.5,
      motorCurrent_a: 44.2,
      peakPolishedRodLoad_lbs: 23800,
      minPolishedRodLoad_lbs: 6200,
      goodmanStressRatio_pct: 88.4,
      pumpFillage_pct: 61,
      volumetricEfficiency_pct: 64,
      rodFloatRisk_pct: 74, // High risk of rod floating due to viscous drag
      pumpOffRisk_pct: 32,
      dailyEnergy_kwh: 540,
      energyPerBarrel_kwh: 12.8,
    },
    production: {
      oilRate_bopd: 42.2,
      liquidRate_blpd: 78.0,
      waterCut_pct: 45.9,
      gasRate_mscfd: 8.4,
      gasOilRatio_scf_bbl: 199,
    },
    reliability: {
      healthScore_pct: 68,
      rodFailureProbability_pct: 72,
      pumpFailureProbability_pct: 35,
      predictedRul_days: 14,
      sensorDataQuality_pct: 94,
      leadTimeBenchmark_days: 13.9,
      failureMechanismRisk: 'Viscous Downstroke Drag & Rod Compression Buckling',
      anomaliesDetected: [
        'Dynacard indicates heavy viscous friction causing retarded downstroke',
        'Polished rod stress amplitude nearing API Modified Goodman Envelope (88.4%)',
        'Current SOR (4.85) nearing economic cut-off threshold (5.20)',
      ],
    },
    activeRecommendation: {
      id: 'REC-BGW07-20260904',
      wellId: 'BGW-07',
      generatedAt: '2026-09-04T08:30:00Z',
      status: 'PENDING_APPROVAL',
      current: {
        spm: 5.8,
        strokeLength_in: 74,
        vfdFrequency_hz: 48.3,
        steamVolume_m3: 2400,
        soakDays: 5,
        oilRate_bopd: 42.2,
        sor: 4.85,
        rodFailureRisk_pct: 72,
        dailyEnergy_kwh: 540,
      },
      recommended: {
        spm: 4.9, // Lower SPM allows rod string to fall under gravity without buckling
        strokeLength_in: 74,
        vfdFrequency_hz: 40.8,
        steamVolume_m3: 2650, // for Cycle 5 preparation
        soakDays: 6,
        projectedOilRate_bopd: 45.6, // Higher pump fillage offsets lower SPM!
        projectedSor: 3.82,
        projectedRodFailureRisk_pct: 22,
        projectedDailyEnergy_kwh: 432,
      },
      deltas: {
        deltaOilRate_bopd: 3.4,
        deltaOilRatePct: 8.1,
        deltaSorPct: -21.2,
        deltaRodRiskPct: -69.4,
        deltaDailyEnergyPct: -20.0,
        projectedMonthlyNetBenefit_inr: 485000,
      },
      engineeringRationale: [
        'Thermal decay has increased crude viscosity from 120 cP to 820 cP, dramatically raising fluid drag against the rod string.',
        'At 5.8 SPM, polished rod downstroke velocity exceeds terminal fall velocity of the sucker rod string, causing compression stresses and rod-float.',
        'Reducing SPM from 5.8 to 4.9 via VFD (40.8 Hz) eliminates downstroke compression, increases pump fillage from 61% to 84%, and actually increases net oil production by +3.4 BOPD.',
        'Cycle 4 cut-off recommended on Day 74, scheduling CSS Cycle 5 with 2,650 m³ steam @ 80% quality to re-stimulate near-wellbore permeability.',
      ],
      physicsConstraintsChecks: [
        { name: 'API Modified Goodman Stress Ratio', status: 'PASS', limit: '< 85%', actual: '68.2% (down from 88.4%)' },
        { name: 'Minimum Rod Downstroke Tension', status: 'PASS', limit: '> 2,000 lbs', actual: '4,450 lbs (eliminates rod-float)' },
        { name: 'VFD Thermal Operating Envelope', status: 'PASS', limit: '30 - 55 Hz', actual: '40.8 Hz (Safe)' },
        { name: 'Submergence Pressure Buffer', status: 'PASS', limit: '> 250 psi', actual: '380 psi over bubble point' },
      ],
      shapFeatureImportance: [
        { feature: 'Fluid Viscosity @ Pump Depth', importance: 0.42, direction: 'negative' },
        { feature: 'Pumping Speed (SPM)', importance: 0.31, direction: 'negative' },
        { feature: 'Reservoir Heat Dissipation (dT/dt)', importance: 0.16, direction: 'negative' },
        { feature: 'Effective Net Stroke Length', importance: 0.11, direction: 'positive' },
      ],
    },
    history: generateHistory(42, 74, 820, 4.85, 5.8, 61, 72),
  },
  {
    id: 'BGW-12',
    name: 'Baghewala Well #12',
    pad: 'Pad-Central Bravo',
    status: 'OPTIMAL',
    stage: 'PRODUCTION',
    reservoir: {
      reservoirZone: 'Jodhpur Sandstone Main Pay',
      reservoirDepth_m: 1152,
      initialPressure_psi: 1435,
      currentPressure_psi: 1290,
      nativeTemp_c: 48,
      nearWellboreTemp_c: 142, // high temperature shortly after soak!
      nativeViscosity_cp: 12200,
      effectiveViscosity_cp: 94, // beautifully reduced viscosity!
      oilGravity_api: 18.6,
      permeability_md: 520,
      netPay_m: 16.2,
      productivityIndex_bopd_psi: 0.28,
      thermalRadius_m: 34.1,
    },
    wellbore: {
      casingSize_in: 9.625,
      tubingSize_in: 3.5,
      pumpDepth_m: 1090,
      fluidLevel_m: 180,
      flowingBottomholePressure_psi: 780,
      tubingHeadPressure_psi: 130,
      casingHeadPressure_psi: 50,
      wellheadTemp_c: 98,
      gasAnchorInstalled: true,
    },
    css: {
      cycleNumber: 3,
      stage: 'PRODUCTION',
      stageDayCount: 21,
      targetSteamVolume_m3: 2800,
      cumulativeSteamInjected_m3: 2810,
      steamQuality_pct: 82,
      steamInjectionPressure_psi: 1920,
      steamTemp_c: 275,
      soakDaysTotal: 6,
      soakDaysRemaining: 0,
      currentSor: 2.15,
      cumulativeOilThisCycle_bbl: 2180,
      economicCutoffPredictedDay: 95,
      recommendedNextCycleDate: '2026-11-20',
    },
    srp: {
      spm: 6.2,
      strokeLength_in: 86,
      vfdFrequency_hz: 51.6,
      motorPower_kw: 24.1,
      motorCurrent_a: 38.0,
      peakPolishedRodLoad_lbs: 21200,
      minPolishedRodLoad_lbs: 7400,
      goodmanStressRatio_pct: 68.1,
      pumpFillage_pct: 92,
      volumetricEfficiency_pct: 88,
      rodFloatRisk_pct: 8,
      pumpOffRisk_pct: 12,
      dailyEnergy_kwh: 480,
      energyPerBarrel_kwh: 7.2,
    },
    production: {
      oilRate_bopd: 66.8,
      liquidRate_blpd: 92.4,
      waterCut_pct: 27.7,
      gasRate_mscfd: 14.2,
      gasOilRatio_scf_bbl: 212,
    },
    reliability: {
      healthScore_pct: 94,
      rodFailureProbability_pct: 12,
      pumpFailureProbability_pct: 9,
      predictedRul_days: 180,
      sensorDataQuality_pct: 98,
      leadTimeBenchmark_days: 13.9,
      failureMechanismRisk: 'Normal Operational Wear',
      anomaliesDetected: [],
    },
    history: generateHistory(67, 142, 94, 2.15, 6.2, 92, 12),
  },
  {
    id: 'BGW-03',
    name: 'Baghewala Well #03',
    pad: 'Pad-North Alpha',
    status: 'OPTIMAL',
    stage: 'INJECTION',
    reservoir: {
      reservoirZone: 'Jodhpur Sandstone Upper Member',
      reservoirDepth_m: 1140,
      initialPressure_psi: 1410,
      currentPressure_psi: 1540, // elevated due to injection
      nativeTemp_c: 48,
      nearWellboreTemp_c: 215, // actively being steamed
      nativeViscosity_cp: 11800,
      effectiveViscosity_cp: 35,
      oilGravity_api: 17.8,
      permeability_md: 460,
      netPay_m: 13.8,
      productivityIndex_bopd_psi: 0.18,
      thermalRadius_m: 18.5,
    },
    wellbore: {
      casingSize_in: 9.625,
      tubingSize_in: 3.5,
      pumpDepth_m: 1075,
      fluidLevel_m: 0,
      flowingBottomholePressure_psi: 1650,
      tubingHeadPressure_psi: 1420,
      casingHeadPressure_psi: 180,
      wellheadTemp_c: 235,
      gasAnchorInstalled: true,
    },
    css: {
      cycleNumber: 5,
      stage: 'INJECTION',
      stageDayCount: 9,
      targetSteamVolume_m3: 2500,
      cumulativeSteamInjected_m3: 2150,
      steamQuality_pct: 80,
      steamInjectionPressure_psi: 1980,
      steamTemp_c: 280,
      soakDaysTotal: 5,
      soakDaysRemaining: 5,
      currentSor: 0,
      cumulativeOilThisCycle_bbl: 0,
      economicCutoffPredictedDay: 85,
      recommendedNextCycleDate: '2026-12-10',
    },
    srp: {
      spm: 0, // offline during injection
      strokeLength_in: 74,
      vfdFrequency_hz: 0,
      motorPower_kw: 0,
      motorCurrent_a: 0,
      peakPolishedRodLoad_lbs: 0,
      minPolishedRodLoad_lbs: 0,
      goodmanStressRatio_pct: 0,
      pumpFillage_pct: 0,
      volumetricEfficiency_pct: 0,
      rodFloatRisk_pct: 0,
      pumpOffRisk_pct: 0,
      dailyEnergy_kwh: 0,
      energyPerBarrel_kwh: 0,
    },
    production: {
      oilRate_bopd: 0,
      liquidRate_blpd: 0,
      waterCut_pct: 0,
      gasRate_mscfd: 0,
      gasOilRatio_scf_bbl: 0,
    },
    reliability: {
      healthScore_pct: 91,
      rodFailureProbability_pct: 5,
      pumpFailureProbability_pct: 8,
      predictedRul_days: 210,
      sensorDataQuality_pct: 96,
      leadTimeBenchmark_days: 13.9,
      failureMechanismRisk: 'Thermal Expansion on Wellhead Casing',
      anomaliesDetected: [
        'Well in Day 9 of Steam Injection (2,150 m³ / 2,500 m³ completed)',
      ],
    },
    history: generateHistory(0, 215, 35, 0, 0, 0, 5),
  },
  {
    id: 'BGW-18',
    name: 'Baghewala Well #18',
    pad: 'Pad-South Gamma',
    status: 'CRITICAL',
    stage: 'PRODUCTION',
    reservoir: {
      reservoirZone: 'Jodhpur Sandstone Lower Member',
      reservoirDepth_m: 1165,
      initialPressure_psi: 1450,
      currentPressure_psi: 1120,
      nativeTemp_c: 48,
      nearWellboreTemp_c: 56, // almost completely cooled to native temp!
      nativeViscosity_cp: 12800,
      effectiveViscosity_cp: 3450, // extremely high viscous load!
      oilGravity_api: 17.4,
      permeability_md: 390,
      netPay_m: 12.0,
      productivityIndex_bopd_psi: 0.08,
      thermalRadius_m: 14.2,
    },
    wellbore: {
      casingSize_in: 9.625,
      tubingSize_in: 3.5,
      pumpDepth_m: 1110,
      fluidLevel_m: 480,
      flowingBottomholePressure_psi: 490,
      tubingHeadPressure_psi: 95,
      casingHeadPressure_psi: 38,
      wellheadTemp_c: 51,
      gasAnchorInstalled: true,
    },
    css: {
      cycleNumber: 3,
      stage: 'CYCLE_CUTOFF_PENDING',
      stageDayCount: 92,
      targetSteamVolume_m3: 2200,
      cumulativeSteamInjected_m3: 2210,
      steamQuality_pct: 75,
      steamInjectionPressure_psi: 1820,
      steamTemp_c: 255,
      soakDaysTotal: 4,
      soakDaysRemaining: 0,
      currentSor: 5.92, // Passed economic cut-off (5.20)
      cumulativeOilThisCycle_bbl: 2740,
      economicCutoffPredictedDay: 80,
      recommendedNextCycleDate: 'IMMEDIATE',
    },
    srp: {
      spm: 4.2,
      strokeLength_in: 68,
      vfdFrequency_hz: 35.0,
      motorPower_kw: 31.8,
      motorCurrent_a: 52.4, // high current due to heavy drag
      peakPolishedRodLoad_lbs: 26400,
      minPolishedRodLoad_lbs: 3800,
      goodmanStressRatio_pct: 94.2, // CRITICAL STRESS LEVEL
      pumpFillage_pct: 44,
      volumetricEfficiency_pct: 48,
      rodFloatRisk_pct: 88,
      pumpOffRisk_pct: 54,
      dailyEnergy_kwh: 680,
      energyPerBarrel_kwh: 34.0,
    },
    production: {
      oilRate_bopd: 19.8,
      liquidRate_blpd: 48.0,
      waterCut_pct: 58.7,
      gasRate_mscfd: 4.1,
      gasOilRatio_scf_bbl: 207,
    },
    reliability: {
      healthScore_pct: 42,
      rodFailureProbability_pct: 86,
      pumpFailureProbability_pct: 62,
      predictedRul_days: 4, // Critical RUL!
      sensorDataQuality_pct: 92,
      leadTimeBenchmark_days: 13.9,
      failureMechanismRisk: 'Severe Rod Tensile Fatigue & Tubing Wear',
      anomaliesDetected: [
        'CRITICAL: Rod stress 94.2% exceeds API Goodman allowable limit (85%)',
        'Severe rod float detected on 78% of strokes (Dynacard compressed base)',
        'Operating past economic SOR threshold (5.92 vs 5.20 limit) - Net negative daily cash flow',
      ],
    },
    activeRecommendation: {
      id: 'REC-BGW18-URGENT',
      wellId: 'BGW-18',
      generatedAt: '2026-09-04T07:15:00Z',
      status: 'PENDING_APPROVAL',
      current: {
        spm: 4.2,
        strokeLength_in: 68,
        vfdFrequency_hz: 35.0,
        steamVolume_m3: 2200,
        soakDays: 4,
        oilRate_bopd: 19.8,
        sor: 5.92,
        rodFailureRisk_pct: 86,
        dailyEnergy_kwh: 680,
      },
      recommended: {
        spm: 0, // Immediate shut-in for steam cycle 4!
        strokeLength_in: 68,
        vfdFrequency_hz: 0,
        steamVolume_m3: 2800,
        soakDays: 6,
        projectedOilRate_bopd: 58.0, // post-steam target
        projectedSor: 2.8,
        projectedRodFailureRisk_pct: 15,
        projectedDailyEnergy_kwh: 0,
      },
      deltas: {
        deltaOilRate_bopd: 38.2,
        deltaOilRatePct: 192.9,
        deltaSorPct: -52.7,
        deltaRodRiskPct: -82.5,
        deltaDailyEnergyPct: -100,
        projectedMonthlyNetBenefit_inr: 890000,
      },
      engineeringRationale: [
        'Well has fully depleted thermal bank; crude viscosity (3,450 cP) imposes unsustainable mechanical drag on sucker rod string.',
        'Immediate SRP shutdown required to prevent imminent rod parting (estimated RUL 4 days).',
        'Commence CSS Cycle 4 injection of 2,800 m³ steam @ 82% quality to heat reservoir to ~210°C.',
      ],
      physicsConstraintsChecks: [
        { name: 'API Goodman Stress', status: 'FAIL', limit: '< 85%', actual: '94.2% (VIOLATION)' },
        { name: 'Economic SOR Cut-off', status: 'FAIL', limit: '< 5.20', actual: '5.92 (VIOLATION)' },
        { name: 'Minimum Downstroke Tension', status: 'FAIL', limit: '> 2,000 lbs', actual: '1,100 lbs (High Floated Rod)' },
      ],
      shapFeatureImportance: [
        { feature: 'Cycle Days Elapsed', importance: 0.48, direction: 'negative' },
        { feature: 'Near-Wellbore Temperature', importance: 0.35, direction: 'negative' },
        { feature: 'Peak Rod Load Amplitude', importance: 0.17, direction: 'negative' },
      ],
    },
    history: generateHistory(20, 56, 3450, 5.92, 4.2, 44, 86),
  },
  {
    id: 'BGW-05',
    name: 'Baghewala Well #05',
    pad: 'Pad-North Alpha',
    status: 'OPTIMAL',
    stage: 'SOAKING',
    reservoir: {
      reservoirZone: 'Jodhpur Sandstone Upper Member',
      reservoirDepth_m: 1145,
      initialPressure_psi: 1420,
      currentPressure_psi: 1510,
      nativeTemp_c: 48,
      nearWellboreTemp_c: 198,
      nativeViscosity_cp: 11400,
      effectiveViscosity_cp: 42,
      oilGravity_api: 18.0,
      permeability_md: 470,
      netPay_m: 15.0,
      productivityIndex_bopd_psi: 0.22,
      thermalRadius_m: 29.0,
    },
    wellbore: {
      casingSize_in: 9.625,
      tubingSize_in: 3.5,
      pumpDepth_m: 1080,
      fluidLevel_m: 50,
      flowingBottomholePressure_psi: 1520,
      tubingHeadPressure_psi: 620,
      casingHeadPressure_psi: 210,
      wellheadTemp_c: 182,
      gasAnchorInstalled: true,
    },
    css: {
      cycleNumber: 4,
      stage: 'SOAKING',
      stageDayCount: 3,
      targetSteamVolume_m3: 2600,
      cumulativeSteamInjected_m3: 2615,
      steamQuality_pct: 81,
      steamInjectionPressure_psi: 1900,
      steamTemp_c: 270,
      soakDaysTotal: 5,
      soakDaysRemaining: 2,
      currentSor: 0,
      cumulativeOilThisCycle_bbl: 0,
      economicCutoffPredictedDay: 90,
      recommendedNextCycleDate: '2026-12-01',
    },
    srp: {
      spm: 0,
      strokeLength_in: 74,
      vfdFrequency_hz: 0,
      motorPower_kw: 0,
      motorCurrent_a: 0,
      peakPolishedRodLoad_lbs: 0,
      minPolishedRodLoad_lbs: 0,
      goodmanStressRatio_pct: 0,
      pumpFillage_pct: 0,
      volumetricEfficiency_pct: 0,
      rodFloatRisk_pct: 0,
      pumpOffRisk_pct: 0,
      dailyEnergy_kwh: 0,
      energyPerBarrel_kwh: 0,
    },
    production: {
      oilRate_bopd: 0,
      liquidRate_blpd: 0,
      waterCut_pct: 0,
      gasRate_mscfd: 0,
      gasOilRatio_scf_bbl: 0,
    },
    reliability: {
      healthScore_pct: 92,
      rodFailureProbability_pct: 8,
      pumpFailureProbability_pct: 10,
      predictedRul_days: 190,
      sensorDataQuality_pct: 95,
      leadTimeBenchmark_days: 13.9,
      failureMechanismRisk: 'None - Well Soaking',
      anomaliesDetected: [
        'Soak Day 3 of 5. Pressure dissipation following predicted diffusivity curve.',
      ],
    },
    history: generateHistory(0, 198, 42, 0, 0, 0, 8),
  },
];

// Generate the remaining 18 wells for realistic fleet operations (BGW-01, 02, 04, 06, 08, 09, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23)
const extraWellConfigs: { id: string; name: string; pad: string; status: 'OPTIMAL' | 'WARNING' | 'CRITICAL'; stage: 'PRODUCTION' | 'INJECTION' | 'SOAKING' | 'CYCLE_CUTOFF_PENDING'; oil: number; temp: number; visc: number; spm: number; fill: number; sor: number; risk: number }[] = [
  { id: 'BGW-01', name: 'Baghewala Well #01', pad: 'Pad-North Alpha', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 48, temp: 118, visc: 160, spm: 5.4, fill: 88, sor: 2.8, risk: 18 },
  { id: 'BGW-02', name: 'Baghewala Well #02', pad: 'Pad-North Alpha', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 54, temp: 126, visc: 130, spm: 5.8, fill: 85, sor: 2.6, risk: 22 },
  { id: 'BGW-04', name: 'Baghewala Well #04', pad: 'Pad-North Alpha', status: 'WARNING', stage: 'PRODUCTION', oil: 36, temp: 72, visc: 880, spm: 5.6, fill: 68, sor: 4.6, risk: 64 },
  { id: 'BGW-06', name: 'Baghewala Well #06', pad: 'Pad-North Alpha', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 52, temp: 132, visc: 110, spm: 6.0, fill: 90, sor: 2.4, risk: 16 },
  { id: 'BGW-08', name: 'Baghewala Well #08', pad: 'Pad-Central Bravo', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 61, temp: 138, visc: 98, spm: 6.1, fill: 91, sor: 2.2, risk: 14 },
  { id: 'BGW-09', name: 'Baghewala Well #09', pad: 'Pad-Central Bravo', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 44, temp: 104, visc: 220, spm: 5.2, fill: 82, sor: 3.1, risk: 26 },
  { id: 'BGW-10', name: 'Baghewala Well #10', pad: 'Pad-Central Bravo', status: 'WARNING', stage: 'PRODUCTION', oil: 38, temp: 78, visc: 720, spm: 5.5, fill: 71, sor: 4.4, risk: 58 },
  { id: 'BGW-11', name: 'Baghewala Well #11', pad: 'Pad-Central Bravo', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 59, temp: 135, visc: 105, spm: 6.0, fill: 89, sor: 2.3, risk: 15 },
  { id: 'BGW-13', name: 'Baghewala Well #13', pad: 'Pad-Central Bravo', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 47, temp: 112, visc: 180, spm: 5.3, fill: 84, sor: 2.9, risk: 24 },
  { id: 'BGW-14', name: 'Baghewala Well #14', pad: 'Pad-Central Bravo', status: 'OPTIMAL', stage: 'INJECTION', oil: 0, temp: 220, visc: 32, spm: 0, fill: 0, sor: 0, risk: 6 },
  { id: 'BGW-15', name: 'Baghewala Well #15', pad: 'Pad-South Gamma', status: 'OPTIMAL', stage: 'SOAKING', oil: 0, temp: 192, visc: 45, spm: 0, fill: 0, sor: 0, risk: 9 },
  { id: 'BGW-16', name: 'Baghewala Well #16', pad: 'Pad-South Gamma', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 63, temp: 140, visc: 92, spm: 6.2, fill: 94, sor: 2.1, risk: 12 },
  { id: 'BGW-17', name: 'Baghewala Well #17', pad: 'Pad-South Gamma', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 50, temp: 116, visc: 165, spm: 5.4, fill: 86, sor: 2.7, risk: 20 },
  { id: 'BGW-19', name: 'Baghewala Well #19', pad: 'Pad-South Gamma', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 55, temp: 128, visc: 125, spm: 5.9, fill: 88, sor: 2.5, risk: 19 },
  { id: 'BGW-20', name: 'Baghewala Well #20', pad: 'Pad-South Gamma', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 46, temp: 108, visc: 205, spm: 5.2, fill: 81, sor: 3.0, risk: 25 },
  { id: 'BGW-21', name: 'Baghewala Well #21', pad: 'Pad-West Delta', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 58, temp: 130, visc: 118, spm: 5.8, fill: 87, sor: 2.4, risk: 17 },
  { id: 'BGW-22', name: 'Baghewala Well #22', pad: 'Pad-West Delta', status: 'OPTIMAL', stage: 'INJECTION', oil: 0, temp: 210, visc: 36, spm: 0, fill: 0, sor: 0, risk: 8 },
  { id: 'BGW-23', name: 'Baghewala Well #23', pad: 'Pad-West Delta', status: 'OPTIMAL', stage: 'PRODUCTION', oil: 51, temp: 120, visc: 150, spm: 5.5, fill: 85, sor: 2.6, risk: 21 },
];

extraWellConfigs.forEach(cfg => {
  INITIAL_WELLS.push({
    id: cfg.id,
    name: cfg.name,
    pad: cfg.pad,
    status: cfg.status,
    stage: cfg.stage,
    reservoir: {
      reservoirZone: 'Jodhpur Sandstone',
      reservoirDepth_m: 1150,
      initialPressure_psi: 1425,
      currentPressure_psi: 1280,
      nativeTemp_c: 48,
      nearWellboreTemp_c: cfg.temp,
      nativeViscosity_cp: 11600,
      effectiveViscosity_cp: cfg.visc,
      oilGravity_api: 18.1,
      permeability_md: 480,
      netPay_m: 14.0,
      productivityIndex_bopd_psi: 0.20,
      thermalRadius_m: 24.0,
    },
    wellbore: {
      casingSize_in: 9.625,
      tubingSize_in: 3.5,
      pumpDepth_m: 1085,
      fluidLevel_m: 260,
      flowingBottomholePressure_psi: 680,
      tubingHeadPressure_psi: 115,
      casingHeadPressure_psi: 42,
      wellheadTemp_c: Math.round(cfg.temp * 0.72),
      gasAnchorInstalled: true,
    },
    css: {
      cycleNumber: 3,
      stage: cfg.stage,
      stageDayCount: cfg.stage === 'PRODUCTION' ? 35 : 5,
      targetSteamVolume_m3: 2500,
      cumulativeSteamInjected_m3: 2500,
      steamQuality_pct: 80,
      steamInjectionPressure_psi: 1880,
      steamTemp_c: 265,
      soakDaysTotal: 5,
      soakDaysRemaining: cfg.stage === 'SOAKING' ? 2 : 0,
      currentSor: cfg.sor,
      cumulativeOilThisCycle_bbl: cfg.oil * 35,
      economicCutoffPredictedDay: 90,
      recommendedNextCycleDate: '2026-11-15',
    },
    srp: {
      spm: cfg.spm,
      strokeLength_in: 74,
      vfdFrequency_hz: Number((cfg.spm * 8.3).toFixed(1)),
      motorPower_kw: cfg.spm > 0 ? 22 : 0,
      motorCurrent_a: cfg.spm > 0 ? 36 : 0,
      peakPolishedRodLoad_lbs: cfg.spm > 0 ? 21000 : 0,
      minPolishedRodLoad_lbs: cfg.spm > 0 ? 6500 : 0,
      goodmanStressRatio_pct: cfg.spm > 0 ? 64 : 0,
      pumpFillage_pct: cfg.fill,
      volumetricEfficiency_pct: cfg.fill > 0 ? Math.round(cfg.fill * 0.94) : 0,
      rodFloatRisk_pct: Math.round(cfg.risk * 0.8),
      pumpOffRisk_pct: 14,
      dailyEnergy_kwh: cfg.spm > 0 ? 440 : 0,
      energyPerBarrel_kwh: cfg.oil > 0 ? Number((440 / cfg.oil).toFixed(1)) : 0,
    },
    production: {
      oilRate_bopd: cfg.oil,
      liquidRate_blpd: Number((cfg.oil * 1.45).toFixed(1)),
      waterCut_pct: 31.0,
      gasRate_mscfd: Number((cfg.oil * 0.22).toFixed(1)),
      gasOilRatio_scf_bbl: 210,
    },
    reliability: {
      healthScore_pct: 100 - cfg.risk,
      rodFailureProbability_pct: cfg.risk,
      pumpFailureProbability_pct: Math.round(cfg.risk * 0.5),
      predictedRul_days: Math.round((100 - cfg.risk) * 2.2),
      sensorDataQuality_pct: 95,
      leadTimeBenchmark_days: 13.9,
      failureMechanismRisk: cfg.risk > 50 ? 'Viscous Drag / High Stress' : 'Normal Operation',
      anomaliesDetected: cfg.risk > 50 ? ['Elevated rod stress during fluid cool-down'] : [],
    },
    history: generateHistory(cfg.oil, cfg.temp, cfg.visc, cfg.sor, cfg.spm, cfg.fill, cfg.risk),
  });
});

// Realistic Dynacard Data Generators for different pump conditions
export function getDynacardForWell(well: Well): DynacardData {
  const stroke = well.srp.strokeLength_in || 74;
  const peak = well.srp.peakPolishedRodLoad_lbs || 22000;
  const min = well.srp.minPolishedRodLoad_lbs || 6000;
  const numPoints = 50;
  
  const surfaceCard = [];
  const downholeCard = [];

  // Determine condition based on well status
  let fault: DynacardData['faultClassification'] = 'NORMAL';
  let notes = 'Card indicates balanced pump operation with good valve action.';

  if (well.id === 'BGW-07') {
    fault = 'ROD_FLOATING';
    notes = 'Severe downstroke rod compression and delayed valve closure due to 820 cP crude viscous drag.';
  } else if (well.id === 'BGW-18') {
    fault = 'HIGH_VISCOUS_DRAG';
    notes = 'High peak polished rod load with rounded bottom, 3,450 cP crude causing extreme rod friction.';
  } else if (well.srp.pumpFillage_pct < 50) {
    fault = 'PUMP_OFF';
    notes = 'Incomplete chamber fillage causing fluid pound on early downstroke.';
  }

  // Generate parametric closed loop for Dynacard
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI; // 0 to 2pi
    // Normalized position: 0 to stroke
    const pos = (stroke / 2) * (1 - Math.cos(theta));
    
    // Surface card shape
    let surfLoad = 0;
    if (theta <= Math.PI) {
      // Upstroke: load rises to peak then levels
      surfLoad = min + (peak - min) * (0.85 + 0.15 * Math.sin(theta));
    } else {
      // Downstroke: load drops to min
      const t = theta - Math.PI;
      if (fault === 'ROD_FLOATING') {
        // Delayed drop due to friction
        surfLoad = min + (peak - min) * (0.45 * Math.exp(-t * 0.8) + 0.1);
      } else {
        surfLoad = min + (peak - min) * 0.12 * (1 + Math.cos(t));
      }
    }

    // Add physical harmonics / rod vibrations
    const harmonics = 400 * Math.sin(theta * 6);
    surfaceCard.push({
      position_in: Number(pos.toFixed(1)),
      load_lbs: Math.round(Math.max(1000, surfLoad + harmonics)),
    });

    // Downhole pump card (idealized vs distorted)
    let pumpLoad = 0;
    const plungerArea = 3.14; // sq in
    const pumpMax = (peak - min) * 0.75;
    if (theta <= Math.PI) {
      pumpLoad = pumpMax;
    } else {
      if (fault === 'PUMP_OFF' && theta > Math.PI + 1.2) {
        // Fluid pound shock
        pumpLoad = 400 + 800 * Math.sin((theta - Math.PI) * 4);
      } else {
        pumpLoad = 400;
      }
    }

    downholeCard.push({
      position_in: Number(pos.toFixed(1)),
      load_lbs: Math.round(pumpLoad),
    });
  }

  return {
    wellId: well.id,
    timestamp: new Date().toISOString(),
    surfaceCard,
    downholeCard,
    faultClassification: fault,
    confidence: fault === 'NORMAL' ? 0.96 : 0.89,
    f1ScoreBenchmark: 0.857, // SPE 2026 literature reference
    peakLoad_lbs: peak,
    minLoad_lbs: min,
    area_sq_in: 48.6,
    effectiveStroke_in: stroke * (well.srp.pumpFillage_pct / 100),
    dampingFactor: well.reservoir.effectiveViscosity_cp > 500 ? 0.42 : 0.18,
    diagnosticNotes: notes,
  };
}
