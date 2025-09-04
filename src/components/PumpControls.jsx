/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";

const CrossSectionButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
      try {
        window.dispatchEvent(
          new CustomEvent("toggle-layer", { detail: { layer: "crosssection" } })
        );
      } catch (err) {
        // ignore
      }
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Cross Sections"
    aria-label="Toggle Cross Sections"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/River_Cross_Section_Icon.svg"
        alt="Cross Sections"
        className={`w-6 h-6 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-80"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(100%) invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%)" // Light icon on dark background
            : "brightness(0) saturate(100%) invert(39%) sepia(4%) saturate(1234%) hue-rotate(349deg) brightness(92%) contrast(84%)", // Dark icon on light background
        }}
      />
    </div>
  </button>
);

const RiverBodyButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
      try {
        window.dispatchEvent(
          new CustomEvent("toggle-layer", { detail: { layer: "rivers" } })
        );
      } catch (err) {
        // ignore
      }
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Rivers"
    aria-label="Toggle Rivers"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/River_Body_Icon.svg"
        alt="Cross Sections"
        className={`w-6 h-6 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-80"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(100%) invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%)" // Light icon on dark background
            : "brightness(0) saturate(100%) invert(39%) sepia(4%) saturate(1234%) hue-rotate(349deg) brightness(92%) contrast(84%)", // Dark icon on light background
        }}
      />
    </div>
  </button>
);

const PumpButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
      try {
        window.dispatchEvent(
          new CustomEvent("toggle-layer", { detail: { layer: "pumps" } })
        );
      } catch (err) {
        // ignore
      }
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Pumps"
    aria-label="Toggle Pumps"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/pump-icon.svg"
        alt="Pumps"
        className={`w-6 h-6 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-80"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(100%) invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%)" // Light icon on dark background
            : "brightness(0) saturate(100%) invert(39%) sepia(4%) saturate(1234%) hue-rotate(349deg) brightness(92%) contrast(84%)", // Dark icon on light background
        }}
      />
    </div>
  </button>
);

const WaterLevelButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
      try {
        window.dispatchEvent(
          new CustomEvent("toggle-layer", { detail: { layer: "waterlevels" } })
        );
      } catch (err) {
        // ignore
      }
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059] "
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Water Levels"
    aria-label="Toggle Water Levels"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/water-level-icon.svg"
        alt="Water Levels"
        className={`w-6 h-6 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-80"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(100%) invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%)" // Light icon on dark background
            : "brightness(0) saturate(100%) invert(39%) sepia(4%) saturate(1234%) hue-rotate(349deg) brightness(92%) contrast(84%)", // Dark icon on light background
        }}
      />
    </div>
  </button>
);

const RainRecorderButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
      try {
        window.dispatchEvent(
          new CustomEvent("toggle-layer", {
            detail: { layer: "rainrecorders" },
          })
        );
      } catch (err) {
        // ignore
      }
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Rain Recorders"
    aria-label="Toggle Rain Recorders"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/rain-gauge-icon.svg"
        alt="Rain Recorders"
        className={`w-6 h-6 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-80"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(100%) invert(96%) sepia(2%) saturate(209%) hue-rotate(343deg) brightness(96%) contrast(95%)" // Light icon on dark background
            : "brightness(0) saturate(100%) invert(39%) sepia(4%) saturate(1234%) hue-rotate(349deg) brightness(92%) contrast(84%)", // Dark icon on light background
        }}
      />
    </div>
  </button>
);

const PumpControls = ({
  showPumps = true,
  showWaterLevels = true,
  showRainRecorders = true,
  showRivers = true,
  showCrossSections = true,
  onTogglePumps,
  onToggleWaterLevels,
  onToggleRainRecorders,
  onToggleRivers,
  onToggleCrossSections,
}) => {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.__welcomeVisible) return true;
    // fallback: check if overlay element exists in DOM (refresh case)
    try {
      return !!document.getElementById("welcome-overlay");
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    function onShow() {
      setHidden(true);
    }
    function onHide() {
      setHidden(false);
    }
    window.addEventListener("welcomeShown", onShow);
    window.addEventListener("welcomeHidden", onHide);
    return () => {
      window.removeEventListener("welcomeShown", onShow);
      window.removeEventListener("welcomeHidden", onHide);
    };
  }, []);
  // Increased z-index so controls remain above map overlays/popups that may be added later
  const containerClass = `fixed right-[35px] top-1/2 transform -translate-y-1/2 z-[9999] flex flex-col gap-3 transition-all duration-200 ${
    hidden
      ? "opacity-0 pointer-events-none scale-95 translate-x-2"
      : "opacity-100 pointer-events-auto scale-100"
  }`;

  return (
    <div className={containerClass} aria-hidden={hidden}>
      <PumpButton
        isActive={showPumps}
        onClick={() => onTogglePumps()}
        hidden={hidden}
      />
      <WaterLevelButton
        isActive={showWaterLevels}
        onClick={() => onToggleWaterLevels()}
        hidden={hidden}
      />
      <RainRecorderButton
        isActive={showRainRecorders}
        onClick={() => onToggleRainRecorders()}
        hidden={hidden}
      />
      <RiverBodyButton
        isActive={showRivers}
        onClick={() => onToggleRivers()}
        hidden={hidden}
      />
      <CrossSectionButton
        isActive={showCrossSections}
        onClick={() => onToggleCrossSections()}
        hidden={hidden}
      />
    </div>
  );
};

export default PumpControls;
