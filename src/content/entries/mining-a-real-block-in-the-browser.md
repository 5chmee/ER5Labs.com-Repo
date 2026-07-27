---
title: Mining a real Bitcoin block in the browser
date: 2026-07-27
summary: What Bitcoin mining actually is, built as a playable demo, plus why it can never pay out.
---

## Mining, in one paragraph

Bitcoin mining is a guessing game. Take the batch of transactions waiting to be
recorded, add one changeable number to it called the **nonce**, then feed the whole
lot into a scrambler that turns any input into a 64 character code. Change the
nonce by one and the code comes out completely different, with no pattern you can
follow. You win if the code that comes out happens to start with enough zeros.

That is the entire contest. There is no skill in it and no way to work backwards,
so the only strategy is guessing faster than everyone else. That is why miners buy
warehouses of machines that guess trillions of times a second.

The thing I built for my Playground plays that exact game, against a real block
taken live off the Bitcoin network.

## Proving it is the real thing

Anybody can put a spinning number on a page and call it mining. So the demo has a
button that settles the question.

Every block that has ever been mined was won by somebody finding a nonce. That
winning number is stored in the block forever. If my code is genuinely doing what
real miners do, then feeding it a real block's winning nonce should reproduce that
block's real code exactly.

Press the button and it does. Block 959,833 comes back as:

```
000000000000000000016a439fba8b46a18e7fe17d774cf23f31dfd4235a9330
```

which is that block's actual identifier, the one you can look up on any block
explorer. If a single bit of my implementation were wrong it would return noise
instead. The check runs against whatever block is current, so you do not have to
take my word for it.

## Why writing the scrambler myself was worth it

The scrambler is SHA-256. Browsers ship with it built in, so I used that first.

It was correct but slow, for an annoying reason: the built in version hands back a
promise, which is fine if you hash a few things and useless if you hash millions.
The waiting cost more than the work. I was getting about seventeen thousand guesses
a second, of which almost none was arithmetic.

So I wrote SHA-256 out by hand instead: the eight working numbers it shuffles, the
sixty-four constants it mixes in, the rotations, the additions. A plain loop with
no waiting in it. That runs about eight times faster, roughly a hundred and forty
thousand guesses a second on one thread.

I did not trust a word of it until it passed three tests: the two standard
reference cases that every implementation must match, then the real block above.

### The bit that actually took the time

Almost none of the difficulty was in the mathematics. It was in the order of the
bytes.

Bitcoin writes some numbers backwards. Not metaphorically, literally: the number 1
is stored as `01 00 00 00`. The two codes inside a block are stored in reverse of
how they are displayed, because Bitcoin prints them one way round and stores them
the other. Then the final answer has to be flipped again before you can compare it
to anything.

Three separate reversals. Getting any one of them wrong gives you a
respectable looking code that is simply wrong. That is exactly why I tested against
a known block rather than trusting my eyes.

## How long should a win take?

This is the part I find genuinely interesting. It is where the statistics live.

Every guess has the same small chance of winning, but crucially the guesses do not
build on each other. Being a million guesses in tells you nothing about how close
you are. The process has no memory.

That has a real consequence: **there is no progress bar in mining, nor can there
ever be.** Not because nobody has written one, but because there is nothing for
it to measure. This is a mathematical fact rather than a design choice.

The demo draws your chance of having won by any given moment, using the speed you
are actually going. The curve climbs steeply then flattens. The dashed line
marks the halfway point, where you have a 50/50 chance of being done.

<details>
<summary>The formal version</summary>

Each nonce is an independent Bernoulli trial. Asking for *d* leading hexadecimal
zeros gives each attempt probability p = 16<sup>−d</sup>, so the number of attempts
before the first success is geometric with expectation 16<sup>d</sup>. Taking the
continuous limit, with measured rate R the hit rate is λ = pR and

```
P(T ≤ t) = 1 − e^(−λt)
```

which is the exponential distribution. Its memorylessness is why block arrivals
across the whole network form a Poisson process with a mean of ten minutes. The
median is ln(2)/λ, which is what the dashed line marks.

</details>

## Why blocks always take ten minutes

Left alone, blocks would arrive faster and faster as more machines joined. Bitcoin
stops that by moving the goalposts.

Every two weeks it counts how long the last 2016 blocks really took. If they came
faster than ten minutes each, winning gets harder. If slower, easier. The change is
capped at a factor of four in either direction so one strange fortnight cannot
break it.

An engineer would recognise this immediately: it is a thermostat. A feedback loop
correcting a noisy measurement back towards a set point.

The demo shows where the network is in that cycle right now, using live data. While
I was writing this, blocks were running slightly slow at 10.3 minutes, so the next
adjustment was heading about 1 per cent harder.

## Why it can never pay you anything

The demo works this out live rather than just asserting it.

The Bitcoin network currently makes about **873 billion billion** guesses per
second. My browser, using four threads, managed about **85,000**. That is a gap of
roughly sixteen orders of magnitude, which is not a gap you close with better code.

Following it through: a visitor's share of the network works out to around
2.6 × 10⁻¹² BTC per day. The smallest amount a mining pool will normally pay out is
0.0001 BTC. At that rate you would need to mine without stopping for something like
**a hundred thousand years** to be paid once.

So the demo submits nothing, joins no pool and contains no wallet address. It says
so on screen, twice. Anything else would be dishonest. Browser miners that hide
this are exactly what antivirus software blocks on sight.

## Does it pay for anyone?

Since the real question is not whether a browser can mine but whether anything can,
I built the profitability model into the page.

You earn the same slice of the day's new coins as your slice of the world's guessing
power, then you pay for the electricity you burned getting it. Put a top end machine,
200 trillion guesses a second drawing 3.5 kilowatts, on an ordinary British home
tariff of 25p per unit. The answer is a **loss of about £16 a day**. It earns
roughly £4.94 and spends £21 on power.

The break-even electricity price is about **6p per unit**. That single number
explains the whole industry: it is why mining happens next to hydroelectric dams or
flared gas wells, never anywhere you could plug a machine in at home.

The model also gives payback time and the four year figure across a halving cycle,
compared against simply buying the coins with the same money. It assumes difficulty
and price stay flat, which if anything is generous to mining, since difficulty has
historically climbed and quietly erodes what a fixed machine earns.

## Keeping the page quick

A guessing loop is the fastest way to make a web page stutter, so none of it runs
where the page is drawn. The work happens in background threads, one per core you
allow, each starting at a different nonce and stepping by the number of threads so
no two ever check the same number.

Inside each thread the loop deliberately rests. It guesses for a while, times
itself, then waits in proportion to the effort you asked for. Choosing 30 per cent
means working for one moment and waiting for two. That is why the page still scrolls
smoothly with every core busy.

A few rules follow from taking that seriously. The speed shown includes the resting
time, so it reflects what you actually asked for rather than flattering itself.
Nothing runs at all until you have read the notice and pressed start. And it stops
by itself when you switch tabs, because there is no excuse for draining someone's
battery on a page they have left.

New blocks arrive over a live connection rather than by repeatedly asking, so when
the network finds one the demo moves onto that block within a second or two. The
slower moving data, the difficulty schedule and the price, comes through a small
shared cache so one request serves every visitor for a couple of minutes.

## What I would add next

Plotting difficulty over several years on a log scale would show the thermostat
responding to each new generation of hardware. Letting the profitability model take
a difficulty growth rate would turn it from a snapshot into a forecast, which is
closer to the work I actually enjoy.
