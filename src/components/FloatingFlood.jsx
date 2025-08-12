import React, { useState } from "react";

const FloatingFlood = ({ setShowWeather }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rainfallAmount, setRainfallAmount] = useState(30);
  const [simulationRunning, setSimulationRunning] = useState(false);

  const locations = [{ id: 1, name: "DAS Jakarta" }];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
  };

  const handleRainfallChange = (e) => {
    setRainfallAmount(parseInt(e.target.value));
  };

  const runSimulation = () => {
    setSimulationRunning(true);
    setShowWeather(false);
  };

  const goBack = () => {
    setSimulationRunning(false);
    setShowWeather(true);
  };

  if (simulationRunning) {
    return (
      <div className="hidden sm:flex flex-col z-10 absolute w-[20.75rem] bg-grey-100 rounded-md left-6 overflow-hidden transition-all ease-in-out duration-300 top-[8rem] h-[calc(100%-9.5rem)] bg-white">
        <header className="px-3 pt-3 pb-2">
          <p className="text-grey-950 font-medium">Flood Simulation</p>
          <p className="text-xs text-grey-600">
            Forecast flood inundation from a database of pre-computed
            generation/propagation forecasts
          </p>
        </header>
        <div className="flex flex-col gap-4 flex-1 px-0 sm:px-1 py-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 py-1 space-y-2">
            <div className="space-y-2">
              <div className="rounded-xxs cursor-pointer bg-white rounded-sm p-2 shadow-sm mb-2">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-[#EC8819] text-grey-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="nuxt-icon--fill w-4 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">
                      Warning status Caution at
                    </p>
                    <p className="text-sm font-medium capitalize">
                      River Segment R37 Daerah Aliran Sungai Kulon Progo
                    </p>
                    <p className="text-2xs font-medium pb-1">Kulon Progo</p>
                  </div>
                  <div className="flex items-star">
                    <div className="relative w-5">
                      <button
                        type="button"
                        className="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0 font-medium rounded-md gap-x-1.5 dark:text-primary-400 hover:bg-primary-50 disabled:bg-transparent aria-disabled:bg-transparent dark:hover:bg-primary-950 dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 inline-flex items-center text-grey-700 text-[13px] p-0"
                      >
                        <span
                          className="iconify i-material-symbols-light:help-outline flex-shrink-0 h-4 w-4"
                          aria-hidden="true"
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xxs cursor-pointer bg-white rounded-sm p-2 shadow-sm mb-2">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-[#EC8819] text-grey-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="nuxt-icon--fill w-4 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">
                      Warning status Caution at
                    </p>
                    <p className="text-sm font-medium capitalize">
                      River Segment R42 Daerah Aliran Sungai Kulon Progo
                    </p>
                    <p className="text-2xs font-medium pb-1">Kulon Progo</p>
                  </div>
                  <div className="flex items-star">
                    <div className="relative w-5">
                      <button
                        type="button"
                        className="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0 font-medium rounded-md gap-x-1.5 dark:text-primary-400 hover:bg-primary-50 disabled:bg-transparent aria-disabled:bg-transparent dark:hover:bg-primary-950 dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 inline-flex items-center text-grey-700 text-[13px] p-0"
                      >
                        <span
                          className="iconify i-material-symbols-light:help-outline flex-shrink-0 h-4 w-4"
                          aria-hidden="true"
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xxs bg-white/70 cursor-pointer rounded-sm p-2 shadow-sm mb-2">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-[#EC8819] text-grey-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="nuxt-icon--fill w-4 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">
                      Warning status Caution at
                    </p>
                    <p className="text-sm font-medium capitalize">
                      River Segment R43 Daerah Aliran Sungai Kulon Progo
                    </p>
                    <p className="text-2xs font-medium pb-1">Kulon Progo</p>
                  </div>
                  <div className="flex items-star">
                    <div className="relative w-5">
                      <button
                        type="button"
                        className="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0 font-medium rounded-md gap-x-1.5 dark:text-primary-400 hover:bg-primary-50 disabled:bg-transparent aria-disabled:bg-transparent dark:hover:bg-primary-950 dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 inline-flex items-center text-grey-700 text-[13px] p-0"
                      >
                        <span
                          className="iconify i-material-symbols-light:help-outline flex-shrink-0 h-4 w-4"
                          aria-hidden="true"
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={goBack}
              className="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0 h-14 justify-center font-medium rounded-sm text-sm gap-x-1.5 px-2.5 py-1.5 dark:text-brand-400 disabled:bg-transparent aria-disabled:bg-transparent dark:hover:bg-brand-950 dark:disabled:bg-transparent dark:aria-disabled:bg-transparent dark:focus-visible:ring-brand-400 bg-transparent ring-1 ring-brand-500 ring-inset text-brand-400 hover:ring-brand-700 disabled:text-grey-600 disabled:ring-grey-600 disabled:hover:bg-transparent hover:bg-brand-100 focus-visible:ring-1 focus-visible:ring-brand-200 inline-flex items-center"
            >
              <span className="">Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-8 top-65 w-80 bg-white/90 rounded-2xl shadow-lg z-30">
      <div className="flex flex-col p-4 space-y-3">
        <div className="flex flex-col gap-2 overflow-hidden p-2 h-fit sm:h-full relative">
          <div className="w-full gap-1">
            <div className="flex items-center gap-2">
              <p className="text-[#161414] text-xl font-semibold">
                Flood Simulation
              </p>
              <div className="relative" data-headlessui-state="">
                <div
                  className="inline-flex w-full"
                  role="button"
                  id="headlessui-popover-button-v-0-0-53"
                  aria-expanded="false"
                  data-headlessui-state=""
                >
                  <button
                    type="button"
                    className="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0 font-medium rounded-md gap-x-1.5 p-1.5 dark:text-primary-400 hover:bg-primary-50 disabled:bg-transparent aria-disabled:bg-transparent dark:hover:bg-primary-950 dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 inline-flex items-center text-grey-700 text-[13px]"
                  >
                    <span
                      className="iconify i-material-symbols-light:help-outline flex-shrink-0 h-3.5 w-3.5 text-gray-500"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[#665e5e] text-[11px]">
              Forecast flood inundation from a database of pre-computed
              generation/propagation forecasts
            </p>
          </div>
          <div className="flex flex-col gap-4 flex-1 px-0 sm:px-1 py-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1 py-1 space-y-2">
              <div>
                <p className="text-sm text-grey-950 font-medium">
                  Select Flood Location
                </p>
                <div className="relative" data-headlessui-state="">
                  <div
                    id="headlessui-listbox-button-v-0-0-174"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    data-headlessui-state={isDropdownOpen ? "open" : ""}
                    role="button"
                    className="flex items-center w-full"
                  >
                    <button
                      className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 h-10 w-full font-medium inline-flex items-center text-left cursor-default rounded-md rounded-xxs text-sm gap-x-1.5 px-2 py-[10px] shadow-sm dark:bg-white ring-1 ring-inset dark:ring-gray-700 dark:focus:ring-primary-400 bg-white ring-grey-500 focus:ring-1 focus:ring-grey-500 pe-9 dark:text-gray-500 text-grey-800"
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="block truncate">
                        {selectedLocation
                          ? selectedLocation.name
                          : "-Select Regency/City-"}
                      </span>
                      <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-2.5">
                        <span
                          className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 dark:text-gray-500 text-grey-800 h-5 w-5"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {locations.map((location) => (
                        <div
                          key={location.id}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <span className="font-normal block truncate">
                            {location.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-grey-950 font-medium mt-3">
                  Rainfall Amount: {rainfallAmount}mm/day
                </p>
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={rainfallAmount}
                    onChange={handleRainfallChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0mm</span>
                    <span>30mm</span>
                    <span>50mm</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={!selectedLocation}
              onClick={runSimulation}
              className="focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0 h-14 justify-center font-medium rounded-sm text-sm gap-x-1.5 px-2.5 py-1.5 shadow-sm text-white disabled:text-grey-500 bg-[#636059] disabled:bg-grey-400 aria-disabled:bg-grey-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 inline-flex items-center"
            >
              <span className="text-white">Run Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingFlood;
