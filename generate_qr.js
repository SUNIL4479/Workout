import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import os from 'os';
import path from 'path';

// Get local IPv4 address, prioritizing Wi-Fi / physical interfaces over WSL / Virtual adapters
const networkInterfaces = os.networkInterfaces();
let selectedIp = '127.0.0.1';
let wifiIp = null;
let allIps = [];

for (const [interfaceName, ifaces] of Object.entries(networkInterfaces)) {
  for (const net of ifaces || []) {
    if (net.family === 'IPv4' && !net.internal) {
      allIps.push({ name: interfaceName, ip: net.address });
      // Prioritize Wi-Fi or Ethernet (non-vEthernet/VirtualBox)
      if (interfaceName.toLowerCase().includes('wi-fi') || interfaceName.toLowerCase().includes('wlan') || interfaceName.toLowerCase().includes('ethernet 3')) {
        if (!interfaceName.toLowerCase().includes('vethernet')) {
          wifiIp = net.address;
        }
      }
    }
  }
}

// Fallback logic
if (wifiIp) {
  selectedIp = wifiIp;
} else if (allIps.length > 0) {
  // Find first IP that is not 172.31.* if possible
  const nonWsl = allIps.find(i => !i.ip.startsWith('172.31.'));
  selectedIp = nonWsl ? nonWsl.ip : allIps[0].ip;
}

const expoUrlLan = `exp://${selectedIp}:8081`;
const expoUrlLocal = `exp://127.0.0.1:8081`;

console.log(`\n==================================================`);
console.log(`EXPO GO QR CODE (Wi-Fi / LAN)`);
console.log(`Target URL: ${expoUrlLan}`);
console.log(`Detected Network Interfaces:`);
allIps.forEach(i => console.log(`  - ${i.name}: ${i.ip}`));
console.log(`==================================================\n`);

qrcodeTerminal.generate(expoUrlLan, { small: true });

// Save PNG QR Code for Wi-Fi IP to current artifacts directory and local directory
const artifactDir = 'C:\\Users\\karup\\.gemini\\antigravity-ide\\brain\\91679236-ec01-4595-ad79-ad1d975c9aa8';
const outputPath = path.join(artifactDir, 'expo_qr_wifi.png');
const localPath = path.resolve('expo_qr_wifi.png');

QRCode.toFile(outputPath, expoUrlLan, {
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 400
}, function (err) {
  if (err) console.error('Error generating artifact QR:', err);
  else console.log(`Saved Wi-Fi QR Image to ${outputPath}`);
});

QRCode.toFile(localPath, expoUrlLan, {
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 400
}, function (err) {
  if (err) console.error('Error generating local QR:', err);
  else console.log(`Saved Local Wi-Fi QR Image to ${localPath}`);
});
