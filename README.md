# Payloadify — Security Toolkit for Pentesters

> Fast. Open-source. No install required.

## What is Payloadify?

Crafting a correct payload or command by hand usually means digging through man pages, `--help` output, or scattered docs first. Payloadify skips that: click through a few options and get a ready-to-use command or payload straight away — think iLovePDF, but for pentesters, bug bounty hunters, OSCP/CEH students, and red teamers who land on a specific tool via search, use it once, and leave.

Live at [payloadify.com](https://payloadify.com).

## Features

Each tool lives at its own URL (e.g. `/jwt-decoder`), never a shared blank-canvas app.

- **JWT Decoder/Tamper & Generator** (`/jwt-decoder`) — decode header/payload, flag `alg:none` and weak signing, edit claims and re-sign. Or generate a JWT key with example templates
- **Hash Identifier** (`/hash-identifier`) — identify a hash's likely type with ranked candidates and matching Hashcat mode numbers
- **Hash Generator** (`/hash-generator`) — generate MD5, SHA-1, SHA-256, SHA-384, SHA-512, and NTLM hashes from text, tab-linked with the Identifier
- **Payload Encoder** (`/payload-encoder`) / **Decoder** (`/payload-decoder`) — chain Base64, Hex, URL, HTML-entity, and Unicode-escape steps to build or unwrap obfuscated payloads
- **Homoglyph Identifier** (`/homoglyph-identifier`) — detect Unicode homoglyph/confusable characters in suspicious text (e.g. spoofed domains)
- **Homoglyph Generator** (`/homoglyph-generator`) — generate homoglyph-substituted lookalike strings
- **XSS Payload Generator** (`/xss-generator`) — build XSS payloads across basic to advanced WAF-bypass and encoding techniques, for reflected/stored or DOM-based contexts
- **SQLi Payload Generator** (`/sqli-generator`) — build SQL injection payloads across MySQL, MSSQL, PostgreSQL, Oracle, and SQLite, with chainable info extraction, WAF-evasion obfuscation, and blacklist-character avoidance
- **Reverse Shell Generator** (`/reverse-shell-generator`) — generate reverse shell one-liners across Bash, Netcat, Python, PHP, Perl, Ruby, Socat, Awk, Telnet, Node.js, Lua, Golang, and PowerShell, with a matching listener command and save-as-file options
- **MSFVenom Command Generator** (`/msfvenom-generator`) — build msfvenom commands with template presets for Windows, Linux, macOS, and Android payloads, evasion encoders, and architectures, with a listener setup guide
- **CVSS 3.1/4.0 Calculator** (`/cvss-calculator`) — click-through vector builder for both CVSS versions, with vulnerability templates, chained-vulnerability scoring, OWASP mapping, and copyable VRT scores and references

## Getting Started

### Online (No Installation)

Visit [payloadify.com](https://payloadify.com) — everything runs in your browser.

### Self-Host (Local)

```bash
git clone https://github.com/yourusername/payloadify.git
cd payloadify
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # static production build (outputs to /out)
npm run lint    # eslint
npm run test    # vitest
```

## How It Works

All tools run **client-side only** — your data never leaves your browser. Paste, generate, copy. That's it. There's no database, no accounts, and no login. A backend is used only where it's genuinely unavoidable (none of the shipped tools currently need one).

## Tech Stack

- Frontend: [Next.js](https://nextjs.org) (static export), React, TypeScript
- Styling: Tailwind CSS
- Hosting: Cloudflare Pages (free tier)
- Testing: Vitest

## Project Structure

```
app/          Route pages — one folder per tool URL (e.g. app/jwt-decoder/)
components/   UI, organized by tool (components/tools/<tool-name>/) and shared/site chrome
lib/          Framework-free core logic per tool (encoding, hashing, generation, validation)
public/       Static assets (favicons, manifest)
scripts/      One-off data build scripts (not part of the app runtime)
```

## Security

- Client-side processing — no server, no data collection
- Open source — audit the code yourself
- No tracking, no analytics, no ads
- Spec-compliant outputs (RFC 7519, msfvenom format, Hashcat mode numbers, etc.)

## Development Notes

This project is built with AI-assisted development (Claude Code). Because correctness is the whole point of a tool like this, generated code and payload/scoring logic are manually reviewed and spot-checked against known-good references before shipping — e.g. CVSS vectors verified against [FIRST.org's calculator](https://www.first.org/cvss/calculator/3.1), and payload/command syntax checked against established sources rather than trusted blindly.

## Credits / Acknowledgements

**JWT Decoder/Tamper & JWT Generator** — all signing, verification, and key
generation (HS256/384/512, RS/PS/ES families) run on the browser's native
[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API);
no third-party crypto library ships in production for these tools.
[`jose`](https://github.com/panva/jose) (MIT License, © Filip Skokan) is used
as a dev/test-only dependency to cross-verify that the Web Crypto
implementation produces spec-correct output — it is not part of the shipped
bundle.

## Contributing

Found a bug? Want to add a tool? See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License — see [LICENSE](LICENSE) for details.

## Built By

Made by a pentester, for pentesters.

Feedback? Open an issue on GitHub.
