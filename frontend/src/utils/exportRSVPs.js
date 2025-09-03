// Utility to export RSVP data as CSV
export function exportRSVPsToCSV(event) {
  if (!event || !Array.isArray(event.rsvps)) return;
  const header = ['Patient Name', 'Phone', 'Status'];
  const rows = event.rsvps.map(r => [
    r.patient?.preferredLanguage || '',
    r.patient?.phone || '',
    r.status
  ]);
  const csv = [header, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `event_${event._id}_rsvps.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
