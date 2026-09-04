import { Well, WhatIfScenarioInput, SimulationResult } from '../types';

/**
 * BagheTwin Physics Engine
 * Formulates the coupled Reservoir-Thermal-Wellbore-SRP system
 * grounded in published petroleum engineering literature for Baghewala Field.
 */

// Viscosity-Temperature Andrade model calibrated for Baghewala Heavy Oil
export function calculateViscosity(tempC: number): number {
  const tempK = tempC + 273.15;
  // Calibrated so that at 48°C (321.15K) -> ~11,500 cP, at 140°C (413.15K) -> ~100 cP, at 210°C (483.15K) -> ~35 cP
  const a = -10.5;
  const b = 6380;
  const lnMu = a + b / tempK;
  return Math.max(15, Math.round(Math.exp(lnMu)));
}

// Inflow Performance Relationship (IPR)
export function calculateInflowRate(
  reservoirPressurePsi: number,
  flowingBhpPsi: number,
  tempC: number,
  permeabilityMd: number = 480,
  netPayM: number = 14
): number {
  const visc = calculateViscosity(tempC);
  const drawdown = Math.max(0, reservoirPressurePsi - flowingBhpPsi);
  
  // Base productivity index scales inversely with viscosity
  // Reference: J_ref = 0.25 bopd/psi @ 100 cP
  const productivityIndex = 0.25 * (100 / visc) * (permeabilityMd / 480) * (netPayM / 14);
  const flowRate = productivityIndex * drawdown;
  return Math.max(0, Number(flowRate.toFixed(1)));
}

// Sucker Rod Pump Theoretical Displacement (BOPD)
// Q_th = 0.1166 * D_plunger^2 * Stroke_in * SPM
export function calculatePumpDisplacement(plungerDiamIn: number, strokeIn: number, spm: number): number {
  return 0.1166 * Math.pow(plungerDiamIn, 2) * strokeIn * spm;
}

// Rod Float Risk & Downstroke Drag calculation
export function calculateRodFloatRisk(viscCp: number, spm: number, strokeIn: number): number {
  if (spm === 0) return 0;
  // Downstroke speed
  const strokeSpeedFtPerMin = (2 * strokeIn * spm) / 12;
  // Drag force is proportional to viscosity * velocity
  const dragIndex = (viscCp / 500) * (strokeSpeedFtPerMin / 50);
  const riskPct = Math.min(99, Math.max(5, Math.round(dragIndex * 35)));
  return riskPct;
}

// Sucker Rod Modified API Goodman Stress Ratio
export function calculateGoodmanStressRatio(
  peakLoadLbs: number,
  minLoadLbs: number,
  rodDiamIn: number = 0.875,
  tensileStrengthPsi: number = 115000
): number {
  const rodArea = Math.PI * Math.pow(rodDiamIn / 2, 2);
  const maxStress = peakLoadLbs / rodArea;
  const minStress = minLoadLbs / rodArea;
  const stressRange = maxStress - minStress;
  const allowableStress = (tensileStrengthPsi / 4) + 0.5625 * minStress;
  const ratio = (maxStress / allowableStress) * 100;
  return Number(Math.min(100, Math.max(20, ratio)).toFixed(1));
}

// Multi-day What-If simulation for Scenario planning
export function simulateWellScenario(well: Well, input: WhatIfScenarioInput): SimulationResult {
  const days = 45;
  const simulatedDays: number[] = [];
  const temperatureCurve_c: number[] = [];
  const viscosityCurve_cp: number[] = [];
  const oilRateCurve_bopd: number[] = [];
  const sorCurve: number[] = [];
  const rodStressCurve_pct: number[] = [];
  const pumpFillageCurve_pct: number[] = [];
  const cumulativeOil_bbl: number[] = [];

  const baseTemp = well.reservoir.nearWellboreTemp_c;
  const targetSpm = Math.max(1.0, well.srp.spm + input.deltaSpm);
  const steamFactor = 1 + input.deltaSteamVolume_pct / 100;
  
  // Starting temperature boosted if additional steam was injected
  let currentTemp = Math.min(230, baseTemp + (input.deltaSteamVolume_pct > 0 ? input.deltaSteamVolume_pct * 0.4 : 0));
  let cumOil = well.css.cumulativeOilThisCycle_bbl;

  for (let d = 1; d <= days; d++) {
    simulatedDays.push(d);
    
    // Thermal decay: exponential cooling towards native reservoir temp (48°C)
    const decayRate = 0.022 / Math.sqrt(steamFactor);
    currentTemp = 48 + (currentTemp - 48) * (1 - decayRate);
    temperatureCurve_c.push(Number(currentTemp.toFixed(1)));

    // Viscosity corresponding to current temperature
    const visc = calculateViscosity(currentTemp);
    viscosityCurve_cp.push(visc);

    // Inflow potential
    const inflow = calculateInflowRate(well.reservoir.currentPressure_psi, well.wellbore.flowingBottomholePressure_psi, currentTemp);
    
    // Pump capacity
    const pumpDispl = calculatePumpDisplacement(1.75, well.srp.strokeLength_in, targetSpm);
    
    // Pump fillage: balance of inflow vs displacement
    let fillage = Math.min(98, Math.max(30, (inflow / Math.max(1, pumpDispl)) * 100));
    // If viscosity is very high (> 800 cP), fillage drops due to delayed intake valve response
    if (visc > 800) {
      fillage = Math.max(25, fillage * (1 - (visc - 800) / 4000));
    }
    pumpFillageCurve_pct.push(Number(fillage.toFixed(1)));

    // Actual produced oil rate
    const producedOil = Number((pumpDispl * (fillage / 100) * (1 - well.production.waterCut_pct / 100)).toFixed(1));
    oilRateCurve_bopd.push(producedOil);
    cumOil += producedOil;
    cumulativeOil_bbl.push(Math.round(cumOil));

    // Steam-Oil Ratio (Cumulative Steam / Cumulative Oil)
    const totalSteam = well.css.cumulativeSteamInjected_m3 * steamFactor;
    const sor = Number((totalSteam / Math.max(10, cumOil)).toFixed(2));
    sorCurve.push(sor);

    // Rod Stress / Float calculation
    const rodRisk = calculateRodFloatRisk(visc, targetSpm, well.srp.strokeLength_in);
    rodStressCurve_pct.push(rodRisk);
  }

  // Economic NPV calculation
  // Oil price: ~$75/bbl (~6,200 INR), Steam cost: ~$28/m3 (~2,300 INR), Lifting cost: ~$12/bbl (~1,000 INR)
  const netRevenue = (cumOil - well.css.cumulativeOilThisCycle_bbl) * 6200;
  const addedSteamCost = (well.css.targetSteamVolume_m3 * (input.deltaSteamVolume_pct / 100)) * 2300;
  const liftingCost = (cumOil - well.css.cumulativeOilThisCycle_bbl) * 1000;
  const projectedNpv_inr = Math.round(netRevenue - addedSteamCost - liftingCost);

  return {
    simulatedDays,
    temperatureCurve_c,
    viscosityCurve_cp,
    oilRateCurve_bopd,
    sorCurve,
    rodStressCurve_pct,
    pumpFillageCurve_pct,
    cumulativeOil_bbl,
    projectedNpv_inr,
  };
}
