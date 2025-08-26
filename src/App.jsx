import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";

function App() {
  const [selectedMenu, setSelectedMenu] = useState("warnings"); // 'warnings' or 'simulations'
  const [showWeather, setShowWeather] = useState(true);

  useEffect(() => {
    const handleShowWeather = () => {
      setShowWeather(true);
    };

    window.addEventListener('show-weather', handleShowWeather);
    
    return () => {
      window.removeEventListener('show-weather', handleShowWeather);
    };
  }, []);

  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
  };

  const handleWeatherToggle = (isOpen) => {
    setShowWeather(isOpen);
  };

  return (
    <>
      <Navbar 
        onMenuSelect={handleMenuSelect} 
        onWeatherToggle={handleWeatherToggle}
      />
      <MainPage selectedMenu={selectedMenu} showWeather={showWeather} />
    </>
  );
}

export default App;
