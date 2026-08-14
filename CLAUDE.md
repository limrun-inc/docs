# Writing and reviewing Limrun docs

Rules for any agent editing pages in this repo. They are non-negotiable.

## Every claim must be verifiable

Any factual assertion about how the system works (a command's behavior, a flag default, a status field name, a region or model enum, what the server does internally) must be traceable to an authoritative source: the source code at github.com/limrun-inc, hands-on CLI/SDK observation, or an explicit answer from the team. If you cannot point to the source that proves a sentence, the sentence does not ship. Flag it and ask.

Source order on conflicts: running CLI/SDK behavior > source code > README > prior drafts. Prior drafts are not a source.

Review a page in two passes, in this order: technical verification first, writing review second. Polishing prose on unverified facts turns wrong claims into confident wrong claims.

## Voice

- No em dashes anywhere. Use periods, commas, colons, or parentheses.
- No fluff phrases: powerful, comprehensive, leverage, enables you to, seamless, robust, effortless, simply, easily, "By the end of this guide".
- No vague performance words (fast, instant, quick) without a real measurement.
- Active voice, specific subjects. Conversational but polished, like explaining to a smart colleague without your context.
- Outcomes first. The page opens with what the reader is here to achieve, not with meta-narration about the page.
- Every heading earns its place. No "Advanced Usage" or "Best Practices" filler, no sections that exist for symmetry.
- No forward references. Introduce a concept before using it.
- Every code block gets a one-sentence introduction; non-trivial blocks get a short follow-up explaining what matters.
- Tables encode a real shape (field by meaning, language by support). If it is a bulleted list in disguise, use a bulleted list.

## Product rules

- No customer or coding-agent product name-drops where they are not load-bearing. Use category names: "coding agents", "platform integrators". Exception: when the name is genuinely the reference (a CLI flag enum, a UI screenshot label).
- The `lim` CLI and the SDKs are different personas. CLI serves coding agents and CI; SDKs serve platform integrators embedding simulators. Keep them on separate pages or in separate blocks, cross-link, and never mix them in one CodeGroup.
- Cloud agents are headless. Where the audience is an agent, lead with the `LIM_API_KEY` environment variable and do not mention `lim login`. `lim login` belongs only on human-facing quickstart content.
- Do not pitch default behavior as a feature.
- Do not document unobservable server internals without a source.

## Checklist before committing

- Every factual claim traces to source or hands-on observation; anything unverified is removed or flagged.
- `grep -nE '—|–' page.mdx` returns nothing.
- `grep -niE 'powerful|comprehensive|leverage|enables you to|allows you to|seamless|robust|easily' page.mdx` returns nothing.
- Internal links resolve: `grep -oE '\(/[^)]+\)' page.mdx` and check targets.
- Frontmatter title and description match the page content and do not duplicate the first paragraph (the description renders as a visible subtitle).

## Agent-readiness surfaces

The site serves machine-readable surfaces beyond the pages. When touching them, keep every spot consistent:

- `AGENTS.md` (repo root) is served publicly at `/AGENTS.md`. It is a consumption guide for visiting agents, not a contributor document. Never put internal names, project narrative, or credentials in it.
- `public/robots.txt` is static and owned by this repo (it disables the framework-generated robots.txt). It carries the Content-Signal line and the Sitemap URL; keep the Allow list in sync when agent routes change (`npx docs robots generate --check` compares).
- `public/.well-known/agent-skills/` mirrors SKILL.md files from the public limrun-inc/skills repo. Refresh with `pnpm refresh-agent-skills` and commit the outputs; do not edit the mirrored files by hand.
- `public/.well-known/mcp/server-card.json` must stay in lockstep with the `mcp` block in `docs.config.tsx` (name, version) and with the live server's actual capabilities.
