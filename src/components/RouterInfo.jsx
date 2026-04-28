import React from 'react';

export const RouterInfo = ({ router, uptime, onLogout }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-800 text-base">
          Router Info ( {router.ip || '-'} )
        </h4>
        <button
          onClick={onLogout}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-gray-400">Nama</p>
          <p className="font-medium text-gray-800">{router.name || '-'}</p>
        </div>
        <div>
          <p className="text-gray-400">Board</p>
          <p className="font-medium text-gray-800">{router.board || '-'}</p>
        </div>
        <div>
          <p className="text-gray-400">Uptime</p>
          <p className="font-medium text-gray-800">{uptime || '-'}</p>
        </div>

        <div>
          <p className="text-gray-400">Platform</p>
          <p className="font-medium text-gray-800">{router.platform || '-'}</p>
        </div>
        <div>
          <p className="text-gray-400">Arsitektur</p>
          <p className="font-medium text-gray-800">{router.architecture || '-'}</p>
        </div>
        <div></div>

        <div>
          <p className="text-gray-400">Versi</p>
          <p className="font-medium text-gray-800">{router.version || '-'}</p>
        </div>
        <div>
          <p className="text-gray-400">CPU</p>
          <p className="font-medium text-gray-800">
            {router.cpu ? `${router.cpu} (${router.cpu_count || '?'} core)` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};