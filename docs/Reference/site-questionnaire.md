# ER5 Labs — site content questionnaire

Fill this in wherever you have something to say. Write as much as you like;
longer answers are better than shorter ones, and rough notes are fine — I will
tidy the prose.

**How to use it**

- Type under each `→` marker. Leave anything blank that you want me to decide.
- `[ ]` means tick one; change it to `[x]`.
- Where a question says **BLOCKING**, I will not publish anything on that topic
  until you have answered, because the current text is my invention.
- Save the file and tell me it is ready. I will read it, adjust the site, build
  the documentation PDF, and only then commit — with your approval.

**What is already decided**

- Both domains already point at the Vercel project. `er5labs.com` is primary,
  `emadrafiq.com` redirects to it. Nothing changes at Cloudflare.
- The new design gets ported into the existing Astro project, so the security
  headers, content security policy, comment-stripping build step, icon
  generator and serverless routes all survive.

---

## A · Identity and positioning

**A1. Wordmark.** Currently `ER5 Labs`, with "Labs" in grey.

→

**A2. Headline.** Currently: *"I build things to find out whether the maths actually holds."*

→

**A3. Standfirst.** Currently: *"Probability and statistics are where I started. Most of what I make is a way of testing a model against something real — a live market feed, a blockchain, a dataset that refuses to behave. Some of it is commissioned. A fair amount of it isn't."*

→

**A4. Location.** Currently "London, UK". Keep, change, or omit?

→

**A5. Contact email.** Site currently uses `er5labs@outlook.com`. Options include
`emadrwork@outlook.com` or a domain address such as `emad@er5labs.com`.

→

**A6. Other links.** LinkedIn, GitHub, X, anything else — and should they sit in
the footer only, or the nav as well?

→

---

## B · Studio and commercial work

**B1. Are you taking contract work right now?** The home page currently claims
*"Available for contract and freelance work from October"*, which I invented.

- [ ] Yes, and that wording is fine
- [ ] Yes, but reword it to: →
- [ ] Not yet — remove the line

**B2. Have you done paid or contract work? — BLOCKING**

- [ ] Yes (fill in B3 for each engagement)
- [ ] No — launch Studio with the services block and no client list

**B3. For each engagement, copy this block and fill it in. — BLOCKING**

```
Client name:
Can I name them publicly?   yes / no / anonymise as "..."
What they needed:
What you built:
Dates (from – to):
Engagement type (fixed scope, retainer, hourly):
Outcome — what changed for them:
Tools and languages:
Can it be linked or shown?   yes / no
Should it appear on the timeline?   yes / no
```

→

**B4. Services.** Currently three: *Modelling and analysis*, *Process
automation*, *Small tools and internal software*. Accurate? Add, remove, reword.

→

**B5. Engagement model.** Do you want anything public about rates, minimum
scope, or availability window?

→

---

## C · Studies

**C1. Institution name, and may I name it publicly? — BLOCKING**

→

**C2. Exact dates.** Start month/year, and expected graduation.

→

**C3. Degree title.** Is "BSc Mathematics & Finance" exact? Joint honours? Any
named specialism or pathway?

→

**C4. Real modules.** The site currently lists generic strands I made up. Please
list the modules you have actually taken, and what you are taking next.

```
Year 1:
Year 2:
Year 3 (planned):
```

→

**C5. Current year of study.**

→

**C6. Grades.** Do you want any classification, running average, or individual
module results shown? (Fine to say no.)

→

**C7. Dissertation.** Decided, undecided, or not yet applicable? The site
currently claims a regime-detection study is your leading candidate — invented.

→

**C8. Prior qualifications.** A-levels or equivalent — include them or not?

→

---

## D · Work experience

Copy the block below once **per role**, including anything I do not know about:
internships, part-time work, tutoring, volunteering, freelance.

```
Employer:                       (real name, or how to anonymise)
Job title as it appeared:
Dates (from – to):
What you actually did, day to day:
What you owned rather than assisted with:
Anything you built or automated, and what it replaced:
Tools, software, languages:
Scale — clients, engagement size, team size:
Should it appear on the timeline?   yes / no
```

→

---

## E · Projects

Copy this block **per project**. Include ones that do not exist yet if you want
them listed as in progress.

```
Name:
One line, in your words:
Section:            projects / studio / playground
On the timeline?    yes / no
Date built:
Area:               probability / data / applied AI / tooling / statistics / other
Tech stack:
Status:             live / in progress / archived
Links:              live URL, repo, or none
Write-up — the problem:
Write-up — the method:
Write-up — the result:
```

→

### Specific questions on what already exists

**E1. Private & Confidential AI Processing Tool. — BLOCKING**
Its tags have been marked "inferred placeholder" in your repo since the start.
What does it actually do, who is it for, what is it built with, and what stage
is it at?

→

**E2. Audit sampling toolkit.** Is this real? Paid engagement or personal
project?

→

**E3. Bitcoin mining simulator.** These are real measurements from your build.
Confirm you are happy publishing them:

| Figure | Value |
| --- | --- |
| Hand-written SHA-256 | 139,480 H/s |
| `crypto.subtle` | ~17,000 H/s |
| Network hash rate | 876.9 EH/s |
| Time to a minimum payout | ~107,000 years |

- [ ] Yes, publish these
- [ ] No — reason: →

---

## F · Writing

**F1. Do you want a Writing section at launch?** If you have not written
anything yet, I would suggest launching without it rather than shipping empty
drafts.

- [ ] Yes, at launch
- [ ] No, add it later

**F2. If yes — titles and topics you actually intend to write.**

→

---

## G · Playground, and what to keep from the current site

**G1. Bitcoin mining simulator** — fully built and working today.
- [ ] Keep  - [ ] Retire

**G2. Split-flap toy**
- [ ] Keep  - [ ] Retire

**G3. Galton board** — my suggestion, does not exist yet.
- [ ] Build it  - [ ] Drop it

**G4. The departure board** — the current homepage centrepiece.
- [ ] Retire entirely  - [ ] Keep as a Playground exhibit

**G5. Market ticker.** You asked for a trending-equity info box, then paused it.
- [ ] Yes, on the home page — where: →
- [ ] Yes, elsewhere: →
- [ ] No

**G6. Graph-paper grid and pull-cord lamp** from the current design.
- [ ] Retire  - [ ] Carry over

**G7. Existing documentation PDFs.** `docs/` currently describes the old
architecture.
- [ ] Rewrite them for the new site
- [ ] Keep both, clearly labelled

---

## H · Structure

**H1. Section names.** Currently Studio / Projects / Writing / Playground /
About. Rename any? (e.g. "Work" instead of "Studio", "Notes" instead of
"Writing".)

→

**H2. Items per section on the home page.** Currently 2–3 each, 9 of 12 total.

→

**H3. The "In progress" queue** on the home page. Keep it? If so, what is
genuinely in it?

→

**H4. Anything missing.** A CV page, a Now page, a uses page, testimonials, a
newsletter, anything else?

→

---

## I · Migration mechanics

**I1. Redirects.** The current site has `/projects/er5labs`,
`/playground/bitcoin-mining-game`, `/skills`, `/experience`, `/entries`. Adding
redirects stops existing links breaking. Recommended: yes.
- [ ] Add redirects  - [ ] Do not bother

**I2. API endpoints.** `/api/markets.json` and `/api/trending.json` are only
needed if the ticker stays.
- [ ] Keep  - [ ] Remove

**I3. Anything on the current site you want preserved** that I have not listed?

→

---

## J · The documentation PDF

**J1. Audience.**
- [ ] Me, before interviews (as the existing documents are)
- [ ] Also readable by a client
- [ ] Both, as separate documents

**J2. Depth.** Should it cover the decision history — why the accent colour was
removed, why the timeline swaps components at the breakpoint, why colour is
reserved for data — or only the final architecture?

→

**J3. Failures.** The existing documents include the bugs and how they were
found, which is the most useful part to be able to talk about. Include them?
Candidates: the `x-astro-path` advisory, the origin-fetch bug that silently
broke the ticker in production, the favicon that was illegible at 16px, the
timeline sort where the pin was not actually load-bearing.
- [ ] Include them  - [ ] Leave them out

---

## Anything else

Anything I have not asked about, or anything on the demo that you dislike and
have not mentioned:

→
