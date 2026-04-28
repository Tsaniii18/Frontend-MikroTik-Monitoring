import React from 'react';

export const RouterInfo = ({ router, uptime, onLogout }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-4">
      <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
        <div>
          <h4 className="font-bold text-xl text-gray-800">
            Router Information
          </h4>
          <p className="text-md text-gray-500 mt-0.5">( {router.ip || '-'} )</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Nama Router</p>
          <p className="font-semibold text-gray-800 mt-1">{router.name || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Platform</p>
          <p className="font-semibold text-gray-800 mt-1">{router.platform || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Versi</p>
          <p className="font-semibold text-gray-800 mt-1">{router.version || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Arsitektur</p>
          <p className="font-semibold text-gray-800 mt-1">{router.architecture || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Board</p>
          <p className="font-semibold text-gray-800 mt-1">{router.board || '-'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">CPU</p>
          <p className="font-semibold text-gray-800 mt-1">
            {router.cpu ? `${router.cpu} (${router.cpu_count || '?'} core)` : '-'}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Memory Total</p>
          <p className="font-semibold text-gray-800 mt-1">{router.total_memory || '-'} MB</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Uptime</p>
          <p className="font-semibold text-gray-800 mt-1">{uptime || '-'}</p>
        </div>
      </div>
    </div>
  );
};