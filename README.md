# Payloadify - all-in-one pentest tools project

A free, client-side hub of security/pentesting utility tools — think iLovePDF, but for pentesters. Built for pentesters, bug bounty hunters, OSCP/CEH students, and red teamers who land on a specific tool via search, use it once, and leave.

Live at [payloadify.dev](https://payloadify.dev).

## Why client-side

Nearly everything runs entirely in the browser — no data leaves the user's machine. For a security-conscious audience, that's not a nice-to-have, it's the selling point. There's no database, no accounts, and no login. A Cloudflare Worker backend is used only where it's genuinely unavoidable (e.g. DNS lookups).

## Tools

Each tool lives at its own URL (e.g. `/jwt-decoder`), never a shared blank-canvas app.

- **JWT Decoder/Tamper** (`/jwt-decoder`) — decode header/payload, flag `alg:none` and weak signing
- **Hash Identifier** (`/hash-identifier`) — detect hash type and show the matching Hashcat mode number
- **Hash Generator** (`/hash-generator`) — generate hashes, tab-linked with the Identifier
- **Payload Encoder** (`/payload-encoder`) / **Decoder** (`/payload-decoder`) — chainable Base64, Hex, URL, HTML-entity, Unicode escape
- **Homoglyph Identifier** (`/homoglyph-identifier`) / **Generator** (`/homoglyph-generator`)
- **XSS Payload Generator** (`/xss-generator`) — configurable XSS payload builder with evasion/obfuscation options
- **SQLi Payload Generator** (`/sqli-generator`) — configurable SQL injection payload builder with obfuscation and blacklist-aware character filtering

More tools (reverse shell generator, CVSS calculator, subdomain permutation generator, security headers analyzer, SPF/DKIM/DMARC checker) are in progress — see [CLAUDE.md](CLAUDE.md) for the full build order and specs.

## Tech stack

- [Next.js](https://nextjs.org) (static export)
- Tailwind CSS
- Hosted on Cloudflare Pages (free tier)
- Cloudflare Workers only where a backend is unavoidable

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site. Each tool page lives under `app/<tool-name>/`, with shared logic in `lib/` and shared UI in `components/`.

Other scripts:

```bash
npm run build   # static production build
npm run lint    # eslint
npm run test    # vitest
```

## Project docs

[CLAUDE.md](CLAUDE.md) is the source of truth for project scope, build order, and detailed specs for each tool.
