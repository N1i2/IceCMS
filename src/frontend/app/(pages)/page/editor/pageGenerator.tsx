export function generateRawHtml(
    body: string,
    css: string,
    scripts: string[]
  ): string {
    const scriptsHtml = scripts
      .map((script) => `<script type="text/javascript">(function(){${script}})()</script>`)
      .join('\n');
  
    return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
  ${css}
      </style>
    </head>
    <body>
  ${body}

  ${scriptsHtml}
    </body>
  </html>`;
  }