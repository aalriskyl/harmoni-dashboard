import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

export const useMapbox = (containerRef, { lng, lat, zoom }) => {
  const map = useRef(null);

  useEffect(() => {
    if (!containerRef.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [lng, lat],
      zoom: zoom,
      pitch: 45,
      bearing: -20,
    });

    // Add default controls
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
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [containerRef, lng, lat, zoom]);

  return map;
};
