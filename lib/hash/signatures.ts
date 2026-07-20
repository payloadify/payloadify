import { HashContextId } from "./context";

export type HashSignature = {
  id: string;
  name: string;
  hashcatModes: number[];
  test: (input: string) => boolean;
  /** Higher = more structurally distinctive. Signatures sharing the same value within
   *  one match set are treated as fully ambiguous (e.g. MD5 vs NTLM vs MD4 vs LM). Drives
   *  confidence ("high"/"medium"/"low") — see lib/hash/detect.ts. Not used for display order. */
  specificity: number;
  /** Real-world prevalence within its length bucket, lower = more common. Presentation-only:
   *  used to order/label candidates ("Most likely" vs "Also structurally possible") without
   *  affecting the confidence calculation above. */
  prevalenceRank: number;
  /** Which user-selected hash-source contexts (see lib/hash/context.ts) this signature is
   *  disproportionately likely under — e.g. NTLM under "windows". Presentation-only, exactly
   *  like prevalenceRank: lib/hash/rank.ts uses it to promote a candidate above prevalenceRank
   *  ordering when the user tells us where the hash came from. Never affects the structural
   *  confidence tier — a context match is a strong practical hint, not proof. Only meaningfully
   *  populated for signatures that appear in a real same-length ambiguity bucket; structured
   *  formats are already unambiguous and don't need it. */
  favoredContexts?: HashContextId[];
  note?: string;
};

const HEX = "[0-9a-f]";
function hexOfLength(length: number): RegExp {
  return new RegExp(`^${HEX}{${length}}$`, "i");
}

const STRUCTURED = 100;
const HEX_COMMON = 50;
const HEX_RARE = 10;

const NO_HASHCAT_MODE_NOTE = "Not directly supported by Hashcat (no dedicated mode).";

export const HASH_SIGNATURES: HashSignature[] = [
  {
    id: "bcrypt",
    name: "bcrypt",
    hashcatModes: [3200],
    test: (s) => /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "phpass",
    name: "phpass (phpBB3/WordPress)",
    hashcatModes: [400],
    test: (s) => /^\$[PH]\$[./A-Za-z0-9]{31}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "md5crypt",
    name: "md5crypt",
    hashcatModes: [500],
    test: (s) => /^\$1\$[./A-Za-z0-9]{0,8}\$[./A-Za-z0-9]{22}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "This is the \"md5crypt\" Unix crypt format, not a raw MD5 hash.",
  },
  {
    id: "sha256crypt",
    name: "sha256crypt",
    hashcatModes: [7400],
    test: (s) => /^\$5\$(rounds=\d+\$)?[./A-Za-z0-9]{1,16}\$[./A-Za-z0-9]{43}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "sha512crypt",
    name: "sha512crypt",
    hashcatModes: [1800],
    test: (s) => /^\$6\$(rounds=\d+\$)?[./A-Za-z0-9]{1,16}\$[./A-Za-z0-9]{86}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "ssha",
    name: "SSHA (salted SHA-1, LDAP)",
    hashcatModes: [111],
    test: (s) => /^\{SSHA\}[A-Za-z0-9+/=]+$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "sha-ldap",
    name: "SHA (LDAP, unsalted)",
    hashcatModes: [101],
    test: (s) => /^\{SHA\}[A-Za-z0-9+/=]{28}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "descrypt",
    name: "DES crypt (Unix traditional)",
    hashcatModes: [1500],
    test: (s) => /^[./A-Za-z0-9]{13}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "13-character traditional Unix DES-crypt. Easy to confuse with a truncated base64 string.",
  },
  {
    id: "mysql323",
    name: "MySQL323 (OLDPASSWORD)",
    hashcatModes: [200],
    test: (s) => hexOfLength(16).test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "16 hex characters — MySQL's pre-4.1 OLDPASSWORD() hash.",
  },

  // --- Active Directory attack artifacts (Kerberoasting / AS-REP Roasting / NetNTLM relay & capture) ---
  {
    id: "krb5tgs",
    name: "Kerberos 5 TGS-REP etype 23 (Kerberoasting)",
    hashcatModes: [13100],
    test: (s) => /^\$krb5tgs\$23\$\*[^$]+\$[^$]+\$[^*]+\*\$[0-9a-f]{32}\$[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via a Kerberoasting attack (e.g. Rubeus/GetUserSPNs.py) against a service account's SPN.",
  },
  {
    id: "krb5asrep",
    name: "Kerberos 5 AS-REP etype 23 (AS-REP Roasting)",
    hashcatModes: [18200],
    test: (s) => /^\$krb5asrep\$23\$[^:]+:[0-9a-f]{32}\$[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via AS-REP Roasting against an account with Kerberos pre-authentication disabled.",
  },
  {
    id: "netntlmv1",
    name: "NetNTLMv1 / NetNTLMv1+ESS",
    hashcatModes: [5500],
    test: (s) => /^[^:]+::[^:]+:[0-9a-f]{48}:[0-9a-f]{48}:[0-9a-f]{16}$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Captured via Responder/relay, format user::domain:lm-response:ntlm-response:server-challenge.",
  },
  {
    id: "netntlmv2",
    name: "NetNTLMv2",
    hashcatModes: [5600],
    test: (s) => /^[^:]+::[^:]+:[0-9a-f]{16}:[0-9a-f]{32}:[0-9a-f]{16,}$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Captured via Responder/relay, format user::domain:server-challenge:ntlmv2-hmac:target-info-blob.",
  },

  // --- Common web-app / OS KDFs ---
  {
    id: "mysql-new",
    name: "MySQL 4.1+ (SHA1(SHA1(pass)))",
    hashcatModes: [300],
    test: (s) => /^\*[0-9a-f]{40}$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Leading * is how MySQL's mysql.user table displays this hash — distinguishes it from a bare SHA-1.",
  },
  {
    id: "postgres-md5",
    name: "PostgreSQL challenge MD5",
    hashcatModes: [12],
    test: (s) => /^md5[0-9a-f]{32}$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Literal \"md5\" prefix is how pg_shadow/pg_authid stores this hash — distinguishes it from a bare MD5.",
  },
  {
    id: "django-pbkdf2",
    name: "Django PBKDF2-SHA256",
    hashcatModes: [10000],
    test: (s) => /^pbkdf2_sha256\$\d+\$[A-Za-z0-9]+\$[A-Za-z0-9+/=]+$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "drupal7",
    name: "Drupal 7 ($S$)",
    hashcatModes: [7900],
    test: (s) => /^\$S\$[./A-Za-z0-9]{52}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "scrypt",
    name: "scrypt",
    hashcatModes: [8900],
    test: (s) => /^SCRYPT:\d+:\d+:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "cisco-type8",
    name: "Cisco-IOS Type 8 (PBKDF2-SHA256)",
    hashcatModes: [9200],
    test: (s) => /^\$8\$[./A-Za-z0-9]{14}\$[./A-Za-z0-9]{43}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },
  {
    id: "cisco-type9",
    name: "Cisco-IOS Type 9 (scrypt)",
    hashcatModes: [9300],
    test: (s) => /^\$9\$[./A-Za-z0-9]{14}\$[./A-Za-z0-9]{43}$/.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
  },

  // --- Documents / archives (common on file-share pentests) ---
  {
    id: "office2007",
    name: "MS Office 2007 (encrypted document)",
    hashcatModes: [9400],
    test: (s) => /^\$office\$\*2007\*\d+\*\d+\*\d+\*[0-9a-f]+\*[0-9a-f]+\*[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via office2john.py.",
  },
  {
    id: "office2010",
    name: "MS Office 2010 (encrypted document)",
    hashcatModes: [9500],
    test: (s) => /^\$office\$\*2010\*\d+\*\d+\*\d+\*[0-9a-f]+\*[0-9a-f]+\*[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via office2john.py.",
  },
  {
    id: "office2013",
    name: "MS Office 2013+ (encrypted document)",
    hashcatModes: [9600],
    test: (s) => /^\$office\$\*2013\*\d+\*\d+\*\d+\*[0-9a-f]+\*[0-9a-f]+\*[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via office2john.py.",
  },
  {
    id: "pdf",
    name: "PDF (encrypted document)",
    hashcatModes: [10500],
    test: (s) =>
      /^\$pdf\$\d\*\d\*\d+\*-?\d+\*\d\*\d+\*[0-9a-f]+\*\d+\*[0-9a-f]+\*\d+\*[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via pdf2john.py. Exact Hashcat mode (10400/10500/10600/10700) depends on the PDF revision (R value, the first number after $pdf$) — verify against the specific mode's example hash before cracking.",
  },
  {
    id: "zip2",
    name: "WinZip / PKZIP AES",
    hashcatModes: [13600],
    test: (s) => /^\$zip2\$\*[^$]*\*\$\/zip2\$$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via zip2john.",
  },
  {
    id: "rar5",
    name: "RAR5",
    hashcatModes: [13000],
    test: (s) => /^\$rar5\$\d+\$[0-9a-f]+\$\d+\$[0-9a-f]+\$\d+\$[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via rar2john.",
  },
  {
    id: "sevenzip",
    name: "7-Zip",
    hashcatModes: [11600],
    test: (s) =>
      /^\$7z\$\d+\$\d+\$\d+\$(?:salt|[0-9a-f]*)\$\d+\$[0-9a-f]+\$\d+\$\d+\$\d+\$[0-9a-f]+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via 7z2john.pl.",
  },
  {
    id: "keepass",
    name: "KeePass 1 / KeePass 2 (AES/Twofish)",
    hashcatModes: [13400],
    test: (s) => /^\$keepass\$\*[12]\*.+$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Extracted via keepass2john.",
  },
  {
    id: "wpa",
    name: "WPA-PBKDF2-PMKID+EAPOL",
    hashcatModes: [22000],
    test: (s) => /^WPA\*0[12]\*[0-9a-f]{32}\*[0-9a-f]{12}\*[0-9a-f]{12}\*[0-9a-f]+\*+.*$/i.test(s),
    specificity: STRUCTURED,
    prevalenceRank: 1,
    note: "Converted from a .pcap/.cap capture via hcxpcapngtool (replaces the old .hccapx format).",
  },

  // --- 32 hex characters: MD5 > NTLM > MD4 > MD2 > RIPEMD-128 > Tiger-128 > HAVAL-128 ---
  {
    id: "md5",
    name: "MD5",
    hashcatModes: [0],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 1,
    favoredContexts: ["web-db", "linux-unix"],
  },
  {
    id: "ntlm",
    name: "NTLM",
    hashcatModes: [1000],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 2,
    note: "If this came from a Windows SAM or NTDS.dit dump, NTLM is the near-certain match.",
    favoredContexts: ["windows"],
  },
  {
    id: "md4",
    name: "MD4",
    hashcatModes: [900],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 3,
    note: "Rarely seen standalone outside of NTLM's internal use of MD4.",
  },
  {
    id: "md2",
    name: "MD2",
    hashcatModes: [],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 4,
    note: `Obsolete, very rarely seen in practice. ${NO_HASHCAT_MODE_NOTE}`,
  },
  {
    id: "ripemd128",
    name: "RIPEMD-128",
    hashcatModes: [],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 5,
    note: `Rare. ${NO_HASHCAT_MODE_NOTE}`,
  },
  {
    id: "tiger128",
    name: "Tiger-128",
    hashcatModes: [],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 6,
    note: `Rare. ${NO_HASHCAT_MODE_NOTE}`,
  },
  {
    id: "haval128",
    name: "HAVAL-128",
    hashcatModes: [],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 7,
    note: `Rare. ${NO_HASHCAT_MODE_NOTE}`,
  },
  {
    id: "lm",
    name: "LM",
    hashcatModes: [3000],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 8,
    note: "Legacy Windows LAN Manager hash — deprecated, case-insensitive password, split into two 8-byte halves.",
    favoredContexts: ["windows"],
  },

  // --- 40 hex characters: SHA-1 > RIPEMD-160 > HAVAL-160 ---
  {
    id: "sha1",
    name: "SHA-1",
    hashcatModes: [100],
    test: (s) => hexOfLength(40).test(s),
    specificity: HEX_COMMON,
    prevalenceRank: 1,
    favoredContexts: ["web-db", "linux-unix"],
  },
  {
    id: "ripemd160",
    name: "RIPEMD-160",
    hashcatModes: [6000],
    test: (s) => hexOfLength(40).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 2,
    note: "Same length as SHA-1 but much less commonly used.",
  },
  {
    id: "haval160",
    name: "HAVAL-160",
    hashcatModes: [],
    test: (s) => hexOfLength(40).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 3,
    note: `Same length as SHA-1 but rare. ${NO_HASHCAT_MODE_NOTE}`,
  },

  {
    id: "sha224",
    name: "SHA-224",
    hashcatModes: [1300],
    test: (s) => hexOfLength(56).test(s),
    specificity: HEX_COMMON,
    prevalenceRank: 1,
  },

  // --- 64 hex characters: SHA-256 > SHA3-256 > RIPEMD-256 ---
  {
    id: "sha256",
    name: "SHA-256",
    hashcatModes: [1400],
    test: (s) => hexOfLength(64).test(s),
    specificity: HEX_COMMON,
    prevalenceRank: 1,
  },
  {
    id: "sha3-256",
    name: "SHA3-256",
    hashcatModes: [17400],
    test: (s) => hexOfLength(64).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 2,
    note: "Same length as SHA-256 but much less commonly used.",
  },
  {
    id: "keccak-256",
    name: "Keccak-256",
    hashcatModes: [17800],
    test: (s) => hexOfLength(64).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 3,
    note: "Same length as SHA-256/SHA3-256 but distinct pre-standardization Keccak padding — uses a different Hashcat mode than SHA3-256.",
  },
  {
    id: "ripemd256",
    name: "RIPEMD-256",
    hashcatModes: [],
    test: (s) => hexOfLength(64).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 4,
    note: `Same length as SHA-256 but rare. ${NO_HASHCAT_MODE_NOTE}`,
  },

  {
    id: "sha384",
    name: "SHA-384",
    hashcatModes: [10800],
    test: (s) => hexOfLength(96).test(s),
    specificity: HEX_COMMON,
    prevalenceRank: 1,
  },
  {
    id: "sha512",
    name: "SHA-512",
    hashcatModes: [1700],
    test: (s) => hexOfLength(128).test(s),
    specificity: HEX_COMMON,
    prevalenceRank: 1,
  },
  {
    id: "whirlpool",
    name: "Whirlpool",
    hashcatModes: [6100],
    test: (s) => hexOfLength(128).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 2,
    note: "Same length as SHA-512 but much less commonly used.",
  },
  {
    id: "sha3-512",
    name: "SHA3-512",
    hashcatModes: [17600],
    test: (s) => hexOfLength(128).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 3,
    note: "Same length as SHA-512/Whirlpool but distinct algorithm — uses a different Hashcat mode than Whirlpool.",
  },
];
