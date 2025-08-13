import React, { useState, useEffect } from "react";

const FloatingFlood = ({ setShowWeather }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rainfallAmount, setRainfallAmount] = useState(25);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [isFloodLayerLoading, setIsFloodLayerLoading] = useState(false);
  const [floodData, setFloodData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const locations = [{ id: 1, name: "DAS Jakarta" }];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
  };

  const handleRainfallChange = (e) => {
    setRainfallAmount(parseInt(e.target.value));
  };

  const runSimulation = async () => {
    console.log("[FloatingFlood] Running simulation...");
    setIsDataLoading(true);
    try {
      // Fetch the flood data
      const response = await fetch(
        "/data/Average_Flood_Depth_2024_EPSG_4326.geojson"
      );
      const data = await response.json();

      // Process the data to include hazard levels and coordinates
      const processedData = data.features.map((feature, index) => {
        // Get the centroid of the feature for map centering
        let lng, lat;
        if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates?.[0]?.[0]) {
          // Simple centroid calculation for polygon (first coordinate of first ring)
          [lng, lat] = feature.geometry.coordinates[0][0];
          console.log(`Processed Polygon feature ${index}:`, { lng, lat }, feature.properties);
        } else if (feature.geometry?.type === 'Point' && feature.geometry.coordinates) {
          // For point features
          [lng, lat] = feature.geometry.coordinates;
          console.log(`Processed Point feature ${index}:`, { lng, lat }, feature.properties);
        } else {
          console.warn(`Could not process geometry for feature ${index}:`, feature.geometry);
        }
        
        return {
          ...feature.properties,
          lng,
          lat,
          hazardLevel:
            feature.properties.Max_height > 50
              ? "High"
              : feature.properties.Max_height > 20
              ? "Medium"
              : "Low",
        };
      });

      setFloodData(processedData);
    } catch (error) {
      console.error("Error fetching flood data:", error);
    } finally {
      setIsDataLoading(false);
      setSimulationRunning(true);
      setShowWeather(false);
    }
  };

  const goBack = () => {
    setSimulationRunning(false);
    setShowWeather(true);
    setFloodData([]);
    // Dispatch event to hide the flood layer on the map
    window.dispatchEvent(
      new CustomEvent("simulationStateChange", {
        detail: { isActive: false, rainfall: 0 },
      })
    );
  };

  useEffect(() => {
    const handleFloodLayerStateChange = (event) => {
      setIsFloodLayerLoading(event.detail.loading);
    };

    window.addEventListener(
      "floodLayerStateChange",
      handleFloodLayerStateChange
    );

    return () => {
      window.removeEventListener(
        "floodLayerStateChange",
        handleFloodLayerStateChange
      );
    };
  }, []);

  useEffect(() => {
    // This effect synchronizes the simulation state with the map component.
    // It runs when the simulation is started, or when the rainfall amount is changed
    // during an active simulation.
    if (simulationRunning) {
      const detail = {
        isActive: simulationRunning,
        rainfall: rainfallAmount,
      };
      console.log("[FloatingFlood] Dispatching simulationStateChange:", detail);
      window.dispatchEvent(
        new CustomEvent("simulationStateChange", { detail })
      );
    }
    // When simulationRunning is false, the goBack function handles hiding the layer.
  }, [simulationRunning, rainfallAmount]);

  if (simulationRunning) {
    return (
      <div className="hidden sm:flex flex-col z-10 absolute w-[20.75rem] bg-white rounded-md left-6 overflow-hidden transition-all ease-in-out duration-300 top-[8rem] h-[calc(100%-9.5rem)]">
        <header className="px-3 pt-2 pb-2">
          <p className="text-grey-950 font-medium">Flood Simulation</p>
          <p className="text-xs text-grey-600">
            Forecast flood inundation from a database of pre-computed
            generation/propagation forecasts
          </p>
        </header>
        <div className="flex flex-col flex-1 p-2 overflow-hidden">
          {isFloodLayerLoading || isDataLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-grey-600">Loading simulation data...</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-2 p-2">
                {floodData.length > 0 ? (
                  floodData.map((item, index) => {
                    const warningColor =
                      {
                        High: "bg-red-500",
                        Medium: "bg-yellow-500",
                        Low: "bg-green-500",
                      }[item.hazardLevel] || "bg-gray-300";

                    const location = [
                      item.WADMKK,
                      item.WADMKC,
                      item.WADMKD || item.kelurahan,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    const handleCardClick = () => {
                      if (item.lng && item.lat) {
                        window.dispatchEvent(new CustomEvent('showFloodPopup', {
                          detail: { 
                            floodData: {
                              ...item,
                              lng: item.lng,
                              lat: item.lat
                            }
                          }
                        }));
                      } else {
                        console.warn('No coordinates available for this location');
                      }
                    };

                    return (
                      <div 
                        key={index} 
                        className="rounded-sm cursor-pointer bg-white p-2 shadow-sm mb-2 border border-gray-100 hover:border-blue-300 transition-colors"
                        onClick={handleCardClick}
                      >
                        <div className="flex gap-2">
                          <div className={`rounded-sm py-1 px-2 flex items-center ${warningColor} text-white`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 20"
                              className="w-4 h-4"
                            >
                              <path
                                fill="currentColor"
                                d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667Z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">
                              Warning status: {item.hazardLevel}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              {location || "Unknown location"}
                            </p>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>
                                Max: {item.Max_height?.toFixed(1) || "N/A"} cm
                              </span>
                              <span>
                                Avg: {item.Avg_height?.toFixed(1) || "N/A"} cm
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No flood data available.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {}}
                className="w-full focus:outline-none h-12 font-medium rounded-md text-sm shadow-sm text-white bg-blue-600 hover:bg-blue-700 mb-2"
              >
                Flood Vulnerability
              </button>
              <button
                type="button"
                onClick={goBack}
                className="w-full focus:outline-none h-12 font-medium rounded-md text-sm shadow-sm text-white bg-[#636059] hover:bg-gray-700"
              >
                Stop Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-8 top-65 w-80 bg-white/90 rounded-2xl shadow-lg z-30">
      <div className="flex flex-col p-4 space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[#161414] text-xl font-semibold">
            Flood Simulation
          </p>
        </div>
        <p className="text-[#665e5e] text-xs">
          Forecast flood inundation from a database of pre-computed
          generation/propagation forecasts
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-grey-950 font-medium">
              Select Flood Location
            </p>
            <div className="relative mt-1">
              <button
                className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="block truncate">
                  {selectedLocation
                    ? selectedLocation.name
                    : "-Select Regency/City-"}
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
              Rainfall Amount: {rainfallAmount}mm/day
            </p>
            <div className="mt-1">
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
                <span>25mm</span>
                <span>50mm</span>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={!selectedLocation}
          onClick={runSimulation}
          className="w-full justify-center rounded-md bg-[#636059] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
};

export default FloatingFlood;
