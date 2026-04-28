export const formatBytesPerSec = (bps) => {
  if (bps < 1000) return bps.toFixed(2) + ' bps';
  if (bps < 1000000) return (bps / 1000).toFixed(2) + ' Kbps';
  return (bps / 1000000).toFixed(2) + ' Mbps';
};

export const formatUptime = (uptimeStr) => uptimeStr || '-';

export const formatTime = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString();
};

export const calcStats = (arr, key) => {
  if (!arr || arr.length === 0) return { avg: 0, min: 0, max: 0 };
  const values = arr.map((item) => item[key]).filter((v) => typeof v === 'number');
  if (values.length === 0) return { avg: 0, min: 0, max: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    avg: (sum / values.length).toFixed(2),
    min: Math.min(...values).toFixed(2),
    max: Math.max(...values).toFixed(2),
  };
};