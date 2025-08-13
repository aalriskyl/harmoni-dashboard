import React from "react";
import Map from "../components/Map";
import FloatingContainer from "../components/FloatingContainer";
import FloatingFlood from "../components/FloatingFlood";
import Weather from "../components/Weather";
import MapToolbox from "../components/MapToolbox";

const MainPage = ({ selectedMenu, setShowWeather }) => {
  return (
    <div className="w-full h-screen relative bg-blue-900">
      <Map />
      {selectedMenu === "simulations" ? (
        <FloatingFlood setShowWeather={setShowWeather} />
      ) : (
        <FloatingContainer />
      )}
      {/* <MapToolbox /> */}
      {/* <Weather /> */}
    </div>
  );
};

export default MainPage;
