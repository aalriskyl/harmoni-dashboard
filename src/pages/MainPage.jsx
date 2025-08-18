import React, { useState, useCallback } from "react";
import Map from "../components/Map";
import FloatingContainer from "../components/FloatingContainer";
import FloatingFlood from "../components/FloatingFlood";
import Weather from "../components/Weather";
import MapToolbox from "../components/MapToolbox";
import PumpControls from "../components/PumpControls";

const MainPage = ({ selectedMenu, setShowWeather }) => {
  const [showPumps, setShowPumps] = useState(true);

  const handleTogglePumps = useCallback((isVisible) => {
    setShowPumps(isVisible);
  }, []);
  return (
    <div className="w-full h-screen relative bg-blue-900">
      <Map showPumps={showPumps} />
      {selectedMenu === "simulations" ? (
        <FloatingContainer />
      ) : (
        <FloatingFlood setShowWeather={setShowWeather} />
      )}
      <PumpControls onTogglePumps={handleTogglePumps} />
      {/* <MapToolbox /> */}
      {/* <Weather /> */}
    </div>
  );
};

export default MainPage;
