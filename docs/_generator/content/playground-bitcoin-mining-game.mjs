export default {
  out: 'Playground/Bitcoin-Mining-Game.pdf',
  title: 'The Bitcoin Mining Game',
  subtitle: 'How it works: the maths and the code, in the order it happens',
  runningHead: 'ER5Labs | Bitcoin Mining Game',
  eyebrow: 'E R 5 L A B S   |   P L A Y G R O U N D',
  intro: [
    'This explains the mining demo on er5labs.com from the ground up. It assumes no prior knowledge of Bitcoin, cryptography or web development, and builds each idea on the one before it.',
    'Read it once to understand what the demo does, and once more before any conversation where you might be asked about it. The last section lists the questions worth being ready for.',
  ],
  oneLiner:
    'Bitcoin mining is a guessing game where computers race to find a number that makes a block of data hash to a value starting with enough zeros. The demo plays that exact game against a real block, using real cryptography, but against an easier goal because the real one is unreachable.',

  body(d) {
    d.pageBreak();
    d.h1('1.  What mining actually is');
    d.p('Bitcoin is a shared ledger. Every ten minutes or so a new page of transactions is added to it. The question Bitcoin had to answer is: who gets to decide what goes on the next page?');
    d.p('The answer is a competition, open to anyone, where winning is luck weighted by how fast your computer is.');

    d.h2('The scrambler');
    d.p('There is a function called SHA-256. Feed it any data and it returns a 64-character code. Three properties matter:');
    d.bullets([
      'The same input always gives the same output.',
      'Changing the input even slightly gives a completely different output, with no resemblance to the previous one.',
      'You cannot work backwards. Given an output there is no way to find the input except by trying inputs one at a time.',
    ]);
    d.p('That last property is the whole basis of mining. The only way to hit a particular kind of output is to keep guessing.');

    d.h2('The competition');
    d.p('Miners take the page of transactions, attach a changeable number called the nonce, and hash the result. If the code starts with enough zeros they win and their page joins the ledger. If not, they change the nonce and try again. There is no strategy and no way to get warmer.');

    d.callout('Why it is called proof of work',
      'A winning nonce proves somebody did an enormous amount of guessing, because there is no other way to find one. Anybody can verify it instantly by hashing once. Hard to produce, trivial to check. That asymmetry is the entire security model.');

    d.pageBreak();
    d.h1('2.  What the demo does, step by step');
    d.p('This is the order things actually happen when you press Start.');

    d.h2('Step 1  |  Fetch a real block');
    d.p('The demo asks the Bitcoin network for the most recent block and receives six pieces of information, together called the block header:');
    d.kv([
      ['Version', 'Which version of the rules this block follows.'],
      ['Previous hash', 'The code of the block before it. This is what chains blocks together.'],
      ['Merkle root', 'A single code summarising every transaction in the block.'],
      ['Timestamp', 'When the block was made.'],
      ['Bits', 'The difficulty goal, in compact form.'],
      ['Nonce', 'The changeable number miners search for.'],
    ]);
    d.small('This arrives through a small server-side route rather than the browser calling the network directly. If the network is unreachable a saved block is used, so the demo never breaks.');

    d.h2('Step 2  |  Assemble exactly 80 bytes');
    d.p('Those six fields pack into a fixed 80 bytes in a strict order and format. This is the fiddliest part of the project.');
    d.p('Computers can store a number in two directions. One can be written 01 00 00 00 or 00 00 00 01. Bitcoin uses the first, called little-endian. On top of that, the two hashes in the header are stored in reverse of how they are displayed, and the final answer must be reversed again before comparison.');
    d.callout('Three reversals',
      'Get any one wrong and you still get a plausible looking 64-character code. It is simply the wrong one, and nothing warns you. That is why the code was tested against a real block rather than checked by eye.');

    d.h2('Step 3  |  Hash it twice');
    d.p('Bitcoin runs SHA-256 over the header, then again over that result. Twice, not once, as a guard against a class of attack on the single version.');

    d.h2('Step 4  |  Compare against the goal');
    d.p('The 64-character result, read as a number, must be smaller than a threshold called the target. Because the target is very small, only codes beginning with a long run of zeros qualify.');

    d.h2('Step 5  |  Change the nonce and repeat');
    d.p('If it does not qualify, add one to the nonce and hash again. That loop is mining. Everything else is packaging.');

    d.pageBreak();
    d.h1('3.  The maths');
    d.h2('How likely is any single guess?');
    d.p('SHA-256 output is uniformly random, so every possible code is equally likely. Each character is one of 16 possibilities, so asking for d leading zeros has probability:');
    d.code(['p  =  1 / 16^d']);
    d.p('Four zeros is 1 in 65,536. Five is about 1 in a million. Each extra zero is sixteen times harder, and that exponential growth is why difficulty can be tuned so precisely.');

    d.h2('How many guesses will it take?');
    d.p('Each guess is independent with the same chance, which makes this a geometric distribution. The expected number of attempts before the first success is:');
    d.code(['expected attempts  =  1 / p  =  16^d']);

    d.h2('The property that surprises people');
    d.p('The process has no memory. Being a million guesses in tells you nothing about how close you are. Your chance on the next guess is what it was on the first.');
    d.callout('There is no progress bar in mining',
      'And there cannot be one. Not because nobody built it, but because there is nothing to measure. This is a consequence of independence, not a limitation of the software.');
    d.p('Over continuous time this becomes the exponential distribution. Guessing at rate R per second, the chance of having won by time t is:');
    d.code(['P(won by time t)  =  1 - e^(-p R t)']);
    d.p('That is the curve the demo draws. The dashed line marks the median, where you have a fifty-fifty chance of being done:');
    d.code(['median time  =  ln(2) / (p R)']);
    d.p('The same distribution across the whole network is why block arrivals form a Poisson process averaging one every ten minutes.');

    d.pageBreak();
    d.h1('4.  Difficulty: a thermostat');
    d.p('As more machines join, blocks would arrive faster. Bitcoin prevents that by moving the goalposts every 2016 blocks, roughly a fortnight:');
    d.code([
      'next target  =  current target  x  (actual time / expected time)',
      '',
      'expected time  =  2016 blocks  x  600 seconds  =  2 weeks',
    ]);
    d.p('Too fast and the target shrinks, making mining harder. Too slow and the reverse. The change is capped at a factor of four either way so one unusual fortnight cannot destabilise the system.');
    d.callout('Recognise the pattern',
      'This is a feedback control loop with saturation limits, correcting a noisy measurement back towards a set point. Structurally it is a thermostat. Saying so shows you understand what the formula is for, not just what it computes.');

    d.h2('The compact form');
    d.p('The target is a 256-bit number, too large for ordinary arithmetic, so it is compressed into 32 bits called bits: a leading exponent byte and a three-byte mantissa.');
    d.code(['target  =  mantissa  x  2^(8 x (exponent - 3))']);
    d.p('Expanding it requires big-integer arithmetic, because the result exceeds what a normal number type can hold.');

    d.pageBreak();
    d.h1('5.  The money question');
    d.h2('Why a browser cannot mine');
    d.kv([
      ['Bitcoin network', 'roughly 870 billion billion guesses per second'],
      ['A browser', 'roughly 85,000 guesses per second across four threads'],
      ['The gap', 'about sixteen orders of magnitude'],
    ]);
    d.p('A visitor mining continuously would earn on the order of 0.0000000000026 BTC per day. The smallest amount a pool will normally pay out is 0.0001 BTC. That is around a hundred thousand years of uninterrupted mining to be paid once.');
    d.p('This is why the demo submits nothing, joins no pool and contains no wallet address. It cannot pay, so it does not pretend to.');

    d.h2('Whether real hardware pays');
    d.p('You earn the same share of the day new coins as your share of the network guessing power, then pay for the electricity:');
    d.code([
      'profit per day  =  (your rate / network rate) x 144 x 3.125 x price',
      '                   x (1 - pool fee)',
      '                   -  kilowatts x 24 x tariff',
    ]);
    d.small('144 is blocks per day. 3.125 BTC is the current reward per block, halving roughly every four years.');
    d.p('A top-end machine at 200 trillion guesses per second drawing 3.5 kilowatts, on a British domestic tariff of 25p per unit, loses about 16 pounds a day. It earns roughly 4.94 and spends 21 on electricity.');
    d.callout('The number that explains the industry',
      'Break-even is around 6p per kilowatt hour. No domestic tariff comes close. That single figure is why mining happens beside hydroelectric dams and flared gas wells, and never anywhere you could plug in at home.');

    d.pageBreak();
    d.h1('6.  The code, and where it lives');
    d.kv([
      ['btc-miner.worker.ts', 'The engine. SHA-256 written out by hand plus the guessing loop, on a background thread.'],
      ['BitcoinMiner.astro', 'The interface. Panels, controls, starting and stopping workers, plotting the probability curve.'],
      ['api/bitcoin.json.ts', 'A server-side route fetching the live block, difficulty and price, with caching.'],
      ['data/playground.ts', 'The experiment list, so adding one is a small edit rather than a new page.'],
    ]);

    d.h2('Why SHA-256 was written by hand');
    d.p('Browsers include SHA-256 already, and it was used first. It was correct but slow here: it returns a promise, so waiting for each answer cost more than computing it, capping the rate around 17,000 guesses per second with almost none of that being arithmetic.');
    d.p('Writing the algorithm longhand allows a tight loop with no waiting. It runs roughly eight times faster, about 140,000 guesses per second on one thread.');
    d.callout('How it was proven correct',
      'A subtly wrong hash function still produces confident looking output, so it was checked three ways: the two standard reference cases every implementation must match, and reproducing a real block. Feed it the nonce that won block 959,833 and it returns that block real identifier exactly. One wrong bit and it would return noise.');

    d.h2('Why background threads');
    d.p('A tight hashing loop would freeze the page, because normally all work and all drawing share one thread. Web Workers are separate threads. The search runs there and sends occasional progress messages back, so the page stays smooth however hard it works.');
    d.p('Several workers run at once, each starting at a different nonce and stepping forward by the number of workers, so no two ever check the same number.');

    d.h2('Why it deliberately rests');
    d.p('Each worker hashes a batch, times it, then pauses in proportion to the chosen effort. Asking for 30 per cent means working one interval and waiting roughly two.');
    d.p('That is the difference between a demo and something a browser would flag as malicious. The visitor opts in first, chooses how much of their machine to lend, can stop at any moment, and it halts by itself when the tab loses focus.');

    d.pageBreak();
    d.h1('7.  Questions to be ready for');
    d.qa([
      ['Why can nobody work backwards to a winning nonce?',
       'Because SHA-256 is one-way. Given a desired output there is no method to compute an input other than trying candidates. Every miner runs the same brute-force search with no shortcut available.'],
      ['Why is there no progress bar?',
       'Because each guess is independent, so the process is memoryless. Past failures carry no information about future success. It is a property of the distribution, not a missing feature.'],
      ['What distribution describes the waiting time?',
       'Geometric over discrete guesses, exponential in the continuous limit, which makes network-wide block arrivals a Poisson process with a ten minute mean.'],
      ['Why does difficulty adjust, and how?',
       'To hold block time at ten minutes as computing power changes. Every 2016 blocks the target is rescaled by the ratio of actual to expected elapsed time, clamped to a factor of four. It is a feedback controller.'],
      ['Why is mining concentrated in a few places?',
       'Profitability is dominated by electricity price. Break-even sits near 6p per kilowatt hour, far below domestic rates, so mining migrates to unusually cheap or otherwise wasted power.'],
      ['Why did you write SHA-256 yourself?',
       'The built-in version is promise-based, so waiting dominated the cost at roughly 17,000 hashes per second. A synchronous implementation removed that overhead and ran about eight times faster.'],
      ['How do you know your implementation is correct?',
       'It matches the standard reference vectors and reproduces the real hash of a real block from that block real nonce. That is an exact check, not an approximate one.'],
      ['How do you run heavy computation without freezing the page?',
       'Move it off the main thread into Web Workers, communicate by messages, and duty-cycle the loop so it yields a chosen share of each core back to the system.'],
      ['Is this not just cryptojacking?',
       'No, and the differences are deliberate. Nothing runs until the visitor opts in, they choose how much processor to use, it stops when the tab loses focus, and nothing is submitted anywhere. Cryptojacking is defined by hiding all of that.'],
    ]);

    d.pageBreak();
    d.h1('Glossary');
    d.kv([
      ['Hash', 'A fixed-length code produced from any input by a one-way function.'],
      ['SHA-256', 'The hash function Bitcoin uses. 256 bits, written as 64 hexadecimal characters.'],
      ['Nonce', 'The changeable number in a block header. What miners search for.'],
      ['Block header', 'The 80 bytes that get hashed: version, previous hash, merkle root, timestamp, bits, nonce.'],
      ['Merkle root', 'A single hash summarising every transaction in a block.'],
      ['Target', 'The threshold a block hash must fall below. Lower means harder.'],
      ['Bits', 'The target compressed into 32 bits, as exponent plus mantissa.'],
      ['Difficulty', 'A readable measure of how low the target is, relative to the easiest ever used.'],
      ['Hash rate', 'Guesses per second, measured in mega, tera or exahashes.'],
      ['Halving', 'The block reward halves roughly every four years. Currently 3.125 BTC.'],
      ['Proof of work', 'A scheme where producing a valid block is expensive but checking one is instant.'],
      ['Little-endian', 'Storing a number least significant byte first. Bitcoin uses it for header integers.'],
      ['Web Worker', 'A background thread in a browser, for heavy work that must not freeze the page.'],
    ]);
  },
};
