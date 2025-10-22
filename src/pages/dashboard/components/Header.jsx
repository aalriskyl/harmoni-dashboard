import React, { useEffect, useState } from "react";

export default function Header() {
  const [currentTime, setCurrentTime] = useState({ time: "", date: "" });
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const dateOptions = {
        timeZone: "Asia/Jakarta",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      };
      const jakartaTime = now.toLocaleTimeString("en-US", timeOptions);
      const jakartaDate = now.toLocaleDateString("en-US", dateOptions);
      setCurrentTime({ time: `${jakartaTime} WIB`, date: jakartaDate });
    };

    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  // Close alerts when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAlerts && !event.target.closest(".alert-container")) {
        setShowAlerts(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAlerts]);

  // Dummy alerts data
  const dummyAlerts = [
    {
      id: 1,
      type: "warning",
      title: "High Water Level",
      message: "Water level at Ciliwung River has reached 2.5m",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "info",
      title: "System Update",
      message: "River monitoring system updated to version 2.1",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "success",
      title: "Data Sync Complete",
      message: "All river data has been synchronized",
      time: "2 hours ago",
      unread: false,
    },
  ];

  const unreadCount = dummyAlerts.filter((alert) => alert.unread).length;

  return (
    <header className="w-full bg-[#636059] px-4 py-1 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src="/assets/img/Logo_white.png" alt="logo" className="h-16" />
        <div className="text-[#636059] font-bold text-lg">Dashboard</div>
      </div>

      <div className="flex items-center gap-3">
        {/* Alert Icon */}

        {/* Weather and Time */}
        <div className="flex items-center">
          <div className="flex-shrink-0 justify-start">
            <div className="flex items-center px-4 py-2 rounded-md bg-[#cfcfcd] text-white font-bold mr-4">
              <span className="text-[#636059]">28°C</span>
            </div>
          </div>

          <div className="flex-1 text-center rounded-lg px-2 py-2 bg-[#cfcfcd]">
            <div className="inline-flex items-center justify-center">
              <div className="flex flex-col mx-4">
                <div className="flex-row flex">
                  <span className="text-[#636059] text-md font-bold hidden sm:inline">
                    {currentTime.date}
                  </span>
                  <span className="ml-1 font-bold text-[#636059]">
                    {currentTime.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="alert-container relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative flex items-center bg-[#cfcfcd] p-2 rounded-xl text-[#636059] hover:bg-[#555149] transition-colors"
          >
            <svg
              className="w-6 h-6"
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Alert Card */}
          {showAlerts && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-9999">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">
                    Alerts & Notifications
                  </h3>
                  <span className="text-sm text-gray-500">
                    {unreadCount} unread
                  </span>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {dummyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      alert.unread ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                          alert.type === "warning"
                            ? "bg-yellow-500"
                            : alert.type === "info"
                            ? "bg-blue-500"
                            : alert.type === "success"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {alert.title}
                          </h4>
                          {alert.unread && (
                            <span className="bg-blue-500 text-white text-xs px-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {alert.message}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {alert.time}
                          </span>
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Alerts
                </button>
              </div>
            </div>
          )}
        </div>
        <a
          className="flex items-center bg-[#cfcfcd] p-2 rounded-xl text-[#636059] hover:bg-[#555149] transition-colors"
          href="/dashboard"
        >
          <svg
            className="w-6 h-6 text-[#636059]"
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
        </a>
      </div>
    </header>
  );
}
