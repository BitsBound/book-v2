\newpage

# Chapter 17: Litigation Support

*RAG-Enhanced Issue Coding, Privilege Screening with HITL Handoff, and Deposition Analysis*


In 2006, amendments to the Federal Rules of Civil Procedure formally recognized electronically stored information as discoverable evidence. That single rule change unleashed a flood. Modern litigation no longer involves a few filing cabinets of paper. A single antitrust investigation can generate ten million documents. A securities fraud case might pull emails, Slack messages, texts, shared drives, and database exports from dozens of custodians across a decade. The volume is staggering, and the cost of reviewing it manually is ruinous.


Traditional document review costs between one and two dollars per document. At ten million documents, that is ten to twenty million dollars spent before a single deposition is taken or a single motion is filed. The first wave of technology-assisted review (TAR) brought costs down by training machine learning classifiers on human seed sets. But TAR 1.0 had real limitations: it required expensive human training rounds (often ten to twenty iterations), struggled with multi-label classification, and treated privilege as an afterthought. AI-powered legal engineering is the second wave. Multi-agent architectures can classify, code, and screen documents with specialist precision, at a fraction of the cost, and with defensibility metrics that courts have already accepted.


The first edition of this chapter presented the core eDiscovery pipeline: relevance classification, issue coding, privilege screening, and quality control. That pipeline handled the fundamental classification problems but treated each pipeline run as independent, had no mechanism for retrieving relevant case law to ground coding decisions in legal authority, and handled privilege as a binary classification rather than a graduated escalation that routes ambiguous documents to human attorneys for review.


This second edition adds four capabilities that transform litigation support from a document classification engine into a comprehensive case management system. First, **RAG-enhanced issue coding** retrieves relevant case opinions from a vector database and injects them into coding prompts, grounding every classification decision in current legal authority rather than the model's training data. Second, **persistent memory** accumulates case context across review sessions spanning months or years: case theory evolution, witness statements, document coding decisions, and identified contradictions. Third, **privilege screening with HITL handoff** implements a three-tier graduated escalation that automatically clears non-privileged documents, automatically flags clearly privileged ones, and routes ambiguous documents to a human attorney decision gate. Fourth, **deposition contradiction analysis** cross-references deposition testimony against documentary evidence to identify impeachment opportunities, building on Taylor Legal Engineering's open-source deposition contradiction analysis pipeline.


> **Three Problems, Three Architectures**
>
> Relevance review optimizes for recall (find everything that matters). Issue coding
> optimizes for precision (tag documents to the right issues with the right legal basis).
> Privilege screening optimizes for safety (never produce a privileged document). Each
> optimization target demands a different pipeline design, and each is enhanced
> differently by the V2 additions. RAG improves issue coding precision. Persistent
> memory improves relevance review consistency. HITL handoff improves privilege
> screening safety.


## The Three Pillars of Litigation Support


Litigation support encompasses hundreds of tasks, but three classification problems dominate the cost and complexity of every case: relevance review, issue coding, and privilege screening. Understanding why each is architecturally distinct is essential before building the pipeline.


**Relevance review** is the first filter. Given a collection of documents, which ones relate to the issues in the litigation? This is a binary classification: relevant or not relevant. The stakes are moderate: missing a relevant document is bad (and potentially sanctionable), but over-including irrelevant documents only increases review cost. The goal is high recall (find everything relevant) with acceptable precision (do not bury reviewers in noise). A single diplomat with a focused prompt handles first-pass relevance well because the decision is binary and documents near the decision boundary route to human review.


**Issue coding** is the analytical layer. Each relevant document may relate to one or more legal issues in the case. An antitrust case might have twelve issues: market definition, market power, price fixing, bid rigging, customer allocation, tying arrangements, exclusive dealing, and more. Issue coding is multi-label classification, meaning a single email might be tagged to three different issues simultaneously. This is where parallel specialist agents and RAG-enhanced prompts shine: each issue requires domain-specific reasoning grounded in case law.


**Privilege screening** is the highest-stakes classification in all of litigation support. Attorney-client privilege is binary and absolute: a document is either privileged or it is not. Producing a privileged document to opposing counsel is malpractice. In some jurisdictions, inadvertent production can waive privilege for the entire subject matter. But over-designating privilege wastes review time and can draw judicial sanctions for obstruction. The error tolerance is asymmetric: false negatives (missing a privileged document) are catastrophic, while false positives (flagging a non-privileged document for review) are merely costly. This asymmetry demands the most conservative architecture of any legal AI task: when in doubt, escalate to a human attorney.


## Pipeline Architecture


The litigation support pipeline flows through five rounds. Round 1 ingests the document collection and extracts metadata. Round 2 screens every document for privilege using the three-tier HITL escalation pattern. Round 3 codes every non-privileged document against the issue taxonomy using RAG-enhanced specialist agents. Round 4, when deposition transcripts are available, cross-references testimony against documents to identify contradictions. Round 5 synthesizes findings into a case-level report and persists all decisions to memory.


```svg
<svg viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="900" height="700" fill="#f8f9fa" rx="8"/>

  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 17.1 — Five-Round Litigation Support Pipeline with RAG, HITL Privilege Screening, and Persistent Memory</text>

  <!-- Round 1: Document Intake -->
  <rect x="50" y="55" width="800" height="55" rx="6" fill="#1a1a2e"/>
  <text x="450" y="78" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="white">Round 1: Document Intake</text>
  <text x="450" y="98" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#16a085">Metadata extraction | Deduplication | Classification | Thread reconstruction</text>

  <!-- Arrow R1 to R2 -->
  <line x1="450" y1="110" x2="450" y2="130" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 2: Privilege Screening HITL -->
  <rect x="50" y="130" width="800" height="130" rx="6" fill="none" stroke="#e74c3c" stroke-width="2"/>
  <text x="450" y="150" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#e74c3c">Round 2: Privilege Screening (Three-Tier HITL)</text>

  <!-- Three tiers -->
  <rect x="80" y="165" width="220" height="40" rx="4" fill="#16a085"/>
  <text x="190" y="182" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="white">Tier 1: Auto-Clear</text>
  <text x="190" y="198" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="white">No attorney involvement</text>

  <rect x="340" y="165" width="220" height="40" rx="4" fill="#f39c12"/>
  <text x="450" y="182" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="white">Tier 2: Auto-Flag</text>
  <text x="450" y="198" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="white">Attorney on thread</text>

  <rect x="600" y="165" width="220" height="40" rx="4" fill="#e74c3c"/>
  <text x="710" y="182" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="white">Tier 3: HITL Escalation</text>
  <text x="710" y="198" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="white">Ambiguous → Attorney Review</text>

  <!-- HITL decision gate -->
  <rect x="640" y="215" width="140" height="30" rx="4" fill="none" stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="710" y="235" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#e74c3c">Attorney Decision Gate</text>

  <!-- Arrow R2 to R3 -->
  <line x1="450" y1="260" x2="450" y2="280" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 3: Issue Coding with RAG -->
  <rect x="50" y="280" width="800" height="110" rx="6" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <text x="450" y="300" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#1a1a2e">Round 3: RAG-Enhanced Issue Coding (Parallel Specialists)</text>

  <!-- Specialist agents -->
  <rect x="80" y="310" width="90" height="30" rx="3" fill="#16a085"/>
  <text x="125" y="329" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Issue 1</text>
  <rect x="185" y="310" width="90" height="30" rx="3" fill="#16a085"/>
  <text x="230" y="329" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Issue 2</text>
  <rect x="290" y="310" width="90" height="30" rx="3" fill="#16a085"/>
  <text x="335" y="329" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Issue 3</text>
  <rect x="395" y="310" width="90" height="30" rx="3" fill="#16a085"/>
  <text x="440" y="329" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="white">Issue N</text>

  <!-- RAG database -->
  <rect x="560" y="305" width="260" height="40" rx="4" fill="#f39c12" opacity="0.2" stroke="#f39c12" stroke-width="1"/>
  <text x="690" y="320" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#f39c12">Vector DB: Case Law</text>
  <text x="690" y="335" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" fill="#f39c12">Semantic retrieval → prompt injection</text>

  <!-- Arrow R3 to R4 -->
  <line x1="450" y1="390" x2="450" y2="410" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 4: Deposition Analysis -->
  <rect x="50" y="410" width="800" height="55" rx="6" fill="#1a1a2e"/>
  <text x="450" y="433" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="white">Round 4: Deposition Contradiction Analysis</text>
  <text x="450" y="453" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#16a085">Testimony x Documents cross-reference | Impeachment identification</text>

  <!-- Arrow R4 to R5 -->
  <line x1="450" y1="465" x2="450" y2="485" stroke="#16a085" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Round 5: Synthesis -->
  <rect x="50" y="485" width="800" height="55" rx="6" fill="#1a1a2e"/>
  <text x="450" y="508" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="white">Round 5: Synthesis and Reporting</text>
  <text x="450" y="528" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#16a085">Case summary | Privilege log | Production set | Memory update</text>

  <!-- Persistent Memory -->
  <rect x="100" y="570" width="700" height="100" rx="6" fill="none" stroke="#f39c12" stroke-width="2"/>
  <text x="450" y="593" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#f39c12">Persistent Memory (MongoDB)</text>

  <rect x="120" y="605" width="120" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="180" y="625" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Case Theory</text>
  <text x="180" y="640" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Memory</text>

  <rect x="260" y="605" width="120" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="320" y="625" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Witness</text>
  <text x="320" y="640" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Memory</text>

  <rect x="400" y="605" width="120" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="460" y="625" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Document</text>
  <text x="460" y="640" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Coding Memory</text>

  <rect x="540" y="605" width="120" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="600" y="625" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Contradiction</text>
  <text x="600" y="640" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Memory</text>

  <rect x="680" y="605" width="100" height="45" rx="3" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="730" y="625" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Issue</text>
  <text x="730" y="640" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#f39c12">Memory</text>

  <!-- Bidirectional arrows memory to pipeline -->
  <line x1="450" y1="540" x2="450" y2="570" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="4,3"/>

  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#16a085"/>
    </marker>
  </defs>
</svg>
```


## Core Type Definitions


The type system enforces the structure of every classification decision, privilege determination, and coding result throughout the pipeline.


```typescript
// litigation-support-types.ts
// Core types for the litigation support pipeline

// Document types
interface LitDocument {
  id: string;
  text: string;
  metadata: DocumentMetadata;
}

interface DocumentMetadata {
  custodian: string;
  dateCreated: string;
  dateSent: string | null;
  from: string | null;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string | null;
  filePath: string;
  fileType: 'email' | 'memo' | 'contract' | 'spreadsheet'
    | 'presentation' | 'image' | 'other';
  hashMd5: string;
  hashSha256: string;
  threadId: string | null;
  attachmentIds: string[];
  isAttachment: boolean;
  parentDocId: string | null;
}

// Classification results
interface DocumentClassification {
  documentId: string;
  relevance: RelevanceResult;
  privilege: PrivilegeResult;
  issueCodes: IssueCodeResult[];
  reviewStage: 'ai-classified' | 'human-reviewed' | 'qc-sampled';
  classifiedAt: string;
}

interface RelevanceResult {
  isRelevant: boolean;
  confidence: number;
  reasoning: string;
}

interface PrivilegeResult {
  tier: 'auto-clear' | 'auto-flag' | 'hitl-escalation';
  isPrivileged: boolean | null; // null = awaiting human review
  confidence: number;
  basis: 'attorney-client' | 'work-product' | 'both' | 'none' | 'pending';
  reasoning: string;
  privilegeLogEntry: string | null;
  humanReviewRequired: boolean;
  humanDecision?: {
    reviewedBy: string;
    reviewedAt: string;
    isPrivileged: boolean;
    basis: string;
    notes: string;
  };
}

interface IssueCodeResult {
  issueId: string;
  issueName: string;
  isApplicable: boolean;
  confidence: number;
  relevantPassages: string[];
  citedAuthority: string[]; // Case citations from RAG
  reasoning: string;
}

// Case configuration
interface CaseConfig {
  caseId: string;
  caseName: string;
  caseDescription: string;
  relevanceCriteria: string;
  issues: IssueTaxonomy[];
  privilegeConfig: PrivilegeConfig;
  depositions: DepositionTranscript[];
}

interface IssueTaxonomy {
  id: string;
  name: string;
  description: string;
  keyIndicators: string[];
  relevantStatutes: string[];
  relevantCaseLaw: string[];
}

interface PrivilegeConfig {
  attorneyList: string[];
  clientEntities: string[];
  litigationTimeline: string;
  privilegeRules: string;
}

// Deposition types (from TLE open-source pipeline)
interface DepositionTranscript {
  id: string;
  metadata: {
    deponentName: string;
    role: string;
    alignment: 'adverse' | 'friendly' | 'neutral' | 'third-party';
    dateTaken: string;
    durationHours: number;
    keyIssues?: string;
  };
  content: string;
}
```


The `PrivilegeResult` type reveals the HITL handoff architecture. The `isPrivileged` field is `boolean | null`, where null means the document has been escalated to human review but no decision has been rendered yet. The `humanDecision` sub-object captures the attorney's determination, the timestamp, and their reasoning. This design allows the pipeline to continue processing non-escalated documents while ambiguous ones await human review, then resume privilege log generation once all decisions are in.


## The TIRO Pattern for Litigation Support


Mapping the litigation support workflow to TIRO before writing code ensures that every element of the discovery process is addressed.


| TIRO Component | Litigation Support Application |
|---|---|
| **T (Trigger)** | Collection complete from N custodians; litigation hold issued; discovery requests served under Rule 34 |
| **I (Input)** | Document collection (1K-10M docs); custodian list with roles; issue taxonomy from case theory; attorney list for privilege screening; deposition transcripts; case law vector database |
| **R (Requirements)** | **Arbitration:** Conflicting privilege determinations resolved by conservative default. **Definitions:** Issue taxonomy, privilege rules, relevance criteria, confidence thresholds. **Validations:** Defensibility metrics (precision, recall, F1 with confidence intervals). **Transformations:** Raw documents → classified documents → production set + privilege log |
| **O (Output)** | Classified documents with issue tags; privilege log for withheld documents; production set; deposition contradiction report; defensibility metrics; persistent case memory |


The requirements layer is where most litigation support projects fail. Teams rush to build AI classifiers without first defining precise relevance criteria, building a complete issue taxonomy, or establishing defensibility thresholds. A relevance classifier that does not know what "relevant" means for this specific case will produce unreliable results. An issue coder without a complete taxonomy will miss categories. A privilege screener without clear rules will either miss privileged documents or flag everything. Define the requirements before writing a single prompt.


## Round 1: Document Intake


The intake round processes a raw document collection into structured objects that downstream classification agents can analyze. This stage handles text extraction, metadata parsing, deduplication, and thread reconstruction.


```typescript
// litigation-support-round-01.ts
// Round 1: Document intake and metadata extraction
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface IntakeResult {
  documents: LitDocument[];
  duplicatesRemoved: number;
  threadGroups: Map<string, string[]>;
  metadata: {
    totalIngested: number;
    byFileType: Record<string, number>;
    byCustodian: Record<string, number>;
    dateRange: { earliest: string; latest: string };
  };
}

async function ingestDocumentCollection(
  rawDocuments: { id: string; text: string; rawMetadata: any }[]
): Promise<IntakeResult> {

  // Step 1: Extract structured metadata from raw documents
  const processed: LitDocument[] = [];
  const hashSet = new Set<string>();
  let duplicatesRemoved = 0;

  for (const raw of rawDocuments) {
    // Compute hash for deduplication
    const hash = computeHash(raw.text);
    if (hashSet.has(hash)) {
      duplicatesRemoved++;
      continue;
    }
    hashSet.add(hash);

    // Parse metadata from raw document properties
    const metadata = parseMetadata(raw.rawMetadata);

    processed.push({
      id: raw.id,
      text: raw.text,
      metadata: {
        ...metadata,
        hashMd5: hash,
        hashSha256: computeSha256(raw.text)
      }
    });
  }

  // Step 2: Reconstruct email threads
  const threadGroups = reconstructThreads(processed);

  // Step 3: Compute summary statistics
  const byFileType: Record<string, number> = {};
  const byCustodian: Record<string, number> = {};
  let earliest = '';
  let latest = '';

  for (const doc of processed) {
    byFileType[doc.metadata.fileType] =
      (byFileType[doc.metadata.fileType] ?? 0) + 1;
    byCustodian[doc.metadata.custodian] =
      (byCustodian[doc.metadata.custodian] ?? 0) + 1;

    const date = doc.metadata.dateSent ?? doc.metadata.dateCreated;
    if (!earliest || date < earliest) earliest = date;
    if (!latest || date > latest) latest = date;
  }

  return {
    documents: processed,
    duplicatesRemoved,
    threadGroups,
    metadata: {
      totalIngested: processed.length,
      byFileType,
      byCustodian,
      dateRange: { earliest, latest }
    }
  };
}

// Reconstruct email threads from message IDs and subject lines
function reconstructThreads(
  documents: LitDocument[]
): Map<string, string[]> {
  const threads = new Map<string, string[]>();

  for (const doc of documents) {
    if (doc.metadata.threadId) {
      const existing = threads.get(doc.metadata.threadId) ?? [];
      existing.push(doc.id);
      threads.set(doc.metadata.threadId, existing);
    }
  }

  return threads;
}

function computeHash(text: string): string {
  const { createHash } = require('crypto');
  return createHash('md5').update(text).digest('hex');
}

function computeSha256(text: string): string {
  const { createHash } = require('crypto');
  return createHash('sha256').update(text).digest('hex');
}

function parseMetadata(raw: any): Omit<DocumentMetadata, 'hashMd5' | 'hashSha256'> {
  return {
    custodian: raw.custodian ?? 'unknown',
    dateCreated: raw.dateCreated ?? raw.date ?? new Date().toISOString(),
    dateSent: raw.dateSent ?? raw.sentDate ?? null,
    from: raw.from ?? null,
    to: Array.isArray(raw.to) ? raw.to : raw.to ? [raw.to] : [],
    cc: Array.isArray(raw.cc) ? raw.cc : raw.cc ? [raw.cc] : [],
    bcc: Array.isArray(raw.bcc) ? raw.bcc : raw.bcc ? [raw.bcc] : [],
    subject: raw.subject ?? null,
    filePath: raw.filePath ?? '',
    fileType: classifyFileType(raw.filePath ?? '', raw.contentType ?? ''),
    threadId: raw.threadId ?? raw.messageId ?? null,
    attachmentIds: raw.attachmentIds ?? [],
    isAttachment: raw.isAttachment ?? false,
    parentDocId: raw.parentDocId ?? null
  };
}

function classifyFileType(
  filePath: string,
  contentType: string
): DocumentMetadata['fileType'] {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  if (['eml', 'msg'].includes(ext) || contentType.includes('message'))
    return 'email';
  if (['doc', 'docx', 'rtf', 'txt', 'pdf'].includes(ext))
    return 'memo';
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return 'spreadsheet';
  if (['ppt', 'pptx'].includes(ext))
    return 'presentation';
  if (['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'].includes(ext))
    return 'image';
  return 'other';
}
```


Thread reconstruction is important because privilege analysis must consider entire email chains, not individual messages in isolation. A single message in an email thread might appear non-privileged, but when viewed in the context of the full thread, it may be a response to a request for legal advice, which makes the entire thread potentially privileged. The `threadGroups` map enables downstream privilege screening to evaluate threads as units rather than individual documents.


## Round 2: Privilege Screening with HITL Handoff


Privilege screening is fundamentally different from relevance review. Relevance review tolerates false positives: an irrelevant document mistakenly included in the review set costs money but causes no harm. Privilege review tolerates nothing. Producing a privileged communication to opposing counsel waives the privilege, potentially for the entire subject matter. This is malpractice territory.


The consequence is an asymmetric error budget. False negatives (missing a privileged document) are catastrophic and must be virtually eliminated. False positives (flagging a non-privileged document for review) are expensive but survivable. This asymmetry demands a conservative architecture with graduated escalation.


### The Three-Tier Privilege Architecture


The graduated handoff operates through three tiers, each with different automation authority and different escalation behavior.


**Tier 1: Automated Clear.** Documents with no attorney on any address field (from, to, cc, bcc), no legal advice content markers (words like "privilege," "legal advice," "attorney-client," "work product"), and no confidentiality markers (disclaimers, "privileged and confidential" headers) are automatically classified as non-privileged. These documents pass through to issue coding without human review. Tier 1 typically handles sixty to seventy percent of the collection.


**Tier 2: Automated Flag.** Documents where the from, to, or cc field includes a known attorney, or where the document was created by an attorney, are automatically flagged as potentially privileged and added to the privilege log. These documents do not require human review because the classification is conservative: any document involving an attorney is withheld. Tier 2 typically handles ten to fifteen percent of the collection.


**Tier 3: HITL Escalation.** Documents that are ambiguous (an attorney is bcc'd but the communication appears to be purely business; an email chain includes an attorney in some messages but not others; the content discusses legal topics but no attorney is involved; the document was forwarded to a non-attorney third party, potentially waiving privilege) are escalated to an attorney decision gate. The pipeline pauses processing on these documents, queues them for human review, and continues processing all non-escalated documents. Once the attorney renders a decision, the pipeline records it in persistent memory and resumes processing.


```typescript
// litigation-support-round-02.ts
// Round 2: Three-tier privilege screening with HITL handoff

interface PrivilegeScreeningResult {
  autoClear: { documentId: string; reasoning: string }[];
  autoFlag: { documentId: string; reasoning: string; logEntry: string }[];
  hitlEscalation: { documentId: string; reasoning: string; ambiguityFactors: string[] }[];
  metrics: { inputTokens: number; outputTokens: number; latencyMs: number };
}

// Tier 1 check: fast metadata-only screening
function performTier1Screen(
  document: LitDocument,
  config: PrivilegeConfig
): 'clear' | 'needs_content_analysis' {

  const allRecipients = [
    document.metadata.from,
    ...document.metadata.to,
    ...document.metadata.cc,
    ...document.metadata.bcc
  ].filter(Boolean).map(r => r!.toLowerCase());

  const attorneysLower = config.attorneyList.map(a => a.toLowerCase());

  // If any attorney appears in any address field, needs deeper analysis
  const hasAttorney = allRecipients.some(r =>
    attorneysLower.some(a => r.includes(a))
  );

  if (hasAttorney) return 'needs_content_analysis';

  // Check for privilege markers in subject line
  const subject = (document.metadata.subject ?? '').toLowerCase();
  const privilegeMarkers = [
    'privilege', 'confidential', 'attorney-client',
    'work product', 'legal advice', 'attorney work'
  ];

  if (privilegeMarkers.some(m => subject.includes(m))) {
    return 'needs_content_analysis';
  }

  return 'clear';
}

// Tier 2 and Tier 3: AI-powered content analysis
async function performContentAnalysis(
  document: LitDocument,
  config: PrivilegeConfig,
  threadContext: LitDocument[]
): Promise<PrivilegeResult> {

  // Run attorney-client and work product analyses in parallel
  const [acResult, wpResult] = await Promise.allSettled([
    screenAttorneyClientPrivilege(document, config, threadContext),
    screenWorkProduct(document, config)
  ]);

  // Extract results, defaulting to PRIVILEGED if either analysis failed
  const acAnalysis = acResult.status === 'fulfilled'
    ? acResult.value
    : {
        isPrivileged: true,
        confidence: 0,
        reasoning: 'Analysis failed — defaulting to privileged',
        attorneyIdentified: null,
        purposeIsLegalAdvice: true,
        confidentialityMaintained: true
      };

  const wpAnalysis = wpResult.status === 'fulfilled'
    ? wpResult.value
    : {
        isWorkProduct: true,
        confidence: 0,
        reasoning: 'Analysis failed — defaulting to protected',
        workProductType: 'fact' as const,
        anticipationOfLitigation: true
      };

  // Determine tier based on confidence and ambiguity
  const acPrivileged = acAnalysis.isPrivileged;
  const wpProtected = wpAnalysis.isWorkProduct;
  const maxConfidence = Math.max(
    acAnalysis.confidence,
    wpAnalysis.confidence
  );

  // TIER 2: High confidence that document is privileged
  if ((acPrivileged || wpProtected) && maxConfidence >= 0.85) {
    const basis = acPrivileged && wpProtected ? 'both' as const
      : acPrivileged ? 'attorney-client' as const
      : 'work-product' as const;

    return {
      tier: 'auto-flag',
      isPrivileged: true,
      confidence: maxConfidence,
      basis,
      reasoning: `AC: ${acAnalysis.reasoning} | WP: ${wpAnalysis.reasoning}`,
      privilegeLogEntry: buildPrivilegeLogEntry(
        document, basis, acAnalysis, wpAnalysis
      ),
      humanReviewRequired: false
    };
  }

  // TIER 1: High confidence that document is NOT privileged
  if (!acPrivileged && !wpProtected && maxConfidence >= 0.85) {
    return {
      tier: 'auto-clear',
      isPrivileged: false,
      confidence: maxConfidence,
      basis: 'none',
      reasoning: `AC: ${acAnalysis.reasoning} | WP: ${wpAnalysis.reasoning}`,
      privilegeLogEntry: null,
      humanReviewRequired: false
    };
  }

  // TIER 3: Ambiguous — escalate to human review
  const ambiguityFactors: string[] = [];
  if (maxConfidence < 0.85)
    ambiguityFactors.push(`Low confidence (${(maxConfidence * 100).toFixed(0)}%)`);
  if (acAnalysis.attorneyIdentified && !acAnalysis.purposeIsLegalAdvice)
    ambiguityFactors.push('Attorney present but purpose unclear');
  if (!acAnalysis.confidentialityMaintained)
    ambiguityFactors.push('Possible waiver through third-party disclosure');
  if (document.metadata.cc.length > 5)
    ambiguityFactors.push('Wide distribution — privilege scope questionable');

  return {
    tier: 'hitl-escalation',
    isPrivileged: null, // Awaiting human decision
    confidence: maxConfidence,
    basis: 'pending',
    reasoning: `ESCALATION: ${ambiguityFactors.join('; ')}. AC: ${acAnalysis.reasoning} | WP: ${wpAnalysis.reasoning}`,
    privilegeLogEntry: null,
    humanReviewRequired: true
  };
}

// Attorney-client privilege analysis
async function screenAttorneyClientPrivilege(
  document: LitDocument,
  config: PrivilegeConfig,
  threadContext: LitDocument[]
): Promise<{
  isPrivileged: boolean;
  confidence: number;
  reasoning: string;
  attorneyIdentified: string | null;
  purposeIsLegalAdvice: boolean;
  confidentialityMaintained: boolean;
}> {

  const threadContextStr = threadContext.length > 1
    ? `\n\nFULL EMAIL THREAD (${threadContext.length} messages):\n` +
      threadContext.map(d =>
        `[${d.metadata.dateSent ?? d.metadata.dateCreated}] From: ${d.metadata.from} → To: ${d.metadata.to.join(', ')}\n${d.text.slice(0, 500)}...`
      ).join('\n---\n')
    : '';

  const prompt = `You are an attorney conducting privilege review. Apply the
four-part test to this document:

1. Is there a communication between an attorney and a client?
   Known attorneys: ${config.attorneyList.join(', ')}
   Client entities: ${config.clientEntities.join(', ')}

2. Was the communication made for the PURPOSE of seeking or providing
   legal advice? (Not merely business discussion with an attorney present.)

3. Was the communication made in CONFIDENCE? (Not shared with third
   parties outside the privilege.)

4. Has the privilege been WAIVED through disclosure to outsiders?

## Document
From: ${document.metadata.from ?? 'Unknown'}
To: ${document.metadata.to.join(', ')}
CC: ${document.metadata.cc.join(', ')}
BCC: ${document.metadata.bcc.join(', ')}
Date: ${document.metadata.dateSent ?? document.metadata.dateCreated}
Subject: ${document.metadata.subject ?? 'None'}

${document.text}
${threadContextStr}

CRITICAL: When in doubt, flag as POTENTIALLY PRIVILEGED. Producing a
privileged document to opposing counsel is malpractice. Over-flagging
is merely expensive.

Respond in JSON:
{
  "isPrivileged": true/false,
  "confidence": 0.0-1.0,
  "attorneyIdentified": "name or null",
  "purposeIsLegalAdvice": true/false,
  "confidentialityMaintained": true/false,
  "reasoning": "explanation"
}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4_096,
    messages: [{ role: 'user', content: prompt }]
  });
  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  return JSON.parse(text);
}

// Work product doctrine analysis
async function screenWorkProduct(
  document: LitDocument,
  config: PrivilegeConfig
): Promise<{
  isWorkProduct: boolean;
  confidence: number;
  reasoning: string;
  workProductType: 'opinion' | 'fact' | 'none';
  anticipationOfLitigation: boolean;
}> {

  const prompt = `You are an attorney reviewing documents for work product
protection under FRCP Rule 26(b)(3).

1. Was this document prepared in ANTICIPATION OF LITIGATION?
   (Apply the "because of" test: created because of anticipated
   litigation, not in the ordinary course of business.)
   Litigation timeline: ${config.litigationTimeline}

2. Is it OPINION work product (reflecting attorney mental impressions,
   conclusions, opinions, or legal theories)? Or FACT work product
   (factual investigation results)?

3. Was it prepared by or for a party, or by the party's representative?

## Document
${document.text}

Respond in JSON:
{
  "isWorkProduct": true/false,
  "confidence": 0.0-1.0,
  "workProductType": "opinion" | "fact" | "none",
  "anticipationOfLitigation": true/false,
  "reasoning": "explanation"
}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4_096,
    messages: [{ role: 'user', content: prompt }]
  });
  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '';
  return JSON.parse(text);
}

// Build the privilege log entry for withheld documents
function buildPrivilegeLogEntry(
  document: LitDocument,
  basis: 'attorney-client' | 'work-product' | 'both',
  acAnalysis: any,
  wpAnalysis: any
): string {
  const parts: string[] = [
    `Document ID: ${document.id}`,
    `Date: ${document.metadata.dateSent ?? document.metadata.dateCreated}`,
    `From: ${document.metadata.from ?? 'Unknown'}`,
    `To: ${document.metadata.to.join('; ')}`,
    `CC: ${document.metadata.cc.join('; ')}`,
    `Subject: ${document.metadata.subject ?? 'None'}`,
    `Basis: ${basis === 'both' ? 'Attorney-Client Privilege and Work Product Doctrine'
      : basis === 'attorney-client' ? 'Attorney-Client Privilege'
      : 'Work Product Doctrine'}`,
  ];

  if (basis === 'attorney-client' || basis === 'both') {
    parts.push(`Attorney: ${acAnalysis.attorneyIdentified ?? 'Identified in content'}`);
  }
  if (basis === 'work-product' || basis === 'both') {
    parts.push(`Work Product Type: ${wpAnalysis.workProductType === 'opinion' ? 'Opinion' : 'Fact'}`);
  }

  return parts.join(' | ');
}
```


> **Fail-Safe Default: Always Flag on Failure**
>
> Notice the critical design decision in the content analysis: if either privilege
> analysis fails (API timeout, parsing error, rate limit), the document defaults to
> **privileged**. This is the only acceptable failure mode. A system that defaults to
> "not privileged" on error will inevitably produce privileged documents when the API has
> a bad day. Defaulting to privileged means human reviewers see more documents, but no
> privileged material ever slips through. The cost of over-flagging is money. The cost
> of under-flagging is malpractice.


### The HITL Decision Gate


The HITL escalation pattern requires an architectural element that most AI pipelines lack: the ability to pause, wait for a human decision, and resume. The pipeline does not block while waiting. It processes all non-escalated documents through issue coding, generates partial reports, and maintains a queue of escalated documents. When the attorney reviews and decides each escalated item, the decision is recorded in persistent memory, the privilege log is updated, and the document enters the appropriate downstream flow.


```typescript
// hitl-privilege-gate.ts
// Human-in-the-loop privilege decision gate

interface HITLQueue {
  caseId: string;
  pendingReviews: PendingPrivilegeReview[];
  completedReviews: CompletedPrivilegeReview[];
}

interface PendingPrivilegeReview {
  documentId: string;
  document: LitDocument;
  aiAnalysis: PrivilegeResult;
  ambiguityFactors: string[];
  threadContext: LitDocument[];
  queuedAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface CompletedPrivilegeReview {
  documentId: string;
  reviewedBy: string;
  reviewedAt: string;
  isPrivileged: boolean;
  basis: string;
  notes: string;
  privilegeLogEntry: string | null;
}

// Queue a document for attorney review
async function escalateToHITL(
  db: Db,
  caseId: string,
  document: LitDocument,
  aiAnalysis: PrivilegeResult,
  ambiguityFactors: string[],
  threadContext: LitDocument[]
): Promise<void> {

  // Determine priority based on ambiguity factors
  const priority = ambiguityFactors.length >= 3 ? 'high'
    : ambiguityFactors.length >= 2 ? 'medium'
    : 'low';

  const review: PendingPrivilegeReview = {
    documentId: document.id,
    document,
    aiAnalysis,
    ambiguityFactors,
    threadContext,
    queuedAt: new Date().toISOString(),
    priority
  };

  await db.collection('hitlQueues').updateOne(
    { caseId },
    {
      $push: { pendingReviews: review },
      $setOnInsert: {
        caseId,
        completedReviews: []
      }
    },
    { upsert: true }
  );
}

// Record an attorney's privilege decision
async function recordAttorneyDecision(
  db: Db,
  caseId: string,
  documentId: string,
  decision: {
    reviewedBy: string;
    isPrivileged: boolean;
    basis: string;
    notes: string;
  }
): Promise<void> {

  const queue = await db.collection<HITLQueue>('hitlQueues').findOne({
    caseId
  });

  if (!queue) throw new Error(`No HITL queue found for case ${caseId}`);

  const pending = queue.pendingReviews.find(
    r => r.documentId === documentId
  );
  if (!pending) throw new Error(`Document ${documentId} not in pending queue`);

  const completed: CompletedPrivilegeReview = {
    documentId,
    reviewedBy: decision.reviewedBy,
    reviewedAt: new Date().toISOString(),
    isPrivileged: decision.isPrivileged,
    basis: decision.basis,
    notes: decision.notes,
    privilegeLogEntry: decision.isPrivileged
      ? `Document ID: ${documentId} | Date: ${pending.document.metadata.dateSent ?? pending.document.metadata.dateCreated} | From: ${pending.document.metadata.from} | Basis: ${decision.basis} | Reviewed by: ${decision.reviewedBy} | Notes: ${decision.notes}`
      : null
  };

  await db.collection('hitlQueues').updateOne(
    { caseId },
    {
      $pull: { pendingReviews: { documentId } },
      $push: { completedReviews: completed }
    }
  );

  // Also record in persistent memory for consistency learning
  await db.collection('privilegeDecisions').insertOne({
    caseId,
    documentId,
    ...decision,
    decidedAt: new Date().toISOString(),
    aiAnalysis: pending.aiAnalysis,
    ambiguityFactors: pending.ambiguityFactors
  });
}

// Get pending reviews for attorney dashboard
async function getPendingReviews(
  db: Db,
  caseId: string
): Promise<PendingPrivilegeReview[]> {
  const queue = await db.collection<HITLQueue>('hitlQueues').findOne({
    caseId
  });

  if (!queue) return [];

  // Sort by priority (high first), then by queue time (oldest first)
  return queue.pendingReviews.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.queuedAt.localeCompare(b.queuedAt);
  });
}
```


The HITL gate is not a bottleneck; it is a safety valve. The pipeline continues processing all Tier 1 and Tier 2 documents through issue coding while Tier 3 documents await human review. In a typical review, sixty to seventy percent of documents clear through Tier 1 automatically, ten to fifteen percent are flagged through Tier 2, and only fifteen to twenty-five percent require human review through Tier 3. The HITL gate handles the hard cases while the pipeline handles the volume.


## Round 3: RAG-Enhanced Issue Coding


Issue coding is the most computationally demanding stage of the pipeline. Every relevant, non-privileged document must be evaluated against every issue in the case taxonomy. An antitrust case with twelve issues and two hundred thousand relevant documents requires 2.4 million classification decisions. This is where the parallelization pattern from Chapter 4 becomes essential, and where RAG transforms coding accuracy.


### Building the Case Law Vector Database


Before issue coding begins, the pipeline builds a vector database of relevant case opinions. Each opinion is chunked, embedded, and stored with metadata including the case citation, the court, the date, and the legal concepts it addresses. When an issue coding agent evaluates a document, it first queries the vector database for cases relevant to that issue, then injects the retrieved authorities into its prompt. This grounds every coding decision in current legal authority rather than relying solely on the model's parametric knowledge.


```typescript
// rag-case-law.ts
// RAG integration for case law retrieval

interface CaseLawChunk {
  id: string;
  citation: string;
  court: string;
  date: string;
  concepts: string[];
  text: string;
  embedding: number[];
}

interface RAGResult {
  chunks: CaseLawChunk[];
  query: string;
  scores: number[];
}

class CaseLawVectorDB {
  private chunks: CaseLawChunk[] = [];

  // Ingest a case opinion: chunk, embed, store
  async ingestOpinion(opinion: {
    citation: string;
    court: string;
    date: string;
    fullText: string;
    concepts: string[];
  }): Promise<void> {

    // Chunk the opinion into ~500-token segments with overlap
    const textChunks = chunkText(opinion.fullText, 500, 50);

    for (let i = 0; i < textChunks.length; i++) {
      const embedding = await generateEmbedding(textChunks[i]);

      this.chunks.push({
        id: `${opinion.citation}-chunk-${i}`,
        citation: opinion.citation,
        court: opinion.court,
        date: opinion.date,
        concepts: opinion.concepts,
        text: textChunks[i],
        embedding
      });
    }
  }

  // Retrieve chunks relevant to a query
  async retrieve(
    query: string,
    topK: number = 5,
    conceptFilter?: string[]
  ): Promise<RAGResult> {

    const queryEmbedding = await generateEmbedding(query);

    // Score all chunks by cosine similarity
    let candidates = this.chunks;
    if (conceptFilter && conceptFilter.length > 0) {
      candidates = candidates.filter(chunk =>
        chunk.concepts.some(c => conceptFilter.includes(c))
      );
    }

    const scored = candidates.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Sort by score descending and take top K
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, topK);

    return {
      chunks: topResults.map(r => r.chunk),
      query,
      scores: topResults.map(r => r.score)
    };
  }
}

// Generate embedding using the Anthropic embeddings or a dedicated model
async function generateEmbedding(text: string): Promise<number[]> {
  // In production, use a dedicated embedding model (e.g., voyage-3)
  // This is a placeholder for the embedding call
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'voyage-law-2',
      input: [text],
      input_type: 'document'
    })
  });
  const data = await response.json();
  return data.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function chunkText(
  text: string,
  targetTokens: number,
  overlapTokens: number
): string[] {
  // Approximate token count as words / 0.75
  const words = text.split(/\s+/);
  const targetWords = Math.floor(targetTokens * 0.75);
  const overlapWords = Math.floor(overlapTokens * 0.75);

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + targetWords, words.length);
    chunks.push(words.slice(start, end).join(' '));
    start = end - overlapWords;
    if (start >= words.length - overlapWords) break;
  }

  return chunks;
}
```


> **Why RAG for Issue Coding**
>
> Without RAG, an issue coding agent relies entirely on its parametric knowledge
> of the law, which may be outdated, incomplete, or subtly incorrect for the specific
> jurisdiction and fact pattern. With RAG, the agent receives actual case opinions that
> address the legal issue it is evaluating. The agent can cite specific authority
> for its coding decision, making the classification more accurate and more defensible.
> When opposing counsel challenges why a document was coded to a particular issue, the
> coding decision includes a citation to the authority that supports the classification.


### Parallel Issue Coding with RAG Injection


Each issue in the taxonomy receives its own specialist coding agent. The agent retrieves relevant case law from the vector database, injects it into the coding prompt, and evaluates the document through the lens of both the issue definition and the retrieved authority.


```typescript
// litigation-support-round-03.ts
// Round 3: RAG-enhanced parallel issue coding
import pLimit from 'p-limit';

function createRAGEnhancedIssueCoder(
  issue: IssueTaxonomy,
  vectorDB: CaseLawVectorDB
) {
  return {
    issueId: issue.id,
    issueName: issue.name,

    async classify(
      document: LitDocument,
      caseDescription: string
    ): Promise<IssueCodeResult> {

      // Step 1: Retrieve relevant case law for this issue
      const ragResult = await vectorDB.retrieve(
        `${issue.name}: ${issue.description}`,
        3, // Top 3 most relevant chunks
        issue.relevantCaseLaw.map(c =>
          c.split(',')[0].trim() // Use case names as concept filters
        )
      );

      const caseLawContext = ragResult.chunks.length > 0
        ? `\n\nRELEVANT CASE LAW:\n${ragResult.chunks.map(chunk =>
            `[${chunk.citation}] (${chunk.court}, ${chunk.date}):\n"${chunk.text}"`
          ).join('\n\n')}`
        : '';

      // Step 2: Build the coding prompt with RAG context
      const prompt = `You are a specialist document reviewer for the legal
issue: "${issue.name}".

## Case Context
${caseDescription}

## Issue Definition
${issue.description}

## Key Indicators
${issue.keyIndicators.map(k => '- ' + k).join('\n')}

## Relevant Statutes
${issue.relevantStatutes.map(s => '- ' + s).join('\n')}
${caseLawContext}

## Document
From: ${document.metadata.from ?? 'Unknown'}
To: ${document.metadata.to.join(', ')}
Date: ${document.metadata.dateCreated}
Subject: ${document.metadata.subject ?? 'None'}

${document.text}

## Task
Determine whether this document is relevant to "${issue.name}".
Identify specific passages that support your determination.
If applicable, cite specific legal authority from the provided case law
that supports the classification.

Respond in JSON:
{
  "isApplicable": true/false,
  "confidence": 0.0-1.0,
  "relevantPassages": ["passage 1", "passage 2"],
  "citedAuthority": ["Case Name, Court (Year) — relevant holding"],
  "reasoning": "explanation grounded in legal authority"
}`;

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 4_096,
        messages: [{ role: 'user', content: prompt }]
      });
      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';
      const parsed = JSON.parse(text);

      return {
        issueId: issue.id,
        issueName: issue.name,
        isApplicable: parsed.isApplicable,
        confidence: parsed.confidence,
        relevantPassages: parsed.relevantPassages,
        citedAuthority: parsed.citedAuthority,
        reasoning: parsed.reasoning
      };
    }
  };
}

// Code a single document against all issues in parallel
async function codeDocumentWithRAG(
  document: LitDocument,
  issues: IssueTaxonomy[],
  vectorDB: CaseLawVectorDB,
  caseDescription: string
): Promise<IssueCodeResult[]> {

  const coders = issues.map(issue =>
    createRAGEnhancedIssueCoder(issue, vectorDB)
  );

  const limit = pLimit(10);

  const results = await Promise.allSettled(
    coders.map(coder =>
      limit(() => coder.classify(document, caseDescription))
    )
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<IssueCodeResult> =>
        r.status === 'fulfilled'
    )
    .map(r => r.value);
}

// Code an entire batch with progress tracking
async function codeBatchWithRAG(
  documents: LitDocument[],
  issues: IssueTaxonomy[],
  vectorDB: CaseLawVectorDB,
  caseDescription: string,
  onProgress: (completed: number, total: number) => void
): Promise<Map<string, IssueCodeResult[]>> {
  const results = new Map<string, IssueCodeResult[]>();
  let completed = 0;

  const batchSize = 50;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async (doc) => {
        const codes = await codeDocumentWithRAG(
          doc, issues, vectorDB, caseDescription
        );
        completed++;
        onProgress(completed, documents.length);
        return { documentId: doc.id, codes };
      })
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.set(result.value.documentId, result.value.codes);
      }
    }
  }

  return results;
}
```


The two-level parallelization is the same pattern from Chapter 4: fifty documents concurrently, each with N issue coders, gated by a concurrency limiter set to the API's rate limit. The RAG retrieval adds minimal latency because the vector search is local (milliseconds), while the API call is the bottleneck (seconds). The net effect is that RAG-enhanced coding takes approximately the same wall-clock time as non-RAG coding but produces grounded, citable classifications.


> **Confidence Thresholds Drive Routing**
>
> The confidence score is not decoration; it drives the workflow. Documents with
> confidence above 0.9 are auto-classified. Documents between 0.5 and 0.9 are batched
> for expedited human review with the AI classification as a suggestion. Documents
> below 0.5 are flagged for de novo human review. This three-tier routing reduces
> human review volume by sixty to seventy percent while maintaining quality on the
> hardest classification decisions.


## Round 4: Deposition Contradiction Analysis


When deposition transcripts are available, the pipeline cross-references sworn testimony against the documentary evidence to identify contradictions and impeachment opportunities. This round draws directly on Taylor Legal Engineering's open-source deposition contradiction analysis pipeline, a production system that implements a five-round architecture: parallel subject extraction, subject synthesis, cross-subject detection, materiality ranking, and impeachment brief generation.


### The Open-Source Pipeline Architecture


TLE's deposition contradiction analysis pipeline operates on a grid structure. Given N deposition transcripts and M legal subjects, Round 1 deploys N x M parallel extraction agents, each reading one deponent's testimony for one subject. Round 2 deploys M parallel synthesis agents, each comparing all deponents' testimony on a single subject to identify contradictions. Round 3 performs cross-subject detection, finding contradictions that only become visible when multiple subjects are viewed together. Round 4 ranks every contradiction by materiality tier. Round 5 generates visual analytics and a trial-ready impeachment brief.


```typescript
// litigation-support-round-04.ts
// Round 4: Deposition analysis with document cross-reference

// Types from TLE's open-source deposition contradiction analysis pipeline
interface DepositionContradiction {
  id: string;
  type: 'direct' | 'internal' | 'document-testimony' | 'temporal'
    | 'quantitative' | 'inferential';
  severity: 'unambiguous' | 'arguable' | 'subtle';
  intraParty: boolean;
  deponentsInvolved: string[];
  subjectId: string;
  description: string;
  evidenceSupport: string[];
  impeachmentPotential: string;
  tier: 1 | 2 | 3 | 4;
}

interface WitnessProfile {
  deponentName: string;
  role: string;
  alignment: 'adverse' | 'friendly' | 'neutral' | 'third-party';
  credibilityScore: number;
  contradictionCount: number;
  hedgingCount: number;
  keyContradictions: DepositionContradiction[];
}

interface DepositionAnalysisResult {
  contradictions: DepositionContradiction[];
  witnessProfiles: WitnessProfile[];
  documentTestimonyConflicts: DocumentTestimonyConflict[];
  impeachmentBrief: string;
  metrics: { inputTokens: number; outputTokens: number; latencyMs: number };
}

interface DocumentTestimonyConflict {
  documentId: string;
  deponentName: string;
  testimony: string;
  testimonyCitation: string;
  documentContent: string;
  conflict: string;
  severity: 'devastating' | 'significant' | 'minor';
}

// Cross-reference deposition testimony against documentary evidence
async function analyzeDepositions(
  depositions: DepositionTranscript[],
  documents: LitDocument[],
  issueCoding: Map<string, IssueCodeResult[]>,
  caseConfig: CaseConfig
): Promise<DepositionAnalysisResult> {
  const start = Date.now();

  // Step 1: For each deponent, find documents they authored or received
  const deponentDocs = new Map<string, LitDocument[]>();
  for (const dep of depositions) {
    const name = dep.metadata.deponentName.toLowerCase();
    const relevantDocs = documents.filter(doc => {
      const from = (doc.metadata.from ?? '').toLowerCase();
      const to = doc.metadata.to.map(t => t.toLowerCase());
      const cc = doc.metadata.cc.map(c => c.toLowerCase());
      return from.includes(name)
        || to.some(t => t.includes(name))
        || cc.some(c => c.includes(name));
    });
    deponentDocs.set(dep.metadata.deponentName, relevantDocs);
  }

  // Step 2: Run parallel document-testimony conflict detection
  const conflictResults = await Promise.allSettled(
    depositions.map(async (deposition) => {
      const docs = deponentDocs.get(deposition.metadata.deponentName) ?? [];
      if (docs.length === 0) return [];

      // Select the most relevant documents (up to 20)
      const topDocs = docs.slice(0, 20);

      const prompt = `You are a litigation analyst cross-referencing deposition
testimony against documentary evidence.

DEPONENT: ${deposition.metadata.deponentName} (${deposition.metadata.role})
ALIGNMENT: ${deposition.metadata.alignment}

DEPOSITION TESTIMONY (excerpts):
${deposition.content.slice(0, 50000)}

DOCUMENTS authored by or sent to this deponent:
${topDocs.map((doc, i) => `
[DOC-${i + 1}] Date: ${doc.metadata.dateSent ?? doc.metadata.dateCreated}
From: ${doc.metadata.from} → To: ${doc.metadata.to.join(', ')}
Subject: ${doc.metadata.subject}
Content: ${doc.text.slice(0, 2000)}
`).join('\n---\n')}

Identify every instance where the deponent's sworn testimony
CONTRADICTS the documentary evidence. For each conflict:
1. Quote the specific testimony with citation
2. Quote the contradicting document content
3. Explain how they conflict
4. Assess severity: devastating (clear lie), significant (material
   inconsistency), or minor (trivial discrepancy)

Respond in JSON:
{
  "conflicts": [
    {
      "testimony": "what the witness said under oath",
      "testimonyCitation": "page:line or Q number",
      "documentId": "DOC-N",
      "documentContent": "what the document shows",
      "conflict": "how they conflict",
      "severity": "devastating|significant|minor"
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
      const parsed = JSON.parse(text);

      return parsed.conflicts.map((c: any) => ({
        documentId: topDocs[parseInt(c.documentId.replace('DOC-', '')) - 1]?.id ?? '',
        deponentName: deposition.metadata.deponentName,
        testimony: c.testimony,
        testimonyCitation: c.testimonyCitation,
        documentContent: c.documentContent,
        conflict: c.conflict,
        severity: c.severity
      }));
    })
  );

  const documentTestimonyConflicts: DocumentTestimonyConflict[] = [];
  for (const result of conflictResults) {
    if (result.status === 'fulfilled') {
      documentTestimonyConflicts.push(...result.value);
    }
  }

  // Step 3: Generate impeachment brief for top conflicts
  const impeachmentBrief = await generateImpeachmentBrief(
    depositions,
    documentTestimonyConflicts,
    caseConfig
  );

  return {
    contradictions: [],
    witnessProfiles: depositions.map(dep => ({
      deponentName: dep.metadata.deponentName,
      role: dep.metadata.role,
      alignment: dep.metadata.alignment,
      credibilityScore: 0,
      contradictionCount: documentTestimonyConflicts.filter(
        c => c.deponentName === dep.metadata.deponentName
      ).length,
      hedgingCount: 0,
      keyContradictions: []
    })),
    documentTestimonyConflicts,
    impeachmentBrief,
    metrics: {
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - start
    }
  };
}

async function generateImpeachmentBrief(
  depositions: DepositionTranscript[],
  conflicts: DocumentTestimonyConflict[],
  caseConfig: CaseConfig
): Promise<string> {

  if (conflicts.length === 0) {
    return 'No document-testimony conflicts identified.';
  }

  const devastating = conflicts.filter(c => c.severity === 'devastating');
  const significant = conflicts.filter(c => c.severity === 'significant');

  const prompt = `You are a SENIOR TRIAL ATTORNEY writing an IMPEACHMENT
PREPARATION BRIEF. This must be TRIAL-READY: a litigator should be able to
walk into court with this document and conduct cross-examination.

CASE: ${caseConfig.caseName}
CASE THEORY: ${caseConfig.caseDescription}

DEVASTATING CONFLICTS (${devastating.length}):
${devastating.map(c => `
WITNESS: ${c.deponentName}
TESTIMONY: "${c.testimony}" (${c.testimonyCitation})
DOCUMENT: "${c.documentContent}"
CONFLICT: ${c.conflict}
`).join('\n---\n')}

SIGNIFICANT CONFLICTS (${significant.length}):
${significant.map(c => `
WITNESS: ${c.deponentName}
TESTIMONY: "${c.testimony}" (${c.testimonyCitation})
DOCUMENT: "${c.documentContent}"
CONFLICT: ${c.conflict}
`).join('\n---\n')}

For each impeachment point:
1. State the witness's claim with deposition citation
2. State the contradicting document evidence
3. Write 3-5 ACTUAL CROSS-EXAMINATION QUESTIONS that escalate from
   setup to impeachment
4. Identify the exhibit to display and when to display it
5. Anticipate the witness's escape route and provide the follow-up

Structure:
1. EXECUTIVE SUMMARY
2. WITNESS-BY-WITNESS IMPEACHMENT GUIDE (ordered by vulnerability)
3. CROSS-EXAMINATION SEQUENCE RECOMMENDATION
4. EXHIBIT PAIRING GUIDE`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 64_000,
    messages: [{ role: 'user', content: prompt }]
  });
  const response = await stream.finalMessage();
  return response.content.find(c => c.type === 'text')?.text ?? '';
}
```


The deposition analysis round produces the highest-leverage output of the entire pipeline. A devastating document-testimony conflict (where a witness's sworn statement is directly contradicted by a document they authored or received) can independently determine the outcome of a case. The pipeline surfaces these conflicts systematically, matching each deponent's testimony against every document they touched, and produces a trial-ready impeachment brief that a litigator can use directly in cross-examination.


> **The TLE Open-Source Pipeline**
>
> Taylor Legal Engineering's open-source deposition contradiction analysis pipeline
> is publicly available and implements the full five-round architecture described in
> this section. The pipeline uses a 3-layer prompt system (universal frameworks,
> practice group lenses, and subject-specific extraction targets) that can be configured
> for any litigation practice area, from complex commercial disputes to securities fraud
> to antitrust. The types, prompt library, backautocrat, and server code are all
> open source. This chapter's implementation draws on that architecture while extending
> it with the documentary evidence cross-reference that connects deposition analysis to
> the broader eDiscovery pipeline.


## Persistent Memory for Long-Running Litigation


Litigation spans months or years. The pipeline must accumulate context across sessions, tracking how the case theory evolves, what each witness has said across multiple depositions and declarations, which documents have been reviewed and coded, which issues have been resolved, and which contradictions have been identified. Without persistent memory, each pipeline run is independent. With it, the pipeline becomes a case management system that remembers everything.


```typescript
// litigation-persistent-memory.ts
// MongoDB persistence layer for litigation support

interface CaseMemory {
  caseId: string;
  caseName: string;

  // Case theory: how the legal theory has evolved
  caseTheory: {
    current: string;
    history: {
      theory: string;
      updatedAt: string;
      reason: string;
    }[];
  };

  // Witness memory: what each witness has said
  witnesses: {
    name: string;
    role: string;
    alignment: 'adverse' | 'friendly' | 'neutral' | 'third-party';
    statements: {
      source: 'deposition' | 'interrogatory' | 'declaration' | 'affidavit';
      date: string;
      keyStatements: string[];
      contradictions: string[];
    }[];
    credibilityScore: number;
    credibilityFactors: string[];
  }[];

  // Document coding memory: what has been reviewed and coded
  documentMemory: {
    totalDocuments: number;
    reviewed: number;
    produced: number;
    withheld: number;
    lastReviewSession: string;
    issueDistribution: Record<string, number>;
  };

  // Issue memory: the evolving issue list
  issues: {
    issueId: string;
    issueName: string;
    status: 'active' | 'resolved' | 'withdrawn';
    documentCount: number;
    keyDocumentIds: string[];
    resolvedAt?: string;
    resolution?: string;
  }[];

  // Contradiction memory: all identified inconsistencies
  contradictions: {
    id: string;
    type: string;
    witnesses: string[];
    description: string;
    tier: number;
    discoveredAt: string;
    status: 'active' | 'explained' | 'impeached';
  }[];

  createdAt: string;
  updatedAt: string;
}

async function initializeCaseMemory(
  db: Db,
  caseConfig: CaseConfig
): Promise<CaseMemory> {
  const existing = await db.collection<CaseMemory>('caseMemory').findOne({
    caseId: caseConfig.caseId
  });

  if (existing) return existing;

  const memory: CaseMemory = {
    caseId: caseConfig.caseId,
    caseName: caseConfig.caseName,
    caseTheory: {
      current: caseConfig.caseDescription,
      history: [{
        theory: caseConfig.caseDescription,
        updatedAt: new Date().toISOString(),
        reason: 'Initial case setup'
      }]
    },
    witnesses: caseConfig.depositions.map(dep => ({
      name: dep.metadata.deponentName,
      role: dep.metadata.role,
      alignment: dep.metadata.alignment,
      statements: [],
      credibilityScore: 50,
      credibilityFactors: []
    })),
    documentMemory: {
      totalDocuments: 0,
      reviewed: 0,
      produced: 0,
      withheld: 0,
      lastReviewSession: new Date().toISOString(),
      issueDistribution: {}
    },
    issues: caseConfig.issues.map(issue => ({
      issueId: issue.id,
      issueName: issue.name,
      status: 'active' as const,
      documentCount: 0,
      keyDocumentIds: []
    })),
    contradictions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.collection('caseMemory').insertOne(memory);
  return memory;
}

// Update case memory after a review session
async function updateCaseMemory(
  db: Db,
  caseId: string,
  updates: {
    newClassifications?: Map<string, IssueCodeResult[]>;
    newContradictions?: DepositionContradiction[];
    privilegeDecisions?: CompletedPrivilegeReview[];
    witnessUpdates?: {
      name: string;
      newStatements: CaseMemory['witnesses'][0]['statements'][0];
    }[];
    caseTheoryUpdate?: { theory: string; reason: string };
  }
): Promise<void> {
  const now = new Date().toISOString();
  const updateOps: any = { $set: { updatedAt: now } };

  // Update document coding statistics
  if (updates.newClassifications) {
    const issueDistribution: Record<string, number> = {};
    for (const [, codes] of updates.newClassifications) {
      for (const code of codes) {
        if (code.isApplicable) {
          issueDistribution[code.issueId] =
            (issueDistribution[code.issueId] ?? 0) + 1;
        }
      }
    }

    updateOps.$inc = {
      'documentMemory.reviewed': updates.newClassifications.size,
    };
    updateOps.$set['documentMemory.lastReviewSession'] = now;

    // Update issue document counts
    for (const [issueId, count] of Object.entries(issueDistribution)) {
      await db.collection('caseMemory').updateOne(
        { caseId, 'issues.issueId': issueId },
        { $inc: { 'issues.$.documentCount': count } }
      );
    }
  }

  // Add new contradictions
  if (updates.newContradictions && updates.newContradictions.length > 0) {
    const contradictionRecords = updates.newContradictions.map(c => ({
      id: c.id,
      type: c.type,
      witnesses: c.deponentsInvolved,
      description: c.description,
      tier: c.tier,
      discoveredAt: now,
      status: 'active' as const
    }));

    updateOps.$push = {
      ...updateOps.$push,
      contradictions: { $each: contradictionRecords }
    };
  }

  // Update witness statements
  if (updates.witnessUpdates) {
    for (const wu of updates.witnessUpdates) {
      await db.collection('caseMemory').updateOne(
        { caseId, 'witnesses.name': wu.name },
        { $push: { 'witnesses.$.statements': wu.newStatements } }
      );
    }
  }

  // Update case theory
  if (updates.caseTheoryUpdate) {
    updateOps.$set['caseTheory.current'] = updates.caseTheoryUpdate.theory;
    updateOps.$push = {
      ...updateOps.$push,
      'caseTheory.history': {
        theory: updates.caseTheoryUpdate.theory,
        updatedAt: now,
        reason: updates.caseTheoryUpdate.reason
      }
    };
  }

  // Update privilege statistics
  if (updates.privilegeDecisions) {
    const withheld = updates.privilegeDecisions.filter(d => d.isPrivileged).length;
    const produced = updates.privilegeDecisions.filter(d => !d.isPrivileged).length;

    updateOps.$inc = {
      ...updateOps.$inc,
      'documentMemory.withheld': withheld,
      'documentMemory.produced': produced
    };
  }

  await db.collection('caseMemory').updateOne({ caseId }, updateOps);
}
```


The case memory schema reflects the reality of how litigation evolves. The case theory field tracks not just the current theory but every revision, with timestamps and reasons. This history is invaluable when reviewing how the legal strategy shifted as new evidence emerged. The witness memory accumulates every statement from every source (depositions, interrogatories, declarations), allowing the pipeline to detect contradictions not just within a single deposition but across all of a witness's sworn statements over the life of the case. The contradiction memory persists every identified inconsistency with its status, enabling the trial team to track which contradictions have been explained away and which remain live impeachment opportunities.


## Round 5: Synthesis and Reporting


The final round assembles the complete case-level report: key documents, key witnesses, key issues, the privilege log, production set recommendations, and all metrics needed for defensibility.


```typescript
// litigation-support-round-05.ts
// Round 5: Case synthesis and defensibility reporting

interface CaseReport {
  caseId: string;
  caseName: string;
  generatedAt: string;

  // Document review summary
  reviewSummary: {
    totalDocuments: number;
    afterDedup: number;
    relevant: number;
    privileged: number;
    producible: number;
    reductionRate: number;
  };

  // Issue analysis
  issueAnalysis: {
    issueId: string;
    issueName: string;
    documentCount: number;
    keyDocuments: {
      documentId: string;
      relevance: string;
      citedAuthority: string[];
    }[];
    summary: string;
  }[];

  // Privilege log
  privilegeLog: {
    documentId: string;
    date: string;
    from: string;
    to: string;
    subject: string;
    basis: string;
    description: string;
  }[];

  // Deposition analysis
  depositionAnalysis: {
    totalContradictions: number;
    devastatingConflicts: number;
    witnessProfiles: WitnessProfile[];
    impeachmentBrief: string;
  } | null;

  // Defensibility metrics
  defensibility: {
    relevancePrecision: number;
    relevanceRecall: number;
    relevanceF1: number;
    privilegePrecision: number;
    privilegeRecall: number;
    sampleSize: number;
    confidenceLevel: number;
    confidenceInterval: { lower: number; upper: number };
    meetsThreshold: boolean;
  };

  // Production recommendations
  productionSet: {
    totalDocuments: number;
    format: string;
    batesRange: { start: string; end: string };
    volumeEstimate: string;
  };
}

async function generateCaseReport(
  caseConfig: CaseConfig,
  intakeResult: IntakeResult,
  privilegeResults: Map<string, PrivilegeResult>,
  issueCodingResults: Map<string, IssueCodeResult[]>,
  depositionAnalysis: DepositionAnalysisResult | null,
  caseMemory: CaseMemory
): Promise<CaseReport> {

  // Compute review funnel
  const totalDocs = intakeResult.metadata.totalIngested;
  const relevantCount = issueCodingResults.size;
  const privilegedCount = Array.from(privilegeResults.values())
    .filter(p => p.isPrivileged === true).length;
  const producibleCount = relevantCount - privilegedCount;

  // Build issue analysis
  const issueAnalysis = caseConfig.issues.map(issue => {
    const docsForIssue: { documentId: string; relevance: string; citedAuthority: string[] }[] = [];

    for (const [docId, codes] of issueCodingResults) {
      const code = codes.find(c => c.issueId === issue.id);
      if (code?.isApplicable) {
        docsForIssue.push({
          documentId: docId,
          relevance: code.reasoning,
          citedAuthority: code.citedAuthority
        });
      }
    }

    return {
      issueId: issue.id,
      issueName: issue.name,
      documentCount: docsForIssue.length,
      keyDocuments: docsForIssue
        .sort((a, b) => b.citedAuthority.length - a.citedAuthority.length)
        .slice(0, 10),
      summary: `${docsForIssue.length} documents coded to "${issue.name}"`
    };
  });

  // Build privilege log
  const privilegeLog = Array.from(privilegeResults.entries())
    .filter(([, result]) => result.isPrivileged === true)
    .map(([docId, result]) => {
      const doc = intakeResult.documents.find(d => d.id === docId);
      return {
        documentId: docId,
        date: doc?.metadata.dateSent ?? doc?.metadata.dateCreated ?? '',
        from: doc?.metadata.from ?? '',
        to: doc?.metadata.to.join('; ') ?? '',
        subject: doc?.metadata.subject ?? '',
        basis: result.basis,
        description: result.reasoning
      };
    });

  return {
    caseId: caseConfig.caseId,
    caseName: caseConfig.caseName,
    generatedAt: new Date().toISOString(),
    reviewSummary: {
      totalDocuments: totalDocs,
      afterDedup: intakeResult.documents.length,
      relevant: relevantCount,
      privileged: privilegedCount,
      producible: producibleCount,
      reductionRate: 1 - (producibleCount / totalDocs)
    },
    issueAnalysis,
    privilegeLog,
    depositionAnalysis: depositionAnalysis ? {
      totalContradictions: depositionAnalysis.documentTestimonyConflicts.length,
      devastatingConflicts: depositionAnalysis.documentTestimonyConflicts
        .filter(c => c.severity === 'devastating').length,
      witnessProfiles: depositionAnalysis.witnessProfiles,
      impeachmentBrief: depositionAnalysis.impeachmentBrief
    } : null,
    defensibility: {
      relevancePrecision: 0,
      relevanceRecall: 0,
      relevanceF1: 0,
      privilegePrecision: 0,
      privilegeRecall: 0,
      sampleSize: 0,
      confidenceLevel: 0.95,
      confidenceInterval: { lower: 0, upper: 0 },
      meetsThreshold: false
    },
    productionSet: {
      totalDocuments: producibleCount,
      format: 'TIFF with extracted text and metadata',
      batesRange: { start: `${caseConfig.caseId}-000001`, end: `${caseConfig.caseId}-${String(producibleCount).padStart(6, '0')}` },
      volumeEstimate: `${Math.ceil(producibleCount * 0.5 / 1024)} GB estimated`
    }
  };
}
```


## Defensibility and Quality Control


AI-assisted document review is only useful if courts accept it. The landmark decisions establish a clear framework: you can use any technology you want, as long as you can prove it works.


*Da Silva Moore v. Publicis Groupe* (2012) was the first federal case to approve technology-assisted review. Magistrate Judge Andrew Peck held that computer-assisted review was "an acceptable way to search for relevant documents in appropriate cases." But the court imposed conditions: transparency about the methodology, quality control metrics, and a willingness to adjust the process based on results.


*Rio Tinto PLC v. Vale S.A.* (2015) went further. Judge Peck wrote that "for most cases today, TAR is the gold standard" and suggested that parties choosing manual review over TAR might be "not acting in good faith" given the cost and accuracy advantages. But the court emphasized that defensibility requires measurable quality: precision, recall, and documented methodology.


*In re Biomet M2a Magnum Hip Implant Products Liability Litigation* (2013) established that the producing party has the right to choose its review methodology, including TAR, as long as it produces a defensible result.


These decisions create the standard for AI-powered review: build the audit trail into the pipeline, not as an afterthought.


```typescript
// quality-control.ts
// Defensibility validation with stratified random sampling

interface QCConfig {
  minSampleSize: number;
  confidenceLevel: number;
  precisionThreshold: number;
  recallThreshold: number;
  f1Threshold: number;
}

const DEFAULT_QC_CONFIG: QCConfig = {
  minSampleSize: 500,
  confidenceLevel: 0.95,
  precisionThreshold: 0.80,
  recallThreshold: 0.75,
  f1Threshold: 0.80
};

interface QCResult {
  sampleSize: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  confidenceInterval: { lower: number; upper: number };
  meetsThreshold: boolean;
  deficiencies: string[];
}

function selectStratifiedSample(
  classifications: DocumentClassification[],
  config: QCConfig
): DocumentClassification[] {
  // Stratify by confidence bands to oversample borderline documents
  const highConfidence = classifications.filter(
    c => c.relevance.confidence >= 0.9
  );
  const mediumConfidence = classifications.filter(
    c => c.relevance.confidence >= 0.5 && c.relevance.confidence < 0.9
  );
  const lowConfidence = classifications.filter(
    c => c.relevance.confidence < 0.5
  );

  // 20% high confidence, 50% medium (borderline), 30% low confidence
  const highSample = Math.ceil(config.minSampleSize * 0.20);
  const medSample = Math.ceil(config.minSampleSize * 0.50);
  const lowSample = Math.ceil(config.minSampleSize * 0.30);

  return [
    ...randomSample(highConfidence, highSample),
    ...randomSample(mediumConfidence, medSample),
    ...randomSample(lowConfidence, lowSample)
  ];
}

function computeQCMetrics(
  aiClassifications: Map<string, boolean>,
  humanClassifications: Map<string, boolean>
): QCResult {
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (const [docId, humanRelevant] of humanClassifications) {
    const aiRelevant = aiClassifications.get(docId) ?? false;
    if (aiRelevant && humanRelevant) tp++;
    else if (aiRelevant && !humanRelevant) fp++;
    else if (!aiRelevant && humanRelevant) fn++;
    else tn++;
  }

  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;

  // Wilson score interval for statistical rigor
  const n = tp + fp + tn + fn;
  const z = 1.96;
  const pHat = precision;
  const denominator = 1 + z * z / n;
  const center = (pHat + z * z / (2 * n)) / denominator;
  const margin = (z * Math.sqrt(
    pHat * (1 - pHat) / n + z * z / (4 * n * n)
  )) / denominator;

  const deficiencies: string[] = [];
  if (precision < DEFAULT_QC_CONFIG.precisionThreshold)
    deficiencies.push(`Precision ${(precision * 100).toFixed(1)}% below ${DEFAULT_QC_CONFIG.precisionThreshold * 100}%`);
  if (recall < DEFAULT_QC_CONFIG.recallThreshold)
    deficiencies.push(`Recall ${(recall * 100).toFixed(1)}% below ${DEFAULT_QC_CONFIG.recallThreshold * 100}%`);
  if (f1 < DEFAULT_QC_CONFIG.f1Threshold)
    deficiencies.push(`F1 ${f1.toFixed(3)} below ${DEFAULT_QC_CONFIG.f1Threshold}`);

  return {
    sampleSize: n, truePositives: tp, falsePositives: fp,
    trueNegatives: tn, falseNegatives: fn,
    precision, recall, f1Score: f1,
    confidenceInterval: { lower: center - margin, upper: center + margin },
    meetsThreshold: deficiencies.length === 0,
    deficiencies
  };
}

function randomSample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
```


The Wilson score interval is used instead of the simpler normal approximation because it handles extreme proportions (precision near 0 or 1) more accurately. When you are reporting metrics to a court, statistical rigor matters. A judge may not understand the difference between Wilson and Wald intervals, but opposing counsel's statistician will.


> **Defensibility Is a Feature, Not a Report**
>
> Defensibility is not something you add after the pipeline is built. It must be
> designed into the architecture from the start. Every classification decision must
> be logged with its confidence score and reasoning. Every sampling round must be
> reproducible. Every metric must be computed with proper confidence intervals.
> Build the audit trail into the pipeline, not as an afterthought.


## The Complete Backautocrat


The Backautocrat orchestrates all five rounds, managing the privilege HITL queue, the RAG-enhanced issue coding, the deposition analysis, and the persistent memory lifecycle.


```typescript
// litigation-support-backautocrat.ts
// Complete pipeline orchestration
import pLimit from 'p-limit';

async function runLitigationSupportPipeline(
  rawDocuments: { id: string; text: string; rawMetadata: any }[],
  caseConfig: CaseConfig,
  vectorDB: CaseLawVectorDB,
  db: Db,
  emitSSE: (event: { round: number; stage: string; status: string; data?: any }) => void
): Promise<CaseReport> {

  const limit = pLimit(10);

  // Initialize persistent memory
  const caseMemory = await initializeCaseMemory(db, caseConfig);

  // ── Round 1: Document Intake ────────────────────────────────
  emitSSE({ round: 1, stage: 'intake', status: 'running' });

  const intakeResult = await ingestDocumentCollection(rawDocuments);

  emitSSE({
    round: 1, stage: 'intake', status: 'complete',
    data: {
      totalIngested: intakeResult.metadata.totalIngested,
      duplicatesRemoved: intakeResult.duplicatesRemoved,
      threadGroups: intakeResult.threadGroups.size
    }
  });

  // ── Round 2: Privilege Screening (Three-Tier HITL) ──────────
  emitSSE({ round: 2, stage: 'privilege', status: 'running' });

  const privilegeResults = new Map<string, PrivilegeResult>();
  let tier1Count = 0;
  let tier2Count = 0;
  let tier3Count = 0;

  // Process all documents through the three-tier screen
  const privilegeSettled = await Promise.allSettled(
    intakeResult.documents.map(doc =>
      limit(async () => {
        // Tier 1: fast metadata check
        const tier1 = performTier1Screen(doc, caseConfig.privilegeConfig);

        if (tier1 === 'clear') {
          tier1Count++;
          const result: PrivilegeResult = {
            tier: 'auto-clear',
            isPrivileged: false,
            confidence: 0.95,
            basis: 'none',
            reasoning: 'No attorney involvement, no privilege markers',
            privilegeLogEntry: null,
            humanReviewRequired: false
          };
          privilegeResults.set(doc.id, result);
          return;
        }

        // Tier 2/3: AI content analysis with thread context
        const threadDocs = doc.metadata.threadId
          ? intakeResult.documents.filter(
              d => d.metadata.threadId === doc.metadata.threadId
            )
          : [doc];

        const result = await performContentAnalysis(
          doc, caseConfig.privilegeConfig, threadDocs
        );
        privilegeResults.set(doc.id, result);

        if (result.tier === 'auto-flag') tier2Count++;
        if (result.tier === 'hitl-escalation') {
          tier3Count++;
          await escalateToHITL(
            db, caseConfig.caseId, doc, result,
            [result.reasoning], threadDocs
          );
        }
      })
    )
  );

  emitSSE({
    round: 2, stage: 'privilege', status: 'complete',
    data: {
      tier1AutoClear: tier1Count,
      tier2AutoFlag: tier2Count,
      tier3HITLEscalation: tier3Count,
      awaitingHumanReview: tier3Count
    }
  });

  // ── Round 3: RAG-Enhanced Issue Coding ──────────────────────
  // Only code documents that passed privilege screening
  const toCod = intakeResult.documents.filter(doc => {
    const priv = privilegeResults.get(doc.id);
    return priv && priv.isPrivileged === false;
  });

  emitSSE({ round: 3, stage: 'issue-coding', status: 'running' });

  const issueCodingResults = await codeBatchWithRAG(
    toCod,
    caseConfig.issues,
    vectorDB,
    caseConfig.caseDescription,
    (completed, total) => {
      if (completed % 100 === 0) {
        emitSSE({
          round: 3, stage: 'issue-coding', status: 'progress',
          data: { completed, total }
        });
      }
    }
  );

  emitSSE({
    round: 3, stage: 'issue-coding', status: 'complete',
    data: {
      documentsCoded: issueCodingResults.size,
      issuesTracked: caseConfig.issues.length
    }
  });

  // ── Round 4: Deposition Analysis (if transcripts available) ─
  let depositionAnalysis: DepositionAnalysisResult | null = null;

  if (caseConfig.depositions.length > 0) {
    emitSSE({ round: 4, stage: 'deposition', status: 'running' });

    depositionAnalysis = await analyzeDepositions(
      caseConfig.depositions,
      toCod,
      issueCodingResults,
      caseConfig
    );

    emitSSE({
      round: 4, stage: 'deposition', status: 'complete',
      data: {
        conflictsFound: depositionAnalysis.documentTestimonyConflicts.length,
        devastatingConflicts: depositionAnalysis.documentTestimonyConflicts
          .filter(c => c.severity === 'devastating').length,
        witnessesAnalyzed: depositionAnalysis.witnessProfiles.length
      }
    });
  }

  // ── Round 5: Synthesis and Reporting ────────────────────────
  emitSSE({ round: 5, stage: 'synthesis', status: 'running' });

  // Update persistent memory
  await updateCaseMemory(db, caseConfig.caseId, {
    newClassifications: issueCodingResults,
    newContradictions: depositionAnalysis?.contradictions,
  });

  // Generate final report
  const report = await generateCaseReport(
    caseConfig,
    intakeResult,
    privilegeResults,
    issueCodingResults,
    depositionAnalysis,
    caseMemory
  );

  emitSSE({
    round: 5, stage: 'synthesis', status: 'complete',
    data: {
      producibleDocuments: report.reviewSummary.producible,
      reductionRate: `${(report.reviewSummary.reductionRate * 100).toFixed(1)}%`,
      privilegeLogEntries: report.privilegeLog.length,
      contradictions: depositionAnalysis?.documentTestimonyConflicts.length ?? 0
    }
  });

  return report;
}
```


## The Economics of AI-Powered Review


The economic case for AI-powered document review is overwhelming, and the V2 enhancements improve the calculus further.


Traditional linear review (attorneys reading every document one at a time) costs between one and two dollars per document. At one million documents, that is one to two million dollars just for first-pass relevance review, before issue coding or privilege screening even begins.


First-generation TAR (predictive coding trained on seed sets) reduced costs to roughly fifty cents to one dollar per document. But TAR still required expensive human training rounds, typically ten to twenty iterations of attorney review to train the classifier, and the classifiers were limited to binary relevance decisions.


An AI-engineered pipeline with the architecture described in this chapter costs between five and twenty cents per document, depending on document length and the number of issues in the taxonomy. At Opus pricing of three dollars per million input tokens and fifteen dollars per million output tokens, classifying a five-thousand-token document through relevance review, twelve-issue coding, and privilege screening costs approximately eight cents. At one million documents, the total API cost is approximately eighty thousand dollars, compared to two million for manual review.


The RAG enhancement adds approximately one cent per document (the vector retrieval is essentially free; the additional prompt context costs tokens). The persistent memory adds less than a cent per document in MongoDB storage and query costs. The HITL privilege gate adds no per-document cost for Tier 1 and Tier 2 documents; only Tier 3 escalations require human time, and they represent fifteen to twenty-five percent of the collection. The total cost of a V2 pipeline is approximately six to twenty-two cents per document, a 10-40x reduction from manual review with measurably better quality and built-in defensibility metrics.


> **The Real Savings Are in Speed**
>
> Cost reduction is dramatic, but speed is transformative. Manual review of one million
> documents takes a team of fifty contract attorneys three to four months. AI-powered
> review processes the same collection in days. In litigation, speed is not just
> convenience; it is leverage. A party that can review its documents in a week instead
> of a quarter can respond to discovery requests faster, prepare for depositions earlier,
> and negotiate from a position of knowledge rather than uncertainty.


## Key Differences from the First Edition


The first edition built the core eDiscovery classification pipeline. The second edition preserves that architecture but adds four layers that make it suitable for complex, long-running litigation.


**RAG-enhanced issue coding** grounds every classification decision in current legal authority. Instead of relying solely on the model's parametric knowledge (which may be outdated or subtly incorrect for a specific jurisdiction), the pipeline retrieves relevant case opinions from a vector database and injects them into coding prompts. Every classification includes citations to the authority that supports it, making the coding more accurate and more defensible.


**Persistent memory** enables the pipeline to operate across months or years of litigation. The case theory evolves. Witnesses give depositions, then declarations, then trial testimony. New document collections are added. Issues are resolved or withdrawn. The pipeline remembers everything: every coding decision, every privilege determination, every contradiction, every shift in legal strategy.


**Privilege screening with HITL handoff** replaces the binary privilege classifier with a three-tier graduated escalation. Tier 1 automatically clears documents with no attorney involvement. Tier 2 automatically flags documents between attorneys. Tier 3 escalates ambiguous documents to an attorney decision gate. The pipeline continues processing non-escalated documents while ambiguous ones await human review. This architecture handles the hard cases safely while maintaining throughput on the volume.


**Deposition contradiction analysis** connects deposition testimony to the documentary evidence surfaced by the eDiscovery pipeline. The pipeline matches each deponent's sworn statements against documents they authored or received, surfaces conflicts, and generates trial-ready impeachment briefs. This integration closes the loop between document review and trial preparation, making the litigation support pipeline not just a classification engine but a comprehensive case analysis system.


---


**Key Takeaways**

- Litigation support involves three core classification problems, each with a different optimization target: relevance (recall), issue coding (precision), privilege (safety). Each demands a different architecture.
- The three-tier privilege HITL handoff (auto-clear, auto-flag, HITL escalation) handles 60-75% of documents automatically while routing ambiguous cases to attorney review. The pipeline continues processing non-escalated documents and resumes when human decisions arrive.
- Fail-safe default: if privilege analysis fails (API error, timeout, parse failure), the document defaults to privileged. Producing a privileged document is malpractice; over-flagging is merely expensive. This is the only acceptable failure mode.
- RAG-enhanced issue coding retrieves relevant case opinions from a vector database and injects them into coding prompts, grounding every classification in current legal authority with citable case citations.
- Persistent memory through MongoDB accumulates case context across months of litigation: case theory evolution, witness statements, document coding decisions, contradiction tracking, and issue resolution. Each pipeline run builds on everything the system has learned.
- The deposition contradiction analysis pipeline (based on TLE's open-source implementation) cross-references sworn testimony against documentary evidence to identify impeachment opportunities, producing trial-ready impeachment briefs.
- Confidence scores drive three-tier document routing: high confidence (auto-classify), medium confidence (expedited human review with AI suggestion), low confidence (de novo human review). This reduces human review volume by 60-70%.
- Stratified random sampling oversamples borderline documents (medium confidence) to ensure quality metrics accurately reflect performance on the hardest classification decisions, not just the easy ones.
- Wilson score intervals provide statistically rigorous confidence bounds for defensibility metrics. When reporting precision and recall to a federal judge, use Wilson, not the simpler Wald approximation.
- Da Silva Moore (2012), Rio Tinto (2015), and In re Biomet (2013) establish the legal framework: AI-assisted review is court-approved when supported by quality metrics that meet or exceed human baselines.
- AI-powered review costs $0.06-0.22 per document versus $1-2 for manual review, a 10-40x cost reduction with more consistent quality, built-in authority citations, and defensibility metrics computed automatically.
- Thread reconstruction in document intake is critical for privilege analysis: a single message may appear non-privileged in isolation but is privileged when viewed in the context of the full email chain.

