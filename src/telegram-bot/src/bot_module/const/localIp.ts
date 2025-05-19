import * as os from 'os';

const isProduction = process.env.NODE_ENV === 'production';
export const localIp = getServerIp();
export const backendUrl = `http://${isProduction ? 'backend' : getServerIp()}:3001`;
export const frontendUrl = `http://${getServerIp()}:3000`;
export const frontendForHtmlUrl = `http://${isProduction ? 'frontend' : getServerIp()}:3000`;

function getServerIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return 'localhost';
}
