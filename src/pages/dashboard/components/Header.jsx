import React, { useEffect, useState } from "react";

export default function Header() {
  const [currentTime, setCurrentTime] = useState({ time: "", date: "" });

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

  return (
    <header className="w-full bg-[#636059] px-4 py-1 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src="/assets/img/Logo_white.png" alt="logo" className="h-16" />
        <div className="text-[#636059] font-bold text-lg">Dashboard</div>
      </div>

      <div className="flex items-center gap-3">
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
