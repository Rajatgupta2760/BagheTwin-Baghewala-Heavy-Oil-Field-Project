# 🛢️ BagheTwin

## AI-Powered Well-to-Surface Digital Twin for Heavy-Oil Production Optimization

> **Sense → Simulate → Predict → Optimize → Improve**

BagheTwin is an AI-enabled **Well-to-Surface Digital Twin** concept and prototype for optimizing heavy-oil production operations at the **Baghewala Field, Rajasthan**.

The project aims to connect the behavior of the **reservoir, thermal recovery process, wellbore, Sucker Rod Pump (SRP), and surface production system** into one continuously updated digital representation of a producing well.

Instead of treating **Cyclic Steam Stimulation (CSS)** and **SRP operation** as separate optimization problems, BagheTwin is designed to treat them as a **coupled system**. It uses operational data, physics-inspired relationships, machine-learning models, predictive analytics, and constrained optimization to support better production and equipment decisions.

> **Core idea:** understand the current state of the well, predict what will happen next, and recommend what should be done next.

---

## 📌 Project Overview

Heavy-oil production is strongly influenced by temperature-dependent viscosity, reservoir pressure, fluid mobility, artificial-lift performance, and thermal-cycle behavior.

The proposed BagheTwin workflow is:

```text
Field / Historical Data
          ↓
   Data Preparation
          ↓
  Digital Twin State
          ↓
 ┌────────┼─────────┐
 ↓        ↓         ↓
Thermal Reservoir  SRP
Twin    Model      Twin
 └────────┼─────────┘
          ↓
  AI / Predictive Layer
          ↓
 ┌────────┼───────────┐
 ↓        ↓           ↓
Production Thermal   Equipment
Forecast  Forecast    Health
 └────────┼───────────┘
          ↓
   Optimization Engine
          ↓
 ┌────────┴──────────┐
 ↓                   ↓
CSS Strategy      SRP Strategy
 ↓                   ↓
 └────────┬──────────┘
          ↓
 Safety + Economic Validation
          ↓
  Operator Recommendation
          ↓
     Field Decision
          ↓
     New Data ↺
```

---

## 🎯 Problem Statement

The target use case is the optimization of **CSS and SRP operations for heavy-oil wells of Baghewala Field**.

### Current challenges

- CSS parameters such as steam volume, injection pressure, soak time, and production cut-off may be selected primarily from historical operating practices.
- SRP parameters such as **SPM, stroke length, and VFD settings** may be changed manually and reactively.
- Reservoir temperature changes after steam injection and during the production/cooling phase.
- A decline in temperature can increase heavy-oil viscosity and reduce mobility.
- Changing fluid conditions can affect pump fillage, pump efficiency, rod loading, and energy demand.
- Rod floating, impact loading, pump unsetting, rod failures, and maintenance events can reduce availability.
- Steam use and energy consumption need to be balanced against incremental oil recovery.
- Reservoir behavior, wellbore conditions, SRP performance, and surface production are not always optimized as a single coupled system.

### The operational question

> **What combination of thermal stimulation and artificial-lift settings gives the best production and economic outcome while keeping the well and equipment inside safe operating limits?**

---

# 💡 Proposed Solution

## BagheTwin

BagheTwin creates a virtual operational representation of a heavy-oil well using four connected model domains:

### 1. Reservoir Twin

Represents and estimates:

- Reservoir pressure
- Reservoir temperature
- Effective near-wellbore mobility
- Productivity behavior
- Thermal response

### 2. Thermal / CSS Twin

Represents:

- Steam injection
- Steam volume and rate
- Steam pressure and quality
- Injection duration
- Soak duration
- Production phase
- Heating and cooling behavior
- Steam-Oil Ratio (SOR)

### 3. Wellbore Twin

Represents:

- Pressure changes
- Temperature changes along the production path
- Fluid-level behavior
- Flowing conditions
- Surface-to-downhole relationships

### 4. SRP Twin

Represents:

- SPM (Strokes Per Minute)
- Stroke length
- VFD frequency
- Polished-rod load
- Pump fillage
- Pump efficiency
- Motor load / power
- Rod loading and risk indicators
- Dynamometer-card behavior

These four representations are joined into a **well-to-surface state model**.

---

# 🧩 Why CSS and SRP Must Be Optimized Together

A major design principle of BagheTwin is that thermal stimulation and artificial lift are coupled.

```text
Steam Injection
      ↓
Reservoir Temperature ↑
      ↓
Oil Viscosity ↓
      ↓
Mobility ↑
      ↓
Reservoir Inflow ↑
      ↓
Pump Fillage / SRP Response
      ↓
Surface Production
```

During cooling:

```text
Production
    ↓
Heat Removal / Cooling
    ↓
Temperature ↓
    ↓
Viscosity ↑
    ↓
Mobility ↓
    ↓
Pump Performance / Production Potential ↓
```

Therefore:

> **The best CSS schedule depends partly on how the well will subsequently be produced, while the best SRP operating point depends on the current thermal and reservoir state.**

This coupled optimization is the main technical motivation of the project.

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                     BAGHETWIN                            │
│        Well-to-Surface Digital Twin Platform             │
└──────────────────────────────┬───────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│                 DATA INGESTION LAYER                     │
│                                                          │
│ Production | CSS | SRP | Pressure | Temp | PVT | Events │
└──────────────────────────────┬───────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│              DATA QUALITY & FEATURE LAYER                │
│                                                          │
│ Cleaning | Validation | Time Alignment | Missing Data    │
│ Outliers | Aggregation | Rolling Features | Lag Features│
└──────────────────────────────┬───────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │ THERMAL TWIN │  │ RESERVOIR    │  │ SRP TWIN     │
      │              │  │ MODEL        │  │              │
      │ Temperature  │  │ Pressure     │  │ SPM          │
      │ Heat balance │  │ Inflow       │  │ Stroke       │
      │ Viscosity    │  │ Mobility     │  │ Load         │
      │ Heating      │  │ Productivity │  │ Fillage      │
      └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌────────────────────┐
                    │   STATE ESTIMATOR  │
                    │                    │
                    │ Current Well State │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │   AI / ML LAYER    │
                    │                    │
                    │ Forecasting        │
                    │ Anomaly Detection  │
                    │ Failure Prediction │
                    │ Dynacard Analysis  │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │ OPTIMIZATION       │
                    │                    │
                    │ CSS Optimization   │
                    │ SRP Optimization   │
                    │ Economic Objective │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │ DECISION SUPPORT   │
                    │                    │
                    │ Recommendation     │
                    │ Confidence         │
                    │ Explanation        │
                    │ Safety Checks      │
                    └─────────┬──────────┘
                              ▼
                           OPERATOR
                              │
                              ▼
                         FIELD ACTION
                              │
                              ▼
                          NEW DATA
                              ↺
```

---

# 🔥 Cyclic Steam Stimulation (CSS) Module

CSS is represented as a repeated cycle of:

```text
┌─────────────┐
│  INJECTION  │
└──────┬──────┘
       ↓
┌─────────────┐
│    SOAK     │
└──────┬──────┘
       ↓
┌─────────────┐
│ PRODUCTION  │
└──────┬──────┘
       ↓
   Evaluate
       ↓
  Next Cycle
```

### CSS inputs

- Steam volume / mass
- Steam injection rate
- Steam quality
- Injection pressure
- Steam temperature
- Injection duration
- Soak duration
- Production duration
- Wellhead pressure and temperature
- Reservoir temperature and pressure
- Previous cycle performance

### CSS outputs

- Predicted oil/cycle
- Predicted production decline
- SOR
- Reservoir thermal state
- Estimated viscosity
- Expected energy use
- Recommended next-cycle parameters

---

# 🌡️ Thermal and Viscosity Model

One of the central physical relationships in the system is:

\[
T_{reservoir}\uparrow \Rightarrow \mu_{oil}\downarrow \Rightarrow Mobility\uparrow
\]

where:

- \(T_{reservoir}\) is reservoir temperature
- \(\mu_{oil}\) is oil viscosity

A first reduced-order viscosity relationship can be represented as:

\[
\ln(\mu)=a+\frac{b}{T}
\]

where model parameters are calibrated using available fluid-property data.

A simplified heat-balance representation is:

\[
C_{eff}\frac{dT}{dt}=Q_{steam}-Q_{loss}-Q_{production}
\]

The prototype can progressively replace simplified equations with calibrated field models as more data become available.

---

# 🛠️ Sucker Rod Pump (SRP) Module

SRP operating variables include:

- **SPM** — Strokes Per Minute
- Stroke length
- VFD frequency
- Motor current
- Motor power
- Polished-rod load
- Pump fillage
- Pump efficiency
- Fluid level
- Pressure and temperature

A simplified pump-displacement relationship can be expressed as:

\[
Q_{th}\propto A_p \times S \times N
\]

where:

- \(A_p\) = effective plunger area
- \(S\) = stroke length
- \(N\) = SPM

Actual production is lower or different than theoretical displacement because of pump fillage, leakage, gas interference, fluid properties, pressure, and other effects.

---

# 📈 Dynamometer Card Analytics

Dynamometer cards can be incorporated into the SRP health layer.

### Processing flow

```text
Raw Dynamometer Card
        ↓
Noise Filtering
        ↓
Normalization
        ↓
Resampling
        ↓
Feature Extraction
        ↓
ML Classification
        ↓
Pump / Rod Condition
```

### Potential operating classes

- Normal
- Pump-off
- Fluid pound
- Gas interference
- Valve leakage
- High loading
- Rod problem
- Other abnormal conditions

The final class list should be adapted to the actual labels present in the field dataset.

---

# 🚨 Predictive Maintenance

BagheTwin can calculate health and risk indicators such as:

```text
Rod Failure Risk
Pump Failure Risk
Rod-Float Risk
Pump-Off Risk
High Dynamic Load Risk
Anomaly Score
```

### Example decision card

```text
SRP HEALTH
────────────────────────────
Pump Fillage       61%
Rod Loading        HIGH
Motor Load         NORMAL
Rod-Float Risk     HIGH

Overall Status     ⚠ WARNING

Suggested Action:
Review SRP operating point
and validate against safety limits.
```

> Values shown in examples are illustrative only and are not actual Baghewala measurements.

---

# 🤖 AI / Machine Learning Layer

The project is designed as a multi-model system instead of forcing every task into one model.

| Problem | Candidate approach |
|---|---|
| Oil production forecasting | XGBoost / LightGBM / LSTM |
| SOR prediction | XGBoost / LightGBM |
| Temperature prediction | Physics + ML |
| Viscosity estimation | Regression / physics-guided ML |
| SRP anomaly detection | Isolation Forest / Autoencoder |
| Dynacard classification | 1D-CNN / CNN |
| Failure prediction | XGBoost / Random Forest / survival methods |
| CSS optimization | Bayesian Optimization |
| Multi-objective optimization | NSGA-II |
| Closed-loop decision support | Model Predictive Control |

### Recommended progression

```text
Baseline Models
      ↓
XGBoost / Random Forest
      ↓
Physics + ML Hybrid
      ↓
Constrained Optimization
      ↓
Closed-Loop MPC
```

The best model should be selected using the actual dataset and out-of-time validation rather than assuming a deep-learning model is always superior.

---

# 🧮 Feature Engineering

The model should capture both current conditions and operational history.

### Thermal features

- Current temperature
- 1h / 6h / 12h / 24h temperature lags
- Temperature change over time
- Cumulative steam in current cycle
- Days since last CSS
- Heating/cooling rate

### Production features

- Current oil rate
- Lagged oil rate
- Rolling mean production
- Production decline rate
- Water cut
- Cumulative oil

### SRP features

- SPM
- Stroke
- VFD frequency
- Motor current
- Motor power
- Maximum load
- Minimum load
- Load range
- Pump fillage
- Pump efficiency
- Dynacard shape features

### Interaction features

- Temperature × SPM
- Viscosity × SPM
- Steam volume × soak time
- Steam rate × injection pressure
- Temperature × water cut
- Stroke × SPM

---

# ⚙️ Joint CSS + SRP Optimization

The optimization layer considers both thermal and artificial-lift decisions.

### CSS decision variables

\[
X_{CSS}=[V_s,Q_s,P_{inj},t_{inj},t_{soak},t_{prod}]
\]

### SRP decision variables

\[
X_{SRP}=[SPM,S,VFD]
\]

### Conceptual objective

\[
\max J = w_1Q_o-w_2SOR-w_3E-w_4C_{steam}-w_5C_{failure}+w_6NPV
\]

where:

- \(Q_o\) = oil production
- SOR = Steam-Oil Ratio
- \(E\) = energy consumption
- \(C_{steam}\) = steam-related cost
- \(C_{failure}\) = expected equipment/failure cost
- NPV = economic value

### Constraints

The optimizer should respect configurable engineering limits such as:

- Maximum rod load
- Maximum allowable stress
- Safe pressure limits
- Safe SPM range
- Safe VFD range
- Minimum pump fillage
- Maximum acceptable failure risk
- Production requirements

---

# 🔄 Closed-Loop Decision Workflow

```text
              CURRENT WELL DATA
                     ↓
              DATA VALIDATION
                     ↓
                DIGITAL TWIN
                     ↓
              STATE ESTIMATION
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
 Future Production          Equipment Risk
        ↓                         ↓
        └────────────┬────────────┘
                     ↓
               OPTIMIZATION
                     ↓
         Candidate CSS + SRP Plans
                     ↓
              SAFETY VALIDATION
                     ↓
            ECONOMIC EVALUATION
                     ↓
             AI RECOMMENDATION
                     ↓
              HUMAN APPROVAL
                     ↓
                FIELD ACTION
                     ↓
                NEW DATA ↺
```

The prototype is intended as a **decision-support system**. It should not directly control physical field equipment without appropriate engineering validation, safety systems, and operational authorization.

---

# 📊 Dashboard Concept

The application can expose the Digital Twin through a field-oriented dashboard.

```text
┌────────────────────────────────────────────────┐
│                 BAGHETWIN                      │
│         WELL DIGITAL TWIN PLATFORM             │
├────────────────────────────────────────────────┤
│ Oil Rate │ SOR │ Energy │ Well Health │ Alerts│
├────────────────────────────────────────────────┤
│                                                │
│              FIELD / WELL VIEW                 │
│                                                │
├────────────────────────┬───────────────────────┤
│ THERMAL STATE           │ SRP HEALTH            │
│ Temperature             │ Pump Fillage          │
│ Viscosity               │ Rod Load              │
│ Pressure                │ Failure Risk          │
├────────────────────────┼───────────────────────┤
│ PRODUCTION FORECAST     │ CSS OPTIMIZER         │
│ 24h / 7d / 30d          │ Steam Recommendation  │
├────────────────────────┴───────────────────────┤
│             AI RECOMMENDATIONS                  │
└────────────────────────────────────────────────┘
```

---

# 🩺 Explainable AI

Industrial recommendations should be understandable to engineers and operators.

Instead of:

> **Reduce SPM.**

The platform should aim to communicate:

```text
RECOMMENDATION
──────────────────────────
Reduce SRP speed within the
approved operating envelope.

MAIN CONTRIBUTORS
──────────────────────────
• Pump fillage declining
• Dynamic rod load increasing
• Estimated viscosity increasing
• Limited incremental production
  from higher pumping speed

EXPECTED EFFECT
──────────────────────────
↓ Dynamic loading
↓ Equipment risk
≈ Sustained production
```

Recommended explanation tools include:

- SHAP values
- Feature importance
- Rule-based explanations
- Confidence scores
- Data-quality indicators

---

# 📌 Key Performance Indicators

## Production

- Oil rate
- Liquid rate
- Cumulative oil
- Water cut
- Production decline

## Thermal

- Steam injected
- Reservoir temperature
- Estimated viscosity
- Heat utilization
- Steam-Oil Ratio

## SRP

- SPM
- Stroke length
- VFD frequency
- Pump fillage
- Pump efficiency
- Rod load
- Motor power

## Reliability

- Rod failures
- Pump failures
- Pump unsetting events
- Downtime
- MTBF
- Maintenance cost

## Economics

- Energy/barrel
- Steam cost/barrel
- Operating cost/barrel
- Incremental oil value
- NPV / economic value

---

# 🧪 Validation Strategy

A serious digital-twin project requires both **model validation** and **operational backtesting**.

## Time-aware data split

Avoid random train/test splitting for time-series operations.

Example:

```text
Older period      → Training
Middle period     → Validation
Latest period     → Test
```

The actual date boundaries should be selected after inspecting the available dataset.

## Regression metrics

- MAE
- RMSE
- MAPE
- R²

## Classification metrics

- Precision
- Recall
- F1-score
- ROC-AUC
- PR-AUC
- False-alarm rate

## Optimization validation

Compare:

```text
Historical operating strategy
             VS
BagheTwin simulated / backtested strategy
```

using:

- Oil/cycle
- Cumulative oil
- SOR
- Energy/barrel
- Failure events
- Downtime
- Maintenance cost
- Operating cost

> Improvement percentages should only be reported after they are calculated from validated project data or a clearly labeled physics-based simulator.

---

# 🧪 Synthetic / Simulation Mode

If complete field SCADA data are not available, BagheTwin can use a clearly labeled **synthetic/physics-generated dataset** for demonstration.

The simulator can reproduce:

```text
CSS cycle
    ↓
Temperature change
    ↓
Viscosity response
    ↓
Reservoir inflow
    ↓
SRP pumping
    ↓
Oil production
    ↓
Rod / pump behavior
    ↓
Sensor observations
```

Synthetic data should be explicitly identified as synthetic and should not be presented as actual Baghewala field measurements.

---

# 🗂️ Current Repository Structure

The current codebase uses a **Vite + React + TypeScript** frontend structure with backend/server components.

```text
BagheTwin/
│
├── backend/                    # Backend/API-related code
│
├── public/                     # Public/static assets
│
├── src/
│   ├── components/             # Reusable React components
│   ├── data/                   # Application/sample data
│   ├── services/               # API and application services
│   ├── App.tsx                 # Main React application
│   ├── index.css               # Global stylesheet
│   ├── main.tsx                # Frontend entry point
│   └── types.ts                # TypeScript type definitions
│
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── bun.lock                    # Bun dependency lock file
├── index.html                  # Vite HTML entry point
├── metadata.json               # Project metadata
├── package.json                # Frontend dependencies/scripts
├── requirements.txt            # Python/backend dependencies
├── server.ts                   # Server entry point
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

# 🛠️ Technology Stack

## Current application structure

- React
- TypeScript
- Vite
- CSS
- Component-based frontend architecture
- Service/API layer
- TypeScript server (`server.ts`)
- Python dependency environment (`requirements.txt`)
- Bun / package management

## Planned / extensible technical components

Depending on final implementation, the platform can integrate:

- Python data-processing stack
- FastAPI or equivalent API layer
- PostgreSQL / time-series storage
- XGBoost / LightGBM
- PyTorch
- SHAP
- SciPy / Optuna / pymoo
- Plotly / charting libraries
- Docker
- WebSocket / streaming telemetry

> Only technologies actually implemented in the repository should be presented as implemented features in a final release.

---

# 📁 Recommended Code Organization for Future Modules

The existing structure can gradually evolve toward:

```text
BagheTwin/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── models/
│   └── schemas/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── data/
│   ├── hooks/
│   ├── utils/
│   └── types.ts
│
├── ml/
│   ├── production/
│   ├── thermal/
│   ├── srp/
│   ├── failure_prediction/
│   └── dynacard/
│
├── digital_twin/
│   ├── reservoir/
│   ├── thermal/
│   ├── wellbore/
│   └── srp/
│
├── optimization/
│   ├── css_optimizer.py
│   ├── srp_optimizer.py
│   └── economic_optimizer.py
│
├── simulator/
│   └── synthetic_well.py
│
├── notebooks/
│   ├── eda.ipynb
│   ├── production_model.ipynb
│   ├── thermal_model.ipynb
│   └── srp_analysis.ipynb
│
└── docs/
    ├── architecture/
    ├── research/
    └── api/
```

---

# ▶️ Getting Started

## Prerequisites

Install a current version of:

- Node.js
- Bun or npm
- Python 3.x (if backend/ML modules are enabled)
- Git

## Clone the repository

```bash
git clone https://github.com/<your-username>/BagheTwin.git
cd BagheTwin
```

## Install frontend dependencies

Using Bun:

```bash
bun install
```

Or npm:

```bash
npm install
```

## Configure environment variables

Copy the environment template:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then add the project-specific values required by the application.

## Install Python dependencies

If the backend / ML environment is enabled:

```bash
pip install -r requirements.txt
```

## Start the frontend

Using Bun:

```bash
bun run dev
```

Or npm:

```bash
npm run dev
```

Open the local URL shown by Vite in the terminal.

> Exact scripts depend on the current `package.json`. Use `npm run` or `bun run` to list the available commands.

---

# 🔌 Suggested API Design

As the backend grows, the following REST endpoints provide a clean separation between UI and engineering logic.

```text
GET  /api/wells
GET  /api/wells/{id}
GET  /api/wells/{id}/state
GET  /api/wells/{id}/production
GET  /api/wells/{id}/thermal
GET  /api/wells/{id}/srp

POST /api/css/predict
POST /api/css/optimize

POST /api/srp/analyze
POST /api/srp/optimize
POST /api/srp/fault-detect

POST /api/dynacard/analyze

GET  /api/forecast
GET  /api/alerts
GET  /api/recommendations
```

These endpoints are a recommended architecture and should be implemented only as the corresponding backend services become available.

---

# 🔐 Safety and Operational Philosophy

BagheTwin should be treated as a **decision-support platform**.

Recommended control chain:

```text
AI Prediction
      ↓
Optimization
      ↓
Engineering Constraints
      ↓
Safety Validation
      ↓
Human Review
      ↓
Operational Decision
```

The platform should never use a machine-learning recommendation to bypass established engineering, mechanical, pressure, or operational safety limits.

---

# 🌱 Future Scope

### Real-time integration

- SCADA integration
- IoT sensors
- OPC-UA
- MQTT
- Streaming telemetry
- Live SRP/dynamometer data

### Advanced AI

- Physics-informed neural networks
- Temporal deep learning
- Online learning
- Model-drift monitoring
- Remaining Useful Life prediction

### Advanced optimization

- Model Predictive Control
- Multi-well optimization
- Reinforcement learning inside a validated simulator
- Field-wide economic optimization

### Visualization

- 3D well digital twin
- Thermal-zone visualization
- Interactive wellbore representation
- Historical-vs-predicted state comparison

---

# 🚀 Development Roadmap

## Phase 1 — Foundation

- [x] React/Vite frontend structure
- [x] Component-based UI structure
- [x] Data/service separation
- [ ] Finalize well data schema
- [ ] Finalize backend API contract

## Phase 2 — Data & Analytics

- [ ] Data ingestion
- [ ] Data cleaning and validation
- [ ] Exploratory data analysis
- [ ] Feature engineering
- [ ] Historical CSS-cycle analytics
- [ ] SRP analytics

## Phase 3 — Digital Twin

- [ ] Thermal model
- [ ] Viscosity model
- [ ] Reservoir inflow model
- [ ] Wellbore model
- [ ] SRP state model
- [ ] State estimation

## Phase 4 — AI

- [ ] Production forecasting
- [ ] Temperature forecasting
- [ ] SOR prediction
- [ ] Dynacard classification
- [ ] Failure-risk prediction
- [ ] Anomaly detection

## Phase 5 — Optimization

- [ ] CSS optimization
- [ ] SRP optimization
- [ ] Multi-objective optimization
- [ ] Economic objective
- [ ] Constraint validation

## Phase 6 — Decision Support

- [ ] Explainable AI
- [ ] Operator recommendations
- [ ] Confidence score
- [ ] Alerts
- [ ] Historical-vs-optimized backtesting

---

# 📚 Research Foundation

The project is grounded in publicly available field information and research on heavy-oil production, CSS, artificial lift, dynacard analytics, and machine learning.

### Baghewala / Oil India Limited

Oil India Limited's Rajasthan-field material provides public information on Baghewala, Jodhpur Sandstone, heavy-oil production, thermal recovery, artificial lift, and reported fluid properties.

- Oil India Limited — Rajasthan Fields  
  https://www.oil-india.com/rajasthan-fields

### Government / DGH

The Directorate General of Hydrocarbons provides public information related to heavy-oil occurrences and the geological context of the region.

- DGH / NDR  
  https://www.ndrdgh.gov.in/NDR/

### CSS Optimization Research

Research has investigated multi-variable CSS optimization, experimental design, surrogate modeling, and economic/technical objectives.

- ScienceDirect — Efficient optimization framework for cyclic steam stimulation  
  https://www.sciencedirect.com/science/article/pii/S0360544219322960

- ScienceDirect — Hybrid optimization technique for cyclic steam stimulation  
  https://www.sciencedirect.com/science/article/pii/S0098135415003117

### AI-Based CSS Decision Support

AI/ANN-based decision-support approaches have been investigated for CSS and heavy-oil production prediction, including temperature-dependent viscosity and reservoir properties.

- ScienceDirect — AI-based decision making for cyclic steam stimulation  
  https://www.sciencedirect.com/science/article/abs/pii/S0920410516307537

### SRP / Dynamometer Analytics

Machine learning has been investigated for automatic interpretation of sucker-rod-pump dynamometer cards and pump-condition surveillance.

- SPE/JPT — Dynamometer Card Classification Uses Machine Learning  
  https://jpt.spe.org/dynamometer-card-classification-uses-machine-learning

### SRP Failure Prediction

Recent research has also explored predictive modeling of sucker-rod-pump failures using surface pump-load information.

- SPE/JPT — Prediction of Sucker Rod Pump Failures Using Scaled Load Ratios and Machine Learning  
  https://jpt.spe.org/prediction-of-sucker-rod-pump-failures-using-scaled-load-ratios-and-machine-learning

---

# 📖 Suggested Literature Review Topics

For the technical report / SIH presentation, study the following areas:

1. Heavy-oil rheology and temperature-dependent viscosity
2. Cyclic Steam Stimulation fundamentals
3. Steam injection efficiency and SOR
4. Thermal reservoir behavior
5. Artificial-lift optimization
6. Sucker Rod Pump mechanics
7. Dynamometer-card interpretation
8. Rod loading, rod floating, and pump-off behavior
9. Production forecasting for heavy-oil wells
10. Predictive maintenance
11. Digital twins for industrial assets
12. Hybrid physics + machine learning
13. Constrained optimization
14. Model Predictive Control
15. Economic optimization of thermal recovery

---

# 🏆 Expected Impact

## Production

- Better CSS-cycle planning
- Improved understanding of thermal state
- More consistent artificial-lift decisions
- Potential increase in sustained production

## Efficiency

- Lower unnecessary steam use
- Lower SOR
- Reduced energy intensity
- Better use of available pumping capacity

## Reliability

- Earlier detection of abnormal SRP behavior
- Reduced equipment-risk exposure
- Better maintenance planning
- Reduced unplanned downtime

## Economics

- Better oil recovered per unit steam
- Lower energy cost per barrel
- Lower maintenance burden
- Improved economic value of production decisions

## Decision Making

- Unified reservoir-to-surface visibility
- Predictive rather than purely reactive monitoring
- Explainable recommendations
- Repeatable data-driven decisions

---

# 🧠 Innovation

The main innovation is not simply the use of machine learning.

BagheTwin combines:

```text
              PHYSICS
                 +
                 AI
                 +
          DIGITAL TWIN
                 +
            OPTIMIZATION
                 +
             ECONOMICS
                 ↓
     JOINT CSS + SRP DECISION SUPPORT
```

### Conventional approach

```text
CSS Analysis  ────→ CSS Decision

SRP Analysis  ────→ SRP Decision
```

### BagheTwin approach

```text
Reservoir
   ↕
Thermal State
   ↕
Viscosity
   ↕
Inflow
   ↕
SRP State
   ↕
Production
   ↕
Economics
   ↕
Optimization
```

This creates a single operational loop instead of disconnected decisions.

---

# 👥 Intended Users

- Reservoir engineers
- Production engineers
- Artificial-lift engineers
- Field operators
- Reliability / maintenance teams
- Petroleum engineering researchers
- Energy and production managers

---

# 📜 Project Context

This project is prepared in the context of **Smart India Hackathon 2026** and follows the six-slide idea-submission structure provided for the competition:

1. Title Page
2. Idea Title / Proposed Solution / Innovation
3. Technical Approach
4. Feasibility and Viability
5. Impact and Benefits
6. Research and References

The detailed implementation in this repository is intended to support the prototype beyond the concise SIH submission format.

---

# ⚠️ Data & Research Disclaimer

BagheTwin is a research and prototype platform.

- Public field information should be cited with its original source and publication date.
- Demonstration values must be labeled as illustrative or synthetic.
- Synthetic data must not be represented as actual Baghewala operational data.
- Model performance must be reported only after validation on the available project dataset.
- Real-field recommendations require review by qualified reservoir, production, artificial-lift, and operations engineers before operational use.

---

# 📄 License

Add the project's chosen open-source or private-use license here.

Example:

```text
MIT License
```

Do not claim a license until the repository owner has selected one and committed the corresponding `LICENSE` file.

---

# 🤝 Contributing

Contributions can focus on:

- Data-processing pipelines
- Digital-twin models
- CSS optimization
- SRP analytics
- Dynacard classification
- Predictive-maintenance models
- Visualization
- API development
- Testing and validation
- Documentation

### Suggested workflow

```bash
git checkout -b feature/<feature-name>

# make changes

git add .
git commit -m "feat: add <feature>"
git push origin feature/<feature-name>
```

Open a Pull Request with:

- Problem description
- Proposed solution
- Screenshots / plots where relevant
- Validation results
- Known limitations

---

# ⭐ Final Vision

> **BagheTwin transforms heavy-oil production from reactive monitoring into predictive and prescriptive well optimization by connecting reservoir thermal behavior with artificial-lift performance.**

### **Sense → Simulate → Predict → Optimize → Improve**

---

## 🔎 Keywords

`BagheTwin` `Baghewala` `Heavy Oil` `Digital Twin` `CSS` `Cyclic Steam Stimulation` `SRP` `Sucker Rod Pump` `Artificial Lift` `Oil & Gas` `Petroleum Engineering` `Machine Learning` `AI` `Predictive Maintenance` `Production Optimization` `Steam-Oil Ratio` `SOR` `Dynamometer Card` `Well Optimization` `Thermal EOR`
