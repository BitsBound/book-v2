\newpage

# Chapter 3: Project Setup

*Directory Structure, Naming Conventions, and the Standard Legal Engineering Scaffold*

Every legal engineering project follows the same file structure, the same naming conventions, and the same architectural patterns. This is not an accident, and it is not aesthetic preference. It is a direct consequence of the TIRO pattern from Chapter 1 applied to project organization itself: the directory structure mirrors the pipeline architecture, the file names encode their role and location, and the type definitions serve as formal contracts between pipeline stages exactly the way defined terms serve as formal contracts between provisions in a legal agreement.


This chapter walks through a complete project setup from an empty directory to a running pipeline. The reference implementation is the open-source deposition contradiction analysis pipeline, a five-round multi-agent system that analyzes sworn testimony for contradictions, ranks them by trial impact, and generates an impeachment preparation brief. It is published at github.com/TaylorLegalEngineering/deposition-contradiction-analysis under the MIT license, and every code example in this chapter is drawn from its source. You can clone it, read it, run it, and modify it as you work through this chapter.


By the end of this chapter, you will understand every file in a legal engineering project: what it does, why it exists, and where it lives. You will know how to configure TypeScript for ESModule output with strict type checking. You will know how to initialize the Anthropic API client with the correct headers, timeouts, and streaming configuration. And you will have built a project scaffold from scratch, ready for the pipeline patterns that follow in Chapters 4 through 7.


## 3.1 The Standard Project Structure


A legal engineering project has six components: a server, an orchestrator, a set of diplomats, a type system, a prompt library, and a logger. Each lives in a dedicated directory within a single `backend/` root. When the project includes a web frontend, the frontend code lives in a sibling `src/` directory with its own package configuration. The separation is deliberate. The backend is the pipeline. The frontend is the dashboard. They share types and communicate over HTTP, but they build, deploy, and run independently.


Here is the complete directory structure of the deposition contradiction analysis pipeline:


```
deposition-contradiction-analysis/
├── backend/
│   ├── server/
│   │   └── server.ts                      # Express server — HTTP routes, SSE streaming
│   ├── orchestration/
│   │   ├── backautocrat/
│   │   │   └── backautocrat.ts            # Pipeline orchestrator — round sequencing
│   │   └── diplomats/
│   │       ├── round-01/
│   │       │   └── round-01-extractor.ts  # N×M parallel subject extraction
│   │       ├── round-02/
│   │       │   └── round-02-synthesizer.ts # M parallel subject synthesis
│   │       ├── round-03/
│   │       │   └── round-03-cross-subject.ts # Cross-subject detection
│   │       ├── round-04/
│   │       │   └── round-04-materiality.ts # Materiality ranking
│   │       └── round-05/
│   │           ├── analytics/
│   │           │   └── round-05-analytics.ts # Visual analytics generation
│   │           └── brief/
│   │               └── round-05-brief.ts    # Impeachment brief generation
│   ├── prompt-library/
│   │   └── prompt-library.ts              # 3-layer prompt composition system
│   ├── types/
│   │   └── types.ts                       # Every interface in the project
│   ├── sample-case/
│   │   └── sample-case.ts                 # Test data — synthetic securities case
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── src/                                   # React frontend (Vite)
│   ├── main/
│   │   └── main.tsx
│   ├── dashboard/
│   │   ├── lobby/
│   │   └── sub-levels/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
├── LICENSE
└── README.md
```


Every legal engineering project you build will follow this same skeleton. The directory names are not suggestions. They are the standard. When you join a team that uses this architecture, or when an AI development agent opens your project for the first time, the structure is immediately legible because it is always the same. The server is in `server/`. The orchestrator is in `orchestration/backautocrat/`. The AI agents are in `orchestration/diplomats/`. The types are in `types/`. This predictability is not a minor convenience. It is the foundation of maintainability at scale.


> **Key Concept**
>
> The directory structure of a legal engineering project is isomorphic to its pipeline architecture. The `orchestration/` directory contains the backautocrat (the orchestrator) and the `diplomats/` subdirectory (the AI agents). The `types/` directory contains the interfaces that define the contracts between pipeline stages. The `server/` directory contains the entry point that triggers the pipeline. Every directory maps to a concept from the TIRO pattern: the server provides the Trigger, the types define the Input and Output structures, and the orchestration directory implements the Requirements.


### Why Backend and Frontend Are Separate Packages


The backend and frontend have their own `package.json` files, their own `tsconfig.json` files, and their own `node_modules/` directories. They are not a monolithic application. They are two applications that communicate over HTTP.


This separation exists for three reasons. First, the backend runs on Node.js and the frontend runs in a browser. They have fundamentally different runtime environments, different available APIs, and different build pipelines. The backend uses `express`, `@anthropic-ai/sdk`, and `dotenv`. The frontend uses `react`, `vite`, and CSS modules. Mixing them into a single package creates dependency conflicts and confusing build configurations.


Second, in production, the backend and frontend deploy to different services. The backend typically deploys to a compute service like Render, Railway, or AWS ECS. The frontend deploys to a static hosting service like Vercel or Cloudflare Pages. They scale independently, they have different resource requirements, and they have different deployment triggers.


Third, and most importantly for legal engineering specifically, many pipelines have no frontend at all. The deposition contradiction analysis pipeline ships with a React dashboard because it is a demonstration tool. But a production pipeline processing privileged documents might run as a CLI tool, a background job, or an API endpoint consumed by an existing legal technology platform. The backend is the product. The frontend is optional.


---

**Key Takeaways**

- Every legal engineering project follows the same directory structure: `backend/server/`, `backend/orchestration/backautocrat/`, `backend/orchestration/diplomats/`, `backend/types/`, and `backend/prompt-library/`.
- The directory structure mirrors the pipeline architecture. Each directory maps to a TIRO concept.
- Backend and frontend are separate packages with separate configurations. The backend is always the product; the frontend is optional.


<svg viewBox="0 0 800 720" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Courier New', monospace; background: #1a1a2e;">
  <!-- Title -->
  <text x="400" y="35" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold" font-family="Arial, sans-serif">Figure 3.1 — Standard Legal Engineering Project Structure</text>

  <!-- Root -->
  <rect x="320" y="55" width="160" height="32" rx="4" fill="#16a085" stroke="#1abc9c" stroke-width="1.5"/>
  <text x="400" y="76" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold">project-root/</text>

  <!-- Lines from root -->
  <line x1="360" y1="87" x2="160" y2="120" stroke="#16a085" stroke-width="1.5"/>
  <line x1="440" y1="87" x2="640" y2="120" stroke="#16a085" stroke-width="1.5"/>

  <!-- Backend box -->
  <rect x="60" y="120" width="200" height="32" rx="4" fill="#1a1a2e" stroke="#16a085" stroke-width="1.5"/>
  <text x="160" y="141" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">backend/</text>

  <!-- Frontend box -->
  <rect x="540" y="120" width="200" height="32" rx="4" fill="#1a1a2e" stroke="#16a085" stroke-width="1.5"/>
  <text x="640" y="141" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">src/</text>

  <!-- Backend children lines -->
  <line x1="100" y1="152" x2="55" y2="185" stroke="#3d5a80" stroke-width="1"/>
  <line x1="130" y1="152" x2="115" y2="185" stroke="#3d5a80" stroke-width="1"/>
  <line x1="160" y1="152" x2="160" y2="185" stroke="#3d5a80" stroke-width="1"/>
  <line x1="190" y1="152" x2="215" y2="185" stroke="#3d5a80" stroke-width="1"/>
  <line x1="220" y1="152" x2="270" y2="185" stroke="#3d5a80" stroke-width="1"/>

  <!-- Backend children -->
  <rect x="10" y="185" width="90" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="55" y="204" text-anchor="middle" fill="#8ecae6" font-size="11">server/</text>

  <rect x="70" y="185" width="90" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="115" y="204" text-anchor="middle" fill="#8ecae6" font-size="11">types/</text>

  <rect x="110" y="185" width="110" height="28" rx="3" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="165" y="204" text-anchor="middle" fill="#f39c12" font-size="11">orchestration/</text>

  <rect x="180" y="185" width="100" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="230" y="204" text-anchor="middle" fill="#8ecae6" font-size="10">prompt-library/</text>

  <rect x="240" y="185" width="80" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="280" y="204" text-anchor="middle" fill="#8ecae6" font-size="11">logger/</text>

  <!-- Orchestration children lines -->
  <line x1="140" y1="213" x2="90" y2="248" stroke="#f39c12" stroke-width="1"/>
  <line x1="190" y1="213" x2="225" y2="248" stroke="#f39c12" stroke-width="1"/>

  <!-- Orchestration children -->
  <rect x="20" y="248" width="140" height="28" rx="3" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="90" y="267" text-anchor="middle" fill="#f39c12" font-size="11">backautocrat/</text>

  <rect x="175" y="248" width="100" height="28" rx="3" fill="#1a1a2e" stroke="#f39c12" stroke-width="1"/>
  <text x="225" y="267" text-anchor="middle" fill="#f39c12" font-size="11">diplomats/</text>

  <!-- Diplomat rounds lines -->
  <line x1="200" y1="276" x2="140" y2="310" stroke="#e74c3c" stroke-width="1"/>
  <line x1="225" y1="276" x2="225" y2="310" stroke="#e74c3c" stroke-width="1"/>
  <line x1="250" y1="276" x2="310" y2="310" stroke="#e74c3c" stroke-width="1"/>

  <!-- Diplomat rounds -->
  <rect x="85" y="310" width="110" height="26" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="140" y="327" text-anchor="middle" fill="#e74c3c" font-size="10">round-01/</text>

  <rect x="170" y="345" width="110" height="26" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="225" y="362" text-anchor="middle" fill="#e74c3c" font-size="10">round-02/</text>

  <rect x="255" y="310" width="110" height="26" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="310" y="327" text-anchor="middle" fill="#e74c3c" font-size="10">round-N/</text>

  <!-- Frontend children lines -->
  <line x1="600" y1="152" x2="540" y2="185" stroke="#3d5a80" stroke-width="1"/>
  <line x1="640" y1="152" x2="640" y2="185" stroke="#3d5a80" stroke-width="1"/>
  <line x1="680" y1="152" x2="740" y2="185" stroke="#3d5a80" stroke-width="1"/>

  <!-- Frontend children -->
  <rect x="490" y="185" width="100" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="540" y="204" text-anchor="middle" fill="#8ecae6" font-size="11">main/</text>

  <rect x="590" y="185" width="100" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="640" y="204" text-anchor="middle" fill="#8ecae6" font-size="11">dashboard/</text>

  <rect x="700" y="185" width="90" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="745" y="204" text-anchor="middle" fill="#8ecae6" font-size="11">styles/</text>

  <!-- Dashboard children lines -->
  <line x1="620" y1="213" x2="580" y2="248" stroke="#3d5a80" stroke-width="1"/>
  <line x1="660" y1="213" x2="700" y2="248" stroke="#3d5a80" stroke-width="1"/>

  <!-- Dashboard children -->
  <rect x="530" y="248" width="100" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="580" y="267" text-anchor="middle" fill="#8ecae6" font-size="11">lobby/</text>

  <rect x="650" y="248" width="100" height="28" rx="3" fill="#1a1a2e" stroke="#3d5a80" stroke-width="1"/>
  <text x="700" y="267" text-anchor="middle" fill="#8ecae6" font-size="11">sub-levels/</text>

  <!-- Root-level config files -->
  <rect x="140" y="430" width="120" height="26" rx="3" fill="#2c3e50" stroke="#95a5a6" stroke-width="1"/>
  <text x="200" y="447" text-anchor="middle" fill="#ecf0f1" font-size="11">.gitignore</text>

  <rect x="280" y="430" width="120" height="26" rx="3" fill="#2c3e50" stroke="#95a5a6" stroke-width="1"/>
  <text x="340" y="447" text-anchor="middle" fill="#ecf0f1" font-size="11">CLAUDE.md</text>

  <rect x="420" y="430" width="120" height="26" rx="3" fill="#2c3e50" stroke="#95a5a6" stroke-width="1"/>
  <text x="480" y="447" text-anchor="middle" fill="#ecf0f1" font-size="11">README.md</text>

  <rect x="560" y="430" width="100" height="26" rx="3" fill="#2c3e50" stroke="#95a5a6" stroke-width="1"/>
  <text x="610" y="447" text-anchor="middle" fill="#ecf0f1" font-size="11">LICENSE</text>

  <!-- Legend -->
  <rect x="180" y="490" width="440" height="130" rx="6" fill="#0d0d1a" stroke="#3d5a80" stroke-width="1"/>
  <text x="400" y="515" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold" font-family="Arial, sans-serif">Legend</text>
  <rect x="210" y="530" width="14" height="14" rx="2" fill="#16a085"/>
  <text x="234" y="542" fill="#8ecae6" font-size="11" font-family="Arial, sans-serif">Entry point / root level directories</text>
  <rect x="210" y="552" width="14" height="14" rx="2" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="234" y="564" fill="#f39c12" font-size="11" font-family="Arial, sans-serif">Orchestration layer (backautocrat + diplomats)</text>
  <rect x="210" y="574" width="14" height="14" rx="2" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="234" y="586" fill="#e74c3c" font-size="11" font-family="Arial, sans-serif">Pipeline round directories (one per stage)</text>
  <rect x="210" y="596" width="14" height="14" rx="2" fill="#2c3e50" stroke="#95a5a6" stroke-width="1"/>
  <text x="234" y="608" fill="#95a5a6" font-size="11" font-family="Arial, sans-serif">Root-level configuration files</text>
</svg>


\newpage

## 3.2 Naming Conventions


File naming in legal engineering projects follows a structured convention that encodes four pieces of information into every filename: the organization, the project, the layer, and the component. The pattern is:


`Organization_Project_Layer_Component.ts`


In practice, this produces file names like:


```
TaylorLegalEngineering_DepositionContradiction_Backend_Server.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Backautocrat.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Types.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Diplomat_Extractor.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Diplomat_Synthesizer.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Diplomat_CrossSubject.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Diplomat_Materiality.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Diplomat_Analytics.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Diplomat_Brief.ts
TaylorLegalEngineering_DepositionContradiction_Backend_PromptLibrary.ts
TaylorLegalEngineering_DepositionContradiction_Backend_Logger.ts
```


These names are long. That is intentional. A legal engineering project with ten diplomats, a backautocrat, a server, a types file, a prompt library, and a logger has fifteen or more backend files. In a monorepo containing multiple projects, that number multiplies. Long, self-documenting file names eliminate an entire class of confusion.


Consider the alternative. A file named `server.ts` tells you nothing about which project it belongs to. A file named `types.ts` could be any of thirty type files across ten projects. A file named `extractor.ts` could be a contract clause extractor, a deposition fact extractor, a document metadata extractor, or an obligation term extractor. But a file named `TaylorLegalEngineering_DepositionContradiction_Backend_Diplomat_Extractor.ts` is unambiguous. You know the organization. You know the project. You know it is a backend file. You know it is a diplomat. You know it extracts something. All of that from the filename alone, without opening the file.


> **Insight**
>
> The naming convention is particularly valuable when working with AI development agents like Claude Code. When an agent opens your project, the first thing it does is scan the file tree. If every file name encodes its role and location, the agent can navigate the project by reading the directory listing alone. It does not need to open files to understand the architecture. It does not need to search for the backautocrat because the filename contains the word "Backautocrat." It does not need to guess which file contains the type definitions because the filename contains the word "Types." The naming convention turns the file tree into a map.


### The Four Segments


**Organization** identifies the company or team. In Taylor Legal Engineering projects, this is `TaylorLegalEngineering`. In a client engagement, this might be `AcmeLegal` or `WhiteCaseCustom`. The organization segment prevents collisions when multiple projects from different teams share a repository or when files are referenced across project boundaries.


**Project** identifies the specific pipeline. `DepositionContradiction` for the deposition contradiction analysis pipeline. `ContractRedline` for a contract redlining pipeline. `DocumentTriage` for a document classification and routing pipeline. The project segment tells you which system this file belongs to.


**Layer** identifies where in the architecture this file sits. `Backend` for server-side code. `Frontend` or `Src` for client-side code. Within the backend, sub-layers further specify: `Backend_Server` for the Express server, `Backend_Diplomat` for AI agents, `Backend_Orchestration` for the backautocrat.


**Component** identifies the specific role of this file. `Server`, `Backautocrat`, `Types`, `Logger`, `PromptLibrary`, or the specific diplomat name like `Extractor`, `Synthesizer`, `CrossSubject`, `Materiality`, `Analytics`, or `Brief`.


### Short Names in the Open-Source Reference


The open-source deposition contradiction analysis pipeline uses shorter file names than the full convention. The server file is `server.ts`, not `TaylorLegalEngineering_DepositionContradiction_Backend_Server.ts`. The type file is `types.ts`, not the fully qualified version. This was a deliberate choice for the open-source release: shorter names lower the barrier to entry for developers cloning the repository for the first time.


In production projects and in all TLE internal systems, the full naming convention is used without exception. The open-source project trades some navigability for approachability. In your own projects, use the full convention from the start. The five extra seconds of typing pay for themselves the first time you need to find a file in a project with forty diplomats.


---

**Key Takeaways**

- File names follow the pattern `Organization_Project_Layer_Component.ts`, encoding four pieces of information into every filename.
- Long, self-documenting names eliminate ambiguity in projects with many files and in monorepos with many projects.
- The naming convention enables AI development agents to navigate projects by scanning the file tree alone.


\newpage

## 3.3 The Backend: Every File's Role


The backend of a legal engineering project contains six categories of files: the server, the backautocrat, the diplomats, the types, the prompt library, and the logger. Each has a specific responsibility, and those responsibilities do not overlap. Understanding what each file does and, equally important, what it does not do is essential to building maintainable pipelines.


### The Server


The server is the entry point to the pipeline. It is an Express application that listens for HTTP requests, validates incoming data, triggers pipeline execution, manages Server-Sent Events (SSE) connections for real-time progress streaming, and returns results. Here is the server from the deposition contradiction analysis pipeline:


```typescript
// server/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { runPipeline } from '../orchestration/backautocrat/backautocrat.js';
import { SAMPLE_CASE } from '../sample-case/sample-case.js';
import type { CaseConfiguration, SSEEvent, AnalysisRun } from '../types/types.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5002', 10);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Pipeline state
let latestResult: AnalysisRun | null = null;
let progressStore: {
  phase: 'idle' | 'running' | 'complete' | 'error';
  events: SSEEvent[];
  error?: string;
} = { phase: 'idle', events: [] };

// POST /api/analyze — Run the 5-round pipeline
app.post('/api/analyze', async (req: Request, res: Response) => {
  let keepalive: ReturnType<typeof setInterval> | undefined;
  try {
    const config = req.body as CaseConfiguration;

    if (!config.transcripts?.length || !config.subjects?.length) {
      res.status(400).json({ error: 'transcripts and subjects are required' });
      return;
    }

    progressStore = { phase: 'running', events: [] };
    latestResult = null;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    let clientDisconnected = false;
    req.on('close', () => { clientDisconnected = true; clearInterval(keepalive); });

    const emitSSE = (event: SSEEvent) => {
      progressStore.events.push(event);
      if (!clientDisconnected) res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    keepalive = setInterval(() => {
      if (!clientDisconnected) res.write(': keepalive\n\n');
    }, 15_000);

    const result = await runPipeline(config, emitSSE);
    clearInterval(keepalive);
    latestResult = result;
    progressStore.phase = 'complete';

    if (!clientDisconnected) {
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  } catch (error) {
    clearInterval(keepalive);
    progressStore.phase = 'error';
    progressStore.error = String(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Pipeline failed' });
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error', round: 0, timestamp: new Date().toISOString(),
        data: { error: String(error) }
      })}\n\n`);
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Deposition Contradiction Analysis — port ${PORT}`);
});
```


Several things to notice about this server. It imports exactly one function from the orchestration layer: `runPipeline`. The server does not know how many rounds the pipeline has. It does not know which diplomats execute in which order. It does not construct prompts or parse AI responses. It receives a `CaseConfiguration`, passes it to the backautocrat, and streams progress events back to the client. That is all.


The SSE setup follows a pattern you will see in every legal engineering server. The response headers switch the connection to event-stream mode. A keepalive interval prevents proxy timeouts on long-running pipelines. A disconnect handler cleans up when the client drops. The `emitSSE` callback is passed into the backautocrat so the orchestrator can report progress without knowing anything about HTTP or SSE. This is the separation of concerns in practice: the server owns the transport layer, the backautocrat owns the pipeline logic, and a callback function bridges them.


> **Practice Tip**
>
> The `express.json({ limit: '50mb' })` middleware configuration is not arbitrary. Deposition transcripts can be substantial documents. A five-deponent case with full transcript text easily exceeds the default Express body limit of 100KB. Set the limit based on the maximum payload your pipeline will receive. For document-heavy legal pipelines, 50MB is a reasonable starting point.


The server also handles a critical edge case that many tutorials ignore: what happens when the pipeline fails after SSE headers have already been sent. You cannot send a 500 status code because the response has already started with a 200. Instead, you write an error event to the stream and close the connection. The client must be prepared to handle error events alongside progress events. This pattern is not optional in production. Pipelines fail. API calls time out. Models produce unparseable output. The server must handle every failure mode gracefully.


### The Backautocrat


The backautocrat is the pipeline orchestrator. Its name comes from the pattern taxonomy in Chapter 4, but its role is straightforward: it executes diplomats in the correct order, manages parallelism, collects results, tracks metrics, and handles errors. Here is the core structure from the deposition pipeline:


```typescript
// orchestration/backautocrat/backautocrat.ts
import { extractSubject } from '../diplomats/round-01/round-01-extractor.js';
import { synthesizeSubject } from '../diplomats/round-02/round-02-synthesizer.js';
import { detectCrossSubject } from '../diplomats/round-03/round-03-cross-subject.js';
import { rankMateriality } from '../diplomats/round-04/round-04-materiality.js';
import { generateVisualAnalytics } from '../diplomats/round-05/analytics/round-05-analytics.js';
import { generateImpeachmentBrief } from '../diplomats/round-05/brief/round-05-brief.js';
import type {
  CaseConfiguration, ExtractionCell, SubjectSynthesis,
  RankedContradiction, AnalysisRun, SSEEvent, PipelineMetrics,
  Round01Output, Round02Output, Round03Output, Round04Output, Round05Output,
} from '../../types/types.js';

function mergeMetrics(...metrics: PipelineMetrics[]): PipelineMetrics {
  return metrics.reduce((acc, m) => ({
    inputTokens: acc.inputTokens + m.inputTokens,
    outputTokens: acc.outputTokens + m.outputTokens,
    claudeCalls: acc.claudeCalls + m.claudeCalls,
    latencyMs: acc.latencyMs + m.latencyMs,
    costUsd: acc.costUsd + m.costUsd,
  }), { inputTokens: 0, outputTokens: 0, claudeCalls: 0, latencyMs: 0, costUsd: 0 });
}

export async function runPipeline(
  config: CaseConfiguration,
  emitSSE: (event: SSEEvent) => void
): Promise<AnalysisRun> {
  const runId = `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const pipelineStart = Date.now();

  // ROUND 1: N × M parallel Subject Extraction
  const r1Jobs = config.transcripts.flatMap(transcript =>
    config.subjects.map(subject => ({ transcript, subject }))
  );

  const r1Results = await Promise.allSettled(
    r1Jobs.map(async ({ transcript, subject }) => {
      const result = await extractSubject(config, transcript, subject);
      emitSSE({ /* round 1 progress event */ });
      return result;
    })
  );

  // Collect successful extractions
  const grid: ExtractionCell[] = [];
  for (const result of r1Results) {
    if (result.status === 'fulfilled') grid.push(result.value.cell);
    else console.error(`[R1] REJECTED: ${result.reason}`);
  }

  // ROUND 2: M parallel Subject Synthesis
  const r2Results = await Promise.allSettled(
    config.subjects.map(async (subject) => {
      const cellsForSubject = grid.filter(cell => cell.subjectId === subject.id);
      return synthesizeSubject(config, cellsForSubject, subject);
    })
  );

  // ROUND 3: Cross-Subject Detection (sequential)
  const r3Result = await detectCrossSubject(config, syntheses);

  // ROUND 4: Materiality Ranking (sequential)
  const r4Result = await rankMateriality(config, allContradictions, crossFindings);

  // ROUND 5: Parallel Output Generation
  const [analyticsResult, briefResult] = await Promise.allSettled([
    generateVisualAnalytics(config, ranked, witnessScores, crossFindings, syntheses),
    generateImpeachmentBrief(config, ranked, witnessScores, crossFindings)
  ]);

  // Assemble final result with cumulative metrics
  return { runId, timestamp: new Date().toISOString(), config,
           round01, round02, round03, round04, round05, cumulativeMetrics };
}
```


The backautocrat's structure directly encodes the pipeline architecture. Rounds 1, 2, and 5 use `Promise.allSettled()` for parallel execution. Rounds 3 and 4 use `await` for sequential execution. The choice between parallel and sequential is not arbitrary: Round 1 extractions are independent (each operates on one deponent and one subject), so they run in parallel. Round 3 requires all Round 2 syntheses as input, so it must wait for Round 2 to complete. Chapter 4 covers the orchestration pattern taxonomy in detail, but the principle is visible here: **parallelize independent work, sequence dependent work**.


Notice what the backautocrat does not contain. It does not contain prompts. It does not parse AI responses. It does not know what a "contradiction" is or what makes one "material." All domain logic lives in the diplomats. The backautocrat knows only that Round 1 produces an array of `ExtractionCell` objects, Round 2 produces an array of `SubjectSynthesis` objects, and so on. It manages the flow of typed data between stages. The types define the contracts. The diplomats fulfill the contracts. The backautocrat enforces the sequence.


The `mergeMetrics` utility function is a small but important detail. Every diplomat returns a `PipelineMetrics` object with token counts, latency, and cost. The backautocrat accumulates these into cumulative metrics for the entire pipeline run. This gives you a single summary of how much the pipeline cost, how many API calls it made, and how long it took. In production, these metrics are logged, stored, and displayed to users.


> **Key Concept**
>
> The backautocrat is the single point of orchestration in a legal engineering pipeline. It imports diplomat functions, calls them in the correct order with the correct inputs, collects their outputs, and assembles the final result. It does not contain domain logic, prompt construction, or response parsing. If you need to change what a diplomat does, you modify the diplomat. If you need to change the order in which diplomats execute, or add a new round, or parallelize a previously sequential stage, you modify the backautocrat.


### The Diplomats


Diplomats are the AI agents of the pipeline. Each diplomat is a single file containing one function that makes one kind of API call. A diplomat receives typed input, constructs a prompt, calls the Anthropic API, parses the response into typed output, and returns both the output and its metrics. Here is the Round 1 extractor from the deposition pipeline:


```typescript
// orchestration/diplomats/round-01/round-01-extractor.ts
import Anthropic from '@anthropic-ai/sdk';
import { buildExtractionPrompt } from '../../../prompt-library/prompt-library.js';
import type {
  CaseConfiguration, DepositionTranscript, SubjectConfig,
  ExtractionCell, PipelineMetrics
} from '../../../types/types.js';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

export async function extractSubject(
  config: CaseConfiguration,
  transcript: DepositionTranscript,
  subject: SubjectConfig
): Promise<{ cell: ExtractionCell; metrics: PipelineMetrics }> {
  const prompt = buildExtractionPrompt(config, transcript, subject);
  const startTime = Date.now();

  console.log(`[R1 Extractor] START ${transcript.metadata.deponentName}::${subject.id}`);

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 128_000,
        messages: [{ role: 'user', content: prompt }]
      });
      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';
      const { input_tokens, output_tokens } = response.usage;

      console.log(`[R1 Extractor] DONE — ${input_tokens} in / ${output_tokens} out`);

      const cell = parseExtractionResponse(text, transcript.metadata.deponentName, subject.id);

      return {
        cell,
        metrics: {
          inputTokens: input_tokens,
          outputTokens: output_tokens,
          claudeCalls: 1,
          latencyMs: Date.now() - startTime,
          costUsd: (input_tokens * 5 + output_tokens * 25) / 1_000_000
        }
      };
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        console.log(`[R1 Extractor] RETRY ${attempt + 1}/2 — ${err}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw lastError;
}
```


Every diplomat in the codebase follows this identical structure. The Anthropic client is initialized at module scope with a one-hour timeout and the required beta headers for 128K output and 1M context. The exported function accepts typed input, delegates prompt construction to the prompt library, calls the API using the streaming pattern, parses the response, computes metrics, and returns both. A retry loop wraps the API call, attempting up to three times with a five-second delay between attempts.


This is the pattern. Every diplomat you build will look like this. The differences between diplomats are the prompt they construct (delegated to the prompt library), the types they accept and return, and the parsing logic they apply to the AI response. The API call pattern, the retry logic, the metrics computation, and the client configuration are always the same.


> **Warning**
>
> Do not instantiate the Anthropic client inside the function. Create it once at module scope. Each instantiation creates a new HTTP connection pool, and if your pipeline runs thirty parallel diplomats (as the deposition pipeline does in Round 1), creating thirty connection pools wastes resources and can cause connection exhaustion. A single client instance is designed to handle concurrent requests. It manages connection pooling internally. Instantiate it once, use it everywhere within the module.


The parsing logic deserves attention. The extractor calls `parseExtractionResponse`, which attempts to extract a JSON object from the AI response, validates its structure, and maps it to the `ExtractionCell` type. If parsing fails, a fallback function returns a minimal valid cell so the pipeline can continue. This defensive parsing is essential in production: Claude reliably produces JSON when instructed to, but network interruptions, context window limits, or edge cases in the prompt can occasionally produce malformed output. The pipeline must not crash when a single cell fails to parse.


```typescript
function parseExtractionResponse(
  text: string,
  deponentName: string,
  subjectId: string
): ExtractionCell {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return buildFallbackCell(deponentName, subjectId, text);

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      deponentName,
      subjectId,
      factualClaims: parsed.factualClaims ?? [],
      admissions: parsed.admissions ?? [],
      hedgingInstances: parsed.hedgingInstances ?? [],
      documentReferences: parsed.documentReferences ?? [],
      documentConflicts: parsed.documentConflicts ?? [],
      notableAbsences: parsed.notableAbsences ?? [],
      keyQuotes: parsed.keyQuotes ?? [],
    };
  } catch {
    return buildFallbackCell(deponentName, subjectId, text);
  }
}
```


The regex `text.match(/\{[\s\S]*\}/)` extracts the largest JSON object from the response text. This handles the common case where the model includes a brief preamble or trailing explanation around the JSON body despite being instructed to output only JSON. The nullish coalescing operator (`??`) on each field ensures that missing fields default to empty arrays rather than undefined values. Together, these two techniques make the parsing robust against the two most common failure modes: extra text around the JSON and missing fields within it.


### The Type System


The type file is the most important file in the project. It defines every data structure that flows through the pipeline: the input configuration, the output of each round, the shared enumerations, and the metric tracking interfaces. In the deposition pipeline, this is a single `types.ts` file containing 320 lines of interface definitions.


The types file serves as the formal contract between pipeline stages. When Round 1 produces an `ExtractionCell`, that interface specifies exactly which fields are present, what types they have, and whether they are optional. When Round 2 consumes those cells, the TypeScript compiler guarantees that the data matches the contract. If someone changes the `ExtractionCell` interface without updating the synthesizer that consumes it, the code will not compile. This is the same principle as a definitions section in a legal agreement: every term has a precise meaning, and that meaning is enforced consistently across the entire document.


```typescript
// types/types.ts — selected interfaces

export type PracticeGroupId =
  | 'complex-commercial'
  | 'securities-mna'
  | 'white-collar'
  | 'antitrust'
  | 'ip-patent'
  | 'ip-trade-secrets'
  | 'environmental'
  | 'bankruptcy'
  | 'privacy-cyber'
  | 'class-actions-mdl';

export interface DepositionTranscript {
  id: string;
  metadata: DeponentMetadata;
  content: string;
}

export interface ExtractionCell {
  deponentName: string;
  subjectId: string;
  factualClaims: FactualClaim[];
  admissions: string[];
  hedgingInstances: Array<{ quote: string; context: string }>;
  documentReferences: Array<{ exhibit: string; description: string }>;
  documentConflicts: DocumentConflict[];
  notableAbsences: string[];
  keyQuotes: Array<{ quote: string; context: string; reference: string }>;
}

export interface Contradiction {
  id: string;
  type: ContradictionType;
  severity: ContradictionSeverity;
  intraParty: boolean;
  deponentsInvolved: string[];
  subjectId: string;
  description: string;
  evidenceSupport: string[];
  impeachmentPotential: string;
}

export interface PipelineMetrics {
  inputTokens: number;
  outputTokens: number;
  claudeCalls: number;
  latencyMs: number;
  costUsd: number;
}
```


Three design decisions in this type file matter for every project you build.


First, the `PracticeGroupId` type is a union of string literals, not an enum and not an unconstrained string. Union types are validated at compile time. If someone passes `'securites-mna'` (note the typo), the compiler catches it. If the type were `string`, the typo would slip through to runtime and route to the wrong practice group lens, producing irrelevant analysis on a client's case. In legal engineering, a type error is not a minor bug. It is a potential malpractice risk.


Second, the `PipelineMetrics` interface appears in every round's output. This means every diplomat must compute and return its metrics, and the backautocrat can accumulate them without knowing anything about the specific round. The metrics interface is the same regardless of whether the diplomat extracts facts, synthesizes contradictions, or generates a brief. This uniformity is what makes the `mergeMetrics` function in the backautocrat possible.


Third, the types file is a single file. Not one file per interface. Not one file per round. One file. This is a deliberate choice for projects of this scale (ten to thirty diplomats, five to ten round types). A single types file is easier to navigate, easier to search, and easier to keep consistent than a directory of twenty type files. When you need to understand the data model of the pipeline, you open one file and read it top to bottom. The entire contract between all stages is visible in one place.


> **Practice Tip**
>
> Organize the types file by pipeline round, with clear section headers. The deposition pipeline uses block comments (`// ═══ ROUND 1 — SUBJECT EXTRACTION ═══`) to visually separate round-specific types from shared types like `PipelineMetrics` and `SSEEvent`. This convention makes it possible to scroll to the types for a specific round without using search.


### The Prompt Library


The prompt library is where domain expertise lives. It contains the prompts that diplomats send to the AI model, composed through a layered system that separates universal methodology from domain-specific lenses from instance-specific instructions. The deposition pipeline uses a three-layer prompt composition system:


```typescript
// prompt-library/prompt-library.ts — layer structure

// Layer 1: Universal framework (role + methodology)
const UNIVERSAL_EXTRACTION = `You are a DEPOSITION EXTRACTION SPECIALIST
performing surgical fact extraction from sworn testimony. Your analysis
must be:
- EXHAUSTIVE: Extract every factual claim, date, number, commitment...
- CITATION-ANCHORED: Every claim must include the deposition reference...
- HEDGING-AWARE: Flag every instance of qualifying language...
- CONFLICT-SENSITIVE: Note where testimony conflicts with exhibits...
- ABSENCE-AWARE: Identify topics the witness conspicuously avoided...`;

// Layer 2: Practice group lens (domain expertise)
const PRACTICE_GROUP_LENSES: Record<PracticeGroupId, string> = {
  'securities-mna': `SECURITIES & M&A LITIGATION LENS: Scienter is the
    ballgame. Every extraction must focus on the knowledge timeline: what
    did officers know, when did they know it, and how?...`,
  'antitrust': `ANTITRUST & COMPETITION LENS: Antitrust depositions hinge
    on whether parallel conduct was coordinated or independent...`,
  // ... one lens per practice group
};

// Layer 3: JSON output schema
const EXTRACTION_JSON_FORMAT = `Output ONLY valid JSON matching this
schema (no preamble, no explanation, no markdown fences):
{
  "factualClaims": [{ "claim": "...", "quote": "verbatim quote",
    "reference": "Q.47 / p.23:5-12", "confidence": "direct|inference|hedged",
    "hedging": false }],
  ...
}`;

// Builder function composes all three layers
export function buildExtractionPrompt(
  config: CaseConfiguration,
  transcript: DepositionTranscript,
  subject: SubjectConfig
): string {
  const lens = PRACTICE_GROUP_LENSES[config.practiceGroupId];
  return `${UNIVERSAL_EXTRACTION}\n\n${lens}\n\n
    CASE: ${config.caseName}\n...
    DEPOSITION TRANSCRIPT:\n${transcript.content}\n\n
    ${EXTRACTION_JSON_FORMAT}`;
}
```


The three-layer architecture means the same pipeline handles securities fraud, antitrust, patent litigation, and seven other practice groups without changing a single line of pipeline code. The diplomats do not change. The backautocrat does not change. The types do not change. Only the prompt changes, and only the second layer of the prompt (the practice group lens) varies based on the case configuration. This is the separation of domain expertise from pipeline architecture. The pipeline is the engine. The prompts are the fuel. You can change the fuel without rebuilding the engine.


The prompt library also contains the JSON output format specifications for each round. These format strings tell the model exactly what structure to return. They serve the same function as the type definitions in `types.ts`, but for the AI model rather than the TypeScript compiler. The type system enforces structure at compile time. The output format specification requests structure at generation time. Both are necessary: the format specification maximizes the probability of parseable output, and the defensive parsing in the diplomat handles the cases where the model deviates.


### The Logger


Production pipelines need visibility. When a five-round pipeline processes thirty parallel extractions, you need to see what is happening: which cells are starting, which are completing, how many tokens each one consumes, how much each one costs, and how long each one takes. The logger provides this visibility through stage-specific prefixed messages.


In the deposition pipeline, logging is handled through simple `console.log` calls with round-specific prefixes: `[R1 Extractor]`, `[R2 Synthesizer]`, `[R3 CrossRef]`, `[R4 Materiality]`, `[R5 Brief]`, `[R5 Analytics]`. In larger projects, the logger is extracted into its own file with pre-configured instances for each pipeline stage, adding timestamps, structured JSON output, and log level filtering. The principle is the same regardless of sophistication: every diplomat logs its start, its completion, its token usage, and its cost. When something goes wrong at 2 AM, these logs are how you find it.


> **Practice Tip**
>
> Log at the start and end of every diplomat call. Include the cell identifier (so you know which input is being processed), the prompt length in characters (so you can detect unexpected prompt bloat), the input and output token counts (so you can track costs), and the elapsed time (so you can identify slow calls). The pattern `[R1 Extractor] START deponentName::subjectId — prompt length: 45,231 chars` followed by `[R1 Extractor] DONE deponentName::subjectId — 12,847 in / 3,421 out — 47.3s` gives you everything you need to diagnose pipeline behavior from logs alone.


---

**Key Takeaways**

- The server handles HTTP transport and SSE streaming. It does not contain domain logic or prompt construction.
- The backautocrat orchestrates diplomat execution order and parallelism. It does not contain domain logic or response parsing.
- Diplomats are single-function files that make one kind of API call. They delegate prompt construction to the prompt library and return typed output with metrics.
- The types file is a single file defining every interface in the project. It serves as the formal contract between pipeline stages.
- The prompt library separates universal methodology from domain-specific lenses from instance-specific instructions.


\newpage

## 3.4 Package Configuration and TypeScript Setup


Every legal engineering project is an ESModule TypeScript project. This means two configuration files, `package.json` and `tsconfig.json`, must be set up correctly before any code runs. Getting these wrong produces confusing errors that waste hours. Getting them right takes five minutes if you know the exact settings.


### package.json


Here is the `package.json` from the deposition pipeline backend:


```json
{
  "name": "deposition-analysis-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "npx tsx server/server.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.13.4",
    "typescript": "^5.7.3",
    "tsx": "^4.19.3"
  }
}
```


The single most important line is `"type": "module"`. This tells Node.js that every `.js` file in this package uses ESModule syntax (`import`/`export`) rather than CommonJS syntax (`require`/`module.exports`). Without this line, Node.js defaults to CommonJS, and every `import` statement in your compiled JavaScript will fail with a syntax error. This is the number one cause of "it compiles but doesn't run" errors in TypeScript projects.


The `scripts` section defines three commands. `npm run dev` uses `tsx` to run the server directly from TypeScript source without a compilation step, which is ideal for development. `npm run build` compiles TypeScript to JavaScript using the TypeScript compiler, producing a `dist/` directory for production deployment. `npm run typecheck` runs the compiler in check-only mode, validating types without producing output files, which is useful in CI/CD pipelines.


The dependencies divide into two categories. Runtime dependencies (`dependencies`) are the packages your code imports at execution time: the Anthropic SDK for AI calls, Express for HTTP serving, cors for cross-origin support, and dotenv for environment variable loading. Development dependencies (`devDependencies`) are packages needed only during development and compilation: TypeScript type definitions for Express, cors, and Node.js, plus the TypeScript compiler itself and the `tsx` runner.


> **Warning**
>
> The `@anthropic-ai/sdk` package version matters. API features like the 128K output beta header and the 1M context beta header require SDK versions that support them. Pin your version to a specific minor release (using `^` for patch updates) and test after upgrading. An SDK version mismatch is a subtle failure mode: the code compiles, the server starts, and the API call fails at runtime with an unrecognized header error.


### tsconfig.json


Here is the TypeScript configuration:


```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```


Every setting here has a specific purpose.


`"target": "ES2022"` tells the compiler to emit JavaScript that uses ES2022 features natively, including top-level `await`, `Array.prototype.at()`, and `Object.hasOwn()`. Modern Node.js (version 20 and above) supports ES2022 fully. Do not set this to an older target unless you have a specific runtime constraint, because the compiler will downlevel modern syntax to polyfills that are slower and harder to debug.


`"module": "NodeNext"` and `"moduleResolution": "NodeNext"` are the critical settings for ESModule support. `NodeNext` module resolution means TypeScript uses Node.js's native ESModule resolution algorithm, which requires `.js` extensions on import paths. This is the setting that makes `import { runPipeline } from '../orchestration/backautocrat/backautocrat.js'` work correctly. The `.js` extension refers to the compiled output file, not the source file. TypeScript source files have `.ts` extensions. Import paths have `.js` extensions. This is counterintuitive, and it is correct.


`"strict": true` enables all strict type-checking options. This includes strict null checks (you cannot use a possibly-null value without checking for null first), strict function types (function parameter types must match exactly), and no implicit any (the compiler refuses to infer the `any` type). In legal engineering, strict mode is not optional. A pipeline that processes privileged legal documents and produces work product for attorneys cannot rely on loose type checking. The compiler is your first quality gate.


`"outDir": "./dist"` sends compiled JavaScript to a `dist/` directory. `"rootDir": "."` tells the compiler that the source tree starts at the package root. Together, these settings mean that `server/server.ts` compiles to `dist/server/server.js`, preserving the directory structure. `"declaration": true` generates `.d.ts` type declaration files alongside the compiled JavaScript, which enables TypeScript-aware tools to provide intellisense on the compiled output. `"sourceMap": true` generates source maps that connect runtime errors back to the original TypeScript line numbers.


> **Insight**
>
> The most common misconfiguration is setting `"module": "ESNext"` instead of `"module": "NodeNext"`. Both produce ESModule output, but `ESNext` does not enforce `.js` extensions on imports, which means your code compiles successfully but fails at runtime because Node.js cannot resolve import paths without extensions. `NodeNext` catches this at compile time by requiring extensions. Always use `NodeNext` for server-side legal engineering projects.


### The .js Extension Rule


This rule confuses every developer the first time they encounter it, so let us be explicit. When you write a TypeScript source file at `server/server.ts` that imports from `../types/types.ts`, the import statement in your source code must use the `.js` extension:


```typescript
// In server/server.ts — the source file is .ts, the import path is .js
import type { CaseConfiguration } from '../types/types.js';
```


Not `types.ts`. Not `types` with no extension. The path must end in `.js` because at runtime, after compilation, the file that exists on disk will be `types.js`. TypeScript compiles `.ts` files to `.js` files. The import path must reference what will exist at runtime, not what exists at development time. This is one of the most frequently asked questions about TypeScript ESModule projects, and the answer is always the same: import paths use `.js` extensions.


---

**Key Takeaways**

- Every legal engineering project requires `"type": "module"` in `package.json` for ESModule support.
- TypeScript must be configured with `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, and `"strict": true`.
- Import paths in TypeScript source files must use `.js` extensions, referencing the compiled output file, not the source file.
- Runtime dependencies (`@anthropic-ai/sdk`, `express`, `cors`, `dotenv`) go in `dependencies`. Type definitions and build tools go in `devDependencies`.


\newpage

## 3.5 Environment Variables and Security


Legal engineering pipelines process privileged documents and call paid API services. Both require secrets: API keys for the Anthropic service, database connection strings for document storage, and in some cases authentication tokens for client systems. These secrets must never appear in source code and must never be committed to version control.


### The .env File


Every legal engineering project uses a `.env` file in the backend root to store environment variables. The `dotenv` package loads these variables into `process.env` at application startup. Here is the `.env.example` file from the deposition pipeline:


```
# Anthropic API Key — required for the pipeline to run
ANTHROPIC_API_KEY=your-api-key-here

# Server port (default: 5002)
PORT=5002
```


The `.env.example` file is committed to version control. The `.env` file is not. The example file documents which environment variables the project requires, with placeholder values that make the format obvious. A developer cloning the project copies `.env.example` to `.env`, fills in their actual API key, and the application works. The actual API key never touches version control.


The dotenv configuration is loaded as the very first import in the server file:


```typescript
import 'dotenv/config';
```


This side-effect import reads the `.env` file and populates `process.env` before any other code executes. It must be the first import. If it appears after an import that reads `process.env.ANTHROPIC_API_KEY`, the value will be `undefined` because dotenv has not loaded yet.


> **Warning**
>
> The Anthropic SDK reads `process.env.ANTHROPIC_API_KEY` automatically when instantiated without an explicit `apiKey` parameter. This means you do not need to pass the key explicitly — but it also means the key must be available in the environment before the client is created. If the `new Anthropic()` call executes before `dotenv/config` loads the `.env` file, the SDK will throw an authentication error. Always import `dotenv/config` first.


### Startup Validation


Production pipelines should validate that all required environment variables are present before starting the server. A pipeline that starts successfully, accepts a request, runs for twenty minutes, and then fails because the API key is missing is a pipeline that wastes time and money. Fail fast:


```typescript
// Validate required environment variables at startup
const requiredEnvVars = ['ANTHROPIC_API_KEY'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required environment variable: ${envVar}`);
    console.error('Copy .env.example to .env and fill in the values.');
    process.exit(1);
  }
}
```


This pattern takes four lines and prevents an entire class of runtime failures. Add it to the top of every server file, after the dotenv import and before the Express application is created.


### The .gitignore File


The `.gitignore` file for a legal engineering project must exclude, at minimum, the following:


```
# Dependencies
node_modules/

# Compiled output
dist/

# Environment variables (secrets)
.env

# OS artifacts
.DS_Store

# TypeScript build artifacts
*.js
*.d.ts
*.js.map
!vite.config.ts
```


The `*.js` and `*.d.ts` exclusions deserve explanation. In a TypeScript project, you never want compiled JavaScript files in your repository. The source of truth is the TypeScript source. The JavaScript output is generated by the compiler and should be generated fresh on each build. Excluding it from version control prevents merge conflicts in compiled files and ensures the repository contains only source code. The `!vite.config.ts` exception keeps the Vite configuration file, which despite its `.ts` extension is consumed directly by Vite rather than compiled by the TypeScript compiler.


> **Warning**
>
> If you are building a pipeline that processes client documents, the `.gitignore` must also exclude any directory where uploaded documents are stored. Deposition transcripts, contracts, privileged communications, and case files must never be committed to version control, even in a private repository. Add explicit exclusions for upload directories, output directories, and any directory that might contain client data: `uploads/`, `output/`, `case-data/`, `documents/`.


---

**Key Takeaways**

- API keys and secrets live in `.env` files that are never committed to version control.
- A `.env.example` file documents required variables with placeholder values and is committed.
- Validate required environment variables at startup. Fail fast with a clear error message.
- The `.gitignore` must exclude `node_modules/`, `dist/`, `.env`, and any directories containing client documents.


\newpage

## 3.6 CLAUDE.md: Institutional Memory for AI Development


The `CLAUDE.md` file is one of the most consequential files in a legal engineering project, and it contains zero executable code. It is a plain Markdown file that lives at the project root and contains instructions for AI development agents. When Claude Code (or any AI-assisted development tool that reads project files) opens your project, it reads `CLAUDE.md` first and treats its contents as standing instructions for the entire session.


Think of `CLAUDE.md` as the equivalent of a partner's standing instructions to a new associate. When a senior partner delegates a matter to a junior associate, they do not explain the firm's formatting standards, the client's preferences, the billing conventions, and the procedural expectations from scratch every time. Those instructions exist in a memo, a practice group handbook, or an institutional knowledge base. The associate reads them once and follows them throughout the engagement. `CLAUDE.md` serves the same function for AI agents.


### What Goes in CLAUDE.md


A production `CLAUDE.md` contains five categories of information:


**Architecture overview.** A concise description of the project structure, the pipeline stages, the directory layout, and the relationship between components. This gives the AI agent a mental model of the codebase before it reads a single source file.


**API configuration requirements.** The exact model, token limits, beta headers, timeout settings, and streaming patterns that every API call must use. In Taylor Legal Engineering projects, this means Claude Opus 4.6, 128K output tokens, 1M context via beta headers, streaming via `client.messages.stream()`, and a one-hour timeout. These settings are non-negotiable and must be documented explicitly, because an AI agent that defaults to a different model or token limit will produce subtly different (and potentially inferior) output.


**Naming conventions and file organization rules.** The `Organization_Project_Layer_Component.ts` convention, the prohibition on creating files outside the established directory structure, and the requirement that new diplomats follow the existing diplomat template.


**ESModule requirements.** The requirement that import paths use `.js` extensions, that the project uses `"type": "module"`, and that new files follow ESModule syntax. Without this instruction, an AI agent might generate CommonJS `require()` statements that fail at runtime.


**Domain-specific constraints.** For legal engineering projects, this includes the treatment of client data, the prohibition on logging document content, the requirement that output types match the existing type definitions, and any client-specific requirements for the engagement.


### How CLAUDE.md Compounds


The most valuable property of `CLAUDE.md` is that it compounds over time. Every time you encounter a problem, make a decision, or establish a convention that a future developer (human or AI) needs to know about, you add it to `CLAUDE.md`. Every time an AI agent makes a mistake that a `CLAUDE.md` instruction would have prevented, you add the instruction.


After six months, your `CLAUDE.md` contains dozens of decisions that would otherwise exist only in team members' heads. "We use streaming for all API calls because non-streaming calls timeout after 60 seconds on Render." "Import paths must use `.js` extensions." "Never create a new diplomat without adding its output type to `types.ts` first." "The prompt library uses three-layer composition: universal, lens, format." Each of these is a lesson learned once and encoded permanently.


This is institutional memory in its purest form. New team members (human or AI) read the file and immediately operate with the accumulated knowledge of every developer who came before them. The file grows. The mistakes do not repeat.


```markdown
# CLAUDE.md — Project Instructions

## Architecture
5-round pipeline: Extract → Synthesize → Cross-Reference → Rank → Output
Backend: Express + Anthropic SDK. Frontend: React + Vite.

## API Settings (MANDATORY — no exceptions)
- Model: claude-opus-4-6
- max_tokens: 128_000
- Beta headers: output-128k-2025-02-19, context-1m-2025-08-07
- Streaming: client.messages.stream() + await stream.finalMessage()
- Timeout: 3_600_000 (1 hour)

## Standard Client Initialization
```typescript
const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});
```

## ESModule Requirements
- "type": "module" in package.json
- All import paths use .js extensions
- No CommonJS (require/module.exports)

## Naming Convention
Organization_Project_Layer_Component.ts

## File Rules
- One diplomat per file
- All types in types/types.ts
- All prompts in prompt-library/prompt-library.ts
- Never log document content (privilege)
```


> **Insight**
>
> `CLAUDE.md` is not documentation for humans. It is documentation for AI agents. The writing style is directive, not descriptive. It uses imperative statements ("Always use streaming") rather than explanatory prose ("We chose streaming because..."). Bullet points over paragraphs. Code examples over descriptions. The goal is to give an AI agent the exact instructions it needs in the fewest tokens, because the agent reads this file at the start of every session and it occupies context window space. Be precise, be concise, be imperative.


---

**Key Takeaways**

- `CLAUDE.md` is institutional memory for AI development agents, read at the start of every session.
- It contains architecture overview, API configuration, naming conventions, ESModule requirements, and domain constraints.
- The file compounds over time. Every decision, convention, and lesson learned gets encoded permanently.
- Write in imperative, directive style. Code examples over descriptions. Bullet points over paragraphs.


\newpage

## 3.7 The Anthropic Client Configuration


The Anthropic API client configuration is standardized across all legal engineering projects. Every diplomat in every pipeline uses the same client initialization, the same streaming pattern, and the same response extraction logic. This section documents the exact configuration and explains why each setting exists.


### Client Initialization


```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});
```


The `timeout` is set to 3,600,000 milliseconds (one hour). This is not an arbitrary number. Legal engineering pipelines send large prompts (a deposition transcript can be 50,000 tokens) and request large responses (up to 128,000 tokens). A model generating 128K tokens of structured analysis takes significant time, and the streaming connection must remain open for the duration. The default SDK timeout is too short for these workloads. One hour covers the worst-case scenario.


The `defaultHeaders` object includes two beta feature headers. `output-128k-2025-02-19` enables the 128K output token capacity. Without this header, the API limits output to 8,192 tokens, which is grossly insufficient for legal analysis. An impeachment brief for five deponents can easily require 30,000 to 50,000 tokens. A subject synthesis comparing testimony from four witnesses against six legal subjects can require 15,000 tokens. The 128K limit ensures output is never truncated.


`context-1m-2025-08-07` enables the one-million-token context window. This is necessary for pipelines that include full document text in prompts. A deposition transcript is typically 20,000 to 80,000 tokens. When the extraction prompt includes the transcript, the case background, the exhibit descriptions, the practice group lens, the universal framework, and the JSON output format specification, the total prompt easily exceeds 100,000 tokens. The 1M context window provides headroom for large documents.


### The Streaming Pattern


Every API call in a legal engineering pipeline uses the streaming pattern:


```typescript
const stream = client.messages.stream({
  model: 'claude-opus-4-6',
  max_tokens: 128_000,
  messages: [{ role: 'user', content: prompt }]
});
const response = await stream.finalMessage();
const text = response.content.find(c => c.type === 'text')?.text ?? '';
const { input_tokens, output_tokens } = response.usage;
```


Why streaming instead of `client.messages.create()`? Because `create()` waits for the entire response to be generated before returning. If the model takes eight minutes to generate 40,000 tokens, the HTTP connection must remain idle for eight minutes. Many hosting platforms, reverse proxies, and load balancers terminate idle connections after 30 to 60 seconds. Streaming keeps the connection active by sending tokens as they are generated. The `stream.finalMessage()` call still waits for the complete response, but the underlying connection never goes idle.


The response extraction pattern is also standardized. `response.content.find(c => c.type === 'text')?.text ?? ''` extracts the text content from the response, handling the case where the response might contain non-text content blocks. The nullish coalescing operator ensures an empty string rather than `undefined` if no text block is found. `response.usage` provides the token counts needed for cost calculation and metrics tracking.


### Cost Calculation


Every diplomat computes the cost of its API call using the Anthropic pricing formula:


```typescript
const costUsd = (input_tokens * 5 + output_tokens * 25) / 1_000_000;
```


This formula reflects Opus 4.6 pricing: $5 per million input tokens and $25 per million output tokens. The cost is stored in the `PipelineMetrics` object returned by every diplomat, accumulated by the backautocrat, and ultimately displayed to the user. Knowing the cost of every pipeline run is not optional in production. When a client asks "how much does this analysis cost?" you need an exact answer, not an estimate.


---

**Key Takeaways**

- The Anthropic client is initialized with a one-hour timeout and beta headers for 128K output and 1M context.
- All API calls use the streaming pattern (`client.messages.stream()` + `stream.finalMessage()`) to prevent connection timeouts.
- Every diplomat computes and returns cost metrics. The backautocrat accumulates them into a pipeline-level total.


\newpage

## 3.8 Walkthrough: New Project from Zero to First Diplomat


This section walks through building a legal engineering project from an empty directory to a running pipeline with one diplomat. The example is a contract clause extraction pipeline: you send it a contract, and it extracts and classifies every clause. This is intentionally simpler than the deposition pipeline so the setup process is visible without being buried in domain complexity.


### Step 1: Initialize the Project


Create the project directory and initialize `package.json` with ESModule support:


```bash
mkdir contract-clause-extractor
cd contract-clause-extractor
mkdir -p backend/server
mkdir -p backend/orchestration/backautocrat
mkdir -p backend/orchestration/diplomats/round-01
mkdir -p backend/types
mkdir -p backend/prompt-library
```


```bash
cd backend
npm init -y
```


Edit the generated `package.json` to add the ESModule type and scripts:


```json
{
  "name": "contract-clause-extractor-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "npx tsx server/server.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  }
}
```


### Step 2: Install Dependencies


```bash
npm install @anthropic-ai/sdk express cors dotenv
npm install -D typescript tsx @types/node @types/express @types/cors
```


Four runtime dependencies: the Anthropic SDK for AI calls, Express for HTTP serving, cors for cross-origin requests, and dotenv for environment variable loading. Five dev dependencies: TypeScript, the tsx runner for development, and type definitions for Node.js, Express, and cors.


### Step 3: Configure TypeScript


Create `tsconfig.json` in the `backend/` directory:


```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```


### Step 4: Create the Environment Files


Create `.env` in the `backend/` directory:

```
ANTHROPIC_API_KEY=your-api-key-here
PORT=5002
```


Create `.env.example` with the same content but placeholder values (this gets committed).


Create `.gitignore` at the project root:

```
node_modules/
dist/
.env
.DS_Store
*.js
*.d.ts
*.js.map
```


### Step 5: Define the Types


The types file is always the first source file you write because it defines the data model for the entire pipeline. Every other file depends on it.


```typescript
// backend/types/types.ts

export interface ContractInput {
  contractText: string;
  contractType: ContractType;
  partyPerspective: 'party-a' | 'party-b';
  partyName: string;
}

export type ContractType =
  | 'saas'
  | 'nda'
  | 'employment'
  | 'professional-services'
  | 'commercial-lease'
  | 'master-services';

export interface ExtractedClause {
  clauseId: string;
  title: string;
  fullText: string;
  category: ClauseCategory;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  keyTerms: string[];
}

export type ClauseCategory =
  | 'liability'
  | 'indemnification'
  | 'termination'
  | 'confidentiality'
  | 'ip-ownership'
  | 'payment'
  | 'representations'
  | 'governing-law'
  | 'dispute-resolution'
  | 'other';

export interface ExtractionResult {
  clauses: ExtractedClause[];
  totalClauses: number;
  riskSummary: Record<string, number>;
  metrics: PipelineMetrics;
}

export interface PipelineMetrics {
  inputTokens: number;
  outputTokens: number;
  claudeCalls: number;
  latencyMs: number;
  costUsd: number;
}

export interface SSEEvent {
  type: 'stage_start' | 'stage_complete' | 'pipeline_complete' | 'error';
  stage: string;
  data: Record<string, unknown>;
  timestamp: string;
}
```


Notice that the types are written before any implementation code exists. The types define the contract. The implementation fulfills the contract. This order is not a preference. It is how you prevent the implementation from drifting away from the specification. Define what the pipeline produces first. Build it second.


### Step 6: Write the Prompt Library


```typescript
// backend/prompt-library/prompt-library.ts
import type { ContractInput } from '../types/types.js';

const EXTRACTION_SYSTEM = `You are a CONTRACT CLAUSE EXTRACTION SPECIALIST.
Given a contract, identify and extract every distinct clause. For each clause:
- Assign a sequential clause ID (CLAUSE-001, CLAUSE-002, etc.)
- Identify the clause title/heading
- Extract the full text
- Classify it into a category
- Assess the risk level from the specified party's perspective
- Summarize the clause in one sentence
- List key defined terms referenced`;

const EXTRACTION_JSON_FORMAT = `Output ONLY valid JSON matching this schema
(no preamble, no explanation, no markdown fences):
{
  "clauses": [{
    "clauseId": "CLAUSE-001",
    "title": "Limitation of Liability",
    "fullText": "complete clause text...",
    "category": "liability|indemnification|termination|confidentiality|ip-ownership|payment|representations|governing-law|dispute-resolution|other",
    "riskLevel": "low|medium|high|critical",
    "summary": "one sentence summary",
    "keyTerms": ["Defined Term A", "Defined Term B"]
  }]
}`;

export function buildExtractionPrompt(input: ContractInput): string {
  return `${EXTRACTION_SYSTEM}

CONTRACT TYPE: ${input.contractType}
ANALYZING FROM PERSPECTIVE OF: ${input.partyName} (${input.partyPerspective})

CONTRACT TEXT:
${input.contractText}

Extract every clause from this contract.

${EXTRACTION_JSON_FORMAT}`;
}
```


### Step 7: Write the First Diplomat


```typescript
// backend/orchestration/diplomats/round-01/round-01-extractor.ts
import Anthropic from '@anthropic-ai/sdk';
import { buildExtractionPrompt } from '../../../prompt-library/prompt-library.js';
import type { ContractInput, ExtractedClause, ExtractionResult, PipelineMetrics } from '../../../types/types.js';

const client = new Anthropic({
  timeout: 3_600_000,
  defaultHeaders: {
    'anthropic-beta': 'output-128k-2025-02-19,context-1m-2025-08-07'
  }
});

export async function extractClauses(
  input: ContractInput
): Promise<ExtractionResult> {
  const prompt = buildExtractionPrompt(input);
  const startTime = Date.now();

  console.log(`[R1 Extractor] START — prompt length: ${prompt.length} chars`);

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 128_000,
        messages: [{ role: 'user', content: prompt }]
      });
      const response = await stream.finalMessage();
      const text = response.content.find(c => c.type === 'text')?.text ?? '';
      const { input_tokens, output_tokens } = response.usage;

      console.log(`[R1 Extractor] DONE — ${input_tokens} in / ${output_tokens} out`);

      const clauses = parseExtractionResponse(text);
      const metrics: PipelineMetrics = {
        inputTokens: input_tokens,
        outputTokens: output_tokens,
        claudeCalls: 1,
        latencyMs: Date.now() - startTime,
        costUsd: (input_tokens * 5 + output_tokens * 25) / 1_000_000
      };

      const riskSummary: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      for (const clause of clauses) {
        riskSummary[clause.riskLevel] = (riskSummary[clause.riskLevel] || 0) + 1;
      }

      return { clauses, totalClauses: clauses.length, riskSummary, metrics };
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        console.log(`[R1 Extractor] RETRY ${attempt + 1}/2 — ${err}`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  throw lastError;
}

function parseExtractionResponse(text: string): ExtractedClause[] {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return (parsed.clauses ?? []).map((c: Record<string, unknown>) => ({
      clauseId: (c.clauseId as string) ?? '',
      title: (c.title as string) ?? '',
      fullText: (c.fullText as string) ?? '',
      category: (c.category as string) ?? 'other',
      riskLevel: (c.riskLevel as string) ?? 'medium',
      summary: (c.summary as string) ?? '',
      keyTerms: (c.keyTerms as string[]) ?? [],
    }));
  } catch {
    return [];
  }
}
```


The diplomat follows the exact template from the deposition pipeline: module-scope client initialization, exported async function with typed input and output, prompt construction delegated to the prompt library, streaming API call with retry logic, defensive JSON parsing with fallback.


### Step 8: Write the Backautocrat


For a single-round pipeline, the backautocrat is minimal:


```typescript
// backend/orchestration/backautocrat/backautocrat.ts
import { extractClauses } from '../diplomats/round-01/round-01-extractor.js';
import type { ContractInput, ExtractionResult, SSEEvent } from '../../types/types.js';

export async function runPipeline(
  input: ContractInput,
  emitSSE: (event: SSEEvent) => void
): Promise<ExtractionResult> {
  emitSSE({
    type: 'stage_start',
    stage: 'extraction',
    data: { status: 'Extracting clauses from contract' },
    timestamp: new Date().toISOString()
  });

  const result = await extractClauses(input);

  emitSSE({
    type: 'pipeline_complete',
    stage: 'extraction',
    data: {
      totalClauses: result.totalClauses,
      riskSummary: result.riskSummary,
      metrics: result.metrics
    },
    timestamp: new Date().toISOString()
  });

  return result;
}
```


This is the simplest possible backautocrat: one round, one diplomat, no parallelism. As the pipeline grows (adding a risk analyzer round, a recommendation round, a summary round), the backautocrat grows with it. But the structure is the same: import diplomats, call them in order, emit progress events, return the final result.


### Step 9: Write the Server


```typescript
// backend/server/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { runPipeline } from '../orchestration/backautocrat/backautocrat.js';
import type { ContractInput, SSEEvent } from '../types/types.js';

const requiredEnvVars = ['ANTHROPIC_API_KEY'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const PORT = parseInt(process.env.PORT || '5002', 10);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/extract', async (req: Request, res: Response) => {
  try {
    const input = req.body as ContractInput;

    if (!input.contractText) {
      res.status(400).json({ error: 'contractText is required' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let clientDisconnected = false;
    req.on('close', () => { clientDisconnected = true; });

    const emitSSE = (event: SSEEvent) => {
      if (!clientDisconnected) res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const result = await runPipeline(input, emitSSE);

    if (!clientDisconnected) {
      res.write(`data: ${JSON.stringify({ type: 'result', data: result })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Pipeline failed' });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Contract Clause Extractor — port ${PORT}`);
});
```


### Step 10: Run and Verify


```bash
# From the backend/ directory
npm run typecheck    # Verify types compile clean
npm run dev          # Start the development server
```


If the type check passes, the project is correctly configured. If the dev server starts and prints the port number, Express is running. You can test the pipeline with a curl command:


```bash
curl -X POST http://localhost:5002/api/extract \
  -H "Content-Type: application/json" \
  -d '{"contractText": "1. TERM. This Agreement shall commence on January 1, 2025 and continue for a period of twelve (12) months. 2. PAYMENT. Client shall pay Provider $10,000 per month, due on the first business day of each month.", "contractType": "professional-services", "partyPerspective": "party-a", "partyName": "Client Corp"}'
```


The response will stream SSE events followed by the extraction result with every clause identified, classified, and risk-assessed.


You now have a complete legal engineering project scaffold. One server. One backautocrat. One diplomat. One type file. One prompt library. From here, adding a second round (risk analysis), a third round (recommendations), or parallel specialist analyzers follows the same pattern: define the types, write the prompts, build the diplomat, wire it into the backautocrat.


---

**Key Takeaways**

- Start with the types file. Define what the pipeline produces before writing any implementation code.
- Follow the template for every file: server imports from backautocrat, backautocrat imports from diplomats, diplomats import from prompt library and types.
- The first diplomat is a template for every subsequent diplomat: module-scope client, exported async function, streaming API call, retry logic, defensive parsing, metrics tracking.
- Test with `npm run typecheck` to verify the type system, then `npm run dev` to verify the runtime.


\newpage

## 3.9 Development Workflow and Git Setup


Three development workflows support a legal engineering project: rapid iteration with `tsx`, production compilation with `tsc`, and frontend development with Vite. Each serves a different purpose, and understanding when to use each prevents wasted time.


### Backend Development with tsx


During active development, you run the backend directly from TypeScript source without a compilation step:

```bash
cd backend/
npm run dev
# Equivalent to: npx tsx server/server.ts
```

`tsx` compiles and executes TypeScript in a single step, without producing output files. No `dist/` directory. No intermediate JavaScript. The feedback loop is immediate: edit a diplomat's prompt, save the file, restart the server, test the change. For a pipeline developer iterating on prompt wording, response parsing, or orchestration logic, this instant feedback is essential.

When you need automatic restarts on file changes during an extended development session, use the `--watch` flag:

```bash
npx tsx --watch server/server.ts
```

This watches all imported files and restarts the server whenever any of them change. Edit a file, save it, and the server restarts with the new code. No manual intervention required.


### Production Compilation with tsc


Before deploying to production, you compile TypeScript to JavaScript:

```bash
cd backend/
npm run build    # Equivalent to: tsc
node dist/server/server.js   # Run the compiled output
```

The TypeScript compiler reads every `.ts` file, performs full type checking, and writes corresponding `.js` files to the `dist/` directory. If any file contains a type error, compilation fails and no output is produced. This all-or-nothing behavior is a feature: you never deploy partially compiled code with type errors lurking in files the compiler processed last.

The compiled JavaScript files in `dist/` mirror the source directory structure. `server/server.ts` becomes `dist/server/server.js`. Import paths work identically because they already reference `.js` extensions in the source. The production server runs `node dist/server/server.js` without any TypeScript dependency.


### Frontend Development with Vite


The frontend development server provides hot module replacement for the React dashboard:

```bash
cd src/
npm run dev     # Equivalent to: vite
```

Vite serves the React application on its configured port with instant hot module replacement: edit a component, save the file, and the browser updates without a full page reload. The API proxy routes `/api/*` requests to the backend server, so the frontend and backend work together seamlessly during development.

For production:

```bash
cd src/
npm run build   # Equivalent to: tsc && vite build
```

This produces optimized, minified static files that can be deployed to any static hosting service.


> **Practice Tip**
>
> Run `npm run typecheck` before every commit. `tsx` skips type checking for speed, so a file that runs perfectly during development may contain type errors that the production compiler would reject. Catching type errors before committing is cheaper than catching them in CI, and infinitely cheaper than catching them in production.


### Git Setup


Initialize a Git repository at the project root (not inside `backend/` or `src/`):

```bash
cd contract-clause-extractor/
git init
git add .gitignore CLAUDE.md README.md LICENSE
git add backend/package.json backend/tsconfig.json
git add backend/types/ backend/server/ backend/orchestration/
git add backend/prompt-library/
git add src/package.json src/tsconfig.json src/vite.config.ts
git add src/main/ src/dashboard/ src/index.html
git commit -m "Initial project scaffold"
```

Stage files explicitly rather than using `git add .`, which risks accidentally including `.env` files, `node_modules/` directories, or compiled output. The `.gitignore` file provides a safety net, but explicit staging is a defense-in-depth practice that legal engineering projects (which handle secrets and privileged documents) should follow.

The first commit should contain only the project scaffold: configuration files, the directory structure, the types file, and skeleton implementations. No API keys. No client data. No compiled output. Subsequent commits add diplomats, prompt refinements, and frontend components as the pipeline develops.


### The Typical Development Session


A typical development session follows this sequence:

1. Open two terminal windows.
2. In the first: `cd backend && npm run dev` (starts the backend server).
3. In the second: `cd src && npm run dev` (starts the frontend development server).
4. Open the browser to the frontend's development URL.
5. Develop. Edit backend files and restart the server. Edit frontend files and see hot module replacement.
6. When ready to test a full pipeline run, submit input from the frontend and watch the pipeline execute in real time via SSE.
7. Before committing: `cd backend && npm run typecheck` to verify all types compile cleanly.
8. Stage specific files and commit with a descriptive message.


<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style="font-family: Arial, sans-serif; background: #1a1a2e;">
  <!-- Title -->
  <text x="400" y="30" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold">Figure 3.2 — Request Flow: Frontend to Pipeline to Response</text>

  <!-- Arrow marker definitions -->
  <defs>
    <marker id="arrowTeal2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="arrowAmber2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
    <marker id="arrowCoral2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#e74c3c"/>
    </marker>
  </defs>

  <!-- Frontend -->
  <rect x="50" y="60" width="160" height="50" rx="6" fill="#16a085" stroke="#1abc9c" stroke-width="1.5"/>
  <text x="130" y="82" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold">React Frontend</text>
  <text x="130" y="98" text-anchor="middle" fill="#d5f5e3" font-size="10">POST /api/analyze</text>

  <!-- Arrow Frontend to Server -->
  <line x1="210" y1="85" x2="290" y2="85" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal2)"/>
  <text x="250" y="78" text-anchor="middle" fill="#8ecae6" font-size="9">CaseConfiguration</text>

  <!-- Server -->
  <rect x="295" y="60" width="160" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="1.5"/>
  <text x="375" y="82" text-anchor="middle" fill="#16a085" font-size="13" font-weight="bold">Express Server</text>
  <text x="375" y="98" text-anchor="middle" fill="#8ecae6" font-size="10">Validate + SSE headers</text>

  <!-- Arrow Server to Backautocrat -->
  <line x1="375" y1="110" x2="375" y2="155" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber2)"/>
  <text x="395" y="138" fill="#f39c12" font-size="9">runPipeline(config, emitSSE)</text>

  <!-- Backautocrat -->
  <rect x="260" y="158" width="230" height="42" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="375" y="175" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">Backautocrat</text>
  <text x="375" y="192" text-anchor="middle" fill="#f39c12" font-size="10">Orchestrates rounds 1-5</text>

  <!-- Arrow to Round 1 fan-out -->
  <line x1="375" y1="200" x2="375" y2="240" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber2)"/>

  <!-- Round 1 parallel box -->
  <rect x="80" y="242" width="590" height="70" rx="6" fill="#0d0d1a" stroke="#e74c3c" stroke-width="1"/>
  <text x="105" y="262" fill="#e74c3c" font-size="11" font-weight="bold">Round 1 — Promise.allSettled() — N x M Parallel Extractors</text>

  <!-- Individual diplomat boxes -->
  <rect x="100" y="272" width="80" height="30" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="140" y="291" text-anchor="middle" fill="#e74c3c" font-size="9">D1 x S1</text>

  <rect x="195" y="272" width="80" height="30" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="235" y="291" text-anchor="middle" fill="#e74c3c" font-size="9">D1 x S2</text>

  <rect x="290" y="272" width="80" height="30" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="330" y="291" text-anchor="middle" fill="#e74c3c" font-size="9">D2 x S1</text>

  <text x="395" y="291" fill="#95a5a6" font-size="14">. . .</text>

  <rect x="430" y="272" width="80" height="30" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="470" y="291" text-anchor="middle" fill="#e74c3c" font-size="9">DN x SM</text>

  <!-- Claude API callout -->
  <rect x="545" y="265" width="110" height="40" rx="4" fill="#2c3e50" stroke="#95a5a6" stroke-width="1"/>
  <text x="600" y="283" text-anchor="middle" fill="#ecf0f1" font-size="9">Claude API</text>
  <text x="600" y="297" text-anchor="middle" fill="#95a5a6" font-size="8">claude-opus-4-6</text>

  <!-- Arrow R1 to Sequential rounds -->
  <line x1="375" y1="312" x2="375" y2="345" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber2)"/>
  <text x="420" y="332" fill="#8ecae6" font-size="9">ExtractionCell[]</text>

  <!-- Sequential rounds R2-R4 -->
  <rect x="180" y="347" width="140" height="32" rx="4" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="250" y="367" text-anchor="middle" fill="#e74c3c" font-size="10">R2: Synthesize</text>

  <line x1="320" y1="363" x2="360" y2="363" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrowAmber2)"/>

  <rect x="365" y="347" width="140" height="32" rx="4" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="435" y="367" text-anchor="middle" fill="#e74c3c" font-size="10">R3: Cross-Ref</text>

  <line x1="505" y1="363" x2="545" y2="363" stroke="#f39c12" stroke-width="1.5" marker-end="url(#arrowAmber2)"/>

  <rect x="550" y="347" width="120" height="32" rx="4" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="610" y="367" text-anchor="middle" fill="#e74c3c" font-size="10">R4: Rank</text>

  <!-- Arrow to R5 parallel -->
  <line x1="375" y1="379" x2="375" y2="415" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber2)"/>

  <!-- Round 5 parallel -->
  <rect x="140" y="417" width="470" height="55" rx="6" fill="#0d0d1a" stroke="#e74c3c" stroke-width="1"/>
  <text x="165" y="435" fill="#e74c3c" font-size="11" font-weight="bold">Round 5 — Promise.allSettled() — 2 Parallel Outputs</text>

  <rect x="160" y="445" width="190" height="22" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="255" y="460" text-anchor="middle" fill="#e74c3c" font-size="9">Visual Analytics Generator</text>

  <rect x="380" y="445" width="210" height="22" rx="3" fill="#1a1a2e" stroke="#e74c3c" stroke-width="1"/>
  <text x="485" y="460" text-anchor="middle" fill="#e74c3c" font-size="9">Impeachment Brief Generator</text>

  <!-- Arrow R5 to Backautocrat assembly -->
  <line x1="375" y1="472" x2="375" y2="502" stroke="#f39c12" stroke-width="2" marker-end="url(#arrowAmber2)"/>

  <!-- Backautocrat assembly -->
  <rect x="260" y="504" width="230" height="32" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="375" y="524" text-anchor="middle" fill="#f39c12" font-size="11">Assemble AnalysisRun</text>

  <!-- Arrow back to server -->
  <line x1="375" y1="536" x2="375" y2="560" stroke="#16a085" stroke-width="2" marker-end="url(#arrowTeal2)"/>

  <!-- SSE stream back to frontend -->
  <rect x="240" y="562" width="270" height="30" rx="6" fill="#16a085" stroke="#1abc9c" stroke-width="1.5"/>
  <text x="375" y="582" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">SSE Stream → Frontend Dashboard</text>

  <!-- SSE events callout -->
  <rect x="545" y="140" width="200" height="70" rx="4" fill="#0d0d1a" stroke="#16a085" stroke-width="1" stroke-dasharray="4"/>
  <text x="645" y="160" text-anchor="middle" fill="#16a085" font-size="10" font-weight="bold">SSE Events (real-time)</text>
  <text x="645" y="176" text-anchor="middle" fill="#8ecae6" font-size="9">round_start</text>
  <text x="645" y="190" text-anchor="middle" fill="#8ecae6" font-size="9">cell_complete (with metrics)</text>
  <text x="645" y="204" text-anchor="middle" fill="#8ecae6" font-size="9">round_complete</text>

  <!-- Dashed line from backautocrat to SSE callout -->
  <line x1="490" y1="179" x2="542" y2="179" stroke="#16a085" stroke-width="1" stroke-dasharray="4"/>
</svg>


---

**Key Takeaways**

- Use `tsx` for rapid development (instant execution from TypeScript source) and `tsc` for production compilation (full type checking, JavaScript output to `dist/`).
- Run `npm run typecheck` before every commit to catch type errors that `tsx` skips.
- Initialize Git at the project root. Stage files explicitly. Never use `git add .` in a project that handles secrets or privileged documents.
- The first commit contains only the scaffold: configuration files, types, and skeleton implementations. No API keys, no client data, no compiled output.


\newpage

## 3.10 The Reference Implementation: Deposition Contradiction Analysis


The deposition contradiction analysis pipeline is the reference implementation for this book. It demonstrates every concept covered in this chapter and every pattern covered in Chapters 4 through 7, in a single working system. This section maps the pipeline's architecture to the concepts introduced in this chapter so you can see how each piece connects.


### Architecture Summary


The pipeline processes a case configuration containing deposition transcripts, documentary exhibits, and legal subject definitions. It produces two deliverables: a visual analytics dashboard showing contradiction patterns, and a trial-ready impeachment preparation brief.


The pipeline executes in five rounds:


**Round 1** fires N times M parallel Claude calls (one per deponent-subject pair). With five deponents and six subjects, that is thirty simultaneous extraction calls. Each call reads one transcript and extracts every factual claim, admission, hedging instance, document reference, and notable absence related to one legal subject. The output is a grid of `ExtractionCell` objects.


**Round 2** fires M parallel calls (one per subject), each receiving all extraction cells for that subject. The synthesizer compares what different deponents said about the same subject, identifies contradictions, assesses credibility, and detects patterns. The output is an array of `SubjectSynthesis` objects, each containing an array of `Contradiction` objects.


**Round 3** is a single sequential call that receives all subject syntheses and finds cross-cutting contradictions: patterns that span multiple subjects and are invisible to single-subject analysis. A witness who testifies confidently about one subject but hedges extensively about a related subject may be exhibiting selective memory. Round 3 catches these patterns.


**Round 4** is a single sequential call that ranks every contradiction by materiality (relevance to claims, jury impact, documentary support, impeachment value) and assigns tiers 1 through 4. It also computes overall credibility scores for each witness.


**Round 5** fires two parallel calls: one generates structured visualization data (timeline, heatmap, network graph), the other generates the full impeachment brief with cross-examination questions for each witness.


### What This Teaches


The deposition pipeline teaches three things that this chapter has introduced and that subsequent chapters will explore in depth.


First, it demonstrates the separation of concerns in practice. The server handles HTTP and SSE. The backautocrat sequences rounds and manages parallelism. Each diplomat makes one kind of API call. The types define the contracts. The prompt library encodes domain expertise. No component knows how another component works. Each knows only the types of data it receives and the types of data it must produce.


Second, it demonstrates the full parallelization pattern. Round 1 runs thirty calls simultaneously. Round 2 runs six calls simultaneously. Round 5 runs two calls simultaneously. Rounds 3 and 4 run sequentially because they depend on all previous output. This mix of parallel and sequential execution is the standard pattern for multi-round legal engineering pipelines, covered in full in Chapter 4.


Third, it demonstrates the prompt composition architecture. The same extraction diplomat handles securities fraud cases, antitrust cases, patent cases, and seven other practice groups. The pipeline code is identical across all ten. Only the practice group lens in the prompt library changes. This separation of architecture from domain expertise is what makes legal engineering pipelines reusable across verticals.


The complete source code is available at github.com/TaylorLegalEngineering/deposition-contradiction-analysis. Clone it, read every file, and run the sample case. Every pattern in this chapter is visible in that codebase, and every pattern in the chapters that follow builds on what you see there.


---

**Key Takeaways**

- The deposition contradiction analysis pipeline is the reference implementation for this book: five rounds, seven diplomats, thirty parallel calls, two deliverables.
- It demonstrates separation of concerns, parallel execution, and prompt composition in a single working system.
- The same pipeline architecture handles ten practice groups by varying only the prompt library's practice group lens.
- Clone the repository and read every file. It is the concrete foundation for every abstract concept in this book.


\newpage
