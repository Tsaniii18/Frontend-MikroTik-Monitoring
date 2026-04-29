import React, { useState } from 'react';
import { formatTime } from '../utils/utils';

const IndicationRow = ({ ind, isOpen, onToggle, showEnded }) => {
  const renderDetails = () => {
    if (!ind.events || ind.events.length === 0) {
      return <div className="text-sm text-gray-500">Tidak ada event terkait.</div>;
    }
    return (
      <div className="space-y-2">
        <h5 className="font-semibold text-base">Event Terkait:</h5>
        <ul className="list-disc list-inside">
          {ind.events.map(ev => (
            <li key={ev.id} className="text-sm">
              <span className="font-medium">{ev.type}</span>
              <span className="text-gray-500"> (Status: {ev.status})</span>
              <span className="text-gray-500"> - Mulai: {formatTime(ev.startedAt)}</span>
              {ev.evidence && (
                <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(ev.evidence, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const cols = showEnded ? 6 : 5;

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="px-3 py-2 text-base">{ind.id}</td>
        <td className="px-3 py-2 text-base">{ind.indication}</td>
        <td className="px-3 py-2 text-base">
          <span
            className={`px-2 py-1 rounded text-white text-sm ${
              ind.status === 'active' ? 'bg-red-500' : 'bg-gray-500'
            }`}
          >
            {ind.status}
          </span>
        </td>
        <td className="px-3 py-2 text-base">{formatTime(ind.startedAt)}</td>
        {showEnded && (
          <td className="px-3 py-2 text-base">{ind.endedAt ? formatTime(ind.endedAt) : '-'}</td>
        )}
        <td className="px-3 py-2 text-base">
          <button onClick={onToggle} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
            {isOpen ? 'Tutup' : 'Detail'}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-gray-50">
          <td colSpan={cols} className="px-4 py-3">
            <div className="max-h-80 overflow-y-auto border-l-4 border-gray-400 pl-4">
              <div className="text-base"><span className="font-semibold">Correlation ID:</span> {ind.correlationId}</div>
              {ind.recommended_action && (
                <div className="text-base mt-1"><span className="font-semibold">Rekomendasi:</span> {ind.recommended_action}</div>
              )}
              <div className="mt-3">
                {renderDetails()}
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

  const cols = showEnded ? 6 : 5;

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
              <th className="border px-3 py-2 text-left">Mulai</th>
              {showEnded && <th className="border px-3 py-2 text-left">Berakhir</th>}
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
                <td colSpan={cols} className="text-center py-4 text-gray-500">Tidak ada indikasi Gangguan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};