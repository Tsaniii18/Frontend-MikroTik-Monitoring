import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

export const QosChart = ({ packetLossData, delayData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const lossPackets = (packetLossData || []).map(d => (d.packetSent ?? d.sent ?? 0) - (d.packetReceive ?? d.received ?? 0));
  const delayValues = (delayData || []).map(d => d.avgMs ?? d.average ?? d.avg ?? 0);

  const timestamps = (packetLossData || []).map(d => {
    const ts = d.timestamp ?? d.time ?? d.ts;
    if (!ts) return '';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return String(ts);
    }
  });

  useEffect(() => {
    if (!chartInstance.current) {
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps.length ? timestamps : lossPackets.map((_, idx) => idx + 1),
          datasets: [
            { label: 'Packet Loss (packets)', data: lossPackets, borderColor: '#ef4444', backgroundColor: 'transparent', yAxisID: 'y1', tension: 0.1 },
            { label: 'Delay (ms)', data: delayValues, borderColor: '#f59e0b', backgroundColor: 'transparent', yAxisID: 'y2', tension: 0.1 },
          ],
        },
        options: {
          maintainAspectRatio: false,
          animation: { duration: 300 },
          scales: {
            y1: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Packets' } },
            y2: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'ms' }, grid: { drawOnChartArea: false } },
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
        },
      });
    } else {
      chartInstance.current.data.datasets[0].data = lossPackets;
      chartInstance.current.data.datasets[1].data = delayValues;
      chartInstance.current.data.labels = timestamps.length ? timestamps : lossPackets.map((_, idx) => idx + 1);
      chartInstance.current.update({ duration: 300 });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [packetLossData, delayData]);

  return <canvas ref={chartRef} className="w-full h-48" />;
};