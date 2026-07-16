/** DKIM records live at `<selector>._domainkey.<domain>`, and the selector isn't discoverable
 *  from the domain alone (RFC 6376 §3.1). When the user doesn't supply one, fan out over this
 *  list of commonly-used selectors — a match is a strong signal, but a miss is NOT proof of no
 *  DKIM, since plenty of legitimate selectors aren't on any common list. */
export const COMMON_DKIM_SELECTORS = [
  "default",
  "google",
  "selector1",
  "selector2",
  "selector3",
  "k1",
  "k2",
  "k3",
  "mail",
  "dkim",
  "dkim1",
  "smtp",
  "email",
  "s1",
  "s2",
  "mandrill",
  "sendgrid",
  "mailgun",
  "zoho",
  "amazonses",
];
