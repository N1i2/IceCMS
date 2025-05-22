import * as os from 'os';

const isProduction = process.env.NODE_ENV === 'production';
export const localIp = getServerIp();
// export const backendUrl = `http://${isProduction ? 'backend' : localIp }:3001`;
// export const frontendUrl = `http://${ isProduction ? 'frontend' : localIp}:3000`;
// export const frontendForHtmlUrl = `http://${localIp}:3000`;

export const backendUrl = `http://${localIp}:3001`;
export const frontendUrl = `http://${localIp}:3000`;
export const frontendForHtmlUrl = `http://${localIp}:3000`;

function getServerIp(): string {
  if (isProduction) {
    return `${process.env.LOCAL_IP}`;
  }

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]!) {
      console.log(net.address);

      if (
        net.family === 'IPv4' &&
        !net.internal &&
        !net.address.split('.').find((s) => s === '0')
      ) {
        return net.address;
      }
    }
  }

  return 'localhost';
}
