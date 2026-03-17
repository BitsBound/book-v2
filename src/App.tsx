import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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

interface ChapterInfo {
  slug: string;
  number: number;
  title: string;
  part: 'I' | 'II';
  content: string;
}

const chapters: ChapterInfo[] = [
  { slug: 'tiro-pattern', number: 1, title: 'The TIRO Pattern', part: 'I', content: ch01 },
  { slug: 'technology-essentials', number: 2, title: 'Technology Essentials', part: 'I', content: ch02 },
  { slug: 'project-setup', number: 3, title: 'Project Setup', part: 'I', content: ch03 },
  { slug: 'orchestration-patterns', number: 4, title: 'Orchestration Pattern Taxonomy', part: 'I', content: ch04 },
  { slug: 'integration', number: 5, title: 'Integration', part: 'I', content: ch05 },
  { slug: 'professional-responsibility', number: 6, title: 'Professional Responsibility', part: 'I', content: ch06 },
  { slug: 'evaluation-engineering', number: 7, title: 'Evaluation Engineering', part: 'I', content: ch07 },
  { slug: 'contract-drafting', number: 8, title: 'Contract Drafting', part: 'II', content: ch08 },
  { slug: 'contract-redlining', number: 9, title: 'Contract Redlining', part: 'II', content: ch09 },
  { slug: 'contract-analytics', number: 10, title: 'Contract Analytics', part: 'II', content: ch10 },
  { slug: 'document-triage', number: 11, title: 'Document Triage', part: 'II', content: ch11 },
  { slug: 'ma-due-diligence', number: 12, title: 'M&A Due Diligence', part: 'II', content: ch12 },
  { slug: 'legal-research', number: 13, title: 'Legal Research', part: 'II', content: ch13 },
  { slug: 'regulated-communications', number: 14, title: 'Regulated Communications', part: 'II', content: ch14 },
  { slug: 'third-party-risk', number: 15, title: 'Third-Party Risk', part: 'II', content: ch15 },
  { slug: 'obligation-tracking', number: 16, title: 'Obligation Tracking', part: 'II', content: ch16 },
  { slug: 'litigation-support', number: 17, title: 'Litigation Support', part: 'II', content: ch17 },
  { slug: 'ip-analytics', number: 18, title: 'IP Analytics', part: 'II', content: ch18 },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const partI = chapters.filter(c => c.part === 'I');
  const partII = chapters.filter(c => c.part === 'II');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" onClick={onClose} className="sidebar-title">
          Legal Engineering
          <span className="sidebar-edition">Second Edition</span>
        </Link>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-part">Part I: Foundations</div>
        {partI.map(ch => (
          <Link
            key={ch.slug}
            to={`/${ch.slug}`}
            className={`sidebar-link ${location.pathname === `/${ch.slug}` ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="ch-num">{ch.number}</span>
            <span className="ch-title">{ch.title}</span>
          </Link>
        ))}
        <div className="sidebar-part">Part II: Applied Workflows</div>
        {partII.map(ch => (
          <Link
            key={ch.slug}
            to={`/${ch.slug}`}
            className={`sidebar-link ${location.pathname === `/${ch.slug}` ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="ch-num">{ch.number}</span>
            <span className="ch-title">{ch.title}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <a href="https://taylorlegalengineering.com" className="sidebar-back">taylorlegalengineering.com</a>
      </div>
    </aside>
  );
}

function ChapterView() {
  const { slug } = useParams<{ slug: string }>();
  const chapter = chapters.find(c => c.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!chapter) return <div className="not-found">Chapter not found</div>;

  const idx = chapters.indexOf(chapter);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <article className="chapter">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
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
