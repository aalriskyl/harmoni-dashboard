/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  createElement,
} from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import ReactDOM from "react-dom/client";
import LocationGraph from "./LocationGraph";
import FloodLayer from "./FloodLayer";
import FloodPopup from "./FloodPopup";
import axios from "axios";

// Constants
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const INITIAL_VIEW_STATE = {
  lng: 106.8272,
  lat: -6.1751,
  zoom: 12,
  pitch: 45,
  bearing: -20,
};
const PUMP_STATUSES = [
  { status: "Running", color: "#22c55e" },
  { status: "Idle", color: "#facc15" },
  { status: "Not Running", color: "#ef4444" },
];

// Add styles for the popup chart
const style = document.createElement("style");
style.textContent = `
  .mapboxgl-popup-content {
    padding: 0 !important;
    max-width: 400px !important;
  }
  .mapboxgl-popup-content .popup-content {
    padding: 12px;
  }
  .chart-wrapper {
    width: 100%;
    height: 100%;
  }
`;
document.head.appendChild(style);

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.error(
    "Mapbox access token is not set. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file"
  );
}

const Map = ({ showPumps = true }) => {
  // Refs
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const popups = useRef([]);

  // State

  const [waterPumps, setWaterPumps] = useState([]);
  const [pumpStations, setPumpStations] = useState([]);
  const [floodData, setFloodData] = useState([]);
  const [showFloodHeatmap, setShowFloodHeatmap] = useState(false);
  const [waterLevelData, setWaterLevelData] = useState([]);
  const [rainRecorderData, setRainRecorderData] = useState([]);
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
  const [showChart, setShowChart] = useState(false);
  const [chartPoint, setChartPoint] = useState(null);
  // Add this inside the Map component (near other state declarations)
  const [showVulnerabilityLayer, setShowVulnerabilityLayer] = useState(false);
  const [floodIncidents, setFloodIncidents] = useState([]);

  // Define image bounds for overlays
  const imageBounds = [
    [106.6849284, -6.0790941], // Upper left
    [106.9742925, -6.0790941], // Upper right
    [106.9742925, -6.3729514], // Lower right
    [106.6849284, -6.3729514], // Lower left
  ];

  // Add or update flood image overlay
  const updateFloodImage = useCallback((imagePath) => {
    if (!map.current) return;

    const layerId = 'flood-image-layer';
    const sourceId = 'flood-image-source';
    const vulnerabilityLayerId = 'vulnerability-layer';

    // Hide and remove vulnerability layer when showing flood/risk layer
    if (map.current.getLayer(vulnerabilityLayerId)) {
      map.current.removeLayer(vulnerabilityLayerId);
    }
    if (map.current.getSource('vulnerability-source')) {
      map.current.removeSource('vulnerability-source');
    }

    // Remove existing layer and source if they exist
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Only add new layer if we have a valid image path
    if (imagePath) {
      // Add new source and layer
      map.current.addSource(sourceId, {
        type: 'image',
        url: imagePath,
        coordinates: imageBounds,
      });

      map.current.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-opacity': 0.7,
        },
      });
    }
  }, []);

  // Add event listener for flood image updates
  useEffect(() => {
    const handleUpdateFloodImage = (event) => {
      updateFloodImage(event.detail.imagePath);
    };

    window.addEventListener('updateFloodImage', handleUpdateFloodImage);
    return () => {
      window.removeEventListener('updateFloodImage', handleUpdateFloodImage);
    };
  }, [updateFloodImage]);

  // Add this method inside the Map component
  const toggleVulnerabilityLayer = useCallback(
    (show) => {
      setShowVulnerabilityLayer(show);

      if (!map.current) return;

      const layerId = "vulnerability-layer";
      const sourceId = "vulnerability-source";
      const floodLayerId = 'flood-image-layer';

      if (show) {
        // Hide flood layer if it exists
        if (map.current.getLayer(floodLayerId)) {
          map.current.removeLayer(floodLayerId);
        }
        const floodSourceId = 'flood-image-source';
        if (map.current.getSource(floodSourceId)) {
          map.current.removeSource(floodSourceId);
        }

        if (map.current.getSource(sourceId)) {
          map.current.setLayoutProperty(layerId, "visibility", "visible");
        } else {
          map.current.addSource(sourceId, {
            type: "image",
            url: "/assets/img/Social_Vulnerability_8000px.png",
            coordinates: imageBounds,
          });

          map.current.addLayer({
            id: layerId,
            type: "raster",
            source: sourceId,
            paint: {
              "raster-opacity": 0.4,
            },
          });
        }
      } else {
        if (map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(layerId, "visibility", "none");
        }
      }
    },
    [showFloodLayer]
  );

  // Add this useEffect to handle the layer visibility changes
  useEffect(() => {
    if (!map.current) return;
    toggleVulnerabilityLayer(showVulnerabilityLayer);
  }, [showVulnerabilityLayer, toggleVulnerabilityLayer]);

  // Add this event listener inside the existing useEffect for event listeners
  useEffect(() => {
    const handleShowVulnerabilityLayer = (event) => {
      setShowVulnerabilityLayer(event.detail.show);
    };

    window.addEventListener(
      "showVulnerabilityLayer",
      handleShowVulnerabilityLayer
    );

    return () => {
      window.removeEventListener(
        "showVulnerabilityLayer",
        handleShowVulnerabilityLayer
      );
    };
  }, []);
  // Derived state
  const pinPoints = useMemo(
    () => [...pumpStations, ...waterLevelData, ...rainRecorderData],
    [pumpStations, waterLevelData, rainRecorderData]
  );

  const pointsToShow = useMemo(
    () => (showPumps ? pinPoints : []),
    [pinPoints, showPumps]
  );

  // Helper functions
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

  // Data fetching
  const fetchWaterpumps = useCallback(async () => {
    try {
      const response = await axios.get(
        "/data/Waterpump_Stasioner_EPSG_4326.geojson"
      );
      const data = response.data;
      setWaterPumps(data);

      if (data?.features) {
        const stations = data.features.map((feature, index) => {
          const randomStatus =
            PUMP_STATUSES[Math.floor(Math.random() * PUMP_STATUSES.length)];
          return {
            id: 1000 + index,
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
  }, []);

  const fetchRainRecorderData = useCallback(async () => {
    try {
      const response = await axios.get(
        "/data/Automatic_Rain_Recorder_(ARR)_with_Data-_Jakarta.geojson"
      );
      const data = response.data;

      if (data?.features) {
        const processedData = data.features.map((feature, index) => {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties;
          const precipitationData = props.Precipitation_Rate || {};
          const sortedDates = Object.keys(precipitationData).sort();
          const latestDate = sortedDates.pop() || "";
          const latestRainfall = latestDate ? precipitationData[latestDate] : 0;

          const rainfallData = sortedDates.slice(-24).map((date) => ({
            time: date,
            formattedTime: new Date(date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            formattedDate: new Date(date).toLocaleDateString("en-GB"),
            rainfall: parseFloat(precipitationData[date]) || 0,
          }));

          return {
            id: 2000 + index,
            lng,
            lat,
            title: props.Nama_Pos || `Rain Recorder ${index + 1}`,
            type: "RainRecorder",
            color: "#3b82f6",
            status: props.Kondisi_Po || "Active",
            deviceId: `RR-${String(index + 1).padStart(3, "0")}`,
            location:
              [props.Kelurahan, props.Kecamatan, props.Kota]
                .filter(Boolean)
                .join(", ") || "Unknown location",
            latestReading: {
              rainfall: latestRainfall,
              date: latestDate,
              condition:
                latestRainfall > 50
                  ? "Heavy Rain"
                  : latestRainfall > 20
                  ? "Moderate Rain"
                  : latestRainfall > 0
                  ? "Light Rain"
                  : "No Rain",
            },
            details: {
              jenisAlat: props.Jenis_Alat || "N/A",
              merkAlat: props.Merk_Alat || "N/A",
              provinsi: props.Provinsi || "N/A",
              pengelola: props.Pengelola || "N/A",
              tahunDibangun: props.Didirikan || "N/A",
              wilayahSungai: props.WS || "N/A",
              kondisiAlat: props.Kondisi_Al || "N/A",
            },
            rainfallData:
              rainfallData.length > 0
                ? rainfallData
                : [
                    { time: "00:00", rainfall: 0 },
                    { time: "06:00", rainfall: 0 },
                    { time: "12:00", rainfall: 0 },
                    { time: "18:00", rainfall: 0 },
                  ],
          };
        });
        setRainRecorderData(processedData);
      }
    } catch (error) {
      console.error("Error fetching flood data:", error);
    }
  }, []);

  const fetchWaterLevelData = useCallback(async () => {
    try {
      const response = await axios.get(
        "/data/Automatic_Water_Level_Recorder_(AWLR)_with_Data-_Jakarta.geojson"
      );
      const data = response.data;

      if (data?.features) {
        const processedData = data.features
          .map((feature, index) => {
            const waterLevels = feature.properties["Water Level Rate"] || {};
            const latestDate = Object.keys(waterLevels).sort().pop();
            const latestLevel = latestDate ? waterLevels[latestDate] : "N/A";

            const lng = parseFloat(feature.properties.Longitude);
            const lat = parseFloat(feature.properties.Latitude);

            if (isNaN(lng) || isNaN(lat)) return null;

            return {
              id: 3000 + index,
              lng,
              lat,
              title:
                feature.properties.Nama_Pos ||
                `Water Level Station ${index + 1}`,
              type: "WaterLevel",
              color: "#06b6d4",
              status: feature.properties.Kondisi_Po || "Unknown",
              deviceId: `WL-${String(index + 1).padStart(3, "0")}`,
              location:
                [
                  feature.properties.Kelurahan,
                  feature.properties.Kecamatan,
                  feature.properties.Kota,
                  feature.properties.Provinsi,
                ]
                  .filter(Boolean)
                  .join(", ") || "Unknown location",
              latestReading: {
                level: latestLevel,
                date: latestDate || "N/A",
                condition: feature.properties.Kondisi_Al || "N/A",
              },
              manager: feature.properties.Pengelola || "N/A",
              installedYear: feature.properties.Didirikan || "N/A",
            };
          })
          .filter(Boolean);
        setWaterLevelData(processedData);
      }
    } catch (error) {
      console.error("Error fetching water level data:", error);
    }
  }, []);

  // Event handlers
  const toggleChart = (point) => {
    setChartPoint(point);
    setShowChart(!showChart);
  };

  const closeChart = () => {
    setShowChart(false);
    setChartPoint(null);
  };

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

  // Marker and popup utilities
  const getStatusButtonClass = (point) => {
    if (point.type === "Waterpump") {
      return point.status === "Not Running"
        ? "bg-red-600 hover:bg-red-700"
        : point.status === "Idle"
        ? "bg-yellow-500 hover:bg-yellow-600"
        : "bg-green-600 hover:bg-green-700";
    } else if (point.type === "RainRecorder") {
      return point.latestReading.rainfall > 50
        ? "bg-red-600 hover:bg-red-700"
        : point.latestReading.rainfall > 20
        ? "bg-yellow-500 hover:bg-yellow-600"
        : "bg-green-600 hover:bg-green-700";
    } else if (point.type === "WaterLevel") {
      return point.latestReading.level > 3
        ? "bg-red-600 hover:bg-red-700"
        : point.latestReading.level > 1.5
        ? "bg-yellow-500 hover:bg-yellow-600"
        : "bg-green-600 hover:bg-green-700";
    }
    return "bg-blue-600 hover:bg-blue-700";
  };

  const getStatusText = (point) => {
    if (point.type === "Waterpump") {
      return point.status === "Not Running"
        ? "High Alert"
        : point.status === "Idle"
        ? "Caution Advised"
        : "Normal Operation";
    } else if (point.type === "RainRecorder") {
      return point.latestReading.rainfall > 50
        ? "High Alert"
        : point.latestReading.rainfall > 20
        ? "Caution Advised"
        : "Normal Conditions";
    } else if (point.type === "WaterLevel") {
      return point.latestReading.level > 3
        ? "High Alert"
        : point.latestReading.level > 1.5
        ? "Caution Advised"
        : "Normal Conditions";
    }
    return "View Status";
  };

  const getIconSrc = (type) => {
    switch (type) {
      case "Waterpump":
        return "/assets/img/pump-icon.svg";
      case "RainRecorder":
        return "/assets/img/rain-gauge-icon.svg";
      case "WaterLevel":
        return "/assets/img/water-level-icon.svg";
      default:
        return "/assets/img/marker-icon.svg";
    }
  };

  const renderInfoRows = (point) => {
    if (point.type === "Waterpump") {
      return `
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
      `;
    } else if (point.type === "RainRecorder") {
      return `
        <span class="text-gray-600">Status:</span>
        <span class="font-medium ${
          point.status === "Active" ? "text-green-600" : "text-red-600"
        }">${point.status}</span>
        <span class="text-gray-600">Device ID:</span>
        <span>${point.deviceId}</span>
        <span class="text-gray-600">Location:</span>
        <span>${point.location}</span>
        <span class="text-gray-600">Type:</span>
        <span>${point.details?.jenisAlat || "N/A"}</span>
        <span class="text-gray-600">Brand:</span>
        <span>${point.details?.merkAlat || "N/A"}</span>
        <span class="text-gray-600">Manager:</span>
        <span>${point.details?.pengelola || "N/A"}</span>
        <span class="text-gray-600">Built Year:</span>
        <span>${point.details?.tahunDibangun || "N/A"}</span>
        <span class="text-gray-600">Condition:</span>
        <span>${point.details?.kondisiAlat || "N/A"}</span>
      `;
    } else if (point.type === "WaterLevel") {
      return `
        <span class="text-gray-600">Status:</span>
        <span class="font-medium ${
          point.status === "Functioned" ? "text-green-600" : "text-red-600"
        }">${point.status}</span>
        <span class="text-gray-600">Device ID:</span>
        <span>${point.deviceId}</span>
        <span class="text-gray-600">Location:</span>
        <span>${point.location}</span>
        <span class="text-gray-600">Manager:</span>
        <span>${point.manager || "N/A"}</span>
        <span class="text-gray-600">Installed:</span>
        <span>${point.installedYear || "N/A"}</span>
      `;
    }
    return "";
  };

  const renderLatestReading = (point) => {
    if (point.type === "Waterpump") {
      return `
        <span class="text-gray-600">Capacity:</span>
        <span class="font-medium">${point.latestReading.capacity}</span>
        <span class="text-gray-600">Date:</span>
        <span>${point.latestReading.date}</span>
        <span class="text-gray-600">Time:</span>
        <span>${point.latestReading.time}</span>
      `;
    } else if (point.type === "RainRecorder") {
      return `
        <span class="text-gray-600">Rainfall:</span>
        <span class="font-medium">${point.latestReading.rainfall} mm</span>
        <span class="text-gray-600">Date:</span>
        <span>${point.latestReading.date || "N/A"}</span>
        <span class="text-gray-600">Condition:</span>
        <span>${point.latestReading.condition}</span>
      `;
    } else if (point.type === "WaterLevel") {
      return `
        <span class="text-gray-600">Water Level:</span>
        <span class="font-medium">${point.latestReading.level} m</span>
        <span class="text-gray-600">Date:</span>
        <span>${point.latestReading.date}</span>
        <span class="text-gray-600">Condition:</span>
        <span>${point.latestReading.condition}</span>
      `;
    }
    return "";
  };

  const renderPopupContent = (point) => {
    return `
      <div class="max-w-xs font-sans">
        <div class="flex items-center mb-2">
          <div class="w-5 h-5 mr-2 rounded-full flex items-center justify-center" style="background-color: ${
            point.color
          }">
            <img src="${getIconSrc(point.type)}" class="w-3 h-3" alt="${
      point.type
    } icon" />
          </div>
          <h3 class="font-bold text-base">${point.title}</h3>
        </div>
        
        <div class="border-t border-gray-200 pt-2 mt-2">
          <h4 class="font-semibold text-sm mb-1">${
            point.type === "Waterpump"
              ? "Device"
              : point.type === "Flood"
              ? "Flood"
              : "Station"
          } Information</h4>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            ${renderInfoRows(point)}
          </div>
        </div>

        ${
          point.latestReading
            ? `
        <div class="border-t border-gray-200 pt-2 mt-2">
          <h4 class="font-semibold text-sm mb-1">Latest Reading</h4>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            ${renderLatestReading(point)}
          </div>
        </div>
        `
            : ""
        }

        <div class="mt-4 flex flex-col gap-2">
          <button class="w-full py-2 px-3 rounded text-white text-sm font-medium ${getStatusButtonClass(
            point
          )}" 
                  onclick="alert('${
                    point.type === "Waterpump"
                      ? `Status: ${point.status}`
                      : point.type === "RainRecorder"
                      ? `Rainfall: ${point.latestReading.rainfall}mm`
                      : `Water Level: ${point.latestReading.level}m`
                  }')">
            ${getStatusText(point)}
          </button>
          <button type="button" class="chart-btn w-full py-2 px-3 bg-[#946e31] hover:bg-[#6e4f1f] text-white rounded text-sm font-medium" onclick="event.preventDefault(); event.stopPropagation();">
            Show Chart
          </button>
        </div>
      </div>
    `;
  };

  const updateMarkers = useCallback(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    popups.current = [];

    if (!pointsToShow || pointsToShow.length === 0) return;

    pointsToShow.forEach((point, index) => {
      const el = document.createElement("div");
      el.className =
        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer";

      const markerStyles = {
        Waterpump: { bgColor: "#4e583b", borderColor: "#677056" },
        RainRecorder: { bgColor: "#6A7F53", borderColor: "#6A7F53" },
        WaterLevel: { bgColor: "#677056", borderColor: "#677056" },
        default: { bgColor: "#6b7280", borderColor: "#9ca3af" },
      };

      const style = markerStyles[point.type] || markerStyles.default;
      el.style.backgroundColor = style.bgColor;
      el.style.border = `2px solid ${style.borderColor}`;
      el.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

      const icon = document.createElement("img");
      icon.src = getIconSrc(point.type);
      icon.className = "w-6 h-6 p-1";
      icon.style.filter = "brightness(0) invert(1)";
      el.appendChild(icon);

      const popupContent = document.createElement("div");
      popupContent.className = "popup-content";
      popupContent.innerHTML = renderPopupContent(point);

      const popup = new mapboxgl.Popup({
        offset: 30,
        className: "custom-popup",
      }).setDOMContent(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(map.current);

      // Add click handler for chart button
      const chartButton = popupContent.querySelector(".chart-btn");
      if (chartButton) {
        chartButton.onclick = (e) => {
          e.stopPropagation();
          toggleChart(point);
        };
      }

      markers.current.push(marker);
      popups.current.push(popup);
    });
  }, [pointsToShow]);

  // Handle flood incidents layer updates
  useEffect(() => {
    if (!map.current) return;

    // Remove existing flood incident markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    popups.current.forEach((popup) => popup.remove());
    popups.current = [];

    // Add new markers for each flood incident
    floodIncidents.forEach((incident) => {
      const el = document.createElement("div");
      el.className = "flood-incident-marker";
      
      // Set the marker style based on severity
      const iconColor = incident.severity === "High" ? "#ef4444" : 
                       incident.severity === "Medium" ? "#f59e0b" : "#10b981";
      
      // Create a simple house icon with color based on severity
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: ${iconColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 0 0 2px white, 0 0 0 4px ${iconColor};
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z"/>
          </svg>
        </div>
      `;

      // Create popup with custom styling
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'flood-popup',
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-4">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold text-gray-900">
              ${incident.type} - ${incident.severity}
            </h3>
            ${incident.verified ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Verified</span>' : ''}
          </div>
          
          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex justify-between">
              <span class="font-medium">Date:</span>
              <span>${incident.timestamp || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Kecamatan:</span>
              <span>${incident.properties?.Kecamatan || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Kelurahan:</span>
              <span>${incident.properties?.Kelurahan || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Location:</span>
              <span class="text-right">${incident.location || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Water Depth:</span>
              <span>${incident.description || 'N/A'}</span>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
            <button 
              class="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onclick="this.closest('.mapboxgl-popup').remove();"
            >
              Close
            </button>
          </div>
        </div>
      `);

      // Create the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
      popups.current.push(popup);
    });

    // Fit bounds to show all markers if there are any
    if (floodIncidents.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      floodIncidents.forEach((incident) => {
        bounds.extend([incident.coordinates.lng, incident.coordinates.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [floodIncidents]);

  // Listen for flood incidents updates
  useEffect(() => {
    const handleUpdateIncidentsLayer = (e) => {
      setFloodIncidents(e.detail.incidents);
    };

    const handleHideIncidentsLayer = () => {
      setFloodIncidents([]);
    };

    window.addEventListener("updateIncidentsLayer", handleUpdateIncidentsLayer);
    window.addEventListener("hideIncidentsLayer", handleHideIncidentsLayer);

    return () => {
      window.removeEventListener("updateIncidentsLayer", handleUpdateIncidentsLayer);
      window.removeEventListener("hideIncidentsLayer", handleHideIncidentsLayer);
    };
  }, []);

  // Event listeners
  useEffect(() => {
    // Inside the useEffect for event listeners in Map.jsx
    const handleSimulationStateChange = (event) => {
      console.log("Simulation state changed:", event.detail);
      setShowFloodLayer(event.detail.isActive);
      setRainfallAmount(event.detail.rainfall);

      // Only show vulnerability layer if explicitly requested
      if (event.detail.isActive && event.detail.showVulnerability) {
        console.log("Showing vulnerability layer from simulation");
        setShowVulnerabilityLayer(true);

        if (map.current) {
          const layerId = "flood-vulnerability-layer";
          const sourceId = "flood-vulnerability";

          // Add source if it doesn't exist
          if (!map.current.getSource(sourceId)) {
            console.log("Adding vulnerability source");
            map.current.addSource(sourceId, {
              type: "image",
              url: "/assets/img/Social_Vulnerability_8000px.png",
              coordinates: [
                [106.6849284, -6.0790941], // Upper Left
                [106.9742925, -6.0790941], // Upper Right
                [106.9742925, -6.3729514], // Lower Right
                [106.6849284, -6.3729514], // Lower Left
              ],
            });
          }

          // Add layer if it doesn't exist
          if (!map.current.getLayer(layerId)) {
            console.log("Adding vulnerability layer");
            map.current.addLayer({
              id: layerId,
              type: "raster",
              source: sourceId,
              paint: {
                "raster-opacity": 0.4,
              },
              layout: {
                visibility: "visible",
              },
            });
          } else {
            // Make sure it's visible
            console.log("Setting layer visibility to visible");
            map.current.setLayoutProperty(layerId, "visibility", "visible");
          }

          // Double-check after a short delay
          setTimeout(() => {
            if (map.current && map.current.getLayer(layerId)) {
              console.log("Double-checking layer visibility");
              map.current.setLayoutProperty(layerId, "visibility", "visible");
            }
          }, 100);
        }
      }
    };

    const handleShowVulnerabilityLayer = (event) => {
      console.log("Show vulnerability layer event:", event.detail);
      // Only update if the show property is explicitly provided
      if (event.detail && typeof event.detail.show !== 'undefined') {
        setShowVulnerabilityLayer(event.detail.show);
      }

      if (map.current) {
        const layerId = "flood-vulnerability-layer";
        const sourceId = "flood-vulnerability";

        // Add source if it doesn't exist
        if (!map.current.getSource(sourceId)) {
          console.log("Adding vulnerability source from button");
          map.current.addSource(sourceId, {
            type: "image",
            url: "/assets/img/Social_Vulnerability_8000px.png",
            coordinates: [
              [106.6849284, -6.0790941], // Upper Left
              [106.9742925, -6.0790941], // Upper Right
              [106.9742925, -6.3729514], // Lower Right
              [106.6849284, -6.3729514], // Lower Left
            ],
          });
        }

        // Add layer if it doesn't exist
        if (!map.current.getLayer(layerId)) {
          console.log("Adding vulnerability layer from button");
          map.current.addLayer({
            id: layerId,
            type: "raster",
            source: sourceId,
            paint: {
              "raster-opacity": 0.4,
            },
          });
        }

        // Make sure it's visible
        map.current.setLayoutProperty(layerId, "visibility", "visible");
      }
    };

    const handleFloodLayerClick = (event) => {
      setFloodPopupInfo(event.detail);
    };

    const handleShowFloodPopup = (event) => {
      const { floodData, lng, lat } = event.detail;
      setFloodPopupInfo(floodData);

      if (map.current && ((lng && lat) || (floodData?.lng && floodData?.lat))) {
        const targetLng = lng || floodData.lng;
        const targetLat = lat || floodData.lat;

        map.current.flyTo({
          center: [targetLng, targetLat],
          zoom: 14,
          essential: true,
        });
      }
    };

    const handleCenterMap = (event) => {
      if (map.current && event.detail) {
        const { lng, lat, zoom = 14 } = event.detail;
        map.current.flyTo({
          center: [lng, lat],
          zoom: zoom,
          essential: true,
        });
      }
    };

    window.addEventListener(
      "simulationStateChange",
      handleSimulationStateChange
    );
    window.addEventListener("floodLayerClick", handleFloodLayerClick);
    window.addEventListener("showFloodPopup", handleShowFloodPopup);
    window.addEventListener("centerMapOnCoordinates", handleCenterMap);
    window.addEventListener(
      "showVulnerabilityLayer",
      handleShowVulnerabilityLayer
    );

    return () => {
      window.removeEventListener(
        "simulationStateChange",
        handleSimulationStateChange
      );
      window.removeEventListener("floodLayerClick", handleFloodLayerClick);
      window.removeEventListener("showFloodPopup", handleShowFloodPopup);
      window.removeEventListener("centerMapOnCoordinates", handleCenterMap);
      window.removeEventListener(
        "showVulnerabilityLayer",
        handleShowVulnerabilityLayer
      );
    };
  }, []);

  // Initial data fetching
  useEffect(() => {
    fetchWaterpumps();
    fetchRainRecorderData();
    fetchWaterLevelData();
  }, [fetchWaterpumps, fetchRainRecorderData, fetchWaterLevelData]);

  // Map initialization
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: [INITIAL_VIEW_STATE.lng, INITIAL_VIEW_STATE.lat],
      zoom: INITIAL_VIEW_STATE.zoom,
      pitch: INITIAL_VIEW_STATE.pitch,
      bearing: INITIAL_VIEW_STATE.bearing,
    });

    map.current.on("load", () => {
      setupRainEffect();
      updateMarkers();
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
  }, [setupRainEffect, lightPreset, labelVisibility, updateMarkers]);

  // Time-based updates
  useEffect(() => {
    updateTimeBasedPreset();
    const intervalId = setInterval(updateTimeBasedPreset, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [updateTimeBasedPreset]);

  // Marker updates
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Flood popup effect
  useEffect(() => {
    if (floodPopupInfo && map.current) {
      const placeholder = document.createElement("div");
      const root = createRoot(placeholder);
      root.render(
        <FloodPopup
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
        />
      );

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        className: "flood-popup",
        maxWidth: "none",
        offset: [0, 0],
      })
        .setLngLat([floodPopupInfo.lng, floodPopupInfo.lat])
        .setDOMContent(placeholder)
        .addTo(map.current);

      popup.on("close", () => {
        setFloodPopupInfo(null);
      });

      return () => {
        popup.remove();
        root.unmount();
      };
    }
  }, [floodPopupInfo]);

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Render the chart */}
      {showChart && chartPoint && (
        <LocationGraph selectedPoint={chartPoint} onClose={closeChart} />
      )}

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
            d="M4 6h16M4 12h16M4 18h16"
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
            {Object.entries({
              showPlaceLabels: "Place Labels",
              showPointOfInterestLabels: "POI Labels",
              showRoadLabels: "Road Labels",
              showTransitLabels: "Transit Labels",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  type="checkbox"
                  id={key}
                  checked={labelVisibility[key]}
                  onChange={handleLabelVisibilityChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showFloodLayer && !showVulnerabilityLayer && (
        <FloodLayer
          map={map.current}
          show={showFloodLayer}
          rainfall={rainfallAmount}
        />
      )}
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
