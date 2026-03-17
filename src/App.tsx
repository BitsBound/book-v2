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
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
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
    const h2s = ch.headings.filter(h => h.level === 2);

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
          {h2s.length > 0 && (
            <button
              className={`sidebar-expand ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => toggleChapter(ch.slug, e)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              ›
            </button>
          )}
        </div>
        {isExpanded && h2s.length > 0 && (
          <div className="sidebar-sections">
            {h2s.map((h, i) => (
              <button
                key={i}
                className={`sidebar-section-link`}
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
        {chapter.content}
      </ReactMarkdown>
      <nav className="chapter-nav">
        {prev && <Link to={`/${prev.slug}`} className="nav-prev">← Ch. {prev.number}: {prev.title}</Link>}
        {next && <Link to={`/${next.slug}`} className="nav-next">Ch. {next.number}: {next.title} →</Link>}
      </nav>
    </article>
  );
}

function Landing() {
  const partI = chapters.filter(c => c.part === 'I');
  const partII = chapters.filter(c => c.part === 'II');

  return (
    <div className="landing">
      <header className="landing-header">
        <h1>Legal Engineering</h1>
        <p className="landing-subtitle">Building AI-Powered Legal Workflows with Multi-Agent Architectures</p>
        <p className="landing-edition">Second Edition</p>
        <p className="landing-author">Rob Taylor, Esq.</p>
        <p className="landing-meta">Taylor Legal Engineering, LLC | 2026 | ~880 pages | 18 chapters</p>
      </header>

      <section className="toc">
        <h2>Part I: Foundations</h2>
        <div className="toc-grid">
          {partI.map(ch => (
            <Link key={ch.slug} to={`/${ch.slug}`} className="toc-card">
              <span className="toc-number">{ch.number}</span>
              <span className="toc-title">{ch.title}</span>
            </Link>
          ))}
        </div>

        <h2>Part II: Applied Workflows</h2>
        <div className="toc-grid">
          {partII.map(ch => (
            <Link key={ch.slug} to={`/${ch.slug}`} className="toc-card">
              <span className="toc-number">{ch.number}</span>
              <span className="toc-title">{ch.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
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
