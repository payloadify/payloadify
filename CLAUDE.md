# Payloadify — Project Brief

## What this is
A security/pentest utility tools hub, similar to iLovePDF but for pentesters.
One tool per page, SEO-first, free to use. Domain: payloadify.dev

## Target audience
Pentesters, bug bounty hunters, OSCP/CEH students, red teamers.
They arrive via Google search for a specific task, use the tool once, leave.

## Tech stack
- Frontend: Next.js (static export) or plain Vue/React SPA
- Hosting: Cloudflare Pages (free tier)
- Backend (only when unavoidable, e.g. DNS lookups): Cloudflare Workers
- No database, no user accounts, no login for v1
- Keep everything client-side (runs in browser) wherever possible —
  this is a real selling point for a security-conscious audience

## Build order (v1 — build in this order, one at a time)
1. JWT Decoder/Tamper — decode header/payload, flag alg:none and weak signing
2. Hash Identifier — detect hash type + show matching Hashcat mode number
3. Hash Generator — same layout as Identifier, connected via tabs (see below)
4. Payload Encoder/Decoder — chainable Base64, Hex, URL, HTML-entity, Unicode escape
5. Homoglyph Identifier/Generator — see spec below
6. CVSS 3.1/4.0 Calculator — click-through vectors, output vector string. Reverse Shell Generator — multi-language one-liners (bash, python, PHP, nc, PowerShell)

(Tools 8-11 — subdomain permutation generator, security headers analyzer, SPF/DKIM/DMARC checker — come later, after v1 validates)

### Tool 6 spec: Homoglyph Identifier/Generator
Two linked modes on one tool page (tabs, same pattern as Hash Identifier/Generator):

**Identify mode:**
- Live input field — as the user types/pastes text (e.g. a suspicious domain 
  name), flag any characters that are homoglyphs/confusables (visually 
  identical or near-identical characters from different Unicode scripts, 
  e.g. Cyrillic "а" U+0430 vs Latin "a" U+0061)
- Highlight flagged characters inline within the text, and show each one's 
  actual Unicode code point, script/language origin, and what Latin 
  character it's impersonating
- Use the Unicode Consortium's official confusables.txt data as the 
  detection source (do not hand-build this mapping — it's large, 
  well-maintained, and exactly the kind of "don't reinvent a security-
  relevant dataset" case)

**Generate mode:**
- Input a string, output a homoglyph-substituted version
- Randomize button — automatically swaps eligible characters with a random 
  valid homoglyph each click
- Custom character selection — let the user pick which specific 
  character(s) in their input to substitute, and choose which homoglyph 
  variant to use for each (some characters have multiple lookalike options 
  across different scripts)
- Show both the original and generated string side by side, plus the 
  underlying Unicode code points for each substituted character

Keep everything client-side — the confusables data can be bundled as a 
static JSON file, no server/API needed.

## Deferred features (intentionally out of scope for now)
- Hash Identifier batch mode (paste a whole file of dumped hashes, one per line, get a results table) — v1 only identifies one hash at a time. Batch support is saved as a future monetization-driving feature once site traffic justifies the extra build effort, not part of initial launch.

## Future ideas (not active build order)
- A dedicated bcrypt tool/page — bcrypt needs a salt + cost-factor input,  which is a different UI shape than the plain "type text, get a hash" Hash Generator. Worth its own page eventually rather than bolting onto Hash Generator. Not scheduled; revisit after the current build order.
- PWA support (manifest + service worker) if analytics show meaningful mobile traffic — do NOT build a native mobile app before this data exists
- Subdomain permutation generator, security headers analyzer,
  SPF/DKIM/DMARC checker (tools 7-9)

## Design/UX principles
- One URL per tool (e.g. /jwt-decoder), never a single blank-canvas app
- Fast load, minimal JS, no unnecessary dependencies
- Clean, modern UI — this is competing against dated tools like jwt.io
- Every tool page needs a unique <title> and meta description matching
  how people actually search (e.g. "jwt decoder online")

## Important constraints
- I (the project owner) have a pentesting/security background but am NOT an experienced coder. Explain what you're building in plain terms as you go.
- Since our audience is security-literate, correctness matters a lot —
  flag any assumptions or edge cases you're unsure about rather than
  guessing silently.
- Budget is near-$0. Avoid suggesting paid services/dependencies unless
  there's no free alternative.

## Scope discipline
Do not add features, fields, or behaviors beyond what's explicitly requested. 
If you think an enhancement would help, describe it and ask before building it — don't build it silently as part of an unrelated task.