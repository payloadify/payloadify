export interface WalkthroughStep {
  id: string;
  title: string;
  body: string;
  /** DOM id (see JwtGeneratorTool's `jwt-gen-section-*` wrappers) to scroll to and highlight.
   *  null for steps that aren't about one specific section. */
  targetId: string | null;
}

/** Beginner-friendly, plain-language walkthrough for people who aren't familiar with JWTs —
 *  written for the case where the user has security/pentest background but has never had to
 *  build a token by hand before. */
export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "intro",
    title: "What is a JWT?",
    body: "A JWT (JSON Web Token) is a small signed piece of text used to prove who someone is — commonly used for logging into websites and APIs. It has three parts separated by dots: a Header (says how it's signed), a Payload (the actual data, like a user ID or expiry time), and a Signature (proves it wasn't tampered with). This tool builds and signs one for you, step by step.",
    targetId: null,
  },
  {
    id: "algorithm",
    title: "1. Choose how it's signed",
    body: "Pick a signing algorithm. HMAC (HS256/384/512) uses one shared secret — the simplest option. RSA, ECDSA, and RSA-PSS use a public+private keypair, which is common in real-world APIs. “none” creates an unsigned token — only useful for testing whether a system wrongly accepts unsigned tokens.",
    targetId: "algorithm",
  },
  {
    id: "keys",
    title: "2. Set your secret or keys",
    body: "For HMAC, type a secret or click “Generate random secret” for a strong one. For RSA/ECDSA/RSA-PSS, generate a fresh keypair right in your browser, or paste an existing one. Nothing you enter here ever leaves your browser.",
    targetId: "keys",
  },
  {
    id: "editors",
    title: "3. Edit the header & payload",
    body: "These two boxes hold the token's raw data as JSON. The Header describes the algorithm; the Payload holds your claims (data). You can type directly here, or use the shortcuts below instead of hand-writing JSON.",
    targetId: "editors",
  },
  {
    id: "claims",
    title: "4. Quick-add common fields",
    body: "Claims are just fields inside the payload. Common ones: sub (who the token is about), exp (when it expires), iat (when it was issued). These buttons fill them in correctly for you, so you don't need to remember the JSON format or timestamp math.",
    targetId: "claims",
  },
  {
    id: "flags",
    title: "5. Automatic warnings",
    body: "This area shows plain-language warnings if something looks risky — like a missing expiry, a weak secret, or an unsigned token. It stays empty when nothing looks wrong.",
    targetId: "flags",
  },
  {
    id: "output",
    title: "6. Your signed token",
    body: "This is the final result. Copy the whole token, or just one part (header, payload, or signature) using the Copy buttons.",
    targetId: "output",
  },
  {
    id: "presets",
    title: "Tip: Scenario presets",
    body: "Not sure where to start? Pick a ready-made example from “Scenario presets” near the top — it fills in the algorithm, header, and payload for you, fully editable afterward.",
    targetId: "presets",
  },
  {
    id: "done",
    title: "You're ready",
    body: "That's the whole flow: pick an algorithm → set a secret or keys → edit or quick-add claims → copy your token. You can restart this walkthrough anytime with the “Walkthrough” button near the top.",
    targetId: null,
  },
];
