\newpage

# Chapter 2: Technology Essentials

*Claude Code, TypeScript, APIs, the Anthropic API, Context Engineering, Tokens, Prompts, Tools, RAG, OOXML, SSE, and Failure Modes*

This is the largest chapter in this book. It teaches every technology concept a legal engineer needs to know, from the development environment where you write code to the XML surgery that produces Word documents with Track Changes. Thirteen sub-chapters, each self-contained but building on the ones before it. The reader who completes Chapter 2 can read production TypeScript, understand API calls and their cost structures, reason about token economics, write prompts at every level of the engineering ladder, and comprehend how AI models process legal documents from ingestion through delivery.

A word about scope. Entire books exist for TypeScript. Entire courses exist for API design. The goal here is not comprehensive coverage of any single technology. The goal is to build the working vocabulary and core patterns that recur in every chapter of this book and in every legal engineering pipeline you will ever build. Where a topic demands depth, we go deep. Where a topic is well-served by external references, we teach the legal engineering subset and point you to the rest. Every code example in this chapter is production-grade TypeScript drawn from real systems. None of it is pseudocode.

One more preliminary. If you are already proficient in TypeScript, Express, and React, some early sections of this chapter will cover ground you know. Do not skip them. The legal engineering context changes what matters about each technology. TypeScript's strict mode is not just a best practice in our world; it is a malpractice shield. Express is not just a web framework; it is a pipeline orchestrator. React is not just a UI library; it is the attorney's window into a multi-agent system running twenty-six simultaneous analyses. The technology is familiar. The application to legal work product is not.

\newpage

## 2A. Claude Code

*The Agentic Development Environment*

### What Claude Code Is

Claude Code is Anthropic's command-line agent for software development. It is not a code autocomplete engine. It is not a chatbot that answers programming questions. It is an autonomous agent that reads your files, understands your codebase, writes production code, executes terminal commands, searches across thousands of files, runs tests, fixes errors, and orchestrates multi-step development tasks. You describe what you want built, and Claude Code builds it.

For legal engineering, Claude Code is the primary development environment. Not the only tool you will use. You will still need a text editor for reviewing code, a terminal for running servers, and a browser for testing interfaces. But Claude Code is where the architectural decisions happen, where the pipeline stages get implemented, where the prompts get refined, and where the TypeScript types get defined. It is, in the framing of this book, the deal team for building the deal team. The same multi-agent pattern we use in legal pipelines (decompose a complex task, assign specialists, orchestrate in parallel, synthesize results) is the pattern Claude Code applies to software development itself.

This is worth pausing on because it is the first place where the isomorphism between legal work and computational work becomes experiential rather than theoretical. When you use Claude Code to build a contract analysis pipeline, you are using an AI agent to build AI agents. The development process mirrors the runtime process. The tool that writes the MAC analyst's prompt is itself an agent receiving a prompt. The tool that designs the parallel execution strategy is itself executing tasks in parallel through subagents. If the patterns in this book feel recursive, it is because they are. The discipline of legal engineering is fractal: the same structures appear at every level of abstraction.


### Why It Matters for Legal Engineering

Three capabilities make Claude Code essential for legal engineering work.

First, **agentic development**. Traditional development requires you to write every line of code, debug every error, and manually navigate every file. Claude Code inverts this. You specify the architecture ("build an Express endpoint that accepts a DOCX upload, extracts the text, runs it through a three-stage analysis pipeline, and returns the results as JSON") and Claude Code implements it. It reads your existing type definitions, follows your project conventions, uses your preferred libraries, and produces code that fits into your codebase as if you had written it yourself. This is not a time-saving shortcut. It is a capability multiplier. A solo legal engineer using Claude Code can produce the same output as a three-person development team, because the agent handles the implementation while the engineer focuses on the design decisions that require domain expertise.

Second, **persistent institutional knowledge through CLAUDE.md files**. Every project in your legal engineering workspace can contain a CLAUDE.md file at the root. This file contains instructions, conventions, architectural decisions, and domain context that Claude Code reads at the start of every session. When you write in your CLAUDE.md that all API calls must use streaming with a one-hour timeout, Claude Code follows that instruction in every file it touches. When you specify that ESModule imports must use .js extensions, Claude Code never generates a bare import path. When you document that your naming convention is `TaylorLegalEngineering_Academy_CourseModules_01TechnologyEssentials_Backend_Server.ts`, Claude Code names new files accordingly.

The CLAUDE.md file is institutional memory. It compounds over time. Every architectural decision you record becomes a constraint that Claude Code enforces automatically. Every convention you document becomes a pattern that Claude Code replicates without being reminded. After six months of development, your CLAUDE.md contains the equivalent of a senior developer's onboarding manual: API settings, deployment procedures, naming conventions, error handling patterns, security requirements, and the reasoning behind each decision. A new developer (or a new Claude Code session) reads this file and immediately operates at the level of someone who has been on the project since day one.

> **Key Concept**
>
> The CLAUDE.md file is to your development environment what a playbook is to a legal pipeline. A playbook tells the AI how to analyze a contract: what perspective to take, what issues to prioritize, what language to recommend. A CLAUDE.md file tells Claude Code how to build your software: what patterns to follow, what conventions to enforce, what mistakes to avoid. Both are persistent context documents that encode institutional knowledge. Both get more valuable over time as you refine them. Both are the difference between generic output and output that meets your specific standards.

Third, **subagent orchestration**. Claude Code can spawn subagents, which are independent Claude instances that work on parallel tasks. When you ask Claude Code to implement a pipeline with sixteen specialist analyzers, it does not write them one at a time. It can launch multiple subagents, each implementing a different analyzer, each working independently, each producing code that integrates with the others because they all read the same CLAUDE.md and type definitions. This is parallel development, and it mirrors the parallel execution pattern that the pipeline itself will use at runtime.


### The CLAUDE.md File in Practice

A CLAUDE.md file for a legal engineering project contains several categories of information. Here is a representative structure:

```markdown
# Project Name — Legal Engineering Pipeline

## MANDATORY API SETTINGS
Every Anthropic API call in this project MUST use these settings:
- Model: claude-opus-4-6
- max_tokens: 128_000
- Streaming: client.messages.stream() + await stream.finalMessage()
- Timeout: 3_600_000 (1 hour)
- Beta headers: output-128k-2025-02-19, context-1m-2025-08-07

## ARCHITECTURE
- Backend: Express server on port 3001
- Frontend: React on port 4001
- Database: MongoDB Atlas
- Pipeline stages: Intake → Specialists (parallel) → Research → Synthesis
- Sequential stages use await. Parallel stages use Promise.allSettled()

## NAMING CONVENTIONS
- Files: ProjectName_Layer_Component.ts
- Types: Single canonical file at backend/types/
- Imports: Always use .js extensions (ESModules)

## ERROR HANDLING
- Individual API calls: try/catch with 3 retries, exponential backoff
- Parallel stages: Promise.allSettled() — never Promise.all()
- Failed specialists: log and continue, do not abort pipeline

## SECURITY
- API keys: environment variables only, never in source code
- Client documents: never logged, never persisted beyond session
- Privileged content: classified and isolated per Chapter 6 rules
```

The critical insight is that CLAUDE.md is not documentation in the traditional sense. It is not written for humans to read (though humans can and should read it). It is written for Claude Code to follow as operational instructions. Every statement in your CLAUDE.md is an instruction that Claude Code will obey. This makes the file a form of metaprogramming: you are programming the tool that programs your software.

In practice, a well-maintained CLAUDE.md eliminates entire categories of development errors. The wrong API model never gets used because the CLAUDE.md specifies the right one. The wrong file naming convention never appears because the CLAUDE.md documents the correct pattern. The wrong error handling pattern never gets implemented because the CLAUDE.md defines the required approach. This is why legal engineering teams that use Claude Code consistently produce more uniform codebases than teams that do not. The CLAUDE.md file is a quality enforcement mechanism that operates at the development layer, before the code is ever written.


### Hooks: Programmatic Guardrails

Claude Code supports hooks, which are scripts that execute automatically at specific points in the development workflow. Three hook types matter for legal engineering:

**Pre-tool-use hooks** fire before Claude Code executes a tool (reading a file, writing code, running a command). A pre-tool-use hook can inspect what Claude Code is about to do and block it if it violates a constraint. For a legal engineering project, you might install a hook that prevents Claude Code from writing any file that contains an API key in plaintext, or that rejects any code change that removes a streaming configuration from an API call.

**Post-tool-use hooks** fire after Claude Code completes a tool execution. A post-tool-use hook can inspect the result and trigger additional actions. After Claude Code writes a new TypeScript file, a post-tool-use hook could automatically run the TypeScript compiler to check for type errors, ensuring that no file is written without passing compilation.

**Notification hooks** fire when Claude Code completes a long-running task. In a legal engineering project with dozens of files, a notification hook can alert you when a complex refactoring operation finishes, so you can review the changes without watching the terminal.

```json
// .claude/settings.json — Hook configuration
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "grep -l 'sk-ant-\\|ANTHROPIC_API_KEY' \"$TOOL_INPUT_FILE\" && echo 'BLOCKED: API key in source' && exit 1 || exit 0"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit --pretty 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

Hooks are the programmatic equivalent of a firm's document management policies. A law firm has rules about what can be emailed, what must be redacted, what requires partner approval. Hooks enforce equivalent rules in the development environment. They are not suggestions; they are gates that block non-compliant actions before they take effect.

> **Practice Tip**
>
> Start with two hooks on day one of any legal engineering project. First, a pre-tool-use hook on write operations that blocks any file containing hardcoded API keys or credentials. Second, a post-tool-use hook on write operations that runs the TypeScript compiler after every file change. These two hooks prevent the two most common development errors: committed secrets and undetected type errors. Add more hooks as you discover project-specific constraints worth enforcing.


### MCP: Model Context Protocol

Claude Code communicates with external tools and services through the Model Context Protocol (MCP). MCP is a standardized interface that lets Claude Code interact with databases, file systems, APIs, browsers, and other tools through a uniform protocol. For legal engineering, MCP integration means Claude Code can:

- **Query MongoDB directly** to inspect document collections, check pipeline results, or verify data schemas without leaving the development session.
- **Browse the web** to research legal standards, check API documentation, or verify that a deployed service is responding correctly.
- **Control a browser** to test frontend interfaces, verify that pipeline results render correctly, and take screenshots for documentation.
- **Send emails** through email service APIs to test notification pipelines or verify delivery formatting.

MCP servers are configured in Claude Code's settings and become available as tools that Claude Code can invoke during development. Each MCP server exposes a set of capabilities (reading data, writing data, executing queries) that Claude Code uses as naturally as it uses its built-in file system tools. The protocol is standardized, meaning any MCP-compatible server works with Claude Code without custom integration.

```json
// .claude/settings.json — MCP server configuration
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": ["-y", "mongodb-mcp-server"],
      "env": {
        "MONGODB_URI": "mongodb+srv://..."
      }
    },
    "browser": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"],
      "env": {}
    }
  }
}
```

The practical significance of MCP for legal engineering is that it eliminates context switching during development. When you need to verify that a pipeline's MongoDB output matches the expected schema, you do not leave Claude Code to open a database client. When you need to check that the frontend renders Track Changes correctly, you do not leave Claude Code to open a browser manually. The development environment contains everything the developer needs, the same principle that drives legal engineering pipeline design: put everything the agent needs into its context, and let it work without interruption.


### The Relationship Between Claude Code and the Claude API

A distinction that trips up newcomers: Claude Code and the Claude API are different things that use the same underlying model.

**Claude Code** is a development tool. You use it to build software. It runs on your local machine, reads your files, writes code, and executes commands. You interact with it through a command-line interface during development. It is how you build your legal engineering pipeline.

**The Claude API** is a runtime service. Your pipeline calls it to perform AI inference during execution. It runs on Anthropic's servers, processes prompts you send via HTTP, and returns generated text. Your pipeline interacts with it programmatically during operation. It is what your legal engineering pipeline calls when it analyzes a contract.

The distinction matters because the development environment and the runtime environment have different requirements. Claude Code needs access to your entire codebase, your file system, and your terminal. The Claude API needs a prompt, a model specification, and a token budget. Claude Code is a tool you use. The Claude API is a service your code calls. You use the former to build systems that call the latter.

In practice, this means that when Claude Code writes a pipeline stage, it generates TypeScript code that imports the Anthropic SDK and calls `client.messages.stream()`. Claude Code itself is not making that API call at development time. It is writing the code that will make that call at runtime. The code Claude Code produces is what runs in production. Claude Code is the author. The Claude API is the engine.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" style="font-family: system-ui, sans-serif;">
  <!-- Background -->
  <rect width="800" height="400" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="400" y="35" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Figure 2A.1 — Claude Code (Development) vs. Claude API (Runtime)</text>

  <!-- Development Side -->
  <rect x="40" y="60" width="340" height="300" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="210" y="90" text-anchor="middle" fill="#16a085" font-size="14" font-weight="bold">DEVELOPMENT TIME</text>

  <rect x="70" y="110" width="280" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="1"/>
  <text x="210" y="140" text-anchor="middle" fill="white" font-size="13">Developer (You)</text>

  <line x1="210" y1="160" x2="210" y2="185" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal)"/>

  <rect x="70" y="185" width="280" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="1"/>
  <text x="210" y="215" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">Claude Code (CLI Agent)</text>

  <line x1="210" y1="235" x2="210" y2="260" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal)"/>

  <rect x="70" y="260" width="280" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="1"/>
  <text x="210" y="285" text-anchor="middle" fill="white" font-size="12">Writes TypeScript pipeline code</text>
  <text x="210" y="300" text-anchor="middle" fill="white" font-size="12">that calls the Claude API</text>

  <!-- Runtime Side -->
  <rect x="420" y="60" width="340" height="300" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="590" y="90" text-anchor="middle" fill="#f39c12" font-size="14" font-weight="bold">RUNTIME (PRODUCTION)</text>

  <rect x="450" y="110" width="280" height="50" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="590" y="140" text-anchor="middle" fill="white" font-size="13">Your Pipeline Code</text>

  <line x1="590" y1="160" x2="590" y2="185" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber)"/>

  <rect x="450" y="185" width="280" height="50" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="590" y="215" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">Claude API (HTTP Service)</text>

  <line x1="590" y1="235" x2="590" y2="260" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber)"/>

  <rect x="450" y="260" width="280" height="50" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="590" y="285" text-anchor="middle" fill="white" font-size="12">Processes prompts, returns</text>
  <text x="590" y="300" text-anchor="middle" fill="white" font-size="12">analysis on live contracts</text>

  <!-- Arrow definitions -->
  <defs>
    <marker id="arrowTeal" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmber" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>
</svg>
```


### Using Claude Code to Build Legal Engineering Pipelines

The practical workflow for building a legal engineering pipeline with Claude Code follows a consistent pattern:

1. **Define your CLAUDE.md.** Before writing any pipeline code, document the API settings, naming conventions, type definitions, and architectural decisions. This front-loaded investment pays dividends across every subsequent development session.

2. **Specify the architecture.** Describe the pipeline's stages, their sequence, their parallelization strategy, and their input/output types. Claude Code translates this specification into a project structure with the correct files, types, and imports.

3. **Implement stage by stage.** For each pipeline stage, describe its purpose, its prompt strategy, and its expected output format. Claude Code writes the diplomat (the prompt-generation and execution logic), the type definitions for its output, and the integration with the orchestrator.

4. **Test with real documents.** Upload a contract from your agreement bank and run the pipeline. Claude Code helps debug issues, refine prompts, and adjust type definitions based on actual model output.

5. **Iterate.** Legal engineering pipelines are not built in one pass. Each run reveals prompt improvements, type refinements, and architectural adjustments. Claude Code accelerates each iteration because it remembers (through CLAUDE.md and conversation context) every decision from prior iterations.

This workflow is itself a multi-pass pipeline. The first pass produces a working prototype. The second pass refines prompts based on output quality. The third pass optimizes parallelization and cost. The fourth pass hardens error handling. Each pass improves the system, just as each round in a contract analysis pipeline improves the analysis.

> **Practice Tip**
>
> Start your CLAUDE.md with the mandatory API settings block from this book. Copy it verbatim. Then add your project-specific conventions as you establish them. Every time you make an architectural decision during development, add it to the CLAUDE.md before moving on. The five minutes you spend documenting a decision saves hours of debugging when Claude Code (or a colleague, or your future self) encounters the same decision point later.

---

**Key Takeaways**

- Claude Code is an autonomous development agent, not a code autocomplete tool. It reads codebases, writes production code, runs commands, and orchestrates multi-step development tasks.
- The CLAUDE.md file is institutional memory for your project. Every convention, API setting, and architectural decision you document becomes a constraint that Claude Code enforces automatically across every file it touches.
- Hooks (pre-tool-use, post-tool-use, notification) are programmatic guardrails that enforce development policies the same way a firm's document management rules enforce operational policies.
- MCP (Model Context Protocol) lets Claude Code interact with databases, browsers, and external services during development, eliminating context switching.
- Claude Code (the development tool) and the Claude API (the runtime service) are different things. You use Claude Code to build pipelines. Your pipelines call the Claude API to perform inference.
- The workflow for building legal engineering pipelines with Claude Code mirrors the multi-pass pattern of the pipelines themselves: define architecture, implement, test with real documents, iterate.

\newpage

## 2B. TypeScript

*The Legal Engineer's Programming Language*

### Why TypeScript

If you are building legal AI workflows, your programming language is TypeScript. Not Python, despite its dominance in data science and machine learning research. Not plain JavaScript, despite its ubiquity in web development. TypeScript, specifically, because **type safety prevents errors before they reach clients.**

Consider what happens when a contract analysis pipeline processes a document at 2 AM for a client whose deal closes at 9 AM. The pipeline extracts a termination fee, calculates its percentage of equity value, and writes both figures into the analysis report. In JavaScript, if the termination fee comes back from the API as the string `"142500000"` instead of the number `142500000`, the percentage calculation silently produces `NaN` (Not a Number), the report contains a blank where the percentage should be, and the attorney reviewing the report at 7 AM discovers the error two hours before closing. In TypeScript with strict mode enabled, the compiler catches this type mismatch before the code ever runs. The developer sees a red underline in their editor the moment they write the calculation. The bug never reaches production. The attorney never sees the blank field. The client never experiences the failure.

This is not a hypothetical. Type mismatches between AI model output and downstream code are the most common category of bug in AI pipeline development. The model returns a string; your code expects a number. The model returns `null`; your code expects an object. The model returns an array with three elements; your code expects four. TypeScript catches every one of these at compile time. JavaScript catches none of them until runtime, which in a production pipeline means during a client engagement.

TypeScript is JavaScript with a type system. Every valid JavaScript program is a valid TypeScript program. TypeScript adds one thing that JavaScript lacks: the ability to describe the shape of your data at compile time and have the compiler enforce that shape across your entire codebase. When you define that a function accepts a `ContractParty` object, the compiler verifies that every call site provides an object matching that exact shape. Miss a required field and the code will not compile. Pass a number where the function expects a string and your editor underlines it in red before you save the file.

The second reason for TypeScript is ecosystem unity. Legal engineering pipelines have a backend (Express, the Claude API, MongoDB, OOXML manipulation) and a frontend (React dashboards, file upload interfaces, real-time progress displays). TypeScript is the same language on both sides. The type definitions you write for your pipeline's output are the same type definitions your React components consume. There is no translation layer between your backend data shapes and your frontend rendering logic. A `ContractAnalysis` type defined once in a shared types file is used by the Express route that produces it, the MongoDB query that retrieves it, and the React component that displays it. Change a field name in the type definition and the compiler flags every file that needs updating. In a two-language stack (Python backend, JavaScript frontend), a field rename requires manually hunting through both codebases with no compiler to catch what you missed.

The third reason is that the legal engineering ecosystem is TypeScript. The code examples in this book are TypeScript. The exercises in the TLE Academy course are TypeScript. The production pipelines discussed in Part II are all TypeScript. When you build your own pipelines using this book as a reference, you will write TypeScript. Choosing a different language means translating every example, every pattern, and every type definition into a different syntax, which introduces precisely the kind of translation errors that type safety is designed to prevent.


### Types, Interfaces, and the Shape of Legal Data

The most important TypeScript feature for legal engineering is the **interface**. An interface defines the shape of a data structure: what fields it has, what type each field is, and which fields are required versus optional. In legal engineering, interfaces describe every piece of data that flows through a pipeline: contract metadata, clause analysis results, risk scores, specialist findings, Track Changes directives, and billing records.

```typescript
// types/contract-types.ts
// Interfaces define the exact shape of legal data structures
// The compiler enforces these shapes across the entire codebase

interface ContractParty {
  name: string;
  role: 'customer' | 'vendor' | 'buyer' | 'seller' | 'licensor' | 'licensee';
  jurisdiction: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  signatoryName: string;
  signatoryTitle: string;
}

interface ContractMetadata {
  contractId: string;
  title: string;
  vertical: ContractVertical;
  effectiveDate: Date;
  expirationDate: Date | null;     // null if no fixed term
  governingLaw: string;
  parties: ContractParty[];
  totalWordCount: number;
  totalTokenCount: number;
  uploadedAt: Date;
}

// Union types restrict values to a defined set
// The compiler rejects any value not in this list
type ContractVertical =
  | 'saas'
  | 'ma'
  | 'vc'
  | 'employment'
  | 'nda'
  | 'equipment'
  | 'commercial-lease'
  | 'professional-services'
  | 'ip-license';

// Enum-like union types for risk assessment
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface ClauseAnalysis {
  clauseId: string;
  clauseTitle: string;
  sectionReference: string;
  originalText: string;
  riskLevel: RiskLevel;
  finding: string;
  recommendation: string;
  suggestedLanguage: string;
  citation?: string;          // Optional: not every finding has case law
  dollarExposure?: number;    // Optional: not every risk is quantifiable
  priority: number;           // 1 = highest priority
}
```

Notice the `?` operator on `citation` and `dollarExposure`. These are optional fields. Not every clause analysis will produce a legal citation. Not every risk has a dollar figure attached to it. The `?` tells the TypeScript compiler that these fields may or may not be present, and the compiler will force you to check for their presence before using their values. This eliminates null reference errors, the single most common runtime crash in software systems. In a legal pipeline, a null reference crash during a client analysis means lost work, missed deadlines, and a conversation with the client that no attorney wants to have.


### The Isomorphism Made Explicit: Type Safety as Defined Terms

There is a direct parallel between TypeScript interfaces and the "Definitions" article of a well-drafted agreement, and it is not a metaphor. Both serve the identical function: they establish the precise meaning of terms used throughout the document, so that every reference to that term carries an unambiguous, enforceable definition.

When a contract states that "'Confidential Information' shall mean all non-public information disclosed by either Party," every subsequent reference to "Confidential Information" in that agreement carries the weight of that definition. A court interpreting the agreement will apply that definition exactly. The parties cannot later argue that "Confidential Information" means something different in Section 7 than it does in Section 3. The definition controls.

When a TypeScript interface states that `ContractVertical` is `'saas' | 'ma' | 'vc' | 'employment' | 'nda'`, every subsequent reference to `ContractVertical` in that codebase carries the weight of that type definition. The compiler interpreting the code will apply that definition exactly. A developer cannot later pass the string `'merger'` where a `ContractVertical` is expected. The type controls.

| Legal Language | TypeScript | Explanation |
|---|---|---|
| "'Effective Date' shall mean January 1, 2025" | `effectiveDate: Date` | A date is a date. The legal phrasing "shall mean" is the `interface` keyword. Both bind a name to a value with a specific type. |
| "'Termination Fee' shall mean an amount equal to three percent (3%) of the Equity Value" | `terminationFee: number` | A dollar amount is a number. The calculation formula lives in the Transformations phase (contract logic) or a function body (code logic). |
| "'Party' shall mean Customer or Vendor" | `role: 'customer' \| 'vendor'` | A union type is a defined term with enumerated values. The contract lists permitted values in prose. TypeScript lists them with the pipe operator. |
| "if applicable, the Escrow Amount" | `escrowAmount?: number` | "If applicable" is the legal equivalent of TypeScript's optional field operator `?`. Both signal that the value may or may not exist. |
| "'Business Day' means Monday through Friday excluding Federal Holidays" | `type BusinessDay = 'monday' \| 'tuesday' \| 'wednesday' \| 'thursday' \| 'friday'` | A defined term with an exclusion is a type with a constrained set. The holiday exclusion becomes a validation function. |
| "Schedule A: Licensed Patents" | `licensedPatents: string[]` | A schedule is an array. Each item in the schedule is an element. The schedule label is the variable name. |
| "Section 7.2(a)(iii)" | `sections[7].subsections[2].clauses[0].subClauses[2]` | A nested section reference is an indexed traversal of a nested data structure. Legal outlining and array indexing serve the same navigational function. |

> **Insight**
>
> Type safety is to code what defined terms are to contracts. A TypeScript interface that says `terminationFee: number` is the same constraint as a contract clause that says "the Termination Fee shall be a dollar amount." Both prevent ambiguity. Both catch errors at "compile time" (for contracts, that is the drafting and review phase) rather than "runtime" (for contracts, that is performance and enforcement). A contract with undefined terms is as dangerous as a codebase with untyped variables: both invite disputes that precise definitions would have prevented.


### ESModules: The Modern Import System

Legal engineering projects use ESModules, the standardized JavaScript module system. When you see `import` and `export` statements in code examples throughout this book, those are ESModules. The alternative (CommonJS, which uses `require()` and `module.exports`) is the older system and should not be used in new projects.

The critical detail for TypeScript projects is that **import paths must use the `.js` extension**, even when the source file is `.ts`. This is not a typo. TypeScript compiles to JavaScript. At runtime, the `.ts` files do not exist; only the compiled `.js` files exist. The import path must reference what will exist at runtime:

```typescript
// pipeline-orchestrator.ts
// Import paths use .js because the compiled output is JavaScript
import type { ContractMetadata, ClauseAnalysis } from './types/contract-types.js';
import { extractText } from './utils/text-extractor.js';
import { runSpecialistSwarm } from './pipeline/specialist-swarm.js';
import { synthesizeFindings } from './pipeline/synthesizer.js';
```

If you write `from './types/contract-types'` without the `.js` extension, the code compiles successfully but crashes at runtime with a module resolution error. This is one of the most common errors for developers new to ESModule TypeScript, and it is particularly insidious because the compiler gives no warning. The error only surfaces when you try to run the compiled code.

To enable ESModules in your project, two configuration steps are required. In your `package.json`, set `"type": "module"`. In your `tsconfig.json`, set the module and moduleResolution to `Node16`:

```json
// package.json
{
  "name": "legal-pipeline",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

The `"strict": true` setting is non-negotiable. It enables every strict type-checking option: no implicit `any`, strict null checks, strict function types, strict property initialization. Without strict mode, TypeScript silently allows type errors that crash at runtime. For a system processing legal documents, those runtime crashes occur during client engagements, corrupting output or losing work. Strict mode catches those errors at compile time, when fixing them costs minutes rather than relationships.

> **Warning**
>
> Never set `"strict": false` or omit the strict flag in a legal engineering project. Without strict null checking, the expression `analysis.citation.length` compiles successfully even when `citation` is `undefined`, producing a runtime crash. With strict mode, the compiler forces you to write `analysis.citation?.length ?? 0`, handling the null case explicitly. In legal engineering, runtime crashes happen during client engagements. Strict mode is not a quality preference; it is a professional obligation.


### Async/Await: Managing AI Call Timing

Every Claude API call is asynchronous. You send a request to Anthropic's servers and wait for a response that might arrive in two seconds or two minutes, depending on the complexity of the prompt, the length of the output, and the current server load. TypeScript handles this with the `async`/`await` pattern.

Mark a function as `async` and it automatically returns a `Promise`. Use `await` inside the function body to pause execution until an asynchronous operation completes. Without `async`/`await`, you would need nested callbacks or `.then()` chains, producing code that is difficult to read, harder to debug, and nearly impossible to maintain in a multi-stage pipeline:

```typescript
// sequential-pipeline.ts
// Each stage waits for the previous stage to complete
async function runSequentialPipeline(
  contractText: string,
  vertical: ContractVertical,
  party: 'buyer' | 'seller'
): Promise<PipelineResult> {
  // Stage 1: Classify the contract (waits for Claude response)
  const classification = await classifyContract(contractText);

  // Stage 2: Run specialist analysis (waits for Stage 1)
  const findings = await runSpecialists(contractText, classification);

  // Stage 3: Research based on findings (waits for Stage 2)
  const research = await conductResearch(findings);

  // Stage 4: Synthesize everything (waits for Stage 3)
  const directives = await synthesize(findings, research, party);

  // Stage 5: Generate Track Changes (waits for Stage 4)
  const trackChanges = await generateTrackChanges(directives);

  return {
    classification,
    findings,
    research,
    directives,
    trackChanges,
    completedAt: new Date()
  };
}
```

The `await` keyword enforces sequentiality. Each line waits for the prior line's AI call to complete before proceeding. This is the correct pattern when stages depend on each other: you cannot research until you have findings, and you cannot synthesize until you have research. But not every stage depends on the previous one. When stages are independent, you run them in parallel.


### Promise.allSettled: Parallel Execution

`Promise.allSettled()` is the most important execution pattern in legal engineering. When your pipeline has sixteen independent specialist analyzers, each examining the same contract from a different analytical perspective, running them sequentially (one after another) means the wall-clock time is the sum of all sixteen. Running them in parallel (all at once) means the wall-clock time is the duration of the slowest single analyzer. For sixteen analyzers that each take sixty to ninety seconds, the difference is between twenty-four minutes (sequential) and ninety seconds (parallel).

```typescript
// parallel-specialists.ts
// All sixteen specialists run simultaneously
async function runSpecialistSwarm(
  contractText: string,
  specialists: SpecialistConfig[]
): Promise<SpecialistResult[]> {
  // Launch ALL specialists at the same time
  const results = await Promise.allSettled(
    specialists.map(specialist =>
      runSpecialist(contractText, specialist)
    )
  );

  // Separate successes from failures
  const successes: SpecialistResult[] = [];
  const failures: string[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      failures.push(result.reason?.message ?? 'Unknown error');
    }
  }

  // Log failures but continue with successful results
  if (failures.length > 0) {
    console.warn(
      `${failures.length} of ${specialists.length} specialists failed:`,
      failures
    );
  }

  return successes;
}
```

Why `Promise.allSettled()` instead of `Promise.all()`? Because `Promise.all()` fails entirely if any single promise rejects. If one analyzer out of sixteen encounters a network timeout, you lose all sixteen results. `Promise.allSettled()` always returns all results, marking each as either `fulfilled` or `rejected`. In production, you want fifteen successful analyses plus one error log, not zero analyses plus a pipeline crash. This is graceful degradation: the same principle that governs how a deal team operates when one associate calls in sick. The other fifteen still deliver their work.

> **Warning**
>
> Never use `Promise.all()` in a production legal pipeline. A single network timeout in one of sixteen parallel specialists will reject the entire `Promise.all()`, losing all fifteen successful results. This is the pipeline equivalent of a firm policy that says "if one associate misses a deadline, fire the entire deal team." Use `Promise.allSettled()` for every parallel operation, without exception.


### Generics: Reusable Pipeline Components

Generics let you write functions and types that work with any data shape while preserving type safety. The angle-bracket syntax (`<T>`) defines a type parameter, which is a placeholder that gets filled in when the function is called or the type is instantiated.

In legal engineering, generics matter because pipeline components need to handle different contract types without duplicating code. A function that measures the duration of a pipeline stage does not care whether the stage processes a SaaS analysis or an M&A analysis. What it cares about is that the stage runs and produces a result. Generics express this:

```typescript
// pipeline-utils.ts
// A generic pipeline stage that works with any input and output type
interface PipelineStage<TInput, TOutput> {
  name: string;
  execute: (input: TInput) => Promise<TOutput>;
}

// A generic function that runs any stage and tracks metrics
async function runStageWithMetrics<TInput, TOutput>(
  stage: PipelineStage<TInput, TOutput>,
  input: TInput
): Promise<{
  result: TOutput;
  durationMs: number;
  stageName: string;
}> {
  const start = Date.now();
  const result = await stage.execute(input);
  return {
    result,
    durationMs: Date.now() - start,
    stageName: stage.name
  };
}

// A generic function that runs multiple stages in parallel
async function runStagesInParallel<TInput, TOutput>(
  stages: PipelineStage<TInput, TOutput>[],
  input: TInput
): Promise<TOutput[]> {
  const results = await Promise.allSettled(
    stages.map(stage => stage.execute(input))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<TOutput> =>
      r.status === 'fulfilled'
    )
    .map(r => r.value);
}
```

Generics appear throughout this book. The pipeline orchestrator in Chapter 4 uses generics to chain stages of different types. The evaluation scorer in Chapter 7 uses generics to score different output formats against different rubrics. Whenever you see angle brackets in a function or interface definition, you are looking at a generic: a component that works with any type while letting the compiler enforce type correctness through the entire chain.


### Error Handling in Pipelines

AI API calls fail. Network connections drop. Rate limits trigger. Models occasionally produce output that cannot be parsed into the expected format. Every production pipeline needs error handling at two levels.

At the individual call level, wrap API calls in try/catch blocks and decide whether to retry, skip, or abort:

```typescript
// error-handling.ts
// Individual API call with retry logic and exponential backoff
async function callWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 128_000,
        messages: [{ role: 'user', content: prompt }]
      });
      const response = await stream.finalMessage();
      return response.content
        .find(c => c.type === 'text')?.text ?? '';
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Unreachable');
}
```

At the pipeline level, use `Promise.allSettled()` to isolate failures so one broken analyzer does not crash the entire analysis. These two levels work together: each individual call retries transient failures, and the pipeline-level orchestration tolerates individual call failures that persist after retries.


### Type Guards: Runtime Type Verification

TypeScript's type system operates at compile time. At runtime, data arrives from external sources (API responses, database queries, file reads) without type guarantees. Type guards bridge this gap by performing runtime checks that the compiler can understand:

```typescript
// type-guards.ts
// Type guard for API response parsing
function isClauseAnalysis(value: unknown): value is ClauseAnalysis {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.clauseId === 'string' &&
    typeof obj.clauseTitle === 'string' &&
    typeof obj.sectionReference === 'string' &&
    typeof obj.originalText === 'string' &&
    typeof obj.riskLevel === 'string' &&
    ['low', 'medium', 'high', 'critical'].includes(obj.riskLevel as string) &&
    typeof obj.finding === 'string' &&
    typeof obj.recommendation === 'string' &&
    typeof obj.priority === 'number'
  );
}

// Usage: safely parse model output
function parseSpecialistOutput(rawJson: string): ClauseAnalysis[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Specialist returned invalid JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Expected array of clause analyses');
  }

  const validated = parsed.filter(isClauseAnalysis);
  if (validated.length !== parsed.length) {
    console.warn(
      `${parsed.length - validated.length} of ${parsed.length} ` +
      `clause analyses failed type validation`
    );
  }
  return validated;
}
```

Type guards are essential at every boundary where external data enters your pipeline: when parsing Claude API responses, when reading documents from MongoDB, when processing uploaded files, and when deserializing JSON from any source. Inside the boundary, TypeScript's compiler guarantees type correctness. At the boundary, you need runtime verification. Think of type guards as the mailroom of your pipeline: everything gets inspected before it enters the building.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 350" style="font-family: system-ui, sans-serif;">
  <!-- Background -->
  <rect width="800" height="350" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Figure 2B.1 — Type Safety Boundary: Compile-Time vs. Runtime Verification</text>

  <!-- External world -->
  <rect x="30" y="55" width="200" height="260" rx="8" fill="#2a2a4e" stroke="#e74c3c" stroke-width="2"/>
  <text x="130" y="80" text-anchor="middle" fill="#e74c3c" font-size="13" font-weight="bold">UNTYPED WORLD</text>
  <text x="130" y="110" text-anchor="middle" fill="white" font-size="11">Claude API responses</text>
  <text x="130" y="130" text-anchor="middle" fill="white" font-size="11">MongoDB documents</text>
  <text x="130" y="150" text-anchor="middle" fill="white" font-size="11">Uploaded DOCX files</text>
  <text x="130" y="170" text-anchor="middle" fill="white" font-size="11">External JSON payloads</text>
  <text x="130" y="200" text-anchor="middle" fill="#e74c3c" font-size="11" font-style="italic">Type: unknown</text>

  <!-- Type guard boundary -->
  <rect x="270" y="55" width="150" height="260" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="345" y="80" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">TYPE GUARD</text>
  <text x="345" y="110" text-anchor="middle" fill="white" font-size="11">Runtime check:</text>
  <text x="345" y="130" text-anchor="middle" fill="#f39c12" font-size="11">is it the right shape?</text>
  <text x="345" y="170" text-anchor="middle" fill="white" font-size="11">Valid data passes.</text>
  <text x="345" y="190" text-anchor="middle" fill="white" font-size="11">Invalid data is</text>
  <text x="345" y="210" text-anchor="middle" fill="white" font-size="11">rejected or logged.</text>

  <!-- Internal typed world -->
  <rect x="460" y="55" width="310" height="260" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="615" y="80" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">TYPED PIPELINE</text>
  <text x="615" y="110" text-anchor="middle" fill="white" font-size="11">ContractMetadata</text>
  <text x="615" y="130" text-anchor="middle" fill="white" font-size="11">ClauseAnalysis[]</text>
  <text x="615" y="150" text-anchor="middle" fill="white" font-size="11">SpecialistResult</text>
  <text x="615" y="170" text-anchor="middle" fill="white" font-size="11">TrackChangeDirective</text>
  <text x="615" y="200" text-anchor="middle" fill="#16a085" font-size="11" font-style="italic">Compiler-enforced types</text>
  <text x="615" y="220" text-anchor="middle" fill="#16a085" font-size="11" font-style="italic">No null surprises</text>

  <!-- Arrows -->
  <line x1="230" y1="185" x2="270" y2="185" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmberB)"/>
  <line x1="420" y1="185" x2="460" y2="185" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTealB)"/>

  <defs>
    <marker id="arrowAmberB" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
    <marker id="arrowTealB" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>
</svg>
```


### Utility Types for Legal Pipelines

TypeScript provides built-in utility types that transform existing types. Three are particularly useful in legal engineering:

`Partial<T>` makes all fields optional. Useful when building objects incrementally during pipeline execution, where early stages produce partial results that later stages complete:

```typescript
// A pipeline result that gets built across multiple stages
type PartialAnalysis = Partial<ContractAnalysis>;

async function buildAnalysisIncrementally(
  contractText: string
): Promise<ContractAnalysis> {
  let result: PartialAnalysis = {};

  // Stage 1: Extract metadata
  result.metadata = await extractMetadata(contractText);

  // Stage 2: Run specialists (adds findings)
  result.findings = await runSpecialists(contractText);

  // Stage 3: Score risks (adds riskSummary)
  result.riskSummary = await scoreRisks(result.findings!);

  // Final: assert complete (all fields now populated)
  return result as ContractAnalysis;
}
```

`Pick<T, K>` extracts specific fields from a type. Useful when a pipeline stage only needs a subset of a larger data structure:

```typescript
// The synthesizer only needs findings and research, not raw contract text
type SynthesizerInput = Pick<PipelineState, 'findings' | 'research' | 'party'>;
```

`Record<K, V>` creates an object type with specified keys and value types. Useful for score maps, metric collections, and other dictionary-like structures:

```typescript
// Scores per specialist, keyed by specialist name
type SpecialistScores = Record<string, {
  qualityScore: number;
  coverageScore: number;
  citationCount: number;
}>;
```

---

**Key Takeaways**

- TypeScript is the legal engineer's language because its type system catches data-shape errors at compile time, before they reach clients. Strict mode (`"strict": true` in tsconfig.json) is non-negotiable.
- Interfaces define the shape of legal data structures and serve the same function as defined terms in a contract: they establish precise, enforceable meanings that every reference must comply with.
- ESModule imports use `.js` file extensions because import paths reference the compiled JavaScript output, not the TypeScript source files. Omitting the extension compiles cleanly but crashes at runtime.
- `async`/`await` handles the timing of AI API calls. Sequential stages use `await` in sequence. Parallel stages use `Promise.allSettled()`.
- `Promise.allSettled()` is the essential parallelization pattern: it launches all operations simultaneously and returns all results even if some fail. Never use `Promise.all()` in production pipelines.
- Generics (`<T>`) create reusable pipeline components that work with any data type while preserving compile-time type safety through the entire chain.
- Type guards bridge the gap between compile-time safety and runtime reality. Use them at every boundary where external data enters your pipeline.

\newpage
## 2C. APIs, Servers, and Databases

*Express, REST, MongoDB, and the Infrastructure Layer*

### What a Server Is

A server is a program that listens for requests and sends responses. That is the entire concept. When you log into Westlaw and run a search, your browser sends a request to Thomson Reuters' server. That server processes your search and sends back results. When you file a document on PACER, your browser sends a request to the federal courts' server. That server records the filing and sends back a confirmation. You have been using servers your entire career. The only thing new here is building one.

In legal engineering, the server is the backbone of every pipeline. It receives uploaded contracts, orchestrates AI analysis across multiple stages, tracks progress, stores results, and delivers output back to the attorney. Without a server, you have a script that runs on your laptop. With a server, you have a system that runs for any user, anytime, from anywhere.

The server framework we use is **Express**, a minimal Node.js web framework that handles HTTP routing, request parsing, and response delivery. Express is not the only option, but it is the standard in the TypeScript ecosystem, and it provides exactly the level of control that legal engineering pipelines require: enough structure to handle routing and middleware, and enough flexibility to implement custom orchestration logic.


### REST APIs: The Universal Interface

An API (Application Programming Interface) is a structured way for two programs to communicate. A REST API specifically uses HTTP methods (GET, POST, PUT, DELETE) and URL paths to define operations. Every legal engineering pipeline exposes a REST API that clients (browsers, mobile apps, other servers) use to submit contracts, check status, and retrieve results.

The four HTTP methods map to four operations:

| HTTP Method | Operation | Legal Engineering Example |
|---|---|---|
| `POST` | Create | Upload a contract for analysis |
| `GET` | Read | Check analysis status, retrieve results |
| `PUT` | Update | Update pipeline configuration or playbook |
| `DELETE` | Remove | Delete a completed analysis from storage |

```typescript
// server.ts
// A minimal Express server for a legal engineering pipeline
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// POST /api/analyze — Submit a contract for analysis
app.post('/api/analyze',
  upload.single('contract'),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { vertical, party, mode } = req.body;

      // Extract text from the uploaded DOCX
      const contractText = await extractText(file.buffer);

      // Start the pipeline (returns immediately, runs in background)
      const analysisId = await startPipeline({
        contractText,
        vertical,
        party,
        mode,
        fileName: file.originalname
      });

      // Return the analysis ID for status polling
      res.status(202).json({
        analysisId,
        status: 'processing',
        message: 'Pipeline started. Poll GET /api/status/:id for progress.'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Pipeline initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/status/:id — Check pipeline progress
app.get('/api/status/:id', async (req, res) => {
  const analysis = await getAnalysisStatus(req.params.id);
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found' });
  }
  res.json(analysis);
});

// GET /api/results/:id — Retrieve completed analysis
app.get('/api/results/:id', async (req, res) => {
  const results = await getAnalysisResults(req.params.id);
  if (!results) {
    return res.status(404).json({ error: 'Results not found' });
  }
  res.json(results);
});

// GET /api/download/:id — Download the redlined DOCX
app.get('/api/download/:id', async (req, res) => {
  const docxBuffer = await getRedlinedDocument(req.params.id);
  if (!docxBuffer) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.setHeader('Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition',
    `attachment; filename="redlined-${req.params.id}.docx"`);
  res.send(docxBuffer);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Pipeline server running on port ${PORT}`);
});
```

Notice the 202 response code on the POST endpoint. A `202 Accepted` means "I received your request and started processing it, but the result is not ready yet." This is the correct response for a legal engineering pipeline, where analysis takes minutes, not milliseconds. The client receives an `analysisId` immediately and uses it to poll for status updates or connect to an SSE stream (covered in Section 2L).

> **Key Concept**
>
> The 202 pattern is how legal engineering pipelines handle the timing mismatch between HTTP (expects a response in seconds) and AI analysis (takes minutes). The server immediately acknowledges the request and returns an identifier. The client uses that identifier to check progress. The analysis runs in the background. This pattern appears in every pipeline in this book.


### Middleware: The Express Processing Chain

Express processes requests through a chain of middleware functions. Each middleware function receives the request, optionally modifies it, and either sends a response or passes control to the next middleware. This chain pattern is how you add cross-cutting concerns (authentication, logging, rate limiting, error handling) without cluttering your route handlers.

```typescript
// middleware.ts
// Authentication middleware — verifies JWT before pipeline access
function authenticateRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as AuthenticatedUser;
    next(); // Pass to the next middleware or route handler
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Request logging middleware — logs every incoming request
function logRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `${req.method} ${req.path} — ${res.statusCode} — ${Date.now() - start}ms`
    );
  });
  next();
}

// Apply middleware to all routes
app.use(logRequest);
app.use('/api/analyze', authenticateRequest);
app.use('/api/results', authenticateRequest);
```

The middleware chain is the Express equivalent of a law firm's intake process. Before a matter reaches an attorney, it passes through conflict checks, engagement letter review, and client onboarding. Before a request reaches a pipeline endpoint, it passes through authentication, logging, and validation. Each step in the chain performs one check and either proceeds or halts.


### MongoDB: The Document Database

Legal engineering pipelines produce structured data that needs to persist beyond the lifetime of a single request: analysis results, pipeline metrics, user accounts, contract metadata. MongoDB is the database we use because its document model maps naturally to the JSON-like data structures that TypeScript produces.

In MongoDB, data is stored in **documents** (JSON-like objects) within **collections** (groups of related documents) within **databases** (groups of related collections). There is no fixed schema. A document can have any fields, and different documents in the same collection can have different shapes. This flexibility is valuable during pipeline development, where the shape of analysis results evolves as you refine prompts and add specialists.

```typescript
// database.ts
// MongoDB connection and collection setup
import { MongoClient, Db, Collection } from 'mongodb';

let db: Db;
let analysesCollection: Collection<AnalysisDocument>;
let metricsCollection: Collection<PipelineMetrics>;

async function connectToDatabase(): Promise<void> {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  db = client.db('legal-pipeline');
  analysesCollection = db.collection('analyses');
  metricsCollection = db.collection('metrics');
  console.log('Connected to MongoDB Atlas');
}

// Store a completed analysis
async function saveAnalysis(
  analysisId: string,
  results: PipelineResult
): Promise<void> {
  await analysesCollection.updateOne(
    { analysisId },
    {
      $set: {
        ...results,
        completedAt: new Date(),
        status: 'complete'
      }
    },
    { upsert: true }
  );
}

// Retrieve an analysis by ID
async function getAnalysis(
  analysisId: string
): Promise<PipelineResult | null> {
  return analysesCollection.findOne({ analysisId });
}

// Store pipeline metrics for cost tracking
async function saveMetrics(
  analysisId: string,
  metrics: PipelineMetrics
): Promise<void> {
  await metricsCollection.insertOne({
    analysisId,
    ...metrics,
    recordedAt: new Date()
  });
}

// Query: all analyses for a specific client in the last 30 days
async function getRecentAnalyses(
  clientId: string
): Promise<PipelineResult[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return analysesCollection
    .find({
      clientId,
      completedAt: { $gte: thirtyDaysAgo }
    })
    .sort({ completedAt: -1 })
    .toArray();
}
```

> **Practice Tip**
>
> Always create indexes on fields you query frequently. For a legal engineering pipeline, the essential indexes are `analysisId` (unique), `clientId`, `status`, and `completedAt`. Without indexes, MongoDB performs a full collection scan on every query. With 10,000 analyses in the collection, the difference between an indexed query (milliseconds) and a full scan (seconds) is the difference between a responsive dashboard and a frustrated attorney.


### API Chaining: Connecting Services

Production legal engineering systems rarely run as a single server. The frontend runs on one service. The backend API runs on another. The database runs on a third. Deployment platforms like Vercel handle the frontend, Render handles the backend, and MongoDB Atlas handles the database. These services communicate through API calls that chain together.

```typescript
// api-chain.ts
// Frontend calls backend, backend calls Claude API, results go to MongoDB
// This is the data flow for a single contract analysis

// 1. Frontend (React) calls the backend API
const response = await fetch('https://api.yourdomain.com/api/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: formData  // Contains the uploaded DOCX file
});
const { analysisId } = await response.json();

// 2. Backend (Express) calls the Claude API (multiple times)
//    This happens server-side, invisible to the frontend
const classification = await callClaude(classificationPrompt);
const findings = await runSpecialistSwarm(contractText, specialists);
const synthesis = await callClaude(synthesisPrompt);

// 3. Backend stores results in MongoDB
await saveAnalysis(analysisId, { classification, findings, synthesis });

// 4. Frontend polls for results
const results = await fetch(
  `https://api.yourdomain.com/api/results/${analysisId}`
);
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" style="font-family: system-ui, sans-serif;">
  <!-- Background -->
  <rect width="800" height="300" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Figure 2C.1 — API Chain: Frontend → Backend → Claude API → MongoDB</text>

  <!-- Frontend -->
  <rect x="30" y="110" width="140" height="80" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="100" y="145" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">React</text>
  <text x="100" y="165" text-anchor="middle" fill="white" font-size="11">Frontend</text>
  <text x="100" y="180" text-anchor="middle" fill="white" font-size="10">(Vercel)</text>

  <!-- Backend -->
  <rect x="230" y="110" width="140" height="80" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="300" y="145" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">Express</text>
  <text x="300" y="165" text-anchor="middle" fill="white" font-size="11">Backend API</text>
  <text x="300" y="180" text-anchor="middle" fill="white" font-size="10">(Render)</text>

  <!-- Claude API -->
  <rect x="430" y="110" width="140" height="80" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="500" y="145" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">Claude API</text>
  <text x="500" y="165" text-anchor="middle" fill="white" font-size="11">AI Inference</text>
  <text x="500" y="180" text-anchor="middle" fill="white" font-size="10">(Anthropic)</text>

  <!-- MongoDB -->
  <rect x="630" y="110" width="140" height="80" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="700" y="145" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">MongoDB</text>
  <text x="700" y="165" text-anchor="middle" fill="white" font-size="11">Database</text>
  <text x="700" y="180" text-anchor="middle" fill="white" font-size="10">(Atlas)</text>

  <!-- Arrows -->
  <line x1="170" y1="150" x2="230" y2="150" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTealC)"/>
  <line x1="370" y1="150" x2="430" y2="150" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmberC)"/>
  <line x1="570" y1="150" x2="630" y2="150" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTealC)"/>

  <!-- Labels -->
  <text x="200" y="135" text-anchor="middle" fill="white" font-size="9">POST</text>
  <text x="400" y="135" text-anchor="middle" fill="white" font-size="9">stream()</text>
  <text x="600" y="135" text-anchor="middle" fill="white" font-size="9">save()</text>

  <!-- Return arrows -->
  <line x1="630" y1="170" x2="570" y2="170" stroke="#16a085" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowTealC)"/>
  <line x1="430" y1="170" x2="370" y2="170" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowAmberC)"/>
  <line x1="230" y1="170" x2="170" y2="170" stroke="#16a085" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowTealC)"/>

  <!-- Return labels -->
  <text x="200" y="185" text-anchor="middle" fill="white" font-size="9">JSON</text>
  <text x="400" y="185" text-anchor="middle" fill="white" font-size="9">tokens</text>
  <text x="600" y="185" text-anchor="middle" fill="white" font-size="9">docs</text>

  <defs>
    <marker id="arrowTealC" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmberC" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>
</svg>
```

---

**Key Takeaways**

- A server is a program that listens for requests and sends responses. Express is the standard server framework in the TypeScript ecosystem, providing routing, middleware, and request handling for legal engineering pipelines.
- REST APIs use HTTP methods (POST, GET, PUT, DELETE) to define operations. Legal engineering pipelines use POST to submit contracts, GET to check status and retrieve results.
- The 202 Accepted pattern handles the timing mismatch between HTTP (expects fast responses) and AI analysis (takes minutes). The server acknowledges the request immediately and processes it in the background.
- Middleware chains handle cross-cutting concerns (authentication, logging, validation) without cluttering route handlers. The chain pattern mirrors a law firm's intake process.
- MongoDB stores pipeline results as JSON-like documents. Its schema-flexible model accommodates evolving analysis structures during pipeline development.
- Production systems chain multiple services: frontend (Vercel) calls backend API (Render), which calls Claude API (Anthropic) and stores results in MongoDB (Atlas).

\newpage
## 2D. Vercel, Render, MongoDB Atlas, Cloudflare R2, and GitHub

*The Legal Engineering Deployment Stack*

### Why Deployment Matters

A legal engineering pipeline that only runs on your laptop is a prototype. A pipeline that runs on deployed infrastructure is a product. The difference is availability, reliability, and access. A deployed pipeline runs 24/7, survives your laptop closing, handles multiple users simultaneously, and is accessible from any device with a browser. Deployment is what transforms code into a service.

The deployment stack for legal engineering consists of five services, each handling one concern:

| Service | Concern | What It Hosts |
|---|---|---|
| **GitHub** | Version control | Source code, deployment triggers |
| **Vercel** | Frontend hosting | React dashboards, file upload interfaces |
| **Render** | Backend hosting | Express servers, pipeline orchestrators |
| **MongoDB Atlas** | Database | Analysis results, metrics, user data |
| **Cloudflare R2** | Object storage | Uploaded contracts, generated DOCX files |

This is not the only viable stack. AWS, Google Cloud, and Azure each offer equivalent services. But this stack has three advantages for legal engineers. First, each service has a generous free tier, meaning you can build and test pipelines without incurring costs until you reach production scale. Second, each service deploys from GitHub automatically, meaning pushing code to your repository triggers deployment without manual intervention. Third, each service is managed, meaning you do not administer servers, patch operating systems, or configure load balancers. You write code. The platform runs it.


### GitHub: Version Control and Deployment Triggers

Every legal engineering project lives in a GitHub repository. GitHub provides version control (tracking every change to every file), collaboration (multiple developers working on the same codebase), and deployment triggers (pushing code to a branch automatically deploys the corresponding service).

The critical GitHub workflow for legal engineering is branch-based deployment:

```
main branch → Production deployment
  Push to main triggers:
    - Vercel rebuilds and deploys the frontend
    - Render rebuilds and deploys the backend

dev branch → Development/staging deployment
  Push to dev triggers:
    - Vercel deploys a preview URL
    - Render deploys to a staging instance
```

> **Practice Tip**
>
> Never push untested code directly to the main branch. Use a development branch for work in progress, test the preview deployment, and merge to main only when the pipeline produces correct results. In a legal engineering context, a broken production deployment means attorneys cannot access the pipeline. The 30 seconds it takes to test a preview deployment prevents the 30-minute conversation explaining to a partner why the system is down.


### Vercel: Frontend Deployment

Vercel deploys React applications. When you push frontend code to GitHub, Vercel automatically builds the React project, optimizes the assets, and deploys them to a global CDN (Content Delivery Network). The result is a URL (like `yourdomain.com`) that serves your frontend from servers geographically close to each user.

For legal engineering, the Vercel-hosted frontend is the attorney-facing interface: the contract upload form, the real-time progress display, the analysis results dashboard, and the Track Changes download button. Vercel handles HTTPS certificates, domain routing, and edge caching automatically.

The critical Vercel configuration for legal engineering is the **rewrite rule** that routes API calls to the backend. The frontend runs on Vercel. The backend runs on Render. When the frontend makes an API call to `/api/analyze`, Vercel rewrites that request to the Render backend URL:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.onrender.com/api/:path*"
    }
  ]
}
```

This rewrite is invisible to the frontend code. The React application calls `/api/analyze` as if the backend were on the same server. Vercel transparently forwards the request to Render. This pattern avoids CORS issues (cross-origin resource sharing restrictions that browsers enforce) and simplifies frontend development.


### Render: Backend Deployment

Render deploys Express servers. When you push backend code to GitHub, Render pulls the code, installs dependencies, compiles TypeScript, and starts the Express server. The result is a URL (like `your-backend.onrender.com`) that accepts HTTP requests and runs your pipeline.

Render configuration for a legal engineering backend is minimal:

```yaml
# render.yaml
services:
  - type: web
    name: legal-pipeline-backend
    runtime: node
    buildCommand: npm install && npx tsc
    startCommand: node dist/server.js
    envVars:
      - key: ANTHROPIC_API_KEY
        sync: false  # Set manually in Render dashboard
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
```

> **Warning**
>
> Never commit API keys, database connection strings, or JWT secrets to your GitHub repository. Store them as environment variables in the Render dashboard. A committed API key is a security breach waiting to happen. Render's environment variable system keeps secrets out of your source code while making them available to your running server.

Two Render-specific considerations for legal engineering. First, **cold starts**. Render's free tier spins down servers after 15 minutes of inactivity. The next request takes 30 to 60 seconds to restart the server. For a production pipeline, use a paid Render plan that keeps the server running. For development and testing, the free tier is sufficient. Second, **request timeouts**. Render's default request timeout may be shorter than the time a legal pipeline needs to complete. For pipelines that take minutes, use the 202 pattern (return immediately, process in background) rather than attempting to hold the HTTP connection open.


### MongoDB Atlas: Managed Database

MongoDB Atlas is MongoDB's cloud-hosted database service. You create a cluster (a set of database servers), connect to it with a connection string, and perform operations through the MongoDB driver in your TypeScript code. Atlas handles replication (your data exists on multiple servers), backups (automatic daily snapshots), and scaling (increasing capacity as your data grows).

For legal engineering, Atlas configuration requires attention to two settings. First, **network access**. By default, Atlas blocks all connections. You must whitelist the IP addresses of your Render server and your development machine. For Render deployments, whitelist `0.0.0.0/0` (all IPs) because Render uses dynamic IP addresses, and secure access through your connection string credentials instead.

Second, **indexes**. Create indexes on fields you query frequently:

```typescript
// database-indexes.ts
// Create indexes on startup for query performance
async function createIndexes(): Promise<void> {
  await analysesCollection.createIndex(
    { analysisId: 1 },
    { unique: true }
  );
  await analysesCollection.createIndex({ clientId: 1 });
  await analysesCollection.createIndex({ status: 1 });
  await analysesCollection.createIndex({ completedAt: -1 });
  await metricsCollection.createIndex({ analysisId: 1 });
  await metricsCollection.createIndex({ recordedAt: -1 });
}
```


### Cloudflare R2: Object Storage

Contracts are files. Generated DOCX documents are files. Pipeline artifacts (intermediate outputs, debug logs, full run records) are files. These files need to be stored somewhere accessible to both the backend server and the frontend download interface. Cloudflare R2 is object storage that is S3-compatible (uses the same API as Amazon S3) with zero egress fees (no charge for downloading files).

```typescript
// storage.ts
// Cloudflare R2 storage for contracts and generated documents
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!
  }
});

// Upload a contract for analysis
async function uploadContract(
  analysisId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const key = `contracts/${analysisId}/${fileName}`;
  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: fileBuffer,
    ContentType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));
  return key;
}

// Store a generated redlined document
async function storeRedlinedDocument(
  analysisId: string,
  docxBuffer: Buffer
): Promise<string> {
  const key = `redlined/${analysisId}/redlined-output.docx`;
  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: docxBuffer,
    ContentType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));
  return key;
}

// Retrieve a stored document
async function getDocument(key: string): Promise<Buffer> {
  const response = await r2Client.send(new GetObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key
  }));
  const stream = response.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
```


### The Complete Deployment Flow

Here is the end-to-end deployment flow for a legal engineering pipeline:

1. You push code to the `main` branch on GitHub.
2. Vercel detects the push, builds the React frontend, deploys it to `yourdomain.com`.
3. Render detects the push, builds the Express backend, deploys it to `your-backend.onrender.com`.
4. The Vercel rewrite rule routes `/api/*` requests from the frontend to the Render backend.
5. The Render backend connects to MongoDB Atlas for data storage and Cloudflare R2 for file storage.
6. An attorney visits `yourdomain.com`, uploads a contract, and receives analysis results, all without knowing that five services are collaborating behind a single URL.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" style="font-family: system-ui, sans-serif;">
  <!-- Background -->
  <rect width="800" height="450" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Figure 2D.1 — Deployment Architecture: Five Services, One URL</text>

  <!-- GitHub (top center) -->
  <rect x="310" y="55" width="180" height="55" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="400" y="80" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">GitHub</text>
  <text x="400" y="97" text-anchor="middle" fill="white" font-size="11">Source Code + Triggers</text>

  <!-- Vercel (left) -->
  <rect x="80" y="170" width="180" height="55" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="170" y="195" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">Vercel</text>
  <text x="170" y="212" text-anchor="middle" fill="white" font-size="11">React Frontend</text>

  <!-- Render (right) -->
  <rect x="540" y="170" width="180" height="55" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="630" y="195" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">Render</text>
  <text x="630" y="212" text-anchor="middle" fill="white" font-size="11">Express Backend</text>

  <!-- MongoDB Atlas (bottom left) -->
  <rect x="80" y="310" width="180" height="55" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="170" y="335" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">MongoDB Atlas</text>
  <text x="170" y="352" text-anchor="middle" fill="white" font-size="11">Analysis Results + Metrics</text>

  <!-- Cloudflare R2 (bottom center) -->
  <rect x="310" y="310" width="180" height="55" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="400" y="335" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">Cloudflare R2</text>
  <text x="400" y="352" text-anchor="middle" fill="white" font-size="11">DOCX Files + Artifacts</text>

  <!-- Claude API (bottom right) -->
  <rect x="540" y="310" width="180" height="55" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="630" y="335" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">Claude API</text>
  <text x="630" y="352" text-anchor="middle" fill="white" font-size="11">AI Inference</text>

  <!-- Arrows from GitHub -->
  <line x1="350" y1="110" x2="210" y2="170" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealD)"/>
  <line x1="450" y1="110" x2="590" y2="170" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealD)"/>
  <text x="260" y="135" text-anchor="middle" fill="white" font-size="9">deploy</text>
  <text x="540" y="135" text-anchor="middle" fill="white" font-size="9">deploy</text>

  <!-- Vercel to Render rewrite -->
  <line x1="260" y1="197" x2="540" y2="197" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrowAmberD)"/>
  <text x="400" y="190" text-anchor="middle" fill="#f39c12" font-size="9">/api/* rewrite</text>

  <!-- Render to services -->
  <line x1="590" y1="225" x2="210" y2="310" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealD)"/>
  <line x1="630" y1="225" x2="440" y2="310" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealD)"/>
  <line x1="670" y1="225" x2="670" y2="310" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrowAmberD)"/>

  <defs>
    <marker id="arrowTealD" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmberD" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>
</svg>
```

---

**Key Takeaways**

- The deployment stack for legal engineering consists of five managed services: GitHub (code), Vercel (frontend), Render (backend), MongoDB Atlas (database), and Cloudflare R2 (file storage).
- Each service deploys automatically from GitHub. Pushing to the main branch triggers production deployment of both frontend and backend.
- Vercel's rewrite rule routes `/api/*` requests from the frontend to the Render backend, creating a seamless single-URL experience for the end user.
- Never commit secrets (API keys, connection strings, JWT secrets) to GitHub. Store them as environment variables in Render and Vercel dashboards.
- MongoDB Atlas indexes are essential for query performance. Create indexes on every field you query frequently.
- Cloudflare R2 provides S3-compatible object storage with zero egress fees, making it the cost-effective choice for storing uploaded contracts and generated documents.

\newpage
\newpage

## 2E. The Anthropic API

*The Engine Behind Legal Engineering*

### What the Anthropic API Is

The Anthropic API is how your legal engineering pipeline communicates with Claude. It is an HTTP service hosted by Anthropic. Your code sends a structured request containing a prompt and configuration parameters. The API processes that prompt through the Claude model and returns a structured response containing generated text and usage statistics. Every AI operation in every legal engineering pipeline, from contract classification to risk analysis to document synthesis, is an Anthropic API call.

This section teaches the API at the level of detail required to build production systems. Not a high-level overview. Not a getting-started tutorial. The specific parameters, the specific patterns, the specific cost formulas, and the specific error conditions that you will encounter when building and operating legal engineering pipelines.


### Account Setup and Authentication

To use the Anthropic API, you need an account at `console.anthropic.com` and an API key. The API key is a string that starts with `sk-ant-` and authenticates your requests. It is a secret. Treat it with the same care you would treat a client's banking credentials. Store it in environment variables. Never commit it to version control. Never embed it in frontend code (which is visible to anyone who opens browser developer tools). Never log it.

```typescript
// The Anthropic SDK reads the API key from the environment variable
// ANTHROPIC_API_KEY. You do not need to pass it explicitly.
// The SDK constructor finds it automatically.
import Anthropic from '@anthropic-ai/sdk';

// This reads process.env.ANTHROPIC_API_KEY automatically
const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});
```

Set the environment variable in your shell profile for local development and in the Render/Vercel dashboard for production. Never create the client without the timeout and beta headers shown above. These are not optional settings. They are required for production legal engineering.


### The Messages API

Every Claude API interaction uses the Messages API. You send a `messages` array containing your conversation, and you specify the model and the maximum number of tokens the response may contain. The API returns a response object with the generated text and usage statistics.

Three parameters are required for every call:

**`model`**: The model identifier. For all legal engineering work, this is `'claude-opus-4-6'`, Anthropic's most capable model. We use the best model available because legal work product must meet the standard of care, and the standard of care requires the highest quality analysis the technology can produce. Using a less capable model to save money is a false economy: the cost of correcting inferior analysis exceeds the cost of using a better model.

**`max_tokens`**: The maximum number of tokens in the response. For all production legal engineering calls, set this to `128_000`. This is the maximum output capacity enabled by the 128K output beta. Setting a lower value risks truncating the model's response, which means your contract analysis cuts off mid-sentence, your research memo ends without a conclusion, or your Track Changes directives stop before covering the last twenty clauses. Set it to the maximum and let the model use what it needs.

**`messages`**: An array of message objects, each with a `role` ('user' or 'assistant') and `content` (the text). For most pipeline stages, you send a single user message containing the prompt. For multi-turn interactions (like research agents that make tool calls and then continue reasoning), the messages array contains the full conversation history.

You may also provide an optional **`system`** parameter that sets the agent's identity, expertise, and behavioral constraints. In a multi-agent pipeline, each agent gets a different system prompt that defines its specialized role. The system prompt is the single most powerful lever in pipeline design. It transforms a general-purpose language model into a domain specialist.


### The Standard Client Initialization

Every legal engineering project uses the same client initialization. Copy this block verbatim into every project:

```typescript
// client.ts — The standard Anthropic client for legal engineering
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});
```

Three settings, each non-negotiable:

**`timeout: 3_600_000`** (one hour in milliseconds). A complex contract analysis stage can take several minutes of wall-clock time. A research agent making multiple web searches can take longer. A synthesis agent processing three hundred findings can take eight minutes. The one-hour timeout covers the worst-case scenario without risking a premature disconnection. The default timeout (a few minutes) is insufficient for production legal pipelines. Set it once and do not think about it again.

**`output-128k-2025-02-19`**: The 128K output beta header. This expands the maximum response length from the standard 8,192 tokens to 128,000 tokens. Without this header, the model's response is capped at roughly 6,000 words, which is insufficient for any production legal deliverable. A comprehensive M&A analysis easily exceeds 20,000 words. A drafted contract can exceed 40,000 words. A research memo with citations and analysis requires at least 10,000 words to be useful. The 128K output beta ensures the model never truncates its response due to an artificial limit.

**`context-1m-2025-08-07`**: The extended context beta header. This expands the context window from the standard 200,000 tokens to 1,000,000 tokens. A 200-page M&A agreement alone can consume 100,000+ tokens. Add a detailed system prompt (5,000 tokens), a party-specific playbook (10,000 tokens), and the findings from upstream specialists (50,000 tokens), and you are approaching the standard limit. The 1M context beta provides five times the capacity, ensuring you never need to truncate your input or omit relevant context.

Both beta headers are specified as a single comma-separated string in the `defaultHeaders` object. They apply to every API call made through this client instance.


### The Standard API Call Pattern

Every pipeline stage uses the same call pattern. Streaming for reliability. Token extraction for cost tracking:

```typescript
// standard-call.ts — The standard API call for every pipeline stage
async function runPipelineStage(
  systemPrompt: string,
  userPrompt: string
): Promise<{
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}> {
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 128_000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const response = await stream.finalMessage();

  const text = response.content
    .find(c => c.type === 'text')?.text ?? '';
  const { input_tokens, output_tokens } = response.usage;
  const costUsd = (input_tokens * 15 + output_tokens * 75) / 1_000_000;

  return { text, inputTokens: input_tokens, outputTokens: output_tokens, costUsd };
}
```

**Why streaming?** The `client.messages.stream()` method establishes a persistent Server-Sent Events connection with the API. Tokens are sent to your code as they are generated, keeping the connection alive through continuous data flow. Without streaming, you send a request and wait for the complete response, which can take minutes for complex analysis. During that wait, the HTTP connection sits idle. Network infrastructure (load balancers, proxies, corporate firewalls) commonly closes idle connections after 30 to 120 seconds. If the connection closes before the response is complete, you lose the entire response and must retry from scratch. Streaming eliminates this risk because data flows continuously.

**`await stream.finalMessage()`** waits for the streaming to complete and returns the fully assembled response object, identical in structure to what `client.messages.create()` would return. You get the convenience of streaming (no timeout risk) with the simplicity of working with a complete response object (no manual chunk assembly). This is why `stream()` plus `finalMessage()` is the standard pattern, not `create()`.

**Token extraction** from `response.usage` gives you the exact number of input and output tokens consumed. This data is essential for cost tracking, billing, pipeline optimization, and anomaly detection. A specialist that normally consumes 60,000 input tokens suddenly consuming 200,000 suggests a prompt or input error.

**Cost calculation**: For Claude Opus, input tokens cost $15 per million and output tokens cost $75 per million. The formula is `(inputTokens * 15 + outputTokens * 75) / 1_000_000`. This gives the cost in US dollars. Track this for every call, log it, and aggregate it per pipeline run.


### The System Prompt: Turning One Model Into Many Specialists

The system prompt is what transforms a general-purpose language model into a domain specialist. A risk analyzer, a citation verifier, a redline drafter, a quality reviewer, a MAC specialist, an IP analyst, and a regulatory compliance officer are all the same Claude model running with different system prompts. The model's capability is constant. The system prompt determines what that capability is directed toward.

```typescript
// specialist-prompt.ts
// The system prompt defines the agent's identity, expertise, and constraints
const macAnalystSystemPrompt = `You are a senior M&A attorney specializing in Material Adverse Change and Material Adverse Effect provisions. You have 15+ years of Delaware M&A practice experience. You analyze MAC/MAE definitions, carve-outs, knowledge qualifiers, measurement periods, and buyer remedies with the precision expected of lead deal counsel.

Your analysis must:
- Evaluate carve-out completeness against current Delaware practice
- Identify missing standard carve-outs (general economic conditions, industry-wide changes, changes in law/GAAP, acts of war/terrorism, pandemic events, transaction-related changes)
- Assess the materiality threshold and its adequacy
- Analyze measurement periods (backward-looking vs. forward-looking "prospects" language)
- Evaluate the relationship between the MAC definition and closing conditions
- Compare against ABA deal points data where relevant
- Cite specific Delaware Chancery precedent where applicable

For every finding, provide: the specific clause reference, the issue identified, the recommended revision with exact language, and the legal reasoning supporting the recommendation. Prioritize findings by deal impact. Do not summarize. Analyze.`;

const stream = client.messages.stream({
  model: 'claude-opus-4-6',
  max_tokens: 128_000,
  system: macAnalystSystemPrompt,
  messages: [{
    role: 'user',
    content: `Analyze the following M&A agreement for MAC/MAE issues from the buyer's perspective.\n\nCONTRACT:\n${contractText}`
  }]
});
```

Writing effective system prompts requires domain expertise. You cannot instruct a model to evaluate carve-out completeness if you do not know what carve-outs should be present. You cannot tell it to assess measurement periods if you do not understand how Delaware courts apply them. The legal expertise is what makes the prompt effective. The model provides the processing power. The prompt provides the legal intelligence. This is covered in depth in Section 2H.


### Structured Outputs: Guaranteed JSON

When a pipeline stage needs to produce structured data (a classification, a risk score, a routing decision), you need the model's output in a predictable format that downstream code can parse reliably. Structured outputs solve this by providing a JSON schema to the API. The model is constrained to produce valid JSON matching that exact schema:

```typescript
// structured-outputs.ts
// Guaranteed valid JSON matching your exact schema
const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 16_384,
  messages: [{
    role: 'user',
    content: `Classify this contract:\n\n${contractText}`
  }],
  output_config: {
    format: {
      type: 'json_schema',
      schema: {
        type: 'object',
        properties: {
          vertical: {
            type: 'string',
            enum: ['saas', 'ma', 'vc', 'employment', 'nda',
                   'equipment', 'commercial-lease',
                   'professional-services', 'ip-license']
          },
          confidence: {
            type: 'number',
            description: 'Classification confidence from 0.0 to 1.0'
          },
          parties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: { type: 'string' }
              },
              required: ['name', 'role']
            }
          },
          governingLaw: { type: 'string' },
          dealValue: { type: 'number' }
        },
        required: ['vertical', 'confidence', 'parties', 'governingLaw'],
        additionalProperties: false
      }
    }
  }
});

// No parsing gymnastics — the response IS valid JSON
const classification = JSON.parse(
  response.content.find(c => c.type === 'text')?.text ?? '{}'
);
```

Use structured outputs for every pipeline stage that produces data consumed by downstream code. Use natural language output (no schema) for stages that produce prose deliverables: drafted contracts, negotiation emails, research memos, client reports. The rule is straightforward: if code needs to parse the output, use structured outputs. If a human reads the output, use natural language.

> **Practice Tip**
>
> Note that structured outputs use `client.messages.create()` (non-streaming) rather than `client.messages.stream()`. Structured output calls typically produce small responses (classification results, routing decisions, risk scores) that complete in seconds. The timeout risk that motivates streaming does not apply. For long-form analysis and document generation, always stream. For short structured responses, `create()` is appropriate.


### Temperature: Precision vs. Creativity

Temperature controls the randomness of the model's token selection. At temperature 0, the model always picks the highest-probability next token, producing deterministic output. At temperature 1 (the default), the model samples from a broader probability distribution, introducing variability.

For legal engineering, **the default temperature of 1 is usually correct**. Legal analysis benefits from the model considering a wider range of possibilities when identifying risks, constructing arguments, suggesting alternative contract language, or exploring counterarguments. A MAC specialist at temperature 0 might identify the three most obvious issues. The same specialist at temperature 1 might also identify a subtler issue involving the interaction between the MAC definition and a carve-out that, while lower-probability, has significant deal impact.

Lower temperature when you need strict reproducibility. Automated test suites, for example, benefit from temperature 0 because you want identical output across runs to verify that code changes do not alter pipeline behavior. Scoring rubrics may also benefit from lower temperature to reduce variance in evaluation scores. For all runtime pipeline stages that analyze real client contracts, leave temperature at the default.


### Error Handling and Rate Limits

Three categories of errors occur in production:

**Rate limit errors** (HTTP 429) occur when you exceed Anthropic's request or token rate limits. The response includes a `retry-after` header indicating how long to wait. Handle these with exponential backoff:

```typescript
// rate-limit-handling.ts
async function callWithBackoff(
  callFn: () => Promise<Anthropic.Message>,
  maxRetries: number = 5
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callFn();
    } catch (error: any) {
      if (error?.status === 429 && attempt < maxRetries - 1) {
        const retryAfter = parseInt(error.headers?.['retry-after'] ?? '5');
        const backoffMs = Math.max(retryAfter * 1000, 1000 * Math.pow(2, attempt));
        console.warn(`Rate limited. Retrying in ${backoffMs}ms (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Overload errors** (HTTP 529) occur when Anthropic's servers are at capacity. These are transient and should be retried with backoff, identically to rate limit errors.

**Timeout errors** occur when the connection drops before the response completes. The one-hour timeout in the standard client configuration makes these rare, but they can still occur due to network infrastructure issues. The streaming pattern further mitigates this risk, but have retry logic as a final safety net.

> **Warning**
>
> In a parallel pipeline stage (sixteen specialists running via `Promise.allSettled()`), rate limits can cascade. All sixteen requests hit the API simultaneously. If the rate limit allows only ten concurrent requests, six will receive 429 errors. Each retries with backoff, but if they all retry at the same time, they trigger rate limits again. Stagger retries by adding random jitter to the backoff delay: `const jitter = Math.random() * 1000;` added to the backoff duration. This desynchronizes the retries and prevents thundering herd problems.


### Cost Tracking: Not Optional

Every API call in a production legal pipeline must track its token usage and cost. This is not a nice-to-have logging feature. It is a business necessity for three reasons.

First, **client billing**. If you charge clients per contract analysis, you need to know exactly what each analysis costs so you can price your service with appropriate margins. An M&A analysis that costs $19.95 in API fees might be billed at $500 to the client. But you cannot set that price without knowing the $19.95 figure, and you cannot know that figure without tracking every API call's token usage.

Second, **pipeline optimization**. Token tracking reveals which stages consume disproportionate resources. If the synthesis stage is consuming 40% of total tokens but producing only 10% of the analytical value, that stage needs prompt engineering to reduce token consumption without losing quality.

Third, **anomaly detection**. A specialist that normally consumes 60,000 input tokens suddenly consuming 200,000 indicates a problem: perhaps the input contract was unusually large, perhaps a prompt was duplicated, perhaps a loop is sending the same content multiple times. Token tracking catches these anomalies before they become expensive.

```typescript
// cost-tracker.ts
// Track cost for every API call in the pipeline
interface PipelineCallMetrics {
  stageName: string;
  agentName: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
  timestamp: Date;
}

function calculateOpusCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * 15 + outputTokens * 75) / 1_000_000;
}

// Aggregate metrics for a complete pipeline run
function summarizePipelineCost(calls: PipelineCallMetrics[]): {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  totalDurationMs: number;
  costByStage: Record<string, number>;
} {
  const totalInputTokens = calls.reduce((sum, c) => sum + c.inputTokens, 0);
  const totalOutputTokens = calls.reduce((sum, c) => sum + c.outputTokens, 0);
  const totalCostUsd = calls.reduce((sum, c) => sum + c.costUsd, 0);
  const totalDurationMs = calls.reduce((sum, c) => sum + c.durationMs, 0);

  const costByStage: Record<string, number> = {};
  for (const call of calls) {
    costByStage[call.stageName] =
      (costByStage[call.stageName] ?? 0) + call.costUsd;
  }

  return { totalInputTokens, totalOutputTokens, totalCostUsd, totalDurationMs, costByStage };
}
```

---

**Key Takeaways**

- The standard Anthropic client initialization uses a one-hour timeout, the 128K output beta, and the 1M context beta. Copy this block into every project. These settings are non-negotiable.
- Every pipeline stage uses `client.messages.stream()` plus `await stream.finalMessage()` for reliability. Streaming prevents connection timeouts on long-running generations.
- The system prompt is the single most powerful lever in pipeline design. It transforms one general-purpose model into a team of domain specialists. Writing effective system prompts requires the legal domain expertise that the prompt encodes.
- Structured outputs guarantee valid JSON for pipeline data flow. Use them for classification, routing, and scoring stages. Use natural language output for prose deliverables.
- Cost formula for Claude Opus: `(inputTokens * 15 + outputTokens * 75) / 1_000_000`. Track every call. Log every metric. Aggregate per pipeline run.
- Handle rate limits with exponential backoff plus random jitter. In parallel stages, jitter prevents thundering herd retries that trigger cascading rate limits.

\newpage

## 2F. Context Engineering

*What the Model Sees Determines What the Model Produces*

### What Context Engineering Is

Context engineering is the discipline of deciding what information goes into each API call's context window. The context window is the model's working memory: everything it can consider when generating a response. It is finite (1,000,000 tokens with the extended context beta). What you include and exclude determines output quality more than any other single factor, including the prompt itself.

This is a counterintuitive claim. Most practitioners assume that the prompt is the most important determinant of output quality. The prompt matters enormously (Section 2H covers prompt engineering in depth). But the prompt operates on the context. A brilliantly crafted MAC analysis prompt produces mediocre output if the context contains a poorly formatted contract with missing sections. The same prompt produces excellent output if the context contains the complete, well-formatted contract text plus relevant specialist findings plus the party's playbook. Context engineering is about what the model sees. Prompt engineering is about what you tell the model to do with what it sees. Both matter. Context matters first.


### The Context Window as Working Memory

A useful analogy, though it has limits: the context window is like an attorney's working memory during document review. An attorney who reads an entire M&A agreement in one sitting has the full context available when analyzing any specific clause. They can trace cross-references, identify definitional dependencies, and recognize inconsistencies between sections. An attorney who reads only the indemnification section in isolation misses the cross-reference to Section 4's representations, the cap defined in the preamble, and the notice provision in Section 12 that constrains the claim procedure. The analysis suffers not because the attorney is less skilled but because the context is incomplete.

The same principle applies to AI models. A Claude API call with the full contract text in context can trace cross-references, evaluate definitional completeness, and identify inter-section inconsistencies. The same call with only a subset of the contract misses the same things a human would miss with incomplete context. The model does not become less capable. The context becomes less informative.


### Static Context vs. Dynamic Context

Context in a legal engineering pipeline divides into two categories.

**Static context** is information that remains constant across all pipeline runs: the system prompt (the agent's identity and analytical framework), role definitions, output format specifications, and universal instructions. Static context is authored once, refined through testing, and included in every call to a given agent. The MAC specialist's system prompt is static context. It does not change based on the contract being analyzed.

**Dynamic context** is information that changes per pipeline run or per pipeline stage: the contract text, the specialist findings from upstream stages, the research results, the party-specific playbook, and the metadata extracted during intake. Dynamic context is assembled at runtime based on the specific task.

The critical design decision in every pipeline stage is: given the finite context window, what static context and what dynamic context should this agent see? Including too little context produces an uninformed analysis. Including too much context dilutes the relevant information among irrelevant data, and the model's attention degrades.


### Context Priority: Primacy and Recency

Research on large language models consistently shows that information at the beginning and end of the context window receives more attention than information in the middle. This primacy-recency effect has direct implications for how you structure context in legal engineering prompts.

Place the most important instructions and the analytical framework at the beginning (the system prompt). Place the contract text in the middle. Place the specific task instruction and output format requirements at the end (the closing portion of the user message). This structure ensures that the model's strongest attention falls on its identity/expertise definition and on its immediate task, with the contract text available for reference throughout.

```typescript
// context-structure.ts
// Optimal context structure: instructions first, document middle, task last
const userPrompt = `
ANALYTICAL FRAMEWORK:
${analyticaFramework}

PARTY PERSPECTIVE:
You are representing ${party} in this transaction.

PLAYBOOK:
${partyPlaybook}

CONTRACT TEXT:
${contractText}

UPSTREAM FINDINGS:
${specialistFindings}

YOUR TASK:
Analyze the MAC/MAE provisions in the contract above using the analytical framework provided. For each finding, provide the clause reference, the issue, the recommended revision, and the legal reasoning. Prioritize by deal impact.

OUTPUT FORMAT:
${outputFormatInstructions}
`;
```

> **Insight**
>
> Context engineering IS pipeline architecture, viewed from a different angle. When you design a multi-agent pipeline, you are making context engineering decisions at scale. "Which specialists should analyze this contract?" is a context engineering decision: you are deciding what analytical frameworks (static context) and what subsets of findings (dynamic context) will be available to downstream agents. "Should the research agents see the full contract or only the specialist findings?" is a context engineering decision: you are deciding what context best supports the research task. Every architectural decision in a legal engineering pipeline is, at bottom, a context engineering decision about what information each agent should see.


### Dynamic Context Windowing

The most sophisticated context engineering pattern in legal engineering is **dynamic context windowing**: loading different portions of the contract and different subsets of upstream findings based on the specific focus of each agent.

In a naive pipeline, every agent sees everything: the full contract, all specialist findings, all research results. This works for small contracts and small pipelines. For a 200-page M&A agreement analyzed by a 26-agent pipeline, "everything" is millions of tokens, which introduces noise and degrades attention.

Dynamic context windowing solves this by curating each agent's context to include only the information relevant to its task. The MAC specialist sees the full contract (because MAC provisions cross-reference other sections) but does not see the IP analyst's findings (which are irrelevant to MAC analysis). The synthesis agent sees all specialist findings (because it must reconcile and prioritize them) but sees only the relevant portions of the contract (the sections that specialists flagged). The research agent sees only the specialist findings related to its research topic, not all 302 findings.

```typescript
// dynamic-context.ts
// Curate context per agent based on analytical focus
function buildResearchAgentContext(
  researchTopic: string,
  allFindings: SpecialistFinding[],
  contractSections: Record<string, string>
): string {
  // Filter findings to only those relevant to this research topic
  const relevantFindings = allFindings.filter(
    f => f.domainArea === researchTopic
  );

  // Include only the contract sections that findings reference
  const referencedSections = new Set(
    relevantFindings.flatMap(f => f.sectionReferences)
  );
  const relevantSections = Object.entries(contractSections)
    .filter(([section]) => referencedSections.has(section))
    .map(([section, text]) => `[${section}]\n${text}`)
    .join('\n\n');

  return `
RESEARCH TOPIC: ${researchTopic}

SPECIALIST FINDINGS REQUIRING RESEARCH:
${relevantFindings.map(f => `- ${f.clauseReference}: ${f.finding}`).join('\n')}

RELEVANT CONTRACT SECTIONS:
${relevantSections}

RESEARCH INSTRUCTIONS:
Conduct targeted research to support or challenge each specialist finding.
Search for current case law, regulatory guidance, and market data.
Provide specific citations for every factual claim.
  `;
}
```

Dynamic context windowing is what separates a production legal engineering pipeline from a naive "send everything to every agent" approach. The difference in output quality is measurable: agents with curated context produce more focused, more accurate, and more actionable analysis than agents drowning in irrelevant information.


### Context Budgeting

With a 1,000,000-token context window, budgeting might seem unnecessary. It is not. A 200-page M&A agreement consumes approximately 100,000 tokens. A detailed system prompt consumes 3,000 to 10,000 tokens. A playbook consumes 5,000 to 15,000 tokens. Upstream specialist findings from sixteen agents can consume 50,000 to 150,000 tokens. Research results can consume another 30,000 to 80,000 tokens. For a synthesis agent that receives all of this, the total can approach 400,000 tokens. That is still within the 1M limit, but it is 40% of the window.

The reason context budgeting matters is not capacity; it is quality. Research indicates that model performance degrades with very long contexts, even when the total is within the window limit. A model processing 400,000 tokens of context is less attentive to any individual piece of information than a model processing 100,000 tokens of carefully curated context. Budgeting forces you to prioritize: which information is essential, which is helpful, and which is noise that can be excluded.

A practical budgeting framework for a synthesis agent in a major pipeline:

| Context Component | Token Budget | Rationale |
|---|---|---|
| System prompt | 5,000 | Agent identity and analytical framework |
| Contract text (full) | 100,000 | Need for cross-reference verification |
| Specialist findings (all) | 100,000 | Must see everything to synthesize |
| Research results (relevant) | 50,000 | Only include research with citations |
| Playbook excerpts | 10,000 | Party perspective and priorities |
| Output instructions | 3,000 | Format and structure requirements |
| **Total** | **268,000** | Well within 1M limit with quality headroom |

---

**Key Takeaways**

- Context engineering (what the model sees) determines output quality more than any other single factor. A brilliant prompt with incomplete context produces inferior output.
- Static context (system prompts, frameworks) stays constant. Dynamic context (contract text, findings, research) changes per run. The design decision for each agent is what combination of static and dynamic context optimizes its task.
- Primacy-recency effect: place instructions first, document text in the middle, task and format requirements last. The model attends most strongly to the beginning and end of the context window.
- Dynamic context windowing curates each agent's context to include only task-relevant information. This produces more focused analysis than sending everything to every agent.
- Context budgeting is about quality, not capacity. Shorter, curated context produces better output than longer, noisy context, even when total length is within the window limit.

\newpage

## 2G. Tokens

*How AI Measures Text, and What It Costs*

### What Tokens Are

Language models do not process words. They process **tokens**, fragments of text that typically correspond to about three-quarters of a word. The sentence "The indemnification cap shall not exceed $5,000,000" might be split into tokens like ["The", " indemn", "ification", " cap", " shall", " not", " exceed", " $", "5", ",", "000", ",", "000"]. Common words become single tokens. Uncommon words get split into sub-word pieces. Numbers and punctuation each consume their own tokens.

Token count matters because it determines two things: whether your input fits in the context window, and how much the API call costs.


### Measurement at Scale

Practical token measurements for legal engineering:

| Document | Word Count | Approximate Tokens | % of 1M Context |
|---|---|---|---|
| Standard NDA | 3,000 | 4,000 | 0.4% |
| SaaS Master Services Agreement | 15,000 | 20,000 | 2.0% |
| Employment Agreement | 8,000 | 11,000 | 1.1% |
| Equipment Lease | 12,000 | 16,000 | 1.6% |
| M&A Purchase Agreement (Meridian-Apex) | 42,274 | 56,000 | 5.6% |
| Full M&A data room (20 documents) | 400,000+ | 530,000+ | 53% |
| Specialist system prompt (2,000 words) | 2,000 | 2,700 | 0.3% |
| Specialist finding output (per agent) | 3,000 | 4,000 | 0.4% |
| Sixteen specialist findings combined | 48,000 | 64,000 | 6.4% |
| Full pipeline context for synthesis agent | 200,000 | 268,000 | 26.8% |

The Meridian-Apex merger agreement, at 42,274 words (approximately 56,000 tokens), uses only 5.6% of the 1M context window. Context windows are large. But recall from the CLE experiment: the full pipeline processed 2.81 million input tokens across 27 calls. That figure exceeds the single-call context limit by nearly three times. The reason is that the pipeline reads the contract fifty times, with different eyes each time. Each of the sixteen specialist agents receives the full contract (56,000 tokens) plus its specialized instructions. That is 16 copies of 56,000 tokens, which alone accounts for 896,000 input tokens. Each research agent receives its relevant specialist findings plus contract excerpts. The synthesis agent receives all findings and research. Token consumption in a multi-agent pipeline is multiplicative, not additive.

To put this in perspective: the entire Harry Potter series is approximately 1.1 million words, or roughly 1.5 million tokens. You could fit almost the entire series into one context window. Your merger agreement uses a fraction of that space. The constraint is not the size of any single document. The constraint is the cumulative token consumption across all agents in a multi-agent pipeline.


### Token Economics

Every API call has a cost, and every legal engineer must understand the formula. The pricing model is straightforward: you pay per token, with input tokens (your prompt and context) priced differently from output tokens (the model's response).

For Claude Opus (the model used in all legal engineering work):

| Token Type | Cost | Explanation |
|---|---|---|
| Input tokens | $15 per million | The text you send: prompt, contract, context |
| Output tokens | $75 per million | The text the model generates: analysis, findings |

Output tokens cost five times more than input tokens. This asymmetry has direct implications for pipeline design. The most expensive round in the Meridian-Apex analysis was Round 02 (sixteen specialists), not because the specialists generated the most output but because each of the sixteen agents received the full contract as input. Sixteen copies of 56,000 tokens is 896,000 input tokens, which at $15 per million costs $13.44 in input alone. Round 04 (synthesis) was the longest-running round but not the most expensive, because it was a single agent processing a large input rather than sixteen agents each processing the full contract.

The per-round cost breakdown from the CLE experiment illustrates this:

| Round | Agents | Input Tokens | Output Tokens | Cost |
|---|---|---|---|---|
| 01 Intake | 1 | 91,000 | 174 | $0.46 |
| 02 Specialists | 16 | 1,470,000 | 146,000 | $11.02 |
| 03 Research | 8 | 931,000 | 52,000 | $5.97 |
| 04 Synthesis | 1 | 205,000 | 21,000 | $1.54 |
| 05 Directives | 1 | 114,000 | 15,000 | $0.95 |
| 06 OOXML Surgery | 0 (code) | 0 | 0 | $0.00 |
| **Total** | **27** | **2,811,000** | **235,000** | **$19.95** |

For less than twenty dollars, in less than twenty-two minutes, this pipeline produced 138 Track Changes with 69 comments and 18 legal citations. That same analysis from a deal team would cost thousands of dollars and take days.


### Token Budgeting for Pipeline Design

Token budgeting is the practice of estimating the token consumption of each pipeline stage before building it, so you can predict cost and optimize architecture.

A budgeting worksheet for a standard contract analysis pipeline:

```typescript
// token-budget.ts
// Pre-build cost estimation for pipeline design

interface StageBudget {
  stageName: string;
  agentCount: number;
  inputTokensPerAgent: number;
  estimatedOutputTokensPerAgent: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostUsd: number;
}

function estimatePipelineCost(stages: StageBudget[]): {
  totalCost: number;
  costByStage: Record<string, number>;
} {
  let totalCost = 0;
  const costByStage: Record<string, number> = {};

  for (const stage of stages) {
    const inputCost = (stage.totalInputTokens * 15) / 1_000_000;
    const outputCost = (stage.totalOutputTokens * 75) / 1_000_000;
    const stageCost = inputCost + outputCost;
    totalCost += stageCost;
    costByStage[stage.stageName] = stageCost;
  }

  return { totalCost, costByStage };
}

// Example: estimate cost for a SaaS agreement analysis
const saasEstimate = estimatePipelineCost([
  {
    stageName: 'Intake',
    agentCount: 1,
    inputTokensPerAgent: 25_000,   // Smaller contract than M&A
    estimatedOutputTokensPerAgent: 500,
    totalInputTokens: 25_000,
    totalOutputTokens: 500,
    estimatedCostUsd: 0
  },
  {
    stageName: 'Specialists',
    agentCount: 12,                 // Fewer specialists for SaaS
    inputTokensPerAgent: 30_000,    // Contract + system prompt
    estimatedOutputTokensPerAgent: 5_000,
    totalInputTokens: 360_000,
    totalOutputTokens: 60_000,
    estimatedCostUsd: 0
  },
  // ... additional stages
]);
```

Token budgeting is also essential for client pricing. If your pipeline costs $8 to analyze a SaaS agreement and $20 to analyze an M&A agreement, you need different price points for different verticals. Without token budgeting, you are guessing at margins.


### The Cost Trajectory: Falling Prices

AI model costs have fallen dramatically and continue to fall. When Claude Opus first launched, the cost per million tokens was significantly higher than current pricing. Each successive model generation has delivered better performance at lower cost. The trend continues.

This trajectory matters for legal engineering economics. A pipeline that costs $20 per analysis today may cost $8 in twelve months and $3 in twenty-four months, with equal or better quality. Building legal engineering infrastructure now means that the economics improve automatically over time. You do not need to rebuild the pipeline to benefit from cost reductions. You pay less per API call as prices drop, and your margins improve without any engineering work.

> **Key Concept**
>
> The economic argument for legal engineering strengthens over time. A pipeline that is marginally profitable at today's token prices becomes highly profitable at next year's prices. A pipeline that competes with associate time at $400 per hour today will compete with paralegal time at $150 per hour within two years. The architecture is the moat. The model capability improves and the cost drops. Build the architecture now.


### Two-Stage Filtering for Cost Reduction

For pipelines that process large document batches (due diligence review, portfolio analytics, document triage), a powerful cost optimization is **two-stage filtering**: use a cheaper, faster model for initial screening, then route only the relevant documents to the expensive model for deep analysis.

This pattern does not apply to single-document analysis pipelines (which always use Opus for every stage). It applies to batch pipelines where you need to process hundreds of documents and most of them will be filtered out. Review all hundred documents with a smaller, cheaper model to identify the twenty that require deep analysis. Then analyze those twenty with Opus. The total cost is a fraction of analyzing all hundred with Opus.

This is the Dibia pattern (named for its articulation in the failure modes taxonomy): expensive models process, cheap models filter. It applies to any pipeline where the filtering decision does not require frontier-model capability. Contract classification (SaaS vs. M&A vs. NDA) can be done by a less capable model. Risk analysis cannot.

---

**Key Takeaways**

- A token is approximately three-quarters of a word. The Meridian-Apex M&A agreement (42,274 words) is roughly 56,000 tokens, using only 5.6% of the 1M context window.
- Token consumption in multi-agent pipelines is multiplicative: sixteen specialists each receiving the full contract means sixteen copies of the input tokens.
- Claude Opus costs $15/M input tokens and $75/M output tokens. Output tokens cost five times more than input. The cost formula: `(inputTokens * 15 + outputTokens * 75) / 1_000_000`.
- The full Meridian-Apex pipeline: 2.81M input tokens, 235K output tokens, $19.95 total, 21.8 minutes. Round 02 (sixteen specialists) is the most expensive round due to input token multiplication.
- Token budgeting predicts pipeline cost before build and supports per-vertical pricing for client billing.
- AI costs are falling 50-70% annually. Pipelines built today become more profitable over time as token prices drop.

\newpage

## 2H. Prompts

*The Prompt Engineering Ladder: From Naive to Expert*

### Why Prompts Matter

Everyone who uses AI already knows that prompts matter. That is table stakes. The real question is how much they matter and what separates a prompt that produces generic output from a prompt that produces work product indistinguishable from a senior associate's analysis.

A prompt is the instruction you give to the AI model. It defines the task, the perspective, the scope, the depth, and the format of the expected output. The gap between casual use and engineering becomes visible when you see the difference between a one-sentence instruction and a 2,000-word analytical framework written by a domain expert.

This section introduces the **Prompt Engineering Ladder**, a five-rung framework that maps the progression from naive prompting to full pipeline architecture. Each rung represents a level of sophistication that produces measurably different output quality. Moving from Rung 1 to Rung 3 is the single highest-leverage improvement most attorneys can make today. Moving from Rung 3 to Rung 5 is what this book teaches across its remaining chapters.


### Rung 1: The Naive Prompt

"Review this contract."

Two words of instruction. No perspective specified (buyer or seller?). No contract type identified (SaaS or M&A?). No scope defined (all issues or just risk?). No depth required (high-level summary or clause-by-clause?). No output format (bullet points or structured analysis?).

The model produces a generic overview that would be equally applicable to any contract by any party in any jurisdiction. It identifies obvious issues (the termination provision is broad, the liability cap exists, the governing law is Delaware) without analysis, without recommendations, and without citations. It is not wrong. It is not useful. It is the equivalent of asking a first-year associate to "look at" a contract and report back. You get a summary, not analysis.

Rung 1 is how most attorneys currently interact with AI. They type a brief question into a chat interface and receive a brief answer. The output matches the input in specificity, which is to say, neither has much.


### Rung 2: The Perspective Prompt

"Review this M&A agreement from the buyer's perspective and identify the top ten issues."

This is better. The prompt specifies the contract type (M&A), the party perspective (buyer), the scope (top ten issues), and implicitly the output format (a numbered list). The model now knows what kind of analysis to perform, from whose viewpoint, and roughly how much detail to provide.

The output is recognizably useful. The model identifies material issues: the MAC definition may be unfavorable, the termination fee is above market, the representations lack specificity in certain areas. Each issue is described in a paragraph with some reasoning. The output is roughly what Claude.ai's single-prompt variation produced in the TLE R&D experiment: competent, surface-level, and lacking the depth that would make it actionable without significant attorney review.

Rung 2 is where most "AI for lawyers" tutorials stop. They teach you to include role and perspective in your prompts, and they present the resulting output as evidence that AI can do legal work. It can. At this level, it produces competent first drafts of the kind of overview memo a summer associate might produce. What it does not produce is the depth of analysis required for deal execution.


### Rung 3: The Structured Prompt

"You are a senior M&A attorney representing the buyer in a $4.75 billion public company acquisition. Analyze the MAC definition in Section 8.1 of the attached agreement. Evaluate the following dimensions:

1. Carve-out completeness: Are all standard carve-outs present? (General economic conditions, industry-wide changes, changes in law/GAAP, acts of war/terrorism, pandemic events, transaction-related changes.) For any missing carve-out, explain the risk to the buyer.

2. Knowledge qualifiers: Does the definition include 'would reasonably be expected to' language or 'prospects' language? Assess the prevalence and buyer favorability of each formulation under current Delaware practice.

3. Measurement periods: Is the MAC measured backward-looking only or does it include forward-looking 'prospects'? Identify the market prevalence of forward-looking MAC language.

4. Materiality thresholds: Is there a specific dollar or percentage threshold tied to the definition? If not, assess whether the absence benefits or harms the buyer.

5. Buyer remedies: What remedies does the agreement provide if a MAC occurs? Can the buyer terminate? Is there a walk-away right without a termination fee?

For each issue, provide: the specific clause reference, the problem identified, the recommended revision with exact replacement language, and the legal reasoning supporting the recommendation. Prioritize findings by deal impact."

This is a structured prompt. It specifies the attorney's seniority level and deal experience. It identifies the deal context (public company, $4.75 billion). It defines exactly which analytical dimensions to evaluate. It specifies the required output format for each finding. It establishes the prioritization criterion.

The output from Rung 3 is dramatically better than Rung 2. The model produces a structured analysis with specific clause references, identified issues, recommended revision language, and legal reasoning for each recommendation. It evaluates carve-out completeness against actual market practice. It assesses the MAC definition with the kind of specificity that a partner would expect from a sixth-year associate who specializes in MAC provisions.

Moving from Rung 1 to Rung 3 improves output quality by approximately 100%. This is the single highest-leverage change most attorneys can make with AI today. It requires no engineering. It requires no code. It requires only the discipline to write a detailed, structured prompt instead of a brief instruction. And it requires the domain expertise to know what analytical dimensions should be evaluated, which is precisely why attorneys, not prompt engineers, should write these prompts.

> **Key Concept**
>
> You cannot write a Rung 3 MAC analysis prompt without understanding MAC law. You cannot instruct the model to evaluate carve-out completeness if you do not know what carve-outs should be present. You cannot tell it to assess measurement periods if you do not understand how Delaware courts apply them. Domain expertise is the value that the prompt encodes. The model provides processing power. The prompt provides legal intelligence. This is why legal engineers (attorneys who build these systems) produce fundamentally different work product than software engineers who lack legal training.


### Rung 4: The Domain Expert Prompt

Rung 4 prompts are 2,000 words or more. They are complete analytical frameworks for a single specialist domain. They include market data benchmarks, common negotiation positions, red flags, output formatting, and examples of high-quality analysis. A Rung 4 prompt is the equivalent of a partner briefing a specialist associate on exactly how to analyze a particular aspect of a transaction.

The MAC specialist prompt in the BitsBound pipeline is a Rung 4 prompt. It specifies the analyst's role. It defines exactly what a Material Adverse Change clause does, how Delaware courts interpret it, what current market standards are, which specific sub-issues to analyze (carve-outs, knowledge qualifiers, measurement periods, materiality thresholds, buyer remedies). It specifies the output format. It specifies the level of reasoning detail expected. It includes market data reference points (ABA deal studies showing that forward-looking "prospects" language appears in approximately 10% of current deals). It includes precedent reference points (Delaware Chancery Court standards for MAC invocation).

The practical difference between Rung 3 and Rung 4 is depth of analysis per issue. A Rung 3 prompt produces correct identification of issues with reasonable analysis. A Rung 4 prompt produces identification of issues with the kind of depth, nuance, and market context that distinguishes a specialist's analysis from a generalist's.

Each of the sixteen specialist agents in the Meridian-Apex pipeline receives a Rung 4 prompt. They are each 1,500 to 3,000 words of domain-expert analytical framework. Writing these prompts is the most time-intensive part of legal engineering. It is also the most valuable part, because the prompt quality determines the output quality for every contract the pipeline processes.


### Rung 5: The Full Pipeline

Rung 5 is not a single prompt. It is an orchestrated system of prompts: sixteen parallel specialist prompts, eight research prompts, synthesis prompts, directive generation prompts, all coordinated by code. Rung 5 is what this book teaches from Chapter 4 onward.

The difference between Rung 4 and Rung 5 is the difference between a single specialist and a deal team. A Rung 4 prompt produces excellent analysis from one perspective. Rung 5 produces excellent analysis from sixteen perspectives simultaneously, augmented by live research, reconciled through synthesis, and delivered as a Word document with Track Changes and citations.

The TLE R&D experiment demonstrated this empirically. The single-prompt variation (a strong Rung 3 prompt) produced 35 Track Changes with zero legal citations. The full pipeline (Rung 5) produced 138 Track Changes with 18 legal citations. A 3.9x improvement in output volume and an infinite improvement in citation count (from zero to eighteen). The model did not change. The architecture did.

| Rung | Prompt Length | Output Quality | Representative |
|---|---|---|---|
| 1 Naive | 5 words | Generic summary | "Review this contract." |
| 2 Perspective | 20 words | Competent overview | Includes role, type, scope |
| 3 Structured | 200 words | Actionable analysis | Multi-dimension framework |
| 4 Domain Expert | 2,000+ words | Specialist-grade work product | Market data, precedent, depth |
| 5 Full Pipeline | 30,000+ words (total) | Deal-team-grade deliverable | 16 specialists + research + synthesis |


### Prompt Engineering Principles

Six principles govern effective prompt writing at every rung of the ladder.

**Specificity over brevity.** More detailed instructions produce more detailed output. A prompt that says "evaluate the indemnification cap" produces a paragraph. A prompt that says "evaluate the indemnification cap against the following dimensions: (1) cap amount relative to deal value, (2) whether the cap applies to fundamental representations, (3) whether the cap is a true cap or a deductible, (4) comparison to market range for this deal size" produces four structured analyses.

**Domain expertise is the prompt's value.** The model knows how to generate text. The prompt tells it what text to generate. A prompt written by someone who understands MAC law produces analysis that reflects that understanding. A prompt written by someone who does not understand MAC law produces superficial or incorrect analysis, no matter how well-structured the prompt syntax is.

**Structured outputs for structured data.** When a pipeline stage needs to produce data consumed by code (classification, routing, scoring), use the structured outputs API feature (Section 2E) to guarantee valid JSON. Do not rely on the model to produce parseable JSON from a natural language instruction.

**Version control for prompts.** Treat prompts like code: version them, test them, iterate them. A MAC specialist prompt goes through dozens of iterations as you run it against different contracts, evaluate the output, identify gaps, and refine the instructions. Store each version. Track what changed and why. Revert if a change degrades output quality.

**Prompt injection defense.** Legal engineering pipelines process external documents (uploaded contracts from opposing counsel, third-party questionnaires, regulatory filings). These documents might contain text that, intentionally or accidentally, could be interpreted as instructions to the model. System prompts should include explicit instructions that the model must treat document text as data to be analyzed, never as instructions to be followed. This is especially critical in client-facing pipelines where document sources are not controlled.

**Test against diverse inputs.** A prompt that works perfectly for a Delaware M&A agreement might fail for a California employment agreement. Test specialist prompts against your full agreement bank (multiple contract types, multiple jurisdictions, multiple deal sizes) before deploying to production. The goal is robust performance across the distribution of documents your pipeline will process, not perfect performance on a single test case.

> **Practice Tip**
>
> Start every specialist prompt development by writing a Rung 3 prompt. Run it against three different contracts in your agreement bank. Evaluate the output. Identify what the model missed, what it got wrong, and where the analysis lacked depth. Then expand the prompt to Rung 4 by adding the analytical dimensions, market data, and precedent references that address the gaps. This iterative process (prompt, test, evaluate, refine) is how production-grade prompts are developed. There is no shortcut.

---

**Key Takeaways**

- The Prompt Engineering Ladder has five rungs, from naive (5 words) to full pipeline (30,000+ words across multiple agents). Each rung produces measurably different output quality.
- Moving from Rung 1 to Rung 3 (adding perspective, structure, and analytical dimensions) is the single highest-leverage improvement most attorneys can make today, requiring no engineering skills.
- Rung 4 prompts are 2,000+ word domain-expert analytical frameworks. Writing them requires the legal expertise they encode. This is why attorneys should write prompts for legal AI systems.
- Rung 5 is the full pipeline: multiple specialists, research, synthesis, delivery. It is the subject of the remaining chapters in this book.
- Prompt engineering principles: specificity over brevity, domain expertise is the value, version control prompts like code, defend against prompt injection, test against diverse inputs.

\newpage

## 2I. Tools

*Extending AI Beyond Text Generation*

### What Tools Are

A language model without tools can only reason from its training data and the context you provide. It cannot check today's case law. It cannot read a file from your server. It cannot query your database. It cannot calculate a complex formula with guaranteed accuracy. Tools give AI agents capabilities beyond text generation. With tools, an agent can search the web, read files, query databases, call external APIs, and execute code. Tools transform an AI model from a reasoning engine that operates on stale knowledge into an agent that operates on live information.

This distinction is what separates the pipeline variation in the TLE R&D experiment from the single-prompt variation. Claude.ai without tools produced analysis based solely on its training data. It could identify issues, reason about contract structure, and suggest improvements, but it could not cite current case law, check today's regulatory requirements, or access market data published after its training cutoff. The pipeline's research agents, equipped with web search tools, conducted 40 live searches and returned 18 citable references. The citations are what transform the pipeline's output from competent analysis to authoritative work product.


### Tool Types for Legal Engineering

Five categories of tools appear in legal engineering pipelines.

**Web search** pulls current information from the internet. When a research agent needs to verify whether Delaware Chancery courts have upheld forward-looking "prospects" language in MAC definitions, it searches for "Delaware Chancery MAC prospects language prevalence" and retrieves actual current case law. Anthropic provides a built-in web search tool (`web_search_20250305`) that can be enabled in any API call. The model formulates search queries, reads results, refines searches, and extracts relevant information, all autonomously within a single API call.

**File operations** read documents from your server's file system and write output files. When a pipeline needs to read a playbook stored on disk, parse a contract from an uploaded file, or write a generated document to a storage directory, file operation tools handle the I/O.

**Database queries** retrieve and store structured data in MongoDB. A pipeline might query the playbook collection to load party-specific analysis instructions, query the precedent collection to find prior analyses of similar contracts, or write analysis results to the output collection.

**External API calls** integrate with services outside your pipeline: document management systems, court filing platforms, regulatory databases, time and billing systems. A tool that calls the SEC's EDGAR API can retrieve the latest filing requirements. A tool that calls a law firm's document management API can pull prior transaction documents.

**Code execution** performs calculations that require deterministic accuracy. Token arithmetic, date calculations, percentage computations, cross-reference validation. When a pipeline needs to calculate that a $142.5M termination fee represents exactly 3% of $4.75B equity value, code execution produces a guaranteed-correct result. The model's arithmetic is probabilistic; code execution is deterministic.


### Function Calling: How Tools Work

The Claude API implements tools through **function calling**. You define the tools available to the model as part of the API request. Each tool definition includes a name, a description, and an input schema (the parameters the tool accepts). When the model decides it needs to use a tool to complete its task, it generates a tool use request specifying which tool to call and what arguments to provide. Your code executes the tool and returns the result. The model then continues reasoning with the tool's output in context.

```typescript
// tool-definition.ts
// Define tools the research agent can use
const tools: Anthropic.Tool[] = [
  {
    name: 'web_search',
    description: 'Search the web for current legal information, case law, regulations, and market data. Use this when you need information more recent than your training data or when you need to verify a specific claim.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query. Be specific: include jurisdiction, legal concept, and year range when relevant.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'calculate',
    description: 'Perform a mathematical calculation with guaranteed accuracy. Use this for any arithmetic involving dollar amounts, percentages, or dates.',
    input_schema: {
      type: 'object' as const,
      properties: {
        expression: {
          type: 'string',
          description: 'A mathematical expression to evaluate, e.g., "4750000000 * 0.03"'
        }
      },
      required: ['expression']
    }
  }
];

// API call with tools enabled
const stream = client.messages.stream({
  model: 'claude-opus-4-6',
  max_tokens: 128_000,
  tools,
  messages: [{
    role: 'user',
    content: `Research the following specialist finding and provide citations:\n\n${finding}`
  }]
});
```

When the model generates a tool use request, the streaming response includes a `tool_use` content block instead of (or in addition to) a `text` content block. Your code inspects this block, executes the requested tool, and sends the result back in a new message with role `'user'` and a `tool_result` content block. The model then continues its analysis with the tool result in context.

This is a multi-turn conversation. The model reasons, decides it needs information, calls a tool, receives the result, reasons further, possibly calls another tool, receives that result, and eventually produces its final response. The research agents in the Meridian-Apex pipeline averaged five web searches each, meaning five rounds of tool calling before producing their final research output.


### The Research Agent Pattern

Tools are what make the research round possible. Without tools, the model reasons from training data. With tools, it accesses live information. The research agent pattern is the most differentiating feature in any legal engineering pipeline:

```typescript
// research-agent.ts
// A research agent with web search capability
async function runResearchAgent(
  topic: string,
  specialistFindings: SpecialistFinding[]
): Promise<ResearchResult> {
  const messages: Anthropic.MessageParam[] = [{
    role: 'user',
    content: `
You are a legal researcher investigating: ${topic}

SPECIALIST FINDINGS REQUIRING RESEARCH:
${specialistFindings.map(f => `- ${f.finding}`).join('\n')}

INSTRUCTIONS:
1. Formulate specific search queries based on the specialist findings
2. Search for current case law, regulatory guidance, and market data
3. For each search, evaluate results and extract specific citations
4. If initial results are insufficient, refine queries and search again
5. Provide a structured research report with all citations

Every factual claim must have a specific, verifiable citation.
    `
  }];

  // Multi-turn tool-calling loop
  let response: Anthropic.Message;
  do {
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 128_000,
      tools,
      messages
    });
    response = await stream.finalMessage();

    // Check if the model wants to use a tool
    const toolUseBlock = response.content.find(
      c => c.type === 'tool_use'
    );

    if (toolUseBlock && toolUseBlock.type === 'tool_use') {
      // Execute the tool
      const toolResult = await executeTool(
        toolUseBlock.name,
        toolUseBlock.input as Record<string, string>
      );

      // Add the assistant's response and tool result to the conversation
      messages.push({ role: 'assistant', content: response.content });
      messages.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: toolResult
        }]
      });
    }
  } while (response.stop_reason === 'tool_use');

  // Extract the final text response
  const text = response.content
    .find(c => c.type === 'text')?.text ?? '';

  return parseResearchOutput(text);
}
```

The research agent pattern is autonomous. You give the agent a research topic and relevant specialist findings. The agent formulates its own search queries, evaluates results, refines searches, and produces a structured research report. The agent decides what to search for, how many searches to conduct, and when it has gathered sufficient information. This autonomy is what makes it an agent rather than a simple API call.

> **Insight**
>
> The research round is the most differentiating feature in the entire pipeline. Everything else (specialist analysis, parallel processing, structured prompts) produces better analysis from the model's existing knowledge. The research round goes outside the model and pulls in external information: current case law, recent regulatory guidance, up-to-date market data. This is how the pipeline stays current. AI models have a training cutoff. Research agents that can search the web do not. Your pipeline evolves with the law without you updating anything.

---

**Key Takeaways**

- Tools extend AI agents beyond text generation: web search, file operations, database queries, external APIs, and code execution.
- Function calling is the mechanism: you define tools, the model decides when to use them, your code executes the tools, and the model continues reasoning with the results.
- The research agent pattern (multi-turn tool calling) is the most differentiating feature in legal engineering pipelines. It produces verifiable citations from live sources, not hallucinated references from training data.
- Research agents are autonomous: they formulate queries, evaluate results, refine searches, and decide when they have gathered sufficient information.
- Tools are what separate professional legal AI (with citations, with current law, with market data) from consumer AI (with training-data-only reasoning).

\newpage


## 2J. RAG (Retrieval-Augmented Generation)

*Grounding AI in Your Legal Knowledge*

### What RAG Is

Retrieval-Augmented Generation (RAG) is a pattern where relevant information is retrieved from external sources and injected into the AI's context window before generation. Instead of relying solely on the model's training data (which has a cutoff date and does not include your firm's proprietary precedent), the model reasons over retrieved documents, producing output grounded in specific, verifiable sources.

RAG and tools (Section 2I) solve overlapping but distinct problems. Tools like web search retrieve information from the open internet in real time. RAG retrieves information from your own curated knowledge base: your firm's contract repository, your playbook library, your collection of case opinions, your negotiation precedent database. Tools access the world's information. RAG accesses your information.

The distinction matters because legal engineering often requires both. A research agent uses web search tools to find current Delaware case law (public information, current as of today). A drafting agent uses RAG to retrieve your firm's preferred contract language for a specific clause type (proprietary information, curated over years of practice). A redlining agent uses RAG to retrieve the counterparty's prior negotiation positions from your deal history (institutional memory that exists nowhere else).


### Why RAG Matters for Legal Knowledge

Five categories of legal knowledge benefit from RAG:

**Case law retrieval.** Embed case opinions in a vector database, search by legal concept, and inject the most relevant cases into the agent's context. When the MAC specialist needs to cite Delaware Chancery precedent on the "prospects" language, a RAG query retrieves the specific case opinions that address this issue, not a general-purpose web search that might return law firm blog posts and CLE summaries.

**Statute and regulation databases.** Current statutes and regulations, indexed and retrievable by topic. When a regulatory compliance agent needs the exact text of SEC Rule 14e-1(a) (the twenty-business-day tender offer requirement), a RAG query retrieves the current rule text from your curated regulatory database, ensuring the agent works with the current version of the law rather than whatever version existed in its training data.

**Contract repositories.** Your firm's prior agreements, indexed by contract type, clause type, and party position. When a drafting agent needs language for an indemnification cap in a SaaS agreement where you represent the vendor, a RAG query retrieves the cap language from your last ten SaaS agreements where you represented the vendor. The agent does not need to generate language from scratch; it adapts proven language from your own precedent.

**Playbook retrieval.** Party-specific negotiation positions and fallback language. When analyzing a contract from the buyer's perspective, a RAG query retrieves the buyer's playbook for this contract type, which specifies what positions to take, what fallback language to propose, and what deal points to prioritize. Playbooks encode the institutional knowledge of your practice group.

**Market data.** ABA deal points studies, industry benchmarks, and market standard terms. When the synthesis agent needs to assess whether a termination fee is "market," a RAG query retrieves the relevant market data study showing the range of termination fees for comparable transactions.


### RAG Architecture

A RAG system has four components: a knowledge base, a chunking strategy, an embedding model, and a vector database.

**The knowledge base** is the collection of documents you want to make retrievable: case opinions, statutes, contracts, playbooks, market studies. These documents are the ground truth that your AI agents will reason over.

**Chunking** is how you split documents into retrievable units. The most common mistake in RAG implementations is arbitrary character-based chunking: splitting a document into 1,000-character segments regardless of content boundaries. For legal documents, this produces chunks that split clauses mid-sentence, separate definitions from the terms they define, and break the logical structure that makes the content meaningful. Legal engineering requires **semantic chunking**: splitting at section boundaries, clause boundaries, or paragraph boundaries that preserve the logical integrity of each chunk.

```typescript
// chunking.ts
// Semantic chunking for legal documents — split at section boundaries
function chunkLegalDocument(
  documentText: string,
  maxChunkTokens: number = 2000
): DocumentChunk[] {
  const sections = documentText.split(/(?=^#{1,3}\s|^ARTICLE\s|^Section\s\d)/mi);
  const chunks: DocumentChunk[] = [];

  for (const section of sections) {
    const estimatedTokens = Math.ceil(section.length / 4); // rough estimate

    if (estimatedTokens <= maxChunkTokens) {
      chunks.push({
        text: section.trim(),
        estimatedTokens,
        sectionHeader: extractSectionHeader(section)
      });
    } else {
      // Split oversized sections at paragraph boundaries
      const paragraphs = section.split(/\n\n+/);
      let currentChunk = '';
      let currentTokens = 0;

      for (const paragraph of paragraphs) {
        const paraTokens = Math.ceil(paragraph.length / 4);
        if (currentTokens + paraTokens > maxChunkTokens && currentChunk) {
          chunks.push({
            text: currentChunk.trim(),
            estimatedTokens: currentTokens,
            sectionHeader: extractSectionHeader(section)
          });
          currentChunk = '';
          currentTokens = 0;
        }
        currentChunk += paragraph + '\n\n';
        currentTokens += paraTokens;
      }

      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          estimatedTokens: currentTokens,
          sectionHeader: extractSectionHeader(section)
        });
      }
    }
  }

  return chunks;
}
```

**Embedding models** convert text chunks into numerical vectors (arrays of floating-point numbers) that capture semantic meaning. Similar concepts produce similar vectors. "Material Adverse Change" and "Material Adverse Effect" produce vectors that are close together in the embedding space, even though the words are different. This is what enables semantic search: you convert a query ("MAC prospects language Delaware") into a vector and find the stored chunks whose vectors are most similar.

**Vector databases** store the embedded chunks and support efficient similarity search. When a query arrives, the database finds the K nearest vectors (the most semantically similar chunks) and returns them. Popular choices include Pinecone, Weaviate, and MongoDB Atlas Vector Search (which is convenient if you already use MongoDB Atlas for your pipeline data).

```typescript
// rag-pipeline.ts
// Complete RAG retrieval for a legal research query
async function retrieveRelevantContext(
  query: string,
  collection: string,
  topK: number = 10
): Promise<RetrievedChunk[]> {
  // Step 1: Embed the query
  const queryEmbedding = await embedText(query);

  // Step 2: Search the vector database for similar chunks
  const results = await vectorDb.search({
    collection,
    vector: queryEmbedding,
    topK,
    includeMetadata: true
  });

  // Step 3: Return ranked results with similarity scores
  return results.map(r => ({
    text: r.metadata.text,
    sectionHeader: r.metadata.sectionHeader,
    source: r.metadata.source,
    similarityScore: r.score
  }));
}

// Usage: inject retrieved context into an agent's prompt
async function buildMACAnalysisPrompt(
  contractText: string
): Promise<string> {
  // Retrieve relevant MAC case law from the knowledge base
  const macCaseLaw = await retrieveRelevantContext(
    'Material Adverse Change definition Delaware Chancery prospects carve-outs',
    'case-law',
    5
  );

  // Retrieve relevant market data
  const marketData = await retrieveRelevantContext(
    'MAC MAE deal points prevalence carve-out market standard',
    'market-data',
    3
  );

  return `
CONTRACT TEXT:
${contractText}

RELEVANT CASE LAW (from knowledge base):
${macCaseLaw.map(c => `[${c.source}]\n${c.text}`).join('\n\n')}

RELEVANT MARKET DATA:
${marketData.map(m => `[${m.source}]\n${m.text}`).join('\n\n')}

Analyze the MAC/MAE definition using the case law and market data provided above.
Cite specific cases and data points in your analysis.
  `;
}
```


### When to Use RAG vs. Tools vs. the Model's Training Data

A practical decision framework:

| Information Need | Source | Mechanism |
|---|---|---|
| Current case law (published, public) | The internet | Web search tool |
| Your firm's prior contract language | Your contract repository | RAG |
| Current regulatory text | The internet or curated DB | Web search or RAG |
| Playbook / negotiation positions | Your playbook library | RAG |
| Market benchmark data | Curated studies | RAG |
| General legal concepts and doctrine | Model training data | No retrieval needed |
| Deal-specific terms and metadata | Pipeline context | Dynamic context (Section 2F) |

RAG is most valuable when the information is proprietary (your firm's precedent), curated (selected and verified case opinions), or structured for specific retrieval (playbooks organized by contract type and party position). Web search tools are most valuable when the information is public and recent (today's case law, current regulations). The model's training data is sufficient for general legal concepts that do not change frequently and do not require source-specific precision.

> **Practice Tip**
>
> Start with a small, curated RAG knowledge base rather than embedding your entire document repository. A collection of fifty well-chosen case opinions for your primary practice area, plus twenty representative contracts from your precedent library, produces better RAG results than a poorly curated collection of five thousand documents. Quality of the knowledge base determines quality of retrieval, which determines quality of generation. Curate aggressively.

---

**Key Takeaways**

- RAG retrieves information from your curated knowledge base and injects it into the AI's context. It grounds the model's output in specific, verifiable sources from your own documents.
- Five categories of legal knowledge benefit from RAG: case law, statutes/regulations, contract repositories, playbooks, and market data.
- Semantic chunking (splitting at section and clause boundaries) is essential for legal documents. Arbitrary character-based chunking breaks the logical structure that makes content meaningful.
- RAG complements web search tools: RAG accesses your proprietary knowledge, web search accesses current public information.
- Start with a small, curated knowledge base. Quality of retrieval depends on quality of the knowledge base, not its size.

\newpage


## 2K. OOXML

*The Last-Mile Solution*

### The Last-Mile Problem

Most AI legal tools produce output in chat windows, bullet points, web interfaces, or PDFs. None of that integrates into the actual workflow. Attorneys work in Microsoft Word. They draft in Word. They track changes in Word. They send Word documents to opposing counsel. Opposing counsel opens the document in Word, reviews the changes in Word, accepts or rejects each change in Word, makes counter-proposals in Word, and sends the document back. This is how transactional law works. It runs on Word documents with Track Changes.

If your AI pipeline produces brilliant analysis but delivers it as plain text in a browser, it has failed. The attorney must manually transfer every suggestion from the screen into the Word document. That manual transfer step kills the efficiency gain, introduces transcription errors, adds significant time, and is the single biggest reason AI legal tools fail to achieve adoption. The output must be a Word document. The analysis must be Track Changes. The citations must be comments in the margin. Anything else is a demo, not a product.

This is the last-mile problem. The AI does the analysis. The analysis is excellent. But the analysis does not reach the attorney in the format they work in, so the analysis is useless. OOXML is the last-mile solution.


### What OOXML Is

A `.docx` file is not a single binary blob. It is a ZIP archive containing XML files. Rename any `.docx` file to `.zip`, extract it, and you find a folder structure containing XML files that describe every aspect of the document: its text content, its styles, its numbering, its headers and footers, its images, its metadata.

The key file is `word/document.xml`. This is where your contract text lives, encoded as a hierarchy of XML elements. Understanding this hierarchy is essential for building legal engineering pipelines that produce real Word documents with real Track Changes.

```
mydocument.docx (renamed to mydocument.zip):
├── [Content_Types].xml          # MIME types for document parts
├── _rels/
│   └── .rels                    # Package relationships
├── word/
│   ├── document.xml             # THE MAIN CONTENT FILE
│   ├── styles.xml               # Style definitions
│   ├── numbering.xml            # Numbering/list definitions
│   ├── settings.xml             # Document settings
│   ├── fontTable.xml            # Font table
│   ├── comments.xml             # Comment content (if any)
│   └── _rels/
│       └── document.xml.rels    # Content relationships
└── docProps/
    ├── app.xml                  # Application metadata
    └── core.xml                 # Core properties (author, title)
```


### Paragraphs, Runs, and Text

Inside `document.xml`, text is organized into three nested levels.

A **paragraph** (`<w:p>`) represents a block of text ending at a line break. Each clause in a contract typically occupies one or more paragraphs. Each paragraph contains one or more **runs** (`<w:r>`), where each run is a contiguous stretch of text sharing the same formatting (same font, same size, same bold/italic/underline settings). Inside each run, the actual characters live in a **text element** (`<w:t>`).

A single sentence that switches from normal text to bold text midway through becomes two runs: one run with normal formatting containing the text before the bold switch, and one run with bold formatting containing the text after. This granularity is what makes Word documents complex but also what makes precise editing possible: you can modify text at the character level without affecting surrounding formatting.

```xml
<!-- document.xml — A paragraph with two runs (normal + bold) -->
<w:p>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:sz w:val="22"/>
    </w:rPr>
    <w:t>The Vendor shall deliver the Software within </w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:sz w:val="22"/>
      <w:b/>
    </w:rPr>
    <w:t>thirty (30) calendar days</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:sz w:val="22"/>
    </w:rPr>
    <w:t> of execution.</w:t>
  </w:r>
</w:p>
```


### Track Changes: The Heart of AI Redlining

Track Changes is the Word feature that records edits as visible markup. When an attorney enables Track Changes and makes edits, Word does not simply modify the text. Instead, it wraps every edit in special XML elements that record what was changed, who changed it, and when.

Insertions are wrapped in `<w:ins>` elements. Deletions are wrapped in `<w:del>` elements. Each carries attributes for the author name and the timestamp. When an attorney opens a document with Track Changes, they see deleted text struck through in red and inserted text underlined in a different color. They can accept or reject each change individually.

```xml
<!-- track-changes.xml — Insertion and deletion markup -->
<w:p>
  <w:r>
    <w:t>The Vendor shall deliver the Software within </w:t>
  </w:r>

  <!-- Deletion: original text being removed -->
  <w:del w:id="1" w:author="AI Legal Engineer" w:date="2025-03-15T10:30:00Z">
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
      </w:rPr>
      <w:delText>sixty (60)</w:delText>
    </w:r>
  </w:del>

  <!-- Insertion: new text being added -->
  <w:ins w:id="2" w:author="AI Legal Engineer" w:date="2025-03-15T10:30:00Z">
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="22"/>
      </w:rPr>
      <w:t>thirty (30)</w:t>
    </w:r>
  </w:ins>

  <w:r>
    <w:t> calendar days of execution.</w:t>
  </w:r>
</w:p>
```

When an attorney opens this document in Word, they see "sixty (60)" struck through in red and "thirty (30)" underlined, the standard Track Changes display. They can accept the change (keeping "thirty (30)" and removing "sixty (60)") or reject it (keeping "sixty (60)" and removing "thirty (30)"). The experience is byte-for-byte identical to Track Changes produced by a human reviewer.


### Comments: Margin Annotations

Comments are another critical OOXML element for legal engineering. When the pipeline identifies an issue and explains its reasoning, that explanation appears as a comment in the document margin. Comments in OOXML involve two components: the comment content (stored in `word/comments.xml`) and a comment reference (embedded in `word/document.xml` at the location the comment applies to).

```xml
<!-- comments.xml — Comment content -->
<w:comment w:id="10" w:author="AI Legal Engineer" w:date="2025-03-15T10:30:00Z">
  <w:p>
    <w:r>
      <w:t>The forward-looking "prospects" language in this MAC definition
      appears in only approximately 10% of current deals (ABA Deal Points
      Study). Delaware courts have applied heightened scrutiny to MAC
      clauses containing prospects language. Recommend removing "prospects"
      or qualifying it with "would reasonably be expected to."</w:t>
    </w:r>
  </w:p>
</w:comment>

<!-- document.xml — Comment range in the document text -->
<w:commentRangeStart w:id="10"/>
<w:r>
  <w:t>has had or would reasonably be expected to have, individually or in
  the aggregate, a Material Adverse Effect on the business, financial
  condition, results of operations, or prospects</w:t>
</w:r>
<w:commentRangeEnd w:id="10"/>
<w:r>
  <w:rPr>
    <w:rStyle w:val="CommentReference"/>
  </w:rPr>
  <w:commentReference w:id="10"/>
</w:r>
```


### Programmatic OOXML Manipulation

Building Track Changes and comments programmatically requires three steps: read the ZIP archive, parse and modify the XML, and repackage the ZIP. In Node.js, the JSZip library handles the ZIP layer and an XML parser handles the document layer:

```typescript
// ooxml-surgery.ts
import JSZip from 'jszip';

// Step 1: Read the .docx file and extract XML content
async function openDocument(
  docxBuffer: Buffer
): Promise<{ zip: JSZip; documentXml: string; commentsXml: string }> {
  const zip = await JSZip.loadAsync(docxBuffer);
  const documentXml = await zip
    .file('word/document.xml')!
    .async('string');
  const commentsXml = await zip
    .file('word/comments.xml')
    ?.async('string') ?? createEmptyCommentsXml();

  return { zip, documentXml, commentsXml };
}

// Step 2: Insert a Track Change at a specific text location
function insertTrackChange(
  documentXml: string,
  originalText: string,
  newText: string,
  changeId: number,
  author: string,
  date: string
): string {
  // Locate the original text in the XML
  // Insert w:del element around original text
  // Insert w:ins element with new text
  // Preserve run properties (formatting) from surrounding context
  // Return modified XML

  // (Full implementation in Chapter 5)
  return modifiedXml;
}

// Step 3: Repackage the ZIP and produce the final .docx
async function saveDocument(
  zip: JSZip,
  modifiedDocumentXml: string,
  modifiedCommentsXml: string
): Promise<Buffer> {
  zip.file('word/document.xml', modifiedDocumentXml);
  zip.file('word/comments.xml', modifiedCommentsXml);

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}
```

The critical details that separate working OOXML manipulation from broken OOXML manipulation:

**Namespace handling.** Every element in OOXML belongs to an XML namespace (typically `w:` for word processing elements, `r:` for relationships, `wp:` for drawing). If your programmatic XML manipulation drops or corrupts namespace declarations, Word refuses to open the file or silently discards your changes. Always preserve namespace declarations from the original document when constructing new elements.

**Formatting inheritance.** When you insert Track Changes, the new text must inherit the formatting of its surrounding context. If the original clause is in 11pt Times New Roman with 1.15 line spacing, your inserted text must match. Clone the run properties (`w:rPr`) from adjacent original text and apply them to your inserted runs. Skip this step and your Track Changes appear in a different font or size, immediately revealing to the reviewing attorney that the edits were machine-generated.

**Unique ID management.** Every Track Change and every comment requires a unique numeric ID within the document. IDs must not collide with existing IDs in the document (which may already contain Track Changes from prior human editing). Start your ID sequence at a value higher than any existing ID.

**The `w:delText` element.** Deleted text uses `<w:delText>` instead of `<w:t>`. This is easy to miss and produces documents that appear correct in some Word versions but corrupt in others.


### Why This Is the Moat

Off-the-shelf OOXML libraries (python-docx, docx4j, Apache POI) can manipulate basic document content. None of them handle the precision required for legal redlining: inserting Track Changes at arbitrary text locations, preserving complex formatting across nested runs, managing comment ranges that span multiple paragraphs, and handling edge cases like tracked changes inside table cells, numbered lists, and footnotes.

BitsBound built a custom Track Changes engine because nothing existing was sufficient. The OOXML surgery pipeline is pure code: no AI involved, zero tokens consumed, completing in 0.2 seconds. It is Round 06 of the pipeline, the round that takes the directives from Round 05 (the AI-generated revision instructions) and applies them to the actual Word document.

In the Meridian-Apex experiment, the application rate was 100%. Every directive from Round 05 was successfully applied to the Word document by Round 06. Every Track Change appeared correctly when opened in Microsoft Word. This is the standard. Anything less means the attorney must manually fix broken markup, which defeats the purpose of automation.

> **Key Concept**
>
> OOXML is your delivery format. Understanding OOXML transforms what your AI pipeline can deliver. Without it, you are limited to plain text summaries in a web interface. With it, you produce redlined Word documents that slot directly into the attorney's existing workflow: no copy-paste, no reformatting, no friction. The document is the deliverable. Chapters 5 and 9 teach the complete OOXML surgery pipeline.

---

**Key Takeaways**

- A `.docx` file is a ZIP archive containing XML files. `word/document.xml` contains the text. Track Changes are `w:ins` and `w:del` elements. Comments are in `word/comments.xml` with range references in `document.xml`.
- Text is organized as paragraphs (`w:p`) containing runs (`w:r`) containing text elements (`w:t`). Each run carries formatting properties (`w:rPr`).
- Programmatic OOXML manipulation requires namespace preservation, formatting inheritance from surrounding context, unique ID management, and the `w:delText` element for deleted text.
- The OOXML surgery round is pure code: no AI, zero tokens, 0.2 seconds. It applies directives from the prior round to produce a Word document with real Track Changes indistinguishable from human editing.
- This is the last-mile solution. If your AI output does not produce Word documents with Track Changes, adoption fails. Attorneys work in Word. Your pipeline must produce Word.

\newpage

## 2L. SSE Streaming

*Real-Time Pipeline Progress*

### The User Experience Problem

A multi-agent pipeline takes minutes, not milliseconds. The Meridian-Apex analysis took 21.8 minutes across six rounds. Without any feedback during those twenty-two minutes, the attorney submits a contract and stares at a loading spinner. They do not know if the pipeline is running, stalled, or failed. They do not know which round is executing. They do not know how many specialists have completed. They do not know whether to wait or retry. The loading spinner is a black box, and attorneys do not trust black boxes.

Server-Sent Events (SSE) solve this problem. SSE is a protocol for real-time one-way communication from server to client. The server pushes updates as they happen. The client receives them immediately without polling. As each pipeline stage completes, the server sends an event to the browser: "Round 2: Specialist 7 of 16 complete. MAC Analysis finished. 22 findings." The attorney watches progress in real time, sees which agents are working, and understands what the pipeline is doing at every moment.

Real-time visibility builds trust. Trust drives adoption. Adoption is the only metric that matters for a legal engineering tool.


### How SSE Works

SSE uses a persistent HTTP connection. The client sends a standard GET request. The server responds with `Content-Type: text/event-stream` and keeps the connection open. As events occur, the server writes data to the connection in a specific format: `data: {JSON payload}\n\n`. The client receives each event as it is written, without waiting for the connection to close.

```typescript
// sse-endpoint.ts — SSE endpoint for pipeline progress streaming
import express from 'express';

const app = express();

app.get('/api/analyze/stream/:analysisId', async (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

  // Send initial connection event
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: 'Pipeline stream connected'
  })}\n\n`);

  // Run the pipeline with progress callbacks
  try {
    await runPipelineWithProgress(
      req.params.analysisId,
      (event: PipelineEvent) => {
        // Push each progress event to the client
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    );

    // Send completion event
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      message: 'Pipeline finished'
    })}\n\n`);
  } catch (error) {
    // Send error event
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: 'Pipeline failed',
      error: (error as Error).message
    })}\n\n`);
  } finally {
    res.end();
  }
});
```

The pipeline orchestrator emits events at key milestones: round start, specialist completion, research query execution, synthesis progress, directive generation, and OOXML surgery completion. Each event carries structured data (round number, agent name, finding count, elapsed time) that the frontend renders into a real-time progress display.


### Pipeline Progress Events

A well-designed event taxonomy for a legal engineering pipeline:

```typescript
// pipeline-events.ts
// Event types for pipeline progress streaming
type PipelineEvent =
  | { type: 'round-start'; round: number; name: string; agentCount: number }
  | { type: 'agent-complete'; round: number; agentName: string;
      findingCount: number; durationMs: number }
  | { type: 'agent-error'; round: number; agentName: string; error: string }
  | { type: 'round-complete'; round: number; totalFindings: number;
      durationMs: number; costUsd: number }
  | { type: 'research-query'; round: number; agentName: string;
      query: string; resultCount: number }
  | { type: 'citation-found'; round: number; citation: string; source: string }
  | { type: 'synthesis-progress'; directivesGenerated: number; total: number }
  | { type: 'ooxml-complete'; trackChanges: number; comments: number;
      durationMs: number }
  | { type: 'complete'; totalDurationMs: number; totalCostUsd: number;
      trackChanges: number; citations: number }
  | { type: 'error'; message: string; round?: number };
```


### Client-Side EventSource

On the frontend, the browser's built-in `EventSource` API connects to the SSE endpoint and receives events:

```typescript
// useAnalysisStream.ts — React hook for SSE consumption
import { useState, useEffect, useCallback } from 'react';

interface AnalysisProgress {
  currentRound: number;
  roundName: string;
  specialistsComplete: number;
  totalSpecialists: number;
  findings: number;
  citations: number;
  events: PipelineEvent[];
  isComplete: boolean;
  error: string | null;
}

function useAnalysisStream(analysisId: string): AnalysisProgress {
  const [progress, setProgress] = useState<AnalysisProgress>({
    currentRound: 0,
    roundName: 'Connecting...',
    specialistsComplete: 0,
    totalSpecialists: 0,
    findings: 0,
    citations: 0,
    events: [],
    isComplete: false,
    error: null
  });

  useEffect(() => {
    const source = new EventSource(
      `/api/analyze/stream/${analysisId}`
    );

    source.onmessage = (event) => {
      const data: PipelineEvent = JSON.parse(event.data);

      setProgress(prev => {
        const events = [...prev.events, data];

        switch (data.type) {
          case 'round-start':
            return {
              ...prev, events,
              currentRound: data.round,
              roundName: data.name,
              totalSpecialists: data.agentCount
            };
          case 'agent-complete':
            return {
              ...prev, events,
              specialistsComplete: prev.specialistsComplete + 1,
              findings: prev.findings + data.findingCount
            };
          case 'citation-found':
            return {
              ...prev, events,
              citations: prev.citations + 1
            };
          case 'complete':
            return { ...prev, events, isComplete: true };
          case 'error':
            return { ...prev, events, error: data.message };
          default:
            return { ...prev, events };
        }
      });
    };

    source.onerror = () => {
      setProgress(prev => ({
        ...prev,
        error: 'Connection lost. The analysis may still be running.'
      }));
      source.close();
    };

    return () => source.close();
  }, [analysisId]);

  return progress;
}
```


### SSE vs. WebSockets

A question that arises frequently: why SSE instead of WebSockets?

SSE is one-way communication (server to client). WebSockets are bidirectional (server to client and client to server). Pipeline progress streaming is inherently one-way: the server pushes updates, the client displays them. The client does not need to send data back during pipeline execution. SSE is the simpler technology for a one-way use case.

SSE uses standard HTTP. It works through corporate proxies and firewalls (extremely common in law firm IT environments) without special configuration. WebSockets use a different protocol (WS/WSS) that some corporate networks block or require special proxy configuration. In a deployment targeting law firms, SSE's compatibility advantage is significant.

SSE supports automatic reconnection. If the connection drops (network interruption, proxy timeout), the browser's `EventSource` automatically attempts to reconnect. You can configure the server to send the client's last-received event ID, allowing seamless recovery. WebSocket reconnection must be implemented manually.

Use SSE for pipeline progress streaming. Use WebSockets only if you need real-time bidirectional communication, such as a collaborative document editor where multiple users edit simultaneously.


### Connection Management

Two practical issues with SSE in production legal engineering:

**Heartbeats.** Some network infrastructure (load balancers, proxies) closes idle connections after 30 to 120 seconds. If a pipeline stage runs for several minutes without producing an event (the synthesis stage in the Meridian-Apex pipeline ran for 8.5 minutes), the connection may be closed before the next event arrives. Solve this by sending heartbeat events at regular intervals:

```typescript
// heartbeat.ts
// Send heartbeat events every 15 seconds to prevent connection timeout
const heartbeatInterval = setInterval(() => {
  res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
}, 15_000);

// Clear the heartbeat when the pipeline completes
clearInterval(heartbeatInterval);
```

**Connection cleanup.** When the client navigates away or closes the browser tab, the SSE connection should be cleaned up on the server side. Express detects client disconnection through the `close` event on the response object:

```typescript
// cleanup.ts
req.on('close', () => {
  clearInterval(heartbeatInterval);
  // Mark any in-progress work for later retrieval
  // The pipeline continues running; results are saved to the database
});
```

The pipeline itself continues running even if the client disconnects. Results are persisted to MongoDB. The client can reconnect later and retrieve the completed analysis.

> **Practice Tip**
>
> Without SSE streaming, the user submits a contract and stares at a loading spinner for twenty-two minutes. With SSE streaming, they see: "Round 01: Intake... classifying contract... M&A Agreement identified." "Round 02: Deploying 16 specialists... MAC Analyst complete... IP Analyst complete... 14 of 16 done." "Round 03: Research... 8 agents searching... 40 queries executed... 18 citations found." The difference between a black box and a transparent process is the difference between abandonment and trust.

---

**Key Takeaways**

- SSE (Server-Sent Events) is a one-way server-to-client streaming protocol that provides real-time pipeline progress updates to the attorney's browser.
- Use SSE instead of WebSockets for pipeline streaming: it is one-way (which is all you need), uses standard HTTP (works through corporate firewalls), and supports automatic reconnection.
- Design a structured event taxonomy covering round starts, agent completions, research queries, citation discoveries, and pipeline completion.
- Send heartbeat events every 15 seconds to prevent network infrastructure from closing idle connections during long-running pipeline stages.
- The pipeline continues running even if the client disconnects. Results persist to the database for later retrieval.

\newpage

## 2M. Failure Modes

*How AI Systems Fail, and How to Build Systems That Fail Gracefully*

### Why Failure Modes Matter

AI systems fail differently than traditional software. A database query either returns data or throws an error. The error is visible, immediate, and unambiguous. An AI model can return confidently wrong output that looks correct, reads fluently, and passes superficial review. A hallucinated case citation is formatted exactly like a real case citation. A misapplied legal standard reads like a competent analysis. An incorrect dollar calculation appears in the same sentence structure as a correct one. The failure is invisible until someone with domain expertise examines the output carefully.

Understanding failure modes is how you build systems that fail gracefully instead of catastrophically. Every failure mode in this section has a corresponding defense: a design pattern, an architectural choice, or a validation step that either prevents the failure or detects it before it reaches the attorney.


### Dibia's Ten Failure Modes for AI Agents

Victor Dibia's taxonomy of agent failure modes, adapted for legal engineering:

**1. Insufficient instructions.** Generic prompts produce generic output. A Rung 1 prompt ("review this contract") produces analysis that is superficial, unfocused, and without actionable specificity. The defense is the Prompt Engineering Ladder (Section 2H): move from Rung 1 to at least Rung 3 for any production use, and Rung 4 for pipeline stages.

**2. Wrong model for the task.** Using a small, inexpensive model for complex legal reasoning. A model optimized for speed and cost (like Haiku) can classify contracts competently but cannot produce the depth of analysis required for MAC clause evaluation or indemnification risk assessment. The defense is model selection based on task complexity: use the most capable model (Opus) for analysis and generation stages. Reserve smaller models only for trivial filtering tasks where quality is not the priority.

**3. Mismatched instructions and model.** Prompts tuned for one model version used with a different version. Model behavior changes between versions. A prompt that produces structured JSON output reliably with one model version might produce free-text with a different version. The defense is prompt version control and regression testing: when you upgrade models, rerun your test suite and verify that output quality and format are preserved.

**4. Poor tool design.** General-purpose web search versus domain-specific legal research tools. A research agent using a generic search tool might retrieve law firm marketing pages and CLE summaries instead of actual case opinions and regulatory text. The defense is tool specialization: configure search tools with domain-specific instructions, provide the agent with guidance on evaluating source quality, and implement source filtering that deprioritizes non-authoritative results.

**5. Inability to determine task completion.** An agent that does not know when its analysis is "done." A research agent that keeps searching indefinitely, accumulating redundant results without convergence. The defense is explicit completion criteria in the prompt: "Conduct a maximum of 8 searches. Stop when you have found specific, citable authority for each specialist finding, or when 3 consecutive searches return no new relevant results."

**6. Wrong orchestration pattern.** Using sequential execution when parallel is needed, or vice versa. Running sixteen specialists sequentially (24 minutes) when they are independent and could run in parallel (90 seconds). Or running synthesis in parallel with research when synthesis depends on research results. The defense is dependency analysis: identify which stages depend on which upstream outputs, parallelize independent stages, and sequence dependent stages.

**7. No learning mechanism.** The pipeline makes the same mistake on every run. If the MAC specialist consistently misidentifies a particular carve-out structure, that error repeats on every contract because the pipeline has no mechanism to learn from corrections. The defense is prompt iteration: after every batch of analyses, review output quality, identify systematic errors, and refine prompts to address them. The learning happens in the prompts, not in the model.

**8. Lack of metacognition.** The agent does not review its own plan or recognize when it is stuck. A research agent that keeps searching with the same ineffective query instead of reformulating. The defense is explicit self-review instructions in the prompt: "After each search, evaluate whether the results address the specialist finding. If not, reformulate the query with different terms."

**9. Missing evaluation framework.** No systematic way to measure output quality. Without evaluation, you cannot distinguish a pipeline that produces good output from one that produces plausible-sounding but incorrect output. The defense is evaluation engineering (Chapter 7): automated scoring rubrics, judge models that evaluate output against criteria, and human review protocols for high-stakes analyses.

**10. Improper human delegation.** No risk-based escalation to attorney review. Every pipeline output should be reviewed by an attorney, but not every output requires the same level of review. A low-risk NDA analysis might need a five-minute scan. A high-risk M&A analysis with unusual provisions needs detailed clause-by-clause review. The defense is risk-based escalation: the pipeline assigns a confidence score to each finding, and findings below the confidence threshold are flagged for enhanced human review.


### Legal-Specific Failure Modes

Six failure modes that are specific to legal AI systems and have no direct analog in general-purpose AI:

**11. Hallucinated citations.** The model generates plausible but non-existent case names, statute numbers, or regulatory provisions. "Smith v. Delaware Holdings, Del. Ch., 2024" reads like a real case citation but may refer to no actual case. This is the most dangerous failure mode in legal AI because it can survive attorney review if the attorney does not verify every citation. The defense is research agents with web search tools (Section 2I): citations come from actual search results, not from the model's training data. Additionally, implement a citation verification step that checks every cited authority against a legal database. Any citation that cannot be verified is flagged as unconfirmed.

**12. Privilege breach.** The pipeline processes attorney-client privileged communications without flagging them. If a due diligence pipeline analyzes a batch of documents that includes privileged legal memos mixed with business contracts, and the pipeline processes them indistinguishably, privileged content may be exposed in the analysis output. The defense is a privilege screening stage at pipeline intake: before any analysis, a classifier identifies potentially privileged documents and routes them for attorney review before processing.

**13. Jurisdiction errors.** Applying Delaware law analysis to a contract governed by New York law. The MAC specialist prompt might reference Delaware Chancery standards, but if the contract is governed by New York law, those standards may not apply. The defense is intake classification: the first pipeline stage identifies the governing law, and all downstream agents receive this classification in their context with explicit instructions to apply the correct jurisdiction's legal standards.

**14. Stale law application.** The model relies on its training data for legal standards that have changed since the training cutoff. A regulation may have been amended, a landmark case may have been decided, or a market standard may have shifted. The defense is research agents with live web search: agents verify current law rather than relying on training-data knowledge. For critical legal standards, prompt instructions should explicitly require the agent to search for current authority rather than reasoning from memory.

**15. Unauthorized practice of law.** Pipeline output used without attorney supervision in a jurisdiction that requires it. If a pipeline is deployed to a client who uses it without attorney review, and that client makes legal decisions based on unreviewed AI output, the pipeline operator may face unauthorized practice allegations. The defense is architectural: the pipeline's output is framed as a draft for attorney review, not as legal advice. The frontend displays disclaimers. The workflow requires attorney sign-off before any output is sent to opposing counsel or used in legal proceedings.

**16. Cross-reference corruption.** Track Changes that break internal document references. If a directive inserts a new Section 4.3 into a contract, every downstream reference to "Section 4.3" (which previously referred to something different) is now incorrect. The defense is cross-reference validation: after OOXML surgery, a validation pass checks that all internal cross-references still resolve correctly and flags any that have been broken by the inserted changes.


### Graceful Degradation

The overarching principle for handling failure in legal engineering pipelines is **graceful degradation**: when a component fails, the system continues operating at reduced capacity rather than crashing entirely.

`Promise.allSettled()` is the primary mechanism. If one of sixteen specialists fails (network timeout, rate limit, unparseable output), the other fifteen results proceed through synthesis. The pipeline log records the failure, the synthesis agent works with fifteen specialist analyses instead of sixteen, and the output explicitly notes which domain was not analyzed.

Retry with exponential backoff handles transient failures. Rate limits, server overloads, and network glitches are temporary. Retrying after an increasing delay (1 second, 2 seconds, 4 seconds) resolves most transient failures without intervention.

Fallback responses handle tool failures. If a research agent's web search returns no results (search service outage, malformed query), the agent falls back to reasoning from training data and explicitly notes in its output that the analysis is based on training data rather than verified current sources.

Circuit breakers prevent cascading failures. If the Anthropic API is experiencing a widespread outage, sending hundreds of retry requests makes the situation worse. A circuit breaker detects repeated failures and stops sending requests for a cooldown period, preventing resource exhaustion and API abuse.

```typescript
// graceful-degradation.ts
// Pipeline with full graceful degradation
async function runResilientPipeline(
  contractText: string,
  specialists: SpecialistConfig[]
): Promise<PipelineResult> {
  // Run all specialists with graceful degradation
  const results = await Promise.allSettled(
    specialists.map(async specialist => {
      try {
        return await callWithRetry(
          () => runSpecialist(contractText, specialist),
          3 // max retries
        );
      } catch (error) {
        // Log the failure and return a degraded result
        console.error(`Specialist ${specialist.name} failed:`, error);
        return {
          specialistName: specialist.name,
          status: 'failed' as const,
          findings: [],
          error: (error as Error).message,
          fallbackNote: `${specialist.name} analysis unavailable. ` +
            `Manual review recommended for this domain.`
        };
      }
    })
  );

  // Separate successes and failures
  const successfulResults = results
    .filter((r): r is PromiseFulfilledResult<SpecialistResult> =>
      r.status === 'fulfilled'
    )
    .map(r => r.value);

  const failedSpecialists = results
    .filter(r => r.status === 'rejected')
    .length;

  // Continue pipeline with available results
  const synthesis = await synthesize(successfulResults);

  return {
    ...synthesis,
    completeness: `${successfulResults.length} of ${specialists.length} specialists completed`,
    missingDomains: failedSpecialists > 0
      ? `${failedSpecialists} specialist(s) failed. Review these domains manually.`
      : 'All specialists completed successfully'
  };
}
```

> **Warning**
>
> Never fail silently. Every failure, whether handled gracefully or not, must be logged, reported in the pipeline output, and visible to the reviewing attorney. A pipeline that silently drops a failed specialist's analysis and presents the remaining results as "complete" is misleading. The attorney does not know that the IP analysis is missing, does not know to review IP provisions manually, and may close a deal with an unreviewed IP exposure. Explicit failure reporting ("IP Specialist failed: analysis unavailable. Manual review recommended for IP provisions.") is not a deficiency. It is a safety feature.

---

**Key Takeaways**

- AI systems fail differently from traditional software: they can produce confidently wrong output that looks correct. Understanding failure modes is essential for building systems that fail gracefully.
- Dibia's ten failure modes cover insufficient instructions, wrong model selection, mismatched prompts, poor tools, unclear completion criteria, wrong orchestration, no learning mechanism, no metacognition, no evaluation, and improper human delegation.
- Six legal-specific failure modes: hallucinated citations, privilege breaches, jurisdiction errors, stale law, unauthorized practice, and cross-reference corruption.
- Graceful degradation through `Promise.allSettled()` ensures that individual component failures do not crash the entire pipeline. Fifteen of sixteen successful specialist analyses is a useful result.
- Never fail silently. Every failure must be logged, reported, and visible to the reviewing attorney. Explicit failure reporting is a safety feature, not a deficiency.

\newpage

## The Architecture Insight

This chapter taught you thirteen categories of building blocks: Claude Code for agentic development, TypeScript for type-safe code, APIs and servers and databases for infrastructure, the specific deployment platforms that legal engineering runs on, the Anthropic API for AI inference, context engineering for information curation, tokens for measurement and economics, prompts at five levels of sophistication, tools for extending AI beyond text generation, RAG for grounding output in your knowledge, OOXML for document delivery, SSE for real-time progress, and failure modes for resilient design.

Each building block is necessary. None is sufficient. TypeScript without the Claude API gives you type-safe code with no AI capability. The Claude API without OOXML gives you brilliant analysis with no deliverable format. OOXML without SSE gives you perfect documents with a black-box user experience. SSE without failure mode awareness gives you a transparent pipeline that crashes on the first transient error.

The real power emerges when you architect these components into multi-agent pipelines where specialized AI agents collaborate on a single task. The empirical evidence from TLE R&D makes this concrete. The same Claude Opus model analyzing the same 42,274-word M&A agreement produced 35 Track Changes with zero legal citations when used as a single prompt. Wrapped in a 26-agent, 6-round pipeline, it produced 138 Track Changes with 18 legal citations. A 3.9x improvement with zero change in model capability.

The model did not change. The contract did not change. What changed was the architecture: how the work was decomposed into specialized roles (prompts), how those roles were orchestrated in sequence and in parallel (TypeScript, Promise.allSettled), how external information was gathered (tools, RAG), how context was curated for each agent (context engineering), how progress was streamed to the user (SSE), how failures were tolerated (graceful degradation), and how the final output was delivered (OOXML). Every building block in this chapter contributed to that result.

Chapter 3 teaches project setup: how to scaffold a legal engineering project from zero using the conventions established here. Chapter 4 introduces the orchestration pattern taxonomy: the backautocrat, the diplomat, and the specific coordination patterns (sequential, parallel, fan-out/fan-in) that organize these building blocks into production pipelines. The remaining chapters of Part I complete the foundations with integration patterns, professional responsibility, and evaluation engineering. Part II applies everything to ten real legal workflows.

You now have the building blocks. The rest of this book teaches you to build.

---

**Chapter Key Takeaways**

- Claude Code is an autonomous development agent. CLAUDE.md files provide persistent institutional memory. Hooks enforce development policies. Use Claude Code to build the pipelines that call the Claude API at runtime.
- TypeScript's type system is the legal engineer's malpractice shield. Strict mode, interfaces, union types, generics, and type guards catch errors at compile time before they reach clients.
- APIs are the mechanical foundation of pipelines. API chaining (output of one call becomes input of the next) is the implementation pattern for every multi-agent architecture.
- The legal engineering deployment stack: Vercel (frontend), Render (backend), MongoDB Atlas (database), Cloudflare R2 (object storage), GitHub (version control and deployment trigger).
- The standard Anthropic client: `timeout: 3_600_000`, `output-128k-2025-02-19` beta, `context-1m-2025-08-07` beta. The standard call: `client.messages.stream()` plus `await stream.finalMessage()`. Cost formula: `(inputTokens * 15 + outputTokens * 75) / 1_000_000`.
- Context engineering determines output quality more than any other factor. Dynamic context windowing curates each agent's context for its specific task.
- Token consumption in multi-agent pipelines is multiplicative. The Meridian-Apex pipeline processed 2.81M input tokens across 27 calls for a $19.95 total cost.
- The Prompt Engineering Ladder: naive (5 words) through full pipeline (30,000+ words). Moving from Rung 1 to Rung 3 is the highest-leverage improvement. Rung 4 prompts require the domain expertise they encode.
- Tools (web search, file ops, database queries, code execution) and RAG (retrieval from curated knowledge bases) ground AI output in verifiable, current information. Research agents with tools produced 18 citations where a single prompt produced zero.
- OOXML is the last-mile solution. Track Changes in Word documents are the delivery format attorneys work in. Without OOXML, AI legal output does not integrate into the workflow.
- SSE streaming provides real-time pipeline progress that builds attorney trust. Heartbeats prevent connection timeouts. Pipeline results persist even if the client disconnects.
- Sixteen failure modes (ten general, six legal-specific) threaten legal AI systems. Graceful degradation via `Promise.allSettled()`, explicit failure reporting, and citation verification are the defenses.
- Both frontier model capability and pipeline architecture are essential. The same model produced 3.9x more Track Changes when wrapped in a 26-agent pipeline versus a single prompt. Build the architecture. Use the best model. That is Legal Engineering.

\newpage

\newpage

## 2I. Tools

*Tool Use, Function Calling, and Structured Outputs*

### What Tool Use Is

By default, a language model can only generate text. It cannot search the internet, query a database, read a file, send an email, or perform any action outside of text generation. Tool use (also called function calling) extends the model's capabilities by giving it the ability to invoke predefined functions during a conversation. The model decides when a tool is needed, generates a structured request to invoke it, your code executes the function, and the result is passed back to the model, which continues its response informed by the tool's output.

For legal engineering, tool use transforms Claude from a text generator into an agent that can take actions. A contract analysis agent can search for Delaware case law mid-analysis. A due diligence agent can query a document database to find related agreements. A compliance agent can check regulatory databases for relevant rules. The model does the reasoning; the tools provide the capabilities.


### How Tool Use Works

Tool use follows a four-step protocol:

1. **Define tools.** You describe the available tools to the model using a structured schema: the tool's name, what it does, and what parameters it accepts.
2. **Model decides.** Based on the conversation context, the model decides whether to use a tool and which one. This decision is not hardcoded; the model reasons about when a tool is helpful.
3. **Your code executes.** The model's tool use request is a structured JSON object containing the tool name and parameters. Your code receives this, calls the actual function, and captures the result.
4. **Model continues.** The tool result is passed back to the model as a `tool_result` message, and the model continues its response with the new information.

```typescript
// tool-use.ts
// Defining tools for a legal engineering pipeline
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

// Define the tools available to the agent
const tools: Anthropic.Tool[] = [
  {
    name: 'search_case_law',
    description: `Search for relevant case law by jurisdiction and topic. 
Returns case names, citations, and brief summaries of holdings. 
Use this when you need to cite legal authority for a recommendation.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        jurisdiction: {
          type: 'string',
          description: 'The jurisdiction to search (e.g., "Delaware", "Federal")'
        },
        query: {
          type: 'string',
          description: 'The legal topic or issue to search for'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default 5)'
        }
      },
      required: ['jurisdiction', 'query']
    }
  },
  {
    name: 'lookup_market_data',
    description: `Look up market data from the ABA Deal Points Studies or 
other market benchmark sources. Returns statistics about deal terms, 
frequencies, and ranges. Use this when you need market data to support 
a recommendation.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        dealType: {
          type: 'string',
          description: 'Type of deal (e.g., "public-ma", "private-ma", "vc")'
        },
        provision: {
          type: 'string',
          description: 'The contract provision to look up data for'
        }
      },
      required: ['dealType', 'provision']
    }
  },
  {
    name: 'calculate_deal_metric',
    description: `Calculate a deal-specific metric such as termination fee 
percentage, basket threshold, or cap amount based on equity value 
and market standard percentages.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        equityValue: {
          type: 'number',
          description: 'The total equity value of the deal in USD'
        },
        metric: {
          type: 'string',
          description: 'The metric to calculate (e.g., "termination_fee", "basket", "cap")'
        },
        percentage: {
          type: 'number',
          description: 'The percentage to apply (e.g., 0.03 for 3%)'
        }
      },
      required: ['equityValue', 'metric', 'percentage']
    }
  }
];
```


### The Tool Use Loop

When the model decides to use a tool, the response contains a `tool_use` content block instead of (or in addition to) a text block. Your code must detect this, execute the requested function, and continue the conversation with the result:

```typescript
// tool-use-loop.ts
// The complete tool use loop for a legal research agent

async function runAgentWithTools(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  let messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userPrompt }
  ];

  // Loop until the model stops requesting tools
  while (true) {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 128_000,
      system: systemPrompt,
      tools,
      messages
    });

    // If the model is done (no more tool calls), extract and return text
    if (response.stop_reason === 'end_turn') {
      const text = response.content
        .find(c => c.type === 'text')?.text ?? '';
      return text;
    }

    // Process any tool use requests
    const toolUseBlocks = response.content
      .filter(c => c.type === 'tool_use');

    if (toolUseBlocks.length === 0) {
      // No tool use and not end_turn — extract whatever text is available
      const text = response.content
        .find(c => c.type === 'text')?.text ?? '';
      return text;
    }

    // Add the assistant's response (including tool_use blocks) to messages
    messages.push({ role: 'assistant', content: response.content });

    // Execute each tool and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      if (block.type !== 'tool_use') continue;
      const result = await executeToolCall(block.name, block.input);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result)
      });
    }

    // Add tool results to messages and continue the loop
    messages.push({ role: 'user', content: toolResults });
  }
}

// Dispatch tool calls to actual implementations
async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case 'search_case_law':
      return await searchCaseLaw(
        input.jurisdiction as string,
        input.query as string,
        (input.maxResults as number) ?? 5
      );
    case 'lookup_market_data':
      return await lookupMarketData(
        input.dealType as string,
        input.provision as string
      );
    case 'calculate_deal_metric':
      return await calculateDealMetric(
        input.equityValue as number,
        input.metric as string,
        input.percentage as number
      );
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" style="font-family: system-ui, sans-serif;">
  <!-- Background -->
  <rect width="800" height="400" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Figure 2I.1 — The Tool Use Loop: Model ↔ Code ↔ External Services</text>

  <!-- Your Code box -->
  <rect x="280" y="60" width="240" height="60" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="400" y="88" text-anchor="middle" fill="#16a085" font-size="14" font-weight="bold">Your Pipeline Code</text>
  <text x="400" y="106" text-anchor="middle" fill="white" font-size="11">Defines tools, executes calls</text>

  <!-- Claude API box -->
  <rect x="280" y="170" width="240" height="60" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="400" y="198" text-anchor="middle" fill="#f39c12" font-size="14" font-weight="bold">Claude API</text>
  <text x="400" y="216" text-anchor="middle" fill="white" font-size="11">Reasons, decides to use tools</text>

  <!-- External Services -->
  <rect x="40" y="300" width="160" height="55" rx="6" fill="#2a2a4e" stroke="#16a085" stroke-width="1"/>
  <text x="120" y="325" text-anchor="middle" fill="white" font-size="11">Case Law DB</text>
  <text x="120" y="342" text-anchor="middle" fill="white" font-size="10" opacity="0.7">search_case_law</text>

  <rect x="320" y="300" width="160" height="55" rx="6" fill="#2a2a4e" stroke="#16a085" stroke-width="1"/>
  <text x="400" y="325" text-anchor="middle" fill="white" font-size="11">Market Data</text>
  <text x="400" y="342" text-anchor="middle" fill="white" font-size="10" opacity="0.7">lookup_market_data</text>

  <rect x="600" y="300" width="160" height="55" rx="6" fill="#2a2a4e" stroke="#16a085" stroke-width="1"/>
  <text x="680" y="325" text-anchor="middle" fill="white" font-size="11">Calculator</text>
  <text x="680" y="342" text-anchor="middle" fill="white" font-size="10" opacity="0.7">calculate_deal_metric</text>

  <!-- Arrows: Code ↔ Claude -->
  <line x1="360" y1="120" x2="360" y2="170" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmberI)"/>
  <text x="340" y="150" text-anchor="end" fill="white" font-size="10">prompt + tools</text>

  <line x1="440" y1="170" x2="440" y2="120" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTealI)"/>
  <text x="460" y="150" fill="white" font-size="10">tool_use request</text>

  <!-- Arrows: Code → Services -->
  <line x1="320" y1="120" x2="150" y2="300" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealI)"/>
  <line x1="400" y1="120" x2="400" y2="300" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealI)"/>
  <line x1="480" y1="120" x2="650" y2="300" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealI)"/>

  <!-- Loop indicator -->
  <path d="M 520 90 C 600 90, 600 200, 520 200" fill="none" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arrowAmberI)"/>
  <text x="590" y="150" fill="#f39c12" font-size="10">loop until</text>
  <text x="590" y="163" fill="#f39c12" font-size="10">end_turn</text>

  <defs>
    <marker id="arrowTealI" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmberI" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>
</svg>
```


### Tool Use in Legal Engineering Pipelines

Three categories of tools appear frequently in legal engineering:

**Research tools** give the model access to legal databases, case law search engines, and regulatory repositories. A research agent analyzing an M&A agreement can search for Delaware MAC case law, look up SEC filing requirements, and retrieve ABA market benchmarks, all during its analysis. The 18 legal citations in the TLE R&D experiment came from research tool calls.

**Calculation tools** perform precise mathematical operations that the model should not attempt internally. Token cost calculations, percentage-of-equity computations, deadline calculations, and pro-rata allocations are all better handled by deterministic code than by a probabilistic language model. The model calls the tool with the parameters, receives the exact result, and incorporates it into its analysis.

**Data retrieval tools** access the pipeline's own data stores. A synthesis agent can query MongoDB for the current analysis's specialist findings. A quality reviewer can retrieve the prior version of a contract for comparison. A portfolio analytics agent can query across all analyses for a given client to identify patterns.

> **Warning**
>
> Tool definitions must be precise. A vague tool description causes the model to invoke the tool inappropriately or not at all. "Search for legal information" is too vague. "Search for relevant case law by jurisdiction and topic. Returns case names, citations, and brief summaries of holdings. Use this when you need to cite legal authority for a recommendation." is specific enough for the model to use the tool correctly. Treat tool descriptions with the same precision you treat system prompts.


### Web Search Tool

Anthropic provides a built-in web search tool that gives the model access to live internet search. This is distinct from the custom tools defined above; it is a first-party tool that Anthropic maintains. For legal engineering, the web search tool enables research agents to find current case law, recent regulatory changes, and up-to-date market data:

```typescript
// web-search-tool.ts
// Using Claude's built-in web search for legal research
const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 128_000,
  tools: [
    {
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 10
    }
  ],
  messages: [{
    role: 'user',
    content: `Research the current state of Delaware law on Material Adverse 
Change definitions in public company M&A transactions. Focus on:
1. Recent Chancery Court decisions since Akorn v. Fresenius (2018)
2. Current market standard for MAC carve-outs per ABA data
3. SEC guidance on disclosure requirements related to MAC triggers

Cite every source with full case name, court, year, and key holding.`
  }]
});
```

The web search tool is particularly valuable for research agents that need to verify current legal standards. Case law evolves. Regulatory guidance changes. Market benchmarks shift year over year. A prompt that contains static legal citations from the model's training data may be citing outdated or superseded authority. The web search tool solves this by retrieving current information at the time of analysis.


### When to Use Tools vs. Context

A common design question: should a specialist receive market benchmarks through its system prompt (static context) or through a tool call (dynamic retrieval)?

The answer depends on freshness and volume. If the benchmarks change rarely and the full dataset is small enough to include in the prompt (under 5,000 tokens), put them in the context. The model has immediate access without the latency of a tool call. If the benchmarks change frequently, or if the full dataset is too large for the context window, use a tool. The model retrieves only the relevant subset, and the data is current.

| Factor | Use Context | Use Tool |
|---|---|---|
| Freshness | Stable (updated quarterly or less) | Dynamic (changes daily or per-session) |
| Volume | Small (under 5,000 tokens) | Large (full dataset exceeds context budget) |
| Specificity | Universal (applies to every analysis) | Targeted (only relevant in specific cases) |
| Latency | Zero (already in the prompt) | Adds 1-5 seconds per tool call |

For most legal engineering pipelines, playbook content goes in the context (it is stable and universally applicable), while case law citations and market data go through tools (they need to be current and are retrieved only when relevant to a specific finding).

---

**Key Takeaways**

- Tool use extends Claude from a text generator to an agent that can take actions: searching databases, performing calculations, retrieving data, and interacting with external services.
- The tool use loop repeats until the model stops requesting tools: prompt → model decides to use tool → your code executes the function → result passed back → model continues.
- Three tool categories dominate legal engineering: research (case law, regulations, market data), calculation (deal metrics, cost tracking), and data retrieval (pipeline data stores, document databases).
- Tool descriptions must be precise. Vague descriptions cause incorrect or missed tool invocations.
- The built-in web search tool enables research agents to retrieve current case law and market data, preventing reliance on potentially outdated training data.
- Use static context for stable, universally applicable information (playbooks). Use tools for dynamic, targeted information (live case law search, current market data).

\newpage

## 2J. Retrieval-Augmented Generation (RAG)

*Grounding AI in Your Legal Knowledge Base*

### The Problem RAG Solves

A language model knows what was in its training data. It does not know what is in your firm's document management system, your client's contract portfolio, your proprietary playbooks, your internal precedent database, or the case law published after its training cutoff. When the model analyzes a contract and recommends language "consistent with precedent," it draws on general patterns from its training, not on the specific precedent your firm has negotiated across hundreds of similar deals.

Retrieval-Augmented Generation (RAG) solves this by retrieving relevant documents from your knowledge base and including them in the model's context at inference time. The model does not need to have been trained on your firm's NDAs to analyze one in your style. It needs to have three or four of your prior NDAs in its context window, retrieved automatically based on relevance to the current document.

RAG is the mechanism that gives your pipeline institutional memory. Without RAG, every analysis starts from the model's general knowledge. With RAG, every analysis starts from your specific knowledge: your precedents, your negotiation positions, your preferred language, your accumulated institutional wisdom.


### How RAG Works

RAG is a three-stage process: index, retrieve, generate.

**Stage 1: Index.** Convert your documents into numerical representations (embeddings) that capture semantic meaning. Store these embeddings in a vector database alongside the original text. This is a one-time operation per document (with updates when documents change).

**Stage 2: Retrieve.** When a new contract arrives for analysis, convert the relevant query (or the contract itself) into an embedding and search the vector database for the most similar documents. The database returns the documents most semantically relevant to the current analysis.

**Stage 3: Generate.** Include the retrieved documents in the model's context alongside the contract being analyzed. The model generates its analysis informed by both its general knowledge and the specific precedents from your knowledge base.

```typescript
// rag-pipeline.ts
// RAG for a legal engineering pipeline

// Stage 1: Index documents into a vector database
async function indexDocument(
  document: LegalDocument
): Promise<void> {
  // Split the document into chunks (each chunk becomes a retrieval unit)
  const chunks = splitIntoChunks(document.text, {
    maxChunkTokens: 1_000,
    overlapTokens: 200  // Overlap ensures context is not lost at boundaries
  });

  // Generate embeddings for each chunk
  const embeddings = await Promise.all(
    chunks.map(async (chunk, index) => {
      const embedding = await generateEmbedding(chunk.text);
      return {
        id: `${document.id}-chunk-${index}`,
        embedding,
        text: chunk.text,
        metadata: {
          documentId: document.id,
          documentTitle: document.title,
          vertical: document.vertical,
          section: chunk.sectionTitle,
          chunkIndex: index
        }
      };
    })
  );

  // Store in the vector database
  await vectorDb.upsert(embeddings);
}

// Stage 2: Retrieve relevant documents for a new analysis
async function retrievePrecedents(
  contractText: string,
  vertical: ContractVertical,
  topK: number = 10
): Promise<RetrievedChunk[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(
    `Find precedent language and negotiation positions for a ${vertical} ` +
    `agreement similar to: ${contractText.slice(0, 2000)}`
  );

  // Search the vector database
  const results = await vectorDb.query({
    vector: queryEmbedding,
    topK,
    filter: { vertical }  // Only retrieve from the same contract vertical
  });

  return results.map(r => ({
    text: r.text,
    documentTitle: r.metadata.documentTitle,
    section: r.metadata.section,
    similarityScore: r.score
  }));
}

// Stage 3: Include retrieved precedents in the analysis prompt
async function analyzeWithPrecedents(
  contractText: string,
  vertical: ContractVertical
): Promise<AnalysisResult> {
  // Retrieve relevant precedents
  const precedents = await retrievePrecedents(contractText, vertical);

  // Assemble the prompt with retrieved context
  const prompt = `You are analyzing a ${vertical} agreement. The following 
precedent clauses and negotiation positions from prior engagements are relevant 
to your analysis. Reference them where applicable, noting when the current 
contract deviates from established precedent.

## Precedent Database (${precedents.length} relevant excerpts)

${precedents.map((p, i) =>
  `### Precedent ${i + 1} (from: ${p.documentTitle}, Section: ${p.section})
${p.text}`
).join('\n\n')}

## Contract Under Analysis

${contractText}

Analyze this contract against the precedents above. For each material 
deviation from precedent, explain the deviation, assess its risk, and 
recommend whether to accept, reject, or negotiate.`;

  const { text } = await callClaude(systemPrompt, prompt);
  return parseAnalysis(text);
}
```


### Chunking Strategies for Legal Documents

How you split documents into chunks determines the quality of retrieval. Legal documents have natural structural boundaries (sections, subsections, articles) that should be respected.

```typescript
// chunking.ts
// Legal document chunking strategies

// Strategy 1: Section-based chunking (preferred for contracts)
function chunkBySection(
  contractText: string
): DocumentChunk[] {
  // Split on section headers (e.g., "Section 7.2", "ARTICLE III")
  const sectionPattern = /(?=(?:Section|SECTION|Article|ARTICLE)\s+[\d]+)/;
  const sections = contractText.split(sectionPattern);

  return sections
    .filter(s => s.trim().length > 0)
    .map((text, index) => {
      const titleMatch = text.match(
        /^((?:Section|SECTION|Article|ARTICLE)\s+[\d.]+[^\n]*)/
      );
      return {
        text: text.trim(),
        sectionTitle: titleMatch?.[1]?.trim() ?? `Section ${index + 1}`,
        tokenEstimate: estimateTokenCount(text)
      };
    });
}

// Strategy 2: Sliding window with overlap (for long narrative sections)
function chunkBySlidingWindow(
  text: string,
  maxTokens: number = 1_000,
  overlapTokens: number = 200
): DocumentChunk[] {
  const words = text.split(/\s+/);
  const chunks: DocumentChunk[] = [];
  const wordsPerChunk = Math.floor(maxTokens / 1.5);
  const overlapWords = Math.floor(overlapTokens / 1.5);

  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + wordsPerChunk, words.length);
    const chunkText = words.slice(start, end).join(' ');
    chunks.push({
      text: chunkText,
      sectionTitle: `Chunk ${chunks.length + 1}`,
      tokenEstimate: estimateTokenCount(chunkText)
    });
    start = end - overlapWords;
    if (start >= words.length) break;
  }

  return chunks;
}
```

> **Practice Tip**
>
> For legal documents, always prefer section-based chunking over sliding-window chunking. Legal clauses are self-contained units of meaning. A termination provision, an indemnification clause, and a MAC definition each have internal coherence that is destroyed by arbitrary window boundaries. Section-based chunking preserves this coherence, and the retrieval system returns complete, meaningful provisions rather than fragments that start or end mid-sentence.


### Embedding Models

Embeddings are numerical representations of text that capture semantic meaning. Two pieces of text with similar meaning produce similar embeddings, regardless of whether they use the same words. "The seller shall indemnify the buyer" and "Vendor agrees to hold Customer harmless" produce similar embeddings because they express the same legal concept, even though they share almost no vocabulary.

For legal engineering, use a high-quality embedding model that captures the nuance of legal language. The choice of embedding model is less critical than the choice of generation model (embeddings are a mature technology with less variance between options), but quality still matters. Common options include:

```typescript
// embeddings.ts
// Generate embeddings using Anthropic's Voyager or OpenAI's Ada
import { Anthropic } from '@anthropic-ai/sdk';

// Option 1: Use an external embedding API
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 1536
    })
  });

  const data = await response.json();
  return data.data[0].embedding;
}
```


### Vector Databases

Vector databases store embeddings and support similarity search. When you query with a new embedding, the database returns the stored embeddings (and their associated text) that are most similar, measured by cosine similarity or dot product.

For legal engineering, the vector database options include managed services (Pinecone, Weaviate Cloud) and self-hosted solutions (pgvector as a PostgreSQL extension, Chroma for local development). The choice depends on scale: for prototyping and small knowledge bases (under 10,000 documents), a local Chroma instance is sufficient. For production systems with large document collections, a managed service provides better performance and reliability.

```typescript
// vector-db.ts
// Vector database interface (works with any backend)
interface VectorDatabase {
  upsert(documents: EmbeddedDocument[]): Promise<void>;
  query(params: {
    vector: number[];
    topK: number;
    filter?: Record<string, string>;
  }): Promise<QueryResult[]>;
  delete(ids: string[]): Promise<void>;
}

interface EmbeddedDocument {
  id: string;
  embedding: number[];
  text: string;
  metadata: Record<string, string>;
}

interface QueryResult {
  id: string;
  text: string;
  metadata: Record<string, string>;
  score: number;  // Similarity score (0 to 1)
}
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 380" style="font-family: system-ui, sans-serif;">
  <!-- Background -->
  <rect width="800" height="380" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Figure 2J.1 — RAG Pipeline: Index → Retrieve → Generate</text>

  <!-- Index phase -->
  <rect x="30" y="60" width="220" height="270" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="140" y="85" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">1. INDEX (One-time)</text>

  <rect x="50" y="100" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#16a085" stroke-width="1"/>
  <text x="140" y="122" text-anchor="middle" fill="white" font-size="11">Your Documents</text>

  <line x1="140" y1="135" x2="140" y2="155" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealJ)"/>

  <rect x="50" y="155" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#16a085" stroke-width="1"/>
  <text x="140" y="177" text-anchor="middle" fill="white" font-size="11">Chunk + Embed</text>

  <line x1="140" y1="190" x2="140" y2="210" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealJ)"/>

  <rect x="50" y="210" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="140" y="232" text-anchor="middle" fill="#f39c12" font-size="11">Vector Database</text>

  <!-- Retrieve phase -->
  <rect x="290" y="60" width="220" height="270" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="400" y="85" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">2. RETRIEVE (Per query)</text>

  <rect x="310" y="100" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="400" y="122" text-anchor="middle" fill="white" font-size="11">New Contract</text>

  <line x1="400" y1="135" x2="400" y2="155" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrowAmberJ)"/>

  <rect x="310" y="155" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="400" y="177" text-anchor="middle" fill="white" font-size="11">Embed Query</text>

  <line x1="400" y1="190" x2="400" y2="210" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrowAmberJ)"/>

  <rect x="310" y="210" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="400" y="232" text-anchor="middle" fill="white" font-size="11">Similarity Search</text>

  <text x="400" y="275" text-anchor="middle" fill="white" font-size="10">Returns top-K precedents</text>

  <!-- Generate phase -->
  <rect x="550" y="60" width="220" height="270" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="660" y="85" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">3. GENERATE</text>

  <rect x="570" y="100" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#16a085" stroke-width="1"/>
  <text x="660" y="122" text-anchor="middle" fill="white" font-size="11">Contract + Precedents</text>

  <line x1="660" y1="135" x2="660" y2="155" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealJ)"/>

  <rect x="570" y="155" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="660" y="177" text-anchor="middle" fill="#f39c12" font-size="11">Claude Opus</text>

  <line x1="660" y1="190" x2="660" y2="210" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealJ)"/>

  <rect x="570" y="210" width="180" height="35" rx="4" fill="#1a1a2e" stroke="#16a085" stroke-width="1"/>
  <text x="660" y="232" text-anchor="middle" fill="white" font-size="11">Precedent-Informed Analysis</text>

  <!-- Connecting arrows between phases -->
  <line x1="250" y1="227" x2="290" y2="227" stroke="#16a085" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowTealJ)"/>
  <line x1="510" y1="175" x2="550" y2="175" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrowAmberJ)"/>

  <defs>
    <marker id="arrowTealJ" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmberJ" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>
</svg>
```


### RAG for Legal Engineering: Practical Applications

**Precedent-Informed Drafting.** When drafting a new SaaS agreement, retrieve the five most similar SaaS agreements from your knowledge base. Include them in the drafter's context so it can reference your firm's preferred language for key provisions rather than generating from general knowledge.

**Negotiation Playbook Retrieval.** Store negotiation playbooks organized by vertical and party position. When analyzing a contract, retrieve the relevant playbook sections based on the contract type and the identified issues. The analyzer receives targeted negotiation guidance without the entire playbook consuming context.

**Knowledge Base Q&A.** Allow attorneys to ask natural language questions about your document collection: "What survival periods have we negotiated on private M&A deals in the last two years?" RAG retrieves the relevant contracts, and the model synthesizes the answer from actual data rather than general knowledge.

> **Insight**
>
> RAG is most valuable when your organization has accumulated institutional knowledge that differs from general market practice. A firm that has negotiated hundreds of SaaS agreements has evolved preferred positions, standard fallback language, and historical data that no public model has access to. RAG makes that accumulated knowledge available to every analysis, every time. The model does not replace your institutional knowledge. It amplifies it.

---

**Key Takeaways**

- RAG grounds AI analysis in your specific knowledge base rather than general model training data. It enables precedent-informed analysis, playbook retrieval, and institutional memory.
- RAG is a three-stage process: index documents into a vector database, retrieve relevant documents for each new analysis, and include them in the generation prompt.
- Section-based chunking preserves the self-contained meaning of legal clauses. Prefer it over sliding-window chunking for contract documents.
- Vector databases store embeddings and support similarity search. Use managed services (Pinecone, Weaviate) for production and local solutions (Chroma, pgvector) for development.
- RAG is most valuable when your organization's institutional knowledge differs from general market practice. It amplifies accumulated expertise rather than replacing it.

\newpage

## 2K. OOXML

*Office Open XML, Track Changes Surgery, and DOCX Manipulation*

### Why OOXML Matters

Lawyers work in Word. Not Google Docs, not plain text, not Markdown, not PDF. Microsoft Word, specifically the .docx format. Every contract, every brief, every memo, every letter exists as a .docx file. The legal profession's standard for communicating edits to a contract is Track Changes: red text for deletions, blue or colored text for insertions, marginal comments explaining the reasoning. A contract analysis pipeline that produces plain text suggestions is academically interesting. A pipeline that produces a Word document with proper Track Changes that the attorney opens in Word and sees as a marked-up draft, that is a professional tool.

This is the capability that separates a legal engineering pipeline from a chatbot. ChatGPT can tell you what to change in a contract. A legal engineering pipeline produces the changed document, formatted exactly as the attorney expects, with Track Changes that Word renders natively. The attorney opens the file, sees red and blue markup, accepts or rejects each change, and sends the redlined document to opposing counsel. No copy-pasting. No reformatting. No manual transcription of AI suggestions into the document.

OOXML (Office Open XML) is the file format that makes this possible. A .docx file is a ZIP archive containing XML files that describe the document's content, formatting, styles, and metadata. Track Changes are represented as XML elements within the document's content layer. Creating a redlined document means performing surgery on this XML: inserting, deleting, and wrapping elements to produce the precise Track Changes markup that Word expects.


### Inside a DOCX File

Rename any .docx file to .zip and extract it. Inside, you will find a directory structure:

```
document.docx (renamed to .zip)
├── [Content_Types].xml
├── _rels/
│   └── .rels
├── word/
│   ├── document.xml          ← The document's content lives here
│   ├── styles.xml            ← Style definitions (fonts, spacing, etc.)
│   ├── numbering.xml         ← Numbered list configurations
│   ├── settings.xml          ← Document settings
│   ├── fontTable.xml         ← Font declarations
│   └── _rels/
│       └── document.xml.rels ← Relationships between content parts
└── docProps/
    ├── core.xml              ← Author, title, dates
    └── app.xml               ← Application-level metadata
```

The file that matters for legal engineering is `word/document.xml`. This file contains every paragraph, every run of text, every formatting instruction, and every Track Change in the document. Understanding its structure is essential for producing documents that Word renders correctly.


### The XML Structure of Document Content

Document content in OOXML follows a hierarchy: the document body contains paragraphs, paragraphs contain runs, and runs contain text. Every piece of text in a Word document lives inside this structure.

```xml
<!-- word/document.xml — simplified structure -->
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <!-- A paragraph -->
    <w:p>
      <!-- Paragraph properties (style, alignment, spacing) -->
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <!-- A run of text within the paragraph -->
      <w:r>
        <!-- Run properties (bold, italic, font, size) -->
        <w:rPr>
          <w:b/>
        </w:rPr>
        <!-- The actual text -->
        <w:t>ARTICLE I - DEFINITIONS</w:t>
      </w:r>
    </w:p>

    <!-- Another paragraph with multiple runs -->
    <w:p>
      <w:r>
        <w:t xml:space="preserve">The term "</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>Confidential Information</w:t>
      </w:r>
      <w:r>
        <w:t xml:space="preserve">" shall mean all non-public information.</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>
```

Notice that a single sentence ("The term 'Confidential Information' shall mean all non-public information.") is split across three runs because the middle word is bold. Every formatting change creates a new run. This means that searching for text in a DOCX file is not a simple string search. The text "Confidential Information" does not appear as a continuous string in the XML. It appears as two separate `<w:t>` elements inside two separate `<w:r>` elements, one with bold formatting and one without.


### Track Changes in OOXML

Track Changes are represented by wrapping text elements in revision markup. An insertion wraps text in `<w:ins>`. A deletion wraps text in `<w:del>` and changes the text element from `<w:t>` to `<w:delText>`. Each revision carries metadata: who made the change, when they made it, and a unique revision ID.

```xml
<!-- Track Change: Deletion -->
<w:del w:id="1" w:author="AI Pipeline" w:date="2026-03-16T10:30:00Z">
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman"/>
      <w:strike/>
      <w:color w:val="FF0000"/>
    </w:rPr>
    <w:delText xml:space="preserve">commercially reasonable efforts</w:delText>
  </w:r>
</w:del>

<!-- Track Change: Insertion -->
<w:ins w:id="2" w:author="AI Pipeline" w:date="2026-03-16T10:30:00Z">
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman"/>
      <w:color w:val="0000FF"/>
      <w:u w:val="single"/>
    </w:rPr>
    <w:t xml:space="preserve">best efforts</w:t>
  </w:r>
</w:ins>
```

The combination of a deletion followed by an insertion is a substitution: the old text is struck through in red, and the new text appears underlined in blue. When an attorney opens this document in Word and enables Track Changes view, they see exactly the markup they expect.


### Performing Track Changes Surgery in TypeScript

The practical challenge of producing Track Changes programmatically is finding the correct location in the XML for each change. A directive from the pipeline might say: "In Section 5.3(b), replace 'commercially reasonable efforts' with 'best efforts'." Your code must:

1. Parse the DOCX ZIP archive to extract `document.xml`.
2. Parse the XML into a traversable DOM structure.
3. Find the text "commercially reasonable efforts" across potentially fragmented runs.
4. Wrap the found text in `<w:del>` markup.
5. Insert the new text in `<w:ins>` markup immediately after the deletion.
6. Repackage the modified XML back into a valid DOCX ZIP archive.

```typescript
// ooxml-surgery.ts
// Track Changes surgery on a DOCX file
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

interface TrackChangeDirective {
  originalText: string;
  replacementText: string;
  author: string;
  comment?: string;
}

async function applyTrackChanges(
  docxBuffer: Buffer,
  directives: TrackChangeDirective[]
): Promise<Buffer> {
  // Extract the DOCX (ZIP) archive
  const zip = await JSZip.loadAsync(docxBuffer);
  const documentXml = await zip.file('word/document.xml')!
    .async('string');

  // Parse the XML
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'application/xml');

  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  let revisionId = 100;  // Start revision IDs at 100 to avoid conflicts

  // Apply each directive
  for (const directive of directives) {
    const timestamp = new Date().toISOString();

    // Find all text nodes and concatenate to search for the target text
    const paragraphs = doc.getElementsByTagNameNS(W_NS, 'p');

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i]!;
      const fullText = extractParagraphText(para, W_NS);

      if (!fullText.includes(directive.originalText)) continue;

      // Found the paragraph containing the target text
      // Now perform the surgery: wrap original in <w:del>, insert new in <w:ins>
      performSubstitution(
        doc, para, W_NS,
        directive.originalText,
        directive.replacementText,
        directive.author,
        timestamp,
        revisionId++
      );
      break;  // Apply each directive once
    }
  }

  // Serialize the modified XML back
  const serializer = new XMLSerializer();
  const modifiedXml = serializer.serializeToString(doc);

  // Replace the document.xml in the ZIP archive
  zip.file('word/document.xml', modifiedXml);

  // Generate the new DOCX buffer
  return Buffer.from(await zip.generateAsync({ type: 'arraybuffer' }));
}

// Extract concatenated text from a paragraph's runs
function extractParagraphText(
  paragraph: Element,
  ns: string
): string {
  const runs = paragraph.getElementsByTagNameNS(ns, 'r');
  let text = '';
  for (let i = 0; i < runs.length; i++) {
    const textNodes = runs[i]!.getElementsByTagNameNS(ns, 't');
    for (let j = 0; j < textNodes.length; j++) {
      text += textNodes[j]!.textContent ?? '';
    }
  }
  return text;
}
```

> **Warning**
>
> OOXML Track Changes surgery is the most fragile operation in any legal engineering pipeline. The XML structure of a Word document is intricate and unforgiving. A malformed namespace, a missing attribute, or an element in the wrong position can cause Word to report the document as corrupt. Always validate your output by opening the generated DOCX in Word before delivering it to a client. Automated testing with a document corpus is essential.


### Comments in OOXML

Track Changes and comments serve different purposes. Track Changes show what to modify in the contract text. Comments explain why. A proper redlined document has both: the markup shows the change, and the comment provides the attorney's reasoning, the legal authority, and the market context.

Comments in OOXML are stored separately from the document content, in a `word/comments.xml` file. The document text references a comment through `<w:commentRangeStart>` and `<w:commentRangeEnd>` elements that mark the span of text the comment applies to, and a `<w:commentReference>` element that links to the comment's content.

```xml
<!-- In word/document.xml — comment anchoring -->
<w:commentRangeStart w:id="10"/>
<w:r>
  <w:t>commercially reasonable efforts</w:t>
</w:r>
<w:commentRangeEnd w:id="10"/>
<w:r>
  <w:rPr>
    <w:rStyle w:val="CommentReference"/>
  </w:rPr>
  <w:commentReference w:id="10"/>
</w:r>

<!-- In word/comments.xml — comment content -->
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:comment w:id="10" w:author="AI Pipeline" w:date="2026-03-16T10:30:00Z">
    <w:p>
      <w:r>
        <w:t>Revised from "commercially reasonable" to "best efforts" to 
strengthen buyer protection. "Best efforts" imposes a higher obligation 
under Delaware law. See Bloor v. Falstaff Brewing (2d Cir. 1979) 
(distinguishing "best efforts" from "reasonable efforts").</w:t>
      </w:r>
    </w:p>
  </w:comment>
</w:comments>
```

The relationship between comments and the document text is fragile. The `w:id` must be unique and must match between the `commentRangeStart`, `commentRangeEnd`, `commentReference`, and the comment element in `comments.xml`. If any of these IDs do not match, Word will not display the comment or may report the document as corrupt.


### The Complete DOCX Generation Pipeline

The full flow from pipeline directives to a downloadable DOCX file:

```typescript
// docx-generation.ts
// Complete flow: directives → OOXML surgery → downloadable DOCX

async function generateRedlinedDocument(
  originalDocxBuffer: Buffer,
  directives: PipelineDirective[]
): Promise<Buffer> {
  // Convert pipeline directives to Track Change directives
  const trackChanges: TrackChangeDirective[] = directives.map(d => ({
    originalText: d.originalText,
    replacementText: d.suggestedLanguage,
    author: 'TLE Pipeline',
    comment: formatComment(d)
  }));

  // Apply Track Changes to the original document
  const redlinedBuffer = await applyTrackChanges(
    originalDocxBuffer,
    trackChanges
  );

  return redlinedBuffer;
}

// Format a directive's reasoning into a comment
function formatComment(directive: PipelineDirective): string {
  const parts: string[] = [];
  parts.push(directive.finding);
  if (directive.authority) {
    parts.push(`Authority: ${directive.authority}`);
  }
  if (directive.dollarExposure) {
    parts.push(`Exposure: $${directive.dollarExposure.toLocaleString()}`);
  }
  return parts.join(' | ');
}
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" style="font-family: system-ui, sans-serif;">
  <!-- Background -->
  <rect width="800" height="320" fill="#1a1a2e"/>

  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Figure 2K.1 — DOCX Generation: Directives → OOXML Surgery → Word Document</text>

  <!-- Pipeline Directives -->
  <rect x="30" y="100" width="155" height="120" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="107" y="130" text-anchor="middle" fill="#16a085" font-size="12" font-weight="bold">Directives</text>
  <text x="107" y="150" text-anchor="middle" fill="white" font-size="10">originalText</text>
  <text x="107" y="165" text-anchor="middle" fill="white" font-size="10">suggestedLanguage</text>
  <text x="107" y="180" text-anchor="middle" fill="white" font-size="10">finding + authority</text>
  <text x="107" y="195" text-anchor="middle" fill="white" font-size="10">riskLevel</text>

  <!-- Original DOCX -->
  <rect x="220" y="60" width="155" height="55" rx="6" fill="#2a2a4e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="297" y="85" text-anchor="middle" fill="#f39c12" font-size="12" font-weight="bold">Original DOCX</text>
  <text x="297" y="102" text-anchor="middle" fill="white" font-size="10">document.xml</text>

  <!-- OOXML Surgery -->
  <rect x="220" y="140" width="155" height="80" rx="8" fill="#2a2a4e" stroke="#f39c12" stroke-width="2"/>
  <text x="297" y="168" text-anchor="middle" fill="#f39c12" font-size="12" font-weight="bold">OOXML Surgery</text>
  <text x="297" y="188" text-anchor="middle" fill="white" font-size="10">Find text in XML</text>
  <text x="297" y="203" text-anchor="middle" fill="white" font-size="10">Wrap in del/ins</text>

  <!-- Comments -->
  <rect x="420" y="140" width="155" height="80" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="497" y="168" text-anchor="middle" fill="#16a085" font-size="12" font-weight="bold">Comments</text>
  <text x="497" y="188" text-anchor="middle" fill="white" font-size="10">comments.xml</text>
  <text x="497" y="203" text-anchor="middle" fill="white" font-size="10">Reasoning + citations</text>

  <!-- Redlined DOCX -->
  <rect x="615" y="100" width="155" height="120" rx="8" fill="#2a2a4e" stroke="#16a085" stroke-width="2"/>
  <text x="692" y="130" text-anchor="middle" fill="#16a085" font-size="12" font-weight="bold">Redlined DOCX</text>
  <text x="692" y="155" text-anchor="middle" fill="white" font-size="10">Track Changes markup</text>
  <text x="692" y="170" text-anchor="middle" fill="white" font-size="10">Marginal comments</text>
  <text x="692" y="185" text-anchor="middle" fill="white" font-size="10">Opens in Word</text>
  <text x="692" y="200" text-anchor="middle" fill="#16a085" font-size="10">Attorney reviews</text>

  <!-- Arrows -->
  <line x1="185" y1="160" x2="220" y2="170" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealK)"/>
  <line x1="297" y1="115" x2="297" y2="140" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrowAmberK)"/>
  <line x1="375" y1="180" x2="420" y2="180" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealK)"/>
  <line x1="575" y1="170" x2="615" y2="160" stroke="#16a085" stroke-width="1.5" marker-end="url(#arrowTealK)"/>

  <defs>
    <marker id="arrowTealK" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmberK" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>
</svg>
```

---

**Key Takeaways**

- OOXML is the file format behind .docx files. A .docx file is a ZIP archive of XML files. Track Changes are XML elements (`<w:ins>`, `<w:del>`) in `word/document.xml`.
- Producing proper Track Changes is what separates a legal engineering pipeline from a chatbot. Attorneys work in Word. They expect Track Changes. A pipeline that produces plain text suggestions requires manual transcription; a pipeline that produces a redlined DOCX is a professional tool.
- Text in OOXML is fragmented across runs (`<w:r>` elements), each with its own formatting. Finding a target phrase requires concatenating text across multiple runs and tracking the positions within the XML.
- Comments are stored in a separate `word/comments.xml` file, linked to document text through matching IDs on comment range markers. ID mismatches cause Word to report document corruption.
- OOXML surgery is the most fragile pipeline operation. Always validate output by opening generated documents in Word before client delivery.
