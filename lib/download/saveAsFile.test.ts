import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveAsFile } from "./saveAsFile";

describe("saveAsFile", () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const originalClick = HTMLAnchorElement.prototype.click;

  beforeEach(() => {
    createObjectURL = vi.fn(() => "blob:mock-url");
    revokeObjectURL = vi.fn();
    // jsdom doesn't implement createObjectURL/revokeObjectURL — stub them for this test.
    URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;
    clickSpy = vi.fn();
    HTMLAnchorElement.prototype.click = clickSpy as unknown as () => void;
  });

  afterEach(() => {
    // Direct property assignment, not vi.spyOn — restore explicitly so these globals don't leak
    // into other test files (this suite runs with fileParallelism: false, i.e. sequentially in a
    // shared jsdom environment).
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    HTMLAnchorElement.prototype.click = originalClick;
    vi.restoreAllMocks();
  });

  it("creates a Blob object URL, clicks a download anchor with the right filename, then revokes the URL", () => {
    saveAsFile({ filename: "shell.sh", content: "echo hi", mimeType: "text/x-shellscript" });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURL.mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe("text/x-shellscript");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("defaults to text/plain when no MIME type is given", () => {
    saveAsFile({ filename: "shell.txt", content: "hi" });
    const blobArg = createObjectURL.mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe("text/plain");
  });
});
