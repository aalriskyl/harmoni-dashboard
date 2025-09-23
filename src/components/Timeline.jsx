import React, { useEffect, useState } from "react";
import "../styles/timeline-datepicker.css";

// ticks every 2 hours from 0..24 (inclusive): 0,2,4,...,24
const TIMES = Array.from({ length: 13 }, (_, i) => i * 2); // 0,2,...,24

function formatHour(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

function formatTimeFromMinutes(m) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function Timeline({
  initialMinutes = 0,
  onChange,
  onDateChange,
  onRasterChange,
}) {
  // Timeline covers 00:00 .. 24:00 (inclusive) with minute granularity
  const MAX_MINUTES = 24 * 60; // 1440

  const [minutes, setMinutes] = useState(() => {
    const n = Number(initialMinutes) || 0;
    if (n < 0) return 0;
    if (n > MAX_MINUTES) return MAX_MINUTES;
    return Math.floor(n);
  });

  useEffect(() => {
    if (typeof onChange === "function") onChange(minutes);
  }, [minutes, onChange]);

  // Date selection state: default to today
  const makeDateOnly = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const today = makeDateOnly(new Date());
  const [currentDate, setCurrentDate] = useState(today);

  // play/pause state for the timeline simulation
  const [isPlaying, setIsPlaying] = useState(false);

  const setPlayingState = (running) => {
    setIsPlaying(running);
    try {
      window.dispatchEvent(
        new CustomEvent("simulationStateChange", { detail: { running } })
      );
    } catch (e) {
      // ignore
    }
  };

  // Auto-play: when isPlaying is true, advance by 60 minutes (1 hour) per second.
  useEffect(() => {
    if (!isPlaying) return undefined;

    const intervalMs = 1000; // 1 second per hour step
    const step = 60; // minutes to advance per tick

    const id = setInterval(() => {
      setMinutes((prev) => {
        const next = Math.min(prev + step, MAX_MINUTES);
        // When we reach the end, stop playing
        if (next >= MAX_MINUTES) {
          setPlayingState(false);
        }
        // also dispatch a DOM event for timelineChange so other parts of the app hear it
        try {
          const hh = Math.floor(next / 60);
          const mm = next % 60;
          window.dispatchEvent(
            new CustomEvent("timelineChange", {
              detail: { minutes: next, hh, mm },
            })
          );
        } catch (e) {
          // ignore
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [isPlaying]);

  // Raster images mapping (5 images). Assumption: partition the day into 5 ranges.
  const RASTER_IMAGES = [
    "/assets/img/flooded-house.svg",
    "/assets/img/logo.png",
    "/assets/img/pump-icon.svg",
    "/assets/img/rain-gauge-icon.svg",
    "/assets/img/water-level-icon.svg",
  ];

  const getRasterForMinutes = (mins) => {
    // Partition 0..1439 into 5 ranges roughly equal
    const per = Math.floor(MAX_MINUTES / RASTER_IMAGES.length); // 288
    const idx = Math.min(Math.floor(mins / per), RASTER_IMAGES.length - 1);
    return { index: idx, path: RASTER_IMAGES[idx] };
  };

  const [selectedRaster, setSelectedRaster] = useState(() =>
    getRasterForMinutes(minutes)
  );

  // When minutes change, update raster selection and notify parent/map
  useEffect(() => {
    const r = getRasterForMinutes(minutes);
    setSelectedRaster(r);
    // dispatch DOM event
    try {
      window.dispatchEvent(
        new CustomEvent("timelineRasterChange", {
          detail: { index: r.index, path: r.path },
        })
      );
    } catch (e) {}
    // call prop if provided
    if (typeof onRasterChange === "function") {
      try {
        onRasterChange(r.path, r.index);
      } catch (e) {}
    }
  }, [minutes]);

  // Build a list of date options (7 days before..7 days after)
  const buildDateOptions = (center, range = 7) => {
    const arr = [];
    for (let i = -range; i <= range; i++) {
      const d = new Date(center);
      d.setDate(center.getDate() + i);
      arr.push(makeDateOnly(d));
    }
    return arr;
  };

  const dateOptions = buildDateOptions(today, 7);

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function ordinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function formatDateDisplay(date) {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayName = weekdays[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const yyyy = date.getFullYear();
    return `${dayName}, ${ordinalSuffix(dayNum)} ${monthName} ${yyyy}`;
  }

  const dispatchDateChange = (date) => {
    // Dispatch DOM event and call prop if provided
    try {
      window.dispatchEvent(
        new CustomEvent("timelineDateChange", { detail: { date } })
      );
    } catch (e) {
      // ignore
    }
    if (typeof onDateChange === "function") onDateChange(date);
  };

  const changeDate = (newDate) => {
    const d = makeDateOnly(newDate);
    setCurrentDate(d);
    dispatchDateChange(d);
  };

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    changeDate(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    changeDate(d);
  };

  return (
    <div
      role="region"
      aria-label="Timeline"
      className="fixed left-0 right-0 bottom-2 z-50 flex justify-center pointer-events-none"
    >
      <div className="w-full text-black px-3 pb-3 pt-2 rounded-lg pointer-events-auto">
        {/* Debug overlay: show selected raster image centered on screen for verification */}
        {selectedRaster && (
          <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 hidden lg:flex items-center justify-center">
            <img
              src={selectedRaster.path}
              alt="selected-raster"
              className="w-32 h-32 opacity-90"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}
            />
          </div>
        )}
        <div className="flex flex-col mx-5 items-center bg-white max-w-[332px] w-full px-3 py-1 rounded mb-[20px]">
          <div className="relative w-full">
            {/* Prev button pinned to left */}
            <button
              type="button"
              onClick={prevDay}
              aria-label="Previous day"
              className="absolute left-2 top-1/2 -translate-y-1/2 px-2 bg-[#636059] rounded hover:bg-[#636059]/20 text-md text-white z-30 pointer-events-auto"
            >
              &lt;
            </button>

            {/* Center content */}
            <div className="flex items-center justify-center w-full">
              <div className="relative">
                {/* shrink to content so the invisible input only covers the text */}
                <div className="inline-block relative px-4">
                  <div className="bg-transparent text-sm rounded px-2 py-1 text-left select-none">
                    {formatDateDisplay(currentDate)}
                  </div>
                  <input
                    id="hidden-date-input"
                    type="date"
                    value={currentDate.toISOString().slice(0, 10)}
                    onChange={(e) => {
                      const v = e.target.value; // YYYY-MM-DD
                      if (!v) return;
                      const parts = v.split("-").map((p) => Number(p));
                      const d = new Date(parts[0], parts[1] - 1, parts[2]);
                      changeDate(d);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    style={{ left: 0, right: 0 }}
                  />
                </div>
              </div>
            </div>

            {/* Next button pinned to right */}
            <button
              type="button"
              onClick={nextDay}
              aria-label="Next day"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 bg-[#636059] rounded text-white hover:bg-[#636059]/20 text-md z-30 pointer-events-auto"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative h-10 w-[88vw] mx-auto">
            {/* Play / Pause controls - positioned above the start (left) of the timeline */}
            {/* Left: single toggle play/pause button */}
            <div className="absolute -left-[79px] top-6 -translate-y-6 ml-2 flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setPlayingState(!isPlaying)}
                aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                  isPlaying
                    ? "bg-[#636059] text-white"
                    : "bg-[#636059] text-white"
                } hover:opacity-90`}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
            </div>
            {/* line */}
            <div className="absolute inset-x-0 top-1/2 h-[6px] bg-white -translate-y-1/2 rounded" />

            {/* Right: jump-to-end button */}
            <div className="absolute right-0 top-0 -translate-y-6 mr-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setMinutes(MAX_MINUTES);
                  setPlayingState(false);
                  try {
                    const hh = Math.floor(MAX_MINUTES / 60);
                    const mm = MAX_MINUTES % 60;
                    window.dispatchEvent(
                      new CustomEvent("timelineChange", {
                        detail: { minutes: MAX_MINUTES, hh, mm },
                      })
                    );
                  } catch (e) {}
                }}
                aria-label="Jump to end"
                className="w-8 h-8 rounded flex items-center justify-center bg-white/10 text-white hover:bg-white/20 text-sm"
              >
                »
              </button>
            </div>

            {/* ticks - positioned according to minutes within 00:00..22:00 */}
            {TIMES.map((t, i) => {
              const tickMinutes = t * 60; // t hours -> minutes
              const leftPct = (tickMinutes / MAX_MINUTES) * 100;
              return (
                <div
                  key={i}
                  style={{ left: `${leftPct}%` }}
                  className="absolute -top-2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
                >
                  <div className="text-[12px] mb-2 text-black font-bold">
                    {formatHour(t)}
                  </div>
                  <div
                    className={`w-[2px] ${
                      minutes === tickMinutes
                        ? "h-3 bg-amber-400"
                        : "h-2 bg-white/80"
                    }`}
                  />
                </div>
              );
            })}

            {/* slider */}
            <input
              type="range"
              min={0}
              max={MAX_MINUTES}
              step={1}
              value={minutes}
              aria-label="Timeline slider (minutes resolution)"
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="absolute inset-0 w-full h-full appearance-none bg-transparent m-0 p-0 pointer-events-auto"
              style={{ WebkitAppearance: "none" }}
            />
          </div>
        </div>

        <style>{`
          input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 9999px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4); }
          input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 9999px; background: #ffffff; }
          input[type=range]::-webkit-slider-runnable-track { height: 18px; background: transparent; }
          input[type=range]:focus { outline: none; }
        `}</style>
      </div>
    </div>
  );
}
