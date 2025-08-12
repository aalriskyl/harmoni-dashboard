import { useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";

export const useMarkers = (map) => {
  const markers = useRef([]);
  const popups = useRef([]);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((marker) => marker.remove());
    popups.current.forEach((popup) => popup.remove());
    markers.current = [];
    popups.current = [];
  }, []);

  const addMarker = useCallback(
    (point, onClick) => {
      if (!map.current) return;

      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.borderRadius = "50%";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
      el.style.border = "2px solid white";
      el.dataset.id = point.id;

      // Set background color based on point type
      let bgColor = "";
      let iconUrl = "";

      switch (point.type) {
        case "Rain":
          bgColor = "#6A7F53";
          iconUrl = "/assets/img/rain-gauge-icon.svg";
          break;
        case "Water":
          bgColor = "#1e90ff";
          iconUrl = "/assets/img/water-level-icon.svg";
          break;
        case "Pump":
          bgColor = "#ff6b6b";
          iconUrl = "/assets/img/pump-icon.svg";
          break;
        default:
          bgColor = "#3bb2d0";
      }

      el.style.backgroundColor = bgColor;

      const icon = document.createElement("img");
      icon.src = iconUrl;
      icon.style.width = "16px";
      icon.style.height = "16px";
      icon.style.objectFit = "contain";
      icon.alt = `${point.type} icon`;
      el.appendChild(icon);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.lng, point.lat])
        .addTo(map.current);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick(point);
      });

      markers.current.push(marker);
      return marker;
    },
    [map]
  );

  return { markers, popups, clearMarkers, addMarker };
};
