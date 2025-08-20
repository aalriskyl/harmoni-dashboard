import React from "react";
import { DateFilterProvider } from "../context/DateFilterContext";
import Map from "../components/Map";
import FloatingContainer from "../components/FloatingContainer";
import FloatingFlood from "../components/FloatingFlood";
import FloatingCrowdsourced from "../components/FloatingCrowdSourced";
import FloatingTweets from "../components/FloatingTweets";

const MainPage = ({ selectedMenu = "simulations", setShowWeather }) => {
  return (
    <div className="w-full h-screen relative bg-blue-900">
      <DateFilterProvider>
        <Map />
        {selectedMenu === "warnings" ? (
          <FloatingContainer />
        ) : selectedMenu === "simulations" ? (
          <FloatingFlood setShowWeather={setShowWeather} />
        ) : selectedMenu === "crowdsourced" && (
          <>
            <FloatingCrowdsourced setShowWeather={setShowWeather} />
            <FloatingTweets />
          </>
        )}
      </DateFilterProvider>
      {/* <PumpControls onTogglePumps={handleTogglePumps} /> */}
      {/* <MapToolbox /> */}
      {/* <Weather /> */}
    </div>
  );
};

export default MainPage;
