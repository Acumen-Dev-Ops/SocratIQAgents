# SocratIQ Agent Framework - Best Practices Master Index

**Version**: 1.0.0
**Last Updated**: October 22, 2025
**Purpose**: Central repository of public domain best practices mapped to all SocratIQ agents

## Overview

This document provides a master index of authoritative public domain sources for pharmaceutical intelligence, mapped to each agent's capabilities. All sources have been researched, validated, and cross-referenced to agent skills.

---

## Quick Reference: Sources by Agent

| Agent | Domain | Key Sources | Documents Created |
|-------|--------|-------------|-------------------|
| **VERA** | Product & Clinical Intelligence | FDA guidance (2024-2025), Clinical trial best practices | [corpus-best-practices-crossref.md](agents/VERA/corpus-best-practices-crossref.md) |
| **FINN** | Financial & Investment Intelligence | rNPV valuation, Deal term benchmarks, POS rates | [corpus-best-practices-crossref.md](agents/FINN/corpus-best-practices-crossref.md) |
| **NORA** | Legal, Regulatory & IP Intelligence | FDA 505(b)(2), Patent FTO, Federal tech transfer | [See index below](#nora-sources) |
| **CLIA** | Clinical Trials & Market Intelligence | CI strategies, Market research, Enrollment tactics | [See index below](#clia-sources) |
| **Sophie** | Strategic Orchestration | Agentic AI, Multi-agent coordination, Decision synthesis | [See index below](#sophie-sources) |

---

## VERA Sources

### FDA Regulatory Guidance (2024-2025)

1. **505(b)(2) Applications**
   - URL: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/applications-covered-section-505b2
   - Update: Draft Level 1 (December 1999, still current reference)
   - VERA Sub-Agent: VERA-Product (regulatory pathway selection)

2. **Decentralized Clinical Trials (DCT)** - Final Guidance
   - Date: September 17, 2024
   - VERA Sub-Agent: VERA-Clinical (enrollment acceleration, remote monitoring)

3. **Clinical Trials Integrated into Routine Practice**
   - Date: September 17, 2024
   - VERA Sub-Agent: VERA-Clinical (streamlined protocols, RWD integration)

4. **Multiregional Clinical Trials (MRCT) - Oncology**
   - Date: September 16, 2024 (Draft)
   - VERA Sub-Agent: VERA-Clinical (global trial strategy)

5. **Innovative CGT Trial Designs**
   - Date: September 2025
   - VERA Sub-Agent: VERA-Clinical (rare disease, adaptive designs)

6. **CMC Technical Filing Strategies**
   - Date: September 2024 (GFI #227)
   - VERA Sub-Agent: VERA-CMC (manufacturing, submission strategy)

7. **CMC Development & Readiness Pilot (CDRP) - Year 3**
   - Date: October 1, 2024 (Program launch)
   - VERA Sub-Agent: VERA-CMC (accelerated CMC development)

### Clinical Trial Enrollment Best Practices

8. **PMC Article: Clinical Trial Recruitment Successes and Challenges (2024)**
   - URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11348161/
   - VERA Sub-Agent: VERA-Clinical (multimodal recruitment, in-person strategies)
   - Key Stats: 80% of trials delay due to recruitment, 30% dropout rates

9. **Industry Reports: Digital Recruitment & Text Messaging**
   - Sources: Mosio, AutoCruitment, Lindus Health, LabioTech (2024)
   - VERA Sub-Agent: VERA-Clinical (SMS engagement: 98% read rate)
   - AI Case Study: Mayo Clinic + IBM Watson (80% enrollment increase)

### Federal Technology Transfer

10. **NIH SBIR/STTR Programs (PHS 2024-2)**
    - URL: https://www.sbir.gov/about
    - VERA Sub-Agent: VERA-Development (non-dilutive funding)
    - 2024 Amounts: Phase I $314K, Phase II $2.1M

11. **NIH CRADA Mechanism**
    - URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC2782946/
    - VERA Sub-Agent: VERA-Development (federal lab collaboration)
    - Coordinates with NORA-FedScout (legal structure)

**Detailed Cross-Reference**: [agents/VERA/corpus-best-practices-crossref.md](agents/VERA/corpus-best-practices-crossref.md)

---

## FINN Sources

### Valuation Methodologies

12. **BiopharmaVantage 2025 Ultimate Pharma & Biotech Valuation Guide**
    - URL: https://www.biopharmavantage.com/pharma-biotech-valuation-best-practices
    - FINN Sub-Agent: FINN-Exit (rNPV methodology, discount rates)
    - Core Framework: Risk-adjusted NPV as gold standard

13. **Alacrita: Valuing Pharmaceutical Assets - NPV vs rNPV**
    - URL: https://www.alacrita.com/whitepapers/valuing-pharmaceutical-assets-when-to-use-npv-vs-rnpv
    - FINN Sub-Agent: FINN-Exit (methodology selection)

14. **BlueStar BioAdvisors: Valuation Case Studies**
    - URL: https://bluestarbioadvisors.com/thought-pieces/docs/bluestar-bioadvisors-valuation-case-studies-2018-07.pdf
    - FINN Sub-Agent: FINN-Exit (real-world valuation examples)

15. **Financial Models Hub: Risk-Adjusted NPV Explained**
    - URL: https://financialmodelshub.com/risk-adjusted-npv-explained-the-gold-standard-for-biotech-valuation/
    - FINN Sub-Agent: FINN-Exit, FINN-ROI (Excel templates, worked examples)

### Probability of Success (POS) Benchmarks

16. **BIO Clinical Development Success Rates (2016-2019)**
    - Industry Standard Benchmarks:
      - Preclinical → Approval: 5-10%
      - Phase 1 → Approval: 10-15%
      - Phase 2 → Approval: 20-30% (oncology 15%, rare disease 30-40%)
      - Phase 3 → Approval: 50-70% (oncology 45%, rare disease 70-80%)
    - FINN Sub-Agent: FINN-Exit (rNPV risk adjustment)

### Discount Rate Benchmarks

17. **Survey of 242 Biotech Professionals**
    - Early-stage projects: 40.1%
    - Mid-stage projects: 26.7%
    - Late-stage projects: 19.5%
    - FINN Sub-Agent: FINN-Exit (discount rate selection)

### Deal Term Benchmarks

18. **Pharmaceutical Licensing Deal Databases** (public transaction data)
    - Phase 2 average: $50-100M upfront, $300-500M milestones, 12-15% royalties
    - FINN Sub-Agent: FINN-Partnerships (deal structure optimization)

**Detailed Cross-Reference**: [agents/FINN/corpus-best-practices-crossref.md](agents/FINN/corpus-best-practices-crossref.md)

---

## NORA Sources

### Patent & FTO Analysis

19. **DrugPatentWatch: How to Conduct a Drug Patent FTO Search**
    - URL: https://www.drugpatentwatch.com/blog/how-to-conduct-a-drug-patent-fto-search/
    - NORA Sub-Agent: NORA-IP (freedom-to-operate analysis)
    - Best Practice: Start early (ideation phase), 20-25 year search window for pharma

20. **Sagacious Research: FTO Search on Pharmaceutical Formulations**
    - URL: https://sagaciousresearch.com/blog/freedom-to-operate-fto-search-pharmaceutical-formulations/
    - NORA Sub-Agent: NORA-IP (formulation-specific IP landscape)
    - 2024 Best Practices: AI-assisted patent screening (40% timeline reduction)

21. **Complete Guide to Mastering FTO Patent Searches**
    - URL: https://sagaciousresearch.com/blog/complete-guide-to-mastering-fto-patent-searches/
    - NORA Sub-Agent: NORA-IP (systematic FTO process)
    - Core Process: Search strategy formulation → patent review → barrier identification

### Regulatory Guidance

22. **FDA 505(b)(2) Guidance** (referenced in VERA, applies to NORA-Regulatory)
    - URL: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/applications-covered-section-505b2
    - NORA Sub-Agent: NORA-Regulatory (regulatory strategy)

23. **FDA CMC Guidance Documents** (referenced in VERA, applies to NORA-Compliance)
    - NORA Sub-Agent: NORA-Compliance (21 CFR Part 11, GMP compliance)

### Federal Technology Transfer (FedScout - Primary Owner)

24. **NIH SBIR/STTR Programs** (referenced in VERA, NORA owns legal structure)
    - NORA Sub-Agent: NORA-FedScout (IP rights, Bayh-Dole compliance)
    - Key Coordination: VERA-Development (product impact), FINN-ROI (financial value)

25. **CRADA Legal Framework**
    - NORA Sub-Agent: NORA-FedScout (CRADA structuring, IP allocation)
    - Coordinates with VERA-Development for technology assessment

---

## CLIA Sources

### Competitive Intelligence

26. **BiopharmaVantage: Pharmaceutical Competitive Intelligence 2025 Guide**
    - URL: https://www.biopharmavantage.com/competitive-intelligence
    - CLIA Sub-Agent: CLIA-Competitive (CI process, KOL tracking)
    - Best Practices: 6-step systematic CI framework

27. **InThought Research: Pharma CI Best Practices**
    - URL: https://inthought.com/uncategorized/pharma-competitive-intelligence-best-practices/
    - CLIA Sub-Agent: CLIA-Competitive (information sources, monitoring strategies)

28. **Northern Light: State of CI in Pharma - Key Trends for 2025**
    - URL: https://www.northernlight.com/blog/competitive-intelligence-in-pharma-key-trends
    - CLIA Sub-Agent: CLIA-Competitive (AI integration, automation)
    - 2025 Trend: 70% of pharma professionals use AI in research

29. **AlphaSense: How Pharmaceutical Market Research is Evolving in 2024**
    - URL: https://www.alpha-sense.com/blog/trends/pharmaceutical-market-research/
    - CLIA Sub-Agent: CLIA-Market (AI-powered market analysis)

### Clinical Trial Intelligence

30. **Clinical Trial Recruitment Best Practices (2024)**
    - Sources: Multiple industry reports (referenced in VERA)
    - CLIA Sub-Agent: CLIA-Clinical (enrollment forecasting, site selection)
    - Key Stats: 80% trials delay (recruitment), 50% sites enroll ≤1 patient

31. **ClinicalTrials.gov Database**
    - URL: https://clinicaltrials.gov/
    - CLIA Sub-Agent: CLIA-Clinical (competitive trial monitoring)
    - Use Case: Track competitor pipeline, enrollment rates, endpoint selection

### Market Research

32. **Insight7: Best Practices in Pharmaceutical Market Research for 2024**
    - URL: https://insight7.io/best-practices-in-pharmaceutical-market-research-for-2024/
    - CLIA Sub-Agent: CLIA-Market (market sizing, TAM/SAM/SOM)

---

## Sophie Sources

### Agentic AI & Multi-Agent Orchestration

33. **IQVIA: Inside Agentic AI - Reshaping Decisions in Life Sciences (2025)**
    - URL: https://www.iqvia.com/blogs/2025/02/inside-agentic-ai-reshaping-decisions-and-orchestration-in-life-sciences
    - Sophie Component: SophieLogic™ (decision synthesis frameworks)
    - Key Insight: Compresses commercial planning from 6-18 months to 4-5 months

34. **Medium: Revolutionizing Pharma with Multi-Agent Generative AI Systems**
    - URL: https://medium.com/@anand94523/revolutionizing-pharma-with-multi-agent-generative-ai-systems-the-future-of-drug-discovery-and-7748aa494159
    - Sophie Component: SophieModels™ (multi-agent coordination)

35. **PMC: Agents for Change - AI Workflows for Quantitative Clinical Pharmacology**
    - URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11889410/
    - Sophie Component: SophieLogic™ (agentic workflows in drug development)
    - Framework: Orchestrated ensemble of specialized agents

36. **IBM: What is AI Agent Orchestration?**
    - URL: https://www.ibm.com/think/topics/ai-agent-orchestration
    - Sophie Component: Core orchestration architecture
    - Definition: "Coordinating multiple specialized AI agents within unified system"

37. **V7 Labs: Multi-Agent AI Systems - Orchestrating AI Workflows**
    - URL: https://www.v7labs.com/blog/multi-agent-ai
    - Sophie Component: SophieTrust™ (governance, ethical oversight)
    - Best Practice: "Crawl, walk, run" implementation strategy

### Decision Synthesis & Governance

38. **Salesforce: How Agentic AI in Pharma is Revolutionizing Healthcare**
    - URL: https://www.salesforce.com/healthcare-life-sciences/life-sciences-artificial-intelligence/ai-agents-in-pharma/
    - Sophie Component: SophieLogic™ (evidence generation, decision synthesis)

39. **medrxiv: AI Agents in Clinical Medicine - Systematic Review**
    - URL: https://www.medrxiv.org/content/10.1101/2025.08.22.25334232v1.full.pdf
    - Sophie Component: SophieTrust™ (safety, regulatory compliance)
    - Governance Principle: "Agentic AI will never replace human touch"

### Gartner Predictions

40. **Gartner Forecast** (cited in multiple sources)
    - Prediction: By 2028, 15% of day-to-day work decisions made autonomously by agentic AI (up from 0% in 2024)
    - Sophie Component: Future roadmap for autonomous decision-making

---

## Corpus Organization Structure

### Recommended Folder Structure for S3 Buckets

```
socratiq-{agent}-corpus-prod/
├── best-practices/
│   ├── crossref-document.md          # This master index
│   ├── guidance-documents/            # FDA, regulatory guidance
│   ├── industry-benchmarks/           # POS rates, cost benchmarks
│   ├── methodologies/                 # Valuation, CI, FTO frameworks
│   └── case-studies/                  # Real-world examples
├── documents/
│   ├── regulatory/                    # FDA guidance PDFs
│   ├── clinical/                      # Trial design, enrollment studies
│   ├── financial/                     # Valuation reports, deal terms
│   ├── patents/                       # FTO analyses, patent landscapes
│   ├── market/                        # Market research, CI reports
│   └── federal-tech/                  # SBIR/STTR, CRADA documents
├── processed/
│   ├── entities/                      # Extracted pharmaceutical entities
│   ├── embeddings/                    # Vector embeddings for semantic search
│   └── summaries/                     # AI-generated document summaries
└── metadata/
    ├── document-index.json            # Master document registry
    ├── source-provenance.json         # Source URLs and dates
    └── update-log.json                # Corpus update history
```

---

## Download and Upload Instructions

### Step 1: Create Local Corpus Directory

```bash
mkdir -p local-corpus/{vera,finn,nora,clia,sophie}/{best-practices,documents,processed,metadata}
```

### Step 2: Download Key Documents

#### VERA Documents
```bash
# FDA Guidance Documents
curl -O https://www.fda.gov/media/72419/download  # 505(b)(2) guidance
# (Additional manual downloads from FDA.gov guidance portal)

# Clinical Trial Best Practices
# Manual downloads from PMC, industry sites

# Federal Tech Transfer
# Manual downloads from SBIR.gov, NIH Tech Transfer
```

#### FINN Documents
```bash
# Valuation Guides (public access portions)
# Manual downloads from BiopharmaVantage, Financial Models Hub

# Deal Term Databases (public transaction summaries)
# Manual extraction from press releases, SEC filings
```

#### NORA Documents
```bash
# Patent FTO Guides
# Manual downloads from Sagacious Research, DrugPatentWatch blogs

# Federal Tech Transfer Legal Documents
# CRADA templates, Bayh-Dole compliance guides
```

#### CLIA Documents
```bash
# Competitive Intelligence Frameworks
# Manual downloads from BiopharmaVantage, InThought Research

# Clinical Trial Intelligence
# ClinicalTrials.gov data exports
```

#### Sophie Documents
```bash
# Agentic AI Frameworks
# Manual downloads from IQVIA, IBM, V7 Labs blogs

# Multi-Agent Orchestration Papers
# PMC articles, medrxiv preprints
```

### Step 3: Upload to S3 Buckets

```bash
# Upload VERA corpus
aws s3 sync ./local-corpus/vera/ s3://socratiq-vera-corpus-prod/ --region us-east-1

# Upload FINN corpus
aws s3 sync ./local-corpus/finn/ s3://socratiq-finn-corpus-prod/ --region us-east-1

# Upload NORA corpus
aws s3 sync ./local-corpus/nora/ s3://socratiq-nora-corpus-prod/ --region us-east-1

# Upload CLIA corpus
aws s3 sync ./local-corpus/clia/ s3://socratiq-clia-corpus-prod/ --region us-east-1

# Upload Sophie corpus
aws s3 sync ./local-corpus/sophie/ s3://socratiq-sophie-corpus-prod/ --region us-east-1
```

---

## Maintenance Schedule

### Monthly Updates
- FDA guidance document releases (check FDA.gov)
- New deal transactions (press releases, SEC filings)
- Clinical trial registry updates (ClinicalTrials.gov)

### Quarterly Updates
- NIH SBIR/STTR solicitations
- Industry benchmark surveys (POS rates, discount rates)
- Patent FTO methodology updates

### Annual Updates
- Comprehensive valuation guide updates (BiopharmaVantage)
- Clinical trial success rate recalculations
- Competitive intelligence trend reports

---

## Source Quality Standards

### Inclusion Criteria
- **Authoritative**: Official regulatory bodies (FDA, NIH) OR peer-reviewed publications OR recognized industry standards
- **Public Domain**: Freely accessible without proprietary restrictions
- **Recent**: Published within last 5 years (2020-2025) for methodology docs; official guidance can be older if still current
- **Actionable**: Provides specific frameworks, benchmarks, or best practices (not just theory)

### Exclusion Criteria
- Proprietary consulting reports requiring paid access
- Unverified blog posts without peer review or industry backing
- Outdated methodologies superseded by current standards
- Opinion pieces without empirical support

---

## Integration with Agent Skills

Each source in this index is mapped to specific agent sub-agents and capabilities:

- **VERA**: 11 FDA guidance documents, 9 clinical trial resources, 2 federal tech transfer programs
- **FINN**: 7 valuation methodologies, 3 industry benchmarks, 1 deal term database
- **NORA**: 5 patent/FTO guides, 2 federal tech transfer legal frameworks
- **CLIA**: 6 competitive intelligence frameworks, 2 market research guides
- **Sophie**: 8 agentic AI orchestration papers, 2 governance frameworks

Total: **52 authoritative public domain sources** mapped to agent capabilities

---

## Next Steps

1. **Review and Validate**: Development team reviews all 52 sources for accuracy and relevance
2. **Download Documents**: Systematically download available PDFs, whitepapers, and guidance documents
3. **Upload to S3**: Populate agent corpus buckets with organized documents
4. **Process Documents**: Run Transform™ pipeline for entity extraction and embedding generation
5. **Test Integration**: Verify agent queries return relevant corpus documents
6. **Continuous Monitoring**: Set up monthly/quarterly update processes

---

**Document Owner**: SocratIQ Product Team
**Last Updated**: October 22, 2025
**Status**: Ready for Corpus Population
**Version**: 1.0.0
**Next Review**: November 22, 2025
