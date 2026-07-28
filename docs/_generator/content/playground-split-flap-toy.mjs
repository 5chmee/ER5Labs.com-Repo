export default {
  out: 'Playground/Split-Flap-Toy.pdf',
  title: 'The Split-Flap Toy',
  subtitle: 'How the departure board mechanism works, and how it was made smooth',
  runningHead: 'ER5Labs | Split-Flap Toy',
  eyebrow: 'E R 5 L A B S   |   P L A Y G R O U N D',
  intro: [
    'The split-flap toy lets you type a word and watch tiles turn over to spell it, the same mechanism the departure board at the top of every page uses. This explains how it works and, more usefully, what went wrong first and how it was fixed.',
    'It is a small feature, but it is the one that carries the site identity, so it was worth getting right.',
  ],
  oneLiner:
    'Ten tiles each cycle through the alphabet one letter at a time until they reach their target character, animated on the compositor so the effect stays smooth.',

  body(d) {
    d.pageBreak();
    d.h1('1.  What a split-flap display is');
    d.p('Before digital screens, stations and airports used mechanical boards. Each character position held a stack of hinged flaps, each printed with one letter. To show a letter, the stack rotated until the right flap fell into place, making the distinctive clattering cascade.');
    d.p('Crucially, the display could not jump straight to a letter. It had to pass through every letter in between. That constraint is what produces the effect, and it is what the code reproduces.');

    d.h1('2.  How the effect is produced');
    d.h2('The tiles');
    d.p('Ten tiles are rendered as ordinary HTML elements when the page is built, not created by JavaScript. That matters for a reason worth remembering: styles written inside a component are scoped to elements that exist when the page is generated. Elements created later by script do not carry that marker, so the styles silently fail to apply.');
    d.p('Each tile is styled to look like a physical flap: a two-tone background with a horizontal crease across the middle, which is where a real flap would hinge.');

    d.h2('The cycling');
    d.p('When a target word arrives, each tile works out where it currently sits in the alphabet and where it needs to reach, then steps forward one character at a time until it arrives.');
    d.code([
      'const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.&";',
      '',
      'idx = (idx + 1) % CHARS.length;    // step to the next character',
      'el.textContent = CHARS[idx];       // show it',
      'if (idx === target) stop();        // arrived',
    ]);
    d.p('Each tile starts a fraction later than the one before it, which produces the cascade across the word rather than every tile flipping in unison.');

    d.pageBreak();
    d.h1('3.  The problem, and the fix');
    d.p('The first version worked but looked wrong. The motion was noticeably jerky, which for an effect whose entire appeal is its smoothness made it worse than no animation at all.');

    d.h2('What was actually wrong');
    d.p('The flip was a CSS animation, restarted for each character. Restarting a CSS animation requires forcing the browser to recalculate the element, which is done by reading a layout property:');
    d.code([
      'el.classList.remove("is-turning");',
      'void el.offsetWidth;                // force a recalculation',
      'el.classList.add("is-turning");',
    ]);
    d.p('That line is the problem. Reading offsetWidth forces the browser to stop and recompute the page layout immediately. Doing it for roughly forty tiles, several times a second, means constantly interrupting the browser mid-frame. The result is stutter.');

    d.h2('The fix');
    d.p('The animation moved to the Web Animations API, which starts an animation directly from JavaScript with no class toggling and therefore no forced recalculation.');
    d.code([
      'el.animate(',
      '  [{ transform: "rotateX(-90deg)" }, { transform: "rotateX(0deg)" }],',
      '  { duration: last ? 320 : 150, easing: last ? "ease-out" : "linear" }',
      ');',
    ]);
    d.p('Two details give it the mechanical feel. The intermediate flips run at a constant speed, because a real board turns at a fixed rate. The final flip eases out, so each tile settles into place rather than stopping dead.');

    d.callout('The general lesson',
      'Rotations and fades can be handled by the graphics hardware without involving page layout at all. Anything that forces the browser to remeasure the page, mid-animation, will stutter. Animate transform and opacity; avoid touching layout properties in a loop.');

    d.pageBreak();
    d.h1('4.  Where the code lives');
    d.kv([
      ['SplitFlapToy.astro', 'The playable toy: tiles, the input box, the presets, the cycling logic.'],
      ['DepartureBoard.astro', 'The same mechanism as site navigation, plus visit tracking and the live clock.'],
      ['playground/[slug].astro', 'The page that hosts it, generated from the experiment list.'],
      ['data/playground.ts', 'The list of experiments. Adding one is an entry here plus a component.'],
    ]);

    d.h2('The board does two extra things');
    d.bullets([
      'It replays whenever it scrolls back into view, using an observer that reports when an element enters the viewport.',
      'On the homepage every row flips; on any other page only that page own row flips, so arriving somewhere feels like that destination being selected rather than the whole board resetting.',
    ]);

    d.h1('5.  Questions to be ready for');
    d.qa([
      ['Why not just change the text instantly?',
       'Because the point is the mechanism. A real split-flap board physically cannot skip letters, and reproducing that constraint is what makes it read as a departure board rather than a text swap.'],
      ['What was causing the jerkiness?',
       'Restarting a CSS animation per character required forcing a layout recalculation on every tile, several times a second. That blocks the browser mid-frame. Moving to the Web Animations API removed the forced recalculation entirely.'],
      ['Which properties are safe to animate, and why?',
       'Transform and opacity, because they can be handled by the compositor without recalculating layout or repainting. Animating width, height or position forces layout work on every frame.'],
      ['Why are the tiles in the HTML rather than created by script?',
       'Scoped component styles only apply to elements present when the page is generated. Script-created elements miss that marker, so their styles silently do not apply.'],
      ['How does it avoid running when nobody can see it?',
       'An IntersectionObserver reports when the board enters or leaves the viewport, and the animation pauses while it is off screen. Browsers do not do this automatically.'],
    ]);
  },
};
