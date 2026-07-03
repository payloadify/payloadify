export interface SaveAsFileOptions {
  filename: string;
  content: string;
  mimeType?: string;
}

/** Client-side-only file download — creates a Blob, triggers it via a temporary <a download>,
 *  then revokes the object URL. No server endpoint involved. */
export function saveAsFile({ filename, content, mimeType = "text/plain" }: SaveAsFileOptions): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
