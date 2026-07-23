import { NMAP_TEMPLATES_BY_ID } from "./templates";
import { NmapSelection } from "./params";
import { detectTargetKind, splitTargetList } from "./generate";

export interface NmapValidation {
  ok: boolean;
  message?: string;
}

/** Checks only what's required to assemble a syntactically sound, non-contradictory command —
 *  it doesn't try to validate that an IP/hostname/CIDR is well-formed beyond non-empty, since
 *  this tool never touches the network and can't know what's actually reachable. */
export function validateSelection(sel: NmapSelection): NmapValidation {
  const targetError = validateTarget(sel);
  if (targetError) return targetError;

  if (sel.mode === "template") {
    if (!NMAP_TEMPLATES_BY_ID[sel.templateId ?? ""]) {
      return { ok: false, message: "Pick a scenario template." };
    }
    return validateSharedFields(sel);
  }

  if (sel.scanType === "sI" && sel.zombieHost.trim().length === 0) {
    return { ok: false, message: "Enter a zombie host for the idle/zombie scan (-sI)." };
  }

  const portsDontApply = sel.scanType === "sn" || sel.scanType === "sL";
  if (portsDontApply && sel.portSpec.mode !== "default") {
    return {
      ok: false,
      message: "Port options don't apply to this scan type — reset port spec to Default or choose a different scan type.",
    };
  }

  if (sel.dns.alwaysResolve && sel.dns.neverResolve) {
    return { ok: false, message: "Choose either always resolve (-R) or never resolve (-n), not both." };
  }

  if (sel.hostDiscovery.noPing && Object.keys(sel.hostDiscovery.probes).length > 0) {
    return {
      ok: false,
      message: "Skip host discovery (-Pn) makes the selected ping probes unused — clear one or the other.",
    };
  }

  return validateSharedFields(sel);
}

function validateTarget(sel: NmapSelection): NmapValidation | null {
  const { value } = sel.target;
  const trimmed = value.trim();

  if (trimmed.length === 0) return { ok: false, message: "Enter a target." };

  const kind = detectTargetKind(value);
  if (kind === "list" && splitTargetList(value).length === 0) return { ok: false, message: "Enter at least one target." };

  return null;
}

function validateSharedFields(sel: NmapSelection): NmapValidation {
  if (sel.output.format !== "none" && sel.output.path.trim().length === 0) {
    return { ok: false, message: "Enter an output file path, or set output format back to none." };
  }

  return { ok: true };
}
