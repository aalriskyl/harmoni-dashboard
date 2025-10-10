import React, { useMemo, useState, useEffect } from "react";

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
          const station =
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
            station,
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

    return (
      <div className="rounded-xl overflow-hidden bg-white border shadow-sm flex flex-col">
        <div className="p-3 bg-gray-50 flex items-center gap-3">
          <img
            src={
              a.type === "Rain"
                ? "/assets/img/rain-gauge-icon.svg"
                : "/assets/img/water-level-icon.svg"
            }
            alt={a.type}
            className="w-10 h-10 object-contain"
          />
          <div className="text-lg text-[#636059]">
            {a.type === "Rain" ? "Rainfall" : "Water Level"}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="space-y-2 text-sm text-[#636059]">
              <div className="flex justify-between items-start">
                <div className="text-xs">Reading</div>
                <div className="text-right font-semibold text-base">
                  {readingDisplay} {readingDisplay !== "-" ? unit : ""}
                </div>
              </div>

              <div className="flex justify-between">
                <div className="text-xs">Reading (+6 hr)</div>
                <div className="text-right font-semibold text-base">-</div>
              </div>

              <div className="flex justify-between">
                <div className="text-xs">Low Threshold</div>
                <div className="text-right font-semibold text-base">
                  {a.lowThreshold ?? "-"}
                </div>
              </div>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="text-sm text-[#636059]">
              <div className="flex justify-between items-start">
                <div className="text-xs">Station</div>
                <div className="text-right font-medium">
                  {a.station || "Unknown"}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-xs">Date</div>
                <div className="text-right font-medium">{formatDate(a.ts)}</div>
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
              className="border rounded px-3 py-2 text-lg"
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
              className="border rounded px-2 py-1 text-sm"
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
              className="border rounded px-2 py-1 text-sm"
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
              className="px-3 py-1 rounded border text-sm bg-white"
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
        {/* right-side legend / summary */}
        <div className="w-full lg:w-2/5">
          <div className="h-full sticky top-24 rounded-xl p-4">
            <div className="text-xl font-semibold text-[#636059] mb-2">
              Summary
            </div>
            <div>These are the alert summary for the last 6 months</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-30 h-8 rounded"
                  style={{ background: "#ef4444" }}
                ></div>
                <div className="flex flex-col">
                  <div className="text-lg text-[#636059]">High</div>
                  <div className="text-lg text-[#636059]">Risk Alert</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-30 h-8 rounded"
                  style={{ background: "#f59e0b" }}
                ></div>
                <div className="flex flex-col">
                  <div className="text-lg text-[#636059]">Medium</div>
                  <div className="text-lg text-[#636059]">Risk Alert</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-30 h-8 rounded"
                  style={{ background: "#10b981" }}
                ></div>
                <div className="flex flex-col">
                  <div className="text-lg text-[#636059]">Low</div>
                  <div className="text-lg text-[#636059]">Risk Alert</div>
                </div>
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
