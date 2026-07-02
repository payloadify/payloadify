# Payloadify — Project Brief

## What this is
A security/pentest utility tools hub, similar to iLovePDF but for pentesters.
One card per tool family, one tool per page, SEO-first, free to use. Domain: payloadify.dev

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
6. XSS payload generator — an all in one XSS payload generators for pentesters, full specs read below.
7. Reverse Shell Generator — multi-language one-liners (bash, python, PHP, nc, PowerShell)
8. CVSS 3.1/4.0 Calculator — click-through vectors, output vector string. 
(Tools 8-12 — subdomain permutation generator, security headers analyzer, SPF/DKIM/DMARC checker — come later, JWT generator, after v1 validates)

### Tool 6 spec: XSS generator
- Multiple options with mostly used techniques to bypass common WAFs and defenses.
- Multiple levels of XSS payload from basic to advance encoding and evasion. 
- Has many common inputs inside the XSS either alert (1), or document.cookie, or something else - add brief explanation on usage of each inputs.
- Has a field user-input of what to reflect if user chose the custom input.
- Has options of what types of XSS (reflect/stored, or DOM-based)
- Has a button to generate random XSS payload based on level chosen (or user can just uncheck 'maintain level' and XSS randomize from basic level to advance one.)
- All generated payload can be changed in each attribute, if the generated payload using alert, there's a dropdown to change it into prompt or custom input by user.
- Security for users and website must be in mind, the generated payload must not be able to be abused by bots (e.g. automated generation of payloads and the output send to victims without abuser has to access the website). Implement rate limits to prevent multiple generations of payloads.

## Deferred features (intentionally out of scope for now)
- Hash Identifier batch mode (paste a whole file of dumped hashes, one per line, get a results table) — v1 only identifies one hash at a time. Batch support is saved as a future monetization-driving feature once site traffic justifies the extra build effort, not part of initial launch.
- XSS payload batch mode (generate a long list of payloads with different or same levels (user choice)) - v1 only generate one at a time.

## Future ideas (not active build order)
- A dedicated bcrypt tool/page — bcrypt needs a salt + cost-factor input,  which is a different UI shape than the plain "type text, get a hash" Hash Generator. Worth its own page eventually rather than bolting onto Hash Generator. Not scheduled; revisit after the current build order.
- PWA support (manifest + service worker) if analytics show meaningful mobile traffic — do NOT build a native mobile app before this data exists
- Subdomain permutation generator, security headers analyzer,
  SPF/DKIM/DMARC checker (tools 7-9)
- Add JWT generator features that can generate Standard Secret Key (alphanumeric only) and Enhanced Secret Key (With Special Characters), with encryption strength that can be set from 128-512(default to 256).

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