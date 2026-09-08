/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 *
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - Target filename (e.g. attendance_report.csv)
 * @param {Array<{ key: string, label: string }>} [columns] - Optional column mappings
 */
export function exportToCsv(data, filename = 'export.csv', columns = null) {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const effectiveCols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));

  const headers = effectiveCols.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  const rows = data.map((row) =>
    effectiveCols
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
