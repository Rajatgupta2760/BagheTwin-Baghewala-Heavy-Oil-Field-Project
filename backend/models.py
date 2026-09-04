from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

WellStage = Literal['INJECTION', 'SOAKING', 'PRODUCTION', 'CYCLE_CUTOFF_PENDING']
WellHealthStatus = Literal['OPTIMAL', 'WARNING', 'CRITICAL', 'MAINTENANCE_REQUIRED']
DynacardFaultType = Literal[
    'NORMAL',
    'PUMP_OFF',
    'FLUID_POUND',
    'GAS_INTERFERENCE',
    'VALVE_LEAKAGE',
    'HIGH_VISCOUS_DRAG',
    'ROD_FLOATING'
]

class DynacardPoint(BaseModel):
    position_in: float
    load_lbs: float

class DynacardData(BaseModel):
    wellId: str
    timestamp: str
    surfaceCard: List[DynacardPoint]
    downholeCard: List[DynacardPoint]
    faultClassification: DynacardFaultType
    confidence: float
    f1ScoreBenchmark: float
    peakLoad_lbs: float
    minLoad_lbs: float
    area_sq_in: float
    effectiveStroke_in: float
    dampingFactor: float
    diagnosticNotes: str

class ReservoirState(BaseModel):
    reservoirZone: str
    reservoirDepth_m: float
    initialPressure_psi: float
    currentPressure_psi: float
    nativeTemp_c: float
    nearWellboreTemp_c: float
    nativeViscosity_cp: float
    effectiveViscosity_cp: float
    oilGravity_api: float
    permeability_md: float
    netPay_m: float
    productivityIndex_bopd_psi: float
    thermalRadius_m: float

class WellboreState(BaseModel):
    casingSize_in: float
    tubingSize_in: float
    pumpDepth_m: float
    fluidLevel_m: float
    flowingBottomholePressure_psi: float
    tubingHeadPressure_psi: float
    casingHeadPressure_psi: float
    wellheadTemp_c: float
    gasAnchorInstalled: bool

class CSSCycleState(BaseModel):
    cycleNumber: int
    stage: WellStage
    stageDayCount: int
    targetSteamVolume_m3: float
    cumulativeSteamInjected_m3: float
    steamQuality_pct: float
    steamInjectionPressure_psi: float
    steamTemp_c: float
    soakDaysTotal: int
    soakDaysRemaining: int
    currentSor: float
    cumulativeOilThisCycle_bbl: float
    economicCutoffPredictedDay: int
    recommendedNextCycleDate: str

class SRPOperatingState(BaseModel):
    spm: float
    strokeLength_in: float
    vfdFrequency_hz: float
    motorPower_kw: float
    motorCurrent_a: float
    peakPolishedRodLoad_lbs: float
    minPolishedRodLoad_lbs: float
    goodmanStressRatio_pct: float
    pumpFillage_pct: float
    volumetricEfficiency_pct: float
    rodFloatRisk_pct: float
    pumpOffRisk_pct: float
    dailyEnergy_kwh: float
    energyPerBarrel_kwh: float

class SurfaceProductionState(BaseModel):
    oilRate_bopd: float
    liquidRate_blpd: float
    waterCut_pct: float
    gasRate_mscfd: float
    gasOilRatio_scf_bbl: float

class ReliabilityState(BaseModel):
    healthScore_pct: float
    rodFailureProbability_pct: float
    pumpFailureProbability_pct: float
    predictedRul_days: float
    sensorDataQuality_pct: float
    leadTimeBenchmark_days: float
    lastFailureDate: Optional[str] = None
    failureMechanismRisk: str
    anomaliesDetected: List[str]

class OptimizationCurrentParams(BaseModel):
    spm: float
    strokeLength_in: float
    vfdFrequency_hz: float
    steamVolume_m3: float
    soakDays: int
    oilRate_bopd: float
    sor: float
    rodFailureRisk_pct: float
    dailyEnergy_kwh: float

class OptimizationRecommendedParams(BaseModel):
    spm: float
    strokeLength_in: float
    vfdFrequency_hz: float
    steamVolume_m3: float
    soakDays: int
    projectedOilRate_bopd: float
    projectedSor: float
    projectedRodFailureRisk_pct: float
    projectedDailyEnergy_kwh: float

class OptimizationDeltas(BaseModel):
    deltaOilRate_bopd: float
    deltaOilRatePct: float
    deltaSorPct: float
    deltaRodRiskPct: float
    deltaDailyEnergyPct: float
    projectedMonthlyNetBenefit_inr: float

class PhysicsConstraintCheck(BaseModel):
    name: str
    status: Literal['PASS', 'WARN', 'FAIL']
    limit: str
    actual: str

class ShapFeatureImportance(BaseModel):
    feature: str
    importance: float
    direction: Literal['positive', 'negative']

class OptimizationRecommendation(BaseModel):
    id: str
    wellId: str
    generatedAt: str
    status: Literal['PENDING_APPROVAL', 'APPLIED', 'REJECTED']
    appliedAt: Optional[str] = None
    current: OptimizationCurrentParams
    recommended: OptimizationRecommendedParams
    deltas: OptimizationDeltas
    engineeringRationale: List[str]
    physicsConstraintsChecks: List[PhysicsConstraintCheck]
    shapFeatureImportance: List[ShapFeatureImportance]

class WellHistoryPoint(BaseModel):
    timestamp: str
    oilRate_bopd: float
    temp_c: float
    viscosity_cp: float
    sor: float
    spm: float
    pumpFillage_pct: float
    rodRisk_pct: float

class Well(BaseModel):
    id: str
    name: str
    pad: str
    status: WellHealthStatus
    stage: WellStage
    reservoir: ReservoirState
    wellbore: WellboreState
    css: CSSCycleState
    srp: SRPOperatingState
    production: SurfaceProductionState
    reliability: ReliabilityState
    activeRecommendation: Optional[OptimizationRecommendation] = None
    history: List[WellHistoryPoint] = []

class FieldSummary(BaseModel):
    fieldName: str
    operator: str
    formation: str
    nativeViscosityRange: str
    totalWells: int
    producingWells: int
    steamingWells: int
    soakingWells: int
    cutoffPendingWells: int
    totalOilRate_bopd: float
    totalSteamInjection_t_day: float
    averageSor: float
    averagePumpFillage_pct: float
    averageFleetViscosity_cp: float
    activeRodRiskAlerts: int
    dailyEnergy_mwh: float
    fleetHealthAvg_pct: float

class FleetResponse(BaseModel):
    summary: FieldSummary
    wells: List[Well]

class OptimizeRequest(BaseModel):
    wellId: str

class ApplyRecommendationRequest(BaseModel):
    wellId: str
    recommendationId: Optional[str] = None

class SimulationRequest(BaseModel):
    wellId: str
    deltaSpm: float = 0.0
    deltaSteamVolume_pct: float = 0.0
    deltaSoakDays: float = 0.0
    vfdFrequency_hz: Optional[float] = None

class SimulationResult(BaseModel):
    simulatedDays: List[int]
    temperatureCurve_c: List[float]
    viscosityCurve_cp: List[float]
    oilRateCurve_bopd: List[float]
    sorCurve: List[float]
    rodStressCurve_pct: List[float]
    pumpFillageCurve_pct: List[float]
    cumulativeOil_bbl: List[float]
    projectedNpv_inr: float

class AIChatRequest(BaseModel):
    question: str
    wellId: Optional[str] = None
    context: Optional[str] = None

class AIChatResponse(BaseModel):
    answer: str
    source: str
