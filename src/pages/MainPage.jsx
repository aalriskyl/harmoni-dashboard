import React, { useState, useCallback } from "react";
import { DateFilterProvider } from "../context/DateFilterContext.jsx";
import Map from "../components/Map";
import FloatingContainer from "../components/FloatingContainer";
import FloatingFlood from "../components/FloatingFlood";
import FloatingCrowdsourced from "../components/FloatingCrowdSourced";
import FloatingTweets from "../components/FloatingTweets";
import PumpControls from "../components/PumpControls.jsx";

const MainPage = ({ selectedMenu = "simulations", showWeather = true }) => {
  const [showPumps, setShowPumps] = useState(true);
  const [showWaterLevels, setShowWaterLevels] = useState(true);
  const [showRainRecorders, setShowRainRecorders] = useState(true);
  const [showRivers, setShowRivers] = useState(true);

  // Memoize toggle handlers
  const togglePumps = useCallback(() => setShowPumps(prev => !prev), []);
  const toggleWaterLevels = useCallback(() => setShowWaterLevels(prev => !prev), []);
  const toggleRainRecorders = useCallback(() => setShowRainRecorders(prev => !prev), []);
  const toggleRivers = useCallback(() => setShowRivers(prev => !prev), []);

  return (
    <div className="w-full h-screen flex flex-col bg-blue-900">
      <DateFilterProvider>
        <div className="flex-1 relative">
          <Map
            showPumps={showPumps}
            showWaterLevels={showWaterLevels}
            showRainRecorders={showRainRecorders}
            showRivers={showRivers}
            onToggleRivers={toggleRivers}
          />

          <PumpControls
            showPumps={showPumps}
            showWaterLevels={showWaterLevels}
            showRainRecorders={showRainRecorders}
            showRivers={showRivers}
            onTogglePumps={togglePumps}
            onToggleWaterLevels={toggleWaterLevels}
            onToggleRainRecorders={toggleRainRecorders}
            onToggleRivers={toggleRivers}
          />
          {/* Floating container positioned relative to the map */}
          <div
            className={`absolute left-8 ${
              showWeather ? "top-72" : "top-32"
            } z-30 transition-all duration-300`}
          >
            <div className="flex flex-col gap-4">
              {selectedMenu === "warnings" ? (
                <FloatingContainer />
              ) : selectedMenu === "simulations" ? (
                <FloatingFlood />
              ) : selectedMenu === "crowdsourced" ? (
                <>
                  <FloatingCrowdsourced />
                  <FloatingTweets />
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
