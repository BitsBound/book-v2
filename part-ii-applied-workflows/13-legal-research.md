\newpage

# Chapter 13: Legal Research

*Tree-of-Thought Argument Construction, Citation Verification, and Research Memo Generation*


Legal research is the only workflow in this book where parallelization without
synthesis produces worse results than a single AI call. That finding, from TLE R&D
Experiment 03, defied our initial predictions and reshaped how we approach multi-agent
research architectures. Four specialist researchers running in parallel generated
50,000 words of deeply researched, individually impressive legal analysis. A single
researcher generated 11,000 words. An independent scorer evaluated both against a
five-criterion rubric, and the single researcher scored higher: 73 out of 100 versus
60.5 out of 100. More information, delivered in a less usable format, is worse than
less information delivered coherently.


But when we added a synthesizer, a single diplomat that received all four specialist
outputs and produced a unified memorandum, the score rose to 77. The same specialist
research, the same underlying analysis, transformed from a 60.5-point information dump
into a 77-point professional deliverable by the addition of one architectural
component. The synthesizer did not add new research. It organized, deduplicated, resolved
conflicts, built cross-domain arguments, and produced a document that a partner could
hand to a client. Architecture made the difference, not additional model capability.


This chapter teaches tree-of-thought argument construction: the pipeline architecture
that decomposes legal questions into research branches, explores each branch in
parallel, prunes weak theories, deepens strong ones, and synthesizes surviving branches
into a professional research memorandum. The pattern is native to how attorneys
actually think about legal problems. A question like "Can the buyer terminate under this
MAC clause?" is not a single inquiry. It branches into: What is the MAC standard under
Delaware law? Does the "prospects" language in this specific clause expand the buyer's
rights? Have courts upheld walkaway on facts similar to ours? What are the seller's
strongest counterarguments? Each branch can further branch. Tree-of-thought replicates
this branching structure in a multi-agent pipeline.


## The Legal Research Problem


Legal research is the process of identifying, analyzing, and applying legal authority
to a specific set of facts. The output is typically a research memorandum that answers
one or more legal questions with supported analysis. The quality of the memorandum
depends on five dimensions: issue identification (did the researcher find all relevant
legal issues?), authority accuracy (are the cited cases and statutes real and
relevant?), analysis depth (does the memo apply law to the specific facts, not just
state abstract rules?), counterargument consideration (does the memo address the
strongest opposing arguments?), and practical actionability (are the recommendations
specific enough that someone can act on them?).


Each dimension presents a distinct failure mode for single-pass AI. Issue
identification fails when the model's attention is spread across too many legal
domains simultaneously. A complex litigation fact pattern touching contract law,
malpractice, professional responsibility, and indemnification requires sustained
focus on each domain; a single prompt that asks for everything at once tends to
cover the obvious issues thoroughly and miss the subtle ones. Authority accuracy
fails when the model generates plausible-sounding but nonexistent case citations, a
well-documented failure mode of language models that is particularly dangerous in legal
contexts where fabricated citations can result in sanctions. Analysis depth fails when
the model states legal rules abstractly without applying them to the specific facts at
hand. Counterargument consideration fails when the model defaults to advocacy and
neglects the opposing position. And actionability fails when recommendations are
generic ("consult with counsel" or "consider filing a motion") rather than specific
("file a breach of contract action in the Eastern District of Pennsylvania within 60
days, asserting claims under Section 2-714 of the UCC").


> **Key Concept**
>
> Legal research is not information retrieval. Information retrieval finds relevant
> sources. Legal research analyzes those sources, applies them to specific facts,
> weighs competing authorities, constructs arguments, anticipates counterarguments, and
> produces a recommendation. A system that retrieves twenty relevant cases and lists
> them is a search engine. A system that analyzes those cases, identifies which ones
> are binding in the relevant jurisdiction, applies their holdings to the client's
> facts, and explains why the client's position is likely to prevail on three of four
> issues is performing legal research.


### The TIRO Decomposition


**Trigger:** An attorney needs to answer a legal question arising from a client matter.
The question may be narrow ("Is this non-compete enforceable in California?") or
broad ("What are all viable claims and defenses in this commercial dispute?").


**Input:** A fact pattern describing the legal situation, supporting documents
(contracts, correspondence, demand letters, court filings), the specific research
question, and optional context (jurisdiction preferences, client goals, urgency level).


**Requirements:**

- *Arbitration:* The research question must be decomposed into discrete sub-issues
  before parallel research begins. A multi-part question ("What claims exist, what
  defenses apply, and what damages are available?") must be split into separate
  research branches.
- *Definitions:* Legal research requires real authority: statutes, regulations, and
  case law that actually exist and are binding in the relevant jurisdiction. Authority
  that is "plausible but unverifiable" must be treated as hallucinated.
- *Validations:* Every legal assertion in the memorandum must be supported by cited
  authority. Citations must include case name, court, year, and reporter reference.
  Statutory citations must include title, section, and subsection.
- *Transformations:* Raw research from parallel specialists must be synthesized into
  a coherent memorandum. Redundancies between specialists must be eliminated. Conflicts
  between specialists must be resolved with stated reasoning. The final memorandum
  follows the standard professional format: Question Presented, Brief Answer, Statement
  of Facts, Discussion (organized by issue with IRAC structure), and Conclusion with
  Recommendations.


**Output:** A professional legal research memorandum suitable for delivery to a
supervising partner or client, with all assertions supported by cited authority, all
counterarguments addressed, and all recommendations specific and actionable.


## TLE R&D Evidence: Why Synthesis Is Mandatory


Before building the pipeline, we must understand the empirical evidence that
determines its architecture. TLE R&D Experiment 03, "Does Multi-Agent Research
Produce Superior Legal Analysis?", tested three pipeline variations against the same
complex litigation fact pattern.


The fact pattern involved a law firm (Chambers & Associates) that purchased an AI
contract review platform (NovaMind AI). The platform missed a critical change-of-control
provision in a $47 million acquisition, then hallucinated case citations in court
filings. The firm's client was threatening $12 million in malpractice damages. The
research question required analyzing: claims against NovaMind, defense against the
malpractice suit, contribution and indemnity theories, professional responsibility
implications, and strategic recommendations.


### Three Variations, One Clear Lesson


| Variation | Architecture | Claude Calls | Mean Score | Mean Cost |
|---|---|---|---|---|
| V1: single-researcher | 1 call, everything at once | 1 | 73/100 | $0.30 |
| V2: prompter-researchers | Prompter + 4 parallel specialists, no synthesis | 5 | 60.5/100 | $2.07 |
| V3: prompter-researchers-synthesizer | Prompter + 4 parallel specialists + synthesizer | 6 | 77/100 | $2.45 |


The ordering is V2 < V1 < V3, not the V1 < V2 < V3 that intuition would predict.
Parallelization without synthesis is not merely "not as good as" full synthesis. It is
actively worse than a single call.


<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" font-family="Inter, system-ui, sans-serif">
  <!-- Background -->
  <rect width="900" height="420" fill="#1a1a2e" rx="8"/>

  <!-- Title -->
  <text x="450" y="28" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Figure 13.1 — TLE R&D Experiment 03: Quality Scores by Pipeline Architecture</text>

  <!-- Y-axis -->
  <line x1="100" y1="60" x2="100" y2="340" stroke="#444" stroke-width="1"/>
  <text x="50" y="65" text-anchor="middle" fill="#aaa" font-size="10">100</text>
  <text x="50" y="135" text-anchor="middle" fill="#aaa" font-size="10">80</text>
  <text x="50" y="205" text-anchor="middle" fill="#aaa" font-size="10">60</text>
  <text x="50" y="275" text-anchor="middle" fill="#aaa" font-size="10">40</text>
  <text x="50" y="345" text-anchor="middle" fill="#aaa" font-size="10">20</text>
  <!-- Grid lines -->
  <line x1="100" y1="60" x2="820" y2="60" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="100" y1="130" x2="820" y2="130" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="100" y1="200" x2="820" y2="200" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="100" y1="270" x2="820" y2="270" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="100" y1="340" x2="820" y2="340" stroke="#444" stroke-width="1"/>

  <!-- V2 bar (60.5) — positioned first (leftmost) since it scored lowest -->
  <rect x="170" y="171" width="120" height="169" rx="4" fill="#e74c3c" opacity="0.8"/>
  <text x="230" y="162" text-anchor="middle" fill="#e74c3c" font-size="16" font-weight="bold">60.5</text>
  <text x="230" y="370" text-anchor="middle" fill="white" font-size="10">V2: Researchers</text>
  <text x="230" y="385" text-anchor="middle" fill="#aaa" font-size="9">(no synthesis)</text>

  <!-- V1 bar (73) -->
  <rect x="390" y="137" width="120" height="203" rx="4" fill="#f39c12" opacity="0.8"/>
  <text x="450" y="128" text-anchor="middle" fill="#f39c12" font-size="16" font-weight="bold">73</text>
  <text x="450" y="370" text-anchor="middle" fill="white" font-size="10">V1: Single</text>
  <text x="450" y="385" text-anchor="middle" fill="#aaa" font-size="9">Researcher</text>

  <!-- V3 bar (77) -->
  <rect x="610" y="126" width="120" height="214" rx="4" fill="#16a085" opacity="0.8"/>
  <text x="670" y="117" text-anchor="middle" fill="#16a085" font-size="16" font-weight="bold">77</text>
  <text x="670" y="370" text-anchor="middle" fill="white" font-size="10">V3: Researchers</text>
  <text x="670" y="385" text-anchor="middle" fill="#aaa" font-size="9">+ Synthesizer</text>

  <!-- Annotation: V2 < V1 -->
  <line x1="230" y1="155" x2="440" y2="125" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="335" y="133" text-anchor="middle" fill="#f39c12" font-size="10">+12.5 pts</text>
  <text x="335" y="147" text-anchor="middle" fill="#f39c12" font-size="9">Single pass BEATS unsynthesized parallel</text>

  <!-- Annotation: V1 < V3 -->
  <line x1="455" y1="122" x2="660" y2="112" stroke="#16a085" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="560" y="108" text-anchor="middle" fill="#16a085" font-size="10">+4 pts</text>
  <text x="560" y="97" text-anchor="middle" fill="#16a085" font-size="9">Synthesis unlocks the architecture's value</text>

  <!-- Key finding callout -->
  <rect x="120" y="395" width="680" height="20" rx="3" fill="#e74c3c" opacity="0.15"/>
  <text x="460" y="410" text-anchor="middle" fill="#e74c3c" font-size="10" font-weight="bold">Key Finding: Parallelization without synthesis is WORSE than single-pass, not better.</text>
</svg>

*Figure 13.1 — Quality scores from TLE R&D Experiment 03. V2 (parallel researchers
without synthesis) scored 12.5 points below the single-pass baseline. V3 (parallel
researchers with synthesis) scored 4 points above the baseline. The synthesizer
transforms a 60.5-point information dump into a 77-point professional deliverable.*


### Why V2 Scored Lower Than V1


The explanation lies in what the scorer evaluates. V2 produced approximately 50,000
words: four comprehensive specialist reports concatenated together. V1 produced
approximately 11,000 words: one coherent memorandum. V2 contained *more* legal
analysis, *more* authority, and *more* issue coverage than V1. But it was not a
deliverable. It was four separate documents stitched together with no executive
summary, no cross-domain synthesis, no deduplication, and no unified
recommendation structure.


The scorer's criterion breakdown reveals where V2 failed:


| Criterion | V1 | V2 | V3 |
|---|---|---|---|
| Issue Identification (20) | 16 | 15 | 17 |
| Authority Accuracy (20) | 10 | 9 | 11 |
| Analysis Depth (20) | 15 | 12 | 16 |
| Counter-Argument (20) | 16 | 14 | 16 |
| Practical Actionability (20) | 16 | 9 | 17 |
| **Total** | **73** | **59** | **77** |


V2's issue identification (15) was comparable to V1's (16) because the parallel
specialists collectively identified most of the same issues. But V2's actionability
score (9 out of 20) was devastating. A 50,000-word concatenation of specialist outputs
is not actionable. The reader must perform their own synthesis: identify which
recommendations from the claims analyst conflict with the defenses analyst's assessment,
figure out which procedural deadlines the damages analyst's recommendations depend on,
and construct a unified litigation strategy from four independent, occasionally
contradictory recommendations. The scorer correctly penalized V2 for requiring the
reader to do the work that the synthesizer should have done.


V2's analysis depth score (12) was also penalized because the four specialist reports
contained significant redundancy. The claims analyst and the defenses analyst both
discussed the limitation of liability clause in the NovaMind contract. The damages
analyst and the procedural analyst both discussed the statute of limitations. When
the scorer counted the redundant analysis, it reduced the effective depth because the
reader must wade through repeated treatment of the same issues across different
specialist reports.


> **Warning**
>
> The lesson from Experiment 03 is not "don't parallelize." The lesson is "always
> synthesize." V3 used the same parallel specialists as V2 and scored 16.5 points
> higher because it added one more Claude call (cost: approximately $0.40) to
> synthesize the specialist outputs into a coherent deliverable. Parallelization is
> the tool that creates depth. Synthesis is the tool that creates usability. You
> need both. Either one alone is worse than neither.


### The Cost-Quality Tradeoff


V1 costs $0.30 per run and scores 73. V3 costs $2.45 and scores 77. That is an 8x
cost increase for a 4-point quality improvement. Whether V3 is worth it depends
entirely on context. For a $12 million malpractice defense (the fact pattern in
Experiment 03), the additional $2.15 is negligible. For routine research queries
answered ten times a day, V1 is the clear efficiency winner at 243 points per dollar
versus V3's 31 points per dollar.


The right architecture is determined by the stakes, the same principle from Chapter 3.
Two passes for a routine research query. The full tree-of-thought pipeline for bet-the-
company litigation.


## Pipeline Architecture: Tree-of-Thought Argument Construction


The legal research pipeline uses a plan-based orchestration pattern that mirrors how
experienced attorneys decompose research questions. Unlike the flat fan-out/fan-in
pattern of contract analytics (Chapter 9), the research pipeline constructs a tree of
legal theories, explores each branch, evaluates the strength of each path, prunes weak
branches, and synthesizes surviving branches into a coherent argument. This pattern is
called tree-of-thought because the research structure is genuinely arboreal: a root
question branches into issues, issues branch into sub-issues, and the pipeline explores
every branch to a sufficient depth before deciding which branches support the final
argument.


<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" font-family="Inter, system-ui, sans-serif">
  <defs>
    <marker id="arrow13-2" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="900" height="500" fill="#1a1a2e" rx="8"/>

  <!-- Title -->
  <text x="450" y="28" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Figure 13.2 — Tree-of-Thought Argument Construction Pipeline</text>

  <!-- Root: Research Question -->
  <rect x="335" y="50" width="230" height="42" rx="6" fill="#16a085" opacity="0.9"/>
  <text x="450" y="76" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Research Question</text>

  <!-- Round 1: Decomposition -->
  <rect x="340" y="115" width="220" height="36" rx="5" fill="#2c3e7a" stroke="#16a085" stroke-width="1.5"/>
  <text x="450" y="138" text-anchor="middle" fill="white" font-size="11">R1: Question Decomposition</text>
  <line x1="450" y1="92" x2="450" y2="115" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow13-2)"/>

  <!-- Branches from decomposition -->
  <!-- Branch 1: Claims -->
  <rect x="30" y="185" width="180" height="36" rx="5" fill="#2c3e7a" stroke="#f39c12" stroke-width="1.5"/>
  <text x="120" y="208" text-anchor="middle" fill="white" font-size="10">Claims Researcher</text>

  <!-- Branch 2: Defenses -->
  <rect x="240" y="185" width="180" height="36" rx="5" fill="#2c3e7a" stroke="#f39c12" stroke-width="1.5"/>
  <text x="330" y="208" text-anchor="middle" fill="white" font-size="10">Defenses Researcher</text>

  <!-- Branch 3: Damages -->
  <rect x="450" y="185" width="180" height="36" rx="5" fill="#2c3e7a" stroke="#f39c12" stroke-width="1.5"/>
  <text x="540" y="208" text-anchor="middle" fill="white" font-size="10">Damages Researcher</text>

  <!-- Branch 4: Procedural -->
  <rect x="660" y="185" width="180" height="36" rx="5" fill="#2c3e7a" stroke="#f39c12" stroke-width="1.5"/>
  <text x="750" y="208" text-anchor="middle" fill="white" font-size="10">Procedural Researcher</text>

  <!-- Arrows from decomposition to branches -->
  <line x1="380" y1="151" x2="120" y2="185" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow13-2)"/>
  <line x1="420" y1="151" x2="330" y2="185" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow13-2)"/>
  <line x1="480" y1="151" x2="540" y2="185" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow13-2)"/>
  <line x1="530" y1="151" x2="750" y2="185" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow13-2)"/>

  <!-- Round 2 label -->
  <text x="450" y="178" text-anchor="middle" fill="#f39c12" font-size="10" font-weight="bold">R2: Parallel Research (Fan-Out)</text>

  <!-- Round 3: Evaluation -->
  <rect x="270" y="260" width="360" height="36" rx="5" fill="#2c3e7a" stroke="#e74c3c" stroke-width="1.5"/>
  <text x="450" y="283" text-anchor="middle" fill="white" font-size="11">R3: Branch Evaluation + Pruning</text>

  <!-- Arrows from researchers to evaluator -->
  <line x1="120" y1="221" x2="340" y2="260" stroke="#16a085" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="330" y1="221" x2="400" y2="260" stroke="#16a085" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="540" y1="221" x2="500" y2="260" stroke="#16a085" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="750" y1="221" x2="560" y2="260" stroke="#16a085" stroke-width="1" stroke-dasharray="4,3"/>

  <!-- Pruned branch indicator -->
  <rect x="30" y="260" width="180" height="36" rx="5" fill="none" stroke="#e74c3c" stroke-width="1" stroke-dasharray="5,3" opacity="0.5"/>
  <text x="120" y="282" text-anchor="middle" fill="#e74c3c" font-size="10" opacity="0.7">Weak branch pruned</text>
  <line x1="50" y1="265" x2="190" y2="290" stroke="#e74c3c" stroke-width="1.5" opacity="0.5"/>

  <!-- Deepened branch indicator -->
  <rect x="690" y="260" width="180" height="36" rx="5" fill="#16a085" opacity="0.2" stroke="#16a085" stroke-width="1"/>
  <text x="780" y="282" text-anchor="middle" fill="#16a085" font-size="10">Strong branch deepened</text>

  <!-- Round 4: Synthesis -->
  <rect x="300" y="335" width="300" height="42" rx="6" fill="#2c3e7a" stroke="#16a085" stroke-width="2"/>
  <text x="450" y="360" text-anchor="middle" fill="white" font-size="12" font-weight="bold">R4: Argument Synthesis</text>
  <line x1="450" y1="296" x2="450" y2="335" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow13-2)"/>

  <!-- Round 5: Memo -->
  <rect x="300" y="410" width="300" height="42" rx="6" fill="#16a085" opacity="0.9"/>
  <text x="450" y="436" text-anchor="middle" fill="white" font-size="12" font-weight="bold">R5: Research Memo</text>
  <line x1="450" y1="377" x2="450" y2="410" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow13-2)"/>

  <!-- HITL gate indicator -->
  <rect x="650" y="395" width="180" height="40" rx="5" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="1"/>
  <text x="740" y="412" text-anchor="middle" fill="#f39c12" font-size="10" font-weight="bold">HITL Gate</text>
  <text x="740" y="428" text-anchor="middle" fill="#f39c12" font-size="9">Attorney verifies citations</text>
  <line x1="600" y1="431" x2="650" y2="415" stroke="#f39c12" stroke-width="1" stroke-dasharray="4,3"/>

  <!-- Legend -->
  <rect x="30" y="465" width="10" height="10" rx="2" fill="#16a085"/>
  <text x="48" y="475" fill="#aaa" font-size="9">Orchestrator/Output</text>
  <rect x="175" y="465" width="10" height="10" rx="2" fill="#2c3e7a" stroke="#f39c12" stroke-width="1"/>
  <text x="193" y="475" fill="#aaa" font-size="9">Parallel Researchers</text>
  <rect x="330" y="465" width="10" height="10" rx="2" fill="#2c3e7a" stroke="#e74c3c" stroke-width="1"/>
  <text x="348" y="475" fill="#aaa" font-size="9">Evaluator/Pruner</text>
  <line x1="490" y1="470" x2="520" y2="470" stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="5,3"/>
  <text x="535" y="475" fill="#aaa" font-size="9">Pruned</text>
  <rect x="590" y="465" width="10" height="10" rx="2" fill="#16a085" opacity="0.3" stroke="#16a085" stroke-width="1"/>
  <text x="608" y="475" fill="#aaa" font-size="9">Deepened</text>
</svg>

*Figure 13.2 — The five-round tree-of-thought pipeline. A research question branches
into parallel specialist researchers. An evaluator prunes weak branches and flags
strong branches for deeper investigation. The synthesizer constructs a unified
argument from surviving branches. The attorney verifies all citations before delivery.*


### Round 1: Question Decomposition


The decomposition diplomat receives the full fact pattern, all supporting documents,
and the research question. It produces a structured research tree: a set of branches,
each identifying a specific legal issue, the type of expertise required to research
it, the authorities to investigate, and the facts most relevant to that branch.


This is the prompter role from the diplomat pattern. It does not conduct research. It
plans research. The quality of the decomposition determines the quality of the
downstream research, because a decomposition that misses an important legal theory means
no specialist will explore that theory.


```typescript
// question-decomposer.ts
// Round 1: Decompose a legal research question into a research tree
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

// A single branch in the research tree
interface ResearchBranch {
  // Unique identifier for this branch
  branchId: string;
  // The legal issue this branch investigates
  issueName: string;
  // The specialist role needed (e.g., "claims-analyst", "constitutional-law")
  specialistRole: string;
  // The specific research question for this branch
  researchQuery: string;
  // Authorities the specialist should investigate
  keyAuthorities: string[];
  // Facts from the input most relevant to this branch
  relevantFacts: string[];
  // Priority weight (1-5, higher = more important to the final memo)
  priority: number;
  // Parent branch ID if this is a sub-branch (null for top-level)
  parentBranchId: string | null;
}

// The complete research tree produced by decomposition
interface ResearchTree {
  // Summary of the research question
  questionSummary: string;
  // The jurisdiction(s) governing the analysis
  jurisdictions: string[];
  // All branches in the research tree
  branches: ResearchBranch[];
  // Identified interdependencies between branches
  interdependencies: Array<{
    branchA: string;
    branchB: string;
    nature: string;
  }>;
}

// Input to the research pipeline
interface ResearchInput {
  factPattern: string;
  researchQuestion: string;
  attachments: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
  }>;
  additionalContext?: string;
}

async function decomposeResearchQuestion(
  input: ResearchInput
): Promise<ResearchTree> {
  // Build the attachments block
  const attachmentsBlock = input.attachments
    .map(a => `--- ${a.title} (${a.type}) ---\n${a.content}\n--- END ---`)
    .join('\n\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32_000,
    system: [
      'You are a senior litigation partner planning a legal research',
      'assignment. Decompose the research question into a tree of',
      'sub-issues, each requiring specialist expertise. Be exhaustive:',
      'identify every legal theory, every procedural consideration,',
      'every potential defense, and every damages category. Assign',
      'priority weights based on likely impact on the overall analysis.'
    ].join(' '),
    messages: [{
      role: 'user',
      content: `Decompose the following legal research question into a research tree.

FACT PATTERN:
${input.factPattern}

SUPPORTING DOCUMENTS:
${attachmentsBlock}

${input.additionalContext ? `ADDITIONAL CONTEXT:\n${input.additionalContext}\n` : ''}

RESEARCH QUESTION:
${input.researchQuestion}

For each branch of the research tree, provide:
1. branchId: unique identifier (e.g., "claims-breach-of-contract")
2. issueName: descriptive title
3. specialistRole: type of legal expertise needed
4. researchQuery: specific, detailed question for the specialist
5. keyAuthorities: statutes, case law areas, and restatements to investigate
6. relevantFacts: which facts from the pattern are most relevant
7. priority: 1-5 (5 = most critical to the analysis)
8. parentBranchId: null for top-level, parent's ID for sub-branches

Also identify interdependencies: where one branch's conclusions affect another.

Return a JSON object with: questionSummary, jurisdictions, branches, and
interdependencies.`
    }]
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '{}';
  return JSON.parse(text);
}
```


### Round 2: Parallel Research


Each branch of the research tree is assigned to a specialist researcher diplomat.
The researchers execute in parallel via `Promise.allSettled`, each receiving the full
fact pattern, attachments, and their specific branch assignment. The researcher's
system prompt defines their specialist domain and instructs them to produce deep,
authority-supported analysis within their scope.


This is where the tree-of-thought pattern diverges from flat fan-out. In contract
analytics (Chapter 9), every analyzer receives the same document and the same generic
analysis prompt. In tree-of-thought research, each researcher receives a different
research question derived from the decomposition tree. The claims researcher
investigates claims. The defenses researcher investigates defenses. The damages
researcher investigates damages. Each branch of the tree gets a dedicated agent that
goes as deep as necessary within its scope.


```typescript
// parallel-researchers.ts
// Round 2: Execute specialist researchers in parallel
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

// Output from a single research branch
interface BranchResearchResult {
  branchId: string;
  issueName: string;
  analysis: string;
  citedAuthorities: Array<{
    citation: string;
    relevance: string;
    holding: string;
  }>;
  strengthAssessment: 'strong' | 'moderate' | 'weak';
  counterArguments: string[];
  factualGaps: string[];
  inputTokens: number;
  outputTokens: number;
}

// Build a specialist researcher prompt for one branch
function buildResearcherPrompt(
  branch: ResearchBranch,
  input: ResearchInput,
  decomposition: ResearchTree
): { system: string; user: string } {
  const attachmentsBlock = input.attachments
    .map(a => `--- ${a.title} (${a.type}) ---\n${a.content}\n--- END ---`)
    .join('\n\n');

  const system = `You are a ${branch.specialistRole} specializing in ${branch.issueName}. You are conducting legal research on a specific branch of a larger research tree. Your analysis will be combined with other specialists' work by a synthesizer.

CRITICAL REQUIREMENTS:
1. Every legal assertion must cite specific authority (case name, court, year)
2. Apply the law to the SPECIFIC FACTS provided — do not state abstract rules
3. Address the STRONGEST counterarguments, not strawmen
4. Assess the strength of each argument honestly (strong/moderate/weak)
5. Identify factual gaps that need investigation
6. Stay within your assigned scope — do not analyze issues assigned to other specialists

Your output will be evaluated on: authority accuracy, analysis depth, counterargument consideration, and practical specificity.`;

  const user = `RESEARCH ASSIGNMENT:
Issue: ${branch.issueName}
Research Query: ${branch.researchQuery}
Key Authorities to Investigate: ${branch.keyAuthorities.join(', ')}
Relevant Facts to Emphasize: ${branch.relevantFacts.join('; ')}
Priority: ${branch.priority}/5

RESEARCH CONTEXT:
The senior partner's full decomposition identified these related branches:
${decomposition.branches.map(b => `- ${b.issueName} (${b.branchId})`).join('\n')}

Interdependencies relevant to your branch:
${decomposition.interdependencies
  .filter(d => d.branchA === branch.branchId || d.branchB === branch.branchId)
  .map(d => `- ${d.nature}`)
  .join('\n') || 'None identified'}

FACT PATTERN:
${input.factPattern}

SUPPORTING DOCUMENTS:
${attachmentsBlock}

RESEARCH QUESTION (full):
${input.researchQuestion}

Produce your complete specialist research analysis using the IRAC structure:
Issue → Rule (with citation) → Application (to these facts) → Conclusion.

For each legal theory you analyze, provide:
1. The legal standard with binding authority
2. Element-by-element application to the facts
3. Strength assessment with honest reasoning
4. The strongest counterargument and your response to it
5. What additional facts or evidence would strengthen the position`;

  return { system, user };
}

// Execute all researchers in parallel
async function executeParallelResearch(
  tree: ResearchTree,
  input: ResearchInput
): Promise<BranchResearchResult[]> {
  const results = await Promise.allSettled(
    tree.branches.map(async (branch) => {
      const { system, user } = buildResearcherPrompt(branch, input, tree);

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 128_000,
        system,
        messages: [{ role: 'user', content: user }]
      });

      const response = await stream.finalMessage();
      const analysis = response.content
        .find(c => c.type === 'text')?.text ?? '';

      return {
        branchId: branch.branchId,
        issueName: branch.issueName,
        analysis,
        citedAuthorities: [], // Extracted by the evaluator in Round 3
        strengthAssessment: 'moderate' as const,
        counterArguments: [],
        factualGaps: [],
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      };
    })
  );

  // Collect successful results
  return results
    .filter((r): r is PromiseFulfilledResult<BranchResearchResult> =>
      r.status === 'fulfilled')
    .map(r => r.value);
}
```


### Round 3: Branch Evaluation and Pruning


After the parallel researchers complete, an evaluator diplomat reviews each branch's
output and makes three decisions: (1) Is the branch strong enough to include in the
final memo? (2) Does the branch need deeper research? (3) Are the cited authorities
verifiable?


This round serves two functions. First, it implements quality control by filtering
out weak research that would dilute the final memorandum. A branch analyzing a legal
theory that the researcher assessed as "weak" with no supporting authority should not
occupy space in the deliverable. Second, it implements the tree-of-thought pruning
mechanism: branches with insufficient support are cut, and branches with strong support
but incomplete analysis are flagged for a second round of research.


```typescript
// branch-evaluator.ts
// Round 3: Evaluate and prune research branches
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

// Evaluation result for a single research branch
interface BranchEvaluation {
  branchId: string;
  // Should this branch be included in the final memo?
  include: boolean;
  // Does this branch need a second round of research?
  needsDeepening: boolean;
  // If deepening is needed, what specific questions should be researched?
  deepeningQueries: string[];
  // Strength of authority support
  authorityStrength: 'strong' | 'adequate' | 'weak' | 'unsupported';
  // Specific authorities flagged as potentially hallucinated
  suspectedHallucinations: string[];
  // Overall quality assessment
  qualityNotes: string;
}

async function evaluateResearchBranches(
  branchResults: BranchResearchResult[],
  tree: ResearchTree
): Promise<BranchEvaluation[]> {
  // Evaluate all branches in a single call for consistency
  // The evaluator needs the full picture to make relative assessments
  const branchSummaries = branchResults.map(b => ({
    branchId: b.branchId,
    issueName: b.issueName,
    analysisLength: b.analysis.length,
    analysisPreview: b.analysis.slice(0, 3000),
    fullAnalysis: b.analysis
  }));

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32_000,
    system: [
      'You are a senior partner reviewing research produced by your associates.',
      'For each research branch, assess: (1) whether the analysis is strong enough',
      'to include in the final memorandum, (2) whether it needs deeper research,',
      'and (3) whether any cited authorities appear to be fabricated or misapplied.',
      'Be rigorous. Weak research dilutes the memo. Hallucinated citations are',
      'malpractice risk. A branch with no real supporting authority should be',
      'either pruned or sent back for deeper research with specific instructions.'
    ].join(' '),
    messages: [{
      role: 'user',
      content: `Evaluate each research branch for inclusion in the final memorandum.

RESEARCH BRANCHES:
${JSON.stringify(branchSummaries, null, 2)}

ORIGINAL RESEARCH TREE:
${JSON.stringify(tree, null, 2)}

For each branch, return:
1. branchId: string
2. include: boolean (should this appear in the final memo?)
3. needsDeepening: boolean (should we research this further?)
4. deepeningQueries: string[] (specific follow-up questions if deepening)
5. authorityStrength: "strong" | "adequate" | "weak" | "unsupported"
6. suspectedHallucinations: string[] (citations that look fabricated)
7. qualityNotes: string (assessment of the branch's quality)

PRUNING CRITERIA:
- Prune branches with no supporting authority and no path to find any
- Prune branches whose legal theory is clearly inapplicable to the facts
- Flag for deepening: branches with a viable theory but insufficient authority
- Flag for deepening: branches where the application to facts is too abstract
- Flag suspected hallucinations: citations that include implausible reporter
  references, cases that don't sound like real decisions, or statutes cited
  without section numbers

Return a JSON array of BranchEvaluation objects.`
    }]
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '[]';
  return JSON.parse(text);
}
```


## Citation Verification: The Hallucination Problem


Authority accuracy is the universal bottleneck. In Experiment 03, all three variations
scored between 9 and 11 out of 20 on authority accuracy, the lowest criterion for
every variation. After the scorer was recalibrated to treat "plausible but
unverifiable" authorities as hallucinated, every pipeline variation was penalized. The
irony of the experiment was rich: the fact pattern involved an AI platform that
hallucinated case citations, and every pipeline variation analyzing that fact pattern
also produced unverifiable citations.


This is a fundamental limitation of current language models. The model generates
citations by predicting what a citation should look like based on its training data,
not by looking up cases in a legal database. A citation like *Smith v. Jones*, 547
F.3d 221 (3d Cir. 2008) might be entirely fabricated: the case name, the volume
number, the reporter, the page number, the court, and the year could all be generated
by statistical prediction rather than retrieval.


The tree-of-thought pipeline addresses this through a citation verification stage
that uses a Pass@k strategy: for each cited authority, the pipeline makes multiple
independent verification attempts. If multiple attempts consistently confirm the
citation exists and states the proposition for which it was cited, the citation is
retained. If verification attempts are inconsistent or produce contradictory
information, the citation is flagged as potentially hallucinated.


<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 380" font-family="Inter, system-ui, sans-serif">
  <defs>
    <marker id="arrow13-3" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="900" height="380" fill="#1a1a2e" rx="8"/>

  <!-- Title -->
  <text x="450" y="28" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Figure 13.3 — Pass@k Citation Verification Pipeline</text>

  <!-- Input: Citation from memo -->
  <rect x="30" y="60" width="240" height="50" rx="6" fill="#2c3e7a" stroke="#f39c12" stroke-width="1.5"/>
  <text x="150" y="82" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Citation Under Test</text>
  <text x="150" y="98" text-anchor="middle" fill="#aaa" font-size="9" font-style="italic">Smith v. Jones, 547 F.3d 221</text>

  <!-- k verification attempts -->
  <rect x="350" y="45" width="160" height="34" rx="4" fill="#2c3e7a" stroke="#16a085" stroke-width="1"/>
  <text x="430" y="66" text-anchor="middle" fill="white" font-size="10">Verifier Call 1</text>

  <rect x="350" y="90" width="160" height="34" rx="4" fill="#2c3e7a" stroke="#16a085" stroke-width="1"/>
  <text x="430" y="111" text-anchor="middle" fill="white" font-size="10">Verifier Call 2</text>

  <rect x="350" y="135" width="160" height="34" rx="4" fill="#2c3e7a" stroke="#16a085" stroke-width="1"/>
  <text x="430" y="156" text-anchor="middle" fill="white" font-size="10">Verifier Call 3</text>

  <!-- Arrows to verifiers -->
  <line x1="270" y1="75" x2="350" y2="62" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow13-3)"/>
  <line x1="270" y1="85" x2="350" y2="107" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow13-3)"/>
  <line x1="270" y1="95" x2="350" y2="152" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow13-3)"/>

  <!-- Consensus checker -->
  <rect x="590" y="75" width="160" height="60" rx="6" fill="#2c3e7a" stroke="#e74c3c" stroke-width="1.5"/>
  <text x="670" y="100" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Consensus</text>
  <text x="670" y="118" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Check</text>

  <line x1="510" y1="62" x2="590" y2="95" stroke="#16a085" stroke-width="1" marker-end="url(#arrow13-3)"/>
  <line x1="510" y1="107" x2="590" y2="105" stroke="#16a085" stroke-width="1" marker-end="url(#arrow13-3)"/>
  <line x1="510" y1="152" x2="590" y2="115" stroke="#16a085" stroke-width="1" marker-end="url(#arrow13-3)"/>

  <!-- Outcomes -->
  <rect x="800" y="55" width="80" height="30" rx="4" fill="#16a085" opacity="0.3" stroke="#16a085" stroke-width="1"/>
  <text x="840" y="74" text-anchor="middle" fill="#16a085" font-size="10" font-weight="bold">VERIFIED</text>

  <rect x="800" y="95" width="80" height="30" rx="4" fill="#f39c12" opacity="0.3" stroke="#f39c12" stroke-width="1"/>
  <text x="840" y="114" text-anchor="middle" fill="#f39c12" font-size="10" font-weight="bold">FLAGGED</text>

  <rect x="800" y="135" width="80" height="30" rx="4" fill="#e74c3c" opacity="0.3" stroke="#e74c3c" stroke-width="1"/>
  <text x="840" y="154" text-anchor="middle" fill="#e74c3c" font-size="10" font-weight="bold">REMOVED</text>

  <line x1="750" y1="95" x2="800" y2="70" stroke="#16a085" stroke-width="1" marker-end="url(#arrow13-3)"/>
  <line x1="750" y1="105" x2="800" y2="110" stroke="#f39c12" stroke-width="1"/>
  <line x1="750" y1="115" x2="800" y2="150" stroke="#e74c3c" stroke-width="1"/>

  <!-- Decision logic -->
  <rect x="30" y="200" width="840" height="100" rx="6" fill="#2c3e7a" opacity="0.4"/>
  <text x="450" y="225" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Pass@k Consensus Logic</text>

  <text x="60" y="252" fill="#16a085" font-size="11" font-weight="bold">VERIFIED (k/k agree "exists"):</text>
  <text x="60" y="270" fill="#aaa" font-size="10">All k verifiers confirm: case name, court, year, and holding are consistent. Citation retained.</text>

  <text x="60" y="292" fill="#f39c12" font-size="11" font-weight="bold">FLAGGED (mixed results):</text>
  <text x="60" y="310" fill="#aaa" font-size="10">Verifiers disagree on details (different year, different court, different holding). Flagged for attorney review.</text>

  <text x="60" y="332" fill="#e74c3c" font-size="11" font-weight="bold">REMOVED (k/k agree "not found"):</text>
  <text x="60" y="350" fill="#aaa" font-size="10">All k verifiers report inability to confirm. Citation removed. Proposition it supported flagged as unsupported.</text>
</svg>

*Figure 13.3 — The Pass@k citation verification pipeline. Each citation is verified
by k independent Claude calls. Consensus determines whether the citation is retained,
flagged for review, or removed. When a citation is removed, the legal proposition it
supported is marked as unsupported in the final memo.*


```typescript
// citation-verifier.ts
// Citation verification using Pass@k consensus
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface CitationCheck {
  citation: string;
  proposition: string;
  verificationResults: VerificationResult[];
  consensus: 'verified' | 'flagged' | 'removed';
}

interface VerificationResult {
  attemptNumber: number;
  exists: boolean;
  confidence: number;
  details: string;
  court?: string;
  year?: number;
  holdingSummary?: string;
}

// Extract all citations from a research memo
function extractCitations(memo: string): Array<{
  citation: string;
  proposition: string;
  location: number;
}> {
  // Match common legal citation patterns
  const patterns = [
    // Case citations: Name v. Name, Volume Reporter Page (Court Year)
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+v\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+\d+\s+\w+\.?\s*(?:\d+[a-z]*\.?\s*)?\d+(?:\s*\([^)]+\d{4}\))?/g,
    // Statute citations: Title USC Section
    /\d+\s+U\.S\.C\.\s*§\s*\d+(?:\([a-z]\))?/g,
    // UCC citations
    /U\.C\.C\.\s*§?\s*\d+-\d+/g,
    // Restatement citations
    /Restatement\s+\([^)]+\)\s+of\s+\w+\s*§?\s*\d+/g
  ];

  const citations: Array<{
    citation: string;
    proposition: string;
    location: number;
  }> = [];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(memo)) !== null) {
      // Extract surrounding context as the proposition
      const start = Math.max(0, match.index - 200);
      const end = Math.min(memo.length, match.index + match[0].length + 200);
      const context = memo.slice(start, end);

      citations.push({
        citation: match[0],
        proposition: context,
        location: match.index
      });
    }
  }

  return citations;
}

// Verify a single citation with k independent attempts
async function verifyCitation(
  citation: string,
  proposition: string,
  k: number = 3
): Promise<CitationCheck> {
  // Launch k independent verification calls in parallel
  const verificationResults = await Promise.allSettled(
    Array.from({ length: k }, (_, i) =>
      runSingleVerification(citation, proposition, i + 1)
    )
  );

  const results: VerificationResult[] = verificationResults
    .filter((r): r is PromiseFulfilledResult<VerificationResult> =>
      r.status === 'fulfilled')
    .map(r => r.value);

  // Determine consensus
  const existCount = results.filter(r => r.exists).length;
  const notExistCount = results.filter(r => !r.exists).length;

  let consensus: 'verified' | 'flagged' | 'removed';
  if (existCount === results.length) {
    consensus = 'verified';
  } else if (notExistCount === results.length) {
    consensus = 'removed';
  } else {
    consensus = 'flagged';
  }

  return { citation, proposition, verificationResults: results, consensus };
}

// A single verification attempt
async function runSingleVerification(
  citation: string,
  proposition: string,
  attemptNumber: number
): Promise<VerificationResult> {
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4_096,
    system: [
      'You are a legal citation verifier. Your ONLY job is to assess whether',
      'a cited legal authority actually exists and supports the proposition',
      'for which it is cited. Be rigorously honest. If you are not confident',
      'the citation exists, say so. Do not fabricate details to fill gaps.',
      'A citation is "plausible but unverifiable" if it LOOKS like a real',
      'citation but you cannot confirm its existence with certainty.'
    ].join(' '),
    messages: [{
      role: 'user',
      content: `Verify this legal citation:

CITATION: ${citation}

PROPOSITION IT SUPPORTS: ${proposition}

Answer these questions:
1. Does this case/statute/regulation actually exist? (true/false)
2. How confident are you? (0.0 to 1.0)
3. If it exists: what court decided it, what year, and what was the holding?
4. Does the holding actually support the proposition cited?
5. If you cannot confirm existence, explain why.

Be honest. "I cannot confirm this citation exists" is a valid and important answer.

Return JSON: { exists: boolean, confidence: number, details: string,
court?: string, year?: number, holdingSummary?: string }`
    }]
  });

  const response = await stream.finalMessage();
  const text = response.content.find(c => c.type === 'text')?.text ?? '{}';
  const parsed = JSON.parse(text);

  return { attemptNumber, ...parsed };
}

// Verify all citations in a research memo
async function verifyAllCitations(
  memo: string,
  k: number = 3
): Promise<CitationCheck[]> {
  const citations = extractCitations(memo);

  // Verify all citations in parallel
  const checks = await Promise.allSettled(
    citations.map(c => verifyCitation(c.citation, c.proposition, k))
  );

  return checks
    .filter((r): r is PromiseFulfilledResult<CitationCheck> =>
      r.status === 'fulfilled')
    .map(r => r.value);
}
```


> **Insight**
>
> Citation verification does not solve the hallucination problem. It manages it.
> The model verifying citations is the same model that generated them, so
> verification calls can also hallucinate. The Pass@k strategy mitigates this by
> requiring consensus: if three independent verification calls all confirm a
> citation exists with consistent details, the probability of a fabricated citation
> surviving verification drops significantly. But it does not drop to zero. This is
> why the HITL gate after citation verification is essential: the attorney must
> confirm that every authority cited in the memo is real before the memo is delivered.
> The pipeline reduces the attorney's citation-checking burden from every citation to
> only the flagged ones.


### Round 4: Argument Synthesis


The synthesizer is the critical architectural component. It receives the decomposition
tree, all surviving research branch results (after pruning), the citation verification
results, and the original input materials. It produces a single, coherent legal
research memorandum that integrates all specialist findings into a unified argument
structure.


The synthesizer's prompt is the most important prompt in the pipeline. It must
instruct the model to:

1. **Synthesize, not concatenate.** The output must read as a single-author document.
   No section headers indicating which specialist produced which analysis.

2. **Resolve conflicts.** When the claims researcher and the defenses researcher reach
   different conclusions about the same legal issue (for example, whether a limitation
   of liability clause is enforceable), the synthesizer must analyze both positions
   and state which is stronger and why.

3. **Eliminate redundancy.** If three specialists all discuss the same statute, the
   synthesizer must present the analysis once, in the context where it is most relevant.

4. **Build cross-domain arguments.** The synthesizer can see connections that no
   individual specialist could see: how the damages analysis affects the settlement
   strategy, how the procedural posture affects the claims selection, how the defense
   vulnerability affects the negotiation leverage.

5. **Organize by strength.** The strongest arguments go first. Weaker arguments that
   are still worth preserving appear later with appropriate caveats.


```typescript
// argument-synthesizer.ts
// Round 4: Synthesize surviving research branches into a unified memo
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

interface SynthesisInput {
  tree: ResearchTree;
  branchResults: BranchResearchResult[];
  evaluations: BranchEvaluation[];
  citationChecks: CitationCheck[];
  originalInput: ResearchInput;
}

async function synthesizeResearchMemo(
  input: SynthesisInput
): Promise<string> {
  // Filter to included branches only
  const includedBranches = input.branchResults.filter(branch => {
    const evaluation = input.evaluations.find(
      e => e.branchId === branch.branchId
    );
    return evaluation?.include ?? false;
  });

  // Build citation status report
  const citationStatus = input.citationChecks
    .filter(c => c.consensus !== 'verified')
    .map(c => `${c.consensus.toUpperCase()}: ${c.citation}`)
    .join('\n');

  // Build the combined specialist research block
  const researchBlock = includedBranches
    .map(b => `=== ${b.issueName} (${b.branchId}) ===\n` +
              `Strength: ${b.strengthAssessment}\n\n${b.analysis}`)
    .join('\n\n');

  const attachmentsBlock = input.originalInput.attachments
    .map(a => `--- ${a.title} (${a.type}) ---\n${a.content}\n--- END ---`)
    .join('\n\n');

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 128_000,
    system: [
      'You are a senior litigation partner synthesizing research from your team',
      'into a definitive legal memorandum. Multiple specialist researchers have',
      'independently analyzed different aspects of the same legal problem. Your',
      'job is to merge their findings into a single, comprehensive, authoritative',
      'research memorandum that could be presented to a client or supervising',
      'partner.',
      '',
      'CRITICAL: This is SYNTHESIS, not concatenation. The memo must read as if',
      'written by a single expert who analyzed every issue. Eliminate redundancy.',
      'Resolve conflicts between specialists with stated reasoning. Build',
      'cross-domain arguments that no individual specialist could construct.',
      'Organize by argument strength, strongest first.'
    ].join('\n'),
    messages: [{
      role: 'user',
      content: `Produce a comprehensive legal research memorandum.

ORIGINAL FACT PATTERN:
${input.originalInput.factPattern}

SUPPORTING DOCUMENTS:
${attachmentsBlock}

RESEARCH QUESTION:
${input.originalInput.researchQuestion}

SPECIALIST RESEARCH (${includedBranches.length} branches, post-pruning):
${researchBlock}

CITATION VERIFICATION STATUS:
${citationStatus || 'All citations verified.'}

CITATION INSTRUCTIONS:
- Citations marked REMOVED must not appear in the memo
- Citations marked FLAGGED should be replaced with "[citation verification pending]"
  and the underlying proposition should note the authority is unconfirmed
- Verified citations should be cited normally
- If a removed citation was the only support for a proposition, note the
  proposition is "supported by analogy to [related authority]" or acknowledge
  the gap honestly

MEMORANDUM FORMAT:
TO: Senior Partner
FROM: Research Team
DATE: ${new Date().toISOString().split('T')[0]}
RE: [Derive from fact pattern]

I. QUESTION PRESENTED
   State the precise legal questions.

II. BRIEF ANSWER
   Concise summary of conclusions (2-3 paragraphs). State the bottom line.

III. STATEMENT OF FACTS
   Narrative of relevant facts. Cite specific documents. Chronological.

IV. DISCUSSION
   Organize by legal issue using IRAC:
   A. State the legal standard with binding authority
   B. Apply the law to the specific facts
   C. Address counterarguments and weaknesses
   D. Assess position strength (strong/moderate/weak)

V. CONCLUSION AND RECOMMENDATIONS
   Specific, actionable recommendations:
   - Immediate actions (WHO does WHAT by WHEN)
   - Short-term strategy
   - Medium-term litigation plan
   - Settlement posture and range
   - Resource requirements
   - Key risks and contingencies

QUALITY STANDARDS:
- Every legal assertion supported by cited authority
- Apply law to THESE facts, not abstract rules
- Address the STRONGEST counterarguments
- Resolve conflicts between specialists with reasoning
- Eliminate all redundancy
- Recommendations specific enough for execution`
    }]
  });

  const response = await stream.finalMessage();
  return response.content.find(c => c.type === 'text')?.text ?? '';
}
```


### Round 5: Research Memo Assembly and HITL Gate


The final round takes the synthesized memorandum, attaches the citation verification
report, and presents both to the supervising attorney for review. The attorney's review
focuses on three things: (1) Are the flagged citations real? (2) Does the analysis
correctly apply the law to the facts? (3) Are the recommendations sound?


The HITL gate is not a rubber stamp. It is the point where attorney judgment
supplements AI analysis. The pipeline identified the issues, researched the authority,
applied the law, and constructed the argument. The attorney verifies that the
construction is sound, the citations are real, and the recommendations are appropriate
for the client's specific circumstances.


> **Practice Tip**
>
> Present the citation verification report to the attorney as a prioritized list:
> removed citations first (these need replacement authority), flagged citations second
> (these need manual verification in Westlaw or Lexis), verified citations last
> (these are low-priority for review). This ordering ensures the attorney spends
> their limited review time on the citations most likely to be hallucinated.


## The IRAC Pattern in Pipeline Terms


Legal research memoranda follow the IRAC structure: Issue, Rule, Application,
Conclusion. This structure maps directly onto the pipeline architecture:


| IRAC Component | Pipeline Stage | What It Produces |
|---|---|---|
| **Issue** | Round 1: Decomposition | Identifies the legal issues from the fact pattern |
| **Rule** | Round 2: Research | Finds the governing legal standards and authority |
| **Application** | Rounds 3-4: Evaluation + Synthesis | Applies the rules to the specific facts |
| **Conclusion** | Round 5: Memo Assembly | States the legal conclusion and recommendations |


The mapping is not coincidental. IRAC is the standard legal analysis framework because
it reflects how legal reasoning actually works. You cannot apply a rule until you know
what the rule is. You cannot reach a conclusion until you have applied the rule to the
facts. The pipeline's sequential rounds enforce this logical dependency: research cannot
begin until decomposition identifies the issues, synthesis cannot begin until research
provides the authority, and the memo cannot be assembled until synthesis produces the
argument.


<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300" font-family="Inter, system-ui, sans-serif">
  <defs>
    <marker id="arrow13-4" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="900" height="300" fill="#1a1a2e" rx="8"/>

  <!-- Title -->
  <text x="450" y="28" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Figure 13.4 — IRAC Framework Mapped to Pipeline Architecture</text>

  <!-- IRAC column headers -->
  <text x="120" y="65" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">ISSUE</text>
  <text x="340" y="65" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">RULE</text>
  <text x="570" y="65" text-anchor="middle" fill="#e74c3c" font-size="13" font-weight="bold">APPLICATION</text>
  <text x="790" y="65" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">CONCLUSION</text>

  <!-- Pipeline stage boxes -->
  <rect x="30" y="80" width="180" height="60" rx="6" fill="#2c3e7a" stroke="#16a085" stroke-width="1.5"/>
  <text x="120" y="102" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Round 1</text>
  <text x="120" y="118" text-anchor="middle" fill="#aaa" font-size="9">Decompose question</text>
  <text x="120" y="132" text-anchor="middle" fill="#aaa" font-size="9">into research tree</text>

  <rect x="250" y="80" width="180" height="60" rx="6" fill="#2c3e7a" stroke="#f39c12" stroke-width="1.5"/>
  <text x="340" y="102" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Round 2</text>
  <text x="340" y="118" text-anchor="middle" fill="#aaa" font-size="9">Parallel researchers</text>
  <text x="340" y="132" text-anchor="middle" fill="#aaa" font-size="9">find governing authority</text>

  <rect x="480" y="80" width="180" height="60" rx="6" fill="#2c3e7a" stroke="#e74c3c" stroke-width="1.5"/>
  <text x="570" y="102" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Rounds 3-4</text>
  <text x="570" y="118" text-anchor="middle" fill="#aaa" font-size="9">Evaluate, prune, verify</text>
  <text x="570" y="132" text-anchor="middle" fill="#aaa" font-size="9">citations, synthesize</text>

  <rect x="700" y="80" width="180" height="60" rx="6" fill="#16a085" opacity="0.8"/>
  <text x="790" y="102" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Round 5</text>
  <text x="790" y="118" text-anchor="middle" fill="white" font-size="9">Assemble memo</text>
  <text x="790" y="132" text-anchor="middle" fill="white" font-size="9">attorney HITL review</text>

  <!-- Arrows -->
  <line x1="210" y1="110" x2="250" y2="110" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow13-4)"/>
  <line x1="430" y1="110" x2="480" y2="110" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow13-4)"/>
  <line x1="660" y1="110" x2="700" y2="110" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow13-4)"/>

  <!-- Legal reasoning row -->
  <rect x="30" y="165" width="180" height="50" rx="4" fill="#16a085" opacity="0.1" stroke="#16a085" stroke-width="1"/>
  <text x="120" y="185" text-anchor="middle" fill="#16a085" font-size="10">"What legal issues</text>
  <text x="120" y="200" text-anchor="middle" fill="#16a085" font-size="10">arise from these facts?"</text>

  <rect x="250" y="165" width="180" height="50" rx="4" fill="#f39c12" opacity="0.1" stroke="#f39c12" stroke-width="1"/>
  <text x="340" y="185" text-anchor="middle" fill="#f39c12" font-size="10">"What does the law</text>
  <text x="340" y="200" text-anchor="middle" fill="#f39c12" font-size="10">say about each issue?"</text>

  <rect x="480" y="165" width="180" height="50" rx="4" fill="#e74c3c" opacity="0.1" stroke="#e74c3c" stroke-width="1"/>
  <text x="570" y="185" text-anchor="middle" fill="#e74c3c" font-size="10">"How does the law</text>
  <text x="570" y="200" text-anchor="middle" fill="#e74c3c" font-size="10">apply to THESE facts?"</text>

  <rect x="700" y="165" width="180" height="50" rx="4" fill="#16a085" opacity="0.1" stroke="#16a085" stroke-width="1"/>
  <text x="790" y="185" text-anchor="middle" fill="#16a085" font-size="10">"What should the</text>
  <text x="790" y="200" text-anchor="middle" fill="#16a085" font-size="10">client do about it?"</text>

  <!-- Bottom summary -->
  <rect x="100" y="240" width="700" height="40" rx="4" fill="#2c3e7a" opacity="0.5"/>
  <text x="450" y="260" text-anchor="middle" fill="white" font-size="11">IRAC is not just a legal framework. It is a dependency graph.</text>
  <text x="450" y="275" text-anchor="middle" fill="#aaa" font-size="10">Each stage requires the output of the prior stage. The pipeline enforces this naturally.</text>
</svg>

*Figure 13.4 — The IRAC legal analysis framework maps directly to the pipeline's
sequential rounds. Issue identification (decomposition) must precede rule
identification (research), which must precede application (synthesis), which must
precede conclusion (memo assembly). The pipeline enforces this dependency by
design.*


## The Complete Pipeline Orchestrator


The backautocrat chains all five rounds into a single end-to-end pipeline. It manages
the flow of data between rounds, tracks metrics across all Claude calls, and produces
the final research deliverable.


```typescript
// research-backautocrat.ts
// Top-level orchestrator for the legal research pipeline
import Anthropic from '@anthropic-ai/sdk';

interface ResearchPipelineResult {
  memo: string;
  citationReport: CitationCheck[];
  branchEvaluations: BranchEvaluation[];
  metrics: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalLatencyMs: number;
    totalCostUsd: number;
    totalClaudeCalls: number;
    roundMetrics: Array<{
      round: string;
      inputTokens: number;
      outputTokens: number;
      latencyMs: number;
      claudeCalls: number;
    }>;
  };
}

async function runResearchPipeline(
  input: ResearchInput
): Promise<ResearchPipelineResult> {
  const startTime = Date.now();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalClaudeCalls = 0;
  const roundMetrics: ResearchPipelineResult['metrics']['roundMetrics'] = [];

  // ── Round 1: Question Decomposition ──────────────────────────────────
  console.log('[Research] Round 1: Decomposing research question');
  const r1Start = Date.now();
  const tree = await decomposeResearchQuestion(input);
  roundMetrics.push({
    round: 'decomposition',
    inputTokens: 0, outputTokens: 0,  // tracked internally
    latencyMs: Date.now() - r1Start,
    claudeCalls: 1
  });
  totalClaudeCalls += 1;
  console.log(`[Research] Identified ${tree.branches.length} research branches`);

  // ── Round 2: Parallel Research ───────────────────────────────────────
  console.log('[Research] Round 2: Executing parallel researchers');
  const r2Start = Date.now();
  const branchResults = await executeParallelResearch(tree, input);
  const r2Latency = Date.now() - r2Start;

  // Accumulate metrics from researchers
  let r2Input = 0, r2Output = 0;
  for (const result of branchResults) {
    r2Input += result.inputTokens;
    r2Output += result.outputTokens;
  }
  totalInputTokens += r2Input;
  totalOutputTokens += r2Output;
  totalClaudeCalls += branchResults.length;

  roundMetrics.push({
    round: 'parallel-research',
    inputTokens: r2Input,
    outputTokens: r2Output,
    latencyMs: r2Latency,
    claudeCalls: branchResults.length
  });

  // ── Round 3: Branch Evaluation + Citation Verification ───────────────
  console.log('[Research] Round 3: Evaluating branches and verifying citations');
  const r3Start = Date.now();

  // Run evaluation and citation verification in parallel
  const [evaluations, citationChecks] = await Promise.all([
    evaluateResearchBranches(branchResults, tree),
    // Verify citations from all branch results
    verifyAllCitations(
      branchResults.map(b => b.analysis).join('\n\n'),
      3  // k=3 verification attempts per citation
    )
  ]);

  roundMetrics.push({
    round: 'evaluation-verification',
    inputTokens: 0, outputTokens: 0,
    latencyMs: Date.now() - r3Start,
    claudeCalls: 1 + citationChecks.length * 3  // evaluator + k * citations
  });

  // Log pruning decisions
  const included = evaluations.filter(e => e.include).length;
  const pruned = evaluations.filter(e => !e.include).length;
  const flaggedCitations = citationChecks.filter(c => c.consensus !== 'verified').length;
  console.log(`[Research] Branches: ${included} included, ${pruned} pruned`);
  console.log(`[Research] Citations: ${flaggedCitations} flagged out of ${citationChecks.length}`);

  // ── Optional: Deepen flagged branches ────────────────────────────────
  const needsDeepening = evaluations.filter(e => e.needsDeepening);
  if (needsDeepening.length > 0) {
    console.log(`[Research] Deepening ${needsDeepening.length} branches`);
    // Execute additional research on branches that need it
    // (Implementation follows the same pattern as Round 2)
  }

  // ── Round 4: Argument Synthesis ──────────────────────────────────────
  console.log('[Research] Round 4: Synthesizing research memo');
  const r4Start = Date.now();
  const memo = await synthesizeResearchMemo({
    tree,
    branchResults,
    evaluations,
    citationChecks,
    originalInput: input
  });

  roundMetrics.push({
    round: 'synthesis',
    inputTokens: 0, outputTokens: 0,
    latencyMs: Date.now() - r4Start,
    claudeCalls: 1
  });
  totalClaudeCalls += 1;

  // ── Round 5: Assembly ────────────────────────────────────────────────
  // The memo is complete. Attach citation report and present for HITL review.
  const totalLatencyMs = Date.now() - startTime;
  const totalCostUsd = (totalInputTokens * 15 + totalOutputTokens * 75) / 1_000_000;

  console.log(`[Research] Pipeline complete in ${(totalLatencyMs / 60_000).toFixed(1)} minutes`);
  console.log(`[Research] Cost: $${totalCostUsd.toFixed(2)}, Calls: ${totalClaudeCalls}`);

  return {
    memo,
    citationReport: citationChecks,
    branchEvaluations: evaluations,
    metrics: {
      totalInputTokens,
      totalOutputTokens,
      totalLatencyMs,
      totalCostUsd,
      totalClaudeCalls,
      roundMetrics
    }
  };
}
```


## Architecture Selection: When to Use Which Pipeline


Not every research question requires the full tree-of-thought pipeline. The right
architecture depends on the complexity of the question and the stakes of the answer.


| Question Complexity | Recommended Architecture | Claude Calls | Approx. Cost |
|---|---|---|---|
| Simple, single-issue | Single researcher (V1) | 1 | $0.30 |
| Moderate, 2-3 issues | Researcher + synthesizer | 2-3 | $0.60-$1.00 |
| Complex, multi-domain | Full tree-of-thought (V3) | 6-10 | $2.00-$5.00 |
| Bet-the-company litigation | Full pipeline + deep research + k=5 verification | 15-25 | $10.00-$25.00 |


The single-researcher architecture (V1 from Experiment 03) is the right choice for
routine research queries where efficiency matters more than marginal quality. It
produces a 73/100 memorandum for $0.30 in 7 minutes. For a legal department answering
ten research questions a day, V1 at $3.00 per day is the clear choice.


The full tree-of-thought pipeline is the right choice for high-stakes matters where a
4-point quality improvement justifies an 8x cost increase. A $12 million malpractice
defense, a bet-the-company antitrust investigation, a complex multi-jurisdictional
regulatory matter. For these matters, the additional $2.15 per run is rounding error
in the overall matter budget.


> **Insight**
>
> The single-pass baseline is not an inferior architecture to be dismissed. Claude
> Opus scoring 73/100 on complex litigation research in a single call for $0.30 is a
> remarkable capability. The model's quality floor is high enough that single-pass
> research is genuinely useful for most routine questions. The multi-agent pipeline
> lifts the ceiling for complex, high-stakes research where every point of quality
> matters. The art of legal engineering is matching the architecture to the stakes.


## Production Considerations


### Streaming for Long Research Memos


Legal research memoranda can be lengthy. A comprehensive memo on complex litigation
can exceed 15,000 words, consuming 20,000 or more output tokens. Without streaming,
a single Claude call generating this volume of output risks connection timeout. The
production pipeline streams every call using `client.messages.stream()` with
`await stream.finalMessage()`, the standard pattern from Chapter 1. This keeps the
HTTP connection alive throughout the generation process.


### Structured Outputs for Pipeline Stages


The decomposition (Round 1) and evaluation (Round 3) stages produce structured data
that downstream stages must parse. Use structured outputs with JSON schemas for these
stages to guarantee valid, parseable output. The research (Round 2) and synthesis
(Round 4) stages produce prose and should use natural language output.


```typescript
// structured-decomposition.ts
// Use structured outputs for the decomposition stage
const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 32_000,
  messages: [{ role: 'user', content: decompositionPrompt }],
  output_config: {
    format: {
      type: 'json_schema',
      schema: {
        type: 'object',
        properties: {
          questionSummary: { type: 'string' },
          jurisdictions: {
            type: 'array',
            items: { type: 'string' }
          },
          branches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                branchId: { type: 'string' },
                issueName: { type: 'string' },
                specialistRole: { type: 'string' },
                researchQuery: { type: 'string' },
                keyAuthorities: {
                  type: 'array',
                  items: { type: 'string' }
                },
                relevantFacts: {
                  type: 'array',
                  items: { type: 'string' }
                },
                priority: { type: 'number' },
                parentBranchId: {
                  type: ['string', 'null']
                }
              },
              required: [
                'branchId', 'issueName', 'specialistRole',
                'researchQuery', 'keyAuthorities', 'relevantFacts',
                'priority', 'parentBranchId'
              ],
              additionalProperties: false
            }
          },
          interdependencies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                branchA: { type: 'string' },
                branchB: { type: 'string' },
                nature: { type: 'string' }
              },
              required: ['branchA', 'branchB', 'nature'],
              additionalProperties: false
            }
          }
        },
        required: [
          'questionSummary', 'jurisdictions',
          'branches', 'interdependencies'
        ],
        additionalProperties: false
      }
    }
  }
});
```


### Token Budget for Research


The research pipeline consumes more tokens than most other workflows because it
processes the same fact pattern and attachments multiple times: once in the
decomposer, once per researcher (4 times), once in the evaluator, once in the
synthesizer. The input materials are duplicated across 7 or more calls. For a fact
pattern with 20,000 tokens of source material, the total input token consumption is
approximately:


| Stage | Input Tokens | Output Tokens |
|---|---|---|
| Decomposition | 25,000 | 3,000 |
| Research (4 parallel) | 25,000 x 4 = 100,000 | 15,000 x 4 = 60,000 |
| Evaluation | 70,000 | 5,000 |
| Citation verification (20 citations x k=3) | 2,000 x 60 = 120,000 | 500 x 60 = 30,000 |
| Synthesis | 150,000 | 20,000 |
| **Total** | **~465,000** | **~118,000** |
| **Estimated cost at Opus pricing** | | **~$15.80** |


For complex, high-stakes research, this cost is negligible compared to the 8 to 15
hours of associate time the pipeline replaces ($3,000 to $7,500 at standard billing
rates). For routine research, the single-researcher architecture at $0.30 per run is
the appropriate choice.


### Scorer Calibration: Evaluating Research Quality


The TLE R&D experiment revealed a critical insight about scoring legal research:
a scorer that evaluates only content completeness cannot differentiate pipeline
architectures. The original scorer produced a 2-point spread (80/82/82) across three
architecturally distinct variations because it asked "did the memo mention this
issue?" without asking "is the memo usable as a deliverable?"


The recalibrated scorer added six critical features:


1. **Document usability assessment**: Does the memo have structure, an executive
   summary, cross-domain synthesis, and appropriate length?
2. **Fragmentation penalty**: Concatenated specialist dumps are capped at 10/20 on
   actionability regardless of content quality.
3. **Redundancy penalty**: Significant redundancy caps analysis depth at 14/20.
4. **The Partner Test**: Would you hand this to a client without modification?
5. **Unverifiable authority treatment**: "Plausible but unverifiable" citations count
   as hallucinated.
6. **Anti-inflation triggers**: Tightened to detect scoring patterns where all criteria
   receive near-perfect scores.


These features produced an 18-point spread (59/73/77) that clearly differentiated the
three architectures. The lesson applies beyond R&D: when building quality assessors for
production research pipelines, evaluate the output as a deliverable, not as an
information source.


---


**Key Takeaways**

- Parallelization without synthesis produces worse results than single-pass AI. TLE R&D Experiment 03 proved this empirically: V2 (parallel researchers, no synthesis) scored 60.5/100, below the single-pass baseline of 73/100. V3 (parallel researchers plus synthesizer) scored 77/100. The synthesizer is the mandatory architectural component.
- Tree-of-thought argument construction mirrors how attorneys actually research legal questions: decompose into branches, research each branch independently, evaluate the strength of each path, prune weak theories, deepen strong ones, and synthesize surviving branches into a coherent argument.
- The five-round pipeline (decomposition, parallel research, evaluation and pruning, synthesis, memo assembly with HITL gate) enforces the IRAC dependency graph: issues must be identified before rules are researched, rules must be found before application to facts, and application must occur before conclusions are drawn.
- Citation verification using Pass@k consensus reduces but does not eliminate hallucination risk. Multiple independent verification attempts that agree on a citation's existence provide higher confidence than any single check. But the attorney must still verify flagged citations before delivery.
- Authority accuracy is the universal bottleneck: all three pipeline variations in Experiment 03 scored 9 to 11 out of 20 on this criterion. This is a model-level limitation, not an architecture-level limitation, and it makes the HITL citation review gate essential for all legal research pipelines.
- Architecture selection should match the stakes: single-pass for routine queries ($0.30, 73/100), full pipeline for high-stakes matters ($2.45, 77/100), deep pipeline with expanded verification for bet-the-company litigation ($15-$25, maximum quality).
- The cost of the full pipeline ($2.45 per run) is negligible compared to the 8 to 15 hours of associate time it replaces ($3,000 to $7,500 at standard billing rates). The question is never "can we afford the pipeline?" but "does this matter warrant the pipeline's maximum quality?"
- Scorer calibration is itself a critical variable. A scorer evaluating content completeness alone cannot differentiate pipeline architectures because more Claude calls always produce more content. The scorer must evaluate the output as a deliverable: structure, usability, coherence, and redundancy matter as much as issue coverage.

\newpage
