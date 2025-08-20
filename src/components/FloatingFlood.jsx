import React, { useState, useEffect } from "react";
import MapRaster from "./MapRaster";

const FloatingFlood = ({ setShowWeather }) => {
  const Legend = ({ viewMode, className = "" }) => {
    const getLegendConfig = () => {
      switch (viewMode) {
        case "simulation":
          return {
            title: "Flood Depth (m)",
            gradient:
              "bg-gradient-to-t from-green-500 via-yellow-400 to-red-600", // vertical
            labels: ["0", "0.76", "1.5", "3.0+"],
            categories: ["Tinggi", "Sedang", "Rendah"], // Inverted order
            colors: ["bg-red-600", "bg-yellow-600", "bg-green-600"], // Changed to background colors
          };
        case "vulnerability":
          return {
            title: "Vulnerability Level",
            gradient:
              "bg-gradient-to-t from-green-500 via-yellow-400 to-red-600",
            labels: ["0", "0.3", "0.6", "1.0"],
            categories: ["Tinggi", "Sedang", "Rendah"], // Inverted order
            colors: ["bg-red-600", "bg-yellow-600", "bg-green-600"], // Changed to background colors
          };
        case "risk":
          return {
            title: "Risk Level",
            gradient:
              "bg-gradient-to-t from-green-500 via-yellow-400 to-red-600",
            labels: ["0", "0.3", "0.6", "1.0"],
            categories: ["Tinggi", "Sedang", "Rendah"], // Inverted order
            colors: ["bg-red-600", "bg-yellow-600", "bg-green-600"], // Changed to background colors
          };
        default:
          return {
            title: "Flood Depth (m)",
            gradient:
              "bg-gradient-to-t from-green-500 via-yellow-400 to-red-600",
            labels: ["0", "0.5", "1.0", "1.5+"],
            categories: ["Tinggi", "Sedang", "Rendah"], // Inverted order
            colors: ["bg-red-600", "bg-yellow-600", "bg-green-600"], // Changed to background colors
          };
      }
    };

    const { title, gradient, labels, categories, colors } = getLegendConfig();

    return (
      <div
        className={`absolute bottom-[80px] right-[2px] bg-white/90 p-3 rounded-md shadow-md z-20 border border-gray-200 ${className}`}
      >
        <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>

        <div className="flex gap-4">
          {/* Left side - Categories with color indicators */}
          <div className="flex flex-col justify-between h-40 py-1">
            {categories.map((category, index) => {
              // Use the provided background color classes directly
              const colorClass = colors[index] || "bg-gray-400";
              return (
                <div key={index} className="flex items-center h-1/3">
                  <div
                    className={`w-4 h-4 rounded-sm mr-2 ${colorClass}`}
                  ></div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {category}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right side - Gradient bar with labels */}
          <div className="flex items-center gap-2">
            {/* Gradient Vertical Bar */}
            <div className="relative w-6 h-40 rounded overflow-hidden">
              <div className={`w-full h-full ${gradient}`}></div>
            </div>

            {/* Scale Labels - Ensure we have the correct number of labels */}
            <div className="flex flex-col justify-between h-40 text-xs text-gray-600 py-1">
              {labels.slice(0, 4).map((label, index) => (
                <span key={index} className="h-1/3 flex items-end">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rainfallAmount, setRainfallAmount] = useState(25);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [isFloodLayerLoading, setIsFloodLayerLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showRasterMap, setShowRasterMap] = useState(false);
  const [viewMode, setViewMode] = useState("simulation"); // 'simulation', 'vulnerability', 'risk'

  const locations = [{ id: 1, name: "DAS Jakarta" }];

  // Dummy data for different view modes
  const dummyVulnerabilityData = [
    {
      id: 1,
      hazardLevel: "Tinggi (Alert)",
      location: "Kelurahan A, Kecamatan X",
      Max_height: 2.1,
      Avg_height: 1.8,
      populationDensity: "High",
      infrastructureRisk: "Critical",
    },
    {
      id: 2,
      hazardLevel: "Sedang (Cautious)",
      location: "Kelurahan B, Kecamatan Y",
      Max_height: 1.2,
      Avg_height: 0.9,
      populationDensity: "Medium",
      infrastructureRisk: "Moderate",
    },
  ];

  const dummyRiskData = [
    {
      id: 1,
      hazardLevel: "Critical Risk",
      location: "Kelurahan A, Kecamatan X",
      floodDepth: 2.1,
      economicImpact: "High",
      evacuationPriority: "Immediate",
    },
    {
      id: 2,
      hazardLevel: "High Risk",
      location: "Kelurahan C, Kecamatan Z",
      floodDepth: 1.8,
      economicImpact: "Medium",
      evacuationPriority: "High",
    },
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
  };

  const updateFloodImage = (rainfall, mode) => {
    const imagePath = getImagePath(rainfall, mode);
    window.dispatchEvent(
      new CustomEvent("updateFloodImage", {
        detail: { imagePath },
      })
    );
  };

  const handleRainfallChange = (e) => {
    const newRainfall = parseInt(e.target.value);
    setRainfallAmount(newRainfall);
    if (simulationRunning) {
      updateFloodImage(newRainfall, viewMode === "risk" ? "risk" : "hazard");
    }
  };

  // Function to get the appropriate image path based on rainfall amount and view mode
  const getImagePath = (rainfall, mode) => {
    let rainfallLevel;
    const prefix = mode === "risk" ? "Risk" : "Hazzard";

    if (mode === "risk") {
      // For Risk view
      if (rainfall <= 25) rainfallLevel = "25";
      else if (rainfall <= 75) rainfallLevel = "75";
      else if (rainfall <= 100) rainfallLevel = "100";
      else rainfallLevel = "125"; // 101-150 for risk view
    } else {
      // For Hazard view
      if (rainfall <= 25) rainfallLevel = "25";
      else if (rainfall <= 75) rainfallLevel = "75";
      else if (rainfall <= 100) rainfallLevel = "100";
      else rainfallLevel = "150"; // 101-150 for hazard view
    }

    const imagePath = `/assets/img/Flood_${prefix}_-_${rainfallLevel}_mm.png`;
    console.log(`[getImagePath] Generated path: ${imagePath}`, { rainfall, mode, rainfallLevel });
    return imagePath;
  };

  const runSimulation = async () => {
    console.log("[FloatingFlood] Running simulation...");
    setIsDataLoading(true);
    try {
      const response = await fetch(
        "/data/Average_Flood_Depth_2024_EPSG_4326.geojson"
      );
      const data = await response.json();

      const processedData = data.features.map((feature) => {
        let lng, lat;
        if (
          feature.geometry?.type === "Polygon" &&
          feature.geometry.coordinates?.[0]?.[0]
        ) {
          [lng, lat] = feature.geometry.coordinates[0][0];
        } else if (
          feature.geometry?.type === "Point" &&
          feature.geometry.coordinates
        ) {
          [lng, lat] = feature.geometry.coordinates;
        }

        return {
          ...feature.properties,
          lng,
          lat,
          hazardLevel:
            feature.properties.Max_height >= 1.5
              ? "Tinggi (Alert)"
              : feature.properties.Max_height >= 0.76
              ? "Sedang (Cautious)"
              : "Rendah (Normal)",
        };
      });

      setCurrentData(processedData);
      setViewMode("simulation");
      setSimulationRunning(true);
      setShowWeather(false);

      // Get the appropriate image path based on current view mode and rainfall
      const imagePath = getImagePath(
        rainfallAmount,
        viewMode === "risk" ? "risk" : "hazard"
      );

      // Show vulnerability layer by default after running simulation
      const shouldShowVulnerability =
        viewMode === "vulnerability" || viewMode === "risk";

      // Dispatch event with the image path
      window.dispatchEvent(
        new CustomEvent("updateFloodImage", {
          detail: { imagePath },
        })
      );
      window.dispatchEvent(
        new CustomEvent("simulationStateChange", {
          detail: {
            isActive: true,
            rainfall: rainfallAmount,
            showVulnerability:
              shouldShowVulnerability || viewMode === "simulation",
            hideFloodLayer: viewMode === "risk",
          },
        })
      );

      // If in simulation mode, ensure the flood layer is visible
      if (viewMode === "simulation") {
        window.dispatchEvent(
          new CustomEvent("showVulnerabilityLayer", {
            detail: { show: false, hideFloodLayer: false },
          })
        );
      }
    } catch (error) {
      console.error("Error fetching flood data:", error);
    } finally {
      setIsDataLoading(false);
      setSimulationRunning(true);
      setShowWeather(false);
    }
  };

  const goBack = () => {
    // First hide the vulnerability layer
    window.dispatchEvent(
      new CustomEvent("showVulnerabilityLayer", {
        detail: {
          show: false,
          hideFloodLayer: false,
        },
      })
    );

    // Then reset all states
    setSimulationRunning(false);
    setShowWeather(true);
    setCurrentData([]);
    setViewMode("simulation");
    setRainfallAmount(25);

    // Finally, update simulation state
    setTimeout(() => {
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
    }, 100);
  };

  const cycleViewMode = () => {
    setViewMode((prevMode) => {
      let newMode = prevMode;

      // Clean up layers when switching views
      if (prevMode === "vulnerability") {
        // Hide vulnerability layer when switching away from it
        window.dispatchEvent(
          new CustomEvent("showVulnerabilityLayer", {
            detail: { show: false },
          })
        );
      } else if (prevMode === "simulation") {
        // Clear any flood/risk image when switching to vulnerability
        window.dispatchEvent(
          new CustomEvent("updateFloodImage", {
            detail: { imagePath: null },
          })
        );
      } else if (prevMode === "risk") {
        // Ensure vulnerability layer is hidden when switching to risk
        window.dispatchEvent(
          new CustomEvent("showVulnerabilityLayer", {
            detail: { show: false },
          })
        );
      }

      if (prevMode === "simulation") {
        setCurrentData(dummyVulnerabilityData);
        newMode = "vulnerability";
      } else if (prevMode === "vulnerability") {
        setCurrentData(dummyRiskData);
        newMode = "risk";
      } else if (prevMode === "risk") {
        setCurrentData([]);
        newMode = "simulation";
      }

      // Update the flood image when view mode changes
      if (simulationRunning) {
        updateFloodImage(
          rainfallAmount,
          newMode === "risk" ? "risk" : "hazard"
        );
      }

      // Update simulation state to control layer visibility
      window.dispatchEvent(
        new CustomEvent("simulationStateChange", {
          detail: {
            isActive: simulationRunning,
            rainfall: rainfallAmount,
            showVulnerability:
              newMode === "vulnerability" || newMode === "risk",
            hideFloodLayer: newMode === "risk",
          },
        })
      );

      return newMode;
    });
  };

  // Handle initial load and simulation state changes
  useEffect(() => {
    if (simulationRunning) {
      const shouldShowVulnerability =
        viewMode === "vulnerability" || viewMode === "risk";

      window.dispatchEvent(
        new CustomEvent("simulationStateChange", {
          detail: {
            isActive: true,
            rainfall: rainfallAmount,
            showVulnerability: shouldShowVulnerability,
            hideFloodLayer: viewMode === "risk",
          },
        })
      );
    }
  }, [viewMode, simulationRunning, rainfallAmount]);

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
    if (simulationRunning) {
      const detail = {
        isActive: simulationRunning,
        rainfall: rainfallAmount,
      };
      window.dispatchEvent(
        new CustomEvent("simulationStateChange", { detail })
      );
    }
  }, [simulationRunning, rainfallAmount]);

  const getHeaderContent = () => {
    switch (viewMode) {
      case "simulation":
        return {
          title: "Flood Simulation",
          description: "Showing flood simulation results",
        };
      case "vulnerability":
        return {
          title: "Flood Vulnerability",
          description: "Showing flood vulnerability assessment",
        };
      case "risk":
        return {
          title: "Flood Risk",
          description: "Showing combined flood risk analysis",
        };
      default:
        return {
          title: "Flood Simulation",
          description: "Showing flood simulation results",
        };
    }
  };

  const getButtonText = () => {
    switch (viewMode) {
      case "simulation":
        return "Show Vulnerability";
      case "vulnerability":
        return "Show Risk";
      case "risk":
        return null; // Hide button when in risk view
      default:
        return "Show Vulnerability";
    }
  };

  const renderDataItem = (item, index) => {
    const warningColor =
      item.hazardLevel?.includes("Tinggi") ||
      item.hazardLevel?.includes("Critical")
        ? "bg-red-500"
        : item.hazardLevel?.includes("Sedang") ||
          item.hazardLevel?.includes("High")
        ? "bg-yellow-500"
        : "bg-green-500";

    const handleCardClick = () => {
      if (item.lng && item.lat) {
        window.dispatchEvent(
          new CustomEvent("centerMapOnCoordinates", {
            detail: {
              lng: item.lng,
              lat: item.lat,
              zoom: 14,
            },
          })
        );

        window.dispatchEvent(
          new CustomEvent("showFloodPopup", {
            detail: {
              floodData: item,
              lng: item.lng,
              lat: item.lat,
            },
          })
        );
      }
    };

    return (
      <div
        key={index}
        className="rounded-sm cursor-pointer bg-white p-2 shadow-sm mb-2 border border-gray-100 hover:border-blue-300 transition-colors"
        onClick={handleCardClick}
      >
        <div className="flex gap-2">
          <div
            className={`rounded-sm py-1 px-2 flex items-center ${warningColor} text-white`}
          >
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
              {viewMode === "simulation" && "Flood Hazard Level: "}
              {viewMode === "vulnerability" && "Vulnerability Level: "}
              {viewMode === "risk" && "Risk Level: "}
              {item.hazardLevel}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              {item.location || item.WADMKK
                ? [item.WADMKK, item.WADMKC, item.WADMKD]
                    .filter(Boolean)
                    .join(", ")
                : "Unknown location"}
            </p>

            {viewMode === "simulation" && (
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Max: {item.Max_height?.toFixed(1) || "N/A"} cm</span>
                <span>Avg: {item.Avg_height?.toFixed(1) || "N/A"} cm</span>
              </div>
            )}

            {viewMode === "vulnerability" && (
              <div className="text-xs text-gray-600 mt-1 space-y-1">
                <div>Population Density: {item.populationDensity}</div>
                <div>Infrastructure Risk: {item.infrastructureRisk}</div>
              </div>
            )}

            {viewMode === "risk" && (
              <div className="text-xs text-gray-600 mt-1 space-y-1">
                <div>Flood Depth: {item.floodDepth?.toFixed(1) || "N/A"} m</div>
                <div>Economic Impact: {item.economicImpact}</div>
                <div>Evacuation Priority: {item.evacuationPriority}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const headerContent = getHeaderContent();
  const buttonText = getButtonText();

  if (simulationRunning) {
    return (
      <div className="floating-flood">
        {showRasterMap ? (
          <MapRaster
            onClose={() => setShowRasterMap(false)}
            floodData={currentData}
          />
        ) : (
          <>
            <div className="fixed bottom-4 right-4 z-50">
              <Legend viewMode={viewMode} />
            </div>
            <div className="hidden sm:flex flex-col z-10 absolute w-[20.75rem] bg-white rounded-md left-8 overflow-hidden transition-all ease-in-out duration-300 top-[8rem] h-[calc(100%-9.5rem)]">
              <header className="px-3 pt-2 pb-2">
                <p className="text-grey-950 font-medium">
                  {headerContent.title}
                </p>
                <p className="text-xs text-grey-600">
                  {headerContent.description}
                </p>
              </header>
              <div className="flex flex-col flex-1 p-2 overflow-hidden">
                {isFloodLayerLoading || isDataLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-grey-600">Loading data...</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto space-y-2 p-2">
                      {currentData.length > 0 ? (
                        currentData.map((item, index) =>
                          renderDataItem(item, index)
                        )
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No data available.
                        </div>
                      )}
                    </div>

                    {buttonText && (
                      <button
                        onClick={cycleViewMode}
                        className={`w-full focus:outline-none h-12 font-medium rounded-md text-sm shadow-sm text-white mb-2 ${
                          viewMode === "vulnerability"
                            ? "bg-[#8a7d6a]"
                            : viewMode === "risk"
                            ? "bg-[#6a7d8a]"
                            : "bg-[#a49e92]"
                        }`}
                        disabled={isFloodLayerLoading || isDataLoading}
                      >
                        {buttonText}
                      </button>
                    )}
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
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed left-8 top-[180px] w-80 bg-white/90 rounded-2xl shadow-lg z-30">
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
            <div className="mt-1 relative">
              <input
                type="range"
                min="0"
                max="150"
                step="25"
                value={rainfallAmount}
                onChange={handleRainfallChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                list="rainfall-ticks"
              />
              <div className="grid grid-cols-7 text-xs text-gray-500 mt-1 -mx-1">
                <span className="text-center">0</span>
                <span className="text-center">25</span>
                <span className="text-center">50</span>
                <span className="text-center">75</span>
                <span className="text-center">100</span>
                <span className="text-center">125</span>
                <span className="text-right pr-1">150mm</span>
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
