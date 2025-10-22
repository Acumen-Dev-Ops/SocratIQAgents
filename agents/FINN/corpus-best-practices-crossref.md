# FINN Agent - Best Practices Cross-Reference Document

**Agent**: FINN (Financial Intelligence & Negotiation Navigator)
**Domain**: Financial & Investment Intelligence
**Last Updated**: October 22, 2025
**Version**: 1.0.0

## Overview

This document provides a comprehensive cross-reference of authoritative public domain sources mapped to FINN's sub-agent capabilities, skills, and pharmaceutical financial modeling best practices. All sources are from recognized financial modeling frameworks, biotech valuation standards, and industry benchmarks.

---

## FINN-Budget: Cash Runway & Budget Optimization

### Industry Benchmarks and Standards

#### Pharmaceutical Development Cost Benchmarks
**Source**: Multiple industry publications and research
- **Key Statistics**:
  - Phase 1 average cost: $8-15 million
  - Phase 2 average cost: $20-60 million
  - Phase 3 average cost: $50-150 million (can exceed $300M for large trials)
  - FDA submission and approval: $1-2 million
  - Post-approval commitments: $5-10 million annually

**FINN Capability Mapping**:
- Cash runway calculation by development phase
- Burn rate optimization
- Milestone-based funding strategy
- Resource allocation across programs

**Practical Application**:
```
Query: "How should we allocate our $50M Series B across three programs?"
FINN-Budget Analysis:
- Program A (Phase 2 oncology): $25M (18-month runway to interim data)
- Program B (Phase 1/2 rare disease): $15M (24-month runway to Phase 2 start)
- Program C (Preclinical): $10M (operational reserve + IND-enabling studies)
- Rationale: Prioritizes near-term value inflection points
- Risk assessment: 65% probability of at least one positive outcome
- Outputs: Capital allocation model with milestone triggers
```

#### Cash Runway Best Practices
**Formula**: `Cash Runway (months) = Available Cash / Monthly Burn Rate`

**Industry Standards**:
- Minimum runway: 18 months (mechanistic rule per SophieLogic™)
- Optimal runway: 24-36 months to next major milestone
- Emergency reserve: 3-6 months for unexpected delays

**FINN Capability Mapping**:
- Real-time burn rate monitoring
- Scenario planning for milestone delays
- Bridge financing triggers

---

## FINN-Pricing: Value-Based Pricing & Market Access

### Pharmaceutical Pricing Methodologies

#### Value-Based Pricing Framework
**Source**: Health Economics and Outcomes Research (HEOR) best practices
- **BiopharmaVantage Guidance**: https://www.biopharmavantage.com/ (referenced in search results)

**Key Methodologies**:

1. **Cost-Effectiveness Analysis**:
   - Incremental Cost-Effectiveness Ratio (ICER)
   - Formula: `ICER = (Cost_new - Cost_standard) / (Effect_new - Effect_standard)`
   - Benchmark: $50,000-$150,000 per QALY (Quality-Adjusted Life Year) for US payers
   - UK NICE threshold: £20,000-£30,000 per QALY

2. **Willingness-to-Pay (WTP) Assessment**:
   - Disease severity factor
   - Unmet medical need premium
   - Rare disease/orphan drug premiums (10-20x higher WTP)

3. **International Reference Pricing**:
   - EU markets often reference each other
   - Launch sequence impacts global pricing
   - US typically last to preserve highest price

**FINN Capability Mapping**:
- Pricing strategy by market
- Reimbursement probability modeling
- Revenue optimization vs. access tradeoffs

**Practical Application**:
```
Query: "What price should we set for our orphan disease therapy?"
FINN-Pricing Analysis:
- ICER calculation: $8M annual treatment / 15 QALY gain = $533K/QALY
- Orphan drug WTP threshold: $500K-$1M/QALY (10x standard)
- Market access probability: 75% (meets orphan thresholds)
- International pricing strategy: Launch US first, EU second
- Revenue projection: $250M peak sales (5,000 patients × $50K/year)
- Coordinates with CLIA-Market for patient population validation
- Outputs: Tiered pricing recommendation with access strategy
```

#### Reimbursement Landscape Analysis
**Source**: Payer coverage policy databases and HEOR literature

**Key Considerations**:
- Payer evidence requirements (RCTs, real-world data)
- Managed entry agreements (outcomes-based contracts)
- Patient access programs and co-pay support
- Medicare/Medicaid coverage pathways

**FINN Capability Mapping**:
- Payer evidence strategy
- Market access probability by indication
- Pricing sensitivity analysis

---

## FINN-Exit: Valuation & Exit Planning

### Risk-Adjusted NPV (rNPV) Methodology

#### Gold Standard for Biotech Valuation
**Source**: BiopharmaVantage 2025 Ultimate Pharma & Biotech Valuation Guide
- **URL**: https://www.biopharmavantage.com/pharma-biotech-valuation-best-practices

**Core Methodology**:
```
rNPV = Σ [CFt × P(success)^t × (1 + r)^-t]

Where:
- CFt = Cash flow in year t
- P(success) = Probability of reaching market (cumulative POS)
- r = Discount rate (adjusted for time value + commercial risk only)
- t = Time period
```

**Key Distinction from Standard DCF**:
- **DCF**: Uses high discount rate (30-60%) to account for ALL risks
- **rNPV**: Uses lower discount rate (8-15%) + explicit POS adjustment for clinical risk
- **Advantage**: rNPV separates clinical risk (POS) from commercial risk (discount rate)

**FINN Capability Mapping**:
- Asset valuation for licensing, M&A, partnership deals
- Phase-specific risk adjustment
- Portfolio valuation (sum-of-the-parts)

#### Probability of Success (POS) Benchmarks
**Source**: Industry benchmarks (BIO Clinical Development Success Rates 2016-2019, updated estimates)

| Development Phase | Average POS to Approval | Oncology POS | Rare Disease POS |
|-------------------|------------------------|--------------|------------------|
| Preclinical → Approval | 5-10% | 5% | 8-12% |
| Phase 1 → Approval | 10-15% | 10% | 15-20% |
| Phase 2 → Approval | 20-30% | 15% | 30-40% |
| Phase 3 → Approval | 50-70% | 45% | 70-80% |
| Regulatory Submission → Approval | 85-95% | 80% | 90-95% |

**FINN Capability Mapping**:
- Phase-specific risk adjustment
- Therapeutic area-specific POS curves
- Asset-specific adjustments based on clinical data quality

**Practical Application**:
```
Query: "What is the fair value of our Phase 2 oncology asset?"
FINN-Exit Analysis:
- Peak sales forecast: $500M/year (coordinates with CLIA-Market)
- Time to peak: 8 years post-approval
- Clinical risk: Phase 2 → Approval POS = 15% (oncology)
- Commercial risk: Discount rate = 12%
- Development cost: $150M remaining (coordinates with FINN-Budget)
- rNPV calculation: ($500M × 5 years) / (1.12^8) × 0.15 = $180M
- Comparable transactions: Phase 2 oncology deals at 0.3-0.5x rNPV
- Fair valuation range: $50M-$90M
- Outputs: Valuation report with scenario analysis
```

#### Discount Rate Selection
**Source**: Survey of 242 biotech professionals (referenced in search results)

**Industry Benchmarks**:
- **Early-stage projects**: 40.1% (preclinical, Phase 1)
- **Mid-stage projects**: 26.7% (Phase 2)
- **Late-stage projects**: 19.5% (Phase 3)
- **Marketed products**: 8-12% (standard corporate WACC)

**Alternative Approach** (BiopharmaVantage recommendation):
- Use lower discount rates (8-15%) for rNPV
- Adjust cash flows explicitly with POS
- Avoid "double-counting" risk in both discount rate and POS

**FINN Capability Mapping**:
- Discount rate selection by asset phase
- Sensitivity analysis across discount rate scenarios
- Justification of rate selection for stakeholders

---

## FINN-ROI: Return on Investment & Project Prioritization

### Portfolio Optimization Framework

#### Capital Allocation Methodology
**Source**: Modern portfolio theory applied to pharma R&D

**Optimization Framework**:
```
Maximize: Σ [rNPV_i × allocation_i]

Subject to:
- Σ allocation_i = 1 (full capital allocation)
- allocation_i ≥ minimum_viable_investment_i
- portfolio_risk ≤ risk_tolerance
- cash_runway_i ≥ 18 months for all programs
```

**FINN Capability Mapping**:
- Multi-asset portfolio optimization
- Risk-return tradeoff analysis
- Capital efficiency maximization

**Practical Application**:
```
Query: "Which of our five preclinical programs should we advance to IND?"
FINN-ROI Analysis:
- Program A: rNPV $200M, IND cost $5M, POS 10% → Expected ROI = 300%
- Program B: rNPV $500M, IND cost $15M, POS 5% → Expected ROI = 67%
- Program C: rNPV $100M, IND cost $3M, POS 15% → Expected ROI = 400%
- Portfolio constraint: $20M budget, must preserve 18-month runway
- Optimal allocation: Program C (highest ROI) + Program A (second highest)
- Reasoning: Maximizes expected portfolio value while maintaining cash runway
- Outputs: Prioritized portfolio with financial justification
```

---

## FINN-Risk: Financial Risk Assessment & Scenario Analysis

### Monte Carlo Simulation for Pharma Valuation
**Source**: Financial modeling best practices for biotech/pharma

**Methodology**:
- Stochastic modeling of key value drivers:
  - Clinical success rates (POS distributions)
  - Peak sales (market size uncertainty)
  - Time to market (regulatory approval timelines)
  - Development costs (cost overrun scenarios)
- Run 10,000+ simulations to generate probability distributions
- Output: Expected value, confidence intervals, probability of loss

**FINN Capability Mapping**:
- Uncertainty quantification in valuations
- Risk-adjusted decision-making
- Downside scenario planning

**Practical Application**:
```
Query: "What is the probability our asset value exceeds $500M?"
FINN-Risk Analysis:
- Base case rNPV: $420M
- Monte Carlo simulation (10,000 iterations):
  - POS uncertainty: Phase 2 success 15% ± 10%
  - Peak sales uncertainty: $500M ± 40%
  - Time to market: 8 years ± 2 years
- Results:
  - Expected value: $395M (mean of distribution)
  - 95% confidence interval: $120M - $780M
  - P(value > $500M) = 38%
- Outputs: Probability distribution with percentile rankings
```

---

## FINN-Partnerships: Deal Structures & Terms

### Pharmaceutical Licensing and Partnership Benchmarks

#### Milestone Payment Structures
**Source**: Industry deal databases and transaction benchmarks

**Typical Deal Terms** (by development stage):

| Development Stage | Upfront ($M) | Milestones ($M) | Royalties (%) | Equity (%) |
|-------------------|--------------|-----------------|---------------|------------|
| **Preclinical** | $1-10 | $50-200 | 5-10% | 5-15% |
| **Phase 1** | $10-30 | $100-300 | 8-12% | 3-10% |
| **Phase 2** | $30-100 | $200-500 | 10-15% | 0-5% |
| **Phase 3** | $100-300 | $300-800 | 12-20% | 0% |
| **Commercial** | $200-500+ | $500-1B+ | 15-25% | 0% |

**Milestone Triggers** (typical):
- IND filing/clearance: $5-20M
- Phase 1 completion: $10-30M
- Phase 2 initiation: $20-50M
- Phase 2 completion (positive data): $50-150M
- Phase 3 initiation: $100-200M
- Regulatory submission: $50-100M
- Regulatory approval: $200-500M
- Commercial milestones (sales thresholds): $100-300M each

**FINN Capability Mapping**:
- Deal structure optimization
- Milestone value allocation
- Royalty vs. milestone tradeoffs

**Practical Application**:
```
Query: "What deal terms should we expect for our Phase 2 asset?"
FINN-Partnerships Analysis:
- Asset rNPV: $420M (from FINN-Exit)
- Comparable Phase 2 deals: $50-100M upfront, $300-500M milestones, 12-15% royalties
- Partner captures: 60-70% of rNPV in discounted deal terms
- Recommended terms:
  - Upfront: $60M (14% of rNPV)
  - Milestones: $400M (regulatory + commercial)
  - Royalties: 13% on net sales
  - Total deal value: $460M + royalties
- Coordinates with NORA-Legal for contract structure
- Outputs: Term sheet with negotiation range
```

---

## Revenue Forecasting Best Practices

### Fundamental Revenue Modeling
**Source**: BiopharmaVantage Valuation Guide

**Best Practice**: "Aim to estimate revenue generated from the biopharma asset using fundamentals, and do not use a historic revenue curve of a similar asset as a surrogate."

**Key Revenue Drivers**:
1. **Patient Population**:
   - Epidemiology data (prevalence/incidence)
   - Diagnosed population %
   - Treatment rate %
   - Market penetration % over time

2. **Pricing**:
   - Net price (list price - rebates/discounts)
   - Regional pricing variations
   - Erosion over time (generics, biosimilars, competition)

3. **Competitive Landscape**:
   - Market share dynamics
   - First-mover advantage vs. fast follower
   - Differentiation (efficacy, safety, convenience)

4. **Launch Dynamics**:
   - Time to peak sales (typically 5-8 years for specialty drugs)
   - Launch sequencing (US → EU → ROW)
   - Loss of exclusivity (LOE) timing

**FINN Capability Mapping**:
- Bottom-up revenue modeling
- Market share scenario analysis
- Peak sales forecasting
- Revenue erosion curves post-LOE

**Practical Application**:
```
Query: "What are realistic peak sales for our rare disease therapy?"
FINN-Partnerships Analysis (with CLIA-Market integration):
- Patient population: 10,000 (US) + 15,000 (EU) = 25,000 global
- Diagnosed rate: 60% (15,000 patients)
- Treatment rate: 80% (12,000 patients)
- Market penetration: 70% (8,400 patients at peak)
- Pricing: $200,000/year (net price after rebates)
- Peak sales: 8,400 × $200K = $1.68B
- Time to peak: 6 years post-launch
- Revenue curve: Ramp over 6 years, plateau 4 years, decline post-LOE
- Coordinates with CLIA-Market for patient population validation
- Outputs: 15-year revenue forecast with scenario analysis
```

---

## Cross-Reference Summary: FINN Sub-Agents → Public Domain Sources

| FINN Sub-Agent | Primary Sources | Key Methodologies | Update Frequency |
|----------------|----------------|-------------------|------------------|
| **FINN-Budget** | Industry cost benchmarks, burn rate studies | Cash runway calculation, milestone-based funding | Annual cost surveys |
| **FINN-Pricing** | HEOR literature, payer evidence requirements | ICER analysis, WTP assessment, international reference pricing | Annual payer policy updates |
| **FINN-Exit** | BiopharmaVantage valuation guide, Alacrita whitepapers | rNPV, POS benchmarks, discount rate selection | Annual transaction databases |
| **FINN-ROI** | Portfolio theory, project prioritization frameworks | Capital allocation optimization, expected value analysis | Annual industry reports |
| **FINN-Risk** | Monte Carlo simulation methodologies | Stochastic modeling, sensitivity analysis | Continuous (methodology stable) |
| **FINN-Partnerships** | Deal term databases, transaction benchmarks | Milestone structures, royalty rates, equity stakes | Quarterly deal updates |

---

## Recommended Corpus Documents for S3 Bucket

### Priority Documents (Download and Upload to `socratiq-finn-corpus-prod`)

#### Valuation Methodologies (High Priority)
1. **BiopharmaVantage 2025 Ultimate Pharma & Biotech Valuation Guide**
   - URL: https://www.biopharmavantage.com/pharma-biotech-valuation-best-practices
   - Content: rNPV methodology, discount rates, POS benchmarks

2. **Alacrita Whitepaper: Valuing Pharmaceutical Assets - NPV vs rNPV**
   - URL: https://www.alacrita.com/whitepapers/valuing-pharmaceutical-assets-when-to-use-npv-vs-rnpv
   - Content: When to use NPV vs. rNPV, worked examples

3. **BlueStar BioAdvisors: Approaches to Financial Valuation of Biopharmaceutical Assets**
   - URL: https://bluestarbioadvisors.com/thought-pieces/docs/bluestar-bioadvisors-valuation-case-studies-2018-07.pdf
   - Content: Case studies, valuation methodologies

4. **Financial Models Hub: Risk-Adjusted NPV in Biotech Valuation**
   - URL: https://financialmodelshub.com/risk-adjusted-npv-explained-the-gold-standard-for-biotech-valuation/
   - Content: rNPV calculation guide, Excel model templates

#### Industry Benchmarks (High Priority)
5. **BIO Clinical Development Success Rates** (2016-2019 study, updated annually)
   - Content: Phase-specific POS by therapeutic area

6. **Discount Rate Survey** (242 biotech professionals)
   - Content: 40.1% early-stage, 26.7% mid-stage, 19.5% late-stage

7. **Pharmaceutical Development Cost Benchmarks**
   - Content: Phase 1/2/3 average costs, FDA submission costs

#### Deal Term Benchmarks (Medium Priority)
8. **Pharmaceutical Licensing Deal Databases** (public transaction summaries)
   - Content: Upfront, milestone, royalty structures by phase

9. **Partnership Term Sheets** (redacted public examples)
   - Content: Deal structures, milestone triggers, royalty tiers

#### Financial Modeling Templates (Medium Priority)
10. **DCF and rNPV Excel Templates**
    - Content: Pre-built models for pharmaceutical valuation

11. **Monte Carlo Simulation Templates**
    - Content: Stochastic modeling for risk assessment

12. **Portfolio Optimization Models**
    - Content: Capital allocation algorithms, risk-return tradeoffs

---

## Integration with Other Agents

### FINN → VERA Integration
- CMC cost modeling (FINN-Budget + VERA-CMC)
- Federal acceleration value quantification (FINN-ROI + VERA-Development)
- Partnership deal structures (FINN-Partnerships + VERA-Strategic)

### FINN → NORA Integration
- Regulatory risk impact on valuation (FINN-Exit + NORA-Regulatory)
- IP value assessment (FINN-Exit + NORA-IP)
- Partnership legal structures (FINN-Partnerships + NORA-Legal)

### FINN → CLIA Integration
- Market size data for revenue modeling (FINN-Partnerships + CLIA-Market)
- Competitive positioning for market share (FINN-Partnerships + CLIA-Competitive)
- Commercial valuation inputs (FINN-Exit + CLIA-Market)

### FINN → Sophie Integration
- Financial constraint enforcement (FINN-Budget → Sophie mechanistic rules)
- Budget-risk tradeoffs (FINN-Risk → Sophie probabilistic synthesis)
- Valuation feeds into Sophie TxP Budget Profile and Exit Profile scoring

---

## Key Financial Principles (FINN Core Philosophy)

### 1. **Avoid "Garbage In, Garbage Out" (GIGO)**
**Source**: BiopharmaVantage Valuation Guide
- Do not blindly apply spreadsheet templates
- Requires deep sector expertise + financial modeling competency
- Asset-specific modeling beats generic templates

### 2. **Watch Your Terminal Value (TV)**
**Source**: BiopharmaVantage
- Terminal value often represents 50-70% of total rNPV
- Use appropriate perpetuity growth rate (2-3% for pharmaceuticals)
- Sensitivity test TV assumptions

### 3. **Calculate True Free Cash Flow**
**Source**: Financial modeling best practices
- Adjust for non-cash charges (depreciation, stock compensation)
- Include working capital requirements
- Account for tax effects

### 4. **Revenue Attrition Matters**
**Source**: BiopharmaVantage
- Rebates and discounts reduce net revenue (20-40% in US)
- Partnership terms (royalties, profit splits)
- Patient access programs and co-pay support

### 5. **Seller vs. Buyer Perspective**
**Source**: Transaction best practices
- Sellers prefer higher valuations → Real options, higher POS
- Buyers prefer conservative → rNPV, lower POS
- Internal corporate valuations typically use rNPV as base case

---

## Maintenance and Updates

### Update Schedule
- **Quarterly**: Deal term databases, transaction benchmarks
- **Annual**: POS benchmarks, cost surveys, discount rate surveys
- **Continuous**: Financial modeling methodologies (stable, infrequent updates)

### Responsibility
- **FINN Development Team**: Monitor deal databases, valuation publications
- **Cross-functional**: Coordinate with CLIA team for market data updates
- **Sophie Orchestration**: Integrate updated benchmarks into probabilistic models

### Version Control
- Current Version: 1.0.0 (October 22, 2025)
- Next Review: November 22, 2025
- Major updates trigger version increment

---

**Document Owner**: FINN Development Team
**Last Updated**: October 22, 2025
**Status**: Ready for Corpus Population
**S3 Bucket**: `socratiq-finn-corpus-prod/best-practices/`
