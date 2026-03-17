\newpage

# Chapter 16: Obligation Tracking

*Persistent Memory, Calendar Integration, and Alerting Pipelines*


A mid-size technology company signs its two-hundredth vendor agreement and buries the signed PDF in a shared drive. Somewhere on page fourteen is a clause requiring ninety days written notice before any automatic renewal. Somewhere on page twenty-one is a requirement to maintain minimum cyber liability insurance coverage certified annually. Nobody reads page fourteen after signing. Nobody calendars the insurance certification date from page twenty-one. Nine months later the contract auto-renews for three years at a rate twenty percent above market because the notice window closed silently. Four months after that an audit reveals the insurance certification lapsed, triggering a material breach clause that entitles the vendor to terminate with cause. Two obligations, buried in two hundred pages of two hundred contracts, cost the company six figures in overspend and a critical vendor relationship.


This is the daily reality of every organization that manages more than a handful of contracts. The obligations hidden inside those agreements (payment deadlines, delivery milestones, notice windows, compliance certifications, renewal triggers, audit rights, insurance maintenance requirements) are ticking clocks. Each one carries a consequence for non-performance, and those consequences compound. Miss a notice window and you are locked into unfavorable terms. Miss a compliance certification and you are in material breach. Miss a payment milestone and you trigger late fees that erode margins. Miss them simultaneously across a portfolio of hundreds of contracts and the financial exposure becomes existential.


The first edition of this chapter presented a pipeline that extracted obligations, generated calendar events, and produced portfolio dashboards. That pipeline worked for one-time extraction. But obligations are not static. Contracts are amended, deadlines are extended, new obligations are added through side letters, and the organizational memory of what was extracted six months ago evaporates when the paralegal who built the spreadsheet moves to a different team. The first edition pipeline had no memory. It could not recall what it had previously extracted, could not track how obligations had changed over time, and could not learn from past escalation failures.


This second edition adds three capabilities that transform obligation tracking from a point-in-time extraction tool into a persistent organizational memory system. First, **persistent memory** through MongoDB gives the pipeline the ability to accumulate matter context across sessions, track obligation history over time, remember how similar obligations were handled in past matters, and recall which obligations triggered escalation issues previously. Second, **calendar integration** through the Google Calendar and Microsoft Graph APIs pushes extracted deadlines directly into the systems where responsible parties actually manage their time, eliminating the gap between extraction and action. Third, an **alerting pipeline** that runs on a daily schedule scans the obligation database for approaching deadlines and generates escalating notification chains: 30 days out to the obligation owner, 14 days to the team lead, 7 days to the department VP, 3 days to the general counsel, 1 day to the CEO. No obligation arrives as a surprise. Every deadline is surfaced proactively through the channels where people actually work.


> **The Cost of Missing Obligations**
>
> According to the International Association for Contract and Commercial Management
> (IACCM), poor contract management costs organizations an average of 9% of annual
> revenue. A significant portion of this loss stems from missed obligations: auto-renewals
> that lock in above-market rates, compliance failures that trigger penalties, and notice
> windows that close without action. For a company with $100M in annual revenue, that is
> $9M in avoidable loss. Obligation tracking is not administrative overhead. It is a
> direct line item on the income statement.


## What Is a Trackable Obligation?


Before building a system that persists and monitors obligations across years, we need a precise definition that the system can enforce programmatically. In common usage, "obligation" is vague: it could mean anything from a moral duty to a contractual commitment. For the purposes of this pipeline, we define an obligation as a contractual commitment with five required components: a **responsible party** (who must act), an **action** (what they must do), a **trigger condition** (what activates the obligation), a **deadline** (when the action must be completed), and a **consequence for non-performance** (what happens if they fail). If any of these five components is missing, what you have is not a trackable obligation. It is either a general covenant, a representation, or aspirational language. The system tracks obligations, not wishes.


This five-component definition maps directly to the TIRO pattern from Chapter 1. The trigger condition is the T. The responsible party and the action are the I (the inputs that enter the obligation when triggered). The deadline and any processing rules are the R (requirements that constrain how the obligation must be fulfilled). The consequence for non-performance is the O: the output the obligation produces, which may be successful performance or a breach event that cascades into further obligations.


| Legal Language | TypeScript | Explanation |
|---|---|---|
| "Vendor shall deliver monthly uptime reports within five (5) business days of each calendar month end" | `{ party: 'vendor', action: 'deliver_uptime_report', trigger: 'calendar_month_end', deadline: { days: 5, type: 'business' }, consequence: 'breach_of_reporting' }` | Every word maps to a field. "Vendor" becomes the party. "Deliver monthly uptime reports" becomes the action. "Each calendar month end" is the trigger. "Five business days" is the deadline. The implied consequence is breach of reporting obligations. |
| "Customer shall maintain cyber liability insurance with coverage of not less than $5,000,000 throughout the Term" | `{ party: 'customer', action: 'maintain_insurance', trigger: 'contract_execution', deadline: { type: 'continuous', until: 'term_end' }, consequence: 'material_breach' }` | A continuous obligation with no single deadline but an ongoing requirement. The trigger is contract execution itself. The consequence is material breach because insurance clauses protect the counterparty from catastrophic loss. |
| "Either party may terminate upon ninety (90) days prior written notice before any Renewal Date" | `{ party: 'either', action: 'deliver_termination_notice', trigger: 'decision_to_terminate', deadline: { days: 90, before: 'renewal_date' }, consequence: 'auto_renewal' }` | A termination window obligation. The consequence is not a penalty but the automatic renewal of the contract. Missing this window is not a breach; it is an involuntary commitment to another term. This makes it one of the most expensive obligations to miss. |


> **The Five Components of a Trackable Obligation**
>
> Every obligation that can be tracked and monitored by an automated system must have:
> (1) a responsible party, (2) an action, (3) a trigger condition, (4) a deadline, and
> (5) a consequence. Clauses missing any of these five components are covenants,
> representations, or aspirational language: important legally, but not trackable as
> time-bound obligations. The extraction pipeline enforces this schema strictly.
> Incomplete extractions are flagged for human review rather than silently stored
> with missing fields.


## The Obligation Taxonomy


Each obligation category has distinct linguistic patterns that specialist extraction agents must learn to recognize. Understanding these patterns is essential because the specialist prompts must teach the model what to look for, including the subtle variations that drafters use across different contract types and jurisdictions.


### Payment Obligations

Payment obligations are the most common and the most varied. They include recurring payments (monthly SaaS fees, quarterly license fees, annual maintenance charges), milestone-based payments (due upon delivery, due upon acceptance, due upon closing), and conditional payments (triggered by specific events like a breach, an indemnity claim, or an earn-out threshold). The extraction challenge is that payment obligations are scattered throughout a contract rather than concentrated in a single section. The payment schedule lives in one section, late fee provisions in another, reimbursement obligations in a third, and earn-out calculations in a fourth. The payment specialist must scan the entire contract and correlate related payment provisions.


### Performance Obligations

Performance obligations specify what must be provided, when, and to what standard. Product deliveries have ship dates and acceptance windows. Service deliveries have performance milestones and SLA targets. Data deliveries have format specifications and transfer schedules. The extraction pattern hinges on identifying the deliverable (what), the deadline (when), and the acceptance criteria (how the receiving party confirms satisfactory performance). Many performance obligations have cascading consequences: late delivery may trigger penalty clauses, liquidated damages, or termination rights.


### Notice Obligations

Notice requirements are the obligation type most likely to create irreversible consequences. They require a party to inform the other of specific events (breach, change of control, assignment, force majeure) within a defined timeframe. The notice period is often the gate that controls access to other rights. If you must provide thirty days notice to exercise a termination right and you provide it on day thirty-one, you may have waived that right entirely. The notice specialist must identify not only the notice requirement itself but the downstream rights that the notice enables or forecloses.


### Reporting Obligations

Reporting obligations require one party to provide information to the other at specified intervals or upon specified events. Financial reporting obligations appear in loan agreements and investment contracts. Compliance reporting obligations appear in regulatory agreements and data processing agreements. Performance reporting obligations appear in SaaS agreements and managed services contracts. The reporting specialist must distinguish between one-time reports (deliver within 30 days of closing), periodic reports (quarterly financial statements), and event-triggered reports (notify within 48 hours of a data breach).


### Renewal and Termination Obligations

Renewal and termination obligations control the lifecycle of the contract itself. Auto-renewal clauses that require advance notice to prevent extension are the single most expensive obligation type to miss. A typical SaaS agreement auto-renews for successive one-year terms unless either party provides written notice of non-renewal at least sixty to ninety days before the renewal date. For a portfolio of a hundred SaaS contracts averaging $50,000 per year, missing even five auto-renewal windows represents $250,000 in avoidable spend.


### Compliance Obligations

Compliance obligations require a party to maintain specific certifications, insurance coverage, regulatory filings, or operational standards throughout the contract term. Insurance maintenance obligations require specified coverage types at specified minimums with certificates of insurance upon request. Audit cooperation obligations require making records available for inspection. Records retention obligations require maintaining documents for a specified period after termination. These are the obligations most likely to be missed because they feel routine, but their consequences are severe: lapsed insurance can trigger material breach, and failed audits can terminate the relationship.


> **The Auto-Renewal Trap**
>
> Auto-renewal clauses deserve special architectural attention. Unlike most obligations
> where the consequence of missing a deadline is a penalty or breach, the consequence of
> missing an auto-renewal window is involuntary commitment to another full contract term.
> You cannot cure this by performing late. Once the window closes, the renewal is locked.
> The pipeline must identify auto-renewal obligations, assign them critical severity,
> and generate the most aggressive alert cascade available.


## Pipeline Architecture


The obligation tracking pipeline flows through five rounds with parallel execution within the extraction round, followed by an ongoing memory update cycle that operates outside the pipeline's immediate execution. The architecture combines the sequential multi-pass pattern from Chapter 3 with the fan-out/fan-in parallelization from Chapter 4, and adds persistent memory as a new architectural element that transforms the pipeline from a stateless extraction tool into a stateful organizational memory.


```svg
<svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="900" height="520" fill="#f8f9fa" rx="8"/>

  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 16.1 — Five-Round Obligation Tracking Pipeline with Persistent Memory</text>

  <!-- Round 1: Intake -->
  <rect x="50" y="55" width="130" height="60" rx="6" fill="#1a1a2e"/>
  <text x="115" y="82" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="white">Round 1</text>
  <text x="115" y="100" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#16a085">Contract Intake</text>

  <!-- Arrow R1 to R2 -->
  <line x1="180" y1="85" x2="225" y2="85" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 2: Parallel Extraction -->
  <rect x="225" y="45" width="200" height="180" rx="6" fill="none" stroke="#1a1a2e" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="325" y="63" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#1a1a2e">Round 2: Parallel Extraction</text>

  <rect x="240" y="72" width="80" height="22" rx="3" fill="#16a085"/>
  <text x="280" y="87" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Payment</text>

  <rect x="330" y="72" width="80" height="22" rx="3" fill="#16a085"/>
  <text x="370" y="87" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Performance</text>

  <rect x="240" y="100" width="80" height="22" rx="3" fill="#16a085"/>
  <text x="280" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Notice</text>

  <rect x="330" y="100" width="80" height="22" rx="3" fill="#16a085"/>
  <text x="370" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Reporting</text>

  <rect x="240" y="128" width="80" height="22" rx="3" fill="#16a085"/>
  <text x="280" y="143" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Renewal/Term</text>

  <rect x="330" y="128" width="80" height="22" rx="3" fill="#16a085"/>
  <text x="370" y="143" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Compliance</text>

  <!-- Arrow R2 to R3 -->
  <line x1="425" y1="135" x2="470" y2="135" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 3: Validation -->
  <rect x="470" y="105" width="130" height="60" rx="6" fill="#1a1a2e"/>
  <text x="535" y="132" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="white">Round 3</text>
  <text x="535" y="150" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#16a085">Validation</text>

  <!-- Arrow R3 to R4 -->
  <line x1="600" y1="135" x2="645" y2="135" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 4: Calendar Gen -->
  <rect x="645" y="105" width="130" height="60" rx="6" fill="#1a1a2e"/>
  <text x="710" y="132" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="white">Round 4</text>
  <text x="710" y="150" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#16a085">Calendar Gen</text>

  <!-- Arrow R4 to R5 -->
  <line x1="710" y1="165" x2="710" y2="210" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 5: Report -->
  <rect x="645" y="210" width="130" height="60" rx="6" fill="#1a1a2e"/>
  <text x="710" y="237" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="white">Round 5</text>
  <text x="710" y="255" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#16a085">Obligation Report</text>

  <!-- MongoDB Persistent Memory -->
  <rect x="200" y="310" width="500" height="100" rx="6" fill="none" stroke="#f39c12" stroke-width="2"/>
  <text x="450" y="335" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#f39c12">Persistent Memory (MongoDB)</text>

  <rect x="220" y="350" width="100" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="270" y="370" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Matter</text>
  <text x="270" y="385" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Context</text>

  <rect x="340" y="350" width="100" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="390" y="370" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Obligation</text>
  <text x="390" y="385" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">History</text>

  <rect x="460" y="350" width="100" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="510" y="370" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Precedent</text>
  <text x="510" y="385" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Memory</text>

  <rect x="580" y="350" width="100" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="630" y="370" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Escalation</text>
  <text x="630" y="385" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Memory</text>

  <!-- Bidirectional arrows from pipeline to memory -->
  <line x1="115" y1="115" x2="115" y2="310" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="710" y1="270" x2="710" y2="310" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="4,3"/>

  <!-- Alerting Pipeline -->
  <rect x="50" y="440" width="800" height="60" rx="6" fill="none" stroke="#e74c3c" stroke-width="2"/>
  <text x="450" y="462" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#e74c3c">Alerting Pipeline (Daily Scheduled Scan)</text>
  <text x="450" y="485" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#e74c3c">30-day → 14-day → 7-day → 3-day → 1-day escalation chain</text>

  <!-- Arrow from memory to alerting -->
  <line x1="450" y1="410" x2="450" y2="440" stroke="#e74c3c" stroke-width="1.5" marker-end="url(#arrowhead-red)"/>

  <!-- Arrow definitions -->
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#16a085"/>
    </marker>
    <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#e74c3c"/>
    </marker>
  </defs>
</svg>
```


### Round 1: Contract Intake and Memory Lookup

The first round receives a contract document and determines whether the pipeline has seen this matter before. If a matter already exists in persistent memory, the pipeline loads the prior obligation state so that extraction can operate as a delta comparison rather than a fresh scan. This is the key architectural difference from a stateless pipeline: the system knows what it previously extracted, which means it can detect new obligations, modified obligations, and obligations that no longer exist because an amendment removed them.


```typescript
// obligation-tracking-types.ts
// Core type definitions for the obligation tracking pipeline

interface ObligationType {
  category: 'payment' | 'performance' | 'notice' | 'reporting'
    | 'renewal_termination' | 'compliance';
  subcategory: string;
}

interface TriggerCondition {
  type: 'event' | 'date' | 'continuous' | 'conditional';
  description: string;
  schedule?: {
    frequency: 'one_time' | 'monthly' | 'quarterly' | 'annually' | 'ongoing';
    startDate?: string;
    endDate?: string;
  };
}

interface Deadline {
  days?: number;
  dayType: 'calendar' | 'business';
  reference: 'after_trigger' | 'before_event' | 'specific_date';
  referenceEvent?: string;
  specificDate?: string;
}

interface Consequence {
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  financialImpact?: string;
  cascadeRisk: string[];
}

interface StructuredObligation {
  obligationId: string;
  contractId: string;
  clauseId: string;
  type: ObligationType;
  responsibleParty: 'party_a' | 'party_b' | 'either' | 'both';
  action: string;
  triggerCondition: TriggerCondition;
  deadline: Deadline;
  consequence: Consequence;
  dependencies: string[];
  sourceText: string;
  status: 'active' | 'completed' | 'overdue' | 'waived' | 'amended';
  extractedAt: string;
  lastModifiedAt: string;
}

// Persistent memory types
interface MatterContext {
  matterId: string;
  contractId: string;
  contractType: string;
  parties: { partyA: string; partyB: string };
  executionDate: string;
  expirationDate?: string;
  governingLaw: string;
  obligations: StructuredObligation[];
  amendments: AmendmentRecord[];
  extractionHistory: ExtractionRun[];
  createdAt: string;
  updatedAt: string;
}

interface AmendmentRecord {
  amendmentId: string;
  effectiveDate: string;
  description: string;
  obligationsAdded: string[];
  obligationsModified: string[];
  obligationsRemoved: string[];
  processedAt: string;
}

interface ExtractionRun {
  runId: string;
  timestamp: string;
  trigger: 'new_contract' | 'amendment' | 'portfolio_scan';
  obligationsFound: number;
  newObligations: number;
  modifiedObligations: number;
  removedObligations: number;
}
```


The type definitions reveal the persistent memory architecture. A `MatterContext` accumulates everything the pipeline has ever learned about a specific contract: its obligations, its amendments, and every extraction run the pipeline has performed. When the pipeline processes an amendment to a contract it has seen before, it does not start from scratch. It loads the existing context, compares the amendment against the known obligation state, and produces a delta: new obligations added, existing obligations modified, and previous obligations removed.


```typescript
// obligation-tracking-round-01.ts
// Round 1: Contract intake with persistent memory lookup
import Anthropic from '@anthropic-ai/sdk';
import { MongoClient, Db, Collection } from 'mongodb';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface IntakeResult {
  contractId: string;
  contractType: string;
  parties: { partyA: string; partyB: string };
  executionDate: string;
  governingLaw: string;
  clauseCount: number;
  obligationBearingSections: string[];
  existingMatter: MatterContext | null;
  triggerType: 'new_contract' | 'amendment' | 'portfolio_scan';
}

async function intakeContract(
  contractText: string,
  db: Db
): Promise<IntakeResult> {

  // Step 1: Classify the contract and extract metadata
  const classificationPrompt = `You are a contract classification specialist.
Analyze the following contract and extract:
1. Contract type (SaaS, vendor, employment, NDA, loan, etc.)
2. Party A (first named entity) and Party B (counterparty)
3. Execution date
4. Governing law / jurisdiction
5. List every section that contains obligations (payment, delivery,
   reporting, compliance, renewal, termination, insurance, audit, etc.)

CONTRACT TEXT:
${contractText}

Respond in JSON format:
{
  "contractType": "...",
  "partyA": "...",
  "partyB": "...",
  "executionDate": "YYYY-MM-DD",
  "governingLaw": "...",
  "obligationBearingSections": ["Section 3.1 - Payment Terms", ...]
}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 16_384,
    messages: [{ role: 'user', content: classificationPrompt }]
  });
  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  const classification = JSON.parse(text);

  // Step 2: Check persistent memory for existing matter context
  const matters: Collection<MatterContext> = db.collection('matterContexts');
  const existingMatter = await matters.findOne({
    'parties.partyA': classification.partyA,
    'parties.partyB': classification.partyB,
    contractType: classification.contractType
  });

  // Step 3: Determine trigger type
  const triggerType = existingMatter
    ? 'amendment'
    : 'new_contract';

  const contractId = existingMatter?.contractId
    ?? `contract-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    contractId,
    contractType: classification.contractType,
    parties: {
      partyA: classification.partyA,
      partyB: classification.partyB
    },
    executionDate: classification.executionDate,
    governingLaw: classification.governingLaw,
    clauseCount: classification.obligationBearingSections.length,
    obligationBearingSections: classification.obligationBearingSections,
    existingMatter,
    triggerType
  };
}
```


The memory lookup in Step 2 is the architectural pivot. When `existingMatter` is not null, every downstream round operates differently. The extraction agents compare new text against known obligations. The validation round checks whether deadlines have shifted. The calendar generation round updates existing events rather than creating duplicates. Without persistent memory, every pipeline run is a fresh extraction that ignores organizational history. With it, the pipeline accumulates institutional knowledge.


### Round 2: Parallel Obligation Extraction

The second round deploys six specialist extraction agents in parallel, each scanning the contract for a specific category of obligation. This is the same fan-out/fan-in pattern from Chapter 4, applied to the six obligation categories defined in the taxonomy. Each specialist receives the full contract text but focuses its analysis through a single lens.


The parallel architecture is essential because obligation types have distinct linguistic patterns. A generalist agent scanning for all types simultaneously tends to anchor on the most obvious category (usually payment) and under-report subtler categories like insurance maintenance or audit cooperation rights. Six specialists eliminate this anchoring bias. Each agent has one job, and its prompt is engineered to make that specific obligation type salient.


```typescript
// obligation-tracking-round-02.ts
// Round 2: Six parallel specialist extraction agents

type ObligationCategory =
  | 'payment'
  | 'performance'
  | 'notice'
  | 'reporting'
  | 'renewal_termination'
  | 'compliance';

interface ExtractionResult {
  category: ObligationCategory;
  obligations: StructuredObligation[];
  metrics: { inputTokens: number; outputTokens: number; latencyMs: number };
}

// Specialist prompt templates for each obligation category
const SPECIALIST_PROMPTS: Record<ObligationCategory, string> = {
  payment: `You are a PAYMENT OBLIGATION SPECIALIST. Extract every payment
obligation from this contract, including:
- Recurring payments (monthly, quarterly, annual fees)
- Milestone payments (due upon delivery, acceptance, closing)
- Conditional payments (triggered by events, earn-outs, penalties)
- Late payment provisions (interest, penalties, cure periods)
- Reimbursement obligations
- Escrow and holdback provisions

For EACH obligation, extract all five components:
1. Responsible party (who pays)
2. Action (what payment, how much)
3. Trigger (what activates the payment duty)
4. Deadline (when payment is due)
5. Consequence (what happens if payment is late or missed)`,

  performance: `You are a PERFORMANCE OBLIGATION SPECIALIST. Extract every
performance obligation, including:
- Delivery milestones (products, services, data)
- Service level agreements (uptime, response time, resolution time)
- Acceptance criteria and testing periods
- Warranty obligations
- Support and maintenance commitments
- Training and onboarding requirements

Focus on the deliverable, the deadline, and the acceptance standard.`,

  notice: `You are a NOTICE OBLIGATION SPECIALIST. Extract every notice
requirement, including:
- Required notices for breach, default, or force majeure
- Change of control notification requirements
- Assignment and delegation notice provisions
- Insurance claim notices
- Termination notices with required lead times
- Method-of-notice requirements (written, certified mail, email)

CRITICAL: Notice obligations often gate access to other rights. A missed
notice window can permanently foreclose termination rights, extension
options, or cure periods. Flag every notice that controls downstream rights.`,

  reporting: `You are a REPORTING OBLIGATION SPECIALIST. Extract every
reporting requirement, including:
- Financial reporting (statements, audits, projections)
- Compliance certifications (SOC 2, ISO, regulatory filings)
- Performance reporting (KPIs, SLA reports, uptime reports)
- Data breach notification requirements
- Incident reporting obligations
- Board or committee reporting requirements

Distinguish between one-time, periodic, and event-triggered reports.`,

  renewal_termination: `You are a RENEWAL AND TERMINATION SPECIALIST. Extract
every obligation related to contract lifecycle, including:
- Auto-renewal clauses with notice windows
- Termination for convenience provisions
- Termination for cause / material breach provisions
- Expiration dates and wind-down obligations
- Post-termination obligations (data return, transition, survival clauses)
- Right of first refusal or matching rights with exercise windows

CRITICAL: Auto-renewal windows are the single most expensive obligation type
to miss. Flag every renewal clause, identify the exact notice window, and
mark it as CRITICAL severity.`,

  compliance: `You are a COMPLIANCE OBLIGATION SPECIALIST. Extract every
compliance requirement, including:
- Insurance maintenance obligations (types, minimums, certificates)
- Audit and inspection cooperation rights
- Records retention requirements
- Regulatory compliance certifications
- Background check and screening obligations
- Environmental, health, and safety requirements
- Data protection and privacy obligations (GDPR, CCPA, HIPAA)

These are the most frequently missed obligations because they feel routine.
Extract them with the same rigor as payment obligations.`
};

async function extractObligations(
  contractText: string,
  intake: IntakeResult
): Promise<ExtractionResult[]> {

  const categories: ObligationCategory[] = [
    'payment', 'performance', 'notice',
    'reporting', 'renewal_termination', 'compliance'
  ];

  // Fan out all six specialists in parallel
  const results = await Promise.allSettled(
    categories.map(async (category): Promise<ExtractionResult> => {
      const start = Date.now();
      const specialistContext = SPECIALIST_PROMPTS[category];

      // If we have existing matter context, include it for delta detection
      const memoryContext = intake.existingMatter
        ? `\n\nEXISTING ${category.toUpperCase()} OBLIGATIONS ON FILE:\n` +
          intake.existingMatter.obligations
            .filter(o => o.type.category === category)
            .map(o => `- [${o.obligationId}] ${o.action} | Deadline: ${JSON.stringify(o.deadline)} | Status: ${o.status}`)
            .join('\n') +
          '\n\nCompare extracted obligations against the above. Flag NEW obligations not previously tracked, MODIFIED obligations where terms have changed, and obligations that appear to have been REMOVED by this amendment.'
        : '';

      const prompt = `${specialistContext}

CONTRACT TYPE: ${intake.contractType}
PARTY A: ${intake.parties.partyA}
PARTY B: ${intake.parties.partyB}
EXECUTION DATE: ${intake.executionDate}
${memoryContext}

CONTRACT TEXT:
${contractText}

For each obligation, respond with this JSON structure:
{
  "obligations": [
    {
      "action": "description of what must be done",
      "responsibleParty": "party_a" | "party_b" | "either" | "both",
      "triggerCondition": {
        "type": "event" | "date" | "continuous" | "conditional",
        "description": "what activates this obligation",
        "schedule": { "frequency": "one_time|monthly|quarterly|annually|ongoing" }
      },
      "deadline": {
        "days": number_or_null,
        "dayType": "calendar" | "business",
        "reference": "after_trigger" | "before_event" | "specific_date",
        "referenceEvent": "event name if applicable"
      },
      "consequence": {
        "severity": "critical" | "high" | "medium" | "low",
        "description": "what happens on failure",
        "financialImpact": "dollar amount if quantifiable",
        "cascadeRisk": ["list of downstream obligations affected"]
      },
      "sourceText": "exact contract language quoted",
      "deltaType": "new" | "modified" | "unchanged" | "removed"
    }
  ]
}`;

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 32_768,
        messages: [{ role: 'user', content: prompt }]
      });
      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';
      const { input_tokens, output_tokens } = response.usage;

      const parsed = JSON.parse(text);
      const obligations: StructuredObligation[] = parsed.obligations.map(
        (o: any, index: number) => ({
          obligationId: `${intake.contractId}-${category}-${String(index + 1).padStart(3, '0')}`,
          contractId: intake.contractId,
          clauseId: '', // populated by cross-reference in Round 3
          type: { category, subcategory: o.action.split(' ')[0] },
          responsibleParty: o.responsibleParty,
          action: o.action,
          triggerCondition: o.triggerCondition,
          deadline: o.deadline,
          consequence: o.consequence,
          dependencies: o.consequence.cascadeRisk ?? [],
          sourceText: o.sourceText,
          status: 'active' as const,
          extractedAt: new Date().toISOString(),
          lastModifiedAt: new Date().toISOString()
        })
      );

      return {
        category,
        obligations,
        metrics: {
          inputTokens: input_tokens,
          outputTokens: output_tokens,
          latencyMs: Date.now() - start
        }
      };
    })
  );

  // Collect results and log failures
  const successful: ExtractionResult[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      console.error(`[Extraction] Specialist failed: ${result.reason}`);
    }
  }

  return successful;
}
```


> **Why Six Specialists Instead of One Generalist**
>
> TLE R&D experiments consistently show that specialist agents outperform generalists
> on extraction tasks. A single generalist scanning for all obligation types simultaneously
> tends to find 60-70% of obligations, anchoring heavily on payment and delivery while
> missing compliance, notice, and audit cooperation obligations entirely. Six specialists
> running in parallel find 90-95% of obligations. The parallel execution means this
> thoroughness costs no additional wall-clock time: six specialists running simultaneously
> finish at the speed of the slowest specialist, not six times the speed of one.


### Round 3: Cross-Reference Validation

The third round validates extracted obligations against the contract's own internal logic. Defined terms must resolve to actual definitions. Dates must be consistent with the execution date. Cross-references must point to real sections. Conditional obligations must have their conditions clearly identified. This round also deduplicates obligations that multiple specialists may have identified from different angles.


```typescript
// obligation-tracking-round-03.ts
// Round 3: Cross-reference validation and deduplication

interface ValidationResult {
  validObligations: StructuredObligation[];
  issues: ValidationIssue[];
  duplicatesRemoved: number;
}

interface ValidationIssue {
  obligationId: string;
  issueType: 'missing_component' | 'date_conflict' | 'undefined_term'
    | 'broken_cross_reference' | 'conflicting_obligations';
  description: string;
  severity: 'error' | 'warning';
  recommendation: string;
}

async function validateObligations(
  extractions: ExtractionResult[],
  contractText: string,
  intake: IntakeResult
): Promise<ValidationResult> {

  // Step 1: Flatten all extracted obligations
  const allObligations = extractions.flatMap(e => e.obligations);

  // Step 2: Deduplicate obligations identified by multiple specialists
  const deduplicated = deduplicateObligations(allObligations);
  const duplicatesRemoved = allObligations.length - deduplicated.length;

  // Step 3: Validate each obligation against contract context
  const validationPrompt = `You are a contract validation specialist.
Review the following extracted obligations against the source contract.
For each obligation, verify:

1. FIVE-COMPONENT CHECK: Does it have a responsible party, action,
   trigger, deadline, and consequence? Flag any with missing components.
2. DATE CONSISTENCY: Are deadlines consistent with the execution date
   (${intake.executionDate})? Flag deadlines in the past.
3. DEFINED TERMS: Do referenced terms match definitions in the contract?
4. CROSS-REFERENCES: Do section references point to real sections?
5. CONFLICTS: Do any obligations conflict with each other?
   (e.g., two different deadlines for the same deliverable)

EXTRACTED OBLIGATIONS (${deduplicated.length}):
${deduplicated.map(o => `[${o.obligationId}] ${o.type.category}: ${o.action}
  Party: ${o.responsibleParty} | Trigger: ${o.triggerCondition.description}
  Deadline: ${JSON.stringify(o.deadline)} | Consequence: ${o.consequence.description}
  Source: "${o.sourceText}"`).join('\n\n')}

SOURCE CONTRACT:
${contractText}

Respond with JSON:
{
  "validatedObligations": [
    { "obligationId": "...", "isValid": true/false, "clauseId": "Section X.Y" }
  ],
  "issues": [
    {
      "obligationId": "...",
      "issueType": "missing_component|date_conflict|undefined_term|broken_cross_reference|conflicting_obligations",
      "description": "what is wrong",
      "severity": "error|warning",
      "recommendation": "how to fix"
    }
  ]
}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32_768,
    messages: [{ role: 'user', content: validationPrompt }]
  });
  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  const validation = JSON.parse(text);

  // Apply clause IDs to validated obligations
  for (const v of validation.validatedObligations) {
    const obligation = deduplicated.find(o => o.obligationId === v.obligationId);
    if (obligation && v.clauseId) {
      obligation.clauseId = v.clauseId;
    }
  }

  // Filter out obligations with error-level issues
  const errorIds = new Set(
    validation.issues
      .filter((i: ValidationIssue) => i.severity === 'error')
      .map((i: ValidationIssue) => i.obligationId)
  );

  const validObligations = deduplicated.filter(
    o => !errorIds.has(o.obligationId)
  );

  return {
    validObligations,
    issues: validation.issues,
    duplicatesRemoved
  };
}

// Deduplicate obligations that multiple specialists identified
function deduplicateObligations(
  obligations: StructuredObligation[]
): StructuredObligation[] {
  const seen = new Map<string, StructuredObligation>();

  for (const obligation of obligations) {
    // Create a dedup key from the core obligation identity
    const key = [
      obligation.responsibleParty,
      obligation.action.toLowerCase().trim(),
      obligation.triggerCondition.type,
      JSON.stringify(obligation.deadline)
    ].join('::');

    if (!seen.has(key)) {
      seen.set(key, obligation);
    } else {
      // Keep the version with more complete information
      const existing = seen.get(key)!;
      if (obligation.sourceText.length > existing.sourceText.length) {
        seen.set(key, obligation);
      }
    }
  }

  return Array.from(seen.values());
}
```


The deduplication logic deserves attention. When the payment specialist and the compliance specialist both identify a clause requiring annual insurance certificates, the system must recognize these as the same obligation rather than creating duplicate calendar events. The dedup key combines the responsible party, action, trigger type, and deadline structure into a composite identity. When duplicates are found, the version with the longer source text is retained because it typically contains more complete context.


### Round 4: Calendar Generation and Integration

The fourth round converts validated obligations into calendar events with cascading alert schedules. This is where the pipeline crosses from extraction into action: each obligation produces not one calendar event but a cascade of events, each progressively more urgent, each reaching a wider audience.


```typescript
// obligation-tracking-round-04.ts
// Round 4: Calendar event generation with cascading alerts

interface CalendarEvent {
  eventId: string;
  obligationId: string;
  title: string;
  description: string;
  dueDate: Date;
  alertDate: Date;
  severity: 'info' | 'warning' | 'urgent' | 'critical';
  recipients: string[];
  escalationLevel: number;
  recurrence?: {
    frequency: 'monthly' | 'quarterly' | 'annually';
    until?: Date;
  };
}

// Alert cascade configuration by obligation severity
const ALERT_CASCADES: Record<string, {
  daysBeforeDeadline: number;
  severity: CalendarEvent['severity'];
  escalation: number;
}[]> = {
  critical: [
    { daysBeforeDeadline: 90, severity: 'info', escalation: 1 },
    { daysBeforeDeadline: 30, severity: 'warning', escalation: 2 },
    { daysBeforeDeadline: 14, severity: 'urgent', escalation: 3 },
    { daysBeforeDeadline: 7, severity: 'urgent', escalation: 4 },
    { daysBeforeDeadline: 3, severity: 'critical', escalation: 5 },
    { daysBeforeDeadline: 1, severity: 'critical', escalation: 5 }
  ],
  high: [
    { daysBeforeDeadline: 30, severity: 'info', escalation: 1 },
    { daysBeforeDeadline: 14, severity: 'warning', escalation: 2 },
    { daysBeforeDeadline: 7, severity: 'urgent', escalation: 3 },
    { daysBeforeDeadline: 1, severity: 'critical', escalation: 4 }
  ],
  medium: [
    { daysBeforeDeadline: 14, severity: 'info', escalation: 1 },
    { daysBeforeDeadline: 7, severity: 'warning', escalation: 2 },
    { daysBeforeDeadline: 1, severity: 'urgent', escalation: 3 }
  ],
  low: [
    { daysBeforeDeadline: 7, severity: 'info', escalation: 1 },
    { daysBeforeDeadline: 1, severity: 'warning', escalation: 2 }
  ]
};

// Escalation tiers: each level includes all previous levels
const ESCALATION_TIERS: Record<number, string[]> = {
  1: ['obligation_owner'],
  2: ['obligation_owner', 'team_lead'],
  3: ['obligation_owner', 'team_lead', 'department_vp'],
  4: ['obligation_owner', 'team_lead', 'department_vp', 'general_counsel'],
  5: ['obligation_owner', 'team_lead', 'department_vp', 'general_counsel', 'ceo']
};

function generateAlertCascade(
  obligation: StructuredObligation,
  deadlineDate: Date
): CalendarEvent[] {

  const cascade = ALERT_CASCADES[obligation.consequence.severity]
    ?? ALERT_CASCADES.medium;

  return cascade.map((alert, index) => {
    const alertDate = subtractDays(
      deadlineDate,
      alert.daysBeforeDeadline,
      obligation.deadline.dayType
    );

    const recipients = ESCALATION_TIERS[alert.escalation]
      ?? ESCALATION_TIERS[1];

    return {
      eventId: `${obligation.obligationId}_alert_${index}`,
      obligationId: obligation.obligationId,
      title: formatAlertTitle(obligation, alert.daysBeforeDeadline),
      description: formatAlertDescription(obligation, deadlineDate, alert),
      dueDate: deadlineDate,
      alertDate,
      severity: alert.severity,
      recipients,
      escalationLevel: alert.escalation,
      recurrence: obligation.triggerCondition.schedule?.frequency !== 'one_time'
        ? {
            frequency: obligation.triggerCondition.schedule!.frequency as
              'monthly' | 'quarterly' | 'annually',
            until: obligation.triggerCondition.schedule?.endDate
              ? new Date(obligation.triggerCondition.schedule.endDate)
              : undefined
          }
        : undefined
    };
  });
}

function formatAlertTitle(
  obligation: StructuredObligation,
  daysOut: number
): string {
  const urgency = daysOut <= 3 ? 'URGENT' : daysOut <= 7 ? 'ACTION REQUIRED' : 'REMINDER';
  return `[${urgency}] ${obligation.action} — ${daysOut} day${daysOut === 1 ? '' : 's'} remaining`;
}

function formatAlertDescription(
  obligation: StructuredObligation,
  deadline: Date,
  alert: { daysBeforeDeadline: number; severity: string }
): string {
  return [
    `OBLIGATION: ${obligation.action}`,
    `RESPONSIBLE PARTY: ${obligation.responsibleParty}`,
    `DEADLINE: ${deadline.toISOString().split('T')[0]}`,
    `DAYS REMAINING: ${alert.daysBeforeDeadline}`,
    `CONSEQUENCE IF MISSED: ${obligation.consequence.description}`,
    obligation.consequence.financialImpact
      ? `FINANCIAL EXPOSURE: ${obligation.consequence.financialImpact}`
      : '',
    `SOURCE: ${obligation.sourceText}`,
    `CONTRACT: ${obligation.contractId}`
  ].filter(Boolean).join('\n');
}

// Subtract days respecting business day vs calendar day rules
function subtractDays(
  date: Date,
  days: number,
  dayType: 'calendar' | 'business'
): Date {
  const result = new Date(date);

  if (dayType === 'calendar') {
    result.setDate(result.getDate() - days);
    return result;
  }

  // Business days: skip weekends
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() - 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--;
    }
  }
  return result;
}
```


> **Business Days vs. Calendar Days**
>
> Always pay attention to whether a contract specifies business days or calendar days.
> "Five (5) business days" and "five (5) days" produce different deadlines. The former
> excludes weekends and federal holidays, adding two to four days to the actual calendar
> span. Your extraction agent must capture this distinction in the deadline structure,
> and your calendar generation logic must apply the correct day-counting algorithm.
> Getting this wrong by even one day can mean the difference between timely performance
> and breach.


## Calendar API Integration


Calendar event objects sitting in a database do not prevent missed deadlines. What prevents missed deadlines is an alert that arrives in the responsible party's calendar, email, or Slack channel at the right time. The pipeline supports two integration paths: the Google Calendar API for organizations using Google Workspace, and the Microsoft Graph API for organizations using Outlook and Microsoft 365.


```typescript
// calendar-integration.ts
// Push obligation alerts to Google Calendar and Microsoft Graph

import { google } from 'googleapis';

interface CalendarIntegration {
  provider: 'google' | 'microsoft';
  createEvent(event: CalendarEvent): Promise<string>;
  updateEvent(eventId: string, event: CalendarEvent): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
}

// Google Calendar integration
function createGoogleCalendarIntegration(
  auth: any,  // OAuth2 client
  calendarId: string
): CalendarIntegration {
  const calendar = google.calendar({ version: 'v3', auth });

  return {
    provider: 'google',

    async createEvent(event: CalendarEvent): Promise<string> {
      const gcalEvent = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.alertDate.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: new Date(
            event.alertDate.getTime() + 30 * 60 * 1000
          ).toISOString(),
          timeZone: 'America/New_York'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 }
          ]
        },
        colorId: event.severity === 'critical' ? '11'   // red
          : event.severity === 'urgent' ? '6'            // orange
          : event.severity === 'warning' ? '5'           // yellow
          : '9',                                          // blue
        recurrence: event.recurrence
          ? [`RRULE:FREQ=${event.recurrence.frequency.toUpperCase()}`
             + (event.recurrence.until
               ? `;UNTIL=${event.recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
               : '')]
          : undefined
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: gcalEvent
      });

      return response.data.id!;
    },

    async updateEvent(eventId: string, event: CalendarEvent): Promise<void> {
      await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          summary: event.title,
          description: event.description
        }
      });
    },

    async deleteEvent(eventId: string): Promise<void> {
      await calendar.events.delete({ calendarId, eventId });
    }
  };
}

// Microsoft Graph API integration
function createMicrosoftCalendarIntegration(
  accessToken: string
): CalendarIntegration {
  const graphBaseUrl = 'https://graph.microsoft.com/v1.0/me/events';

  return {
    provider: 'microsoft',

    async createEvent(event: CalendarEvent): Promise<string> {
      const msEvent = {
        subject: event.title,
        body: {
          contentType: 'text',
          content: event.description
        },
        start: {
          dateTime: event.alertDate.toISOString(),
          timeZone: 'Eastern Standard Time'
        },
        end: {
          dateTime: new Date(
            event.alertDate.getTime() + 30 * 60 * 1000
          ).toISOString(),
          timeZone: 'Eastern Standard Time'
        },
        isReminderOn: true,
        reminderMinutesBeforeStart: 60,
        categories: [
          event.severity === 'critical' ? 'Red Category'
          : event.severity === 'urgent' ? 'Orange Category'
          : event.severity === 'warning' ? 'Yellow Category'
          : 'Blue Category'
        ]
      };

      const response = await fetch(graphBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(msEvent)
      });

      const data = await response.json();
      return data.id;
    },

    async updateEvent(eventId: string, event: CalendarEvent): Promise<void> {
      await fetch(`${graphBaseUrl}/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: event.title,
          body: { contentType: 'text', content: event.description }
        })
      });
    },

    async deleteEvent(eventId: string): Promise<void> {
      await fetch(`${graphBaseUrl}/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    }
  };
}
```


The abstraction behind the `CalendarIntegration` interface means the pipeline does not need to know which calendar platform the organization uses. The intake configuration specifies the provider and authentication credentials, and all downstream code works through the same interface. Adding support for a third calendar platform (Apple Calendar, Calendly, or a custom system) requires implementing a single interface, not modifying the pipeline.


## Persistent Memory Architecture


Persistent memory is what transforms obligation tracking from a point-in-time extraction into an institutional knowledge system. The memory layer consists of four MongoDB collections, each serving a distinct purpose in the pipeline's accumulated intelligence.


### Matter Context Memory

The matter context collection stores everything the pipeline has learned about a specific contract or engagement. When the pipeline processes a new contract, it creates a matter context record. When it processes an amendment, it loads the existing context, performs delta detection, and updates the record. Over time, the matter context becomes a complete history of every obligation the pipeline has ever extracted for that contract, every amendment that modified those obligations, and every extraction run that processed the contract.


```typescript
// persistent-memory.ts
// MongoDB persistence layer for obligation tracking

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

interface PersistentMemory {
  matters: Collection<MatterContext>;
  obligations: Collection<StructuredObligation & { _id?: ObjectId }>;
  precedents: Collection<PrecedentRecord>;
  escalations: Collection<EscalationRecord>;
}

// Precedent memory: how similar obligations were handled previously
interface PrecedentRecord {
  _id?: ObjectId;
  obligationType: string;
  contractType: string;
  pattern: string;
  resolution: string;
  outcome: 'completed_on_time' | 'completed_late' | 'missed' | 'waived';
  lessonsLearned: string;
  createdAt: string;
}

// Escalation memory: which obligations triggered issues
interface EscalationRecord {
  _id?: ObjectId;
  obligationId: string;
  contractId: string;
  escalationLevel: number;
  reason: 'approaching_deadline' | 'overdue' | 'conflict_detected';
  status: 'acknowledged' | 'in_progress' | 'resolved' | 'unresolved';
  acknowledgedBy?: string;
  resolvedAt?: string;
  notes: string;
  createdAt: string;
}

async function initializePersistentMemory(
  connectionString: string
): Promise<PersistentMemory> {
  const mongoClient = new MongoClient(connectionString);
  await mongoClient.connect();
  const db = mongoClient.db('obligation-tracking');

  // Create indexes for efficient queries
  const matters = db.collection<MatterContext>('matterContexts');
  await matters.createIndex({ contractId: 1 }, { unique: true });
  await matters.createIndex({
    'parties.partyA': 1,
    'parties.partyB': 1,
    contractType: 1
  });

  const obligations = db.collection<StructuredObligation & { _id?: ObjectId }>('obligations');
  await obligations.createIndex({ obligationId: 1 }, { unique: true });
  await obligations.createIndex({ contractId: 1 });
  await obligations.createIndex({ status: 1, 'deadline.specificDate': 1 });
  await obligations.createIndex({ 'type.category': 1 });

  const precedents = db.collection<PrecedentRecord>('precedents');
  await precedents.createIndex({ obligationType: 1, contractType: 1 });

  const escalations = db.collection<EscalationRecord>('escalations');
  await escalations.createIndex({ obligationId: 1 });
  await escalations.createIndex({ status: 1, createdAt: -1 });

  return { matters, obligations, precedents, escalations };
}

// Save extraction results to persistent memory
async function persistExtractionResults(
  memory: PersistentMemory,
  intake: IntakeResult,
  validatedObligations: StructuredObligation[]
): Promise<void> {
  const now = new Date().toISOString();

  // Upsert matter context
  await memory.matters.updateOne(
    { contractId: intake.contractId },
    {
      $set: {
        contractType: intake.contractType,
        parties: intake.parties,
        executionDate: intake.executionDate,
        governingLaw: intake.governingLaw,
        updatedAt: now
      },
      $setOnInsert: {
        matterId: `matter-${intake.contractId}`,
        obligations: [],
        amendments: [],
        extractionHistory: [],
        createdAt: now
      }
    },
    { upsert: true }
  );

  // Upsert each obligation
  for (const obligation of validatedObligations) {
    await memory.obligations.updateOne(
      { obligationId: obligation.obligationId },
      { $set: obligation },
      { upsert: true }
    );
  }

  // Record this extraction run
  const extractionRun: ExtractionRun = {
    runId: `run-${Date.now()}`,
    timestamp: now,
    trigger: intake.triggerType,
    obligationsFound: validatedObligations.length,
    newObligations: validatedObligations.filter(
      o => !intake.existingMatter?.obligations.some(
        e => e.obligationId === o.obligationId
      )
    ).length,
    modifiedObligations: 0,
    removedObligations: 0
  };

  await memory.matters.updateOne(
    { contractId: intake.contractId },
    {
      $push: { extractionHistory: extractionRun },
      $set: { obligations: validatedObligations }
    }
  );
}

// Query precedent memory for similar obligation handling
async function findPrecedents(
  memory: PersistentMemory,
  obligationType: string,
  contractType: string,
  limit: number = 5
): Promise<PrecedentRecord[]> {
  return memory.precedents
    .find({ obligationType, contractType })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// Record an escalation event
async function recordEscalation(
  memory: PersistentMemory,
  obligationId: string,
  contractId: string,
  level: number,
  reason: EscalationRecord['reason']
): Promise<void> {
  await memory.escalations.insertOne({
    obligationId,
    contractId,
    escalationLevel: level,
    reason,
    status: 'acknowledged',
    notes: '',
    createdAt: new Date().toISOString()
  });
}
```


The index strategy is deliberate. The compound index on `status` and `deadline.specificDate` powers the alerting pipeline's daily scan: "find all active obligations with deadlines in the next 30 days" is the query that runs most frequently. The index on `type.category` supports portfolio analytics queries. The unique index on `obligationId` prevents duplicate insertions when the pipeline reprocesses a contract.


### Precedent Memory

Precedent memory records how similar obligations were handled in past matters. When the pipeline extracts a new insurance maintenance obligation from a vendor agreement, precedent memory can surface that the organization has handled twelve similar obligations before, that three were missed, and that the missed ones all shared a common pattern: the certificate of insurance request was sent to a general email address rather than to the specific contact named in the contract. This historical intelligence informs both the alert configuration (more aggressive cascade for this obligation type) and the obligation report (flag this as a historically problematic pattern).


### Escalation Memory

Escalation memory tracks which obligations triggered escalation events and how those escalations were resolved. Over time, this collection reveals organizational failure patterns. If the same team consistently triggers escalation events for reporting obligations, that is a staffing or process problem, not an individual performance problem. If a specific contract type consistently generates overdue obligations, that suggests the contract terms are unreasonable or the onboarding process does not adequately surface the obligations. Escalation memory transforms individual failures into systemic insights.


## The Alerting Pipeline


The alerting pipeline is a separate system that runs on a daily schedule, independent of the extraction pipeline. It scans the obligation database for approaching deadlines and generates notifications through the escalation chain. This separation is architecturally important: the extraction pipeline runs when a new contract or amendment arrives, while the alerting pipeline runs every day regardless of whether any new contracts were processed.


```typescript
// alerting-pipeline.ts
// Daily scheduled scan for approaching obligation deadlines

interface AlertNotification {
  obligationId: string;
  contractId: string;
  action: string;
  daysRemaining: number;
  deadline: Date;
  severity: 'info' | 'warning' | 'urgent' | 'critical';
  escalationLevel: number;
  recipients: string[];
  consequence: string;
}

async function runDailyAlertScan(
  memory: PersistentMemory,
  calendarIntegration: CalendarIntegration,
  notificationService: NotificationService
): Promise<AlertNotification[]> {
  const now = new Date();
  const alerts: AlertNotification[] = [];

  // Query all active obligations with deadlines in the next 90 days
  const upcomingObligations = await memory.obligations
    .find({
      status: 'active',
      'deadline.specificDate': {
        $gte: now.toISOString(),
        $lte: new Date(
          now.getTime() + 90 * 24 * 60 * 60 * 1000
        ).toISOString()
      }
    })
    .toArray();

  // Also check for overdue obligations
  const overdueObligations = await memory.obligations
    .find({
      status: 'active',
      'deadline.specificDate': { $lt: now.toISOString() }
    })
    .toArray();

  // Process overdue obligations: mark as overdue, escalate to max level
  for (const obligation of overdueObligations) {
    await memory.obligations.updateOne(
      { obligationId: obligation.obligationId },
      { $set: { status: 'overdue' } }
    );

    alerts.push({
      obligationId: obligation.obligationId,
      contractId: obligation.contractId,
      action: obligation.action,
      daysRemaining: -Math.ceil(
        (now.getTime() - new Date(obligation.deadline.specificDate!).getTime())
        / (24 * 60 * 60 * 1000)
      ),
      deadline: new Date(obligation.deadline.specificDate!),
      severity: 'critical',
      escalationLevel: 5,
      recipients: ESCALATION_TIERS[5],
      consequence: obligation.consequence.description
    });

    await recordEscalation(
      memory,
      obligation.obligationId,
      obligation.contractId,
      5,
      'overdue'
    );
  }

  // Process upcoming obligations: determine alert tier
  for (const obligation of upcomingObligations) {
    const deadlineDate = new Date(obligation.deadline.specificDate!);
    const daysRemaining = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    );

    const cascade = ALERT_CASCADES[obligation.consequence.severity]
      ?? ALERT_CASCADES.medium;

    // Find the current alert tier based on days remaining
    const currentTier = cascade.find(
      tier => daysRemaining <= tier.daysBeforeDeadline
    );

    if (currentTier) {
      // Check escalation history to avoid duplicate alerts
      const recentEscalation = await memory.escalations.findOne({
        obligationId: obligation.obligationId,
        escalationLevel: currentTier.escalation,
        createdAt: {
          $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }
      });

      if (!recentEscalation) {
        alerts.push({
          obligationId: obligation.obligationId,
          contractId: obligation.contractId,
          action: obligation.action,
          daysRemaining,
          deadline: deadlineDate,
          severity: currentTier.severity,
          escalationLevel: currentTier.escalation,
          recipients: ESCALATION_TIERS[currentTier.escalation],
          consequence: obligation.consequence.description
        });

        await recordEscalation(
          memory,
          obligation.obligationId,
          obligation.contractId,
          currentTier.escalation,
          'approaching_deadline'
        );
      }
    }
  }

  // Send all alerts through the notification service
  for (const alert of alerts) {
    await notificationService.send(alert);
  }

  return alerts;
}
```


The alerting pipeline checks escalation history before sending notifications to prevent duplicate alerts. If the system already sent a 7-day warning for a specific obligation today, it will not send another one tomorrow. But when the obligation crosses into the 3-day window, a new, more urgent alert goes out to a wider audience. This deduplication logic is essential for preventing alert fatigue while still ensuring that escalation proceeds as deadlines approach.


> **Alert Fatigue Is a Design Problem**
>
> The most common failure mode for alerting systems is not insufficient alerts; it is
> excessive alerts. When every obligation generates daily reminders starting 90 days out,
> responsible parties learn to ignore them. The cascading alert pattern with
> severity-calibrated start dates solves this: low-severity obligations generate their
> first alert 7 days out, while critical obligations start at 90 days. Each alert tier
> reaches a wider audience. The system is aggressive where it needs to be and quiet
> where it can be. Design the cascade to match the organization's attention budget.


## Cross-Contract Dependency Analysis


The most dangerous obligations are not the ones with tight deadlines. The most dangerous obligations are the ones that create invisible dependencies across contracts. A change-of-control clause in a Master SaaS Agreement may require notification within thirty days. That same change of control may trigger a consent requirement in a Data Processing Agreement with a different counterparty, an insurance coverage review obligation under a cyber liability policy, and a termination right in a subprocessor agreement. One corporate event triggers a cascade of obligations across four contracts with three different counterparties, each with its own deadline and its own consequence.


```typescript
// dependency-graph.ts
// Cross-contract obligation dependency detection and visualization

interface DependencyEdge {
  sourceObligationId: string;
  sourceContractId: string;
  targetObligationId: string;
  targetContractId: string;
  dependencyType: 'triggers' | 'requires_consent' | 'terminates' | 'blocks';
  description: string;
  cascadeRisk: 'critical' | 'high' | 'medium' | 'low';
}

interface DependencyGraph {
  nodes: {
    contractId: string;
    contractName: string;
    obligationCount: number;
  }[];
  edges: DependencyEdge[];
  clusters: {
    contractIds: string[];
    riskLevel: string;
    triggerEvent: string;
  }[];
}

async function buildDependencyGraph(
  memory: PersistentMemory
): Promise<DependencyGraph> {

  // Load all active obligations across the portfolio
  const allObligations = await memory.obligations
    .find({ status: 'active' })
    .toArray();

  // Group by contract
  const byContract = new Map<string, StructuredObligation[]>();
  for (const o of allObligations) {
    const existing = byContract.get(o.contractId) ?? [];
    existing.push(o);
    byContract.set(o.contractId, existing);
  }

  const contractIds = Array.from(byContract.keys());

  // Analyze all contract pairs for dependencies
  const pairs: [string, string][] = [];
  for (let i = 0; i < contractIds.length; i++) {
    for (let j = i + 1; j < contractIds.length; j++) {
      pairs.push([contractIds[i], contractIds[j]]);
    }
  }

  // Process pairs in parallel batches
  const batchSize = 20;
  const allEdges: DependencyEdge[] = [];

  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async ([contractA, contractB]) => {
        const obligationsA = byContract.get(contractA)!;
        const obligationsB = byContract.get(contractB)!;

        const prompt = `You are a cross-contract dependency analyst.
Analyze whether obligations in Contract A create dependencies on
obligations in Contract B, or vice versa.

CONTRACT A (${contractA}):
${obligationsA.map(o => `- [${o.obligationId}] ${o.action} (${o.triggerCondition.description})`).join('\n')}

CONTRACT B (${contractB}):
${obligationsB.map(o => `- [${o.obligationId}] ${o.action} (${o.triggerCondition.description})`).join('\n')}

Look for:
1. TRIGGER dependencies: performing obligation X triggers obligation Y
2. CONSENT dependencies: obligation X requires approval from Contract B's counterparty
3. TERMINATION cascades: terminating Contract A triggers obligations in Contract B
4. BLOCKING dependencies: obligation X cannot be completed until obligation Y is completed

Respond with JSON:
{
  "dependencies": [
    {
      "sourceObligationId": "...",
      "targetObligationId": "...",
      "dependencyType": "triggers|requires_consent|terminates|blocks",
      "description": "how the dependency works",
      "cascadeRisk": "critical|high|medium|low"
    }
  ]
}

If no dependencies exist, return { "dependencies": [] }.`;

        const stream = client.messages.stream({
          model: 'claude-opus-4-6',
          max_tokens: 8_192,
          messages: [{ role: 'user', content: prompt }]
        });
        const response = await stream.finalMessage();
        const text = response.content.find(c => c.type === 'text')?.text ?? '';
        const parsed = JSON.parse(text);

        return parsed.dependencies.map((dep: any) => ({
          ...dep,
          sourceContractId: contractA,
          targetContractId: contractB
        }));
      })
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        allEdges.push(...result.value);
      }
    }
  }

  // Build nodes and detect high-risk clusters
  const nodes = contractIds.map(id => ({
    contractId: id,
    contractName: id,
    obligationCount: byContract.get(id)?.length ?? 0
  }));

  const clusters = detectClusters(allEdges, contractIds);

  return { nodes, edges: allEdges, clusters };
}

function detectClusters(
  edges: DependencyEdge[],
  contractIds: string[]
): DependencyGraph['clusters'] {
  // Simple connected-component detection for related contracts
  const adjacency = new Map<string, Set<string>>();
  for (const id of contractIds) {
    adjacency.set(id, new Set());
  }
  for (const edge of edges) {
    adjacency.get(edge.sourceContractId)?.add(edge.targetContractId);
    adjacency.get(edge.targetContractId)?.add(edge.sourceContractId);
  }

  const visited = new Set<string>();
  const clusters: DependencyGraph['clusters'] = [];

  for (const id of contractIds) {
    if (visited.has(id)) continue;
    const cluster: string[] = [];
    const queue = [id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      cluster.push(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    if (cluster.length > 1) {
      const clusterEdges = edges.filter(
        e => cluster.includes(e.sourceContractId)
          && cluster.includes(e.targetContractId)
      );
      const maxRisk = clusterEdges.some(e => e.cascadeRisk === 'critical')
        ? 'critical'
        : clusterEdges.some(e => e.cascadeRisk === 'high')
          ? 'high' : 'medium';
      clusters.push({
        contractIds: cluster,
        riskLevel: maxRisk,
        triggerEvent: clusterEdges[0]?.description ?? 'unknown'
      });
    }
  }

  return clusters;
}
```


> **Why Dependencies Are Invisible in Spreadsheets**
>
> A spreadsheet tracks obligations as rows. Each row is independent. There is no mechanism
> to express "if this obligation in row 47 is triggered, then obligations in rows 112, 234,
> and 378 also activate." Dependencies exist in a graph, not a table. The dependency graph
> makes these relationships first-class citizens that can be queried, visualized, and
> monitored automatically. When the organization considers a change of control, the
> dependency graph instantly shows every obligation that will be activated, across every
> affected contract.


## The TIRO Pattern for Obligation Tracking


Applying the TIRO framework from Chapter 1 to the obligation tracking pipeline with persistent memory produces a complete architecture specification.


```typescript
// obligation-tiro-architecture.ts
// Complete TIRO specification for obligation tracking with persistent memory

interface ObligationTrackingTIRO {
  // T (Trigger): three events that activate the pipeline
  triggers: {
    newContract: {
      event: 'contract_signed';
      variant: 'full_extraction';
    };
    amendment: {
      event: 'amendment_executed';
      variant: 'delta_comparison';
    };
    portfolioScan: {
      event: 'scheduled_scan';
      variant: 'validation_pass';
    };
  };

  // I (Input): data that enters the pipeline
  input: {
    documents: string[];
    persistentMemory: PersistentMemory;
    calendarConfig: {
      provider: 'google' | 'microsoft';
      credentials: object;
      calendarId: string;
    };
    alertConfig: {
      cascades: typeof ALERT_CASCADES;
      escalationTiers: typeof ESCALATION_TIERS;
    };
  };

  // R (Requirements): ADVT processing rules
  requirements: {
    arbitration: {
      conflictingDeadlines: 'flag_for_human_review';
      duplicateObligations: 'merge_and_deduplicate';
      crossContractDependencies: 'build_dependency_graph';
      precedentConflicts: 'surface_historical_pattern';
    };
    definitions: {
      obligationTaxonomy: ObligationType[];
      severityScale: Record<string, number>;
      fiveComponentSchema: typeof StructuredObligation;
    };
    validations: {
      fiveComponentCheck: 'reject_incomplete';
      deadlineInFuture: 'flag_past_deadlines';
      crossReferenceIntegrity: 'verify_all_references';
      partyResolution: 'map_to_known_entity';
    };
    transformations: {
      clauseToObligation: 'structured_extraction';
      obligationToCalendar: 'cascading_alert_generation';
      portfolioToGraph: 'dependency_analysis';
      historyToReport: 'trend_and_risk_aggregation';
    };
  };

  // O (Output): what the pipeline produces
  output: {
    obligations: StructuredObligation[];
    calendarEvents: CalendarEvent[];
    dependencyGraph: DependencyGraph;
    portfolioDashboard: PortfolioDashboard;
    validationReport: ValidationResult;
  };
}
```


## Portfolio-Level Obligation Dashboard


The portfolio dashboard aggregates structured obligations across the entire contract portfolio and presents them through four views that answer the questions legal operations teams, general counsel, and executives actually need answered.


```typescript
// portfolio-dashboard.ts
// Portfolio-level obligation intelligence

interface PortfolioDashboard {
  summary: {
    totalObligations: number;
    byStatus: Record<'active' | 'overdue' | 'completed' | 'waived', number>;
    bySeverity: Record<'critical' | 'high' | 'medium' | 'low', number>;
    byCategory: Record<string, number>;
    totalContracts: number;
    averageObligationsPerContract: number;
  };

  // Upcoming deadlines sorted by urgency
  upcomingDeadlines: {
    obligation: StructuredObligation;
    daysRemaining: number;
    dependencyCount: number;
  }[];

  // Monthly obligation density
  densityByMonth: {
    month: string;
    count: number;
    criticalCount: number;
    categories: Record<string, number>;
  }[];

  // High-risk clusters from dependency analysis
  riskClusters: DependencyGraph['clusters'];

  // Historical performance metrics
  performance: {
    completedOnTime: number;
    completedLate: number;
    missed: number;
    waived: number;
    onTimeRate: number;
    averageCompletionDaysBeforeDeadline: number;
  };
}

async function generatePortfolioDashboard(
  memory: PersistentMemory
): Promise<PortfolioDashboard> {
  const now = new Date();

  // Load all obligations
  const allObligations = await memory.obligations.find({}).toArray();
  const activeObligations = allObligations.filter(o => o.status === 'active');
  const overdueObligations = allObligations.filter(o => o.status === 'overdue');

  // Summary statistics
  const byStatus = {
    active: allObligations.filter(o => o.status === 'active').length,
    overdue: allObligations.filter(o => o.status === 'overdue').length,
    completed: allObligations.filter(o => o.status === 'completed').length,
    waived: allObligations.filter(o => o.status === 'waived').length
  };

  const bySeverity = {
    critical: activeObligations.filter(o => o.consequence.severity === 'critical').length,
    high: activeObligations.filter(o => o.consequence.severity === 'high').length,
    medium: activeObligations.filter(o => o.consequence.severity === 'medium').length,
    low: activeObligations.filter(o => o.consequence.severity === 'low').length
  };

  const byCategory: Record<string, number> = {};
  for (const o of activeObligations) {
    byCategory[o.type.category] = (byCategory[o.type.category] ?? 0) + 1;
  }

  const contracts = new Set(allObligations.map(o => o.contractId));

  // Upcoming deadlines sorted by proximity
  const upcomingDeadlines = activeObligations
    .filter(o => o.deadline.specificDate)
    .map(o => {
      const deadline = new Date(o.deadline.specificDate!);
      return {
        obligation: o,
        daysRemaining: Math.ceil(
          (deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        ),
        dependencyCount: 0
      };
    })
    .filter(d => d.daysRemaining > 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Monthly density for next 12 months
  const densityByMonth: PortfolioDashboard['densityByMonth'] = [];
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
    const monthLabel = monthStart.toISOString().slice(0, 7);

    const monthObligations = activeObligations.filter(o => {
      if (!o.deadline.specificDate) return false;
      const d = new Date(o.deadline.specificDate);
      return d >= monthStart && d <= monthEnd;
    });

    const categories: Record<string, number> = {};
    for (const o of monthObligations) {
      categories[o.type.category] = (categories[o.type.category] ?? 0) + 1;
    }

    densityByMonth.push({
      month: monthLabel,
      count: monthObligations.length,
      criticalCount: monthObligations.filter(
        o => o.consequence.severity === 'critical'
      ).length,
      categories
    });
  }

  // Historical performance
  const completed = allObligations.filter(o => o.status === 'completed');
  const missed = allObligations.filter(o => o.status === 'overdue');
  const onTimeRate = completed.length > 0
    ? completed.length / (completed.length + missed.length)
    : 1;

  return {
    summary: {
      totalObligations: allObligations.length,
      byStatus,
      bySeverity,
      byCategory,
      totalContracts: contracts.size,
      averageObligationsPerContract: contracts.size > 0
        ? allObligations.length / contracts.size
        : 0
    },
    upcomingDeadlines: upcomingDeadlines.slice(0, 50),
    densityByMonth,
    riskClusters: [],
    performance: {
      completedOnTime: completed.length,
      completedLate: 0,
      missed: missed.length,
      waived: byStatus.waived,
      onTimeRate,
      averageCompletionDaysBeforeDeadline: 0
    }
  };
}
```


The monthly density view is particularly valuable for resource planning. When the dashboard shows that March has forty-seven obligations due (including twelve critical ones) while April has only fourteen, the legal operations team can plan staffing accordingly. Without this view, obligation clusters appear as surprises. With it, they are anticipated and managed.


## The Complete Backautocrat


The Backautocrat orchestrates all five rounds of the pipeline, manages the persistent memory lifecycle, and emits progress events through Server-Sent Events for real-time frontend tracking.


```typescript
// obligation-tracking-backautocrat.ts
// Complete pipeline orchestration with persistent memory

async function runObligationTrackingPipeline(
  contractText: string,
  config: {
    mongoConnectionString: string;
    calendarProvider: 'google' | 'microsoft';
    calendarCredentials: object;
    calendarId: string;
  },
  emitSSE: (event: { stage: string; status: string; data?: any }) => void
): Promise<{
  obligations: StructuredObligation[];
  calendarEvents: CalendarEvent[];
  dashboard: PortfolioDashboard;
  validation: ValidationResult;
}> {

  // Initialize persistent memory
  const memory = await initializePersistentMemory(
    config.mongoConnectionString
  );

  // ── Round 1: Contract Intake with Memory Lookup ─────────────
  emitSSE({ stage: 'intake', status: 'running' });
  const intake = await intakeContract(contractText, memory.matters.dbName as any);
  emitSSE({
    stage: 'intake',
    status: 'complete',
    data: {
      contractType: intake.contractType,
      parties: intake.parties,
      triggerType: intake.triggerType,
      existingMatter: !!intake.existingMatter,
      obligationBearingSections: intake.obligationBearingSections.length
    }
  });

  // ── Round 2: Parallel Obligation Extraction ─────────────────
  emitSSE({ stage: 'extraction', status: 'running' });
  const extractions = await extractObligations(contractText, intake);
  const totalExtracted = extractions.reduce(
    (sum, e) => sum + e.obligations.length, 0
  );
  emitSSE({
    stage: 'extraction',
    status: 'complete',
    data: {
      totalExtracted,
      byCategory: Object.fromEntries(
        extractions.map(e => [e.category, e.obligations.length])
      )
    }
  });

  // ── Round 3: Cross-Reference Validation ─────────────────────
  emitSSE({ stage: 'validation', status: 'running' });
  const validation = await validateObligations(
    extractions, contractText, intake
  );
  emitSSE({
    stage: 'validation',
    status: 'complete',
    data: {
      validObligations: validation.validObligations.length,
      issues: validation.issues.length,
      duplicatesRemoved: validation.duplicatesRemoved
    }
  });

  // ── Round 4: Calendar Generation ────────────────────────────
  emitSSE({ stage: 'calendar', status: 'running' });
  const allCalendarEvents: CalendarEvent[] = [];

  for (const obligation of validation.validObligations) {
    if (obligation.deadline.specificDate) {
      const deadlineDate = new Date(obligation.deadline.specificDate);
      const events = generateAlertCascade(obligation, deadlineDate);
      allCalendarEvents.push(...events);
    }
  }

  emitSSE({
    stage: 'calendar',
    status: 'complete',
    data: {
      eventsGenerated: allCalendarEvents.length,
      obligationsCovered: validation.validObligations.filter(
        o => o.deadline.specificDate
      ).length
    }
  });

  // ── Round 5: Portfolio Dashboard ────────────────────────────
  emitSSE({ stage: 'dashboard', status: 'running' });

  // Persist results before generating dashboard
  await persistExtractionResults(
    memory, intake, validation.validObligations
  );

  const dashboard = await generatePortfolioDashboard(memory);
  emitSSE({
    stage: 'dashboard',
    status: 'complete',
    data: {
      totalPortfolioObligations: dashboard.summary.totalObligations,
      activeContracts: dashboard.summary.totalContracts,
      upcomingCritical: dashboard.upcomingDeadlines.filter(
        d => d.obligation.consequence.severity === 'critical'
      ).length
    }
  });

  return {
    obligations: validation.validObligations,
    calendarEvents: allCalendarEvents,
    dashboard,
    validation
  };
}
```


## Key Differences from the First Edition


The first edition presented obligation tracking as a five-stage extraction pipeline. The second edition preserves that pipeline structure but adds three layers that make it production-ready for organizations managing obligations over years, not hours.


**Persistent memory** means the pipeline remembers. When a contract is amended six months after initial extraction, the pipeline loads the prior state, detects what changed, and updates only the affected obligations. Without memory, every pipeline run starts from zero. With memory, the pipeline accumulates institutional knowledge that improves with every run.


**Calendar integration** means the pipeline acts. Structured obligation records sitting in a database do not prevent missed deadlines. Calendar events in the responsible party's Outlook or Google Calendar, with escalating alerts that reach progressively wider audiences, transform extraction into action.


**The alerting pipeline** means the pipeline watches. A separate daily scan, independent of the extraction pipeline, monitors the obligation database for approaching deadlines and generates notifications through the escalation chain. The extraction pipeline runs on demand. The alerting pipeline runs every day, whether or not any new contracts were processed.


Together, these three additions transform obligation tracking from a one-time analysis into a living organizational memory that extracts, persists, monitors, and escalates, across every contract in the portfolio, every day, for as long as the obligations remain active.


---


**Key Takeaways**

- A trackable obligation has five required components: responsible party, action, trigger condition, deadline, and consequence. Clauses missing any component are covenants or representations, not obligations the system can monitor.
- Six parallel specialist extraction agents (payment, performance, notice, reporting, renewal/termination, compliance) outperform a single generalist by 25-35% on obligation detection, without any wall-clock time penalty.
- Persistent memory through MongoDB transforms the pipeline from a stateless extraction tool into an organizational knowledge system that tracks obligation history, amendment deltas, precedent patterns, and escalation failures.
- Calendar integration through the Google Calendar API and Microsoft Graph API pushes obligations directly into the systems where responsible parties manage their time, closing the gap between extraction and action.
- The alerting pipeline runs daily on a schedule, independent of extraction. It scans the obligation database for approaching deadlines and generates escalating notification chains: 30/14/7/3/1 day cascades reaching progressively wider audiences.
- Cross-contract dependency analysis reveals invisible obligation cascades that spreadsheets cannot represent. A single corporate event (change of control, termination, breach) can trigger obligations across multiple contracts with different counterparties and different deadlines.
- Alert fatigue is a design problem, not a volume problem. Severity-calibrated alert cascades ensure that critical obligations receive aggressive monitoring while routine obligations generate proportionate attention.
- The auto-renewal trap is the single most expensive obligation type to miss. The pipeline assigns critical severity to every renewal clause and generates the most aggressive alert cascade available.
- Business day vs. calendar day calculation must be captured at extraction time and applied correctly in calendar generation. A one-day error can mean the difference between timely performance and breach.
- The portfolio dashboard reveals patterns invisible at the contract level: monthly obligation density spikes, category distribution, historical on-time rates, and high-risk dependency clusters.

