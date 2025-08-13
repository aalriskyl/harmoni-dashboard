/* eslint-disable no-unused-vars */
import React from "react";

const MapPopup = ({ point, onChartClick, onAwareClick, onDetailsClick }) => {
  if (!point) return null;
  if (point.type === "Rain" || point.type === "Water") {
    const readingKey = point.type === "Rain" ? "precipitation" : "level";
    const readingValue = point.latestReading[readingKey];
    const iconColor = point.type === "Rain" ? "#6A7F53" : "#1e90ff";
    const iconPath =
      point.type === "Rain"
        ? "/assets/img/rain-gauge-icon.svg"
        : "/assets/img/water-level-icon.svg";
    const chartButtonText =
      point.type === "Rain" ? "Rainfall Chart" : "Water Level Chart";

    return (
      <div className="max-w-xs">
        <button onClick={() => onChartClick(point)}>{chartButtonText}</button>
        <button onClick={() => onAwareClick(point)}>AWARE</button>
      </div>
    );
  }

  return (
    <div className="max-w-xs">
      {/* Popup content for Pump stations */}
      <button onClick={() => onDetailsClick(point)}>View Details</button>
    </div>
  );
};

export default MapPopup;
