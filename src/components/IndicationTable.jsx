import React, { useState } from 'react';
import { formatTime } from '../utils/utils';

const IndicationRow = ({ ind, isOpen, onToggle, showEnded }) => {
  const renderDetails = (details, type) => {
    if (!details) return '-';
    if (type === 'CPU_Overload') {
      return (
        <div className="border rounded p-2">
          <div className="text-sm text-gray-500">CPU at trigger: {details.cpu_at_trigger}%</div>
        </div>
      );
    }
    if (type === 'Packet_Loss_High') {
      return (
        <div className="border rounded p-2">
          <div className="text-sm text-gray-500">Loss: {details.loss_pct}%</div>
        </div>
      );
    }
    if (type === 'Latency_Degraded') {
      return (
        <div className="border rounded p-2">
          <div className="text-sm text-gray-500">Delay: {details.delay_avg} ms</div>
        </div>
      );
    }
    return <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(details, null, 2)}</pre>;
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="px-3 py-2 text-base">{ind.id}</td>
        <td className="px-3 py-2 text-base">{ind.type}</td>
        <td className="px-3 py-2 text-base">
          <span
            className={`px-2 py-1 rounded text-white text-sm ${
              ind.status === 'active' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}
          >
            {ind.status}
          </span>
        </td>
        <td className="px-3 py-2 text-base">{showEnded ? formatTime(ind.endedAt) : formatTime(ind.startedAt)}</td>
        <td className="px-3 py-2 text-base">{formatTime(ind.lastSeenAt)}</td>
        <td className="px-3 py-2 text-base">
          <button onClick={onToggle} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
            {isOpen ? 'Tutup' : 'Detail'}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-gray-50">
          <td colSpan="6" className="px-4 py-3">
            <div className="border-l-4 border-gray-400 pl-4">
              <div className="text-base"><span className="font-semibold">Rule ID:</span> {ind.ruleId}</div>
              {!showEnded && ind.cooldownUntil && (
                <div className="text-base"><span className="font-semibold">Cooldown until:</span> {formatTime(ind.cooldownUntil)}</div>
              )}
              <div className="text-base mt-2">
                <span className="font-semibold">Details:</span>
                <div className="mt-1">{renderDetails(ind.details, ind.type)}</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const IndicationTable = ({ indications, activeCount, showEnded = false }) => {
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 flex-shrink-0 px-1">
        <h4 className="font-semibold text-xl">Indication</h4>
        <span className="bg-red-500 text-white px-3 py-1 rounded text-sm">{activeCount} Aktif</span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-base border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Jenis</th>
              <th className="border px-3 py-2 text-left">Status</th>
              <th className="border px-3 py-2 text-left">{showEnded ? 'Berakhir' : 'Mulai'}</th>
              <th className="border px-3 py-2 text-left">Last Seen</th>
              <th className="border px-3 py-2 text-left">Detail</th>
            </tr>
          </thead>
          <tbody>
            {indications.map((ind) => (
              <IndicationRow
                key={ind.id}
                ind={ind}
                isOpen={openRow === ind.id}
                onToggle={() => toggleRow(ind.id)}
                showEnded={showEnded}
              />
            ))}
            {indications.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">Tidak ada indikasi Gangguan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};