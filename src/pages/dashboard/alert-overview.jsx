import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 12; // 3x4 grid

function formatDate(ts) {
  if (!ts) return "-";
  // avoid returning objects directly to React (would cause "Objects are not valid as a React child")
  if (typeof ts === "object") return "-";
  try {
    const d = new Date(ts);
    if (isNaN(d)) return String(ts);
    return d.toLocaleString();
  } catch (e) {
    return String(ts);
  }
}

function formatDateOnly(ts) {
  if (!ts) return "-";
  if (typeof ts === "object") return "-";
  try {
    const d = new Date(ts);
    if (isNaN(d)) return String(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch (e) {
    return String(ts);
  }
}

function formatTimeOnly(ts) {
  if (!ts) return "-";
  if (typeof ts === "object") return "-";
  try {
    const d = new Date(ts);
    if (isNaN(d)) return String(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  } catch (e) {
    return String(ts);
  }
}

// format time in 12-hour clock with AM/PM (e.g., "1:30 PM")
function formatTimeAmPm(ts) {
  if (!ts) return "";
  if (typeof ts === "object") return "";
  try {
    const d = new Date(ts);
    if (isNaN(d)) return "";
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return "";
  }
}

export default function AlertOverview() {
  const [levelFilter, setLevelFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [alertsState, setAlertsState] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [arrResp, awlrResp] = await Promise.all([
          fetch(
            "/data/Automatic_Rain_Recorder_(ARR)_with_Data-_Jakarta.geojson"
          ),
          fetch(
            "/data/Automatic_Water_Level_Recorder_(AWLR)_with_Data-_Jakarta.geojson"
          ),
        ]);

        const [arrJson, awlrJson] = await Promise.all([
          arrResp.ok ? arrResp.json() : { features: [] },
          awlrResp.ok ? awlrResp.json() : { features: [] },
        ]);

        const rows = [];

        function extractPrimitive(v) {
          if (v == null) return null;
          if (
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
          )
            return v;
          if (Array.isArray(v)) {
            for (let i = v.length - 1; i >= 0; i--) {
              const p = extractPrimitive(v[i]);
              if (p != null) return p;
            }
            return null;
          }
          if (typeof v === "object") {
            const keys = Object.keys(v);
            if (keys.length === 0) return null;
            const dateKeys = keys.filter((k) => /^\d{4}-\d{2}-\d{2}/.test(k));
            if (dateKeys.length > 0) {
              dateKeys.sort();
              return extractPrimitive(v[dateKeys[dateKeys.length - 1]]);
            }
            for (let i = keys.length - 1; i >= 0; i--) {
              const val = extractPrimitive(v[keys[i]]);
              if (val != null) return val;
            }
            return null;
          }
          return null;
        }

        function extractNumeric(v) {
          // return a numeric value if possible from nested structures
          const p = extractPrimitive(v);
          if (p == null) return null;
          if (typeof p === "number") return p;
          const n = Number(p);
          if (!isNaN(n)) return n;

          // if v is an object with date keys, try to pull numeric from last entry
          if (v && typeof v === "object") {
            const keys = Object.keys(v).filter((k) =>
              /^\d{4}-\d{2}-\d{2}/.test(k)
            );
            if (keys.length) {
              keys.sort();
              const last = v[keys[keys.length - 1]];
              const r = extractNumeric(last);
              if (r != null) return r;
            }
            // try to find any numeric property
            for (const key of Object.keys(v)) {
              const candidate = extractNumeric(v[key]);
              if (candidate != null) return candidate;
            }
          }
          return null;
        }

        function pushFromFeature(f, source) {
          const props = f.properties || {};
          // prefer explicit ARR/AWLR name fields if present
          const arrName =
            extractPrimitive(props.ARR_Name) ||
            extractPrimitive(props.ARR_NAME) ||
            extractPrimitive(props.ARRName) ||
            null;
          const awlrName =
            extractPrimitive(props.AWLR_Name) ||
            extractPrimitive(props.AWLR_NAME) ||
            extractPrimitive(props.AWLRName) ||
            null;

          const station =
            arrName ||
            awlrName ||
            extractPrimitive(props.Station) ||
            extractPrimitive(props.station) ||
            extractPrimitive(props.station_name) ||
            extractPrimitive(props.NAME) ||
            extractPrimitive(props.Name) ||
            extractPrimitive(props.StationName) ||
            extractPrimitive(props.Nama) ||
            extractPrimitive(props.Nama_Stasiun) ||
            extractPrimitive(props.stasiun) ||
            extractPrimitive(props.lokasi) ||
            "Unknown";

          const readingRaw =
            props.Reading ??
            props.reading ??
            props.value ??
            props.values ??
            props.series ??
            null;
          const reading =
            extractNumeric(readingRaw) ?? extractPrimitive(readingRaw);

          const lowThreshold =
            extractPrimitive(props["Low Threshold"]) ??
            extractPrimitive(props.low_threshold) ??
            extractPrimitive(props.lowThreshold) ??
            null;
          const highThreshold =
            extractPrimitive(props["High Threshold"]) ??
            extractPrimitive(props.high_threshold) ??
            extractPrimitive(props.highThreshold) ??
            null;

          const level =
            extractPrimitive(
              props.Level ?? props.alert_level ?? props.Alert ?? props.LevelName
            ) || "LOW";

          const type = source === "arr" ? "Rain" : "Water Level";

          let ts =
            extractPrimitive(props.Date) ??
            extractPrimitive(props.Timestamp) ??
            extractPrimitive(props.timestamp) ??
            extractPrimitive(props.date) ??
            extractPrimitive(props.DateTime) ??
            extractPrimitive(props.datetime) ??
            null;
          if (!ts && typeof readingRaw === "object" && readingRaw != null) {
            const keys = Object.keys(readingRaw).filter((k) =>
              /^\d{4}-\d{2}-\d{2}/.test(k)
            );
            if (keys.length) {
              keys.sort();
              ts = keys[keys.length - 1];
            }
          }

          rows.push({
            id: f.id || `${source}-${rows.length}`,
            device_id:
              props.Device_ID || props.DeviceId || props.Station_ID || null,
            station,
            arr_name: arrName,
            awlr_name: awlrName,
            reading,
            lowThreshold,
            highThreshold,
            level: level || "LOW",
            type,
            ts,
            source,
            raw: props,
          });
        }

        if (arrJson && arrJson.features)
          arrJson.features.forEach((f) => pushFromFeature(f, "arr"));
        if (awlrJson && awlrJson.features)
          awlrJson.features.forEach((f) => pushFromFeature(f, "awlr"));

        rows.sort((a, b) => {
          const ta = a.ts ? new Date(a.ts).getTime() : 0;
          const tb = b.ts ? new Date(b.ts).getTime() : 0;
          return tb - ta;
        });

        if (mounted) setAlertsState(rows);
      } catch (err) {
        console.error("Failed loading alert geojsons:", err);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const alerts = alertsState;

  const levelOptions = useMemo(() => {
    const set = new Set(alerts.map((a) => (a.level || "").toString()));
    return ["", ...Array.from(set)];
  }, [alerts]);

  const typeOptions = useMemo(() => {
    const set = new Set(alerts.map((a) => (a.type || "").toString()));
    return ["", ...Array.from(set)];
  }, [alerts]);

  const filtered = useMemo(() => {
    let r = alerts;
    if (levelFilter)
      r = r.filter((a) => (a.level || "").toString() === levelFilter);
    if (typeFilter)
      r = r.filter((a) => (a.type || "").toString() === typeFilter);
    if (dateFilter) {
      // dateFilter expected in YYYY-MM-DD
      r = r.filter((a) => {
        if (!a.ts) return false;
        const d = new Date(a.ts);
        if (isNaN(d)) return false;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}` === dateFilter;
      });
    }
    return r;
  }, [alerts, levelFilter, typeFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // helpers for badge color
  function levelColor(level) {
    const l = (level || "").toString().toLowerCase();
    if (l.includes("high") || l.includes("red")) return "#ef4444"; // red
    if (l.includes("med") || l.includes("yellow") || l.includes("warn"))
      return "#f59e0b"; // yellow
    return "#10b981"; // green default
  }

  // Small card component so each card can manage its own expanded/debug state
  function AlertCard({ a }) {
    const [open, setOpen] = useState(false);
    const unit = a.type === "Rain" ? "mm" : "m";
    const statusText = `${
      typeof a.level === "string" ? a.level.toString().toUpperCase() : "DATA"
    } ALERT`;
    const badgeColor = levelColor(a.level);
    const readingDisplay =
      typeof a.reading === "number" || typeof a.reading === "string"
        ? a.reading
        : a.reading == null
        ? "-"
        : String(a.reading);

    const navigate = useNavigate();

    function goToDevice() {
      try {
        const device = a.device_id || a.id || "";
        const station = a.arr_name || a.awlr_name || a.station || "";
        const qs = new URLSearchParams();
        if (device) qs.set("device_id", String(device));
        if (station) qs.set("station", String(station));
        // include date range filters based on the alert timestamp so the
        // destination page can pre-populate its date inputs. Use the
        // same YYYY-MM-DD format used by the page inputs.
        try {
          const dateOnly = formatDateOnly(a.ts);
          // formatDateOnly returns '-' when it can't parse; only set when valid
          if (dateOnly && dateOnly !== "-") {
            qs.set("startDate", String(dateOnly));
            qs.set("endDate", String(dateOnly));
            // also include times in AM/PM format for components that use 12-hour clocks
            const t = formatTimeAmPm(a.ts);
            if (t) {
              qs.set("startTime", String(t));
              qs.set("endTime", String(t));
            }
          }
        } catch (e) {
          // ignore date formatting errors
        }
        const base =
          a.type === "Rain"
            ? "/dashboard/rain-level-data"
            : "/dashboard/water-level-data";
        navigate(`${base}?${qs.toString()}`);
      } catch (e) {
        // ignore navigation errors
      }
    }

    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") goToDevice();
        }}
        onClick={goToDevice}
        className="rounded-xl overflow-hidden bg-white border shadow-sm flex flex-col cursor-pointer hover:shadow-md"
      >
        <div className="p-3 flex items-center gap-3">
          <img
            src={
              a.type === "Rain"
                ? "/assets/img/rain-gauge-icon.svg"
                : "/assets/img/water-level-icon.svg"
            }
            alt={a.type}
            style={{ filter: "invert(0.6)" }}
            className="w-10 h-10 object-contain"
          />
          <div className="text-lg font-bold text-[#636059]">
            {a.type === "Rain" ? "Rainfall" : "Water Level"}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="space-y-2 text-sm text-[#636059]">
              <div className="flex justify-between items-start">
                <div className="text-md">Reading</div>
                <div className="text-right font-semibold text-base">
                  {readingDisplay} {readingDisplay !== "-" ? unit : ""}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="text-md">Reading (+6 hr)</div>
                <div className="text-right font-semibold text-base">
                  {readingDisplay} {readingDisplay !== "-" ? unit : ""}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="text-md">Low Threshold</div>
                <div className="text-right font-semibold text-base">
                  {a.lowThreshold ?? "1"}
                </div>
              </div>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="text-sm text-[#636059]">
              <div className="flex justify-between items-start">
                <div className="text-md font-medium">Station</div>
                <div className="text-right font-medium">
                  {a.arr_name || a.awlr_name || a.station || "Unknown"}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-md font-medium">Date</div>
                <div className="text-right font-medium">
                  {formatDateOnly(a.ts)}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-md font-medium">Time</div>
                <div className="text-right font-medium">
                  {formatTimeOnly(a.ts)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ backgroundColor: badgeColor }}
          className="text-center py-3 text-white font-semibold"
        >
          {statusText}
        </div>
      </div>
    );
  }

  // Render main page
  return (
    <div className="p-2">
      <div className="mb-4 flex">
        <img
          src="/assets/logos/Alert Overview Icon.svg"
          alt="cross"
          className="w-12 h-12"
          style={{ filter: "invert(0.4)" }}
        />
        <div className="flex-col flex ml-2">
          <h2 className="text-2xl font-semibold items-center">
            Alert Overview
          </h2>
          <p className="text-sm text-[#636059]">
            Consolidated alerts from ARR and AWLR stations.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-xl px-3 py-2 text-lg"
            >
              <option value="">All Levels</option>
              {levelOptions
                .filter((x) => x !== "")
                .map((opt) => (
                  <option value={opt} key={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-xl px-3 py-2 text-lg"
            >
              <option value="">All Types</option>
              {typeOptions
                .filter((x) => x !== "")
                .map((opt) => (
                  <option value={opt} key={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-xl px-3 py-1 text-lg"
            />
          </div>

          <div>
            <button
              onClick={() => {
                setLevelFilter("");
                setTypeFilter("");
                setDateFilter("");
                setPage(1);
              }}
              className="px-3 py-1 rounded-xl border text-lg bg-white"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-5/6">
          {pageItems.map((a) => (
            <AlertCard a={a} key={a.id} />
          ))}
        </div>
        <div className="hidden lg:block w-px bg-gray-200 self-stretch z-50" />
        {/* right-side legend / summary */}
        <div className="w-full lg:w-2/5">
          <div className="h-full sticky top-24 rounded-xl">
            <div className="text-xl font-semibold text-[#636059] mb-2">
              Summary
            </div>
            <div>These are the alert summary for the last 6 months</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-40 h-11 rounded"
                  style={{ background: "#ef4444" }}
                ></div>
                <div className="flex flex-col">
                  <div className="text-lg text-[#636059]">High</div>
                  <div className="text-lg text-[#636059]">Risk Alert</div>
                </div>
                <div className="text-5xl font-bold items-end flex ">5</div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-40 h-11 rounded"
                  style={{ background: "#f59e0b" }}
                ></div>
                <div className="flex flex-col">
                  <div className="text-lg text-[#636059]">Medium</div>
                  <div className="text-lg text-[#636059]">Risk Alert</div>
                </div>
                <div className="text-5xl font-bold items-end flex ">5</div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-40 h-11 rounded"
                  style={{ background: "#10b981" }}
                ></div>
                <div className="flex flex-col">
                  <div className="text-lg text-[#636059]">Low</div>
                  <div className="text-lg text-[#636059]">Risk Alert</div>
                </div>
                <div className="text-5xl font-bold items-end flex">5</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* pagination */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded border bg-white"
        >
          Prev
        </button>
        <div className="text-sm text-[#636059]">
          Page {page} / {totalPages}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border bg-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
