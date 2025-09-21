/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";

const FloodLayer = ({ map, show, rainfall = 0 }) => {
  const sourceId = "flood-vulnerability";
  const layerId = "flood-vulnerability-layer";
  const isInitialized = useRef(false);

  // Initialize the layer
  useEffect(() => {
    if (!map) return;

    const setupLayer = () => {
      // Only set up the layer if it doesn't exist
      if (map.getSource(sourceId) || map.getLayer(layerId)) return;

      // Add image source for the vulnerability map
      map.addSource(sourceId, {
        type: "image",
        url: "/assets/img/Social_Vulnerability_8000px.png",
        coordinates: [
          [106.6849284, -6.0790941], // top-left
          [106.9742925, -6.0790941], // top-right
          [106.9742925, -6.3729514], // bottom-right
          [106.6849284, -6.3729514], // bottom-left
        ],
      });

      // Add the raster layer
      map.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        paint: {
          "raster-opacity": 0.7,
        },
        layout: {
          visibility: show ? "visible" : "none",
        },
      });

      isInitialized.current = true;
    };

    if (map.isStyleLoaded()) {
      setupLayer();
    } else {
      map.once("load", setupLayer);
    }

    // Cleanup function
    return () => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      isInitialized.current = false;
    };
  }, [map]);

  // Update layer visibility when show prop changes
  useEffect(() => {
    if (!map || !isInitialized.current) return;

    const layer = map.getLayer(layerId);
    if (!layer) return;

    // Set the layer visibility based on the show prop
    map.setLayoutProperty(layerId, "visibility", show ? "visible" : "none");

    // Adjust opacity based on rainfall if needed
    if (show) {
      const opacity = Math.min(0.7, 0.3 + rainfall / 100);
      map.setPaintProperty(layerId, "raster-opacity", opacity);
    }
  }, [map, show, rainfall]);

  return null;
};

export default FloodLayer;
