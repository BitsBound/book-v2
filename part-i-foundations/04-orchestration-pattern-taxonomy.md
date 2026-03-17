\newpage

# Chapter 4: Orchestration Pattern Taxonomy

*The Architecture That Multiplies Model Capability*

Every legal AI system that produces work clients pay for shares a single structural property: it decomposes complex legal tasks into discrete, focused operations and orchestrates those operations through a deliberate sequence of handoffs. This is not a design preference. It is a production requirement, established empirically and validated at scale. The same Claude Opus model analyzing the same 42,274-word M&A contract produced 35 track changes with zero legal citations in a single pass. That same model, wrapped in a 26-agent, 6-round pipeline, produced 138 track changes with 18 legal citations, a 3.9x improvement with zero change in model capability. The architecture was the only variable.

Chapters 1 through 3 gave you the foundations: the TIRO pattern that maps legal logic to computational logic, the technology stack that powers the pipeline, and the project setup that organizes the code. This chapter gives you the vocabulary and the engineering patterns that turn those foundations into production systems. It is the most important new chapter in this edition because it establishes the taxonomy that every subsequent chapter depends on. When Chapter 9 describes a contract redlining pipeline as "Supervisor into Parallel Fan-Out/Fan-In into Sequential Synthesis," you will know exactly what that means, why it was chosen, and how to implement it. When Chapter 13 describes a legal research pipeline as "Plan-Based with Parallel Research and Adversarial Validation," you will understand the tradeoffs that led to that design.

The taxonomy draws from three sources. First, Victor Dibia's six-pattern framework for multi-agent systems, which provides the structural categories. Second, the academic literature on multi-agent orchestration, including Kashaboina's work on Semantic Consensus and Hierarchical Network patterns, and Fajardo's treatment of Agent-to-Agent interoperability and human-in-the-loop design. Third, and most importantly, production experience: the patterns that survived contact with real contracts, real clients, and real deadlines in BitsBound and TLE Practice. Theory proposes patterns. Production validates them. This chapter presents the patterns that survived.

The model is not the product. The architecture around the model is the product. This chapter teaches you how to build that architecture.


---


## 4.1 The Backautocrat/Diplomat Architecture

A law firm partner managing a complex M&A transaction does not personally review every clause. The partner staffs a deal team: an IP associate reviews the technology provisions, a tax advisor assesses the purchase price allocation, an employment specialist reviews the executive compensation arrangements, and a regulatory attorney evaluates the closing conditions. The partner decides who works on what, in what order, with what inputs, and how to handle conflicts between their recommendations. The partner orchestrates. The team members execute.

This is the exact architecture of every production legal AI pipeline. It has two components, and the separation between them is not optional.

### The Backautocrat

The **Backautocrat** is the orchestrator. It does not perform legal analysis. It does not call the AI model for analytical work. It manages the pipeline: which diplomats to deploy, in what order, with what inputs, and how to handle their outputs. The name is intentional. "Autocrat" because it maintains absolute control over execution order, error handling, and state management. "Back" because it operates behind the scenes, invisible to the user who sees only the final deliverable.

The Backautocrat is responsible for five things:

**Pipeline Configuration.** The Backautocrat defines which diplomats participate in a given pipeline run and in what arrangement. A contract redlining pipeline deploys sixteen specialist analysts in parallel followed by sequential synthesis. A document triage pipeline deploys a single classifier followed by conditional routing to specialized processors. The Backautocrat holds this configuration and executes it.

**Stage Chaining.** The Backautocrat calls each diplomat, captures its typed output, and passes that output as input to the next stage. The chain may be sequential (each stage depends on the prior stage's output), parallel (multiple diplomats run simultaneously on the same input), or a hybrid of both. The Backautocrat manages the data flow regardless of the topology.

**Error Handling.** If Stage 3 fails because the API returns a rate limit error, the model produces unparseable output, or the network times out, the Backautocrat can retry Stage 3 without restarting Stages 1 and 2. The typed outputs from completed stages are cached in memory. In a single-pass architecture, if the one API call fails, you restart everything from zero. In a 6-stage pipeline where each stage costs time and tokens, the ability to retry a single failed stage is the difference between a 30-second recovery and a 5-minute restart.

**Metrics and Logging.** The Backautocrat records metrics at each stage: tokens consumed (input and output), latency in milliseconds, success or failure status, and cost calculated from token counts. This per-stage telemetry is invaluable for optimization. When your pipeline is too slow, the metrics tell you which diplomat is the bottleneck. When your pipeline is too expensive, the metrics tell you which diplomat is consuming the most tokens. You cannot optimize what you cannot measure, and the Backautocrat measures everything.

**State Management.** For long-running analyses (a 200-page M&A contract that takes 20 minutes across 6 stages), the Backautocrat tracks pipeline progress so the analysis can resume if interrupted. Each stage's output is persisted with a session identifier. If the server restarts mid-analysis, the Backautocrat can pick up from the last completed stage.

### The Diplomat

A **Diplomat** is a specialized AI agent that performs one discrete task. It is the atomic unit of legal engineering. Every AI operation in every pipeline you will build throughout this book is a Diplomat. The name reflects the role: like a diplomat negotiating between parties, a Diplomat mediates between your application's typed data structures and the unstructured world of natural language that the AI model inhabits. It translates structured inputs into a prompt, sends that prompt to the model, and translates the model's response back into typed outputs your application can consume.

Every Diplomat has two internal functions, and the separation between them is an architectural requirement that enables auditability, reproducibility, and testability:

**The Prompter** is a pure function. It takes typed inputs (the clause text, the client's playbook, the contract type) and produces a structured prompt string containing a system message and a user message. It makes zero API calls. It performs zero side effects. Given the same inputs, it always produces the exact same prompt. This purity is what makes your pipeline reproducible: you can inspect the exact prompt that was sent to the model, save it for debugging, diff it against prompts from previous runs, and write unit tests that verify the prompt construction logic without ever calling Claude.

**The Executor** takes the prompt produced by the Prompter, sends it to Claude via the API, and returns typed output. It handles streaming, error recovery, token tracking, and response parsing. The Executor is where all side effects live: the API call, the latency measurement, the cost calculation. By isolating side effects in the Executor, you can swap the model, mock the Executor entirely for unit tests, or add retry logic without touching the prompt construction.

```typescript
// backautocrat.ts
// The Backautocrat orchestrates Diplomats through a typed pipeline

import Anthropic from '@anthropic-ai/sdk';

// --- TYPE DEFINITIONS ---

interface PromptPair {
  system: string;
  user: string;
}

interface StageMetrics {
  stageName: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
  status: 'success' | 'failed' | 'retried';
}

interface PipelineResult<T> {
  output: T;
  metrics: StageMetrics[];
  totalCostUsd: number;
  totalLatencyMs: number;
}

// --- THE BACKAUTOCRAT ---

class Backautocrat {
  private client: Anthropic;
  private metrics: StageMetrics[] = [];
  private startTime: number = 0;

  constructor() {
    this.client = new Anthropic({
      timeout: 3_600_000,
      defaultHeaders: {
        'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
      }
    });
  }

  // Execute a single Diplomat stage with full metrics capture
  async executeStage<TInput, TOutput>(
    stageName: string,
    prompter: (input: TInput) => PromptPair,
    executor: (prompt: PromptPair, client: Anthropic) => Promise<TOutput>,
    input: TInput
  ): Promise<TOutput> {
    const stageStart = Date.now();

    try {
      // Step 1: Prompter builds the prompt (pure function, no side effects)
      const prompt = prompter(input);

      // Step 2: Executor calls the model (all side effects isolated here)
      const output = await executor(prompt, this.client);

      // Step 3: Capture metrics
      const latencyMs = Date.now() - stageStart;
      this.metrics.push({
        stageName,
        inputTokens: 0,  // Populated by executor via callback
        outputTokens: 0,
        latencyMs,
        costUsd: 0,
        status: 'success'
      });

      return output;
    } catch (error) {
      const latencyMs = Date.now() - stageStart;
      this.metrics.push({
        stageName,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs,
        costUsd: 0,
        status: 'failed'
      });
      throw error;
    }
  }

  // Run a complete pipeline and return results with metrics
  async run<T>(
    pipelineFn: (backautocrat: Backautocrat) => Promise<T>
  ): Promise<PipelineResult<T>> {
    this.startTime = Date.now();
    this.metrics = [];

    const output = await pipelineFn(this);

    const totalCostUsd = this.metrics
      .reduce((sum, m) => sum + m.costUsd, 0);
    const totalLatencyMs = Date.now() - this.startTime;

    return { output, metrics: this.metrics, totalCostUsd, totalLatencyMs };
  }
}
```

### Why Separation of Concerns Is Non-Negotiable

The three properties that Backautocrat/Diplomat separation gives you are not academic niceties. They are production necessities:

**Auditable.** When a client asks why the analysis flagged a particular clause, you can show them the exact prompt that was sent to the model. The Prompter's output is a string you can log, save, and review. In regulated environments, this audit trail is not optional. It is a compliance requirement.

**Reproducible.** Given the same clause text and the same playbook, the Prompter will always produce the same prompt. If you need to rerun an analysis, you know the prompt will be identical. This makes A/B testing possible: change one variable in the prompt, hold everything else constant, measure the difference.

**Testable.** You can write a unit test that calls the Prompter with known inputs and asserts that the output prompt contains the right instructions, the right clause text, and the right playbook parameters, all without making a single API call. When the Executor fails, you can mock it and still test every other part of your pipeline.

**Swappable.** A Diplomat can be replaced without touching the Backautocrat. If your MAC analyst needs a better prompt, you update one file. If you want to add a new specialist for cybersecurity representations, you create one new Diplomat and register it with the Backautocrat. The orchestration logic does not change.

### A Complete Diplomat: The Risk Analyzer

To make the Prompter/Executor separation concrete, here is a complete production-grade Diplomat. Notice that the Prompter is a pure function you can test without an API key, and the Executor isolates every side effect (the API call, the streaming, the token tracking, the cost calculation) in a single function.

```typescript
// risk-analyzer-diplomat.ts
// A complete Diplomat: Prompter (pure) + Executor (side effects)

import Anthropic from '@anthropic-ai/sdk';

// --- TYPE DEFINITIONS ---

interface ClauseData {
  sectionNumber: string;
  text: string;
  contractType: string;
  definedTerms: Record<string, string>;
}

interface Playbook {
  clientName: string;
  partyRole: 'buyer' | 'seller' | 'licensor' | 'licensee';
  riskTolerance: 'aggressive' | 'moderate' | 'conservative';
  redFlags: string[];
  minimumCaps: Record<string, string>;
}

interface RiskFinding {
  clauseRef: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  currentLanguage: string;
  recommendedRevision: string;
  reasoning: string;
  citation: string | null;
}

interface DiplomatMetrics {
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
}

// --- PROMPTER (pure function — no side effects, no API calls) ---

function buildRiskAnalyzerPrompt(
  clause: ClauseData,
  playbook: Playbook
): PromptPair {
  const system = [
    `You are a senior contract risk analyst specializing in ${clause.contractType} agreements.`,
    `You represent the ${playbook.partyRole} (${playbook.clientName}).`,
    `Risk tolerance: ${playbook.riskTolerance}.`,
    'Evaluate the provided clause against the client playbook.',
    'For each risk identified, provide:',
    '  1. The exact clause reference (section number)',
    '  2. A risk category (e.g., "indemnification", "termination", "IP")',
    '  3. Severity: critical, high, medium, or low',
    '  4. A clear description of the issue',
    '  5. The exact contract language that creates the risk',
    '  6. Recommended replacement language',
    '  7. Legal reasoning supporting the recommendation',
    '  8. A legal citation if applicable (case law, statute, or regulation)',
    'Return a JSON array of RiskFinding objects. If no risks, return [].',
  ].join('\n');

  const user = [
    `## Section ${clause.sectionNumber}`,
    '',
    clause.text,
    '',
    '## Client Playbook',
    `Client: ${playbook.clientName}`,
    `Role: ${playbook.partyRole}`,
    `Risk Tolerance: ${playbook.riskTolerance}`,
    '',
    '## Red Flags',
    ...playbook.redFlags.map(flag => `- ${flag}`),
    '',
    '## Minimum Acceptable Terms',
    ...Object.entries(playbook.minimumCaps)
      .map(([term, min]) => `- ${term}: ${min}`),
    '',
    '## Defined Terms in Scope',
    ...Object.entries(clause.definedTerms)
      .map(([term, def]) => `- "${term}": ${def}`),
  ].join('\n');

  return { system, user };
}

// --- EXECUTOR (all side effects isolated here) ---

async function executeRiskAnalyzer(
  prompt: PromptPair,
  client: Anthropic
): Promise<{ findings: RiskFinding[]; metrics: DiplomatMetrics }> {
  const startMs = Date.now();

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 128_000,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
  });

  const response = await stream.finalMessage();
  const latencyMs = Date.now() - startMs;

  // Extract text content from the response
  const text = response.content
    .find(block => block.type === 'text')?.text ?? '[]';

  // Parse the JSON response into typed findings
  const findings = JSON.parse(text) as RiskFinding[];

  // Calculate cost (Opus pricing: $15/M input, $75/M output)
  const { input_tokens, output_tokens } = response.usage;
  const costUsd =
    (input_tokens * 15 + output_tokens * 75) / 1_000_000;

  return {
    findings,
    metrics: {
      inputTokens: input_tokens,
      outputTokens: output_tokens,
      latencyMs,
      costUsd,
    },
  };
}
```

The legal-code parallel is precise. A law firm partner who assigns an associate to review a clause provides: the clause text, the client's negotiation playbook, the risk tolerance, and the specific red flags to watch for. The Prompter does exactly the same thing, encoding the assignment in a structured prompt. The associate's work product is a memo with findings. The Executor's return value is a typed array of findings. The data structures are the same. The delivery mechanism changed.

| Legal Workflow Step | Diplomat Component | What It Does |
|---|---|---|
| Partner assigns the task with instructions | Prompter function | Encodes the assignment as a structured prompt |
| Associate reads the clause and applies the playbook | Executor + Claude API | Processes the prompt and generates analysis |
| Associate delivers a memo with findings | Return value (typed `RiskFinding[]`) | Structured output the pipeline can consume |
| Partner reviews the memo for quality | Backautocrat metrics + HITL | Logs, measures, and optionally presents for review |

> **Key Concept: The Backautocrat Never Analyzes**
>
> The Backautocrat's job is to manage the pipeline, not to perform legal analysis. It decides which Diplomats run, in what order, with what inputs. It handles errors, tracks metrics, and manages state. But it never constructs a prompt, never calls the model for analytical work, and never interprets a model's response. All domain intelligence lives in the Diplomats. This separation means the same Backautocrat pattern works for every pipeline in this book, from contract drafting to litigation support.

**Key Takeaways**

- The Backautocrat is the orchestrator. It manages pipeline execution, error handling, metrics, and state. It does not perform analysis.
- A Diplomat is the atomic unit of legal engineering. Every AI operation is a Diplomat with a Prompter (pure function) and an Executor (side effects).
- Separation of concerns enables auditability, reproducibility, testability, and swappability.
- The same Backautocrat pattern works for every pipeline. Only the Diplomats change between workflows.
- Name Diplomats by function (ContractClassifier, RiskAnalyzer) not by position (Stage1, Diplomat2). A well-named pipeline reads like a workflow description.


---


## 4.2 The Eight Diplomat Categories

Every Diplomat in a legal engineering pipeline performs one of eight types of work. Understanding these categories is essential because they determine what kind of prompt you write, what kind of output you expect, and how the Diplomat fits into the larger pipeline. When you design a new pipeline, you are not inventing new agent types. You are composing these eight categories into an arrangement that fits your workflow.

The categories emerged empirically. After building dozens of pipelines across ten legal workflow types, the same eight roles appeared repeatedly. A contract redlining pipeline and a litigation support pipeline look different on the surface, but both contain classifiers, extractors, synthesizers, and translators. The categories are the periodic table of legal engineering: a small set of elements that combine into an enormous variety of compounds.

### Category 1: Classify

**Role:** Identify what we are looking at. Determine the type, structure, and metadata of the input.

**Legal Analogy:** The partner who picks up a document, flips through it for two minutes, and says: "This is a public company merger agreement, two-step tender offer, Delaware law, approximately $4.75 billion."

**Example Diplomat:** An intake classifier that reads a contract and produces structured metadata including contract type, governing law, parties, deal value, and structural features.

**Why It Matters:** Classification determines everything downstream. A contract classified as an M&A agreement activates MAC, termination rights, and deal protection specialists. A contract classified as a SaaS agreement activates SLA, data processing, and IP assignment specialists. Misclassification means deploying the wrong experts, which means missing the issues that matter.

```typescript
// classify-diplomat.ts
// Intake Classifier — determines contract type and activates the right specialists

interface ClassificationInput {
  contractText: string;
  userInstruction: string;
}

interface ClassificationOutput {
  contractType: 'ma' | 'saas' | 'nda' | 'employment' | 'lease' | 'loan';
  governingLaw: string;
  parties: { name: string; role: string }[];
  dealValue: string | null;
  structuralFeatures: string[];
  recommendedSpecialists: string[];
}

function buildClassifierPrompt(input: ClassificationInput): PromptPair {
  const system = [
    'You are a senior legal analyst performing intake classification.',
    'Read the provided contract and extract structured metadata.',
    'Your classification determines which specialist analysts will be deployed.',
    'Accuracy is critical: a misclassification means the wrong experts review this contract.',
    'Return valid JSON matching the ClassificationOutput schema.',
  ].join(' ');

  const user = [
    '## Contract Text',
    input.contractText,
    '',
    '## User Instruction',
    input.userInstruction,
    '',
    '## Required Output',
    'Identify: contract type, governing law, parties and roles,',
    'deal value (if applicable), key structural features,',
    'and recommended specialist analysts for deep review.',
  ].join('\n');

  return { system, user };
}
```

### Category 2: Extract

**Role:** Pull specific data from documents. Not analysis, not judgment: extraction. Identify defined terms, dates, dollar amounts, obligations, conditions, and cross-references.

**Legal Analogy:** The paralegal who reads through a contract and builds a term sheet: "The Outside Date is June 30, 2026. The Termination Fee is $142.5 million. The Non-Compete Period is 24 months."

**Example Diplomat:** A term extractor that reads a contract and produces a structured dictionary of every defined term, its definition, and every section where it is referenced.

**Why It Matters:** Extraction is the foundation for every downstream operation. You cannot check whether a cross-reference is valid if you have not extracted the cross-references. You cannot assess whether a termination fee is market-standard if you have not extracted the fee amount. Extraction diplomats turn unstructured prose into structured data that other diplomats can reason about.

```typescript
// extract-diplomat.ts
// Term Extractor — pulls defined terms and their usage from a contract

interface DefinedTerm {
  term: string;
  definition: string;
  definedInSection: string;
  referencedInSections: string[];
  isCircular: boolean;       // References another undefined term
  isBroken: boolean;         // Referenced but never defined
}

interface ExtractionOutput {
  definedTerms: DefinedTerm[];
  undefinedReferences: string[];
  dateTerms: { term: string; value: string; section: string }[];
  dollarTerms: { term: string; value: string; section: string }[];
}
```

### Category 3: Align

**Role:** Compare the document against a standard: a playbook, a regulatory requirement, market benchmarks, or a prior version. Identify gaps, deviations, and non-conformities.

**Legal Analogy:** The senior associate who reads a counterparty's draft against the firm's negotiation playbook and marks every deviation: "Their indemnification cap is 2x annual fees. Our playbook requires a minimum of 3x. Flag for negotiation."

**Example Diplomat:** A playbook alignment diplomat that compares each clause in a contract against party-specific playbook requirements and identifies deviations with severity ratings.

**Why It Matters:** Alignment is what transforms raw analysis into actionable guidance. An extractor can tell you the indemnification cap is $5 million. An alignment diplomat can tell you that $5 million is below market for a deal of this size and below the client's minimum threshold. The gap between data and advice is the alignment diplomat's domain.

```typescript
// align-diplomat.ts
// Playbook Aligner — compares contract terms against client requirements

interface PlaybookRequirement {
  clause: string;
  minimumAcceptable: string;
  preferred: string;
  walkAway: string;
}

interface AlignmentFinding {
  clauseRef: string;
  contractPosition: string;
  playbookRequirement: PlaybookRequirement;
  deviation: 'conforming' | 'minor-deviation' | 'major-deviation' | 'walk-away';
  recommendation: string;
  negotiationLeverage: string;
}
```

### Category 4: Cross-Reference

**Role:** Check internal consistency. Verify that every cross-reference resolves, every defined term is actually defined, every schedule referenced in the body exists as an attachment, and every condition in one section is consistent with related conditions elsewhere.

**Legal Analogy:** The associate who reads Section 7.2(a), which says "subject to the conditions set forth in Annex A," then checks whether Annex A exists and whether it actually contains conditions. (In the Meridian-Apex experiment, it did not. The cross-reference was broken, rendering the tender offer conditions arguably unenforceable.)

**Example Diplomat:** A cross-reference validator that maps every internal reference in a contract and flags any that resolve to nonexistent sections, schedules, or annexes.

**Why It Matters:** Cross-reference errors are invisible to generalist review and devastating in practice. A broken cross-reference in a conditions-to-closing section can render the entire closing mechanism ambiguous. In the CLE experiment, the pipeline caught a cross-reference to a nonexistent "Annex A" in the tender offer conditions. The single-pass approach missed it entirely. Cross-reference validation is a mechanical check that machines excel at and humans routinely miss.

### Category 5: Research

**Role:** Go outside the model for current information. Search the web, query databases, access external APIs for case law, regulatory guidance, market data, or comparable transactions.

**Legal Analogy:** The research librarian who receives a specific request from the deal team: "Find Delaware Chancery precedent on the enforceability of forward-looking MAC language" and comes back with case names, holdings, and citation-ready references.

**Example Diplomat:** A research agent that receives specific questions generated by upstream specialists, conducts targeted web searches, evaluates the results, and returns structured research findings with citations.

**Why It Matters:** Research is the single most differentiating category. Every other category works from the model's training data, which has a cutoff date and inevitably contains gaps. Research diplomats access current information: a ruling from last month, an SEC guidance letter from this quarter, updated ABA market data. In the CLE experiment, eight research agents conducting 40 web searches produced 18 citable references that the single-pass approach (which had no research capability) could not produce at all. Research is what transforms the pipeline's comments from "this is market standard" to "this falls within the 2.5 to 4 percent range upheld by Delaware courts per *In re Cogent* and *In re Answers Corp.*"

```typescript
// research-diplomat.ts
// Research Agent — conducts targeted web searches based on specialist findings

interface ResearchQuery {
  topic: string;
  specificQuestions: string[];
  jurisdictions: string[];
  sourcePriority: ('case-law' | 'regulation' | 'market-data' | 'guidance')[];
}

interface ResearchFinding {
  query: string;
  source: string;
  sourceType: 'case-law' | 'regulation' | 'market-data' | 'guidance';
  citation: string;
  holding: string;
  relevance: string;
  reliability: 'verified' | 'plausible' | 'unverified';
}
```

> **Warning: Research Diplomats Require Verification**
>
> Every citation produced by a research diplomat must be verified by an attorney before it appears in work product. Research agents can hallucinate plausible-sounding but nonexistent authorities. TLE R&D Experiment 03 (Legal Research) demonstrated this empirically: a parallelized research pipeline without proper synthesis scored worse than single-pass because unverified citations degraded the output's credibility. The research diplomat provides starting points. The attorney verifies them. This division of labor is non-negotiable.

### Category 6: Synthesize

**Role:** Merge findings from multiple sources, resolve conflicts between specialist recommendations, prioritize by impact, and produce a unified strategy.

**Legal Analogy:** The senior partner who reads sixteen specialist memos, resolves the conflicts (the MAC specialist wants narrow carve-outs to protect the buyer, the target representations specialist wants broad carve-outs to protect the seller, but we represent the buyer), prioritizes by deal impact, and produces a single coherent revision strategy.

**Example Diplomat:** A synthesis agent that receives 302 specialist findings and 18 research results and produces 80 prioritized directives.

**Why It Matters:** Without synthesis, parallel analysis produces chaos. Sixteen specialist memos on a partner's desk, each excellent in isolation, but with overlapping findings, conflicting recommendations, and no coherent through-line. The synthesis diplomat is the editorial judgment layer. It is the most intellectually demanding diplomat in the pipeline because it must understand not just individual issues but how they interact across the full agreement.

```typescript
// synthesize-diplomat.ts
// Synthesis Agent — merges specialist findings into prioritized directives

interface SynthesisInput {
  specialistFindings: SpecialistFinding[];
  researchResults: ResearchFinding[];
  classification: ClassificationOutput;
  partyPerspective: 'buyer' | 'seller' | 'neutral';
}

interface PrioritizedDirective {
  priority: number;                    // 1 = highest
  clauseRef: string;
  changeType: 'insert' | 'delete' | 'modify';
  currentLanguage: string;
  proposedLanguage: string;
  reasoning: string;
  supportingAuthority: string | null;  // Citation from research
  sourceSpecialists: string[];         // Which specialists flagged this
  dealImpact: 'critical' | 'significant' | 'moderate' | 'minor';
}
```

### Category 7: Translate

**Role:** Convert analytical output into the specific format required by the output medium. Transform directives into OOXML Track Changes markup, risk scores into dashboard data, research findings into a memo structure, or obligations into calendar entries.

**Legal Analogy:** The associate who takes the partner's revision notes ("tighten the MAC carve-outs, add a materiality qualifier to Section 4.2, cap the indemnification at 10% of deal value") and translates each one into specific contract language with precise insertion and deletion points.

**Example Diplomat:** A directive generator that takes 80 prioritized directives from the synthesis agent and produces exact OOXML markup instructions specifying where to insert, delete, or modify text in the Word document.

**Why It Matters:** Translation is the bridge between analysis and delivery. A brilliant analysis that cannot be expressed in the format the client expects is worthless. In legal practice, that format is almost always a Microsoft Word document with Track Changes. The translation diplomat converts abstract directives into the specific markup instructions that Round 06's code will execute against the document's XML.

### Category 8: Apply

**Role:** Execute the translation against the actual document. This is the only category that may not involve AI at all. In the contract redlining pipeline, the apply stage is pure code: it opens the Word document's underlying XML, finds the exact locations for each change, and inserts the Track Changes markup.

**Legal Analogy:** The paralegal who takes the marked-up draft and enters the changes into the official document in the document management system.

**Example Diplomat:** The OOXML surgeon that takes directive markup from the translation diplomat and performs microsurgery on the Word document's XML to insert real Track Changes.

**Why It Matters:** This is the last-mile problem that most AI tools get wrong. If your AI output does not integrate into the existing workflow, adoption fails. Lawyers work in Word. The apply diplomat produces Word. It takes 0.2 seconds, costs nothing, and produces output indistinguishable from human-generated Track Changes because it uses the exact same underlying XML format.

### Beyond the Eight: Kashaboina's Advanced Coordination Patterns

The eight categories described above cover the types of work individual Diplomats perform. But two additional coordination patterns from Kashaboina's "Practical Multi-Agent AI Systems" describe how groups of Diplomats can reach agreement when their outputs conflict:

**Semantic Consensus.** Multiple Diplomats analyze the same input independently (as in Pattern 2), but instead of a single synthesis Diplomat resolving conflicts, the Diplomats engage in a structured consensus-building process. Each Diplomat reviews the others' findings, identifies points of agreement and disagreement, and votes on contested issues. The consensus output is the set of findings that a majority (or supermajority) of Diplomats agree on.

In legal terms, this is the difference between a partner who reads sixteen memos and decides (synthesis), and a committee meeting where sixteen specialists discuss their findings and reach consensus. Semantic Consensus is more expensive (each Diplomat reads not just the contract but also the other Diplomats' findings) but produces findings with higher confidence because they have been validated by multiple independent analyses.

**Legal use case:** Privilege screening on high-stakes documents. Three independent privilege classifiers analyze each document. Only documents flagged as privileged by at least two of three classifiers are marked privileged. This reduces both false positives (over-designating privilege) and false negatives (failing to identify privileged documents), at the cost of running three classifiers per document instead of one.

**Hierarchical Network.** Diplomats are organized in a hierarchy where junior Diplomats report to senior Diplomats, and senior Diplomats report to executive Diplomats. Each level of the hierarchy performs progressively higher-level analysis: junior Diplomats extract data, senior Diplomats identify patterns, executive Diplomats make strategic recommendations.

In legal terms, this is the deal team structure made explicit. Junior associates extract defined terms and check cross-references (Extract, Cross-Reference). Senior associates identify risk patterns and assess severity (Align, Analyze). The partner synthesizes the strategic picture and decides the negotiation approach (Synthesize). The hierarchical structure ensures that higher-level Diplomats never process raw data; they always work from the curated output of lower levels.

**Legal use case:** Large-scale M&A due diligence. Document-level extractors feed category-level analyzers, which feed a portfolio-level synthesizer, which feeds a deal-level strategist. Each level adds interpretive value. The deal strategist never reads individual lease terms; it works from the real estate risk summary produced by the category analyzer.

These advanced patterns are powerful but complex to implement. Most production legal pipelines use the simpler six patterns from Section 4.5. But as pipeline sophistication grows, Semantic Consensus and Hierarchical Network provide blueprints for the next level of coordination.

### The Eight Categories as a Reference Table

| Category | Verb | Input | Output | AI Required? |
|----------|------|-------|--------|-------------|
| **Classify** | Identify | Raw document | Structured metadata | Yes |
| **Extract** | Pull | Classified document | Structured data (terms, dates, amounts) | Yes |
| **Align** | Compare | Extracted data + standard | Gap analysis with recommendations | Yes |
| **Cross-Reference** | Validate | Extracted references | Consistency report with broken links | Yes (or rules-based) |
| **Research** | Search | Specific questions from analysis | Citations, holdings, market data | Yes + Tools |
| **Synthesize** | Merge | Multiple specialist outputs | Unified, prioritized directives | Yes |
| **Translate** | Format | Directives | Output-specific markup | Yes |
| **Apply** | Execute | Markup instructions + document | Modified document | No (code only) |

> **Practice Tip: Design Pipelines by Listing Categories**
>
> When designing a new pipeline, start by listing which of the eight categories you need and in what order. A contract redlining pipeline needs: Classify, Extract, Align, Cross-Reference, Research, Synthesize, Translate, Apply. An obligation tracking pipeline needs: Classify, Extract, Translate (into calendar format), Apply (to calendar system). The categories tell you how many Diplomats to build and what each one does. If you can list the categories, you have the skeleton of your pipeline.

**Key Takeaways**

- Every Diplomat performs one of eight types of work: Classify, Extract, Align, Cross-Reference, Research, Synthesize, Translate, Apply.
- The categories emerged empirically from building dozens of pipelines across ten workflow types. They are the periodic table of legal engineering.
- Research is the most differentiating category because it accesses current information the model's training data does not contain.
- Synthesis is the most intellectually demanding category because it must resolve conflicts and prioritize across the full scope of the analysis.
- Apply may not involve AI at all. The OOXML surgery stage is pure code executing in 0.2 seconds.
- Design pipelines by listing categories first, then building Diplomats for each.


---


## 4.3 Sequential Orchestration

Sequential orchestration is the simplest pattern. Diplomats run one after another, each consuming the typed output of the prior stage. The Backautocrat calls Diplomat A, waits for its result, passes that result to Diplomat B, waits, passes to Diplomat C, and so on until the pipeline completes.

```
Classify ──→ Extract ──→ Align ──→ Synthesize ──→ Translate ──→ Apply
```

<svg viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
  <defs>
    <marker id="arrow-seq" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>
  <!-- Boxes -->
  <rect x="10" y="35" width="100" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="60" y="65" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Classify</text>
  <rect x="150" y="35" width="100" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="200" y="65" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Extract</text>
  <rect x="290" y="35" width="100" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="340" y="65" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Align</text>
  <rect x="430" y="35" width="100" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="480" y="65" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Synthesize</text>
  <rect x="570" y="35" width="100" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="620" y="65" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Translate</text>
  <rect x="710" y="35" width="70" height="50" rx="8" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="745" y="65" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Apply</text>
  <!-- Arrows -->
  <line x1="110" y1="60" x2="148" y2="60" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-seq)"/>
  <line x1="250" y1="60" x2="288" y2="60" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-seq)"/>
  <line x1="390" y1="60" x2="428" y2="60" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-seq)"/>
  <line x1="530" y1="60" x2="568" y2="60" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-seq)"/>
  <line x1="670" y1="60" x2="708" y2="60" stroke="#f39c12" stroke-width="2" marker-end="url(#arrow-seq)"/>
  <!-- Label -->
  <text x="400" y="110" text-anchor="middle" fill="#16a085" font-size="11" font-family="sans-serif" font-style="italic">Figure 4.1 — Sequential Pipeline: each stage depends on the prior stage's typed output</text>
</svg>

### When to Use Sequential Orchestration

Sequential orchestration is appropriate when each stage genuinely depends on the output of the prior stage. The contract classifier must run before the risk analyzer because the analyzer needs to know whether it is examining a SaaS agreement or an M&A contract. The synthesis agent cannot run until all specialist findings have been collected. The directive generator cannot run until synthesis is complete.

The dependency is the key test. If Diplomat B cannot begin work without Diplomat A's output, the relationship is sequential. If Diplomat B and Diplomat C both need only the same upstream input and not each other's output, they should run in parallel (Section 4.4).

### Implementation

Sequential orchestration in TypeScript is straightforward: a series of awaited function calls where each call's return value becomes the next call's input.

```typescript
// sequential-pipeline.ts
// A contract drafting pipeline: gather terms, draft, review, finalize

async function runDraftingPipeline(
  dealTerms: DealTerms,
  playbook: Playbook
): Promise<PipelineResult<FinalDraft>> {
  const backautocrat = new Backautocrat();

  return backautocrat.run(async (ba) => {
    // Stage 1: Gather and structure the deal terms
    const structuredTerms = await ba.executeStage(
      'TermGatherer',
      buildTermGathererPrompt,
      executeTermGatherer,
      { dealTerms, playbook }
    );

    // Stage 2: Draft the contract from structured terms
    const initialDraft = await ba.executeStage(
      'ContractDrafter',
      buildDrafterPrompt,
      executeDrafter,
      { structuredTerms, playbook }
    );

    // Stage 3: Review the draft for gaps and errors
    const reviewFindings = await ba.executeStage(
      'DraftReviewer',
      buildReviewerPrompt,
      executeReviewer,
      { draft: initialDraft, playbook }
    );

    // Stage 4: Incorporate review feedback into final draft
    const finalDraft = await ba.executeStage(
      'FinalAuthor',
      buildFinalAuthorPrompt,
      executeFinalAuthor,
      { draft: initialDraft, findings: reviewFindings, playbook }
    );

    return finalDraft;
  });
}
```

### Typed Data Flow: The Compiler as Contract Enforcer

The critical feature of sequential orchestration is that every handoff between stages is typed. TypeScript interfaces between stages create a contract that the compiler enforces. If the shape changes in one stage's output, the build breaks before runtime. This is not a nice-to-have. In a legal pipeline where each stage costs real money (API calls to Claude Opus), catching a type mismatch at compile time instead of after $11 in API calls is the difference between a bug fix and a wasted pipeline run.

```typescript
// typed-sequential-handoff.ts
// Every stage produces typed output consumed by the next stage

// Stage 1 output — consumed by Stage 2
interface ContractClassification {
  contractType: 'ma' | 'saas' | 'nda' | 'employment';
  governingLaw: string;
  parties: { name: string; role: string }[];
  keyTerms: string[];
}

// Stage 2 output — consumed by Stage 3
interface ExtractedTerms {
  classification: ContractClassification;  // Carries forward
  definedTerms: Map<string, string>;
  obligations: { party: string; obligation: string; deadline: string }[];
  crossReferences: { from: string; to: string; resolved: boolean }[];
}

// Stage 3 output — consumed by Stage 4
interface AlignmentReport {
  terms: ExtractedTerms;                   // Carries forward
  deviations: {
    clause: string;
    playbookRequirement: string;
    actualTerm: string;
    severity: 'conforming' | 'minor' | 'major' | 'walkaway';
  }[];
  brokenReferences: string[];
}

// If Stage 2 changes its output shape (e.g., renames 'obligations' to 'duties'),
// TypeScript catches the error at compile time: Stage 3's code references
// 'input.obligations' which no longer exists. The build fails. No API calls wasted.
```

Each stage's output carries forward the context that downstream stages need. The `AlignmentReport` includes the `ExtractedTerms` which includes the `ContractClassification`. By Stage 4 (Synthesis), the Diplomat has access to the full chain of typed data from every prior stage, not because it received a single massive unstructured blob, but because each stage's types compose cleanly.

### Trade-Offs

**Advantages.** Sequential pipelines are predictable, debuggable, and easy to reason about. When something goes wrong, you know exactly which stage produced the faulty output and exactly what inputs it received. The data flow is linear, which means the execution trace reads like a story: "We classified the contract, then extracted terms, then aligned against the playbook, then synthesized directives, then translated to OOXML, then applied to the document." Typed handoffs mean the compiler catches structural errors before runtime. And per-stage retry means a single failure does not invalidate the entire pipeline.

**Disadvantages.** Total time equals the sum of all stage times. If each of six stages takes 60 seconds, the pipeline takes 6 minutes. If any of those stages could run simultaneously (because they do not depend on each other), you are wasting time by making them wait.

> **Insight: Sequential Is the Default, Parallel Is the Optimization**
>
> Start by designing every pipeline as sequential. Then identify which stages are truly independent and convert those to parallel execution. This approach is safer because it forces you to explicitly identify dependencies before introducing concurrency. A pipeline that runs sequentially when it could run in parallel is slow but correct. A pipeline that runs in parallel when it should run sequentially is fast but broken.

**Key Takeaways**

- Sequential orchestration runs Diplomats one after another, each consuming the prior stage's typed output.
- Use sequential orchestration when each stage genuinely depends on the prior stage's output.
- Total pipeline time equals the sum of all stage times. This is the fundamental cost of sequential execution.
- Start sequential, identify independence, then optimize to parallel. Never parallelize stages that have genuine dependencies.


---


## 4.4 Parallel Orchestration with Promise.allSettled

Parallel orchestration is the single most impactful performance optimization in legal engineering. When tasks are independent, running them simultaneously transforms user experience without changing total compute cost. If you have sixteen specialist analyzers and each takes thirty seconds, sequential execution takes eight minutes. Parallel execution takes thirty seconds. Same token usage. Same API bill. The only thing that changed is the architecture.

<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
  <defs>
    <marker id="arrow-par" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>
  <!-- Input box -->
  <rect x="10" y="120" width="100" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="60" y="150" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Classify</text>
  <!-- Fan-out lines -->
  <line x1="110" y1="135" x2="178" y2="35" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="110" y1="140" x2="178" y2="75" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="110" y1="145" x2="178" y2="115" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="110" y1="150" x2="178" y2="155" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="110" y1="155" x2="178" y2="195" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="110" y1="160" x2="178" y2="235" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <!-- Specialist boxes -->
  <rect x="180" y="15" width="180" height="35" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="270" y="37" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">MAC/MAE Specialist</text>
  <rect x="180" y="58" width="180" height="35" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="270" y="80" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">IP Risk Specialist</text>
  <rect x="180" y="101" width="180" height="35" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="270" y="123" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Indemnification Specialist</text>
  <rect x="180" y="144" width="180" height="35" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="270" y="166" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Termination Specialist</text>
  <rect x="180" y="187" width="180" height="35" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="270" y="209" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Data Protection Specialist</text>
  <rect x="180" y="230" width="180" height="35" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="270" y="252" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">... +11 More Specialists</text>
  <!-- Fan-in lines -->
  <line x1="360" y1="35" x2="448" y2="135" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="360" y1="75" x2="448" y2="140" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="360" y1="115" x2="448" y2="145" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="360" y1="155" x2="448" y2="150" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="360" y1="195" x2="448" y2="155" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <line x1="360" y1="250" x2="448" y2="160" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-par)"/>
  <!-- Synthesis box -->
  <rect x="450" y="120" width="110" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="505" y="150" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Synthesize</text>
  <!-- Arrow to next -->
  <line x1="560" y1="145" x2="598" y2="145" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-par)"/>
  <rect x="600" y="120" width="90" height="50" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="645" y="150" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Translate</text>
  <!-- Labels -->
  <text x="155" y="290" text-anchor="middle" fill="#f39c12" font-size="10" font-family="sans-serif" font-weight="bold">FAN-OUT</text>
  <text x="420" y="290" text-anchor="middle" fill="#16a085" font-size="10" font-family="sans-serif" font-weight="bold">FAN-IN</text>
  <text x="350" y="310" text-anchor="middle" fill="#16a085" font-size="11" font-family="sans-serif" font-style="italic">Figure 4.2 — Parallel Fan-Out/Fan-In: independent specialists run simultaneously</text>
</svg>

### The Independence Test

The rule for when to parallelize is simple: parallelize *within* a round, sequence *between* rounds. Classification must happen before specialist analysis because you need to know it is an M&A agreement before you deploy M&A-specific analyzers. But once you know the contract type, every specialist in the analysis round can run at the same time. The IP risk analyzer does not need the MAC analyst's output. The termination rights specialist does not wait for the indemnification specialist. Each one reads the same contract, applies its own expertise, and produces its own findings.

The test is straightforward: can this Diplomat run with only the round's shared input, or does it need another Diplomat's output? If the former, parallelize. If the latter, sequence.

### Why Promise.allSettled, Never Promise.all

JavaScript provides two primary tools for running promises in parallel: `Promise.all` and `Promise.allSettled`. For legal engineering, only one is acceptable.

`Promise.all` takes an array of promises and resolves when every promise succeeds. If even one promise rejects, the entire batch rejects immediately. Suppose you fire sixteen analysts in parallel. Fifteen succeed brilliantly. The sixteenth hits a rate limit and throws an error. With `Promise.all`, you lose everything. Fifteen valid risk assessments are discarded because one analyst failed.

`Promise.allSettled` solves this by waiting for every promise to either fulfill or reject, then returning the status and value of each one individually. If fifteen analysts succeed, you get fifteen results. The one that failed gives you a rejection reason you can log and handle gracefully. This is the only concurrency pattern that provides **graceful degradation**: partial results are always better than total failure in legal work.

```typescript
// parallel-analysis.ts
// Fan-out: 16 specialist analysts run simultaneously on the same contract

import pLimit from 'p-limit';

interface AnalyzerSpec {
  name: string;
  focusArea: string;
  systemPrompt: string;
}

async function runParallelAnalysis(
  contractText: string,
  playbook: string,
  analyzerSpecs: AnalyzerSpec[],
  client: Anthropic
): Promise<{
  findings: RiskFinding[];
  successCount: number;
  failureCount: number;
}> {
  // Concurrency limiter: at most 10 active API calls at a time
  const limit = pLimit(10);

  // Fan-out: dispatch every analyzer in parallel
  const results = await Promise.allSettled(
    analyzerSpecs.map(spec =>
      limit(async () => {
        const prompt = buildSpecialistPrompt(spec, contractText, playbook);

        const stream = client.messages.stream({
          model: 'claude-opus-4-6',
          max_tokens: 16_384,
          system: prompt.system,
          messages: [{ role: 'user', content: prompt.user }],
        });

        const response = await stream.finalMessage();
        const text = response.content
          .find(c => c.type === 'text')?.text ?? '[]';

        return JSON.parse(text) as RiskFinding[];
      })
    )
  );

  // Fan-in: collect fulfilled results, log failures
  const findings = results
    .filter(
      (r): r is PromiseFulfilledResult<RiskFinding[]> =>
        r.status === 'fulfilled'
    )
    .flatMap(r => r.value);

  const failures = results.filter(r => r.status === 'rejected');
  for (const failure of failures) {
    console.warn('Analyst failed:', (failure as PromiseRejectedResult).reason);
  }

  return {
    findings,
    successCount: results.length - failures.length,
    failureCount: failures.length,
  };
}
```

### Rate Limiting

There is a practical constraint to unbounded parallelism: API providers enforce rate limits. Anthropic caps the number of requests per minute and the number of tokens per minute. If you fire 158 requests simultaneously, many will bounce back with 429 (Too Many Requests) errors.

The solution is a concurrency limiter using a library like `p-limit`. It acts as a gate that allows at most *N* requests to be active at any given time. When a request completes, the gate opens for the next one in the queue. The total number of analysts can be arbitrarily large; the concurrency limit keeps the active request count within the provider's tolerances.

The beauty of this pattern is that the concurrency limit is the *only* change to the code. The `Promise.allSettled` call, the result filtering, the fan-in aggregation, everything else stays exactly the same. You are adding a throttle to the fan-out, not restructuring the pipeline.

### Progress Tracking with Server-Sent Events

When an analysis takes thirty seconds to four minutes, the user needs to know something is happening. Server-Sent Events (SSE) provide a lightweight mechanism for streaming progress updates from the server to the client. Each time a specialist completes, the server emits an event with the specialist name and result status. The frontend renders these as a live progress dashboard.

```typescript
// sse-progress-tracking.ts
// Stream real-time progress as each parallel specialist completes

import { Response } from 'express';

function initializeSSE(res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
}

function emitProgress(
  res: Response,
  analystName: string,
  status: 'fulfilled' | 'rejected',
  findingCount: number,
  completed: number,
  total: number
): void {
  const progress = {
    analyst: analystName,
    status,
    findingCount,
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
  res.write(`data: ${JSON.stringify(progress)}\n\n`);
}

// Usage in the parallel analysis round
async function runParallelWithProgress(
  analyzerSpecs: AnalyzerSpec[],
  contractText: string,
  playbook: string,
  res: Response,
  client: Anthropic
): Promise<RiskFinding[]> {
  initializeSSE(res);
  const limit = pLimit(10);
  let completed = 0;
  const total = analyzerSpecs.length;

  const results = await Promise.allSettled(
    analyzerSpecs.map(spec =>
      limit(async () => {
        const findings = await runSpecialist(spec, contractText, playbook, client);
        completed++;
        emitProgress(res, spec.name, 'fulfilled', findings.length, completed, total);
        return findings;
      })
    )
  );

  // Signal completion
  res.write(`data: ${JSON.stringify({ event: 'round-complete', completed: total })}\n\n`);

  return results
    .filter((r): r is PromiseFulfilledResult<RiskFinding[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
}
```

SSE transforms a blank loading screen into an engaging progress experience. The user sees "MAC/MAE Specialist: complete (12 findings)... IP Risk Specialist: complete (8 findings)... 75% done" in real time. This is not a cosmetic concern. In production, perceived performance is as important as actual performance. A 4-minute analysis with visible progress feels faster than a 2-minute analysis behind a spinning wheel.

### Fan-In: Deduplication and Conflict Resolution

After `Promise.allSettled` returns, the fan-in step collects results and prepares them for synthesis. When sixteen specialists analyze the same contract, overlap is inevitable and desirable. The MAC analyst and the closing conditions analyst will both flag the MAC definition. The termination rights specialist and the deal protection specialist will both address the termination fee. This overlap validates the findings (if two independent specialists flag the same issue, it is almost certainly real) but creates duplicates that must be resolved before synthesis.

```typescript
// fan-in-aggregation.ts
// Deduplicate findings from multiple specialists

function deduplicateFindings(findings: RiskFinding[]): RiskFinding[] {
  const seen = new Map<string, RiskFinding>();

  for (const finding of findings) {
    // Composite key: clause reference + risk category
    const key = `${finding.clauseRef}::${finding.category}`;
    const existing = seen.get(key);

    // Keep the higher-severity finding when duplicates exist
    if (!existing || severityRank(finding.severity) > severityRank(existing.severity)) {
      seen.set(key, finding);
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function severityRank(severity: string): number {
  const ranks: Record<string, number> = {
    critical: 4, high: 3, medium: 2, low: 1
  };
  return ranks[severity] ?? 0;
}
```

> **Key Concept: Graceful Degradation**
>
> In a legal context, partial results are always more valuable than total failure. If 15 of 16 specialists succeed, you get 15 analyses covering 15 risk domains. That is vastly more useful than zero analyses because one specialist timed out. `Promise.allSettled` guarantees graceful degradation. `Promise.all` guarantees catastrophic failure on any single error. Never use `Promise.all` for production legal AI.

**Key Takeaways**

- Parallel orchestration reduces wall-clock time from O(n) to O(1) without changing total compute cost.
- The rule: parallelize within a round (independent tasks), sequence between rounds (dependent tasks).
- `Promise.allSettled` is the only acceptable concurrency pattern. `Promise.all` discards all results if a single task fails.
- Concurrency limiters (`p-limit`) gate the fan-out to stay within API rate limits without changing pipeline structure.
- Fan-in requires deduplication and conflict resolution before synthesis can proceed.


---


## 4.5 The Six Orchestration Patterns

The Backautocrat/Diplomat architecture provides the building blocks. Sequential and parallel orchestration provide the two primitive arrangements. But production legal pipelines require more sophisticated coordination. This section presents six orchestration patterns adapted from Victor Dibia's taxonomy for multi-agent systems, mapped to specific legal workflows and illustrated with production TypeScript.

Dibia's framework, published in "Designing Multi-Agent Systems" (2025), identifies six structural patterns that describe how agents coordinate in production systems. The taxonomy is valuable because it provides names for arrangements that practitioners were already building intuitively. Before the taxonomy, a legal engineer might describe their pipeline as "a classifier that picks the right experts, then experts run at the same time, then a synthesizer merges their output." After the taxonomy, that same pipeline is described precisely as "Supervisor into Parallel Fan-Out/Fan-In into Sequential." The names compress paragraphs into phrases. They enable architects to communicate designs without ambiguity. And they provide a pattern library that new pipeline designers can consult instead of reinventing coordination strategies from first principles.

These six patterns are not mutually exclusive. Most production pipelines compose multiple patterns. The BitsBound redlining pipeline, for example, uses Pattern 3 (Supervisor) in Round 01 to route to the right specialists, Pattern 2 (Parallel Fan-Out/Fan-In) in Round 02 for specialist analysis, Pattern 2 again in Round 03 for research, and Pattern 1 (Sequential) for Rounds 04 through 06. Understanding the patterns individually is what enables you to compose them fluently. The patterns are the words. The pipeline design is the sentence. You must learn the words before you can write sentences.

### Pattern 1: Sequential Pipeline

The simplest pattern. A fixed-order chain where each Diplomat passes its typed output to the next. No branching, no parallelism, no conditional routing. The pipeline is a straight line.

**When to use:** When every stage depends on the prior stage's output and the processing order is known in advance.

**Legal workflows:**
- **Contract drafting:** Gather terms, draft sections sequentially, review, finalize
- **Obligation extraction:** Parse contract, identify obligation clauses, extract terms, format calendar entries
- **Research memo:** Receive question, decompose into sub-questions, research sequentially (each sub-question may refine the next), synthesize into memo

**Advantages:** Maximum predictability and debuggability. When stage 3 produces bad output, you know exactly what stage 2 gave it.

**Disadvantages:** Total time equals the sum of all stages. No opportunity for concurrent execution.

```typescript
// pattern-1-sequential.ts
// Obligation extraction: parse → identify → extract → format

async function extractObligations(
  contractText: string
): Promise<ObligationCalendar> {
  // Each stage feeds the next — strict sequential dependency
  const parsed     = await parseContract(contractText);
  const clauses    = await identifyObligationClauses(parsed);
  const obligations = await extractObligationTerms(clauses);
  const calendar   = await formatAsCalendar(obligations);

  return calendar;
}
```


### Pattern 2: Parallel Fan-Out / Fan-In

Multiple Diplomats process the same input simultaneously. A fan-out dispatcher launches all agents. A fan-in collector gathers results and passes them to a synthesis stage.

**When to use:** When multiple independent analyses can be performed on the same input.

**Legal workflows:**
- **Contract redlining:** 16 specialist analysts examine the same contract from 16 different perspectives simultaneously
- **Due diligence:** 200 documents classified and analyzed in parallel
- **Document triage:** 500 incoming documents classified simultaneously
- **Portfolio analytics:** 150 vendor contracts scanned for specific terms in parallel

**Advantages:** Wall-clock time equals the longest single agent, not the sum of all agents. For 16 agents at 30 seconds each, that is 30 seconds instead of 8 minutes.

**Disadvantages:** Higher peak resource consumption. Each agent gets a full copy of the input, which increases total token cost proportionally to the number of parallel agents.

<svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
  <defs>
    <marker id="arrow-p2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#16a085"/>
    </marker>
  </defs>
  <!-- Dispatcher -->
  <rect x="10" y="70" width="90" height="45" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="55" y="97" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">Dispatch</text>
  <!-- Workers -->
  <rect x="160" y="10" width="140" height="30" rx="5" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="230" y="30" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Specialist A</text>
  <rect x="160" y="50" width="140" height="30" rx="5" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="230" y="70" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Specialist B</text>
  <rect x="160" y="90" width="140" height="30" rx="5" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="230" y="110" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Specialist C</text>
  <rect x="160" y="130" width="140" height="30" rx="5" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="230" y="150" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Specialist N</text>
  <!-- Fan-out arrows -->
  <line x1="100" y1="82" x2="158" y2="30" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <line x1="100" y1="88" x2="158" y2="65" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <line x1="100" y1="93" x2="158" y2="105" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <line x1="100" y1="98" x2="158" y2="145" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <!-- Collector -->
  <rect x="370" y="70" width="90" height="45" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="415" y="97" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">Collect</text>
  <!-- Fan-in arrows -->
  <line x1="300" y1="30" x2="368" y2="82" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <line x1="300" y1="65" x2="368" y2="88" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <line x1="300" y1="105" x2="368" y2="93" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <line x1="300" y1="145" x2="368" y2="98" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow-p2)"/>
  <!-- Synthesize -->
  <line x1="460" y1="92" x2="508" y2="92" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-p2)"/>
  <rect x="510" y="70" width="100" height="45" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="560" y="97" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">Synthesize</text>
  <!-- Label -->
  <text x="350" y="192" text-anchor="middle" fill="#16a085" font-size="11" font-family="sans-serif" font-style="italic">Figure 4.3 — Pattern 2: Parallel Fan-Out/Fan-In</text>
</svg>


### Pattern 3: Supervisor (Router)

A central Diplomat examines the input and routes to the appropriate specialist panel. Different inputs activate different downstream agents. The Supervisor does not perform the analysis itself; it decides who should.

**When to use:** When different input types require different specialist configurations.

**Legal workflows:**
- **Contract intake routing:** An M&A agreement activates MAC, termination, deal protection specialists. A SaaS agreement activates SLA, data processing, IP assignment specialists. An employment agreement activates restrictive covenant, compensation, equity specialists.
- **Document triage:** Incoming email to general counsel is classified and routed to the appropriate practice group.
- **Multi-jurisdiction compliance:** Input is routed to jurisdiction-specific analysts based on governing law.

**The Supervisor is Pattern 3, not Pattern 1.** Although the Supervisor itself is a single sequential step, it is distinct from Pattern 1 because its purpose is *routing*, not *processing*. The Supervisor's output is a configuration that determines which agents run next, not a processed version of the input.

**Why the Supervisor exists.** Consider the alternative: deploying all specialists for all contract types on every input. A SaaS agreement does not need a MAC/MAE analyst, an earnout specialist, or a deal protection expert. An employment agreement does not need an escrow analyst or a regulatory antitrust specialist. Running irrelevant specialists wastes tokens, increases latency, and produces findings that are at best useless and at worst misleading (an earnout analyst reviewing a SaaS agreement may hallucinate earnout provisions that do not exist). The Supervisor ensures that every specialist deployed is relevant to the actual document.

In the CLE pipeline, the Supervisor (Round 01) processes 91,000 input tokens and generates just 174 output tokens in 7.1 seconds at a cost of $0.46. That $0.46 investment saves the pipeline from deploying irrelevant specialists that would collectively cost dollars and minutes. The Supervisor is the cheapest round in the pipeline and arguably the most important, because a misclassification cascades through every subsequent round.

```typescript
// pattern-3-supervisor.ts
// Contract intake routing: classify, then deploy the right specialist panel

interface SpecialistPanel {
  name: string;
  analysts: AnalyzerSpec[];
}

const specialistPanels: Record<string, SpecialistPanel> = {
  ma: {
    name: 'M&A Panel',
    analysts: [macAnalyst, terminationAnalyst, dealProtectionAnalyst,
               regulatoryAnalyst, indemnificationAnalyst, /* ... 11 more */]
  },
  saas: {
    name: 'SaaS Panel',
    analysts: [slaAnalyst, dataProcessingAnalyst, ipAssignmentAnalyst,
               liabilityCapAnalyst, terminationAnalyst, /* ... 11 more */]
  },
  employment: {
    name: 'Employment Panel',
    analysts: [restrictiveCovAnalyst, compensationAnalyst, equityAnalyst,
               terminationAnalyst, benefitsAnalyst, /* ... 11 more */]
  },
};

async function supervisorRoute(
  contractText: string,
  userInstruction: string
): Promise<SpecialistPanel> {
  // The Supervisor classifies the contract type
  const classification = await classifyContract(contractText, userInstruction);

  // Route to the appropriate specialist panel
  const panel = specialistPanels[classification.contractType];
  if (!panel) {
    throw new Error(`No specialist panel for type: ${classification.contractType}`);
  }

  console.log(`Routing to ${panel.name} (${panel.analysts.length} specialists)`);
  return panel;
}
```

<svg viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
  <defs>
    <marker id="arrow-p3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#16a085"/>
    </marker>
    <marker id="arrow-p3a" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#f39c12"/>
    </marker>
  </defs>
  <!-- Input -->
  <rect x="10" y="95" width="90" height="45" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="55" y="122" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">Contract</text>
  <!-- Supervisor -->
  <line x1="100" y1="117" x2="148" y2="117" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-p3)"/>
  <rect x="150" y="95" width="110" height="45" rx="6" fill="#1a1a2e" stroke="#e74c3c" stroke-width="2"/>
  <text x="205" y="115" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">Supervisor</text>
  <text x="205" y="130" text-anchor="middle" fill="#e74c3c" font-size="9" font-family="sans-serif">(Router)</text>
  <!-- Route arrows -->
  <line x1="260" y1="105" x2="328" y2="40" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrow-p3a)"/>
  <line x1="260" y1="117" x2="328" y2="117" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow-p3a)"/>
  <line x1="260" y1="130" x2="328" y2="195" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrow-p3a)"/>
  <!-- Panels -->
  <rect x="330" y="18" width="170" height="40" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="415" y="43" text-anchor="middle" fill="#f39c12" font-size="10" font-family="sans-serif">M&A Panel (16 agents)</text>
  <rect x="330" y="97" width="170" height="40" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="415" y="122" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">SaaS Panel (16 agents)</text>
  <rect x="330" y="177" width="170" height="40" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="415" y="202" text-anchor="middle" fill="#f39c12" font-size="10" font-family="sans-serif">Employment Panel (16 agents)</text>
  <!-- Active indicator -->
  <text x="280" y="112" text-anchor="middle" fill="#f39c12" font-size="18" font-family="sans-serif">&#x2713;</text>
  <!-- Label -->
  <text x="350" y="235" text-anchor="middle" fill="#16a085" font-size="11" font-family="sans-serif" font-style="italic">Figure 4.4 — Pattern 3: Supervisor (Router) selects the specialist panel based on input type</text>
</svg>


### Pattern 4: Plan-Based

A planning Diplomat examines the input, creates a step-by-step execution plan, and then executes each step. Critically, the planner can *replan* mid-execution if a step fails or produces unexpected results. This is the most adaptive pattern and the most complex to implement.

**When to use:** When the processing path cannot be determined in advance because each step may change what the next step should be.

**Legal workflows:**
- **Complex legal research:** "Research whether our client's non-compete is enforceable in Texas" requires searching for relevant statutes, which reveals that Texas recently reformed its non-compete law, which requires researching the new standard, which requires checking whether the client's agreement was signed before or after the effective date. Each step determines the next.
- **M&A due diligence with red flags:** Initial classification reveals an unusual corporate structure, which triggers additional analysis of subsidiary arrangements, which reveals potential change-of-control issues in third-party contracts.
- **Regulatory investigation response:** Initial document review reveals a pattern of communications that requires deeper investigation into a specific time period, which surfaces additional custodians whose documents must also be reviewed.

```typescript
// pattern-4-plan-based.ts
// Plan-based legal research: plan, execute, replan if needed

interface ResearchPlan {
  steps: ResearchStep[];
  hypothesis: string;
  expectedOutcome: string;
}

interface ResearchStep {
  stepNumber: number;
  action: 'search' | 'analyze' | 'compare' | 'verify';
  query: string;
  dependsOn: number[];  // Which prior steps must complete first
  rationale: string;
}

async function planBasedResearch(
  question: string,
  client: Anthropic
): Promise<ResearchMemo> {
  // Step 1: The Planner creates an initial research plan
  let plan = await createResearchPlan(question, client);
  const findings: ResearchFinding[] = [];

  // Step 2: Execute each step, allowing replanning
  for (const step of plan.steps) {
    const result = await executeResearchStep(step, findings, client);
    findings.push(result);

    // Step 3: Check if findings require replanning
    if (result.requiresReplan) {
      const remainingSteps = plan.steps.filter(
        s => s.stepNumber > step.stepNumber
      );
      plan = await replan(question, findings, remainingSteps, client);
    }
  }

  // Step 4: Synthesize all findings into a research memo
  const memo = await synthesizeResearchMemo(question, findings, client);
  return memo;
}
```

**Advantages:** Maximum adaptability. The pipeline discovers the right approach as it goes, mirroring how a human researcher works.

**Disadvantages:** Unpredictable latency and cost. You cannot tell the user in advance how long the research will take or how much it will cost, because the plan may change mid-execution.


### Pattern 5: Handoff

One Diplomat works until it reaches the boundary of its expertise, then hands off to a more specialized Diplomat. The handoff carries context: everything the first Diplomat learned is passed to the next so it does not repeat work. This pattern creates a graduated expertise chain.

**When to use:** When a task requires progressively deeper expertise, and deploying the deepest expert on every input would be wasteful.

**Legal workflows:**
- **Privilege screening:** A general classifier scans all documents, identifies potentially privileged documents (presence of attorney names, legal advice keywords), hands those to a privilege specialist for detailed analysis, which hands uncertain determinations to attorney review. Only 5% of documents reach the attorney, but every privileged document is caught.
- **Contract risk triage:** A fast classifier identifies high-risk clauses. Only those clauses are handed to a detailed risk analyzer. Only critical findings are handed to a remediation specialist. Each handoff narrows the scope and deepens the analysis.
- **Regulatory compliance screening:** A general scanner checks all communications for potential regulatory issues. Flagged items are handed to a regulation-specific analyst (FINRA, HIPAA, GDPR). Items that analyst cannot resolve are handed to domain counsel.

```typescript
// pattern-5-handoff.ts
// Privilege screening: general → specialist → attorney review

interface HandoffResult<T> {
  resolved: T[];          // Items fully processed at this level
  escalated: T[];         // Items that need deeper analysis
  escalationReason: string[];
}

async function privilegeScreening(
  documents: Document[]
): Promise<PrivilegeDecision[]> {
  // Level 1: General classifier (fast, cheap, catches obvious cases)
  const level1 = await generalPrivilegeClassifier(documents);
  const decisions: PrivilegeDecision[] = level1.resolved;

  // Level 2: Specialist analysis (only for flagged documents)
  if (level1.escalated.length > 0) {
    const level2 = await privilegeSpecialist(level1.escalated);
    decisions.push(...level2.resolved);

    // Level 3: Attorney review (only for uncertain determinations)
    if (level2.escalated.length > 0) {
      // Queue for human review — pipeline pauses here
      await queueForAttorneyReview(level2.escalated, level2.escalationReason);
    }
  }

  return decisions;
}
```

<svg viewBox="0 0 750 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
  <defs>
    <marker id="arrow-p5" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#16a085"/>
    </marker>
    <marker id="arrow-p5e" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#e74c3c"/>
    </marker>
  </defs>
  <!-- All Docs -->
  <rect x="10" y="50" width="100" height="45" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="60" y="70" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">All Docs</text>
  <text x="60" y="85" text-anchor="middle" fill="#f39c12" font-size="9" font-family="sans-serif">(10,000)</text>
  <!-- Level 1 -->
  <line x1="110" y1="72" x2="148" y2="72" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-p5)"/>
  <rect x="150" y="50" width="120" height="45" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="210" y="70" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">General Classifier</text>
  <text x="210" y="85" text-anchor="middle" fill="#f39c12" font-size="9" font-family="sans-serif">95% resolved</text>
  <!-- Level 2 -->
  <line x1="270" y1="72" x2="328" y2="72" stroke="#e74c3c" stroke-width="2" marker-end="url(#arrow-p5e)"/>
  <text x="299" y="62" text-anchor="middle" fill="#e74c3c" font-size="8" font-family="sans-serif">5%</text>
  <rect x="330" y="50" width="130" height="45" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="395" y="70" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Privilege Specialist</text>
  <text x="395" y="85" text-anchor="middle" fill="#f39c12" font-size="9" font-family="sans-serif">80% resolved</text>
  <!-- Level 3 -->
  <line x1="460" y1="72" x2="518" y2="72" stroke="#e74c3c" stroke-width="2" marker-end="url(#arrow-p5e)"/>
  <text x="489" y="62" text-anchor="middle" fill="#e74c3c" font-size="8" font-family="sans-serif">1%</text>
  <rect x="520" y="50" width="130" height="45" rx="6" fill="#1a1a2e" stroke="#e74c3c" stroke-width="2"/>
  <text x="585" y="70" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">Attorney Review</text>
  <text x="585" y="85" text-anchor="middle" fill="#e74c3c" font-size="9" font-family="sans-serif">100 docs</text>
  <!-- Label -->
  <text x="375" y="130" text-anchor="middle" fill="#16a085" font-size="11" font-family="sans-serif" font-style="italic">Figure 4.5 — Pattern 5: Handoff narrows scope at each level, deepening expertise</text>
</svg>


### Pattern 6: Conversation-Driven (Adversarial)

Two or more Diplomats engage in multi-turn dialogue, challenging and refining each other's output. One Diplomat proposes. Another critiques. The proposer revises. The critic re-evaluates. The loop continues until both Diplomats converge on a position or reach a maximum iteration count.

**When to use:** When the task benefits from internal debate, quality control, or the exploration of competing perspectives.

**Legal workflows:**
- **Contract redlining quality control:** A drafting Diplomat proposes redline language. A validation Diplomat checks whether the proposed language is consistent with the playbook, internally coherent, and legally sound. If the validator identifies issues, the drafter revises. They iterate until the validator approves.
- **Negotiation strategy:** A "buyer's counsel" agent argues for buyer-favorable positions. A "seller's counsel" agent argues for seller-favorable positions. A synthesis agent identifies the positions where each side has the strongest case and recommends a negotiation strategy.
- **Legal research verification:** A research agent produces a memo. A verification agent checks every citation, challenges every conclusion, and identifies gaps. The research agent addresses the challenges and strengthens the memo.

```typescript
// pattern-6-adversarial.ts
// Adversarial validation: drafter proposes, validator challenges, they iterate

interface AdversarialRound {
  roundNumber: number;
  proposal: string;
  critique: string;
  isApproved: boolean;
}

async function adversarialRedline(
  clause: string,
  playbook: Playbook,
  maxRounds: number = 3,
  client: Anthropic
): Promise<{ finalLanguage: string; rounds: AdversarialRound[] }> {
  const rounds: AdversarialRound[] = [];
  let currentProposal = '';

  for (let i = 1; i <= maxRounds; i++) {
    // Drafter proposes (or revises based on prior critique)
    const priorCritique = rounds.length > 0
      ? rounds[rounds.length - 1].critique
      : null;

    currentProposal = await drafterDiplomat(
      clause, playbook, priorCritique, client
    );

    // Validator critiques the proposal
    const critique = await validatorDiplomat(
      clause, currentProposal, playbook, client
    );

    const isApproved = critique.verdict === 'approved';
    rounds.push({
      roundNumber: i,
      proposal: currentProposal,
      critique: critique.feedback,
      isApproved,
    });

    // If the validator approves, stop iterating
    if (isApproved) break;
  }

  return { finalLanguage: currentProposal, rounds };
}
```

**Advantages:** Produces higher-quality output through iterative refinement. The adversarial dynamic catches errors, gaps, and inconsistencies that a single-pass Diplomat would miss.

**Disadvantages:** Unpredictable latency (the loop may run 1 round or the maximum). Higher cost (each round is two API calls). Requires careful convergence criteria to prevent infinite loops.

> **Insight: Adversarial Patterns Are Expensive but Powerful**
>
> The conversation-driven pattern is the most expensive per-task pattern because each iteration costs two API calls. Reserve it for high-stakes decisions where the cost of an error exceeds the cost of the additional calls. A termination fee in a $4.75 billion merger justifies adversarial validation. A boilerplate notice provision does not. Match pattern complexity to the stakes.

### Summary of the Six Patterns

| Pattern | Structure | When to Use | Legal Example |
|---------|-----------|-------------|---------------|
| **1. Sequential** | A, B, C | Stage dependencies | Drafting: gather, draft, review, finalize |
| **2. Parallel Fan-Out/Fan-In** | A, [B1...Bn], C | Independent analyses | 16 specialist analysts on one contract |
| **3. Supervisor (Router)** | Router, {Panel A or B or C} | Input-dependent routing | M&A vs SaaS vs Employment specialists |
| **4. Plan-Based** | Planner, execute, replan | Unknown processing path | Complex research with evolving questions |
| **5. Handoff** | Generalist, Specialist, Expert | Graduated expertise | Privilege screening: classifier, specialist, attorney |
| **6. Conversation-Driven** | Proposer, Critic (loop) | Quality control via debate | Redline drafting with playbook validation |

**Key Takeaways**

- The six patterns are composable building blocks, not mutually exclusive categories.
- Most production pipelines combine multiple patterns. Learn to identify which pattern governs each stage.
- Pattern selection depends on the task's dependency structure, the stakes, and the cost/latency budget.
- Sequential is the safe default. Parallel is the performance optimization. Supervisor, Plan-Based, Handoff, and Adversarial are structural choices driven by workflow requirements.


---


## 4.6 Human-in-the-Loop as a Cross-Cutting Pattern

Human-in-the-Loop (HITL) is not a seventh orchestration pattern. It is a cross-cutting concern that can be inserted into any of the six patterns at any stage. A sequential pipeline can pause at Stage 3 for attorney review. A parallel fan-out can route specific findings to attorney review based on confidence scores. An adversarial loop can escalate to an attorney when the drafter and validator cannot converge. HITL is the checkpoint layer, not the orchestration layer.

### Why HITL Is Legally Required

Four categories of professional obligation require human oversight of AI-generated legal work product:

**Attorney Supervision (Rules 5.1, 5.3).** The Model Rules of Professional Conduct require partners to make reasonable efforts to ensure that all lawyers and nonlawyer assistants in the firm conform to the Rules. An AI pipeline is a nonlawyer assistant. Its output must be supervised the same way a paralegal's work product is supervised: reviewed, verified, and approved by a licensed attorney before it reaches the client or opposing counsel.

**Privilege Determinations.** Attorney-client privilege is a legal conclusion that requires human judgment. An AI can flag a document as potentially privileged (attorney names in the header, legal advice in the body, confidentiality markers present). But the legal determination, whether the communication was made for the purpose of obtaining legal advice and was intended to be confidential, is the attorney's call. An AI that makes privilege determinations without attorney oversight creates a waiver risk.

**Work Product Approval.** Every piece of work product that leaves the firm (a redlined contract, a research memo, a compliance assessment) must be reviewed and approved by a licensed attorney. The pipeline produces a draft. The attorney produces the final. This is not a limitation of the technology. It is a professional requirement that would apply equally if the draft were produced by a first-year associate.

**Regulatory Requirements.** Certain jurisdictions and practice areas impose additional oversight requirements. Financial services (FINRA), healthcare (HIPAA), and government contracts each have specific rules about how automated analysis must be supervised. A pipeline deployed in these contexts must be designed with those requirements built in, not bolted on.

### Four HITL Implementation Patterns

HITL can be implemented in four ways, each appropriate for different stages of a pipeline:

**Gate.** The pipeline pauses at a designated stage. The attorney receives the pipeline's output so far, reviews it, approves it, modifies it, or rejects it. The pipeline resumes with the attorney's decision incorporated. This is the strongest form of oversight and the most disruptive to pipeline speed.

```typescript
// hitl-gate.ts
// Pipeline pauses for attorney review before generating deliverables

async function pipelineWithGate(
  contractText: string,
  playbook: Playbook
): Promise<Deliverables> {
  // Stages 1-4 run automatically
  const classification = await classifyContract(contractText);
  const findings = await runParallelAnalysis(contractText, playbook);
  const research = await runParallelResearch(findings);
  const directives = await synthesize(findings, research);

  // === GATE: Pipeline pauses here ===
  // Directives are presented to the attorney for review
  const attorneyApproved = await presentForReview(directives);
  // Attorney may modify, add, or remove directives
  const finalDirectives = attorneyApproved.modifiedDirectives;

  // Stages 5-6 execute with attorney-approved directives
  const ooxml = await translateToOOXML(finalDirectives);
  const document = await applyToDocument(ooxml, contractText);

  return document;
}
```

**Review Loop.** The pipeline runs to completion. The attorney reviews the output. If modifications are needed, the pipeline reruns affected stages with the attorney's corrections. This is less disruptive than a gate because the pipeline produces a complete draft before the attorney intervenes.

**Escalation.** The pipeline processes normally unless a confidence score falls below a threshold. Low-confidence items are escalated to the attorney; high-confidence items pass through automatically. This is the most efficient pattern because it focuses attorney attention on the items that most need it.

```typescript
// hitl-escalation.ts
// Only escalate findings below a confidence threshold

interface ScoredFinding extends RiskFinding {
  confidence: number;  // 0.0 to 1.0
}

async function escalationFilter(
  findings: ScoredFinding[],
  threshold: number = 0.85
): Promise<{
  autoApproved: ScoredFinding[];
  needsReview: ScoredFinding[];
}> {
  const autoApproved = findings.filter(f => f.confidence >= threshold);
  const needsReview = findings.filter(f => f.confidence < threshold);

  if (needsReview.length > 0) {
    console.log(
      `Escalating ${needsReview.length} of ${findings.length} findings ` +
      `(${Math.round(needsReview.length / findings.length * 100)}%) to attorney review`
    );
  }

  return { autoApproved, needsReview };
}
```

**Audit Trail.** The pipeline runs to completion, but every decision, every intermediate output, and every confidence score is logged. The attorney reviews the audit trail post-completion. This is the least disruptive pattern and the most appropriate for high-volume, lower-stakes workflows where reviewing every item individually is impractical.

### Design Principle: Maximize the Value of Attorney Time

The purpose of HITL is not to slow the pipeline down. It is to focus attorney attention on the decisions that most benefit from human judgment. A well-designed HITL system presents the highest-impact decisions first: the findings with the lowest confidence scores, the clauses with the highest deal impact, the cross-references that could not be resolved. The attorney's role shifts from "build from scratch" to "review and refine."

Consider the numbers from the CLE experiment. The pipeline produced 138 track changes. If the attorney must review each one, that is still dramatically faster than producing 138 track changes from scratch. But a well-designed escalation system might auto-approve the 100 highest-confidence changes and present only the 38 that need human judgment. The attorney reviews 38 items instead of starting from zero. That is the efficiency gain that HITL preserves while maintaining professional responsibility.

### The Economics of Attorney Oversight

Think about HITL in economic terms. At a large firm, a senior associate's time costs $400 to $600 per hour. In a traditional workflow, that associate spends 30 to 40 hours on a first-pass review of a complex M&A agreement, most of which is analytical grunt work: identifying defined terms, checking cross-references, comparing against market standard. The pipeline does that work in 22 minutes for $19.95. The associate's time is now focused exclusively on judgment: evaluating the pipeline's recommendations, modifying where their experience suggests a different approach, and approving the final work product. If the escalation filter reduces the review set from 138 items to 38, the associate reviews those 38 items in perhaps 2 hours rather than spending 30 hours building from scratch. The firm captures the same value with 93% less attorney time.

This is not about replacing the attorney. It is about redeploying the attorney's time from low-judgment tasks (finding the issues) to high-judgment tasks (deciding what to do about them). HITL is the mechanism that makes this redeployment architecturally explicit. Without a deliberate HITL design, the attorney either reviews everything (negating the efficiency gain) or reviews nothing (creating professional responsibility risk). HITL provides the middle path: review the decisions that matter most, trust the pipeline for the decisions it handles reliably.

### HITL Across the Pattern Taxonomy

Each orchestration pattern creates different opportunities for HITL insertion:

| Pattern | Typical HITL Insertion Point | Implementation |
|---------|------------------------------|----------------|
| Sequential (1) | Between analysis and deliverable generation | Gate before Stage 5 |
| Parallel Fan-Out (2) | After synthesis, before output | Escalation on low-confidence findings |
| Supervisor (3) | After classification, before specialist deployment | Gate if classification is uncertain |
| Plan-Based (4) | After each plan step, before replanning | Review Loop per step |
| Handoff (5) | At the final handoff level | Gate at the boundary where AI confidence falls below threshold |
| Adversarial (6) | When adversarial loop does not converge | Escalation after max iterations reached |

> **Warning: HITL Must Be Designed In, Not Bolted On**
>
> The worst HITL implementation is a checkbox at the end of the pipeline: "Attorney reviewed? Yes/No." This provides no meaningful oversight because the attorney has no context about which decisions were uncertain, which findings conflicted, or which stages produced low-confidence output. Design HITL into the pipeline from the beginning, with confidence scores, escalation criteria, and audit trails that give the attorney the information they need to exercise genuine judgment.

**Key Takeaways**

- HITL is a cross-cutting concern, not a seventh orchestration pattern. It can be inserted into any of the six patterns at any stage.
- Four implementation patterns: Gate (strongest oversight), Review Loop (complete draft first), Escalation (confidence-based filtering), Audit Trail (post-completion review).
- Professional obligations (Rules 5.1, 5.3) require attorney supervision of AI output. HITL is how you satisfy that obligation architecturally.
- Design HITL to maximize the value of attorney time by presenting the highest-impact decisions first.
- A pipeline with well-designed HITL is not slower than manual work. It is faster because the attorney reviews AI-generated output instead of building from scratch.


---


## 4.7 Multi-Pass Architecture: The Evidence for Diminishing Returns

Every additional pass through a pipeline adds three things: quality improvement, token cost, and latency. The question is not whether multiple passes improve output. That question was settled by the CLE experiment: the same model went from 35 track changes in a single pass to 138 in a 6-round pipeline. The question is *when does adding another pass stop justifying its cost?*

TLE R&D has produced empirical evidence across multiple workflows that answers this question. The findings are consistent and, in one case, counterintuitive.

### Experiment 01: Contract Drafting — "Does Multi-Pass Actually Matter?"

Three pipeline variations, all using Claude Opus, all processing the same contract, scored by the same independent Opus scorer against a 100-point rubric:

| Variation | Architecture | Diplomats | Quality Score |
|-----------|-------------|-----------|---------------|
| Single Author | 1-pass | One Claude call: full context in, draft out | Baseline |
| Author-Then-Enhancer | 2-pass | Draft, then review and enhance | Baseline + 3-5 pts |
| Drafter-Editors-Author | Multi-pass | Draft, 10 parallel editors, final author | Baseline + 4-8 pts |

**Finding:** The biggest quality jump was from one pass to two passes. The Author-Then-Enhancer (2-pass) consistently outscored the Single Author (1-pass) by 3 to 5 points on a 100-point rubric. Adding ten parallel editors and a final author (multi-pass) produced an additional 1 to 3 points of improvement over the 2-pass variation, at significantly higher cost.

**Implication:** The first review pass is the highest-ROI architectural decision. Adding a Diplomat that critiques the initial draft catches the most impactful errors. Subsequent passes produce diminishing returns that are real but smaller.

### Experiment 03: Legal Research — "Does Parallelization Without Synthesis Help?"

Three variations, same model, same legal research question:

| Variation | Architecture | Score |
|-----------|-------------|-------|
| Single Researcher | 1 Claude call | 73 / 100 |
| Prompter-Researchers (parallel, no synthesis) | 5 parallel calls | 60.5 / 100 |
| Prompter-Researchers-Synthesizer | 6 calls (5 parallel + 1 synthesis) | 77 / 100 |

**Finding:** Parallelization without synthesis scored *worse* than single-pass. Five parallel research agents, each pursuing different angles of the same legal question, produced five overlapping memos with conflicting conclusions and unverified citations. Without a synthesis Diplomat to merge, resolve, and prioritize, the output was less coherent and less usable than a single well-structured response. The scorer penalized the unsynthesized output for redundancy, inconsistency, and "plausible but unverifiable" authorities that amounted to hallucinations.

Adding synthesis (Variation 3) recovered the quality and exceeded single-pass by 4 points. The synthesis Diplomat deduplicated the overlapping research, resolved the conflicting conclusions by weighing source quality, and flagged authorities it could not verify. The output was a single coherent memo rather than five competing ones.

**Implication:** More agents is not automatically better. Architecture matters more than agent count. Five uncoordinated agents produce chaos. Five coordinated agents with a synthesis layer produce excellence. The synthesis Diplomat is not optional in any parallel pipeline. This finding was counterintuitive enough to change how we design every pipeline: the synthesis stage is now treated as architecturally mandatory, not as an optional enhancement.

### The CLE Evidence: 27 Agents, 3.9x Coverage

The CLE experiment provided the most dramatic evidence for multi-pass architecture. The same Claude Opus model analyzing the same 42,274-word Meridian-Apex merger agreement:

| Metric | Single Pass (Claude.ai) | 6-Round Pipeline (27 agents) | Delta |
|--------|------------------------|------------------------------|-------|
| Track Changes | 35 | 138 | 3.9x |
| Insertions | 20 | 69 | 3.5x |
| Deletions | 15 | 69 | 4.6x |
| Words modified | 1,333 | 6,852 | 5.1x |
| Legal citations | 0 | 18 | (not comparable) |
| Drafting errors caught | 2 | 28 | 14x |
| Explanatory comments | 20 | 69 | 3.5x |
| Cost | ~$0.75 | $19.95 | 26.6x |
| Time | ~3 minutes | 21.8 minutes | 7.3x |

The pipeline costs 26 times more per run. But it produces 3.9 times more coverage and catches 14 times more drafting errors. On a per-finding basis, the pipeline costs $0.14 per track change. The single pass costs $0.02 per track change. The pipeline is more expensive per unit, but the units it produces are qualitatively different: they include citations, quantitative market data, and specific replacement language.

On a $4.75 billion merger agreement, the ROI calculation is trivial. Twenty-eight drafting errors caught versus two. Each of those 26 additional errors, including a broken cross-reference that rendered the tender offer conditions arguably unenforceable and an Outside Date that violated SEC Rule 14e-1(a), represents real exposure that would cost orders of magnitude more to litigate than the $19.95 pipeline run.

### The Diminishing Returns Curve

The evidence across experiments produces a consistent pattern:

<svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
  <!-- Axes -->
  <line x1="80" y1="260" x2="550" y2="260" stroke="#16a085" stroke-width="2"/>
  <line x1="80" y1="260" x2="80" y2="30" stroke="#16a085" stroke-width="2"/>
  <!-- Y-axis label -->
  <text x="25" y="150" text-anchor="middle" fill="#16a085" font-size="12" font-family="sans-serif" transform="rotate(-90, 25, 150)">Quality Score</text>
  <!-- X-axis label -->
  <text x="315" y="295" text-anchor="middle" fill="#16a085" font-size="12" font-family="sans-serif">Pipeline Passes</text>
  <!-- Grid lines -->
  <line x1="80" y1="60" x2="550" y2="60" stroke="#1a1a2e" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="80" y1="110" x2="550" y2="110" stroke="#1a1a2e" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="80" y1="160" x2="550" y2="160" stroke="#1a1a2e" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="80" y1="210" x2="550" y2="210" stroke="#1a1a2e" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- X tick labels -->
  <text x="130" y="278" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">1</text>
  <text x="210" y="278" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">2</text>
  <text x="290" y="278" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">3</text>
  <text x="370" y="278" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">4-5</text>
  <text x="450" y="278" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">6+</text>
  <text x="530" y="278" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">N+swarm</text>
  <!-- Quality curve -->
  <path d="M 130 220 Q 170 140, 210 120 Q 250 105, 290 95 Q 340 85, 370 80 Q 420 76, 450 74 Q 490 72, 530 71" fill="none" stroke="#f39c12" stroke-width="3"/>
  <!-- Data points -->
  <circle cx="130" cy="220" r="5" fill="#f39c12"/>
  <circle cx="210" cy="120" r="5" fill="#f39c12"/>
  <circle cx="290" cy="95" r="5" fill="#f39c12"/>
  <circle cx="370" cy="80" r="5" fill="#f39c12"/>
  <circle cx="450" cy="74" r="5" fill="#f39c12"/>
  <circle cx="530" cy="71" r="5" fill="#f39c12"/>
  <!-- Cost curve -->
  <path d="M 130 240 L 210 225 L 290 200 L 370 160 L 450 110 L 530 50" fill="none" stroke="#e74c3c" stroke-width="2" stroke-dasharray="6,3"/>
  <!-- Annotations -->
  <text x="200" y="108" text-anchor="end" fill="#f39c12" font-size="10" font-family="sans-serif" font-weight="bold">Biggest jump</text>
  <text x="440" y="60" text-anchor="end" fill="#e74c3c" font-size="10" font-family="sans-serif">Cost (linear)</text>
  <text x="520" y="62" text-anchor="start" fill="#f39c12" font-size="10" font-family="sans-serif">Quality (logarithmic)</text>
  <!-- Sweet spot bracket -->
  <rect x="190" y="85" width="120" height="25" rx="3" fill="none" stroke="#16a085" stroke-width="1.5" stroke-dasharray="4,2"/>
  <text x="250" y="78" text-anchor="middle" fill="#16a085" font-size="9" font-family="sans-serif" font-weight="bold">SWEET SPOT</text>
  <!-- Title -->
  <text x="315" y="325" text-anchor="middle" fill="#16a085" font-size="11" font-family="sans-serif" font-style="italic">Figure 4.6 — Diminishing Returns: quality improves logarithmically while cost increases linearly</text>
</svg>

Quality improvement is logarithmic: steep at first, then flattening. Cost is linear: each additional pass adds roughly the same token expense. The optimal number of passes is where the quality curve's slope drops below the cost curve's slope. For most legal workflows, that sweet spot is two to three sequential passes plus one parallel specialist round.

### Practical Guidelines

| Document Type | Recommended Passes | Rationale |
|--------------|-------------------|-----------|
| Simple NDA | 1-2 | Low risk, short document, limited clause variety |
| SaaS Agreement | 2-3 + parallel specialists | Moderate risk, 16+ clause domains, benefits from specialization |
| M&A Purchase Agreement | 4-6 rounds + parallel specialists + research | High risk, long document, complex cross-references, case law needed |
| Due Diligence (portfolio) | 1-2 per document + parallel across documents | Volume demands efficiency; depth per document is moderate |
| Litigation Privilege Review | 2-3 per document (classifier + specialist + escalation) | Privilege errors are catastrophic; false negatives must be near zero |

The right number of passes depends on the consequences of getting it wrong. An NDA review where the worst case is a mild business disagreement warrants two passes. An M&A purchase agreement where the worst case is a multi-billion-dollar dispute warrants six. Match pipeline depth to the stakes.

> **Practice Tip: The Three-Pass Sweet Spot**
>
> For most legal workflows, three sequential passes hit the optimal balance: (1) a specialist Diplomat that produces the initial analysis or draft, (2) a reviewer Diplomat that critiques and identifies gaps, and (3) a final author Diplomat that synthesizes everything into the deliverable. This draft-review-synthesize pattern is the backbone of production legal engineering.

**Key Takeaways**

- The biggest quality jump is from one pass to two passes. Adding a review stage after the initial draft is the single highest-ROI architectural decision.
- Parallelization without synthesis is worse than single-pass. The synthesis Diplomat is mandatory in any parallel pipeline.
- Quality improvement is logarithmic; cost is linear. The sweet spot is where the quality curve flattens relative to the cost curve.
- Three to five sequential passes hit the sweet spot for most legal workflows. Beyond six, marginal returns flatten unless you are adding parallel specialists.
- Match pipeline depth to stakes: two passes for an NDA, three for a SaaS agreement, six or more for M&A.


---


## 4.8 Agent-to-Agent (A2A) Interoperability

Every pattern discussed so far assumes a closed system: all Diplomats run within a single organization's pipeline, orchestrated by a single Backautocrat, using a single AI provider. This is the reality of legal AI today. But it will not be the reality for long.

Consider a complex M&A transaction. The buyer's outside counsel has a redlining pipeline. The seller's outside counsel has a different pipeline. In-house counsel on both sides may have their own analysis tools. The investment bank has a due diligence platform. The regulatory advisors have compliance screening systems. Today, the output of each system is a Word document emailed to the next party. Tomorrow, these systems will need to communicate directly.

### What A2A Is

Google's Agent-to-Agent (A2A) protocol provides a standard for agent communication across organizational boundaries. Where the Model Context Protocol (MCP) connects agents to tools and data sources, A2A connects agents to other agents. They are complementary, not competitive: MCP gives your agent access to Westlaw. A2A gives your agent access to your counterparty's agent.

The protocol was donated to the Linux Foundation's Agentic AI Foundation in 2025, with over 50 technology partners supporting its development. It is an open standard built on familiar web infrastructure.

### Core Architecture

A2A defines four concepts:

**Agent Cards.** JSON metadata describing an agent's capabilities and endpoints. An agent card is the equivalent of a business card for a software agent: it tells other agents what this agent can do, how to talk to it, and what authentication it requires.

```typescript
// agent-card.ts
// A2A Agent Card for a TLE contract analysis pipeline

interface A2AAgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  authentication: {
    schemes: string[];
  };
  skills: A2ASkill[];
}

const tleAnalysisAgent: A2AAgentCard = {
  name: 'TLE Contract Analysis Agent',
  description: 'Analyzes contracts using 16 parallel specialists with research',
  url: 'https://api.taylorlegalengineering.com/a2a',
  version: '1.0.0',
  capabilities: {
    streaming: true,
    pushNotifications: true,
    stateTransitionHistory: true,
  },
  authentication: {
    schemes: ['OAuth2', 'APIKey'],
  },
  skills: [
    {
      id: 'contract-redline',
      name: 'Contract Redlining',
      description: 'Full 6-round analysis with Track Changes output',
      inputFormats: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      outputFormats: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Risk scoring with severity ratings and recommendations',
      inputFormats: ['text/plain', 'application/json'],
      outputFormats: ['application/json'],
    },
  ],
};
```

**Tasks.** Stateful work units with a defined lifecycle: submitted, working, input-required, completed, or failed. The requesting agent submits a task, receives a task ID, and can poll for status or receive push notifications.

**Messages and Artifacts.** The content exchanged between agents. Messages are conversational (agent-to-agent dialogue). Artifacts are the deliverables (the redlined document, the risk assessment, the research memo).

**Transport.** HTTP + JSON-RPC 2.0 for request/response. Server-Sent Events for streaming updates. Standard web protocols that every legal IT department already supports.

### Legal Applications

A2A enables four categories of cross-organizational agent communication that are directly relevant to legal practice:

**Cross-Firm Document Review.** Outside counsel's redlining agent analyzes a contract and produces directives. Instead of emailing a Word document, the agent sends the directives via A2A to in-house counsel's review agent, which evaluates the proposed changes against the company's internal playbook. In-house counsel's agent returns its assessment: approved, modified, or rejected per directive. The cycle completes in minutes instead of days.

**Multi-Vendor Integration.** A contract management agent extracts obligations from executed agreements. Via A2A, it communicates those obligations to an e-billing agent (for budgeting milestone payments), a compliance agent (for regulatory deadline tracking), and a calendar agent (for renewal date alerts). Each downstream agent receives structured data, not PDF attachments that require manual extraction.

**Client-Facing Interfaces.** A law firm's research agent exposes a skill via A2A that the client's in-house AI can query: "What is the current Delaware standard for MAC carve-outs?" The firm's agent conducts the research and returns a structured response. The client's system integrates the answer into its own workflow. The billable event is the A2A task, not an email chain.

**Multi-Party Transactions.** In a complex transaction with multiple parties, each party's pipeline communicates via A2A during negotiation. Party A's agent proposes redlines. Party B's agent evaluates them against Party B's playbook and responds with counter-proposals. A mediating agent tracks the negotiation state and identifies areas of convergence and remaining disputes.

### Implementing A2A: A Cross-Firm Redline Exchange

To make the cross-firm use case concrete, here is a simplified implementation of an A2A task handler that receives a redline request from another organization's agent:

```typescript
// a2a-task-handler.ts
// Handle incoming A2A tasks from external agents

interface A2ATask {
  id: string;
  skill: string;
  status: 'submitted' | 'working' | 'input-required' | 'completed' | 'failed';
  messages: A2AMessage[];
  artifacts: A2AArtifact[];
}

interface A2AMessage {
  role: 'user' | 'agent';
  parts: { type: string; content: string }[];
}

interface A2AArtifact {
  name: string;
  mimeType: string;
  data: string;  // Base64 for binary, plain for text
}

// Express route handling incoming A2A tasks
router.post('/a2a/tasks', async (req, res) => {
  const task: A2ATask = req.body;

  if (task.skill === 'contract-redline') {
    // Update task status to working
    task.status = 'working';
    res.json(task);

    // Extract the contract from the task's artifacts
    const contractArtifact = task.artifacts
      .find(a => a.mimeType.includes('wordprocessingml'));

    if (!contractArtifact) {
      task.status = 'failed';
      return;
    }

    // Run the pipeline (same pipeline, A2A transport layer)
    const result = await runRedlinePipeline(contractArtifact.data);

    // === HITL GATE: Attorney reviews before A2A response ===
    await queueForAttorneyReview(result, task.id);
    // Pipeline pauses here until attorney approves
    // When approved, the task status updates to 'completed'
    // and the redlined document is added as an artifact
  }
});
```

Notice the HITL gate. When an external agent sends a contract for review via A2A, the pipeline runs and produces its analysis, but the response is not sent until an attorney reviews and approves the work product. A2A changes the transport (structured API instead of email attachment). It does not change the professional obligation. The attorney still reviews every piece of work product that crosses the organizational boundary.

### Current State and Future Trajectory

A2A is young. As of this writing, no major law firm has deployed it in production. The protocol is still being refined, and the legal industry's adoption of any new standard is measured in years, not months.

But the trajectory is clear. The pattern of inter-organizational agent communication that A2A enables is inevitable because the alternative, human intermediaries manually transferring output between systems, creates a bottleneck that scales linearly with transaction volume. When both parties to a deal have AI pipelines, the human-in-the-middle transferring Word documents via email becomes the slowest component in the system. A2A removes that bottleneck.

Legal engineers should design their pipelines with A2A compatibility in mind, even if they do not implement it today. This means: structured inputs and outputs (JSON, not free-form text), well-defined skill descriptions, stateful task management, and authentication mechanisms that can be extended to cross-organizational use.

> **Insight: A2A Does Not Remove Attorneys**
>
> A2A enables agents to communicate with agents. It does not remove the attorney from the loop. When your client's agent queries your firm's research agent, the research agent runs the pipeline and the attorney reviews the output before the A2A response is sent. A2A changes the transport layer (structured data instead of email attachments), not the supervision layer. HITL gates still apply. Professional obligations still govern. The work product still requires attorney approval.

**Key Takeaways**

- A2A is Google's open protocol for agent-to-agent communication across organizational boundaries, donated to the Linux Foundation in 2025.
- MCP connects agents to tools. A2A connects agents to other agents. They are complementary.
- Four legal applications: cross-firm document review, multi-vendor integration, client-facing interfaces, and multi-party transactions.
- Design pipelines with A2A compatibility in mind: structured inputs/outputs, well-defined skills, stateful tasks, extensible authentication.
- A2A changes the transport layer, not the supervision layer. HITL and professional obligations still apply.


---


## 4.9 Pattern Selection: A Decision Framework

With six orchestration patterns, eight Diplomat categories, and three cross-cutting concerns (HITL, multi-pass, A2A), the design space for legal AI pipelines is large. This section provides a systematic framework for selecting the right patterns for a given legal workflow.

### The Three Questions

Every pattern selection begins with three questions about the workflow:

**Question 1: What is the dependency structure?**

Are the analytical tasks independent (each analyst can work without the others' output) or dependent (each stage needs the prior stage's output)? Independent tasks get Pattern 2 (Parallel Fan-Out/Fan-In). Dependent tasks get Pattern 1 (Sequential).

Most workflows have both. Classification must happen before analysis (sequential dependency). But sixteen specialist analyses are independent of each other (parallel opportunity). The pipeline combines Pattern 1 between rounds and Pattern 2 within rounds.

**Question 2: Does the input type determine the processing path?**

If an M&A contract requires a different specialist panel than a SaaS contract, you need Pattern 3 (Supervisor). If every input follows the same path regardless of type, you do not.

**Question 3: What are the stakes of a wrong answer?**

High stakes (privilege determination, M&A closing conditions) justify Pattern 6 (Adversarial validation) and HITL gates. Low stakes (boilerplate NDA, document classification) justify simpler patterns with audit trails.

### The Decision Matrix

| Workflow Characteristic | Primary Pattern | Supporting Pattern | HITL Style |
|------------------------|----------------|-------------------|------------|
| Fixed stages, each depending on prior | Sequential (1) | -- | Audit Trail |
| Multiple independent analysis domains | Parallel Fan-Out (2) | Sequential for synthesis | Escalation |
| Different input types need different experts | Supervisor/Router (3) | Parallel for each panel | Escalation |
| Research path depends on findings | Plan-Based (4) | Sequential for known steps | Gate before delivery |
| Progressive filtering by confidence | Handoff (5) | Sequential within each level | Gate at final level |
| Quality control on high-stakes output | Adversarial (6) | Sequential for iteration | Gate before delivery |
| Cross-organizational communication | Any + A2A | A2A transport layer | Gate at organization boundary |

### Mapping the Ten TLE Practice Workflows

Each of the ten legal workflows in Part II maps to a specific pattern combination. This table is the bridge between this chapter and the rest of the book:

| Workflow | Chapter | Primary Pattern | Composition |
|----------|---------|----------------|-------------|
| **Contract Drafting** | 8 | Sequential (1) | Sequential: terms, draft, review, finalize |
| **Contract Redlining** | 9 | Supervisor (3) + Parallel (2) | Router selects panel, parallel specialists, sequential synthesis |
| **Contract Analytics** | 10 | Parallel (2) | Parallel extraction across portfolio, sequential aggregation |
| **Document Triage** | 11 | Parallel (2) + Handoff (5) | Parallel classification, handoff for uncertain items |
| **M&A Due Diligence** | 12 | Supervisor (3) + Parallel (2) | Router by document type, parallel analysis, sequential synthesis |
| **Legal Research** | 13 | Plan-Based (4) + Adversarial (6) | Planner creates research path, adversarial verification |
| **Regulated Communications** | 14 | Parallel (2) + Handoff (5) | Parallel regulatory checks, handoff for violations |
| **Third-Party Risk** | 15 | Sequential (1) + Parallel (2) | Sequential questionnaire analysis, parallel risk scoring |
| **Obligation Tracking** | 16 | Sequential (1) + Parallel (2) | Parallel extraction, sequential calendar generation |
| **Litigation Support** | 17 | Handoff (5) + Parallel (2) | Handoff for privilege, parallel for issue coding |

### The Complete Pipeline: Composing Patterns

The CLE pipeline that produced 138 track changes on the Meridian-Apex merger agreement composes four of the six patterns across six rounds. Understanding the composition makes the entire architecture legible:

**Round 01 (Intake): Pattern 3 — Supervisor.**
A single classifier reads the contract and determines the contract type, governing law, parties, and deal value. Based on the classification, it selects which specialist panel to deploy in Round 02. An M&A contract activates the M&A panel. A SaaS contract would activate the SaaS panel. The Supervisor does not analyze. It routes.

**Round 02 (Specialists): Pattern 2 — Parallel Fan-Out/Fan-In.**
Sixteen specialist analysts launch simultaneously via `Promise.allSettled`. Each reads the same contract with a different domain-expert prompt. Findings are collected, deduplicated, and prepared for research. Wall-clock time: about four minutes. Sequential time would have been over an hour.

**Round 03 (Research): Pattern 2 — Parallel Fan-Out/Fan-In.**
Eight research agents launch simultaneously, each investigating a topic identified by the specialists. Each conducts approximately five web searches. Findings are collected and merged with the specialist analysis.

**Round 04 (Synthesis): Pattern 1 — Sequential.**
A single synthesis agent reads all 302 specialist findings and 18 research results and produces 80 prioritized directives. This stage cannot be parallelized because synthesis requires seeing everything.

**Round 05 (Translation): Pattern 1 — Sequential.**
A single directive generator translates the 80 directives into OOXML Track Changes markup. This depends on Round 04's output and cannot run earlier.

**Round 06 (Application): Pattern 1 — Sequential.**
Pure code. No AI. OOXML surgery on the Word document. Depends on Round 05's output.

The composition: Supervisor, Parallel, Parallel, Sequential, Sequential, Sequential. Three of the six patterns, combined in the arrangement that the workflow's dependency structure demands.

<svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
  <defs>
    <marker id="arrow-comp" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#16a085"/>
    </marker>
  </defs>
  <!-- Round 1 -->
  <rect x="10" y="110" width="85" height="55" rx="6" fill="#1a1a2e" stroke="#e74c3c" stroke-width="2"/>
  <text x="52" y="132" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">R1: Intake</text>
  <text x="52" y="150" text-anchor="middle" fill="#e74c3c" font-size="8" font-family="sans-serif">Supervisor</text>
  <!-- Round 2 -->
  <line x1="95" y1="120" x2="128" y2="30" stroke="#f39c12" stroke-width="1.5"/>
  <line x1="95" y1="130" x2="128" y2="75" stroke="#f39c12" stroke-width="1.5"/>
  <line x1="95" y1="140" x2="128" y2="120" stroke="#f39c12" stroke-width="1.5"/>
  <line x1="95" y1="150" x2="128" y2="165" stroke="#f39c12" stroke-width="1.5"/>
  <line x1="95" y1="155" x2="128" y2="210" stroke="#f39c12" stroke-width="1.5"/>
  <rect x="130" y="15" width="90" height="28" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="175" y="33" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">MAC Analyst</text>
  <rect x="130" y="60" width="90" height="28" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="175" y="78" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">IP Analyst</text>
  <rect x="130" y="105" width="90" height="28" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="175" y="123" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">Termination</text>
  <rect x="130" y="150" width="90" height="28" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="175" y="168" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">Indemnification</text>
  <rect x="130" y="195" width="90" height="28" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="175" y="213" text-anchor="middle" fill="white" font-size="8" font-family="sans-serif">+12 More</text>
  <text x="175" y="248" text-anchor="middle" fill="#f39c12" font-size="9" font-family="sans-serif" font-weight="bold">R2: Parallel (16)</text>
  <!-- Fan-in to collect -->
  <line x1="220" y1="30" x2="258" y2="120" stroke="#16a085" stroke-width="1.2"/>
  <line x1="220" y1="75" x2="258" y2="125" stroke="#16a085" stroke-width="1.2"/>
  <line x1="220" y1="120" x2="258" y2="130" stroke="#16a085" stroke-width="1.2"/>
  <line x1="220" y1="165" x2="258" y2="135" stroke="#16a085" stroke-width="1.2"/>
  <line x1="220" y1="210" x2="258" y2="140" stroke="#16a085" stroke-width="1.2"/>
  <!-- Round 3 -->
  <rect x="260" y="103" width="80" height="55" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="300" y="125" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">R3: Research</text>
  <text x="300" y="143" text-anchor="middle" fill="#f39c12" font-size="8" font-family="sans-serif">Parallel (8)</text>
  <!-- Round 4 -->
  <line x1="340" y1="130" x2="368" y2="130" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-comp)"/>
  <rect x="370" y="103" width="90" height="55" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="415" y="125" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">R4: Synthesis</text>
  <text x="415" y="143" text-anchor="middle" fill="#16a085" font-size="8" font-family="sans-serif">Sequential</text>
  <!-- Round 5 -->
  <line x1="460" y1="130" x2="488" y2="130" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-comp)"/>
  <rect x="490" y="103" width="90" height="55" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="535" y="125" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">R5: Translate</text>
  <text x="535" y="143" text-anchor="middle" fill="#16a085" font-size="8" font-family="sans-serif">Sequential</text>
  <!-- Round 6 -->
  <line x1="580" y1="130" x2="608" y2="130" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-comp)"/>
  <rect x="610" y="103" width="80" height="55" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="650" y="125" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">R6: Apply</text>
  <text x="650" y="143" text-anchor="middle" fill="#f39c12" font-size="8" font-family="sans-serif">Code Only</text>
  <!-- Output -->
  <line x1="690" y1="130" x2="718" y2="130" stroke="#16a085" stroke-width="2" marker-end="url(#arrow-comp)"/>
  <rect x="720" y="110" width="60" height="40" rx="6" fill="#16a085" stroke="#16a085" stroke-width="2"/>
  <text x="750" y="134" text-anchor="middle" fill="white" font-size="9" font-family="sans-serif" font-weight="bold">.DOCX</text>
  <!-- Title -->
  <text x="400" y="290" text-anchor="middle" fill="#16a085" font-size="11" font-family="sans-serif" font-style="italic">Figure 4.7 — Complete pipeline composition: Supervisor + Parallel + Parallel + Sequential + Sequential + Code</text>
</svg>

### Worked Example: Designing a Due Diligence Pipeline

To illustrate the decision framework in action, walk through the design of an M&A due diligence pipeline for a data room with 500 documents.

**Step 1: List the Diplomat categories.**
- Classify: Identify each document's type (employment agreement, IP assignment, lease, material contract, regulatory filing)
- Extract: Pull key terms from each document (parties, dates, obligations, change-of-control triggers)
- Align: Compare extracted terms against acquisition playbook (identify non-assignable contracts, change-of-control provisions that need consent, non-compete restrictions that survive)
- Cross-Reference: Check whether documents referenced in the disclosure schedules actually exist in the data room
- Research: Investigate flagged issues (e.g., an unusual non-compete in a key executive's employment agreement, a regulatory filing that references a pending investigation)
- Synthesize: Merge all findings into a prioritized diligence report with recommended actions
- Translate: Format the report for the client's preferred delivery (structured JSON for their deal management system, Word document for the diligence memo)

Seven Diplomat categories. Seven layers of processing.

**Step 2: Map the dependencies.**
- Classify is independent per document (500 documents can be classified in parallel)
- Extract depends on Classify (need to know it is an employment agreement before extracting employment-specific terms)
- Align and Cross-Reference depend on Extract (need the extracted terms to compare against playbook)
- Research depends on Align (need to know which issues were flagged before researching them)
- Synthesize depends on everything upstream
- Translate depends on Synthesize

**Step 3: Select the patterns.**
- Document classification: Pattern 2 (Parallel), 500 documents classified simultaneously
- Per-document analysis: Pattern 3 (Supervisor) selects the right extractors based on document type, then Pattern 1 (Sequential) for Extract, Align, Cross-Reference within each document
- Cross-document research: Pattern 2 (Parallel), multiple research agents investigating flagged issues simultaneously
- Synthesis: Pattern 1 (Sequential), one synthesis agent reads all findings
- Critical findings: Pattern 6 (Adversarial), a verification agent challenges the most material findings before they appear in the final report

**Step 4: Choose the pass count.**
- Per document: 2 passes (classify + extract/align in one focused pass). Documents are moderate-length and moderate-stakes individually.
- Portfolio synthesis: 3 passes (initial synthesis, review for cross-document patterns, final report). The synthesis is high-stakes because it drives the deal recommendation.

**Step 5: Add HITL.**
- Gate before the final report is delivered to the client
- Escalation for any document classified with low confidence (e.g., an unusual document type the classifier has not seen before)
- Audit trail for all 500 classification decisions so the attorney can spot-check

**Step 6: Design for A2A.**
- Expose the diligence report as a structured JSON artifact
- Define an A2A skill: "due-diligence-review" with input format (document archive) and output format (structured findings)

Result: a pipeline that processes 500 documents in parallel, applies type-specific analysis to each, synthesizes findings across the portfolio with adversarial verification on critical items, and presents the attorney with a prioritized report where the highest-risk items appear first. Total pipeline time: measured in minutes, not the weeks a human team would require.

### A Monday Morning Exercise

When you sit down to design a pipeline for a new legal workflow, follow this process:

1. **List the Diplomat categories you need.** Write down which of the eight categories (Classify, Extract, Align, Cross-Reference, Research, Synthesize, Translate, Apply) are required. This gives you the number of Diplomats.

2. **Map the dependencies.** Draw arrows between categories. Which must happen before which? Which are independent? This gives you the pattern selection.

3. **Identify the stakes.** Where in the pipeline is a wrong answer most costly? Those stages get HITL gates or adversarial validation.

4. **Choose the pass count.** Simple task, low stakes: two passes. Complex task, high stakes: three to six passes plus parallel specialists.

5. **Add HITL at decision boundaries.** Where does the pipeline make a decision that an attorney should review? Insert a Gate, Escalation, or Review Loop at that point.

6. **Design for A2A.** Even if you do not implement A2A today, structure your inputs and outputs as typed JSON so the pipeline can be exposed as an A2A skill later.

> **Practice Tip: The Workflow Canvas**
>
> Before writing any code, sketch your pipeline on paper or a whiteboard. Draw boxes for each Diplomat, arrows for data flow, and dotted lines for HITL checkpoints. Label each box with its category (Classify, Extract, etc.) and each arrow with the data type it carries. If you can explain the entire pipeline by walking someone through the sketch, your design is clear enough to implement. If you cannot, simplify it until you can.

**Key Takeaways**

- Pattern selection begins with three questions: dependency structure, input-type routing needs, and stakes of a wrong answer.
- Most production pipelines compose multiple patterns. The CLE pipeline uses Supervisor, Parallel, and Sequential in a single 6-round architecture.
- Each of the ten TLE Practice workflows maps to a specific pattern combination documented in this chapter.
- Design pipelines by listing Diplomat categories, mapping dependencies, identifying stakes, choosing pass count, and adding HITL at decision boundaries.
- The vocabulary from this chapter is the vocabulary for the rest of the book. When Part II says "Parallel Fan-Out with Escalation HITL," you now know exactly what that means and how to build it.


---


## Chapter Summary

This chapter established the orchestration pattern taxonomy that governs every pipeline in this book. The taxonomy has three layers:

**Layer 1: Architecture.** The Backautocrat/Diplomat separation of concerns. The Backautocrat orchestrates. Diplomats execute. The Backautocrat never analyzes. Diplomats never orchestrate.

**Layer 2: Categories.** Eight Diplomat categories define the types of work AI agents perform in legal pipelines: Classify, Extract, Align, Cross-Reference, Research, Synthesize, Translate, Apply. Every Diplomat in every pipeline falls into one of these categories.

**Layer 3: Patterns.** Six orchestration patterns define how Diplomats are arranged: Sequential Pipeline, Parallel Fan-Out/Fan-In, Supervisor (Router), Plan-Based, Handoff, and Conversation-Driven (Adversarial). These patterns are composable. Most production pipelines use multiple patterns.

Three cross-cutting concerns apply to all patterns:

- **Human-in-the-Loop** is not a pattern but a checkpoint layer. Four implementation styles: Gate, Review Loop, Escalation, Audit Trail.
- **Multi-Pass Architecture** follows a diminishing returns curve. The biggest quality improvement comes from going from one pass to two. Match pipeline depth to stakes.
- **A2A Interoperability** enables cross-organizational agent communication. Design for it now, implement it when the standard matures.

The empirical evidence is clear. The same frontier model produces dramatically different results depending on the architecture. A single Claude Opus call produced 35 track changes with zero citations. Twenty-six Diplomats orchestrated across six rounds produced 138 track changes with 18 citations. The model did not improve. The architecture did. And when parallelization was applied without synthesis, the output was worse than single-pass, proving that architecture quality, not merely agent quantity, is the multiplier.

This taxonomy is the vocabulary for the rest of the book. Part II applies these patterns to ten legal workflows. Every pipeline described in Chapters 8 through 17 is a composition of the patterns, categories, and cross-cutting concerns defined here. You now have the language to read those pipelines, understand their design decisions, and modify them for your own practice.

The model is not the product. The architecture around the model is the product. This chapter taught you how to build that architecture.

### What Comes Next

Part I concludes with three more foundational chapters. Chapter 5 covers Integration: how the AI pipeline connects to the Express server, the React frontend, MongoDB persistence, and the OOXML document format that delivers Track Changes. Chapter 6 covers Professional Responsibility: the ethical framework that governs every HITL checkpoint and every work product the pipeline produces. Chapter 7 covers Evaluation Engineering: how to build automated scoring systems that measure pipeline output quality, enabling the kind of controlled experiments that produced the evidence in this chapter.

Then Part II applies everything. Ten legal workflows, each implemented as a production pipeline composing the patterns from this taxonomy. Contract drafting (Chapter 8) uses Sequential with multi-pass review. Contract redlining (Chapter 9) composes Supervisor, Parallel, and Sequential across six rounds. Contract analytics (Chapter 10) uses Parallel Fan-Out across entire contract portfolios. And so on through document triage, M&A due diligence, legal research, regulated communications, third-party risk assessment, obligation tracking, litigation support, and IP analytics.

Every pipeline in Part II is a sentence composed from the words defined in this chapter. The Backautocrat/Diplomat architecture provides the grammar. The eight Diplomat categories provide the vocabulary. The six orchestration patterns provide the sentence structures. HITL, multi-pass, and A2A provide the punctuation. With these tools, you can read any legal AI pipeline design and understand it, and you can design your own pipeline for any legal workflow you encounter.

The architecture is the multiplier. Build it well.

