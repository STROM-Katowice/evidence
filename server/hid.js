// bt-mac.js
/*
import exec from 'child_process';
import os from 'os';

const exe=exec.exec();

function getBtMacLinux(cb) {
  // Requires bluetoothctl (most Linux distros)
  exe('bluetoothctl show', (err, stdout) => {
    if (err) return cb(err);
    // Look for a line like: “Controller AA:BB:CC:DD:EE:FF (public)”
    const m = stdout.match(/Controller\s+([0-9A-F:]{17})/i);
    if (m) cb(null, m[1]);
    else cb(new Error('Bluetooth controller not found'));
  });
}

function getBtMacDarwin(cb) {
  // macOS: system_profiler SPBluetoothDataType
  exe('system_profiler SPBluetoothDataType', (err, stdout) => {
    if (err) return cb(err);
    // Look for “Address: AA‑BB‑CC‑DD‑EE‑FF”
    const m = stdout.match(/Address:\s*([0-9A-F:-]{17})/i);
    if (m) {
      // macOS uses hyphens
      cb(null, m[1].replace(/-/g, ':').toUpperCase());
    } else cb(new Error('Bluetooth adapter not found'));
  });
}

function getBtMacWin32(cb) {
  // Windows PowerShell: Get-NetAdapter -Name "*Bluetooth*" | select MacAddress
  const cmd = `powershell -NoProfile -Command "Get-NetAdapter -Physical | Where-Object {$_.InterfaceDescription -Match 'Bluetooth'} | Select-Object -ExpandProperty MacAddress"`;
  exe(cmd, (err, stdout) => {
    if (err) return cb(err);
    const mac = stdout.trim();
    if (mac) cb(null, mac.toUpperCase());
    else cb(new Error('Bluetooth adapter not found'));
  });
}

function findBtMac(cb) {
  switch (os.platform()) {
    case 'linux':
      getBtMacLinux(cb);
      break;
    case 'darwin':
      getBtMacDarwin(cb);
      break;
    case 'win32':
      getBtMacWin32(cb);
      break;
    default:
      cb(new Error(`Unsupported platform: ${os.platform()}`));
  }
}

findBtMac((err, mac) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  console.log('Local Bluetooth MAC address:', mac);
});
*/

fetch('http://localhost:3000/qualifications',{
"method": "GET",
"headers": {
"authorization": "balljs"
}
}).then(x => console.log(x.status)); 