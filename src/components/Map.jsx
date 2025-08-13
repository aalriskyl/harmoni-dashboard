/* eslint-disable no-unused-vars */
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createRoot } from 'react-dom/client';
import mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import LocationGraph from "./LocationGraph";
import FloodLayer from "./FloodLayer";
import FloodPopup from './FloodPopup';
import axios from "axios";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.error(
    "Mapbox access token is not set. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file"
  );
}

const Map = () => {
  const [waterPumps, setWaterPumps] = useState([]);
  const [pumpStations, setPumpStations] = useState([]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [_lng] = useState(106.8272);
  const [_lat] = useState(-6.1751);
  const [_zoom] = useState(12);
  const markers = useRef([]);
  const popups = useRef([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [lightPreset, setLightPreset] = useState("day");
  const [labelVisibility, setLabelVisibility] = useState({
    showPlaceLabels: true,
    showPointOfInterestLabels: true,
    showRoadLabels: true,
    showTransitLabels: true,
  });
  const [controlsVisible, setControlsVisible] = useState(false);
  const [activePopupId, setActivePopupId] = useState(null);
  const [showFloodLayer, setShowFloodLayer] = useState(false);
  const [rainfallAmount, setRainfallAmount] = useState(0);
  const [floodPopupInfo, setFloodPopupInfo] = useState(null);

  useEffect(() => {
    if (floodPopupInfo && map.current) {
      const placeholder = document.createElement('div');
      const root = createRoot(placeholder);
      root.render(<FloodPopup 
        WADMKC={floodPopupInfo.WADMKC}
        WADMKD={floodPopupInfo.WADMKD}
        WADMKK={floodPopupInfo.WADMKK}
        kelurahan={floodPopupInfo.kelurahan}
        City={floodPopupInfo.City}
        District={floodPopupInfo.District}
        Sub_distri={floodPopupInfo.Sub_distri}
        Year={floodPopupInfo.Year}
        Month={floodPopupInfo.Month}
        Min_height={floodPopupInfo.Min_height}
        Max_height={floodPopupInfo.Max_height}
        Avg_height={floodPopupInfo.Avg_height}
        day_in_the={floodPopupInfo.day_in_the}
        days_poole={floodPopupInfo.days_poole}
      />);

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        className: 'flood-popup',
        maxWidth: 'none',
        offset: [0, 0]
      })
        .setLngLat([floodPopupInfo.lng, floodPopupInfo.lat])
        .setDOMContent(placeholder)
        .addTo(map.current);

      popup.on('close', () => {
        setFloodPopupInfo(null);
      });

      // Clean up popup when component unmounts or floodPopupInfo changes
      return () => {
        popup.remove();
        root.unmount();
      };
    }
  }, [floodPopupInfo]);

  useEffect(() => {
    const handleSimulationStateChange = (event) => {
      console.log('[Map.jsx] Received simulationStateChange:', event.detail);
      setShowFloodLayer(event.detail.isActive);
      setRainfallAmount(event.detail.rainfall);
    };

    window.addEventListener(
      "simulationStateChange",
      handleSimulationStateChange
    );

    return () => {
      window.removeEventListener(
        "simulationStateChange",
        handleSimulationStateChange
      );
    };
  }, []);

  useEffect(() => {
    const handleFloodLayerClick = (event) => {
      setFloodPopupInfo(event.detail);
    };

    const handleShowFloodPopup = (event) => {
      const { floodData } = event.detail;
      setFloodPopupInfo(floodData);
      
      // Center map on the flood data location
      if (map.current && floodData.lng && floodData.lat) {
        map.current.flyTo({
          center: [floodData.lng, floodData.lat],
          zoom: 14,
          essential: true
        });
      }
    };

    window.addEventListener('floodLayerClick', handleFloodLayerClick);
    window.addEventListener('showFloodPopup', handleShowFloodPopup);

    return () => {
      window.removeEventListener('floodLayerClick', handleFloodLayerClick);
      window.removeEventListener('showFloodPopup', handleShowFloodPopup);
    };
  }, []);

  // Fetch and process waterpump data
  useEffect(() => {
    const fetchWaterpumps = async () => {
      try {
        const response = await axios.get(
          "/data/Waterpump_Stasioner_EPSG_4326.geojson"
        );
        const data = response.data;
        console.log(data);
        setWaterPumps(data);

        // Process pump stations from GeoJSON
        if (data && data.features) {
          const pumpStatuses = [
            { status: "Running", color: "#22c55e" }, // green-500
            { status: "Idle", color: "#facc15" }, // yellow-400
            { status: "Not Running", color: "#ef4444" }, // red-500
          ];

          const stations = data.features.map((feature, index) => {
            const randomStatus =
              pumpStatuses[Math.floor(Math.random() * pumpStatuses.length)];
            return {
              id: 1000 + index, // Start from 1000 to avoid conflicts with existing pinPoints
              lng: feature.geometry.coordinates[0],
              lat: feature.geometry.coordinates[1],
              title: feature.properties.Pompa || "Pump Station",
              type: "Waterpump",
              color: randomStatus.color,
              status: randomStatus.status,
              deviceId: `PMP-${String(index + 1).padStart(3, "0")}`,
              location: feature.properties.Alamat || "Unknown location",
              latestReading: {
                status: "Operational",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                capacity: feature.properties.Capacity
                  ? `${feature.properties.Capacity} m³/s`
                  : "N/A",
              },
            };
          });
          setPumpStations(stations);
        }
      } catch (error) {
        console.error("Error fetching waterpump data:", error);
      }
    };

    fetchWaterpumps();
  }, []);

  const pinPoints = useMemo(() => {
    // The pin points are now exclusively from the GeoJSON file.
    return pumpStations;
  }, [pumpStations]);

  const setupRainEffect = useCallback(() => {
    if (!map.current) return;

    const zoomBasedReveal = (scale = 1.0) => {
      return ["interpolate", ["linear"], ["zoom"], 0, 0, 24, scale];
    };

    map.current.setRain({
      density: zoomBasedReveal(0.5),
      intensity: 1.0,
      color: "#a8adbc",
      opacity: 0.7,
      vignette: zoomBasedReveal(1.0),
      "vignette-color": "#464646",
      direction: [0, 80],
      "droplet-size": [2.6, 18.2],
      "distortion-strength": 0.7,
      "center-thinning": 0,
    });
  }, []);

  const getTimeBasedPreset = (hour) => {
    if (hour >= 5 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 17) return "day";
    if (hour >= 17 && hour < 19) return "dusk";
    return "night";
  };

  const updateTimeBasedPreset = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const newPreset = getTimeBasedPreset(hour);
    setLightPreset(newPreset);
    if (map.current) {
      map.current.setConfigProperty("basemap", "lightPreset", newPreset);
    }
  }, []);

  const addPinPoints = useCallback(() => {
    markers.current.forEach((marker) => marker.remove());
    popups.current.forEach((popup) => popup.remove());
    markers.current = [];
    popups.current = [];

    // Create and add new markers and popups for each pump station
    pinPoints.forEach((point) => {
      // Create a custom marker element
      const el = document.createElement("div");
      el.className =
        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer";
      el.style.backgroundColor = "#4e583b"; // Static green background
      el.style.border = "2px solid #677056";
      el.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

      const icon = document.createElement("img");
      icon.src = "/assets/img/pump-icon.svg";
      icon.className = "w-6 h-6 p-1";
      icon.style.filter = "brightness(0) invert(1)"; // Make icon white
      el.appendChild(icon);

      // Create the popup content
      const popupContent = document.createElement("div");
      popupContent.innerHTML = `
        <div class="max-w-xs font-sans">
          <div class="flex items-center mb-2">
            <div class="w-5 h-5 mr-2 rounded-full flex items-center justify-center" style="background-color: ${
              point.color
            }">
              <img src="/assets/img/pump-icon.svg" class="w-3 h-3" alt="Pump icon" />
            </div>
            <h3 class="font-bold text-base">${point.title}</h3>
          </div>
          
          <div class="border-t border-gray-200 pt-2 mt-2">
            <h4 class="font-semibold text-sm mb-1">Device Information</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium ${
                point.status === "Running"
                  ? "text-[#28a745]"
                  : point.status === "Idle"
                  ? "text-[#677056]"
                  : "text-[#dc3545]"
              }">${point.status}</span>
              <span class="text-gray-600">Device ID:</span>
              <span>${point.deviceId}</span>
              <span class="text-gray-600">Location:</span>
              <span>${point.location}</span>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-2 mt-2">
            <h4 class="font-semibold text-sm mb-1">Latest Reading</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span class="text-gray-600">Capacity:</span>
              <span class="font-medium">${point.latestReading.capacity}</span>
              <span class="text-gray-600">Date:</span>
              <span>${point.latestReading.date}</span>
              <span class="text-gray-600">Time:</span>
              <span>${point.latestReading.time}</span>
            </div>
          </div>

          <div class="mt-3 w-full">
            <button class="read-more-btn w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-2 px-3 rounded transition-colors">
              Read More
            </button>
          </div>
        </div>
      `;

      // Create the popup
      const popup = new mapboxgl.Popup({
        offset: 30,
        className: "custom-popup",
      }).setDOMContent(popupContent);

      // Create the marker and add it to the map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
      popups.current.push(popup);
    });
  }, [pinPoints]);

  const handleLightPresetChange = (e) => {
    const preset = e.target.value;
    setLightPreset(preset);
    if (map.current) {
      map.current.setConfigProperty("basemap", "lightPreset", preset);
    }
  };

  const handleLabelVisibilityChange = (e) => {
    const { id, checked } = e.target;
    setLabelVisibility((prev) => ({
      ...prev,
      [id]: checked,
    }));
    if (map.current) {
      map.current.setConfigProperty("basemap", id, checked);
    }
  };

  useEffect(() => {
    updateTimeBasedPreset();
    const intervalId = setInterval(updateTimeBasedPreset, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [updateTimeBasedPreset]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: [_lng, _lat],
      zoom: _zoom,
      pitch: 45,
      bearing: -20,
    });

    map.current.on("load", () => {
      setupRainEffect();
      addPinPoints();
      map.current.setConfigProperty("basemap", "lightPreset", lightPreset);
      Object.entries(labelVisibility).forEach(([key, value]) => {
        map.current.setConfigProperty("basemap", key, value);
      });
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");

    return () => {
      markers.current.forEach((marker) => marker.remove());
      popups.current.forEach((popup) => popup.remove());
      markers.current = [];
      popups.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [
    _lng,
    _lat,
    _zoom,
    addPinPoints,
    setupRainEffect,
    lightPreset,
    labelVisibility,
  ]);

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="w-full h-full" />

      <button
        onClick={() => setControlsVisible(!controlsVisible)}
        className="absolute bottom-5 right-32 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
        aria-label="Toggle controls"
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
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>

      {controlsVisible && (
        <div className="absolute bottom-16 right-32 bg-white p-4 rounded shadow-md z-10 w-64">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Light Preset
            </label>
            <select
              id="lightPreset"
              value={lightPreset}
              onChange={handleLightPresetChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="dawn">Dawn</option>
              <option value="day">Day</option>
              <option value="dusk">Dusk</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="showPlaceLabels"
                className="text-sm font-medium text-gray-700"
              >
                Place Labels
              </label>
              <input
                type="checkbox"
                id="showPlaceLabels"
                checked={labelVisibility.showPlaceLabels}
                onChange={handleLabelVisibilityChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="showPointOfInterestLabels"
                className="text-sm font-medium text-gray-700"
              >
                POI Labels
              </label>
              <input
                type="checkbox"
                id="showPointOfInterestLabels"
                checked={labelVisibility.showPointOfInterestLabels}
                onChange={handleLabelVisibilityChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="showRoadLabels"
                className="text-sm font-medium text-gray-700"
              >
                Road Labels
              </label>
              <input
                type="checkbox"
                id="showRoadLabels"
                checked={labelVisibility.showRoadLabels}
                onChange={handleLabelVisibilityChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="showTransitLabels"
                className="text-sm font-medium text-gray-700"
              >
                Transit Labels
              </label>
              <input
                type="checkbox"
                id="showTransitLabels"
                checked={labelVisibility.showTransitLabels}
                onChange={handleLabelVisibilityChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}

      <LocationGraph
        selectedPoint={selectedPoint}
        onClose={() => setSelectedPoint(null)}
      />

      {console.log(`[Map.jsx] Rendering FloodLayer with show: ${showFloodLayer}, rainfall: ${rainfallAmount}`)}
      {showFloodLayer && <FloodLayer map={map.current} show={showFloodLayer} rainfall={rainfallAmount} />}
      {floodPopupInfo && (
        <FloodPopup
          lng={floodPopupInfo.lng}
          lat={floodPopupInfo.lat}
          avgHeight={floodPopupInfo.avgHeight}
          location={floodPopupInfo.location}
          onClose={() => setFloodPopupInfo(null)}
        />
      )}

      <style>{`
        .mapboxgl-popup.custom-popup {
          max-width: 300px !important;
          font-family: 'Inter', sans-serif;
        }
        .mapboxgl-popup-content {
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .mapboxgl-popup-close-button {
          font-size: 1.5rem;
          padding: 0.5rem;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: transparent;
          color: #6b7280;
        }
        .aware-btn, .chart-btn, .read-more-btn {
          transition: all 0.2s;
        }
        .aware-btn:hover, .chart-btn:hover, .read-more-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Map;
