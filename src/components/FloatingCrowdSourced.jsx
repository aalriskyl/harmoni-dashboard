import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDateFilter } from "../hooks/useDateFilter";

const FloatingCrowdsourced = ({ setShowWeather }) => {
  const { selectedDate, setSelectedDate } = useDateFilter();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [kelurahanCounts, setKelurahanCounts] = useState({});
  const [selectedTime, setSelectedTime] = useState(12); // Default to 12:00
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleIncidentClick = (incident) => {
    window.dispatchEvent(
      new CustomEvent("centerMapOnCoordinates", {
        detail: {
          lng: incident.coordinates.lng,
          lat: incident.coordinates.lat,
          zoom: 15,
        },
      })
    );

    window.dispatchEvent(
      new CustomEvent("showIncidentPopup", {
        detail: {
          incidentData: incident,
          lng: incident.coordinates.lng,
          lat: incident.coordinates.lat,
        },
      })
    );
  };

  // Load GeoJSON data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Array to hold all incidents from all years
        let allIncidents = [];
        let idCounter = 1;

        // Load data for each year from 2016 to 2024
        for (let year = 2016; year <= 2024; year++) {
          try {
            const response = await axios.get(
              `/data/Crowdsourced_Flood_Depth_Report_Curated_-_${year}.geojson`
            );

            // Transform the GeoJSON features into our incidents format
            const yearData = response.data.features.map((feature) => {
              // Get water depth, defaulting to 0 if not available
              const waterDepth = feature.properties["Water Depth"] || 0;

              return {
                id: idCounter++,
                type: "Flood",
                location: feature.properties.Kelurahan || "Unknown Location",
                severity: getSeverity(waterDepth, waterDepth), // Using same value for min/max since we only have one depth value
                description: `Flood depth: ${waterDepth} cm`,
                timestamp: feature.properties.Date, // Using the Date property directly
                verified: true,
                coordinates: {
                  lat: feature.geometry.coordinates[1], // Using coordinates from geometry
                  lng: feature.geometry.coordinates[0], // Using coordinates from geometry
                },
                year: year.toString(),
                properties: feature.properties,
              };
            });

            allIncidents = [...allIncidents, ...yearData];
          } catch (err) {
            console.warn(`Warning: Could not load data for year ${year}:`, err);
            // Continue with other years even if one fails
          }
        }

        setIncidents(allIncidents);
        setFilteredIncidents(allIncidents);

        // Count reports per kelurahan
        const counts = allIncidents.reduce((acc, incident) => {
          const kelurahan = incident.properties.Kelurahan || "Unknown";
          acc[kelurahan] = (acc[kelurahan] || 0) + 1;
          return acc;
        }, {});
        setKelurahanCounts(counts);

        if (allIncidents.length === 0) {
          setError(
            "No flood data could be loaded. Please check your connection and try again."
          );
        }
      } catch (err) {
        console.error("Error loading flood data:", err);
        setError("Failed to load flood data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper function to determine severity based on flood depth
  const getSeverity = (minDepth, maxDepth) => {
    const avgDepth = (minDepth + maxDepth) / 2;
    if (avgDepth >= 30) return "High";
    if (avgDepth >= 15) return "Medium";
    return "Low";
  };

  // Filter incidents based on selected date and time
  const filterIncidents = React.useCallback(() => {
    if (!incidents.length) return;

    // For now, we'll filter by date only since the time isn't available in the data
    const filtered = incidents.filter((incident) => {
      return incident.timestamp === selectedDate;
    });

    setFilteredIncidents(filtered);

    // Update kelurahan counts for filtered results
    const counts = filtered.reduce((acc, incident) => {
      const kelurahan = incident.properties.Kelurahan || "Unknown";
      acc[kelurahan] = (acc[kelurahan] || 0) + 1;
      return acc;
    }, {});
    setKelurahanCounts(counts);

    // Dispatch event to update the map
    window.dispatchEvent(
      new CustomEvent("updateIncidentsLayer", {
        detail: {
          incidents: filtered,
          date: selectedDate,
          time: selectedTime,
        },
      })
    );
  }, [incidents, selectedDate, selectedTime]);

  // Filter incidents whenever the selected date or time changes
  useEffect(() => {
    if (incidents.length > 0) {
      filterIncidents();
    }
  }, [filterIncidents, incidents]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(parseInt(e.target.value, 10));
  };

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const goBack = () => {
    setShowWeather(true);
    window.dispatchEvent(new CustomEvent("hideIncidentsLayer"));
  };

  return (
    <div className="floating-crowdsourced">
      <div className="hidden sm:flex flex-col z-10 absolute w-[350px] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 top-[180px] left-8 h-[100vh] max-h-[400px] border border-gray-200">
        <header className="px-3 pt-2 pb-2">
          <p className="text-grey-950 font-medium">
            Crowdsourced Flood Incidents
          </p>
          <p className="text-xs text-grey-600">Filter by date and time</p>

          <div className="mt-2 space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Time: {formatTime(selectedTime)}
              </label>
              <input
                type="range"
                min="0"
                max="23"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>00:00</span>
                <span>12:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col flex-1 p-2 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-sm cursor-pointer bg-white p-2 shadow-sm mb-2 border border-gray-100 hover:border-blue-300 transition-colors"
                  onClick={() => handleIncidentClick(incident)}
                >
                  <div className="flex gap-2">
                    <div
                      className={`rounded-sm py-1 px-2 flex items-center ${
                        incident.severity === "High"
                          ? "bg-red-500"
                          : incident.severity === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      } text-white`}
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
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium capitalize">
                          {incident.type} - {incident.severity}
                        </p>
                        {incident.verified && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-gray-700">
                          {incident.location}
                        </p>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                          {kelurahanCounts[
                            incident.properties.Kelurahan || "Unknown"
                          ] || 1}{" "}
                          reports
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {incident.properties.Kecamatan &&
                          `${incident.properties.Kecamatan}, `}
                        {incident.properties.Kelurahan || "Unknown Location"}
                      </p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {incident.timestamp}
                        </span>
                        <span className="text-xs text-gray-500">
                          {incident.description}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No incidents found for the selected date and time.
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={goBack}
            className="w-full focus:outline-none h-12 font-medium rounded-md text-sm shadow-sm text-white bg-[#636059] hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCrowdsourced;
