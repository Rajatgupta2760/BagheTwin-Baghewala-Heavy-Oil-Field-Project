export type WellStage = 'INJECTION' | 'SOAKING' | 'PRODUCTION' | 'CYCLE_CUTOFF_PENDING';
export type WellHealthStatus = 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE_REQUIRED';
export type DynacardFaultType = 
  | 'NORMAL' 
  | 'PUMP_OFF' 
  | 'FLUID_POUND' 
  | 'GAS_INTERFERENCE' 
  | 'VALVE_LEAKAGE' 
  | 'HIGH_VISCOUS_DRAG' 
  | 'ROD_FLOATING';

export interface DynacardPoint {
  position_in: number;
  load_lbs: number;
}

export interface DynacardData {
  wellId: string;
  timestamp: string;
  surfaceCard: DynacardPoint[];
  downholeCard: DynacardPoint[];
  faultClassification: DynacardFaultType;
  confidence: number;
  f1ScoreBenchmark: number;
  peakLoad_lbs: number;
  minLoad_lbs: number;
  area_sq_in: number;
  effectiveStroke_in: number;
  dampingFactor: number;
  diagnosticNotes: string;
}

export interface ReservoirState {
  reservoirZone: string;
  reservoirDepth_m: number;
  initialPressure_psi: number;
  currentPressure_psi: number;
  nativeTemp_c: number;
  nearWellboreTemp_c: number;
  nativeViscosity_cp: number;
  effectiveViscosity_cp: number;
  oilGravity_api: number;
  permeability_md: number;
  netPay_m: number;
  productivityIndex_bopd_psi: number;
  thermalRadius_m: number;
}

export interface WellboreState {
  casingSize_in: number;
  tubingSize_in: number;
  pumpDepth_m: number;
  fluidLevel_m: number;
  flowingBottomholePressure_psi: number;
  tubingHeadPressure_psi: number;
  casingHeadPressure_psi: number;
  wellheadTemp_c: number;
  gasAnchorInstalled: boolean;
}

export interface CSSCycleState {
  cycleNumber: number;
  stage: WellStage;
  stageDayCount: number;
  targetSteamVolume_m3: number;
  cumulativeSteamInjected_m3: number;
  steamQuality_pct: number;
  steamInjectionPressure_psi: number;
  steamTemp_c: number;
  soakDaysTotal: number;
  soakDaysRemaining: number;
  currentSor: number; // Steam-Oil Ratio (m3 steam / m3 oil or bbl/bbl)
  cumulativeOilThisCycle_bbl: number;
  economicCutoffPredictedDay: number;
  recommendedNextCycleDate: string;
}

export interface SRPOperatingState {
  spm: number;
  strokeLength_in: number;
  vfdFrequency_hz: number;
  motorPower_kw: number;
  motorCurrent_a: number;
  peakPolishedRodLoad_lbs: number;
  minPolishedRodLoad_lbs: number;
  goodmanStressRatio_pct: number;
  pumpFillage_pct: number;
  volumetricEfficiency_pct: number;
  rodFloatRisk_pct: number;
  pumpOffRisk_pct: number;
  dailyEnergy_kwh: number;
  energyPerBarrel_kwh: number;
}

export interface SurfaceProductionState {
  oilRate_bopd: number;
  liquidRate_blpd: number;
  waterCut_pct: number;
  gasRate_mscfd: number;
  gasOilRatio_scf_bbl: number;
}

export interface ReliabilityState {
  healthScore_pct: number;
  rodFailureProbability_pct: number;
  pumpFailureProbability_pct: number;
  predictedRul_days: number;
  sensorDataQuality_pct: number;
  leadTimeBenchmark_days: number;
  lastFailureDate?: string;
  failureMechanismRisk: string;
  anomaliesDetected: string[];
}

export interface OptimizationRecommendation {
  id: string;
  wellId: string;
  generatedAt: string;
  status: 'PENDING_APPROVAL' | 'APPLIED' | 'REJECTED';
  appliedAt?: string;
  
  // Current operating parameters
  current: {
    spm: number;
    strokeLength_in: number;
    vfdFrequency_hz: number;
    steamVolume_m3: number;
    soakDays: number;
    oilRate_bopd: number;
    sor: number;
    rodFailureRisk_pct: number;
    dailyEnergy_kwh: number;
  };
  
  // Recommended operating parameters
  recommended: {
    spm: number;
    strokeLength_in: number;
    vfdFrequency_hz: number;
    steamVolume_m3: number;
    soakDays: number;
    projectedOilRate_bopd: number;
    projectedSor: number;
    projectedRodFailureRisk_pct: number;
    projectedDailyEnergy_kwh: number;
  };
  
  // Deltas and metrics
  deltas: {
    deltaOilRate_bopd: number;
    deltaOilRatePct: number;
    deltaSorPct: number;
    deltaRodRiskPct: number;
    deltaDailyEnergyPct: number;
    projectedMonthlyNetBenefit_inr: number;
  };
  
  // Rationale & Engineering Justification
  engineeringRationale: string[];
  physicsConstraintsChecks: {
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    limit: string;
    actual: string;
  }[];
  
  shapFeatureImportance: {
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
  }[];
}

export interface Well {
  id: string;
  name: string;
  pad: string;
  status: WellHealthStatus;
  stage: WellStage;
  reservoir: ReservoirState;
  wellbore: WellboreState;
  css: CSSCycleState;
  srp: SRPOperatingState;
  production: SurfaceProductionState;
  reliability: ReliabilityState;
  activeRecommendation?: OptimizationRecommendation;
  history: {
    timestamp: string;
    oilRate_bopd: number;
    temp_c: number;
    viscosity_cp: number;
    sor: number;
    spm: number;
    pumpFillage_pct: number;
    rodRisk_pct: number;
  }[];
}

export interface FieldSummary {
  fieldName: string;
  operator: string;
  formation: string;
  nativeViscosityRange: string;
  totalWells: number;
  producingWells: number;
  steamingWells: number;
  soakingWells: number;
  cutoffPendingWells: number;
  totalOilRate_bopd: number;
  totalSteamInjection_t_day: number;
  averageSor: number;
  averagePumpFillage_pct: number;
  averageFleetViscosity_cp: number;
  activeRodRiskAlerts: number;
  dailyEnergy_mwh: number;
  fleetHealthAvg_pct: number;
}

export interface WhatIfScenarioInput {
  wellId: string;
  deltaSpm: number;
  deltaSteamVolume_pct: number;
  deltaSoakDays: number;
  vfdFrequency_hz: number;
}

export interface SimulationResult {
  simulatedDays: number[];
  temperatureCurve_c: number[];
  viscosityCurve_cp: number[];
  oilRateCurve_bopd: number[];
  sorCurve: number[];
  rodStressCurve_pct: number[];
  pumpFillageCurve_pct: number[];
  cumulativeOil_bbl: number[];
  projectedNpv_inr: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  content: string;
  wellReference?: string;
  suggestedActions?: { label: string; action: string }[];
}
