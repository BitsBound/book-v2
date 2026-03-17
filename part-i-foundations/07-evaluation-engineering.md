\newpage

# Chapter 7: Evaluation Engineering

*Proving Your Pipeline Works*

A pipeline without evaluation is a demo. A pipeline with evaluation is evidence. This
chapter teaches you how to build the evidence.

Everything you have learned in Chapters 1 through 6 converges here. TIRO gave you the
decomposition pattern. Orchestration gave you the architectural vocabulary: sequential
chains, parallel swarms, routers, evaluator-optimizers. Integration gave you the delivery
mechanisms: OOXML Track Changes, Server-Sent Events, typed API contracts. Professional
responsibility gave you the constraints: privilege boundaries, supervision duties,
competence obligations. Now you need to answer the question that every client, every
managing partner, every general counsel, and every opposing counsel will eventually ask:
how do you know this works?

The answer is evaluation engineering. Not a demo. Not a screenshot. Not a conversation
that went well once. Systematic, reproducible, rubric-scored evaluation that produces
numerical evidence of pipeline quality across multiple runs, multiple inputs, and
multiple architectural variations. Evaluation engineering is what separates a prototype
from a product, a claim from a proof, and a legal engineering practice from a prompt
engineering hobby.

This chapter covers the complete evaluation discipline. We begin with why evaluation
matters more than most engineers realize, then establish the three fundamental approaches
to AI-as-judge evaluation drawn from Chip Huyen's framework in *AI Engineering*. We build
a production scorer diplomat in TypeScript, examining every design decision from
diagnostic-first methodology to strict scoring bands. We confront the biases that corrupt
AI judges and the techniques that mitigate them. We introduce Pass@k reliability
testing, because a pipeline that scores 90 once and 60 the next time is not a 90-quality
pipeline. We develop cost engineering as a quantitative discipline, because a pipeline
that costs $47 per run had better produce output worth $47. And we ground every concept
in empirical evidence from three TLE R&D experiments that produced findings no one
expected.


> **Key Concept**
>
> Evaluation engineering is the discipline of building automated, reproducible quality
> assessment systems for AI pipeline output. It treats evaluation not as an afterthought
> but as a first-class component of the pipeline architecture, requiring its own design
> patterns, its own failure modes, and its own iterative refinement cycle.


\newpage

## 7.1 Why Evaluation Engineering Matters

### The Credibility Problem

Every legal AI vendor claims their product is accurate. Every demo shows the happy path.
Every pitch deck presents the best-case output. Without systematic evaluation, these
claims are unfalsifiable. A prospective client cannot distinguish a pipeline that
produces partner-level work product 95% of the time from one that produces it 40% of
the time, because both vendors will show the same carefully selected demo.

This is not a hypothetical concern. The legal AI market is flooded with products that
perform well in controlled demonstrations and poorly in production. The gap between demo
quality and production quality is the defining problem of legal AI adoption, and it
exists because most builders never develop the evaluation infrastructure to measure it.

Evaluation engineering solves this problem by producing data. Not impressions, not
testimonials, not cherry-picked examples. Structured, numerical, reproducible data that
answers specific questions: What does this pipeline score against a defined rubric? How
consistent is that score across repeated runs? How does it compare to alternative
architectures? What does it cost per quality point? Where does it fail, and how
predictably?

Without this data, you cannot:

- **Prove your pipeline outperforms a single prompt.** You believe multi-agent
  architecture produces better output. Your intuition may be correct. But intuition is
  not evidence, and "it seems better" is not a quality metric. Evaluation gives you the
  number: 92/100 vs. 70/100, measured across four runs with a standard deviation of 0.5.

- **Detect quality regressions.** You updated a prompt. You changed a model version.
  You added a new specialist agent. Did quality improve, degrade, or stay the same? Without
  baseline evaluation data, you cannot answer this question. With it, you run the new
  configuration against the same inputs and compare scores.

- **Compare architectural decisions.** Should you use 10 parallel specialists or 16?
  Should the synthesizer receive raw specialist output or summarized output? Should the
  editor critique or rewrite? These are engineering decisions with measurable consequences,
  but only if you have the evaluation infrastructure to measure them.

- **Justify pricing with data.** When TLE Practice quotes $75,000 for a custom AI
  workflow, the client needs to understand what they are buying. Evaluation data transforms
  the conversation from "trust us, it works" to "here is what a single-prompt approach
  scores on your document type, here is what our engineered pipeline scores, and here is
  the statistical confidence across multiple runs."

- **Publish research findings.** TLE R&D exists to produce empirical evidence about
  legal AI pipeline architectures. Every finding, every publication, every Academy lesson
  derived from R&D experiments depends on evaluation data. Without the scorer, the
  experiments produce output. With the scorer, they produce knowledge.


### The CLE Evidence: 3.9x in One Number

The most powerful demonstration of why evaluation matters came from a continuing legal
education presentation where we compared a single-prompt approach against a 26-agent
pipeline analyzing the same 42,274-word M&A stock purchase agreement. Both used the same
frontier model. Both had access to the same document. The only difference was
architecture.

The single prompt produced 35 track changes with zero legal citations.

The 26-agent pipeline produced 138 track changes with 18 legal citations.

That is a 3.9x improvement in coverage and an infinite improvement in citation density,
with zero change in model capability. The model did not get smarter between the two
runs. The architecture made the difference.

But here is the critical point: **those numbers only exist because we built evaluation
infrastructure to count them.** Without a systematic method for counting track changes,
classifying their quality, and verifying citations, the comparison would have been
subjective. "The pipeline output looked more thorough." That is not a finding. That is
an impression. The evaluation framework converted an impression into evidence, and that
evidence became the centerpiece of every subsequent presentation, publication, and sales
conversation.


> **Insight**
>
> The pipeline is not the product. The evaluation of the pipeline is the product. A
> client does not buy an architecture diagram. A client buys demonstrated, measured,
> reproducible quality improvement. The evaluation framework is what makes quality
> demonstrable.


### The Evidence Hierarchy

Not all evidence is created equal. In legal engineering, the strength of your quality
claims depends on the rigor of your evaluation methodology. The evidence hierarchy,
from weakest to strongest:

1. **Anecdotal demonstration.** "I ran it once and the output looked good." This is
   where most legal AI products stop. It proves nothing except that the pipeline can
   produce acceptable output under ideal conditions.

2. **Single-run scoring.** "An AI judge scored the output 85/100." Better, but a
   single score from a single run tells you nothing about consistency. The same pipeline
   might score 65 on the next run.

3. **Multi-run scoring.** "The pipeline scored 82-88 across five runs (mean 85.2,
   standard deviation 2.3)." Now you have reliability data. The range tells you the
   pipeline's consistency envelope.

4. **Comparative evaluation.** "The engineered pipeline scored 85.2 mean vs. the
   single-prompt baseline at 70.4 mean, a 14.8-point improvement." Now you have a
   controlled comparison. You can quantify the value of your architecture.

5. **Multi-dimensional comparative evaluation with cost analysis.** "The engineered
   pipeline scored 91.75 mean (SD 0.50) vs. the baseline at 87.0 mean (SD 1.41) across
   four criteria, at $3.00 per run vs. $0.24, with the improvement concentrated in
   completeness (+1.25), accuracy (+1.0), enforceability (+1.5), and organization
   (+1.0)." This is production evidence. You know what improved, by how much, at what
   cost, and with what consistency.

Every level of the hierarchy requires more evaluation infrastructure than the last. This
chapter gives you the infrastructure for level 5.


---

**Key Takeaways**

- Evaluation engineering produces data, not impressions. Structured, numerical, reproducible data that answers specific questions about pipeline quality, consistency, and cost.
- The CLE evidence (3.9x coverage, 18 vs. 0 citations) demonstrates that the most powerful pipeline claims require evaluation infrastructure to exist at all.
- Five levels of evidence quality exist, from anecdotal demonstration to multi-dimensional comparative evaluation with cost analysis. This chapter provides the tools for level 5.

\newpage

## 7.2 The Three Approaches to AI-as-Judge

### Why AI Judges AI

Human evaluation of AI output does not scale. A senior associate reviewing a single
contract analysis takes 30 to 60 minutes. A TLE R&D experiment produces three pipeline
variations, each generating output that must be scored. Running that experiment five
times for reliability data means fifteen evaluations. If each evaluation takes 45
minutes, you need 11.25 hours of senior associate time for a single experiment. At
BigLaw rates, that is $5,000 to $10,000 in evaluation cost alone, before you have
written a single line of code.

AI-as-judge replaces that human evaluation with a model-powered scorer that costs
pennies per evaluation and completes in minutes. The trade-off is obvious: you sacrifice
the irreplaceable judgment of a human expert for the scalability and consistency of an
automated system. The question is whether that trade-off produces reliable enough
results to drive engineering decisions.

The empirical answer, validated across hundreds of studies and confirmed in our own R&D
program, is yes, with caveats. AI judges correlate strongly with human expert judgment
when the evaluation is structured around specific, well-defined criteria. They fail when
asked for holistic, unstructured quality assessments. The difference is rubric design,
and we will spend considerable time on that topic in Section 7.5.

Chip Huyen's *AI Engineering* identifies three fundamental approaches to AI-as-judge
evaluation, each suited to different evaluation contexts. Understanding all three is
essential because different stages of the legal engineering lifecycle call for different
approaches.


### Approach 1: Pointwise Scoring (Individual Response Evaluation)

Pointwise scoring evaluates a single output against a defined rubric. The judge receives
the pipeline output, the original input, and a scoring rubric with specific criteria. It
produces a numerical score for each criterion along with reasoning that justifies each
score.

This is the approach TLE R&D uses for all experiments. The scorer receives a contract
draft and a playbook, or a triage report and a document batch, or a research memorandum
and a fact pattern. It evaluates the output against four or five rubric criteria, each
scored on a 0-25 or 0-20 scale, producing a total score out of 100.

**When to use pointwise scoring:**

- Production quality gates: score every pipeline output and flag anything below threshold
  for human review
- R&D experiments: score each variation's output against the same rubric for direct
  numerical comparison
- Regression testing: score outputs from a new pipeline version against the same inputs
  and compare to historical baselines
- Client reporting: produce quality metrics for delivered work product

**Strengths:**

- Produces absolute scores that are comparable across runs, inputs, and time periods
- Each criterion score pinpoints specific quality dimensions, enabling targeted
  improvement
- Scales linearly: scoring 100 outputs costs 100x a single evaluation, with no
  interaction effects

**Weaknesses:**

- Scores are only meaningful relative to the rubric; a different rubric produces
  different scores
- Score calibration requires iterative refinement; initial rubrics almost always need
  adjustment
- Susceptible to grade inflation without strict scoring bands and diagnostic requirements

The following diagram illustrates the pointwise scoring flow:

```svg
<svg viewBox="0 0 800 320" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <defs>
    <marker id="arrow1" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="800" height="320" fill="#f8f9fa" rx="8"/>

  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 7.1: Pointwise Scoring — Individual Response Evaluation</text>

  <!-- Pipeline Output box -->
  <rect x="30" y="60" width="160" height="80" rx="6" fill="#1a1a2e"/>
  <text x="110" y="95" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Pipeline Output</text>
  <text x="110" y="115" text-anchor="middle" font-size="10" fill="#a0a0b0">(contract, memo,</text>
  <text x="110" y="130" text-anchor="middle" font-size="10" fill="#a0a0b0">triage report)</text>

  <!-- Rubric box -->
  <rect x="30" y="170" width="160" height="80" rx="6" fill="#1a1a2e"/>
  <text x="110" y="200" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Scoring Rubric</text>
  <text x="110" y="220" text-anchor="middle" font-size="10" fill="#a0a0b0">(criteria, bands,</text>
  <text x="110" y="235" text-anchor="middle" font-size="10" fill="#a0a0b0">hard caps)</text>

  <!-- Original Input box -->
  <rect x="30" y="270" width="160" height="40" rx="6" fill="#1a1a2e"/>
  <text x="110" y="295" text-anchor="middle" font-size="11" fill="white" font-weight="bold">Original Input</text>

  <!-- Arrows to Scorer -->
  <line x1="190" y1="100" x2="290" y2="160" stroke="#16a085" stroke-width="2" marker-end="url(#arrow1)"/>
  <line x1="190" y1="210" x2="290" y2="175" stroke="#16a085" stroke-width="2" marker-end="url(#arrow1)"/>
  <line x1="190" y1="290" x2="290" y2="190" stroke="#16a085" stroke-width="2" marker-end="url(#arrow1)"/>

  <!-- Scorer box -->
  <rect x="300" y="120" width="200" height="100" rx="6" fill="#16a085"/>
  <text x="400" y="155" text-anchor="middle" font-size="13" fill="white" font-weight="bold">AI Scorer</text>
  <text x="400" y="175" text-anchor="middle" font-size="10" fill="white">(Claude Opus 4.6)</text>
  <text x="400" y="195" text-anchor="middle" font-size="10" fill="white">Diagnostic-First Evaluation</text>

  <!-- Arrow to Scores -->
  <line x1="500" y1="170" x2="570" y2="170" stroke="#16a085" stroke-width="2" marker-end="url(#arrow1)"/>

  <!-- Score Output box -->
  <rect x="580" y="70" width="190" height="200" rx="6" fill="#1a1a2e"/>
  <text x="675" y="95" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Score Result</text>
  <line x1="600" y1="105" x2="750" y2="105" stroke="#2a2a3e" stroke-width="1"/>
  <text x="605" y="125" font-size="10" fill="#16a085">Completeness:</text>
  <text x="720" y="125" font-size="11" fill="white" font-weight="bold">22/25</text>
  <text x="605" y="145" font-size="10" fill="#16a085">Accuracy:</text>
  <text x="720" y="145" font-size="11" fill="white" font-weight="bold">23/25</text>
  <text x="605" y="165" font-size="10" fill="#16a085">Enforceability:</text>
  <text x="720" y="165" font-size="11" fill="white" font-weight="bold">21/25</text>
  <text x="605" y="185" font-size="10" fill="#16a085">Organization:</text>
  <text x="720" y="185" font-size="11" fill="white" font-weight="bold">23/25</text>
  <line x1="600" y1="195" x2="750" y2="195" stroke="#2a2a3e" stroke-width="1"/>
  <text x="605" y="215" font-size="11" fill="#f39c12" font-weight="bold">Total:</text>
  <text x="720" y="215" font-size="13" fill="#f39c12" font-weight="bold">89/100</text>
  <text x="605" y="240" font-size="9" fill="#a0a0b0">+ reasoning per criterion</text>
  <text x="605" y="255" font-size="9" fill="#a0a0b0">+ diagnostic inventory</text>
</svg>
```


### Approach 2: Pairwise Comparison (Generated Response Comparison)

Pairwise comparison presents two outputs to the judge and asks which is better. The
judge receives Output A and Output B (with the original input for context) and produces
a preference: A is better, B is better, or they are equivalent. Optionally, the judge
provides reasoning for the preference.

This approach is particularly useful when you need to rank pipeline variations but do
not need absolute scores. If your question is "does the 10-specialist pipeline produce
better output than the 2-pass pipeline?", pairwise comparison answers it directly
without requiring you to design a calibrated scoring rubric.

**When to use pairwise comparison:**

- A/B testing pipeline variations where relative ranking matters more than absolute score
- Model comparison studies (does Opus outperform Sonnet on this task?)
- Prompt engineering iteration where you want to quickly test whether a prompt change
  helped or hurt
- User preference studies where you present both outputs to a client and record their
  choice

**Strengths:**

- Easier to calibrate than pointwise scoring; "which is better" is a simpler judgment
  than "assign a score of 0-25"
- More sensitive to small quality differences that absolute scoring might not capture
- No rubric calibration required; the judge applies its own quality model

**Weaknesses:**

- Does not produce absolute scores; you cannot say "Output A is an 85"
- Intransitive preferences are possible: A > B, B > C, but C > A
- Scales quadratically: comparing N variations requires N(N-1)/2 comparisons
- Susceptible to position bias (see Section 7.3)

**When pairwise comparison fails in legal contexts:**

Legal evaluation often requires absolute quality thresholds, not just relative rankings.
A client needs to know "is this contract draft good enough to send to the counterparty?"
not "is this draft better than an alternative draft that might also be inadequate."
Pairwise comparison can tell you that Pipeline A is better than Pipeline B, but it
cannot tell you whether Pipeline A meets the standard of care. For that, you need
pointwise scoring with calibrated rubrics.


### Approach 3: Reference-Based Evaluation

Reference-based evaluation compares pipeline output against a gold-standard reference
produced by a human expert. The judge receives the pipeline output, the reference output,
and the original input. It evaluates whether the pipeline output matches, exceeds, or
falls short of the reference across defined criteria.

This approach is the closest analog to how legal work is traditionally evaluated. A
senior partner reviews an associate's draft against the partner's mental model of what
the draft should contain. Reference-based evaluation makes that mental model explicit by
providing a concrete reference document.

**When to use reference-based evaluation:**

- Benchmarking pipeline output against established human expert work product
- Compliance verification: does the output match a required template or standard?
- Training data validation: does the AI output align with labeled examples?
- Client acceptance testing: does the pipeline output match the client's expectations
  as expressed in a reference document?

**Strengths:**

- The most objective approach; quality is measured against a concrete standard
- Reduces judge subjectivity because the reference constrains the evaluation
- Particularly useful for structured outputs (contract templates, form filings) where
  a correct answer exists

**Weaknesses:**

- Requires a gold-standard reference, which is expensive to create and may not exist
- Penalizes pipeline outputs that are correct but differ from the reference in form
- Brittle in creative tasks: a contract drafted differently from the reference may be
  equally valid
- Reference quality becomes a ceiling; the pipeline cannot score higher than the reference
  allows

**The legal engineering sweet spot:**

In practice, TLE R&D uses pointwise scoring for experiments because it produces absolute
scores that enable direct numerical comparison across variations, runs, and time periods.
Pairwise comparison serves as a supplement when scores are too close to differentiate.
Reference-based evaluation is reserved for specific compliance tasks where a correct
answer exists (e.g., does the redline match the expected Track Changes for a known
set of issues?).


> **Practice Tip**
>
> Start with pointwise scoring. It is the most versatile approach and produces the most
> useful data for engineering decisions. Add pairwise comparison when you need to break
> ties between closely-scored variations. Use reference-based evaluation only when you
> have a reliable gold standard and the task has a well-defined correct answer.


---

**Key Takeaways**

- Three AI-as-judge approaches serve different evaluation contexts: pointwise scoring for absolute quality measurement, pairwise comparison for relative ranking, and reference-based evaluation for gold-standard benchmarking.
- Pointwise scoring is the workhorse for legal engineering because it produces absolute, comparable scores with per-criterion diagnostic detail.
- Pairwise comparison fails when you need quality thresholds, not just rankings. Legal work product needs to meet a standard of care, not just be "better than the alternative."

\newpage

## 7.3 Judge Biases and Mitigation

AI judges are not neutral. Every large language model carries systematic biases that
distort evaluation if left unchecked. Understanding these biases and building mitigation
into your scorer design is essential for producing reliable evaluation data. Four biases
dominate in practice.


### Position Bias

When an AI judge evaluates multiple outputs in sequence, or compares two outputs in a
pairwise evaluation, the position of each output in the prompt affects the score. Models
tend to favor the first option presented (primacy bias) or the last option presented
(recency bias), depending on the model and prompt structure.

In pairwise comparison, this means Output A gets a systematic advantage or disadvantage
purely based on whether it appears first or second in the prompt. In pointwise scoring
applied sequentially, the first output scored may anchor the judge's expectations for
subsequent outputs.

**Mitigation techniques:**

- **Randomize presentation order.** In pairwise comparisons, run each comparison twice
  with the outputs in opposite order. If the judge prefers A when A is first but prefers
  B when B is first, the comparison is inconclusive.

- **Evaluate independently.** In pointwise scoring, score each output in a separate
  API call. The judge never sees other outputs, so position bias has no mechanism to
  operate. This is the approach TLE R&D uses: each variation's output is scored in its
  own independent scorer call.

- **Use structured rubrics.** A rubric with specific criteria forces the judge to
  evaluate on defined dimensions rather than forming a holistic impression that is
  susceptible to ordering effects.


### Verbosity Bias

AI judges systematically prefer longer outputs. A 50,000-word legal research
compilation scores higher than an 11,000-word synthesized memorandum on a naive rubric,
even when the shorter document is objectively more useful as a legal deliverable. The
model conflates quantity of information with quality of analysis.

This bias is particularly dangerous in legal engineering because multi-agent pipelines
naturally produce more output than single-prompt approaches. A 6-specialist pipeline
generates six reports that, when concatenated, create a massive document. A naive judge
sees more content and awards higher scores. But more content is not better content when
the reader is an attorney who needs actionable intelligence, not an information dump.

TLE R&D Experiment 03 (Legal Research) demonstrated this bias empirically. The original
scorer (v1) evaluated only content completeness, producing scores of 80/82/82 across
three variations. Variation 2 (prompter-researchers, no synthesizer) scored 82 despite
producing a 50,000-word concatenation of four specialist reports with no unified
structure, no executive summary, massive redundancy, and no cross-domain analysis. The
scorer was blinded by volume.

**Mitigation techniques:**

- **Evaluate deliverable quality, not information quantity.** Your rubric must include
  criteria for structure, usability, coherence, and conciseness. A document that requires
  the reader to perform their own synthesis is a worse deliverable than one that arrives
  ready to use.

- **Implement hard caps for document usability.** If the output exceeds a reasonable
  length without an executive summary, cap the actionability score. If the output
  contains significant redundancy, cap the analysis depth score. These caps prevent the
  judge from being overwhelmed by volume.

- **Add "The Partner Test."** Include in your scorer prompt: "Would a senior partner
  hand this document to a client as-is?" A 50,000-word unstructured dump fails this test
  regardless of how much correct information it contains.

- **Score density, not volume.** Frame rubric criteria around insight density: how much
  actionable analysis per thousand words? This explicitly penalizes padding and rewards
  precision.


### Self-Enhancement Bias

When the same model generates and evaluates output, it tends to rate its own output more
favorably. The model recognizes patterns in its own generation style and implicitly
treats them as quality indicators. This creates a systematic upward bias when the scorer
and the pipeline use the same model.

In the TLE R&D context, all experiments use Claude Opus 4.6 for both generation and
scoring. This is a deliberate design choice: using the same model eliminates
inter-model capability as a variable. If we used Opus for generation and a different
model for scoring, quality differences might reflect the scorer's limitations rather
than actual pipeline quality. But this choice means self-enhancement bias is a
constant factor in all TLE R&D scores.

**Mitigation techniques:**

- **Use structured rubrics with specific criteria.** Self-enhancement bias operates
  through holistic impression. When the judge is forced to evaluate specific, defined
  criteria (count how many playbook priorities are implemented, list every missing
  article, enumerate ambiguous terms), the evaluation becomes grounded in concrete
  observations rather than stylistic preference.

- **Require diagnostic evidence before scoring.** The diagnostic-first methodology
  (detailed in Section 7.4) forces the scorer to inventory specific findings before
  assigning any number. This breaks the shortcut where the model says "this looks
  like good output" based on stylistic recognition.

- **Apply strict scoring bands.** When the rubric defines 10-13 as "below average,
  covers some basics but significant gaps" and requires explicit justification for
  any score above 19, the scorer must earn every point through demonstrated evidence.
  Self-enhancement bias pushes scores upward, and strict bands push back.

- **Cross-validate with human expert review.** For critical evaluations, have a human
  expert independently score a sample of outputs and compare with the AI scorer. If the
  AI consistently scores 5-10 points higher than the human, adjust your scoring bands
  accordingly.


### Anchoring Bias

When a scorer evaluates multiple outputs sequentially within the same context, earlier
scores influence later scores. If the first output scores 85, subsequent outputs are
implicitly compared against that anchor rather than evaluated independently against the
rubric. This can compress score ranges and reduce the discriminative power of the
evaluation.

**Mitigation techniques:**

- **Score each output in an independent API call.** This is the most effective
  mitigation. The scorer has no memory of previous evaluations because each evaluation
  is a separate conversation. TLE R&D uses this approach exclusively.

- **Randomize evaluation order across runs.** Even with independent calls, if you
  always score Variation 1 first and Variation 3 last, you might inadvertently
  introduce ordering effects in your analysis (not in the scorer, but in your own
  interpretation of results). Randomize which variation is scored first in each run.

- **Never include comparative language in scorer prompts.** The scorer should evaluate
  the output against the rubric, not against other outputs. Phrases like "compared to
  a typical AI output" or "relative to other drafts" introduce implicit anchors.


```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="800" height="400" fill="#f8f9fa" rx="8"/>

  <text x="400" y="30" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 7.2: Four AI Judge Biases and Their Mitigations</text>

  <!-- Position Bias -->
  <rect x="30" y="55" width="360" height="70" rx="6" fill="#1a1a2e"/>
  <text x="40" y="78" font-size="12" fill="#e74c3c" font-weight="bold">Position Bias</text>
  <text x="40" y="95" font-size="10" fill="#a0a0b0">First/last option gets systematic preference</text>
  <text x="40" y="112" font-size="10" fill="#16a085">FIX: Score each output in an independent API call</text>

  <!-- Verbosity Bias -->
  <rect x="410" y="55" width="360" height="70" rx="6" fill="#1a1a2e"/>
  <text x="420" y="78" font-size="12" fill="#e74c3c" font-weight="bold">Verbosity Bias</text>
  <text x="420" y="95" font-size="10" fill="#a0a0b0">Longer output gets higher scores regardless</text>
  <text x="420" y="112" font-size="10" fill="#16a085">FIX: Score deliverable quality, hard-cap on usability</text>

  <!-- Self-Enhancement Bias -->
  <rect x="30" y="145" width="360" height="70" rx="6" fill="#1a1a2e"/>
  <text x="40" y="168" font-size="12" fill="#e74c3c" font-weight="bold">Self-Enhancement Bias</text>
  <text x="40" y="185" font-size="10" fill="#a0a0b0">Model rates its own style more favorably</text>
  <text x="40" y="202" font-size="10" fill="#16a085">FIX: Diagnostic-first, require evidence before scoring</text>

  <!-- Anchoring Bias -->
  <rect x="410" y="145" width="360" height="70" rx="6" fill="#1a1a2e"/>
  <text x="420" y="168" font-size="12" fill="#e74c3c" font-weight="bold">Anchoring Bias</text>
  <text x="420" y="185" font-size="10" fill="#a0a0b0">Earlier scores influence later evaluations</text>
  <text x="420" y="202" font-size="10" fill="#16a085">FIX: Independent API calls, randomize order</text>

  <!-- Common Thread -->
  <rect x="30" y="240" width="740" height="80" rx="6" fill="#16a085" opacity="0.15" stroke="#16a085" stroke-width="2"/>
  <text x="400" y="265" text-anchor="middle" font-size="13" fill="#1a1a2e" font-weight="bold">The Common Thread: All Four Biases Are Mitigated by the Same Design Pattern</text>
  <text x="400" y="290" text-anchor="middle" font-size="11" fill="#1a1a2e">Independent evaluation calls + Structured rubrics with specific criteria +</text>
  <text x="400" y="308" text-anchor="middle" font-size="11" fill="#1a1a2e">Diagnostic-first methodology + Strict scoring bands with hard caps</text>

  <!-- Bottom note -->
  <text x="400" y="355" text-anchor="middle" font-size="10" fill="#666" font-style="italic">TLE R&D applies all four mitigations in every experiment scorer.</text>
  <text x="400" y="375" text-anchor="middle" font-size="10" fill="#666" font-style="italic">The diagnostic-first methodology (Section 7.4) is the single most effective defense against all four biases.</text>
</svg>
```


> **Warning**
>
> Verbosity bias is the most dangerous bias in legal evaluation because it rewards
> exactly the wrong thing. An attorney does not want more information. An attorney wants
> the right information, organized for action. A scorer that rewards volume will tell you
> that a 50,000-word concatenation of specialist reports is the best output, when in fact
> it is the least useful document in the comparison. The recalibrated scorer in TLE R&D
> Experiment 03 corrected this by dropping Variation 2's score from 82 to 60.5 once
> deliverable usability was added to the rubric. A 22-point swing from a single rubric
> change. That is how dangerous verbosity bias is.


---

**Key Takeaways**

- Four systematic biases corrupt AI judges: position bias, verbosity bias, self-enhancement bias, and anchoring bias.
- All four are mitigated by the same design pattern: independent evaluation calls, structured rubrics with specific criteria, diagnostic-first methodology, and strict scoring bands.
- Verbosity bias is the most dangerous in legal contexts: it rewards information volume over deliverable quality, producing scores that are inversely correlated with actual utility.

\newpage

## 7.4 The TLE R&D Scorer Architecture

### Diagnostic-First Methodology

The most important design decision in the TLE R&D scorer is that **scoring happens
last**. Before the scorer assigns a single number, it must complete a series of
mandatory diagnostic inventories that force it to catalog specific, concrete observations
about the output. This is the diagnostic-first methodology, and it is what separates a
calibrated scorer from a grade-inflating one.

The problem it solves is straightforward. When you ask a language model to "score this
contract draft 0-25 on completeness," the model's default behavior is to form a
holistic impression and then rationalize a score that matches that impression. This
produces scores that cluster in the 18-22 range regardless of actual quality, because
the model's impression of "this seems pretty good" maps to roughly the same number
every time. Diagnostics break this pattern by forcing the model to commit to specific
observations before those observations can be rationalized to match a predetermined
score.

Consider the difference between these two scorer behaviors:

**Without diagnostics (grade inflation):**
"The draft covers most material terms and generally reflects the playbook. Some areas
could be stronger. Completeness: 21/25."

**With diagnostics (calibrated scoring):**
"Article inventory: 18 of 23 standard articles present. 3 partial (mentioned but
inadequate): Data Protection (referenced but no DPA terms), Insurance (mentioned but no
minimum coverage), Audit Rights (stated but no scope or frequency). 2 absent: Force
Majeure, Export Compliance. Playbook compliance: 7 of 10 priorities addressed with
operative language, 2 surface-level (SLA credits mentioned but no tier structure, price
cap mentioned but no specific percentage), 1 missing (data return window). Based on
these diagnostics: 5 absent or partial articles and 3 incomplete playbook priorities.
Per scoring bands, this places the draft in the 14-16 range (average: adequate standard
terms, some tailoring attempted, most priorities mentioned). Completeness: 15/25."

The diagnostic-first scorer produced a score 6 points lower than the impressionistic
scorer because it was forced to count. Counting is the antidote to impression.


### The Five Diagnostic Phases

The TLE R&D scorer for contract drafting implements five mandatory diagnostic phases.
Each phase catalogs specific, countable observations. The scorer cannot proceed to
scoring until all five phases are complete.

**Phase 1: Article Inventory.** List every article that a production contract of this
type must contain (typically 20-25 standard articles). For each, mark PRESENT
(substantive operative language), PARTIAL (mentioned but inadequate), or ABSENT. This
produces three concrete numbers: articles present, articles partial, articles absent.

**Phase 2: Playbook Priority Compliance.** For each priority in the client playbook,
determine whether it is ADDRESSED (operative language that achieves the stated goal with
specific numbers, thresholds, and procedures), SURFACE-LEVEL (concept mentioned but not
operationally implemented), or MISSING (not addressed at all). A priority is only
"addressed" if the draft contains specific, operative language. Merely mentioning a
concept without specifics is surface-level.

**Phase 3: Precision Audit.** Count and list specific defects: capitalized terms used
without definition, ambiguous qualifiers ("reasonable," "material," "promptly," "best
efforts") without objective standards, missing cross-references between dependent
provisions, contradictory provisions, placeholders or blanks.

**Phase 4: Tailoring vs. Boilerplate.** For each major provision, assess whether the
language is GENERIC (standard boilerplate from any deal) or TAILORED (specific to this
deal's parameters, parties, risk profile, or industry). Count each.

**Phase 5: Sophistication Indicators.** Note the presence or absence of nine
indicators of drafting sophistication: meaningful carve-outs and exceptions, cure
periods with specific timeframes, distinct remedies tied to distinct breach categories,
multi-tiered thresholds, affirmative covenants with measurable standards, conditions
precedent/subsequent, specific performance provisions, detailed change control
procedures, and audit rights with defined scope and frequency.

Only after completing all five phases does the scorer assign numerical scores. And when
it does, the scores must be consistent with the diagnostic findings. A draft with 5
absent articles cannot score above 10/25 on completeness. A draft with 3 missing
playbook priorities cannot score above 10/25 on accuracy. A draft with zero
sophistication indicators cannot score above 16/25 on any criterion. These are hard
caps, and they are the mechanism that prevents the scorer from ignoring its own
diagnostic findings.


### Scoring Bands

Every scorer needs explicit guidance on what each score range means. Without scoring
bands, the model defaults to a compressed range where everything falls between 16 and 22
out of 25, making it impossible to differentiate good output from mediocre output.

The TLE R&D scoring bands for contract drafting (each criterion scored 0-25):

| Band | Range | Description | Typical Characteristics |
|------|-------|-------------|------------------------|
| Failing | 0-5 | Structurally broken | Major sections missing, not a usable contract |
| Poor | 6-9 | Bare outline | Pervasive gaps, would require complete rewrite |
| Below Average | 10-13 | Covers some basics | Significant gaps, generic language throughout |
| Average | 14-16 | Adequate standard terms | Some tailoring attempted, most priorities mentioned |
| Above Average | 17-19 | Solid coverage | Meaningful tailoring, priorities well-implemented |
| Strong | 20-21 | Comprehensive | Only minor refinements needed, demonstrated sophistication |
| Excellent | 22-23 | Survives senior partner review | Minimal markup, near-zero deficiencies. Rare. |
| Exceptional | 24-25 | Production-ready | Zero deficiencies. This score should essentially never be given. |

The critical insight is the "Below Average" band at 10-13. This is where most
single-pass AI output lands when evaluated by a calibrated scorer. A single-prompt
contract draft typically covers the obvious articles, mentions most playbook priorities
at a surface level, uses generic boilerplate language, and includes few sophistication
indicators. That is a 10-13 draft. It is not terrible. It is a starting point that
requires significant attorney revision. Calling it "above average" or scoring it
17-19 is grade inflation.

The "Excellent" and "Exceptional" bands at 22-25 are deliberately almost unreachable.
A score of 22+ means the output would survive a BigLaw senior partner's review with
minimal markup. A score of 24-25 means zero deficiencies. In our R&D experiments, even
the best multi-agent pipeline outputs typically score 22-24 on individual criteria, and
only on their strongest dimensions. A perfect 25/25 across all criteria has never
occurred in any TLE R&D experiment.


### Anti-Inflation Rules

Beyond scoring bands, the scorer includes explicit anti-inflation rules that trigger
re-examination when scores seem too high:

- **Four-way 20+ trigger.** If all four criterion scores are 20 or higher,
  the scorer must re-examine its diagnostics. Four scores of 20+ means near-zero
  deficiencies across every dimension. The scorer must verify this is actually true by
  rechecking its diagnostic findings.

- **Excellence requires affirmative evidence.** A score of 20+ requires the scorer
  to state what is specifically impressive, not merely what is not wrong. "No major
  problems" is not sufficient justification for a 20. "Belt-and-suspenders IP assignment
  with work-for-hire, irrevocable assignment, further assurances, power of attorney
  fallback, and pre-existing IP license" is sufficient justification.

- **Adequate is not good.** The scorer is explicitly told: "Adequate is 14-16. Good
  is 17-19. Do not conflate them." This prevents the common failure where the model
  treats "this is fine" as worthy of a good-to-excellent score.

- **Surface-level is not addressed.** Playbook priorities that are mentioned but lack
  specific numbers, thresholds, or procedures are surface-level and do not count as
  fully addressed. This is the most common inflation vector: the model sees the concept
  mentioned and gives full credit, even when the implementation is vague.


### Hard Caps: The Nuclear Option

Hard caps override all other scoring when specific diagnostic triggers are met. They
are the backstop that prevents the scorer from rationalizing high scores in the presence
of objective deficiencies:

| Trigger | Cap | Rationale |
|---------|-----|-----------|
| Truncated or incomplete draft | ALL criteria capped at 8/25 | An incomplete contract is not a contract |
| >3 playbook priorities MISSING or SURFACE-LEVEL | Accuracy capped at 10/25 | If a third of the client's positions are not implemented, accuracy is objectively poor |
| >4 standard articles ABSENT | Completeness capped at 10/25 | If 20% of required articles are missing, completeness is objectively poor |
| >60% of provisions are GENERIC boilerplate | ALL criteria capped at 14/25 | A mostly-generic contract cannot score above average |
| >5 undefined capitalized terms in operative provisions | Enforceability capped at 14/25 | Undefined terms in operative clauses create enforceability risk |
| No definitions section | Organization capped at 12/25 | A contract without definitions is structurally deficient |
| 0 of 9 sophistication indicators present | ALL criteria capped at 16/25 | No sophistication indicators means a basic, unsophisticated draft |


---

**Key Takeaways**

- Diagnostic-first methodology forces the scorer to inventory specific, countable observations before assigning any numerical score. Counting is the antidote to impression.
- Five diagnostic phases (article inventory, playbook compliance, precision audit, tailoring assessment, sophistication indicators) provide the concrete evidence that drives scoring.
- Scoring bands prevent score compression: "below average" at 10-13 is where most single-pass AI lands; "excellent" at 22-23 is rare and requires explicit justification.
- Hard caps are the nuclear option that enforces objective quality floors regardless of the scorer's holistic impression.

\newpage

## 7.5 The Production Scorer: Complete Implementation

### Scorer Prompt Construction

The following is a complete, production scorer implementation for contract drafting
evaluation. This is the actual pattern used in TLE R&D experiments, with the full
diagnostic-first prompt, structured JSON output, and validation logic.

```typescript
// scorer.ts
// Production scorer for contract drafting evaluation
// Diagnostic-first methodology with strict scoring bands

import Anthropic from '@anthropic-ai/sdk';

// --- Type Definitions ---

interface CriterionScore {
  score: number;
  reasoning: string;
}

interface DiagnosticResults {
  articlesPresent: string[];
  articlesPartial: string[];
  articlesMissing: string[];
  prioritiesAddressed: number;
  prioritiesSurfaceLevel: number;
  prioritiesMissing: number;
  undefinedTermsCount: number;
  ambiguitiesCount: number;
  genericProvisions: number;
  tailoredProvisions: number;
  sophisticationCount: number;
}

interface ScoreResult {
  diagnostics: DiagnosticResults;
  completeness: CriterionScore;
  accuracy: CriterionScore;
  enforceability: CriterionScore;
  organization: CriterionScore;
  total: number;
  summary: string;
}

interface ScorerInput {
  draft: string;
  contractType: string;
  playbook: string;
  representingParty: string;
}

// --- Anthropic Client ---

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

const SCORER_MODEL = 'claude-opus-4-6';

// --- Scorer Prompt Construction ---

const buildScorerPrompt = (input: ScorerInput): string => `
You are a RUTHLESS legal quality reviewer for a ${input.contractType}
agreement. You score like a BigLaw senior partner who has reviewed
thousands of contracts. Every score must be EARNED through demonstrated
excellence. Default assumption: the draft is MEDIOCRE until proven
otherwise.

THE PLAYBOOK (client priorities that MUST appear in the draft):
${input.playbook}

THE DRAFT TO EVALUATE:
${input.draft}

${'='.repeat(52)}
PHASE 1: MANDATORY DIAGNOSTICS (complete ALL before scoring)
${'='.repeat(52)}

DIAGNOSTIC 1 — ARTICLE INVENTORY:
List every article a production ${input.contractType} must contain.
Standard articles include: Definitions, Grant of Rights/Scope of
Services, Service Levels/Performance Standards, Fees and Payment, Term
and Renewal, Termination, Representations and Warranties,
Indemnification, Limitation of Liability, Confidentiality, Data
Protection/Privacy, Intellectual Property, Insurance, Force Majeure,
Dispute Resolution, Governing Law, Assignment, Notices, Amendments,
Entire Agreement, Severability, Waiver, Survival, Exhibits/Schedules.
For each: mark PRESENT (substantive), PARTIAL (mentioned but
inadequate), or ABSENT.

DIAGNOSTIC 2 — PLAYBOOK PRIORITY COMPLIANCE:
For EACH playbook priority, determine:
- ADDRESSED: operative language that actually achieves the stated goal
- SURFACE-LEVEL: concept mentioned but not operationally implemented
  with specifics
- MISSING: not addressed at all
A priority is only "addressed" if the draft contains specific, operative
language (numbers, thresholds, procedures) that implements the playbook
position. Merely mentioning a concept without specifics is SURFACE-LEVEL.

DIAGNOSTIC 3 — PRECISION AUDIT:
Count and list every instance of:
- Capitalized terms used without definition
- Ambiguous qualifiers ("reasonable," "material," "promptly," "best
  efforts") without objective standards or definitions
- Missing cross-references between dependent provisions
- Contradictory provisions
- Placeholders, blanks, or "[TBD]" markers

DIAGNOSTIC 4 — TAILORING vs BOILERPLATE:
For each major provision: is the language GENERIC (standard boilerplate
from any deal) or TAILORED (specific to this deal's parameters, parties,
risk profile, or industry)? Count each.

DIAGNOSTIC 5 — SOPHISTICATION INDICATORS:
Note presence/absence of each:
- Meaningful carve-outs and exceptions to general rules
- Cure periods with specific timeframes and escalation procedures
- Distinct remedies tied to distinct breach categories
- Multi-tiered thresholds (materiality baskets, deductibles, tiered caps)
- Affirmative covenants with measurable compliance standards
- Conditions precedent/subsequent
- Specific performance and injunctive relief provisions
- Detailed change control procedures
- Audit rights with defined scope, frequency, and cost allocation

${'='.repeat(52)}
PHASE 2: SCORING (must be consistent with Phase 1 findings)
${'='.repeat(52)}

SCORING BANDS (apply with discipline — most AI-generated first drafts
score 10-16 per criterion):
  0-5:   FAILING — Structurally broken, major sections missing
  6-9:   POOR — Bare outline, pervasive gaps, requires complete rewrite
  10-13: BELOW AVERAGE — Covers some basics but significant gaps
  14-16: AVERAGE — Adequate standard terms, some tailoring attempted
  17-19: ABOVE AVERAGE — Solid coverage, meaningful tailoring
  20-21: STRONG — Comprehensive, only minor refinements needed
  22-23: EXCELLENT — Survives senior partner review. RARE.
  24-25: EXCEPTIONAL — Production-ready, zero deficiencies. NEVER given.

HARD CAPS (override all other scoring):
  - Truncated/incomplete draft → ALL criteria capped at 8/25
  - >3 playbook priorities MISSING or SURFACE-LEVEL →
    Accuracy capped at 10/25
  - >4 standard articles ABSENT → Completeness capped at 10/25
  - >60% of provisions are GENERIC boilerplate →
    ALL criteria capped at 14/25
  - >5 undefined capitalized terms → Enforceability capped at 14/25
  - No definitions section → Organization capped at 12/25
  - 0 of 9 sophistication indicators → ALL criteria capped at 16/25
  - <3 sophistication indicators → scores above 19 require explicit
    justification

ANTI-INFLATION RULES:
  - If ALL four scores are 20+, re-examine your diagnostics. Four 20+
    scores means near-zero deficiencies across every dimension.
  - A score of 20+ requires you to affirmatively state what makes the
    provision EXCELLENT — "no major problems" is not enough.
  - "Adequate" is 14-16. "Good" is 17-19. Do not conflate them.
  - Playbook priorities mentioned but lacking specific numbers,
    thresholds, or procedures are SURFACE-LEVEL and do not count as
    fully addressed.

${'='.repeat(52)}

You MUST respond in EXACTLY this JSON format (no markdown, no code
blocks, no text before or after — ONLY the JSON object):
{"diagnostics":{"articlesPresent":[],"articlesPartial":[],
"articlesMissing":[],"prioritiesAddressed":0,
"prioritiesSurfaceLevel":0,"prioritiesMissing":0,
"undefinedTermsCount":0,"ambiguitiesCount":0,
"genericProvisions":0,"tailoredProvisions":0,
"sophisticationCount":0},"completeness":{"score":0,"reasoning":""},
"accuracy":{"score":0,"reasoning":""},
"enforceability":{"score":0,"reasoning":""},
"organization":{"score":0,"reasoning":""},"summary":""}
`;


// --- JSON Extraction with Balanced Brace Parser ---

const extractJSON = (text: string): string => {
  // Find the first opening brace
  const start = text.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON object found in scorer output');
  }

  // Walk the string tracking brace depth
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  throw new Error(
    `Unbalanced braces in scorer output. ` +
    `Started at position ${start}, depth reached ${depth}. ` +
    `First 500 chars: ${text.slice(0, 500)}`
  );
};

// --- Score Validation ---

const validateScore = (
  score: number,
  criterion: string,
  max: number = 25
): void => {
  if (!Number.isInteger(score) || score < 0 || score > max) {
    throw new Error(
      `Invalid score for ${criterion}: ${score} ` +
      `(must be integer 0-${max})`
    );
  }
};

// --- Main Scorer Function ---

export const scoreDraft = async (
  input: ScorerInput
): Promise<ScoreResult> => {

  const scorerPrompt = buildScorerPrompt(input);

  // Scorer uses create() not stream() — needs full response
  // for reliable JSON extraction
  const response = await client.messages.create({
    model: SCORER_MODEL,
    max_tokens: 16_384,
    messages: [{ role: 'user', content: scorerPrompt }]
  });

  const text = response.content
    .find(c => c.type === 'text')?.text ?? '';

  if (!text.trim()) {
    throw new Error('Scorer returned empty response');
  }

  // Extract JSON using balanced-brace parser
  const jsonStr = extractJSON(text);
  const parsed = JSON.parse(jsonStr);

  // Build validated result
  const result: ScoreResult = {
    diagnostics: {
      articlesPresent: parsed.diagnostics?.articlesPresent ?? [],
      articlesPartial: parsed.diagnostics?.articlesPartial ?? [],
      articlesMissing: parsed.diagnostics?.articlesMissing ?? [],
      prioritiesAddressed:
        parsed.diagnostics?.prioritiesAddressed ?? 0,
      prioritiesSurfaceLevel:
        parsed.diagnostics?.prioritiesSurfaceLevel ?? 0,
      prioritiesMissing:
        parsed.diagnostics?.prioritiesMissing ?? 0,
      undefinedTermsCount:
        parsed.diagnostics?.undefinedTermsCount ?? 0,
      ambiguitiesCount:
        parsed.diagnostics?.ambiguitiesCount ?? 0,
      genericProvisions:
        parsed.diagnostics?.genericProvisions ?? 0,
      tailoredProvisions:
        parsed.diagnostics?.tailoredProvisions ?? 0,
      sophisticationCount:
        parsed.diagnostics?.sophisticationCount ?? 0,
    },
    completeness: {
      score: parsed.completeness?.score ?? 0,
      reasoning: parsed.completeness?.reasoning ?? ''
    },
    accuracy: {
      score: parsed.accuracy?.score ?? 0,
      reasoning: parsed.accuracy?.reasoning ?? ''
    },
    enforceability: {
      score: parsed.enforceability?.score ?? 0,
      reasoning: parsed.enforceability?.reasoning ?? ''
    },
    organization: {
      score: parsed.organization?.score ?? 0,
      reasoning: parsed.organization?.reasoning ?? ''
    },
    total: 0,
    summary: parsed.summary ?? ''
  };

  // Validate each score
  for (const key of [
    'completeness', 'accuracy', 'enforceability', 'organization'
  ] as const) {
    validateScore(result[key].score, key);
  }

  // Calculate total
  result.total =
    result.completeness.score +
    result.accuracy.score +
    result.enforceability.score +
    result.organization.score;

  // Log token usage for cost tracking
  const { input_tokens, output_tokens } = response.usage;
  const cost =
    (input_tokens * 3 + output_tokens * 15) / 1_000_000;
  console.log(
    `[SCORER] Tokens: ${input_tokens} in / ${output_tokens} out` +
    ` | Cost: $${cost.toFixed(4)} | Score: ${result.total}/100`
  );

  return result;
};
```


### Three Critical Design Decisions

Three design decisions in this implementation deserve emphasis.

**First, the scorer uses `client.messages.create()` rather than
`client.messages.stream()`.** This is the opposite of the pipeline pattern, where
streaming prevents connection timeouts on long generations. The scorer's output is
shorter (diagnostic inventory plus JSON, typically 4,000-8,000 tokens) and the priority
is response integrity over connection resilience. A streaming scorer that drops the
connection mid-JSON produces a parse failure that wastes the entire evaluation. A
non-streaming scorer either succeeds or fails cleanly.

**Second, JSON extraction uses a balanced-brace parser rather than a regex.** The
original TLE R&D scorer used `text.match(/\{[\s\S]*\}/)` to extract JSON. This greedy
regex finds the first `{` and the last `}` in the entire response. When the scorer's
diagnostic reasoning strings contain `{` and `}` characters (which they frequently
do when discussing contract provisions), the regex captures a superset of the JSON
that includes malformed content. The balanced-brace parser walks the string character
by character, tracking nesting depth, and extracts exactly the outermost JSON object.
This fix was implemented after TLE R&D Experiment 03 (Legal Research) produced
repeated JSON parse failures when scoring a 50,000-word research compilation.

**Third, the scorer throws on parse failure. It never falls back to mock scores.** In
early development, the scorer had a fallback that returned hardcoded scores when JSON
parsing failed. This created a silent failure mode where the experiment appeared to
complete successfully but produced meaningless data. The scorer now throws an explicit
error with the first 500 characters of the raw response, forcing the operator to
investigate and fix the issue rather than proceeding with corrupt data.


> **Practice Tip**
>
> When building your own scorer, start with the diagnostic-first prompt structure and
> the balanced-brace JSON parser. These two components prevent the two most common
> scorer failures: grade inflation (diagnostics) and parse errors (balanced-brace parser).
> Everything else, including the specific criteria, scoring bands, and hard caps, should be
> customized for your workflow and document type.


\newpage

## 7.6 Rubric Design for Legal Output

### The Four Universal Dimensions

Every legal output, regardless of workflow type, can be evaluated on four fundamental
dimensions. These four dimensions recur across all TLE R&D experiments, though the
specific criteria within each dimension vary by workflow.


**1. Completeness: Did the analysis cover all relevant issues?**

Completeness measures breadth of coverage. For a contract draft, this means: does the
draft include all standard articles for this contract type? For a triage report: does
the report classify every document in the batch? For a legal research memorandum: does
the memo identify every legally significant issue in the fact pattern?

Completeness is the easiest dimension to evaluate objectively because it reduces to
counting. You define what should be present and count how many of those items are
actually present. The scorer's article inventory diagnostic (Phase 1) directly feeds
the completeness score.


**2. Accuracy: Are the findings correct?**

Accuracy measures correctness. For a contract draft, this means: does the draft
faithfully implement the playbook positions? For a triage report: are the
classifications correct? For a legal research memorandum: are the legal citations
real and correctly applied?

Accuracy is the hardest dimension to evaluate with an AI judge because correctness
verification sometimes requires domain knowledge the judge may not reliably possess.
Citation verification is a known weakness: the model may accept a plausible-sounding
but fabricated case citation. The TLE R&D response to this challenge is to treat
"plausible but unverifiable" citations as hallucinated for scoring purposes. This is
a conservative choice that penalizes pipeline output for the same sin the model might
commit as a judge. The alternative, giving credit for plausible citations, would inflate
scores and undermine the evaluation's credibility.


**3. Depth: Does the analysis go beyond surface-level observations?**

Depth measures analytical quality. For a contract draft, this manifests as
enforceability: is the language precise enough to survive judicial scrutiny? For a
triage report, it manifests as risk identification: does the report catch subtle risks
and cross-document patterns? For a legal research memorandum, it manifests as analysis
depth: does the memo apply law to facts rather than merely stating abstract legal rules?

Depth is where the diagnostic-first methodology has its greatest impact. Without
diagnostics, the scorer evaluates depth impressionistically and almost always awards
high scores because long, detailed output "feels" deep. With diagnostics, the scorer
must count sophistication indicators, enumerate specific risks identified, and assess
whether legal rules are stated abstractly or applied to the specific facts. Counting
replaces feeling.


**4. Actionability: Can an attorney act on this output immediately?**

Actionability measures practical utility. For a contract draft: is it ready for
counterparty review, or does it require significant attorney revision? For a triage
report: can a paralegal execute the routing recommendations without asking follow-up
questions? For a legal research memorandum: does the memo tell the partner who should
do what by when?

Actionability is the dimension most susceptible to verbosity bias. A longer output
that covers more ground "feels" more actionable, even when its length makes it harder
to use. The deliverable usability assessment (the "Partner Test") provides a necessary
counterweight: would you hand this to a client as-is? A 50,000-word unstructured dump
fails this test. An 11,000-word synthesized memorandum with clear headings, a brief
answer section, and specific recommendations passes it.


### Workflow-Specific Rubric Adaptations

While the four universal dimensions apply to all legal output, the specific criteria
and diagnostic methods vary by workflow:

| Workflow | Rubric Criteria | Key Diagnostic Questions |
|----------|----------------|-------------------------|
| **Contract Drafting** | Completeness, Accuracy, Enforceability, Organization (4 x 25) | How many standard articles are present? How many playbook priorities are implemented with operative language? How many sophistication indicators are present? |
| **Document Triage** | Classification Accuracy, Extraction Completeness, Risk Identification, Actionability (4 x 25) | Is every document correctly classified with granular sub-type? Are all parties, dates, and financial terms captured? Are cross-document risk patterns identified? Can a paralegal execute every recommendation? |
| **Legal Research** | Issue Identification, Authority Accuracy, Analysis Depth, Counter-Argument Consideration, Practical Actionability (5 x 20) | Are all legal issues identified? Are citations real and relevant? Is law applied to facts or stated abstractly? Are opposing arguments addressed? Does the memo pass the Partner Test? |
| **Contract Redlining** | Coverage, Citation Quality, Comment Depth, Formatting Fidelity (4 x 25) | How many track changes were produced? How many include legal citations? Are comments analytical or merely descriptive? Is the OOXML formatting correct? |

The rubric adaptation process follows a consistent pattern:

1. **Identify the deliverable type.** What does the attorney expect to receive?
2. **Define the quality dimensions.** What distinguishes good from poor for this type?
3. **Design diagnostic inventories.** What specific, countable observations can the scorer make?
4. **Calibrate scoring bands.** What does a 10/25 look like? A 20/25?
5. **Define hard caps.** What objective deficiencies trigger automatic score limits?
6. **Run calibration experiments.** Score known-good and known-poor outputs. Verify the spread.


### The Scorer Calibration Journey: A Cautionary Tale

TLE R&D Experiment 03 (Legal Research) provides the definitive example of why scorer
calibration matters. The experiment tested three pipeline variations: a single researcher
(1 call), a prompter with parallel researchers (5 calls, no synthesizer), and a full
prompter-researchers-synthesizer pipeline (6 calls).

The original scorer (v1) evaluated content completeness without assessing document
usability. The result: scores of 80, 82, and 82 across the three variations. A 2-point
spread. This was useless for differentiating variations.

Variation 2 (prompter-researchers, no synthesizer) produced a 50,000-word concatenation
of four specialist reports. It contained more information than any other variation. The
original scorer, measuring only information coverage, awarded it 82 points. But the
document was unusable. No executive summary. No unified structure. Massive redundancy.
No cross-domain analysis. An attorney who received this document would need to spend
hours synthesizing it into something actionable.

The recalibrated scorer (v2) added five critical changes:

1. **Document Usability diagnostic.** Structure, redundancy, executive summary presence, cross-domain synthesis, length appropriateness.
2. **Fragmentation hard caps.** Fragmented document (no unified structure) caps actionability at 10/20.
3. **Redundancy penalties.** Significant redundancy caps analysis depth at 14/20.
4. **Length caps.** Over 20,000 words without executive summary caps actionability at 12/20.
5. **The Partner Test.** "Would a senior partner hand this to a client as-is?"

The recalibrated scorer produced scores of 73, 60.5, and 77. An 18-point spread. Clear
differentiation. And the critical finding: Variation 2 (parallelization without
synthesis) scored **lower** than Variation 1 (single pass).


> **Key Concept**
>
> A rubric is a measuring instrument. Like any instrument, it must be calibrated before
> use. An uncalibrated rubric is worse than no rubric at all, because it produces numbers
> that create a false sense of precision. The most important step in rubric design is
> calibration: running the scorer against outputs of known quality and verifying that the
> scores match your expectations.


---

**Key Takeaways**

- Four universal quality dimensions apply to all legal output: completeness, accuracy, depth, and actionability.
- Workflow-specific rubric adaptations customize the diagnostic inventories and hard caps for each deliverable type while preserving the universal dimensional structure.
- Scorer calibration is essential: the same experiment produced a 2-point spread with an uncalibrated scorer and an 18-point spread with a calibrated one. The calibration change reversed the quality ordering.

\newpage

## 7.7 Building Evaluation Pipelines

### The Evaluation Pipeline Pattern

An evaluation pipeline wraps your scorer into a systematic workflow that produces
structured, comparable, and storable results. The basic pattern:

```
Pipeline Input → Pipeline Execution → Pipeline Output → Scorer → Score + Diagnostics
```

In an R&D context, this extends to multiple pipeline variations:

```
For each variation in [V1, V2, V3]:
  1. Run variation pipeline on standardized input
  2. Capture output + metrics (tokens, latency, cost)
  3. Score output with scorer diplomat
  4. Save score + metrics + full output to results directory
Compare variation scores → Produce findings
```

In a production context, the pattern includes a quality gate:

```
Run pipeline → Score output →
  If score >= threshold → Deliver with confidence
  If score < threshold → Flag for attorney review
```


### The R&D Backautocrat

The following TypeScript implements the R&D evaluation pipeline pattern. This is the
backautocrat that orchestrates experiment runs in TLE R&D:

```typescript
// backautocrat.ts
// Experiment orchestrator — runs all variations and collects results

import { scoreDraft } from '../scorer/scorer.js';
import type {
  PipelineVariation,
  ExperimentConfig,
  VariationResult,
  ExperimentRun
} from '../../types/types.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// --- Cost Calculation (Opus Pricing) ---

const calculateCost = (
  inputTokens: number,
  outputTokens: number
): number => {
  // Opus: $3 per million input, $15 per million output
  return (inputTokens * 3 + outputTokens * 15) / 1_000_000;
};

// --- Single Variation Runner ---

const runVariation = async (
  variation: PipelineVariation,
  config: ExperimentConfig
): Promise<VariationResult> => {

  const startMs = Date.now();
  console.log(`\n[EXPERIMENT] Running: ${variation.name}`);

  // Execute the pipeline — this is the independent variable
  const pipelineOutput = await variation.pipeline(config.input);
  const pipelineLatencyMs = Date.now() - startMs;

  // Score the output — the scorer is the controlled variable
  const scoreResult = await scoreDraft({
    draft: pipelineOutput.finalOutput,
    contractType: config.input.contractType,
    playbook: config.input.playbook,
    representingParty: config.input.representingParty
  });

  const totalLatencyMs = Date.now() - startMs;
  const cost = calculateCost(
    pipelineOutput.totalInputTokens,
    pipelineOutput.totalOutputTokens
  );

  return {
    variationName: variation.name,
    score: scoreResult,
    metrics: {
      totalInputTokens: pipelineOutput.totalInputTokens,
      totalOutputTokens: pipelineOutput.totalOutputTokens,
      totalLatencyMs,
      pipelineLatencyMs,
      claudeCalls: pipelineOutput.claudeCalls,
      model: 'claude-opus-4-6',
      estimatedCostUsd: cost
    },
    output: pipelineOutput.finalOutput,
    intermediateOutputs: pipelineOutput.intermediateOutputs
  };
};

// --- Experiment Runner ---

export const runExperiment = async (
  config: ExperimentConfig
): Promise<ExperimentRun> => {

  const runId = new Date()
    .toISOString()
    .replace(/[T:]/g, '-')
    .slice(0, 16);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`EXPERIMENT RUN: ${runId}`);
  console.log(`Variations: ${config.variations.length}`);
  console.log(`${'='.repeat(60)}`);

  const results: VariationResult[] = [];

  for (const variation of config.variations) {
    try {
      const result = await runVariation(variation, config);
      results.push(result);
      console.log(
        `[RESULT] ${variation.name}: ` +
        `${result.score.total}/100 | ` +
        `$${result.metrics.estimatedCostUsd.toFixed(4)}`
      );
    } catch (error) {
      console.error(
        `[FAILURE] ${variation.name}: ${error}`
      );
      // Failed variations logged, not scored
    }
  }

  // Build comparison rankings
  const ranked = [...results].sort(
    (a, b) => b.score.total - a.score.total
  );
  const comparison = {
    qualityWinner: ranked[0]?.variationName ?? 'none',
    costWinner: [...results].sort(
      (a, b) =>
        a.metrics.estimatedCostUsd - b.metrics.estimatedCostUsd
    )[0]?.variationName ?? 'none',
    efficiencyWinner: [...results].sort(
      (a, b) =>
        (b.score.total / b.metrics.estimatedCostUsd) -
        (a.score.total / a.metrics.estimatedCostUsd)
    )[0]?.variationName ?? 'none',
    rankings: ranked.map((r, i) => ({
      rank: i + 1,
      variation: r.variationName,
      score: r.score.total,
      cost: r.metrics.estimatedCostUsd,
      efficiency: r.score.total / r.metrics.estimatedCostUsd
    }))
  };

  // Save results to timestamped directory
  const resultsDir = join(
    config.resultsBasePath, `run-${runId}`
  );
  mkdirSync(resultsDir, { recursive: true });

  // Four structured result files serve different audiences
  writeFileSync(
    join(resultsDir, 'scores.json'),
    JSON.stringify(
      Object.fromEntries(
        results.map(r => [r.variationName, {
          ...Object.fromEntries(
            Object.entries(r.score)
              .filter(([k]) =>
                k !== 'diagnostics' && k !== 'summary')
              .map(([k, v]) => [
                k,
                typeof v === 'object'
                  ? (v as CriterionScore).score
                  : v
              ])
          )
        }])
      ),
      null, 2
    )
  );

  writeFileSync(
    join(resultsDir, 'metrics.json'),
    JSON.stringify(
      Object.fromEntries(
        results.map(r => [r.variationName, r.metrics])
      ),
      null, 2
    )
  );

  writeFileSync(
    join(resultsDir, 'comparison.json'),
    JSON.stringify(comparison, null, 2)
  );

  writeFileSync(
    join(resultsDir, 'full-run.json'),
    JSON.stringify({
      runId,
      timestamp: new Date().toISOString(),
      results,
      comparison
    }, null, 2)
  );

  console.log(`\n[SAVED] Results → ${resultsDir}`);
  return {
    runId,
    timestamp: new Date().toISOString(),
    config: {
      contractType: config.input.contractType,
      representingParty: config.input.representingParty,
      variationCount: config.variations.length
    },
    results,
    comparison
  };
};
```


### The Production Quality Gate

In production, the evaluation pipeline serves a different purpose: automated quality
control. The production scorer evaluates every pipeline output against a minimum quality
threshold and routes the output accordingly:

```typescript
// quality-gate.ts
// Production quality gate for pipeline output

import { scoreDraft } from './scorer.js';
import type { ScorerInput, ScoreResult } from './types.js';

interface QualityGateResult {
  passed: boolean;
  score: ScoreResult;
  action: 'deliver' | 'flag-for-review' | 'reject';
  reason: string;
}

const THRESHOLD_DELIVER = 80;  // >= 80: deliver with confidence
const THRESHOLD_REVIEW = 60;   // 60-79: flag for attorney review
                               // < 60: reject

export const qualityGate = async (
  input: ScorerInput
): Promise<QualityGateResult> => {

  const score = await scoreDraft(input);

  if (score.total >= THRESHOLD_DELIVER) {
    return {
      passed: true,
      score,
      action: 'deliver',
      reason: `Score ${score.total}/100 exceeds delivery ` +
              `threshold (${THRESHOLD_DELIVER}).`
    };
  }

  if (score.total >= THRESHOLD_REVIEW) {
    const weakCriteria = (
      ['completeness', 'accuracy',
       'enforceability', 'organization'] as const
    )
      .filter(c => score[c].score < 18)
      .map(c => `${c}: ${score[c].score}/25`);

    return {
      passed: false,
      score,
      action: 'flag-for-review',
      reason: `Score ${score.total}/100 below delivery threshold.` +
              ` Weak areas: ${weakCriteria.join(', ')}.`
    };
  }

  return {
    passed: false,
    score,
    action: 'reject',
    reason: `Score ${score.total}/100 below minimum threshold ` +
            `(${THRESHOLD_REVIEW}). Quality insufficient.`
  };
};
```

The quality gate transforms evaluation from a research tool into a production component.
Every output is scored. Every score determines routing. Attorneys only review flagged
output, not all output. This is how evaluation engineering reduces attorney workload
while maintaining quality standards.


```svg
<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <defs>
    <marker id="arrow3" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <rect width="800" height="480" fill="#f8f9fa" rx="8"/>

  <text x="400" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 7.3: R&D Evaluation Pipeline — Backautocrat Orchestration</text>

  <!-- Input -->
  <rect x="30" y="50" width="140" height="60" rx="6" fill="#1a1a2e"/>
  <text x="100" y="78" text-anchor="middle" font-size="11" fill="white" font-weight="bold">Standardized</text>
  <text x="100" y="95" text-anchor="middle" font-size="11" fill="white" font-weight="bold">Input</text>

  <!-- Arrow to variations -->
  <line x1="170" y1="80" x2="210" y2="80" stroke="#16a085" stroke-width="2" marker-end="url(#arrow3)"/>

  <!-- Variation 1 -->
  <rect x="220" y="35" width="160" height="35" rx="4" fill="#1a1a2e"/>
  <text x="300" y="57" text-anchor="middle" font-size="10" fill="#16a085" font-weight="bold">V1: single-author (1 call)</text>

  <!-- Variation 2 -->
  <rect x="220" y="77" width="160" height="35" rx="4" fill="#1a1a2e"/>
  <text x="300" y="99" text-anchor="middle" font-size="10" fill="#f39c12" font-weight="bold">V2: author-enhancer (2 calls)</text>

  <!-- Variation 3 -->
  <rect x="220" y="119" width="160" height="35" rx="4" fill="#1a1a2e"/>
  <text x="300" y="141" text-anchor="middle" font-size="10" fill="#e74c3c" font-weight="bold">V3: 10-specialist (12 calls)</text>

  <!-- Arrows to outputs -->
  <line x1="380" y1="52" x2="420" y2="52" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <line x1="380" y1="94" x2="420" y2="94" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <line x1="380" y1="136" x2="420" y2="136" stroke="#e74c3c" stroke-width="1.5" marker-end="url(#arrow3)"/>

  <!-- Pipeline Outputs -->
  <rect x="430" y="35" width="100" height="35" rx="4" fill="#2a2a3e"/>
  <text x="480" y="57" text-anchor="middle" font-size="9" fill="white">Output 1</text>

  <rect x="430" y="77" width="100" height="35" rx="4" fill="#2a2a3e"/>
  <text x="480" y="99" text-anchor="middle" font-size="9" fill="white">Output 2</text>

  <rect x="430" y="119" width="100" height="35" rx="4" fill="#2a2a3e"/>
  <text x="480" y="141" text-anchor="middle" font-size="9" fill="white">Output 3</text>

  <!-- Arrows to scorer -->
  <line x1="530" y1="52" x2="580" y2="95" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <line x1="530" y1="94" x2="580" y2="100" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <line x1="530" y1="136" x2="580" y2="105" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrow3)"/>

  <!-- Scorer -->
  <rect x="590" y="60" width="170" height="80" rx="6" fill="#16a085"/>
  <text x="675" y="88" text-anchor="middle" font-size="12" fill="white" font-weight="bold">AI Scorer</text>
  <text x="675" y="105" text-anchor="middle" font-size="9" fill="white">(Independent call per output)</text>
  <text x="675" y="122" text-anchor="middle" font-size="9" fill="white">Same rubric for all</text>

  <!-- Separator -->
  <line x1="30" y1="175" x2="770" y2="175" stroke="#ccc" stroke-width="1" stroke-dasharray="4"/>
  <text x="400" y="195" text-anchor="middle" font-size="11" fill="#666" font-style="italic">Results Storage (4 files per run)</text>

  <!-- Results boxes -->
  <rect x="40" y="210" width="165" height="100" rx="6" fill="#1a1a2e"/>
  <text x="122" y="232" text-anchor="middle" font-size="11" fill="#f39c12" font-weight="bold">scores.json</text>
  <text x="52" y="252" font-size="9" fill="#a0a0b0">V1: 87/100</text>
  <text x="52" y="267" font-size="9" fill="#a0a0b0">V2: 88/100</text>
  <text x="52" y="282" font-size="9" fill="#a0a0b0">V3: 92/100</text>
  <text x="52" y="298" font-size="8" fill="#666">Per-criterion breakdown</text>

  <rect x="225" y="210" width="165" height="100" rx="6" fill="#1a1a2e"/>
  <text x="307" y="232" text-anchor="middle" font-size="11" fill="#f39c12" font-weight="bold">metrics.json</text>
  <text x="237" y="252" font-size="9" fill="#a0a0b0">Tokens, cost, latency</text>
  <text x="237" y="267" font-size="9" fill="#a0a0b0">Claude calls per variation</text>
  <text x="237" y="282" font-size="9" fill="#a0a0b0">Model version tracking</text>

  <rect x="410" y="210" width="165" height="100" rx="6" fill="#1a1a2e"/>
  <text x="492" y="232" text-anchor="middle" font-size="11" fill="#f39c12" font-weight="bold">comparison.json</text>
  <text x="422" y="252" font-size="9" fill="#a0a0b0">Quality winner</text>
  <text x="422" y="267" font-size="9" fill="#a0a0b0">Cost winner</text>
  <text x="422" y="282" font-size="9" fill="#a0a0b0">Efficiency winner</text>

  <rect x="595" y="210" width="165" height="100" rx="6" fill="#1a1a2e"/>
  <text x="677" y="232" text-anchor="middle" font-size="11" fill="#f39c12" font-weight="bold">full-run.json</text>
  <text x="607" y="252" font-size="9" fill="#a0a0b0">Complete outputs</text>
  <text x="607" y="267" font-size="9" fill="#a0a0b0">Scorer diagnostics</text>
  <text x="607" y="282" font-size="9" fill="#a0a0b0">Scorer reasoning</text>

  <!-- Analysis -->
  <line x1="400" y1="330" x2="400" y2="360" stroke="#16a085" stroke-width="2" marker-end="url(#arrow3)"/>

  <rect x="150" y="370" width="500" height="70" rx="6" fill="#16a085" opacity="0.15" stroke="#16a085" stroke-width="2"/>
  <text x="400" y="395" text-anchor="middle" font-size="12" fill="#1a1a2e" font-weight="bold">Cross-Run Analysis</text>
  <text x="400" y="415" text-anchor="middle" font-size="10" fill="#1a1a2e">Mean scores, standard deviations, score ranges, cost-quality curves,</text>
  <text x="400" y="430" text-anchor="middle" font-size="10" fill="#1a1a2e">per-criterion trends, reliability metrics, statistical findings</text>
</svg>
```


---

**Key Takeaways**

- The R&D evaluation pipeline runs all variations against the same input, scores each with the same scorer, and saves structured results (scores, metrics, comparison, full run) for cross-run analysis.
- The production quality gate scores every pipeline output and routes it based on threshold: deliver (80+), flag for review (60-79), or reject (<60).
- Four result files serve different audiences: scores.json for quick comparison, metrics.json for cost analysis, comparison.json for rankings, full-run.json for deep diagnostic analysis.

\newpage

## 7.8 Pass@k Reliability Testing

### The Single-Run Illusion

A pipeline that scores 90/100 on one run is not a 90-quality pipeline. It is a pipeline
that scored 90 once. Without repeated measurement, you cannot distinguish a consistently
excellent pipeline from one that got lucky.

This problem is well-documented in the broader AI evaluation literature. Research on
AI coding agents has shown that performance drops from 60% on single-attempt measurement
to 25% when measuring 8-run consistency. The same task, the same model, the same prompt,
and yet the success rate varies dramatically depending on whether you measure "did it
ever succeed?" or "does it succeed reliably?"

In legal engineering, this variance has direct professional consequences. A pipeline that
produces a 90-quality contract draft 60% of the time and a 65-quality draft 40% of the
time has a weighted average quality of 80, but the client who receives the 65-quality
draft does not experience an 80-quality pipeline. They experience a 65-quality pipeline,
and they experience it 40% of the time. That is not acceptable for legal work product.


### The Pass@k Methodology

Pass@k measures pipeline reliability by running the same pipeline on the same input k
times and reporting statistics across runs:

- **Mean score**: The average quality across k runs. Expected quality of any single run.
- **Score range**: The minimum and maximum scores observed. The quality envelope.
- **Standard deviation**: Spread of scores around the mean. Lower is better.
- **Pass rate**: Percentage of runs scoring above a defined quality threshold.


### TLE R&D Pass@k Results

**Experiment 01: Contract Drafting (4 runs per variation, revised methodology)**

| Variation | Scores | Mean | Range | SD | Pass@80 |
|-----------|--------|------|-------|-----|---------|
| single-author | 86, FAIL, 88, FAIL | 87.0 | [86-88] | 1.41 | 100%* |
| author-then-enhancer | 88, 88, 88, 87 | 87.75 | [87-88] | 0.50 | 100% |
| drafter-editors-author | 92, 92, 92, 91 | 91.75 | [91-92] | 0.50 | 100% |

*single-author scored above 80 when successful but had a 50% scorer failure rate.

The specialist pipeline demonstrates both the highest quality (91.75 mean) and the
highest reliability (SD 0.50, zero failures). The single-author variation has wider
variance and a troubling 50% scorer failure rate, which is itself a quality signal:
outputs that consistently break downstream processing are structurally problematic.

**Experiment 02: Document Triage (multiple runs, representative sample)**

| Variation | Representative Scores | Typical Range | Mean |
|-----------|----------------------|---------------|------|
| single-classifier | 48, 48, 52 | [48-52] | ~49 |
| classifier-plus-extractor | 76, 78, 78 | [76-78] | ~77 |
| specialist-triage-team | 95, 96, 96 | [95-96] | ~96 |

The specialist triage team produced remarkably consistent results: 95-96 across runs,
a 1-point range. Single-classifier also showed tight consistency but at a much lower
quality level. Both the best and worst variations are consistent. Architecture
determines both quality level and quality consistency.

**Experiment 03: Legal Research (2 complete post-calibration runs)**

| Variation | Run 4 | Run 5 | Mean | Range | SD |
|-----------|-------|-------|------|-------|-----|
| single-researcher | 73 | 73 | 73.0 | [73-73] | 0.0 |
| prompter-researchers | 62 | 59 | 60.5 | [59-62] | 2.1 |
| prompter-researchers-synthesizer | 77 | 77 | 77.0 | [77-77] | 0.0 |

The most striking finding: Variation 2 has both the lowest quality and the highest
variance (SD 2.1 vs. 0.0). Four parallel researchers without a synthesizer produce
output whose quality depends on how well the individual researchers happen to cover
the space. The synthesizer normalizes this variance by merging and deduplicating.


> **Insight**
>
> A synthesizer does not merely improve quality scores. It also improves reliability by
> normalizing variance from parallel specialists. When four specialists run independently,
> the distribution of their individual focus areas varies between runs. Without a
> synthesizer, that variance propagates to the final output. With a synthesizer, it is
> absorbed during the merge step. This is an underappreciated benefit of the
> fan-out/fan-in pattern.


### How Many Runs Are Enough?

- **Quick directional check** (is V1 clearly better than V2?): 2-3 runs
- **Publishable finding** (with confidence intervals): 5+ runs
- **Production reliability baseline** (for quality gate thresholds): 10+ runs


---

**Key Takeaways**

- Pass@k testing reveals variance that single-run evaluation misses. The mean, range, and standard deviation across k runs define the true quality profile.
- Specialist pipelines with synthesizers produce both higher quality and lower variance than alternatives, making them more reliable in production.
- A 50% scorer failure rate on the single-author variation is itself a quality finding: outputs that break downstream processing are structurally problematic.

\newpage

## 7.9 Cost Engineering

### The Cost-Quality Equation

Every Claude API call has a measurable cost. The Opus pricing formula:

```
Cost (USD) = (inputTokens * 3 + outputTokens * 15) / 1,000,000
```

Output tokens cost 5x more than input tokens. A pipeline that generates 100,000 output
tokens costs significantly more than one generating 20,000, even with identical input.


### Cost Profiles Across Experiments

| Experiment | Variation | Calls | Input Tokens | Output Tokens | Cost | Score | Pts/$ |
|------------|-----------|-------|-------------|---------------|------|-------|-------|
| Drafting | single-author | 1 | ~290 | ~10,700 | $0.16 | 87 | 544 |
| Drafting | author-enhancer | 2 | ~12,100 | ~27,700 | $0.45 | 88 | 196 |
| Drafting | 10-specialist | 12 | ~120,600 | ~75,800 | $1.50 | 92 | 61 |
| Triage | single-classifier | 1 | ~10,100 | ~1,200 | $0.05 | 48 | 960 |
| Triage | classifier+extractor | 2 | ~24,000 | ~17,300 | $0.33 | 78 | 236 |
| Triage | specialist-team | 7 | ~142,700 | ~107,300 | $2.04 | 96 | 47 |
| Research | single-researcher | 1 | ~10,700 | ~19,100 | $0.32 | 73 | 228 |
| Research | prompter-researchers | 5 | ~114,500 | ~120,100 | $2.15 | 60.5 | 28 |
| Research | full pipeline | 6 | ~208,900 | ~114,700 | $2.35 | 77 | 33 |

Three patterns emerge:

**Output tokens dominate cost.** In every experiment, output tokens account for 70-90%
of total cost despite being 40-60% of total token count. This is the 5x output
multiplier. Verbose pipelines pay heavily.

**Specialist pipelines cost 7-40x more than single-pass.** The Triage specialist team
costs 40x more ($2.04 vs. $0.05). The Drafting specialist costs 9x more ($1.50 vs.
$0.16). The Research full pipeline costs 7x more ($2.35 vs. $0.32).

**The efficiency winner is always single-pass.** By points-per-dollar: 544, 960, 228
for single-pass versus 61, 47, 33 for specialist pipelines. Mathematically inevitable:
quality improvement (4-48 points) is proportionally smaller than cost increase (7-40x).


### The Cost-Quality Curve

```svg
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="800" height="500" fill="#f8f9fa" rx="8"/>

  <text x="400" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 7.4: Cost-Quality Curves Across Three TLE R&D Experiments</text>

  <!-- Axes -->
  <line x1="100" y1="420" x2="750" y2="420" stroke="#1a1a2e" stroke-width="2"/>
  <line x1="100" y1="420" x2="100" y2="60" stroke="#1a1a2e" stroke-width="2"/>

  <!-- Y-axis labels -->
  <text x="90" y="415" text-anchor="end" font-size="10" fill="#666">0</text>
  <text x="90" y="345" text-anchor="end" font-size="10" fill="#666">20</text>
  <text x="90" y="275" text-anchor="end" font-size="10" fill="#666">40</text>
  <text x="90" y="205" text-anchor="end" font-size="10" fill="#666">60</text>
  <text x="90" y="135" text-anchor="end" font-size="10" fill="#666">80</text>
  <text x="90" y="75" text-anchor="end" font-size="10" fill="#666">100</text>
  <text x="30" y="240" text-anchor="middle" font-size="11" fill="#1a1a2e" font-weight="bold" transform="rotate(-90 30 240)">Quality Score (0-100)</text>

  <!-- Y-axis grid lines -->
  <line x1="100" y1="345" x2="750" y2="345" stroke="#eee" stroke-width="1"/>
  <line x1="100" y1="275" x2="750" y2="275" stroke="#eee" stroke-width="1"/>
  <line x1="100" y1="205" x2="750" y2="205" stroke="#eee" stroke-width="1"/>
  <line x1="100" y1="135" x2="750" y2="135" stroke="#eee" stroke-width="1"/>
  <line x1="100" y1="75" x2="750" y2="75" stroke="#eee" stroke-width="1"/>

  <!-- X-axis labels -->
  <text x="100" y="440" text-anchor="middle" font-size="10" fill="#666">$0.00</text>
  <text x="230" y="440" text-anchor="middle" font-size="10" fill="#666">$0.50</text>
  <text x="360" y="440" text-anchor="middle" font-size="10" fill="#666">$1.00</text>
  <text x="490" y="440" text-anchor="middle" font-size="10" fill="#666">$1.50</text>
  <text x="620" y="440" text-anchor="middle" font-size="10" fill="#666">$2.00</text>
  <text x="750" y="440" text-anchor="middle" font-size="10" fill="#666">$2.50</text>
  <text x="425" y="470" text-anchor="middle" font-size="11" fill="#1a1a2e" font-weight="bold">Cost per Run (USD)</text>

  <!-- Drafting curve (teal) -->
  <circle cx="142" cy="117" r="6" fill="#16a085"/>
  <circle cx="217" cy="113" r="6" fill="#16a085"/>
  <circle cx="490" cy="99" r="6" fill="#16a085"/>
  <path d="M142 117 Q300 108 490 99" stroke="#16a085" stroke-width="2" fill="none"/>
  <text x="500" y="92" font-size="9" fill="#16a085" font-weight="bold">Drafting</text>

  <!-- Triage curve (amber) -->
  <circle cx="113" cy="252" r="6" fill="#f39c12"/>
  <circle cx="186" cy="148" r="6" fill="#f39c12"/>
  <circle cx="630" cy="85" r="6" fill="#f39c12"/>
  <path d="M113 252 Q200 130 630 85" stroke="#f39c12" stroke-width="2" fill="none"/>
  <text x="640" y="78" font-size="9" fill="#f39c12" font-weight="bold">Triage</text>

  <!-- Research curve (coral) — note the INVERSION at V2 -->
  <circle cx="183" cy="165" r="6" fill="#e74c3c"/>
  <circle cx="659" cy="209" r="6" fill="#e74c3c"/>
  <circle cx="711" cy="151" r="6" fill="#e74c3c"/>
  <path d="M183 165 L659 209" stroke="#e74c3c" stroke-width="2" fill="none" stroke-dasharray="6,3"/>
  <path d="M659 209 L711 151" stroke="#e74c3c" stroke-width="2" fill="none"/>
  <text x="670" y="225" font-size="8" fill="#e74c3c">V2: parallelization</text>
  <text x="670" y="237" font-size="8" fill="#e74c3c">WITHOUT synthesis</text>
  <text x="720" y="145" font-size="9" fill="#e74c3c" font-weight="bold">Research</text>

  <!-- Annotation -->
  <rect x="570" y="244" width="200" height="30" rx="4" fill="#e74c3c" opacity="0.1" stroke="#e74c3c" stroke-width="1"/>
  <text x="670" y="263" text-anchor="middle" font-size="9" fill="#e74c3c" font-weight="bold">More money, WORSE quality</text>

  <!-- Legend -->
  <rect x="110" y="55" width="12" height="12" rx="2" fill="#16a085"/>
  <text x="128" y="65" font-size="10" fill="#1a1a2e">Drafting (1, 2, 12 calls)</text>
  <rect x="310" y="55" width="12" height="12" rx="2" fill="#f39c12"/>
  <text x="328" y="65" font-size="10" fill="#1a1a2e">Triage (1, 2, 7 calls)</text>
  <rect x="510" y="55" width="12" height="12" rx="2" fill="#e74c3c"/>
  <text x="528" y="65" font-size="10" fill="#1a1a2e">Research (1, 5, 6 calls)</text>
</svg>
```

The cost-quality curve reveals the most important finding from the Legal Research
experiment: **spending more money on the wrong architecture makes quality worse.**
Variation 2 cost 7x more than Variation 1 and scored 12.5 points lower. The dashed
line in the Research curve represents this quality inversion. It is the only instance
across all three experiments where increasing investment decreased quality.

This inversion occurs because the additional cost went to parallelization without
synthesis. The lesson: cost does not predict quality. Architecture predicts quality.
A well-designed pipeline at $0.32 outperforms a poorly-designed pipeline at $2.15.


### When Cost Does Not Matter

For most legal workflows, the absolute cost of even the most expensive pipeline is
economically irrelevant. The specialist drafting pipeline costs $3.00 per contract
draft. A junior associate at $400/hour takes 4-8 hours for the same work: $1,600-$3,200.
A BigLaw senior associate at $750/hour takes 2-4 hours: $1,500-$3,000. At $3.00 per
draft, the AI pipeline is 500-1,000x cheaper than human drafting. The cost premium of
the specialist pipeline over single-pass ($3.00 vs. $0.16) is $2.84, less than one
minute of associate billing time.


> **Practice Tip**
>
> When evaluating cost-quality trade-offs, compare the pipeline cost to the alternative,
> not to zero. A $3.00 contract draft is not expensive. It is $3.00 vs. $2,000 for the
> same deliverable. The question is never "is $3.00 too much?" The question is "does the
> $3.00 pipeline produce output that eliminates $2,000 of manual work?"


---

**Key Takeaways**

- Output tokens dominate cost (5x multiplier). Verbose pipelines pay heavily for every additional output token.
- Specialist pipelines cost 7-40x more but improve quality by 4-48 points. In absolute terms ($0.05-$3.00), even the most expensive pipeline costs less than one minute of associate time.
- Cost does not predict quality. Architecture predicts quality. A well-designed $0.32 pipeline outperforms a poorly-designed $2.15 pipeline (Legal Research, Experiment 03).

\newpage

## 7.10 Case Studies: TLE R&D Experiments

### Case Study 1: Does Multi-Pass Actually Matter? (Contract Drafting)

**Variations**: single-author (1 call), author-then-enhancer (2 calls), drafter-editors-author (12 calls with 10 parallel domain specialists)

**The Methodological Journey:**

This experiment required three rounds of revision, making it a case study in evaluation
engineering itself.

**Round 1** (simple playbook, 8K max_tokens): Scores 87, 87, 91. The 4-point specialist advantage appeared to come from better token budget management, not better content.

**Round 2** (128K max_tokens, slightly stricter scorer): Scores 93, 93, 93. Identical. The experiment appeared to show multi-pass adds zero value. We nearly published this conclusion.

**Round 3** (30-point enterprise playbook, diagnostic-first scorer, 10 domain specialists): Scores differentiated clearly:

| Variation | Mean | Range | SD | Cost | Calls |
|-----------|------|-------|-----|------|-------|
| single-author | 87.0 | [86-88] | 1.41 | $0.24 | 1 |
| author-then-enhancer | 87.75 | [87-88] | 0.50 | $0.64 | 2 |
| drafter-editors-author | 91.75 | [91-92] | 0.50 | $3.00 | 12 |

**Findings:**

1. A generalist second pass adds zero quality (87.75 vs. 87.0, within variance).
2. Ten domain specialists add 4 consistent points distributed evenly across all criteria.
3. The cost premium ($3.00 vs. $0.24) is economically irrelevant for enterprise contracts.
4. The specialist pipeline was 100% reliable; single-author had 50% scorer failure rate.

**The evaluation engineering lesson:** The same experiment with the same variations produced opposite conclusions depending on evaluation infrastructure. With a simple playbook and lenient scorer: 93/93/93 (multi-pass worthless). With a complex playbook and diagnostic scorer: 87/88/92 (specialists clearly win). The evaluation methodology was the confounding variable.


### Case Study 2: Does Multi-Agent Triage Produce Actionable Intelligence? (Document Triage)

**Input**: 8 realistic legal documents (MSA, NDA amendment, trademark demand letter, invoice, VC term sheet, separation agreement, SEC subpoena, lease renewal)

**Variations**: single-classifier (1 call), classifier-plus-extractor (2 calls), specialist-triage-team (7 calls: 6 parallel specialists + synthesizer)

| Variation | Score | Classification | Extraction | Risk | Actionability | Cost |
|-----------|-------|---------------|------------|------|---------------|------|
| single-classifier | 48 | 17 | 11 | 10 | 10 | $0.05 |
| classifier+extractor | 78 | 22 | 22 | 19 | 15 | $0.33 |
| specialist-triage-team | 96 | 24 | 24 | 24 | 24 | $2.04 |

**The largest quality gap in any TLE R&D experiment: 48 points.** The specialist pipeline scored near-perfect on every criterion. Six domain specialists (classifier, extractor, deadline tracker, risk detector, gap analyzer, priority router) each dedicated their full attention to one dimension, producing deep analysis that a single prompt cannot replicate.

The specialist Risk & Red Flag Detector caught the SEC subpoena's impact on the Series B timeline, identified ADEA compliance requirements in the separation agreement, flagged verbal authorization risk in the invoice, and detected the unsigned NDA amendment's exposure. The single-pass baseline caught some of these. The specialist caught all of them.


### Case Study 3: Does Multi-Agent Research Produce Superior Legal Analysis? (Legal Research)

**Input**: Complex litigation fact pattern involving AI legal tool failure, malpractice exposure, multiple claims and counterparties

**Variations**: single-researcher (1 call), prompter-researchers (5 calls, no synthesizer), prompter-researchers-synthesizer (6 calls)

| Variation | Total | Issue ID | Authority | Depth | Counter-Args | Actionability | Cost |
|-----------|-------|---------|-----------|-------|-------------|---------------|------|
| single-researcher | 73 | 16/20 | 10/20 | 15/20 | 16/20 | 16/20 | $0.32 |
| prompter-researchers | 60.5 | 15/20 | 9/20 | 12/20 | 14/20 | 9/20 | $2.15 |
| prompter-researchers-synthesizer | 77 | 17/20 | 11/20 | 16/20 | 16/20 | 17/20 | $2.35 |

**The paradigm-breaking finding: parallelization without synthesis is WORSE than single-pass.** V2 scored 12.5 points below V1. It cost 7x more. It produced a 50,000-word concatenation of four specialist reports with no unified structure and an actionability score of 9/20 versus single-pass at 16/20.

The synthesizer, adding one call (~$0.20), transformed the output from worst to best:

| Variation | Word Count | Format | Deliverable? |
|-----------|-----------|--------|-------------|
| single-researcher | ~11,000 | Coherent memo | Yes |
| prompter-researchers | ~50,000 | 4 concatenated dumps | No |
| prompter-researchers-synthesizer | ~11,500 | Synthesized memo | Yes |

**Authority accuracy: the universal bottleneck.** All three variations scored 9-11/20, the lowest criterion for every variation. Hallucination is a model-level limitation, not an architecture-level one. Only external verification against legal research databases would address it.


```svg
<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <rect width="800" height="480" fill="#f8f9fa" rx="8"/>

  <text x="400" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 7.5: TLE R&D Experiment Results — Comparative Quality Scores</text>

  <!-- Labels -->
  <text x="95" y="90" text-anchor="end" font-size="11" fill="#1a1a2e" font-weight="bold">Drafting</text>
  <text x="95" y="104" text-anchor="end" font-size="9" fill="#666">(Exp 01)</text>
  <text x="95" y="210" text-anchor="end" font-size="11" fill="#1a1a2e" font-weight="bold">Triage</text>
  <text x="95" y="224" text-anchor="end" font-size="9" fill="#666">(Exp 02)</text>
  <text x="95" y="330" text-anchor="end" font-size="11" fill="#1a1a2e" font-weight="bold">Research</text>
  <text x="95" y="344" text-anchor="end" font-size="9" fill="#666">(Exp 03)</text>

  <!-- Scale -->
  <line x1="110" y1="50" x2="110" y2="440" stroke="#ddd" stroke-width="1"/>
  <line x1="270" y1="50" x2="270" y2="440" stroke="#ddd" stroke-width="1"/>
  <line x1="430" y1="50" x2="430" y2="440" stroke="#ddd" stroke-width="1"/>
  <line x1="590" y1="50" x2="590" y2="440" stroke="#ddd" stroke-width="1"/>
  <line x1="750" y1="50" x2="750" y2="440" stroke="#ddd" stroke-width="1"/>
  <text x="110" y="460" text-anchor="middle" font-size="10" fill="#666">0</text>
  <text x="270" y="460" text-anchor="middle" font-size="10" fill="#666">25</text>
  <text x="430" y="460" text-anchor="middle" font-size="10" fill="#666">50</text>
  <text x="590" y="460" text-anchor="middle" font-size="10" fill="#666">75</text>
  <text x="750" y="460" text-anchor="middle" font-size="10" fill="#666">100</text>

  <!-- DRAFTING bars -->
  <rect x="110" y="70" width="557" height="18" rx="3" fill="#16a085" opacity="0.7"/>
  <text x="675" y="83" font-size="10" fill="#1a1a2e" font-weight="bold">87.0</text>
  <text x="120" y="83" font-size="9" fill="white">V1: single-author (1 call)</text>

  <rect x="110" y="92" width="562" height="18" rx="3" fill="#f39c12" opacity="0.7"/>
  <text x="680" y="105" font-size="10" fill="#1a1a2e" font-weight="bold">87.8</text>
  <text x="120" y="105" font-size="9" fill="white">V2: author-enhancer (2 calls)</text>

  <rect x="110" y="114" width="587" height="18" rx="3" fill="#e74c3c" opacity="0.8"/>
  <text x="705" y="127" font-size="10" fill="#1a1a2e" font-weight="bold">91.8</text>
  <text x="120" y="127" font-size="9" fill="white">V3: 10-specialist pipeline (12 calls)</text>

  <!-- TRIAGE bars -->
  <rect x="110" y="190" width="307" height="18" rx="3" fill="#16a085" opacity="0.7"/>
  <text x="425" y="203" font-size="10" fill="#1a1a2e" font-weight="bold">48</text>
  <text x="120" y="203" font-size="9" fill="white">V1: single-classifier (1 call)</text>

  <rect x="110" y="212" width="499" height="18" rx="3" fill="#f39c12" opacity="0.7"/>
  <text x="617" y="225" font-size="10" fill="#1a1a2e" font-weight="bold">78</text>
  <text x="120" y="225" font-size="9" fill="white">V2: classifier+extractor (2 calls)</text>

  <rect x="110" y="234" width="614" height="18" rx="3" fill="#e74c3c" opacity="0.8"/>
  <text x="732" y="247" font-size="10" fill="#1a1a2e" font-weight="bold">96</text>
  <text x="120" y="247" font-size="9" fill="white">V3: specialist-triage-team (7 calls)</text>

  <!-- RESEARCH bars -->
  <rect x="110" y="310" width="467" height="18" rx="3" fill="#16a085" opacity="0.7"/>
  <text x="585" y="323" font-size="10" fill="#1a1a2e" font-weight="bold">73</text>
  <text x="120" y="323" font-size="9" fill="white">V1: single-researcher (1 call)</text>

  <rect x="110" y="332" width="387" height="18" rx="3" fill="#f39c12" opacity="0.7"/>
  <text x="505" y="345" font-size="10" fill="#1a1a2e" font-weight="bold">60.5</text>
  <text x="120" y="345" font-size="9" fill="white">V2: no synthesizer (5 calls)</text>
  <text x="510" y="345" font-size="10" fill="#e74c3c" font-weight="bold">WORSE than V1</text>

  <rect x="110" y="354" width="493" height="18" rx="3" fill="#e74c3c" opacity="0.8"/>
  <text x="611" y="367" font-size="10" fill="#1a1a2e" font-weight="bold">77</text>
  <text x="120" y="367" font-size="9" fill="white">V3: full pipeline w/ synthesizer (6 calls)</text>

  <!-- Legend -->
  <rect x="200" y="410" width="12" height="12" rx="2" fill="#16a085" opacity="0.7"/>
  <text x="218" y="421" font-size="10" fill="#1a1a2e">Single-pass (1-2 calls)</text>
  <rect x="400" y="410" width="12" height="12" rx="2" fill="#f39c12" opacity="0.7"/>
  <text x="418" y="421" font-size="10" fill="#1a1a2e">Medium complexity</text>
  <rect x="580" y="410" width="12" height="12" rx="2" fill="#e74c3c" opacity="0.8"/>
  <text x="598" y="421" font-size="10" fill="#1a1a2e">Full specialist pipeline</text>
</svg>
```


### Cross-Experiment Synthesis

Five patterns emerge across all three experiments:

1. **The specialist pipeline always wins on quality.** Drafting: 91.75. Triage: 96. Research: 77. In every experiment, domain specialists plus a synthesizer produce the highest score.

2. **A generalist second pass adds minimal or zero value.** Drafting: author-enhancer (87.75) indistinguishable from single-author (87.0). Research: prompter-researchers (60.5) worse than single-researcher (73).

3. **The synthesizer is the critical component.** Research: V2 (60.5) vs. V3 (77), difference is one synthesizer call. Without synthesis, parallel output is fragmented, redundant, and less useful than single-pass.

4. **Quality improvement and cost efficiency are inversely related.** Specialists cost 7-40x more. In absolute terms ($0.05-$3.00), the cost is negligible. The efficiency winner (points per dollar) is always single-pass.

5. **Evaluation methodology determines experimental conclusions.** Same pipelines, different rubrics, different findings. The rubric is not neutral. It determines what you see.


> **Key Concept**
>
> The single most important finding across all TLE R&D experiments is not about pipeline
> architecture. It is about evaluation: the same pipeline, scored by different rubrics,
> produces different conclusions about whether the pipeline works. Choose the wrong lens
> and you draw the wrong conclusion. Choose the right lens and the data reveals what
> actually matters.


---

**Key Takeaways**

- Drafting: Generalist second pass adds zero value. Ten domain specialists add 4 consistent points across all criteria.
- Triage: The largest quality gap measured (48 points). Specialist architecture eliminates attention dilution across multiple analysis dimensions.
- Research: Parallelization without synthesis is worse than single-pass (60.5 vs. 73). The synthesizer is the critical component that converts information into intelligence.
- The evaluation methodology itself is an experimental variable: the same experiment produced opposite conclusions under different rubrics.

\newpage

## 7.11 The Evaluation-Driven Improvement Loop

### From Scores to Actions

Evaluation data is only valuable if it drives pipeline improvement. A score of 87/100
is not a grade to celebrate or lament. It is a diagnostic instrument that tells you
exactly what to fix.

The evaluation-driven improvement loop follows a systematic process:

1. **Run pipeline and score output.** Collect the scorer's full diagnostic inventory,
   per-criterion scores, and reasoning.

2. **Identify the weakest criterion.** Which dimension scored lowest? In the Legal
   Research experiment, authority accuracy scored 10/20 across all variations.

3. **Trace the weakness to specific diplomat outputs.** For a multi-agent pipeline,
   which specialist's output contributed to the low score? Is the risk detector missing
   risks? Producing false positives? Lacking detail?

4. **Revise the underperforming diplomat's prompt.** Add explicit instructions targeting
   the identified weakness.

5. **Re-run and re-score.** Compare new scores to baseline. Did the targeted criterion
   improve? Did other criteria degrade?

6. **Iterate until scores stabilize.** Continue until the targeted criterion reaches
   the desired level without degrading other criteria. Then move to the next weakest.


```svg
<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, -apple-system, sans-serif">
  <defs>
    <marker id="arrow4" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <rect width="800" height="360" fill="#f8f9fa" rx="8"/>

  <text x="400" y="28" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a1a2e">Figure 7.6: The Evaluation-Driven Improvement Loop</text>

  <!-- Step 1 -->
  <rect x="60" y="60" width="150" height="55" rx="6" fill="#1a1a2e"/>
  <text x="135" y="85" text-anchor="middle" font-size="11" fill="white" font-weight="bold">1. Run Pipeline</text>
  <text x="135" y="102" text-anchor="middle" font-size="9" fill="#a0a0b0">Execute on standard input</text>

  <line x1="210" y1="87" x2="260" y2="87" stroke="#16a085" stroke-width="2" marker-end="url(#arrow4)"/>

  <!-- Step 2 -->
  <rect x="270" y="60" width="150" height="55" rx="6" fill="#16a085"/>
  <text x="345" y="85" text-anchor="middle" font-size="11" fill="white" font-weight="bold">2. Score Output</text>
  <text x="345" y="102" text-anchor="middle" font-size="9" fill="white">Diagnostic-first scorer</text>

  <line x1="420" y1="87" x2="470" y2="87" stroke="#16a085" stroke-width="2" marker-end="url(#arrow4)"/>

  <!-- Step 3 -->
  <rect x="480" y="60" width="150" height="55" rx="6" fill="#f39c12"/>
  <text x="555" y="85" text-anchor="middle" font-size="11" fill="white" font-weight="bold">3. Find Weakness</text>
  <text x="555" y="102" text-anchor="middle" font-size="9" fill="white">Lowest criterion score</text>

  <line x1="555" y1="115" x2="555" y2="155" stroke="#16a085" stroke-width="2" marker-end="url(#arrow4)"/>

  <!-- Step 4 -->
  <rect x="480" y="165" width="150" height="55" rx="6" fill="#f39c12"/>
  <text x="555" y="188" text-anchor="middle" font-size="11" fill="white" font-weight="bold">4. Trace to Agent</text>
  <text x="555" y="205" text-anchor="middle" font-size="9" fill="white">Which specialist failed?</text>

  <line x1="480" y1="192" x2="420" y2="192" stroke="#16a085" stroke-width="2" marker-end="url(#arrow4)"/>

  <!-- Step 5 -->
  <rect x="270" y="165" width="150" height="55" rx="6" fill="#e74c3c"/>
  <text x="345" y="188" text-anchor="middle" font-size="11" fill="white" font-weight="bold">5. Revise Prompt</text>
  <text x="345" y="205" text-anchor="middle" font-size="9" fill="white">Targeted improvement</text>

  <line x1="270" y1="192" x2="210" y2="192" stroke="#16a085" stroke-width="2" marker-end="url(#arrow4)"/>

  <!-- Step 6 -->
  <rect x="60" y="165" width="150" height="55" rx="6" fill="#1a1a2e"/>
  <text x="135" y="188" text-anchor="middle" font-size="11" fill="white" font-weight="bold">6. Re-run, Compare</text>
  <text x="135" y="205" text-anchor="middle" font-size="9" fill="#a0a0b0">Did score improve?</text>

  <!-- Loop arrow -->
  <path d="M60 192 Q20 192 20 130 Q20 60 60 80" stroke="#16a085" stroke-width="2" fill="none" marker-end="url(#arrow4)"/>
  <text x="10" y="135" font-size="9" fill="#16a085" font-weight="bold" transform="rotate(-90 10 135)">ITERATE</text>

  <!-- Compounding box -->
  <rect x="130" y="260" width="540" height="70" rx="6" fill="#16a085" opacity="0.15" stroke="#16a085" stroke-width="2"/>
  <text x="400" y="285" text-anchor="middle" font-size="12" fill="#1a1a2e" font-weight="bold">Each Iteration Compounds: Score Data Becomes Institutional Knowledge</text>
  <text x="400" y="305" text-anchor="middle" font-size="10" fill="#1a1a2e">Iteration 1: Fix risk detection (62 to 71) | Iteration 2: Fix citations (71 to 78)</text>
  <text x="400" y="320" text-anchor="middle" font-size="10" fill="#1a1a2e">Iteration 3: Fix actionability (78 to 85) | Iteration N: Converge on quality ceiling</text>
</svg>
```


### The Compounding Effect

This loop is the institutional learning mechanism that most AI systems lack. Victor
Dibia, in *Designing Multi-Agent Systems*, calls this absence "goldfish agents": AI
systems with no memory of their own failures, doomed to repeat the same mistakes on
every run. The evaluation loop provides the memory. Every run produces data. Every score
identifies a weakness. Every weakness drives a revision. The pipeline gets better with
every iteration, and the improvement is documented, reproducible, and measurable.

This compounding effect is what separates legal engineering from prompt engineering. A
prompt engineer writes a prompt, tries it, adjusts it based on impressions, and tries
again. A legal engineer writes a prompt, scores it, identifies the weakest criterion
from diagnostic data, adjusts the specific element responsible, scores again, and
compares numerically. The prompt engineer navigates by feel. The legal engineer
navigates by instruments.


### Evaluation as a Competitive Moat

Evaluation infrastructure is expensive to build, time-consuming to calibrate, and
impossible to shortcut. A competitor can copy your pipeline architecture by examining
your output. They cannot copy your evaluation infrastructure because it is internal: the
scorer prompts, the diagnostic phases, the scoring bands, the hard caps, the calibration
data, and the iterative refinement history that led to the current rubric. All of this is
proprietary institutional knowledge that accumulates over dozens of experiments.

When TLE Practice pitches a $75,000 custom workflow, the evaluation infrastructure makes
the pitch credible. We do not say "our pipeline is better." We say "here is the score
data from 5 runs of our pipeline on your document type, compared to a single-prompt
baseline, with per-criterion breakdowns, cost analysis, and reliability metrics." The
competitor without evaluation infrastructure says "here is a demo." The demo is
impressive. The data is convincing.


---

**Key Takeaways**

- The evaluation-driven improvement loop (run, score, find weakness, trace to agent, revise, re-run) is the institutional learning mechanism that makes pipelines better over time.
- Each iteration compounds: improvements are encoded in prompts and architecture, producing permanent quality gains that accumulate across dozens of iterations.
- Evaluation infrastructure is a competitive moat: it is expensive to build, impossible to copy from output alone, and essential for converting pipeline capabilities into credible client-facing evidence.

\newpage

## Summary

Evaluation engineering is the discipline that converts every other discipline in this
book into demonstrated, measured, reproducible value. Without it, TIRO decomposition,
multi-agent orchestration, parallel execution, and integration patterns produce output
that might be good. With it, they produce output you can prove is good.

The chapter established six pillars of evaluation engineering:

**AI-as-judge approaches.** Three methods serve different contexts: pointwise scoring
for absolute quality measurement (the workhorse), pairwise comparison for relative
ranking, and reference-based evaluation for gold-standard benchmarking.

**Bias mitigation.** Four systematic biases (position, verbosity, self-enhancement,
anchoring) are mitigated by independent evaluation calls, structured rubrics,
diagnostic-first methodology, and strict scoring bands.

**The diagnostic-first scorer.** Mandatory diagnostic inventories force the scorer to
catalog specific observations before assigning scores. Scoring bands prevent compression.
Hard caps enforce objective quality floors. Anti-inflation rules require affirmative
evidence for high scores.

**Rubric design.** Four universal dimensions (completeness, accuracy, depth,
actionability) apply across all legal workflows, with workflow-specific criteria and
diagnostics customized for each deliverable type.

**Pass@k reliability.** Multi-run measurement reveals variance that single-run
evaluation misses. Specialist pipelines with synthesizers produce both higher quality
and lower variance.

**Cost engineering.** The cost-quality relationship follows a logarithmic curve with
one critical exception: spending more on the wrong architecture (parallelization without
synthesis) makes quality worse.

Three TLE R&D experiments validate the framework:

- **Drafting**: 10 domain specialists add 4 consistent points (91.75 vs. 87.0); a generalist second pass adds zero.
- **Triage**: Specialist pipeline scores 96 vs. single-pass 48, the largest gap measured.
- **Research**: Parallelization without synthesis scores 60.5, worse than single-pass at 73. The synthesizer is the critical component.

The most important finding is not about pipelines. It is about evaluation: **the same
pipeline produces different conclusions under different rubrics.** The evaluation
methodology is not incidental to the findings. It determines them. This is why
evaluation engineering is a first-class discipline, not an afterthought. It is the
lens through which all other engineering decisions are measured, and the quality of that
lens determines the quality of every decision it informs.

---

**Key Takeaways**

- Evaluation engineering is the discipline of building automated, reproducible quality assessment systems for AI pipeline output. It produces the evidence that distinguishes a legal engineering practice from a prompt engineering experiment.
- The diagnostic-first methodology (inventory findings before scoring), strict scoring bands, and hard caps are the three design patterns that produce calibrated, discriminative scores.
- Three TLE R&D experiments demonstrate that multi-agent architectures with domain specialists and synthesizers consistently outperform single-pass approaches, but only when evaluated with rubrics that measure deliverable quality rather than information volume.
- The evaluation methodology itself is an experimental variable: the same pipeline produces different conclusions under different rubrics. Invest in scorer calibration at least as much as pipeline development.
- Cost is not the constraint. Architecture is. A well-designed pipeline at $0.32 outperforms a poorly-designed pipeline at $2.15.

\newpage
