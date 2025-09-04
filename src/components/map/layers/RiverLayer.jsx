import React, { useEffect, useCallback } from "react";
import { processRiverData } from "./riverUtils";

const RiverLayer = ({ map }) => {
  // Add river layers to the map
  const addRiverLayers = useCallback(() => {
    if (!map.getSource("rivers")) {
      map.addSource("rivers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Add river line layer
      map.addLayer({
        id: "rivers-line",
        type: "line",
        source: "rivers",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1da2d8",
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });

      // Add river labels
      map.addLayer({
        id: "rivers-labels",
        type: "symbol",
        source: "rivers",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 1],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
          "text-optional": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#1a1a1a",
          "text-halo-width": 1,
        },
      });
    }
  }, [map]);

  // Fetch and update river data
  const updateRiverData = useCallback(async () => {
    try {
      const response = await fetch("/data/rivers.geojson");
      const data = await response.json();
      const processedData = processRiverData(data);

      if (map.getSource("rivers")) {
        map.getSource("rivers").setData(processedData);
      }
    } catch (error) {
      console.error("Error fetching river data:", error);
    }
  }, [map]);

  // Initialize layers and data
  useEffect(() => {
    if (!map) return;

    const onLoad = () => {
      addRiverLayers();
      updateRiverData();
    };

    if (map.loaded()) {
      onLoad();
    } else {
      map.on("load", onLoad);
    }

    // Cleanup
    return () => {
      if (map.getLayer("rivers-line")) map.removeLayer("rivers-line");
      if (map.getLayer("rivers-labels")) map.removeLayer("rivers-labels");
      if (map.getSource("rivers")) map.removeSource("rivers");
      map.off("load", onLoad);
    };
  }, [map, addRiverLayers, updateRiverData]);

  return null;
};

export default RiverLayer;
