// export const localIp = '192.168.124.206';

import * as os from 'os';

const isProduction = process.env.NODE_ENV === 'production';
export const localIp = getLocalExternalIp();
export const backendUrl = `http://${isProduction ? 'backend' : '127.0.0.1'}:3001`;
export const frontendUrl = `http://127.0.0.1:3000`;
export const frontendForHtmlUrl = `http://${isProduction ? 'frontend' : '127.0.0.1'}:3000`;

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
