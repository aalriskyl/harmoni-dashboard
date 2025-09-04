import React, { useEffect, useCallback } from "react";

const FloodLayer = ({ map }) => {
  // Add flood layers to the map
  const addFloodLayers = useCallback(() => {
    if (!map.getSource("flood-areas")) {
      map.addSource("flood-areas", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Flood fill layer
      map.addLayer({
        id: "flood-fill",
        type: "fill",
        source: "flood-areas",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "depth"],
            0,
            "#4290f5",
            1,
            "#2d6df5",
            2,
            "#1a4bdb",
            3,
            "#0d2f9e",
            5,
            "#0a1f6a",
          ],
          "fill-opacity": 0.6,
          "fill-outline-color": "#ffffff",
        },
      });

      // Flood depth labels
      map.addLayer({
        id: "flood-labels",
        type: "symbol",
        source: "flood-areas",
        layout: {
          "text-field": ["to-string", ["get", "depth"]],
          "text-size": 12,
          "text-offset": [0, 0.5],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1,
        },
      });
    }
  }, [map]);

  // Fetch and update flood data
  const updateFloodData = useCallback(async () => {
    try {
      const response = await fetch("/data/flood-areas.geojson");
      const data = await response.json();

      if (map.getSource("flood-areas")) {
        map.getSource("flood-areas").setData(data);
      }
    } catch (error) {
      console.error("Error fetching flood data:", error);
    }
  }, [map]);

  // Initialize layers and data
  useEffect(() => {
    if (!map) return;

    const onLoad = () => {
      addFloodLayers();
      updateFloodData();
    };

    if (map.loaded()) {
      onLoad();
    } else {
      map.on("load", onLoad);
    }

    // Cleanup
    return () => {
      if (map.getLayer("flood-fill")) map.removeLayer("flood-fill");
      if (map.getLayer("flood-labels")) map.removeLayer("flood-labels");
      if (map.getSource("flood-areas")) map.removeSource("flood-areas");
      map.off("load", onLoad);
    };
  }, [map, addFloodLayers, updateFloodData]);

  return null;
};

export default FloodLayer;
