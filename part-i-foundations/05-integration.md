\newpage

# Chapter 5: Integration

*MCP, A2A, OOXML, SSE, APIs, and Event-Driven Architecture*

The previous four chapters built the conceptual and architectural foundation for legal
engineering: the TIRO decomposition pattern, the technology stack, project configuration,
and the orchestration pattern taxonomy. You know how to design a multi-agent pipeline,
how to structure diplomats and backautocrats, and how to run them in parallel. But a
pipeline that exists in isolation is a pipeline that serves no one. This chapter is
about the seams: the points where your pipeline connects to the outside world.


Integration is the discipline of connecting your pipeline to everything it needs to
consume, everything it needs to produce, and everything that needs to observe it while
it runs. A legal engineering pipeline consumes documents, playbooks, and case law. It
produces redlined Word files, analysis reports, and structured data. While it runs,
attorneys need to watch its progress, external systems need to receive notifications,
and databases need to capture results. Each of these connections is an integration
point, and each requires a pattern that is reliable, typed, and secure.


This chapter covers eight integration domains. First, the Model Context Protocol (MCP),
the universal standard for connecting AI agents to tools and data, now supported by every
major AI platform. Second, how to build production MCP servers that expose legal
engineering capabilities. Third, the Agent-to-Agent (A2A) protocol for cross-organizational
agent communication. Fourth, OOXML Track Changes surgery, the mechanism that produces
Word documents attorneys actually use. Fifth, Server-Sent Events for real-time pipeline
progress streaming. Sixth, MongoDB for persistent storage of analysis results and
pipeline metadata. Seventh, Express API design for exposing pipeline capabilities as
REST endpoints. Eighth, webhook and event-driven patterns for integrating with external
systems like Slack, calendar services, and email.


Every integration pattern in this chapter appears in production in Part II. The MCP
server pattern from Section 5.2 is how Claude Desktop users access contract analysis.
The OOXML surgery from Section 5.4 powers every redlining pipeline in Chapter 8. The
SSE streaming from Section 5.5 is what attorneys watch during every multi-round analysis.
The database patterns from Section 5.6 store every result from every pipeline run. The
API routes from Section 5.7 are the entry points for every workflow. None of these
patterns are optional. A legal engineering pipeline without integration is a prototype.
A legal engineering pipeline with integration is a product.


> **What Changed from V1 to V2**
>
> The first edition of this chapter covered OOXML integration and SSE streaming. Those
> topics remain, but the landscape has transformed. MCP did not exist when V1 was
> published. It was released by Anthropic in November 2024, donated to the Linux
> Foundation in December 2025, and adopted by every major AI platform within fourteen
> months. A2A was announced by Google and donated to the same Linux Foundation group.
> This edition restructures the chapter around MCP as the primary integration mechanism,
> adds A2A for cross-organizational workflows, and expands the API, webhook, and
> database patterns to reflect production lessons from two years of legal AI deployment.

> **Integration Is the Multiplier**
>
> A brilliant AI pipeline that cannot deliver output in the format clients expect is
> worthless. A mediocre pipeline with excellent integration (proper document handling,
> reliable streaming, clean API contracts, robust persistence) ships and earns revenue.
> Integration is not a secondary concern. It is the difference between a research
> prototype and a production system.


\newpage


## 5.1 MCP: The Model Context Protocol


### The Integration Problem MCP Solves


Before MCP, every AI integration was bespoke. If you wanted Claude to search your
contract repository, you wrote a custom tool. If you wanted ChatGPT to access the same
repository, you wrote a different custom tool with a different API, different
authentication, and different schema. If you wanted Cursor to use that repository while
you coded, you wrote a third integration. Each AI platform had its own plugin system,
its own extension format, and its own way of describing available capabilities. The
result was an N-times-M integration problem: N AI platforms times M tools, each requiring
a unique implementation.


MCP collapses this multiplication into an N-plus-M problem. Every AI client implements
one protocol: MCP client. Every tool or data source implements one protocol: MCP server.
Any client can talk to any server. Build one MCP server that exposes your contract
repository, and every MCP-compatible client can use it: Claude Desktop, Claude Code,
ChatGPT, Gemini, Cursor, VS Code, Windsurf, and any other platform that implements the
MCP client specification. Write once, integrate everywhere.


The analogy is USB. Before USB, every peripheral had its own proprietary connector and
driver format. USB defined one standard. Plug anything into anything. MCP is USB for
AI agents.


> **Key Concept**
>
> MCP is to AI tools what HTTP is to web pages. HTTP defined a universal protocol for
> retrieving documents, and every web browser implements it. MCP defines a universal
> protocol for AI tool access, and every AI platform implements it. The analogy is
> precise: before HTTP, every information system had its own retrieval protocol. Before
> MCP, every AI platform had its own tool integration format. Standardization is what
> turns a fragmented ecosystem into an interoperable platform.


### Scale and Governance


MCP was launched by Anthropic in November 2024. Within fourteen months, it was adopted
by every major AI platform and development tool. By early 2026, the MCP TypeScript SDK
alone exceeded 97 million monthly downloads on npm. Over 10,000 active MCP servers were
published and maintained by the community. In December 2025, Anthropic donated MCP to
the Linux Foundation's Agentic AI Foundation, establishing it as a vendor-neutral open
standard governed by the same organization that stewards Linux, Kubernetes, and Node.js.


These numbers matter because they answer the question every engineer asks before adopting
a standard: "Will this still exist in two years?" MCP is not a startup experiment. It
is an industry standard with Linux Foundation governance, universal platform adoption,
and a developer community producing thousands of integrations. When you build an MCP
server for your legal engineering pipeline, you are building on infrastructure that the
entire AI industry has committed to supporting.


### Core Architecture


MCP follows a client-server architecture with three primitive types and a transport
layer that handles communication.


**Resources** are data that the AI agent can read. A contract stored in your document
management system is a resource. A playbook containing your firm's negotiation positions
is a resource. A collection of case law citations relevant to a particular jurisdiction
is a resource. Resources are identified by URI templates (like `contract://abc123/text`
or `playbook://saas/party-a`), which means the agent can discover and navigate them
programmatically. Resources are read-only: the agent accesses them for context but does
not modify them through the resource interface.


**Tools** are actions the AI agent can perform. Searching your contract repository is
a tool. Running a risk analysis pipeline on a specific agreement is a tool. Generating
a redlined Word document is a tool. Filing a document with a court system is a tool.
Tools are the verbs of MCP: they take parameters described by JSON Schema, execute
operations, and return results. When an AI agent decides it needs to analyze a contract,
it calls the `analyze_contract` tool with the appropriate parameters.


**Prompts** are pre-built instruction templates for common tasks. A prompt might define
the standard workflow for reviewing an NDA: which tools to call in which order, what
parameters to use, and how to present results. Prompts are optional but valuable for
encoding institutional knowledge about how tools should be composed. A `redline-review`
prompt might include the firm's standard review criteria, preferred negotiation
positions, and output format requirements.


**Transport** is the communication layer between client and server. MCP supports two
transport modes. **stdio** runs the server as a subprocess of the client, communicating
through standard input and output. This is the simplest deployment model: no network
configuration, no authentication, no firewall rules. When you configure Claude Desktop
to use your legal document server, it starts your server process and sends JSON-RPC
messages through stdin, receiving responses through stdout. **Streamable HTTP** runs the
server as an HTTP service, communicating through HTTP requests with Server-Sent Events
for streaming responses. This is the deployment model for production environments where
the server runs on a remote machine, serves multiple clients, and needs authentication.


```svg
<svg viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="mcp-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#1a1a2e" font-weight="bold">Figure 5.1 — MCP Client-Server Architecture</text>

  <!-- MCP Client Box -->
  <rect x="40" y="60" width="280" height="400" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="180" y="90" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="white" font-weight="bold">MCP Client (AI Platform)</text>
  <line x1="60" y1="100" x2="300" y2="100" stroke="#16a085" stroke-width="1"/>

  <!-- Client items -->
  <rect x="60" y="120" width="240" height="50" rx="4" fill="#2d2d4e"/>
  <text x="180" y="150" text-anchor="middle" font-family="monospace" font-size="11" fill="#16a085">Claude Desktop / Code</text>

  <rect x="60" y="185" width="240" height="50" rx="4" fill="#2d2d4e"/>
  <text x="180" y="215" text-anchor="middle" font-family="monospace" font-size="11" fill="#16a085">ChatGPT / Gemini</text>

  <rect x="60" y="250" width="240" height="50" rx="4" fill="#2d2d4e"/>
  <text x="180" y="280" text-anchor="middle" font-family="monospace" font-size="11" fill="#16a085">Cursor / VS Code</text>

  <rect x="60" y="315" width="240" height="50" rx="4" fill="#2d2d4e"/>
  <text x="180" y="345" text-anchor="middle" font-family="monospace" font-size="11" fill="#16a085">Any MCP-Compatible Client</text>

  <rect x="60" y="385" width="240" height="55" rx="4" fill="#2d2d4e"/>
  <text x="180" y="410" text-anchor="middle" font-family="monospace" font-size="10" fill="#f39c12">Universal Protocol:</text>
  <text x="180" y="428" text-anchor="middle" font-family="monospace" font-size="10" fill="white">tools/list → tools/call</text>

  <!-- Protocol arrows -->
  <line x1="320" y1="180" x2="560" y2="180" stroke="#16a085" stroke-width="2" marker-end="url(#mcp-arrow)"/>
  <text x="440" y="170" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">JSON-RPC 2.0</text>

  <line x1="560" y1="220" x2="320" y2="220" stroke="#16a085" stroke-width="2" marker-end="url(#mcp-arrow)"/>
  <text x="440" y="245" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">Results / Resources</text>

  <!-- MCP Server Box -->
  <rect x="580" y="60" width="280" height="400" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="720" y="90" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="white" font-weight="bold">MCP Server (Your Code)</text>
  <line x1="600" y1="100" x2="840" y2="100" stroke="#16a085" stroke-width="1"/>

  <!-- Server primitives -->
  <rect x="600" y="120" width="240" height="70" rx="4" fill="#2d2d4e"/>
  <text x="720" y="145" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#16a085" font-weight="bold">Resources (Read)</text>
  <text x="720" y="165" text-anchor="middle" font-family="monospace" font-size="9" fill="white">contracts, playbooks, case law</text>
  <text x="720" y="180" text-anchor="middle" font-family="monospace" font-size="9" fill="white">metadata, firm policies</text>

  <rect x="600" y="205" width="240" height="70" rx="4" fill="#2d2d4e"/>
  <text x="720" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#f39c12" font-weight="bold">Tools (Execute)</text>
  <text x="720" y="250" text-anchor="middle" font-family="monospace" font-size="9" fill="white">analyze, redline, search</text>
  <text x="720" y="265" text-anchor="middle" font-family="monospace" font-size="9" fill="white">draft, file, extract</text>

  <rect x="600" y="290" width="240" height="70" rx="4" fill="#2d2d4e"/>
  <text x="720" y="315" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#e74c3c" font-weight="bold">Prompts (Templates)</text>
  <text x="720" y="335" text-anchor="middle" font-family="monospace" font-size="9" fill="white">review-nda, analyze-mac</text>
  <text x="720" y="350" text-anchor="middle" font-family="monospace" font-size="9" fill="white">draft-redline, risk-score</text>

  <!-- Transport label -->
  <rect x="600" y="375" width="240" height="65" rx="4" fill="#2d2d4e"/>
  <text x="720" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="white" font-weight="bold">Transport</text>
  <text x="720" y="418" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">stdio (local)</text>
  <text x="720" y="433" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">Streamable HTTP (remote)</text>
</svg>
```


### The JSON-RPC Protocol Layer


All MCP communication uses JSON-RPC 2.0, the same protocol used by the Language Server
Protocol (LSP) that powers code intelligence in every modern editor. A client sends a
request with a method name and parameters. The server responds with a result or an error.
The protocol is stateless at the message level but supports stateful sessions through
connection persistence.


When a client connects to your MCP server, the first exchange is capability negotiation.
The client sends an `initialize` request. The server responds with its capabilities:
which tools it provides, which resources it exposes, which prompts it offers. The client
then knows exactly what the server can do, and it presents those capabilities to the AI
model as available tools.


A tool call follows a two-step flow. First, the AI model decides it needs to use a tool
and generates a `tools/call` request with the tool name and arguments. The MCP client
sends this request to the server. The server executes the tool (searching a contract
repository, running a pipeline, querying a database) and returns the result. The MCP
client passes the result back to the AI model, which incorporates it into its response
to the user.


> **Insight**
>
> MCP tool calls are semantically identical to the diplomat pattern from Chapter 4.
> The AI model is the backautocrat: it decides which tools (diplomats) to invoke, with
> what parameters, in what order. Each MCP tool is a diplomat with a defined interface.
> The difference is that MCP tools are external to the model's process rather than
> embedded in a pipeline, and they are discoverable at runtime rather than hardcoded
> at build time. Understanding this equivalence means you can take any diplomat from
> a pipeline and expose it as an MCP tool, or take any MCP tool and embed it in a
> pipeline as a diplomat.


### Why MCP Matters for Legal Engineering


The strategic value of MCP for legal engineering goes beyond convenience. It changes
the deployment model.


Without MCP, a legal AI product needs a custom frontend. You build a React dashboard,
handle authentication, manage file uploads, display pipeline progress, and serve
deliverables. Every client interaction flows through your UI. This is fine for a SaaS
product with a defined user experience, but it creates a bottleneck: the pipeline's
capabilities are locked behind a specific interface.


With MCP, the pipeline's capabilities are exposed as tools that any AI agent can invoke.
An attorney using Claude Desktop can say "analyze the NDA on my desktop and tell me
about the non-compete" and Claude will call your MCP server's tools to do it. A developer
using Cursor can integrate contract analysis into their code review workflow. A legal
operations team can build custom automation using any MCP-compatible orchestration
framework. The pipeline becomes infrastructure, not a product. And infrastructure scales
differently than products.


\newpage


## 5.2 Building MCP Servers for Legal Systems


### The Production Example: A Legal Document Server


The following implementation builds a complete MCP server that exposes contract analysis
capabilities to any MCP-compatible AI platform. An attorney using Claude Desktop can
say "search our contract repository for SaaS agreements with uncapped indemnification"
and the model will invoke the server's search tool, retrieve matching contracts, and
present the results. The attorney can then say "analyze the Acme agreement for
customer-side risks" and the model will invoke the analysis tool, run the pipeline, and
return results within the conversation.


This is a complete, production-ready server. It handles tool registration, input
validation, error responses, and typed results. Every pattern shown here applies to
any MCP server you build for legal systems.


### Project Setup


An MCP server is a standard Node.js application with two additional dependencies: the
MCP SDK for protocol handling and Zod for input validation schemas.


```json
// package.json
{
  "name": "@firm/legal-document-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "legal-document-server": "./dist/server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0",
    "mongodb": "^6.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```


### Type Definitions


Every MCP server starts with type definitions that describe the domain. These types
enforce the shape of data flowing through every tool call. A tool that searches for
contracts returns typed results. A tool that runs analysis accepts typed parameters.
The compiler catches mismatches before runtime.


```typescript
// types.ts
// Type definitions for the legal document MCP server

export interface ContractMetadata {
  contractId: string;
  title: string;
  vertical: ContractVertical;
  parties: ContractParty[];
  effectiveDate: string;
  expirationDate: string | null;
  governingLaw: string;
  filePath: string;
  addedAt: string;
  wordCount: number;
  tokenEstimate: number;
}

export interface ContractParty {
  name: string;
  role: 'customer' | 'vendor' | 'buyer' | 'seller'
    | 'licensor' | 'licensee' | 'landlord' | 'tenant';
  jurisdiction: string;
}

export type ContractVertical =
  | 'saas'
  | 'ma'
  | 'vc'
  | 'employment'
  | 'nda'
  | 'equipment-lease'
  | 'commercial-lease'
  | 'professional-services'
  | 'ip-license';

export interface SearchResult {
  contracts: ContractMetadata[];
  totalMatches: number;
  query: string;
  searchDurationMs: number;
}

export interface AnalysisResult {
  analysisId: string;
  contractId: string;
  vertical: ContractVertical;
  riskScore: number;
  findings: Finding[];
  tokenUsage: { input: number; output: number };
  costUsd: number;
  durationMs: number;
  completedAt: string;
}

export interface Finding {
  findingId: string;
  category: string;
  clauseReference: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  citation: string | null;
}
```


### Server Implementation


The MCP SDK provides a `McpServer` class that handles protocol negotiation, transport
management, and message routing. You register tools and resources on this server
instance. Each tool registration includes a name, a description (which the AI model
reads to understand when to use the tool), an input schema (validated with Zod), and
a handler function that executes the tool's logic.


```typescript
// server.ts
import { McpServer } from
  '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from
  '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { MongoClient, type Db } from 'mongodb';
import type {
  ContractMetadata,
  SearchResult,
  AnalysisResult,
  ContractVertical
} from './types.js';

// ---------- Database Connection ----------

let db: Db;

async function connectToDatabase(): Promise<Db> {
  const client = new MongoClient(
    process.env.MONGODB_URI
      ?? 'mongodb://localhost:27017'
  );
  await client.connect();
  return client.db('legal-documents');
}

// ---------- Server Initialization ----------

const server = new McpServer({
  name: 'legal-document-server',
  version: '1.0.0'
});

// ---------- Tool: Search Contracts ----------

server.tool(
  'search_contracts',
  `Search the contract repository by vertical, party name, `
  + `governing law, date range, or free text. Returns matching `
  + `contract metadata including parties, dates, and risk `
  + `indicators. Use this tool when the user asks about `
  + `specific contracts or wants to find agreements matching `
  + `certain criteria.`,
  {
    query: z.string()
      .describe('Free text search query'),
    vertical: z.enum([
      'saas', 'ma', 'vc', 'employment', 'nda',
      'equipment-lease', 'commercial-lease',
      'professional-services', 'ip-license'
    ]).optional()
      .describe('Filter by contract vertical'),
    partyName: z.string().optional()
      .describe('Filter by party name (partial match)'),
    governingLaw: z.string().optional()
      .describe('Filter by governing law jurisdiction'),
    dateFrom: z.string().optional()
      .describe('Effective date on or after (ISO 8601)'),
    dateTo: z.string().optional()
      .describe('Effective date on or before (ISO 8601)'),
    limit: z.number().min(1).max(50).default(10)
      .describe('Maximum results to return')
  },
  async (params) => {
    const start = Date.now();

    // Build MongoDB query from parameters
    const filter: Record<string, unknown> = {};

    if (params.vertical) {
      filter.vertical = params.vertical;
    }
    if (params.partyName) {
      filter['parties.name'] = {
        $regex: params.partyName,
        $options: 'i'
      };
    }
    if (params.governingLaw) {
      filter.governingLaw = {
        $regex: params.governingLaw,
        $options: 'i'
      };
    }
    if (params.dateFrom || params.dateTo) {
      filter.effectiveDate = {};
      if (params.dateFrom) {
        (filter.effectiveDate as Record<string, string>)
          .$gte = params.dateFrom;
      }
      if (params.dateTo) {
        (filter.effectiveDate as Record<string, string>)
          .$lte = params.dateTo;
      }
    }

    // Text search if query is provided
    if (params.query) {
      filter.$text = { $search: params.query };
    }

    const contracts = await db
      .collection<ContractMetadata>('contracts')
      .find(filter)
      .limit(params.limit)
      .sort({ effectiveDate: -1 })
      .toArray();

    const result: SearchResult = {
      contracts,
      totalMatches: contracts.length,
      query: params.query,
      searchDurationMs: Date.now() - start
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

// ---------- Tool: Get Contract Text ----------

server.tool(
  'get_contract_text',
  `Retrieve the full text of a specific contract by its ID. `
  + `Use this after search_contracts to read the actual `
  + `content of a contract the user wants to review or `
  + `analyze. Returns the complete contract text along with `
  + `metadata.`,
  {
    contractId: z.string()
      .describe('The unique contract identifier')
  },
  async (params) => {
    const contract = await db
      .collection<ContractMetadata & { fullText: string }>(
        'contracts'
      )
      .findOne({ contractId: params.contractId });

    if (!contract) {
      return {
        content: [{
          type: 'text' as const,
          text: `No contract found with ID: `
            + `${params.contractId}`
        }],
        isError: true
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `Contract: ${contract.title}\n`
          + `Vertical: ${contract.vertical}\n`
          + `Parties: ${contract.parties
              .map(p => `${p.name} (${p.role})`)
              .join(', ')}\n`
          + `Governing Law: ${contract.governingLaw}\n`
          + `Effective: ${contract.effectiveDate}\n`
          + `Word Count: ${contract.wordCount}\n\n`
          + `--- FULL TEXT ---\n\n`
          + contract.fullText
      }]
    };
  }
);

// ---------- Tool: Get Playbook ----------

server.tool(
  'get_playbook',
  `Retrieve the negotiation playbook for a specific contract `
  + `vertical and party perspective. Playbooks contain the `
  + `firm's standard positions, fallback language, and `
  + `escalation thresholds. Use this when the user wants to `
  + `review a contract against firm standards or prepare for `
  + `a negotiation.`,
  {
    vertical: z.enum([
      'saas', 'ma', 'vc', 'employment', 'nda',
      'equipment-lease', 'commercial-lease',
      'professional-services', 'ip-license'
    ]).describe('Contract vertical'),
    perspective: z.enum(['party-a', 'party-b'])
      .describe('Negotiation perspective')
  },
  async (params) => {
    const playbook = await db
      .collection('playbooks')
      .findOne({
        vertical: params.vertical,
        perspective: params.perspective
      });

    if (!playbook) {
      return {
        content: [{
          type: 'text' as const,
          text: `No playbook found for `
            + `${params.vertical} / ${params.perspective}`
        }],
        isError: true
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(playbook.content, null, 2)
      }]
    };
  }
);

// ---------- Tool: Analyze Contract ----------

server.tool(
  'analyze_contract',
  `Run a full risk analysis pipeline on a contract. This `
  + `triggers a multi-agent analysis using parallel specialist `
  + `diplomats, producing risk scores, findings, and `
  + `recommendations. Use this when the user wants a `
  + `comprehensive contract review. Returns a structured `
  + `analysis with categorized findings and risk levels.`,
  {
    contractId: z.string()
      .describe('Contract to analyze'),
    perspective: z.enum(['party-a', 'party-b'])
      .describe('Which party perspective to analyze from'),
    focusAreas: z.array(z.string()).optional()
      .describe(
        'Specific areas to focus on, e.g., '
        + '"indemnification", "IP rights"'
      )
  },
  async (params) => {
    // Retrieve contract text
    const contract = await db
      .collection<ContractMetadata & { fullText: string }>(
        'contracts'
      )
      .findOne({ contractId: params.contractId });

    if (!contract) {
      return {
        content: [{
          type: 'text' as const,
          text: `No contract found with ID: `
            + `${params.contractId}`
        }],
        isError: true
      };
    }

    // Run analysis pipeline
    // (calls the backautocrat from Chapter 4)
    const analysis = await runAnalysisPipeline({
      contractText: contract.fullText,
      vertical: contract.vertical,
      perspective: params.perspective,
      focusAreas: params.focusAreas ?? []
    });

    // Persist results
    await db.collection<AnalysisResult>('analyses')
      .insertOne(analysis);

    // Format results for the AI model
    const summary = [
      `Analysis Complete: ${contract.title}`,
      `Risk Score: ${analysis.riskScore}/100`,
      `Findings: ${analysis.findings.length} total`,
      `  Critical: ${analysis.findings
        .filter(f => f.riskLevel === 'critical').length}`,
      `  High: ${analysis.findings
        .filter(f => f.riskLevel === 'high').length}`,
      `  Medium: ${analysis.findings
        .filter(f => f.riskLevel === 'medium').length}`,
      `  Low: ${analysis.findings
        .filter(f => f.riskLevel === 'low').length}`,
      `Cost: $${analysis.costUsd.toFixed(2)}`,
      `Duration: ${(analysis.durationMs / 1000)
        .toFixed(1)}s`,
      '',
      '--- FINDINGS ---',
      ''
    ];

    for (const finding of analysis.findings) {
      summary.push(
        `[${finding.riskLevel.toUpperCase()}] `
        + `${finding.category}`,
        `  Clause: ${finding.clauseReference}`,
        `  ${finding.description}`,
        `  Recommendation: ${finding.recommendation}`,
        finding.citation
          ? `  Citation: ${finding.citation}` : '',
        ''
      );
    }

    return {
      content: [{
        type: 'text' as const,
        text: summary.join('\n')
      }]
    };
  }
);

// ---------- Resource: Recent Analyses ----------

server.resource(
  'recent-analyses',
  'analyses://recent',
  async (uri) => {
    const analyses = await db
      .collection<AnalysisResult>('analyses')
      .find({})
      .sort({ completedAt: -1 })
      .limit(20)
      .project({
        analysisId: 1, contractId: 1,
        vertical: 1, riskScore: 1, completedAt: 1
      })
      .toArray();

    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(analyses, null, 2)
      }]
    };
  }
);

// ---------- Start the Server ----------

async function main(): Promise<void> {
  db = await connectToDatabase();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    'Legal Document MCP Server running on stdio'
  );
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
```


### Connecting to Claude Desktop


With the server built and compiled, connecting it to Claude Desktop requires a single
configuration entry. Claude Desktop reads its MCP server configuration from a JSON file
and launches each configured server as a child process on startup.


```json
// claude_desktop_config.json
{
  "mcpServers": {
    "legal-documents": {
      "command": "node",
      "args": [
        "/path/to/legal-document-server/dist/server.js"
      ],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017"
      }
    }
  }
}
```


Once configured, Claude Desktop starts the server process, performs capability
negotiation, and presents the server's tools to the AI model. When an attorney asks
Claude a question that requires contract data, the model recognizes the available tools
and invokes them. The attorney never interacts with the MCP protocol directly. They
ask questions in natural language and the model orchestrates the tool calls.


> **Practice Tip**
>
> When writing MCP tool descriptions, write them for the AI model, not the human.
> The model reads these descriptions to decide when to use each tool. Be explicit about
> what the tool does, what parameters it accepts, and when it should be used. Vague
> descriptions like "contract tool" produce poor tool selection. Specific descriptions
> like "search the contract repository by vertical, party name, governing law, or
> free text; returns matching contract metadata" produce precise, reliable tool
> invocation. The `description` field on each tool and each property is not decorative.
> It is the primary mechanism by which the AI agent understands your system.


### Legal MCP Server Patterns


The contract repository server above is one pattern. Legal engineering systems
commonly expose five categories of MCP servers, each serving a different integration
need.


**Contract Repository Servers** expose search, retrieval, and metadata extraction for
agreement banks. These are the most common legal MCP servers because every legal
engineering workflow starts with documents. The server above is this pattern.


**Playbook Servers** expose firm-specific negotiation positions, fallback language, and
escalation thresholds. When an AI agent reviews a contract, it retrieves the relevant
playbook through an MCP tool call and applies the firm's standards to its analysis. This
separates institutional knowledge (the playbook) from analytical capability (the model),
allowing playbooks to be updated independently of pipeline code.


**Pipeline Trigger Servers** expose full pipeline runs as MCP tools. Instead of
searching and reading contracts, these servers trigger multi-agent analysis pipelines
and return structured results. The `analyze_contract` tool in the implementation above
is this pattern. The key design decision is whether the tool blocks until the pipeline
completes (synchronous) or returns immediately with a run ID that the model can poll
(asynchronous). For pipelines that complete in under 60 seconds, synchronous is simpler.
For multi-round pipelines that take three to five minutes, asynchronous with polling is
necessary to avoid timeout.


**Document Management Servers** bridge the gap between your pipeline and the firm's
existing document management system, whether iManage, NetDocuments, or SharePoint.
These servers translate MCP tool calls into DMS API calls: searching for documents,
checking them out for analysis, and filing results back. The MCP server becomes the
integration layer that lets any AI agent access the firm's document infrastructure.


**Research Servers** expose legal research capabilities: case law search, statute
lookup, regulatory guidance retrieval. These servers connect to Westlaw, LexisNexis,
or internal research databases through their respective APIs, translating natural
language research queries from the AI model into structured API calls.


### Publishing to npm


MCP servers can be published to npm for community or commercial distribution. The
`bin` field in `package.json` makes the server executable as a command-line tool.
After publishing, any user can install and configure it:


```bash
# Install the published MCP server
npm install -g @firm/legal-document-server

# The server is now available as a command
# Configure in Claude Desktop with the binary name
```


The npm distribution model means your MCP server becomes a product. A legal technology
company can build a contract analysis MCP server, publish it, and any attorney with
Claude Desktop can install it and begin using contract analysis tools in their
conversations. No custom integration, no IT department, no enterprise sales cycle.
Install, configure, use.


\newpage


## 5.3 Agent-to-Agent (A2A) Protocol


### Beyond Tool Integration


MCP connects AI agents to tools and data. But what happens when two AI agents need to
communicate with each other? When a corporate legal department's contract review agent
needs to send findings to outside counsel's redlining agent? When one firm's due
diligence pipeline needs to request documents from another firm's document management
agent? These are agent-to-agent interactions, and they require a different protocol.


The Agent-to-Agent (A2A) protocol, developed by Google and donated to the Linux
Foundation's Agentic AI Foundation in 2025, defines how independent AI agents discover
each other, negotiate capabilities, and exchange work. If MCP is the standard for what
an agent can do (its tools), A2A is the standard for how agents collaborate (their
communication).


> **Key Concept**
>
> MCP and A2A are complementary protocols solving different problems. MCP answers:
> "What tools does this agent have access to?" A2A answers: "How do two agents
> coordinate work between them?" A legal engineering system uses MCP to connect to
> its contract repository, playbook database, and research platform. It uses A2A to
> communicate with agents at other organizations: opposing counsel, regulatory bodies,
> court systems, or co-counsel on a multi-party transaction. MCP is internal plumbing.
> A2A is external diplomacy.


### Core Architecture


A2A is built on four concepts: Agent Cards, Tasks, Messages, and Artifacts.


**Agent Cards** are JSON documents that describe an agent's capabilities, endpoints,
and authentication requirements. They function as a public profile: any agent that
retrieves another agent's card knows what that agent can do and how to communicate
with it. Agent Cards are served at a well-known URL
(`/.well-known/agent.json`), making discovery automatic.


```json
// .well-known/agent.json
{
  "name": "TLE Contract Review Agent",
  "description": "Multi-agent contract analysis pipeline "
    + "producing risk scores, findings, and redlines",
  "url": "https://api.firm.com/a2a",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true
  },
  "skills": [
    {
      "id": "contract-analysis",
      "name": "Contract Risk Analysis",
      "description": "Analyzes contracts for risks from "
        + "a specified party perspective using parallel "
        + "specialist diplomats",
      "inputModes": ["application/json"],
      "outputModes": [
        "application/json",
        "application/vnd.openxmlformats-officedocument"
        + ".wordprocessingml.document"
      ]
    }
  ],
  "authentication": {
    "schemes": ["oauth2"]
  }
}
```


**Tasks** are stateful work units. One agent creates a task and sends it to another.
The receiving agent processes it and updates its status. Tasks flow through a defined
lifecycle: `submitted`, `working`, `input-required`, `completed`, or `failed`. The
`input-required` state is critical for legal workflows: it represents the point where
the receiving agent needs additional information (a missing exhibit, a clarification
on party perspective, an authorization to proceed) before it can continue.


**Messages** carry content between agents within a task. Each message has a role
(`user` or `agent`) and one or more content parts (text, files, structured data).
Messages form a conversation history within the task, allowing multi-turn interactions.


**Artifacts** are the deliverables produced by task completion. When a contract review
task completes, the artifacts might include a JSON analysis report and a redlined Word
document. Artifacts are typed by MIME type, allowing the requesting agent to specify
what output format it needs.


```svg
<svg viewBox="0 0 900 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="a2a-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="a2a-arrow-amber" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#1a1a2e" font-weight="bold">Figure 5.2 — A2A Task Lifecycle for Cross-Firm Contract Review</text>

  <!-- Client Agent Box -->
  <rect x="30" y="60" width="250" height="390" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="155" y="88" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="white" font-weight="bold">In-House Legal Agent</text>
  <text x="155" y="106" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">(Client / Task Creator)</text>
  <line x1="50" y1="115" x2="260" y2="115" stroke="#16a085" stroke-width="1"/>

  <rect x="50" y="130" width="210" height="35" rx="4" fill="#2d2d4e"/>
  <text x="155" y="152" text-anchor="middle" font-family="monospace" font-size="10" fill="white">1. Discover agent card</text>

  <rect x="50" y="180" width="210" height="35" rx="4" fill="#2d2d4e"/>
  <text x="155" y="202" text-anchor="middle" font-family="monospace" font-size="10" fill="white">2. Create task + message</text>

  <rect x="50" y="280" width="210" height="35" rx="4" fill="#2d2d4e" stroke="#f39c12" stroke-width="1"/>
  <text x="155" y="302" text-anchor="middle" font-family="monospace" font-size="10" fill="#f39c12">4. Provide missing exhibit</text>

  <rect x="50" y="380" width="210" height="50" rx="4" fill="#2d2d4e"/>
  <text x="155" y="400" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">6. Receive artifacts:</text>
  <text x="155" y="418" text-anchor="middle" font-family="monospace" font-size="10" fill="white">analysis.json + redline.docx</text>

  <!-- Server Agent Box -->
  <rect x="620" y="60" width="250" height="390" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="745" y="88" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="white" font-weight="bold">Outside Counsel Agent</text>
  <text x="745" y="106" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">(Server / Task Processor)</text>
  <line x1="640" y1="115" x2="850" y2="115" stroke="#16a085" stroke-width="1"/>

  <rect x="640" y="130" width="210" height="35" rx="4" fill="#2d2d4e"/>
  <text x="745" y="152" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Serve agent card</text>

  <rect x="640" y="210" width="210" height="55" rx="4" fill="#2d2d4e"/>
  <text x="745" y="230" text-anchor="middle" font-family="monospace" font-size="10" fill="white">3. Process task</text>
  <text x="745" y="248" text-anchor="middle" font-family="monospace" font-size="10" fill="#f39c12">status: input-required</text>
  <text x="745" y="260" text-anchor="middle" font-family="monospace" font-size="9" fill="white">"Missing Exhibit B"</text>

  <rect x="640" y="310" width="210" height="55" rx="4" fill="#2d2d4e"/>
  <text x="745" y="330" text-anchor="middle" font-family="monospace" font-size="10" fill="white">5. Resume analysis</text>
  <text x="745" y="348" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">status: working</text>

  <rect x="640" y="380" width="210" height="50" rx="4" fill="#2d2d4e"/>
  <text x="745" y="400" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">status: completed</text>
  <text x="745" y="418" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Return artifacts</text>

  <!-- Arrows -->
  <line x1="260" y1="147" x2="640" y2="147" stroke="#16a085" stroke-width="1.5" marker-end="url(#a2a-arrow)" stroke-dasharray="6,4"/>
  <line x1="260" y1="197" x2="640" y2="230" stroke="#16a085" stroke-width="1.5" marker-end="url(#a2a-arrow)"/>
  <line x1="640" y1="250" x2="260" y2="297" stroke="#f39c12" stroke-width="1.5" marker-end="url(#a2a-arrow-amber)"/>
  <line x1="260" y1="297" x2="640" y2="330" stroke="#f39c12" stroke-width="1.5" marker-end="url(#a2a-arrow-amber)"/>
  <line x1="640" y1="405" x2="260" y2="405" stroke="#16a085" stroke-width="2" marker-end="url(#a2a-arrow)"/>

  <!-- Labels -->
  <text x="440" y="190" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">tasks/send</text>
  <text x="415" y="270" text-anchor="middle" font-family="monospace" font-size="9" fill="#f39c12">input-required</text>
  <text x="415" y="310" text-anchor="middle" font-family="monospace" font-size="9" fill="#f39c12">tasks/send (reply)</text>
  <text x="440" y="398" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">artifacts</text>
</svg>
```


### Legal Applications for A2A


A2A's value in legal engineering is cross-organizational workflow orchestration. Four
patterns recur across legal practice.


**Cross-firm document review.** Corporate in-house counsel runs an initial contract
review with their own pipeline. The pipeline identifies issues requiring outside
counsel's expertise (tax structuring, regulatory compliance, IP diligence). The
in-house agent creates an A2A task targeting outside counsel's specialized review
agent, attaching the contract, the in-house analysis, and specific questions. Outside
counsel's agent processes the task, potentially requesting additional documents through
the `input-required` state, and returns detailed findings as artifacts.


**Multi-party transactions.** In an M&A deal, buyer's counsel, seller's counsel, and
sometimes additional parties each have their own AI pipelines. A2A enables these
pipelines to exchange document versions, share analysis results (where appropriate),
and coordinate review timelines without requiring human intermediaries for routine
document transfer. The agents handle logistics while the attorneys handle judgment.


**Client-facing interfaces.** A law firm's AI agent exposes A2A capabilities that the
client's in-house AI agent can consume. The client's agent sends a contract for review,
receives structured results, and integrates them into the client's own systems, all
through A2A without manual file exchange, email attachments, or portal logins.


**Regulatory submissions.** As regulatory agencies adopt AI systems, A2A provides
the communication layer between a firm's compliance pipeline and the agency's submission
system. The firm's agent prepares a filing, the agency's agent validates format and
completeness, and the exchange happens through structured A2A messages with full
audit trails.


> **Insight**
>
> A2A is early in its adoption curve but its trajectory is clear. The protocol was
> donated to the Linux Foundation in 2025 with backing from over 50 technology
> partners. For legal engineering, the critical design insight is: build your pipelines
> as composable services with clear input and output contracts (in the software sense),
> and adding an A2A layer later becomes a configuration change, not a rewrite. The
> typed interfaces and backautocrat orchestration from Chapter 4 align directly with
> A2A's task model.


\newpage


## 5.4 OOXML Track Changes Integration


### Why Document Surgery Matters


Attorneys live in Microsoft Word. They negotiate in Word. They redline in Word. They
execute in Word. A legal engineering pipeline that produces analysis as JSON in a
browser window has produced something useful to a developer and useless to an attorney.
The output must be a `.docx` file with real Track Changes that the attorney opens in
Word, reviews with Accept/Reject controls, and sends to opposing counsel. The document
is the deliverable.


Chapter 2 introduced OOXML as the XML format inside `.docx` files and showed the basic
structure of paragraphs, runs, and Track Changes elements. This section teaches the
complete integration pattern: how your pipeline reads a contract, produces analysis,
and writes that analysis back into the document as real OOXML Track Changes. This is
the bridge between AI analysis and attorney workflow.


### The Surgery Pipeline


OOXML Track Changes integration follows a five-stage pipeline. The contract arrives
as a `.docx` file. The pipeline extracts text for AI analysis, runs the multi-agent
pipeline to produce findings and directives, maps each directive to a specific location
in the document's XML tree, constructs Track Changes elements (`w:ins` and `w:del`),
and repackages the modified XML into a new `.docx` file.


```svg
<svg viewBox="0 0 900 340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ooxml-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="450" y="28" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#1a1a2e" font-weight="bold">Figure 5.3 — OOXML Track Changes Surgery Pipeline</text>

  <!-- Stage 1 -->
  <rect x="20" y="55" width="150" height="90" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="95" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#16a085" font-weight="bold">1. Extract</text>
  <text x="95" y="100" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Unzip .docx</text>
  <text x="95" y="115" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Parse document.xml</text>
  <text x="95" y="130" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Extract text + map</text>

  <line x1="170" y1="100" x2="200" y2="100" stroke="#16a085" stroke-width="2" marker-end="url(#ooxml-arrow)"/>

  <!-- Stage 2 -->
  <rect x="200" y="55" width="150" height="90" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="275" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#16a085" font-weight="bold">2. Analyze</text>
  <text x="275" y="100" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Multi-agent pipeline</text>
  <text x="275" y="115" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Specialist diplomats</text>
  <text x="275" y="130" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Produce directives</text>

  <line x1="350" y1="100" x2="380" y2="100" stroke="#16a085" stroke-width="2" marker-end="url(#ooxml-arrow)"/>

  <!-- Stage 3 -->
  <rect x="380" y="55" width="150" height="90" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="455" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#f39c12" font-weight="bold">3. Locate</text>
  <text x="455" y="100" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Match directives</text>
  <text x="455" y="115" text-anchor="middle" font-family="monospace" font-size="9" fill="white">to XML paragraphs</text>
  <text x="455" y="130" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Fuzzy text search</text>

  <line x1="530" y1="100" x2="560" y2="100" stroke="#16a085" stroke-width="2" marker-end="url(#ooxml-arrow)"/>

  <!-- Stage 4 -->
  <rect x="560" y="55" width="150" height="90" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="635" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#16a085" font-weight="bold">4. Operate</text>
  <text x="635" y="100" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Build w:del + w:ins</text>
  <text x="635" y="115" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Clone run properties</text>
  <text x="635" y="130" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Insert into XML tree</text>

  <line x1="710" y1="100" x2="740" y2="100" stroke="#16a085" stroke-width="2" marker-end="url(#ooxml-arrow)"/>

  <!-- Stage 5 -->
  <rect x="740" y="55" width="140" height="90" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="810" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#16a085" font-weight="bold">5. Package</text>
  <text x="810" y="100" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Write modified XML</text>
  <text x="810" y="115" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Repackage ZIP</text>
  <text x="810" y="130" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Output .docx</text>

  <!-- I/O labels -->
  <rect x="20" y="180" width="150" height="45" rx="4" fill="#2d2d4e"/>
  <text x="95" y="200" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Input:</text>
  <text x="95" y="215" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">contract.docx</text>

  <rect x="740" y="180" width="140" height="45" rx="4" fill="#2d2d4e"/>
  <text x="810" y="200" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Output:</text>
  <text x="810" y="215" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a085">redline.docx</text>

  <!-- Warning annotation -->
  <rect x="320" y="250" width="260" height="70" rx="4" fill="none" stroke="#f39c12" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="450" y="275" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#f39c12" font-weight="bold">Stage 3 is the hardest</text>
  <text x="450" y="295" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#1a1a2e">Matching AI output to XML</text>
  <text x="450" y="310" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#1a1a2e">locations requires fuzzy search</text>
</svg>
```


### Stage 1: Extract


The first stage reads the `.docx` file, extracts the XML, and builds a text-to-XML
map. The map is critical: it records the correspondence between plain text positions
(what the AI model sees) and XML element positions (where Track Changes must be
inserted). Without this map, there is no way to translate "change 'sixty (60)' to
'thirty (30)' in Section 4.2" into the specific XML node that contains that text.


```typescript
// ooxml-extract.ts
import JSZip from 'jszip';

interface TextNode {
  paragraphIndex: number;
  runIndex: number;
  text: string;
  startOffset: number;
  endOffset: number;
  runProperties: string | null;
}

interface ExtractionResult {
  zip: JSZip;
  documentXml: string;
  textNodes: TextNode[];
  plainText: string;
}

async function extractDocument(
  docxBuffer: Buffer
): Promise<ExtractionResult> {
  const zip = await JSZip.loadAsync(docxBuffer);

  const documentXml = await zip
    .file('word/document.xml')!
    .async('string');

  // Parse XML to extract text nodes with position mapping
  const textNodes: TextNode[] = [];
  let plainText = '';
  let currentOffset = 0;

  // Each w:t element becomes a TextNode with its
  // position in the paragraph/run hierarchy
  const paragraphs = documentXml.split(/<w:p[ >]/);

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    const runs = para.split(/<w:r[ >]/);

    for (let rIdx = 0; rIdx < runs.length; rIdx++) {
      const run = runs[rIdx];
      const textMatch = run.match(
        /<w:t[^>]*>([^<]*)<\/w:t>/
      );
      if (textMatch) {
        const text = textMatch[1];
        const rPrMatch = run.match(
          /<w:rPr>([\s\S]*?)<\/w:rPr>/
        );
        textNodes.push({
          paragraphIndex: pIdx,
          runIndex: rIdx,
          text,
          startOffset: currentOffset,
          endOffset: currentOffset + text.length,
          runProperties: rPrMatch ? rPrMatch[0] : null
        });
        plainText += text;
        currentOffset += text.length;
      }
    }
    plainText += '\n';
    currentOffset += 1;
  }

  return { zip, documentXml, textNodes, plainText };
}
```


### Stage 3: Locate


The locate stage is where most OOXML implementations fail. The AI pipeline produces
directives referencing contract text: "Replace 'shall use commercially reasonable
efforts' with 'shall use best efforts' in Section 7.3." But the text in the directive
rarely matches the document text exactly. Whitespace differences, formatting artifacts,
Unicode variations, and OCR errors all create mismatches. The locate stage must perform
fuzzy text matching to find the right paragraph in the XML tree.


```typescript
// ooxml-locate.ts
interface Directive {
  directiveId: string;
  action: 'delete' | 'insert' | 'replace';
  originalText: string;
  newText: string | null;
  sectionReference: string;
}

interface LocatedDirective extends Directive {
  targetNodes: TextNode[];
  confidence: number;
}

function locateDirectives(
  directives: Directive[],
  textNodes: TextNode[],
  plainText: string
): LocatedDirective[] {
  const located: LocatedDirective[] = [];

  for (const directive of directives) {
    // Normalize search text: collapse whitespace,
    // standardize quotes, remove formatting artifacts
    const normalized = normalizeText(
      directive.originalText
    );

    // First pass: exact match in plain text
    let matchIndex = normalizeText(plainText)
      .indexOf(normalized);

    // Second pass: fuzzy match with Levenshtein distance
    if (matchIndex === -1) {
      matchIndex = fuzzyFind(
        normalizeText(plainText),
        normalized,
        0.85 // 85% similarity threshold
      );
    }

    if (matchIndex === -1) {
      // Directive could not be located in document
      // Log for human review; do not silently skip
      console.warn(
        `Could not locate directive `
        + `${directive.directiveId}: `
        + `"${directive.originalText.slice(0, 60)}..."`
      );
      continue;
    }

    // Map the plain text match back to XML text nodes
    const matchEnd = matchIndex + normalized.length;
    const targetNodes = textNodes.filter(
      node =>
        node.startOffset < matchEnd
        && node.endOffset > matchIndex
    );

    located.push({
      ...directive,
      targetNodes,
      confidence: matchIndex >= 0 ? 1.0 : 0.85
    });
  }

  return located;
}

function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B/g, '')
    .trim();
}

function fuzzyFind(
  haystack: string,
  needle: string,
  threshold: number
): number {
  const windowSize = needle.length;
  let bestScore = 0;
  let bestIndex = -1;

  for (
    let i = 0;
    i <= haystack.length - windowSize;
    i++
  ) {
    const window = haystack.slice(i, i + windowSize);
    const score = similarity(window, needle);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestScore >= threshold ? bestIndex : -1;
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}
```


> **Warning**
>
> Never silently skip a directive that cannot be located. Every skipped directive is
> a substantive legal change that the pipeline promised but failed to deliver. Log
> unlocatable directives, report them to the attorney, and include them in the
> analysis output as "pending manual review." A redlined document that claims to
> address 40 issues but silently dropped 8 of them is worse than a document that
> honestly reports "32 changes applied, 8 require manual placement." Attorneys can
> handle incomplete automation. They cannot handle undisclosed omissions.


### Stage 4: Operate


The operate stage constructs the OOXML Track Changes elements and inserts them into
the document's XML tree. Every Track Changes operation creates either a deletion
element (`w:del`), an insertion element (`w:ins`), or both (for replacements). Each
element carries an author attribution and a timestamp.


The critical detail in this stage is **format cloning**. The inserted text must inherit
the run properties (`w:rPr`) of the surrounding text. If the original clause is in
11pt Times New Roman with 1.15 line spacing, the inserted text must match exactly.
Failure to clone formatting makes Track Changes visually jarring and immediately
signals to the receiving attorney that the edits are machine-generated.


```typescript
// ooxml-operate.ts
interface TrackChangeElement {
  xml: string;
  insertionPoint: {
    paragraphIndex: number;
    runIndex: number;
  };
}

function buildTrackChange(
  directive: LocatedDirective,
  author: string,
  date: string
): TrackChangeElement {
  const targetNode = directive.targetNodes[0];
  const rPr = targetNode.runProperties ?? '';

  let xml = '';

  if (
    directive.action === 'delete'
    || directive.action === 'replace'
  ) {
    xml += `<w:del w:id="${generateId()}" `
      + `w:author="${author}" w:date="${date}">`;
    xml += `<w:r>`;
    if (rPr) xml += rPr;
    xml += `<w:delText xml:space="preserve">`
      + `${escapeXml(directive.originalText)}`
      + `</w:delText>`;
    xml += `</w:r></w:del>`;
  }

  if (
    directive.action === 'insert'
    || directive.action === 'replace'
  ) {
    xml += `<w:ins w:id="${generateId()}" `
      + `w:author="${author}" w:date="${date}">`;
    xml += `<w:r>`;
    if (rPr) xml += rPr;
    xml += `<w:t xml:space="preserve">`
      + `${escapeXml(directive.newText!)}`
      + `</w:t>`;
    xml += `</w:r></w:ins>`;
  }

  return {
    xml,
    insertionPoint: {
      paragraphIndex: targetNode.paragraphIndex,
      runIndex: targetNode.runIndex
    }
  };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

let idCounter = 1000;
function generateId(): string {
  return String(idCounter++);
}
```


### Stage 5: Package


The final stage writes the modified XML back into the ZIP archive and produces the
output `.docx` file. Apply track changes in reverse document order (last paragraph
first) to preserve character positions. When you insert XML content at a position,
every subsequent position in the document shifts. Processing from the end backward
ensures earlier positions remain valid.


```typescript
// ooxml-package.ts
async function packageRedline(
  extraction: ExtractionResult,
  trackChanges: TrackChangeElement[],
  author: string,
  date: string
): Promise<Buffer> {
  let modifiedXml = extraction.documentXml;

  // Apply in reverse order to preserve positions
  const sorted = [...trackChanges].sort(
    (a, b) =>
      b.insertionPoint.paragraphIndex
      - a.insertionPoint.paragraphIndex
      || b.insertionPoint.runIndex
      - a.insertionPoint.runIndex
  );

  for (const change of sorted) {
    modifiedXml = insertAtPosition(
      modifiedXml,
      change.xml,
      change.insertionPoint
    );
  }

  // Write modified XML back and repackage
  extraction.zip.file(
    'word/document.xml', modifiedXml
  );

  const outputBuffer = await extraction.zip
    .generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

  return outputBuffer;
}
```


> **Practice Tip**
>
> Always apply Track Changes in reverse document order (last paragraph first). When
> you insert XML content at a position, every subsequent position in the document
> shifts. Processing from the end backward ensures that earlier positions remain valid
> as you work. Processing from the beginning forward means every insertion invalidates
> the positions of all subsequent insertions. Reverse order is O(n). Forward order with
> recalculation is O(n squared).


### The Complete OOXML Integration Function


Combining all five stages into a single integration function that the pipeline calls
to produce a redlined document from analysis directives.


```typescript
// ooxml-integration.ts
interface RedlineConfig {
  contractBuffer: Buffer;
  directives: Directive[];
  author: string;
  date?: string;
}

interface RedlineResult {
  redlinedBuffer: Buffer;
  appliedCount: number;
  skippedCount: number;
  skippedDirectives: string[];
}

async function generateRedline(
  config: RedlineConfig
): Promise<RedlineResult> {
  const date = config.date
    ?? new Date().toISOString();

  // Stage 1: Extract
  const extraction = await extractDocument(
    config.contractBuffer
  );

  // Stage 3: Locate (Stage 2 = analysis, already done)
  const located = locateDirectives(
    config.directives,
    extraction.textNodes,
    extraction.plainText
  );

  const skipped = config.directives.filter(
    d => !located.find(
      l => l.directiveId === d.directiveId
    )
  );

  // Stage 4: Operate
  const trackChanges = located.map(directive =>
    buildTrackChange(directive, config.author, date)
  );

  // Stage 5: Package
  const redlinedBuffer = await packageRedline(
    extraction, trackChanges, config.author, date
  );

  return {
    redlinedBuffer,
    appliedCount: located.length,
    skippedCount: skipped.length,
    skippedDirectives: skipped.map(s => s.directiveId)
  };
}
```


\newpage


## 5.5 Server-Sent Events: Real-Time Pipeline Streaming


### The Latency Problem


A multi-agent legal engineering pipeline takes time. A 26-agent, 6-round contract
analysis pipeline typically runs for three to five minutes. During those minutes,
the attorney staring at the interface needs to know what is happening. Is the pipeline
running? Which stage is it on? How many specialists have completed? Did anything fail?
Without real-time progress information, the attorney has two choices: stare at a spinner
and wonder, or assume the system is broken and close the tab.


Server-Sent Events (SSE) solve this problem with a persistent, one-way connection from
server to client. The server pushes progress events as they occur. The browser receives
them and updates the interface in real time. The attorney watches the pipeline progress
through rounds, sees specialist completions accumulate, and knows exactly when the
deliverable is ready.


### Why SSE Instead of WebSockets


SSE is one-directional: server to client. WebSockets are bidirectional. For pipeline
progress streaming, one direction is all you need. The server reports progress. The
client displays it. The client does not need to send messages back to the server during
the pipeline run. SSE is simpler to implement, works natively with HTTP (no protocol
upgrade), is automatically reconnected by the browser if the connection drops, and
passes through every proxy and load balancer without special configuration. WebSockets
require protocol upgrades, custom reconnection logic, and proxy configuration. Use SSE
for progress streaming. Use WebSockets only when you need bidirectional real-time
communication, which pipeline monitoring does not.


### Backend SSE Implementation


The SSE pattern has three parts: establishing the connection, emitting events during
the pipeline run, and closing the connection when the pipeline completes.


```typescript
// sse-backend.ts
import express from 'express';

// Define event types the pipeline emits
interface PipelineEvent {
  type:
    | 'pipeline-started'
    | 'round-started'
    | 'specialist-completed'
    | 'round-completed'
    | 'synthesis-completed'
    | 'redline-started'
    | 'pipeline-completed'
    | 'pipeline-failed';
  timestamp: string;
  data: Record<string, unknown>;
}

// SSE endpoint: streams progress to the browser
app.get(
  '/api/analyze/:analysisId/stream',
  async (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Critical for Nginx/reverse proxies:
    res.setHeader('X-Accel-Buffering', 'no');

    // Emit helper
    function emit(event: PipelineEvent): void {
      res.write(
        `event: ${event.type}\n`
        + `data: ${JSON.stringify(event)}\n\n`
      );
    }

    // Handle client disconnect
    let clientDisconnected = false;
    req.on('close', () => {
      clientDisconnected = true;
    });

    try {
      emit({
        type: 'pipeline-started',
        timestamp: new Date().toISOString(),
        data: {
          analysisId: req.params.analysisId,
          message: 'Pipeline initiated'
        }
      });

      // Run pipeline, emitting events at each stage
      for (let round = 1; round <= 6; round++) {
        if (clientDisconnected) break;

        emit({
          type: 'round-started',
          timestamp: new Date().toISOString(),
          data: { round, totalRounds: 6 }
        });

        // Run specialists in parallel
        const specialists =
          getSpecialistsForRound(round);
        const results = await Promise.allSettled(
          specialists.map(async (specialist) => {
            const result = await specialist.execute();
            emit({
              type: 'specialist-completed',
              timestamp: new Date().toISOString(),
              data: {
                round,
                specialistName: specialist.name,
                findingCount: result.findings.length,
                durationMs: result.durationMs
              }
            });
            return result;
          })
        );

        emit({
          type: 'round-completed',
          timestamp: new Date().toISOString(),
          data: {
            round,
            completedCount: results.filter(
              r => r.status === 'fulfilled'
            ).length,
            failedCount: results.filter(
              r => r.status === 'rejected'
            ).length
          }
        });
      }

      // Generate redline
      emit({
        type: 'redline-started',
        timestamp: new Date().toISOString(),
        data: { message: 'Generating Track Changes' }
      });

      const redline = await generateRedlineDocument();

      emit({
        type: 'pipeline-completed',
        timestamp: new Date().toISOString(),
        data: {
          trackChangesCount: redline.appliedCount,
          skippedCount: redline.skippedCount,
          downloadUrl: `/api/analyze/`
            + `${req.params.analysisId}/redline`
        }
      });
    } catch (error) {
      emit({
        type: 'pipeline-failed',
        timestamp: new Date().toISOString(),
        data: {
          error: error instanceof Error
            ? error.message : 'Unknown error'
        }
      });
    } finally {
      res.end();
    }
  }
);
```


### Frontend SSE Consumer


The browser connects to the SSE endpoint using the native `EventSource` API. Each
event type maps to a UI update: progress bars advance, specialist counts increment,
and status messages update in real time.


```typescript
// sse-frontend.ts
import { useState, useEffect } from 'react';

interface PipelineProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentRound: number;
  totalRounds: number;
  specialistsCompleted: number;
  downloadUrl: string | null;
  error: string | null;
}

function usePipelineStream(
  analysisId: string | null
): PipelineProgress {
  const [progress, setProgress] =
    useState<PipelineProgress>({
      status: 'idle',
      currentRound: 0,
      totalRounds: 6,
      specialistsCompleted: 0,
      downloadUrl: null,
      error: null
    });

  useEffect(() => {
    if (!analysisId) return;

    const source = new EventSource(
      `/api/analyze/${analysisId}/stream`
    );

    source.addEventListener(
      'pipeline-started', () => {
        setProgress(prev => ({
          ...prev, status: 'running'
        }));
      }
    );

    source.addEventListener(
      'round-started', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setProgress(prev => ({
          ...prev,
          currentRound: data.data.round,
          specialistsCompleted: 0
        }));
      }
    );

    source.addEventListener(
      'specialist-completed', () => {
        setProgress(prev => ({
          ...prev,
          specialistsCompleted:
            prev.specialistsCompleted + 1
        }));
      }
    );

    source.addEventListener(
      'pipeline-completed', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setProgress(prev => ({
          ...prev,
          status: 'completed',
          downloadUrl: data.data.downloadUrl
        }));
        source.close();
      }
    );

    source.addEventListener(
      'pipeline-failed', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          error: data.data.error
        }));
        source.close();
      }
    );

    return () => source.close();
  }, [analysisId]);

  return progress;
}
```


```svg
<svg viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="sse-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="450" y="28" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#1a1a2e" font-weight="bold">Figure 5.4 — SSE Event Flow: Backend Pipeline to Frontend Dashboard</text>

  <!-- Backend column -->
  <rect x="30" y="50" width="250" height="330" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="155" y="78" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="white" font-weight="bold">Express Backend</text>
  <line x1="50" y1="88" x2="260" y2="88" stroke="#16a085" stroke-width="1"/>

  <rect x="50" y="100" width="210" height="30" rx="3" fill="#2d2d4e"/>
  <text x="155" y="120" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Round 1: Intake Classification</text>

  <rect x="50" y="140" width="210" height="30" rx="3" fill="#2d2d4e"/>
  <text x="155" y="160" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Round 2: 16 Parallel Specialists</text>

  <rect x="50" y="180" width="210" height="30" rx="3" fill="#2d2d4e"/>
  <text x="155" y="200" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Round 3: 8 Research Agents</text>

  <rect x="50" y="220" width="210" height="30" rx="3" fill="#2d2d4e"/>
  <text x="155" y="240" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Round 4: Synthesis</text>

  <rect x="50" y="260" width="210" height="30" rx="3" fill="#2d2d4e"/>
  <text x="155" y="280" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Round 5: Directive Generation</text>

  <rect x="50" y="300" width="210" height="30" rx="3" fill="#2d2d4e"/>
  <text x="155" y="320" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Round 6: OOXML Surgery</text>

  <rect x="50" y="340" width="210" height="24" rx="3" fill="#2d2d4e"/>
  <text x="155" y="357" text-anchor="middle" font-family="monospace" font-size="9" fill="#f39c12">res.write() per event</text>

  <!-- SSE Stream -->
  <rect x="340" y="130" width="220" height="180" rx="6" fill="none" stroke="#16a085" stroke-width="1.5"/>
  <text x="450" y="155" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#1a1a2e" font-weight="bold">SSE Stream</text>

  <text x="360" y="180" font-family="monospace" font-size="8" fill="#1a1a2e">event: pipeline-started</text>
  <text x="360" y="195" font-family="monospace" font-size="8" fill="#1a1a2e">event: round-started {round: 1}</text>
  <text x="360" y="210" font-family="monospace" font-size="8" fill="#1a1a2e">event: specialist-completed</text>
  <text x="360" y="225" font-family="monospace" font-size="8" fill="#1a1a2e">event: round-completed {round: 1}</text>
  <text x="360" y="240" font-family="monospace" font-size="8" fill="#1a1a2e">event: round-started {round: 2}</text>
  <text x="360" y="255" font-family="monospace" font-size="8" fill="#1a1a2e">...</text>
  <text x="360" y="270" font-family="monospace" font-size="8" fill="#1a1a2e">event: pipeline-completed</text>
  <text x="360" y="285" font-family="monospace" font-size="8" fill="#1a1a2e">  {downloadUrl: "/api/.../redline"}</text>

  <!-- Arrows -->
  <line x1="260" y1="200" x2="340" y2="200" stroke="#16a085" stroke-width="1.5" marker-end="url(#sse-arrow)"/>

  <!-- Frontend column -->
  <rect x="620" y="50" width="250" height="330" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="745" y="78" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="white" font-weight="bold">React Frontend</text>
  <line x1="640" y1="88" x2="850" y2="88" stroke="#16a085" stroke-width="1"/>

  <rect x="640" y="100" width="210" height="55" rx="3" fill="#2d2d4e"/>
  <text x="745" y="120" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Progress Bar</text>
  <text x="745" y="140" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Round 2 of 6 | 12/16 done</text>

  <rect x="640" y="170" width="210" height="55" rx="3" fill="#2d2d4e"/>
  <text x="745" y="190" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Specialist Feed</text>
  <text x="745" y="210" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">IP Analyst: 8 findings (42s)</text>

  <rect x="640" y="240" width="210" height="55" rx="3" fill="#2d2d4e"/>
  <text x="745" y="260" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Status Message</text>
  <text x="745" y="280" text-anchor="middle" font-family="monospace" font-size="9" fill="#f39c12">"Analyzing risk clauses..."</text>

  <rect x="640" y="310" width="210" height="55" rx="3" fill="#2d2d4e"/>
  <text x="745" y="330" text-anchor="middle" font-family="monospace" font-size="10" fill="white">Download Button</text>
  <text x="745" y="350" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Appears on completion</text>

  <line x1="560" y1="200" x2="620" y2="200" stroke="#16a085" stroke-width="1.5" marker-end="url(#sse-arrow)"/>
</svg>
```


> **Insight**
>
> SSE event design should mirror the pipeline's architectural structure. One event
> type per orchestration boundary: round starts, specialist completions, round
> completions, synthesis milestones. Do not emit events per token or per Claude API
> chunk. That level of granularity overwhelms the frontend and provides no actionable
> information to the attorney. The attorney does not care that token 47,392 was
> generated. They care that the indemnification specialist finished and found 8 issues.
> Design events for the consumer, not the producer.

> **Practice Tip: SSE Through Reverse Proxies**
>
> If you deploy behind Nginx, Cloudflare, or a similar reverse proxy, configure it to
> avoid buffering SSE responses. Nginx defaults to buffering upstream responses, which
> means your SSE events arrive in batches rather than individually. Add
> `proxy_buffering off` and `X-Accel-Buffering: no` to your SSE route configuration.
> Without this, the user sees no progress for minutes, then receives all events at
> once, defeating the entire purpose of streaming.


\newpage


## 5.6 Database Integration: MongoDB


### Why MongoDB for Legal Pipelines


Legal engineering pipelines produce heterogeneous data. A contract analysis run
generates risk scores (numbers), findings (nested objects with variable-length arrays),
clause extractions (key-value maps), token usage metrics (numeric tuples), and billing
records (calculated costs). Each pipeline type produces slightly different output shapes.


MongoDB stores documents as BSON (Binary JSON), which aligns directly with the data
structures that TypeScript programs produce. The `AnalysisResult` interface in your
types file is the same shape as the document stored in MongoDB. No object-relational
mapping, no schema migration for every new analyzer, no impedance mismatch between
application data and database storage.


### Connection and Configuration


Every legal engineering backend establishes a MongoDB connection at startup and makes
it available to all pipeline stages.


```typescript
// database.ts
import {
  MongoClient, type Db, type Collection
} from 'mongodb';
import type {
  AnalysisResult, ContractMetadata, PipelineMetrics
} from './types.js';

let db: Db;
let client: MongoClient;

export async function connectDatabase(
  uri?: string
): Promise<Db> {
  const connectionUri = uri
    ?? process.env.MONGODB_URI
    ?? 'mongodb://localhost:27017';

  client = new MongoClient(connectionUri, {
    maxPoolSize: 20,
    minPoolSize: 5,
    retryWrites: true,
    retryReads: true,
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 10_000
  });

  await client.connect();
  db = client.db('legal-pipeline');
  await ensureIndexes();
  return db;
}

export function analyses():
  Collection<AnalysisResult> {
  return db.collection<AnalysisResult>('analyses');
}

export function contracts():
  Collection<ContractMetadata> {
  return db.collection<ContractMetadata>('contracts');
}

export function metrics():
  Collection<PipelineMetrics> {
  return db.collection<PipelineMetrics>('metrics');
}

async function ensureIndexes(): Promise<void> {
  await contracts().createIndex(
    { title: 'text', 'parties.name': 'text' }
  );
  await contracts().createIndex(
    { vertical: 1, effectiveDate: -1 }
  );
  await analyses().createIndex(
    { contractId: 1, completedAt: -1 }
  );
  await metrics().createIndex(
    { pipelineId: 1, recordedAt: -1 }
  );
}
```


### Storing Pipeline Results


Every pipeline run persists its complete results: the analysis output, token usage
metrics, the cost calculation, timing data, and a reference to the input contract.
This data serves four purposes: delivering results to the attorney, billing the client,
optimizing the pipeline, and building the training corpus for evaluation engineering
(Chapter 7).


```typescript
// store-results.ts
import { analyses, metrics } from './database.js';

interface RoundMetric {
  roundNumber: number;
  durationMs: number;
  specialistCount: number;
  completedCount: number;
  failedCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export async function storeAnalysisResult(
  result: AnalysisResult
): Promise<string> {
  const doc = {
    ...result,
    completedAt: new Date().toISOString(),
    version: '2.0.0'
  };
  const { insertedId } = await analyses()
    .insertOne(doc);
  return insertedId.toString();
}

export async function storePipelineMetrics(
  pipelineId: string,
  roundMetrics: RoundMetric[]
): Promise<void> {
  const doc = {
    pipelineId,
    recordedAt: new Date().toISOString(),
    rounds: roundMetrics.map(r => ({
      roundNumber: r.roundNumber,
      durationMs: r.durationMs,
      specialistCount: r.specialistCount,
      completedCount: r.completedCount,
      failedCount: r.failedCount,
      tokenUsage: {
        input: r.totalInputTokens,
        output: r.totalOutputTokens
      },
      costUsd:
        (r.totalInputTokens * 15
          + r.totalOutputTokens * 75)
        / 1_000_000
    })),
    totalDurationMs: roundMetrics.reduce(
      (sum, r) => sum + r.durationMs, 0
    ),
    totalCostUsd: roundMetrics.reduce(
      (sum, r) =>
        sum + (r.totalInputTokens * 15
          + r.totalOutputTokens * 75)
        / 1_000_000,
      0
    )
  };
  await metrics().insertOne(doc);
}
```


### Querying for Analysis and Reporting


The stored data supports three query patterns that recur across every legal engineering
system: retrieving a specific analysis result, aggregating metrics across pipeline runs,
and building portfolio-level views across multiple contracts.


```typescript
// query-patterns.ts
import { analyses, metrics } from './database.js';

// Pattern 1: Retrieve a specific analysis
export async function getAnalysis(
  analysisId: string
): Promise<AnalysisResult | null> {
  return analyses().findOne({ analysisId });
}

// Pattern 2: Aggregate cost metrics over a date range
export async function getCostSummary(
  fromDate: string,
  toDate: string
) {
  const pipeline = [
    {
      $match: {
        recordedAt: { $gte: fromDate, $lte: toDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRuns: { $sum: 1 },
        totalCost: { $sum: '$totalCostUsd' },
        avgCostPerRun: { $avg: '$totalCostUsd' },
        avgDurationMs: { $avg: '$totalDurationMs' }
      }
    }
  ];

  const results = await metrics()
    .aggregate(pipeline).toArray();
  return results[0];
}

// Pattern 3: Portfolio risk view across contracts
export async function getPortfolioRiskView(
  vertical?: string
) {
  const filter = vertical ? { vertical } : {};
  return analyses()
    .find(filter)
    .project({
      contractId: 1, vertical: 1, riskScore: 1,
      'findings.riskLevel': 1, completedAt: 1
    })
    .sort({ riskScore: -1 })
    .toArray();
}
```


> **Practice Tip**
>
> Index every field you filter or sort on. MongoDB performs collection scans (reading
> every document) when no index matches the query. For a pipeline running 50 analyses
> per day, a collection scan on the `analyses` collection becomes noticeably slow
> within a month. The `ensureIndexes` function in the connection setup is not optional
> housekeeping. It is a performance requirement.


\newpage


## 5.7 API Design for Legal Engineering Backends


### The Route Structure


Every legal engineering backend exposes its capabilities through Express REST routes.
The route structure follows a consistent pattern across all ten workflows in Part II:
a trigger route that initiates the pipeline, a stream route that provides real-time
progress, a results route that returns the completed analysis, and a deliverables route
that serves output files.


```typescript
// api-routes.ts
import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
app.use(express.json());

// ---------- Authentication Middleware ----------

function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const token = req.headers.authorization
    ?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token, process.env.JWT_SECRET!
    );
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------- Route: Trigger Analysis ----------

app.post(
  '/api/analyze',
  requireAuth,
  upload.single('contract'),
  async (req, res) => {
    try {
      const contractBuffer = req.file?.buffer;
      if (!contractBuffer) {
        res.status(400).json({
          error: 'No contract file provided'
        });
        return;
      }

      const { vertical, perspective } = req.body;
      if (!vertical || !perspective) {
        res.status(400).json({
          error: 'vertical and perspective required'
        });
        return;
      }

      const analysisId = `analysis_${Date.now()}`;

      // Start pipeline asynchronously
      runPipelineAsync(
        analysisId, contractBuffer,
        vertical, perspective
      );

      // Return receipt immediately
      res.status(202).json({
        analysisId,
        status: 'accepted',
        streamUrl:
          `/api/analyze/${analysisId}/stream`,
        resultsUrl:
          `/api/analyze/${analysisId}/results`
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to initiate analysis'
      });
    }
  }
);

// ---------- Route: Stream Progress ----------

app.get(
  '/api/analyze/:analysisId/stream',
  requireAuth,
  async (req, res) => {
    res.setHeader(
      'Content-Type', 'text/event-stream'
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const unsubscribe = subscribeToPipelineEvents(
      req.params.analysisId,
      (event) => {
        res.write(
          `event: ${event.type}\n`
          + `data: ${JSON.stringify(event)}\n\n`
        );
      }
    );
    req.on('close', () => unsubscribe());
  }
);

// ---------- Route: Get Results ----------

app.get(
  '/api/analyze/:analysisId/results',
  requireAuth,
  async (req, res) => {
    const result = await getAnalysis(
      req.params.analysisId
    );
    if (!result) {
      res.status(404).json({
        error: 'Analysis not found or still running'
      });
      return;
    }
    res.json(result);
  }
);

// ---------- Route: Download Redline ----------

app.get(
  '/api/analyze/:analysisId/redline',
  requireAuth,
  async (req, res) => {
    const redline = await getRedlineDocument(
      req.params.analysisId
    );
    if (!redline) {
      res.status(404).json({
        error: 'Redline not available'
      });
      return;
    }

    const filename = `redline-`
      + `${req.params.analysisId}.docx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument'
      + '.wordprocessingml.document'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.send(redline);
  }
);
```


### The Asynchronous Trigger Pattern


Notice that the `/api/analyze` route returns HTTP 202 (Accepted), not 200 (OK). This
is the asynchronous trigger pattern. The route accepts the request, validates parameters,
generates an analysis ID, starts the pipeline in the background, and immediately returns.
The client receives the analysis ID and uses it to subscribe to the SSE stream or poll
the results endpoint.


This pattern is essential for legal engineering pipelines because they run for minutes,
not milliseconds. An HTTP request that blocks for three to five minutes risks timeout
at every layer: the client's HTTP library, the reverse proxy, the load balancer, and
the cloud provider's request gateway. The asynchronous pattern eliminates all timeout
risk by separating request acceptance from pipeline execution.


> **Key Concept**
>
> The response to a pipeline trigger is a receipt, not a result. The client receives
> an analysis ID, a stream URL, and a results URL. These three values are everything
> the client needs to track the pipeline to completion. The trigger route does not
> wait for the pipeline. It starts it and returns. This is the same pattern used by
> every asynchronous job processing system, from email delivery to video encoding.
> Legal engineering pipelines are long-running jobs, and they must be treated as such.


### Authentication and Authorization


Every route in a legal engineering API is authenticated. Different users have different
capabilities. An attorney can trigger analysis, view results, and download redlines. A
paralegal can view results but cannot trigger new analysis. A client can download their
own deliverables but cannot access other clients' analyses.


```typescript
// authorization.ts
type Role = 'attorney' | 'paralegal' | 'client'
  | 'admin';

interface Permission {
  resource: string;
  action: 'create' | 'read' | 'download';
}

const rolePermissions:
  Record<Role, Permission[]> = {
  attorney: [
    { resource: 'analysis', action: 'create' },
    { resource: 'analysis', action: 'read' },
    { resource: 'redline', action: 'download' },
    { resource: 'playbook', action: 'read' }
  ],
  paralegal: [
    { resource: 'analysis', action: 'read' },
    { resource: 'redline', action: 'download' }
  ],
  client: [
    { resource: 'analysis', action: 'read' },
    { resource: 'redline', action: 'download' }
  ],
  admin: [
    { resource: 'analysis', action: 'create' },
    { resource: 'analysis', action: 'read' },
    { resource: 'redline', action: 'download' },
    { resource: 'playbook', action: 'read' }
  ]
};

function requirePermission(
  resource: string,
  action: 'create' | 'read' | 'download'
): express.RequestHandler {
  return (req, res, next) => {
    const user = (req as any).user;
    const permissions =
      rolePermissions[user.role as Role] ?? [];
    const hasPermission = permissions.some(
      p => p.resource === resource
        && p.action === action
    );
    if (!hasPermission) {
      res.status(403).json({
        error: 'Insufficient permissions'
      });
      return;
    }
    next();
  };
}
```


### Rate Limiting and Cost Control


AI pipelines consume tokens, and tokens cost money. A legal engineering API must
enforce rate limits at two levels: per-user to prevent runaway automation, and
per-organization to control monthly spend.


```typescript
// rate-limiting.ts
interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxTokensPerDay: number;
  maxCostPerMonth: number;
}

const tierLimits:
  Record<string, RateLimitConfig> = {
  starter: {
    maxRequestsPerHour: 10,
    maxTokensPerDay: 1_000_000,
    maxCostPerMonth: 500
  },
  professional: {
    maxRequestsPerHour: 50,
    maxTokensPerDay: 10_000_000,
    maxCostPerMonth: 5_000
  },
  enterprise: {
    maxRequestsPerHour: 200,
    maxTokensPerDay: 100_000_000,
    maxCostPerMonth: 50_000
  }
};

async function checkRateLimit(
  userId: string,
  organizationId: string,
  tier: string
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = tierLimits[tier];
  if (!limits) {
    return { allowed: false, reason: 'Unknown tier' };
  }

  const hourlyCount =
    await getHourlyRequestCount(userId);
  if (hourlyCount >= limits.maxRequestsPerHour) {
    return {
      allowed: false,
      reason: `Rate limit: `
        + `${limits.maxRequestsPerHour}/hr exceeded`
    };
  }

  const monthlyCost =
    await getMonthlyCost(organizationId);
  if (monthlyCost >= limits.maxCostPerMonth) {
    return {
      allowed: false,
      reason: 'Monthly cost limit exceeded'
    };
  }

  return { allowed: true };
}
```


> **Warning**
>
> Never deploy a legal engineering API without rate limiting. A single automated
> client can run hundreds of pipeline analyses per hour, each consuming $15 to $40
> in API tokens. Without rate limiting, a misconfigured integration or a credential
> leak can generate thousands of dollars in charges before anyone notices. Rate
> limiting is not a premium feature. It is a financial safety mechanism.


\newpage


## 5.8 Webhook and Event-Driven Integration


### When Pipelines Need to Reach Out


The integration patterns covered so far are inward-facing: the pipeline receives
requests (API routes), reports progress (SSE), and stores results (MongoDB). But legal
engineering pipelines frequently need to push information to external systems. When a
contract analysis completes, the document management system needs to file the redline.
When an obligation tracking pipeline identifies a deadline, the calendar system needs to
create an event. When a due diligence pipeline flags a critical risk, the deal team
needs a Slack notification.


Webhooks are the standard mechanism for this outward-facing integration. Your pipeline
emits events. External systems register webhook URLs to receive those events. When an
event occurs, your system sends an HTTP POST to each registered URL with the event
payload. The receiving system processes the event and takes appropriate action.


### The Event System


A robust webhook system starts with a typed event system that defines every event the
pipeline can emit.


```typescript
// event-system.ts
type WebhookEventType =
  | 'analysis.started'
  | 'analysis.completed'
  | 'analysis.failed'
  | 'redline.generated'
  | 'obligation.discovered'
  | 'risk.critical'
  | 'deadline.approaching';

interface WebhookEvent<T = Record<string, unknown>> {
  eventId: string;
  type: WebhookEventType;
  timestamp: string;
  pipelineRunId: string;
  organizationId: string;
  payload: T;
}

interface AnalysisCompletedPayload {
  analysisId: string;
  contractId: string;
  contractTitle: string;
  riskScore: number;
  findingCount: number;
  criticalCount: number;
  costUsd: number;
  redlineUrl: string;
  resultsUrl: string;
}

interface ObligationDiscoveredPayload {
  obligationId: string;
  contractId: string;
  description: string;
  deadline: string;
  responsibleParty: string;
  priority: 'routine' | 'important' | 'critical';
}

interface CriticalRiskPayload {
  analysisId: string;
  contractId: string;
  clauseReference: string;
  riskDescription: string;
  recommendation: string;
  dollarExposure: number | null;
}
```


### Webhook Registration and Delivery


External systems register webhook endpoints by specifying which event types they want
to receive, a URL, and an authentication secret. The delivery system sends events with
retry logic for failed deliveries and HMAC-SHA256 signatures for authenticity
verification.


```typescript
// webhook-delivery.ts
import crypto from 'crypto';

interface WebhookSubscription {
  subscriptionId: string;
  organizationId: string;
  url: string;
  secret: string;
  eventTypes: WebhookEventType[];
  active: boolean;
}

async function deliverWebhookEvent(
  event: WebhookEvent
): Promise<void> {
  const subscriptions = await db
    .collection<WebhookSubscription>('webhooks')
    .find({
      organizationId: event.organizationId,
      eventTypes: event.type,
      active: true
    })
    .toArray();

  await Promise.allSettled(
    subscriptions.map(sub =>
      deliverToEndpoint(event, sub)
    )
  );
}

async function deliverToEndpoint(
  event: WebhookEvent,
  subscription: WebhookSubscription,
  attempt: number = 1
): Promise<void> {
  const payload = JSON.stringify(event);

  // Sign with HMAC-SHA256 for verification
  const signature = crypto
    .createHmac('sha256', subscription.secret)
    .update(payload)
    .digest('hex');

  try {
    const response = await fetch(
      subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event.type,
          'X-Webhook-Delivery': event.eventId
        },
        body: payload,
        signal: AbortSignal.timeout(10_000)
      }
    );

    if (!response.ok && attempt <= 3) {
      const delayMs =
        1000 * Math.pow(2, attempt - 1);
      await new Promise(
        r => setTimeout(r, delayMs)
      );
      return deliverToEndpoint(
        event, subscription, attempt + 1
      );
    }

    await db.collection('webhook_deliveries')
      .insertOne({
        eventId: event.eventId,
        subscriptionId: subscription.subscriptionId,
        statusCode: response.status,
        attempt,
        deliveredAt: new Date().toISOString()
      });
  } catch (error) {
    if (attempt <= 3) {
      const delayMs =
        1000 * Math.pow(2, attempt - 1);
      await new Promise(
        r => setTimeout(r, delayMs)
      );
      return deliverToEndpoint(
        event, subscription, attempt + 1
      );
    }

    await db.collection('webhook_deliveries')
      .insertOne({
        eventId: event.eventId,
        subscriptionId: subscription.subscriptionId,
        error: error instanceof Error
          ? error.message : 'Unknown error',
        attempt,
        failedAt: new Date().toISOString()
      });
  }
}
```


### Practical Integration Examples


Four webhook integrations appear commonly in production legal engineering systems.


**Slack Notifications.** When a critical risk is detected during contract analysis,
the pipeline emits a `risk.critical` event. The Slack webhook receives it and posts
a formatted message to the deal team's channel with the finding details, the clause
reference, and a link to the full analysis.


```typescript
// slack-integration.ts
app.post(
  '/webhooks/legal-pipeline',
  async (req, res) => {
    // Verify webhook signature
    const signature = req.headers[
      'x-webhook-signature'
    ] as string;
    const expectedSig = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSig) {
      res.status(401).send('Invalid signature');
      return;
    }

    const event = req.body as WebhookEvent;

    if (event.type === 'risk.critical') {
      const payload =
        event.payload as CriticalRiskPayload;
      await postToSlack({
        channel: '#deal-review',
        blocks: [{
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Critical Risk Detected'
          }
        }, {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Clause:* `
                + payload.clauseReference
            },
            {
              type: 'mrkdwn',
              text: `*Risk:* `
                + payload.riskDescription
            },
            {
              type: 'mrkdwn',
              text: `*Recommendation:* `
                + payload.recommendation
            }
          ]
        }]
      });
    }

    res.status(200).send('OK');
  }
);
```


**Calendar Integration.** When an obligation tracking pipeline discovers a contractual
deadline, it emits an `obligation.discovered` event. The calendar integration receives
the event and creates a calendar entry with the deadline date, the responsible party,
and the contract reference.


```typescript
// calendar-integration.ts
import { google } from 'googleapis';

async function handleObligationEvent(
  event: WebhookEvent<ObligationDiscoveredPayload>
): Promise<void> {
  const obligation = event.payload;
  const calendar = google.calendar({
    version: 'v3',
    auth: await getAuthClient()
  });

  const deadlineDate =
    new Date(obligation.deadline);
  const reminderDate = new Date(deadlineDate);
  reminderDate.setDate(
    reminderDate.getDate() - 7
  );

  await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary:
        `[${obligation.priority.toUpperCase()}] `
        + obligation.description,
      description:
        `Contract Obligation\n`
        + `Responsible: `
        + `${obligation.responsibleParty}\n`
        + `Contract: ${obligation.contractId}`,
      start: {
        date: reminderDate
          .toISOString().split('T')[0]
      },
      end: {
        date: deadlineDate
          .toISOString().split('T')[0]
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },
          { method: 'popup', minutes: 60 }
        ]
      }
    }
  });
}
```


**Email Notifications.** When a pipeline completes, the attorney who triggered it
receives an email with a summary of findings and a link to download the redlined
document.


```typescript
// email-integration.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function handleAnalysisCompleted(
  event: WebhookEvent<AnalysisCompletedPayload>
): Promise<void> {
  const a = event.payload;

  await resend.emails.send({
    from: 'Pipeline <notifications@mail.firm.com>',
    to: await getAttorneyEmail(event.pipelineRunId),
    subject: `Analysis Complete: ${a.contractTitle}`,
    html: `
      <h2>Contract Analysis Complete</h2>
      <p><strong>${a.contractTitle}</strong></p>
      <table>
        <tr>
          <td>Risk Score</td>
          <td>${a.riskScore}/100</td>
        </tr>
        <tr>
          <td>Findings</td>
          <td>${a.findingCount}</td>
        </tr>
        <tr>
          <td>Critical</td>
          <td style="color:red">
            ${a.criticalCount}
          </td>
        </tr>
        <tr>
          <td>Cost</td>
          <td>$${a.costUsd.toFixed(2)}</td>
        </tr>
      </table>
      <p>
        <a href="${a.redlineUrl}">
          Download Redlined Document
        </a>
      </p>
    `
  });
}
```


> **Insight**
>
> Webhook signatures are not optional security theater. They are the only mechanism
> the receiving system has to verify that an event actually came from your pipeline and
> was not forged by an attacker. HMAC-SHA256 with a shared secret is the standard
> pattern. The sender signs the payload with the secret. The receiver recomputes the
> signature and compares. If they do not match, the event is rejected. Every webhook
> endpoint in a legal system must verify signatures because the events contain
> confidential client information: contract titles, risk findings, dollar exposures,
> party names.


\newpage


## 5.9 The Integration Topology


### How It All Fits Together


The eight integration patterns covered in this chapter are not independent systems.
They compose into a coherent integration topology where each pattern handles a specific
responsibility and connects to the others through typed interfaces.


```svg
<svg viewBox="0 0 920 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="topo-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#16a085"/>
    </marker>
    <marker id="topo-arrow-amber" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f39c12"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="460" y="28" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#1a1a2e" font-weight="bold">Figure 5.5 — Complete Integration Topology for a Legal Engineering System</text>

  <!-- External clients (top) -->
  <rect x="30" y="50" width="140" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="100" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white" font-weight="bold">Claude Desktop</text>
  <text x="100" y="88" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">MCP Client</text>

  <rect x="200" y="50" width="140" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="270" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white" font-weight="bold">Web Dashboard</text>
  <text x="270" y="88" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">React + SSE</text>

  <rect x="370" y="50" width="140" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="440" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white" font-weight="bold">API Clients</text>
  <text x="440" y="88" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">REST + JWT</text>

  <rect x="540" y="50" width="140" height="50" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="2"/>
  <text x="610" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white" font-weight="bold">External Agents</text>
  <text x="610" y="88" text-anchor="middle" font-family="monospace" font-size="8" fill="#f39c12">A2A Protocol</text>

  <!-- Integration Layer -->
  <rect x="30" y="130" width="680" height="120" rx="8" fill="#f5f5f5" stroke="#16a085" stroke-width="1.5"/>
  <text x="370" y="152" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#1a1a2e" font-weight="bold">Integration Layer</text>

  <rect x="50" y="165" width="130" height="40" rx="4" fill="#1a1a2e"/>
  <text x="115" y="190" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">MCP Server</text>

  <rect x="200" y="165" width="130" height="40" rx="4" fill="#1a1a2e"/>
  <text x="265" y="190" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Express API</text>

  <rect x="350" y="165" width="130" height="40" rx="4" fill="#1a1a2e"/>
  <text x="415" y="190" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">SSE Stream</text>

  <rect x="500" y="165" width="130" height="40" rx="4" fill="#1a1a2e"/>
  <text x="565" y="190" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">Webhooks</text>

  <rect x="200" y="215" width="280" height="25" rx="3" fill="#2d2d4e"/>
  <text x="340" y="232" text-anchor="middle" font-family="monospace" font-size="9" fill="white">Auth: JWT + RBAC + Rate Limiting</text>

  <!-- Pipeline Core -->
  <rect x="100" y="280" width="520" height="100" rx="8" fill="#1a1a2e" stroke="#16a085" stroke-width="2"/>
  <text x="360" y="305" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="white" font-weight="bold">Pipeline Core (Backautocrat + Diplomats)</text>

  <rect x="120" y="320" width="100" height="30" rx="3" fill="#2d2d4e"/>
  <text x="170" y="340" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">Classify</text>

  <rect x="230" y="320" width="100" height="30" rx="3" fill="#2d2d4e"/>
  <text x="280" y="340" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">Analyze (16x)</text>

  <rect x="340" y="320" width="100" height="30" rx="3" fill="#2d2d4e"/>
  <text x="390" y="340" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">Synthesize</text>

  <rect x="450" y="320" width="100" height="30" rx="3" fill="#2d2d4e"/>
  <text x="500" y="340" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">Translate</text>

  <!-- Output Layer -->
  <rect x="30" y="410" width="680" height="70" rx="8" fill="#f5f5f5" stroke="#16a085" stroke-width="1.5"/>
  <text x="370" y="435" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#1a1a2e" font-weight="bold">Output Integration</text>

  <rect x="60" y="445" width="130" height="28" rx="4" fill="#1a1a2e"/>
  <text x="125" y="464" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">OOXML Surgery</text>

  <rect x="210" y="445" width="130" height="28" rx="4" fill="#1a1a2e"/>
  <text x="275" y="464" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a085">MongoDB Store</text>

  <rect x="360" y="445" width="130" height="28" rx="4" fill="#1a1a2e"/>
  <text x="425" y="464" text-anchor="middle" font-family="monospace" font-size="9" fill="#f39c12">DMS Filing</text>

  <rect x="510" y="445" width="130" height="28" rx="4" fill="#1a1a2e"/>
  <text x="575" y="464" text-anchor="middle" font-family="monospace" font-size="9" fill="#f39c12">Notifications</text>

  <!-- External systems (bottom) -->
  <rect x="60" y="520" width="130" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="1.5"/>
  <text x="125" y="542" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white">Word Document</text>
  <text x="125" y="558" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">.docx redline</text>

  <rect x="210" y="520" width="130" height="50" rx="6" fill="#1a1a2e" stroke="#16a085" stroke-width="1.5"/>
  <text x="275" y="542" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white">MongoDB Atlas</text>
  <text x="275" y="558" text-anchor="middle" font-family="monospace" font-size="8" fill="#16a085">Results + Metrics</text>

  <rect x="360" y="520" width="130" height="50" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="425" y="542" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white">iManage / NetDocs</text>
  <text x="425" y="558" text-anchor="middle" font-family="monospace" font-size="8" fill="#f39c12">Document Mgmt</text>

  <rect x="510" y="520" width="130" height="50" rx="6" fill="#1a1a2e" stroke="#f39c12" stroke-width="1.5"/>
  <text x="575" y="542" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="white">Slack / Email</text>
  <text x="575" y="558" text-anchor="middle" font-family="monospace" font-size="8" fill="#f39c12">Calendar</text>

  <!-- Arrows -->
  <line x1="100" y1="100" x2="115" y2="165" stroke="#16a085" stroke-width="1.5" marker-end="url(#topo-arrow)"/>
  <line x1="270" y1="100" x2="265" y2="165" stroke="#16a085" stroke-width="1.5" marker-end="url(#topo-arrow)"/>
  <line x1="440" y1="100" x2="415" y2="165" stroke="#16a085" stroke-width="1.5" marker-end="url(#topo-arrow)"/>
  <line x1="610" y1="100" x2="565" y2="165" stroke="#f39c12" stroke-width="1.5" marker-end="url(#topo-arrow-amber)"/>
  <line x1="340" y1="250" x2="340" y2="280" stroke="#16a085" stroke-width="1.5" marker-end="url(#topo-arrow)"/>
  <line x1="340" y1="380" x2="340" y2="410" stroke="#16a085" stroke-width="1.5" marker-end="url(#topo-arrow)"/>
  <line x1="125" y1="473" x2="125" y2="520" stroke="#16a085" stroke-width="1.5" marker-end="url(#topo-arrow)"/>
  <line x1="275" y1="473" x2="275" y2="520" stroke="#16a085" stroke-width="1.5" marker-end="url(#topo-arrow)"/>
  <line x1="425" y1="473" x2="425" y2="520" stroke="#f39c12" stroke-width="1.5" marker-end="url(#topo-arrow-amber)"/>
  <line x1="575" y1="473" x2="575" y2="520" stroke="#f39c12" stroke-width="1.5" marker-end="url(#topo-arrow-amber)"/>

  <!-- Legend -->
  <rect x="740" y="130" width="160" height="100" rx="4" fill="white" stroke="#1a1a2e" stroke-width="1"/>
  <text x="820" y="152" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#1a1a2e" font-weight="bold">Legend</text>
  <line x1="755" y1="168" x2="785" y2="168" stroke="#16a085" stroke-width="2"/>
  <text x="795" y="172" font-family="Georgia, serif" font-size="9" fill="#1a1a2e">Core integration</text>
  <line x1="755" y1="192" x2="785" y2="192" stroke="#f39c12" stroke-width="2"/>
  <text x="795" y="196" font-family="Georgia, serif" font-size="9" fill="#1a1a2e">External system</text>
  <rect x="755" y="206" width="30" height="12" rx="2" fill="#1a1a2e"/>
  <text x="795" y="216" font-family="Georgia, serif" font-size="9" fill="#1a1a2e">Pipeline component</text>
</svg>
```


The topology has four layers. The **client layer** at the top includes every system
that initiates interaction with the pipeline: Claude Desktop through MCP, the web
dashboard through React and SSE, programmatic clients through REST APIs, and external
agents through A2A. Each client type connects through a different protocol, but all
reach the same pipeline core.


The **integration layer** handles protocol translation, authentication, rate limiting,
and request routing. The MCP server translates tool calls into pipeline invocations.
The Express API translates HTTP requests into pipeline invocations. The SSE stream
translates pipeline events into browser-consumable events. The webhook system translates
pipeline events into external HTTP deliveries. All four share the same authentication
and authorization infrastructure.


The **pipeline core** is the backautocrat and diplomat architecture from Chapter 4.
It receives typed input from the integration layer, runs the multi-agent analysis, and
produces typed output. The pipeline core has no knowledge of which client initiated the
request or how results will be delivered. That separation is the integration layer's
responsibility.


The **output layer** handles the final mile: OOXML surgery to produce redlined documents,
MongoDB storage to persist results and metrics, DMS filing to place documents in the
firm's document management system, and notifications to alert relevant parties. Each
output handler receives the same typed results from the pipeline core and formats them
for its specific destination.


### Designing for Integration from the Start


The most expensive integration mistake is building the pipeline first and bolting
integration on afterward. Integration concerns must be part of the initial design.
When you define your pipeline's typed interfaces (Chapter 4), you are simultaneously
defining the contracts that the MCP server, the API routes, the SSE events, and the
webhook payloads will use. When you define your backautocrat's orchestration flow, you
are simultaneously defining the SSE event sequence that the frontend will display.


Three design principles keep integration clean.


**First, type everything at the boundary.** Every piece of data that crosses an
integration boundary (entering from an API route, leaving through a webhook, stored
in MongoDB, served through MCP) must have a TypeScript interface. The interface is
the contract. If the pipeline's output type changes, the compiler flags every
integration point that needs updating. Without typed boundaries, integration
changes become silent breakage.


**Second, separate protocol from logic.** The MCP server, the API route, and the
A2A handler all trigger the same pipeline function with the same typed parameters.
They differ only in how they receive the request and how they format the response.
This means adding a new integration protocol requires only a new protocol adapter,
not any change to the pipeline.


**Third, emit events, do not call systems.** The pipeline emits typed events
(`analysis.completed`, `risk.critical`, `obligation.discovered`). The webhook delivery
system routes those events to registered endpoints. The pipeline does not know about
Slack, or calendars, or email. It knows about events. This decoupling means adding a
new external integration is a configuration change (register a new webhook endpoint),
not a code change.


> **Key Concept**
>
> Integration is not a feature you add to a pipeline. It is a property of the
> pipeline's architecture. A pipeline with typed boundaries, event emission, and
> protocol separation is inherently integrable. A pipeline with hardcoded HTTP calls,
> untyped data, and tangled protocol logic is inherently fragile. The patterns in this
> chapter are not prescriptions for after the pipeline is built. They are constraints
> that should shape the pipeline's design from the first line of code.


\newpage


---


**Key Takeaways**


- **MCP** is the universal standard for connecting AI agents to tools and data. Build one MCP server and every AI platform can use your legal engineering capabilities. 97 million monthly SDK downloads and Linux Foundation governance make it the permanent infrastructure standard for AI tool integration.

- **A2A** complements MCP by enabling agent-to-agent communication across organizational boundaries. MCP is for tools. A2A is for collaboration. Cross-firm workflows, multi-party transactions, and client-facing agent interfaces all use A2A.

- **OOXML Track Changes** is the output format that makes AI analysis useful to attorneys. A five-stage pipeline (extract, analyze, locate, operate, package) transforms AI directives into real `.docx` redlines that open in Word with Accept/Reject controls. The locate stage (fuzzy text matching from AI output to XML positions) is the hardest part and the most common failure point.

- **SSE streaming** provides real-time pipeline progress to the attorney's browser. Design events at orchestration boundaries (round starts, specialist completions), not at token-generation granularity. Use the browser's native `EventSource` API with automatic reconnection.

- **MongoDB** stores pipeline results, metrics, and contract metadata as BSON documents that match your TypeScript interfaces. Index every field you filter or sort on. Use aggregation pipelines for cross-run analytics and billing.

- **Express API routes** follow the asynchronous trigger pattern: accept the request, return a receipt (HTTP 202), and let the client track progress through SSE or poll for results. Authenticate every route with JWT. Authorize with RBAC. Rate-limit by user, organization, and cost tier.

- **Webhooks** push pipeline events to external systems (Slack, calendar, email, DMS). Sign every payload with HMAC-SHA256. Retry failed deliveries with exponential backoff. Log every delivery attempt for audit trails.

- **Design for integration from the start.** Type everything at the boundary. Separate protocol from logic. Emit events instead of calling systems. Integration is a property of architecture, not a feature added later.


\newpage
