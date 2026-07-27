---
title: Mining a real Bitcoin block in the browser
date: 2026-07-27
summary: The maths, the statistics and the engineering behind the Playground demo, plus why it can never pay out.
---

The newest thing in my Playground hashes the real header of the current Bitcoin
block. Not a mock-up of one. The version field, the previous block hash, the
merkle root, the timestamp and the compact difficulty target all arrive live
from the network, get laid out as the same 80 bytes a miner hashes and run
through the same double SHA-256.

The test I set myself was simple. If my implementation is genuinely correct,
then feeding it the nonce the real miner found should reproduce that block's
real hash exactly. It does. Block 959,833 was solved with the nonce in its
header and the demo returns:

```
000000000000000000016a439fba8b46a18e7fe17d774cf23f31dfd4235a9330
```

which is that block's actual identifier. One wrong bit anywhere in the byte
layout and it would return noise. There is a button in the demo that runs this
check live against whatever block is current, so you do not have to take my word
for it.

## Writing SHA-256 by hand

I started with the browser's built-in `crypto.subtle.digest`, which was correct
but slow for this purpose. It returns a promise, so awaiting it once per hash
costs more than the hashing does. At around seventeen thousand hashes per second
the bottleneck was the scheduler rather than the arithmetic.

So I wrote SHA-256 out longhand: the eight working variables, the sixty-four
round constants, the message schedule expansion, the rotations and the modular
additions. It runs about eight times faster, roughly a hundred and forty thousand
hashes per second on one thread, because a tight synchronous loop has no promise
machinery in it.

I did not trust it until it passed three tests: the NIST vectors for `"abc"` and
the empty string, plus the real block reproduction above.

### The part that took the longest

Almost none of the difficulty was in the compression function. It was byte order.

A header is a fixed 80 byte structure: 4 bytes of version, 32 of previous hash,
32 of merkle root, then 4 each of time, bits and nonce. The integers are
little-endian, so 1 is stored `01 00 00 00`. The two hashes are stored in reverse
of how they are displayed, because Bitcoin prints hashes big-endian but stores
them little-endian internally. Then the double hash output has to be reversed
again before you compare it to anything.

Three separate reversals. Getting any one of them wrong produces a
plausible-looking hash that is simply incorrect. That is exactly why I tested
against a known block instead of eyeballing the output.

## Decoding the target

The `bits` field is a compact floating point number packed into 32 bits. The
leading byte is an exponent, the remaining three a mantissa. The real 256 bit
target is:

```
target = mantissa × 2^(8 × (exponent − 3))
```

That overflows a double by an enormous margin, so I expand it with `BigInt` and
compare candidate hashes against it as full 256 bit integers. A hash is a
solution when it is less than or equal to that number.

## The statistics

SHA-256 output is uniform, so every nonce is an independent Bernoulli trial.
Asking for *d* leading hexadecimal zeros gives each attempt probability
p = 16<sup>−d</sup>, which makes the number of attempts before the first success
geometric with expectation 16<sup>d</sup>.

The demo plots the continuous limit of that. With a measured rate R the hit rate
is λ = pR. The probability of having found something by time t is:

```
P(T ≤ t) = 1 − e^(−λt)
```

The chart draws that curve against your own measured hash rate and marks the
median at ln(2)/λ. At 5 zeros and roughly 85,000 hashes per second that came out
at a median of 8.6 seconds and a mean of 12.4.

The important consequence is that the process is memoryless. Being a million
hashes into a search tells you nothing about how close you are, which is the same
reason block arrivals across the whole network form a Poisson process with a mean
of ten minutes. There is no progress bar in mining. That is a theorem rather
than a design choice.

## Difficulty as a control loop

Every 2016 blocks the network rescales the target so that blocks keep averaging
ten minutes:

```
next = current × (2016 × 600) / actual seconds elapsed
```

clamped to a factor of four in either direction so a single anomalous epoch
cannot destabilise it. It is a proportional controller with saturation limits,
acting on a noisy measurement of global computing power.

The demo shows where the network currently is in that cycle using live data: how
far through the 2016 blocks it is, the running average block time against the ten
minute goal, plus the resulting projected adjustment. While I was writing this,
blocks were averaging 10.3 minutes, so difficulty was projected to rise about
1.06 per cent.

## Why it can never pay

The demo computes the comparison live rather than asserting it.

The network runs at roughly 873 exahashes per second. A browser managed about
85,000 across four threads, a gap of around sixteen orders of magnitude. Working
it through, a visitor's share is about 5.7 × 10⁻¹⁵, which at current issuance is
something like 2.6 × 10⁻¹² BTC per day. The smallest payout a pool will usually
make is 0.0001 BTC, so that is on the order of a hundred thousand years of
uninterrupted hashing.

So the demo submits nothing, connects to no pool and contains no wallet address.
It says so on screen, twice. Anything else would be dishonest. Browser miners
that hide this are precisely what antivirus software and Safe Browsing block on
sight.

## The same maths on real hardware

Since the interesting question is not whether a browser can mine but whether
anything can, I built the expected value model into the page. Revenue is your
share of the network multiplied by daily issuance:

```
profit/day = (H ÷ H_net) × 144 × 3.125 × price × (1 − fee) − kW × 24 × tariff
```

Put a 200 TH/s machine drawing 3.5 kW on a 25p domestic tariff into it and the
answer is a loss of about £16 a day. Revenue is roughly £4.94 while the
electricity alone is £21. The break-even tariff is about 6p per kWh, which is why
industrial mining clusters around stranded hydro and flared gas rather than
anywhere you could plug in at home.

The model also reports payback period and the four year figure across a halving
cycle, then compares it against simply buying the coins with the same capital. It
holds difficulty and price constant, which if anything flatters mining, since
difficulty has historically risen and steadily erodes the share a fixed rig earns.

## Keeping the page fast

A hashing loop is the easiest way to make a page stutter, so none of it runs on
the main thread. The search lives in a pool of Web Workers, one per core, each
starting at a different nonce and stepping by the pool size so no two ever
duplicate work. The main thread only receives progress messages and repaints.

Inside each worker the loop is duty-cycled: it hashes a batch, times it, then
rests in proportion to the effort you asked for. Requesting 30 per cent of a core
means working for one unit and waiting for just over two. That is why the page
scrolls smoothly with every core busy.

Three rules follow from taking that seriously. The reported rate is measured over
a rolling window that includes the idle time, so it reflects what you actually
asked for rather than flattering it. Nothing computes at all until you have read
the notice and pressed start. And it stops itself when the tab goes to the
background, because there is no excuse for draining someone's battery on a page
they have navigated away from.

New blocks arrive over a WebSocket rather than by polling, so when the network
finds one the demo switches to hashing that header within a second or two, and
the chain tip on screen updates itself. The slower data, the difficulty schedule
and the price, comes through a small cached endpoint so one request serves every
visitor for a couple of minutes. A verified block snapshot ships with the page as
a fallback, so the demo still works if the network is unreachable.

## What I would still add

Plotting difficulty on a log scale over several years would show the control loop
responding to hardware generations. Letting the profitability model take a
difficulty growth rate would turn it from a snapshot into a proper projection,
which is closer to the work I actually enjoy.
