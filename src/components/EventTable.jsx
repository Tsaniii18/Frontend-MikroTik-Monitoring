import React, { useState } from 'react';
import { formatTime } from '../utils/utils';

const EventRow = ({ ev, isOpen, onToggle, showEnded }) => {
  const renderEvidence = (evidence, type) => {
    if (!evidence) return '-';
    switch (type) {
      case 'CPU_Overload':
        return (
          <div className="space-y-2 text-base">
            <div className="border rounded p-2">
              <div className="text-sm text-gray-500 mb-1">CPU at trigger</div>
              <div className="font-medium">{evidence.cpu_at_trigger}%</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-sm text-gray-500 mb-1">Avg prev 60s</div>
              <div className="font-medium">{evidence.cpu_avg_prev_60s?.toFixed(2)}%</div>
            </div>
            {evidence.top_tasks_at_trigger && (
              <div className="border rounded p-2">
                <div className="text-sm text-gray-500 mb-1">Top tasks at trigger</div>
                <div className="max-h-48 overflow-y-auto">
                  <ul className="list-disc pl-5 text-base">
                    {evidence.top_tasks_at_trigger.map((t, i) => (
                      <li key={i}>{t.name}: {t.usage}%</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      case 'Packet_Loss_High':
        return (
          <div className="space-y-2 text-base">
            <div className="border rounded p-2">
              <div className="text-sm text-gray-500 mb-1">Avg prev 60s</div>
              <div className="grid grid-cols-2 gap-1 text-base">
                <div>Sent: {evidence.loss_avg_prev_60s?.totalSent}</div>
                <div>Received: {evidence.loss_avg_prev_60s?.totalReceived}</div>
                <div>Loss: {evidence.loss_avg_prev_60s?.loss}</div>
                <div>Loss%: {evidence.loss_avg_prev_60s?.loss_pct}%</div>
              </div>
            </div>
          </div>
        );
      case 'Latency_Degraded':
        return (
          <div className="space-y-2 text-base">
            <div className="border rounded p-2">
              <div className="text-sm text-gray-500 mb-1">Delay at trigger</div>
              <div className="grid grid-cols-3 gap-1 text-base">
                <div>Avg: {evidence.delay_at_trigger?.avg} ms</div>
                <div>Min: {evidence.delay_at_trigger?.min} ms</div>
                <div>Max: {evidence.delay_at_trigger?.max} ms</div>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="text-sm text-gray-500 mb-1">Avg prev 60s</div>
              <div className="text-base">{evidence.delay_avg_prev_60s?.toFixed(2)} ms</div>
            </div>
          </div>
        );
      case 'Interface_Down':
        return (
          <div className="border rounded p-2">
            <div className="text-sm text-gray-500 mb-1">Interfaces down</div>
            <ul className="list-disc pl-5 text-base">
              {evidence.interfaces?.map((iface, i) => (
                <li key={i}>{iface.name} ({iface.type}) - {iface.reason}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return <pre className="text-base bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(evidence, null, 2)}</pre>;
    }
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="px-3 py-2 text-base">{ev.id}</td>
        <td className="px-3 py-2 text-base">{ev.type}</td>
        <td className="px-3 py-2 text-base">
          <span
            className={`px-2 py-1 rounded text-white text-sm ${
              ev.status === 'active' ? 'bg-red-500' : ev.status === 'cooldown' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}
          >
            {ev.status}
          </span>
        </td>
        <td className="px-3 py-2 text-base">{formatTime(ev.startedAt)}</td>
        {showEnded ? (
          <td className="px-3 py-2 text-base">{ev.endedAt ? formatTime(ev.endedAt) : '-'}</td>
        ) : (
          <td className="px-3 py-2 text-base">{formatTime(ev.lastSeenAt)}</td>
        )}
        <td className="px-3 py-2 text-base">
          <button onClick={onToggle} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
            {isOpen ? 'Tutup' : 'Detail'}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-gray-50">
          <td colSpan="6" className="px-4 py-3">
            <div className="border-l-4 border-gray-400 pl-4 space-y-2 max-h-96 overflow-y-auto">
              <div className="text-base"><span className="font-semibold">Rule ID:</span> {ev.ruleId}</div>
              {!showEnded && ev.cooldownUntil && (
                <div className="text-base"><span className="font-semibold">Cooldown until:</span> {formatTime(ev.cooldownUntil)}</div>
              )}
              <div className="text-base">
                <span className="font-semibold">Evidence:</span>
                <div className="mt-1">{renderEvidence(ev.evidence, ev.type)}</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const EventTable = ({ events, activeCount, showEnded = false }) => {
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 flex-shrink-0 px-1">
        <h4 className="font-semibold text-xl">Event</h4>
        <span className="bg-red-500 text-white px-3 py-1 rounded text-sm">{activeCount} Aktif</span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-base border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Event</th>
              <th className="border px-3 py-2 text-left">Status</th>
              <th className="border px-3 py-2 text-left">Mulai</th>
              <th className="border px-3 py-2 text-left">{showEnded ? 'Berakhir' : 'Last Seen'}</th>
              <th className="border px-3 py-2 text-left">Detail</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <EventRow
                key={ev.id}
                ev={ev}
                isOpen={openRow === ev.id}
                onToggle={() => toggleRow(ev.id)}
                showEnded={showEnded}
              />
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">Tidak ada event</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};