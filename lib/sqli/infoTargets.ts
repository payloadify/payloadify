import { SqlDialect } from "./dialects";

export type SqliInfoTargetId = "hostname" | "dbVersion" | "currentDatabase" | "currentUser" | "tableNames" | "custom";

export type SqliInfoTarget = {
  id: SqliInfoTargetId;
  label: string;
  description: string;
  /** Returns null when this target has no honest expression on `dialect` (e.g. hostname on
   *  SQLite, which has no server concept) — callers must hide/grey out the option for that
   *  dialect rather than fabricate a wrong expression. */
  resolve: (dialect: SqlDialect, customExpr?: string) => string | null;
};

export const SQLI_INFO_TARGETS: SqliInfoTarget[] = [
  {
    id: "hostname",
    label: "Hostname / server",
    description:
      "The database server's hostname or address. Not available on SQLite (no server concept); on PostgreSQL this returns an IP address (not a name) and comes back empty over a local Unix-socket connection.",
    resolve: (dialect) => dialect.hostname,
  },
  {
    id: "dbVersion",
    label: "Database version",
    description: "The database engine's version banner.",
    resolve: (dialect) => dialect.version,
  },
  {
    id: "currentDatabase",
    label: "Current database",
    description:
      "The name of the currently-connected database/schema. Not available on Oracle (no multi-database concept) or SQLite (file-based, no name).",
    resolve: (dialect) => dialect.currentDatabase,
  },
  {
    id: "currentUser",
    label: "Current user",
    description: "The database user the current connection is authenticated as. Not available on SQLite (no built-in user concept).",
    resolve: (dialect) => dialect.currentUser,
  },
  {
    id: "tableNames",
    label: "Table names",
    description: "A comma-separated list of table names visible to the current user.",
    resolve: (dialect) => dialect.listTables,
  },
  {
    id: "custom",
    label: "Custom expression",
    description: "Type any raw SQL expression to extract — e.g. a specific column, or a subquery.",
    resolve: (_dialect, customExpr) => (customExpr && customExpr.trim().length > 0 ? customExpr : null),
  },
];

export const SQLI_INFO_TARGETS_BY_ID: Record<SqliInfoTargetId, SqliInfoTarget> = Object.fromEntries(
  SQLI_INFO_TARGETS.map((t) => [t.id, t]),
) as Record<SqliInfoTargetId, SqliInfoTarget>;
