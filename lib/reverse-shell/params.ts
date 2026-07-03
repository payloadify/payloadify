export type OsFamily = "linux" | "windows" | "mac";

export interface ShellParams {
  ip: string;
  port: number;
  shellPath: string;
}
