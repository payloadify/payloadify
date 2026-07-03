import { afterEach, describe, expect, it } from "vitest";
import { loadSavedListeners, MAX_SAVED_LISTENERS, saveSavedListeners, SavedListener } from "./savedListeners";

const KEY = "test:saved-listeners";

afterEach(() => {
  localStorage.removeItem(KEY);
});

describe("loadSavedListeners", () => {
  it("returns [] when nothing is stored", () => {
    expect(loadSavedListeners(KEY)).toEqual([]);
  });

  it("returns [] on corrupt JSON", () => {
    localStorage.setItem(KEY, "{not json");
    expect(loadSavedListeners(KEY)).toEqual([]);
  });

  it("returns [] when the stored value isn't an array", () => {
    localStorage.setItem(KEY, JSON.stringify({ a: 1 }));
    expect(loadSavedListeners(KEY)).toEqual([]);
  });

  it("filters out malformed entries", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([{ id: "1", label: "ok", lhost: "10.0.0.1", lport: 4444 }, { id: "2" }, "garbage", null]),
    );
    expect(loadSavedListeners(KEY)).toEqual([{ id: "1", label: "ok", lhost: "10.0.0.1", lport: 4444 }]);
  });
});

describe("saveSavedListeners", () => {
  it("round-trips through localStorage", () => {
    const listeners: SavedListener[] = [{ id: "1", label: "home", lhost: "10.10.10.10", lport: 4444 }];
    saveSavedListeners(KEY, listeners);
    expect(loadSavedListeners(KEY)).toEqual(listeners);
  });

  it("caps stored listeners at MAX_SAVED_LISTENERS", () => {
    const many: SavedListener[] = Array.from({ length: MAX_SAVED_LISTENERS + 5 }, (_, i) => ({
      id: String(i),
      label: `listener-${i}`,
      lhost: "10.0.0.1",
      lport: 4444,
    }));
    saveSavedListeners(KEY, many);
    expect(loadSavedListeners(KEY)).toHaveLength(MAX_SAVED_LISTENERS);
  });
});
