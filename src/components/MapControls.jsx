import React from "react";

const MapControls = ({
  lightPreset,
  onLightPresetChange,
  labelVisibility,
  onLabelVisibilityChange,
}) => {
  return (
    <div className="absolute bottom-16 right-32 bg-white p-4 rounded shadow-md z-10 w-64">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Light Preset
        </label>
        <select
          id="lightPreset"
          value={lightPreset}
          onChange={onLightPresetChange}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
            className="text-sm font-medium text-gray-700"
          >
            Place Labels
          </label>
          <input
            type="checkbox"
            id="showPlaceLabels"
            checked={labelVisibility.showPlaceLabels}
            onChange={onLabelVisibilityChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default MapControls;
