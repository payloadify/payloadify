# Security Policy

Payloadify is a free, self-funded project. We don't run a bug bounty program
and don't offer payment or public credit for reports, but we take security
issues on payloadify.com seriously and appreciate responsible disclosure.

## Reporting a Vulnerability

If you find a security issue on **payloadify.com itself** (as opposed to a
tool's generated output being inaccurate — see [CONTRIBUTING.md](CONTRIBUTING.md)
or open a [GitHub issue](https://github.com/payloadify/payloadify-web/issues) for
that instead), please report it privately rather than opening a public issue:

- Email **contact@payloadify.com**, or
- Use GitHub's [private vulnerability reporting](https://github.com/payloadify/payloadify-web/security/advisories/new)

Please include:

- A description of the issue and its potential impact
- Steps to reproduce (or a proof of concept)
- Any affected URL(s) or tool(s)

## What to expect

- We'll acknowledge your report as soon as we can.
- Give us a reasonable chance to fix the issue before disclosing it publicly.
- We don't offer monetary rewards or public credit, but we're genuinely
  grateful for the heads-up.

## Scope

In scope: the payloadify.com site itself (e.g. XSS, auth bypass, data
exposure, dependency vulnerabilities).

Out of scope: the accuracy or behavior of a tool's *generated output*
(e.g. a payload or command a tool produces) — report those as regular bugs
via [GitHub issues](https://github.com/payloadify/payloadify-web/issues).

## Known, accepted limitation — Security Headers Analyzer SSRF guard

The HTTP Security Headers Analyzer (`/security-headers-analyzer`) fetches a
user-supplied URL from a Cloudflare Worker, which is a classic SSRF surface.
The Worker validates the target's resolved IP against a blocklist of
private/loopback/link-local/reserved ranges before fetching, and re-validates
on every redirect hop (manual redirect handling, never auto-follow) — see
`worker/src/ssrf/`.

This closes the common attack paths (a target that directly resolves to a
private IP or the cloud metadata endpoint; a public URL that redirects to an
internal one). It does **not** fully close a theoretical DNS-rebinding
window: the pre-flight DNS lookup and the eventual outbound fetch are two
separate resolutions milliseconds apart, and Cloudflare Workers have no
supported API to pin a `fetch()` to a specific pre-validated IP for an
arbitrary third-party host while preserving normal TLS/SNI behavior (the
`resolveOverride` option only works for hosts inside your own zone). This is
a platform limitation, not an implementation bug, and the residual risk is
narrow (an attacker-controlled DNS record with TTL=0 timed precisely between
our lookup and Cloudflare's own resolution inside `fetch()`) — disclosed here
rather than silently assumed closed.
