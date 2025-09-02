import React from "react";

const MapControls = ({
  lightPreset,
  onLightPresetChange,
  labelVisibility,
  onLabelVisibilityChange,
}) => {
  return (
    <div
      className="fixed right-[20rem] bg-white p-4 rounded-lg shadow-md z-50 w-64 border-l-4 border-[#636059]"
      style={{
        top: "calc(50% + 140px)",
        backgroundColor: "#f2f1ef",
        borderLeft: "4px solid #636059",
        borderRadius: "0.5rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#636059] mb-2">
          Light Preset
        </label>
        <select
          id="lightPreset"
          value={lightPreset}
          onChange={onLightPresetChange}
          className="w-full p-2 border border-[#d1d0cf] rounded-lg text-sm bg-white text-[#636059] focus:ring-2 focus:ring-[#636059] focus:border-transparent"
        >
          <option value="dawn">Dawn</option>
          <option value="day">Day</option>
          <option value="dusk">Dusk</option>
          <option value="night">Night</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="showPlaceLabels"
            className="text-sm font-medium text-[#636059]"
          >
            Place Labels
          </label>
          <input
            type="checkbox"
            id="showPlaceLabels"
            checked={labelVisibility.showPlaceLabels}
            onChange={onLabelVisibilityChange}
            className="h-4 w-4 text-[#636059] focus:ring-[#636059] border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default MapControls;
