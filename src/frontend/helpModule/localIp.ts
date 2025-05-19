export const localIp = getLocalExternalIp();

function getLocalExternalIp(): string {
  if (typeof window !== 'undefined') {
    const url = window.location.href;
    const ipAndPort = url.split('/')[2].split(':')[0];

    return ipAndPort;
  }

  return '127.0.0.1';
}
