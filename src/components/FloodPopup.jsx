import React, { useRef } from "react";
import "../styles/mapbox-popup.css";

const FloodPopup = ({
  WADMKC,
  WADMKD,
  WADMKK,
  kelurahan,
  City,
  District,
  Sub_distri,
  Year,
  Month,
  Max_height,
  day_in_the,
}) => {
  // Format date and time
  const formatDate = () => {
    if (!day_in_the || !Month || !Year) return "N/A";
    const firstDay = day_in_the.split(",")[0].padStart(2, "0");
    const monthStr = String(Month).padStart(2, "0");
    return `${firstDay}-${monthStr}-${Year}`;
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine hazard level
  const hazardLevel =
    Max_height > 50 ? "High" : Max_height > 20 ? "Medium" : "Low";
  const hazardColor = {
    High: "bg-red-500 hover:bg-red-600",
    Medium: "bg-yellow-500 hover:bg-yellow-600",
    Low: "bg-green-500 hover:bg-green-600",
  };

  const popupRef = useRef();

  // Handle close button click
  const handleClose = () => {
    const popupElement = popupRef.current?.closest(".mapboxgl-popup");
    if (popupElement) {
      popupElement.remove();
    }
  };

  return (
    <div ref={popupRef} className="flood-popup-content">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3 pb-2 border-b">
          <h3 className="font-bold text-lg text-gray-800">
            Simulated Innundation
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close popup"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Spatial Information Section */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">
            Spatial Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Provinsi:</span>
              <span className="text-gray-800 font-medium">
                {WADMKK || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kota:</span>
              <span className="text-gray-800 font-medium">{City || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kecamatan:</span>
              <span className="text-gray-800 font-medium">
                {District || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kelurahan:</span>
              <span className="text-gray-800 font-medium">
                {WADMKD || kelurahan || Sub_distri || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Inundation Information Section */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">
            Simulated Inundation
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Height Max:</span>
              <span className="text-gray-800 font-medium">
                {Max_height ? `${Max_height.toFixed(1)} cm` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="text-gray-800 font-medium">{formatDate()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time:</span>
              <span className="text-gray-800 font-medium">{formatTime()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            className={`w-full py-2 px-3 rounded text-white text-sm font-medium ${hazardColor[hazardLevel]}`}
          >
            {hazardLevel} Hazard
          </button>
          <button className="w-full py-2 px-3 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium border border-gray-300">
            Issue Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloodPopup;
