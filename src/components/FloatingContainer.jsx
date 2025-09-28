import React, { useState, useEffect } from "react";
import Timeline from "../components/Timeline";
import ModelAccuracy from "../components/ModelAccuracy";

const FloatingContainer = ({ onRun }) => {
  // Legend component reused from FloatingFlood to keep consistent look
  const Legend = ({ viewMode, className = "" }) => {
    const getLegendConfig = () => {
      switch (viewMode) {
        case "simulation":
          return {
            title: "Flood Depth (m)",
            gradient:
              "bg-gradient-to-r from-green-500 via-yellow-400 to-red-600",
            labels: ["0", "0.76", "1.5", "3.0+"],
            categories: ["Rendah", "Sedang", "Tinggi"],
            colors: ["bg-green-600", "bg-yellow-600", "bg-red-600"],
          };
        case "vulnerability":
          return {
            title: "Vulnerability Level",
            gradient:
              "bg-gradient-to-r from-green-500 via-yellow-400 to-red-600",
            labels: ["0", "0.3", "0.6", "1.0"],
            categories: ["Rendah", "Sedang", "Tinggi"],
            colors: ["bg-green-600", "bg-yellow-600", "bg-red-600"],
          };
        case "risk":
          return {
            title: "Risk Level",
            gradient:
              "bg-gradient-to-r from-green-500 via-yellow-400 to-red-600",
            labels: ["0", "0.3", "0.6", "1.0"],
            categories: ["Rendah", "Sedang", "Tinggi"],
            colors: ["bg-green-600", "bg-yellow-600", "bg-red-600"],
          };
        default:
          return {
            title: "Flood Depth (m)",
            gradient:
              "bg-gradient-to-r from-green-500 via-yellow-400 to-red-600",
            labels: ["0", "0.5", "1.0", "1.5+"],
            categories: ["Rendah", "Sedang", "Tinggi"],
            colors: ["bg-green-600", "bg-yellow-600", "bg-red-600"],
          };
      }
    };

    const { title, gradient, labels } = getLegendConfig();

    return (
      <div
        className={`fixed bottom-[11.2vh] right-24 z-40 ${className}`}
        aria-hidden={false}
      >
        <div className="flex items-center gap-3 bg-white/0 p-1 rounded flex-nowrap">
          <div className="text-sm bg-white rounded-md  px-3 py-2 font-semibold text-gray-800 flex-shrink-0 whitespace-nowrap items-center">
            {title}
          </div>

          <div className="relative flex-shrink-0">
            <div className="relative w-40 h-8 rounded overflow-hidden">
              <div className={`${gradient} w-full h-full`}></div>
            </div>
            <div className="absolute left-0 right-0 top-full mt-1 flex justify-between text-xs text-gray-800 w-40">
              {labels.slice(0, 4).map((label, index) => (
                <span className="text-gray-800" key={index}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // mode for legend styling: 'simulation' | 'vulnerability' | 'risk'
  const [viewMode, setViewMode] = useState("simulation");
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

  // Run and also dispatch the raster overlay event so Map shows the return-period raster
  const runAndShowRaster = (mode = "hazard") => {
    // call external handler if provided
    if (onRun) onRun({ location: selectedLocation, rainfall: rainfallAmount });

    // map return period to available raster levels (only 4 rasters, last two share)
    const rpToRaster = {
      5: "25",
      10: "50",
      20: "75",
      50: "150",
      100: "150",
    };

    const rpKey =
      returnPeriods.find((rp) => rp.label === selectedReturnPeriod)?.id || "5";
    const rainfallLevel = rpToRaster[rpKey] || "25";

    const prefix = mode === "risk" ? "Risk" : "Hazzard"; // match FloatingFlood naming
    // set view mode for legend display
    setViewMode(mode === "risk" ? "risk" : "simulation");
    const imagePath = `/assets/img/Flood_${prefix}_-_${rainfallLevel}_mm.png`;

    console.log("[FloatingContainer] dispatching updateFloodImage", {
      imagePath,
      mode,
      selectedReturnPeriod,
    });

    window.dispatchEvent(
      new CustomEvent("updateFloodImage", { detail: { imagePath } })
    );
    // mark simulation active so other components (MainPage) can show model accuracy
    try {
      window.dispatchEvent(
        new CustomEvent("simulationStateChange", {
          detail: {
            isActive: true,
            rainfall: Number(rainfallLevel),
            showVulnerability: false,
            hideFloodLayer: false,
          },
        })
      );
    } catch (e) {}
    // track local running state
    setSimulationRunning(true);
  };

  // local simulation state for UI
  const [simulationRunning, setSimulationRunning] = useState(false);

  const stopSimulation = () => {
    setSimulationRunning(false);
    try {
      window.dispatchEvent(
        new CustomEvent("updateFloodImage", { detail: { imagePath: null } })
      );
    } catch (e) {}
    try {
      window.dispatchEvent(
        new CustomEvent("timelineRasterChange", {
          detail: { path: null, index: null },
        })
      );
    } catch (e) {}
    try {
      window.dispatchEvent(
        new CustomEvent("simulationStateChange", {
          detail: {
            isActive: false,
            rainfall: 0,
            showVulnerability: false,
            hideFloodLayer: false,
          },
        })
      );
    } catch (e) {}
  };

  // Timeline -> raster handler
  const handleTimelineRasterChange = (raster) => {
    // raster is expected to be an object { path, index }
    try {
      window.dispatchEvent(
        new CustomEvent("timelineRasterChange", { detail: raster })
      );
    } catch (e) {}
    if (raster && raster.path) {
      try {
        window.dispatchEvent(
          new CustomEvent("updateFloodImage", {
            detail: { imagePath: raster.path },
          })
        );
      } catch (e) {}
    }
  };

  return (
    <div className="w-[332px] bg-white/90 rounded-2xl shadow-lg">
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
            Simulate floods based on return period scenarios using Artificial
            Intelligence (AI) or Hydrodynamic model.
          </p>
          <div className="relative mt-4">
            <p className="text-sm text-grey-950 font-medium">
              Select your catchment area:
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
            Select your return period scenario:
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
          {!simulationRunning ? (
            <>
              <button
                type="button"
                onClick={() => runAndShowRaster("hazard")}
                className={`w-full text-center rounded-md bg-[#636059] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700`}
                disabled={!selectedLocation}
              >
                AI-Based Flood Simulation
              </button>
              <button
                type="button"
                onClick={() => runAndShowRaster("risk")}
                className={`w-full text-center rounded-md bg-[#a49d93] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700`}
                disabled={!selectedLocation}
              >
                Hydrodynamic-Based Flood Simulation
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={stopSimulation}
              className={`w-full text-center rounded-md bg-[#636059] px-3 py-2 text-sm font-semibold text-white shadow-sm`}
            >
              Stop Simulation
            </button>
          )}
        </div>

        {/* Timeline - shown regardless; it will be interactive when simulation starts */}
        {simulationRunning && (
          <Timeline onRasterChange={handleTimelineRasterChange} />
        )}

        {/* Legend matching Flood Simulation */}
        {simulationRunning && <Legend viewMode={viewMode} />}

        {/* ModelAccuracy is rendered by MainPage when a simulation is active; avoid duplicating here */}
      </div>
    </div>
  );
};

export default FloatingContainer;
