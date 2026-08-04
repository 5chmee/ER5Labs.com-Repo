export default {
  out: '00-Overview/ER5Labs-Site-Overview.pdf',
  title: 'ER5Labs.com',
  subtitle: 'How the site is built, and why each decision was made',
  runningHead: 'ER5Labs | Site Overview',
  eyebrow: 'E R 5 L A B S   |   O V E R V I E W',
  intro: [
    'This covers the site itself: what it is made of, how the pieces fit together, and the reasoning behind the choices. It assumes no prior web development knowledge and introduces each idea before using it.',
    'Read it before any conversation where the site might come up. The final section lists the questions most likely to follow.',
  ],
  oneLiner:
    'A static personal site built with Astro, deployed on Vercel, whose pages are plain HTML files generated ahead of time, with two small server functions for live data and roughly 16 KB of JavaScript in total.',

  body(d) {
    d.pageBreak();
    d.h1('1.  What the site is');
    d.p('ER5Labs.com is a personal portfolio and hub. Its front page is a split-flap departure board, the kind seen in a railway station, where each row is a destination in the site: Projects, Skills, Experience, Entries and Playground.');
    d.p('The whole site is deliberately small and fast. It ships about 16 KB of JavaScript in total, where a typical portfolio site ships fifty to a hundred times more.');

    d.h2('The stack, and what each part does');
    d.kv([
      ['Astro', 'The framework. It turns source files into finished HTML pages ahead of time, so visitors download a plain page rather than waiting for JavaScript to build one.'],
      ['Vercel', 'The host. It watches the GitHub repository, rebuilds on every push, and serves the result worldwide.'],
      ['Cloudflare', 'Domain registrar and DNS only. It answers the question "where does er5labs.com live" and nothing else.'],
      ['GitHub', 'Version history and the single source of truth. Vercel deploys from it.'],
    ]);

    d.callout('Static versus dynamic, plainly',
      'A dynamic site builds each page when somebody asks for it, which costs time on every visit. A static site builds every page once, in advance, so a visit is just a file download. Everything here is static except two small endpoints that must fetch live data.');

    d.pageBreak();
    d.h1('2.  How the code is organised');
    d.p('Astro requires a specific folder layout, so these locations are fixed rather than chosen.');
    d.kv([
      ['src/pages/', 'One file per URL. A file at src/pages/skills.astro becomes er5labs.com/skills. This is called file-based routing.'],
      ['src/layouts/', 'The shared page wrapper. Base.astro holds everything common to every page: the head tags, the lamp, the navigation, the board, the footer.'],
      ['src/components/', 'Reusable pieces: the departure board, the market ticker, the side navigation, each Playground experiment.'],
      ['src/data/', 'The content. Projects, skills, experiments and site copy live here as plain lists, so adding a project is a small edit rather than a new page.'],
      ['src/content/entries/', 'Written entries, as Markdown files. Dropping a new file in makes a new post appear.'],
      ['src/styles/global.css', 'The design system: colours, type scale, spacing, all as named variables.'],
      ['src/pages/api/', 'The two server functions, for market prices and Bitcoin data.'],
      ['src/workers/', 'Background thread code, currently the mining engine.'],
      ['public/', 'Files served exactly as they are: the icon set, the social preview image, robots.txt.'],
      ['scripts/', 'Small build tools run by hand rather than on every deploy, currently the icon generator.'],
    ]);

    d.callout('The one idea worth taking away',
      'Content lives in data files, presentation lives in components. Adding a project means editing a list; it never means writing a new page. That separation is why the site can grow without becoming a mess.');

    d.pageBreak();
    d.h1('3.  The design decisions');
    d.h2('Why it looks the way it does');
    d.p('The brief was a site that reads as made rather than generated. The specific choices that follow from that:');
    d.bullets([
      'One accent colour, a terracotta, used sparingly. No gradients anywhere.',
      'A departure board as the front door, so the site sends you somewhere rather than presenting a wall of cards.',
      'Light by default, with a pull-cord lamp that switches to dark and remembers the choice.',
      'A faint graph paper grid behind everything, a nod to engineering paper.',
      'Navigation hidden until the pointer reaches either edge of the screen, so the board stays the focus.',
    ]);

    d.h2('How theming actually works');
    d.p('Every colour is a named variable rather than a literal value. The dark theme redefines those variables and the whole site follows, including the board, the ticker and the charts.');
    d.code([
      ':root            { --bg: #f5f3ee;  --ink: #1b1a17; }',
      ':root[data-theme="dark"] { --bg: #141210;  --ink: #ece6db; }',
      '',
      'body { background: var(--bg); color: var(--ink); }',
    ]);
    d.p('Pulling the lamp cord sets that data-theme attribute and stores the choice, so nothing needs to be repainted by hand.');

    d.h2('The departure board');
    d.p('The board is not decoration; it is the navigation. Each row is a page. The letters physically turn over, one character at a time, the way a real split-flap display does.');
    d.p('It also tracks which pages have been visited, so a returning visitor sees "Viewing", "To be viewed" or "Last viewed 20 mins ago" against each destination. That state is stored in the browser and survives a refresh.');

    d.pageBreak();
    d.h1('4.  Performance, and why it is deliberate');
    d.p('Speed here is the result of specific decisions rather than luck.');
    d.kv([
      ['Static pages', 'Nothing is assembled on demand, so a visit is a file download.'],
      ['No framework runtime', 'The site ships no React or similar. Only small scripts for the parts that genuinely move.'],
      ['Self-hosted fonts', 'Fonts are served from the site rather than a third party, removing an external request and a privacy leak.'],
      ['Compositor-friendly motion', 'Animations move and fade only, never resize, which keeps them off the main thread.'],
      ['Off-screen work pauses', 'The ticker and the sketch animations stop when scrolled out of view, which browsers do not do for you.'],
      ['Heavy work is threaded', 'The mining demo runs on background threads so the page never stutters.'],
    ]);
    d.callout('The measured result', 'About 16 KB of JavaScript in total, pages between 17 and 38 KB, and fonts downloaded only in the character sets a visitor actually needs.');

    d.pageBreak();
    d.h1('5.  The icon set');
    d.p('The small square beside a page title in a browser tab is called a favicon. It is the only part of the site a visitor sees while looking at something else, so it does more work than its size suggests.');

    d.h2('Why there is more than one file');
    d.p('There is no single format every platform accepts. Browsers and operating systems each ask for something different, so a site declares several and each client takes the first it understands.');
    d.kv([
      ['favicon.svg', 'Chrome, Firefox, Safari and Edge. Described mathematically, so it is sharp at any zoom level and weighs a few hundred bytes.'],
      ['favicon.ico', 'Older clients, and Google’s search crawler, which still requests this name specifically. It is a container holding 16, 32 and 48 pixel versions.'],
      ['apple-touch-icon.png', '180 pixels, for an iOS home screen. iOS applies its own rounded mask and supplies no background of its own, so this version has square corners and is flattened onto a solid colour.'],
      ['icon-192.png, icon-512.png', 'Android home screens, listed in the manifest.'],
      ['site.webmanifest', 'A small file naming the site, its theme colour and its icons, used when somebody installs the site to a home screen.'],
    ]);

    d.h2('The design constraint that decides everything');
    d.p('A favicon is displayed at sixteen pixels. That is a grid of 256 pixels in total, less than a full stop on this page. Detail does not survive it. Whatever reads at sixteen pixels is a bold silhouette with strong contrast against its background, which is why well known icons are almost always one shape or one character on a filled tile.');
    d.p('The mark is a stacked monogram: a small, widely spaced ER curving gently over a large 5, in departure board amber on a near-black tile. The colours are the board’s own, so the icon and the front page read as the same object. The 5 carries the icon, because a single numeral is the one element that stays legible at sixteen pixels.');

    d.h2('Setting type on a curve');
    d.p('The ER is not a straight line that has been bent. Each letter is placed on a circle whose centre sits below the text, and rotated to match the tangent at its own position, so the pair arches over the numeral and descends on both sides of it. Twenty degrees is a light touch, but it is the difference between a lockup that looks assembled and one that looks drawn.');
    d.p('The radius is not chosen directly. It follows from the width the letters have to cover and the angle they have to cover it in, since the arc length of a circle is its radius multiplied by the angle. So the design is expressed as a number of degrees, which is what somebody adjusting it actually cares about, and the geometry is derived.');
    d.code([
      'const arc    = (degrees * Math.PI) / 180;',
      'const radius = inkedWidth / arc;          // arc length = r x angle',
      'const angle  = (distanceAlong / radius);  // per letter',
    ]);
    d.small('Two bugs surfaced on the first attempt: every letter was drawn at its own origin, so a straight line stacked them on top of one another, and the arc used each letter’s position in the line where it needed its position relative to itself. Both were obvious once the result was rendered and looked at, and invisible in the code.');
    d.callout('The font trap in SVG icons, and how it was avoided',
      'An SVG containing a text element is rendered using a font from the viewer’s machine, not yours. A carefully set monogram silently becomes whatever they happen to have installed. So the letters are not text: the outlines are read out of the site’s own typeface at build time and written into the file as paths. The letterforms match the headings exactly, and nothing depends on the visitor.');

    d.h2('Generated, not drawn');
    d.p('Keeping five images in agreement by hand is the same duplication problem the rest of the site avoids, so the icons are produced from one small configuration instead.');
    d.code([
      '// scripts/build-icons.mjs',
      'const design = {',
      '  tile: "#16130d",  mark: "#e6a13a",  radius: 7,',
      '  erHeight: 5.8, erTrack: 0.22, erArc: 20,',
      '  fiveHeight: 15.2, gap: 2.1,',
      '};',
    ]);
    d.p('Running npm run icons regenerates every file from those numbers. Adjusting the design is a changed value rather than five images redrawn, and they cannot drift apart.');

    d.h2('Checking it rather than trusting it');
    d.p('A mark looks convincing on a design canvas at two hundred pixels and can be unreadable at sixteen. Rather than judging by eye, the icon was rendered at sixteen pixels and the pixels read back and printed as characters, one per row, so the actual result could be inspected.');
    d.p('That is how the tracking on the ER was settled. Set at a normal width the two letters merge into a single smudge; opened up to nearly a third of an em they at least resolve as two separate marks. Four settings were rendered and compared before one was chosen.');
    d.code([
      'track 0.09    .....++.++......   one merged smudge',
      'track 0.18    ....++..++++....   still joined',
      'track 0.30    ....+++..++.....   two distinct marks',
      '',
      '#  full cream    +  partial    .  tile',
    ]);
    d.p('The test also settled something no adjustment could fix. At sixteen pixels the ER is under three pixels tall, which is below the size at which letterforms resolve at all, so it will never be read as letters there. Curving it costs a little more, since a rotated stroke lands across pixel boundaries rather than along them. It becomes legible at thirty-two pixels, which is what a modern high-density screen actually uses for a tab, and fully clear everywhere larger.');
    d.p('That is a deliberate trade rather than a flaw. At the smallest size the icon still reads as a distinctive amber numeral on near-black, which is enough to find in a row of tabs, and the full monogram appears everywhere with room for it.');
    d.callout('Why this is the interesting part',
      'The habit generalises well beyond icons. Nearly every real problem found while building this site was found by measuring rather than assuming: the hash rate that justified writing SHA-256 by hand, where clicks were actually landing when the navigation swallowed them, the text coordinates that exposed clipped paragraphs in these documents.');
    d.p('The .ico is assembled by hand, because no ordinary image library writes that format. It is a six byte header, a sixteen byte directory entry per image giving its size and position, then the image data itself. Modern .ico files hold PNGs rather than raw bitmaps, which every browser since Internet Explorer 11 reads.');
    d.small('The generated files are committed rather than built during deployment. The image library is a development dependency only, so nothing is added to what a visitor downloads or to the deploy itself.');

    d.pageBreak();
    d.h1('6.  Deployment');
    d.p('The pipeline has three steps and no manual stage.');
    d.bullets([
      'A change is committed and pushed to GitHub.',
      'Vercel notices, runs the build, and publishes the result, typically inside a minute.',
      'The domain points at Vercel through DNS records held at Cloudflare.',
    ]);
    d.p('er5labs.com is the primary domain and emadrafiq.com redirects to it, so both work but only one is canonical. Certificates are issued automatically.');
    d.small('The DNS records are set to "DNS only" rather than proxied. Routing traffic through Cloudflare and Vercel at once causes certificate errors and redirect loops.');

    d.h2('The two server functions');
    d.p('Almost everything is static, but two things cannot be: live market prices and live Bitcoin data. Those run as small functions on demand, and their answers are cached at the edge so one request serves many visitors.');
    d.p('They exist because a browser cannot fetch those sources directly. A security rule called CORS stops a web page reading data from another site unless that site permits it, and neither does. Fetching server-side sidesteps that, and keeps the caching in one place.');

    d.pageBreak();
    d.h1('7.  Questions to be ready for');
    d.qa([
      ['Why Astro rather than React or Next.js?',
       'The site is mostly content, so there is nothing for a client-side framework to manage. Astro renders to plain HTML and ships no runtime by default, which is why the whole site is about 16 KB of JavaScript. Reaching for React would have added weight for no benefit.'],
      ['What does static site generation actually mean?',
       'Pages are built once at deploy time rather than assembled per request. The visitor downloads a finished file, so there is no server work and nothing to wait for.'],
      ['You said it is static, but it has live market data. How?',
       'The pages are static; two endpoints are not. They run on demand as serverless functions, fetch the data server-side, and cache the response at the edge. That also solves CORS, since a browser cannot call those APIs directly.'],
      ['How does dark mode work without duplicating the styles?',
       'Every colour is a CSS custom property. The dark theme redefines the properties on the root element, so one attribute change repaints the entire site, including charts and the board.'],
      ['How do you add a new project to the site?',
       'Add an entry to a list in src/data/projects.ts. The listing, the detail page and the homepage panel all read from that list, so nothing else needs touching.'],
      ['What did you do to make it fast?',
       'Static output, no framework runtime, self-hosted fonts, animations that only move or fade, off-screen animation paused, and the one genuinely heavy feature moved onto background threads.'],
      ['Why does a favicon need five files?',
       'No format is universally supported. Browsers take the SVG, Google’s crawler and older clients ask for the .ico, iOS needs a 180 pixel PNG with square corners because it applies its own mask, and Android reads PNGs listed in a manifest. Each client takes the first format it recognises.'],
      ['How did you decide what the icon should look like?',
       'By the constraint rather than by taste. It is displayed at sixteen pixels, so one element has to carry it, which is the numeral. I rendered candidates down to sixteen pixels and read the pixels back rather than judging by eye, which is how the letter spacing was chosen and how I established the small ER can never be legible at that size.'],
      ['Your icon has letters in it, but you said text in an SVG is a trap. How is that resolved?',
       'The letters are not text. The outlines are read out of the site’s own typeface at build time with a font parsing library and written into the file as path data. The shapes match the headings exactly and nothing depends on what the visitor has installed.'],
      ['How does deployment work?',
       'Push to GitHub, Vercel rebuilds and publishes automatically. DNS at Cloudflare points the domain at Vercel, with the second domain redirecting to the primary.'],
    ]);
  },
};
