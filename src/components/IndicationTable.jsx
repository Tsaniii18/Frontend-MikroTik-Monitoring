import React, { useState } from 'react';
import { formatTime } from '../utils/utils';

const IndicationRow = ({ ind, isOpen, onToggle, showEnded }) => {
  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="px-3 py-2 text-base">{ind.id}</td>
        <td className="px-3 py-2 text-base">{ind.indication}</td>
        <td className="px-3 py-2 text-base">{ind.recommended_action}</td>
        <td className="px-3 py-2 text-base">
          {showEnded ? formatTime(ind.endedAt) : formatTime(ind.startedAt)}
        </td>
        <td className="px-3 py-2 text-base">
          <span
            className={`px-2 py-1 rounded text-white text-sm ${
              ind.status === 'active' ? 'bg-red-500' : 'bg-gray-500'
            }`}
          >
            {ind.status}
          </span>
        </td>
        <td className="px-3 py-2 text-base">
          <button
            onClick={onToggle}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
          >
            {isOpen ? 'Tutup' : 'Detail'}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-gray-50">
          <td colSpan="6" className="px-4 py-3">
            <div className="border-l-4 border-gray-400 pl-4 space-y-2">
              <div className="text-base"><span className="font-semibold">Correlation ID:</span> {ind.correlationId}</div>
              <div className="text-base"><span className="font-semibold">Detail Korelasi:</span> {ind.indication}</div>
              <div className="text-base"><span className="font-semibold">Langkah Rekomendasi:</span> {ind.recommended_action}</div>
              {showEnded && ind.endedAt && (
                <div className="text-base"><span className="font-semibold">Berakhir:</span> {formatTime(ind.endedAt)}</div>
              )}
              <div className="text-base">
                <span className="font-semibold">Event Pembentuk:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {ind.events?.map((ev) => (
                    <li key={ev.id} className="text-base">
                      {ev.type} (ID: {ev.id}) - {ev.status} - Mulai: {formatTime(ev.startedAt)}
                      {ev.endedAt && `, Berakhir: ${formatTime(ev.endedAt)}`}
                    </li>
                  ))}
                </ul>
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
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-xl">Indikasi Gangguan</h4>
        <span className="bg-red-500 text-white px-3 py-1 rounded text-sm">{activeCount} Aktif</span>
      </div>
      <div className="overflow-x-auto max-h-64 overflow-y-auto">
        <table className="table-auto w-full text-base border">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Indikasi</th>
              <th className="border px-3 py-2 text-left">Rekomendasi</th>
              <th className="border px-3 py-2 text-left">{showEnded ? 'Berakhir' : 'Mulai'}</th>
              <th className="border px-3 py-2 text-left">Status</th>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};