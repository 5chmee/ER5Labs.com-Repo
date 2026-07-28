export default {
  out: '01-Code-Walkthrough/Part-3-The-Clever-Bits.pdf',
  title: 'Part 3: The Clever Bits',
  subtitle: 'Fetching data, background threads, and the browser features your site relies on',
  runningHead: 'ER5Labs | Code Walkthrough, Part 3',
  eyebrow: 'E R 5 L A B S   |   C O D E   W A L K T H R O U G H',
  intro: [
    'Parts 1 and 2 covered the languages and the tooling. This part covers the browser capabilities your site uses beyond ordinary pages: fetching live data, running work on background threads, watching what is on screen, and animating without stutter.',
    'These are the features that turn a static page into something that behaves like an application, and they are where most of the interesting engineering decisions in this project live.',
  ],
  oneLiner:
    'Modern browsers ship a large set of built-in capabilities. Knowing which exist, and which are cheap or expensive, is most of what separates a smooth site from a slow one.',

  body(d) {
    d.pageBreak();
    d.h1('1.  Fetching data from other computers');
    d.p('Your market ticker shows live prices. Those come from another company server, requested while the page is open.');
    d.code([
      'const res  = await fetch("/api/markets.json");',
      'const data = await res.json();',
      'render(data.items);',
    ]);
    d.kv([
      ['fetch', 'Ask another computer for something. Returns a promise, meaning an answer that has not arrived yet.'],
      ['await', 'Wait for it, without freezing the page.'],
      ['.json()', 'Interpret the reply as JSON and turn it into JavaScript objects.'],
    ]);

    d.h2('JSON');
    d.p('JSON is how programs exchange structured data as text. It looks like JavaScript objects because it came from them.');
    d.code([
      '{ "items": [ { "label": "Gold", "price": 4048.3 } ] }',
    ]);

    d.h1('2.  CORS, and why the ticker needs a server');
    d.p('A browser will not let a page read data from another website unless that site explicitly permits it. This is a security rule called CORS, and it exists so a malicious page cannot quietly read your webmail using your logged-in session.');
    d.p('Neither the market data provider nor the Bitcoin data provider grants that permission, so calling them from the page fails. This was confirmed rather than assumed: both requests were tried from the browser and both were blocked.');
    d.callout('The workaround, and why it is better anyway',
      'The restriction applies to browsers, not to servers. A small function on your own site fetches the data server-side and hands it to the page. That solves CORS, and it also means one request can be cached and shared by every visitor rather than each browser asking separately.');

    d.h1('3.  Serverless functions');
    d.p('Almost every page on your site is a finished file. Two things cannot be, because they must be current: market prices and Bitcoin data.');
    d.code([
      '// src/pages/api/markets.json.ts',
      'export const prerender = false;   // build on demand, not in advance',
      '',
      'export const GET = async () => {',
      '  const data = await fetchEverything();',
      '  return new Response(JSON.stringify(data), {',
      '    headers: {',
      '      "Content-Type": "application/json",',
      '      "Cache-Control": "public, s-maxage=60",',
      '    },',
      '  });',
      '};',
    ]);
    d.kv([
      ['prerender = false', 'Do not bake this into a file at build time. Run it when asked.'],
      ['GET', 'Handles an ordinary request for this address.'],
      ['Response', 'What to send back: the content, and headers describing it.'],
      ['s-maxage=60', 'Shared caches may reuse this for 60 seconds, so one upstream call serves everyone for a minute.'],
    ]);
    d.p('"Serverless" does not mean there is no server. It means you never manage one: the code sits idle until a request arrives, runs, and stops.');

    d.pageBreak();
    d.h1('4.  Remembering things in the browser');
    d.kv([
      ['localStorage', 'Small text store that survives closing the browser. Used for the theme choice and which pages have been visited.'],
      ['sessionStorage', 'The same, but cleared when the tab closes. Used to cache weather for a session.'],
    ]);
    d.code([
      'localStorage.setItem("er5-theme", "dark");',
      'const saved = localStorage.getItem("er5-theme");',
    ]);
    d.p('It stores text only, so structured data is converted with JSON.stringify going in and JSON.parse coming out. Your board reads a stored record of visits to show "Last viewed 20 mins ago" against each destination.');
    d.small('Every read is wrapped in a try/catch, because a visitor with storage disabled would otherwise crash the script. A feature that cannot work should degrade, not break the page.');

    d.h1('5.  Knowing what is on screen');
    d.p('An IntersectionObserver tells you when an element enters or leaves the visible area, efficiently.');
    d.code([
      'const io = new IntersectionObserver(([entry]) => {',
      '  if (entry.isIntersecting) runFlaps();',
      '}, { threshold: 0.25 });',
      '',
      'io.observe(board);',
    ]);
    d.p('Your site uses it twice. The departure board replays its flip when it scrolls back into view. The ticker and the sketch animations pause when scrolled off screen, which browsers do not do for you.');
    d.callout('Why not just listen to scrolling',
      'A scroll listener runs on every pixel of movement, hundreds of times a second, and each run must measure the page. An observer is handled by the browser internally and reports only when the answer changes.');

    d.h1('6.  Animating without stutter');
    d.p('The Web Animations API starts an animation directly from JavaScript.');
    d.code([
      'el.animate(',
      '  [{ transform: "rotateX(-90deg)" }, { transform: "rotateX(0deg)" }],',
      '  { duration: 150, easing: "linear" }',
      ');',
    ]);
    d.p('The first argument lists the states to move between. The second says how long and with what pacing.');
    d.p('The earlier version restarted a CSS animation for each character, which required forcing the browser to recalculate layout every time. For forty tiles several times a second, that is constant interruption, and the flips visibly stuttered. Switching to this removed the problem entirely.');
    d.kv([
      ['Cheap to animate', 'transform and opacity. The graphics hardware handles them without touching layout.'],
      ['Expensive', 'width, height, top, left, margin. Each frame forces the page to be measured again.'],
    ]);

    d.pageBreak();
    d.h1('7.  Web Workers: doing two things at once');
    d.p('JavaScript in a page normally runs on one thread, which also handles drawing, scrolling and clicks. A long calculation therefore freezes everything.');
    d.p('The mining demo does millions of calculations per second, so it cannot run there. Web Workers are genuinely separate threads.');
    d.code([
      '// main page: start a worker and listen for results',
      'const w = new Worker(new URL("./miner.worker.ts", import.meta.url),',
      '                     { type: "module" });',
      '',
      'w.onmessage = (e) => { update(e.data); };',
      'w.postMessage({ type: "start", zeros: 5 });',
      '',
      '// inside the worker: receive instructions, send results back',
      'self.onmessage = (e) => { if (e.data.type === "start") run(); };',
      'self.postMessage({ type: "progress", hashes: 4000 });',
    ]);
    d.p('The two sides cannot share variables. They only exchange messages, which is what makes it safe. The worker cannot touch the page at all; it computes and reports.');
    d.p('Your demo runs several at once, one per core you allow. Each starts at a different number and steps forward by the number of workers, so no two ever duplicate work.');

    d.h2('Deliberately resting');
    d.code([
      'const dt   = performance.now() - t0;        // how long the batch took',
      'const idle = (dt * (1 - effort)) / effort;  // how long to wait',
      'setTimeout(run, idle);',
    ]);
    d.p('Working for one interval and resting for two gives roughly a third of a core. This is what lets a visitor choose how much of their machine to lend, and it is the difference between a demo and something antivirus software would flag.');

    d.h1('8.  Cryptography in the browser');
    d.p('Browsers include cryptographic functions, including the SHA-256 hash the mining demo needs.');
    d.code(['const digest = await crypto.subtle.digest("SHA-256", bytes);']);
    d.p('It is correct but returns a promise, so waiting for each answer costs more than computing it. At millions of hashes that overhead dominates, which is why the algorithm was written out longhand instead and runs about eight times faster.');
    d.callout('The general point',
      'The built-in option is almost always right. This is a rare case where measuring showed otherwise, and the decision was made on a measurement rather than an assumption.');

    d.h1('9.  WebSockets: a connection that stays open');
    d.p('Normal requests are one question and one answer. A WebSocket stays open, and either side can send at any time.');
    d.code([
      'const ws = new WebSocket("wss://mempool.space/api/v1/ws");',
      'ws.onopen    = () => ws.send(JSON.stringify({ action: "want",',
      '                                              data: ["blocks"] }));',
      'ws.onmessage = (ev) => handle(JSON.parse(ev.data));',
    ]);
    d.p('The mining demo uses this so a newly mined Bitcoin block arrives within seconds, rather than asking repeatedly and mostly being told nothing changed.');

    d.pageBreak();
    d.h1('10.  SVG: graphics described in text');
    d.p('SVG describes shapes mathematically rather than as pixels, so it stays sharp at any size and can be styled and animated like anything else on the page.');
    d.code([
      '<svg viewBox="0 0 100 50">',
      '  <line x1="0" y1="50" x2="100" y2="50" stroke="grey" />',
      '  <path d="M0 50 L20 30 L40 35" fill="none" stroke="red" />',
      '</svg>',
    ]);
    d.kv([
      ['viewBox', 'The internal coordinate system. Drawing happens in these units, then scales to fit.'],
      ['path / d', 'A shape. M moves without drawing, L draws a line to a point.'],
      ['stroke / fill', 'Outline colour and interior colour.'],
    ]);
    d.p('Your probability curve is generated this way: the maths produces a list of points, which become a path string. Because it is ordinary markup, it uses the same colour variables as the rest of the site and follows the theme automatically.');

    d.h1('11.  What to learn next');
    d.p('If you want to go further, roughly in order of usefulness:');
    d.bullets([
      'Get comfortable with the browser developer tools: inspecting elements, reading the console, watching network requests. This is how you diagnose anything.',
      'Learn a little more CSS layout, especially grid. Most visual work is layout.',
      'Practise reading errors rather than guessing. The message usually names the file and line.',
      'Write small things end to end rather than following long tutorials. A page that does one real thing teaches more than a large project you copied.',
    ]);
    d.callout('The habit that matters most',
      'Verify rather than assume. Nearly every real problem in this project was found by checking: measuring the hash rate, hit-testing where clicks landed, reading text coordinates in a PDF. Believing something works is not the same as knowing it does.');

    d.h1('12.  Questions to be ready for');
    d.qa([
      ['What is CORS and how did you handle it?',
       'A browser security rule stopping a page reading data from another site without permission. The data sources did not grant it, so the request is made server-side by a small function on my own domain, which also lets the response be cached for everyone.'],
      ['What does serverless mean?',
       'Code that runs on demand without a server you manage. It stays idle until a request arrives, runs, and stops. Here it is used only for the two endpoints that need live data.'],
      ['Why use a Web Worker?',
       'The page has one thread that also handles drawing and input, so heavy computation freezes it. Workers are separate threads that communicate by messages, so the search runs at full speed while the page stays responsive.'],
      ['How do you stop a demo hogging someone machine?',
       'Duty-cycle it: work for a measured interval, then rest in proportion to the share the visitor chose. Combined with opting in first and stopping when the tab is hidden, that is what separates it from cryptojacking.'],
      ['Why is an IntersectionObserver better than a scroll listener?',
       'A scroll listener fires constantly and must measure the page each time. An observer is handled internally by the browser and reports only when visibility actually changes.'],
      ['When would you not use the built-in crypto functions?',
       'Almost never. This project is an exception because the promise-based interface dominated the cost at millions of operations. That was established by measurement, not assumption.'],
      ['Why SVG rather than an image?',
       'It stays sharp at any size, the file is tiny, and it can be styled with the same CSS variables as the rest of the page, so charts follow the light and dark themes automatically.'],
    ]);
  },
};
