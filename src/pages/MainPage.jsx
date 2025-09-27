import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { DateFilterProvider } from "../context/DateFilterContext.jsx";
import Map from "../components/Map";
import FloatingContainer from "../components/FloatingContainer";
import FloatingFlood from "../components/FloatingFlood";
import FloatingCrowdsourced from "../components/FloatingCrowdSourced";
import FloatingTweets from "../components/FloatingTweets";
import PumpControls from "../components/PumpControls.jsx";
import ModelAccuracy from "../components/ModelAccuracy";

// Memoize the Map component to prevent unnecessary re-renders
const MemoizedMap = memo(({ mapProps }) => <Map {...mapProps} />);

const MainPage = ({ selectedMenu = "simulations", showWeather = true }) => {
  const [showPumps, setShowPumps] = useState(true);
  const [showWaterLevels, setShowWaterLevels] = useState(true);
  const [showRainRecorders, setShowRainRecorders] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showCrossSections, setShowCrossSections] = useState(true);

  // Memoize toggle handlers
  // Memoize toggle callbacks with useCallback to prevent recreation on each render
  const togglePumps = useCallback(() => setShowPumps((prev) => !prev), []);
  const toggleWaterLevels = useCallback(
    () => setShowWaterLevels((prev) => !prev),
    []
  );
  const toggleRainRecorders = useCallback(
    () => setShowRainRecorders((prev) => !prev),
    []
  );
  const toggleRivers = useCallback(() => setShowRivers((prev) => !prev), []);
  const toggleCrossSections = useCallback(
    () => setShowCrossSections((prev) => !prev),
    []
  );

  // Memoize the controls props to prevent unnecessary re-renders
  const controlsProps = useMemo(
    () => ({
      showPumps,
      showWaterLevels,
      showRainRecorders,
      showRivers,
      showCrossSections,
      onTogglePumps: togglePumps,
      onToggleWaterLevels: toggleWaterLevels,
      onToggleRainRecorders: toggleRainRecorders,
      onToggleRivers: toggleRivers,
      onToggleCrossSections: toggleCrossSections,
    }),
    [
      showPumps,
      showWaterLevels,
      showRainRecorders,
      showRivers,
      showCrossSections,
      togglePumps,
      toggleWaterLevels,
      toggleRainRecorders,
      toggleRivers,
      toggleCrossSections,
    ]
  );

  // Memoize map props to prevent unnecessary re-renders
  // Raster overlay state (updated by Timeline via FloatingFlood)
  const [rasterOverlay, setRasterOverlay] = useState({
    path: null,
    index: null,
  });

  const handleRasterChange = (path, index) => {
    setRasterOverlay({ path, index });
    // also dispatch a global event for backward compatibility
    try {
      window.dispatchEvent(
        new CustomEvent("timelineRasterChange", { detail: { path, index } })
      );
    } catch (e) {}
  };

  const mapProps = useMemo(
    () => ({
      showPumps,
      showWaterLevels,
      showRainRecorders,
      showRivers,
      showCrossSections,
      onTogglePumps: togglePumps,
      onToggleWaterLevels: toggleWaterLevels,
      onToggleRainRecorders: toggleRainRecorders,
      onToggleRivers: toggleRivers,
      onToggleCrossSections: toggleCrossSections,
      // raster overlay passed to Map
      rasterOverlay,
    }),
    [
      showPumps,
      showWaterLevels,
      showRainRecorders,
      showRivers,
      showCrossSections,
      togglePumps,
      toggleWaterLevels,
      toggleRainRecorders,
      toggleRivers,
      toggleCrossSections,
      rasterOverlay,
    ]
  );

  // Hide pump controls when a simulation is running. Listen to global events
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // When the selected menu changes away from 'simulations', clear any
  // raster/flood layers that might have been added by FloatingFlood (or
  // Timeline). This mirrors the behavior when stopping a simulation so the
  // map doesn't keep showing raster images when a different menu is active.
  useEffect(() => {
    if (selectedMenu !== "simulations") {
      // clear raster overlay state
      setRasterOverlay({ path: null, index: null });

      // notify other components (Map, FloatingFlood, etc.) to remove layers
      try {
        window.dispatchEvent(
          new CustomEvent("timelineRasterChange", {
            detail: { path: null, index: null },
          })
        );
      } catch (e) {}

      try {
        // remove any flood/raster image used by FloatingFlood
        window.dispatchEvent(
          new CustomEvent("updateFloodImage", { detail: { imagePath: null } })
        );
      } catch (e) {}

      try {
        // hide vulnerability layer if visible
        window.dispatchEvent(
          new CustomEvent("showVulnerabilityLayer", { detail: { show: false } })
        );
      } catch (e) {}

      try {
        // inform listeners that simulation is no longer active
        window.dispatchEvent(
          new CustomEvent("simulationStateChange", {
            detail: {
              isActive: false,
              rainfall: 0,
              showVulnerability: false,
              hideFloodLayer: false,
            },
          })
        );
      } catch (e) {}
    }
  }, [selectedMenu]);

  useEffect(() => {
    const handleSimulationState = (e) => {
      const isActive = !!(e && e.detail && e.detail.isActive);
      setIsSimulationRunning(isActive);
    };

    window.addEventListener("simulationStateChange", handleSimulationState);
    // Listen for raster changes emitted by Timeline (via FloatingFlood)
    const handleRasterEvent = (e) => {
      if (e && e.detail) {
        const { path, index } = e.detail;
        setRasterOverlay({
          path: path || null,
          index: typeof index === "number" ? index : null,
        });
      }
    };
    window.addEventListener("timelineRasterChange", handleRasterEvent);
    return () => {
      window.removeEventListener(
        "simulationStateChange",
        handleSimulationState
      );
      window.removeEventListener("timelineRasterChange", handleRasterEvent);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-blue-900">
      <DateFilterProvider>
        <div className="flex-1 relative">
          {/* Model accuracy panel centered below navbar - show only during simulation */}
          {isSimulationRunning && <ModelAccuracy initialAccuracy={0.87} />}
          <MemoizedMap mapProps={mapProps} />

          <PumpControls {...controlsProps} />
          {/* Floating container positioned relative to the map */}
          <div
            className={`absolute left-8 ${
              showWeather ? "top-76" : "top-32"
            } z-30 transition-all duration-300`}
          >
            <div className="flex flex-col gap-4">
              {selectedMenu === "warnings" ? (
                <FloatingContainer />
              ) : selectedMenu === "simulations" ? (
                <FloatingFlood />
              ) : selectedMenu === "crowdsourced" ? (
                <>
                  <FloatingCrowdsourced showWeather={showWeather} />
                  <FloatingTweets showWeather={showWeather} />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </DateFilterProvider>
    </div>
  );
};

export default MainPage;
