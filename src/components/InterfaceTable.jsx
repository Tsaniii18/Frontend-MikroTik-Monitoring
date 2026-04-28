import React from 'react';

export const InterfaceTable = ({ interfaces }) => {
  const upCount = interfaces.filter((i) => !i.disabled && i.status === 'up').length;
  const downCount = interfaces.filter((i) => !i.disabled && i.status !== 'up').length;
  const disabledCount = interfaces.filter((i) => i.disabled).length;

  const getDisplayStatus = (iface) => {
    if (iface.disabled) return 'disabled';
    return iface.status === 'up' ? 'up' : 'down';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'up':
        return <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Up</span>;
      case 'down':
        return <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">Down</span>;
      case 'disabled':
        return <span className="bg-gray-500 text-white px-2 py-1 rounded text-sm">Disabled</span>;
      default:
        return <span className="bg-gray-400 text-white px-2 py-1 rounded text-sm">Unknown</span>;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-lg">Interface</h4>
        <div>
          <span className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-1">{upCount} Up</span>
          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm mr-1">{downCount} Down</span>
          <span className="bg-gray-500 text-white px-2 py-1 rounded text-sm">{disabledCount} Disabled</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Nama</th>
              <th className="border px-4 py-2 text-left">Tipe</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {interfaces.length === 0 ? (
              <tr>
                <td colSpan="4" className="border px-4 py-2 text-center text-gray-500">
                  Tidak ada data interface
                </td>
              </tr>
            ) : (
              interfaces.map((iface, idx) => {
                const displayStatus = getDisplayStatus(iface);

                return (
                  <tr key={iface.id || idx}>
                    <td className="border px-4 py-2">{iface.id ?? '-'}</td>
                    <td className="border px-4 py-2">{iface.name ?? '-'}</td>
                    <td className="border px-4 py-2">{iface.type ?? '-'}</td>
                    <td className="border px-4 py-2">
                      {getStatusBadge(displayStatus)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};