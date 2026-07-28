export default {
  out: '01-Code-Walkthrough/Part-2-The-Tools.pdf',
  title: 'Part 2: The Tools',
  subtitle: 'Node, Astro, TypeScript, Markdown, Git and deployment',
  runningHead: 'ER5Labs | Code Walkthrough, Part 2',
  eyebrow: 'E R 5 L A B S   |   C O D E   W A L K T H R O U G H',
  intro: [
    'Part 1 covered the three languages a browser understands. This part covers everything that sits between writing code and having a live website, and why each piece exists.',
    'Every tool here solves a specific problem that appears once a site grows past a couple of pages. Understanding the problem first makes the tool obvious.',
  ],
  oneLiner:
    'Tools exist to remove repetition, catch mistakes early, and turn source files into a finished site that a browser can download.',

  body(d) {
    d.pageBreak();
    d.h1('1.  The problem tools solve');
    d.p('Imagine your site as plain HTML files. Twelve pages, each with the same header, the same navigation, the same footer, the same departure board.');
    d.p('Now change one navigation link. You edit twelve files. Miss one and the site is quietly inconsistent. Add a thirteenth page and you copy and paste, inheriting every mistake.');
    d.callout('The rule underneath everything here',
      'Anything written twice will eventually disagree with itself. Every tool below exists to make sure a thing is written once.');

    d.h1('2.  Node and npm');
    d.h2('What Node is');
    d.p('JavaScript was invented to run inside browsers. Node is a program that runs JavaScript outside the browser, on your computer. That is what lets you use JavaScript as a build tool.');
    d.small('Your copy lives inside the project at .tools/node, because installs on this machine kept disappearing. Unusual, but it works and it survives.');

    d.h2('What npm is');
    d.p('npm is the package manager that comes with Node. It downloads code other people have written so you do not rewrite it.');
    d.code([
      'npm install astro        # download a package and record it',
      'npm run build            # run a task defined in package.json',
    ]);

    d.h2('package.json: the shopping list');
    d.code([
      '{',
      '  "scripts": {',
      '    "dev":   "astro dev",',
      '    "build": "astro build"',
      '  },',
      '  "dependencies": {',
      '    "astro": "^5.13.0",',
      '    "@vercel/analytics": "^2.0.1"',
      '  }',
      '}',
    ]);
    d.kv([
      ['scripts', 'Named shortcuts. "npm run dev" runs the dev server, "npm run build" produces the finished site.'],
      ['dependencies', 'What the project needs. Names and versions only, not the code itself.'],
      ['^5.13.0', 'This version or any later one that promises not to break things. The caret means compatible updates are allowed.'],
    ]);

    d.h2('package-lock.json and node_modules');
    d.kv([
      ['package-lock.json', 'The exact versions actually installed, down to a checksum. This is what makes a build reproducible on another machine.'],
      ['node_modules/', 'The downloaded code itself. Hundreds of megabytes, never committed to Git, rebuilt from the two files above by running npm install.'],
    ]);
    d.callout('Why node_modules is never committed',
      'It is enormous, it is machine-specific, and it can always be regenerated. Committing the two small text files instead is the entire point of a package manager.');

    d.pageBreak();
    d.h1('3.  Astro: components');
    d.p('Astro is the framework. Its core idea is the component: a reusable piece of page, written once and used anywhere.');

    d.h2('The anatomy of an .astro file');
    d.p('Every one has up to four parts, and it is worth knowing which is which.');
    d.code([
      '---                                    <-- frontmatter, runs at BUILD time',
      'import { destinations } from "../data/site";',
      'const path = Astro.url.pathname;',
      '---',
      '',
      '<nav class="sidenav">                   <-- template, becomes HTML',
      '  {destinations.map((it) => (',
      '    <a href={it.href}>{it.label}</a>',
      '  ))}',
      '</nav>',
      '',
      '<style>                                 <-- scoped CSS',
      '  .sidenav { position: fixed; }',
      '</style>',
      '',
      '<script>                                <-- runs in the BROWSER',
      '  document.querySelector(".sidenav");',
      '</script>',
    ]);
    d.kv([
      ['Frontmatter', 'Between the two lines of dashes. JavaScript that runs once when the site is built, on your machine. It never reaches the visitor.'],
      ['Template', 'HTML, with { } to drop values in and .map() to repeat elements.'],
      ['style', 'CSS that applies only to this component. Astro adds a hidden marker so it cannot leak elsewhere.'],
      ['script', 'JavaScript sent to the browser, for things that must respond to the user.'],
    ]);
    d.callout('The distinction that trips everyone up',
      'Frontmatter runs at build time on your computer. Script runs later, in the visitor browser. Frontmatter can read files and hold secrets. Script cannot, and anything in it is visible to anyone.');

    d.h2('The scoping catch, which cost real time here');
    d.p('Scoped styles work by Astro adding a hidden attribute to every element it generates, then rewriting your CSS to require it. Elements created later by JavaScript never get that attribute, so their styles silently do not apply.');
    d.p('That is exactly what broke the market ticker: its rows are built in the browser, so the scoped styles missed them. The fix was to mark that style block as global and namespace every selector under .ticker instead.');

    d.pageBreak();
    d.h2('Props: passing values in');
    d.p('A component becomes reusable when it takes inputs, called props.');
    d.code([
      '// SideNav.astro',
      '---',
      'const { side = "left", mirror = false } = Astro.props;',
      '---',
      '',
      '// used twice, differently',
      '<SideNav side="left" />',
      '<SideNav side="right" mirror />',
    ]);
    d.p('One component, two navigations. The equals sign gives a default when nothing is passed.');

    d.h2('Layouts and slots');
    d.p('A layout is a component that wraps a whole page. The slot is where the page content goes.');
    d.code([
      '// Base.astro',
      '<body>',
      '  <Lamp />',
      '  <SideNav side="left" />',
      '  <div class="masthead"><DepartureBoard /></div>',
      '  <slot />               <-- the page drops in here',
      '  <footer>...</footer>',
      '</body>',
    ]);
    d.p('This is why one edit to Base.astro changed every page when analytics was added. Twelve pages, one file.');

    d.h2('File-based routing');
    d.p('There is no configuration listing your pages. The folder structure is the routing.');
    d.kv([
      ['src/pages/skills.astro', 'becomes  /skills'],
      ['src/pages/projects/index.astro', 'becomes  /projects'],
      ['src/pages/playground/[slug].astro', 'becomes  /playground/anything'],
    ]);
    d.p('Square brackets mean a variable part. That one file generates a page for every experiment, using getStaticPaths to say which values exist.');
    d.code([
      'export function getStaticPaths() {',
      '  return experiments.map((e) => ({',
      '    params: { slug: e.slug },',
      '    props:  { experiment: e },',
      '  }));',
      '}',
    ]);
    d.p('At build time Astro runs that, sees two experiments, and writes two finished HTML files. Nothing is computed when a visitor arrives.');

    d.pageBreak();
    d.h1('4.  TypeScript');
    d.p('TypeScript is JavaScript with labels saying what kind of value each thing is. Those labels are checked as you type and then thrown away; the browser only ever sees JavaScript.');
    d.code([
      'export type Project = {',
      '  slug: string;',
      '  title: string;',
      '  year: string;',
      '  status: "Live" | "In progress" | "Archived";',
      '  tags: string[];',
      '};',
    ]);
    d.kv([
      ['string', 'Text.'],
      ['string[]', 'A list of text values.'],
      ['"Live" | "In progress"', 'One of exactly these values and nothing else.'],
      ['?', 'A question mark after a name means optional.'],
    ]);
    d.p('This caught a real mistake in your project: a status was set to "Forever Live", which is not one of the allowed values. Your editor flagged it immediately rather than the page rendering something odd later.');
    d.callout('Why bother',
      'Mistakes get caught while typing rather than when a visitor finds them. On a small site the benefit is modest; the moment a project has several files that must agree, it becomes the difference between confident and nervous changes.');

    d.h1('5.  Data files: content away from presentation');
    d.p('Your content is not written into pages. It sits in plain lists that pages read.');
    d.code([
      '// src/data/projects.ts',
      'export const projects: Project[] = [',
      '  { slug: "er5labs", title: "ER5Labs.com", status: "Live", ... },',
      '];',
    ]);
    d.p('The projects listing, each detail page and the homepage panel all read from that one list. Adding a project is one entry; three places update. That is also why the tags on your homepage cannot disagree with the tags on the projects page: there is only one copy.');

    d.h1('6.  Markdown: writing without tags');
    d.p('Writing prose in HTML is miserable. Markdown is shorthand that converts to HTML.');
    d.code([
      '## A heading',
      '',
      'Normal text with **bold** and *italic*.',
      '',
      '- a list item',
      '- another',
    ]);
    d.p('Your written entries are Markdown files. The block at the top between dashes is frontmatter again, holding the title and date. Astro reads the folder, sorts by date, and builds a page for each. Adding a post means adding a file.');

    d.pageBreak();
    d.h1('7.  Git: history and safety');
    d.p('Git records snapshots of your project so you can see what changed, when, and undo anything.');
    d.code([
      'git add .                      # choose what to include',
      'git commit -m "message"        # save a snapshot with a description',
      'git push                       # send it to GitHub',
    ]);
    d.kv([
      ['Commit', 'A saved snapshot plus a message explaining why. The message is the valuable part.'],
      ['Repository', 'The project plus its whole history.'],
      ['GitHub', 'A website hosting repositories, so the history exists somewhere other than your laptop.'],
      ['.gitignore', 'A list of things never to record: node_modules, build output, personal documents.'],
    ]);
    d.p('Git identifies you by the email on each commit. Yours was set to an address GitHub did not recognise, so early commits were not credited to your profile. Changing it fixed future commits; adding the old address to your GitHub account fixes the old ones.');

    d.h1('8.  Building and deploying');
    d.h2('What "build" means');
    d.p('Running npm run build takes your source and produces a folder of finished files: HTML for every page, compressed CSS and JavaScript, everything named with a fingerprint so browsers cache it safely.');
    d.p('Your source is never what visitors download. They get the built output.');

    d.h2('How the site goes live');
    d.bullets([
      'You push a commit to GitHub.',
      'Vercel notices, downloads the project, runs npm install then npm run build.',
      'It publishes the result to servers worldwide, usually within a minute.',
    ]);
    d.p('There is no manual upload step, and no way to have a live site that does not match the repository.');

    d.h2('The domain');
    d.p('DNS is the internet address book. Your domains are registered at Cloudflare, which answers the question "where does er5labs.com live" by pointing at Vercel. er5labs.com is primary and emadrafiq.com redirects to it, so both work but only one is canonical.');

    d.h1('9.  Questions to be ready for');
    d.qa([
      ['What problem does a component framework solve?',
       'Repetition. Shared parts of a page are written once and used everywhere, so a change happens in one file rather than twelve, and pages cannot drift out of sync.'],
      ['What is the difference between Astro frontmatter and a script tag?',
       'Frontmatter runs at build time on your machine and never reaches the visitor. A script tag is sent to the browser and runs there. Only frontmatter can safely touch files or secrets.'],
      ['Why is node_modules not in version control?',
       'It is large, machine-specific and reproducible. package.json and package-lock.json record exactly what to install, so the folder can always be rebuilt.'],
      ['What does TypeScript give you if the browser ignores it?',
       'Mistakes are caught while writing rather than at runtime. In this project it caught a status value that was not one of the permitted options.'],
      ['Why keep content in data files rather than in the pages?',
       'One source of truth. The homepage, the listing and the detail page all read the same list, so they cannot contradict each other, and adding an item is one edit.'],
      ['What actually happens when you deploy?',
       'A push to GitHub triggers Vercel to install dependencies, run the build, and publish the generated output. The live site is always exactly what the repository produces.'],
      ['What is file-based routing?',
       'The folder structure defines the URLs. A file at src/pages/skills.astro serves /skills, and a bracketed filename generates one page per item in a list.'],
    ]);
  },
};
