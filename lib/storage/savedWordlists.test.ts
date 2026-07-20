import { afterEach, describe, expect, it } from "vitest";
import { loadSavedWordlists, MAX_SAVED_WORDLISTS, saveSavedWordlists, SavedWordlist } from "./savedWordlists";

const KEY = "test:saved-wordlists";

afterEach(() => {
  localStorage.removeItem(KEY);
});

describe("loadSavedWordlists", () => {
  it("returns [] when nothing is stored", () => {
    expect(loadSavedWordlists(KEY)).toEqual([]);
  });

  it("returns [] on corrupt JSON", () => {
    localStorage.setItem(KEY, "{not json");
    expect(loadSavedWordlists(KEY)).toEqual([]);
  });

  it("returns [] when the stored value isn't an array", () => {
    localStorage.setItem(KEY, JSON.stringify({ a: 1 }));
    expect(loadSavedWordlists(KEY)).toEqual([]);
  });

  it("filters out malformed entries", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([{ id: "1", label: "rockyou", path: "/usr/share/wordlists/rockyou.txt" }, { id: "2" }, "garbage", null]),
    );
    expect(loadSavedWordlists(KEY)).toEqual([{ id: "1", label: "rockyou", path: "/usr/share/wordlists/rockyou.txt" }]);
  });
});

describe("saveSavedWordlists", () => {
  it("round-trips through localStorage", () => {
    const wordlists: SavedWordlist[] = [{ id: "1", label: "rockyou", path: "/usr/share/wordlists/rockyou.txt" }];
    saveSavedWordlists(KEY, wordlists);
    expect(loadSavedWordlists(KEY)).toEqual(wordlists);
  });

  it("caps stored wordlists at MAX_SAVED_WORDLISTS", () => {
    const many: SavedWordlist[] = Array.from({ length: MAX_SAVED_WORDLISTS + 5 }, (_, i) => ({
      id: String(i),
      label: `wordlist-${i}`,
      path: `/tmp/wordlist-${i}.txt`,
    }));
    saveSavedWordlists(KEY, many);
    expect(loadSavedWordlists(KEY)).toHaveLength(MAX_SAVED_WORDLISTS);
  });
});
