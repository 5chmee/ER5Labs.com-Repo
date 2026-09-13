// The site: data, views, router and the live markets panel. Every view is
// built as a string and written with innerHTML, so all content goes through
// esc() and every link through SLUG or PAGE.
import '../styles/markets.css';
import { liveQuotes } from './live-quotes.js';

const TRACKS = {
  studio:     { title:'Studio',     blurb:'Commissioned work, built to a brief for a client.', note:'Paid engagements.' },
  projects:   { title:'Projects',   blurb:'Things I built because I wanted to know whether they would work.', note:'Self-directed builds.' },
  writing:    { title:'Notes',      blurb:'Things I have been thinking about, written down while I still find them interesting.', note:'Notes and essays.' },
  playground: { title:'Playground', blurb:'Small interactive experiments. Made to show a mechanism, not to prove a result.', note:'Experiments and toys.' }
};

const ITEMS = [
  { t:'studio', slug:'confidential-ai', title:'Confidential AI RAG agent, pivoted to a redaction tool first', date:'2026-08',
    area:'Applied AI', kit:'Python · spaCy (NER) · pdfplumber · pandas',
    client:'SBH & Co. Chartered Accountants', engagement:'Redaction tool in development, RAG agent deferred',
    ongoing:true,
    blurb:'Started as a confidential RAG agent hosted on Indian servers. Now leading with a proprietary redaction and conversion tool built for SBH & Co., which the agent can sit on later.',
    body:['The original brief was a confidential AI agent: retrieval over the firm’s own records, helping with bookkeeping, GST and ITR work and the audit process, hosted on AWS in the Mumbai region so client data stayed in India. It was the right end point but the wrong place to start. Servers, a retrieval stack and a front end are a large, expensive commitment for a practice that had not yet seen any of it work.',
          'So the project now leads with the piece everything else depends on. The firm’s staff already want to use AI models on client files; what stops them is confidentiality. The tool takes the documents the firm actually handles, such as bank statements and ledgers, converts them to clean text, and strips identifying details on the firm’s own machines before anything reaches a model.',
          'It grew out of the redaction script I wrote during my chartered accountancy internship at SBH & Co., which proved the approach on 20+ bank statements at 94% accuracy. The tool is that script turned into something the whole firm can use, rather than something only I could run.',
          'It is written for this firm rather than as a general product: the document layouts it parses, the fields it treats as identifying and the output formats are all set by how this practice works. Redaction is checked by reading the output rather than assumed, and anything missed becomes a new rule.',
          'The first scope also included custom plugins for Tally and Winman, so the tool could pull data straight out of the firm’s accounting software. After the costs were restructured, those were dropped: the build and upkeep cost against the time they would actually save did not justify it, and exporting from the software by hand remains the cheaper route for now.',
          'The RAG agent is not abandoned. Once the firm is using redacted files day to day, the agent becomes a smaller step: it can be built on inputs that are already safe to send, instead of carrying the whole confidentiality problem on its own.',
          'The earlier projections of around 1,875 working hours and ₹3,00,000 a year were made for the full agent, not for this tool, so they are not claimed here. The tool’s own figures will be stated once it is in use.'] },

  { t:'projects', slug:'investment-portfolio', title:'Investment portfolio and sentiment model', date:'2023-12',
    area:'Data', kit:'Excel · DCF valuation · P/E analysis · Sharpe ratio and beta · sentiment aggregation',
    onTimeline:false, ongoing:true,
    blurb:'A live 27-position equity portfolio: a screen and a valuation model narrow the field, then the call is mine. 114.6% over the first 30 months, about 35.7% a year.',
    body:['This is a discretionary portfolio with a systematic filter in front of it, not a rules-based strategy. The screen exists to stop me looking at the wrong hundred companies; it does not tell me what to buy.',
          'The screening matrix covers six sectors (technology, biotech, defence, commodities, industrials and pharmaceuticals). Shortlisted names get a DCF model and a P/E comparison, and each position is tracked for beta and Sharpe ratio against the S&P 500, the Nasdaq-100 and the FTSE 100, which is what decides sizing and how much is kept back as cash.',
          'A second sheet pulls in retail sentiment from Yahoo Finance, Reddit and other forums. It is useful mainly as a check on timing rather than on quality.',
          'What the sheets cannot do is decide. Reading the shortlist, forming a view on where a sector is heading, and sizing the position are judgement, informed by the numbers rather than dictated by them. Getting that judgement wrong is the main risk in the whole thing, and it is the part I am still trying to make less arbitrary.',
          'It started with £5,000 across ten or so equities, which returned 56.3% over 18 months (NVDA +110%, PLTR +236%, RDDT +77%), ahead of both the S&P 500 and the Nasdaq by more than 20 points. At 24 months it stood at 101.1% across 35 positions, led by INTC +370%, AMD +188% and NVDA +143%.',
          'Over the first 30 months, on £10,000 of deployed capital, the return is 114.6% as reported by Trading 212, about 35.7% a year compounded. The largest gains in that period came from INTC, RKLB, SMSD (the Samsung Electronics GDR) and LAR. It is still running.',
          'The honest caveat: one portfolio, one market regime, and a period that was unusually kind to semiconductors and defence. It shows a process being followed and a view being taken, not an edge being proven.'] },

  { t:'projects', slug:'redaction-pipeline', title:'File conversion and redaction script', date:'2026-07',
    area:'Scripts', during:'Chartered accountancy internship, SBH & Co.', kit:'Python · Bash · spaCy (NER) · pdfplumber · pandas',
    ongoing:true,
    blurb:'Written during the SBH & Co. internship: converts bank statements and other financial documents to plain text and strips identifying details locally, so the redacted copy is the only one an AI model ever sees.',
    body:['It started at SBH & Co., where 20+ bank statements of 5 to 13 pages each needed analysing with ChatGPT, Copilot and Gemini without any client details leaving the office. pdfplumber and pandas pull the statements apart into Markdown; the redaction runs before anything else touches the output.',
          'The general version takes .md and .txt files, finds names, account details and other identifying fields with spaCy’s named entity recognition, and writes a redacted copy. Run from the command line, it then deletes the raw input so the unredacted version does not linger in the working folder.',
          'Accuracy is 94%, and that figure comes from reading every output file by hand rather than from a test set. The 6% it missed was fed back in as new rules, so the number is a floor that has been moving up.',
          'Converting to Markdown also cut the token count sharply compared with sending the PDFs, which mattered as much for cost as the redaction did for confidentiality. On the firm’s side it took about 30% off manual document processing, 45 to 70 minutes a time.'] },

  { t:'projects', slug:'osint-research', title:'OSINT and network research pipeline', date:'2026-08',
    area:'Data', kit:'Python · SQL · graph databases · fuzzy entity resolution',
    ongoing:true,
    blurb:'Work in progress: a pipeline that collects public records, resolves them into single identities, and maps how people, companies and assets connect several steps out.',
    body:['Started in August 2026 and still in development, so this describes the design and where it stands rather than a finished result.',
          'The first stage is collection. Python and SQL scrape, clean and normalise unstructured public records, such as corporate filings and property registries, into one consistent format for self-directed network research.',
          'The second is resolution. The same person or company appears under slightly different names, addresses and spellings across sources, so a graph database schema built on node and edge modelling uses fuzzy entity resolution to merge those scattered profiles into unified identity clusters.',
          'The third is tracing. Network visualisation tools, still being scoped, follow relational paths several degrees out, mapping direct and indirect corporate ties, interpersonal networks, familial associations, shared assets and multi-tier organisational hierarchies.',
          'The hard part is expected to be the resolution step: merge too eagerly and two different people become one, too cautiously and one person stays split across ten records. How to measure that trade-off is the first thing to settle.'] },

  { t:'projects', slug:'er5labs', title:'ER5Labs.com', date:'2025-11',
    area:'Tooling', kit:'Astro · TypeScript · Vercel',
    blurb:'This site. Statically rendered, a few kilobytes of JavaScript, with serverless routes for the live data.',
    body:['Every page is a finished file, generated at build time. The only things computed on demand are the two endpoints that have to be current, because a browser cannot call those data sources directly and a security rule called CORS is the reason.',
          'The parts I would point at: a content security policy scoped to the three origins the page actually contacts, endpoints that refuse query strings so the edge cache cannot be bypassed, a build step that strips maintenance comments out of the shipped HTML, and an icon set generated from one small configuration rather than five hand-drawn files.',
          'It is also where most of the measuring happens. Several things on this site were changed because a profiler or a pixel readout disagreed with how it looked.'] },

  { t:'playground', slug:'markets', title:'Markets, explained', date:'2026-09',
    href:'/playground/markets',
    area:'Markets', kit:'WebSockets · Protobuf · RSS · Yahoo Finance · Apewisdom',
    blurb:'The most traded and most discussed stocks today, streaming live, each with a page that lays out what moved it: the news, the forum chatter and the numbers, with every source linked.',
    body:['The live list and a page for each stock are on their own pages.'] },

  { t:'playground', slug:'mining-demo', title:'Bitcoin mining, as a probability', date:'2026-07',
    href:'/playground/bitcoin-mining-game',
    area:'Probability', kit:'Web Workers · SHA-256 · WebSockets · Exponential distribution · Expected value',
    blurb:'Hashes the real header of the latest Bitcoin block on background threads, shows why proof of work is a lottery, then prices that lottery honestly.',
    body:['The full lab and walkthrough are on their own page.'] },

    { t:'writing', slug:'middleman', title:'Capitalism favours the middleman', date:'2026-09',
    area:'Economics', kit:'In draft',
    blurb:'On how the largest returns often accrue to the party that contributes least to the actual transaction.',
    body:['In draft.'] },

  { t:'writing', slug:'learn-on-the-job', title:'Learning on the job', date:'2026-09',
    area:'Method', kit:'In draft',
    blurb:'Why almost everything I can actually do was learned while doing it, and what that says about how I pick work.',
    body:['In draft.'] },

  { t:'writing', slug:'cultivating-a-child', title:'Cultivating a child, from a former one', date:'2026-09',
    area:'Essay', kit:'In draft',
    blurb:'A child is a composition of two people, including how each of them worked out what to do with themselves.',
    body:['In draft.'] },
];

// The timeline is a selection, not a record: studies and roles only. Projects
// have their own listing at the foot of the About page.
// The degree is still running, so it sits above the timeline as its own record
// rather than as one bar among finished ones.
const DEGREE = {
  start:'2024-09', end:'2027-07',
  title:'BSc Mathematics, Finance and Accounting', org:'Queen Mary University of London',
  facts:[['Standing','Final year, on track for a 2:1 overall'],
         ['Graduating','July 2027'],
         ['Year 1','BUS170 Introduction to Accounting and Finance · MTH4113 Numbers, Sets and Functions · MTH4400 Applied Calculus · MTH4600 Applied Probability and Statistics · BUS137 Economics for Business Management · MTH4115 Vectors and Matrices'],
         ['Year 2','BUS283 Financial Markets and Securities · MTH5129 Probability and Statistics II · MTH5212 Applied Linear Algebra · MTH5123 Differential Equations · BUS282 Financial and Management Accounting · MTH5120 Statistical Modelling I · MTH5103 Complex Variables · MTH5115 Linear Optimisation and Game Theory'],
         ['Year 3','BUS341 Corporate Financial Management · MTH6141 Random Processes · MTH6154 Financial Mathematics I · MTH6134 Statistical Modelling II · BUS381 Advanced Financial and Management Accounting · MTH6101 Introduction to Machine Learning · MTH6113 Mathematical Tools for Asset Management · MTH6155 Financial Mathematics II']],
};

const HISTORY = [
  { kind:'job', start:'2026-08', end:'Present', current:true,
    title:'Confidential AI RAG agent, pivoted to a redaction tool first', org:'SBH & Co. Chartered Accountants, client engagement',
    lead:'Ongoing client work: a proprietary redaction and conversion tool for the firm first, with the confidential RAG agent to be built on top of it.',
    duties:['Rescoped a confidential RAG agent, hosted on AWS in the Mumbai region, into a redaction tool first, after weighing the servers, retrieval stack and front end against what the practice needed to see working.',
            'Building the tool around the firm’s own documents: bank statements and ledgers converted to clean text, with identifying details stripped on the firm’s machines before anything reaches a model.',
            'Checking redaction by reading the output rather than assuming it, and turning every miss into a new rule.',
            'Dropped the custom Tally and Winman plugins from the first scope once costs were restructured, since the build and upkeep did not justify the time they would save.'],
    kit:'Python · spaCy (NER) · pdfplumber · pandas · Client scoping',
    project:'confidential-ai', projectLabel:'The full project write-up' },

  { kind:'job', start:'2026-07', end:'2026-09',
    title:'Chartered accountancy intern', org:'SBH & Co. Chartered Accountants',
    lead:'Automating the document handling, and the GST and balance sheet work for clients with a combined ₹165 crore under review.',
    duties:['Wrote a Python script (pdfplumber and pandas) that turned 20+ multi-page bank statements into redacted Markdown at 94% accuracy, so they could be analysed with ChatGPT, Copilot and Gemini without exposing client details. Every output was checked by hand and the misses fed back into the script.',
            'Cut manual document processing by about 30%, 45 to 70 minutes each time, and brought client statement reconciliations forward by an average of 1.5 days.',
            'Built Excel models with automated tiered GST formulas across transaction logs of up to 300 rows, removing manual entry errors for 6 clients.',
            'Carried out balance sheet and cash flow analysis for high net worth individuals and corporate entities with a combined portfolio of about ₹165 crore, in Tally Prime Gold and Winman.'],
    kit:'Python (pdfplumber, pandas) · Excel · Tally Prime Gold · Winman',
    project:'redaction-pipeline' },

  { kind:'job', start:'2026-05', end:'2026-07',
    title:'Independent investment researcher and portfolio advisor', org:'Orbis Education Society',
    lead:'An independent review of a ₹7.26 crore mutual fund portfolio for a charitable education trust and its affiliated LLP.',
    duties:['Agreed risk tolerance and cash flow constraints directly with the school’s director, then found a 72.6% concentration in two funds, a 0.3% liquidity buffer and roughly ₹5 to 8 lakh a year lost to avoidable Regular plan costs.',
            'Screened 100+ Indian mutual funds in a self-built Excel model from AMC factsheets and primary research, comparing Sharpe ratio, alpha, beta and expense ratio.',
            'Wrote the restructuring proposal for the board of trustees, now being implemented in quarterly phases. It is modelled to raise effective diversification (inverse HHI) from about 3.3 to 8.4 funds, bring estimated volatility from about 13% to 11.1% a year, and cut the weighted expense ratio from about 1.7% to 0.94%.',
            'Worked through the Income-tax Act and the Maharashtra Public Trusts Act to keep every proposed scheme compliant, and structured a tax efficient, phased exit from a position carrying about ₹67.6 lakh of unrealised gains.'],
    kit:'Excel · portfolio analysis · Income-tax Act ss. 11(1A), 11(5), 10(23D) · Maharashtra Public Trusts Act 1950' },

  { kind:'job', start:'2023-11', end:'2024-04',
    title:'Chartered accountancy intern', org:'Alex-Churchill Accountants',
    lead:'Audit support, tax return checks and database integrity across a book of more than 1,500 clients.',
    duties:['Supported the audit of financial records for 500+ client entities across a portfolio of more than £100 million, helping find and resolve discrepancies in over 60% of client books (300+ accounts).',
            'Helped verify statutory tax returns for 75+ clients by cross-referencing records across systems against Excel models, contributing to 26+ successful HMRC refund claims worth about £15,000 to clients.',
            'Administered records for 1,500+ clients in Clientbase CRM, setting up automated data ingestion and a systematic backup routine so the records stayed intact.',
            'Produced categorised financial summaries for 150+ client accounts and kept statutory-compliant books, cashbooks and receipts, for 20+ small businesses.',
            'Built Excel models (PivotTables, VLOOKUP, MIN/MAX) to move data between Clientbase and QuickBooks, Sage and Xero, cutting manual processing time by about 15%.'],
    kit:'Excel (PivotTables, VLOOKUP) · Clientbase CRM · QuickBooks · Sage · Xero' },

  { kind:'job', start:'2023-09', end:'2024-05',
    title:'Tutor and assistant manager', org:'The Tutoring Company',
    lead:'Teaching, and within 40 days, running the centre day to day.',
    duties:['Tutored Mathematics, Further Mathematics, the three sciences and English to pupils aged 7 to 18, 6 to 12 hours a week, lifting results by 20 to 40% on average as measured by mock scores and school reports.',
            'Took over management of 30+ pupils alongside teaching and was promoted to assistant manager within 40 days.',
            'Kept up to 25 pupils in repeat weekly sessions and enrolled 9 new ones, supporting over £375 of weekly revenue.',
            'Helped train new tutors and ran the teaching rota, pupil records and parent communication.'],
    kit:'Teaching and communication · time management · client retention' },

  { kind:'job', start:'2023-06', end:'2023-11',
    title:'Associate intern, sales', org:'Champtronix',
    lead:'Commission-based face-to-face sales, and reading which approaches were actually working.',
    duties:['Sold charity and trust sign-ups, broadband and air filters door to door and in retail, in a team of 25 to 35, leading designated areas during campaigns.',
            'Sold to 800+ clients, consistently meeting or beating the monthly target by over 3%.',
            'Assessed which face-to-face approaches were converting and adjusted in real time, lifting team revenue by 7%.',
            'Worked with the sales team to refine outreach and pitches for individual and group settings.'],
    kit:'Sales · presentation · market analysis' },

  { kind:'job', start:'2022-10', end:'2023-02',
    title:'Sales advisor', org:'M&Co',
    lead:'Retail floor, till and stockroom, alongside A-Levels.',
    duties:['Served 100+ customers a shift across the till, cash-up, opening and closing, inventory and the shop floor.',
            'Reorganised the stockroom so recent and discounted seasonal lines were quickest to reach, saving 30 minutes to an hour of searching per shift.',
            'Helped keep store presentation up and regularly beat store-level sales targets.'],
    kit:'Customer service · stock management · teamwork' },

  { kind:'study', start:'2021-09', end:'2023-08',
    title:'A-Levels in Mathematics, Further Mathematics and Economics', org:'Reading School',
    lead:'The combination that decided the degree, and the first place the finance and the mathematics started pointing the same way.',
    focus:[['Subjects','Mathematics · Further Mathematics · Economics'],
           ['Also','House football team · Future Stories · UKMT Silver, 2021 and 2022']],
    notes:['Taken alongside the first paid work, in retail and then in sales.'] },

];

const TIMELINE = (() => {
  // Studies and roles only. Projects are work rather than milestones, and they
  // have their own listing at the foot of this page.
  return [...HISTORY].sort((a, b) => {
    const key = (e) => (e.end === 'Present' ? '9999-99' : e.end);
    return b.start.localeCompare(a.start) || key(b).localeCompare(key(a));
  });
})();

const QUEUE = [
  'Surveillance Pricing Tackling Project: how personalised pricing is set from what a seller knows about you, and what can be measured from the outside.',
  'The Architecture of Financial Engineering: a written breakdown of the ten foundational asset pricing approaches, from Black-Scholes through to quantum-accelerated Monte Carlo, with a demo page for each.',
  'OSINT research pipeline (in development): Python and SQL to collect and normalise public records such as company filings and property registries, a graph schema with fuzzy entity resolution to merge duplicate profiles, and network visualisation to trace direct and indirect paths several degrees out: corporate ties, interpersonal networks, familial associations, shared assets and multi-tier organisational hierarchies.',
  'A chess engine, built to find out how far a plain evaluation function and search get you before anything clever is needed.',
];

// ── safety helpers ──
// Every view is a string written with innerHTML. Anything that is not a
// literal in this file goes through esc(); anything placed in a URL must pass
// SLUG first. Nothing from the address bar or the markets endpoint reaches
// the page unchecked.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const SLUG = /^[a-z0-9-]{1,64}$/;
const itemHref = (slug) => (SLUG.test(slug) ? '#/i/' + slug : '#/');
// A same-site path only, so an item can never link somewhere unexpected.
const PAGE = /^\/[a-z0-9/-]{1,80}$/;
const linkFor = (i) => (i.href && PAGE.test(i.href) ? i.href : itemHref(i.slug));
// TRACKS is a plain object, so "#/constructor" would otherwise find a key.
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Above this width the timeline entries are placed against the spine; below
// it they stack in normal flow.
const WIDE = window.matchMedia('(min-width: 721px)');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const stamp = (d) => {
  if (d === 'Present') return 'Present';
  const [y, m] = String(d).split('-');
  return MONTHS[+m - 1] + ' ' + y;
};
const byDate = (a, b) => b.date.localeCompare(a.date);
const inTrack = (t) => ITEMS.filter((i) => i.t === t).sort(byDate);

// A kit is written most important first, separated by middots (or commas
// outside brackets). Listings show only the first KIT_SHOWN; the detail page
// shows the lot, so a long kit never widens a row.
const KIT_SHOWN = 3;
function splitKit(kit) {
  const parts = kit.includes('·') ? kit.split('·') : kit.split(/,(?![^(]*\))/);
  return parts.map((x) => x.trim()).filter(Boolean);
}
function shortKit(kit) {
  const all = splitKit(kit || '');
  const more = all.length - KIT_SHOWN;
  return esc(all.slice(0, KIT_SHOWN).join(' · ')) +
    (more > 0 ? ' <span class="row__more">+' + more + '</span>' : '');
}

function row(i) {
  const client = i.client
    ? '<span class="client"><b>' + esc(i.client) + '</b> · ' + esc(i.engagement) + '</span>' : '';
  return '<a class="row" href="' + linkFor(i) + '">' +
    '<span class="row__t">' + esc(i.title) + '</span>' +
    '<span class="row__b">' + esc(i.blurb) + (client ? '<br>' + client : '') + '</span>' +
    '<span class="row__m">' +
      (i.client ? '<span class="row__client">Client work</span>' : '') +
      '<span class="row__area">' + esc(i.area) + '</span>' +
      '<span class="row__yr">' + esc(stamp(i.date)) + '</span>' +
      '<span class="row__kit">' + shortKit(i.kit) + '</span>' +
    '</span></a>';
}

// The home page shows two of each and holds the rest back.
function block(track, n) {
  const all = inTrack(track), T = TRACKS[track];
  const shown = all.slice(0, n), rest = all.slice(n);
  return `<section class="part"><div class="part__grid">
    <div class="rail">
      <p class="lbl">${esc(T.title)}</p>
      <h2>${esc(T.note)}</h2>
      <a class="all" href="#/${esc(track)}">All ${all.length} &rarr;</a>
    </div>
    <div>
      <div class="rows">${shown.map(row).join('')}</div>
      ${rest.length ? `<div class="rows more" data-more="${esc(track)}" hidden>${rest.map(row).join('')}</div>
        <button class="expander" type="button" data-expand="${esc(track)}" aria-expanded="false">
          <span class="expander__t">Show ${rest.length} more</span>
          <span class="expander__c" aria-hidden="true">&darr;</span>
        </button>` : ''}
    </div>
  </div></section>`;
}

function home() {
  return `<section class="open">
    <p class="lbl lbl--gap">Emad Rafiq &middot; Mathematics with Finance and Accounting</p>
    <h1>To be cool, you have got to do cool stuff.</h1>
    <p class="standfirst">Every project I touch eventually turns into a math problem.
      Statistics, mechanics, and finance always seem to show up right as things are settling
      down. I built this site to keep track of what I have made, from personal projects to
      the stuff people paid me to do. The common thread across all of them is simple: dealing
      with heavy logic, managing numbers, or <em>the awkward business of turning written rules
      into code that actually works</em>.</p>
  </section>
  ${block('studio', 2)}
  ${block('projects', 2)}
  ${block('writing', 2)}
  ${block('playground', 2)}
  <section class="part" id="ticker-block"><div class="part__grid">
    <div class="rail"><p class="lbl">Markets</p><h2>Most traded today</h2>
      <p class="note">Streams live while markets trade. Select a stock to see what moved it.</p></div>
    <div id="ticker" aria-live="polite"><p class="ticker__wait">Loading…</p></div>
  </div></section>

  <section class="part"><div class="part__grid">
    <div class="rail"><p class="lbl">Next</p><h2>In progress</h2>
      <p class="note">Listed because they're started, not because they're finished.</p></div>
    <div><ul class="queue">${QUEUE.map((q, n) =>
      '<li><span>' + String(n + 1).padStart(2, '0') + '</span><span class="queue__t">' + esc(q) + '</span></li>').join('')}</ul></div>
  </div></section>`;
}

function index(track, wanted) {
  const T = TRACKS[track], all = inTrack(track);
  const areas = [...new Set(all.map((i) => i.area))];
  // A filter carried over from another section does not apply here.
  const area = areas.includes(wanted) ? wanted : '';
  const list = area ? all.filter((i) => i.area === area) : all;
  const services = track === 'studio' ? `
    <section class="part"><div class="part__grid">
      <div class="rail"><p class="lbl">Engage</p><h2>How I work</h2></div>
      <div><dl class="svc">
        <div><dt>Internal tooling and custom AI agents</dt><dd>Scripts and assistants built for how an accountancy practice actually works, covering bookkeeping, GST and ITR preparation and audit support, and built to keep client data inside the firm.</dd></div>
        <div><dt>Investment analysis for funds and ETFs</dt><dd>Screening and comparison on risk and return metrics, cross-checked against the legal constraints that apply to the holder. Delivered as models you can keep and re-run, with the reasoning written down.</dd></div>
        <div><dt>Portfolio review and restructuring</dt><dd>Concentration, liquidity and fee analysis, with a phased exit schedule where a position needs unwinding tax-efficiently.</dd></div>
      </dl></div>
    </div></section>` : '';
  const chips = areas.length > 1
    ? '<div class="filters" role="group" aria-label="Filter by area">' +
      '<button class="chip" type="button" data-f="" aria-pressed="' + !area + '">All ' + all.length + '</button>' +
      areas.map((a) => '<button class="chip" type="button" data-f="' + esc(a) + '" aria-pressed="' + (area === a) + '">' + esc(a) + '</button>').join('') +
      '</div>'
    : '';
  return '<section class="phead"><h1>' + esc(T.title) + '</h1><p>' + esc(T.blurb) + '</p></section>' +
    '<section class="listing">' + chips +
      '<div class="rows">' + list.map(row).join('') + '</div>' +
      '<p class="count count--gap">' + list.length + ' of ' + all.length + ' shown</p>' +
    '</section>' + services;
}

function detail(i) {
  const T = TRACKS[i.t];
  const m = (k, v) => (v ? '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>' : '');
  return '<article class="detail">' +
    '<a class="back" href="#/' + esc(i.t) + '">&larr; ' + esc(T.title) + '</a>' +
    '<h1>' + esc(i.title) + '</h1>' +
    '<dl class="meta">' +
      m('Area', i.area) + m('Built with', i.kit) + m('Date', stamp(i.date)) +
      m('Built during', i.during) + m('Client', i.client) + m('Engagement', i.engagement) +
    '</dl>' +
    '<div class="detail__body">' +
      '<p class="detail__lede">' + esc(i.blurb) + '</p>' +
      i.body.map((p) => '<p>' + esc(p) + '</p>').join('') +
    '</div></article>';
}

function span(w) {
  const a = stamp(w.start), b = stamp(w.end);
  return esc(a === b ? a : a + ' – ' + b);
}

// Months since year zero, so every date reduces to one comparable number.
const toM = (d) => {
  if (d === 'Present') { const n = new Date(); return n.getFullYear() * 12 + n.getMonth(); }
  const [y, m] = String(d).split('-').map(Number);
  return y * 12 + (m - 1);
};

// Lanes for anything that ran at the same time as something else. Assigned
// oldest first: an entry takes the first lane whose previous run has finished.
function lanes(entries) {
  const starts = entries.map((e) => toM(e.start));
  const ends = entries.map((e) => toM(e.end));
  const free = [];
  const out = new Array(entries.length).fill(0);
  entries.map((e, i) => i).sort((a, b) => starts[a] - starts[b]).forEach((i) => {
    let l = free.findIndex((f) => f <= starts[i]);
    if (l === -1) { l = free.length; free.push(0); }
    free[l] = ends[i];
    out[i] = l;
  });
  return { lane: out, count: free.length, starts, ends };
}

let ORIGIN = 0;

// One spine. Each entry gets a segment on it at its true dates, with a lane
// per concurrent run so nothing is hidden behind anything else. The lane is
// carried as data and applied after render, so no style attribute is written.
function spine(entries) {
  const { lane, count, starts, ends } = lanes(entries);
  ORIGIN = Math.floor(Math.min(...starts) / 12) * 12;
  const to = Math.ceil((Math.max(...ends) + 1) / 12) * 12;

  const bars = entries.map((e, i) =>
    '<span class="tlg__bar' + (e.end === 'Present' ? ' is-live' : '') + '" data-i="' + i +
    '" data-lane="' + lane[i] + '" data-from="' + (starts[i] - ORIGIN) + '" data-to="' + (ends[i] - ORIGIN) +
    '" title="' + esc(e.title) + ', ' + span(e) + '"></span>').join('');

  let years = '';
  for (let m = ORIGIN; m <= to; m += 12) {
    years += '<span class="tlg__yr" data-at="' + (m - ORIGIN) + '">' + (m / 12) + '</span>';
  }
  return '<div class="tlg__spine" data-span="' + (to - ORIGIN) + '" data-lanes="' + count + '">' + years + bars + '</div>';
}

function facts(rows) {
  return '<dl class="tl__facts">' + rows
    .filter((r) => r[1])
    .map((r) => '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>')
    .join('') + '</dl>';
}

function skills(label, list) {
  if (!list) return '';
  return '<div class="tl__skills"><p class="tl__skills-l">' + esc(label) + '</p><ul>' +
    splitKit(list).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
}

const moreLink = (slug, text) =>
  '<p class="tl__more"><a class="tl__link" href="' + itemHref(slug) + '">' + esc(text) + ' &rarr;</a></p>';

// Each kind of entry gets its own shape: a study lists what it covered, a
// role lists what I did.
function panel(w) {
  if (w.kind === 'study') {
    return facts(w.focus) +
      (w.notes ? '<ul class="tl__notes">' + w.notes.map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul>' : '') +
      (w.modules ? '<p class="tl__modules">' + esc(w.modules) + '</p>' : '');
  }
  return '<ul>' + w.duties.map((d) => '<li>' + esc(d) + '</li>').join('') + '</ul>' +
    skills('Skills and tools', w.kit) +
    (w.project ? moreLink(w.project, w.projectLabel || 'The script behind this role') : '');
}

function about() {
  return `<section class="phead">
    <p class="lbl">About</p>
    <h1>ER5 Labs is the name I put on my work.</h1>
    <p>Commissioned work for clients and the things I build for myself, under one
      name because the same habits produce both.</p>
  </section>
  <section class="part"><div class="part__grid">
    <div class="rail"><p class="lbl">Study</p><h2>Current degree</h2>
      <p class="note">Every module, by year.</p></div>
    <div class="deg">
      <p class="deg__top"><span class="tl__kind">Study</span>
        <span class="tl__when">${esc(stamp(DEGREE.start) + ' to ' + stamp(DEGREE.end))}</span></p>
      <p class="tl__role">${esc(DEGREE.title)}</p>
      <p class="tl__org deg__org">${esc(DEGREE.org)}</p>
      ${facts(DEGREE.facts)}
    </div>
  </div></section>

  <section class="part"><div class="part__grid">
    <div class="rail"><p class="lbl">History</p><h2>Key work experiences</h2>
      <p class="note">Studies and roles, placed on a shared scale. Select any entry for the detail.</p>
      <p class="tlx__key">
        <span><i class="k"></i>ended</span>
        ${TIMELINE.some((w) => w.end === 'Present') ? '<span><i class="k k--live"></i>ongoing</span>' : ''}
        <span>bar length is duration</span>
      </p>
    </div>
    <div>
      <div class="tlg">
        ${spine(TIMELINE)}
        <ul class="tl">${TIMELINE.map((w, n) => `
          <li class="tl__item" data-i="${n}" data-side="${n % 2 ? 'l' : 'r'}"
              data-from="${toM(w.start) - ORIGIN}" data-to="${toM(w.end) - ORIGIN}"
              data-current="${!!w.current}" data-open="false">
            <button class="tl__head" type="button" aria-expanded="false" aria-controls="tl-panel-${n}">
              <span class="tl__sign" aria-hidden="true">+</span>
              <span class="tl__kind">${w.kind === 'study' ? 'Study' : 'Role'}</span>
              <span class="tl__when">${span(w)}</span>
              <span class="tl__role">${esc(w.title)}</span>
              <span class="tl__org">${esc(w.org)}</span>
            </button>
            <p class="tl__lead">${esc(w.lead)}</p>
            <div class="tl__panel" id="tl-panel-${n}" role="region">${panel(w)}</div>
          </li>`).join('')}
        </ul>
      </div>
    </div>
  </div></section>

  <section class="part"><div class="part__grid">
    <div class="rail"><p class="lbl">Record</p><h2>Skills and training</h2>
      <p class="note">What I work in, and the courses behind it.</p></div>
    <div>
      ${skills('Programming and data', 'Python · R · SQL · Bash · Excel · SPSS · Stata · Tableau · Power BI')}
      ${skills('Accounting systems and tools', 'QuickBooks · Sage · Xero · Tally Prime Gold · Winman · Clientbase CRM · VS Code · RStudio · GitHub')}
      ${skills('Courses and certificates', 'IBM Data Science with Python and SQL · IBM RAG and Agentic AI · IBM Analysing Data with Excel · Illinois Data Mining · Johns Hopkins Business Analytics with Excel · Duke Data Science Math Skills · MITx Mathematical Methods for Quantitative Finance · Yale Financial Markets · Google Cloud Generative AI · PCEP Python (preparing)')}
      ${skills('Job simulations', 'JPMorgan Quantitative Research · Citi Markets Sales and Trading · Fidelity International Investment Management · PwC Problem Solving with Excel · Deloitte Data Analytics')}
      ${skills('Languages', 'English (native) · Hindi (intermediate) · Urdu (intermediate)')}
    </div>
  </div></section>

  <section class="part"><div class="part__grid">
    <div class="rail"><p class="lbl">Work</p><h2>Most recent</h2>
      <p class="note">The last three things built.</p>
      <a class="all" href="#/projects">All projects &rarr;</a></div>
    <div class="rows">${ITEMS.filter((i) => i.t !== 'writing').sort(byDate).slice(0, 3).map(row).join('')}</div>
  </div></section>`;
}

function notfound() {
  return '<section class="phead"><p class="lbl">404</p>' +
    '<h1>That page isn\'t here.</h1>' +
    '<p><a class="home-link" href="#/">Back to the start &rarr;</a></p></section>';
}

// ── markets ──
// Sample figures, shown only if the live feed has never answered.
const SAMPLE = { sample:true, items:[
  { label:'NVDA', price:214.72, changePct:-0.98 },
  { label:'SPY',  price:765.72, changePct:0.41 },
  { label:'AMD',  price:473.25, changePct:0.81 },
  { label:'META', price:549.90, changePct:0.75 },
  { label:'MU',   price:966.78, changePct:-0.77 },
]};

// The endpoint is ours, but its data comes from third parties, so each quote
// is checked before it is used: a short string label, a finite price, and a
// finite change or none.
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const MARKET_SYM = /^[A-Z0-9^=.-]{1,12}$/;
function cleanQuotes(j) {
  if (!j || !Array.isArray(j.items)) return [];
  return j.items
    .filter((q) => q && typeof q.label === 'string' && q.label.length <= 24 &&
      isNum(q.price) && (q.changePct == null || isNum(q.changePct)))
    .map((q) => ({
      symbol: typeof q.symbol === 'string' && MARKET_SYM.test(q.symbol) ? q.symbol : null,
      label: q.label, price: q.price, changePct: q.changePct ?? null, unit: q.unit === 'yield' ? 'yield' : 'price',
    }))
    .slice(0, 7);
}

// A stock page exists for every live quote; the symbol is checked here and
// again, against today's list, by the page itself.
const stockHref = (symbol) => '/playground/markets/' + encodeURIComponent(symbol);

// The panel's markup. Live quotes are links carrying data-sym, data-px and
// data-mv, which the price stream updates in place between these repaints.
function paintTicker(el, data) {
  const num = (q) => q.price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
    (q.unit === 'yield' ? '%' : '');
  const px = (q) => '<span class="px" data-px data-value="' + q.price + '">' + num(q) + '</span>';
  const move = (q) => {
    if (q.changePct == null) return '<span class="mv" data-mv></span>';
    const dir = q.changePct > 0 ? 'up' : q.changePct < 0 ? 'down' : '';
    const arrow = q.changePct > 0 ? '▲' : q.changePct < 0 ? '▼' : '';
    return '<span class="mv ' + dir + '" data-mv>' + arrow + ' ' + Math.abs(q.changePct).toFixed(2) + '%</span>';
  };
  const link = !data.sample;
  const open = (q, cls) => (link && q.symbol
    ? '<a class="' + cls + '" href="' + stockHref(q.symbol) + '" data-sym="' + esc(q.symbol) + '" data-unit="' + q.unit + '">'
    : '<div class="' + cls + '">');
  const shut = (q) => (link && q.symbol ? '</a>' : '</div>');

  const [lead, ...rest] = data.items;
  const foot = data.sample
    ? 'Sample figures: the live feed is not answering right now. It will keep trying.'
    : '<span class="ticker__live"><span class="ticker__dot" aria-hidden="true"></span>Live</span> · last trade <span data-time>' +
      new Date(data.updated).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) +
      '</span> · prices stream while markets trade';

  el.innerHTML =
    open(lead, 'lede-quote') + '<span class="sym">' + esc(lead.label) + '</span>' + px(lead) + move(lead) + shut(lead) +
    '<div class="quotes">' + rest.map((q) =>
      open(q, 'q') + '<span class="sym">' + esc(q.label) + '</span>' +
      '<span class="q__v">' + px(q) + move(q) + '</span>' + shut(q)).join('') + '</div>' +
    '<p class="ticker__foot">' + foot + '</p>' +
    (link ? '<a class="ticker__more" href="/playground/markets">Why are they moving? &rarr;</a>' : '');
}

// Polling plan. The endpoint is cached at the edge for 60 seconds, so asking
// more often than that only re-reads the same copy: 60 s is the fastest
// interval that can ever show new prices. On top of that the panel only asks
// while the tab is visible and the panel is on or near the screen, backs off
// on failure (1, 2, 4, 8 minutes, capped at 10), and adds a few seconds of
// jitter so visitors who arrived together do not all ask at once.
const TICK_MS = 60_000;
const MAX_WAIT = 10 * 60_000;
const tick = { el: null, timer: 0, wait: TICK_MS, at: 0, busy: false, near: false, io: null, live: false, stream: null };
// Between polls, prices come from the live stream. It runs only while the
// panel is on or near the screen and the tab is visible.
const stopStream = () => {
  if (tick.stream) tick.stream.stop();
  tick.stream = null;
};
const startStream = () => {
  if (!tick.el || !tick.live) return;
  if (!tick.stream) tick.stream = liveQuotes(tick.el);
  tick.stream.refreshed();
};
const due = () => Date.now() - tick.at >= tick.wait - 1000;
// The observer below starts a poll the moment the panel scrolls into range,
// but the decision itself is made from the panel's position, measured once
// per poll, so it holds even where observers are throttled or unavailable.
const isNear = (el) => {
  const r = el.getBoundingClientRect();
  return r.bottom > -400 && r.top < window.innerHeight + 400;
};

async function pollTicker() {
  clearTimeout(tick.timer);
  const el = tick.el;
  if (!el || !el.isConnected || tick.busy) return;
  // Hidden tab or panel far off screen: stop here. The listeners below call
  // straight back in when that changes.
  if (document.hidden || !(tick.near || isNear(el))) {
    if (!document.hidden) stopStream();
    return;
  }

  tick.busy = true;
  let data = null;
  try {
    const res = await fetch('/api/markets.json', {
      credentials: 'omit',
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });
    if (res.ok) {
      const j = await res.json();
      const items = cleanQuotes(j);
      if (items.length) data = { items, updated: isNum(j.updated) ? j.updated : Date.now() };
    }
  } catch {
    // Slow, offline or malformed: handled below.
  }
  tick.busy = false;
  tick.at = Date.now();
  if (el !== tick.el || !el.isConnected) return;

  if (data) {
    tick.wait = TICK_MS;
    tick.live = true;
    paintTicker(el, data);
    startStream();
  } else {
    tick.wait = Math.min(tick.wait * 2, MAX_WAIT);
    if (!tick.live) paintTicker(el, SAMPLE);
  }
  tick.timer = setTimeout(pollTicker, tick.wait + Math.random() * 4000);
}

function startTicker(el) {
  stopTicker();
  Object.assign(tick, { el, wait: TICK_MS, at: 0, live: false });
  if ('IntersectionObserver' in window) {
    tick.io = new IntersectionObserver(([e]) => {
      tick.near = e.isIntersecting;
      if (!tick.near) stopStream();
      else if (due()) pollTicker();
      else startStream();
    }, { rootMargin: '400px 0px' });
    tick.io.observe(el);
  } else {
    tick.near = true;
    pollTicker();
  }
}

function stopTicker() {
  clearTimeout(tick.timer);
  stopStream();
  if (tick.io) tick.io.disconnect();
  Object.assign(tick, { el: null, io: null, near: false, busy: false });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && tick.el && due()) pollTicker();
});

// ── timeline layout ──
// The entry column decides how tall the section is, so the time scale can only
// be worked out after it has been laid out.
const GAP = 38;          // clear space between two blocks on the same side
const MIN_PX = 20;       // floor on the month scale, so a year is never cramped
const MAX_PX = 46;       // ceiling, so one tight pair cannot stretch the page
const CUT_AFTER = 12;    // a quiet run this long or longer becomes a break
const CUT_PX = 56;       // drawn height of a break

// Blocks are placed at their real dates wherever there is room. Where two on
// the same side would collide the later one slides down and keeps a connector
// back to its bar, so the bar still marks the true date.
function layoutTimeline() {
  const wrap = document.querySelector('.tlg');
  if (!wrap) return;
  // Below the breakpoint the entries stack in normal flow, so every position
  // this function set has to be handed back.
  if (!WIDE.matches) {
    wrap.style.height = '';
    wrap.querySelectorAll('.tl__item').forEach((el) => {
      el.style.top = '';
      delete el.dataset.slid;
    });
    return;
  }

  const spineEl = wrap.querySelector('.tlg__spine');
  const items = [...wrap.querySelectorAll('.tl__item')];
  const total = +spineEl.dataset.span || 1;
  const box = items.map((el) => ({
    el, from: +el.dataset.from, to: +el.dataset.to, side: el.dataset.side, h: el.offsetHeight,
  }));

  // Pick the scale from the tightest pair on each side, capped so two entries
  // ending a month apart slide instead of stretching the page.
  let PX = MIN_PX;
  for (const side of ['l', 'r']) {
    const col = box.filter((b) => b.side === side).sort((a, b) => b.to - a.to);
    for (let i = 0; i < col.length - 1; i++) {
      const dt = col[i].to - col[i + 1].to;
      if (dt > 0) PX = Math.max(PX, (col[i].h + GAP) / dt);
    }
  }
  PX = Math.min(PX, MAX_PX);

  // A stretch with nothing running is drawn as a short break, snapped to whole
  // years so it sits between two year labels rather than swallowing one.
  const busy = new Array(total + 1).fill(false);
  box.forEach((b) => {
    for (let m = Math.max(0, b.from - 2); m <= Math.min(total, b.to + 2); m++) busy[m] = true;
  });
  const cuts = [];
  for (let m = 0; m <= total;) {
    if (busy[m]) { m++; continue; }
    let e = m;
    while (e <= total && !busy[e]) e++;
    const a = Math.ceil(m / 12) * 12, b = Math.floor(e / 12) * 12;
    if (b - a >= CUT_AFTER) cuts.push([a, b]);
    m = e;
  }
  const rise = (x) => {
    let px = x * PX;
    for (const [a, b] of cuts) {
      if (x <= a) continue;
      px += (Math.min(x, b) - a) * (CUT_PX / (b - a) - PX);
    }
    return px;
  };
  const height = rise(total);
  const top = (months) => height - rise(months);

  spineEl.querySelectorAll('.tlg__cut').forEach((el) => el.remove());
  cuts.forEach(([a, b]) => {
    const mark = document.createElement('span');
    mark.className = 'tlg__cut';
    mark.style.top = top((a + b) / 2) + 'px';
    spineEl.append(mark);
  });

  let bottom = 0;
  for (const side of ['l', 'r']) {
    const col = box.filter((b) => b.side === side).sort((a, b) => b.to - a.to);
    let floor = 0;
    for (const b of col) {
      const wanted = top(b.to);
      const y = Math.max(wanted, floor);
      b.el.style.top = y + 'px';
      b.el.dataset.slid = y - wanted > 1 ? 'true' : 'false';
      floor = y + b.h + GAP;
      bottom = Math.max(bottom, y + b.h);
    }
  }

  spineEl.querySelectorAll('.tlg__yr').forEach((el) => {
    const at = +el.dataset.at;
    el.hidden = cuts.some(([a, b]) => at > a && at < b);
    el.style.top = top(at) + 'px';
  });
  spineEl.querySelectorAll('.tlg__bar').forEach((bar) => {
    bar.style.top = top(+bar.dataset.to) + 'px';
    bar.style.height = Math.max(4, top(+bar.dataset.from) - top(+bar.dataset.to)) + 'px';
  });

  wrap.style.height = Math.max(bottom, height) + 'px';
}

// Hovering either half lights up the other, which ties a bar to its entry.
function linkTimeline(view) {
  const bars = [...view.querySelectorAll('.tlg__bar')];
  const items = [...view.querySelectorAll('.tl__item')];
  if (!bars.length) return;

  const mark = (i, on) => {
    bars.forEach((b) => b.classList.toggle('is-hot', on && b.dataset.i === i));
    items.forEach((it) => it.classList.toggle('is-hot', on && it.dataset.i === i));
  };
  bars.forEach((b) => {
    b.style.setProperty('--lane', String(+b.dataset.lane || 0));
    b.addEventListener('mouseenter', () => mark(b.dataset.i, true));
    b.addEventListener('mouseleave', () => mark(b.dataset.i, false));
  });
  items.forEach((it) => {
    it.addEventListener('mouseenter', () => mark(it.dataset.i, true));
    it.addEventListener('mouseleave', () => mark(it.dataset.i, false));
    it.addEventListener('focusin', () => mark(it.dataset.i, true));
    it.addEventListener('focusout', () => mark(it.dataset.i, false));
  });
}

// ── router ──
const SITE = 'ER5 Labs';
let filter = { track: '', area: '' };

function route() {
  const [, seg = '', arg = ''] = (location.hash.replace(/^#/, '') || '/').split('/');
  if (!seg) return { html: home(), active: '', title: '' };
  if (own(TRACKS, seg)) {
    if (filter.track !== seg) filter = { track: seg, area: '' };
    return { html: index(seg, filter.area), active: seg, title: TRACKS[seg].title };
  }
  if (seg === 'about') return { html: about(), active: 'about', title: 'About' };
  const item = seg === 'i' && SLUG.test(arg) ? ITEMS.find((x) => x.slug === arg) : null;
  if (item && item.href && PAGE.test(item.href)) {
    location.replace(item.href);
    return { html: '', active: item.t, title: item.title };
  }
  if (item) return { html: detail(item), active: item.t, title: item.title };
  return { html: notfound(), active: '', title: 'Not found' };
}

function render() {
  const view = document.getElementById('view');
  const { html, active, title } = route();

  view.innerHTML = html;
  document.title = title ? title + ' · ' + SITE : SITE;
  document.querySelectorAll('#nav a').forEach((a) => {
    if (a.getAttribute('href').replace(/^\/?#\//, '') === active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  view.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
    filter.area = c.dataset.f || '';
    render();
  }));

  view.querySelectorAll('.expander').forEach((b) => b.addEventListener('click', () => {
    const more = [...view.querySelectorAll('[data-more]')].find((p) => p.dataset.more === b.dataset.expand);
    if (!more) return;
    const open = more.hidden;
    more.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
    b.querySelector('.expander__t').textContent = open ? 'Show fewer' : 'Show ' + more.children.length + ' more';
  }));

  const tickerEl = view.querySelector('#ticker');
  if (tickerEl) startTicker(tickerEl);
  else stopTicker();

  if (view.querySelector('.tlg')) {
    linkTimeline(view);
    requestAnimationFrame(layoutTimeline);
    if (document.fonts) document.fonts.ready.then(layoutTimeline);
  }

  view.querySelectorAll('.tl__head').forEach((b) => b.addEventListener('click', () => {
    const item = b.closest('.tl__item');
    const open = item.dataset.open !== 'true';
    item.dataset.open = String(open);
    b.setAttribute('aria-expanded', String(open));
    b.querySelector('.tl__sign').textContent = open ? '−' : '+';
    requestAnimationFrame(layoutTimeline);
  }));
}

// Crossing the breakpoint only changes how the timeline is placed, so it is
// re-laid out rather than rebuilt, and any open entries stay open.
WIDE.addEventListener('change', layoutTimeline);

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(layoutTimeline, 120);
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo({ top: 0 });
  // Move focus to the new content so keyboard and screen reader users land on it.
  document.getElementById('view').focus({ preventScroll: true });
});

render();
