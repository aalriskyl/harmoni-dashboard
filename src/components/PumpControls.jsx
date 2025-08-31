import React from "react";

const RiverButton = ({ isActive, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-cyan-100 border-2 border-cyan-300"
        : "bg-white border-2 border-gray-200"
    } hover:shadow-md`}
    title="Rivers"
    aria-label="Toggle Rivers"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className={`w-6 h-6 ${!isActive ? "opacity-60" : ""}`}
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.47-1.27-3.81-.29-.56-.6-1.15-.92-1.73-.32.58-.63 1.17-.92 1.73-.7 1.34-1.27 2.65-1.27 3.81 0 2.22 1.8 4.05 4 4.05z"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12.56 6.36A9.984 9.984 0 0 0 14 2.5c.19 2.5-1.28 6.5-3.85 9.64"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3.5 16.5c0-2.3 1.21-4.6 2.5-6.5 1.3 1.9 2.5 4.2 2.5 6.5"
        />
      </svg>
    </div>
  </button>
);

const PumpButton = ({ isActive, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-blue-100 border-2 border-blue-300"
        : "bg-white border-2 border-gray-200"
    } hover:shadow-md`}
    title="Pumps"
    aria-label="Toggle Pumps"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/pump-icon.svg"
        alt="Pumps"
        className={`w-6 h-6 ${!isActive ? "opacity-60" : ""}`}
      />
    </div>
  </button>
);

const WaterLevelButton = ({ isActive, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-teal-100 border-2 border-teal-300"
        : "bg-white border-2 border-gray-200"
    } hover:shadow-md`}
    title="Water Levels"
    aria-label="Toggle Water Levels"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/water-level-icon.svg"
        alt="Water Levels"
        className={`w-6 h-6 ${!isActive ? "opacity-60" : ""}`}
      />
    </div>
  </button>
);

const RainRecorderButton = ({ isActive, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-indigo-100 border-2 border-indigo-300"
        : "bg-white border-2 border-gray-200"
    } hover:shadow-md`}
    title="Rain Recorders"
    aria-label="Toggle Rain Recorders"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/rain-gauge-icon.svg"
        alt="Rain Recorders"
        className={`w-6 h-6 ${!isActive ? "opacity-60" : ""}`}
      />
    </div>
  </button>
);

const PumpControls = ({
  showPumps = true,
  showWaterLevels = true,
  showRainRecorders = true,
  showRivers = true,
  onTogglePumps,
  onToggleWaterLevels,
  onToggleRainRecorders,
  onToggleRivers,
}) => {
  return (
    <div className="fixed right-[30px] top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
      <PumpButton isActive={showPumps} onClick={() => onTogglePumps()} />
      <WaterLevelButton
        isActive={showWaterLevels}
        onClick={() => onToggleWaterLevels()}
      />
      <RainRecorderButton
        isActive={showRainRecorders}
        onClick={() => onToggleRainRecorders()}
      />
      <RiverButton
        isActive={showRivers}
        onClick={() => onToggleRivers()}
      />
    </div>
  );
};

export default PumpControls;
