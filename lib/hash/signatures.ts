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

  // --- 32 hex characters: MD5 > NTLM > MD4 > MD2 > RIPEMD-128 > Tiger-128 > HAVAL-128 ---
  {
    id: "md5",
    name: "MD5",
    hashcatModes: [0],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 1,
  },
  {
    id: "ntlm",
    name: "NTLM",
    hashcatModes: [1000],
    test: (s) => hexOfLength(32).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 2,
    note: "If this came from a Windows SAM or NTDS.dit dump, NTLM is the near-certain match.",
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
  },

  // --- 40 hex characters: SHA-1 > RIPEMD-160 > HAVAL-160 ---
  {
    id: "sha1",
    name: "SHA-1",
    hashcatModes: [100],
    test: (s) => hexOfLength(40).test(s),
    specificity: HEX_COMMON,
    prevalenceRank: 1,
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
    name: "SHA3-256 / Keccak-256",
    hashcatModes: [17400],
    test: (s) => hexOfLength(64).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 2,
    note: "Same length as SHA-256 but much less commonly used.",
  },
  {
    id: "ripemd256",
    name: "RIPEMD-256",
    hashcatModes: [],
    test: (s) => hexOfLength(64).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 3,
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
    name: "Whirlpool / SHA3-512",
    hashcatModes: [6100],
    test: (s) => hexOfLength(128).test(s),
    specificity: HEX_RARE,
    prevalenceRank: 2,
    note: "Same length as SHA-512 but much less commonly used.",
  },
];
