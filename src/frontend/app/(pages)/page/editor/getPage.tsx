import { sendSuccess, sendError } from '@/helpModule/Massages';
import html2canvas from 'html2canvas';
import { localIp } from '../../../../helpModule/localIp';

export function getUrlPage(path: string) {
  // navigator.clipboard
  //   .writeText(`http://${localIp}:3000/p/${path}`)
  //   .then(() => {
  //     sendSuccess('Success', 'Text copied to the clipboard');
  //   })
  //   .catch((err) => {
  //     sendError('Error', `Error with clipboard: ${err}`);
  //   });

  sendSuccess('Please go to this Url', `http://${localIp}:3000/p/${path}`);
}

export async function getHtmlPage(name: string, pageId: string) {
  const respons = await fetch(`http://${localIp}:3000/p/${pageId}`);
  const rawHtml = await respons.text();

  const blob = new Blob([`${rawHtml}`], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = `${name}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

export async function getPngPage(name: string, pageId: string) {
  try {
    const response = await fetch(`http://${localIp}:3000/p/${pageId}`);
    const rawHtml = await response.text();

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.width = '1280px';
    iframe.style.height = '720px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Cannot access iframe document');

    iframeDoc.open();
    iframeDoc.write(rawHtml);
    iframeDoc.close();

    iframe.onload = async () => {
      try {
        const canvas = await html2canvas(iframe.contentDocument!.body);
        const pngDataUrl = canvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = pngDataUrl;
        a.download = `${name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        document.body.removeChild(iframe);
        sendSuccess('PNG Saved', 'The PNG file has been downloaded');
      } catch (canvasError) {
        sendError('Render error', String(canvasError));
        document.body.removeChild(iframe);
      }
    };
  } catch (err) {
    sendError('Error', `Failed to fetch or render page: ${err}`);
  }
}
