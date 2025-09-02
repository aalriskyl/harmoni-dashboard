/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import LocationGraph from "./LocationGraph";
import FloodLayer from "./FloodLayer";
import FloodPopup from "./FloodPopup";
import axios from "axios";
import { Chart } from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

// Register the zoom plugin
Chart.register(zoomPlugin);

// Constants
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const INITIAL_VIEW_STATE = {
  lng: 106.82726262118713,
  lat: -6.1749547950820505,
  zoom: 17.2,
  pitch: 60,
  bearing: -30,
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
    max-width: 350px !important;
  }
  .mapboxgl-popup-content .popup-content {
    padding: 12px;
  }
  .chart-wrapper {
    width: 100%;
    height: 100%;
  }
  
  /* Cross-section specific styles */
  .cross-section-popup .popup-page {
    display: none;
    flex-direction: column;
    transition: opacity 0.3s ease-in-out;
    width: 100%;
  }
  .cross-section-popup .popup-page.active {
    display: flex;
  }
  .cross-section-popup .pagination-dot {
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    padding: 0;
    margin: 0 2px;
  }
  .cross-section-popup .pagination-dot.active {
    transform: scale(1.2);
  }
  .cross-section-popup .mapboxgl-popup-content {
    width: 420px;
    max-width: 90vw;
    padding: 1.25rem !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  }
  
  /* Standard popup styles */
  .standard-popup .popup-page {
    display: none;
    flex-direction: column;
    transition: opacity 0.3s ease-in-out;
    width: 100%;
  }
  .standard-popup .popup-page.active {
    display: flex;
  }
  .standard-popup .pagination-dot {
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    padding: 0;
    margin: 0 2px;
  }
  .standard-popup .pagination-dot.active {
    transform: scale(1.2);
  }
  .standard-popup .mapboxgl-popup-content {
    width: 400px;
    max-width: 90vw;
    padding: 1.25rem !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
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

const Map = ({
  showPumps = true,
  showWaterLevels = true,
  showRainRecorders = true,
  showRivers = true,
  showCrossSections = true,
  onTogglePumps,
  onToggleWaterLevels,
  onToggleRainRecorders,
  onToggleRivers,
  onToggleCrossSections,
}) => {
  // Refs
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const popups = useRef([]);
  // Store previous prop values for comparison
  const prevPropsRef = useRef({
    showPumps,
    showWaterLevels,
    showRainRecorders,
    showRivers,
    showCrossSections,
  });
  // Rain canvas fallback for environments without map.setRain
  const rainCanvasRef = useRef(null);
  const rainAnimationRef = useRef(null);
  const rainParticlesRef = useRef([]);

  // State - only for internal component state, not derived from props
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [riverSourceId] = useState("rivers-source");
  const [riverLayerId] = useState("rivers-layer");
  const [waterPumps, setWaterPumps] = useState([]);
  const [pumpStations, setPumpStations] = useState([]);
  const [floodData, setFloodData] = useState([]);
  const [showFloodHeatmap, setShowFloodHeatmap] = useState(false);
  const [waterLevelData, setWaterLevelData] = useState([]);
  const [rainRecorderData, setRainRecorderData] = useState([]);
  const [crossSectionData, setCrossSectionData] = useState([]);
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
  const [riverHoverInfo, setRiverHoverInfo] = useState(null);
  const [isRaining, setIsRaining] = useState(false);
  // Update marker visibility function - optimized to prevent unnecessary updates
  const updateMarkerVisibility = useCallback(() => {
    if (!markers.current.length || !map.current) return;
    
    markers.current.forEach(marker => {
      if (!marker || !marker._type) return;
      const element = marker.getElement();
      if (!element) return;
      
      const isVisible = (() => {
        switch(marker._type) {
          case 'pump': return showPumps;
          case 'waterlevel': return showWaterLevels;
          case 'rainrecorder': return showRainRecorders;
          case 'crosssection': return showCrossSections;
          case 'floodincident': return true;
          default: return true;
        }
      })();
      
      // Only update if visibility actually changed
      const wasVisible = !element.classList.contains('hidden');
      if (isVisible !== wasVisible) {
        element.classList.toggle('hidden', !isVisible);
      }
    });
  }, [showPumps, showWaterLevels, showRainRecorders, showCrossSections]);

  // Effect to update marker visibility when props change - optimized
  useEffect(() => {
    if (!map.current || !isMapInitialized) return;
    
    // Only update visibility if the relevant props have changed
    const prevProps = prevPropsRef.current;
    if (prevProps && 
        prevProps.showPumps === showPumps &&
        prevProps.showWaterLevels === showWaterLevels &&
        prevProps.showRainRecorders === showRainRecorders &&
        prevProps.showCrossSections === showCrossSections) {
      return; // Skip if visibility props haven't changed
    }
    
    updateMarkerVisibility();
    
    // Update previous props
    prevPropsRef.current = {
      showPumps,
      showWaterLevels,
      showRainRecorders,
      showRivers,
      showCrossSections,
    };
  }, [showPumps, showWaterLevels, showRainRecorders, showCrossSections, isMapInitialized, updateMarkerVisibility]);

  // Define image bounds for overlays
  const imageBounds = [
    [106.6849284, -6.0790941], // Upper left
    [106.9742925, -6.0790941], // Upper right
    [106.9742925, -6.3729514], // Lower right
    [106.6849284, -6.3729514], // Lower left
  ];

  // Initialize markers with proper type normalization and visibility
  const initializeMarkers = useCallback((marker, type) => {
    if (!marker || !type) return;
    
    // Normalize the type for consistent checking
    let normalizedType = type.toLowerCase();
    if (normalizedType === 'waterpump') normalizedType = 'pump';
    if (normalizedType === 'waterlevel') normalizedType = 'waterlevel';
    if (normalizedType === 'rainrecorder') normalizedType = 'rainrecorder';
    if (normalizedType === 'crosssection') normalizedType = 'crosssection';
    
    marker._type = normalizedType;
    const element = marker.getElement();
    if (!element) return;
    
    // Add marker class and set initial visibility
    element.classList.add('marker');
    updateMarkerVisibility();
    markers.current.push(marker);
  }, [updateMarkerVisibility]);

  const addRiverLayers = (riverData) => {
    // Add base river layer (thicker solid line for background)
    map.current.addLayer({
      id: `${riverLayerId}-base`,
      type: "line",
      source: riverSourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 6,
        "line-opacity": 0.4,
      },
    });

    // Add animated dashed line layer
    map.current.addLayer({
      id: riverLayerId,
      type: "line",
      source: riverSourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 6,
        "line-dasharray": [0, 4, 3],
        "line-opacity": 1,
        "line-emissive-strength": 1,
      },
    });

    // Animation sequence for the dash array (top-to-bottom flow)
    // REVERSED the sequence to achieve true top-to-bottom flow
    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ];

    let step = 0;
    let animationFrame = null;

    // Animation function for top-to-bottom flow
    const animateDashArray = (timestamp) => {
      if (!map.current.getLayer(riverLayerId) || !showRivers) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        return;
      }

      const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);

      if (newStep !== step) {
        map.current.setPaintProperty(
          riverLayerId,
          "line-dasharray",
          dashArraySequence[newStep]
        );
        step = newStep;
      }

      animationFrame = requestAnimationFrame(animateDashArray);
    };

    // Start the animation
    animationFrame = requestAnimationFrame(animateDashArray);

    // Ensure river layers are above boundary layers if boundary exists
    try {
      if (map.current.getLayer(riverLayerId)) {
        map.current.moveLayer(riverLayerId);
      }
      if (map.current.getLayer(`${riverLayerId}-base`)) {
        map.current.moveLayer(`${riverLayerId}-base`);
      }
    } catch (err) {
      // ignore when layers not present yet
    }

    // Cleanup function
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      if (map.current) {
        if (map.current.getLayer(riverLayerId)) {
          map.current.removeLayer(riverLayerId);
        }
        if (map.current.getLayer(`${riverLayerId}-base`)) {
          map.current.removeLayer(`${riverLayerId}-base`);
        }
        if (map.current.getSource(riverSourceId)) {
          map.current.removeSource(riverSourceId);
        }
      }
    };
  };

  // Function to calculate a single point in the middle of the line segment
  const calculateMidpoint = (coords) => {
    if (coords.length === 0) return null;
    if (coords.length === 1) return coords[0];

    // Return a point near the middle of the line
    const midIndex = Math.floor(coords.length / 2);
    return coords[midIndex];
  };

  // Function to process river data for top-to-bottom flow and add markers
  const processRiverData = (data) => {
    const riverMarkers = [];

    const processedFeatures = data.features.map((feature, index) => {
      // For LineString features
      if (feature.geometry.type === "LineString") {
        // Sort coordinates by latitude (second element) in ascending order
        // so the ant-path animation flows bottom-to-top (south -> north)
        const sortedCoords = [...feature.geometry.coordinates].sort(
          (a, b) => a[1] - b[1]
        );

        // Add marker at midpoint
        const midpoint = calculateMidpoint(sortedCoords);
        if (midpoint) {
          riverMarkers.push({
            id: `river-marker-${index}`,
            type: "river",
            lng: midpoint[0],
            lat: midpoint[1],
            name: feature.properties?.name || "Unnamed River",
            properties: feature.properties,
          });
        }

        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: sortedCoords,
          },
        };
      }

      // For MultiLineString features, process each line
      if (feature.geometry.type === "MultiLineString") {
        const processedLines = feature.geometry.coordinates.map(
          (line, lineIndex) => {
            const sortedLine = [...line].sort((a, b) => a[1] - b[1]);

            // Add marker at midpoint of each line segment
            const midpoint = calculateMidpoint(sortedLine);
            if (midpoint) {
              riverMarkers.push({
                id: `river-marker-${index}-${lineIndex}`,
                type: "river",
                lng: midpoint[0],
                lat: midpoint[1],
                name: feature.properties?.name || "Unnamed River",
                properties: feature.properties,
              });
            }

            return sortedLine;
          }
        );

        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: processedLines,
          },
        };
      }

      return feature;
    });

    return {
      ...data,
      features: processedFeatures,
      riverMarkers,
    };
  };

  // Load and update river data with ant path animation
  useEffect(() => {
    if (!map.current || !showRivers) return;

    // Clean up any existing layers and source
    if (map.current.getLayer(riverLayerId)) {
      map.current.removeLayer(riverLayerId);
    }
    if (map.current.getLayer(`${riverLayerId}-base`)) {
      map.current.removeLayer(`${riverLayerId}-base`);
    }
    if (map.current.getSource(riverSourceId)) {
      map.current.removeSource(riverSourceId);
    }

    // Load and process river data
    fetch("/data/Batas_Sungai_DKI_Jakarta.geojson")
      .then((response) => response.json())
      .then((data) => {
        // Process the data to ensure top-to-bottom flow
        const processedData = processRiverData(data);

        // Add the source
        map.current.addSource(riverSourceId, {
          type: "geojson",
          data: processedData,
        });

        // Add the river layers
        addRiverLayers(processedData);

        // We do not create individual river markers here; the map shows the
        // animated ant-path only. Any river markers were removed per UX request.
      })
      .catch((error) => {
        console.error("Error loading river data:", error);
      });

    // Cleanup function
    return () => {
      // Remove layers and source
      if (map.current) {
        if (map.current.getLayer(riverLayerId)) {
          map.current.removeLayer(riverLayerId);
        }
        if (map.current.getLayer(`${riverLayerId}-base`)) {
          map.current.removeLayer(`${riverLayerId}-base`);
        }
        if (map.current.getSource(riverSourceId)) {
          map.current.removeSource(riverSourceId);
        }
      }

      // Remove river markers
      if (markers.current) {
        markers.current = markers.current.filter((marker) => {
          if (marker.type === "river") {
            if (marker.marker) marker.marker.remove();
            if (marker.popup) marker.popup.remove();
            if (marker.element && marker.element.parentNode) {
              marker.element.parentNode.removeChild(marker.element);
            }
            return false;
          }
          return true;
        });
      }
    };
  }, [showRivers, riverLayerId, map.current]);

  // Load and display Jakarta province administrative boundary (perimeter only)
  useEffect(() => {
    if (!map.current) return;

    const sourceId = "jakarta-boundary-source";
    const glowLayerId = "jakarta-boundary-glow";
    const lineLayerId = "jakarta-boundary-line";

    // Fetch GeoJSON (served from public/data) and convert polygons to outlines
    fetch("/data/Batas_Administrasi_Provinsi_DKI_Jakarta.geojson")
      .then((res) => res.json())
      .then((data) => {
        try {
          const features = data?.features || [];

          // Convert Polygon/MultiPolygon to LineString outlines
          const outlineFeatures = features.flatMap((feature) => {
            const geom = feature.geometry || {};
            const props = feature.properties || {};

            if (geom.type === "Polygon") {
              const outer = (geom.coordinates && geom.coordinates[0]) || [];
              return [
                {
                  type: "Feature",
                  properties: props,
                  geometry: { type: "LineString", coordinates: outer },
                },
              ];
            }

            if (geom.type === "MultiPolygon") {
              return (geom.coordinates || []).map((poly) => ({
                type: "Feature",
                properties: props,
                geometry: { type: "LineString", coordinates: poly[0] || [] },
              }));
            }

            if (geom.type === "LineString") return [feature];
            if (geom.type === "MultiLineString") {
              return (geom.coordinates || []).map((coords) => ({
                type: "Feature",
                properties: props,
                geometry: { type: "LineString", coordinates: coords },
              }));
            }

            return [];
          });

          const outlineGeo = {
            type: "FeatureCollection",
            features: outlineFeatures,
          };

          // Add or update source with outline-only data
          if (map.current.getSource(sourceId)) {
            map.current.getSource(sourceId).setData(outlineGeo);
          } else {
            map.current.addSource(sourceId, {
              type: "geojson",
              data: outlineGeo,
            });

            const glowLayer = {
              id: glowLayerId,
              type: "line",
              source: sourceId,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#ffffff",
                "line-width": 15,
                "line-opacity": 0.85,
                "line-blur": 10,
              },
            };

            const lineLayer = {
              id: lineLayerId,
              type: "line",
              source: sourceId,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": "#ffffff",
                "line-width": 4,
                "line-opacity": 1,
              },
            };

            try {
              map.current.addLayer(glowLayer);
              map.current.addLayer(lineLayer);
              // Ensure river ant-path layers sit above the Jakarta boundary
              try {
                if (map.current.getLayer(riverLayerId)) {
                  map.current.moveLayer(riverLayerId);
                }
                if (map.current.getLayer(`${riverLayerId}-base`)) {
                  map.current.moveLayer(`${riverLayerId}-base`);
                }
              } catch (err) {
                // ignore if river layers not yet present
              }
            } catch (err) {
              console.warn("Failed to add Jakarta boundary layers:", err);
            }
          }
        } catch (err) {
          console.error("Error processing Jakarta boundary geojson:", err);
        }
      })
      .catch((err) => {
        console.error("Error loading Jakarta boundary geojson:", err);
      });

    return () => {
      if (!map.current) return;
      if (map.current.getLayer(lineLayerId))
        map.current.removeLayer(lineLayerId);
      if (map.current.getLayer(glowLayerId))
        map.current.removeLayer(glowLayerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
    };
  }, [map.current, riverLayerId]);

  // Add or update flood image overlay
  const updateFloodImage = useCallback((imagePath) => {
    if (!map.current) return;

    const layerId = "flood-image-layer";
    const sourceId = "flood-image-source";
    const vulnerabilityLayerId = "vulnerability-layer";

    // Hide and remove vulnerability layer when showing flood/risk layer
    if (map.current.getLayer(vulnerabilityLayerId)) {
      map.current.removeLayer(vulnerabilityLayerId);
    }
    if (map.current.getSource("vulnerability-source")) {
      map.current.removeSource("vulnerability-source");
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
        type: "image",
        url: imagePath,
        coordinates: imageBounds,
      });

      map.current.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        paint: {
          "raster-opacity": 0.7,
        },
      });
    }
  }, []);

  // Hide markers and controls while welcome overlay is visible
  useEffect(() => {
    function onShow() {
      // hide markers
      markers.current.forEach((m) => {
        try {
          const el = m.getElement();
          if (el) {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
            el.style.transition = "opacity 200ms ease";
          }
        } catch (e) {
          // ignore
        }
      });
    }

    function onHide() {
      markers.current.forEach((m) => {
        try {
          const el = m.getElement();
          if (el) {
            el.style.opacity = "";
            el.style.pointerEvents = "";
            el.style.transition = "opacity 200ms ease";
          }
        } catch (e) {
          // ignore
        }
      });
    }

    window.addEventListener("welcomeShown", onShow);
    window.addEventListener("welcomeHidden", onHide);

    // initialize if welcome is already visible
    if (typeof window !== "undefined" && window.__welcomeVisible) onShow();

    return () => {
      window.removeEventListener("welcomeShown", onShow);
      window.removeEventListener("welcomeHidden", onHide);
    };
  }, []);

  // Add event listener for flood image updates
  useEffect(() => {
    const handleUpdateFloodImage = (event) => {
      updateFloodImage(event.detail.imagePath);
    };

    window.addEventListener("updateFloodImage", handleUpdateFloodImage);
    return () => {
      window.removeEventListener("updateFloodImage", handleUpdateFloodImage);
    };
  }, [updateFloodImage]);

  // Add this method inside the Map component
  const toggleVulnerabilityLayer = useCallback(
    (show) => {
      setShowVulnerabilityLayer(show);

      if (!map.current) return;

      const layerId = "vulnerability-layer";
      const sourceId = "vulnerability-source";
      const floodLayerId = "flood-image-layer";

      if (show) {
        // Hide flood layer if it exists
        if (map.current.getLayer(floodLayerId)) {
          map.current.removeLayer(floodLayerId);
        }
        const floodSourceId = "flood-image-source";
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

  // Toggle visibility handlers - simplified and optimized
  const togglePumps = useCallback(() => onTogglePumps?.(), [onTogglePumps]);
  const toggleWaterLevels = useCallback(() => onToggleWaterLevels?.(), [onToggleWaterLevels]);
  const toggleRainRecorders = useCallback(() => onToggleRainRecorders?.(), [onToggleRainRecorders]);
  const toggleCrossSections = useCallback(() => onToggleCrossSections?.(), [onToggleCrossSections]);

  // Derived state
  const pinPoints = useMemo(
    () => [
      ...pumpStations,
      ...waterLevelData,
      ...rainRecorderData,
      ...crossSectionData,
    ],
    [pumpStations, waterLevelData, rainRecorderData, crossSectionData]
  );

  const pointsToShow = useMemo(() => {
    return pinPoints.filter((point) => {
      if (point.type === "Waterpump") return showPumps;
      if (point.type === "WaterLevel") return showWaterLevels;
      if (point.type === "RainRecorder") return showRainRecorders;
      if (point.type === "CrossSection") return showCrossSections;
      return true; // Show other point types by default
    });
  }, [
    pinPoints,
    showPumps,
    showWaterLevels,
    showRainRecorders,
    showCrossSections,
  ]);

  // Helper functions
  const getTimeBasedPreset = (hour) => {
    if (hour >= 5 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 17) return "day";
    if (hour >= 17 && hour < 19) return "dusk";
    return "night";
  };

  const setupRiverHover = useCallback(() => {
    if (!map.current) return;

    // Add hover effect for rivers
    map.current.on("mousemove", riverLayerId, (e) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      const name = feature.properties?.name || "Unnamed River";

      // Show cursor as pointer
      map.current.getCanvas().style.cursor = "pointer";

      // Set hover info
      setRiverHoverInfo({
        lngLat: e.point,
        name: name,
      });
    });

    map.current.on("mouseleave", riverLayerId, () => {
      map.current.getCanvas().style.cursor = "";
      setRiverHoverInfo(null);
    });
  }, [riverLayerId]);

  // Register hover handlers when map and river layer are available
  useEffect(() => {
    if (!map.current) return;
    try {
      setupRiverHover();
    } catch (err) {
      console.warn("setupRiverHover failed:", err);
    }

    return () => {
      if (!map.current) return;
      try {
        map.current.off("mousemove", riverLayerId);
        map.current.off("mouseleave", riverLayerId);
      } catch (err) {
        // ignore
      }
    };
  }, [map.current, setupRiverHover, riverLayerId]);

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
    // Default rain setup (initially off/minimal). Detailed settings are
    // applied by `applyRainSettings` when simulation triggers rain.
    const zoomBasedReveal = (scale = 1.0) => {
      return ["interpolate", ["linear"], ["zoom"], 0, 0, 24, scale];
    };

    // set a minimal rain configuration (no visible rain)
    try {
      map.current.setRain({
        density: zoomBasedReveal(0),
        intensity: 0,
        color: "#a8adbc",
        opacity: 0,
        vignette: zoomBasedReveal(0),
        "vignette-color": "#464646",
        direction: [0, 80],
        "droplet-size": [2.6, 18.2],
        "distortion-strength": 0.7,
        "center-thinning": 0,
      });
    } catch (err) {
      // Some Mapbox builds may not have setRain — ignore silently
    }
  }, []);

  const computeRainParams = (rainfall) => {
    // rainfall expected 0..150 (mm/day). Map to intensity and density.
    const clamped = Math.max(0, Math.min(150, Number(rainfall || 0)));
    // intensity range 0.0 - 1.5
    const intensity = clamped === 0 ? 0 : Math.min(1.5, (clamped / 150) * 1.5);
    // density scale: small when light rain, larger when heavy
    const densityScale = clamped === 0 ? 0 : Math.min(1.0, clamped / 150);
    // droplet size range roughly scaled with rainfall
    const dropletMin = 2.6;
    const dropletMax = 18.2;
    const dropletLow = dropletMin + (dropletMax - dropletMin) * densityScale;

    return { intensity, densityScale, dropletLow };
  };

  // Apply rain settings when simulation changes
  useEffect(() => {
    if (!map.current) return;

    const applyRainSettings = () => {
      const { intensity, densityScale, dropletLow } =
        computeRainParams(rainfallAmount);
      const zoomBasedReveal = (scale = 1.0) => {
        return ["interpolate", ["linear"], ["zoom"], 0, 0, 24, scale];
      };

      try {
        const dropletMax = 18.2;
        if (!isRaining || intensity === 0) {
          // Turn off rain visually
          map.current.setRain({
            density: zoomBasedReveal(0),
            intensity: 0,
            opacity: 0,
            vignette: zoomBasedReveal(0),
          });
        } else {
          map.current.setRain({
            density: zoomBasedReveal(densityScale),
            intensity: intensity,
            color: "#a8adbc",
            opacity: Math.min(0.9, 0.4 + densityScale * 0.6),
            vignette: zoomBasedReveal(1.0),
            "vignette-color": "#464646",
            direction: [0, 80],
            "droplet-size": [dropletLow, dropletMax],
            "distortion-strength": 0.7,
            "center-thinning": 0,
          });
        }
      } catch (err) {
        console.warn("setRain not available on this map instance:", err);
      }
    };

    applyRainSettings();
  }, [isRaining, rainfallAmount]);

  // Canvas-based rain fallback animation (independent of map.setRain)
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    const container = mapContainer.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let rafId = null;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    const { intensity, densityScale, dropletLow } =
      computeRainParams(rainfallAmount);

    const maxParticles = Math.round(30 + densityScale * 370); // 30..400

    // Initialize or shrink/expand particles
    const initParticles = () => {
      const w = canvas.clientWidth || container.clientWidth;
      const h = canvas.clientHeight || container.clientHeight;
      const particles = rainParticlesRef.current || [];
      while (particles.length < maxParticles) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * -h,
          len: 6 + Math.random() * (dropletLow / 2 + 6),
          speed: 2 + intensity * 18 + Math.random() * 4,
          alpha: 0.2 + Math.random() * 0.6,
        });
      }
      if (particles.length > maxParticles) particles.length = maxParticles;
      rainParticlesRef.current = particles;
    };

    const draw = () => {
      const w = canvas.clientWidth || container.clientWidth;
      const h = canvas.clientHeight || container.clientHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      // draw with light bluish streaks
      ctx.strokeStyle = "rgba(168,173,188,0.9)";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      const particles = rainParticlesRef.current || [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = Math.min(1, p.alpha * (0.2 + intensity * 0.8));
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.len * 0.15, p.y + p.len);
        ctx.stroke();

        p.y += p.speed;
        p.x += p.speed * 0.03; // slight drift

        if (p.y > h + 20) {
          p.y = Math.random() * -h * 0.5;
          p.x = Math.random() * w;
          p.speed = 2 + intensity * 18 + Math.random() * 4;
          p.len = 6 + Math.random() * (dropletLow / 2 + 6);
          p.alpha = 0.2 + Math.random() * 0.6;
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
      rainAnimationRef.current = rafId;
    };

    const start = () => {
      resize();
      initParticles();
      if (!rafId) draw();
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      rainAnimationRef.current = null;
      // clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rainParticlesRef.current = [];
    };

    const onResize = () => {
      // Reset transform and resize correctly
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resize();
    };

    window.addEventListener("resize", onResize);

    if (isRaining && intensity > 0) {
      start();
    } else {
      stop();
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
      rainAnimationRef.current = null;
    };
    // We intentionally include computeRainParams to recalc derived values
  }, [isRaining, rainfallAmount, mapContainer.current, rainCanvasRef.current]);

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
        const processedData = data.features
          .map((feature, index) => {
            const props = feature.properties || {};
            const readingData = props.Reading || {};
            const dates = Object.keys(readingData).sort();
            const latestDate = dates[dates.length - 1] || "N/A";
            const latestRainfall = latestDate ? readingData[latestDate] : 0;

            const lng = parseFloat(props.Longitude);
            const lat = parseFloat(props.Latitude);

            if (isNaN(lng) || isNaN(lat)) return null;

            // Generate sample rainfall data for the chart
            const rainfallData = [];
            const now = new Date();
            for (let i = 0; i < 24; i++) {
              const time = new Date(now);
              time.setHours(time.getHours() - (23 - i));
              const hour = time.getHours();
              const minutes = time.getMinutes();
              const timeString = `${hour.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;
              const rainfall = Math.random() * 20; // Random rainfall data for demo
              rainfallData.push({ time: timeString, rainfall });
            }

            return {
              id: 2000 + index,
              lng,
              lat,
              title: props.ARR_Name || `Rain Recorder ${index + 1}`,
              type: "RainRecorder",
              color: "#3b82f6",
              status: props.Device_Condition || "Active",
              deviceId:
                props.Device_ID || `RR-${String(index + 1).padStart(3, "0")}`,
              location:
                [props.Kelurahan, props.Kecamatan, props.Kota, props.Provinsi]
                  .filter(Boolean)
                  .join(", ") || "Unknown location",
              properties: props,
              precipitationData: readingData,
              latestReading: {
                rainfall: latestRainfall,
                date: latestDate || "N/A",
                condition:
                  latestRainfall > 50
                    ? "Heavy Rain"
                    : latestRainfall > 20
                    ? "Moderate Rain"
                    : latestRainfall > 0
                    ? "Light Rain"
                    : "No Rain",
                forecast: props["Reading_(+6hr)"] || "N/A",
              },
              details: {
                jenisAlat: props.Type || "N/A",
                merkAlat: props.Brand || "N/A",
                provinsi: props.Provinsi || "N/A",
                pengelola: props.Manager || "N/A",
                tahunDibangun: props.Built_Year || "N/A",
                wilayahSungai: props.River_Region || "N/A",
                kondisiAlat: props.Device_Condition || "N/A",
                catchment: props.Catchment_Name || "N/A",
                dataFrequency: props.Data_Frequency || "N/A",
                lastMaintenance: props.Last_Maintenance || "N/A",
                dataCompleteness: props.Data_Completeness || "N/A",
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
          })
          .filter(Boolean);

        setRainRecorderData(processedData);
      }
    } catch (error) {
      console.error("Error fetching rain recorder data:", error);
    }
  }, []);

  const fetchCrossSectionData = useCallback(async () => {
    try {
      const response = await axios.get(
        "/data/Cross_Section_Sungai_Ciliwung_001_DKI_Jakarta.geojson"
      );
      const data = response.data;

      if (data?.features) {
        const processedData = data.features
          .map((feature, index) => {
            const props = feature.properties || {};
            const lng = parseFloat(feature.geometry.coordinates[0]);
            const lat = parseFloat(feature.geometry.coordinates[1]);

            if (isNaN(lng) || isNaN(lat)) return null;

            return {
              id: 4000 + index,
              lng,
              lat,
              title: props.Cross_Section_ID || `Cross Section ${index + 1}`,
              type: "CrossSection", // Make sure this is set correctly
              color: "#8b5cf6",
              status: "Active",
              deviceId:
                props.Cross_Section_ID ||
                `CS-${String(index + 1).padStart(3, "0")}`,
              location: props.River_Name || "Unknown location",
              properties: props, // Make sure all properties are included
              latestReading: {
                waterDepth: props.Water_Depth_m
                  ? `${props.Water_Depth_m} m`
                  : "N/A",
                date: props.Simulated_Date || "N/A",
                condition: "Normal",
              },
            };
          })
          .filter(Boolean);

        setCrossSectionData(processedData);
      }
    } catch (error) {
      console.error("Error fetching cross section data:", error);
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
            const waterLevels = feature.properties.Reading || {};
            const sortedDates = Object.keys(waterLevels).sort();
            const latestDate = sortedDates.pop();
            const latestLevel = latestDate ? waterLevels[latestDate] : "N/A";

            const lng = parseFloat(feature.properties.Longitude);
            const lat = parseFloat(feature.properties.Latitude);

            if (isNaN(lng) || isNaN(lat)) return null;

            return {
              id: 3000 + index,
              lng,
              lat,
              title:
                feature.properties.AWLR_Name ||
                `Water Level Station ${index + 1}`,
              type: "WaterLevel",
              color: "#06b6d4",
              status: feature.properties.Station_Condition || "Unknown",
              deviceId:
                feature.properties.Device_ID ||
                `WL-${String(index + 1).padStart(3, "0")}`,
              location:
                [
                  feature.properties.Kelurahan,
                  feature.properties.Kecamatan,
                  feature.properties.Kota,
                  feature.properties.Provinsi,
                ]
                  .filter(Boolean)
                  .join(", ") || "Unknown location",
              // Store the complete properties including water level data
              properties: feature.properties,
              // Store water level data separately for easy access
              waterLevelData: waterLevels,
              latestReading: {
                level: latestLevel,
                date: latestDate || "N/A",
                condition: feature.properties.Device_Condition || "N/A",
                forecast: feature.properties["Reading_(+6hr)"] || "N/A",
              },
              details: {
                brand: feature.properties.Brand || "N/A",
                catchment: feature.properties.Catchment_Name || "N/A",
                builtYear: feature.properties.Built_Year || "N/A",
                manager: feature.properties.Manager || "N/A",
                riverRegion: feature.properties.River_Region || "N/A",
                type: feature.properties.Type || "N/A",
                dataFrequency: feature.properties.Data_Frequency || "N/A",
                lastMaintenance: feature.properties.Last_Maintenance || "N/A",
                dataCompleteness: feature.properties.Data_Completeness || "N/A",
              },
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
    let data = null;
    let dataType = "";

    // Check if it's a rain recorder (ARR)
    if (point.type === "RainRecorder") {
      const completeFeature = rainRecorderData.find(
        (feature) => feature.lng === point.lng && feature.lat === point.lat
      );

      if (completeFeature?.precipitationData) {
        data = completeFeature.precipitationData;
        dataType = "ARR";
      }
    }
    // Check if it's a water level station (AWLR)
    else if (point.type === "WaterLevel") {
      const completeFeature = waterLevelData.find(
        (feature) => feature.lng === point.lng && feature.lat === point.lat
      );

      if (completeFeature && completeFeature.properties?.Reading) {
        data = completeFeature.properties.Reading;
        dataType = "AWLR";
      }
    }

    if (data) {
      setChartPoint({
        ...point,
        // Pass the data directly
        chartData: data,
        // Also pass the properties for the title
        properties: {
          Nama_Pos: point.title,
        },
        dataType: dataType,
      });
      setShowChart(!showChart);
    } else {
      console.error("Could not find data for this location");
      alert(
        `No ${
          point.type === "RainRecorder" ? "precipitation" : "water level"
        } data available for this location`
      );
    }
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
        : "bg-green-500 hover:bg-green-600";
    } else if (point.type === "RainRecorder" || point.type === "WaterLevel") {
      const condition = point.latestReading?.condition?.toLowerCase();
      return condition === "poor"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-green-500 hover:bg-green-600";
    } else if (point.type === "CrossSection") {
      return "bg-purple-600 hover:bg-purple-700"; // Different color for cross sections
    }
    return "bg-blue-600 hover:bg-blue-700";
  };

  const getStatusText = (point) => {
    if (point.type === "Waterpump") {
      return point.status === "Not Running" ? "Stopped" : "Running";
    } else if (point.type === "RainRecorder" || point.type === "WaterLevel") {
      const condition = point.latestReading?.condition?.toLowerCase();
      return condition === "poor" ? "Poor" : "Good";
    } else if (point.type === "CrossSection") {
      return point.latestReading?.condition || "Normal";
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
      case "CrossSection":
        return "/assets/img/River_Cross_Section_Icon.svg";
      case "River":
        return "/assets/img/River_Cross_Section_Icon.svg";
      default:
        return "/assets/img/marker-icon.svg";
    }
  };

  const renderInfoRows = (point) => {
    if (point.type === "Waterpump") {
      return `
        <div class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
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
          <span class="break-words">${point.location}</span>
        </div>
      `;
    } else if (point.type === "CrossSection") {
      const props = point.properties || {};
      const profile = Array.isArray(props.Cross_Section_Profile)
        ? props.Cross_Section_Profile
        : [];

      // Calculate max depth and width for the profile
      const maxDepth = Math.max(...profile.map((p) => p.depth), 0);
      const maxWidth = Math.max(...profile.map((p) => p.station), 0);

      return `
        <div class="space-y-2">
          <div class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
            <span class="text-gray-600">Cross Section ID:</span>
            <span class="font-medium">${props.Cross_Section_ID || "N/A"}</span>
            
            <span class="text-gray-600">River Name:</span>
            <span>${props.River_Name || "N/A"}</span>
            
            <span class="text-gray-600">Water Depth:</span>
            <span>${
              props.Water_Depth_m ? `${props.Water_Depth_m} m` : "N/A"
            }</span>
            
            <span class="text-gray-600">Simulation Date:</span>
            <span>${props.Simulated_Date || "N/A"}</span>
            
            <span class="text-gray-600">Simulation Time:</span>
            <span>${props.Simulated_Time || "N/A"}</span>
            
            <span class="text-gray-600">Rainfall:</span>
            <span>${
              props.Simulated_Rain_mm ? `${props.Simulated_Rain_mm} mm` : "N/A"
            }</span>
            
            <span class="text-gray-600">Catchment:</span>
            <span>${props.Catchment_Name || "N/A"}</span>
            
            <span class="text-gray-600">Model Accuracy:</span>
            <span>${
              props.Accuracy ? `${(props.Accuracy * 100).toFixed(1)}%` : "N/A"
            }</span>
            
            <span class="text-gray-600">Return Period:</span>
            <span>${props.Return_Period || "N/A"}</span>
          </div>
          
          ${
            profile.length > 0
              ? `
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>River Cross-Section Profile</span>
              <span>Max Depth: ${maxDepth.toFixed(1)}m</span>
            </div>
            <div class="h-32 bg-gray-100 rounded relative overflow-hidden">
              <svg class="w-full h-full" viewBox="0 0 ${Math.max(
                100,
                maxWidth
              )} ${Math.max(50, maxDepth * 2)}" preserveAspectRatio="none">
                <path 
                  d="M${profile
                    .map(
                      (p, i) => `${i === 0 ? "" : "L"}${p.station},${p.depth}`
                    )
                    .join(" ")}" 
                  fill="#3b82f6" 
                  fill-opacity="0.2" 
                  stroke="#1d4ed8" 
                  stroke-width="1.5" 
                  stroke-linejoin="round"
                />
                <line 
                  x1="0" 
                  y1="${maxDepth}" 
                  x2="${maxWidth}" 
                  y2="${maxDepth}" 
                  stroke="#ef4444" 
                  stroke-width="1" 
                  stroke-dasharray="4 2"
                />
                <text x="5" y="${
                  maxDepth - 2
                }" font-size="4" fill="#ef4444">Water Level</text>
              </svg>
            </div>
          </div>`
              : ""
          }
          
          <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <div class="font-medium text-gray-600">Model Information</div>
                <div>Method: ${props.Methodology || "N/A"}</div>
                <div>Software: ${props.Software || "N/A"}</div>
                <div>Calibrated: ${props.Model_CalibrationDate || "N/A"}</div>
              </div>
              <div>
                <div class="font-medium text-gray-600">Data Source</div>
                <div>Topography: ${props.Topography_Date || "N/A"}</div>
                <div>Method: ${props.Measurement_Type || "N/A"}</div>
                <div>Manager: ${props.Manager || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (point.type === "RainRecorder") {
      return `
        <div class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
          <span class="text-gray-600">Status:</span>
          <span class="font-medium ${
            point.status === "Active" ? "text-green-600" : "text-red-600"
          }">${point.status}</span>
          <span class="text-gray-600">Device ID:</span>
          <span>${point.deviceId}</span>
          <span class="text-gray-600">Location:</span>
          <span class="break-words">${point.location}</span>
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
        </div>
      `;
    } else if (point.type === "WaterLevel") {
      const condition = point.latestReading?.condition?.toLowerCase() || "good";
      const statusClass =
        condition === "poor"
          ? "bg-red-600 hover:bg-red-700"
          : "bg-green-500 hover:bg-green-600";
      const statusText = condition === "poor" ? "Poor" : "Good";

      return `
        <div class="grid grid-cols-[max-content_max-content_1fr] gap-x-2 gap-y-3 text-sm text-gray-600">
          <span class="font-medium">Rain Status</span>
          <span>:</span>
          <span class="${
            point.latestReading.condition === "Good"
              ? "text-green-600 font-medium"
              : ""
          }">
            ${point.latestReading.condition || "N/A"}
          </span>
          
          <span class="font-medium">Date</span>
          <span>:</span>
          <span>${point.latestReading.date || "N/A"}</span>
          
          <span class="font-medium">Reading</span>
          <span>:</span>
          <span>${
            point.latestReading.level ? `${point.latestReading.level} m` : "N/A"
          }</span>
          
          <span class="font-medium">Reading (+6hr)</span>
          <span>:</span>
          <span>${
            point.latestReading.forecast
              ? `${point.latestReading.forecast}`
              : "N/A"
          }</span>
          
          <span class="font-medium">Location</span>
          <span>:</span>
          <span class="break-words">${point.location || "N/A"}</span>
        </div>
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
    } else if (point.type === "CrossSection") {
      return `
        <span class="text-gray-600">Water Depth:</span>
        <span class="font-medium">${point.latestReading.waterDepth}</span>
        <span class="text-gray-600">Date:</span>
        <span>${point.latestReading.date}</span>
        <span class="text-gray-600">Condition:</span>
        <span>${point.latestReading.condition}</span>
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

  // Helper function to add reset zoom button
  const addResetZoomButton = (container, chart, pointId) => {
    // Remove existing reset button if it exists
    const existingButton = container.querySelector(
      `.reset-zoom-btn-${pointId}`
    );
    if (existingButton) {
      existingButton.remove();
    }

    // Create reset button
    const resetButton = document.createElement("button");
    resetButton.className = `reset-zoom-btn-${pointId} absolute top-2 right-2 bg-white rounded p-1 shadow text-xs opacity-70 hover:opacity-100`;
    resetButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    `;
    resetButton.title = "Reset zoom";

    resetButton.addEventListener("click", () => {
      chart.resetZoom();
    });

    // Add button to the chart container
    const chartContainer = container.querySelector(".chart-container");
    if (chartContainer) {
      chartContainer.style.position = "relative";
      chartContainer.appendChild(resetButton);
    }
  };

  const initializeChart = (point, container) => {
    const canvas = container.querySelector(`#chart-${point.id}`);
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (canvas.chart) {
      canvas.chart.destroy();
    }

    const ctx = canvas.getContext("2d");
    const isRainData = point.type === "RainRecorder";
    const data = isRainData ? point.precipitationData : point.waterLevelData;

    if (!data || Object.keys(data).length === 0) {
      const noDataText = document.createElement("div");
      noDataText.className =
        "w-full h-full flex items-center justify-center text-gray-500 text-sm";
      noDataText.textContent = "No data available";
      canvas.parentNode.appendChild(noDataText);
      return;
    }

    // Sort dates and get the most recent 7 days of data
    const sortedDates = Object.keys(data).sort();
    const last7Days = sortedDates.slice(-7); // Get the 7 most recent days
    const values = last7Days.map((date) => data[date]);

    // Format dates for display (DD/MM/YY)
    const labels = sortedDates.map((date) => {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year.slice(2)}`;
    });

    // Determine chart type based on point type
    const chartType = point.type === "RainRecorder" ? "bar" : "line";

    // Create chart with three-zone background for line chart
    const isLineChart = chartType === "line";
    const maxValue = Math.max(...values, 5); // Default max of 5m if values are lower

    // Create gradient for line chart background
    const gradient = isLineChart
      ? ctx.createLinearGradient(0, 0, 0, canvas.height)
      : null;
    if (gradient) {
      // Red zone (top 1/3)
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.1)");
      gradient.addColorStop(0.33, "rgba(239, 68, 68, 0.1)");
      // Yellow zone (middle 1/3)
      gradient.addColorStop(0.33, "rgba(234, 179, 8, 0.1)");
      gradient.addColorStop(0.66, "rgba(234, 179, 8, 0.1)");
      // Green zone (bottom 1/3)
      gradient.addColorStop(0.66, "rgba(34, 197, 94, 0.1)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0.1)");
    }

    // Create chart
    canvas.chart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: last7Days.map((date) => {
          const [year, month, day] = date.split("-");
          return `${day}/${month}/${year.slice(2)}`;
        }),
        datasets: [
          {
            label: isRainData ? "Rainfall (mm)" : "Water Level (m)",
            data: values,
            backgroundColor: isRainData
              ? values.map((value) => {
                  if (value < 0.76) return "rgba(34, 197, 94, 0.7)"; // Green for normal
                  if (value <= 1.5) return "rgba(234, 179, 8, 0.7)"; // Yellow for cautious
                  return "rgba(239, 68, 68, 0.7)"; // Red for alert
                })
              : gradient || "rgba(16, 185, 129, 0.7)",
            borderColor: isRainData
              ? values.map((value) => {
                  if (value < 0.76) return "rgb(34, 197, 94)"; // Green for normal
                  if (value <= 1.5) return "rgb(234, 179, 8)"; // Yellow for cautious
                  return "rgb(239, 68, 68)"; // Red for alert
                })
              : "rgb(16, 185, 129)",
            borderWidth: 2,
            fill: isLineChart ? true : "origin",
            pointBackgroundColor: "#fff",
            pointBorderColor: isRainData
              ? "rgb(59, 130, 246)"
              : "rgb(16, 185, 129)",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: isRainData
              ? "rgb(59, 130, 246)"
              : "rgb(16, 185, 129)",
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: isLineChart ? 0.3 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: isLineChart ? true : false,
            max: isLineChart ? maxValue : undefined,
            grid: {
              drawOnChartArea: true,
              color: function (context) {
                if (!isLineChart) return "rgba(0, 0, 0, 0.1)";
                const value = context.tick.value;
                if (value >= maxValue * 0.66) return "rgba(239, 68, 68, 0.5)";
                if (value >= maxValue * 0.33) return "rgba(234, 179, 8, 0.5)";
                return "rgba(34, 197, 94, 0.5)";
              },
              lineWidth: 1,
              drawTicks: true,
              tickLength: 0,
            },
            ticks: {
              callback: function (value) {
                return value + (isRainData ? " mm" : " m");
              },
              maxTicksLimit: 6,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: { weight: "bold", size: 14 },
            bodyFont: { size: 13 },
            padding: 10,
            displayColors: false,
            callbacks: {
              title: function (context) {
                // Add 'Reading Date:' before the date
                return `Reading Date: ${context[0].label}`;
              },
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  const value = context.parsed.y;
                  let status = "";
                  if (isLineChart) {
                    if (value >= maxValue * 0.66) status = " (High Risk)";
                    else if (value >= maxValue * 0.33) status = " (Caution)";
                    else status = " (Normal)";
                  }
                  label += value + (isRainData ? " m" : " m") + status;
                }
                return label;
              },
            },
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
              modifierKey: "ctrl", // Use Ctrl key for panning
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
              limits: {
                x: { min: 0, max: 100 }, // Allow full range of data to be viewed
              },
              onZoomComplete: ({ chart }) => {
                chart.update("none");
              },
            },
          },
        },
        animation: {
          duration: 800,
          easing: isRainData ? "easeOutQuart" : "easeInOutQuart",
        },
        barPercentage: 0.9, // Increased from 0.7 to make bars wider
        categoryPercentage: 0.9, // Increased from 0.8 to reduce space between categories
      },
    });

    // Add reset zoom button
    addResetZoomButton(container, canvas.chart, point.id);
  };
  // Add this to re-setup hover when river visibility changes
  useEffect(() => {
    if (!map.current || !showRivers) return;

    // Wait a bit for layers to load, then setup hover
    const timer = setTimeout(() => {
      setupRiverHover();
    }, 500);

    return () => clearTimeout(timer);
  }, [showRivers, setupRiverHover]);

  // Helper function to get status color based on status text
  // Function to close popup
  const closePopup = (popupInstance) => {
    if (popupInstance && popupInstance.remove) {
      popupInstance.remove();
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "#6b7280"; // Default gray

    // Handle case where status is an object with a status property
    const statusString =
      typeof status === "object" ? status.status || "" : String(status);
    const statusLower = statusString.toLowerCase();

    if (
      statusLower.includes("normal") ||
      statusLower.includes("good") ||
      statusLower.includes("active") ||
      statusLower.includes("running")
    )
      return "#10b981"; // Green
    if (
      statusLower.includes("warning") ||
      statusLower.includes("caution") ||
      statusLower.includes("idle")
    )
      return "#f59e0b"; // Yellow
    if (
      statusLower.includes("error") ||
      statusLower.includes("fault") ||
      statusLower.includes("offline") ||
      statusLower.includes("not running")
    )
      return "#ef4444"; // Red
    return "#6b7280"; // Default gray
  };
  // Add this useEffect to debug cross-section data
  useEffect(() => {
    console.log("Cross-section data loaded:", crossSectionData);
    if (crossSectionData.length > 0) {
      console.log("First cross-section item:", crossSectionData[0]);
      console.log(
        "Cross-section profile data:",
        crossSectionData[0].properties?.Cross_Section_Profile
      );
    }
  }, [crossSectionData]);

  // Separate initialization functions for different popup types
  const initializeCrossSectionPopup = (container, point) => {
    // Cross-section specific initialization
    const dots = container.querySelectorAll(".pagination-dot");
    const pages = container.querySelectorAll(".popup-page");
    let csChart = null;

    // Function to switch pages
    const switchPage = (targetPage) => {
      // Update active page
      pages.forEach((page) => {
        if (page.dataset.page === targetPage) {
          page.classList.add("active");
          page.style.display = "flex";
        } else {
          page.classList.remove("active");
          page.style.display = "none";
        }
      });

      // Update indicators
      dots.forEach((ind) => {
        if (ind.dataset.page === targetPage) {
          ind.classList.remove("bg-gray-300");
          ind.classList.add("bg-blue-600");
        } else {
          ind.classList.remove("bg-blue-600");
          ind.classList.add("bg-gray-300");
        }
      });
    };

    // Add click handlers to dots
    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchPage(dot.dataset.page);
      });
    });

    // Initialize first page
    if (pages.length > 0) {
      switchPage("1");
    }

    // Initialize Chart.js for cross-section if canvas exists
    const canvas = container.querySelector(".cross-section-canvas");
    if (canvas) {
      try {
        const props = point.properties || {};
        const profile = Array.isArray(props.Cross_Section_Profile)
          ? props.Cross_Section_Profile
          : [];

        const stations = profile.map((p) => p.station || 0);
        const depths = profile.map((p) => p.depth || 0);

        // If no profile, show a placeholder message inside the canvas container
        if (stations.length === 0) {
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = "12px Inter, sans-serif";
          ctx.fillStyle = "#6b7280";
          ctx.textAlign = "center";
          ctx.fillText(
            "No cross-section profile available",
            canvas.width / 2,
            canvas.height / 2
          );
        } else {
          // Build dataset like the tutorial
          const dataPoints = stations.map((s, i) => ({ x: s, y: depths[i] }));

          const ctx = canvas.getContext("2d");
          csChart = new Chart(ctx, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Cross Section",
                  data: dataPoints,
                  fill: true,
                  borderColor: "#339af0",
                  backgroundColor: "rgba(80,150,255,0.5)",
                  pointRadius: 2,
                  tension: 0.3,
                },
              ],
            },
            options: {
              parsing: false,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  type: "linear",
                  title: { display: true, text: "Station (m)" },
                  grid: { display: false },
                },
                y: {
                  type: "linear",
                  reverse: true,
                  title: { display: true, text: "Depth (m)" },
                  grid: { display: false },
                },
              },
            },
          });
        }
      } catch (err) {
        console.warn("Failed to initialize cross-section chart:", err);
      }
    }

    // Ensure chart is destroyed when popup closes or content removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.removedNodes && m.removedNodes.length > 0) {
          if (csChart && typeof csChart.destroy === "function") {
            csChart.destroy();
            csChart = null;
          }
          observer.disconnect();
        }
      });
    });

    observer.observe(container, { childList: true, subtree: true });
  };

  const initializeStandardPopup = (container, point) => {
    // Standard popup initialization
    const dots = container.querySelectorAll(".pagination-dot");
    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetPage = dot.dataset.page;

        // Update active page
        container.querySelectorAll(".popup-page").forEach((page) => {
          if (page.dataset.page === targetPage) {
            page.classList.add("active");
            page.style.display = "flex";
          } else {
            page.classList.remove("active");
            page.style.display = "none";
          }
        });

        // Update indicators
        dots.forEach((ind) => {
          if (ind.dataset.page === targetPage) {
            ind.classList.add("bg-[#636059]");
            ind.classList.remove("bg-gray-300");
          } else {
            ind.classList.remove("bg-[#636059]");
            ind.classList.add("bg-gray-300");
          }
        });

        // Initialize chart if we're on the first page and it's a data point
        if (
          targetPage === "1" &&
          (point.type === "RainRecorder" || point.type === "WaterLevel")
        ) {
          initializeChart(point, container);
        }
      });
    });

    // Initialize chart if this is a data point
    if (point.type === "RainRecorder" || point.type === "WaterLevel") {
      initializeChart(point, container);
    }
  };

  const renderPopupContent = (point) => {
    if (point.type === "CrossSection") {
      console.log("Cross-section popup opened with data:", {
        point: point,
        properties: point.properties,
        timestamp: new Date().toISOString(),
      });

      const props = point.properties || {};
      const profile = Array.isArray(props.Cross_Section_Profile)
        ? props.Cross_Section_Profile
        : [];

      if (profile.length > 0) {
        console.log("Cross-section profile data points:", profile);
        console.log("Cross-section metrics:", {
          maxDepth: Math.max(...profile.map((p) => p.depth || 0)),
          maxWidth: Math.max(...profile.map((p) => p.station || 0)),
          pointCount: profile.length,
        });
      }

      // Calculate max depth and width for the info display
      let maxDepth = 0;
      let maxWidth = 0;

      if (profile.length > 0) {
        maxDepth = Math.max(...profile.map((p) => p.depth || 0));
        maxWidth = Math.max(...profile.map((p) => p.station || 0));
      }

      // Create a simple SVG visualization
      const svgPath =
        profile.length > 0
          ? `M${profile[0].station},${profile[0].depth} ` +
            profile
              .slice(1)
              .map((p) => `L${p.station},${p.depth}`)
              .join(" ")
          : "";

      return `
        <div class="cross-section-popup popup-container w-full max-w-sm font-sans relative">
          <!-- Close button positioned at top right -->
          <button class="close-popup absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Page 1 content -->
          <div class="popup-page active" data-page="1">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 mr-3 flex items-center justify-center">
                <img src="/assets/img/River_Cross_Section_Icon.svg" class="w-6 h-6" alt="Cross Section" />
              </div>
              <h3 class="font-bold text-xl text-black">${
                point.title || "Cross Section"
              }</h3>
            </div>
            
            <div class="mb-4">
              <h4 class="font-bold text-lg mb-3 text-black">Simulated Water Depth</h4>
              <div class="grid grid-cols-[max-content_max-content_1fr] gap-x-2 gap-y-3 text-sm text-gray-600">
                <span class="font-medium">Cross Section</span>
                <span>:</span>
                <span>${point.title || "N/A"}</span>
                
                <span class="font-medium">Simulated Date</span>
                <span>:</span>
                <span>${props.Simulated_Date || "N/A"}</span>
                
                <span class="font-medium">Simulated Time</span>
                <span>:</span>
                <span>${props.Simulated_Time || "N/A"}</span>
                
                <span class="font-medium">Simulated Rain</span>
                <span>:</span>
                <span>${
                  props.Simulated_Rain_mm
                    ? `${props.Simulated_Rain_mm} mm`
                    : "N/A"
                }</span>
                
                <span class="font-medium">Water Depth</span>
                <span>:</span>
                <span class="${props.Water_Depth_m ? "font-medium" : ""}">${
        props.Water_Depth_m ? `${props.Water_Depth_m} m` : "N/A"
      }</span>
              </div>
            </div>
            
            ${
              profile.length > 0
                ? `
            <div class="mb-4">
              <div class="h-40 w-full overflow-hidden flex items-center justify-center">
                <canvas class="w-full h-full cross-section-canvas" aria-label="Cross section chart"></canvas>
              </div>
            </div>`
                : ""
            }
            
            <div class="flex justify-center">
              <button class="w-full py-2 px-4 text-sm font-medium text-white bg-[#636059] rounded-lg transition-colors">
          See More Data
        </button>
            </div>
            <div class="flex justify-center mt-3 space-x-2">
        <button class="pagination-dot w-2 h-2 rounded-full bg-[#636059]" data-page="1"></button>
        <button class="pagination-dot w-2 h-2 rounded-full bg-gray-300" data-page="2"></button>
      </div>
            
          </div>

          <!-- Page 2 content - Station Information -->
          <!-- Pagination dots -->
          
          <div class="popup-page hidden" data-page="2">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 mr-3 rounded-full flex items-center justify-center">
                <img src="/assets/img/River_Cross_Section_Icon.svg" class="w-6 h-6" alt="Cross Section" />
              </div>
              <h3 class="font-bold text-xl text-black">${
                point.title || "Cross Section"
              }</h3>
            </div>

            <div class="space-y-4">
              <div>
                <h4 class="font-bold text-lg mb-2 text-black">Cross Section Information</h4>
                <div class="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2 text-sm text-gray-600 p-3 rounded-lg">
                  <span class="font-medium">Latitude:</span>
                  <span>${point.lat ? point.lat.toFixed(6) : "N/A"}</span>
                  
                  <span class="font-medium">Longitude:</span>
                  <span>${point.lng ? point.lng.toFixed(6) : "N/A"}</span>
                  
                  <span class="font-medium">Catchment Name:</span>
                  <span>${props.Catchment_Name || "N/A"}</span>
                  
                  <span class="font-medium">Manager:</span>
                  <span>${props.Manager || "N/A"}</span>
                  
                  <span class="font-medium">Topography Date:</span>
                  <span>${props.Topography_Date || "N/A"}</span>
                  
                  <span class="font-medium">Measurement Type:</span>
                  <span>${props.Measurement_Type || "N/A"}</span>
                  
                  <span class="font-medium">Methodology:</span>
                  <span>${props.Methodology || "N/A"}</span>
                  
                  <span class="font-medium">Software:</span>
                  <span>${props.Software || "N/A"}</span>
                  <span class="font-medium">Model Calibration:</span>
                  <span>${props.Model_Calibration || "No Data"}</span>
                  
                  <span class="font-medium">Calibration Date:</span>
                  <span>${props.Calibration_Date || "N/A"}</span>
                  
                  <span class="font-medium">Accuracy:</span>
                  <span>${
                    props.Accuracy ? `${props.Accuracy * 100}%` : "N/A"
                  }</span>
                  
                  <span class="font-medium">Computation Time:</span>
                  <span>${props.Computation_Time_hr || "N/A"}</span>
                  
                  <span class="font-medium">Return Period:</span>
                  <span>${props.Return_Period || "N/A"}</span>
                  
                  <span class="font-medium">Real Time:</span>
                  <span>${props.Real_Time_Rain_mm || "N/A"}</span>
                </div>
<div class="flex justify-center mt-3 space-x-2">
            <button class="pagination-dot w-2 h-2 rounded-full bg-[#636059]" data-page="1"></button>
            <button class="pagination-dot w-2 h-2 rounded-full bg-gray-300" data-page="2"></button>
          </div>
        </div>
      `;
    }
    const isDataPoint =
      point.type === "RainRecorder" || point.type === "WaterLevel";

    // Main container with close button at the top right
    return `
    <div class="standard-popup popup-container w-full max-w-sm font-sans relative">
      <!-- Close button positioned at top right -->
      <button class="close-popup absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
  
      <!-- Page 1 content -->
      <div class="popup-page active" data-page="1">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 mr-3 flex items-center justify-center">
            <img src="${getIconSrc(point.type)}" class="w-6 h-6" alt="${
      point.type
    } icon" />
          </div>
          <h3 class="font-bold text-xl text-black">${point.title}</h3>
        </div>
        
        ${
          point.latestReading
            ? `
        <div class="mb-4">
          <h4 class="font-bold text-lg mb-3 text-black">Latest Reading</h4>
          <div class="grid grid-cols-[max-content_max-content_1fr] gap-x-2 gap-y-3 text-sm text-gray-600">
            <span class="font-medium">Rain Status</span>
            <span>:</span>
            <span class="${
              point.latestReading.condition === "Good"
                ? "text-green-600 font-medium"
                : ""
            }">
              ${point.latestReading.condition || "N/A"}
            </span>
            
            <span class="font-medium">Date</span>
            <span>:</span>
            <span>${point.latestReading.date || "N/A"}</span>
            
            <span class="font-medium">Reading</span>
            <span>:</span>
            <span>${
              point.latestReading.level
                ? `${point.latestReading.level} m`
                : "N/A"
            }</span>
            
            <span class="font-medium">Reading (+6hr)</span>
            <span>:</span>
            <span>${
              point.latestReading.forecast
                ? `${point.latestReading.forecast}`
                : "N/A"
            }</span>
            
            <span class="font-medium">Location</span>
            <span>:</span>
            <span class="break-words">${point.location || "N/A"}</span>
          </div>
        </div>`
            : ""
        }
        
        ${
          isDataPoint
            ? `
        <div class="chart-container h-40 rounded-lg relative">
          <canvas class="w-full h-full" id="chart-${point.id}"></canvas>
        </div>
        <button class="w-full py-2 px-4 text-sm font-medium text-white bg-[#636059] rounded-lg transition-colors">
          See More Data
        </button>`
            : ""
        }
        
        <div class="mt-2">
          <button class="w-full py-2 px-3 rounded text-white text-sm font-medium ${getStatusButtonClass(
            point
          )}">
            ${getStatusText(point)}
          </button>
        </div>
      </div>
  
      <!-- Page 2 content - Station Information -->
      <div class="popup-page hidden" data-page="2">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 mr-3 rounded-full flex items-center justify-center">
            <img src="${getIconSrc(point.type)}" class="w-6 h-6" alt="${
      point.type
    } icon" />
          </div>
          <h3 class="font-bold text-xl text-black">${point.title}</h3>
        </div>
        <h3 class="text-xl font-bold mb-4">Station Information</h3>
        <div class="space-y-2 text-sm text-gray-700">
          <div class="flex items-start">
            <span class="font-medium w-36">Device ID:</span>
            <span>${
              point.properties?.Device_ID || point.deviceId || "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Catchment Name:</span>
            <span>${
              point.properties?.Catchment_Name || point.catchmentName || "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Manager:</span>
            <span>${point.properties?.Manager || point.manager || "N/A"}</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Type:</span>
            <span>${point.properties?.Type || point.type || "N/A"}</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Brand:</span>
            <span>${point.properties?.Brand || point.brand || "N/A"}</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Data Frequency:</span>
            <span>${
              point.properties?.Data_Frequency || point.dataFrequency || "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Latitude:</span>
            <span>${
              point.lat?.toFixed(6) ||
              point.geometry?.coordinates?.[1]?.toFixed(6) ||
              "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Longitude:</span>
            <span>${
              point.lng?.toFixed(6) ||
              point.geometry?.coordinates?.[0]?.toFixed(6) ||
              "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Elevation:</span>
            <span>${
              point.properties?.Elevation || point.elevation || "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Built Year:</span>
            <span>${
              point.properties?.Built_Year || point.builtYear || "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Device Condition:</span>
            <span class="${
              point.properties?.Device_Condition === "Good"
                ? "text-green-600 font-medium"
                : ""
            }">
              ${
                point.properties?.Device_Condition ||
                point.deviceCondition ||
                "N/A"
              }
            </span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Station Condition:</span>
            <span class="${
              point.properties?.Station_Condition === "Poor" ||
              point.stationCondition === "Poor"
                ? "text-red-600"
                : "text-green-600"
            } font-medium">
              ${
                point.properties?.Station_Condition ||
                point.stationCondition ||
                "Good"
              }
            </span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Last Maintenance:</span>
            <span>${
              point.properties?.Last_Maintenance ||
              point.lastMaintenance ||
              "N/A"
            }</span>
          </div>
          <div class="flex items-start">
            <span class="font-medium w-36">Data Completeness:</span>
            <span>${
              point.properties?.Data_Completeness ||
              point.dataCompleteness ||
              "N/A"
            }</span>
          </div>
        </div>
        
       
      </div>
      
      <!-- Pagination dots (only for data points) -->
      ${
        isDataPoint
          ? `
      <div class="flex justify-center mt-3 space-x-2">
        <button class="pagination-dot w-2 h-2 rounded-full bg-[#636059]" data-page="1"></button>
        <button class="pagination-dot w-2 h-2 rounded-full bg-gray-300" data-page="2"></button>
      </div>
      `
          : ""
      }
    </div>`;
  };
  // riverHoverInfo popup is rendered inside the main return JSX below

  const updateMarkers = useCallback(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => {
      if (marker.marker && typeof marker.marker.remove === "function") {
        marker.marker.remove();
      }
      if (marker.popup && typeof marker.popup.remove === "function") {
        marker.popup.remove();
      }
      if (marker.element && marker.element.parentNode) {
        marker.element.parentNode.removeChild(marker.element);
      }
    });
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

      // Add specific class for cross-section popups
      if (point.type === "CrossSection") {
        popupContent.className = "cross-section-popup-content popup-content";
      } else {
        popupContent.className = "standard-popup-content popup-content";
      }

      popupContent.innerHTML = renderPopupContent(point);

      const popup = new mapboxgl.Popup({
        offset: 30,
        className:
          point.type === "CrossSection"
            ? "cross-section-popup"
            : "standard-popup",
        maxWidth: "400px",
        closeOnClick: false,
        closeButton: false,
      }).setDOMContent(popupContent);

      // Add close button functionality
      const closeButton = popupContent.querySelector(".close-popup");
      if (closeButton) {
        closeButton.addEventListener("click", (e) => {
          e.stopPropagation();
          closePopup(popup);
        });
      }

      // In the updateMarkers function, add this condition to the marker creation
      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(map.current);

      // Store the marker type for filtering
      if (point.type === "CrossSection") {
        marker._type = "crossSection";
      } else if (point.type === "Waterpump") {
        marker._type = "pump";
      } else if (point.type === "WaterLevel") {
        marker._type = "waterLevel";
      } else if (point.type === "RainRecorder") {
        marker._type = "rainRecorder";
      } else {
        marker._type = point.type.toLowerCase();
      }

      console.log("Created marker:", {
        originalType: point.type,
        normalizedType: marker._type,
        point,
      });

      // Add click handler for chart button
      const chartButton = popupContent.querySelector(".chart-btn");
      if (chartButton) {
        chartButton.onclick = (e) => {
          e.stopPropagation();
          toggleChart(point);
        };
      }

      // Initialize popup after a slight delay to ensure DOM is ready
      setTimeout(() => {
        if (point.type === "CrossSection") {
          initializeCrossSectionPopup(popupContent, point);
        } else {
          initializeStandardPopup(popupContent, point);
        }
      }, 50);

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
      const iconColor =
        incident.severity === "High"
          ? "#ef4444"
          : incident.severity === "Medium"
          ? "#f59e0b"
          : "#10b981";

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
        className: "flood-popup",
        closeButton: false,
        closeOnClick: false,
      }).setHTML(`
        <div class="p-4">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold text-gray-900">
              ${incident.type} - ${incident.severity}
            </h3>
            ${
              incident.verified
                ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Verified</span>'
                : ""
            }
          </div>
          
          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex justify-between">
              <span class="font-medium">Date:</span>
              <span>${incident.timestamp || "N/A"}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Kecamatan:</span>
              <span>${incident.properties?.Kecamatan || "N/A"}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Kelurahan:</span>
              <span>${incident.properties?.Kelurahan || "N/A"}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Location:</span>
              <span class="text-right">${incident.location || "N/A"}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Water Depth:</span>
              <span>${incident.description || "N/A"}</span>
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

      // Set marker type for filtering
      marker._type = "floodIncident";

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
      window.removeEventListener(
        "updateIncidentsLayer",
        handleUpdateIncidentsLayer
      );
      window.removeEventListener(
        "hideIncidentsLayer",
        handleHideIncidentsLayer
      );
    };
  }, []);

  // Event listeners
  useEffect(() => {
    // Inside the useEffect for event listeners in Map.jsx
    const handleSimulationStateChange = (event) => {
      console.log("Simulation state changed:", event.detail);
      setShowFloodLayer(event.detail.isActive);
      setRainfallAmount(event.detail.rainfall);

      // Enable rain only if simulation is active and rainfall > 0
      const raining = !!(event.detail.isActive && event.detail.rainfall > 0);
      setIsRaining(raining);

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
      if (event.detail && typeof event.detail.show !== "undefined") {
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
    fetchCrossSectionData();
  }, [
    fetchWaterpumps,
    fetchRainRecorderData,
    fetchWaterLevelData,
    fetchCrossSectionData,
  ]);

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
      attributionControl: false, // Disable default attribution
    });

    map.current.on("load", () => {
      setupRainEffect();
      updateMarkers();
      map.current.setConfigProperty("basemap", "lightPreset", lightPreset);
      Object.entries(labelVisibility).forEach(([key, value]) => {
        map.current.setConfigProperty("basemap", key, value);
      });
    });

    // Add navigation control with custom styles
    const navControl = new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    });

    // Add controls with custom class names for styling (place at bottom-right)
    map.current.addControl(navControl, "bottom-right");

    // Add geolocation control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.current.addControl(geolocate, "bottom-right");

    // Scale control removed as per user request

    // Apply inline styles after controls are added
    setTimeout(() => {
      // Navigation controls container (bottom-right)
      const navEl = document.querySelector(".mapboxgl-ctrl-bottom-right");
      if (navEl) {
        Object.assign(navEl.style, {
          bottom: "40px",
          right: "20px",
          left: "auto",
          top: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          zIndex: "10",
        });
      }

      // Scale control container
      const scaleEl = document.querySelector(".mapboxgl-ctrl-bottom-right");
      if (scaleEl) {
        Object.assign(scaleEl.style, {
          bottom: "20px",
          right: "20px",
          left: "auto",
          top: "auto",
          backgroundColor: "transparent",
          padding: "0",
          border: "none",
          boxShadow: "none",
        });
      }

      // Style all control buttons and containers
      document.querySelectorAll(".mapboxgl-ctrl").forEach((ctrl) => {
        Object.assign(ctrl.style, {
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
        });
      });

      // Style all control buttons
      document.querySelectorAll(".mapboxgl-ctrl button").forEach((btn) => {
        Object.assign(btn.style, {
          backgroundColor: "#1F2937",
          color: "#FFFFFF",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          width: "40px",
          height: "40px",
          padding: "0",
          margin: "0",
          cursor: "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "none",
          backdropFilter: "none",
        });

        btn.addEventListener("mouseenter", () => {
          btn.style.background = "rgba(0, 0, 0, 0.05)";
          btn.style.transform = "translateY(-1px)";
        });

        btn.addEventListener("mouseleave", () => {
          // btn.style.background = "rgba(255, 255, 255, 0.95)";
          btn.style.transform = "none";
        });

        btn.addEventListener("mousedown", () => {
          btn.style.background = "rgba(0, 0, 0, 0.1)";
          btn.style.transform = "translateY(1px)";
        });

        btn.addEventListener("mouseup", () => {
          btn.style.background = "rgba(0, 0, 0, 0.05)";
          btn.style.transform = "translateY(-1px)";
        });
      });
    }, 100);

    return () => {
      // Clean up markers
      markers.current.forEach((marker) => {
        if (marker.marker && typeof marker.marker.remove === "function") {
          marker.marker.remove();
        }
        if (marker.popup && typeof marker.popup.remove === "function") {
          marker.popup.remove();
        }
        if (marker.element && marker.element.parentNode) {
          marker.element.parentNode.removeChild(marker.element);
        }
      });

      // Clean up popups
      popups.current.forEach((popup) => {
        if (popup && typeof popup.remove === "function") {
          popup.remove();
        }
      });

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

      {/* Rain overlay canvas (pointer-events none so map interactions still work) */}
      <canvas
        ref={rainCanvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-40"
        aria-hidden="true"
      />

      {/* Render the chart */}
      {showChart && chartPoint && (
        <LocationGraph
          selectedPoint={chartPoint}
          onClose={closeChart}
          data={chartPoint.chartData || {}}
          dataType={chartPoint.dataType || "ARR"}
        />
      )}

      {riverHoverInfo && (
        <div
          className="absolute bg-white px-2 py-1 rounded shadow-md text-xs font-medium pointer-events-none z-40 border border-gray-200"
          style={{
            left: riverHoverInfo.lngLat.x,
            top: riverHoverInfo.lngLat.y - 30,
            transform: "translate(-50%, -100%)",
          }}
        >
          {riverHoverInfo.name}
        </div>
      )}

      <button
        onClick={() => setControlsVisible(!controlsVisible)}
        className="absolute bottom-5 right-9 bg-white p-2 rounded-lg shadow-md z-10 hover:bg-gray-100 transition-colors"
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
        <div className="absolute bottom-5 right-24 bg-white p-4 rounded-lg shadow-md z-10 w-64">
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
  
  /* Mapbox control overrides to match pump controls */
  .mapboxgl-ctrl-bottom-right {
    z-index: 10 !important;
    right: 35px !important;
    bottom: 75px !important;
  }
  
  /* Style all Mapbox control buttons */
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group button,
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-geolocate {
    width: 43px !important;
    height: 40px !important;
    border-radius: 8px !important;
    background-color: #f2f1ef !important;
    border: 2px solid #f2f1ef !important;
    padding: 0 !important;
    color: #636059 !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  /* Hover states for all buttons */
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group button:hover,
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-geolocate:hover {
    background-color: #f2f1ef !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }
  
  /* Active states for all buttons */
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group button:active,
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-geolocate:active,
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group button.mapboxgl-ctrl-zoom-in:active,
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group button.mapboxgl-ctrl-zoom-out:active {
    background-color: #636059 !important;
    border-color: #636059 !important;
    transform: translateY(1px) !important;
  }
  
  /* Style Mapbox control icons */
  .mapboxgl-ctrl-icon {
    filter: invert(39%) sepia(4%) saturate(1234%) hue-rotate(349deg) brightness(92%) contrast(84%) !important;
  }
  
  /* Active state for control icons */
  .mapboxgl-ctrl button:active .mapboxgl-ctrl-icon,
  .mapboxgl-ctrl-geolocate:active .mapboxgl-ctrl-icon {
    filter: invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%) !important;
  }
  
  /* Specifically target SVG elements in controls */
  .mapboxgl-ctrl button .mapboxgl-ctrl-icon,
  .mapboxgl-ctrl button .mapboxgl-ctrl-icon svg,
  .mapboxgl-ctrl button .mapboxgl-ctrl-icon svg path,
  .mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon,
  .mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon svg,
  .mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon svg path {
    fill: #ffffff !important;
    stroke: #ffffff !important;
    color: #ffffff !important;
  }
  
  /* Layout for control groups */
  .mapboxgl-ctrl-bottom-right {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
  }
  
  .mapboxgl-ctrl-bottom-right > .mapboxgl-ctrl {
    margin: 0 !important;
    padding: 0 !important;
    gap: 10px !important;
  }
  
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-group,
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-geolocate {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    margin: 0 !important;
  }
  
  /* Ensure geolocation control is properly styled */
  .mapboxgl-ctrl-geolocate {
    width: 40px !important;
    height: 40px !important;
  }
  
  /* Fix for geolocation active state */
  .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-active {
    background-color: #636059 !important;
    border-color: #636059 !important;
  }
  .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-active .mapboxgl-ctrl-icon {
    filter: invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%) !important;
  }
  
  /* Fix for geolocation waiting state (spinning) */
  .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-waiting,
  .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-seeking {
    background-color: #636059 !important;
    border-color: #636059 !important;
  }
  .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-waiting .mapboxgl-ctrl-icon,
  .mapboxgl-ctrl-geolocate.mapboxgl-ctrl-geolocate-seeking .mapboxgl-ctrl-icon {
    animation: mapboxgl-spin 2s infinite linear;
    filter: invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%) !important;
  }
  
  @keyframes mapboxgl-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Marker visibility */
  .marker {
    transition: opacity 0.3s ease;
  }
  
  .marker.hidden {
    display: none;
    opacity: 0;
    pointer-events: none;
  }
`}</style>
    </div>
  );
};

// Custom comparison function for React.memo - simplified and more efficient
const areEqual = (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.showPumps === nextProps.showPumps &&
    prevProps.showWaterLevels === nextProps.showWaterLevels &&
    prevProps.showRainRecorders === nextProps.showRainRecorders &&
    prevProps.showRivers === nextProps.showRivers &&
    prevProps.showCrossSections === nextProps.showCrossSections &&
    prevProps.onTogglePumps === nextProps.onTogglePumps &&
    prevProps.onToggleWaterLevels === nextProps.onToggleWaterLevels &&
    prevProps.onToggleRainRecorders === nextProps.onToggleRainRecorders &&
    prevProps.onToggleRivers === nextProps.onToggleRivers &&
    prevProps.onToggleCrossSections === nextProps.onToggleCrossSections
  );
};

export default React.memo(Map, areEqual);
