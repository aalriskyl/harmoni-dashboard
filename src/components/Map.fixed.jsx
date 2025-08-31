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
import { Chart } from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

// [Previous imports and code...]

const Map = ({
  showPumps = true,
  showWaterLevels = true,
  showRainRecorders = true,
  showRivers = true,
  onTogglePumps,
  onToggleWaterLevels,
  onToggleRainRecorders,
  onToggleRivers,
}) => {
  // [Component implementation...]

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map controls and other UI elements */}
      
      <style jsx global>{`
        .mapboxgl-popup {
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
