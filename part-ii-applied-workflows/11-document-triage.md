# Chapter 11: Document Triage

*Batch Classification, Tree-of-Thought Routing, and Urgency-Driven Priority Queues*

At 8:47 AM on a Tuesday, the general counsel of a mid-market technology company opens
her laptop. Overnight, 23 documents arrived: a draft MSA from a new SaaS vendor, two
amendments to existing NDAs, a trademark demand letter with a 14-day response deadline,
three invoices with billing discrepancies, a term sheet for a Series B investment that
expires in 17 days, an employee separation agreement requiring ADEA compliance review,
an SEC subpoena with a 17-day production deadline, and a commercial lease renewal notice
with a rent increase demanding a response by month's end. Plus miscellaneous correspondence,
board materials, and a document that might be a side letter or might be an amendment,
and nobody is sure which.


She needs to know, within minutes, which documents require immediate action, which
team should handle each one, what the deadlines are, and what she can safely defer
to next week. She does not need to read all 23 documents herself. She needs a triage
report that tells her where to focus, in what order, and why.


That triage report is the output of the system this chapter teaches you to build.
Document triage is the gateway workflow: the first system that touches incoming
documents before they enter any other pipeline. It classifies, routes, prioritizes,
and produces initial analysis briefs that enable attorneys to act on documents
without first spending hours reading them. And unlike the other workflows in this book,
where architectural complexity is an optimization (multi-pass drafting produces better
contracts than single-pass, but single-pass still produces a contract), document triage
has empirical evidence that multi-agent architecture is not optional. It is the
difference between a system that works and a system that does not.


## TLE R&D Evidence: 96 vs. 52


Before we build anything, let us look at the data. TLE R&D Experiment 02,
"Does Multi-Agent Triage Produce Actionable Intelligence?", tested three pipeline
architectures against the same batch of 8 legal documents representing a single day's
intake for a mid-market corporate legal department. The documents were realistic and
diverse: a SaaS MSA draft, an NDA amendment, a trademark demand letter, an IT invoice,
a VC term sheet, an employee separation agreement, an SEC subpoena, and a commercial
lease renewal notice.


Three architectures were tested:


| Variation | Architecture | API Calls |
|---|---|---|
| Single Classifier | One prompt, all documents | 1 |
| Classifier + Extractor | Two-pass: classify then extract | 2 |
| Specialist Triage Team | 6 parallel specialists + synthesizer | 7 |


Each variation's output was scored by an independent Opus-powered judge on four
criteria, each worth 25 points: Classification Accuracy, Extraction Completeness,
Risk Identification, and Actionability.


The results from the most representative run:


| Variation | Classification | Extraction | Risk ID | Actionability | Total |
|---|---|---|---|---|---|
| Single Classifier | 17 | 13 | 12 | 10 | **52** |
| Classifier + Extractor | 21 | 22 | 17 | 12 | **72** |
| Specialist Triage Team | 24 | 24 | 24 | 24 | **96** |


The specialist triage team scored 96 out of 100. The single classifier scored 52.
That is not a marginal improvement. That is the difference between a system a general
counsel would trust with her morning triage queue and a system that would get a
paralegal fired for producing work of that quality.


The cost difference: $0.05 for the single classifier versus $2.04 for the specialist
team. For a legal department where a missed deadline on an SEC subpoena can result in
contempt sanctions, or where overlooking the connection between a regulatory investigation
and an active Series B fundraise can result in securities fraud liability, $2.04 per
triage batch is not a cost. It is insurance.


<svg viewBox="0 0 900 450" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Segoe UI', system-ui, sans-serif; background: #fafafa;">
  <!-- Title -->
  <text x="450" y="35" text-anchor="middle" font-size="16" font-weight="bold" fill="#1a1a2e">Figure 11.1 — TLE R&D Experiment 02: Multi-Agent Triage Quality Scores</text>

  <!-- Y-axis -->
  <line x1="120" y1="60" x2="120" y2="370" stroke="#1a1a2e" stroke-width="1.5"/>
  <text x="60" y="220" text-anchor="middle" font-size="12" fill="#1a1a2e" transform="rotate(-90,60,220)">Score (out of 100)</text>

  <!-- Y-axis labels -->
  <text x="110" y="85" text-anchor="end" font-size="11" fill="#666">100</text>
  <line x1="115" y1="82" x2="125" y2="82" stroke="#666" stroke-width="1"/>
  <text x="110" y="143" text-anchor="end" font-size="11" fill="#666">80</text>
  <line x1="115" y1="140" x2="800" y2="140" stroke="#eee" stroke-width="1"/>
  <text x="110" y="201" text-anchor="end" font-size="11" fill="#666">60</text>
  <line x1="115" y1="198" x2="800" y2="198" stroke="#eee" stroke-width="1"/>
  <text x="110" y="259" text-anchor="end" font-size="11" fill="#666">40</text>
  <line x1="115" y1="256" x2="800" y2="256" stroke="#eee" stroke-width="1"/>
  <text x="110" y="317" text-anchor="end" font-size="11" fill="#666">20</text>
  <line x1="115" y1="314" x2="800" y2="314" stroke="#eee" stroke-width="1"/>
  <text x="110" y="373" text-anchor="end" font-size="11" fill="#666">0</text>

  <!-- X-axis -->
  <line x1="120" y1="370" x2="800" y2="370" stroke="#1a1a2e" stroke-width="1.5"/>

  <!-- Bar group 1: Single Classifier -->
  <rect x="170" y="220" width="50" height="150" rx="3" fill="#e74c3c" opacity="0.85"/>
  <text x="195" y="212" text-anchor="middle" font-size="14" fill="#e74c3c" font-weight="bold">52</text>
  <text x="195" y="400" text-anchor="middle" font-size="11" fill="#1a1a2e">Single</text>
  <text x="195" y="415" text-anchor="middle" font-size="11" fill="#1a1a2e">Classifier</text>

  <!-- Stacked segments for Single Classifier -->
  <rect x="175" y="321" width="40" height="44" rx="2" fill="#c0392b" opacity="0.7"/>
  <text x="195" y="348" text-anchor="middle" font-size="9" fill="white">17</text>
  <rect x="175" y="283" width="40" height="38" rx="2" fill="#e74c3c" opacity="0.7"/>
  <text x="195" y="306" text-anchor="middle" font-size="9" fill="white">13</text>
  <rect x="175" y="249" width="40" height="34" rx="2" fill="#e74c3c" opacity="0.5"/>
  <text x="195" y="270" text-anchor="middle" font-size="9" fill="white">12</text>
  <rect x="175" y="220" width="40" height="29" rx="2" fill="#e74c3c" opacity="0.35"/>
  <text x="195" y="238" text-anchor="middle" font-size="9" fill="white">10</text>

  <!-- Bar group 2: Classifier + Extractor -->
  <rect x="370" y="162" width="50" height="208" rx="3" fill="#f39c12" opacity="0.85"/>
  <text x="395" y="154" text-anchor="middle" font-size="14" fill="#f39c12" font-weight="bold">72</text>
  <text x="395" y="400" text-anchor="middle" font-size="11" fill="#1a1a2e">Classifier +</text>
  <text x="395" y="415" text-anchor="middle" font-size="11" fill="#1a1a2e">Extractor</text>

  <!-- Bar group 3: Specialist Triage Team -->
  <rect x="570" y="94" width="50" height="276" rx="3" fill="#16a085" opacity="0.85"/>
  <text x="595" y="86" text-anchor="middle" font-size="14" fill="#16a085" font-weight="bold">96</text>
  <text x="595" y="400" text-anchor="middle" font-size="11" fill="#1a1a2e">Specialist</text>
  <text x="595" y="415" text-anchor="middle" font-size="11" fill="#1a1a2e">Triage Team</text>

  <!-- Delta annotation -->
  <line x1="220" y1="220" x2="570" y2="94" stroke="#1a1a2e" stroke-width="1.5" stroke-dasharray="6,3"/>
  <rect x="680" y="130" width="110" height="50" rx="6" fill="#1a1a2e"/>
  <text x="735" y="152" text-anchor="middle" font-size="12" fill="#16a085" font-weight="bold">+44 points</text>
  <text x="735" y="170" text-anchor="middle" font-size="10" fill="white">85% improvement</text>

  <!-- Legend -->
  <rect x="170" y="435" width="12" height="12" rx="2" fill="#1a1a2e" opacity="0.8"/>
  <text x="188" y="446" font-size="10" fill="#666">Classification</text>
  <rect x="280" y="435" width="12" height="12" rx="2" fill="#1a1a2e" opacity="0.6"/>
  <text x="298" y="446" font-size="10" fill="#666">Extraction</text>
  <rect x="380" y="435" width="12" height="12" rx="2" fill="#1a1a2e" opacity="0.4"/>
  <text x="398" y="446" font-size="10" fill="#666">Risk ID</text>
  <rect x="470" y="435" width="12" height="12" rx="2" fill="#1a1a2e" opacity="0.25"/>
  <text x="488" y="446" font-size="10" fill="#666">Actionability</text>
</svg>


Across 8 experiment runs, the specialist triage team scored between 69 and 96 (mean:
approximately 91), while the single classifier scored between 41 and 93 (mean:
approximately 55). The variance tells its own story: the single classifier occasionally
produces decent output (score of 93 on one run) but is unreliable, while the specialist
team consistently delivers near-ceiling quality. In production systems where reliability
matters as much as peak performance, consistency is the metric that counts.


> **Insight**
>
> The actionability criterion showed the largest gap. The single classifier scored
> 10/25 on actionability: it labeled documents but produced nothing an attorney
> could act on without re-reading the original. The specialist team scored 24/25:
> its output contained specific action items with owners, deadlines, and
> cross-document intelligence. The difference between a label and a brief is the
> difference between triage that saves time and triage that wastes it.


\newpage


## The Boomi Experience: Why I Built This Exact System


Before I built it with AI, I built it manually. At Boomi (a Dell Technologies
subsidiary), I was the corporate technology attorney responsible for the company's
inbound legal document flow. Every contract, amendment, subpoena, demand letter, and
regulatory filing that arrived went through me before reaching the appropriate legal
team. The triage system I built was a Jira-based intake workflow with manual
classification, risk-level routing, and priority queues.


The system worked. Jira tickets were created for each incoming document. I classified
them by type (contract, amendment, correspondence, regulatory, litigation), assigned
a risk level (critical, high, medium, low), routed them to the appropriate team
(corporate, employment, IP, regulatory), and set SLA timers for response deadlines. A
critical-risk document (SEC subpoena, litigation hold notice, regulatory demand) had a
4-hour SLA. A high-risk document (material contract over $500K, amendment to a
master agreement) had a 24-hour SLA. Medium and low followed accordingly.


What made the system effective was not the classification itself (any competent
attorney can classify a document) but the *metadata I attached to each ticket*. I did
not just label a document "NDA Amendment." I noted that it was the third amendment to
a specific NDA, that it expanded scope to cover potential M&A activity, that the
original NDA did not contemplate acquisition-related diligence, and that the standstill
provision in the amendment created obligations that the M&A team needed to know about
before proceeding with the deal. That level of contextual triage is what makes the
difference between a routing system and an intelligence system.


The problem was scale. Manual triage at that level of depth takes 15 to 30 minutes
per document. When 20 documents arrive overnight, that is 5 to 10 hours of triage
before any substantive legal work begins. The attorney doing triage becomes a
bottleneck. If they are out sick, on vacation, or in a deposition, documents sit
unprocessed. Deadlines approach silently.


The AI-powered triage pipeline replicates the depth of manual expert triage at
machine speed. The 6-specialist architecture is not arbitrary: it mirrors the mental
checklist I ran on every document at Boomi. What type is it? What are the key terms?
What are the deadlines? What are the risks? What is missing? Who handles it and how
urgently? Six questions. Six specialists. One synthesizer to merge them into the
kind of intake brief I used to write by hand.


> **Key Concept**
>
> AI pipeline design is often best informed by the manual workflow it replaces.
> The specialist triage team's six agents map directly to the six mental operations
> an experienced attorney performs during manual triage. The multi-agent architecture
> does not introduce artificial complexity; it formalizes the cognitive decomposition
> that experts already perform implicitly. The pipeline makes the implicit explicit
> and the sequential parallel.


\newpage


## TIRO Decomposition: The Triage Operation


**Trigger**: Documents arrive. This may be a batch upload to a document management
system, an email forwarding rule that deposits attachments into an intake folder,
an API webhook from a CLM platform, or a manual upload by a paralegal. The trigger
is any event that introduces one or more unclassified documents into the legal
department's queue.


**Input**: One or more documents in any format the pipeline supports (PDF, DOCX,
plain text). Alongside the documents, the pipeline receives triage rules: the
organization's routing configuration (which document types go to which teams),
urgency thresholds (what constitutes critical vs. routine), and any contextual
information about active matters (ongoing litigation, pending transactions, regulatory
investigations) that should influence routing decisions.


**Requirements**:

*Arbitration*: When a document resists clean classification (is it a side letter or
an amendment? is it a vendor agreement or a partnership agreement?), the pipeline
must not force a single classification. The tree-of-thought routing pattern explored
later in this chapter handles ambiguity by evaluating multiple candidate classifications
and selecting the one with the highest confidence after specialist evaluation. This is
the arbitration mechanism: conflicting possible classifications are resolved through
structured deliberation, not random choice.

*Definitions*: The pipeline must maintain a taxonomy of document types that is
granular enough to be useful for routing. "Contract" is too broad. "SaaS Master
Services Agreement (Draft, Unsigned)" is useful. "NDA" is too broad.
"Mutual NDA Amendment (Third Amendment, Scope Expansion for Potential Acquisition
Activity)" is useful. The definitions layer determines the resolution of the
classification output, and resolution determines routing precision.

*Validations*: Every classification must carry a confidence score. Documents classified
below the confidence threshold (typically 0.8) are flagged for human review or
subjected to tree-of-thought routing for deeper evaluation. The pipeline must also
validate that routing recommendations reference real teams and real SLA tiers in the
organization's configuration.

*Transformations*: Raw documents are transformed into structured triage briefs. Each
brief contains the classification, extracted metadata (parties, dates, financial
terms), risk flags, deadline calendar entries, gap analysis (what is missing from the
document), and specific action items with owners and deadlines. The transformation
from document to brief is the core value proposition of the triage pipeline.


**Output**: A prioritized triage queue. Each document receives a structured brief
and a priority score. The queue is sorted by urgency (highest priority first) with
cross-document intelligence annotations that flag relationships between documents in
the batch. The output is immediately actionable: an attorney reviewing the queue can
assign tasks, set calendar reminders, and begin substantive work without first
reading the raw documents.


\newpage


## Pipeline Architecture


The triage pipeline operates in five rounds. Round 1 accepts the batch and extracts
basic metadata. Round 2 classifies each document in parallel (with low-confidence
items flagged for Round 3). Round 3 applies tree-of-thought routing to ambiguous
documents. Round 4 assesses urgency and generates routing recommendations. Round 5
produces the final triage report with cross-document analysis.


```
┌─────────────────────────────────────────────────────────────────────┐
│                   DOCUMENT TRIAGE PIPELINE                          │
│                    5-Round Architecture                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ROUND 1: Batch Intake                                         │  │
│  │ Accept batch → extract file metadata → OCR if needed          │  │
│  └──────────────────────────┬────────────────────────────────────┘  │
│                             ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ROUND 2: Parallel Classification                              │  │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  │
│  │ │Doc 1 │ │Doc 2 │ │Doc 3 │ │Doc 4 │ │Doc 5 │ │Doc N │       │  │
│  │ │ 0.95 │ │ 0.92 │ │ 0.61 │ │ 0.97 │ │ 0.55 │ │ 0.88 │       │  │
│  │ │  ✓   │ │  ✓   │ │  ⚠   │ │  ✓   │ │  ⚠   │ │  ✓   │       │  │
│  │ └──────┘ └──────┘ └──┬───┘ └──────┘ └──┬───┘ └──────┘       │  │
│  └──────────────────────┼───────────────────┼────────────────────┘  │
│       High confidence   │                   │   Low confidence      │
│       → Round 4         │                   │   → Round 3           │
│                         ▼                   ▼                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ROUND 3: Tree-of-Thought Routing (ambiguous documents only)   │  │
│  │                                                               │  │
│  │  Doc 3: "NDA or Side Letter?"                                 │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                 │  │
│  │  │ Branch A  │  │ Branch B  │  │ Branch C  │                 │  │
│  │  │ NDA Amend │  │Side Letter│  │ MOU       │                 │  │
│  │  │ conf: 0.82│  │ conf: 0.45│  │ conf: 0.21│                 │  │
│  │  │    ✓      │  │   pruned  │  │   pruned  │                 │  │
│  │  └───────────┘  └───────────┘  └───────────┘                 │  │
│  └──────────────────────┬────────────────────────────────────────┘  │
│                         ▼                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ROUND 4: Priority Assessment & Routing                        │  │
│  │                                                               │  │
│  │  6 specialists in parallel (per batch):                       │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                │  │
│  │  │ Document   │ │ Key Terms  │ │ Deadline   │                │  │
│  │  │ Classifier │ │ Extractor  │ │ Identifier │                │  │
│  │  └────────────┘ └────────────┘ └────────────┘                │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                │  │
│  │  │ Risk & Red │ │Completeness│ │ Urgency &  │                │  │
│  │  │ Flag Det.  │ │ Gap Anal.  │ │ Router     │                │  │
│  │  └────────────┘ └────────────┘ └────────────┘                │  │
│  └──────────────────────┬────────────────────────────────────────┘  │
│                         ▼                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ROUND 5: Synthesis & Triage Report                            │  │
│  │                                                               │  │
│  │  Synthesizer merges 6 specialist outputs into:                │  │
│  │  • Executive summary (60-second read)                         │  │
│  │  • Deadline calendar                                          │  │
│  │  • Per-document intake briefs                                 │  │
│  │  • Cross-document intelligence                                │  │
│  │  • Resource allocation recommendation                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

*Figure 11.2 — Document triage pipeline: five rounds from batch intake to prioritized triage report. Documents with low classification confidence are routed through tree-of-thought resolution before priority assessment.*


\newpage


## Type Definitions


The type system for document triage captures the progression from raw document to
classified, assessed, and routed triage brief. Each stage adds structured information
to the document record.


```typescript
// document-triage-types.ts
// Core type definitions for the document triage pipeline

// ─── Document Identity ───

interface TriageDocument {
  id: string;
  title: string;
  content: string;
  fileType?: 'pdf' | 'docx' | 'txt' | 'eml' | 'html';
  receivedAt: string;           // ISO 8601
  source?: string;              // 'email', 'upload', 'api', 'clm'
  byteSize?: number;
}

// ─── Classification ───

interface DocumentClassification {
  documentId: string;
  primaryType: DocumentType;
  subType: string;              // Granular: "SaaS MSA (Draft, Unsigned)"
  documentStatus: DocumentStatus;
  counterpartyPosture: CounterpartyPosture;
  legalDomain: LegalDomain;
  confidence: number;           // 0-1
  classificationMethod: 'direct' | 'tree-of-thought';
  alternateClassifications?: AlternateClassification[];
}

type DocumentType =
  | 'msa'
  | 'nda'
  | 'amendment'
  | 'side-letter'
  | 'correspondence'
  | 'demand-letter'
  | 'invoice'
  | 'term-sheet'
  | 'employment-agreement'
  | 'separation-agreement'
  | 'regulatory-filing'
  | 'subpoena'
  | 'lease'
  | 'board-resolution'
  | 'litigation-document'
  | 'memorandum'
  | 'other';

type DocumentStatus =
  | 'draft'
  | 'final-executed'
  | 'partially-executed'
  | 'unsigned'
  | 'expired'
  | 'under-negotiation'
  | 'pending-response';

type CounterpartyPosture =
  | 'cooperative'
  | 'adversarial'
  | 'regulatory'
  | 'transactional'
  | 'neutral';

type LegalDomain =
  | 'corporate-ma'
  | 'employment'
  | 'ip-trademark'
  | 'real-estate'
  | 'procurement'
  | 'finance-tax'
  | 'litigation'
  | 'regulatory-compliance'
  | 'securities'
  | 'data-privacy';

interface AlternateClassification {
  primaryType: DocumentType;
  subType: string;
  confidence: number;
  reasoning: string;
}

// ─── Tree-of-Thought Routing ───

interface ToTBranch {
  branchId: string;
  candidateType: DocumentType;
  candidateSubType: string;
  initialConfidence: number;
  specialistEvaluation: string;
  finalConfidence: number;
  pruned: boolean;
  pruneReason?: string;
}

interface ToTResult {
  documentId: string;
  branches: ToTBranch[];
  selectedBranch: ToTBranch;
  deliberationSummary: string;
}

// ─── Priority Assessment ───

interface UrgencyAssessment {
  documentId: string;
  urgencyScore: number;         // 1-5 (5 = most urgent)
  urgencyLevel: 'critical' | 'urgent' | 'elevated'
    | 'standard' | 'low';
  deadlines: Deadline[];
  financialExposure?: number;
  legalConsequences: string[];
  reversibility: 'irreversible' | 'difficult' | 'moderate' | 'easy';
  justification: string;
}

interface Deadline {
  date: string;                 // ISO 8601
  daysRemaining: number;
  description: string;
  type: 'hard' | 'soft';       // Hard = contractual/statutory
  consequence: string;
  responsible: string;
}

// ─── Routing ───

interface RoutingDecision {
  documentId: string;
  primaryTeam: string;
  primaryRole: string;          // 'partner' | 'senior-associate' | etc.
  secondaryTeams: Array<{
    team: string;
    reason: string;
  }>;
  estimatedEffortHours: number;
  actions: TriageAction[];
  escalationTriggers: string[];
}

interface TriageAction {
  timeframe: 'immediate' | 'short-term' | 'medium-term';
  description: string;
  owner: string;                // Role or team
  deadline?: string;            // ISO 8601
}

// ─── Triage Brief (per document) ───

interface TriageBrief {
  document: TriageDocument;
  classification: DocumentClassification;
  urgency: UrgencyAssessment;
  routing: RoutingDecision;
  keyTerms: string[];
  riskFlags: Array<{
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  gaps: string[];               // Missing information / incomplete items
  crossDocumentFlags: string[]; // Relationships to other docs in batch
}

// ─── Batch Triage Report ───

interface TriageReport {
  batchId: string;
  timestamp: string;
  documentCount: number;
  executiveSummary: string;
  deadlineCalendar: Deadline[];
  briefs: TriageBrief[];
  crossDocumentIntelligence: string[];
  resourceAllocation: {
    priorityQueue: string[];    // Document IDs in priority order
    teamWorkload: Record<string, number>;  // Team -> estimated hours
    externalCounselNeeds: string[];
  };
  metrics: TriagePipelineMetrics;
}

interface TriagePipelineMetrics {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalLatencyMs: number;
  claudeCalls: number;
  model: string;
  estimatedCostUsd: number;
  documentsClassified: number;
  totRoutingsPerformed: number;
}
```


> **Practice Tip**
>
> The `subType` field is where triage earns its value. A document classified as
> `primaryType: 'amendment'` with `subType: 'Mutual NDA Amendment (Third Amendment,
> Scope Expansion for Potential Acquisition Activity)'` gives the routing system
> everything it needs to send this to the M&A team rather than the general contracts
> team. The additional specificity costs a few more output tokens. The routing
> precision it enables saves hours of misdirected attorney time.


\newpage


## Tree-of-Thought Routing


Most documents classify cleanly. An MSA looks like an MSA. A demand letter looks like
a demand letter. But some documents resist single-pass classification. A letter from a
counterparty might be a side letter (supplementing an existing agreement), an amendment
(modifying specific terms), or a standalone memorandum of understanding (creating new
obligations). The formatting might not follow any standard template. The title might be
misleading or absent.


Single-pass classification handles these ambiguous documents poorly. The classifier
picks the most likely category and assigns a confidence score, but the confidence score
is the model's self-reported certainty, not a verified assessment. A model that reports
0.75 confidence in classifying a document as a "side letter" may have only considered
two possible categories before selecting one. It did not systematically explore the
alternative that this might be an amendment, evaluate what features would distinguish the
two, and make a deliberate choice.


Tree-of-thought routing introduces that systematic exploration. For documents where
initial classification confidence falls below a threshold (0.80 in the default
configuration), the pipeline branches into multiple candidate classifications, evaluates
each with a specialist diplomat, prunes low-confidence branches, and selects the surviving
classification with the highest post-evaluation confidence.


<svg viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Segoe UI', system-ui, sans-serif; background: #fafafa;">
  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#1a1a2e">Figure 11.3 — Tree-of-Thought Routing: Systematic Disambiguation</text>

  <!-- Stage 1: Ambiguous document -->
  <rect x="325" y="50" width="250" height="55" rx="8" fill="#f39c12" stroke="#1a1a2e" stroke-width="2"/>
  <text x="450" y="72" text-anchor="middle" font-size="13" fill="#1a1a2e" font-weight="bold">Ambiguous Document</text>
  <text x="450" y="92" text-anchor="middle" font-size="11" fill="#1a1a2e">Initial classification confidence: 0.61</text>

  <!-- Stage 2: Initial classifier generates candidates -->
  <line x1="450" y1="105" x2="450" y2="130" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal11)"/>
  <rect x="300" y="130" width="300" height="40" rx="6" fill="#1a1a2e"/>
  <text x="450" y="155" text-anchor="middle" font-size="12" fill="white">Classifier generates 3 candidate types</text>

  <!-- Branch arrows -->
  <line x1="350" y1="170" x2="160" y2="215" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal11)"/>
  <line x1="450" y1="170" x2="450" y2="215" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal11)"/>
  <line x1="550" y1="170" x2="740" y2="215" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal11)"/>

  <!-- Branch A: NDA Amendment -->
  <rect x="50" y="215" width="220" height="85" rx="8" fill="#16a085" stroke="#1a1a2e" stroke-width="1.5"/>
  <text x="160" y="237" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Branch A: NDA Amendment</text>
  <text x="160" y="257" text-anchor="middle" font-size="10" fill="white" opacity="0.9">Initial confidence: 0.61</text>
  <text x="160" y="275" text-anchor="middle" font-size="10" fill="white" opacity="0.9">Specialist evaluates:</text>
  <text x="160" y="290" text-anchor="middle" font-size="9" fill="white" opacity="0.8">"References original NDA, modifies terms"</text>

  <!-- Branch B: Side Letter -->
  <rect x="340" y="215" width="220" height="85" rx="8" fill="#f39c12" stroke="#1a1a2e" stroke-width="1.5"/>
  <text x="450" y="237" text-anchor="middle" font-size="12" fill="#1a1a2e" font-weight="bold">Branch B: Side Letter</text>
  <text x="450" y="257" text-anchor="middle" font-size="10" fill="#1a1a2e">Initial confidence: 0.55</text>
  <text x="450" y="275" text-anchor="middle" font-size="10" fill="#1a1a2e">Specialist evaluates:</text>
  <text x="450" y="290" text-anchor="middle" font-size="9" fill="#1a1a2e">"Adds terms, doesn't modify existing"</text>

  <!-- Branch C: MOU -->
  <rect x="630" y="215" width="220" height="85" rx="8" fill="#e74c3c" stroke="#1a1a2e" stroke-width="1.5" opacity="0.6"/>
  <text x="740" y="237" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Branch C: MOU</text>
  <text x="740" y="257" text-anchor="middle" font-size="10" fill="white" opacity="0.9">Initial confidence: 0.21</text>
  <text x="740" y="275" text-anchor="middle" font-size="10" fill="white" opacity="0.9">Specialist evaluates:</text>
  <text x="740" y="290" text-anchor="middle" font-size="9" fill="white" opacity="0.8">"No standalone obligations found"</text>

  <!-- Post-evaluation scores -->
  <line x1="160" y1="300" x2="160" y2="340" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal11)"/>
  <line x1="450" y1="300" x2="450" y2="340" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber11)"/>
  <line x1="740" y1="300" x2="740" y2="340" stroke="#e74c3c" stroke-width="2" marker-end="url(#arrowCoral11)"/>

  <!-- Evaluation results -->
  <rect x="80" y="340" width="160" height="45" rx="6" fill="#16a085"/>
  <text x="160" y="360" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Confidence: 0.88</text>
  <text x="160" y="377" text-anchor="middle" font-size="10" fill="white">SELECTED</text>

  <rect x="370" y="340" width="160" height="45" rx="6" fill="#f39c12" opacity="0.4"/>
  <text x="450" y="360" text-anchor="middle" font-size="12" fill="#1a1a2e">Confidence: 0.45</text>
  <text x="450" y="377" text-anchor="middle" font-size="10" fill="#1a1a2e" opacity="0.7">PRUNED</text>

  <rect x="660" y="340" width="160" height="45" rx="6" fill="#e74c3c" opacity="0.3"/>
  <text x="740" y="360" text-anchor="middle" font-size="12" fill="#1a1a2e">Confidence: 0.15</text>
  <text x="740" y="377" text-anchor="middle" font-size="10" fill="#1a1a2e" opacity="0.7">PRUNED</text>

  <!-- Final output -->
  <line x1="160" y1="385" x2="450" y2="435" stroke="#16a085" stroke-width="2.5" marker-end="url(#arrowTeal11)"/>

  <rect x="300" y="435" width="300" height="55" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="450" y="457" text-anchor="middle" font-size="13" fill="white" font-weight="bold">Resolved Classification</text>
  <text x="450" y="477" text-anchor="middle" font-size="11" fill="#16a085">NDA Amendment (conf: 0.88, method: ToT)</text>

  <!-- Caption -->
  <text x="450" y="525" text-anchor="middle" font-size="11" fill="#666" font-style="italic">Each branch runs a specialist evaluation in parallel. Low-confidence branches are pruned.</text>
  <text x="450" y="545" text-anchor="middle" font-size="11" fill="#666" font-style="italic">The surviving branch with highest post-evaluation confidence becomes the classification.</text>

  <defs>
    <marker id="arrowTeal11" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmber11" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
    <marker id="arrowCoral11" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#e74c3c"/>
    </marker>
  </defs>
</svg>


### Implementing Tree-of-Thought


The implementation has three stages: generate candidate classifications, evaluate each
candidate with a specialist diplomat, and select the winner. Candidate generation and
evaluation can be parallelized: all specialist evaluations run simultaneously.


```typescript
// tree-of-thought-routing.ts
// Systematic disambiguation for ambiguous documents

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

const TOT_CONFIDENCE_THRESHOLD = 0.80;
const TOT_PRUNE_THRESHOLD = 0.30;

async function generateCandidateClassifications(
  document: TriageDocument
): Promise<AlternateClassification[]> {

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 128_000,
    messages: [{
      role: 'user',
      content: `You are a document classification specialist. This
document has resisted clean single-pass classification. Generate
2-4 candidate classifications, ordered by likelihood.

DOCUMENT TITLE: ${document.title}
DOCUMENT CONTENT:
${document.content}

For each candidate, provide:
1. The document type
2. A specific sub-type description
3. Your confidence (0.0-1.0) that this is the correct classification
4. The reasoning: what features of the document support this classification?

Respond as a JSON array:
[
  {
    "primaryType": "<document type>",
    "subType": "<specific description>",
    "confidence": <0.0-1.0>,
    "reasoning": "<what supports this classification>"
  }
]

IMPORTANT: Candidates should represent genuinely different
interpretations, not minor variations. "NDA Amendment" and
"Side Letter to NDA" are meaningfully different because they
have different legal implications (amendment modifies existing
terms; side letter adds supplemental terms without modifying
the original). "NDA Amendment" and "NDA Modification" are NOT
meaningfully different.`
    }]
  });

  const response = await stream.finalMessage();
  const text = response.content
    .find(c => c.type === 'text')?.text ?? '[]';
  return JSON.parse(text) as AlternateClassification[];
}

async function evaluateBranch(
  document: TriageDocument,
  candidate: AlternateClassification
): Promise<ToTBranch> {

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 128_000,
    messages: [{
      role: 'user',
      content: `You are a specialist in ${candidate.primaryType}
documents. Evaluate whether the following document is correctly
classified as: ${candidate.subType}

DOCUMENT:
${document.content}

PROPOSED CLASSIFICATION:
Type: ${candidate.primaryType}
Sub-type: ${candidate.subType}
Initial confidence: ${candidate.confidence}
Initial reasoning: ${candidate.reasoning}

Analyze the document against the characteristics of a typical
${candidate.subType}. Consider:

1. STRUCTURAL INDICATORS: Does the document's structure match
   what you would expect for this type? (headings, sections,
   signature blocks, recitals, schedules)

2. SUBSTANTIVE INDICATORS: Does the content match? (types of
   provisions, legal language, obligations created or modified)

3. CONTEXTUAL INDICATORS: Does the document reference other
   agreements? Does it use language like "hereby amends",
   "supplemental to", "notwithstanding", "in addition to"?

4. COUNTERINDICATORS: What features of this document are
   INCONSISTENT with this classification?

After analysis, provide your revised confidence score (0.0-1.0)
and a brief assessment.

Respond as JSON:
{
  "revisedConfidence": <0.0-1.0>,
  "assessment": "<your specialist evaluation>",
  "supportingFeatures": ["<feature 1>", "<feature 2>"],
  "counterIndicators": ["<counter 1>", "<counter 2>"]
}`
    }]
  });

  const response = await stream.finalMessage();
  const text = response.content
    .find(c => c.type === 'text')?.text ?? '{}';
  const evaluation = JSON.parse(text);

  const finalConfidence = evaluation.revisedConfidence ?? 0;
  const pruned = finalConfidence < TOT_PRUNE_THRESHOLD;

  return {
    branchId: `branch-${candidate.primaryType}`,
    candidateType: candidate.primaryType as DocumentType,
    candidateSubType: candidate.subType,
    initialConfidence: candidate.confidence,
    specialistEvaluation: evaluation.assessment ?? '',
    finalConfidence,
    pruned,
    pruneReason: pruned
      ? `Confidence ${finalConfidence} below threshold ${TOT_PRUNE_THRESHOLD}`
      : undefined
  };
}

async function treeOfThoughtRoute(
  document: TriageDocument
): Promise<ToTResult> {

  // Stage 1: Generate candidate classifications
  const candidates = await generateCandidateClassifications(document);

  // Stage 2: Evaluate all candidates in parallel
  const branchResults = await Promise.allSettled(
    candidates.map(candidate =>
      evaluateBranch(document, candidate)
    )
  );

  const branches: ToTBranch[] = [];
  for (const result of branchResults) {
    if (result.status === 'fulfilled') {
      branches.push(result.value);
    }
  }

  // Stage 3: Select the winning branch
  const surviving = branches
    .filter(b => !b.pruned)
    .sort((a, b) => b.finalConfidence - a.finalConfidence);

  const selected = surviving[0] ?? branches[0];

  return {
    documentId: document.id,
    branches,
    selectedBranch: selected,
    deliberationSummary: `Evaluated ${branches.length} candidates. `
      + `${branches.filter(b => b.pruned).length} pruned. `
      + `Selected: ${selected.candidateSubType} `
      + `(confidence: ${selected.finalConfidence.toFixed(2)})`
  };
}
```


The tree-of-thought router costs 3 to 5 additional API calls per ambiguous document
(1 for candidate generation, 2 to 4 for branch evaluation). For a batch of 20
documents where 2 are ambiguous, this adds roughly $0.50 to the triage cost. The
alternative, misclassifying those 2 documents and routing them to the wrong team, costs
hours of wasted attorney time plus the risk of a missed deadline if the document's
urgency was also miscategorized.


> **Key Concept**
>
> Tree-of-thought routing is not the same as simply asking the model to "think
> harder." It is a structural pattern that forces systematic exploration of
> alternatives. Each branch is evaluated by a fresh API call with no awareness of
> the other branches' evaluations. This independence prevents anchoring bias, where
> the model's initial guess contaminates its evaluation of alternatives. The branches
> deliberate in isolation; the selection logic compares their independent conclusions.


\newpage


## Round 4: The Six-Specialist Architecture


The priority assessment round deploys the architecture that TLE R&D Experiment 02
proved dramatically superior to single-pass classification. Six specialist agents
examine the document batch in parallel, each focused on one dimension of triage
intelligence. Their outputs are then merged by a synthesizer into the final triage
report.


The six specialists are:

1. **Document Type Classifier**: Precise classification with sub-type, document status,
   and counterparty posture assessment.

2. **Key Terms and Obligations Extractor**: Every party, dollar amount, obligation,
   governing law provision, and material term from every document.

3. **Deadline and Date Identifier**: Every date computed relative to today, categorized
   by urgency, with consequence assessment for each deadline.

4. **Risk and Red Flag Detector**: Contractual, financial, legal, operational, and
   compliance risks, plus cross-document risk patterns.

5. **Completeness and Gap Analyzer**: Missing signatures, exhibits, terms, protections,
   and context. What additional information does the attorney need before they can act?

6. **Urgency Scorer and Priority Router**: Urgency scores, team routing, action items,
   escalation triggers, and batch prioritization.


```typescript
// round-4-specialist-triage.ts
// Six specialist agents in parallel with synthesizer

interface SpecialistConfig {
  name: string;
  systemPrompt: string;
  userPromptTemplate: (
    documents: TriageDocument[],
    triageRules: string
  ) => string;
}

function buildDocumentBlock(documents: TriageDocument[]): string {
  return documents.map(d =>
    `--- DOCUMENT: ${d.title} (ID: ${d.id}) ---\n`
    + `${d.content}\n--- END ---`
  ).join('\n\n');
}

const SPECIALISTS: SpecialistConfig[] = [
  {
    name: 'document-type-classifier',
    systemPrompt: `You are a DOCUMENT TYPE CLASSIFICATION specialist
in a corporate legal department intake workflow. Your sole job is
precise, granular document classification.`,
    userPromptTemplate: (docs, _rules) => `
Classify each of the following ${docs.length} documents.

DOCUMENTS:
${buildDocumentBlock(docs)}

For EACH document provide:
1. PRIMARY TYPE: MSA, NDA, Amendment, Correspondence, Invoice,
   Term Sheet, Employment Agreement, Litigation Document, Lease,
   Regulatory Document, Other
2. SUB-TYPE: Maximally specific. Examples: "SaaS Master Services
   Agreement (Draft — unsigned)", "SEC Subpoena Duces Tecum
   (Enforcement Division)"
3. DOCUMENT STATUS: Draft, Final/Executed, Partially Executed,
   Unsigned, Expired, Under Negotiation
4. COUNTERPARTY POSTURE: Incoming/Outgoing, Adversarial/Cooperative/
   Regulatory/Transactional
5. LEGAL DOMAIN: Corporate/M&A, Employment, IP/Trademark,
   Real Estate, Procurement, Finance/Tax, Litigation,
   Regulatory/Compliance, Securities
6. CONFIDENCE: High/Medium/Low with explanation if not High

Be precise. "NDA Amendment expanding scope for potential acquisition"
is correct. "Amendment" alone is insufficient.`
  },
  {
    name: 'key-terms-extractor',
    systemPrompt: `You are a KEY TERMS AND OBLIGATIONS EXTRACTION
specialist. Your sole job is to extract every material term,
obligation, right, and financial figure from each document.`,
    userPromptTemplate: (docs, _rules) => `
Extract all material terms from each of the ${docs.length} documents.

DOCUMENTS:
${buildDocumentBlock(docs)}

For EACH document extract:
- PARTIES: Full legal name, entity type, role, jurisdiction
- FINANCIAL TERMS: Every dollar amount, fee structure, payment terms,
  escalation rates, penalties
- MATERIAL OBLIGATIONS: Affirmative and negative covenants,
  performance standards, reporting requirements
- GOVERNING LAW: Jurisdiction, dispute resolution, venue

Note explicitly when terms are missing, blank, or TBD.`
  },
  {
    name: 'deadline-date-identifier',
    systemPrompt: `You are a DEADLINE AND DATE IDENTIFICATION specialist.
Your sole job is to find every date and deadline and compute urgency
relative to today.`,
    userPromptTemplate: (docs, _rules) => {
      const today = new Date().toISOString().split('T')[0];
      return `
TODAY'S DATE: ${today}

DOCUMENTS (${docs.length} total):
${buildDocumentBlock(docs)}

For EACH document identify:
1. ALL EXPLICIT DATES with significance
2. ALL DEADLINES with consequence of missing each
3. CALCULATED DATES (e.g., "within 14 days of receipt")
4. RECURRING DATES (payment, reporting, renewal)

For each deadline provide:
- Exact date (or best estimate)
- Days remaining from today
- Category: CRITICAL (<7 days), URGENT (7-14 days),
  ELEVATED (15-30 days), STANDARD (31-60 days), DISTANT (>60 days)
- Hard (contractual/statutory) or soft (practical/advisory)
- Who is responsible for action

Output a consolidated DEADLINE CALENDAR sorted by urgency.`;
    }
  },
  {
    name: 'risk-red-flag-detector',
    systemPrompt: `You are a RISK AND RED FLAG DETECTION specialist.
You think like a paranoid General Counsel. Your sole job is to
identify every risk, red flag, and potential problem.`,
    userPromptTemplate: (docs, _rules) => `
DOCUMENTS (${docs.length} total):
${buildDocumentBlock(docs)}

Flag for EACH document:
1. CONTRACTUAL RISKS: Deviations from market standard, one-sided
   provisions, missing protections, auto-renewal traps
2. FINANCIAL RISKS: Unusual pricing, above-market escalation,
   billing errors, unauthorized charges
3. LEGAL/LITIGATION RISKS: Active/threatened litigation,
   regulatory investigations, liability exposure
4. OPERATIONAL RISKS: Missing signatures, blank fields, verbal
   authorizations, personnel departures
5. COMPLIANCE RISKS: Regulatory requirements, data privacy,
   employment law, securities law
6. CROSS-DOCUMENT RISKS: Conflicts between documents, chain-
   reaction risks, information asymmetry

Rate each risk: CRITICAL, HIGH, MEDIUM, LOW.`
  },
  {
    name: 'completeness-gap-analyzer',
    systemPrompt: `You are a COMPLETENESS AND GAP ANALYSIS specialist.
Your sole job is to identify what is MISSING from each document.`,
    userPromptTemplate: (docs, _rules) => `
DOCUMENTS (${docs.length} total):
${buildDocumentBlock(docs)}

For EACH document analyze:
1. MISSING SIGNATURES AND EXECUTION
2. MISSING EXHIBITS AND ATTACHMENTS
3. MISSING COMMERCIAL TERMS (blanks, brackets, TBD markers)
4. MISSING LEGAL PROTECTIONS (standard clauses that should exist)
5. MISSING CONTEXT (related documents needed for review)
6. INFORMATION NEEDED FROM CLIENT (questions, confirmations,
   business decisions required)

Output a GAP INVENTORY for each document.`
  },
  {
    name: 'urgency-priority-router',
    systemPrompt: `You are an URGENCY SCORING AND PRIORITY ROUTING
specialist. Your sole job is to score urgency and route each
document to the right team with actionable instructions.`,
    userPromptTemplate: (docs, rules) => `
TRIAGE RULES:
${rules}

DOCUMENTS (${docs.length} total):
${buildDocumentBlock(docs)}

For EACH document:
1. URGENCY SCORE (1-5) based on: deadline proximity, financial
   exposure, legal consequences, reputational risk, reversibility
2. PRIMARY ROUTING: Team + role + estimated effort hours
3. SECONDARY ROUTING: Cross-functional teams and coordination sequence
4. RECOMMENDED ACTIONS: Immediate (24h), short-term (1 week),
   medium-term (1 month). Each: WHO does WHAT by WHEN.
5. ESCALATION TRIGGERS: What would increase urgency?
6. BATCH PRIORITIZATION: Order all documents by priority.`
  }
];

async function runSpecialistTriage(
  documents: TriageDocument[],
  triageRules: string
): Promise<{
  specialistOutputs: Array<{ name: string; output: string }>;
  metrics: { inputTokens: number; outputTokens: number; calls: number };
}> {

  let totalIn = 0;
  let totalOut = 0;
  const specialistOutputs: Array<{ name: string; output: string }> = [];

  const results = await Promise.allSettled(
    SPECIALISTS.map(async (spec) => {
      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 128_000,
        system: spec.systemPrompt,
        messages: [{
          role: 'user',
          content: spec.userPromptTemplate(documents, triageRules)
        }]
      });

      const response = await stream.finalMessage();
      const text = response.content
        .find(c => c.type === 'text')?.text ?? '';
      return {
        name: spec.name,
        output: text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      };
    })
  );

  let calls = 0;
  for (const result of results) {
    if (result.status === 'fulfilled') {
      specialistOutputs.push({
        name: result.value.name,
        output: result.value.output
      });
      totalIn += result.value.inputTokens;
      totalOut += result.value.outputTokens;
      calls++;
    }
  }

  return {
    specialistOutputs,
    metrics: { inputTokens: totalIn, outputTokens: totalOut, calls }
  };
}
```


Each specialist operates independently, examining the same document batch through a
different analytical lens. The document type classifier focuses on structural and
substantive indicators. The key terms extractor focuses on parties, financials, and
obligations. The deadline identifier focuses on temporal data. The risk detector focuses
on exposures and anomalies. The gap analyzer focuses on what is missing. The urgency
router focuses on prioritization and action assignment.


This independence is what produces the quality differential measured in Experiment 02.
A single classifier trying to simultaneously classify, extract terms, identify deadlines,
detect risks, find gaps, and prioritize must allocate its attention across all six tasks
for all documents. The result is shallow coverage of everything. Six specialists each
giving full attention to one task produce deep coverage of that task.


> **Insight**
>
> The cross-document intelligence dimension is where the specialist team's advantage
> is most pronounced. The risk detector in Experiment 02 identified that the SEC
> subpoena (investigating the company) created disclosure obligations relevant to
> the Series B term sheet (requiring investor disclosure of material legal proceedings).
> It also identified that the departing employee (VP Engineering) was leaving during
> Series B diligence, creating a retention narrative risk. The single classifier
> missed both connections entirely. Cross-document analysis requires holding multiple
> documents in analytical focus simultaneously while reasoning about their
> interactions, a task that benefits enormously from a dedicated specialist.


\newpage


## Round 5: The Synthesizer


The six specialists produce six independent analyses. The synthesizer merges them into
a single, coherent triage report that resolves conflicts, eliminates redundancy, and
produces the output format the general counsel needs: an executive summary readable
in 60 seconds, a deadline calendar, per-document briefs, and cross-document intelligence.


```typescript
// round-5-synthesizer.ts
// Merge specialist outputs into the final triage report

async function synthesizeTriageReport(
  documents: TriageDocument[],
  specialistOutputs: Array<{ name: string; output: string }>,
  triageRules: string
): Promise<string> {

  const combinedOutput = specialistOutputs.map(s =>
    `\n═══ ${s.name.toUpperCase()} SPECIALIST ═══\n${s.output}`
  ).join('\n\n');

  const today = new Date().toISOString().split('T')[0];

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 128_000,
    system: `You are the LEAD TRIAGE SYNTHESIZER in a corporate legal
department. Six specialist analysts have independently reviewed a
batch of incoming legal documents. Your job is to synthesize their
findings into a single, comprehensive, immediately actionable
triage report. When specialists disagree on urgency or classification,
take the MORE conservative (higher urgency) position and note the
disagreement. Every recommendation must be specific enough that a
paralegal could begin execution without further instruction.`,
    messages: [{
      role: 'user',
      content: `TODAY'S DATE: ${today}

TRIAGE RULES:
${triageRules}

SPECIALIST ANALYSES (${specialistOutputs.length} specialists,
${documents.length} documents):
${combinedOutput}

Produce a COMPREHENSIVE DOCUMENT TRIAGE REPORT:

1. EXECUTIVE SUMMARY (readable in 60 seconds by the General Counsel)
   - Critical items requiring immediate action (today)
   - Urgent items requiring action this week
   - Elevated items requiring action this month
   - Standard items for routine processing
   - Total financial exposure across all documents
   - Cross-document intelligence and chain-reaction risks

2. DEADLINE CALENDAR (sorted by urgency)
   - Every deadline from every document
   - Days remaining from today
   - Owner and action required

3. DOCUMENT-BY-DOCUMENT INTAKE BRIEFS
   Each brief must include:
   - Document ID, title, type, sub-type
   - Urgency score with justification
   - Routing (primary team, secondary teams, role level)
   - Parties with full details
   - All financial terms
   - All deadlines with days remaining
   - All material obligations
   - Red flags and risks (with severity)
   - Gaps and missing information
   - Specific recommended actions (WHO does WHAT by WHEN)

4. CROSS-DOCUMENT ANALYSIS
   - Relationships between documents
   - Chain-reaction risks
   - Resource conflicts (deadlines competing for same team)
   - Strategic implications

5. RESOURCE ALLOCATION RECOMMENDATION
   - Priority queue for the legal department
   - Estimated hours per document
   - Teams and headcount needed
   - External counsel needs`
    }]
  });

  const response = await stream.finalMessage();
  return response.content
    .find(c => c.type === 'text')?.text ?? '';
}
```


The synthesizer is the most complex single prompt in the triage pipeline. It receives
the combined output of six specialists (which can total 30,000 to 50,000 tokens of
input) and must produce a structured, de-duplicated, cross-referenced report. This
is where the 1M context window and 128K output capacity are essential: the synthesizer
needs room to receive all specialist analyses and produce a comprehensive report
without truncation.


> **Warning**
>
> The synthesizer must be instructed to resolve conflicts conservatively. If the
> urgency scorer rates a document as "elevated" (score 3) but the deadline identifier
> has found a hard deadline 5 days away (which would be "critical"), the synthesizer
> should report "critical." False negatives in triage (underestimating urgency) are
> far more dangerous than false positives (overestimating urgency). An attorney who
> reviews a document marked critical and finds it routine loses 10 minutes. An attorney
> who ignores a document marked routine and discovers next week it had a hard deadline
> loses the deadline.


\newpage


## The Full Pipeline Orchestrator


The backautocrat for document triage coordinates all five rounds, handling the
branching logic for tree-of-thought routing and the parallel execution of specialists.


```typescript
// triage-backautocrat.ts
// Full pipeline orchestrator for document triage

async function runTriagePipeline(
  documents: TriageDocument[],
  triageRules: string,
  options: {
    totConfidenceThreshold?: number;
    enableToT?: boolean;
  } = {}
): Promise<{
  report: string;
  metrics: TriagePipelineMetrics;
}> {

  const totThreshold = options.totConfidenceThreshold ?? 0.80;
  const enableToT = options.enableToT ?? true;
  const startTime = Date.now();
  let totalIn = 0;
  let totalOut = 0;
  let totalCalls = 0;
  let totRoutings = 0;

  console.log(
    `[Triage] Starting pipeline for ${documents.length} documents`
  );

  // ─── Round 1: Batch Intake ───
  // (In production: OCR for PDFs, text extraction for DOCX,
  //  metadata extraction. Assumed complete for this implementation.)
  console.log('[Triage] Round 1: Batch intake complete');

  // ─── Round 2: Initial Classification ───
  console.log('[Triage] Round 2: Initial classification...');

  const classificationResults = await Promise.allSettled(
    documents.map(async (doc) => {
      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 128_000,
        messages: [{
          role: 'user',
          content: `Classify this document. Respond as JSON:
{
  "primaryType": "<type>",
  "subType": "<specific description>",
  "confidence": <0.0-1.0>,
  "legalDomain": "<domain>"
}

DOCUMENT: ${doc.title}
${doc.content}`
        }]
      });
      const response = await stream.finalMessage();
      totalIn += response.usage.input_tokens;
      totalOut += response.usage.output_tokens;
      totalCalls++;
      const text = response.content
        .find(c => c.type === 'text')?.text ?? '{}';
      return { docId: doc.id, classification: JSON.parse(text) };
    })
  );

  const classifications = new Map<string, any>();
  const ambiguousDocIds: string[] = [];

  for (const result of classificationResults) {
    if (result.status === 'fulfilled') {
      classifications.set(
        result.value.docId,
        result.value.classification
      );
      if (result.value.classification.confidence < totThreshold) {
        ambiguousDocIds.push(result.value.docId);
      }
    }
  }

  console.log(
    `[Triage] Classified ${classifications.size} documents. `
    + `${ambiguousDocIds.length} below confidence threshold.`
  );

  // ─── Round 3: Tree-of-Thought for ambiguous documents ───
  if (enableToT && ambiguousDocIds.length > 0) {
    console.log(
      `[Triage] Round 3: ToT routing for `
      + `${ambiguousDocIds.length} documents...`
    );

    const ambiguousDocs = documents.filter(
      d => ambiguousDocIds.includes(d.id)
    );

    const totResults = await Promise.allSettled(
      ambiguousDocs.map(doc => treeOfThoughtRoute(doc))
    );

    for (const result of totResults) {
      if (result.status === 'fulfilled') {
        const tot = result.value;
        // Update classification with ToT result
        classifications.set(tot.documentId, {
          primaryType: tot.selectedBranch.candidateType,
          subType: tot.selectedBranch.candidateSubType,
          confidence: tot.selectedBranch.finalConfidence,
          classificationMethod: 'tree-of-thought'
        });
        totRoutings++;
        // Each ToT: 1 candidate generation + N branch evaluations
        totalCalls += 1 + tot.branches.length;
      }
    }

    console.log(
      `[Triage] ToT resolved ${totRoutings} ambiguous documents`
    );
  } else {
    console.log('[Triage] Round 3: Skipped (no ambiguous documents)');
  }

  // ─── Round 4: Specialist Triage ───
  console.log('[Triage] Round 4: Running 6 specialists in parallel...');

  const { specialistOutputs, metrics: specMetrics } =
    await runSpecialistTriage(documents, triageRules);

  totalIn += specMetrics.inputTokens;
  totalOut += specMetrics.outputTokens;
  totalCalls += specMetrics.calls;

  console.log(
    `[Triage] ${specialistOutputs.length} specialists completed`
  );

  // ─── Round 5: Synthesis ───
  console.log('[Triage] Round 5: Synthesizing triage report...');

  const report = await synthesizeTriageReport(
    documents, specialistOutputs, triageRules
  );

  totalCalls++;  // Synthesizer call

  const totalLatency = Date.now() - startTime;

  const pipelineMetrics: TriagePipelineMetrics = {
    totalInputTokens: totalIn,
    totalOutputTokens: totalOut,
    totalLatencyMs: totalLatency,
    claudeCalls: totalCalls,
    model: 'claude-opus-4-6',
    estimatedCostUsd: (totalIn * 15 + totalOut * 75) / 1_000_000,
    documentsClassified: documents.length,
    totRoutingsPerformed: totRoutings
  };

  console.log(
    `[Triage] Complete. ${documents.length} documents triaged. `
    + `${totalCalls} API calls. `
    + `Cost: $${pipelineMetrics.estimatedCostUsd.toFixed(2)}. `
    + `Time: ${(totalLatency / 1000).toFixed(0)}s`
  );

  return { report, metrics: pipelineMetrics };
}
```


The orchestrator handles the conditional branching for tree-of-thought routing
without adding unnecessary complexity. If all documents classify with high confidence,
Round 3 is skipped entirely. If 3 out of 20 documents are ambiguous, only those 3
undergo ToT routing while the other 17 proceed directly. The pipeline adapts its
resource investment to the difficulty of the input.


\newpage


## Batch Processing at Scale


The pipeline described above handles a single day's intake (5 to 25 documents). In
practice, legal departments also need batch triage for larger document sets: during
M&A due diligence (hundreds of target company documents), regulatory audits (all
contracts touching a specific regulation), or CLM migration (importing thousands of
historical documents). The architecture scales by applying the same concurrency
limiter pattern from Chapter 10.


```typescript
// batch-triage.ts
// Scale triage to handle large document batches

async function batchTriage(
  documents: TriageDocument[],
  triageRules: string,
  batchSize: number = 20
): Promise<{
  reports: string[];
  aggregateMetrics: TriagePipelineMetrics;
}> {

  // Split documents into batches
  const batches: TriageDocument[][] = [];
  for (let i = 0; i < documents.length; i += batchSize) {
    batches.push(documents.slice(i, i + batchSize));
  }

  console.log(
    `[BatchTriage] Processing ${documents.length} documents `
    + `in ${batches.length} batches of up to ${batchSize}`
  );

  const reports: string[] = [];
  const aggregateMetrics: TriagePipelineMetrics = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalLatencyMs: 0,
    claudeCalls: 0,
    model: 'claude-opus-4-6',
    estimatedCostUsd: 0,
    documentsClassified: 0,
    totRoutingsPerformed: 0
  };

  // Process batches sequentially to manage API load
  // (each batch already runs 6+ parallel calls)
  for (let i = 0; i < batches.length; i++) {
    console.log(
      `[BatchTriage] Batch ${i + 1}/${batches.length} `
      + `(${batches[i].length} documents)`
    );

    const { report, metrics } = await runTriagePipeline(
      batches[i], triageRules
    );

    reports.push(report);
    aggregateMetrics.totalInputTokens += metrics.totalInputTokens;
    aggregateMetrics.totalOutputTokens += metrics.totalOutputTokens;
    aggregateMetrics.totalLatencyMs += metrics.totalLatencyMs;
    aggregateMetrics.claudeCalls += metrics.claudeCalls;
    aggregateMetrics.estimatedCostUsd += metrics.estimatedCostUsd;
    aggregateMetrics.documentsClassified += metrics.documentsClassified;
    aggregateMetrics.totRoutingsPerformed += metrics.totRoutingsPerformed;
  }

  return { reports, aggregateMetrics };
}
```


Batch processing uses sequential batch execution rather than fully parallel processing.
Each batch of 20 documents already generates 6 or more parallel API calls internally
(the specialist team). Running multiple batches simultaneously would create a
multiplication effect that exceeds rate limits. Sequential batches with internal
parallelism is the correct pattern: the 6 specialists run in parallel within each
batch, and batches process one after another.


For very large batches (1,000+ documents), the cross-document analysis within each
batch captures relationships only between documents in the same batch. A second pass
that examines cross-batch patterns (e.g., "12 contracts in Batch 3 and 8 contracts in
Batch 7 share the same counterparty") can be added as a post-processing step that
operates on the extracted metadata from all batches rather than the raw documents.


\newpage


## Urgency Assessment in Depth


Urgency scoring is the dimension that determines whether the triage pipeline produces
useful output or merely labels documents. A general counsel does not need to know that
a document is a "SaaS MSA." She needs to know whether it requires action today, this
week, or next month, and why.


The urgency scoring model uses five factors with different weights based on the nature
of the consequence:


| Factor | Weight | Rationale |
|---|---|---|
| Deadline Proximity | 2x for hard deadlines, 1x for soft | Hard deadlines (statutory, contractual) cannot be extended |
| Financial Exposure | Proportional to dollar amount | Higher exposure = higher urgency |
| Legal Consequences | 2x for irreversible consequences | Contempt of court, default, waiver of rights |
| Reputational Risk | 1x standard weighting | Client relationships, market position |
| Reversibility | 1.5x for irreversible outcomes | Can inaction be corrected later? |


The scoring produces a 1 to 5 urgency score mapped to response tiers:


| Score | Level | Response SLA | Example |
|---|---|---|---|
| 5 | Critical | Same day | SEC subpoena with 7-day deadline |
| 4 | Urgent | 24-48 hours | Demand letter with 14-day response window |
| 3 | Elevated | This week | Contract renewal with 30-day exercise period |
| 2 | Standard | This month | Draft MSA from new vendor, no deadline |
| 1 | Low | Queue for batch processing | Informational correspondence, board minutes |


The urgency assessment must be paired with a routing recommendation. It is not sufficient
to say "this is urgent." The output must specify which team handles it, what role level
is required (a partner for an SEC subpoena, a junior associate for a standard NDA
review), what the first action item is, and who owns it.


> **Practice Tip**
>
> Configure the urgency scoring thresholds to match your organization's actual
> response capabilities. If your legal department has 4 attorneys and receives 15
> documents per day, a system that marks 8 of them as "critical" is not helpful:
> it overwhelms the team and degrades the signal. Calibrate the scoring so that
> "critical" means genuinely critical (1 to 2 documents per week in a typical
> department), and the team learns to trust the prioritization.


\newpage


## The Experiment Data in Detail


TLE R&D Experiment 02 ran 8 times to account for model variance. The results
demonstrate not just a quality difference but a consistency difference that matters
for production deployment.


| Run | Single Classifier | Classifier + Extractor | Specialist Team |
|---|---|---|---|
| Run 1 | 67 | 84 | 69 |
| Run 2 | 93 | 93 | 96 |
| Run 3 | 90 | 94 | 94 |
| Run 4 | 46 | — | — |
| Run 5 | 41 | 93 | 92 |
| Run 6 | 48 | 49 | — |
| Run 7 | 52 | 72 | 96 |
| Run 8 | 48 | 76 | 95 |
| Run 9 | 48 | 78 | 96 |


Three observations emerge from the full dataset.


**First, the specialist team's floor is high.** Its lowest score across all runs was
69 (a single outlier); every other run scored 92 or above. The single classifier's
lowest score was 41. In production, the floor matters more than the ceiling. A system
that scores 96 half the time and 41 half the time is worse than a system that scores
88 every time, because the 41-scoring runs generate output that causes real harm:
missed deadlines, misrouted documents, overlooked risks.


**Second, the single classifier occasionally matches the specialist team.** Run 2
scored 93 for the single classifier, and Runs 2 and 3 had very narrow gaps between
architectures. This creates a dangerous illusion: if you test a single-pass system
once and happen to get a good run, you might conclude it is adequate. Experiment 02
ran 8 times specifically to expose this variance. The single-pass system is a coin
flip. The specialist team is a consistent performer.


**Third, the cost difference is real but proportionate to value.** The specialist team
costs approximately $2 per batch versus $0.05 for the single classifier, a 40x
difference. But the quality difference (52 versus 96 on the representative run) is an
85% improvement. For a legal department where the triage report determines how
attorneys spend their morning, $2 per batch is negligible relative to the cost of
wasted attorney time from poor triage.


<svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Segoe UI', system-ui, sans-serif; background: #fafafa;">
  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" font-size="15" font-weight="bold" fill="#1a1a2e">Figure 11.4 — Cost vs. Quality Across Three Architectures</text>

  <!-- Axes -->
  <line x1="120" y1="60" x2="120" y2="350" stroke="#1a1a2e" stroke-width="1.5"/>
  <line x1="120" y1="350" x2="820" y2="350" stroke="#1a1a2e" stroke-width="1.5"/>

  <!-- Y-axis: Quality -->
  <text x="55" y="210" text-anchor="middle" font-size="12" fill="#1a1a2e" transform="rotate(-90,55,210)">Quality Score (0-100)</text>
  <text x="110" y="73" text-anchor="end" font-size="10" fill="#666">100</text>
  <text x="110" y="131" text-anchor="end" font-size="10" fill="#666">80</text>
  <text x="110" y="189" text-anchor="end" font-size="10" fill="#666">60</text>
  <text x="110" y="247" text-anchor="end" font-size="10" fill="#666">40</text>
  <text x="110" y="305" text-anchor="end" font-size="10" fill="#666">20</text>
  <line x1="115" y1="70" x2="820" y2="70" stroke="#eee" stroke-width="1"/>
  <line x1="115" y1="128" x2="820" y2="128" stroke="#eee" stroke-width="1"/>
  <line x1="115" y1="186" x2="820" y2="186" stroke="#eee" stroke-width="1"/>
  <line x1="115" y1="244" x2="820" y2="244" stroke="#eee" stroke-width="1"/>
  <line x1="115" y1="302" x2="820" y2="302" stroke="#eee" stroke-width="1"/>

  <!-- X-axis: Cost -->
  <text x="470" y="390" text-anchor="middle" font-size="12" fill="#1a1a2e">Cost per Batch (USD)</text>
  <text x="145" y="368" text-anchor="middle" font-size="10" fill="#666">$0</text>
  <text x="285" y="368" text-anchor="middle" font-size="10" fill="#666">$0.50</text>
  <text x="425" y="368" text-anchor="middle" font-size="10" fill="#666">$1.00</text>
  <text x="565" y="368" text-anchor="middle" font-size="10" fill="#666">$1.50</text>
  <text x="705" y="368" text-anchor="middle" font-size="10" fill="#666">$2.00</text>

  <!-- Data point: Single Classifier -->
  <circle cx="133" cy="201" r="14" fill="#e74c3c" opacity="0.85"/>
  <text x="133" y="205" text-anchor="middle" font-size="10" fill="white" font-weight="bold">52</text>
  <text x="155" y="220" font-size="10" fill="#e74c3c">Single Classifier ($0.05)</text>

  <!-- Data point: Classifier + Extractor -->
  <circle cx="215" cy="147" r="14" fill="#f39c12" opacity="0.85"/>
  <text x="215" y="151" text-anchor="middle" font-size="10" fill="white" font-weight="bold">72</text>
  <text x="237" y="137" font-size="10" fill="#f39c12">Classifier + Extractor ($0.33)</text>

  <!-- Data point: Specialist Team -->
  <circle cx="692" cy="78" r="14" fill="#16a085" opacity="0.85"/>
  <text x="692" y="82" text-anchor="middle" font-size="10" fill="white" font-weight="bold">96</text>
  <text x="665" y="65" font-size="10" fill="#16a085">Specialist Team ($2.04)</text>

  <!-- Efficiency frontier line -->
  <line x1="133" y1="201" x2="692" y2="78" stroke="#1a1a2e" stroke-width="1.5" stroke-dasharray="8,4"/>

  <!-- Annotation -->
  <rect x="350" y="140" width="200" height="55" rx="6" fill="#1a1a2e" opacity="0.9"/>
  <text x="450" y="160" text-anchor="middle" font-size="11" fill="#16a085" font-weight="bold">40x cost increase</text>
  <text x="450" y="178" text-anchor="middle" font-size="11" fill="white">85% quality improvement</text>
  <text x="450" y="193" text-anchor="middle" font-size="9" fill="#f39c12">$2/batch vs. $100K+ missed deadline</text>
</svg>


> **Key Concept**
>
> The cost-quality tradeoff in document triage is asymmetric. The cost of the
> pipeline is measured in dollars per batch. The cost of poor triage is measured
> in missed deadlines, misdirected attorney hours, and overlooked risks. For a
> legal department where a missed SEC subpoena deadline can result in contempt
> sanctions, or a misrouted demand letter can result in a default judgment, the
> $2 per batch cost of the specialist team is not a variable to optimize. It is
> insurance against outcomes that cost orders of magnitude more.


\newpage


## Practical Considerations


### Document Format Handling


Production triage pipelines must handle documents in multiple formats. PDFs require
OCR (for scanned documents) or text extraction (for native PDFs). DOCX files require
XML parsing to extract text while preserving structure. Email messages (EML format)
require MIME parsing to separate headers, body, and attachments. The Round 1 intake
stage handles this format normalization before classification begins.


For OCR quality, the same principle from Chapter 10 applies: assess quality and flag
low-confidence extractions. A scanned document with poor OCR quality will produce
garbled text that the classifier cannot reliably categorize. Better to flag it for
human review than to misclassify and misroute it.


### Triage Rules Configuration


The triage rules provided to the pipeline should be maintained as a structured
configuration rather than embedded in prompts. This allows legal operations teams to
update routing rules (new teams, changed SLA tiers, modified urgency thresholds)
without modifying pipeline code.


```typescript
// triage-rules.ts
// Configurable triage rules

interface TriageRuleSet {
  teams: Array<{
    name: string;
    documentTypes: DocumentType[];
    legalDomains: LegalDomain[];
    slaHours: Record<string, number>;
  }>;
  urgencyOverrides: Array<{
    condition: string;
    minimumUrgency: number;
  }>;
  escalationPaths: Array<{
    trigger: string;
    escalateTo: string;
    timeframeHours: number;
  }>;
}

const DEFAULT_TRIAGE_RULES: TriageRuleSet = {
  teams: [
    {
      name: 'Corporate/M&A',
      documentTypes: ['msa', 'term-sheet', 'amendment'],
      legalDomains: ['corporate-ma', 'securities'],
      slaHours: {
        critical: 4, urgent: 24, elevated: 72,
        standard: 168, low: 336
      }
    },
    {
      name: 'Employment',
      documentTypes: ['employment-agreement', 'separation-agreement'],
      legalDomains: ['employment'],
      slaHours: {
        critical: 4, urgent: 24, elevated: 72,
        standard: 168, low: 336
      }
    },
    {
      name: 'Litigation/Regulatory',
      documentTypes: [
        'subpoena', 'demand-letter', 'litigation-document'
      ],
      legalDomains: [
        'litigation', 'regulatory-compliance'
      ],
      slaHours: {
        critical: 2, urgent: 8, elevated: 48,
        standard: 120, low: 240
      }
    },
    {
      name: 'Real Estate',
      documentTypes: ['lease'],
      legalDomains: ['real-estate'],
      slaHours: {
        critical: 4, urgent: 24, elevated: 72,
        standard: 168, low: 336
      }
    },
    {
      name: 'Procurement',
      documentTypes: ['nda', 'invoice'],
      legalDomains: ['procurement'],
      slaHours: {
        critical: 8, urgent: 48, elevated: 120,
        standard: 240, low: 480
      }
    }
  ],
  urgencyOverrides: [
    {
      condition: 'Document is a subpoena or regulatory demand',
      minimumUrgency: 4
    },
    {
      condition: 'Hard deadline within 7 days',
      minimumUrgency: 5
    },
    {
      condition: 'Financial exposure exceeds $1,000,000',
      minimumUrgency: 4
    }
  ],
  escalationPaths: [
    {
      trigger: 'SEC or DOJ investigation',
      escalateTo: 'General Counsel + Outside Counsel',
      timeframeHours: 4
    },
    {
      trigger: 'Litigation threat with short deadline',
      escalateTo: 'Litigation Partner',
      timeframeHours: 8
    },
    {
      trigger: 'Data breach notification obligation',
      escalateTo: 'Privacy Officer + General Counsel',
      timeframeHours: 2
    }
  ]
};
```


### Feedback Loop and Continuous Improvement


The triage pipeline should include a feedback mechanism where attorneys can correct
misclassifications, adjust urgency scores, and flag routing errors. This feedback
serves two purposes: it catches and corrects the current batch's errors, and it
accumulates training data that can be used to improve prompt engineering and
triage rules over time.


A simple feedback interface records the attorney's corrections as a JSON log:


```typescript
// triage-feedback.ts
// Feedback recording for continuous improvement

interface TriageFeedback {
  documentId: string;
  batchId: string;
  timestamp: string;
  corrections: {
    classification?: {
      pipelineValue: string;
      correctedValue: string;
    };
    urgency?: {
      pipelineValue: number;
      correctedValue: number;
    };
    routing?: {
      pipelineValue: string;
      correctedValue: string;
    };
    notes?: string;
  };
  reviewedBy: string;
}

function recordFeedback(
  feedback: TriageFeedback,
  feedbackLog: TriageFeedback[]
): void {
  feedbackLog.push(feedback);

  // Track correction rates for pipeline monitoring
  const recentFeedback = feedbackLog.filter(f => {
    const age = Date.now() - new Date(f.timestamp).getTime();
    return age < 30 * 24 * 60 * 60 * 1000; // Last 30 days
  });

  const correctionRate = recentFeedback.filter(
    f => f.corrections.classification
      || f.corrections.urgency
      || f.corrections.routing
  ).length / Math.max(recentFeedback.length, 1);

  if (correctionRate > 0.15) {
    console.warn(
      `[Triage] Correction rate ${(correctionRate * 100).toFixed(1)}% `
      + `exceeds 15% threshold. Review triage rules and prompts.`
    );
  }
}
```


When the correction rate exceeds 15%, the pipeline's prompts and triage rules
should be reviewed. Common corrections reveal systematic gaps: if attorneys
consistently re-route NDAs from Procurement to Corporate/M&A, the routing rules
need updating. If urgency scores are consistently adjusted upward for a specific
document type, the urgency scoring prompts need recalibration.


\newpage


## Cost Analysis


Document triage costs depend on batch size, document length, and whether tree-of-thought
routing is triggered. The following estimates assume Claude Opus pricing.


For a typical daily intake batch of 15 documents:


| Component | API Calls | Cost (est.) |
|---|---|---|
| Initial classification (Round 2) | 15 | $0.75 |
| Tree-of-thought routing (2 ambiguous docs) | ~8 | $0.40 |
| 6 specialist agents (Round 4) | 6 | $2.00 |
| Synthesizer (Round 5) | 1 | $0.50 |
| **Total** | **~30** | **~$3.65** |


The cost scales linearly with batch size for the classification round but remains
constant for the specialist and synthesis rounds (which process the entire batch in
single calls). A batch of 50 documents costs approximately $6 to $8, not $12
(because the expensive specialist calls do not multiply with document count).


For annual cost estimation: a legal department processing 15 documents per business
day across 250 business days would spend approximately $900 to $1,000 per year on
triage. That is less than one hour of a junior associate's billable time per month.


\newpage


---

**Key Takeaways**

- Document triage is the gateway workflow that determines how efficiently every downstream legal process operates. Poor triage means missed deadlines, misrouted documents, and wasted attorney time. The TLE R&D experiment proved that multi-agent triage (scoring 96/100) dramatically outperforms single-pass classification (scoring 52/100).

- The six-specialist architecture (Document Type Classifier, Key Terms Extractor, Deadline Identifier, Risk Detector, Completeness Analyzer, Urgency Router) mirrors the mental checklist an experienced attorney performs during manual triage. Each specialist gives full attention to one analytical dimension, producing depth that a single generalist prompt cannot match.

- Tree-of-thought routing handles ambiguous documents by generating multiple candidate classifications, evaluating each with a specialist diplomat, pruning low-confidence branches, and selecting the surviving classification. This transforms a guess into a deliberation.

- The Boomi experience demonstrates that the AI pipeline architecture is not novel: it formalizes the cognitive decomposition that expert attorneys already perform implicitly. The pipeline makes the implicit explicit, the sequential parallel, and the manual scalable.

- Cross-document intelligence is the dimension where multi-agent triage's advantage is most pronounced. The specialist team in Experiment 02 identified relationships between an SEC investigation and a Series B fundraise that the single classifier missed entirely. Connections between documents in a batch are invisible to systems that analyze documents in isolation.

- Cost asymmetry defines the triage economics: $2 per batch for the specialist team versus potentially hundreds of thousands of dollars in consequences from poor triage (missed deadlines, default judgments, regulatory sanctions). The pipeline cost is insurance, not an expense.

\newpage
