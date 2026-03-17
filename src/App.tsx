import { Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

// Import all chapter markdown files as raw strings
import ch01 from '../part-i-foundations/01-tiro-pattern.md?raw';
import ch02 from '../part-i-foundations/02-technology-essentials.md?raw';
import ch03 from '../part-i-foundations/03-project-setup.md?raw';
import ch04 from '../part-i-foundations/04-orchestration-pattern-taxonomy.md?raw';
import ch05 from '../part-i-foundations/05-integration.md?raw';
import ch06 from '../part-i-foundations/06-professional-responsibility.md?raw';
import ch07 from '../part-i-foundations/07-evaluation-engineering.md?raw';
import ch08 from '../part-ii-applied-workflows/08-contract-drafting.md?raw';
import ch09 from '../part-ii-applied-workflows/09-contract-redlining.md?raw';
import ch10 from '../part-ii-applied-workflows/10-contract-analytics.md?raw';
import ch11 from '../part-ii-applied-workflows/11-document-triage.md?raw';
import ch12 from '../part-ii-applied-workflows/12-ma-due-diligence.md?raw';
import ch13 from '../part-ii-applied-workflows/13-legal-research.md?raw';
import ch14 from '../part-ii-applied-workflows/14-regulated-communications.md?raw';
import ch15 from '../part-ii-applied-workflows/15-third-party-risk.md?raw';
import ch16 from '../part-ii-applied-workflows/16-obligation-tracking.md?raw';
import ch17 from '../part-ii-applied-workflows/17-litigation-support.md?raw';
import ch18 from '../part-ii-applied-workflows/18-ip-analytics.md?raw';

interface HeadingInfo {
  text: string;
  id: string;
  level: number;
}

interface ChapterInfo {
  slug: string;
  number: number;
  title: string;
  part: 'I' | 'II';
  content: string;
  headings: HeadingInfo[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*`_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractHeadings(content: string): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const stripped = content.replace(/```[\s\S]*?```/g, '');
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(stripped)) !== null) {
    const raw = match[2];
    const text = raw.replace(/\*\*/g, '').replace(/`/g, '').replace(/_/g, '').trim();
    headings.push({ text, id: slugify(text), level: match[1].length });
  }
  return headings;
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (typeof node === 'object' && 'props' in node) return getNodeText((node as any).props.children);
  return '';
}

interface SearchResult {
  chapter: ChapterInfo;
  heading?: HeadingInfo;
  snippet: string;
  type: 'title' | 'heading' | 'content';
}

const chapters: ChapterInfo[] = [
  { slug: 'tiro-pattern', number: 1, title: 'The TIRO Pattern', part: 'I', content: ch01, headings: extractHeadings(ch01) },
  { slug: 'technology-essentials', number: 2, title: 'Technology Essentials', part: 'I', content: ch02, headings: extractHeadings(ch02) },
  { slug: 'project-setup', number: 3, title: 'Project Setup', part: 'I', content: ch03, headings: extractHeadings(ch03) },
  { slug: 'orchestration-patterns', number: 4, title: 'Orchestration Pattern Taxonomy', part: 'I', content: ch04, headings: extractHeadings(ch04) },
  { slug: 'integration', number: 5, title: 'Integration', part: 'I', content: ch05, headings: extractHeadings(ch05) },
  { slug: 'professional-responsibility', number: 6, title: 'Professional Responsibility', part: 'I', content: ch06, headings: extractHeadings(ch06) },
  { slug: 'evaluation-engineering', number: 7, title: 'Evaluation Engineering', part: 'I', content: ch07, headings: extractHeadings(ch07) },
  { slug: 'contract-drafting', number: 8, title: 'Contract Drafting', part: 'II', content: ch08, headings: extractHeadings(ch08) },
  { slug: 'contract-redlining', number: 9, title: 'Contract Redlining', part: 'II', content: ch09, headings: extractHeadings(ch09) },
  { slug: 'contract-analytics', number: 10, title: 'Contract Analytics', part: 'II', content: ch10, headings: extractHeadings(ch10) },
  { slug: 'document-triage', number: 11, title: 'Document Triage', part: 'II', content: ch11, headings: extractHeadings(ch11) },
  { slug: 'ma-due-diligence', number: 12, title: 'M&A Due Diligence', part: 'II', content: ch12, headings: extractHeadings(ch12) },
  { slug: 'legal-research', number: 13, title: 'Legal Research', part: 'II', content: ch13, headings: extractHeadings(ch13) },
  { slug: 'regulated-communications', number: 14, title: 'Regulated Communications', part: 'II', content: ch14, headings: extractHeadings(ch14) },
  { slug: 'third-party-risk', number: 15, title: 'Third-Party Risk', part: 'II', content: ch15, headings: extractHeadings(ch15) },
  { slug: 'obligation-tracking', number: 16, title: 'Obligation Tracking', part: 'II', content: ch16, headings: extractHeadings(ch16) },
  { slug: 'litigation-support', number: 17, title: 'Litigation Support', part: 'II', content: ch17, headings: extractHeadings(ch17) },
  { slug: 'ip-analytics', number: 18, title: 'IP Analytics', part: 'II', content: ch18, headings: extractHeadings(ch18) },
];

function useSearch(query: string): SearchResult[] {
  return useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];
    for (const ch of chapters) {
      if (ch.title.toLowerCase().includes(q)) {
        results.push({ chapter: ch, snippet: ch.title, type: 'title' });
      }
      for (const h of ch.headings) {
        if (h.text.toLowerCase().includes(q)) {
          results.push({ chapter: ch, heading: h, snippet: h.text, type: 'heading' });
        }
      }
      const lines = ch.content.split('\n');
      let contentMatches = 0;
      for (const line of lines) {
        if (contentMatches >= 3) break;
        const cleaned = line.replace(/^#+\s+/, '').replace(/[*`\[\]()]/g, '').trim();
        if (!cleaned || cleaned.length < 10) continue;
        const idx = cleaned.toLowerCase().indexOf(q);
        if (idx >= 0) {
          const start = Math.max(0, idx - 50);
          const end = Math.min(cleaned.length, idx + query.length + 50);
          const snippet = (start > 0 ? '...' : '') + cleaned.slice(start, end) + (end < cleaned.length ? '...' : '');
          results.push({ chapter: ch, snippet, type: 'content' });
          contentMatches++;
        }
      }
    }
    return results.slice(0, 50);
  }, [query]);
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const searchResults = useSearch(searchQuery);
  const searchRef = useRef<HTMLInputElement>(null);
  const currentSlug = location.pathname.replace(/^\//, '');

  useEffect(() => {
    if (currentSlug) {
      setExpandedChapters(prev => new Set(prev).add(currentSlug));
    }
  }, [currentSlug]);

  const toggleChapter = useCallback((slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  }, []);

  const scrollToHeading = useCallback((chapterSlug: string, headingId: string) => {
    onClose();
    if (currentSlug === chapterSlug) {
      document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/${chapterSlug}`);
      setTimeout(() => {
        document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [currentSlug, navigate, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') setSearchQuery('');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const partI = chapters.filter(c => c.part === 'I');
  const partII = chapters.filter(c => c.part === 'II');

  const renderChapter = (ch: ChapterInfo) => {
    const isActive = currentSlug === ch.slug;
    const isExpanded = expandedChapters.has(ch.slug);
    const allHeadings = ch.headings.filter(h => h.level === 2 || h.level === 3);

    return (
      <div key={ch.slug} className="sidebar-chapter-group">
        <div className="sidebar-chapter-row">
          <Link
            to={`/${ch.slug}`}
            className={`sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="ch-num">{ch.number}</span>
            <span className="ch-title">{ch.title}</span>
          </Link>
          {allHeadings.length > 0 && (
            <button
              className={`sidebar-expand ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => toggleChapter(ch.slug, e)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              ›
            </button>
          )}
        </div>
        {isExpanded && allHeadings.length > 0 && (
          <div className="sidebar-sections">
            {allHeadings.map((h, i) => (
              <button
                key={i}
                className={`sidebar-section-link ${h.level === 3 ? 'sidebar-subsection' : 'sidebar-h2'}`}
                onClick={() => scrollToHeading(ch.slug, h.id)}
              >
                {h.text}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" onClick={onClose} className="sidebar-title">
          Legal Engineering
          <span className="sidebar-edition">Second Edition</span>
        </Link>
      </div>
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search... (⌘K)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}>✕</button>
          )}
        </div>
      </div>
      <nav className="sidebar-nav">
        {searchQuery.trim().length >= 2 ? (
          <div className="search-results">
            <div className="search-results-count">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
            {searchResults.map((r, i) => (
              <button
                key={i}
                className="search-result"
                onClick={() => {
                  setSearchQuery('');
                  if (r.heading) scrollToHeading(r.chapter.slug, r.heading.id);
                  else { onClose(); navigate(`/${r.chapter.slug}`); }
                }}
              >
                <span className="search-result-chapter">Ch. {r.chapter.number}: {r.chapter.title}</span>
                <span className="search-result-snippet">{r.snippet}</span>
                <span className={`search-result-type type-${r.type}`}>{r.type}</span>
              </button>
            ))}
            {searchResults.length === 0 && <div className="search-no-results">No results found</div>}
          </div>
        ) : (
          <>
            <div className="sidebar-part">Part I: Foundations</div>
            {partI.map(renderChapter)}
            <div className="sidebar-part">Part II: Applied Workflows</div>
            {partII.map(renderChapter)}
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <a href="https://taylorlegalengineering.com" className="sidebar-back">taylorlegalengineering.com</a>
      </div>
    </aside>
  );
}

const markdownComponents = {
  h1: ({ children, ...props }: any) => {
    const id = slugify(getNodeText(children));
    return <h1 id={id} {...props}>{children}</h1>;
  },
  h2: ({ children, ...props }: any) => {
    const id = slugify(getNodeText(children));
    return <h2 id={id} {...props}>{children}</h2>;
  },
  h3: ({ children, ...props }: any) => {
    const id = slugify(getNodeText(children));
    return <h3 id={id} {...props}>{children}</h3>;
  },
};

function ChapterView() {
  const { slug } = useParams<{ slug: string }>();
  const chapter = chapters.find(c => c.slug === slug);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [slug]);

  if (!chapter) return <div className="not-found">Chapter not found</div>;

  const idx = chapters.indexOf(chapter);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <article className="chapter">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={markdownComponents}
      >
        {chapter.content.replace(/\\newpage\n?/g, '')}
      </ReactMarkdown>
      <nav className="chapter-nav">
        {prev && <Link to={`/${prev.slug}`} className="nav-prev">← Ch. {prev.number}: {prev.title}</Link>}
        {next && <Link to={`/${next.slug}`} className="nav-next">Ch. {next.number}: {next.title} →</Link>}
      </nav>
    </article>
  );
}

function Cover() {
  const partI = chapters.filter(c => c.part === 'I');
  const partII = chapters.filter(c => c.part === 'II');

  return (
    <div className="cover">
      <header className="cover-header">
        <h1 className="cover-title">Legal Engineering</h1>
        <p className="cover-subtitle">Building AI-Powered Legal Workflows with Multi-Agent Architectures</p>
        <div className="cover-divider" />
        <p className="cover-author">Robert Taylor, Esq.</p>
        <p className="cover-credentials">Founding Partner, Taylor Legal Engineering | PA & NY Bar | CIPP/E</p>
      </header>

      <p className="cover-description">
        This book teaches you how to design, build, and deploy production-grade legal
        AI systems using multi-agent pipeline architectures. From the foundational
        TIRO pattern through parallel swarm execution to full workflow
        implementations across eleven legal domains, every chapter pairs theory with
        working TypeScript code you can run yourself.
      </p>

      <section className="cover-toc">
        <h2 className="cover-toc-heading">Table of Contents</h2>

        <Link to="/introduction" className="cover-toc-item cover-toc-special">
          Introduction: What Legal Engineering Is and Why It Matters
        </Link>

        <h3 className="cover-toc-part">Part I: Foundations</h3>
        {partI.map(ch => (
          <Link key={ch.slug} to={`/${ch.slug}`} className="cover-toc-item">
            <span>Chapter {String(ch.number).padStart(2, '0')}: {ch.title}</span>
          </Link>
        ))}

        <h3 className="cover-toc-part">Part II: Applied Workflows</h3>
        {partII.map(ch => (
          <Link key={ch.slug} to={`/${ch.slug}`} className="cover-toc-item">
            <span>Chapter {String(ch.number).padStart(2, '0')}: {ch.title}</span>
          </Link>
        ))}

        <Link to="/conclusion" className="cover-toc-item cover-toc-special">
          Conclusion: The Discipline That Did Not Exist Five Years Ago
        </Link>
      </section>
    </div>
  );
}

const introductionContent = `# Introduction: What Legal Engineering Is and Why It Matters

## What Is Legal Engineering

Legal Engineering is the practice of designing, building, and deploying AI-powered workflows that automate legal work using multi-agent pipeline architectures. It sits at the intersection of three domains: legal practice, software engineering, and AI systems design. Each domain contributes an essential element. Legal practice supplies the substantive knowledge of what correct legal work looks like: the doctrinal rules, the professional obligations, the regulatory constraints, and the practical judgment that separates competent analysis from malpractice. Software engineering supplies the discipline of building reliable, maintainable, production-grade systems: type safety, error handling, testing, deployment, and operational monitoring. AI systems design supplies the architecture patterns that make large language models useful at scale: prompt decomposition, multi-agent orchestration, parallel execution, and output synthesis.

Legal Engineering is not prompt engineering. Prompt engineering is the craft of writing effective instructions for a single AI call. It is a necessary skill, but it operates at the wrong level of abstraction. A prompt engineer optimizes one message to one model. A legal engineer designs a system of twenty or thirty coordinated AI calls, each with a specialized role, orchestrated across multiple sequential rounds, producing a deliverable that meets the standard of care for legal work product. The difference is the difference between writing a good email and designing an organizational structure.

Legal Engineering is not legal technology in the traditional sense. Legal technology typically refers to off-the-shelf SaaS products: contract lifecycle management platforms, e-discovery tools, document automation systems. These are products you purchase and configure. Legal Engineering is the discipline of building those products, or of building custom AI systems that exceed what any off-the-shelf product can do because they are tailored to specific workflows, specific document types, and specific quality standards. A legal technologist evaluates vendors. A legal engineer builds the system.

The defining characteristic of Legal Engineering is the treatment of legal logic and computational logic as the same formal structure expressed in different syntax. A date in a contract and a Date object in TypeScript are the same thing. A conditional clause and an if-statement are the same thing. A list of obligations and an array of strings are the same thing. This is not an analogy. It is a structural isomorphism, and it is what makes the entire discipline possible. Legal documents are structured data written in natural language, and AI systems can parse that structure because the underlying logic is identical to the logic that software systems already process.

## Who This Book Is For

This book serves four audiences.

**Attorneys** who want to understand and build the AI systems transforming their profession. Not attorneys who want to type questions into a chatbot, but attorneys who want to understand why certain AI systems produce partner-level work product and others produce unreliable summaries. Attorneys who recognize that the ability to design and evaluate AI legal workflows will be a core professional competency within five years, and who intend to develop that competency rather than delegate it to vendors they cannot evaluate. This book teaches the engineering side with enough precision that an attorney with basic programming literacy can build working systems. No prior AI experience is required.

**Software engineers** entering the legal vertical. Engineers who can build distributed systems, design APIs, and deploy production applications, but who need to understand the legal domain they are building for. What does attorney-client privilege require of your data architecture? What is the standard of care, and how does it translate to quality thresholds in your scoring rubric? What regulatory constraints govern the storage and processing of legal documents? What does a redlined contract actually look like in OOXML, and why does formatting precision matter as much as analytical accuracy? This book teaches the legal side with enough depth that an engineer can build systems that meet professional standards, not just technical specifications.

**Legal operations professionals** responsible for evaluating, procuring, or managing AI tools within law firms, corporate legal departments, or alternative legal service providers. These professionals need to distinguish genuine capability from marketing claims. When a vendor says "AI-powered contract review," this book equips you to ask the right questions. Is it a single-prompt system or a multi-agent pipeline? Does it produce real OOXML Track Changes or plain text suggestions? Does it cite legal authority or generate unsourced recommendations? How does it handle attorney-client privilege? The answers to these questions determine whether a product delivers defensible work product or expensive summaries.

**Students** pursuing careers at the intersection of law and technology. Law students, computer science students, and graduate students in legal technology or computational law programs will find this book a practical complement to academic coursework. The book is structured as the core text for the TLE Academy certification program, with each chapter mapping to a course module that includes hands-on coding exercises and graded assessments.

All four audiences benefit from the book's dual approach. Every concept is explained in both legal and code terms. A contract provision and its TypeScript equivalent appear side by side, because they are the same formal structure. An attorney reads the legal column and learns the code. An engineer reads the code column and learns the law. A student gains fluency in both simultaneously. All arrive at the same understanding.

## How This Book Is Organized

The book is divided into two parts across eighteen chapters.

**Part I: Foundations** (Chapters 1 through 7) establishes the concepts, patterns, and infrastructure that every legal engineering workflow requires. Chapter 1 introduces TIRO, the universal decomposition pattern that structures every AI operation as Trigger, Input, Requirements (comprising Arbitration, Definitions, Validations, and Transformations), and Output. Chapter 2 covers the technology stack: TypeScript, the Claude API, OOXML document format, and the Express/React/MongoDB/SSE infrastructure layer. Chapter 3 walks through project setup and scaffolding. Chapter 4 presents the orchestration pattern taxonomy: sequential diplomats, parallel swarms, and hybrid architectures. Chapter 5 covers integration: OOXML Track Changes, SSE streaming, and API design. Chapter 6 addresses professional responsibility: attorney-client privilege, data isolation, and compliance. Chapter 7 teaches evaluation engineering: scoring rubrics, automated judges, and quality measurement.

**Part II: Applied Workflows** (Chapters 8 through 18) implements eleven complete legal engineering pipelines, each building on the foundations from Part I. Contract drafting (Chapter 8), contract redlining (Chapter 9), contract analytics (Chapter 10), document triage (Chapter 11), M&A due diligence (Chapter 12), legal research (Chapter 13), regulated communications (Chapter 14), third-party risk assessment (Chapter 15), obligation tracking (Chapter 16), litigation support (Chapter 17), and IP analytics (Chapter 18). Each chapter follows the same structure: the legal context, the pipeline architecture, the implementation in production TypeScript, and the evaluation methodology.

## The Architecture Thesis

The core position of this book, supported by empirical research from TLE R&D, is that architecture matters as much as model selection. The same frontier model analyzing the same 42,274-word M&A contract produced 35 track changes with zero citations when used as a single prompt, versus 138 track changes with 18 legal citations when wrapped in a 26-agent, 6-round pipeline. A 3.9x improvement with zero change in model capability. The industry fixates on which model is "best." This book demonstrates that a well-architected pipeline around last year's model will outperform a single prompt to next year's model. Architecture is the multiplier.

That is Legal Engineering. Let us begin.
`;

const conclusionContent = `# Conclusion: The Discipline That Did Not Exist Five Years Ago

When this book opened, it made a claim: Legal Engineering is the practice of designing, building, and deploying AI-powered workflows that automate legal work using multi-agent pipeline architectures. Eighteen chapters later, that claim is no longer abstract. You have seen it built, piece by piece, from TypeScript interfaces to OOXML Track Changes surgery, from single-pass prompts to parallel specialist swarms, from theoretical decomposition patterns to production systems that draft contracts, redline agreements, triage documents, track obligations, conduct due diligence, screen for privilege, analyze intellectual property portfolios, and generate research memos.

The thesis of this book is not that AI will change legal practice. That is obvious and uninteresting. The thesis is that *architecture* is what separates AI that produces partner-level work product from AI that produces expensive summaries. The same frontier model, given the same contract, produces thirty-five track changes with zero citations when used as a single prompt, and one hundred thirty-eight track changes with eighteen legal citations when wrapped in a multi-agent pipeline. The model did not get smarter. The architecture around it got better. That is Legal Engineering.

## What You Now Know

**Part I** gave you the foundations. You learned that legal logic and computational logic are the same formal structure expressed in different syntax. A date is a date. A boolean is a boolean. An optional field is "if applicable." This isomorphism is not a metaphor. It is the structural reality that makes the entire discipline possible. You learned TIRO, the universal decomposition pattern that structures every legal AI operation as Trigger, Input, Requirements, and Output. You learned that multi-pass pipelines with paired prompter-executor diplomats produce measurably better output than single-pass calls. You learned that parallelization via fan-out/fan-in patterns lets you deploy dozens of specialist agents simultaneously, and that a synthesizer is mandatory because parallel fragments without synthesis are worse than a single coherent pass. You learned that OOXML Track Changes surgery, not plain-text markup, is what makes AI-generated redlines indistinguishable from human attorney work product. You learned that attorney-client privilege imposes architectural constraints that no amount of clever prompting can satisfy: you need to own the infrastructure. And you learned how to evaluate your own pipelines with automated scoring rubrics and judge systems.

**Part II** proved the pattern generalizes. Eleven distinct legal workflows, each with different inputs, different analytical requirements, different output formats, and different professional standards, all built on the same foundational architecture. Contract drafting uses a playbook-to-prose pipeline. Contract redlining uses adversarial analysis with OOXML surgery. Contract analytics uses schema-driven extraction with portfolio aggregation. Document triage uses specialist classification with urgency routing. M&A due diligence uses six-dimensional risk analysis with change-of-control mapping. Legal research uses parallel investigation with mandatory citation verification. Regulated communications uses multi-framework compliance overlays. Third-party risk assessment uses tiered evaluation with maturity modeling. Obligation tracking uses extraction pipelines with calendaring and alerting. Litigation support uses privilege screening with defensibility metrics. IP analytics uses portfolio-wide pattern detection with competitive landscape mapping.

Eleven workflows. One architecture. That is not coincidence. That is a discipline.

## What Has Not Changed

Nothing in this book changes the fundamental nature of legal practice. Attorneys still owe duties of competence, diligence, and confidentiality. The standard of care still requires professional judgment. A hallucinated citation still constitutes malpractice if relied upon without verification. The attorney-client privilege still requires that communications be made in confidence for the purpose of obtaining legal advice.

What has changed is the efficiency frontier. Work that took forty associate hours can now be completed in thirty minutes of pipeline execution plus two hours of attorney review and refinement. The attorney's role shifts from production to supervision, from drafting to evaluating, from researching to verifying. But the attorney's judgment remains the irreducible core. The pipeline produces the raw material. The attorney transforms it into counsel.

This is not a limitation of the technology. It is a feature of the profession. Legal judgment, the ability to weigh competing considerations, assess risk tolerance, navigate ambiguity, and advise a client on what they *should* do rather than merely what they *can* do, is not a computation. It is a professional skill that requires experience, empathy, and ethical commitment.

The legal engineer's job is to build systems that handle everything *except* judgment, so that the attorney's judgment can be applied to work product that is already thorough, well-researched, properly formatted, and internally consistent. That division of labor is what makes Legal Engineering valuable: not replacing attorneys, but making every attorney as productive as a team.

## What Comes Next

Legal Engineering as a discipline is less than two years old. The tools are new. The patterns are new. The professional category did not exist when most of today's practicing attorneys finished law school. But the underlying capabilities, large language models that can read and generate sophisticated legal text, API infrastructure that enables programmatic orchestration, and cloud platforms that provide the compute for parallel execution, are here now and improving rapidly.

Three developments will shape the next phase of the discipline.

### Models Will Improve, but Architecture Will Still Win

Model capability will continue to improve, but the architectural advantage will persist. Better models will raise the quality floor of single-pass AI systems, but they will also raise the ceiling of multi-agent pipelines by the same margin. A well-architected pipeline around next year's model will outperform a single prompt to the model after that. The gap narrows in percentage terms but remains meaningful in absolute quality. Architecture is a permanent multiplier, not a temporary workaround.

### Database Integration Will Close the Verification Gap

Integration with legal databases will close the verification gap. The most significant limitation of current systems, the inability to verify citations against live legal databases in real time, is an integration problem, not an AI problem. When pipelines can query Westlaw or Lexis programmatically, citation verification becomes deterministic rather than probabilistic. Hallucinated citations will go from "the biggest barrier to adoption" to a solved problem. The pipeline architecture is already designed for this integration. The database APIs are the missing piece.

### The Market Will Bifurcate

Firms and legal departments that adopt engineered AI workflows will operate at fundamentally different cost structures and turnaround times than those that do not. A contract review that costs $15,000 and takes two weeks at a firm without AI will cost $2,000 and take two days at a firm with a properly engineered pipeline. That is not a marginal improvement. It is a structural advantage that compounds across every matter, every month, every year.

## The Builder's Advantage

This book taught you to build. Not to evaluate vendors, not to write prompts, not to configure off-the-shelf products, but to build production-grade AI systems from the ground up. That capability is rare. As of this writing, the number of people who can simultaneously practice law and build multi-agent AI pipelines is small enough that most of them know each other.

That scarcity is your advantage, and it is temporary. Five years from now, law schools will teach Legal Engineering as a required course. Computer science programs will offer legal technology specializations. Certification programs will produce thousands of qualified practitioners. The early movers, the people who built while others watched, will have years of production experience, battle-tested architectures, and institutional knowledge that cannot be compressed into a semester.

You have the foundations. You have the patterns. You have eighteen chapters of production-grade code and eleven complete workflow implementations. The question is not whether Legal Engineering will transform legal practice. It will. The question is whether you will be the one building the systems or the one buying them.

Build.
`;

function MarkdownPage({ content, prevLink, nextLink }: { content: string; prevLink?: { to: string; label: string }; nextLink?: { to: string; label: string } }) {
  useEffect(() => { window.scrollTo(0, 0); }, [content]);
  return (
    <article className="chapter">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
      <nav className="chapter-nav">
        {prevLink && <Link to={prevLink.to} className="nav-prev">← {prevLink.label}</Link>}
        {nextLink && <Link to={nextLink.to} className="nav-next">{nextLink.label} →</Link>}
      </nav>
    </article>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation">
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/:slug" element={<ChapterView />} />
        </Routes>
      </main>
    </div>
  );
}
