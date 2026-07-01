import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

// Sample questions — pure presentational copy, no live data dependency.
const SAMPLE_QUESTIONS = [
  { company: 'Stripe', role: 'Senior Backend', round: 'System Design', text: 'Design a payments system that reconciles with banks when both sides report a transaction differently.' },
  { company: 'Razorpay', role: 'SDE-2', round: 'Coding', text: 'Implement an LRU cache with O(1) get/put, then extend it to support TTL eviction.' },
  { company: 'Google', role: 'L4 SWE', round: 'Behavioural', text: 'Tell me about a time you disagreed with a senior engineer on a technical decision. What did you do?' },
  { company: 'Flipkart', role: 'SDE-1', round: 'Technical', text: 'How would you detect and prevent duplicate order submissions under high traffic?' },
];

const ROUND_TONE = {
  technical: 'bg-emerald-100 text-emerald-800',
  coding: 'bg-amber-100 text-amber-800',
  'system-design': 'bg-rose-100 text-rose-800',
  behavioural: 'bg-sky-100 text-sky-800',
  behavioral: 'bg-sky-100 text-sky-800',
  hr: 'bg-violet-100 text-violet-800',
};

export default function Landing() {
  return (
    <div className="min-h-full bg-[#f7f3ec] text-stone-900" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      {/* HEADER */}
      <header className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0f3d3a] text-[#f6c453] font-bold">
            M
          </span>
          <span className="text-base font-semibold tracking-tight">PrepPilot</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-stone-600">
          <a href="#questions" className="hover:text-stone-900 transition">Question bank</a>
          <a href="#contribute" className="hover:text-stone-900 transition">Contribute</a>
          <a href="#tools" className="hover:text-stone-900 transition">Tools</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-stone-700 hover:bg-stone-200/60">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-[#0f3d3a] hover:bg-[#0c312e] focus:ring-[#0f3d3a] text-white">Get started</Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="pt-14 sm:pt-24 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-3 py-1 text-xs font-medium text-stone-700">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c44536]" />
              The community question bank
            </div>
            <h1
              className="mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-[#0f3d3a]"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
            >
              Real interview questions,
              <br />
              <em className="not-italic text-[#c44536]" style={{ fontStyle: 'italic' }}>asked last week.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-stone-600 leading-relaxed">
              Browse a living bank of interview rounds shared by engineers who just sat through them.
              Filter by company, role, and round type — then practise them out loud with our AI interviewer.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/community-questions">
                <Button size="lg" className="bg-[#0f3d3a] hover:bg-[#0c312e] focus:ring-[#0f3d3a] text-white">
                  Browse the question bank →
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="border-stone-300 text-stone-800 hover:bg-white">
                  Contribute your round
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-stone-500">
              No login needed to read. Sign in only to contribute or practise.
            </p>
          </div>

          {/* Hero visual: a stack of community question cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[420px] sm:h-[460px]">
              {SAMPLE_QUESTIONS.map((q, i) => (
                <QuestionCard key={i} q={q} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* COMMUNITY QUESTION BANK SECTION */}
        <section id="questions" className="border-t border-stone-300/70 py-16 sm:py-24">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#c44536]">The bank</p>
              <h2
                className="mt-2 text-3xl sm:text-4xl text-[#0f3d3a] tracking-tight"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
              >
                Questions from this month, not from 2014.
              </h2>
              <p className="mt-3 text-stone-600">
                Every entry is contributed by a real candidate after their interview. Search by company,
                role, or the exact question you want to drill.
              </p>
            </div>
            <Link to="/community-questions">
              <Button className="bg-white border border-stone-300 text-stone-800 hover:bg-stone-100">
                Open the full bank
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} static />
            ))}
          </div>
        </section>

        {/* CONTRIBUTE / HOW IT WORKS */}
        <section id="contribute" className="border-t border-stone-300/70 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#c44536]">How it works</p>
              <h2
                className="mt-2 text-3xl sm:text-4xl text-[#0f3d3a] tracking-tight"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
              >
                Three steps from interview to interview prep.
              </h2>
              <p className="mt-4 text-stone-600">
                Share what you remember, the next person walks in better prepared than you did.
              </p>
            </div>
            <ol className="lg:col-span-7 space-y-5">
              {[
                {
                  n: '01',
                  t: 'Drop a round',
                  d: 'Company, role, round type, and the questions you were asked — one textarea, that\'s it.',
                },
                {
                  n: '02',
                  t: 'It lands in the bank',
                  d: 'Newest questions float to the top so the bank stays current, not stale.',
                },
                {
                  n: '03',
                  t: 'Practise it back',
                  d: 'One click turns any question into a live AI mock interview with scoring and feedback.',
                },
              ].map((s) => (
                <li key={s.n} className="flex gap-5 rounded-xl border border-stone-300/70 bg-white/60 p-5">
                  <span
                    className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#0f3d3a] text-[#f6c453] font-semibold"
                    style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">{s.t}</h3>
                    <p className="mt-1 text-sm text-stone-600">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* OTHER TOOLS — secondary, smaller */}
        <section id="tools" className="border-t border-stone-300/70 py-16 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#c44536]">The toolkit</p>
            <h2
              className="mt-2 text-3xl sm:text-4xl text-[#0f3d3a] tracking-tight"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
            >
              Everything else you need around the bank.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Resume Analyser', desc: 'Score your PDF out of 100, see weak sections, get concrete fixes.', icon: '◧' },
              { title: 'JD Analyser', desc: 'Extract required skills, spot gaps, surface red flags.', icon: '◎' },
              { title: 'AI Mock Interview', desc: 'One question at a time. Real-time scoring and a final report.', icon: '◐' },
              { title: 'Dashboard', desc: 'Trends, history, strong vs weak areas over time.', icon: '◰' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-stone-300/70 bg-white/70 p-5">
                <div className="text-2xl text-[#0f3d3a]">{f.icon}</div>
                <h3 className="mt-3 text-base font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-300/70 py-8 mt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} MockMate AI</p>
          <p>Built for interview prep. Powered by community + smart analysis.</p>
        </div>
      </footer>
    </div>
  );
}

function QuestionCard({ q, index, static: isStatic }) {
  // Stack offset for the hero visual.
  const offsetClass = isStatic ? '' : `absolute`;
  const stackStyle = isStatic
    ? {}
    : {
        top: `${index * 22}px`,
        left: `${index * 14}px`,
        right: `${-index * 14}px`,
        zIndex: 10 - index,
        transform: `rotate(${(index - 1.5) * 1.2}deg)`,
      };
  const tone = ROUND_TONE[q.round.toLowerCase()] || 'bg-stone-100 text-stone-800';

  return (
    <div
      className={`${offsetClass} rounded-xl border border-stone-300/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(15,61,58,0.25)] p-4 sm:p-5`}
      style={stackStyle}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900 truncate">
            {q.company} <span className="text-stone-400 font-normal">·</span> {q.role}
          </p>
        </div>
        <span className={`badge ${tone}`}>{q.round}</span>
      </div>
      <p
        className="mt-3 text-sm sm:text-[15px] text-stone-700 leading-relaxed"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        “{q.text}”
      </p>
    </div>
  );
}
