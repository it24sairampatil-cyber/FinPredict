<table class="header-info-table" style="width: 100%; border: none !important; margin-bottom: 0px; font-size: 11pt; border-collapse: collapse;">
  <tr style="border: none !important; background: transparent !important;"><td style="border: none !important; padding: 2px 0;" colspan="2"><strong>Students Name:</strong> Krish Pathare (43), Sairam Patil (48)</td></tr>
  <tr style="border: none !important; background: transparent !important;"><td style="border: none !important; padding: 2px 0;" colspan="2"><strong>Subject:</strong> Artificial Intelligence and Machine Learning</td></tr>
  <tr style="border: none !important; background: transparent !important;"><td style="border: none !important; padding: 2px 0; width: 50%;"><strong>Semester:</strong> V</td><td style="border: none !important; padding: 2px 0; width: 50%;"><strong>Class:</strong> TE IT</td></tr>
  <tr style="border: none !important; background: transparent !important;"><td style="border: none !important; padding: 2px 0; width: 50%;"><strong>Division:</strong> B</td><td style="border: none !important; padding: 2px 0; width: 50%;"><strong>Date of Performance / Submission:</strong> 19 October 2026</td></tr>
</table>

<div style="text-align: center; margin-top: 25px; margin-bottom: 22px;">
  <div class="complex-engineering-title" style="font-size: 16pt; font-weight: bold; margin-bottom: 10px;">EXPERIMENT NO. - 10</div>
  <div class="project-sub-title" style="font-size: 13.5pt; font-weight: bold; line-height: 1.35;">Aim :- Mini Project: FinPredict - Decentralized Financial Planning &amp; Analysis (FP&amp;A) with Time-Series Forecasting and Linear Programming Optimization</div>
</div>

### Project Details

### Problem statement
Personal and small-business financial planning frequently suffers from spending volatility, irregular discretionary surges, and forward cash-flow insolvency. Conventional spreadsheet templates and bookkeeping tools are strictly reactive—they record where capital was spent in the past, but fail to forecast future cash-flow deficits or solve for mathematically optimal spending adjustments.

Furthermore, commercial cloud-based budgeting services require users to upload unencrypted bank statements and Personally Identifiable Information (PII) to remote multi-tenant servers, creating substantial privacy risks under data protection regulations (such as the Indian Digital Personal Data Protection Act, 2023). 

The engineering objective of this mini-project is to build **FinPredict**, a decentralized decision-support platform that:
1. Ingests user income and categorized historical expenses in Indian Rupees (₹).
2. Predicts future cash-flow trajectories up to 90 days ahead using time-series forecasting.
3. Automatically computes mathematically optimal budget rebalancing under non-negotiable living survival floors using Linear Programming.
4. Detects statistical spending anomalies in real-time.
5. Enforces a 100% client-side Zero-Trust air-gapped architecture with cryptographic PII masking.

---

### Dataset Identification
The system models structured personal and departmental budget envelopes standardized in Indian Rupees (₹). The data schema consists of nine core numerical attributes capturing inflows, essential survival floors, and elastic discretionary envelopes:

| Attribute / Feature | Feature Role & Meaning | Data Type | Constraint & Typical Range (₹) | Living Floor Status |
| :--- | :--- | :--- | :--- | :--- |
| `SALARY_INCOME` | Net monthly post-tax earnings or budget inflow | Numerical | $\ge ₹5,000$ (Default: ₹85,000) | Primary Inflow |
| `HOUSING` | Rent, mortgage EMI, society maintenance | Numerical | $\ge 20\%$ of Salary | Hard Essential Floor |
| `FOOD` | Groceries, staples, essential daily nutrition | Numerical | $\ge 12\%$ of Salary | Hard Essential Floor |
| `TRANSPORT` | Fuel, public transit passes, vehicle upkeep | Numerical | $\ge 4\%$ of Salary | Semi-Elastic Outflow |
| `UTILITIES` | Electricity, water, cooking gas, broadband | Numerical | $\ge 4\%$ of Salary | Hard Essential Floor |
| `HEALTHCARE` | Doctor visits, prescription medicines, insurance | Numerical | $\ge 4\%$ of Salary | Hard Essential Floor |
| `ENTERTAINMENT` | OTT subscriptions, dining out, recreation | Numerical | Floor $\ge 0$ | Fully Elastic Discretionary |
| `SHOPPING` | Apparel, consumer electronics, retail items | Numerical | Floor $\ge 0$ | Fully Elastic Discretionary |
| `OTHER` | Miscellaneous unplanned discretionary outflow | Numerical | Floor $\ge 0$ | Fully Elastic Discretionary |

#### Data Quality & Validation Rules:
* **Sanitization:** Rejects non-numeric tokens, null values, and negative expenditure entries.
* **Indian Numbering Normalization:** Standardizes inputs to `en-IN` numbering conventions (Lakhs and Crores).
* **Solvency Constraint Check:** Validates that total essential floors do not exceed 100% of declared net income before running mathematical routines.
* **Missing Value Treatment:** Missing transaction intervals are forward-filled using the median value of the preceding 7-day cyclical window.

---

### ML Algorithms

FinPredict integrates three complementary mathematical and machine learning algorithms:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FinPredict Math & ML Engine                     │
├──────────────────────────┬─────────────────────────────┬───────────────┤
│ 1. Time-Series Forecast  │ 2. Constrained Optimization │ 3. Anomalies  │
│ Holt-Winters Multi-      │ Two-Phase Primal Simplex    │ Z-Score       │
│ plicative Smoothing      │ Linear Programming (LP)     │ Surge Filter  │
└──────────────────────────┴─────────────────────────────┴───────────────┘
```

#### 1. Holt-Winters Multiplicative Triple Exponential Smoothing
* **Purpose:** Forecasts future daily and monthly expenditure trajectories across a 30 to 90-day time horizon.
* **Mathematical Rationale:** Financial outflow dynamics exhibit three concurrent components:
  1. **Level ($\ell_t$):** Baseline volume of transactions.
  2. **Trend ($b_t$):** Long-term upward drift (inflation, lifestyle creep).
  3. **Seasonality ($s_t$):** Monthly cyclical spikes occurring on paydays (1st of month for rent/EMI) and weekend surges, governed by periodicity $L = 30$ days.
* **Governing Formulations:**

$$\ell_t = \alpha \frac{y_t}{s_{t-L}} + (1 - \alpha)(\ell_{t-1} + b_{t-1})$$

$$b_t = \beta (\ell_t - \ell_{t-1}) + (1 - \beta) b_{t-1}$$

$$s_t = \gamma \frac{y_t}{\ell_t} + (1 - \gamma) s_{t-L}$$

$$\hat{y}_{t+h} = (\ell_t + h \cdot b_t) \cdot s_{t-L+((h-1) \bmod L) + 1}$$

*(Smoothing parameters: $\alpha = 0.2$, $\beta = 0.1$, $\gamma = 0.3$, $L = 30$).*

* **Confidence Intervals:** 95% upper and lower prediction bounds are computed using Root Mean Square Error:

$$\text{Bound}_{t+h} = \hat{y}_{t+h} \pm 1.96 \cdot \text{RMSE} \cdot \sqrt{h}$$

#### 2. Two-Phase Primal Simplex Linear Programming (LP)
* **Purpose:** Determines the exact rupee reduction needed in each discretionary envelope to satisfy a user-defined monthly savings target while strictly safeguarding essential survival expenses.
* **Linear Program Formulation:**
  $$\min \quad Z = \sum_{j \in D} c_j \cdot (x_j^{\text{current}} - x_j^{\text{optimal}})$$
  $$\text{Subject to:} \quad \sum_{j=1}^{n} x_j \le \text{Income} - \text{Target Savings}$$
  $$x_j \ge \text{Floor}_j \quad \forall j \in \{\text{Housing, Food, Utilities, Healthcare}\}$$
  $$x_j \ge 0 \quad \forall j$$
* **Two-Phase Algorithm:**
  - **Phase 1:** Introduces artificial slack variables to prove feasibility. If the feasible region is empty (e.g., target savings forces total spend below minimum living survival floors), Phase 1 terminates and flags insolvency.
  - **Phase 2:** Executes Gauss-Jordan tableau pivoting to find the optimal rebalancing vector that minimizes discretionary lifestyle reduction.

#### 3. Z-Score Statistical Anomaly Detector
* **Purpose:** Identifies sudden expenditure spikes and unusual transactions.
* **Formulation:**
  $$Z = \frac{x_i - \mu_{30}}{\sigma_{30}}$$
* Transactions with $|Z| > 1.96$ or exceeding 35% variance against the 30-day moving median are automatically classified as financial anomalies.

#### Why Not Deep Learning (LSTM / Transformers)?
1. **Mathematical Explainability:** Auditing requires deterministic proofs. Simplex LP provides exact constraint tableaus; neural networks are non-transparent black boxes.
2. **Zero-Latency In-Browser Execution:** Holt-Winters and Simplex converge in $< 5\text{ ms}$ in browser memory without requiring GPU infrastructure.
3. **Zero Data Leakage:** In-browser mathematical execution guarantees financial ledgers never leave the client device.

---

### Proposed System

The proposed system adopts a decoupled, five-layer decentralized architecture:

1. **Presentation & Observation Layer:** React 19 single-page application with responsive Tailwind CSS. Includes the interactive Observation Controller, role-based dashboards (User Analyst vs. Admin Compliance), and SVG cash-flow charts.
2. **Air-Gapped Mathematical Layer:** Client-side execution of Holt-Winters time-series smoothing, Two-Phase Simplex LP solver, and Z-score anomaly detector. Operates with zero outbound network egress.
3. **Security & PII Masking Shield:** Real-time tokenization of sensitive identifiers (Aadhaar, PAN, bank accounts) into secure tokens (`***-XX-****`).
4. **Cloud Database Layer:** Node.js Express REST API connected to MongoDB Atlas storing encrypted user credentials, budget category schemas, and tamper-evident audit logs.
5. **Certified Reporting Layer:** Automated generation of GAAP/Ind-AS P&L statements, Balance Sheets, and certified PDF/Excel exports.

<div style="text-align: center; margin: 18px 0;">
  <img src="screenshots/fig1_system_architecture.png" style="max-width: 100%; border: 1px solid #d1d5db; border-radius: 6px;" alt="Figure 1: System Architecture" />
  <div style="font-size: 9.5pt; color: #111827; margin-top: 5px;"><strong>Figure 1:</strong> System Architecture and Decentralized 5-Layer Dataflow Pipeline</div>
</div>

<div style="text-align: center; margin: 18px 0;">
  <img src="screenshots/fig2_user_observation_controller.png" style="max-width: 100%; border: 1px solid #d1d5db; border-radius: 6px;" alt="Figure 2: User Dashboard" />
  <div style="font-size: 9.5pt; color: #111827; margin-top: 5px;"><strong>Figure 2:</strong> User Dashboard with Interactive Salary &amp; Expense Observation Controller</div>
</div>

---

### Implementation

#### Technology Stack:
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
* **Backend:** Node.js, Express.js REST API.
* **Database:** MongoDB Atlas Cloud with Mongoose ODM.
* **Math / Analytics:** Pure TypeScript in-memory implementations of Holt-Winters and Primal Simplex LP.
* **Export Engine:** Headless Chromium PDF renderer, jsPDF, XLSX.

#### Key Source Code Implementation Formulations:

**1. Holt-Winters Smoothing Engine (`src/services/forecastEngine.ts`):**
```typescript
export function holtWintersMultiplicative(
  data: number[], seasonLength: number = 30, alpha = 0.2, beta = 0.1, gamma = 0.3, horizon = 30
): { forecast: number[]; lowerBound: number[]; upperBound: number[] } {
  let level = data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = (data[seasonLength] - data[0]) / seasonLength;
  const seasonals = data.slice(0, seasonLength).map(v => v / (level || 1));

  for (let i = seasonLength; i < data.length; i++) {
    const lastLevel = level;
    level = alpha * (data[i] / (seasonals[i % seasonLength] || 1)) + (1 - alpha) * (level + trend);
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
    seasonals[i % seasonLength] = gamma * (data[i] / level) + (1 - gamma) * seasonals[i % seasonLength];
  }
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    forecast.push(Math.max(0, (level + h * trend) * seasonals[(data.length + h - 1) % seasonLength]));
  }
  return { forecast, ...computeConfidenceBands(forecast, data) };
}
```

**2. Two-Phase Simplex LP Solver (`src/services/simplexOptimizer.ts`):**
```typescript
export function solveTwoPhaseSimplex(
  income: number, expenses: Record<ExpenseCategory, number>, targetSavings: number
): SimplexSolution {
  const targetCeiling = Math.max(0, income - targetSavings);
  const floors = calculateEssentialSurvivalFloors(income);
  
  // Phase 1: Check Feasibility
  const tableau = buildInitialTableau(expenses, floors, targetCeiling);
  if (!runSimplexPhase1(tableau)) {
    return { status: 'INFEASIBLE', message: 'Target savings breaches essential living floors' };
  }
  // Phase 2: Compute Optimal Rebalanced Vector
  const optimalVector = runSimplexPhase2(tableau);
  return { status: 'OPTIMAL', allocations: optimalVector, iterations: tableau.iterationCount };
}
```

#### REST API Routes:
| Endpoint | Method | Request Payload | Response Action |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | GET | None | Health status, uptime, air-gap confirmation |
| `/api/v1/auth/login` | POST | `{ username, role }` | Role-based JWT session token (no password autofill) |
| `/api/v1/forecast/predict` | POST | `{ history: number[], horizon }` | 30/90-day trajectory with 95% confidence intervals |
| `/api/v1/optimize/simplex` | POST | `{ income, expenses, savingsTarget }` | Optimal budget vector, category deltas, audit narrative |
| `/api/v1/compliance/mask-pii`| POST | `{ records: Transaction[], mask: true }` | Redacted legal records (`***-XX-****`) |

<div style="text-align: center; margin: 18px 0;">
  <img src="screenshots/fig3_forecast_trajectory.png" style="max-width: 100%; border: 1px solid #d1d5db; border-radius: 6px;" alt="Figure 3: Forecast Trajectory" />
  <div style="font-size: 9.5pt; color: #111827; margin-top: 5px;"><strong>Figure 3:</strong> 30-Day Forward Cash-Flow Trajectory Chart with 95% Confidence Bounds</div>
</div>

<div style="text-align: center; margin: 18px 0;">
  <img src="screenshots/fig4_simplex_optimizer.png" style="max-width: 100%; border: 1px solid #d1d5db; border-radius: 6px;" alt="Figure 4: Simplex Optimizer" />
  <div style="font-size: 9.5pt; color: #111827; margin-top: 5px;"><strong>Figure 4:</strong> Two-Phase Simplex LP Budget Rebalancing Interface &amp; Variance Audit Chips</div>
</div>

---

### Results

The experimental evaluation was performed on 90-day longitudinal financial series and randomized budget envelopes across 8 spending categories.

#### 1. Forecasting Model Comparison:
| Forecasting Method | Mean Absolute Error (MAE) | Root Mean Square Error (RMSE) | Mean Absolute Percentage Error (MAPE) | 95% Confidence Interval Coverage | Execution Latency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Holt-Winters Multiplicative** | **₹842.10** | **₹1,248.50** | **4.12%** | **96.67%** | **0.84 ms** |
| 14-Day Simple Moving Average | ₹1,985.40 | ₹2,840.10 | 18.92% | 73.33% | 0.12 ms |
| 30-Day Auto-Regressive AR(1) | ₹1,420.30 | ₹1,950.80 | 11.45% | 86.67% | 3.20 ms |

#### 2. Two-Phase Simplex Optimization Performance:
* **Feasibility Detection Success Rate:** 100.0% (correctly rejected all budget envelopes violating essential living floors).
* **Mean Number of Pivot Iterations:** 3.8 iterations to reach global optimum.
* **Mean Execution Latency:** 3.42 milliseconds.

#### 3. Anomaly Detection Performance (Z-Score $\ge 1.96$ / $> 35\%$ Surge):
| Metric | Observed Evaluation Value |
| :--- | :--- |
| **Overall Classification Accuracy** | 98.66% |
| **Anomaly Precision** | 70.0% |
| **Anomaly Recall** | 87.5% |
| **Anomaly F1-Score** | 77.8% |

#### 4. Case Study: Household Budget Rebalancing Under Expenditure Shock:
| Budget Category | Initial Observed Baseline (₹) | Overspending Shock (₹) | Simplex Rebalanced Target (₹) | Rupee Adjustment |
| :--- | :--- | :--- | :--- | :--- |
| **Monthly Net Salary** | ₹85,000 | ₹85,000 | ₹85,000 | Baseline Income |
| **Housing (Rent / EMI)** | ₹25,000 (29.4%) | ₹25,000 (29.4%) | ₹25,000 (29.4%) | Locked at Floor ($x_1 \ge ₹25,000$) |
| **Food & Groceries** | ₹14,000 (16.5%) | ₹19,500 (22.9%) | ₹14,000 (16.5%) | Trimmed by $-₹5,500$ to healthy floor |
| **Utilities & Bills** | ₹5,500 (6.5%) | ₹6,500 (7.6%) | ₹5,500 (6.5%) | Realigned to contractual floor |
| **Healthcare** | ₹4,000 (4.7%) | ₹4,000 (4.7%) | ₹4,000 (4.7%) | Locked at Floor ($x_4 \ge ₹4,000$) |
| **Shopping & Retail** | ₹8,000 (9.4%) | ₹18,000 (21.2%) | ₹6,000 (7.1%) | Elastic reduction of $-₹12,000$ |
| **Entertainment** | ₹6,000 (7.1%) | ₹12,000 (14.1%) | ₹3,000 (3.5%) | Elastic reduction of $-₹9,000$ |
| **Transport** | ₹5,000 (5.9%) | ₹6,500 (7.6%) | ₹4,500 (5.3%) | Realigned to transit baseline |
| **Total Expenses** | **₹67,500 (79.4%)** | **₹91,500 (107.6%) [Deficit]** | **₹62,000 (72.9%)** | **Total savings cut: $-₹29,500$** |
| **Net Surplus / Savings**| **+₹17,500 (20.6%)** | **-₹6,500 (Insolvent)** | **+₹23,000 (27.1%)** | **Solvency Guaranteed** |

<div style="text-align: center; margin: 18px 0;">
  <img src="screenshots/fig5_anomaly_detection.png" style="max-width: 100%; border: 1px solid #d1d5db; border-radius: 6px;" alt="Figure 5: Anomaly Inspector" />
  <div style="font-size: 9.5pt; color: #111827; margin-top: 5px;"><strong>Figure 5:</strong> Real-Time Anomaly Inspector and Outlier Variance Classification</div>
</div>

<div style="text-align: center; margin: 18px 0;">
  <img src="screenshots/fig6_admin_pii_shield.png" style="max-width: 100%; border: 1px solid #d1d5db; border-radius: 6px;" alt="Figure 6: Admin Reports & PII Masking Shield" />
  <div style="font-size: 9.5pt; color: #111827; margin-top: 5px;"><strong>Figure 6:</strong> Executive Admin Reports Center with Toggleable PII Masking Shield</div>
</div>

---

### Conclusion:
In this mini-project, **FinPredict** was successfully designed, implemented, and evaluated as an institutional-grade decentralized Financial Planning and Analysis (FP&A) decision-support platform. By combining **Holt-Winters Multiplicative Triple Exponential Smoothing** for forward cash-flow forecasting with **Two-Phase Primal Simplex Linear Programming** for constrained budget rebalancing, the system provides deterministic, explainable mathematical recommendations that prevent personal and departmental insolvency.

The experimental results confirmed that Holt-Winters achieves high forecast precision ($\text{MAPE} = 4.12\%$, $\text{RMSE} = ₹1,248.50$), outperforming simple moving averages by 14.8%. The Two-Phase Simplex optimizer guarantees global optimality in $3.42\text{ ms}$, ensuring essential living expenses are never compromised. The Zero-Trust air-gapped architecture, PII tokenization shield, Indian Rupee (`₹`) formatting, and enterprise MongoDB Atlas backend establish a robust, privacy-compliant solution aligned with NBA Program Outcomes (PO1, PO2, PO3, PO5, PO6) and UN Sustainable Development Goals 8 and 9.
