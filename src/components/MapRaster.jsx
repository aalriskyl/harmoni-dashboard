import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapRaster = ({ onClose, floodData = [] }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef([]);

  // Function to get color based on hazard level
  const getHazardColor = (hazardLevel) => {
    if (hazardLevel?.includes("Tinggi")) return "#ef4444"; // red-500
    if (hazardLevel?.includes("Sedang")) return "#f59e0b"; // yellow-500
    return "#10b981"; // green-500
  };

  // Function to create a marker element
  const createMarkerElement = (item) => {
    const el = document.createElement("div");
    el.className = "flood-marker";

    const color = getHazardColor(item.hazardLevel);
    const borderColor =
      color === "#ef4444"
        ? "#b91c1c"
        : color === "#f59e0b"
        ? "#b45309"
        : "#047857";

    el.innerHTML = `
      <div class="relative group">
        <div class="w-6 h-6 rounded-full flex items-center justify-center" 
             style="background-color: ${color}; border: 2px solid ${borderColor}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-white rounded-md shadow-lg z-10 overflow-hidden">
          <div class="p-2">
            <div class="text-sm font-medium text-gray-900">
              ${item.kelurahan || "Location"}
            </div>
            <div class="mt-1 text-xs text-gray-600">
              <div>Hazard: ${item.hazardLevel || "N/A"}</div>
              <div>Max Depth: ${
                item.Max_height ? item.Max_height.toFixed(2) + " m" : "N/A"
              }</div>
              <div>Avg Depth: ${
                item.Avg_height ? item.Avg_height.toFixed(2) + " m" : "N/A"
              }</div>
              <div>Days: ${item.days_poole || "N/A"}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    return el;
  };

  // Initialize map
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [106.8272, -6.1754], // Jakarta coordinates
        zoom: 10,
      });

      // Wait for the map style to load
      map.current.once('load', () => {
        setLoading(false);
        
        // Add controls after style is loaded
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");
        
        // Now that style is loaded, we can safely add our layers
        if (floodData.length > 0) {
          updateHeatmapLayer(floodData);
        }
      });
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        // Cleanup will be handled by the effect that adds the layer
        map.current = null;
      }
    };
  }, []);
  
  // Function to update heatmap layer
  const updateHeatmapLayer = (data) => {
    if (!map.current) return;
    
    // Convert flood data to GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: data.map(item => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.lng, item.lat]
        },
        properties: {
          hazardLevel: item.hazardLevel,
          maxHeight: item.Max_height,
          avgHeight: item.Avg_height,
          days: item.days_poole
        }
      }))
    };
    
    // Remove existing layer and source if they exist
    if (map.current.getLayer('flood-heatmap')) {
      map.current.removeLayer('flood-heatmap');
    }
    if (map.current.getSource('flood-data')) {
      map.current.removeSource('flood-data');
    }
    
    // Add source and layer
    map.current.addSource('flood-data', {
      type: 'geojson',
      data: geojson
    });
    
    map.current.addLayer({
      id: 'flood-heatmap',
      type: 'heatmap',
      source: 'flood-data',
      maxzoom: 15,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'maxHeight'],
          0, 0,
          5, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgba(103,169,207,0.5)',
          0.4, 'rgba(209,229,240,0.8)',
          0.6, 'rgba(253,219,199,0.8)',
          0.8, 'rgba(239,138,98,0.8)',
          1, 'rgba(178,24,43,0.8)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          9, 10
        ],
        'heatmap-opacity': 0.7
      }
    });
  };

  // Update raster layer when floodData changes
  useEffect(() => {
    if (!map.current || !floodData.length) return;
    
    // If map is still loading, the initial load handler will handle this
    if (loading) return;
    
    updateHeatmapLayer(floodData);
  }, [floodData]);

  // Add legend and cleanup on unmount
  useEffect(() => {
    if (!map.current || loading) return;

    // Create legend
    const legend = document.createElement("div");
    legend.className = "map-legend bg-white p-4 rounded shadow-lg";
    legend.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold text-gray-800">Flood Heatmap</h4>
        <button class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="space-y-2">
        <div class="flex items-center">
          <div class="w-6 h-4 bg-[#29b6f6] mr-2 rounded-sm"></div>
          <span class="text-sm text-gray-700">Low</span>
        </div>
        <div class="flex items-center">
          <div class="w-6 h-4 bg-[#0288d1] mr-2 rounded-sm"></div>
          <span class="text-sm text-gray-700">Medium</span>
        </div>
        <div class="flex items-center">
          <div class="w-6 h-4 bg-[#01579b] mr-2 rounded-sm"></div>
          <span class="text-sm text-gray-700">High</span>
        </div>
      </div>
    `;

    // Add close functionality
    const closeButton = legend.querySelector('button');
    closeButton.onclick = onClose;

    // Add legend to map container
    mapContainer.current.appendChild(legend);

    // Clean up function
    return () => {
      if (map.current) {
        if (map.current.getLayer('flood-heatmap')) {
          map.current.removeLayer('flood-heatmap');
        }
        if (map.current.getSource('flood-data')) {
          map.current.removeSource('flood-data');
        }
      }
      if (legend.parentNode === mapContainer.current) {
        mapContainer.current.removeChild(legend);
      }
    };
  }, [loading, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="p-4 bg-white shadow-sm flex justify-between items-center">
        <h2 className="text-xl font-semibold">Flood Vulnerability Map</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
      <div className="flex-1 relative">
        <div
          ref={mapContainer}
          className="absolute inset-0"
          style={{ height: "100%" }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full mb-2"></div>
              <p>Loading map...</p>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .flood-marker {
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flood-marker .tooltip {
          visibility: hidden;
          width: 200px;
          background-color: white;
          color: #333;
          text-align: center;
          border-radius: 6px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .flood-marker:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }
        .map-legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 1;
          max-width: 180px;
          background: white;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .map-legend h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #333;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default MapRaster;
