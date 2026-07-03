export type OsFamily = "linux" | "windows" | "cross";

export interface ShellParams {
  ip: string;
  port: number;
  shellPath: string;
}
