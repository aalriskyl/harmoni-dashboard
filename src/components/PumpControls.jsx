import React, { useState } from 'react';

const PumpControls = ({ onTogglePumps }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPumps, setShowPumps] = useState(true);

  const togglePumps = () => {
    const newState = !showPumps;
    setShowPumps(newState);
    if (onTogglePumps) {
      onTogglePumps(newState);
    }
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg"
          aria-label="Toggle pump controls"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>

        {/* Controls Panel */}
        {isOpen && (
          <div className="p-4 bg-white border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Pump Controls</h3>
            <div className="flex items-center">
              <button
                onClick={togglePumps}
                className={`px-3 py-1 text-sm rounded-md ${
                  showPumps
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {showPumps ? 'Hide Pumps' : 'Show Pumps'}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {showPumps ? 'Pumps are visible' : 'Pumps are hidden'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PumpControls;
