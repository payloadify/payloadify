/**
 * Description + impact drafts that seed the "Vulnerability Description" / "Impact" editable
 * fields in the CVSS calculator — never locked boilerplate, just a starting point the user
 * tailors to their specific finding. Keep wording non-definitive ("may allow...") so an
 * un-tailored draft is never actively misleading if pasted straight into a report.
 *
 * Two layers, matching the same granularity as the CVSS scoring templates (templates.ts):
 *  - TEMPLATE_DESCRIPTION_IMPACT: one entry per CvssTemplate.id — tailored to that specific
 *    scenario (e.g. Stored vs. Reflected vs. DOM XSS each read differently).
 *  - VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT: one generic entry per VulnType.id, used before a
 *    template is selected, or for a vuln type with no templates defined.
 * getDescriptionImpactDraft() resolves both in the right order — use that rather than reading
 * either record directly.
 */
export interface VulnDescriptionImpact {
  description: string;
  impact: string;
}

/** Vuln-type-level fallback — shown when a vuln type is selected but no specific template
 *  (scenario) has been picked yet. Deliberately generic; the template-level drafts below are
 *  what most users will actually end up using. */
export const VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT: Record<string, VulnDescriptionImpact> = {
  xss: {
    description:
      "The application accepts attacker-supplied input and includes it in a page response without sufficient output encoding or sanitization, allowing arbitrary HTML/JavaScript to execute in the context of another user's browser session.",
    impact:
      "May allow an attacker to execute arbitrary JavaScript in a victim's browser, potentially enabling session hijacking, credential theft, or unauthorized actions performed on the victim's behalf.",
  },
  sqli: {
    description:
      "User-supplied input is concatenated into a SQL query without proper parameterization or sanitization, allowing an attacker to alter the query's logic or structure.",
    impact:
      "May allow an attacker to read, modify, or delete data in the backend database beyond their authorized scope, or bypass authentication, depending on the affected query.",
  },
  xxe: {
    description:
      "The application parses attacker-supplied XML input using a parser configured to resolve external entities, allowing external entity references to be processed.",
    impact:
      "May allow an attacker to read files on the server, trigger server-side request forgery, or in some configurations degrade service availability through entity expansion.",
  },
  "command-injection": {
    description:
      "User-supplied input reaches a system shell or command-execution function without sufficient sanitization, allowing additional OS commands to be injected alongside the intended command.",
    impact:
      "May allow an attacker to execute operating system commands with the privileges of the vulnerable application or service, potentially leading to broader host compromise.",
  },
  ssrf: {
    description:
      "The application fetches a URL or resource on the server side using attacker-influenced input, without sufficiently restricting the destination host or protocol.",
    impact:
      "May allow an attacker to make the server issue requests to internal-only systems or cloud metadata services, potentially exposing internal data or credentials not otherwise reachable from outside the network.",
  },
  "insecure-deserialization": {
    description:
      "The application deserializes attacker-supplied data using a format or library capable of instantiating arbitrary objects during deserialization, without sufficient validation of the serialized input.",
    impact:
      "May allow an attacker to influence application logic or, depending on the deserialization library and classes available at runtime, achieve code execution on the server.",
  },
  idor: {
    description:
      "The application exposes a reference to an internal object (e.g. a record ID) and allows a user to access that object by changing the reference, without adequately verifying the requester is authorized for that specific object.",
    impact:
      "May allow an authenticated user to view or modify data belonging to another user or account, beyond their intended access scope.",
  },
  "broken-access-control": {
    description:
      "The application fails to consistently enforce role- or permission-based restrictions on server-side functionality, allowing a user to invoke functionality their assigned role should not permit.",
    impact:
      "May allow a lower-privileged user to reach administrative or otherwise restricted functionality, potentially escalating their effective privileges within the application.",
  },
  "broken-authentication": {
    description:
      "Weaknesses in how the application manages credentials, sessions, or authentication tokens (e.g. predictable session identifiers, missing session invalidation, weak credential-recovery flows) allow those controls to be bypassed or abused.",
    impact:
      "May allow an attacker to impersonate another user or gain unauthorized access to an account without knowing the legitimate credentials.",
  },
  csrf: {
    description:
      "A state-changing request lacks a mechanism (such as a per-session anti-CSRF token) to verify that the request was intentionally submitted by the authenticated user, rather than triggered by another site the victim's browser visited.",
    impact:
      "May allow an attacker to trick an authenticated victim's browser into performing an unwanted state-changing action without the victim's knowledge or consent.",
  },
  "vulnerable-components": {
    description:
      "The application runs a third-party library, framework, plugin, or other dependency with a publicly disclosed vulnerability (a known CVE) that has not been patched or upgraded, exposing the flaw that library already has rather than a bug in the application's own code.",
    impact:
      "May allow an attacker to exploit the dependency's already-documented vulnerability, using public write-ups or exploit code, with an impact ranging from information disclosure up to full remote code execution depending on the specific CVE.",
  },
  "race-condition": {
    description:
      "Two or more requests that should be handled sequentially are instead processed concurrently, and the application fails to synchronize the shared state (e.g. a balance, a redemption counter, a one-time-use flag) they depend on, leaving a window where a check and the action that relies on it can be interleaved with another request.",
    impact:
      "May allow an attacker to bypass a limit, quota, or one-time-use control, or read/write shared state inconsistently, by firing requests in parallel, undermining the integrity of the affected business logic or data.",
  },
  "sensitive-data-exposure": {
    description:
      "Sensitive data (such as credentials, tokens, or personal information) is transmitted, stored, or logged without adequate protection: for example missing encryption, an overly broad API response, or insecure local storage.",
    impact:
      "May allow an attacker with access to the exposure point (network traffic, storage, logs, or device) to obtain sensitive data belonging to users or the application.",
  },
  "security-misconfiguration": {
    description:
      "A component of the application, server, or platform is deployed with insecure default settings, unnecessary features enabled, or missing hardening (e.g. debug mode, default credentials, verbose error messages) that a properly configured deployment would not expose.",
    impact:
      "May allow an attacker to gain additional information about the environment or, depending on the specific misconfiguration, reach administrative functionality on the affected component.",
  },
  "open-redirect": {
    description:
      "The application redirects users to a URL derived from user-controllable input without validating that the destination is an expected/allow-listed location.",
    impact:
      "May allow an attacker to craft a link that appears to originate from the trusted application but ultimately redirects the victim elsewhere, commonly used to increase the credibility of a phishing attempt.",
  },
  "path-traversal": {
    description:
      "User-supplied input is used to construct a file-system path without sufficiently restricting directory-traversal sequences (e.g. ../), allowing access outside the intended directory.",
    impact:
      "May allow an attacker to read, and in some cases write, files outside the application's intended directory, potentially exposing configuration data or source code on the host.",
  },
  "parameter-tampering": {
    description:
      "The application trusts a client-controllable parameter (e.g. a price, quantity, or role flag) to make a server-side decision, without sufficiently re-validating that value on the server.",
    impact:
      "May allow an attacker to alter application logic in their favor (such as changing a price, quantity, or permission flag) by submitting a modified parameter value directly.",
  },
};

/** Template-level drafts, keyed by CvssTemplate.id (templates.ts) — one tailored pair per
 *  scenario, not one shared draft per vuln type. Every CVSS_TEMPLATES entry has one. */
export const TEMPLATE_DESCRIPTION_IMPACT: Record<string, VulnDescriptionImpact> = {
  // ---- xss ----
  "xss-reflected-web": {
    description:
      "A crafted link reflects attacker-controlled input directly into the page response without sufficient output encoding, executing arbitrary JavaScript in the victim's browser as soon as they click the link. Because the payload lives entirely in the URL, it requires a victim to visit or click a malicious link and leaves no persistent trace on the server.",
    impact:
      "May allow an attacker to steal the victim's session cookie (particularly damaging when it lacks the HttpOnly flag) or otherwise act in the victim's authenticated context, enabling session hijacking.",
  },
  "xss-stored-web": {
    description:
      "A payload submitted through an ordinary application feature (e.g. a comment, profile field, or support ticket) is stored server-side and rendered back to every subsequent visitor without sufficient output encoding, executing automatically for anyone (including administrators) who later views the affected page.",
    impact:
      "May allow an attacker to compromise the session or account of any user who views the infected content, including higher-privileged users such as administrators, without needing to trick any individual victim into clicking a link.",
  },
  "xss-dom-web": {
    description:
      "Attacker-controlled data (e.g. a URL fragment or query parameter) flows into a dangerous client-side sink such as innerHTML or document.write entirely within the browser's JavaScript, without the payload ever being sent to or processed by the server.",
    impact:
      "May allow an attacker to execute arbitrary JavaScript in the victim's browser purely client-side; because the payload never reaches the server, server-side logging, WAFs, and input filters may not detect or block it.",
  },
  "xss-api-json-reflected": {
    description:
      "An API endpoint reflects an unsanitized field (e.g. an error message or echoed parameter) in its JSON response, and a downstream client application renders that value without escaping it, executing the payload in the context of whichever client consumed the response.",
    impact:
      "May allow an attacker to execute arbitrary script in the context of any client application that renders the API's unsanitized response, extending the vulnerability's reach beyond the API itself to every consumer that trusts its output.",
  },
  "xss-mobile-webview": {
    description:
      "A mobile application's WebView component renders attacker-influenced content, and a misconfigured JavaScript bridge exposes native application functionality to that content, allowing injected script to call into the app's native layer.",
    impact:
      "May allow an attacker to invoke privileged native functionality or read device data (contacts, storage, location) that the JavaScript bridge exposes, extending impact well beyond a typical browser-confined XSS.",
  },

  // ---- sqli ----
  "sqli-auth-bypass-web": {
    description:
      "User-supplied input in the web login form is concatenated directly into a SQL query without parameterization, letting a classic tautology payload (e.g. ' OR 1=1--) alter the query's logic and bypass the authentication check entirely.",
    impact: "May allow an attacker to log in as any user, including an administrator, without knowing any valid credentials.",
  },
  "sqli-auth-bypass-api": {
    description:
      "User-supplied input sent directly to an API login endpoint is concatenated into a SQL query without parameterization, letting a classic tautology payload (e.g. ' OR 1=1--) alter the query's logic and bypass the authentication check entirely.",
    impact: "May allow an attacker to log in as any user, including an administrator, without knowing any valid credentials.",
  },
  "sqli-union-data-extraction-web": {
    description:
      "A vulnerable web query parameter allows a UNION SELECT payload to be appended to the intended query, letting an attacker retrieve data from arbitrary tables in the same database.",
    impact:
      "May allow an attacker to dump the entire contents of the backend database, including other users' personal data and stored credentials, well beyond the data the vulnerable feature was meant to expose.",
  },
  "sqli-union-data-extraction-api": {
    description:
      "A vulnerable API query or body parameter allows a UNION SELECT payload to be appended to the intended query, letting an attacker retrieve data from arbitrary tables in the same database.",
    impact:
      "May allow an attacker to dump the entire contents of the backend database, including other users' personal data and stored credentials, well beyond the data the vulnerable endpoint was meant to expose.",
  },
  "sqli-blind-boolean-time-web": {
    description:
      "The web application never returns query output directly; instead, an attacker infers data one bit at a time from true/false response differences or induced response-time delays (e.g. SLEEP()), without ever seeing the underlying data in the response body.",
    impact:
      "May allow an attacker to slowly exfiltrate arbitrary database contents despite no direct output, and heavy time-based queries can additionally degrade database availability for other users.",
  },
  "sqli-blind-boolean-time-api": {
    description:
      "The API never returns query output directly; instead, an attacker infers data one bit at a time from true/false response differences or induced response-time delays (e.g. SLEEP()) in the API's responses, without ever seeing the underlying data in the response body.",
    impact:
      "May allow an attacker to slowly exfiltrate arbitrary database contents despite no direct output, and heavy time-based queries can additionally degrade database availability for other users.",
  },
  "sqli-second-order-web": {
    description:
      "A payload stored innocuously through one web feature (e.g. a display name) is later concatenated unsafely into a different, downstream SQL query (e.g. an internal report) without a second round of input validation, triggering injection only when that downstream query executes.",
    impact:
      "May allow an attacker to inject SQL that surfaces in a separate, often higher-privileged part of the application than where the payload was originally submitted, making the vulnerability harder to catch with input-point-focused testing alone.",
  },
  "sqli-second-order-api": {
    description:
      "A payload stored innocuously via one API endpoint (e.g. a profile field) is later concatenated unsafely into a different, downstream query triggered by another endpoint (e.g. an export/report API) without a second round of input validation, triggering injection only when that downstream query executes.",
    impact:
      "May allow an attacker to inject SQL that surfaces in a separate, often higher-privileged endpoint than the one they submitted the payload to, making the vulnerability harder to catch with input-point-focused testing alone.",
  },
  "sqli-api-unsafe-consumption": {
    description:
      "The API enriches user-supplied data by querying a third-party service and stores that service's response directly in a local SQL-backed database without sanitization; an attacker plants a SQL injection payload in data they control on the third-party service, then triggers the victim API to retrieve and store it, so it executes once consumed.",
    impact:
      "May allow an attacker to compromise the victim API's local database purely by controlling data on a trusted third-party service, without ever directly submitting a payload to the vulnerable application, bypassing input validation aimed only at direct user input.",
  },

  // ---- idor ----
  "idor-web-account-takeover": {
    description:
      "Changing a user_id (or similarly predictable/sequential) parameter lets an authenticated attacker view and modify another user's account details, including fields that enable a full account takeover such as the registered email or password.",
    impact: "May allow an authenticated attacker to take over another user's account by altering their recovery email or password through the exposed object reference.",
  },
  "idor-api-object-access": {
    description:
      "An authenticated API request for a sequential or otherwise guessable object identifier (e.g. /api/orders/{id}) returns another user's private data, without verifying that the requester is authorized to access that specific object.",
    impact: "May allow an authenticated user to read another user's private data by iterating or guessing object identifiers, at a scale limited only by how quickly the IDs can be enumerated.",
  },
  "idor-mobile-api-unauthenticated": {
    description:
      "The API backing a mobile application never validates that the caller owns the requested object ID and, in this scenario, requires no authentication token at all; any caller, not just other authenticated users, can request arbitrary objects directly.",
    impact: "May allow a completely unauthenticated attacker to read or manipulate any user's data at scale, since no session or authorization check gates the vulnerable endpoint.",
  },

  // ---- broken-access-control ----
  "bac-vertical-privesc-admin-panel-web": {
    description:
      "A missing server-side role or permission check lets any authenticated user invoke administrator-only endpoints directly by requesting them, regardless of what the interface exposes to that user's role.",
    impact: "May allow a low-privileged user to gain full administrative capability over the application by directly requesting restricted functionality that the interface merely hides rather than the server enforcing.",
  },
  "bac-vertical-privesc-admin-panel-api": {
    description:
      "A missing server-side role or permission check lets any authenticated user invoke administrator-only API endpoints directly, regardless of what the official client exposes to that user's role, a function-level authorization gap matching API5:2023 exactly.",
    impact: "May allow a low-privileged user to gain full administrative capability over the application by directly calling restricted endpoints that the official client simply never surfaces to them.",
  },
  "bac-horizontal-privesc-web": {
    description:
      "An authenticated user can perform write actions (not merely view) on another same-tier user's data or settings, because the server checks that the requester is authenticated but not that they own the specific resource being modified.",
    impact: "May allow an attacker to modify another user's data or account settings without their consent, going beyond a read-only information disclosure into unauthorized state changes.",
  },
  "bac-horizontal-privesc-api": {
    description:
      "An authenticated API caller can perform write actions on another peer user's object, not just read it, an object-level authorization gap (BOLA) that is triggered by a write rather than a read.",
    impact: "May allow an attacker to modify another user's data through the API without their consent, going beyond a read-only object-level disclosure into unauthorized state changes.",
  },
  "bac-forced-browsing-unauth-endpoint-web": {
    description:
      "An unlinked but guessable or discoverable web endpoint (e.g. /admin/export) performs no authentication check at all, returning sensitive data to any visitor who requests it directly, whether or not they are logged in.",
    impact: "May allow a completely unauthenticated attacker to retrieve sensitive data simply by requesting a URL that was never intended to be publicly reachable.",
  },
  "bac-forced-browsing-unauth-endpoint-api": {
    description:
      "An undocumented but guessable or discoverable API endpoint (e.g. /api/admin/export) performs no authentication check at all, returning sensitive data to any caller, a missing function-level permission check, per API5:2023.",
    impact: "May allow a completely unauthenticated attacker to retrieve sensitive data simply by calling an endpoint that was never meant to be reachable without authentication.",
  },

  // ---- ssrf ----
  "ssrf-cloud-metadata-credential-theft-web": {
    description:
      "A URL-fetching feature (e.g. an import-from-URL or webhook feature) is abused to make the server issue a request to the cloud provider's internal instance metadata service (e.g. 169.254.169.254), a destination the feature was never intended to reach.",
    impact: "May allow an attacker to steal the instance's IAM credentials from the metadata endpoint, granting access to cloud resources and services well beyond the vulnerable application itself.",
  },
  "ssrf-cloud-metadata-credential-theft-api": {
    description:
      "An API's URL-fetching parameter (e.g. a webhook or import-from-URL feature) is abused to make the server issue a request to the cloud provider's internal instance metadata service, a destination the parameter was never intended to reach, matching API7:2023 exactly.",
    impact: "May allow an attacker to steal the instance's IAM credentials from the metadata endpoint, granting access to cloud resources and services well beyond the vulnerable API itself.",
  },
  "ssrf-internal-port-scan-web": {
    description:
      "The same URL-fetching feature is repurposed to send requests to internal-only hosts and ports not otherwise reachable from the internet, mapping out services the application server can reach on the internal network.",
    impact: "May allow an attacker to enumerate and reach internal-only services and admin interfaces that have no direct external exposure, using the vulnerable server as a pivot point.",
  },
  "ssrf-internal-port-scan-api": {
    description:
      "An API's URL-fetching parameter is repurposed to send requests to internal-only hosts and ports not otherwise reachable from the internet, mapping out services the API server can reach on the internal network.",
    impact: "May allow an attacker to enumerate and reach internal-only services and admin interfaces that have no direct external exposure, using the vulnerable API server as a pivot point.",
  },
  "ssrf-blind-oob-web": {
    description:
      "No response is returned to the attacker directly; the forged request is only confirmed via an out-of-band DNS or HTTP interaction (e.g. a Burp Collaborator callback), so the attacker cannot read the response but can still confirm and time the request.",
    impact: "May allow an attacker to confirm SSRF and, depending on the destination reached, pivot to further internal reconnaissance or exfiltrate small amounts of data via the out-of-band channel, even without seeing the response body directly.",
  },
  "ssrf-blind-oob-api": {
    description:
      "No response is returned to the attacker directly; the forged request from a vulnerable API parameter is only confirmed via an out-of-band DNS or HTTP interaction, so the attacker cannot read the response but can still confirm and time the request.",
    impact: "May allow an attacker to confirm SSRF and, depending on the destination reached, pivot to further internal reconnaissance or exfiltrate small amounts of data via the out-of-band channel, even without seeing the response body directly.",
  },

  // ---- csrf ----
  "csrf-state-changing-action": {
    description:
      "A state-changing endpoint (e.g. change email) lacks a per-session anti-CSRF token or equivalent origin check, so a malicious third-party page can auto-submit a forged request that rides on the victim's already-authenticated session.",
    impact: "May allow an attacker to trick a logged-in victim's browser into performing an unwanted state-changing action, such as changing account settings, without the victim's knowledge or consent.",
  },
  "csrf-account-takeover": {
    description:
      "The same missing anti-CSRF protection on the password-change or email-linking flow is chained across multiple steps to achieve a full account takeover, rather than triggering just one isolated unwanted action.",
    impact: "May allow an attacker to achieve complete account takeover (not just a single forged action) by chaining CSRF against the account-recovery or credential-change flow.",
  },

  // ---- race-condition ----
  "race-limit-bypass-web": {
    description:
      "A single-use discount/promo code's redemption count is checked and then incremented as two separate steps of the checkout flow, rather than atomically. Submitting many checkout requests for the same code at once wins the race and lets several of them read the same pre-redemption count before any of them writes the increment back.",
    impact:
      "May allow an attacker to redeem a single-use discount code far more times than intended, causing direct financial loss to the business rather than compromising any individual user's data.",
  },
  "race-limit-bypass-api": {
    description:
      "A single-use discount/promo code's redemption count is checked and then incremented as two separate steps within the same API call, rather than atomically. Firing many concurrent requests at the endpoint wins the race and lets several of them read the same pre-redemption count before any of them writes the increment back.",
    impact:
      "May allow an attacker to redeem a single-use discount code far more times than intended via direct API calls, causing direct financial loss to the business rather than compromising any individual user's data.",
  },
  "race-fund-double-spend-web": {
    description:
      "A withdrawal or fund-transfer feature reads the account balance and then debits it as two separate steps, rather than atomically. An authenticated attacker submits several withdrawal requests through the web UI at once, so more than one of them reads the same starting balance before any of them writes its debit back.",
    impact:
      "May allow an authenticated attacker to withdraw or transfer out more funds than their account actually holds, directly compromising the integrity of financial balance data.",
  },
  "race-fund-double-spend-api": {
    description:
      "A withdrawal or fund-transfer API endpoint reads the account balance and then debits it as two separate steps, rather than atomically. An authenticated attacker fires several requests at the endpoint at once, so more than one of them reads the same starting balance before any of them writes its debit back.",
    impact:
      "May allow an authenticated attacker to withdraw or transfer out more funds than their account actually holds via direct API calls, directly compromising the integrity of financial balance data.",
  },

  // ---- sensitive-data-exposure ----
  "sde-web-sensitive-data-in-url": {
    description:
      "A session token, password-reset code, or API key is passed as a GET query-string parameter rather than in a header, cookie, or POST body, causing it to be recorded in browser history and server access logs and forwarded to third-party resources via the Referer header.",
    impact: "May allow an attacker with access to browser history, server logs, or a third-party site that receives the Referer header to obtain a live session token or credential and use it to impersonate the affected user.",
  },
  "sde-api-excessive-data-exposure": {
    description:
      "An API endpoint returns the entire backing object, including fields like a password hash or government ID that the client UI never displays, relying on the client to filter what it shows rather than the server withholding sensitive fields.",
    impact: "May allow anyone who inspects the raw API response, rather than only the rendered UI, to obtain sensitive fields the application never intended to expose, such as password hashes or personal identifiers.",
  },
  "sde-hardcoded-secrets-desktop-windows": {
    description:
      "A locally-installed Windows application embeds API keys or credentials directly in its binary or configuration file, recoverable through basic reverse engineering (e.g. a strings scan) rather than any runtime exploitation.",
    impact: "May allow anyone with a copy of the installed application to extract credentials granting access to a separate backend service, independent of any vulnerability in that backend itself.",
  },
  "sde-unencrypted-storage-mobile": {
    description:
      "The mobile app stores authentication tokens or personal data in plaintext in local or shared device storage instead of an OS-provided secure storage mechanism (e.g. Keystore/Keychain).",
    impact: "May allow anyone with physical or forensic access to the device (including via a lost or stolen device, or another app on a rooted/jailbroken device) to recover tokens or personal data without needing to exploit the app itself.",
  },
  "sde-config-file-secrets-desktop-linux": {
    description:
      "A configuration file containing plaintext credentials or API keys is left world-readable on a Linux host, rather than restricted to the service account that needs it.",
    impact: "May allow any local low-privileged account on the same host to read the plaintext secrets and use them to access whatever service or API they authenticate to.",
  },
  "sde-plaintext-storage-desktop-mac": {
    description:
      "A macOS application stores authentication tokens or credentials in a plaintext property-list (plist) preferences file instead of the system Keychain, which would encrypt and access-control the same data.",
    impact: "May allow any local process or user with file-system access to the affected account to recover the plaintext credentials without needing to compromise the application itself.",
  },

  // ---- open-redirect ----
  "or-login-redirect-phishing": {
    description:
      "An unvalidated redirect parameter on the login/logout flow lets an attacker craft a trusted-looking link that ultimately lands the victim on a phishing page after passing through the legitimate application's domain.",
    impact: "May allow an attacker to increase the credibility of a phishing link by having it originate from the trusted application's own domain before redirecting the victim elsewhere.",
  },
  "or-oauth-redirect-hijack": {
    description:
      "A permissive redirect_uri validation lets an attacker redirect the OAuth authorization code or token to an attacker-controlled endpoint instead of the legitimate application, diverting the credential mid-flow.",
    impact: "May allow an attacker to capture a victim's OAuth authorization code or token and use it to complete the login flow themselves, resulting in account takeover.",
  },

  // ---- security-misconfiguration ----
  "sm-debug-mode-enabled-web": {
    description:
      "A framework's debug mode (e.g. Django DEBUG=True) is left enabled in production, so unhandled errors return full stack traces, source code snippets, and configuration values instead of a generic error page.",
    impact: "May allow an attacker to harvest internal file paths, library versions, and configuration secrets from error output, directly aiding further, more targeted attacks.",
  },
  "sm-debug-mode-enabled-api": {
    description:
      "A framework's debug mode is left enabled on a production API host, so unhandled errors return full stack traces, source code snippets, and configuration values in the API response instead of a generic error.",
    impact: "May allow an attacker to harvest internal file paths, library versions, and configuration secrets from API error responses, directly aiding further, more targeted attacks.",
  },
  "sm-default-credentials-web": {
    description: "An exposed administrative panel still uses its default, vendor-supplied credentials, which were never changed after deployment.",
    impact: "May allow anyone who knows or looks up the default credentials for that product to log in with full administrative control, with no exploitation skill required.",
  },
  "sm-default-credentials-api": {
    description: "An exposed API management or admin interface still uses its default, vendor-supplied credentials, which were never changed after deployment.",
    impact: "May allow anyone who knows or looks up the default credentials for that product to gain full administrative control over the API management interface, with no exploitation skill required.",
  },
  "sm-default-credentials-desktop-linux": {
    description: "A locally-installed Linux service or agent still uses its default, vendor-supplied credentials on a local management interface, which were never changed after installation.",
    impact: "May allow any local low-privileged account that can reach the management interface to gain full control over the service using publicly documented default credentials.",
  },
  "sm-unauthenticated-local-service-desktop-windows": {
    description:
      "A locally-installed Windows agent or service exposes a management or debug interface (e.g. a loopback TCP port) with no authentication mechanism of its own, trusting that only legitimate processes will connect to it.",
    impact: "May allow any local low-privileged account able to run a process on the same machine to issue privileged commands to the service, potentially escalating to the service's own privilege level.",
  },
  "sm-verbose-error-disclosure-web": {
    description: "Unhandled application errors return verbose stack traces or raw database error text instead of a generic message, disclosing internal file paths, library versions, or query structure.",
    impact: "May give an attacker information (internal paths, versions, query logic) that meaningfully narrows down and assists a follow-up, more damaging attack, even though the disclosure itself is only informational.",
  },
  "sm-verbose-error-disclosure-api": {
    description: "Unhandled API errors return verbose stack traces or raw database error text instead of a generic message, disclosing internal file paths, library versions, or query structure.",
    impact: "May give an attacker information (internal paths, versions, query logic) that meaningfully narrows down and assists a follow-up, more damaging attack, even though the disclosure itself is only informational.",
  },

  // ---- vulnerable-components ----
  "vc-web-known-cve-rce": {
    description:
      "The web application runs an outdated version of a third-party framework or library that has a publicly disclosed CVE with a documented, working exploit, giving an attacker a pre-built attack path that requires no first-party bug discovery at all.",
    impact:
      "May allow an attacker to achieve full remote code execution on the host running the vulnerable library, using an existing public exploit for the disclosed CVE.",
  },
  "vc-api-known-cve-rce": {
    description:
      "A backend API or microservice runs an outdated version of a third-party library that has a publicly disclosed CVE with a documented, working exploit, giving an attacker a pre-built attack path that requires no first-party bug discovery at all.",
    impact:
      "May allow an attacker to achieve full remote code execution on the vulnerable service, using an existing public exploit for the disclosed CVE.",
  },
  "vc-web-outdated-client-library": {
    description:
      "The page loads an outdated build of a client-side JavaScript library that has its own publicly disclosed CVE (typically XSS or prototype pollution), so the vulnerability lives in the third-party code the page trusts rather than in the site's first-party logic.",
    impact:
      "May allow an attacker to trigger the library's own known flaw against any visitor loading the affected page, without needing to find a first-party injection point.",
  },
  "vc-desktop-bundled-dependency": {
    description:
      "The desktop application ships and loads an outdated, vulnerable version of a bundled third-party library or framework with a publicly known CVE, rather than a bug in the application's own code.",
    impact:
      "May allow a local low-privileged process, or a malicious file the application opens, to trigger the bundled library's known flaw and execute code in the application's context.",
  },

  // ---- insecure-deserialization ----
  "id-java-gadget-chain-rce": {
    description:
      "Untrusted data reaches Java's native deserialization mechanism while a vulnerable library capable of forming a gadget chain (e.g. an outdated Commons Collections version) is present on the classpath, allowing a crafted serialized object to trigger arbitrary code execution during deserialization.",
    impact: "May allow an attacker to achieve full remote code execution on the host simply by having the application deserialize an attacker-supplied object, without needing any other vulnerability.",
  },
  "id-php-object-injection": {
    description:
      "User-controlled input reaches PHP's unserialize() function, allowing an attacker to instantiate arbitrary objects and drive a property-oriented-programming chain through the application's existing classes.",
    impact: "May allow an attacker to escalate object injection into a more concrete outcome such as arbitrary file write or a secondary SQL injection, depending on which exploitable classes exist in the application's codebase.",
  },

  // ---- xxe ----
  "xxe-file-disclosure-web": {
    description:
      "A web app's XML parser resolves external entities by default, letting an attacker define a custom entity that reads an arbitrary local file (e.g. /etc/passwd or an application config containing secrets) back into the parsed response.",
    impact: "May allow an attacker to read arbitrary files accessible to the application process, including configuration files that themselves contain further credentials or secrets.",
  },
  "xxe-file-disclosure-api": {
    description:
      "An API endpoint accepting XML (e.g. a SOAP call or XML file upload) resolves external entities by default, letting an attacker define a custom entity that reads an arbitrary local file back into the parsed response.",
    impact: "May allow an attacker to read arbitrary files accessible to the API process, including configuration files that themselves contain further credentials or secrets.",
  },
  "xxe-blind-oob-web": {
    description:
      "No file contents are returned directly in the response; instead, an attacker exfiltrates data via a malicious external DTD that triggers an out-of-band HTTP or DNS request, a channel that can also reach internal-only network endpoints.",
    impact: "May allow an attacker to exfiltrate file contents indirectly via out-of-band requests and, because the parser itself makes an outbound connection, to probe or reach internal network resources not otherwise exposed externally.",
  },
  "xxe-blind-oob-api": {
    description:
      "No file contents are returned directly by the API; instead, an attacker exfiltrates data via a malicious external DTD that triggers an out-of-band HTTP or DNS request, a channel that can also reach internal-only network endpoints.",
    impact: "May allow an attacker to exfiltrate file contents indirectly via out-of-band requests and, because the parser itself makes an outbound connection, to probe or reach internal network resources not otherwise exposed externally.",
  },

  // ---- path-traversal ----
  "pt-web-lfi-read": {
    description: "A file-loading parameter accepts directory-traversal sequences (e.g. ../../../../etc/passwd) without sanitization, letting a request read any file the web server process has permission to access.",
    impact: "May allow an attacker to read arbitrary files outside the application's intended directory, potentially exposing source code, configuration files, or credentials stored on the host.",
  },
  "pt-api-file-download-traversal": {
    description: "An API's file-download endpoint does not sanitize the requested filename parameter, permitting retrieval of files outside the intended directory via traversal sequences.",
    impact: "May allow an attacker to retrieve arbitrary files the API process can access, beyond the specific files the endpoint was designed to serve.",
  },
  "pt-desktop-windows-plugin-load": {
    description: "A desktop application's file-load or plugin feature is vulnerable to path traversal; opening a maliciously crafted project or plugin file lets it read arbitrary files the application's process can access.",
    impact: "May allow an attacker who convinces a victim to open a malicious file to read arbitrary local files accessible to the vulnerable desktop application.",
  },
  "pt-desktop-mac-file-import-traversal": {
    description: "A desktop application's file-import feature is vulnerable to path traversal; opening a malicious bundle or project file lets it read arbitrary files the application's sandboxed process can access.",
    impact: "May allow an attacker who convinces a victim to open a malicious file to read arbitrary local files accessible within the application's sandbox, which may still include sensitive user data.",
  },
  "pt-desktop-linux-log-viewer": {
    description: "A locally-installed application's log-viewer feature accepts a file path parameter without sanitizing directory-traversal sequences, letting a local user request files outside the intended log directory.",
    impact: "May allow a local low-privileged user to read arbitrary files accessible to the application's process, beyond the log files the feature was intended to expose.",
  },

  // ---- broken-authentication ----
  "ba-weak-password-reset-web": {
    description:
      "The password-reset token is predictable, does not expire, or is leaked via the Referer header when the reset page links out to third-party resources, undermining the flow's intended one-time, time-limited guarantee.",
    impact: "May allow an attacker to guess, intercept, or reuse a password-reset token to take over any account without needing the victim's original credentials.",
  },
  "ba-weak-password-reset-api": {
    description: "An API's password-reset token is predictable or non-expiring, letting an attacker take over any account by calling the reset endpoint directly rather than going through the intended reset flow.",
    impact: "May allow an attacker to guess or reuse a password-reset token to take over any account without needing the victim's original credentials.",
  },
  "ba-session-fixation": {
    description:
      "The application does not regenerate the session identifier after a successful login, so a session ID set before authentication remains valid afterward, letting an attacker who fixates a known ID on the victim inherit their authenticated session once they log in.",
    impact: "May allow an attacker to hijack a victim's authenticated session immediately after they log in, without ever needing to observe or steal the resulting session token directly.",
  },
  "ba-missing-mfa-brute-force-web": {
    description: "The web login form has no rate-limiting, account lockout, or MFA requirement, so an attacker can submit unlimited password guesses against it until a weak or reused password succeeds.",
    impact: "May allow an attacker to compromise accounts protected only by a weak or previously breached password, purely through sustained automated guessing.",
  },
  "ba-missing-mfa-brute-force-api": {
    description:
      "The login API endpoint (whether called directly or via a mobile app) has no rate-limiting, lockout, or MFA requirement, so an attacker can submit unlimited password guesses against the backend regardless of which client normally calls it.",
    impact: "May allow an attacker to compromise accounts protected only by a weak password through sustained automated guessing against the backend API, bypassing any throttling the official client UI might otherwise appear to imply.",
  },

  // ---- command-injection ----
  "ci-web-os-command-injection": {
    description:
      "A feature that shells out to the operating system (e.g. a network diagnostic \"ping\" tool) passes user-supplied input to the shell without sanitization, allowing additional OS commands to be appended alongside the intended one.",
    impact: "May allow an attacker to execute arbitrary operating system commands with the privileges of the web server process, potentially leading to full compromise of the host.",
  },
  "ci-api-command-injection": {
    description:
      "A microservice shells out to an external tool (e.g. ffmpeg or ImageMagick) using an unsanitized filename or parameter supplied via the API, allowing additional OS commands to be injected alongside the intended invocation.",
    impact: "May allow an attacker to execute arbitrary operating system commands on the processing host with the privileges of the vulnerable service, potentially leading to full compromise of that host.",
  },
  "ci-desktop-local-privesc": {
    description:
      "A low-privileged local user can trigger command injection in a privileged helper process or service running with elevated rights, because that helper passes attacker-influenced input to the shell without sanitization.",
    impact: "May allow a local low-privileged user to escalate to SYSTEM (Windows) or root (macOS/Linux) privileges by exploiting the injection point in the privileged helper.",
  },

  // ---- parameter-tampering ----
  "param-web-checkout-price-tampering": {
    description:
      "A checkout flow sends the unit price, quantity, or discount amount as a client-editable form field or hidden parameter, and the server accepts that value as-is instead of recalculating it from trusted, server-side product/pricing data.",
    impact: "May allow an attacker (including one with no account at all) to complete a purchase at an arbitrary, attacker-chosen price by editing the client-supplied value before submission.",
  },
  "param-api-mass-assignment-role-field": {
    description:
      "An API endpoint binds the entire JSON request body directly onto an internal object without an explicit allow-list of permitted fields, so an undocumented property such as \"role\": \"admin\" added to the request body is silently accepted and applied.",
    impact: "May allow a low-privileged authenticated user to grant themselves elevated privileges simply by adding an unexpected field to an otherwise-legitimate request, without needing any other vulnerability.",
  },
  "param-mobile-client-side-purchase-validation": {
    description:
      "A mobile app calculates a purchase amount or a premium-feature entitlement flag on the client and sends it to the backend as a trusted value, rather than having the backend independently derive and verify it, including for anonymous, device-linked sessions with no registered account.",
    impact: "May allow an attacker who intercepts and edits the app's own request (e.g. via a proxy) to unlock paid content or pay an arbitrary, attacker-chosen amount.",
  },
  "param-web-hidden-field-workflow-bypass": {
    description:
      "A multi-step web workflow (e.g. an application form, KYC/document review, or approval process) tracks its progress in a hidden form field the client is only meant to flip once a required check passes, and the server accepts that client-supplied value without re-verifying the check server-side.",
    impact: "May allow an attacker to mark a record as \"verified\" or \"approved\" without ever passing the underlying check, corrupting the true state of that workflow for everyone who later relies on it.",
  },
  "param-web-hidden-field-vote-review-integrity": {
    description:
      "A review, rating, survey, or voting feature relies on a client-set hidden field (rather than a server-side per-user/per-session record) to block repeat submissions, so resetting that field before resubmitting bypasses the intended one-submission-per-user limit.",
    impact: "May allow a single user to submit unlimited times, skewing aggregated ratings, poll results, or review data for everyone who later views them.",
  },
};

/** Resolves the description/impact draft for the current selection: a template-specific draft
 *  if a template is selected and has one, else the vuln type's generic fallback, else empty
 *  (no vuln type selected — "Any / Custom"). Always use this instead of reading either record
 *  directly, so template-vs-fallback precedence stays in one place. */
export function getDescriptionImpactDraft(vulnTypeId: string | null, templateId: string | null): VulnDescriptionImpact {
  if (templateId && TEMPLATE_DESCRIPTION_IMPACT[templateId]) return TEMPLATE_DESCRIPTION_IMPACT[templateId];
  if (vulnTypeId && VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT[vulnTypeId]) return VULN_TYPE_FALLBACK_DESCRIPTION_IMPACT[vulnTypeId];
  return { description: "", impact: "" };
}
