import { describe, expect, it } from "vitest";
import { isBlockedIp } from "./blockedRanges";

describe("isBlockedIp — IPv4", () => {
  it.each([
    ["127.0.0.1", true, "loopback"],
    ["127.255.255.255", true, "loopback, top of range"],
    ["10.0.0.1", true, "RFC 1918 10/8"],
    ["10.255.255.255", true, "RFC 1918 10/8, top of range"],
    ["172.16.0.1", true, "RFC 1918 172.16/12"],
    ["172.31.255.255", true, "RFC 1918 172.16/12, top of range"],
    ["192.168.0.1", true, "RFC 1918 192.168/16"],
    ["169.254.169.254", true, "AWS/GCP/Azure cloud metadata endpoint"],
    ["169.254.0.1", true, "link-local"],
    ["100.64.0.1", true, "CGNAT"],
    ["100.127.255.255", true, "CGNAT, top of range"],
    ["0.0.0.0", true, "this-network"],
    ["255.255.255.255", true, "limited broadcast"],
    ["192.0.2.1", true, "TEST-NET-1"],
    ["198.51.100.1", true, "TEST-NET-2"],
    ["203.0.113.1", true, "TEST-NET-3"],
    ["224.0.0.1", true, "multicast"],
    ["8.8.8.8", false, "public DNS resolver"],
    ["1.1.1.1", false, "public DNS resolver"],
    ["172.15.255.255", false, "just below RFC 1918 172.16/12"],
    ["172.32.0.0", false, "just above RFC 1918 172.16/12"],
    ["11.0.0.0", false, "just above RFC 1918 10/8"],
  ] as const)("%s -> blocked=%s (%s)", (ip, expected, _description) => {
    expect(isBlockedIp(ip)).toBe(expected);
  });
});

describe("isBlockedIp — IPv6", () => {
  it.each([
    ["::1", true, "loopback"],
    ["::", true, "unspecified"],
    ["fe80::1", true, "link-local"],
    ["fc00::1", true, "unique local"],
    ["fd00:ec2::254", true, "AWS IMDSv6 endpoint, inside fc00::/7"],
    ["2606:4700:4700::1111", false, "public Cloudflare DNS resolver"],
  ] as const)("%s -> blocked=%s (%s)", (ip, expected, _description) => {
    expect(isBlockedIp(ip)).toBe(expected);
  });
});

describe("isBlockedIp — embedded-IPv4 unwrapping", () => {
  it("blocks an IPv4-mapped IPv6 address whose embedded IPv4 is private", () => {
    expect(isBlockedIp("::ffff:127.0.0.1")).toBe(true);
    expect(isBlockedIp("::ffff:10.0.0.1")).toBe(true);
  });

  it("allows an IPv4-mapped IPv6 address whose embedded IPv4 is public", () => {
    expect(isBlockedIp("::ffff:8.8.8.8")).toBe(false);
  });

  it("blocks a NAT64-mapped address whose embedded IPv4 is private", () => {
    expect(isBlockedIp("64:ff9b::169.254.169.254")).toBe(true);
  });

  it("allows a NAT64-mapped address whose embedded IPv4 is public", () => {
    expect(isBlockedIp("64:ff9b::8.8.8.8")).toBe(false);
  });
});

describe("isBlockedIp — malformed input fails closed", () => {
  it.each(["not-an-ip", "999.999.999.999", "1.2.3", ""] as const)("%s -> blocked (fail closed)", (ip) => {
    expect(isBlockedIp(ip)).toBe(true);
  });
});
