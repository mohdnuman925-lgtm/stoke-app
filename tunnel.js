const { spawn } = require('child_process');
const fs = require('fs');

function startTunnel() {
  console.log("Starting Serveo tunnel with keepalive...");
  const proc = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=20',
    '-o', 'ServerAliveCountMax=5',
    '-R', '80:127.0.0.1:8080',
    'serveo.net'
  ]);

  proc.stdout.on('data', (d) => {
    const str = d.toString();
    console.log(str);
    const m = str.match(/https:\/\/[a-zA-Z0-9-]+\.serveousercontent\.com/);
    if (m) {
      console.log("ACTIVE_TUNNEL_URL: " + m[0]);
      fs.writeFileSync('active_tunnel.txt', m[0]);
    }
  });

  proc.stderr.on('data', (d) => {
    console.log("STDERR: " + d.toString());
  });

  proc.on('close', (code) => {
    console.log("Tunnel closed with code " + code + ". Restarting in 2s...");
    setTimeout(startTunnel, 2000);
  });
}

startTunnel();
