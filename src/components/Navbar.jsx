import React, { useState, useEffect } from "react";

const Navbar = ({ onMenuSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSimulationDropdownOpen, setIsSimulationDropdownOpen] =
    useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState("Simulations");
  const [selectedFloodType, setSelectedFloodType] = useState(
    "Realtime Flood Simulation"
  );
  const [currentTime, setCurrentTime] = useState({ time: "", date: "" });
  const [showWeather, setShowWeather] = useState(false); // State for weather panel visibility

  useEffect(() => {
    // Function to update Jakarta time (GMT+7)
    const updateTime = () => {
      const now = new Date();

      // Time options
      const timeOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };

      // Date options
      const dateOptions = {
        timeZone: "Asia/Jakarta",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      };

      const jakartaTime = now.toLocaleTimeString("en-US", timeOptions);
      const jakartaDate = now.toLocaleDateString("en-US", dateOptions);

      setCurrentTime({
        time: `${jakartaTime} WIB`,
        date: jakartaDate,
      });
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleWeatherPanel = () => {
    setShowWeather(!showWeather);
  };

  return (
    <>
      <nav className="fixed top-6 left-0 w-full z-50 px-8">
        <div className="flex">
          <div className="w-full border border-[#cfcfcd]/30 bg-white/30 backdrop-blur-md rounded-2xl px-6 py-3 flex justify-between items-center">
            {/* Left side - Title/Dropdown */}
            <div className="flex text-[#cfcfcd] items-center gap-2">
              <div className="px-4 py-2 rounded-xl">
                <img
                  src="/assets/img/Logo.png"
                  alt="logo"
                  className="w-20 h-auto"
                />
              </div>

              {/* Dropdown container */}
              <div className="relative">
                <button
                  className="bg-[#cfcfcd] text-[#636059] border-[#636059] border px-4 py-2 rounded-xl flex items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedFloodType}
                  <svg
                    className={`ml-2 w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-[#636059] rounded-xl shadow-lg z-50">
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-[#a49e92] rounded-t-xl text-[#cfcfcd]"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFloodType("Realtime Flood Simulation");
                          setIsDropdownOpen(false);
                          onMenuSelect("warnings");
                        }}
                      >
                        Realtime Flood Simulation
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-[#a49e92] rounded-b-xl text-[#cfcfcd]"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFloodType(
                            "Return Period Flood Simulation"
                          );
                          setIsDropdownOpen(false);
                          onMenuSelect("simulations");
                        }}
                      >
                        Return period flood simulation
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Second Dropdown container */}
              <div className="relative">
                <button
                  className="bg-[#cfcfcd] text-[#636059] border-[#636059] border px-4 py-2 rounded-xl flex items-center ml-2"
                  onClick={() =>
                    setIsSimulationDropdownOpen(!isSimulationDropdownOpen)
                  }
                >
                  {selectedSimulation}
                  <svg
                    className={`ml-2 w-4 h-4 transition-transform ${
                      isSimulationDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Second Dropdown menu */}
                {isSimulationDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-[#636059] rounded-xl shadow-lg z-50">
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-[#a49e92] rounded-t-xl text-[#cfcfcd]"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSimulation(
                            "Warnings and Vulnerable Areas"
                          );
                          setSelectedFloodType("Realtime Flood Simulation");
                          setIsSimulationDropdownOpen(false);
                          onMenuSelect("warnings");
                        }}
                      >
                        Warnings and Vulnerable Areas
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 hover:bg-[#a49e92] rounded-b-xl text-[#cfcfcd]"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSimulation("Flood Simulations");
                          setSelectedFloodType(
                            "Return Period Flood Simulation"
                          );
                          setIsSimulationDropdownOpen(false);
                          onMenuSelect("simulations");
                        }}
                      >
                        Flood Simulations
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Icons */}
            <div className="flex items-center space-x-2 bg-[#636059] border border-[#cfcfcd]/30 rounded-xl px-2 py-2">
              {/* Weather Icon - Now with toggle functionality */}
              <button
                className="flex items-center cursor-pointer px-2 py-2 rounded-xl transition-colors text-white bg-[#a49e92]"
                onClick={toggleWeatherPanel}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="ml-1 text-white">28°C</span>
              </button>

              {/* Timezone - Now with live updating clock */}
              <div className="flex items-center px-3 py-2 rounded-xl">
                <svg
                  className="w-5 h-5 text-white me-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex items-center">
                  <span className="text-white text-md mr-2 hidden sm:inline">
                    {currentTime.date}
                  </span>
                  <span className="ml-1 text-white">{currentTime.time}</span>
                </div>
              </div>

              {/* Notification Bell */}
              <button className="relative bg-[#636059]/50 p-2 rounded-xl text-white hover:bg-[#636059]/70 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar */}
              <button className="flex items-center bg-[#636059]/50 p-2 rounded-xl text-white hover:bg-[#636059]/70 transition-colors">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Weather Panel - Conditionally rendered based on showWeather prop */}
      {showWeather && (
        <div className="fixed top-[7rem] left-0 w-full z-40 px-8">
          <div className="border border-white/30 bg-[#636059]/30 backdrop-blur-md rounded-2xl px-6 py-2 mx-auto">
            <div className="w-full h-full p-2 flex items-center gap-2">
              <div className="flex flex-col justify-around gap-1 pr-2 border-r border-white h-full">
                <div className="relative" data-headlessui-state="">
                  <div
                    id="headlessui-listbox-button-v-0-0-16"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                    data-headlessui-state=""
                    role="button"
                    className="flex items-center w-full"
                  >
                    <button
                      className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 h-7 w-full font-medium inline-flex items-center text-left cursor-default text-xs gap-x-1.5 px-2.5 py-1.5 shadow-sm bg-[#636059]/30 text-white ring-1 ring-inset ring-white focus:ring-1 focus:ring-[#636059] pe-8 rounded-lg"
                      type="button"
                    >
                      <span className="block truncate">Kulon Progo</span>
                      <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-2.5">
                        <span
                          className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 text-white h-4 w-4"
                          aria-hidden="true"
                        ></span>
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative" data-headlessui-state="">
                    <div
                      id="headlessui-combobox-button-v-0-0-17"
                      tabIndex="-1"
                      aria-haspopup="listbox"
                      aria-expanded="false"
                      data-headlessui-state=""
                      role="button"
                      className="flex items-center w-full"
                    >
                      <button
                        className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 h-7 w-full font-medium inline-flex items-center text-left cursor-default rounded-lg text-xs gap-x-1.5 px-2.5 py-1.5 shadow-sm bg-[#636059] text-white ring-1 ring-inset ring-[#636059] focus:ring-1 focus:ring-[#636059] pe-8"
                        type="button"
                      >
                        <span className="block truncate">Kalibawang</span>
                        <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-2.5">
                          <span
                            className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 text-[#636059] h-4 w-4"
                            aria-hidden="true"
                          ></span>
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="relative" data-headlessui-state="">
                    <div
                      id="headlessui-combobox-button-v-0-0-18"
                      tabIndex="-1"
                      aria-haspopup="listbox"
                      aria-expanded="false"
                      data-headlessui-state=""
                      role="button"
                      className="flex items-center w-full"
                    >
                      <button
                        className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 h-7 w-full font-medium inline-flex items-center text-left cursor-default rounded-lg text-xs gap-x-1.5 px-2.5 py-1.5 shadow-sm bg-[#636059] text-white ring-1 ring-inset ring-[#636059] focus:ring-1 focus:ring-[#636059] pe-8"
                        type="button"
                      >
                        <span className="block truncate">Banjararum</span>
                        <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-2.5">
                          <span
                            className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 text-[#636059] h-4 w-4"
                            aria-hidden="true"
                          ></span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 justify-between">
                  <button className="text-white border-[#a49e92] bg-[#a49e92] w-[70px] border rounded-lg text-xs font-medium p-1">
                    6 Agu
                  </button>
                  <button className="text-white border-[#636059] bg-transparent w-[70px] border rounded-lg text-xs font-medium p-1">
                    7 Agu
                  </button>
                  <button className="text-white border-[#636059] bg-transparent w-[70px] border rounded-lg text-xs font-medium p-1">
                    8 Agu
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full h-full flex gap-1 overflow-x-auto">
                {/* Weather time blocks */}
                <div className="w-48 min-w-48 h-full rounded-2xl py-2 px-4 divine-y-2 text-2xs bg-[#ece4e4]">
                  <div>
                    <p className="text-xs">20.00 WIB</p>
                    <div className="flex items-center justify-between">
                      <p className="text-md font-medium text-black">
                        21 ºC{" "}
                        <span className="text-xs text-black font-normal">
                          Sunny
                        </span>
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 16"
                        className="nuxt-icon--fill #F36A1D w-4 h-4"
                        style={{ color: "rgb(243, 106, 29)" }}
                      >
                        <g clipPath="url(#i1614757057__a)">
                          <path
                            fill="#F36A1D"
                            d="M8 11.333a3.335 3.335 0 0 1 0-6.666 3.335 3.335 0 0 1 0 6.666ZM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm.667-6H7.333v3.333h1.334V0Zm0 12.667H7.333V16h1.334v-3.333ZM3.333 7.333H0v1.334h3.333V7.333Zm12.667 0h-3.333v1.334H16V7.333Zm-1.873-4.52-.94-.94-2.36 2.36.94.94 2.36-2.36Zm-8.954 8.96-.94-.94-2.36 2.36.94.94 2.36-2.36Zm0-7.54-2.36-2.36-.94.94 2.36 2.36.94-.94Zm8.96 8.96-2.36-2.36-.94.94 2.36 2.36.94-.94Z"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="i1614757057__a">
                            <path fill="#fff" d="M0 0h16v16H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <div className="border-b border-[#636059]/20 w-full my-1"></div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 12 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <g clipPath="url(#i-568641931__a)">
                          <path
                            fill="#636059"
                            d="M6 12a5 5 0 0 1-3.536-8.535L6 .007 9.53 3.46a5.007 5.007 0 0 1-1.617 8.16 4.968 4.968 0 0 1-1.914.38ZM6 1.406l-2.833 2.77a4 4 0 1 0 5.661-.004L6 1.406ZM4.5 5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Zm3 3a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM4.217 9h1.166l2.4-4H6.617l-2.4 4Z"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="i-568641931__a">
                            <path fill="#fff" d="M0 0h12v12H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                      <p className="text-sm">95</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 13 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <path
                          fill="#636059"
                          d="M9.68 5.293 7.034 2.646l-.706.707L8.974 6 6.329 8.646l.708.707 2.642-2.646a1 1 0 0 0 0-1.414Z"
                        ></path>
                        <path
                          fill="#636059"
                          d="m6.535 5.646-3-3-.706.707L5.474 6 2.829 8.646l.708.707 3-3a.5.5 0 0 0-.002-.707Z"
                        ></path>
                      </svg>
                      <p className="text-sm">W</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 12 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <path
                          fill="#636059"
                          d="M12 1v1H0V1h12ZM0 11h4v-1H0v1Zm0-4.5h8v-1H0v1Z"
                        ></path>
                      </svg>
                      <p className="text-sm">0.9km/hour</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 12 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <path
                          fill="#a49e92"
                          d="M11.91 5.59C11.471 4.63 9.75 1.5 6 1.5S.528 4.63.09 5.59a.984.984 0 0 0 0 .82C.527 7.37 2.25 10.5 6 10.5s5.471-3.13 5.91-4.09a.984.984 0 0 0 0-.82ZM6 9.5c-3.154 0-4.625-2.683-5-3.495C1.375 5.183 2.846 2.5 6 2.5c3.146 0 4.618 2.671 5 3.5-.382.829-1.854 3.5-5 3.5Z"
                        ></path>
                        <path
                          fill="#a49e92"
                          d="M6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
                        ></path>
                      </svg>
                      <p className="text-xs">&lt; 9 km</p>
                    </div>
                  </div>
                </div>

                <div className="w-48 min-w-48 h-full rounded-2xl py-2 px-4 divine-y-2 text-2xs bg-[#ece4e4]">
                  <div>
                    <p className="text-xs">20.00 WIB</p>
                    <div className="flex items-center justify-between">
                      <p className="text-md font-medium text-black">
                        21 ºC{" "}
                        <span className="text-xs text-black font-normal">
                          Sunny
                        </span>
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 16 16"
                        className="nuxt-icon--fill #F36A1D w-4 h-4"
                        style={{ color: "rgb(243, 106, 29)" }}
                      >
                        <g clipPath="url(#i1614757057__a)">
                          <path
                            fill="#F36A1D"
                            d="M8 11.333a3.335 3.335 0 0 1 0-6.666 3.335 3.335 0 0 1 0 6.666ZM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm.667-6H7.333v3.333h1.334V0Zm0 12.667H7.333V16h1.334v-3.333ZM3.333 7.333H0v1.334h3.333V7.333Zm12.667 0h-3.333v1.334H16V7.333Zm-1.873-4.52-.94-.94-2.36 2.36.94.94 2.36-2.36Zm-8.954 8.96-.94-.94-2.36 2.36.94.94 2.36-2.36Zm0-7.54-2.36-2.36-.94.94 2.36 2.36.94-.94Zm8.96 8.96-2.36-2.36-.94.94 2.36 2.36.94-.94Z"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="i1614757057__a">
                            <path fill="#fff" d="M0 0h16v16H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <div className="border-b border-[#636059]/20 w-full my-1"></div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 12 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <g clipPath="url(#i-568641931__a)">
                          <path
                            fill="#636059"
                            d="M6 12a5 5 0 0 1-3.536-8.535L6 .007 9.53 3.46a5.007 5.007 0 0 1-1.617 8.16 4.968 4.968 0 0 1-1.914.38ZM6 1.406l-2.833 2.77a4 4 0 1 0 5.661-.004L6 1.406ZM4.5 5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Zm3 3a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM4.217 9h1.166l2.4-4H6.617l-2.4 4Z"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="i-568641931__a">
                            <path fill="#fff" d="M0 0h12v12H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                      <p className="text-sm">95</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 13 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <path
                          fill="#636059"
                          d="M9.68 5.293 7.034 2.646l-.706.707L8.974 6 6.329 8.646l.708.707 2.642-2.646a1 1 0 0 0 0-1.414Z"
                        ></path>
                        <path
                          fill="#636059"
                          d="m6.535 5.646-3-3-.706.707L5.474 6 2.829 8.646l.708.707 3-3a.5.5 0 0 0-.002-.707Z"
                        ></path>
                      </svg>
                      <p className="text-sm">W</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 12 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <path
                          fill="#636059"
                          d="M12 1v1H0V1h12ZM0 11h4v-1H0v1Zm0-4.5h8v-1H0v1Z"
                        ></path>
                      </svg>
                      <p className="text-sm">0.9km/hour</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 12 12"
                        className="nuxt-icon--fill w-3 h-3 text-[#636059]/30"
                      >
                        <path
                          fill="#a49e92"
                          d="M11.91 5.59C11.471 4.63 9.75 1.5 6 1.5S.528 4.63.09 5.59a.984.984 0 0 0 0 .82C.527 7.37 2.25 10.5 6 10.5s5.471-3.13 5.91-4.09a.984.984 0 0 0 0-.82ZM6 9.5c-3.154 0-4.625-2.683-5-3.495C1.375 5.183 2.846 2.5 6 2.5c3.146 0 4.618 2.671 5 3.5-.382.829-1.854 3.5-5 3.5Z"
                        ></path>
                        <path
                          fill="#a49e92"
                          d="M6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
                        ></path>
                      </svg>
                      <p className="text-sm">&lt; 9 km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
