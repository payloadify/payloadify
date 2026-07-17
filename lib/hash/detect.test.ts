import { describe, expect, it } from "vitest";
import { identifyHash } from "./detect";

function topCandidateName(hash: string): string {
  const result = identifyHash(hash);
  if (result.kind !== "matched") throw new Error(`Expected a match, got kind="${result.kind}"`);
  const [top] = [...result.candidates].sort((a, b) => a.signature.prevalenceRank - b.signature.prevalenceRank);
  return top.signature.name;
}

describe("identifyHash top candidate by length", () => {
  // Regression coverage: a length-40 or length-64 hash must never rank MD5 (length-32)
  // as the top candidate — each length bucket is matched and ranked independently.
  it("ranks MD5 top for a 32-character hex hash", () => {
    expect(topCandidateName("5f4dcc3b5aa765d61d8327deb882cf99")).toBe("MD5");
  });

  it("ranks SHA-1 top (not MD5) for a 40-character hex hash", () => {
    expect(topCandidateName("5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8")).toBe("SHA-1");
  });

  it("ranks SHA-256 top (not MD5) for a 64-character hex hash", () => {
    expect(topCandidateName("5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8")).toBe("SHA-256");
  });
});

describe("identifyHash newly added structured signatures", () => {
  it("identifies a Kerberoasting (krb5tgs) hash unambiguously", () => {
    expect(
      topCandidateName(
        "$krb5tgs$23$*user$realm$test/spn*$63386d22d359fe42230300d56852c9eb$891ad31d09ab89c6b3b8c5e5de6c06a7f49fd559d7a9a3c32576c8fedf705376cea582ab5938f7fc8bc741acf05c5990741b36ef4311fe3562a41b70a4ec6ecba849905f2385bb3799d92499909658c7287c49160276bca0006c350b0db4fd387adc27c01e9e9ad0c20ed53a7e6356dee2452e35eca2a6a1d1432796fc5c19d068978df74d3d0baf35c77de12456bf1144b6a750d11f55805f5a16ece2975246e2d026dce997fba34ac8757312e9e4e6272de35e20d52fb668c5ed"
      )
    ).toBe("Kerberos 5 TGS-REP etype 23 (Kerberoasting)");
  });

  it("identifies an AS-REP Roasting (krb5asrep) hash unambiguously", () => {
    expect(
      topCandidateName(
        "$krb5asrep$23$user@domain.com:3e156ada591263b8aab0965f5aebd837$007497cb51b6c8116d6407a782ea0e1c5402b17db7afa6b05a6d30ed164a9933c754d720e279c6c573679bd27128fe77e5fea1f72334c1193c8ff0b370fadc6368bf2d49bbfdba4c5dccab95e8c8ebfdc75f438a0797dbfb2f8a1a5f4c423f9bfc1fea483342a11bd56a216f4d5158ccc4b224b52894fadfba3957dfe4b6b8f5f9f9fe422811a314768673e0c924340b8ccb84775ce9defaa3baa0910b676ad0036d13032b0dd94e3b13903cc738a7b6d00b0b3c210d1f972a6c7cae9bd3c959acf7565be528fc179118f28c679f6deeee1456f0781eb8154e18e49cb27b64bf74cd7112a0ebae2102ac"
      )
    ).toBe("Kerberos 5 AS-REP etype 23 (AS-REP Roasting)");
  });

  it("identifies a NetNTLMv1 hash unambiguously", () => {
    expect(
      topCandidateName(
        "u4-netntlm::kNS:338d08f8e26de93300000000000000000000000000000000:9526fb8c23a90751cdd619b6cea564742e1e4bf33006ba41:cb8086049ec4736c"
      )
    ).toBe("NetNTLMv1 / NetNTLMv1+ESS");
  });

  it("identifies a NetNTLMv2 hash unambiguously (and not as NetNTLMv1)", () => {
    expect(
      topCandidateName(
        "admin::N46iSNekpT:08ca45b7d7ea58ee:88dcbe4446168966a153a0064958dac6:5c7830315c7830310000000000000b45c67103d07d7b95acd12ffa11230e0000000052920b85f78d013c31cdb3b92f5d765c783030"
      )
    ).toBe("NetNTLMv2");
  });

  it("identifies a MySQL 4.1+ hash (leading *) and not a bare SHA-1", () => {
    expect(topCandidateName("*FCF7C1B8749CF99D88E5F34271D636178FB5D130")).toBe(
      "MySQL 4.1+ (SHA1(SHA1(pass)))"
    );
  });

  it("identifies a PostgreSQL challenge MD5 hash (md5 prefix) and not a bare MD5", () => {
    expect(topCandidateName("md5900150983cd24fb0d6963f7d28e17f72")).toBe("PostgreSQL challenge MD5");
  });

  it("identifies a Django PBKDF2-SHA256 hash", () => {
    expect(
      topCandidateName("pbkdf2_sha256$20000$H0dPx8NeajVu$GiC4k5kqbbR9qWBlsRgDywNqC2vd9kqfk7zdorEnNas=")
    ).toBe("Django PBKDF2-SHA256");
  });

  it("identifies a Drupal 7 hash", () => {
    expect(topCandidateName("$S$C33783772bRXEx1aCsvY.dqgaaSu76XmVlKrW9Qu8IQlvxHlmzLf")).toBe(
      "Drupal 7 ($S$)"
    );
  });

  it("identifies a scrypt hash", () => {
    expect(
      topCandidateName("SCRYPT:1024:1:1:MDIwMzMwNTQwNDQyNQ==:5FW+zWivLxgCWj7qLiQbeC8zaNQ+qdO0NUinvqyFcfo=")
    ).toBe("scrypt");
  });

  it("identifies a Cisco-IOS Type 8 hash", () => {
    expect(topCandidateName("$8$TnGX/fE4KGHOVU$pEhnEvxrvaynpi8j4f.EMHr6M.FzU8xnZnBr/tJdFWk")).toBe(
      "Cisco-IOS Type 8 (PBKDF2-SHA256)"
    );
  });

  it("identifies a Cisco-IOS Type 9 hash", () => {
    expect(topCandidateName("$9$2MJBozw/9R3UsU$2lFhcKvpghcyw8deP25GOfyZaagyUOGBymkryvOdfo6")).toBe(
      "Cisco-IOS Type 9 (scrypt)"
    );
  });

  it("identifies an MS Office 2007 hash", () => {
    expect(
      topCandidateName(
        "$office$*2007*20*128*16*411a51284e0d0200b131a8949aaaa5cc*117d532441c63968bee7647d9b7df7d6*df1d601ccf905b375575108f42ef838fb88e1cde"
      )
    ).toBe("MS Office 2007 (encrypted document)");
  });

  it("identifies an MS Office 2010 hash", () => {
    expect(
      topCandidateName(
        "$office$*2010*100000*128*16*77233201017277788267221014757262*b2d0ca4854ba19cf95a2647d5eee906c*e30cbbb189575cafb6f142a90c2622fa9e78d293c5b0c001517b3f5b82993557"
      )
    ).toBe("MS Office 2010 (encrypted document)");
  });

  it("identifies an MS Office 2013 hash", () => {
    expect(
      topCandidateName(
        "$office$*2013*100000*256*16*7dd611d7eb4c899f74816d1dec817b3b*948dc0b2c2c6c32f14b5995a543ad037*0b7ee0e48e935f937192a59de48a7d561ef2691d5c8a3ba87ec2d04402a94895"
      )
    ).toBe("MS Office 2013+ (encrypted document)");
  });

  it("identifies a PDF hash", () => {
    expect(
      topCandidateName(
        "$pdf$2*3*128*-1028*1*16*da42ee15d4b3e08fe5b9ecea0e02ad0f*32*c9b59d72c7c670c42eeb4fca1d2ca15000000000000000000000000000000000000000000000000000000000000000*32*c4ff3e868dc87604626c2b8c259297a14d58c6309c70b00afdfb1fbba10ee571"
      )
    ).toBe("PDF (encrypted document)");
  });

  it("identifies a WinZip/PKZIP AES hash", () => {
    expect(
      topCandidateName(
        "$zip2$*0*3*0*e3222d3b65b5a2785b192d31e39ff9de*1320*e*19648c3e063c82a9ad3ef08ed833*3135c79ecb86cd6f48fc*$/zip2$"
      )
    ).toBe("WinZip / PKZIP AES");
  });

  it("identifies a RAR5 hash", () => {
    expect(
      topCandidateName(
        "$rar5$16$74575567518807622265582327032280$15$f8b4064de34ac02ecabfe9abdf93ed6a$8$9843834ed0f7c754"
      )
    ).toBe("RAR5");
  });

  it("identifies a 7-Zip hash", () => {
    expect(
      topCandidateName(
        "$7z$0$19$0$salt$8$f6196259a7326e3f0000000000000000$185065650$112$98$f3bc2a88062c419a25acd40c0c2d75421cf23263f69c51b13f9b1aada41a8a09f9adeae45d67c60b56aad338f20c0dcc5eb811c7a61128ee0746f922cdb9c59096869f341c7a9cb1ac7bb7d771f546b82cf4e6f11a5ecd4b61751e4d8de66dd6e2dfb5b7d1022d2211e2d66ea1703f96"
      )
    ).toBe("7-Zip");
  });

  it("identifies a KeePass hash", () => {
    expect(
      topCandidateName("$keepass$*1*50000*0*375756b9e6c72891a8e5645a3338b8c8*82afc053e8e1a6cfa39adae4f5fe5e59")
    ).toBe("KeePass 1 / KeePass 2 (AES/Twofish)");
  });

  it("identifies a WPA-PBKDF2-PMKID+EAPOL hash", () => {
    expect(
      topCandidateName("WPA*01*4d4fe7aac3a2cecab195321ceb99a7d0*fc690c158264*f4747f87f9f4*686173686361742d6573736964***")
    ).toBe("WPA-PBKDF2-PMKID+EAPOL");
  });

  it("gives SHA3-256 and Keccak-256 their own distinct Hashcat modes (not a shared mode number)", () => {
    const result = identifyHash("5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8");
    if (result.kind !== "matched") throw new Error(`Expected a match, got kind="${result.kind}"`);
    const sha3 = result.candidates.find((c) => c.signature.id === "sha3-256");
    const keccak = result.candidates.find((c) => c.signature.id === "keccak-256");
    expect(sha3?.signature.hashcatModes).toEqual([17400]);
    expect(keccak?.signature.hashcatModes).toEqual([17800]);
  });

  it("gives Whirlpool and SHA3-512 their own distinct Hashcat modes (not a shared mode number)", () => {
    const hash128 = "b6873fe141f00f14a1b541fd3a095b426a94db40cb63c8bf357fe295e9311c09dc0f0b59e07176c674002bde2ca9c4fa17e9a9f86838a98014945a0cf8e2c8eb";
    const result = identifyHash(hash128);
    if (result.kind !== "matched") throw new Error(`Expected a match, got kind="${result.kind}"`);
    const whirlpool = result.candidates.find((c) => c.signature.id === "whirlpool");
    const sha3512 = result.candidates.find((c) => c.signature.id === "sha3-512");
    expect(whirlpool?.signature.hashcatModes).toEqual([6100]);
    expect(sha3512?.signature.hashcatModes).toEqual([17600]);
  });

  it("does not let a NetNTLMv2 hash also match the NetNTLMv1 pattern", () => {
    const result = identifyHash(
      "admin::N46iSNekpT:08ca45b7d7ea58ee:88dcbe4446168966a153a0064958dac6:5c7830315c7830310000000000000b45c67103d07d7b95acd12ffa11230e0000000052920b85f78d013c31cdb3b92f5d765c783030"
    );
    if (result.kind !== "matched") throw new Error(`Expected a match, got kind="${result.kind}"`);
    expect(result.candidates.map((c) => c.signature.name)).not.toContain("NetNTLMv1 / NetNTLMv1+ESS");
  });
});
