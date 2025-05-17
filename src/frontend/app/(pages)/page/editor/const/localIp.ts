// export const localIp = '192.168.124.206';

import * as os from 'os';

export const localIp = getLocalExternalIp();

function getLocalExternalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}
