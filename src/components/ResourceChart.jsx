import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

export const ResourceChart = ({ cpuData, memData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const cpuValues = (cpuData || []).map(d => d.loadPct ?? 0);
  const memValues = (memData || []).map(d => d.usedMemPct ?? 0);

  const timestamps = (cpuData || []).map(d => {
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
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps.length ? timestamps : cpuValues.map((_, idx) => idx + 1),
          datasets: [
            {
              label: 'CPU Load (%)',
              data: cpuValues,
              borderColor: '#3b82f6',
              backgroundColor: 'transparent',
              tension: 0.1,
              borderWidth: 2
            },
            {
              label: 'Memory Usage (%)',
              data: memValues,
              borderColor: '#10b981',
              backgroundColor: 'transparent',
              tension: 0.1,
              borderWidth: 2
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          animation: { duration: 300 },
          scales: {
            y: {
              min: 0,
              max: 100,
              title: { display: true, text: '(%)' }
            }
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
            },
            legend: { position: 'top' }
          }
        }
      });
    } else {
      chartInstance.current.data.datasets[0].data = cpuValues;
      chartInstance.current.data.datasets[1].data = memValues;
      chartInstance.current.data.labels = timestamps.length ? timestamps : cpuValues.map((_, idx) => idx + 1);
      chartInstance.current.update({ duration: 300 });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [cpuData, memData]);

  return <canvas ref={chartRef} className="w-full h-48" />;
};