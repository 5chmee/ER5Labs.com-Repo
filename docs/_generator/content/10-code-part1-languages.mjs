export default {
  out: '01-Code-Walkthrough/Part-1-The-Three-Languages.pdf',
  title: 'Part 1: The Three Languages',
  subtitle: 'HTML, CSS and JavaScript, explained through your own site',
  runningHead: 'ER5Labs | Code Walkthrough, Part 1',
  eyebrow: 'E R 5 L A B S   |   C O D E   W A L K T H R O U G H',
  intro: [
    'This is the first of three parts. It assumes you have never written a line of code. Every example is real code taken from your own site, so by the end you should be able to open any file in the project and follow what it is doing.',
    'Read the parts in order. Part 1 covers the three languages every website is made of. Part 2 covers the tools that turn those files into a real site. Part 3 covers the harder browser features your site actually uses.',
  ],
  oneLiner:
    'Every website is HTML for structure, CSS for appearance and JavaScript for behaviour. Everything else is tooling built on top of those three.',

  body(d) {
    d.pageBreak();
    d.h1('1.  What a website actually is');
    d.p('A website is a folder of text files sitting on a computer somewhere. When you type an address, your browser asks that computer for those files, downloads them, and draws what they describe. There is no magic step.');
    d.p('Almost every file falls into one of three languages, each with one job:');
    d.kv([
      ['HTML', 'Structure. What is on the page: a heading, a paragraph, a button, a list.'],
      ['CSS', 'Appearance. What it looks like: colour, size, spacing, position, motion.'],
      ['JavaScript', 'Behaviour. What happens: what a click does, what changes, what gets fetched.'],
    ]);
    d.callout('The house analogy',
      'HTML is the walls and rooms. CSS is the paint, furniture and layout. JavaScript is the electrics: the switches, the doorbell, anything that responds. A house can exist with only walls. It cannot exist with only paint.');
    d.p('Your site uses all three, plus a handful of tools that make writing them less repetitive. Those tools come in Part 2. First the languages themselves.');

    d.pageBreak();
    d.h1('2.  HTML: the structure');
    d.h2('Tags and elements');
    d.p('HTML marks up text to say what it is. You wrap content in tags, written in angle brackets. An opening tag, the content, then a closing tag with a slash. Together that is an element.');
    d.code([
      '<h1>ER5Labs</h1>',
      '<p>I am a Math and Finance student.</p>',
    ]);
    d.kv([
      ['h1', 'The most important heading on the page. There should be exactly one.'],
      ['p', 'A paragraph of text.'],
      ['The slash', 'Marks the closing tag, telling the browser this element ends here.'],
    ]);

    d.h2('Attributes');
    d.p('Tags can carry extra information, written as name="value" inside the opening tag.');
    d.code([
      '<a href="/projects" class="nav-link">Projects</a>',
    ]);
    d.kv([
      ['a', 'An anchor, meaning a link.'],
      ['href', 'Where the link goes. Here, the projects page of this site.'],
      ['class', 'A label with no meaning to the browser, used so CSS and JavaScript can find this element later. This is the single most important attribute to understand.'],
    ]);

    d.h2('Nesting');
    d.p('Elements go inside other elements, forming a tree. Indentation is only for human readability; the browser ignores it.');
    d.code([
      '<section class="board">',
      '  <ul class="board__rows">',
      '    <li><a href="/projects">PROJECTS</a></li>',
      '    <li><a href="/skills">SKILLS</a></li>',
      '  </ul>',
      '</section>',
    ]);
    d.p('That is a simplified version of your departure board: a section containing an unordered list, each list item containing a link.');

    d.h2('Why the choice of tag matters');
    d.p('You could build an entire page from generic div elements, which mean nothing. Your site does not, because the tag communicates meaning to things that cannot see:');
    d.bullets([
      'Screen readers announce a nav as navigation and let a blind user skip it.',
      'Search engines weight an h1 far more heavily than styled text.',
      'Keyboard users get working tab order from a real button, but not from a styled div.',
    ]);
    d.small('This is called semantic HTML. It is why your site uses header, nav, main, section, article and footer rather than divs everywhere.');

    d.pageBreak();
    d.h1('3.  CSS: the appearance');
    d.h2('The shape of a rule');
    d.p('CSS says: find these elements, apply these looks. Every rule has a selector and a block of properties.');
    d.code([
      '.board__link {',
      '  color: #f2e7cb;',
      '  padding: 0.8rem;',
      '  border-radius: 6px;',
      '}',
    ]);
    d.kv([
      ['.board__link', 'The selector. The dot means "any element with class board__link".'],
      ['color', 'A property, here the text colour.'],
      ['#f2e7cb', 'A value. Hex colour: red, green and blue amounts in base 16.'],
      ['padding', 'Space inside the element, between its edge and its content.'],
      ['rem', 'A unit relative to the page base font size, so it scales if the reader changes their text size. Better than fixed pixels.'],
    ]);

    d.h2('The box model');
    d.p('Every element is a rectangle with four layers, working outwards. Nearly all layout confusion comes from mixing these up.');
    d.kv([
      ['content', 'The text or image itself.'],
      ['padding', 'Space inside the border, pushing content away from the edge.'],
      ['border', 'The edge itself.'],
      ['margin', 'Space outside the border, pushing other elements away.'],
    ]);
    d.callout('The rule of thumb',
      'Padding is space inside a thing. Margin is space between things. If a background colour should extend into the space, you want padding.');

    d.h2('Custom properties, and how your dark mode works');
    d.p('CSS lets you store a value under a name and reuse it. Your entire theming system is this one feature.');
    d.code([
      ':root {',
      '  --bg:  #f5f3ee;',
      '  --ink: #1b1a17;',
      '}',
      '',
      ':root[data-theme="dark"] {',
      '  --bg:  #141210;',
      '  --ink: #ece6db;',
      '}',
      '',
      'body { background: var(--bg); color: var(--ink); }',
    ]);
    d.kv([
      [':root', 'The whole document. Values defined here are available everywhere.'],
      ['--bg', 'A custom property. The two dashes mark it as one.'],
      ['var(--bg)', 'Reads that value back.'],
      ['[data-theme="dark"]', 'Only applies when the page carries that attribute.'],
    ]);
    d.p('So pulling the lamp cord sets one attribute, every variable takes its dark value, and the whole site repaints. Nothing had to be written twice. If colours were hard-coded, dark mode would mean duplicating every rule.');

    d.pageBreak();
    d.h2('Flexbox: arranging things in a line');
    d.p('Used wherever your site puts items in a row or column with even spacing.');
    d.code([
      '.site-footer__inner {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '  gap: 1rem;',
      '}',
    ]);
    d.kv([
      ['display: flex', 'Lay the children out in a line rather than stacked.'],
      ['justify-content', 'Spacing along the line. space-between pushes the first and last to the edges.'],
      ['align-items', 'Alignment across the line. center vertically centres them.'],
      ['gap', 'Minimum space between children.'],
    ]);

    d.h2('Grid: arranging things in two dimensions');
    d.p('Used for your projects listing and the mining statistics panel.');
    d.code([
      '.miner__stats {',
      '  display: grid;',
      '  grid-template-columns: repeat(2, 1fr);',
      '}',
      '',
      '@media (min-width: 560px) {',
      '  .miner__stats { grid-template-columns: repeat(4, 1fr); }',
      '}',
    ]);
    d.kv([
      ['1fr', 'One fraction of the space available. Two columns of 1fr each take half.'],
      ['@media', 'A media query. Only apply these rules when the condition holds.'],
      ['min-width: 560px', 'Only on screens at least 560 pixels wide.'],
    ]);
    d.p('So that panel is two columns on a phone and four on a laptop. That is all responsive design is: the same HTML, with different rules at different widths.');

    d.h2('Transitions and animations');
    d.p('A transition smooths a change that would otherwise be instant.');
    d.code(['.btn { transition: background 200ms ease; }']);
    d.p('Now any background change on that button fades over 200 milliseconds instead of snapping. An animation is the same idea but you define the steps yourself, which is what makes your split-flap tiles turn.');
    d.callout('The performance rule that matters',
      'Animating transform and opacity is cheap, because the graphics hardware can do it without recalculating the page. Animating width, height or position is expensive, because the browser must redo the layout on every frame. Your site animates only the cheap ones, deliberately.');

    d.pageBreak();
    d.h1('4.  JavaScript: the behaviour');
    d.h2('Storing values');
    d.code([
      'const GENESIS = "0".repeat(64);   // never changes',
      'let nonce = 0;                    // will change',
    ]);
    d.kv([
      ['const', 'A name whose value never changes. Use this by default.'],
      ['let', 'A name whose value will change.'],
      ['//', 'A comment. Ignored by the computer, written for humans.'],
    ]);

    d.h2('Functions');
    d.p('A function is a named piece of work you can run whenever you like.');
    d.code([
      'const short = (h) => `${h.slice(0, 6)}...${h.slice(-4)}`;',
      '',
      'short("000000abc123def456");   // gives "000000...f456"',
    ]);
    d.kv([
      ['(h) =>', 'Takes one input, called h inside the function.'],
      ['slice(0, 6)', 'The first six characters. slice(-4) takes the last four.'],
      ['Backticks', 'A template string. Anything inside ${ } is calculated and inserted.'],
    ]);

    d.h2('The DOM: reaching into the page');
    d.p('Once the browser has read your HTML it holds the page in memory as a tree of objects. That is the DOM, and JavaScript changes the page by changing it.');
    d.code([
      'const clock = document.getElementById("board-clock");',
      'clock.textContent = "14:32";',
    ]);
    d.p('Line one finds the element whose id is board-clock. Line two replaces its text. The page updates immediately, with no reload.');

    d.h2('Events: reacting to the user');
    d.p('Here is your lamp switch, the whole thing, line by line.');
    d.code([
      'btn.addEventListener("click", () => {',
      '  const next = isDark() ? "light" : "dark";',
      '  if (next === "dark") root.setAttribute("data-theme", "dark");',
      '  else root.removeAttribute("data-theme");',
      '  localStorage.setItem("er5-theme", next);',
      '});',
    ]);
    d.kv([
      ['addEventListener', 'When this thing happens to this element, run this function.'],
      ['"click"', 'The event to listen for.'],
      ['() => { ... }', 'The function to run. It has no inputs, hence the empty brackets.'],
      ['? :', 'A compact if-else. If dark, use "light", otherwise "dark".'],
      ['===', 'Exactly equal to. Always use three, not two.'],
      ['setAttribute', 'Adds data-theme="dark" to the page, which triggers all the CSS from earlier.'],
      ['localStorage', 'A small store in the browser that survives closing the tab, so the choice is remembered.'],
    ]);
    d.p('That is the complete feature. The CSS does the actual work of recolouring; the JavaScript only flips one attribute.');

    d.pageBreak();
    d.h2('Lists and objects');
    d.p('An array is an ordered list. An object is a labelled bundle. Your site content is mostly these two, nested.');
    d.code([
      'const destinations = [',
      '  { code: "ER 01", label: "PROJECTS",  href: "/projects" },',
      '  { code: "ER 02", label: "SKILLS",    href: "/skills"   },',
      '];',
      '',
      'destinations[0].label;   // "PROJECTS"',
    ]);
    d.p('Square brackets make an array, curly braces an object. Counting starts at zero, so the first item is [0].');

    d.h2('Doing something to every item');
    d.code([
      'destinations.forEach((d) => {',
      '  console.log(d.label);',
      '});',
      '',
      'const labels = destinations.map((d) => d.label);',
    ]);
    d.kv([
      ['forEach', 'Run this function once per item. Returns nothing.'],
      ['map', 'Run this function once per item and collect the results into a new list.'],
      ['console.log', 'Print to the browser developer console. Your main debugging tool.'],
    ]);
    d.p('This is how one entry in your projects list becomes one card on the page: the list is mapped into HTML.');

    d.h2('Waiting for slow things');
    d.p('Fetching data over the internet takes time. JavaScript does not stop and wait, because that would freeze the page. Instead it carries on and comes back when the answer arrives.');
    d.code([
      'const load = async () => {',
      '  const res = await fetch("/api/markets.json");',
      '  const data = await res.json();',
      '  render(data.items);',
      '};',
    ]);
    d.kv([
      ['async', 'Marks a function that contains waiting.'],
      ['await', 'Pause here until this finishes, without freezing the page.'],
      ['fetch', 'Ask another computer for something.'],
      ['res.json()', 'Interpret the reply as JSON, a standard text format for structured data.'],
    ]);
    d.p('That is your market ticker. Three lines: ask, interpret, draw.');

    d.pageBreak();
    d.h1('5.  How the three work together');
    d.p('Take your lamp. Three files, three jobs:');
    d.kv([
      ['HTML', 'A button element exists on the page, with an id so it can be found.'],
      ['CSS', 'Rules describe the cord and bulb, and separately describe every colour on the site in terms of variables.'],
      ['JavaScript', 'On click, flip one attribute and remember the choice.'],
    ]);
    d.p('None of them knows much about the others. The JavaScript does not know what colours exist. The CSS does not know a button was clicked. They meet at one attribute name. That separation is what keeps a site changeable.');
    d.callout('The habit worth forming',
      'When something needs to change on a page, ask which of the three should own it. If it can be done in CSS, it usually should be, because CSS is faster and does not break.');

    d.h1('6.  Questions to be ready for');
    d.qa([
      ['What are HTML, CSS and JavaScript, and how do they differ?',
       'HTML is structure, CSS is presentation, JavaScript is behaviour. Keeping them separate means each can change without disturbing the others.'],
      ['What is the DOM?',
       'The browser in-memory representation of the page as a tree of objects. JavaScript changes what you see by modifying it rather than by rewriting the HTML file.'],
      ['What is semantic HTML and why does it matter?',
       'Using tags that describe meaning rather than generic containers. It gives screen readers, search engines and keyboard navigation information they cannot otherwise get.'],
      ['How does your dark mode work?',
       'Every colour is a CSS custom property. The dark theme redefines those properties under an attribute selector, so setting one attribute repaints the whole site with no duplicated rules.'],
      ['Difference between padding and margin?',
       'Padding is inside the border, margin is outside. Backgrounds extend into padding but not margin.'],
      ['What does async and await actually do?',
       'They let a function pause for a slow operation without blocking the page. The browser continues handling clicks and scrolling while it waits.'],
      ['Why animate transform rather than width?',
       'Transform and opacity can be handled by the compositor without recalculating layout. Animating width forces the browser to redo layout every frame, which causes stutter.'],
    ]);
  },
};
