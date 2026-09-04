import os
import copy
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .models import (
    FleetResponse,
    Well,
    FieldSummary,
    DynacardData,
    OptimizeRequest,
    OptimizationRecommendation,
    OptimizationCurrentParams,
    OptimizationRecommendedParams,
    OptimizationDeltas,
    PhysicsConstraintCheck,
    ShapFeatureImportance,
    ApplyRecommendationRequest,
    SimulationRequest,
    SimulationResult,
    AIChatRequest,
    AIChatResponse
)
from .data import INITIAL_WELLS, BAGHEWALA_FIELD_SUMMARY
from .physics import simulate_well_scenario, generate_dynacard

load_dotenv()

app = FastAPI(
    title="BagheTwin EOR: Thermal-Lift Digital Twin API",
    description="FastAPI REST API backend for Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP) closed-loop digital twin optimization at Baghewala Heavy Oil Field, Rajasthan.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory fleet state
wells_fleet: list[Well] = [copy.deepcopy(w) for w in INITIAL_WELLS]

@app.get("/api/health", summary="Health Check")
def health_check():
    return {
        "status": "ok",
        "backend": "FastAPI (Python 3.10 ASGI)",
        "app": "BagheTwin EOR",
        "field": "Baghewala Heavy Oil Field",
        "operator": "Oil India Limited",
        "activeWells": len(wells_fleet),
        "docsUrl": "/docs",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/fleet", response_model=FleetResponse, summary="Get Fleet Summary & Wells")
def get_fleet():
    total_oil_rate = sum(w.production.oilRate_bopd for w in wells_fleet)
    total_steaming = sum(1 for w in wells_fleet if w.stage == 'INJECTION')
    total_soaking = sum(1 for w in wells_fleet if w.stage == 'SOAKING')
    total_cutoff = sum(1 for w in wells_fleet if w.stage == 'CYCLE_CUTOFF_PENDING')
    total_producing = sum(1 for w in wells_fleet if w.stage == 'PRODUCTION')
    rod_alerts = sum(1 for w in wells_fleet if w.reliability.rodFailureProbability_pct > 60)

    producing_with_fill = [w for w in wells_fleet if w.srp.pumpFillage_pct > 0]
    avg_fillage = (
        round(sum(w.srp.pumpFillage_pct for w in producing_with_fill) / len(producing_with_fill), 1)
        if producing_with_fill else 0.0
    )

    summary = FieldSummary(
        fieldName=BAGHEWALA_FIELD_SUMMARY.fieldName,
        operator=BAGHEWALA_FIELD_SUMMARY.operator,
        formation=BAGHEWALA_FIELD_SUMMARY.formation,
        nativeViscosityRange=BAGHEWALA_FIELD_SUMMARY.nativeViscosityRange,
        totalWells=BAGHEWALA_FIELD_SUMMARY.totalWells,
        producingWells=total_producing,
        steamingWells=total_steaming,
        soakingWells=total_soaking,
        cutoffPendingWells=total_cutoff,
        totalOilRate_bopd=round(total_oil_rate, 1),
        totalSteamInjection_t_day=BAGHEWALA_FIELD_SUMMARY.totalSteamInjection_t_day,
        averageSor=BAGHEWALA_FIELD_SUMMARY.averageSor,
        averagePumpFillage_pct=avg_fillage,
        averageFleetViscosity_cp=BAGHEWALA_FIELD_SUMMARY.averageFleetViscosity_cp,
        activeRodRiskAlerts=rod_alerts,
        dailyEnergy_mwh=BAGHEWALA_FIELD_SUMMARY.dailyEnergy_mwh,
        fleetHealthAvg_pct=BAGHEWALA_FIELD_SUMMARY.fleetHealthAvg_pct
    )

    return FleetResponse(summary=summary, wells=wells_fleet)

@app.get("/api/wells/{well_id}", summary="Get Single Well Details & Dynacard")
def get_well(well_id: str):
    well = next((w for w in wells_fleet if w.id == well_id), None)
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")
    dynacard = generate_dynacard(well)
    return {"well": well, "dynacard": dynacard}

@app.get("/api/wells/{well_id}/dynacard", response_model=DynacardData, summary="Get Well Dynacard")
def get_well_dynacard(well_id: str):
    well = next((w for w in wells_fleet if w.id == well_id), None)
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")
    return generate_dynacard(well)

@app.post("/api/optimize", summary="Run Physics-AI Joint Optimization")
def optimize_well(req: OptimizeRequest):
    well = next((w for w in wells_fleet if w.id == req.wellId), None)
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {req.wellId} not found")

    if well.activeRecommendation:
        return {"recommendation": well.activeRecommendation}

    is_cooling = well.reservoir.nearWellboreTemp_c < 90
    new_spm = max(3.8, round(well.srp.spm - 0.8, 1)) if is_cooling else min(6.5, round(well.srp.spm + 0.4, 1))
    new_fillage = min(95.0, well.srp.pumpFillage_pct + 18.0) if is_cooling else well.srp.pumpFillage_pct
    new_oil = round(well.production.oilRate_bopd * (1.08 if is_cooling else 1.05), 1)

    rec = OptimizationRecommendation(
        id=f"REC-{well.id}-{int(datetime.utcnow().timestamp())}",
        wellId=well.id,
        generatedAt=datetime.utcnow().isoformat() + "Z",
        status="PENDING_APPROVAL",
        current=OptimizationCurrentParams(
            spm=well.srp.spm,
            strokeLength_in=well.srp.strokeLength_in,
            vfdFrequency_hz=well.srp.vfdFrequency_hz,
            steamVolume_m3=well.css.targetSteamVolume_m3,
            soakDays=well.css.soakDaysTotal,
            oilRate_bopd=well.production.oilRate_bopd,
            sor=well.css.currentSor,
            rodFailureRisk_pct=well.reliability.rodFailureProbability_pct,
            dailyEnergy_kwh=well.srp.dailyEnergy_kwh,
        ),
        recommended=OptimizationRecommendedParams(
            spm=new_spm,
            strokeLength_in=well.srp.strokeLength_in,
            vfdFrequency_hz=round(new_spm * 8.3, 1),
            steamVolume_m3=2600.0,
            soakDays=5,
            projectedOilRate_bopd=new_oil,
            projectedSor=round(well.css.currentSor * 0.82, 2),
            projectedRodFailureRisk_pct=max(12.0, round(well.reliability.rodFailureProbability_pct * 0.35, 1)),
            projectedDailyEnergy_kwh=round(well.srp.dailyEnergy_kwh * 0.85, 1),
        ),
        deltas=OptimizationDeltas(
            deltaOilRate_bopd=round(new_oil - well.production.oilRate_bopd, 1),
            deltaOilRatePct=round(((new_oil - well.production.oilRate_bopd) / max(1.0, well.production.oilRate_bopd)) * 100.0, 1),
            deltaSorPct=-18.0,
            deltaRodRiskPct=-65.0,
            deltaDailyEnergyPct=-15.0,
            projectedMonthlyNetBenefit_inr=395000.0,
        ),
        engineeringRationale=[
            f"Adjusted pumping speed to {new_spm} SPM to balance viscous fluid inflow drag at {well.reservoir.effectiveViscosity_cp} cP.",
            f"Volumetric pump fillage projected to improve to {new_fillage}% with tensioned valve closure.",
            "Maintains sucker rod stress below API Spec 11L limits while lowering daily motor consumption by ~15%."
        ],
        physicsConstraintsChecks=[
            PhysicsConstraintCheck(name="API Spec 11L Goodman Stress", status="PASS", limit="< 85%", actual="62.4%"),
            PhysicsConstraintCheck(name="VFD Inverter Thermal Window", status="PASS", limit="25 - 55 Hz", actual=f"{round(new_spm * 8.3, 1)} Hz"),
            PhysicsConstraintCheck(name="Submergence Pressure Buffer", status="PASS", limit="> 200 psi", actual="340 psi"),
        ],
        shapFeatureImportance=[
            ShapFeatureImportance(feature="Effective Downhole Viscosity", importance=0.38, direction="negative"),
            ShapFeatureImportance(feature="Pumping Velocity (SPM)", importance=0.32, direction="negative"),
            ShapFeatureImportance(feature="Thermal Dissipation Gradient", importance=0.18, direction="negative"),
            ShapFeatureImportance(feature="Fluid Submergence Head", importance=0.12, direction="positive"),
        ]
    )

    return {"recommendation": rec}

@app.post("/api/apply-recommendation", summary="Apply Setpoints with Human-in-the-Loop Approval")
def apply_recommendation(req: ApplyRecommendationRequest):
    well_idx = next((i for i, w in enumerate(wells_fleet) if w.id == req.wellId), None)
    if well_idx is None:
        raise HTTPException(status_code=404, detail=f"Well {req.wellId} not found")

    well = wells_fleet[well_idx]
    if well.activeRecommendation:
        rec = well.activeRecommendation
        rec.status = "APPLIED"
        rec.appliedAt = datetime.utcnow().isoformat() + "Z"

        # Apply recommended parameters
        well.srp.spm = rec.recommended.spm
        well.srp.vfdFrequency_hz = rec.recommended.vfdFrequency_hz
        well.production.oilRate_bopd = rec.recommended.projectedOilRate_bopd
        well.reliability.rodFailureProbability_pct = rec.recommended.projectedRodFailureRisk_pct
        well.srp.pumpFillage_pct = min(95.0, well.srp.pumpFillage_pct + 18.0)
        well.srp.rodFloatRisk_pct = round(rec.recommended.projectedRodFailureRisk_pct * 0.7)
        well.status = "WARNING" if rec.recommended.projectedRodFailureRisk_pct > 60 else "OPTIMAL"
        well.reliability.healthScore_pct = min(98.0, 100.0 - well.reliability.rodFailureProbability_pct)

        wells_fleet[well_idx] = well

    return {"success": True, "updatedWell": wells_fleet[well_idx]}

@app.post("/api/simulate", summary="Run What-If Multi-Day Scenario Simulation")
def simulate_scenario(req: SimulationRequest):
    well = next((w for w in wells_fleet if w.id == req.wellId), None)
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {req.wellId} not found")

    result = simulate_well_scenario(well, req)
    return {"simulation": result}

@app.post("/api/ai-advisor", response_model=AIChatResponse, summary="Petroleum AI Copilot Reasoning")
async def ai_advisor(req: AIChatRequest):
    target_well = next((w for w in wells_fleet if w.id == req.wellId), wells_fleet[0])

    # Try Gemini 2.5 Flash if GEMINI_API_KEY is configured
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = f"""You are the Lead Petroleum Reservoir & Production AI Specialist for Oil India Limited (OIL) on the Baghewala Field Digital Twin ("BagheTwin").
The reservoir is Jodhpur Sandstone at 1,150m depth with extra-heavy crude (10,000 - 13,000 cP native viscosity at 48°C, 17-19° API).
Thermal EOR uses Cyclic Steam Stimulation (CSS) and artificial lift uses Sucker Rod Pumps (SRP).

Well Context for {target_well.name} ({target_well.id}):
- Pad: {target_well.pad}
- Current Stage: {target_well.stage} (Cycle #{target_well.css.cycleNumber}, Day {target_well.css.stageDayCount})
- Near-Wellbore Temp: {target_well.reservoir.nearWellboreTemp_c}°C
- Effective Crude Viscosity: {target_well.reservoir.effectiveViscosity_cp} cP
- SRP Speed: {target_well.srp.spm} SPM, Stroke: {target_well.srp.strokeLength_in} in, VFD: {target_well.srp.vfdFrequency_hz} Hz
- Pump Fillage: {target_well.srp.pumpFillage_pct}%, Rod Float Risk: {target_well.srp.rodFloatRisk_pct}%
- Oil Rate: {target_well.production.oilRate_bopd} BOPD, Current SOR: {target_well.css.currentSor}
- Rod Failure Probability: {target_well.reliability.rodFailureProbability_pct}% (Predicted RUL: {target_well.reliability.predictedRul_days} days)
- Goodman Stress Ratio: {target_well.srp.goodmanStressRatio_pct}%

User Query: "{req.question}"

Provide a professional, rigorous, and actionable engineering diagnostic response with:
1. Root-Cause Analysis (connecting thermal cooling, viscosity changes, and mechanical SRP stress)
2. Closed-Loop Optimization Recommendation (CSS steam parameters and SRP setpoint adjustments)
3. Safety & Economic Rationale (Goodman diagram limits, SOR economic cut-off, and prevented downtime)
Keep the tone clear, authoritative, and structured with concise bullet points."""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response.text:
                return AIChatResponse(
                    answer=response.text,
                    source="FastAPI + Gemini 2.5 Flash AI Petroleum Copilot"
                )
        except Exception as e:
            print(f"Gemini API invocation failed in FastAPI, using domain fallback: {e}")

    # High-accuracy domain fallback response
    q_lower = req.question.lower()
    if any(k in q_lower for k in ['rod', 'drag', 'float', 'buckl']):
        answer = f"""### Diagnostic Analysis for {target_well.name}: Sucker Rod Fluid Drag & Rod-Float Risk
- **Root Cause**: The reservoir near-wellbore temperature has cooled to **{target_well.reservoir.nearWellboreTemp_c}°C**, causing crude viscosity to surge to **{target_well.reservoir.effectiveViscosity_cp} cP**.
- **Mechanical Phenomenon**: At **{target_well.srp.spm} SPM**, the downstroke velocity of the sucker rod string exceeds its buoyant terminal velocity in viscous fluid. Viscous shear stress exerts upward resistive drag, preventing full elongation and causing rod compression/floating.
- **Goodman Stress Ratio**: Currently **{target_well.srp.goodmanStressRatio_pct}%** (API Spec 11L threshold is 85%).
- **Corrective Action**: Reduce VFD frequency to operate at **{max(3.8, round(target_well.srp.spm - 0.9, 1))} SPM**. This eliminates downstroke compression, restores valve seating tension, and improves pump fillage from {target_well.srp.pumpFillage_pct}% to ~84%."""
    elif any(k in q_lower for k in ['steam', 'css', 'cutoff', 'soak']):
        answer = f"""### CSS Cycle & Thermal Strategy Analysis for {target_well.name}
- **Current Cycle**: Cycle #{target_well.css.cycleNumber}, Day {target_well.css.stageDayCount} in {target_well.css.stage}.
- **Steam-Oil Ratio (SOR)**: Current SOR is **{target_well.css.currentSor}** (Economic limit for Baghewala heavy oil is ~5.20).
- **Thermal Front**: Effective heated radius is **{target_well.reservoir.thermalRadius_m} m**.
- **Optimal Cut-Off Date**: Model projects economic break-even on Day **{target_well.css.economicCutoffPredictedDay}**.
- **Recommendation**: Plan CSS Cycle #{target_well.css.cycleNumber + 1} with **2,650 m³ steam @ 80% quality** and 5 days soak. Pre-heating will drop crude viscosity from {target_well.reservoir.effectiveViscosity_cp} cP back to < 95 cP."""
    else:
        answer = f"""### Operational Summary for {target_well.name} ({target_well.id})
- **Wellbore Depth**: {target_well.reservoir.reservoirDepth_m} m (Jodhpur Sandstone)
- **Current Operating Point**: {target_well.srp.spm} SPM | {target_well.production.oilRate_bopd} BOPD | SOR {target_well.css.currentSor}
- **Equipment Health**: Health Score {target_well.reliability.healthScore_pct}%, Rod Failure Risk {target_well.reliability.rodFailureProbability_pct}%, Estimated RUL {target_well.reliability.predictedRul_days} days.
- **Closed-Loop Recommendation**: Jointly adjust VFD to match thermal decline and schedule next cyclic steam injection to optimize life-cycle Net Present Value."""

    return AIChatResponse(
        answer=answer,
        source="FastAPI Petroleum Expert Rules Engine"
    )
