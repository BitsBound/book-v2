# Chapter 18: IP Analytics

*Patent Claim Analysis, Prior Art Research, Portfolio Valuation, and IP Due Diligence*

A technology company's general counsel gets a call from the CEO: "We're
acquiring a startup for $140 million. Eighty percent of the valuation is
their patent portfolio. Tell me what we're actually buying." The GC
assigns two associates and an outside IP counsel. They spend four weeks
and $380,000 in legal fees reviewing 47 patents, 12 pending applications,
a dozen license agreements, and a tangle of assignment chains. They produce
a 200-page memo that reads like a patent prosecution textbook: thorough,
technically precise, and almost entirely useless for the decision the CEO
needs to make. The memo tells you what Claim 1 of U.S. Patent No.
11,234,567 recites. It does not tell you whether the portfolio covers the
market the company plans to enter, whether any of the 47 patents would
survive an IPR challenge, what the portfolio is worth as a licensing asset,
or whether the $140 million price tag has any relationship to the IP's
commercial value.


The CEO wanted intelligence. They got inventory.


IP analytics is the workflow that bridges this gap. It is not patent
prosecution (drafting and filing applications), patent litigation (asserting
or defending infringement claims), or traditional IP due diligence (checking
that assignments are signed and maintenance fees are current). Those are
necessary tasks, but they operate at the document level. IP analytics
operates at the portfolio level. It transforms raw IP assets, patents,
trademarks, trade secrets, licenses, into structured data that answers
strategic questions: What do we own? What is it worth? Where are the gaps?
What is vulnerable? What should we abandon, license, enforce, or acquire?


This chapter teaches you to build multi-agent pipelines that perform IP
analytics at a scale and depth that no human team can match in the
timelines that deals and strategic decisions demand. A patent portfolio
that takes an outside firm four weeks and six figures to review takes a
properly architected pipeline hours and hundreds of dollars. More
importantly, the pipeline answers the *right* questions. It does not
produce a memo. It produces intelligence.


> **IP Is the Most Expensive Asset Most Companies Cannot Quantify**
>
> According to Ocean Tomo, intangible assets represent 90% of the S&P 500's
> market capitalization as of 2025. Yet most companies cannot answer basic
> questions about their own IP portfolio: How many active patents do they
> hold? What technology areas do those patents cover? Which patents generate
> licensing revenue? Which are candidates for abandonment? The gap between
> the economic significance of IP and the analytical tools available to
> manage it is staggering. IP analytics closes that gap.


\newpage


## Why IP Analytics Demands Multi-Agent Architecture


Before we design the pipeline, consider why single-prompt AI fails
catastrophically for IP work. A patent is not a contract. A contract is
largely self-contained: the four corners of the document contain the
operative terms. A patent exists within a dense web of external references.
Claim 1 of a patent must be read against the specification for claim
construction. The specification must be read against the prosecution history
for disclaimer and estoppel arguments. The prosecution history must be
read against the prior art cited during examination. The prior art must
be evaluated against the state of the art at the time of filing. And all
of this exists within a framework of case law, from *Phillips v. AWH Corp.*
to *Alice Corp. v. CLS Bank*, that determines how claims are interpreted
and whether the patent is valid at all.


No single prompt, no matter how well crafted, can hold this context
simultaneously and reason across it competently. The input exceeds even
extended context windows when you include the specification, file wrapper,
cited references, and relevant case law for a single patent, let alone
a portfolio of fifty. And even if it fit, a single prompt collapses
specialization. Patent claim construction requires different expertise
than prior art analysis. Prior art analysis requires different skills
than market mapping. Portfolio valuation requires different analytical
frameworks than freedom-to-operate opinions.


This is the same structural argument we have made throughout this book,
but IP analytics makes it more acute. A contract analytics pipeline
(Chapter 9) with a single-prompt architecture produces mediocre but
usable term extraction. A single-prompt IP analytics attempt produces
results that are actively dangerous: claims that appear valid but are
not, prior art that looks relevant but is not, valuations that seem
reasonable but have no empirical basis. IP is a domain where shallow
analysis is worse than no analysis because it generates false confidence.


The multi-agent architecture solves this by decomposing IP analytics
into specialist roles that mirror how sophisticated IP practices
actually operate:


- A **Claims Analyst** that parses patent claims into structural components,
  maps claim limitations, and traces dependent claim chains
- **Prior Art Researchers** that search multiple databases in parallel for
  anticipating and obviating references
- A **Prosecution Analyst** that reads file wrappers for estoppel,
  disclaimer, and claim construction implications
- A **Valuation Specialist** that assesses commercial value based on
  claim scope, market coverage, and comparable licensing data
- A **Portfolio Strategist** that synthesizes individual analyses into
  portfolio-level intelligence and strategic recommendations
- A **Trademark Analyst** that performs clearance searches and
  likelihood-of-confusion analysis
- A **Trade Secret Auditor** that identifies protectable information
  and evaluates safeguards


Each agent has deep domain expertise encoded in its prompt. Each operates
on the specific inputs it needs. And the pipeline orchestrates them in
a sequence that builds intelligence from the ground up: parse the claims,
research the prior art, assess the prosecution history, value the
individual patents, then synthesize at the portfolio level.


> **Key Concept**
>
> IP analytics is a hierarchical intelligence problem. Portfolio-level
> conclusions depend on patent-level analyses, which depend on
> claim-level parsing. The pipeline must build from the bottom up:
> claims first, then patents, then portfolio. Any architecture that
> attempts to skip levels produces conclusions without foundations.


\newpage


## IP Analytics in Practice: The Boomi Experience


Before we build the technical pipeline, a note on where these patterns
come from. I did not design IP analytics workflows in a laboratory. I
learned them at Boomi, a Dell Technologies company, where I served as
corporate counsel handling technology transactions and IP matters.


At Boomi, I spearheaded acquisitions where the entire deal rationale was
the target's intellectual property. Software patents, proprietary
integration technology, trade secrets embedded in codebases. The
acquisition was the easy part. The hard part was answering the question
that every acquirer must answer before writing the check: What exactly are
we buying, and is it worth what we are paying?


That question decomposes into sub-questions that map directly to the
pipeline stages in this chapter. Is the IP properly assigned to the
target entity, or are there gaps in the chain of title? Do any patents
have co-inventors who were not under employment agreements with adequate
IP assignment provisions? Are there license encumbrances that survive the
transaction? Does the target's open-source usage create copyleft
contamination risks for the proprietary codebase? Are the trademarks
properly registered in the jurisdictions where the acquirer plans to
operate?


I structured asset purchase agreements to ensure clean IP transfer. I
negotiated IP license terms for technology that the seller would retain
post-closing. I ran trademark portfolio analyses across global
jurisdictions to ensure that the acquired brand could operate without
conflict in every market Boomi served. I worked through patent assignment
chains that had gaps, inventor agreements that were missing, and license
agreements that nobody in the data room had read since they were signed.


Every pattern in this chapter, the claims analysis structure, the parallel
prior art research, the portfolio valuation framework, the trademark
clearance methodology, the trade secret audit checklist, reflects what
I needed and did not have in those transactions. The pipeline I teach you
to build here is the pipeline I wished I could have deployed when I was
the one reviewing 47 patents against a four-week clock.


> **Practice Tip**
>
> If you are building IP analytics pipelines for a law firm or corporate
> legal department, start with the questions that the business actually
> asks. "What do we own?" and "What is it worth?" are more common than
> "Is Claim 3 anticipated by Smith et al.?" The pipeline should answer
> strategic questions first and provide the underlying claim-level detail
> as supporting evidence. Executives consume intelligence. Patent
> prosecutors consume claim charts. Build for both audiences.


\newpage


## The Type System


IP analytics requires a rich type system because the domain is deeply
structured. Patents have claims, which have limitations, which have
elements. Trademarks have registrations, which have classes, which have
goods and services descriptions. Portfolios have patents, trademarks,
trade secrets, and licenses, each with different lifecycle states.
Defining this structure in TypeScript ensures consistency across every
agent in the pipeline.


```typescript
// ip-analytics-types.ts
// Core type definitions for the IP analytics pipeline

// ─── Patent Domain ───────────────────────────────────────────

interface Patent {
  patentNumber: string;
  title: string;
  filingDate: string;
  issueDate: string | null;        // null if pending application
  expirationDate: string | null;   // null if pending or expired
  status: 'active' | 'pending' | 'expired' | 'abandoned';
  assignee: string;
  inventors: string[];
  jurisdiction: 'US' | 'EP' | 'WO' | 'CN' | 'JP' | 'KR' | string;
  technologyArea: string;
  patentFamily: string | null;     // family ID linking related filings
  claims: PatentClaim[];
  citedReferences: string[];       // patent numbers cited during prosecution
  forwardCitations: number;        // how many later patents cite this one
}

interface PatentClaim {
  claimNumber: number;
  claimType: 'independent' | 'dependent';
  dependsOn: number | null;        // null for independent claims
  preamble: string;
  transitionalPhrase: 'comprising' | 'consisting of' | 'consisting essentially of';
  bodyElements: ClaimElement[];
  fullText: string;
}

interface ClaimElement {
  elementId: string;
  description: string;
  isMethod: boolean;
  isApparatus: boolean;
  isComposition: boolean;
  limitations: string[];
}

// ─── Prior Art Domain ────────────────────────────────────────

interface PriorArtReference {
  referenceId: string;
  source: 'USPTO' | 'EPO' | 'WIPO' | 'GooglePatents' | 'Academic' | 'Product';
  title: string;
  publicationDate: string;
  relevance: 'anticipating' | 'obviating' | 'related' | 'background';
  relevantClaims: number[];        // which claims this reference challenges
  mappedLimitations: LimitationMapping[];
  analysisNotes: string;
}

interface LimitationMapping {
  claimNumber: number;
  elementId: string;
  referenceDisclosure: string;     // what the reference discloses
  coverageAssessment: 'fully_disclosed' | 'partially_disclosed' | 'not_disclosed';
}

// ─── Trademark Domain ────────────────────────────────────────

interface Trademark {
  registrationNumber: string | null;
  applicationNumber: string | null;
  mark: string;
  markType: 'word' | 'design' | 'composite' | 'sound' | 'color';
  status: 'registered' | 'pending' | 'abandoned' | 'cancelled' | 'expired';
  owner: string;
  filingDate: string;
  registrationDate: string | null;
  niceClasses: number[];
  goodsAndServices: string;
  jurisdiction: string;
  renewalDate: string | null;
}

interface TrademarkConflict {
  conflictingMark: Trademark;
  likelihoodOfConfusion: 'high' | 'moderate' | 'low' | 'minimal';
  dupontFactors: DuPontAnalysis;
  recommendation: 'oppose' | 'monitor' | 'coexist' | 'clear';
}

interface DuPontAnalysis {
  similarityOfMarks: number;           // 1-5
  similarityOfGoods: number;           // 1-5
  similarityOfTradeChannels: number;   // 1-5
  strengthOfPriorMark: number;         // 1-5
  evidenceOfActualConfusion: boolean;
  overallAssessment: string;
}

// ─── Trade Secret Domain ─────────────────────────────────────

interface TradeSecretCandidate {
  candidateId: string;
  description: string;
  category: 'technical' | 'business' | 'process' | 'customer' | 'financial';
  economicValue: 'high' | 'medium' | 'low';
  protectionMeasures: ProtectionMeasure[];
  vulnerabilities: string[];
  dtsa_qualified: boolean;             // meets Defend Trade Secrets Act criteria
}

interface ProtectionMeasure {
  measureType: 'nda' | 'access_control' | 'encryption' | 'marking'
    | 'employee_agreement' | 'physical_security' | 'policy';
  adequacy: 'strong' | 'adequate' | 'weak' | 'absent';
  notes: string;
}

// ─── Portfolio Domain ────────────────────────────────────────

interface IPPortfolio {
  portfolioId: string;
  owner: string;
  asOfDate: string;
  patents: Patent[];
  trademarks: Trademark[];
  tradeSecrets: TradeSecretCandidate[];
  licenses: IPLicense[];
  summary: PortfolioSummary;
}

interface IPLicense {
  licenseId: string;
  licenseType: 'inbound' | 'outbound';
  grantor: string;
  grantee: string;
  scope: 'exclusive' | 'non-exclusive' | 'sole';
  field_of_use: string | null;
  territory: string;
  royaltyStructure: string;
  term: string;
  changeOfControlProvision: string | null;
  ipCovered: string[];             // patent numbers, TM registrations, etc.
}

interface PortfolioSummary {
  totalPatents: number;
  activePatents: number;
  pendingApplications: number;
  expiringWithinTwoYears: number;
  totalTrademarks: number;
  activeTrademarks: number;
  identifiedTradeSecrets: number;
  inboundLicenses: number;
  outboundLicenses: number;
  technologyCoverage: TechnologyArea[];
  estimatedPortfolioValue: ValuationRange;
  strategicRecommendations: string[];
}

interface TechnologyArea {
  area: string;
  patentCount: number;
  claimCoverage: 'broad' | 'narrow' | 'fragmented';
  competitivePosition: 'dominant' | 'strong' | 'moderate' | 'weak';
  trend: 'growing' | 'stable' | 'declining';
}

interface ValuationRange {
  low: number;
  mid: number;
  high: number;
  methodology: string;
  comparables: string[];
}

// ─── Pipeline Orchestration ──────────────────────────────────

interface IPAnalysisConfig {
  analysisType: 'full_portfolio' | 'patent_only' | 'trademark_clearance'
    | 'trade_secret_audit' | 'due_diligence';
  portfolio: IPPortfolio;
  dealContext?: DealContext;        // for due diligence analyses
  clientPosition: 'owner' | 'acquirer' | 'licensee' | 'challenger';
}

interface DealContext {
  transactionType: 'asset_purchase' | 'stock_purchase' | 'merger' | 'licensing';
  valuationBasis: string;
  targetMarkets: string[];
  materialityThreshold: number;
  closingDate: string;
}

interface PipelineResult {
  analysisId: string;
  completedAt: string;
  patentAnalyses: PatentAnalysisResult[];
  trademarkAnalyses: TrademarkConflict[];
  tradeSecretFindings: TradeSecretCandidate[];
  portfolioSummary: PortfolioSummary;
  metrics: PipelineMetrics;
}

interface PipelineMetrics {
  totalDurationMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  agentCallCount: number;
  patentsAnalyzed: number;
  priorArtReferencesFound: number;
}

interface PatentAnalysisResult {
  patent: Patent;
  claimsAnalysis: ClaimScopeAnalysis;
  priorArtFindings: PriorArtReference[];
  prosecutionAnalysis: ProsecutionAnalysis;
  valuation: PatentValuation;
}

interface ClaimScopeAnalysis {
  broadestIndependentClaim: number;
  claimTree: ClaimDependencyNode[];
  scopeAssessment: 'broad' | 'moderate' | 'narrow';
  keyLimitations: string[];
  vulnerabilities: string[];
}

interface ClaimDependencyNode {
  claimNumber: number;
  dependsOn: number | null;
  children: number[];
  scopeNarrowing: string | null;
}

interface ProsecutionAnalysis {
  totalOfficeActions: number;
  rejectionTypes: string[];
  amendments: ProsecutionAmendment[];
  estoppelRisks: string[];
  claimConstructionImplications: string[];
}

interface ProsecutionAmendment {
  officeActionDate: string;
  claimsAmended: number[];
  natureOfAmendment: string;
  potentialEstoppel: string;
}

interface PatentValuation {
  remainingLifeYears: number;
  technologyRelevance: 'high' | 'medium' | 'low';
  licensingPotential: 'high' | 'medium' | 'low';
  litigationStrength: 'strong' | 'moderate' | 'weak';
  maintenanceRecommendation: 'maintain' | 'abandon' | 'license' | 'enforce';
  estimatedValue: ValuationRange;
}
```


> **Key Concept**
>
> The type system encodes the domain ontology. A `PatentClaim` with a
> `transitionalPhrase` field forces the pipeline to identify whether
> the claim uses "comprising" (open-ended, broader scope),
> "consisting of" (closed, narrower scope), or "consisting essentially
> of" (limited openness). This is not a nice-to-have annotation. It
> determines claim scope, which determines infringement analysis, which
> determines portfolio value. The type system is the analytical framework.


\newpage


## TIRO Decomposition of IP Analytics


Before building the pipeline, we decompose each IP analytics workflow
using TIRO. The decomposition reveals the Triggers that initiate analysis,
the Inputs the pipeline consumes, the Requirements (Arbitration,
Definitions, Validations, Transformations) that govern processing, and
the Outputs the pipeline produces. This is not ceremony. It is the
engineering discipline that prevents you from building a pipeline that
analyzes the wrong things against the wrong standards.


### Patent Claim Scope Analysis


| Component | Description |
|---|---|
| **Trigger** | New patent acquired, portfolio review requested, litigation threat received |
| **Input** | Patent specification (claims, description, drawings), file wrapper (office actions, responses, amendments), cited prior art references |
| **Arbitration** | *Phillips v. AWH Corp.* (claims construed in light of specification), *Markman v. Westview* (claim construction is question of law), prosecution history estoppel doctrine |
| **Definitions** | "Comprising" = open-ended transition, "consisting of" = closed transition, "means for" invokes 35 U.S.C. 112(f) equivalents, dependent claims narrow the independent claim they reference |
| **Validations** | Every independent claim must have identifiable preamble, transitional phrase, and body; dependent claims must reference a valid parent claim; claim elements must have support in the specification (written description requirement) |
| **Transformations** | Parse claim text into structured `PatentClaim` objects; build dependency tree; identify broadest independent claim; map claim limitations to specification support; flag potential indefiniteness issues |
| **Output** | `ClaimScopeAnalysis` with dependency tree, scope assessment, key limitations, and vulnerability flags |


### Prior Art Research


| Component | Description |
|---|---|
| **Trigger** | Patent claim analysis complete (provides claims to search against), acquisition due diligence, IPR petition preparation |
| **Input** | Parsed patent claims from claim analysis, specification disclosure, filing date (defines the prior art cutoff), inventor names (for self-citation filtering) |
| **Arbitration** | 35 U.S.C. 102 (novelty: single reference anticipation), 35 U.S.C. 103 (non-obviousness: combined references), *KSR Int'l v. Teleflex* (obviousness analysis framework), *Graham v. John Deere* (factual inquiries for obviousness) |
| **Definitions** | "Prior art" = references publicly available before the effective filing date, "anticipation" = single reference disclosing every claim limitation, "obviousness" = combination of references with motivation to combine |
| **Validations** | Reference must predate effective filing date; reference must be publicly accessible; reference must actually disclose the mapped limitations (not merely related subject matter); combination arguments must include articulated motivation to combine |
| **Transformations** | Search multiple databases in parallel; map reference disclosures to claim limitations; assess anticipation on a limitation-by-limitation basis; evaluate obviousness combinations with motivation analysis |
| **Output** | Array of `PriorArtReference` objects with limitation mappings, relevance assessments, and combination rationale |


### Portfolio Valuation Synthesis


| Component | Description |
|---|---|
| **Trigger** | Individual patent analyses complete, M&A valuation request, annual portfolio review, licensing strategy development |
| **Input** | All `PatentAnalysisResult` objects from patent-level analysis, market data (industry, competitors, licensing comparables), portfolio metadata (maintenance fee schedule, expiration timeline) |
| **Arbitration** | *Georgia-Pacific Corp. v. U.S. Plywood Corp.* (15-factor reasonable royalty framework), comparable licensing deals, industry valuation benchmarks, remaining patent life considerations |
| **Definitions** | "Portfolio premium" = value of portfolio exceeds sum of individual patent values, "coverage gap" = technology area where competitors hold patents but the portfolio does not, "strategic patent" = patent that covers a competitor's core product or a market entry requirement |
| **Validations** | Valuation must account for remaining patent life; licensing comparables must be from the same technology area; portfolio coverage assessment must map to defined technology areas; abandonment recommendations must include cost-benefit analysis |
| **Transformations** | Aggregate patent-level analyses into technology areas; compute coverage maps; calculate maintenance cost vs. licensing revenue per patent; identify strategic patents vs. non-core assets; generate valuation range with methodology disclosure |
| **Output** | `PortfolioSummary` with technology coverage, valuation range, maintenance recommendations, and strategic roadmap |


### Trademark Clearance


| Component | Description |
|---|---|
| **Trigger** | New brand launch, product naming, acquisition (evaluating target's marks), international expansion |
| **Input** | Proposed mark (word, design, or composite), intended goods/services, target jurisdictions, Nice Classification classes |
| **Arbitration** | *In re E.I. du Pont de Nemours & Co.* (13 DuPont factors for likelihood of confusion), *Abercrombie & Fitch Co. v. Hunting World* (distinctiveness spectrum), *Polaroid Corp. v. Polarad Electronics* (Second Circuit multifactor test) |
| **Definitions** | "Likelihood of confusion" = the legal standard for trademark infringement, "DuPont factors" = the 13-factor test for confusion likelihood, "Nice Classification" = international system for classifying goods/services, "Distinctiveness spectrum" = generic < descriptive < suggestive < arbitrary < fanciful |
| **Validations** | Search must cover all relevant Nice classes; analysis must address all applicable DuPont factors; conflicting marks must be evaluated for actual marketplace conditions; geographic scope must match intended use territories |
| **Transformations** | Search trademark databases across jurisdictions; filter results by relevance; apply DuPont factor analysis to each potential conflict; assess distinctiveness of proposed mark on the Abercrombie spectrum; generate clearance opinion with risk rating |
| **Output** | Array of `TrademarkConflict` objects with DuPont analysis and overall clearance recommendation |


### Trade Secret Audit


| Component | Description |
|---|---|
| **Trigger** | Pre-acquisition audit, employee departure with access to sensitive information, annual compliance review, litigation preparation (DTSA or state UTSA claim) |
| **Input** | Business process descriptions, codebase documentation, employee/contractor agreements, NDA inventory, access control policies, information classification policies |
| **Arbitration** | Defend Trade Secrets Act (18 U.S.C. 1836), Uniform Trade Secrets Act (state versions), *Kewanee Oil Co. v. Bicron Corp.* (trade secret protection coexists with patent), reasonable measures requirement |
| **Definitions** | "Trade secret" = information that derives economic value from secrecy and is subject to reasonable measures to maintain secrecy, "reasonable measures" = steps a company takes to protect secret information (NDAs, access controls, marking, training), "misappropriation" = acquisition by improper means or breach of duty |
| **Validations** | Each candidate must have identifiable economic value from secrecy; each candidate must have documented protection measures; protection measures must meet the "reasonable" standard for the jurisdiction; candidates must not be publicly available or readily ascertainable |
| **Transformations** | Inventory information assets that could qualify as trade secrets; assess each candidate against DTSA/UTSA criteria; evaluate protection measures for adequacy; identify gaps in protection; generate remediation recommendations |
| **Output** | Array of `TradeSecretCandidate` objects with protection adequacy assessment and remediation priorities |


> **Insight**
>
> The TIRO decompositions reveal that IP analytics workflows share a
> common structural pattern: Arbitration references specific case law
> frameworks (Phillips, DuPont, Georgia-Pacific), Definitions encode
> statutory terms of art with precise legal meanings, Validations enforce
> the requirements for legal sufficiency, and Transformations convert
> between natural language and structured data. This is the isomorphism
> in action. The IP domain is more technically dense than contract
> analytics, but the decomposition pattern is identical.


\newpage


## Pipeline Architecture Overview


The IP analytics pipeline has five rounds, executed sequentially at the
macro level with massive parallelism within each round. The architecture
mirrors how a world-class IP advisory practice would staff a portfolio
engagement: intake and organization first, then deep individual analysis,
then external research, then market intelligence, then synthesis into
strategic recommendations.


```svg
<svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: 'Segoe UI', system-ui, sans-serif; }
  </style>
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7"
            refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" font-size="16"
        font-weight="bold" fill="#1a1a2e">
    Figure 18.1: IP Analytics Pipeline — Five-Round Architecture
  </text>

  <!-- Round 1: Portfolio Intake -->
  <rect x="30" y="55" width="160" height="70" rx="8" fill="#1a1a2e"/>
  <text x="110" y="82" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Round 1</text>
  <text x="110" y="100" text-anchor="middle" font-size="10" fill="#16a085">
    Portfolio Intake</text>
  <text x="110" y="115" text-anchor="middle" font-size="9" fill="#ccc">
    Classify &amp; Organize</text>

  <!-- Arrow 1→2 -->
  <line x1="195" y1="90" x2="230" y2="90"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 2: Patent Analysis (parallel block) -->
  <rect x="235" y="50" width="160" height="80" rx="8" fill="#1a1a2e"/>
  <text x="315" y="75" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Round 2</text>
  <text x="315" y="93" text-anchor="middle" font-size="10" fill="#16a085">
    Patent Analysis</text>
  <text x="315" y="108" text-anchor="middle" font-size="9" fill="#f39c12">
    ⟦ Parallel per Patent ⟧</text>
  <text x="315" y="122" text-anchor="middle" font-size="9" fill="#ccc">
    Claims + Prosecution</text>

  <!-- Arrow 2→3 -->
  <line x1="400" y1="90" x2="435" y2="90"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 3: Prior Art Research (parallel block) -->
  <rect x="440" y="50" width="160" height="80" rx="8" fill="#1a1a2e"/>
  <text x="520" y="75" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Round 3</text>
  <text x="520" y="93" text-anchor="middle" font-size="10" fill="#16a085">
    Prior Art Research</text>
  <text x="520" y="108" text-anchor="middle" font-size="9" fill="#f39c12">
    ⟦ Parallel per DB ⟧</text>
  <text x="520" y="122" text-anchor="middle" font-size="9" fill="#ccc">
    USPTO + EPO + WIPO + Lit</text>

  <!-- Arrow 3→4 -->
  <line x1="605" y1="90" x2="640" y2="90"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 4: Market & Valuation -->
  <rect x="645" y="50" width="160" height="80" rx="8" fill="#1a1a2e"/>
  <text x="725" y="75" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Round 4</text>
  <text x="725" y="93" text-anchor="middle" font-size="10" fill="#16a085">
    Market &amp; Valuation</text>
  <text x="725" y="108" text-anchor="middle" font-size="9" fill="#f39c12">
    ⟦ Parallel Analysis ⟧</text>
  <text x="725" y="122" text-anchor="middle" font-size="9" fill="#ccc">
    Licensing + FTO + Value</text>

  <!-- Arrow 4→5 (descending) -->
  <line x1="725" y1="135" x2="725" y2="170"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 5: Portfolio Synthesis (full width) -->
  <rect x="235" y="175" width="570" height="70" rx="8" fill="#1a1a2e"/>
  <text x="520" y="202" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Round 5: Portfolio Synthesis</text>
  <text x="520" y="220" text-anchor="middle" font-size="10" fill="#16a085">
    Coverage Map — Valuation Range — Strategic Recommendations — Maintenance Roadmap
  </text>
  <text x="520" y="237" text-anchor="middle" font-size="9" fill="#ccc">
    Aggregates all patent, trademark, trade secret, and license analyses
  </text>

  <!-- Parallel detail: Round 2 fan-out -->
  <rect x="30" y="290" width="250" height="210" rx="8"
        fill="none" stroke="#1a1a2e" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="155" y="310" text-anchor="middle" font-size="11"
        font-weight="bold" fill="#1a1a2e">Round 2 Detail (per patent)</text>

  <rect x="50" y="325" width="90" height="35" rx="5" fill="#1a1a2e"/>
  <text x="95" y="347" text-anchor="middle" font-size="9" fill="#16a085">
    Claims Analyst</text>

  <rect x="170" y="325" width="90" height="35" rx="5" fill="#1a1a2e"/>
  <text x="215" y="347" text-anchor="middle" font-size="9" fill="#16a085">
    Prosecution</text>

  <rect x="50" y="380" width="90" height="35" rx="5" fill="#1a1a2e"/>
  <text x="95" y="402" text-anchor="middle" font-size="9" fill="#16a085">
    Specification</text>

  <rect x="170" y="380" width="90" height="35" rx="5" fill="#1a1a2e"/>
  <text x="215" y="402" text-anchor="middle" font-size="9" fill="#16a085">
    Licensing Eval</text>

  <!-- Fan-in arrow in Round 2 -->
  <rect x="95" y="435" width="120" height="35" rx="5" fill="#16a085"/>
  <text x="155" y="457" text-anchor="middle" font-size="9"
        font-weight="bold" fill="white">Patent Result</text>

  <line x1="95" y1="360" x2="130" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="215" y1="360" x2="180" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="95" y1="415" x2="130" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="215" y1="415" x2="180" y2="435"
        stroke="#16a085" stroke-width="1.5"/>

  <!-- Parallel detail: Round 3 fan-out -->
  <rect x="320" y="290" width="260" height="210" rx="8"
        fill="none" stroke="#1a1a2e" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="450" y="310" text-anchor="middle" font-size="11"
        font-weight="bold" fill="#1a1a2e">Round 3 Detail (per patent)</text>

  <rect x="335" y="325" width="70" height="35" rx="5" fill="#1a1a2e"/>
  <text x="370" y="347" text-anchor="middle" font-size="9" fill="#16a085">
    USPTO</text>

  <rect x="415" y="325" width="70" height="35" rx="5" fill="#1a1a2e"/>
  <text x="450" y="347" text-anchor="middle" font-size="9" fill="#16a085">
    EPO</text>

  <rect x="495" y="325" width="70" height="35" rx="5" fill="#1a1a2e"/>
  <text x="530" y="347" text-anchor="middle" font-size="9" fill="#16a085">
    WIPO</text>

  <rect x="335" y="380" width="70" height="35" rx="5" fill="#1a1a2e"/>
  <text x="370" y="402" text-anchor="middle" font-size="9" fill="#16a085">
    Google Pat</text>

  <rect x="415" y="380" width="70" height="35" rx="5" fill="#1a1a2e"/>
  <text x="450" y="402" text-anchor="middle" font-size="9" fill="#16a085">
    Academic</text>

  <rect x="495" y="380" width="70" height="35" rx="5" fill="#1a1a2e"/>
  <text x="530" y="402" text-anchor="middle" font-size="9" fill="#16a085">
    Standards</text>

  <!-- Fan-in arrow in Round 3 -->
  <rect x="390" y="435" width="120" height="35" rx="5" fill="#16a085"/>
  <text x="450" y="457" text-anchor="middle" font-size="9"
        font-weight="bold" fill="white">Prior Art Synthesis</text>

  <line x1="370" y1="360" x2="420" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="450" y1="360" x2="450" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="530" y1="360" x2="480" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="370" y1="415" x2="420" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="450" y1="415" x2="450" y2="435"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="530" y1="415" x2="480" y2="435"
        stroke="#16a085" stroke-width="1.5"/>

  <!-- Legend -->
  <rect x="620" y="310" width="12" height="12" rx="2" fill="#1a1a2e"/>
  <text x="640" y="321" font-size="9" fill="#1a1a2e">Specialist Agent</text>
  <rect x="620" y="330" width="12" height="12" rx="2" fill="#16a085"/>
  <text x="640" y="341" font-size="9" fill="#1a1a2e">Synthesis Output</text>
  <rect x="620" y="350" width="12" height="12" rx="2"
        fill="none" stroke="#1a1a2e" stroke-dasharray="3,2"/>
  <text x="640" y="361" font-size="9" fill="#1a1a2e">Parallel Region</text>
  <text x="625" y="381" font-size="9" fill="#f39c12">⟦ ⟧</text>
  <text x="640" y="381" font-size="9" fill="#1a1a2e">Parallel Execution</text>
</svg>
```


\newpage


## Round 1: Portfolio Intake and Classification


Every IP analytics engagement begins with inventory. Before you can
analyze patents, you need to know what patents exist. Before you can
assess trade secrets, you need to know what the company considers
proprietary. Before you can evaluate licenses, you need to know what
encumbrances exist on the portfolio.


The intake round ingests raw portfolio data, which may arrive as a
spreadsheet of patent numbers, a data room folder structure, or
unstructured documents, and produces a classified, organized `IPPortfolio`
object that the subsequent rounds consume.


```typescript
// portfolio-intake-diplomat.ts
// Round 1: Classify and organize the IP portfolio
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface IntakeInput {
  rawDocuments: Array<{
    filename: string;
    content: string;
    metadata?: Record<string, string>;
  }>;
  knownPatentNumbers?: string[];
  knownTrademarks?: string[];
  ownerEntity: string;
}

interface ClassifiedAsset {
  assetType: 'patent' | 'trademark' | 'trade_secret' | 'license'
    | 'assignment' | 'agreement' | 'other';
  documentIndex: number;
  filename: string;
  extractedIdentifier: string | null;
  status: 'active' | 'pending' | 'expired' | 'unknown';
  technologyArea: string | null;
  priority: 'critical' | 'standard' | 'background';
  notes: string;
}

async function classifyPortfolioAssets(
  input: IntakeInput
): Promise<ClassifiedAsset[]> {
  // Classify all documents in parallel batches
  // Group into batches of 20 to avoid token limits per call
  const batchSize = 20;
  const batches: Array<typeof input.rawDocuments> = [];

  for (let i = 0; i < input.rawDocuments.length; i += batchSize) {
    batches.push(input.rawDocuments.slice(i, i + batchSize));
  }

  const batchResults = await Promise.allSettled(
    batches.map(async (batch, batchIndex) => {
      const prompt = [
        'You are an IP portfolio analyst performing initial classification.',
        `The portfolio owner is: ${input.ownerEntity}`,
        '',
        'For each document below, classify it by asset type and extract',
        'the key identifier (patent number, TM registration, etc.).',
        'Assess priority based on likely strategic importance.',
        '',
        ...batch.map((doc, i) => [
          `--- DOCUMENT ${batchIndex * batchSize + i} ---`,
          `Filename: ${doc.filename}`,
          doc.content.slice(0, 8000),
          ''
        ].join('\n'))
      ].join('\n');

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 16_384,
        messages: [{ role: 'user', content: prompt }],
        output_config: {
          format: {
            type: 'json_schema',
            schema: {
              type: 'object',
              properties: {
                classifications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      assetType: {
                        type: 'string',
                        enum: ['patent', 'trademark', 'trade_secret',
                               'license', 'assignment', 'agreement', 'other']
                      },
                      documentIndex: { type: 'number' },
                      filename: { type: 'string' },
                      extractedIdentifier: { type: ['string', 'null'] },
                      status: {
                        type: 'string',
                        enum: ['active', 'pending', 'expired', 'unknown']
                      },
                      technologyArea: { type: ['string', 'null'] },
                      priority: {
                        type: 'string',
                        enum: ['critical', 'standard', 'background']
                      },
                      notes: { type: 'string' }
                    },
                    required: ['assetType', 'documentIndex', 'filename',
                               'extractedIdentifier', 'status',
                               'technologyArea', 'priority', 'notes'],
                    additionalProperties: false
                  }
                }
              },
              required: ['classifications'],
              additionalProperties: false
            }
          }
        }
      });

      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '{}';
      const parsed = JSON.parse(text) as { classifications: ClassifiedAsset[] };
      return parsed.classifications;
    })
  );

  // Aggregate successful batch results
  return batchResults
    .filter((r): r is PromiseFulfilledResult<ClassifiedAsset[]> =>
      r.status === 'fulfilled')
    .flatMap(r => r.value);
}
```


The intake round also performs a critical validation step: reconciling
the classified assets against known identifiers. If the client provided
a list of 47 patent numbers but the pipeline only found 43 in the
documents, the four missing patents need to be flagged immediately.
Missing assets in a due diligence context can be as significant as
problematic assets.


> **Warning**
>
> Never assume the portfolio documentation is complete. In acquisition
> contexts, it is common for the data room to be missing patent
> assignment documents, to include expired patents mixed in with active
> ones, or to omit foreign counterparts entirely. The intake round must
> produce a reconciliation report that flags discrepancies between what
> was expected and what was found. Missing documents are findings, not
> oversights.


\newpage


## Round 2: Patent Claim Scope Analysis


Claim scope analysis is the foundation of all patent analytics. Everything
downstream, prior art evaluation, infringement analysis, valuation, and
licensing potential, depends on correctly understanding what each patent
claim actually covers. A patent's value is not in its specification
(the description of the invention). It is in its claims (the legal
boundaries of the monopoly). Two patents with identical specifications
but different claim language can have wildly different commercial value
because one has broad independent claims covering an entire product
category while the other has narrow claims limited to a specific
implementation.


### Parsing Patent Claims


A patent claim has three structural components that determine its scope.
The **preamble** introduces the subject matter ("A method for processing
natural language queries"). The **transitional phrase** determines whether
the claim is open or closed. The **body** recites the specific elements
and limitations that define the claimed invention.


The transitional phrase is the single most important structural element
for scope determination:


- **"comprising"** is open-ended. A claim that recites elements A, B,
  and C is infringed by a product with elements A, B, C, and D. Additional
  elements do not avoid infringement. This is the broadest claim scope.

- **"consisting of"** is closed. A claim that recites elements A, B,
  and C is *not* infringed by a product with elements A, B, C, and D.
  The additional element avoids infringement. This is the narrowest claim
  scope.

- **"consisting essentially of"** is partially open. Additional elements
  are permitted only if they do not materially affect the basic and novel
  characteristics of the claimed invention. This is an intermediate scope
  that generates significant litigation.


```typescript
// claims-analyst-diplomat.ts
// Parse patent claims into structural components and build dependency tree
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface ClaimsAnalysisInput {
  patent: Patent;
  specificationText: string;
  fileWrapperSummary?: string;
}

async function analyzePatentClaims(
  input: ClaimsAnalysisInput
): Promise<ClaimScopeAnalysis> {
  const prompt = [
    'You are a patent claims analyst with expertise in claim construction.',
    'Analyze the following patent claims with precision.',
    '',
    '## Instructions',
    '',
    '1. For each claim, identify:',
    '   - The preamble (subject matter introduction)',
    '   - The transitional phrase (comprising, consisting of, etc.)',
    '   - Each body element as a discrete limitation',
    '   - Whether the claim is independent or dependent',
    '   - For dependent claims, which claim it depends on',
    '',
    '2. Build a complete claim dependency tree.',
    '',
    '3. Identify the broadest independent claim by assessing:',
    '   - Fewest limitations = broader scope',
    '   - Open transitional phrases = broader scope',
    '   - Functional language (means-for) vs. structural language',
    '',
    '4. Flag vulnerabilities:',
    '   - Claims that may be indefinite under 35 U.S.C. 112(b)',
    '   - Claims that invoke means-plus-function (112(f)) without',
    '     clear corresponding structure in the specification',
    '   - Claims that may lack written description support',
    '   - Claims potentially subject to Alice/Mayo eligibility challenges',
    '',
    '## Patent Information',
    `Patent Number: ${input.patent.patentNumber}`,
    `Title: ${input.patent.title}`,
    `Filing Date: ${input.patent.filingDate}`,
    '',
    '## Claims',
    ...input.patent.claims.map(c =>
      `Claim ${c.claimNumber}: ${c.fullText}`
    ),
    '',
    '## Specification (for claim construction reference)',
    input.specificationText.slice(0, 50000),
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32_768,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  const { input_tokens, output_tokens } = response.usage;

  // Parse the structured analysis from the response
  const analysis = extractClaimAnalysis(text, input.patent.claims);
  return analysis;
}

function extractClaimAnalysis(
  responseText: string,
  originalClaims: PatentClaim[]
): ClaimScopeAnalysis {
  // Build the dependency tree from claim references
  const claimTree: ClaimDependencyNode[] = originalClaims.map(claim => ({
    claimNumber: claim.claimNumber,
    dependsOn: claim.dependsOn,
    children: originalClaims
      .filter(c => c.dependsOn === claim.claimNumber)
      .map(c => c.claimNumber),
    scopeNarrowing: claim.claimType === 'dependent'
      ? `Narrows claim ${claim.dependsOn} with additional limitations`
      : null
  }));

  // Identify the broadest independent claim
  const independentClaims = originalClaims.filter(
    c => c.claimType === 'independent'
  );

  // Broadest = fewest body elements + open transitional phrase
  const broadest = independentClaims.reduce((prev, curr) => {
    const prevScore = prev.bodyElements.length
      + (prev.transitionalPhrase === 'comprising' ? 0 : 2);
    const currScore = curr.bodyElements.length
      + (curr.transitionalPhrase === 'comprising' ? 0 : 2);
    return currScore < prevScore ? curr : prev;
  });

  return {
    broadestIndependentClaim: broadest.claimNumber,
    claimTree,
    scopeAssessment: assessOverallScope(independentClaims),
    keyLimitations: extractKeyLimitations(responseText),
    vulnerabilities: extractVulnerabilities(responseText),
  };
}

function assessOverallScope(
  independentClaims: PatentClaim[]
): 'broad' | 'moderate' | 'narrow' {
  const avgElements = independentClaims.reduce(
    (sum, c) => sum + c.bodyElements.length, 0
  ) / independentClaims.length;

  const hasOpenTransition = independentClaims.some(
    c => c.transitionalPhrase === 'comprising'
  );

  if (avgElements <= 4 && hasOpenTransition) return 'broad';
  if (avgElements >= 8 || !hasOpenTransition) return 'narrow';
  return 'moderate';
}

function extractKeyLimitations(responseText: string): string[] {
  // Extract identified key limitations from the AI analysis
  const limitations: string[] = [];
  const lines = responseText.split('\n');
  let inLimitationsSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('key limitation')) {
      inLimitationsSection = true;
      continue;
    }
    if (inLimitationsSection && line.startsWith('-')) {
      limitations.push(line.replace(/^-\s*/, '').trim());
    }
    if (inLimitationsSection && line.trim() === '' && limitations.length > 0) {
      break;
    }
  }

  return limitations;
}

function extractVulnerabilities(responseText: string): string[] {
  const vulnerabilities: string[] = [];
  const lines = responseText.split('\n');
  let inVulnSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('vulnerabilit')) {
      inVulnSection = true;
      continue;
    }
    if (inVulnSection && line.startsWith('-')) {
      vulnerabilities.push(line.replace(/^-\s*/, '').trim());
    }
    if (inVulnSection && line.trim() === '' && vulnerabilities.length > 0) {
      break;
    }
  }

  return vulnerabilities;
}
```


### The Claim Dependency Tree


Patent claims form a tree structure. Independent claims are the roots.
Dependent claims are branches that add limitations to narrow the scope.
Understanding this tree is essential because it determines fallback
positions. If Claim 1 (independent, broad) is invalidated by prior art,
Claim 3 (dependent on Claim 1, adding a specific algorithm limitation)
may survive because the additional limitation distinguishes it from the
prior art. A portfolio with deep dependency chains has stronger defensive
depth than one with only independent claims.


```svg
<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: 'Segoe UI', system-ui, sans-serif; }
  </style>

  <!-- Title -->
  <text x="400" y="25" text-anchor="middle" font-size="15"
        font-weight="bold" fill="#1a1a2e">
    Figure 18.2: Patent Claim Dependency Tree
  </text>
  <text x="400" y="45" text-anchor="middle" font-size="11" fill="#666">
    U.S. Patent No. 11,234,567 — Natural Language Processing System
  </text>

  <!-- Independent Claim 1 (method) -->
  <rect x="30" y="70" width="220" height="55" rx="8" fill="#1a1a2e"/>
  <text x="140" y="92" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Claim 1 (Independent)</text>
  <text x="140" y="108" text-anchor="middle" font-size="9" fill="#16a085">
    Method — comprising — 4 elements</text>
  <text x="140" y="120" text-anchor="middle" font-size="8" fill="#ccc">
    BROADEST SCOPE</text>

  <!-- Dependent Claims off Claim 1 -->
  <rect x="30" y="155" width="100" height="45" rx="6" fill="#1a1a2e"/>
  <text x="80" y="175" text-anchor="middle" font-size="10" fill="white">
    Claim 2</text>
  <text x="80" y="190" text-anchor="middle" font-size="8" fill="#16a085">
    +transformer</text>

  <rect x="150" y="155" width="100" height="45" rx="6" fill="#1a1a2e"/>
  <text x="200" y="175" text-anchor="middle" font-size="10" fill="white">
    Claim 3</text>
  <text x="200" y="190" text-anchor="middle" font-size="8" fill="#16a085">
    +attention</text>

  <!-- Claim 4 depends on Claim 2 -->
  <rect x="10" y="235" width="100" height="45" rx="6" fill="#1a1a2e"/>
  <text x="60" y="255" text-anchor="middle" font-size="10" fill="white">
    Claim 4</text>
  <text x="60" y="270" text-anchor="middle" font-size="8" fill="#16a085">
    +BERT model</text>

  <!-- Claim 5 depends on Claim 3 -->
  <rect x="150" y="235" width="100" height="45" rx="6" fill="#1a1a2e"/>
  <text x="200" y="255" text-anchor="middle" font-size="10" fill="white">
    Claim 5</text>
  <text x="200" y="270" text-anchor="middle" font-size="8" fill="#16a085">
    +512 tokens</text>

  <!-- Claim lines Claim 1 → children -->
  <line x1="100" y1="125" x2="80" y2="155"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="180" y1="125" x2="200" y2="155"
        stroke="#16a085" stroke-width="1.5"/>
  <!-- Claim 2 → Claim 4 -->
  <line x1="80" y1="200" x2="60" y2="235"
        stroke="#16a085" stroke-width="1.5"/>
  <!-- Claim 3 → Claim 5 -->
  <line x1="200" y1="200" x2="200" y2="235"
        stroke="#16a085" stroke-width="1.5"/>

  <!-- Independent Claim 6 (system) -->
  <rect x="310" y="70" width="220" height="55" rx="8" fill="#1a1a2e"/>
  <text x="420" y="92" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Claim 6 (Independent)</text>
  <text x="420" y="108" text-anchor="middle" font-size="9" fill="#16a085">
    System — comprising — 5 elements</text>
  <text x="420" y="120" text-anchor="middle" font-size="8" fill="#ccc">
    MODERATE SCOPE</text>

  <!-- Dependent Claims off Claim 6 -->
  <rect x="310" y="155" width="100" height="45" rx="6" fill="#1a1a2e"/>
  <text x="360" y="175" text-anchor="middle" font-size="10" fill="white">
    Claim 7</text>
  <text x="360" y="190" text-anchor="middle" font-size="8" fill="#16a085">
    +GPU cluster</text>

  <rect x="430" y="155" width="100" height="45" rx="6" fill="#1a1a2e"/>
  <text x="480" y="175" text-anchor="middle" font-size="10" fill="white">
    Claim 8</text>
  <text x="480" y="190" text-anchor="middle" font-size="8" fill="#16a085">
    +distributed</text>

  <!-- Claim lines Claim 6 → children -->
  <line x1="380" y1="125" x2="360" y2="155"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="460" y1="125" x2="480" y2="155"
        stroke="#16a085" stroke-width="1.5"/>

  <!-- Independent Claim 9 (CRM) -->
  <rect x="580" y="70" width="200" height="55" rx="8" fill="#1a1a2e"/>
  <text x="680" y="92" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Claim 9 (Independent)</text>
  <text x="680" y="108" text-anchor="middle" font-size="9" fill="#16a085">
    CRM — consisting of — 7 elements</text>
  <text x="680" y="120" text-anchor="middle" font-size="8" fill="#e74c3c">
    NARROW SCOPE</text>

  <!-- Dependent Claims off Claim 9 -->
  <rect x="580" y="155" width="100" height="45" rx="6" fill="#1a1a2e"/>
  <text x="630" y="175" text-anchor="middle" font-size="10" fill="white">
    Claim 10</text>
  <text x="630" y="190" text-anchor="middle" font-size="8" fill="#16a085">
    +cloud API</text>

  <rect x="695" y="155" width="85" height="45" rx="6" fill="#1a1a2e"/>
  <text x="737" y="175" text-anchor="middle" font-size="10" fill="white">
    Claim 11</text>
  <text x="737" y="190" text-anchor="middle" font-size="8" fill="#16a085">
    +OAuth</text>

  <!-- Claim lines Claim 9 → children -->
  <line x1="650" y1="125" x2="630" y2="155"
        stroke="#16a085" stroke-width="1.5"/>
  <line x1="710" y1="125" x2="737" y2="155"
        stroke="#16a085" stroke-width="1.5"/>

  <!-- Annotations -->
  <rect x="30" y="310" width="750" height="130" rx="8"
        fill="#f8f8f8" stroke="#1a1a2e" stroke-width="1"/>
  <text x="50" y="335" font-size="11" font-weight="bold" fill="#1a1a2e">
    Scope Analysis Summary</text>
  <text x="50" y="358" font-size="10" fill="#1a1a2e">
    Claim 1: Broadest — method claim with "comprising" and only 4 elements.
    Primary assertion vehicle.
  </text>
  <text x="50" y="376" font-size="10" fill="#1a1a2e">
    Claim 6: Moderate — system claim adds hardware elements.
    Useful for device-level infringement.
  </text>
  <text x="50" y="394" font-size="10" fill="#e74c3c">
    Claim 9: Narrow — "consisting of" closes the claim.
    7 elements significantly limits infringement scope.
  </text>
  <text x="50" y="418" font-size="10" fill="#1a1a2e">
    Defensive Depth: Claims 2-5 provide fallback if Claim 1 is invalidated.
    Claim 4 (+BERT) is most specific.
  </text>
</svg>
```


The claim tree reveals strategic information that raw claim text obscures.
In this example, Claim 1 is the broadest assertion vehicle, but if prior
art invalidates it, the dependency chain through Claims 2 and 4 provides
increasingly specific fallback positions. Claim 9, despite being
independent, has limited commercial value because its closed transitional
phrase and seven elements make it easy to design around. A portfolio
valuation that treats all independent claims as equal would miss this
entirely.


> **Insight**
>
> Dependent claims are not afterthoughts. They are strategic fallback
> positions. A well-drafted patent has a claim tree that narrows
> progressively: the broadest independent claim captures the most
> products, and each level of dependency adds specificity that survives
> increasingly aggressive prior art challenges. When evaluating a
> portfolio, the depth and coverage of claim dependency chains matters
> as much as the breadth of the independent claims.


\newpage


## Round 3: Prior Art Research Agents


Prior art research is inherently a parallel search problem. The relevant
prior art for any given patent might exist in the USPTO database, the
European Patent Office, WIPO's PCT publications, Google Patents, academic
journals, standards body publications, or commercial product
documentation. No single database is comprehensive. A thorough prior art
search must cast a wide net across multiple sources and then synthesize
the results into a unified assessment.


This is a textbook fan-out/fan-in pattern. Multiple research agents
search different databases simultaneously, each with prompts tuned to
the search conventions and result formats of their target database.
A synthesis agent then combines the findings, eliminates duplicates,
and produces a consolidated prior art landscape for each patent.


```typescript
// prior-art-research-agents.ts
// Round 3: Parallel prior art research across multiple databases
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

type SearchSource = 'USPTO' | 'EPO' | 'WIPO' | 'GooglePatents'
  | 'Academic' | 'Standards';

interface PriorArtSearchConfig {
  source: SearchSource;
  systemPrompt: string;
  searchInstructions: string;
}

// Each research agent has source-specific expertise
const RESEARCH_AGENTS: PriorArtSearchConfig[] = [
  {
    source: 'USPTO',
    systemPrompt: [
      'You are a USPTO prior art search specialist.',
      'You have expertise in CPC classification codes,',
      'full-text patent search strategies, and the',
      'distinction between pre-AIA (102(a)/(b)/(e)/(g))',
      'and post-AIA (102(a)(1)/(a)(2)) prior art categories.',
    ].join(' '),
    searchInstructions: [
      'Search the USPTO patent database (PatFT and AppFT).',
      'Use CPC classification codes to narrow the technology field.',
      'Search both granted patents and published applications.',
      'Include continuation and divisional applications in the same family.',
      'Note the effective filing date of each reference for prior art qualification.',
    ].join(' '),
  },
  {
    source: 'EPO',
    systemPrompt: [
      'You are a European Patent Office prior art search specialist.',
      'You have expertise in Espacenet search, IPC classification,',
      'and the EPO\'s approach to novelty and inventive step',
      'assessment under Articles 54 and 56 EPC.',
    ].join(' '),
    searchInstructions: [
      'Search the EPO Espacenet database for relevant prior art.',
      'Use IPC classification codes for systematic searching.',
      'Include EP applications, granted patents, and search opinions.',
      'Note any relevant opposition decisions that may affect validity.',
      'Consider the EPO problem-solution approach for obviousness analysis.',
    ].join(' '),
  },
  {
    source: 'WIPO',
    systemPrompt: [
      'You are a WIPO PCT prior art specialist.',
      'You have expertise in international patent search,',
      'ISR (International Search Report) analysis, and IPRP',
      '(International Preliminary Report on Patentability) assessment.',
    ].join(' '),
    searchInstructions: [
      'Search WIPO PATENTSCOPE for PCT applications and ISRs.',
      'Identify international patent families that may constitute prior art.',
      'Note any X or Y references from International Search Reports.',
      'Include patent families with members in multiple jurisdictions.',
      'Assess whether WO publications qualify as prior art under 102(a)(2).',
    ].join(' '),
  },
  {
    source: 'GooglePatents',
    systemPrompt: [
      'You are a patent search specialist using Google Patents.',
      'You have expertise in semantic search, citation analysis,',
      'and identifying non-patent prior art such as technical',
      'standards, product manuals, and open-source documentation.',
    ].join(' '),
    searchInstructions: [
      'Use semantic search in Google Patents to find prior art that',
      'keyword-based searches in official databases might miss.',
      'Analyze forward and backward citation trees for related art.',
      'Include non-patent literature (NPL) results: conference papers,',
      'technical standards, product documentation, open-source repos.',
      'Cast a wider net than official database searches.',
    ].join(' '),
  },
  {
    source: 'Academic',
    systemPrompt: [
      'You are an academic literature prior art specialist.',
      'You have expertise in identifying scholarly publications,',
      'conference proceedings, and technical reports that constitute',
      'prior art under 35 U.S.C. 102(a)(1) as printed publications.',
    ].join(' '),
    searchInstructions: [
      'Search academic databases (IEEE, ACM, arXiv, SSRN, PubMed)',
      'for publications predating the patent filing date.',
      'Focus on conference papers and journal articles that disclose',
      'the claimed subject matter.',
      'Note that preprints (e.g., arXiv) qualify as prior art from',
      'their public posting date, not their journal publication date.',
      'Include doctoral theses and technical reports.',
    ].join(' '),
  },
  {
    source: 'Standards',
    systemPrompt: [
      'You are a standards-essential patent (SEP) analyst.',
      'You have expertise in identifying whether patent claims',
      'read on industry standards (IEEE, IETF, 3GPP, W3C, etc.)',
      'and the implications of FRAND licensing obligations.',
    ].join(' '),
    searchInstructions: [
      'Search for industry standards that may be relevant to the claims.',
      'Determine whether the patent is standards-essential (SEP).',
      'If SEP, identify the standard and the relevant sections.',
      'Assess FRAND licensing obligations and their impact on valuation.',
      'Note any letters of assurance or licensing declarations.',
    ].join(' '),
  },
];

async function searchPriorArt(
  patent: Patent,
  claimsAnalysis: ClaimScopeAnalysis
): Promise<PriorArtReference[]> {
  // Build the search context from the patent and claims analysis
  const searchContext = [
    `Patent: ${patent.patentNumber} — ${patent.title}`,
    `Filing Date: ${patent.filingDate}`,
    `Technology Area: ${patent.technologyArea}`,
    '',
    'Key Independent Claims:',
    ...patent.claims
      .filter(c => c.claimType === 'independent')
      .map(c => `  Claim ${c.claimNumber}: ${c.fullText.slice(0, 500)}`),
    '',
    'Key Limitations to Search Against:',
    ...claimsAnalysis.keyLimitations.map(l => `  - ${l}`),
  ].join('\n');

  // Fan-out: launch all research agents in parallel
  const searchResults = await Promise.allSettled(
    RESEARCH_AGENTS.map(async (agent) => {
      const prompt = [
        agent.searchInstructions,
        '',
        '## Patent Under Investigation',
        searchContext,
        '',
        '## Your Task',
        'Identify prior art references from your assigned database that',
        'could anticipate (single reference) or render obvious (in combination)',
        'the claims of this patent.',
        '',
        'For each reference found, provide:',
        '1. Full citation (number, title, date, authors/inventors)',
        '2. Which claims it is relevant to',
        '3. Which specific limitations it discloses',
        '4. Whether it anticipates or merely contributes to obviousness',
        '5. The strength of the reference (strong, moderate, weak)',
      ].join('\n');

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 32_768,
        system: agent.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';
      const { input_tokens, output_tokens } = response.usage;

      return {
        source: agent.source,
        rawResults: text,
        tokens: { input_tokens, output_tokens },
      };
    })
  );

  // Collect successful results
  const successfulSearches = searchResults
    .filter((r): r is PromiseFulfilledResult<{
      source: SearchSource;
      rawResults: string;
      tokens: { input_tokens: number; output_tokens: number };
    }> => r.status === 'fulfilled')
    .map(r => r.value);

  // Fan-in: synthesize all search results into unified prior art landscape
  const synthesized = await synthesizePriorArt(
    patent, successfulSearches
  );

  return synthesized;
}

async function synthesizePriorArt(
  patent: Patent,
  searchResults: Array<{
    source: SearchSource;
    rawResults: string;
    tokens: { input_tokens: number; output_tokens: number };
  }>
): Promise<PriorArtReference[]> {
  const synthesisPrompt = [
    'You are a senior patent analyst synthesizing prior art search results',
    'from multiple databases into a unified assessment.',
    '',
    `Patent: ${patent.patentNumber} — ${patent.title}`,
    '',
    '## Search Results by Source',
    ...searchResults.map(r => [
      `### ${r.source}`,
      r.rawResults,
      ''
    ].join('\n')),
    '',
    '## Your Task',
    '1. Deduplicate references that appear across multiple databases.',
    '2. Rank references by relevance and strength.',
    '3. For the strongest references, create detailed limitation-by-limitation',
    '   mappings against the independent claims.',
    '4. Identify the single best anticipation reference (if any).',
    '5. Identify the strongest obviousness combination (if any).',
    '6. Assess the overall validity risk: strong, moderate, or weak prior art position.',
    '',
    'Return a structured JSON array of PriorArtReference objects.',
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32_768,
    messages: [{ role: 'user', content: synthesisPrompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '[]';

  // Extract the JSON array from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]) as PriorArtReference[];
  } catch {
    // If JSON parsing fails, return empty — the raw results are logged
    return [];
  }
}
```


```svg
<svg viewBox="0 0 850 400" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: 'Segoe UI', system-ui, sans-serif; }
  </style>
  <defs>
    <marker id="arrowTeal" markerWidth="10" markerHeight="7"
            refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="425" y="25" text-anchor="middle" font-size="15"
        font-weight="bold" fill="#1a1a2e">
    Figure 18.3: Prior Art Research — Fan-Out / Fan-In Architecture
  </text>

  <!-- Input: Patent Claims -->
  <rect x="340" y="50" width="170" height="45" rx="8" fill="#1a1a2e"/>
  <text x="425" y="70" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">Patent Claims Analysis</text>
  <text x="425" y="85" text-anchor="middle" font-size="9" fill="#16a085">
    Key limitations to search</text>

  <!-- Fan-out arrows -->
  <line x1="355" y1="95" x2="80" y2="140"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="385" y1="95" x2="230" y2="140"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="425" y1="95" x2="380" y2="140"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="465" y1="95" x2="530" y2="140"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="490" y1="95" x2="630" y2="140"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="505" y1="95" x2="765" y2="140"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>

  <!-- Research Agents (6 parallel) -->
  <rect x="20" y="145" width="115" height="60" rx="6" fill="#1a1a2e"/>
  <text x="77" y="170" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">USPTO</text>
  <text x="77" y="185" text-anchor="middle" font-size="8" fill="#16a085">
    CPC codes + full text</text>
  <text x="77" y="197" text-anchor="middle" font-size="8" fill="#ccc">
    PatFT + AppFT</text>

  <rect x="165" y="145" width="115" height="60" rx="6" fill="#1a1a2e"/>
  <text x="222" y="170" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">EPO</text>
  <text x="222" y="185" text-anchor="middle" font-size="8" fill="#16a085">
    IPC codes + Espacenet</text>
  <text x="222" y="197" text-anchor="middle" font-size="8" fill="#ccc">
    Art 54/56 framework</text>

  <rect x="310" y="145" width="115" height="60" rx="6" fill="#1a1a2e"/>
  <text x="367" y="170" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">WIPO</text>
  <text x="367" y="185" text-anchor="middle" font-size="8" fill="#16a085">
    PCT + PATENTSCOPE</text>
  <text x="367" y="197" text-anchor="middle" font-size="8" fill="#ccc">
    ISR X/Y references</text>

  <rect x="465" y="145" width="115" height="60" rx="6" fill="#1a1a2e"/>
  <text x="522" y="170" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">Google Patents</text>
  <text x="522" y="185" text-anchor="middle" font-size="8" fill="#16a085">
    Semantic + citations</text>
  <text x="522" y="197" text-anchor="middle" font-size="8" fill="#ccc">
    NPL included</text>

  <rect x="610" y="145" width="115" height="60" rx="6" fill="#1a1a2e"/>
  <text x="667" y="170" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">Academic</text>
  <text x="667" y="185" text-anchor="middle" font-size="8" fill="#16a085">
    IEEE, ACM, arXiv</text>
  <text x="667" y="197" text-anchor="middle" font-size="8" fill="#ccc">
    Printed publications</text>

  <rect x="740" y="145" width="95" height="60" rx="6" fill="#1a1a2e"/>
  <text x="787" y="170" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">Standards</text>
  <text x="787" y="185" text-anchor="middle" font-size="8" fill="#16a085">
    SEP analysis</text>
  <text x="787" y="197" text-anchor="middle" font-size="8" fill="#ccc">
    FRAND obligations</text>

  <!-- Parallel execution indicator -->
  <text x="425" y="233" text-anchor="middle" font-size="10"
        font-weight="bold" fill="#f39c12">
    ⟦ All 6 agents execute simultaneously via Promise.allSettled() ⟧
  </text>

  <!-- Fan-in arrows -->
  <line x1="77" y1="205" x2="345" y2="265"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="222" y1="205" x2="375" y2="265"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="367" y1="205" x2="405" y2="265"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="522" y1="205" x2="445" y2="265"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="667" y1="205" x2="475" y2="265"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>
  <line x1="787" y1="205" x2="505" y2="265"
        stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTeal)"/>

  <!-- Synthesis Agent -->
  <rect x="315" y="270" width="220" height="50" rx="8" fill="#16a085"/>
  <text x="425" y="292" text-anchor="middle" font-size="11"
        font-weight="bold" fill="white">Prior Art Synthesis Agent</text>
  <text x="425" y="308" text-anchor="middle" font-size="9" fill="white">
    Dedup — Rank — Map Limitations</text>

  <!-- Output arrow -->
  <line x1="425" y1="320" x2="425" y2="350"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal)"/>

  <!-- Output -->
  <rect x="300" y="355" width="250" height="35" rx="6" fill="#1a1a2e"/>
  <text x="425" y="377" text-anchor="middle" font-size="10"
        font-weight="bold" fill="white">
    Unified Prior Art Landscape</text>
</svg>
```


The six-agent architecture for prior art research is not arbitrary.
Each database has different search conventions, different data formats,
and different strengths. The USPTO agent knows CPC classification codes.
The EPO agent understands the European problem-solution approach to
obviousness. The academic agent knows that an arXiv preprint qualifies
as prior art from its posting date, not its later journal publication
date. Encoding this specialization into separate agents produces higher
quality results than a single agent attempting to search everywhere at
once.


> **Practice Tip**
>
> In production, the prior art research agents should be connected to
> actual patent database APIs (USPTO PatentsView, EPO OPS, WIPO
> PATENTSCOPE) rather than relying solely on the AI model's training
> data. The agents' prompts should include instructions for formulating
> API queries, and the responses should include actual database results
> that the AI then analyzes. The AI's role is analysis and synthesis,
> not database retrieval. Use the right tool for each job: APIs for
> data retrieval, AI for data analysis.


\newpage


## Round 4: Market and Valuation Analysis


With claims parsed and prior art assessed, the pipeline has the
technical foundation to answer the commercial question: What is this
IP worth? Patent valuation is not a precise science. It requires
combining technical assessment (claim scope, validity strength) with
market intelligence (products in the claim scope, licensing
comparables, industry trends) and strategic factors (remaining patent
life, competitive positioning, enforcement history).


The valuation round runs three parallel analysis tracks for each
patent and then synthesizes them into a per-patent and portfolio-level
valuation.


### Licensing Potential Analysis


The licensing analyst evaluates whether each patent is a viable
licensing asset. A patent with broad claims covering products that
multiple companies sell has high licensing potential. A patent with
narrow claims covering a niche product that only the patent owner
sells has low licensing potential (but may have high defensive value).


```typescript
// licensing-analyst-diplomat.ts
// Assess licensing potential for individual patents
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface LicensingAnalysisInput {
  patent: Patent;
  claimsAnalysis: ClaimScopeAnalysis;
  priorArtFindings: PriorArtReference[];
  marketContext: {
    industrySegment: string;
    knownCompetitors: string[];
    marketSizeEstimate: string;
  };
}

async function analyzeLicensingPotential(
  input: LicensingAnalysisInput
): Promise<{
  licensingScore: 'high' | 'medium' | 'low';
  potentialLicensees: string[];
  estimatedRoyaltyRange: { low: number; high: number };
  georgePacificFactors: GeorgiaPacificAnalysis;
  recommendation: string;
}> {
  const prompt = [
    'You are a patent licensing valuation specialist.',
    'Assess the licensing potential of this patent using the',
    'Georgia-Pacific reasonable royalty framework.',
    '',
    '## Georgia-Pacific Analysis Required',
    'Analyze each of the 15 Georgia-Pacific factors:',
    '1. Royalties received for licensing the patent in suit',
    '2. Rates paid by licensee for comparable patents',
    '3. Nature and scope of the license (exclusive vs. non-exclusive)',
    '4. Licensor\'s policy of maintaining monopoly vs. licensing',
    '5. Commercial relationship between licensor and licensee',
    '6. Effect of selling patented specialty on sales of other products',
    '7. Duration of patent and term of license',
    '8. Established profitability of patented product',
    '9. Utility and advantages of patented over old methods',
    '10. Nature of the patented invention and its commercial embodiment',
    '11. Extent to which the infringer used the invention',
    '12. Customary profit or selling price for the invention',
    '13. Apportioned profit attributable to the invention',
    '14. Opinion testimony of qualified experts',
    '15. Amount a willing licensor and licensee would have agreed upon',
    '',
    '## Patent Information',
    `Patent: ${input.patent.patentNumber} — ${input.patent.title}`,
    `Claims Scope: ${input.claimsAnalysis.scopeAssessment}`,
    `Broadest Claim: ${input.claimsAnalysis.broadestIndependentClaim}`,
    `Prior Art Risk: ${input.priorArtFindings.length} references found`,
    `Strong References: ${input.priorArtFindings.filter(
      r => r.relevance === 'anticipating'
    ).length}`,
    '',
    '## Market Context',
    `Industry: ${input.marketContext.industrySegment}`,
    `Known Competitors: ${input.marketContext.knownCompetitors.join(', ')}`,
    `Market Size: ${input.marketContext.marketSizeEstimate}`,
    '',
    '## Key Limitations',
    ...input.claimsAnalysis.keyLimitations.map(l => `- ${l}`),
    '',
    '## Vulnerabilities',
    ...input.claimsAnalysis.vulnerabilities.map(v => `- ${v}`),
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32_768,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  const { input_tokens, output_tokens } = response.usage;

  // Extract structured licensing assessment from the analysis
  return parseLicensingAnalysis(text);
}

interface GeorgiaPacificAnalysis {
  factorScores: Array<{
    factorNumber: number;
    factorName: string;
    assessment: string;
    impact: 'increases_royalty' | 'decreases_royalty' | 'neutral';
  }>;
  overallDirection: 'favors_high_royalty' | 'favors_low_royalty' | 'mixed';
}

function parseLicensingAnalysis(text: string): {
  licensingScore: 'high' | 'medium' | 'low';
  potentialLicensees: string[];
  estimatedRoyaltyRange: { low: number; high: number };
  georgePacificFactors: GeorgiaPacificAnalysis;
  recommendation: string;
} {
  // Parse the AI's structured analysis
  // In production, this would use structured outputs
  // For illustration, we extract from the narrative
  const hasHighPotential = text.toLowerCase().includes('high licensing potential')
    || text.toLowerCase().includes('strong licensing');
  const hasLowPotential = text.toLowerCase().includes('low licensing potential')
    || text.toLowerCase().includes('limited licensing');

  return {
    licensingScore: hasHighPotential ? 'high' : hasLowPotential ? 'low' : 'medium',
    potentialLicensees: extractListItems(text, 'potential licensee'),
    estimatedRoyaltyRange: extractRoyaltyRange(text),
    georgePacificFactors: extractGeorgiaPacificAnalysis(text),
    recommendation: extractSection(text, 'recommendation'),
  };
}

function extractListItems(text: string, keyword: string): string[] {
  const items: string[] = [];
  const lines = text.split('\n');
  let inSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes(keyword)) {
      inSection = true;
      continue;
    }
    if (inSection && line.match(/^[-•*]\s/)) {
      items.push(line.replace(/^[-•*]\s*/, '').trim());
    }
    if (inSection && line.trim() === '' && items.length > 0) break;
  }

  return items;
}

function extractRoyaltyRange(
  text: string
): { low: number; high: number } {
  const percentMatch = text.match(
    /(\d+(?:\.\d+)?)\s*%?\s*(?:to|[-–])\s*(\d+(?:\.\d+)?)\s*%/
  );
  if (percentMatch) {
    return {
      low: parseFloat(percentMatch[1]),
      high: parseFloat(percentMatch[2])
    };
  }
  return { low: 0, high: 0 };
}

function extractGeorgiaPacificAnalysis(text: string): GeorgiaPacificAnalysis {
  // Simplified extraction — production would use structured outputs
  return {
    factorScores: [],
    overallDirection: 'mixed'
  };
}

function extractSection(text: string, sectionName: string): string {
  const lines = text.split('\n');
  let capturing = false;
  const captured: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().includes(sectionName.toLowerCase())
        && line.match(/^#+\s/)) {
      capturing = true;
      continue;
    }
    if (capturing && line.match(/^#+\s/) && captured.length > 0) break;
    if (capturing) captured.push(line);
  }

  return captured.join('\n').trim();
}
```


### Freedom-to-Operate Analysis


A freedom-to-operate (FTO) analysis is the inverse of infringement
analysis. Instead of asking "Does a third party's product infringe
our patent?" it asks "Does our product infringe a third party's
patent?" This is critical in acquisition contexts: if the target
company's core product infringes a competitor's patent, the
acquisition brings an infringement liability, not just an asset.


The FTO analyst examines the target's products against relevant
third-party patents and identifies potential infringement risks. This
requires claim construction of the *third-party* patents (not the
target's own patents), which is why it runs as a separate analysis
track in Round 4 rather than being bundled with the Round 2 claim
analysis of the target's own portfolio.


```typescript
// fto-analyst-diplomat.ts
// Freedom-to-operate analysis for target products
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface FTOAnalysisInput {
  targetProducts: Array<{
    productName: string;
    productDescription: string;
    technologyComponents: string[];
  }>;
  relevantThirdPartyPatents: Patent[];
  targetMarkets: string[];
}

interface FTORisk {
  thirdPartyPatent: string;
  patentHolder: string;
  riskLevel: 'high' | 'medium' | 'low';
  affectedProduct: string;
  claimsAtIssue: number[];
  infringementTheory: string;
  designAroundPossibility: 'feasible' | 'difficult' | 'impractical';
  licensingOption: string;
  estimatedExposure: string;
}

async function analyzeFreedomToOperate(
  input: FTOAnalysisInput
): Promise<FTORisk[]> {
  // Analyze each product against all relevant third-party patents
  const productResults = await Promise.allSettled(
    input.targetProducts.map(async (product) => {
      const prompt = [
        'You are a patent infringement analyst performing a',
        'freedom-to-operate analysis.',
        '',
        '## Product Under Analysis',
        `Product: ${product.productName}`,
        `Description: ${product.productDescription}`,
        `Technology Components: ${product.technologyComponents.join(', ')}`,
        '',
        '## Relevant Third-Party Patents',
        ...input.relevantThirdPartyPatents.map(p => [
          `### ${p.patentNumber} — ${p.title}`,
          `Assignee: ${p.assignee}`,
          `Status: ${p.status}`,
          'Claims:',
          ...p.claims.filter(c => c.claimType === 'independent')
            .map(c => `  Claim ${c.claimNumber}: ${c.fullText.slice(0, 300)}`),
          ''
        ].join('\n')),
        '',
        '## Instructions',
        'For each third-party patent, assess whether the product potentially',
        'infringes any claims. Consider:',
        '1. Literal infringement (product meets every claim element)',
        '2. Doctrine of equivalents (product performs substantially same',
        '   function in substantially same way for substantially same result)',
        '3. Design-around feasibility',
        '4. Licensing availability and likely terms',
        '5. Estimated financial exposure if infringement is found',
      ].join('\n');

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 32_768,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';

      return parseFTOResults(text, product.productName);
    })
  );

  return productResults
    .filter((r): r is PromiseFulfilledResult<FTORisk[]> =>
      r.status === 'fulfilled')
    .flatMap(r => r.value);
}

function parseFTOResults(
  text: string, productName: string
): FTORisk[] {
  // Parse FTO results from AI analysis
  // Production implementation would use structured outputs
  const risks: FTORisk[] = [];
  // ... parsing logic
  return risks;
}
```


> **Warning**
>
> Freedom-to-operate opinions are among the most consequential legal
> deliverables in IP law. A missed infringement risk can result in
> injunctions, treble damages (for willful infringement), and destroyed
> acquisition value. AI-generated FTO analysis should always be treated
> as a first-pass screen that identifies *candidates* for human expert
> review, never as a final opinion. The pipeline reduces the search
> space from thousands of potentially relevant patents to the dozen
> that merit deep human analysis. That reduction is enormously valuable.
> Treating it as a substitute for expert opinion is enormously dangerous.


\newpage


## Round 5: Portfolio Synthesis


The final round assembles individual patent analyses, prior art findings,
valuation assessments, trademark clearance results, and trade secret
audit findings into a portfolio-level intelligence deliverable. This is
where the pipeline produces the answer to the CEO's original question:
"What are we actually buying?"


The synthesis agent consumes all upstream outputs and produces a
`PortfolioSummary` that includes technology coverage mapping, valuation
ranges with methodology, maintenance recommendations, competitive
positioning, and strategic roadmap.


```typescript
// portfolio-synthesis-diplomat.ts
// Round 5: Synthesize all analyses into portfolio intelligence
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface SynthesisInput {
  portfolio: IPPortfolio;
  patentAnalyses: PatentAnalysisResult[];
  trademarkResults: TrademarkConflict[];
  tradeSecretFindings: TradeSecretCandidate[];
  ftoRisks: FTORisk[];
  dealContext?: DealContext;
}

async function synthesizePortfolio(
  input: SynthesisInput
): Promise<PortfolioSummary> {
  // Build a comprehensive summary of all findings
  const findingsSummary = [
    '## Patent Portfolio Analysis Summary',
    `Total Patents Analyzed: ${input.patentAnalyses.length}`,
    '',
    ...input.patentAnalyses.map(pa => [
      `### ${pa.patent.patentNumber} — ${pa.patent.title}`,
      `Status: ${pa.patent.status}`,
      `Claim Scope: ${pa.claimsAnalysis.scopeAssessment}`,
      `Broadest Claim: ${pa.claimsAnalysis.broadestIndependentClaim}`,
      `Prior Art References: ${pa.priorArtFindings.length}`,
      `Anticipating References: ${pa.priorArtFindings.filter(
        r => r.relevance === 'anticipating'
      ).length}`,
      `Technology Relevance: ${pa.valuation.technologyRelevance}`,
      `Licensing Potential: ${pa.valuation.licensingPotential}`,
      `Maintenance Recommendation: ${pa.valuation.maintenanceRecommendation}`,
      `Remaining Life: ${pa.valuation.remainingLifeYears} years`,
      '',
      'Key Vulnerabilities:',
      ...pa.claimsAnalysis.vulnerabilities.map(v => `  - ${v}`),
      ''
    ].join('\n')),
    '',
    '## Trademark Analysis',
    `Potential Conflicts: ${input.trademarkResults.length}`,
    ...input.trademarkResults
      .filter(t => t.likelihoodOfConfusion !== 'minimal')
      .map(t => `- ${t.conflictingMark.mark} (${t.likelihoodOfConfusion} risk)`),
    '',
    '## Trade Secret Audit',
    `Candidates Identified: ${input.tradeSecretFindings.length}`,
    `High Value: ${input.tradeSecretFindings.filter(
      t => t.economicValue === 'high'
    ).length}`,
    `DTSA Qualified: ${input.tradeSecretFindings.filter(
      t => t.dtsa_qualified
    ).length}`,
    '',
    '## Freedom-to-Operate Risks',
    `Total FTO Risks: ${input.ftoRisks.length}`,
    `High Risk: ${input.ftoRisks.filter(r => r.riskLevel === 'high').length}`,
  ].join('\n');

  const dealContextSection = input.dealContext
    ? [
        '',
        '## Deal Context',
        `Transaction: ${input.dealContext.transactionType}`,
        `Valuation Basis: ${input.dealContext.valuationBasis}`,
        `Target Markets: ${input.dealContext.targetMarkets.join(', ')}`,
        `Materiality: $${input.dealContext.materialityThreshold.toLocaleString()}`,
      ].join('\n')
    : '';

  const prompt = [
    'You are a senior IP strategist synthesizing a complete portfolio',
    'analysis into executive-level intelligence.',
    '',
    findingsSummary,
    dealContextSection,
    '',
    '## Synthesis Requirements',
    '',
    '1. **Technology Coverage Map**: Group patents by technology area.',
    '   Assess coverage breadth (broad, narrow, fragmented) and',
    '   competitive position (dominant, strong, moderate, weak) per area.',
    '',
    '2. **Portfolio Valuation**: Provide low/mid/high valuation range.',
    '   Methodology must be disclosed. Use income approach (licensing',
    '   revenue potential), market approach (comparable transactions),',
    '   and cost approach (development replacement cost) as appropriate.',
    '',
    '3. **Maintenance Recommendations**: For each patent, recommend',
    '   maintain, abandon, license, or enforce. Include cost-benefit',
    '   analysis (annual maintenance fees vs. expected value).',
    '',
    '4. **Strategic Roadmap**: Identify gaps in coverage, opportunities',
    '   for new filings, licensing targets, and enforcement priorities.',
    '',
    '5. **Risk Assessment**: Summarize validity risks, FTO risks,',
    '   trademark conflicts, and trade secret vulnerabilities.',
    '',
    input.dealContext
      ? '6. **Deal Recommendation**: Given the deal context, assess whether'
        + ' the IP portfolio justifies the valuation basis. Identify any'
        + ' deal-breaking IP issues.'
      : '',
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 128_000,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  const { input_tokens, output_tokens } = response.usage;

  return parsePortfolioSummary(text, input);
}

function parsePortfolioSummary(
  text: string,
  input: SynthesisInput
): PortfolioSummary {
  // Build the summary from both computed metrics and AI analysis
  const activePatents = input.portfolio.patents.filter(
    p => p.status === 'active'
  );
  const pendingApps = input.portfolio.patents.filter(
    p => p.status === 'pending'
  );
  const now = new Date();
  const twoYearsFromNow = new Date(
    now.getFullYear() + 2, now.getMonth(), now.getDate()
  );
  const expiringWithinTwo = activePatents.filter(p => {
    if (!p.expirationDate) return false;
    return new Date(p.expirationDate) <= twoYearsFromNow;
  });

  return {
    totalPatents: input.portfolio.patents.length,
    activePatents: activePatents.length,
    pendingApplications: pendingApps.length,
    expiringWithinTwoYears: expiringWithinTwo.length,
    totalTrademarks: input.portfolio.trademarks.length,
    activeTrademarks: input.portfolio.trademarks.filter(
      t => t.status === 'registered'
    ).length,
    identifiedTradeSecrets: input.tradeSecretFindings.length,
    inboundLicenses: input.portfolio.licenses.filter(
      l => l.licenseType === 'inbound'
    ).length,
    outboundLicenses: input.portfolio.licenses.filter(
      l => l.licenseType === 'outbound'
    ).length,
    technologyCoverage: extractTechnologyCoverage(text),
    estimatedPortfolioValue: extractValuationRange(text),
    strategicRecommendations: extractRecommendations(text),
  };
}

function extractTechnologyCoverage(text: string): TechnologyArea[] {
  // Extract technology area assessments from the synthesis
  const areas: TechnologyArea[] = [];
  // ... parsing logic for technology coverage section
  return areas;
}

function extractValuationRange(text: string): ValuationRange {
  // Extract valuation figures from the synthesis
  // Look for dollar amounts in the valuation section
  const dollarPattern = /\$([0-9,.]+)\s*(million|M|billion|B)?/gi;
  const matches = [...text.matchAll(dollarPattern)];

  // Default conservative range if extraction fails
  return {
    low: 0,
    mid: 0,
    high: 0,
    methodology: 'Combined income, market, and cost approaches',
    comparables: [],
  };
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  const lines = text.split('\n');
  let inRecommendations = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('strategic recommend')
        || line.toLowerCase().includes('strategic roadmap')) {
      inRecommendations = true;
      continue;
    }
    if (inRecommendations && line.match(/^[-•*\d]/)) {
      recommendations.push(
        line.replace(/^[-•*\d.)\s]+/, '').trim()
      );
    }
    if (inRecommendations && line.match(/^#+\s/) && recommendations.length > 0) {
      break;
    }
  }

  return recommendations;
}
```


\newpage


## Trademark Clearance Pipeline


Trademark clearance is a distinct IP analytics workflow with its own
pipeline structure. Unlike patent analysis, which is primarily about
technical claim construction, trademark clearance is about market
perception: whether consumers are likely to confuse one mark with another.
The legal framework is the multifactor likelihood-of-confusion test,
most commonly the 13 DuPont factors in the USPTO's Trademark Trial and
Appeal Board (TTAB) proceedings.


### The DuPont Factor Analysis


The DuPont test examines 13 factors, though not all factors are relevant
in every case. The most important factors in practice are the similarity
of the marks, the similarity of the goods/services, and the similarity
of the trade channels. A trademark clearance pipeline must evaluate
each applicable factor and produce a weighted overall assessment.


| Legal Language | TypeScript | Explanation |
|---|---|---|
| "The similarity of the marks in their entireties as to appearance, sound, connotation, and commercial impression." | `similarityOfMarks: number` (1-5 scale) | DuPont Factor 1. The pipeline compares the proposed mark against each found mark across four dimensions and produces a composite similarity score. |
| "The similarity of the goods or services as described in the application and registration." | `similarityOfGoods: number` (1-5 scale) | DuPont Factor 2. Even identical marks may coexist if the goods are unrelated. "Delta" for faucets and "Delta" for airlines. |
| "The conditions under which and buyers to whom sales are made, i.e., 'impulse' vs. careful, sophisticated purchasing." | `buyerSophistication: 'impulse' \| 'considered' \| 'professional'` | DuPont Factor 4. Professional buyers making considered purchases are less likely to be confused than retail consumers making impulse purchases. |


```typescript
// trademark-clearance-diplomat.ts
// Automated trademark search and likelihood-of-confusion analysis
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface ClearanceSearchInput {
  proposedMark: string;
  markType: 'word' | 'design' | 'composite';
  goodsAndServices: string;
  niceClasses: number[];
  targetJurisdictions: string[];
  clientIndustry: string;
}

interface ClearanceResult {
  proposedMark: string;
  searchDate: string;
  totalConflictsFound: number;
  conflicts: TrademarkConflict[];
  overallClearance: 'clear' | 'proceed_with_caution' | 'significant_risk' | 'blocked';
  recommendations: string[];
}

async function performTrademarkClearance(
  input: ClearanceSearchInput
): Promise<ClearanceResult> {
  // Phase 1: Identical mark search (knockout search)
  const knockoutResults = await searchIdenticalMarks(input);

  // If identical mark found in same class, likely blocked
  const identicalInClass = knockoutResults.filter(
    r => r.niceClasses.some(c => input.niceClasses.includes(c))
  );

  if (identicalInClass.length > 0) {
    return {
      proposedMark: input.proposedMark,
      searchDate: new Date().toISOString(),
      totalConflictsFound: identicalInClass.length,
      conflicts: identicalInClass.map(r => ({
        conflictingMark: r,
        likelihoodOfConfusion: 'high' as const,
        dupontFactors: {
          similarityOfMarks: 5,
          similarityOfGoods: 5,
          similarityOfTradeChannels: 4,
          strengthOfPriorMark: 3,
          evidenceOfActualConfusion: false,
          overallAssessment: 'Identical mark in overlapping class.'
        },
        recommendation: 'oppose' as const,
      })),
      overallClearance: 'blocked',
      recommendations: [
        'Identical mark found in overlapping Nice class.',
        'Consider alternative marks or different goods/services description.',
      ],
    };
  }

  // Phase 2: Similar mark search (full clearance)
  const similarResults = await searchSimilarMarks(input);

  // Phase 3: DuPont analysis for each similar mark
  const conflictAnalyses = await Promise.allSettled(
    similarResults.map(mark => analyzeDuPontFactors(input, mark))
  );

  const conflicts = conflictAnalyses
    .filter((r): r is PromiseFulfilledResult<TrademarkConflict> =>
      r.status === 'fulfilled')
    .map(r => r.value);

  // Determine overall clearance
  const highRiskCount = conflicts.filter(
    c => c.likelihoodOfConfusion === 'high'
  ).length;
  const moderateRiskCount = conflicts.filter(
    c => c.likelihoodOfConfusion === 'moderate'
  ).length;

  let overallClearance: ClearanceResult['overallClearance'];
  if (highRiskCount > 0) overallClearance = 'significant_risk';
  else if (moderateRiskCount > 2) overallClearance = 'proceed_with_caution';
  else overallClearance = 'clear';

  return {
    proposedMark: input.proposedMark,
    searchDate: new Date().toISOString(),
    totalConflictsFound: conflicts.length,
    conflicts,
    overallClearance,
    recommendations: generateClearanceRecommendations(
      conflicts, overallClearance
    ),
  };
}

async function searchIdenticalMarks(
  input: ClearanceSearchInput
): Promise<Trademark[]> {
  // In production, this calls the USPTO TESS API, EUIPO TMview,
  // and WIPO Global Brand Database
  const prompt = [
    'Search for identical or near-identical trademark registrations',
    `for the mark "${input.proposedMark}" in the following classes:`,
    input.niceClasses.map(c => `Class ${c}`).join(', '),
    `Jurisdictions: ${input.targetJurisdictions.join(', ')}`,
    '',
    'Return only marks that are identical or differ by trivial variations',
    '(pluralization, punctuation, minor spelling). Do not return similar',
    'but clearly different marks at this stage.',
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 16_384,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '[]';
  // Parse and return trademark records
  return [];
}

async function searchSimilarMarks(
  input: ClearanceSearchInput
): Promise<Trademark[]> {
  // Broader search for phonetically, visually, or conceptually similar marks
  const prompt = [
    'Search for trademarks that are similar to',
    `"${input.proposedMark}" considering:`,
    '1. Phonetic similarity (sounds alike when spoken)',
    '2. Visual similarity (looks alike in appearance)',
    '3. Conceptual similarity (conveys similar meaning)',
    '',
    `Goods/Services: ${input.goodsAndServices}`,
    `Nice Classes: ${input.niceClasses.join(', ')}`,
    `Industry: ${input.clientIndustry}`,
    '',
    'Cast a wide net. Include marks that a consumer might confuse',
    'even if they are not identical.',
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 16_384,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '[]';
  return [];
}

async function analyzeDuPontFactors(
  proposed: ClearanceSearchInput,
  conflicting: Trademark
): Promise<TrademarkConflict> {
  const prompt = [
    'You are a trademark attorney analyzing likelihood of confusion',
    'using the 13 DuPont factors from In re E.I. du Pont de Nemours & Co.',
    '',
    '## Proposed Mark',
    `Mark: "${proposed.proposedMark}"`,
    `Type: ${proposed.markType}`,
    `Goods/Services: ${proposed.goodsAndServices}`,
    `Classes: ${proposed.niceClasses.join(', ')}`,
    '',
    '## Conflicting Mark',
    `Mark: "${conflicting.mark}"`,
    `Type: ${conflicting.markType}`,
    `Goods/Services: ${conflicting.goodsAndServices}`,
    `Classes: ${conflicting.niceClasses.join(', ')}`,
    `Status: ${conflicting.status}`,
    `Owner: ${conflicting.owner}`,
    '',
    '## Analysis Required',
    'Score each applicable DuPont factor from 1 (minimal confusion risk)',
    'to 5 (high confusion risk). Provide your reasoning for each score.',
    'Then provide an overall likelihood-of-confusion assessment:',
    'high, moderate, low, or minimal.',
    '',
    'Focus especially on:',
    '- Factor 1: Similarity of marks (appearance, sound, meaning)',
    '- Factor 2: Similarity of goods/services',
    '- Factor 3: Similarity of trade channels',
    '- Factor 6: Strength of prior mark on distinctiveness spectrum',
    '',
    'Conclude with a recommendation: oppose, monitor, coexist, or clear.',
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 16_384,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';

  return parseDuPontAnalysis(text, conflicting);
}

function parseDuPontAnalysis(
  text: string,
  conflictingMark: Trademark
): TrademarkConflict {
  // Parse the DuPont factor analysis from the AI response
  // Production implementation would use structured outputs
  const isHigh = text.toLowerCase().includes('high likelihood');
  const isModerate = text.toLowerCase().includes('moderate likelihood');
  const isLow = text.toLowerCase().includes('low likelihood');

  return {
    conflictingMark,
    likelihoodOfConfusion: isHigh ? 'high' : isModerate ? 'moderate'
      : isLow ? 'low' : 'minimal',
    dupontFactors: {
      similarityOfMarks: 3,
      similarityOfGoods: 3,
      similarityOfTradeChannels: 3,
      strengthOfPriorMark: 3,
      evidenceOfActualConfusion: false,
      overallAssessment: text.slice(0, 500),
    },
    recommendation: isHigh ? 'oppose' : isModerate ? 'monitor' : 'clear',
  };
}

function generateClearanceRecommendations(
  conflicts: TrademarkConflict[],
  overall: ClearanceResult['overallClearance']
): string[] {
  const recommendations: string[] = [];

  if (overall === 'clear') {
    recommendations.push(
      'No significant conflicts identified. Proceed with filing.'
    );
    recommendations.push(
      'Consider filing intent-to-use application to secure priority date.'
    );
  }

  if (overall === 'proceed_with_caution') {
    recommendations.push(
      'Moderate conflicts identified. Consider coexistence agreement strategy.'
    );
    const moderateConflicts = conflicts.filter(
      c => c.likelihoodOfConfusion === 'moderate'
    );
    for (const conflict of moderateConflicts) {
      recommendations.push(
        `Monitor ${conflict.conflictingMark.mark} `
        + `(Class ${conflict.conflictingMark.niceClasses.join('/')}).`
      );
    }
  }

  if (overall === 'significant_risk' || overall === 'blocked') {
    recommendations.push(
      'Significant conflicts identified. Alternative marks recommended.'
    );
    recommendations.push(
      'If proceeding, obtain detailed opinion of counsel on each high-risk conflict.'
    );
  }

  return recommendations;
}
```


> **Practice Tip**
>
> Trademark clearance should always proceed in two phases: knockout
> search first, then full clearance. The knockout search looks only for
> identical or near-identical marks in the same Nice class. If a
> knockout is found, there is no point running the full DuPont analysis
> on dozens of similar marks. This two-phase approach saves significant
> API costs on cases where the answer is obvious. In my experience at
> Boomi, roughly 30% of proposed marks fail the knockout search,
> avoiding the need for a full clearance analysis entirely.


\newpage


## Trade Secret Audit Pipeline


Trade secret protection is the least systematized area of IP management
and, consequently, the area where AI analytics delivers the most
transformative value. Most companies have no formal trade secret
inventory. They know they have "confidential information" but have never
catalogued what specifically qualifies as a trade secret under the
Defend Trade Secrets Act (DTSA) or state Uniform Trade Secrets Act
(UTSA) standards. This matters because trade secret protection is not
automatic. Unlike copyright (which attaches upon creation) or patent
(which is granted by the government), trade secret protection requires
the owner to take "reasonable measures" to maintain secrecy. If you
cannot identify your trade secrets, you cannot protect them. And if you
cannot demonstrate reasonable protection measures, you cannot enforce them.


The trade secret audit pipeline identifies candidate trade secrets across
five categories, assesses whether each candidate meets the legal
requirements for protection, evaluates the adequacy of existing protection
measures, and generates remediation recommendations for gaps.


```typescript
// trade-secret-audit-diplomat.ts
// Identify and assess trade secret candidates
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

type TSCategory = 'technical' | 'business' | 'process'
  | 'customer' | 'financial';

interface AuditInput {
  companyName: string;
  industry: string;
  businessDescriptions: string[];
  employeeAgreementSample: string | null;
  ndaTemplateSample: string | null;
  accessControlDescription: string;
  informationClassificationPolicy: string | null;
  codebaseDescription?: string;
}

const CATEGORY_SPECIALISTS: Array<{
  category: TSCategory;
  systemPrompt: string;
  searchInstructions: string;
}> = [
  {
    category: 'technical',
    systemPrompt: [
      'You are a trade secret specialist focused on technical trade secrets:',
      'proprietary algorithms, source code architectures, manufacturing processes,',
      'formulations, hardware designs, testing methodologies, and technical',
      'know-how that provides competitive advantage.',
    ].join(' '),
    searchInstructions: [
      'Identify technical information that likely derives economic value',
      'from not being generally known. Consider: proprietary algorithms,',
      'unique system architectures, custom tooling, manufacturing processes,',
      'testing protocols, performance optimization techniques, and any',
      'technical innovation that competitors would benefit from knowing.',
    ].join(' '),
  },
  {
    category: 'business',
    systemPrompt: [
      'You are a trade secret specialist focused on business trade secrets:',
      'strategic plans, pricing strategies, market analyses, business models,',
      'partnership terms, supplier agreements, and competitive intelligence.',
    ].join(' '),
    searchInstructions: [
      'Identify business information that provides competitive advantage:',
      'pricing models, cost structures, margin data, strategic plans,',
      'M&A targets, market research, competitive analyses, business',
      'development pipelines, partnership terms, and negotiation playbooks.',
    ].join(' '),
  },
  {
    category: 'process',
    systemPrompt: [
      'You are a trade secret specialist focused on process trade secrets:',
      'workflows, quality control procedures, operational methodologies,',
      'training programs, and organizational know-how.',
    ].join(' '),
    searchInstructions: [
      'Identify proprietary processes: quality control procedures, supply',
      'chain optimizations, manufacturing workflows, service delivery',
      'methodologies, training curricula, onboarding processes, and any',
      'operational knowledge that took significant time and investment to develop.',
    ].join(' '),
  },
  {
    category: 'customer',
    systemPrompt: [
      'You are a trade secret specialist focused on customer-related trade',
      'secrets: customer lists, purchasing patterns, pricing negotiations,',
      'contract terms, relationship intelligence, and sales strategies.',
    ].join(' '),
    searchInstructions: [
      'Identify customer information that provides competitive advantage:',
      'compiled customer lists with purchasing history, customer-specific',
      'pricing, contract renewal terms, relationship maps, buying patterns,',
      'churn predictors, and customer development strategies.',
    ].join(' '),
  },
  {
    category: 'financial',
    systemPrompt: [
      'You are a trade secret specialist focused on financial trade secrets:',
      'non-public financial data, cost structures, profitability analyses,',
      'valuation models, and financial projections.',
    ].join(' '),
    searchInstructions: [
      'Identify non-public financial information: detailed cost structures,',
      'product-level profitability, pricing algorithms, financial models,',
      'revenue projections, budget allocations, and investment strategies',
      'that competitors could exploit.',
    ].join(' '),
  },
];

async function performTradeSecretAudit(
  input: AuditInput
): Promise<TradeSecretCandidate[]> {
  // Fan-out: five category specialists search in parallel
  const categoryResults = await Promise.allSettled(
    CATEGORY_SPECIALISTS.map(async (specialist) => {
      const prompt = [
        specialist.searchInstructions,
        '',
        '## Company Information',
        `Company: ${input.companyName}`,
        `Industry: ${input.industry}`,
        '',
        '## Business Descriptions',
        ...input.businessDescriptions.map(d => `- ${d}`),
        '',
        '## Existing Protection Measures',
        `Access Controls: ${input.accessControlDescription}`,
        input.informationClassificationPolicy
          ? `Classification Policy: ${input.informationClassificationPolicy}`
          : 'Classification Policy: NONE DOCUMENTED',
        input.employeeAgreementSample
          ? `Employee Agreement: ${input.employeeAgreementSample.slice(0, 2000)}`
          : 'Employee Agreement: NOT PROVIDED',
        input.ndaTemplateSample
          ? `NDA Template: ${input.ndaTemplateSample.slice(0, 2000)}`
          : 'NDA Template: NOT PROVIDED',
        '',
        '## Instructions',
        '1. Identify 3-8 specific trade secret candidates in your category.',
        '2. For each candidate, assess:',
        '   a. Economic value derived from secrecy (high/medium/low)',
        '   b. Whether the company has "reasonable measures" to protect it',
        '   c. Specific protection measures in place (NDAs, access controls, etc.)',
        '   d. Vulnerabilities (gaps in protection)',
        '   e. Whether it would qualify under the DTSA',
        '3. For each vulnerability, provide a specific remediation step.',
      ].join('\n');

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 16_384,
        system: specialist.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';

      return parseTradeSecretCandidates(text, specialist.category);
    })
  );

  // Aggregate all category results
  return categoryResults
    .filter((r): r is PromiseFulfilledResult<TradeSecretCandidate[]> =>
      r.status === 'fulfilled')
    .flatMap(r => r.value);
}

function parseTradeSecretCandidates(
  text: string,
  category: TSCategory
): TradeSecretCandidate[] {
  // Parse trade secret candidates from AI response
  // Production would use structured outputs
  const candidates: TradeSecretCandidate[] = [];
  // ... parsing logic
  return candidates;
}
```


> **Key Concept**
>
> The "reasonable measures" requirement is the most frequently litigated
> element of trade secret claims. Courts have found measures inadequate
> where companies failed to mark documents as confidential, failed to
> restrict physical or digital access, failed to require NDAs from
> employees and contractors, or failed to maintain a formal information
> classification policy. The trade secret audit pipeline must evaluate
> each of these dimensions. A high-value trade secret with weak
> protection measures is worse than no trade secret at all, because
> the company relies on a right it cannot enforce.


\newpage


## IP Due Diligence: The Acquisition Context


IP due diligence in an M&A transaction combines all of the preceding
workflows into a time-pressured, high-stakes engagement. The acquirer
needs to know: Does the target own its IP cleanly? Is the IP valid?
Is the IP valuable? Are there encumbrances? Are there infringement
risks? The pipeline we have built across this chapter provides every
component. The IP due diligence orchestrator assembles them into an
acquisition-specific workflow.


### Chain of Title Analysis


The single most common IP due diligence failure is a broken chain of
title. The target company claims to own a patent, but the patent was
originally filed by a founder who never signed an IP assignment agreement.
Or the patent was developed by a contractor whose consulting agreement
did not include work-for-hire provisions. Or the patent was assigned to
a subsidiary that was dissolved without transferring assets to the parent.


```typescript
// chain-of-title-analyst.ts
// Verify IP ownership chains for due diligence
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface ChainOfTitleInput {
  patent: Patent;
  assignmentDocuments: Array<{
    documentTitle: string;
    content: string;
    recordedDate: string | null;
    recordedAtUSPTO: boolean;
  }>;
  inventorAgreements: Array<{
    inventorName: string;
    agreementType: 'employment' | 'consulting' | 'assignment' | 'none';
    content: string | null;
    signedDate: string | null;
  }>;
  corporateHistory: string;
}

interface ChainOfTitleResult {
  patentNumber: string;
  titleIsClean: boolean;
  gaps: TitleGap[];
  recommendations: string[];
  riskLevel: 'clear' | 'minor_gaps' | 'significant_gaps' | 'broken';
}

interface TitleGap {
  gapType: 'missing_assignment' | 'unrecorded_assignment'
    | 'missing_inventor_agreement' | 'corporate_succession'
    | 'joint_ownership' | 'contractor_ownership';
  description: string;
  affectedInventor: string | null;
  severity: 'critical' | 'remediable' | 'low_risk';
  remediation: string;
}

async function analyzeChainOfTitle(
  input: ChainOfTitleInput
): Promise<ChainOfTitleResult> {
  const prompt = [
    'You are an IP due diligence specialist analyzing chain of title.',
    '',
    '## Patent',
    `Number: ${input.patent.patentNumber}`,
    `Title: ${input.patent.title}`,
    `Inventors: ${input.patent.inventors.join(', ')}`,
    `Current Assignee of Record: ${input.patent.assignee}`,
    '',
    '## Assignment Documents',
    ...input.assignmentDocuments.map(d => [
      `### ${d.documentTitle}`,
      `Recorded at USPTO: ${d.recordedAtUSPTO ? 'Yes' : 'No'}`,
      `Recorded Date: ${d.recordedDate ?? 'Not recorded'}`,
      d.content.slice(0, 5000),
      ''
    ].join('\n')),
    '',
    '## Inventor Agreements',
    ...input.inventorAgreements.map(a => [
      `### ${a.inventorName}`,
      `Agreement Type: ${a.agreementType}`,
      `Signed: ${a.signedDate ?? 'UNKNOWN'}`,
      a.content ? a.content.slice(0, 3000) : 'NO AGREEMENT ON FILE',
      ''
    ].join('\n')),
    '',
    '## Corporate History',
    input.corporateHistory,
    '',
    '## Analysis Required',
    '1. Trace the chain of title from each inventor to the current entity.',
    '2. Identify any gaps: missing assignments, unrecorded transfers,',
    '   inventors without IP assignment agreements, corporate succession',
    '   gaps (mergers, dissolutions without asset transfers).',
    '3. For each gap, assess severity (critical = breaks the chain,',
    '   remediable = fixable pre-closing, low_risk = unlikely to matter).',
    '4. Provide specific remediation steps for each gap.',
    '5. Render an overall opinion: clear, minor gaps, significant gaps,',
    '   or broken chain of title.',
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32_768,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  const { input_tokens, output_tokens } = response.usage;

  return parseChainOfTitleResult(text, input.patent.patentNumber);
}

function parseChainOfTitleResult(
  text: string,
  patentNumber: string
): ChainOfTitleResult {
  const isClear = text.toLowerCase().includes('chain of title is clear')
    || text.toLowerCase().includes('no gaps identified');
  const isBroken = text.toLowerCase().includes('broken chain')
    || text.toLowerCase().includes('critical gap');
  const hasMinorGaps = text.toLowerCase().includes('minor gap')
    || text.toLowerCase().includes('remediable');

  return {
    patentNumber,
    titleIsClean: isClear,
    gaps: extractTitleGaps(text),
    recommendations: extractRecommendationsList(text),
    riskLevel: isBroken ? 'broken'
      : hasMinorGaps && !isClear ? 'minor_gaps'
      : isClear ? 'clear'
      : 'significant_gaps',
  };
}

function extractTitleGaps(text: string): TitleGap[] {
  // Extract gap descriptions from the analysis
  const gaps: TitleGap[] = [];
  // ... parsing logic for gap identification
  return gaps;
}

function extractRecommendationsList(text: string): string[] {
  const items: string[] = [];
  const lines = text.split('\n');
  let inSection = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('remediation')
        || line.toLowerCase().includes('recommendation')) {
      inSection = true;
      continue;
    }
    if (inSection && line.match(/^[-•*\d]/)) {
      items.push(line.replace(/^[-•*\d.)\s]+/, '').trim());
    }
    if (inSection && line.match(/^#+\s/) && items.length > 0) break;
  }

  return items;
}
```


### License Encumbrance Review


Every inbound license in the target's portfolio must be reviewed for
change-of-control provisions. Some licenses terminate automatically upon
a change of control. Some require consent from the licensor. Some have
most-favored-licensee clauses that the acquisition could trigger. In my
experience at Boomi, license encumbrances were the most frequently
underestimated risk in technology acquisitions. A target company whose
core product depends on a third-party SDK license that terminates on
change of control is not worth $140 million. It is worth whatever the
business is worth *without* that SDK, which might be zero.


```typescript
// license-encumbrance-analyst.ts
// Review license agreements for acquisition impact
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface LicenseReviewInput {
  license: IPLicense;
  licenseFullText: string;
  transactionStructure: 'asset_purchase' | 'stock_purchase' | 'merger';
  acquirerName: string;
}

interface LicenseEncumbranceResult {
  licenseId: string;
  grantor: string;
  changeOfControlImpact: 'terminates' | 'requires_consent'
    | 'mfn_triggered' | 'survives' | 'unclear';
  antiAssignmentClause: boolean;
  consentRequired: boolean;
  consentLikelihood: 'likely' | 'uncertain' | 'unlikely';
  financialImpact: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string[];
}

async function reviewLicenseEncumbrance(
  input: LicenseReviewInput
): Promise<LicenseEncumbranceResult> {
  const prompt = [
    'You are a technology transactions attorney reviewing a license',
    'agreement for change-of-control and assignment implications in',
    'an acquisition context.',
    '',
    '## Transaction Context',
    `Transaction Type: ${input.transactionStructure}`,
    `Acquirer: ${input.acquirerName}`,
    '',
    '## License Agreement',
    `Grantor: ${input.license.grantor}`,
    `Grantee: ${input.license.grantee}`,
    `License Type: ${input.license.licenseType}`,
    `Scope: ${input.license.scope}`,
    `Territory: ${input.license.territory}`,
    '',
    '## Full License Text',
    input.licenseFullText,
    '',
    '## Analysis Required',
    '1. Does the license contain a change-of-control provision?',
    '   If yes, what does it trigger (termination, consent, MFN)?',
    '',
    '2. Does the license contain an anti-assignment clause?',
    '   Does the anti-assignment clause distinguish between direct',
    '   assignment (asset deal) and change of control (stock deal)?',
    '',
    '3. For a stock purchase: Is a change-of-control clause triggered',
    '   even though the licensee entity remains the same?',
    '   (Many CoC clauses capture stock purchases explicitly.)',
    '',
    '4. For an asset purchase: Is the license assignable?',
    '   Does it require consent? Is consent not to be unreasonably withheld?',
    '',
    '5. Are there most-favored-licensee provisions triggered by the',
    '   change in licensee ownership or size?',
    '',
    '6. What is the financial impact if the license terminates?',
    '   Can the licensee replace this technology, and at what cost?',
    '',
    '7. What mitigation strategies are available?',
    '   (Pre-closing consent, carve-out, replacement technology, etc.)',
  ].join('\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 16_384,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  const { input_tokens, output_tokens } = response.usage;

  return parseLicenseEncumbranceResult(text, input.license);
}

function parseLicenseEncumbranceResult(
  text: string,
  license: IPLicense
): LicenseEncumbranceResult {
  const terminates = text.toLowerCase().includes('terminates upon')
    || text.toLowerCase().includes('automatic termination');
  const requiresConsent = text.toLowerCase().includes('consent required')
    || text.toLowerCase().includes('prior written consent');
  const mfnTriggered = text.toLowerCase().includes('most favored')
    || text.toLowerCase().includes('mfn');

  let changeOfControlImpact: LicenseEncumbranceResult['changeOfControlImpact'];
  if (terminates) changeOfControlImpact = 'terminates';
  else if (requiresConsent) changeOfControlImpact = 'requires_consent';
  else if (mfnTriggered) changeOfControlImpact = 'mfn_triggered';
  else changeOfControlImpact = 'survives';

  return {
    licenseId: license.licenseId,
    grantor: license.grantor,
    changeOfControlImpact,
    antiAssignmentClause: text.toLowerCase().includes('anti-assignment')
      || text.toLowerCase().includes('shall not assign'),
    consentRequired: requiresConsent,
    consentLikelihood: 'uncertain',
    financialImpact: extractSection(text, 'financial impact'),
    riskLevel: terminates ? 'critical'
      : requiresConsent ? 'high'
      : mfnTriggered ? 'medium'
      : 'low',
    mitigation: extractMitigationSteps(text),
  };
}

function extractSection(text: string, sectionName: string): string {
  const lines = text.split('\n');
  let capturing = false;
  const captured: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().includes(sectionName.toLowerCase())) {
      capturing = true;
      continue;
    }
    if (capturing && line.match(/^#+\s/) && captured.length > 0) break;
    if (capturing) captured.push(line);
  }

  return captured.join(' ').trim().slice(0, 500);
}

function extractMitigationSteps(text: string): string[] {
  const steps: string[] = [];
  const lines = text.split('\n');
  let inMitigation = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('mitigation')
        || line.toLowerCase().includes('remediation')) {
      inMitigation = true;
      continue;
    }
    if (inMitigation && line.match(/^[-•*\d]/)) {
      steps.push(line.replace(/^[-•*\d.)\s]+/, '').trim());
    }
    if (inMitigation && line.match(/^#+\s/) && steps.length > 0) break;
  }

  return steps;
}
```


> **Insight**
>
> The distinction between asset purchase and stock purchase structures
> has profound implications for IP license survivability. In a stock
> purchase, the licensee entity survives. The licensor's counterparty
> has not changed, only its ownership has. Many anti-assignment clauses
> do not capture stock transfers unless they specifically define
> "assignment" to include changes of control. In an asset purchase,
> the license must be assigned to the acquirer, which nearly always
> triggers anti-assignment provisions. At Boomi, structuring deals as
> stock purchases rather than asset purchases often preserved critical
> license relationships that an asset deal would have destroyed. The
> pipeline must understand this distinction to correctly assess risk.


\newpage


## The Complete IP Due Diligence Orchestrator


The IP due diligence orchestrator assembles all components into a
complete acquisition-context workflow. It runs five rounds sequentially,
with massive parallelism within each round, and produces a comprehensive
IP diligence report.


```svg
<svg viewBox="0 0 850 580" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: 'Segoe UI', system-ui, sans-serif; }
  </style>
  <defs>
    <marker id="arrowDD" markerWidth="10" markerHeight="7"
            refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="425" y="25" text-anchor="middle" font-size="15"
        font-weight="bold" fill="#1a1a2e">
    Figure 18.4: IP Due Diligence Pipeline — Complete Architecture
  </text>

  <!-- Round 1 -->
  <rect x="25" y="50" width="800" height="60" rx="8" fill="#1a1a2e"/>
  <text x="425" y="73" text-anchor="middle" font-size="12"
        font-weight="bold" fill="white">
    Round 1: Data Room Intake &amp; IP Asset Classification
  </text>
  <text x="425" y="93" text-anchor="middle" font-size="10" fill="#16a085">
    Classify patents, trademarks, licenses, assignments, agreements
    — Reconcile against expected asset list
  </text>

  <!-- Arrow -->
  <line x1="425" y1="115" x2="425" y2="135"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowDD)"/>

  <!-- Round 2: Parallel tracks -->
  <rect x="25" y="140" width="800" height="100" rx="8"
        fill="none" stroke="#1a1a2e" stroke-width="1.5"/>
  <text x="425" y="158" text-anchor="middle" font-size="12"
        font-weight="bold" fill="#1a1a2e">
    Round 2: Parallel Deep Analysis
  </text>

  <rect x="40" y="165" width="145" height="55" rx="5" fill="#1a1a2e"/>
  <text x="112" y="187" text-anchor="middle" font-size="9"
        font-weight="bold" fill="white">Patent Claims</text>
  <text x="112" y="202" text-anchor="middle" font-size="8" fill="#16a085">
    Scope + Dependencies</text>

  <rect x="200" y="165" width="145" height="55" rx="5" fill="#1a1a2e"/>
  <text x="272" y="187" text-anchor="middle" font-size="9"
        font-weight="bold" fill="white">Chain of Title</text>
  <text x="272" y="202" text-anchor="middle" font-size="8" fill="#16a085">
    Inventor → Entity</text>

  <rect x="360" y="165" width="145" height="55" rx="5" fill="#1a1a2e"/>
  <text x="432" y="187" text-anchor="middle" font-size="9"
        font-weight="bold" fill="white">License Review</text>
  <text x="432" y="202" text-anchor="middle" font-size="8" fill="#f39c12">
    CoC + Assignment</text>

  <rect x="520" y="165" width="145" height="55" rx="5" fill="#1a1a2e"/>
  <text x="592" y="187" text-anchor="middle" font-size="9"
        font-weight="bold" fill="white">TM Clearance</text>
  <text x="592" y="202" text-anchor="middle" font-size="8" fill="#16a085">
    Conflicts + DuPont</text>

  <rect x="680" y="165" width="130" height="55" rx="5" fill="#1a1a2e"/>
  <text x="745" y="187" text-anchor="middle" font-size="9"
        font-weight="bold" fill="white">Trade Secrets</text>
  <text x="745" y="202" text-anchor="middle" font-size="8" fill="#16a085">
    Inventory + Measures</text>

  <!-- Parallel indicator -->
  <text x="425" y="233" text-anchor="middle" font-size="9"
        font-weight="bold" fill="#f39c12">
    ⟦ All 5 tracks execute simultaneously ⟧
  </text>

  <!-- Arrow -->
  <line x1="425" y1="245" x2="425" y2="265"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowDD)"/>

  <!-- Round 3 -->
  <rect x="25" y="270" width="800" height="60" rx="8" fill="#1a1a2e"/>
  <text x="425" y="293" text-anchor="middle" font-size="12"
        font-weight="bold" fill="white">
    Round 3: Prior Art Research &amp; FTO Analysis
  </text>
  <text x="425" y="313" text-anchor="middle" font-size="10" fill="#16a085">
    6 parallel research agents per patent — FTO for target products against
    third-party patents
  </text>

  <!-- Arrow -->
  <line x1="425" y1="335" x2="425" y2="355"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowDD)"/>

  <!-- Round 4 -->
  <rect x="25" y="360" width="800" height="60" rx="8" fill="#1a1a2e"/>
  <text x="425" y="383" text-anchor="middle" font-size="12"
        font-weight="bold" fill="white">
    Round 4: Valuation &amp; Market Analysis
  </text>
  <text x="425" y="403" text-anchor="middle" font-size="10" fill="#16a085">
    Georgia-Pacific licensing analysis — Market comparables —
    Maintenance cost-benefit — Portfolio premium assessment
  </text>

  <!-- Arrow -->
  <line x1="425" y1="425" x2="425" y2="445"
        stroke="#16a085" stroke-width="2" marker-end="url(#arrowDD)"/>

  <!-- Round 5 -->
  <rect x="25" y="450" width="800" height="100" rx="8" fill="#16a085"/>
  <text x="425" y="478" text-anchor="middle" font-size="13"
        font-weight="bold" fill="white">
    Round 5: IP Due Diligence Report Synthesis
  </text>
  <text x="425" y="498" text-anchor="middle" font-size="10" fill="white">
    Executive Summary — Portfolio Valuation vs. Deal Price —
    Risk Matrix — Closing Conditions
  </text>
  <text x="425" y="518" text-anchor="middle" font-size="10" fill="white">
    Chain of Title Gaps — License Encumbrance Map —
    FTO Risk Register — Maintenance Roadmap
  </text>
  <text x="425" y="538" text-anchor="middle" font-size="10" fill="white">
    Deal Recommendation: Proceed / Renegotiate / Walk Away
  </text>
</svg>
```


```typescript
// ip-due-diligence-backautocrat.ts
// Complete IP due diligence orchestrator
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface DDConfig {
  dealContext: DealContext;
  dataRoomDocuments: Array<{
    filename: string;
    content: string;
    metadata?: Record<string, string>;
  }>;
  knownPatents: string[];
  knownTrademarks: string[];
  targetProducts: Array<{
    productName: string;
    productDescription: string;
    technologyComponents: string[];
  }>;
  ownerEntity: string;
  acquirerEntity: string;
}

interface DDReport {
  executiveSummary: string;
  dealRecommendation: 'proceed' | 'proceed_with_conditions'
    | 'renegotiate' | 'walk_away';
  portfolioSummary: PortfolioSummary;
  chainOfTitleFindings: ChainOfTitleResult[];
  licenseEncumbrances: LicenseEncumbranceResult[];
  ftoRisks: FTORisk[];
  trademarkConflicts: TrademarkConflict[];
  tradeSecretAssessment: TradeSecretCandidate[];
  closingConditions: string[];
  riskMatrix: Array<{
    risk: string;
    likelihood: 'high' | 'medium' | 'low';
    impact: 'critical' | 'significant' | 'moderate' | 'minor';
    mitigation: string;
  }>;
  metrics: PipelineMetrics;
}

async function runIPDueDiligence(config: DDConfig): Promise<DDReport> {
  const startTime = Date.now();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let agentCallCount = 0;

  // ── Round 1: Intake & Classification ──────────────────
  console.log('[DD] Round 1: Classifying data room documents...');

  const classifiedAssets = await classifyPortfolioAssets({
    rawDocuments: config.dataRoomDocuments,
    knownPatentNumbers: config.knownPatents,
    knownTrademarks: config.knownTrademarks,
    ownerEntity: config.ownerEntity,
  });

  // Separate assets by type
  const patentDocs = classifiedAssets.filter(a => a.assetType === 'patent');
  const licenseDocs = classifiedAssets.filter(a => a.assetType === 'license');
  const tmDocs = classifiedAssets.filter(a => a.assetType === 'trademark');
  const assignmentDocs = classifiedAssets.filter(
    a => a.assetType === 'assignment'
  );

  // ── Round 2: Parallel Deep Analysis ───────────────────
  console.log('[DD] Round 2: Running parallel deep analysis...');

  // Build patent objects from classified documents
  const patents = buildPatentObjects(patentDocs, config.dataRoomDocuments);
  const licenses = buildLicenseObjects(licenseDocs, config.dataRoomDocuments);

  // Five parallel analysis tracks
  const [
    claimsResults,
    titleResults,
    licenseResults,
    tmResults,
    tsResults,
  ] = await Promise.all([
    // Track 1: Patent claims analysis (parallel per patent)
    Promise.allSettled(
      patents.map(p => analyzePatentClaims({
        patent: p,
        specificationText: getDocContent(config.dataRoomDocuments, p),
      }))
    ),

    // Track 2: Chain of title (parallel per patent)
    Promise.allSettled(
      patents.map(p => analyzeChainOfTitle({
        patent: p,
        assignmentDocuments: getAssignmentDocs(
          assignmentDocs, config.dataRoomDocuments, p
        ),
        inventorAgreements: getInventorAgreements(
          config.dataRoomDocuments, p
        ),
        corporateHistory: '',
      }))
    ),

    // Track 3: License encumbrance review (parallel per license)
    Promise.allSettled(
      licenses.map(l => reviewLicenseEncumbrance({
        license: l.license,
        licenseFullText: l.fullText,
        transactionStructure: config.dealContext.transactionType
          === 'asset_purchase' ? 'asset_purchase'
          : config.dealContext.transactionType === 'stock_purchase'
          ? 'stock_purchase' : 'merger',
        acquirerName: config.acquirerEntity,
      }))
    ),

    // Track 4: Trademark clearance
    performTrademarkClearance({
      proposedMark: config.ownerEntity,
      markType: 'word',
      goodsAndServices: 'technology services',
      niceClasses: [9, 42],
      targetJurisdictions: ['US'],
      clientIndustry: 'technology',
    }),

    // Track 5: Trade secret audit
    performTradeSecretAudit({
      companyName: config.ownerEntity,
      industry: 'technology',
      businessDescriptions: config.targetProducts.map(
        p => p.productDescription
      ),
      employeeAgreementSample: null,
      ndaTemplateSample: null,
      accessControlDescription: 'Unknown — requires document review',
    }),
  ]);

  // Collect successful results
  const claimsAnalyses = claimsResults
    .filter((r): r is PromiseFulfilledResult<ClaimScopeAnalysis> =>
      r.status === 'fulfilled')
    .map(r => r.value);

  const chainOfTitleFindings = titleResults
    .filter((r): r is PromiseFulfilledResult<ChainOfTitleResult> =>
      r.status === 'fulfilled')
    .map(r => r.value);

  const licenseEncumbrances = licenseResults
    .filter((r): r is PromiseFulfilledResult<LicenseEncumbranceResult> =>
      r.status === 'fulfilled')
    .map(r => r.value);

  // ── Round 3: Prior Art & FTO ──────────────────────────
  console.log('[DD] Round 3: Running prior art research and FTO...');

  const [priorArtResults, ftoResults] = await Promise.all([
    // Prior art research (parallel per patent, 6 agents per patent)
    Promise.allSettled(
      patents.map((p, i) => searchPriorArt(p, claimsAnalyses[i]))
    ),

    // FTO analysis
    analyzeFreedomToOperate({
      targetProducts: config.targetProducts,
      relevantThirdPartyPatents: [], // populated from prior art findings
      targetMarkets: config.dealContext.targetMarkets,
    }),
  ]);

  const priorArtFindings = priorArtResults
    .filter((r): r is PromiseFulfilledResult<PriorArtReference[]> =>
      r.status === 'fulfilled')
    .map(r => r.value);

  // ── Round 4: Valuation ────────────────────────────────
  console.log('[DD] Round 4: Running valuation analysis...');

  const patentAnalyses: PatentAnalysisResult[] = patents.map((patent, i) => ({
    patent,
    claimsAnalysis: claimsAnalyses[i],
    priorArtFindings: priorArtFindings[i] ?? [],
    prosecutionAnalysis: {
      totalOfficeActions: 0,
      rejectionTypes: [],
      amendments: [],
      estoppelRisks: [],
      claimConstructionImplications: [],
    },
    valuation: {
      remainingLifeYears: calculateRemainingLife(patent),
      technologyRelevance: 'medium',
      licensingPotential: 'medium',
      litigationStrength: 'moderate',
      maintenanceRecommendation: 'maintain',
      estimatedValue: { low: 0, mid: 0, high: 0,
        methodology: 'Pending full valuation', comparables: [] },
    },
  }));

  // ── Round 5: Synthesis ────────────────────────────────
  console.log('[DD] Round 5: Synthesizing due diligence report...');

  const portfolioSummary = await synthesizePortfolio({
    portfolio: {
      portfolioId: `dd-${Date.now()}`,
      owner: config.ownerEntity,
      asOfDate: new Date().toISOString(),
      patents,
      trademarks: [],
      tradeSecrets: tsResults,
      licenses: licenses.map(l => l.license),
      summary: {} as PortfolioSummary,
    },
    patentAnalyses,
    trademarkResults: tmResults.conflicts,
    tradeSecretFindings: tsResults,
    ftoRisks: ftoResults,
    dealContext: config.dealContext,
  });

  // Generate deal recommendation
  const criticalIssues = [
    ...chainOfTitleFindings.filter(f => f.riskLevel === 'broken'),
    ...licenseEncumbrances.filter(e => e.riskLevel === 'critical'),
    ...ftoResults.filter(r => r.riskLevel === 'high'),
  ];

  let dealRecommendation: DDReport['dealRecommendation'];
  if (criticalIssues.length > 2) dealRecommendation = 'walk_away';
  else if (criticalIssues.length > 0) dealRecommendation = 'renegotiate';
  else if (licenseEncumbrances.some(e => e.consentRequired)) {
    dealRecommendation = 'proceed_with_conditions';
  } else {
    dealRecommendation = 'proceed';
  }

  const totalDurationMs = Date.now() - startTime;

  return {
    executiveSummary: generateExecutiveSummary(
      portfolioSummary, dealRecommendation, criticalIssues.length
    ),
    dealRecommendation,
    portfolioSummary,
    chainOfTitleFindings,
    licenseEncumbrances,
    ftoRisks: ftoResults,
    trademarkConflicts: tmResults.conflicts,
    tradeSecretAssessment: tsResults,
    closingConditions: generateClosingConditions(
      chainOfTitleFindings, licenseEncumbrances, ftoResults
    ),
    riskMatrix: buildRiskMatrix(
      chainOfTitleFindings, licenseEncumbrances, ftoResults,
      tmResults.conflicts
    ),
    metrics: {
      totalDurationMs,
      totalInputTokens,
      totalOutputTokens,
      totalCostUsd: (totalInputTokens * 15 + totalOutputTokens * 75) / 1_000_000,
      agentCallCount,
      patentsAnalyzed: patents.length,
      priorArtReferencesFound: priorArtFindings.flat().length,
    },
  };
}

function calculateRemainingLife(patent: Patent): number {
  if (!patent.expirationDate) return 0;
  const expiry = new Date(patent.expirationDate);
  const now = new Date();
  const years = (expiry.getTime() - now.getTime())
    / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.round(years * 10) / 10);
}

function generateExecutiveSummary(
  summary: PortfolioSummary,
  recommendation: DDReport['dealRecommendation'],
  criticalIssueCount: number
): string {
  const lines = [
    `Portfolio contains ${summary.totalPatents} patents `
      + `(${summary.activePatents} active, `
      + `${summary.pendingApplications} pending).`,
    `${summary.expiringWithinTwoYears} patents expire within 2 years.`,
    `${summary.identifiedTradeSecrets} trade secret candidates identified.`,
    `${summary.inboundLicenses} inbound licenses require review.`,
    '',
    `Critical issues identified: ${criticalIssueCount}.`,
    `Deal recommendation: ${recommendation.replace(/_/g, ' ').toUpperCase()}.`,
  ];

  return lines.join('\n');
}

function generateClosingConditions(
  titleFindings: ChainOfTitleResult[],
  encumbrances: LicenseEncumbranceResult[],
  ftoRisks: FTORisk[]
): string[] {
  const conditions: string[] = [];

  // Title remediation conditions
  const brokenChains = titleFindings.filter(
    f => f.riskLevel === 'broken' || f.riskLevel === 'significant_gaps'
  );
  for (const finding of brokenChains) {
    conditions.push(
      `Remediate chain of title for ${finding.patentNumber} `
      + `prior to closing.`
    );
  }

  // License consent conditions
  const consentRequired = encumbrances.filter(e => e.consentRequired);
  for (const enc of consentRequired) {
    conditions.push(
      `Obtain consent from ${enc.grantor} for license ${enc.licenseId} `
      + `prior to closing.`
    );
  }

  // FTO risk conditions
  const highFTO = ftoRisks.filter(r => r.riskLevel === 'high');
  for (const risk of highFTO) {
    conditions.push(
      `Obtain FTO opinion from outside patent counsel regarding `
      + `${risk.thirdPartyPatent} before closing.`
    );
  }

  return conditions;
}

function buildRiskMatrix(
  titleFindings: ChainOfTitleResult[],
  encumbrances: LicenseEncumbranceResult[],
  ftoRisks: FTORisk[],
  tmConflicts: TrademarkConflict[]
): DDReport['riskMatrix'] {
  const matrix: DDReport['riskMatrix'] = [];

  for (const finding of titleFindings) {
    if (finding.riskLevel !== 'clear') {
      matrix.push({
        risk: `Chain of title gap: ${finding.patentNumber}`,
        likelihood: finding.riskLevel === 'broken' ? 'high' : 'medium',
        impact: 'critical',
        mitigation: finding.recommendations[0] ?? 'Obtain corrective assignment.',
      });
    }
  }

  for (const enc of encumbrances) {
    if (enc.riskLevel !== 'low') {
      matrix.push({
        risk: `License encumbrance: ${enc.licenseId} (${enc.grantor})`,
        likelihood: enc.changeOfControlImpact === 'terminates' ? 'high' : 'medium',
        impact: enc.riskLevel === 'critical' ? 'critical' : 'significant',
        mitigation: enc.mitigation[0] ?? 'Seek pre-closing consent.',
      });
    }
  }

  for (const risk of ftoRisks) {
    matrix.push({
      risk: `FTO risk: ${risk.thirdPartyPatent} (${risk.patentHolder})`,
      likelihood: risk.riskLevel === 'high' ? 'high' : 'medium',
      impact: risk.designAroundPossibility === 'impractical'
        ? 'critical' : 'significant',
      mitigation: risk.licensingOption,
    });
  }

  return matrix;
}

// Helper functions for building objects from classified documents
function buildPatentObjects(
  classified: ClassifiedAsset[],
  rawDocs: Array<{ filename: string; content: string }>
): Patent[] {
  // Build Patent objects from classified data room documents
  return classified.map(asset => ({
    patentNumber: asset.extractedIdentifier ?? 'unknown',
    title: asset.filename,
    filingDate: '',
    issueDate: null,
    expirationDate: null,
    status: asset.status as Patent['status'],
    assignee: '',
    inventors: [],
    jurisdiction: 'US',
    technologyArea: asset.technologyArea ?? '',
    patentFamily: null,
    claims: [],
    citedReferences: [],
    forwardCitations: 0,
  }));
}

function buildLicenseObjects(
  classified: ClassifiedAsset[],
  rawDocs: Array<{ filename: string; content: string }>
): Array<{ license: IPLicense; fullText: string }> {
  return classified.map(asset => ({
    license: {
      licenseId: asset.extractedIdentifier ?? asset.filename,
      licenseType: 'inbound' as const,
      grantor: '',
      grantee: '',
      scope: 'non-exclusive' as const,
      field_of_use: null,
      territory: 'worldwide',
      royaltyStructure: '',
      term: '',
      changeOfControlProvision: null,
      ipCovered: [],
    },
    fullText: rawDocs[asset.documentIndex]?.content ?? '',
  }));
}

function getDocContent(
  docs: Array<{ filename: string; content: string }>,
  patent: Patent
): string {
  const doc = docs.find(d => d.content.includes(patent.patentNumber));
  return doc?.content ?? '';
}

function getAssignmentDocs(
  classified: ClassifiedAsset[],
  rawDocs: Array<{ filename: string; content: string }>,
  patent: Patent
): ChainOfTitleInput['assignmentDocuments'] {
  return classified
    .filter(a => a.assetType === 'assignment')
    .map(a => ({
      documentTitle: a.filename,
      content: rawDocs[a.documentIndex]?.content ?? '',
      recordedDate: null,
      recordedAtUSPTO: false,
    }));
}

function getInventorAgreements(
  rawDocs: Array<{ filename: string; content: string }>,
  patent: Patent
): ChainOfTitleInput['inventorAgreements'] {
  return patent.inventors.map(inventor => ({
    inventorName: inventor,
    agreementType: 'none' as const,
    content: null,
    signedDate: null,
  }));
}
```


\newpage


## Open-Source License Compliance


A workflow adjacent to trade secret audit and increasingly critical in
IP due diligence is open-source license compliance. Every modern software
product depends on open-source libraries. Most of those libraries are
licensed under permissive terms (MIT, Apache 2.0, BSD) that pose minimal
risk. But some use copyleft licenses (GPL, AGPL, LGPL) that impose
obligations on derivative works, potentially requiring the licensee to
disclose their own proprietary source code. In an acquisition context,
undisclosed copyleft contamination can destroy the value of proprietary
software assets.


### The BitsBound GPL Audit


This is not theoretical. When building BitsBound, I conducted a full
dependency audit of every library in the codebase. The concern was
straightforward: BitsBound is a proprietary SaaS product. If any
dependency was licensed under GPL or AGPL, and if BitsBound's use of
that dependency constituted a "derivative work" under the license terms,
then BitsBound would be obligated to release its own source code under
the same license. For a proprietary product, that obligation is
existential.


The audit involved traversing the entire dependency tree (not just
direct dependencies, but transitive dependencies, dependencies of
dependencies), identifying the license of each package, flagging any
copyleft license, and for each flagged package, analyzing whether the
usage pattern created a derivative work obligation. The result was a
license inventory: a complete map of every dependency, its license, its
usage pattern, and its risk assessment.


This is precisely the kind of work a pipeline can automate. The
dependency tree is structured data (package.json, lockfiles, go.mod).
The license identification is a classification problem. The derivative
work analysis requires legal reasoning about software architecture. A
multi-agent pipeline with a dependency scanner, a license classifier,
and a derivative work analyst can produce a license inventory in minutes
that would take a manual review days.


```typescript
// open-source-license-audit.ts
// Scan dependency tree for copyleft license contamination
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface DependencyInfo {
  packageName: string;
  version: string;
  license: string;
  isDirect: boolean;        // direct dependency vs. transitive
  dependencyChain: string[];  // path from root to this package
}

type RiskLevel = 'copyleft_high' | 'copyleft_moderate' | 'weak_copyleft'
  | 'permissive' | 'unknown';

interface LicenseAuditResult {
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  licenseBreakdown: Record<string, number>;
  flaggedPackages: FlaggedPackage[];
  overallRisk: 'clean' | 'review_needed' | 'contamination_risk';
  recommendations: string[];
}

interface FlaggedPackage {
  dependency: DependencyInfo;
  riskLevel: RiskLevel;
  license: string;
  obligation: string;
  usageAnalysis: string;
  isDerivativeWork: 'yes' | 'likely' | 'unlikely' | 'no' | 'needs_review';
  alternative: string | null;
}

async function auditOpenSourceLicenses(
  dependencies: DependencyInfo[]
): Promise<LicenseAuditResult> {
  // Phase 1: Classify license risk for all dependencies
  const riskClassifications = classifyLicenseRisk(dependencies);

  // Phase 2: Deep analysis of flagged (copyleft) packages
  const flaggedDeps = riskClassifications.filter(
    c => c.riskLevel !== 'permissive'
  );

  const flaggedResults = await Promise.allSettled(
    flaggedDeps.map(async (flagged) => {
      const prompt = [
        'You are an open-source licensing attorney analyzing whether',
        'a proprietary software product\'s use of a copyleft-licensed',
        'dependency creates a derivative work obligation.',
        '',
        `## Flagged Dependency`,
        `Package: ${flagged.dependency.packageName}@${flagged.dependency.version}`,
        `License: ${flagged.dependency.license}`,
        `Direct Dependency: ${flagged.dependency.isDirect}`,
        `Dependency Chain: ${flagged.dependency.dependencyChain.join(' → ')}`,
        '',
        '## Analysis Required',
        '1. What obligations does this license impose?',
        '2. Under what circumstances does use create a "derivative work"?',
        '3. Does dynamic linking vs. static linking matter for this license?',
        '4. If the software is SaaS (never distributed), does the',
        '   copyleft obligation still apply? (GPL: no, AGPL: yes)',
        '5. Are there permissively-licensed alternatives?',
        '6. What is the recommended course of action?',
      ].join('\n');

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 8_192,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';

      return {
        dependency: flagged.dependency,
        riskLevel: flagged.riskLevel,
        license: flagged.dependency.license,
        obligation: extractObligation(text),
        usageAnalysis: text.slice(0, 1000),
        isDerivativeWork: assessDerivativeWork(text),
        alternative: extractAlternative(text),
      } as FlaggedPackage;
    })
  );

  const flaggedPackages = flaggedResults
    .filter((r): r is PromiseFulfilledResult<FlaggedPackage> =>
      r.status === 'fulfilled')
    .map(r => r.value);

  // Build license breakdown
  const licenseBreakdown: Record<string, number> = {};
  for (const dep of dependencies) {
    licenseBreakdown[dep.license] = (licenseBreakdown[dep.license] ?? 0) + 1;
  }

  const hasContamination = flaggedPackages.some(
    f => f.isDerivativeWork === 'yes' || f.isDerivativeWork === 'likely'
  );
  const needsReview = flaggedPackages.some(
    f => f.isDerivativeWork === 'needs_review'
  );

  return {
    totalDependencies: dependencies.length,
    directDependencies: dependencies.filter(d => d.isDirect).length,
    transitiveDependencies: dependencies.filter(d => !d.isDirect).length,
    licenseBreakdown,
    flaggedPackages,
    overallRisk: hasContamination ? 'contamination_risk'
      : needsReview ? 'review_needed' : 'clean',
    recommendations: generateLicenseRecommendations(flaggedPackages),
  };
}

function classifyLicenseRisk(
  dependencies: DependencyInfo[]
): Array<{ dependency: DependencyInfo; riskLevel: RiskLevel }> {
  const copyleftHigh = ['AGPL-3.0', 'AGPL-3.0-only', 'AGPL-3.0-or-later'];
  const copyleftModerate = ['GPL-2.0', 'GPL-3.0', 'GPL-2.0-only',
    'GPL-3.0-only', 'GPL-2.0-or-later', 'GPL-3.0-or-later'];
  const weakCopyleft = ['LGPL-2.1', 'LGPL-3.0', 'MPL-2.0', 'EPL-1.0',
    'EPL-2.0', 'CDDL-1.0'];
  const permissive = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause',
    'ISC', 'Unlicense', 'CC0-1.0', '0BSD'];

  return dependencies.map(dep => {
    const license = dep.license.toUpperCase().trim();
    let riskLevel: RiskLevel;

    if (copyleftHigh.some(l => license.includes(l.toUpperCase()))) {
      riskLevel = 'copyleft_high';
    } else if (copyleftModerate.some(l => license.includes(l.toUpperCase()))) {
      riskLevel = 'copyleft_moderate';
    } else if (weakCopyleft.some(l => license.includes(l.toUpperCase()))) {
      riskLevel = 'weak_copyleft';
    } else if (permissive.some(l => license.includes(l.toUpperCase()))) {
      riskLevel = 'permissive';
    } else {
      riskLevel = 'unknown';
    }

    return { dependency: dep, riskLevel };
  });
}

function extractObligation(text: string): string {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('obligation')) {
      return line.replace(/^[-•*\d.)\s]+/, '').trim();
    }
  }
  return 'See full analysis';
}

function assessDerivativeWork(
  text: string
): FlaggedPackage['isDerivativeWork'] {
  const lower = text.toLowerCase();
  if (lower.includes('clearly constitutes a derivative')
      || lower.includes('is a derivative work')) return 'yes';
  if (lower.includes('likely constitutes')
      || lower.includes('probably a derivative')) return 'likely';
  if (lower.includes('unlikely to constitute')
      || lower.includes('probably not a derivative')) return 'unlikely';
  if (lower.includes('not a derivative work')
      || lower.includes('does not create a derivative')) return 'no';
  return 'needs_review';
}

function extractAlternative(text: string): string | null {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('alternative')
        && line.match(/^[-•*\d.)\s]/)) {
      return line.replace(/^[-•*\d.)\s]+/, '').trim();
    }
  }
  return null;
}

function generateLicenseRecommendations(
  flagged: FlaggedPackage[]
): string[] {
  const recs: string[] = [];

  const contaminated = flagged.filter(
    f => f.isDerivativeWork === 'yes' || f.isDerivativeWork === 'likely'
  );
  for (const pkg of contaminated) {
    if (pkg.alternative) {
      recs.push(
        `Replace ${pkg.dependency.packageName} (${pkg.license}) with `
        + `${pkg.alternative} (permissive license).`
      );
    } else {
      recs.push(
        `Isolate ${pkg.dependency.packageName} (${pkg.license}) behind `
        + `a process boundary to avoid derivative work creation.`
      );
    }
  }

  const unknowns = flagged.filter(f => f.riskLevel === 'unknown');
  if (unknowns.length > 0) {
    recs.push(
      `${unknowns.length} packages have unrecognized licenses. `
      + `Manual review required.`
    );
  }

  if (flagged.length === 0) {
    recs.push('No copyleft dependencies detected. Dependency tree is clean.');
  }

  return recs;
}
```


> **Warning**
>
> The GPL vs. AGPL distinction is critical for SaaS products. The GPL
> copyleft obligation is triggered by "distribution" of the software.
> SaaS products are never distributed to users; they run on the
> provider's servers. Therefore, GPL-licensed dependencies in a SaaS
> codebase do *not* trigger the copyleft obligation. AGPL was
> specifically created to close this "SaaS loophole." AGPL treats
> network interaction (users accessing the software over a network) as
> equivalent to distribution. If your SaaS product uses an AGPL-licensed
> library, you must offer the source code to your users. This
> distinction determines whether a dependency is a non-issue (GPL in
> SaaS) or a codebase-threatening contamination risk (AGPL in SaaS).
> Your pipeline must classify these differently.


\newpage


## Cost Analysis and Production Considerations


IP analytics pipelines are computationally expensive. A full portfolio
analysis of 47 patents with six prior art research agents per patent,
plus trademark clearance, trade secret audit, and license encumbrance
review, involves hundreds of AI calls. Understanding the cost structure
is essential for pricing this as a service and for making architecture
decisions about where to invest compute.


### Cost Breakdown by Pipeline Stage


| Stage | Agents per Asset | Tokens per Call | Assets (47 patents) | Estimated Cost |
|---|---|---|---|---|
| Intake Classification | 1 per batch of 20 | ~4K in, ~2K out | 3 batches | $0.24 |
| Claims Analysis | 1 per patent | ~20K in, ~8K out | 47 | $19.62 |
| Prior Art Research | 6 per patent | ~8K in, ~8K out | 282 | $53.58 |
| Prior Art Synthesis | 1 per patent | ~30K in, ~8K out | 47 | $25.85 |
| Licensing Analysis | 1 per patent | ~12K in, ~8K out | 47 | $11.28 |
| FTO Analysis | 1 per product | ~15K in, ~10K out | 5 | $1.88 |
| Chain of Title | 1 per patent | ~10K in, ~6K out | 47 | $8.46 |
| License Encumbrance | 1 per license | ~8K in, ~4K out | 12 | $1.80 |
| Trademark Clearance | ~10 total | ~5K in, ~4K out | 10 | $2.25 |
| Trade Secret Audit | 5 specialists | ~6K in, ~4K out | 5 | $1.05 |
| Portfolio Synthesis | 1 | ~50K in, ~20K out | 1 | $2.25 |
| **Total** | | | **~506 calls** | **~$128** |

At Opus pricing ($15/M input, $75/M output), a comprehensive IP
analytics engagement covering 47 patents costs approximately $128 in
API compute. Compare this to the $380,000 that the outside IP counsel
charged for a similar scope of work. Even accounting for the engineering
time to build and maintain the pipeline, the economics are
transformative.


> **Practice Tip**
>
> The cost table reveals that prior art research is the single most
> expensive pipeline stage (42% of total cost) because it runs six
> agents per patent. For preliminary portfolio assessments, consider
> running only three research agents (USPTO, Google Patents, Academic)
> instead of all six. This reduces prior art research cost by 50%
> while still covering the most productive databases. Reserve the full
> six-agent configuration for patents flagged as high-value or
> high-risk in the initial assessment.


### Concurrency and Rate Limiting


With 506 API calls, rate limiting becomes a practical concern. The
Anthropic API enforces rate limits on both requests per minute and
tokens per minute. A pipeline that naively launches all 506 calls
simultaneously will hit rate limits and produce cascading failures.


The solution is the concurrency limiter pattern from Chapter 4.
Wrap `Promise.allSettled` with a semaphore that limits the number of
concurrent API calls:


```typescript
// concurrency-limiter.ts
// Rate-limited parallel execution for large pipelines
class ConcurrencyLimiter {
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.active >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// Usage: limit to 20 concurrent API calls
const limiter = new ConcurrencyLimiter(20);

const results = await Promise.allSettled(
  patents.map(patent =>
    limiter.run(() => analyzePatentClaims({
      patent,
      specificationText: getDocContent(docs, patent),
    }))
  )
);
```


\newpage


## Connecting IP Analytics to the Legal Engineering Stack


IP analytics does not exist in isolation. It connects to several other
workflows in the Legal Engineering stack:


**M&A Due Diligence (Chapter 14)**: IP due diligence is a workstream
within the broader M&A due diligence pipeline. The IP analytics output
feeds directly into the deal-level risk matrix and the diligence report.
The IP portfolio valuation informs the purchase price allocation.
Chain-of-title findings generate closing conditions.


**Contract Analytics (Chapter 9)**: IP license agreements are contracts.
The license encumbrance review uses the same term extraction and risk
scoring patterns from Chapter 9, specialized for IP-specific terms like
change-of-control provisions, scope of grant, and field-of-use
restrictions.


**Obligation Tracking (Chapter 13)**: Patent maintenance fees, trademark
renewal deadlines, and license reporting obligations are all trackable
obligations. The output of the IP analytics pipeline can feed directly
into an obligation tracking system that generates calendar events and
deadline alerts for each obligation.


**Third-Party Risk (Chapter 11)**: Open-source license compliance is a
third-party risk assessment. The dependency audit identifies risks from
third-party software, just as the vendor risk workflow identifies risks
from third-party service providers.


**Litigation Support (Chapter 17)**: Patent litigation requires claim
construction, prior art analysis, and infringement mapping. The same
agents built for IP analytics serve double duty as litigation support
tools when a dispute arises.


> **Key Concept**
>
> The Legal Engineering stack is a network, not a sequence. Each workflow
> produces structured output that other workflows consume. The
> `PriorArtReference` from IP analytics becomes evidence in litigation
> support. The `LicenseEncumbranceResult` from IP due diligence becomes
> a closing condition in the M&A pipeline. The `TradeSecretCandidate`
> from the trade secret audit becomes a monitoring obligation in the
> obligation tracker. Building workflows with shared type definitions
> and structured outputs is what makes this interconnection possible.


\newpage


## Summary


IP analytics transforms intellectual property from a collection of
legal documents into a strategic intelligence asset. The pipeline
architecture mirrors the structure of sophisticated IP advisory
practice: specialized analysts operating in parallel, each examining
assets through a different lens, with a synthesis layer that combines
individual findings into portfolio-level intelligence.


The key components of the IP analytics pipeline are:


1. **Patent Claim Scope Analysis** decomposes claims into structural
   components (preamble, transitional phrase, body elements), builds
   dependency trees, identifies the broadest independent claims, and
   flags vulnerabilities. This is the analytical foundation for
   everything downstream.

2. **Prior Art Research Agents** search six databases in parallel
   (USPTO, EPO, WIPO, Google Patents, academic literature, standards
   bodies), then a synthesis agent deduplicates, ranks, and maps
   findings to specific claim limitations. The fan-out/fan-in
   architecture ensures comprehensive coverage while maintaining
   analytical precision.

3. **Portfolio Valuation Synthesis** aggregates individual patent
   analyses into technology coverage maps, valuation ranges with
   disclosed methodology (Georgia-Pacific framework for licensing
   potential), maintenance recommendations, and strategic roadmaps.

4. **Trademark Clearance** performs two-phase search (knockout, then
   full clearance) and applies the 13-factor DuPont test for
   likelihood-of-confusion analysis on each potential conflict.

5. **Trade Secret Audit** deploys five category specialists (technical,
   business, process, customer, financial) in parallel to identify
   trade secret candidates, assess protection measure adequacy, and
   generate remediation recommendations.

6. **IP Due Diligence** assembles all components into an
   acquisition-context workflow: chain-of-title verification, license
   encumbrance review, freedom-to-operate analysis, open-source
   compliance audit, and deal recommendation synthesis.


The patterns are the same ones you have used throughout this book:
TIRO decomposition for analytical rigor, `Promise.allSettled()` for
parallel execution, specialist agents for domain expertise, structured
outputs for type-safe extraction, and synthesis agents for
portfolio-level intelligence. IP analytics applies them to the most
valuable and least systematized category of legal assets.


---


**Key Takeaways**

- IP analytics is a hierarchical intelligence problem: portfolio-level conclusions depend on patent-level analyses, which depend on claim-level parsing. The pipeline must build bottom-up.
- Patent claim scope analysis requires parsing three structural components (preamble, transitional phrase, body elements) and building dependency trees that reveal strategic fallback positions.
- Prior art research benefits enormously from parallel multi-database search. Six specialist agents (USPTO, EPO, WIPO, Google Patents, Academic, Standards) with a synthesis agent produce comprehensive coverage that no single search can match.
- Portfolio valuation combines technical assessment (claim scope, validity strength) with market intelligence (Georgia-Pacific factors, licensing comparables) and strategic analysis (coverage gaps, competitive positioning).
- Trademark clearance should proceed in two phases: knockout search for identical marks first, then full DuPont analysis only for marks that survive knockout.
- Trade secret protection requires proactive identification and documented "reasonable measures." A trade secret audit pipeline identifies candidates across five categories and evaluates protection adequacy.
- IP due diligence in M&A combines all IP analytics workflows under time pressure. Chain-of-title verification, license encumbrance review, and freedom-to-operate analysis are the three highest-risk dimensions.
- Open-source license compliance distinguishes between GPL (SaaS-safe) and AGPL (SaaS-dangerous), a distinction that determines whether a copyleft dependency is a non-issue or an existential risk.
- The IP analytics pipeline for 47 patents costs approximately $128 in API compute, compared to $380,000 for equivalent manual review. The economics are transformative.


\newpage
