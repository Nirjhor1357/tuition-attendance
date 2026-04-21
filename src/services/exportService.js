const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const exportService = {
  downloadCsv(filename, headers, rows) {
    const head = headers.map(csvEscape).join(',');
    const body = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([`${head}\n${body}`], { type: 'text/csv;charset=utf-8;' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  exportReportPdf(reportTitle, htmlContent) {
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) {
      throw new Error('Allow popups to export PDF.');
    }

    popup.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <p>Generated at ${new Date().toLocaleString()}</p>
          ${htmlContent}
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  },
};
