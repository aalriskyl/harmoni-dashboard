import React, { useState } from "react";

const FloatingContainer = ({ onRun }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedReturnPeriod, setSelectedReturnPeriod] = useState(
    "5-Year Return Period"
  );
  const [isReturnDropdownOpen, setIsReturnDropdownOpen] = useState(false);
  const [rainfallAmount, setRainfallAmount] = useState(25);

  const locations = [
    { id: 1, name: "DAS Ciliwung Cisadane" },
    { id: 2, name: "DAS Other Region" },
  ];

  const returnPeriods = [
    { id: "5", label: "5-Year Return Period" },
    { id: "10", label: "10-Year Return Period" },
    { id: "20", label: "20-Year Return Period" },
    { id: "50", label: "50-Year Return Period" },
    { id: "100", label: "100-Year Return Period" },
  ];

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setIsDropdownOpen(false);
  };

  const handleRun = () => {
    if (onRun) onRun({ location: selectedLocation, rainfall: rainfallAmount });
  };

  return (
    <div className="w-80 bg-white/90 rounded-2xl shadow-lg">
      <div className="flex flex-col p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#161414] text-xl font-semibold">
              Return Period Flood Simulation
            </p>
          </div>
        </div>

        {/* Select Location */}
        <div>
          <p className="text-sm text-grey-950 font-medium">
            Simulate Flood in real time using Artificial Intelligence (AI) or
            Hydrodynamic Models.
          </p>
          <div className="relative mt-4">
            <p className="text-sm text-grey-950 font-medium">
              Select your catchment area
            </p>
            <button
              className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="block truncate">
                {selectedLocation
                  ? selectedLocation.name
                  : "Select Return Period Flood Simulation"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <span className="block truncate font-normal">
                      {location.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-grey-950 font-medium">
            Select your return period scenario
          </p>
          <div className="relative mt-1">
            <button
              className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
              onClick={() => setIsReturnDropdownOpen((s) => !s)}
            >
              <span className="block truncate">
                {selectedReturnPeriod || "Select your return period scenario"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>

            {isReturnDropdownOpen && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {returnPeriods.map((rp) => (
                  <div
                    key={rp.id}
                    className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                    onClick={() => {
                      setSelectedReturnPeriod(rp.label);
                      setIsReturnDropdownOpen(false);
                    }}
                  >
                    <span className="block truncate font-normal">
                      {rp.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rainfall slider */}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRun}
            className={`w-full text-center rounded-md bg-[#636059] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700`}
            disabled={!selectedLocation}
          >
            AI Based Flood Simulation
          </button>
          <button
            type="button"
            onClick={handleRun}
            className={`w-full text-center rounded-md bg-[#a49d93] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700`}
            disabled={!selectedLocation}
          >
            Hydrodinamic Based Flood Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingContainer;
