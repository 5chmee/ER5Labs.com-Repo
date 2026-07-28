# Projects

One document per project listed on the site.

## Status

| Project | Document | Why |
| --- | --- | --- |
| **ER5Labs.com** | See `../00-Overview/ER5Labs-Site-Overview.pdf` | The site is this repository, so its write-up is the overview rather than a duplicate here. |
| **Secure AI Processing Tool for Private files** | Not written | The code lives in a separate project, so an accurate write-up cannot be produced from this repository. |

## Writing up the Secure AI Processing Tool

This one has to be produced from its own codebase. Writing it from the summary
on the site would mean inventing the technical detail, which is exactly the
detail an interviewer asks about.

To produce it, open that project and ask for a reference document covering the
same ground as the others:

- what the tool does, in plain terms, and who it is for
- the architecture: what runs where, and what talks to what
- how confidentiality is actually enforced, not just asserted
- how the AI output is validated for accuracy
- the regulatory and privacy constraints, and how each is met
- what went wrong during the build, and how it was fixed
- the questions an interviewer is likely to ask

Save the result here as `Secure-AI-Processing-Tool.pdf`.

Note that this document will describe client work, so keep it local rather than
committing it to a public repository.
