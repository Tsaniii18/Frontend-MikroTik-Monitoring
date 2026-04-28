import React from 'react';

export const ToggleSwitch = ({ isRealtime, onToggle }) => {
  return (
    <div className="flex items-center space-x-3 mb-4">
      <span className={isRealtime ? 'font-semibold text-base' : 'text-gray-500 text-base'}>Realtime</span>
      <button
        onClick={onToggle}
        className={`w-12 h-6 flex items-center rounded-full p-1 ${isRealtime ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
            isRealtime ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={!isRealtime ? 'font-semibold text-base' : 'text-gray-500 text-base'}>History</span>
    </div>
  );
};