import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

// register zoom plugin so charts can be panned/zoomed
Chart.register(zoomPlugin);

// Water Level Data page (AWLR) — mirrors the Rain page but reads AWLR geojson and uses meters
function categoryFromReading(mm) {
  if (mm == null) return "No Data";
  if (mm >= 5) return "High";
  if (mm >= 2) return "Medium";
  if (mm > 0) return "Low";
  return "No Water";
}

function categoryBadgeClass(category) {
  const c = (category || "").toLowerCase();
  if (c === "high" || c === "alert") return "bg-red-600 text-white font-bold";
  if (c === "medium") return "bg-yellow-500 text-white font-bold";
  if (c === "low" || c === "no water" || c === "good")
    return "bg-green-600 text-white font-bold";
  return "bg-gray-500 text-white font-bold";
}

function displayCategoryLabel(category) {
  const c = (category || "").toLowerCase();
  if (c === "high" || c === "alert") return "High";
  if (c === "medium") return "Medium";
  if (c === "low") return "Low";
  if (c === "no water") return "Low";
  if (c === "no data" || c === "nodata") return "No Data";
  return category || "Unknown";
}

function deviceConditionBadgeClass(cond) {
  const c = (cond || "").toLowerCase();
  if (
    c.includes("bad") ||
    c.includes("broken") ||
    c.includes("offline") ||
    c.includes("unavailable") ||
    c.includes("unknown")
  )
    return "text-red-600 font-semibold";
  if (
    c.includes("maintenance") ||
    c.includes("poor") ||
    c.includes("degraded") ||
    c.includes("issue") ||
    c.includes("warning") ||
    c.includes("moderate")
  )
    return "text-yellow-500 font-semibold";
  return "text-green-600 font-semibold";
}

function objectToRows(features) {
  return features.map((f, idx) => {
    const p = f.properties || {};
    const readingObj = p.Reading || {};
    const dates = Object.keys(readingObj || {});
    let latestDate = null;
    let latestVal = null;
    if (dates.length) {
      latestDate = dates.sort()[dates.length - 1];
      latestVal = readingObj[latestDate];
    }

    return {
      device_id: p.Device_ID || p.Station_ID || `ID-${idx + 1}`,
      no: idx + 1,
      station: p.AWLR_Name || p.Station || `Station ${idx + 1}`,
      city: p.Kota || p.Provinsi || "",
      kelurahan: p.Kelurahan || "",
      kecamatan: p.Kecamatan || "",
      catchment: p.Catchment_Name || p.Catchment || "",
      device: p.Device_Condition || p.Station_Condition || "Unknown",
      // preserve the raw reading key (may include time) so datetime filtering can work
      timestamp: latestDate || "",
      reading: latestVal != null ? `${latestVal} m` : "",
      readingValue: latestVal,
      category: categoryFromReading(latestVal),
    };
  });
}

export default function WaterLevelData() {
  const [features, setFeatures] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedDeviceSeries, setSelectedDeviceSeries] = useState({
    labels: [],
    values: [],
  });
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [vizMode, setVizMode] = useState("normal"); // 'normal' or 'mdpl'

  // plugin draws Red/Yellow/Green horizontal bands behind the chart
  const rygBackground = useMemo(() => {
    return {
      id: "rygBackground",
      beforeDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea) return;
        const { left, right } = chartArea;
        const yScale = scales.y;
        if (!yScale) return;

        const bands = [
          // bottom: green 20-40
          { from: 20, to: 40, color: "rgba(16,185,129,0.12)" },
          // middle: yellow 40-60
          { from: 40, to: 60, color: "rgba(245,158,11,0.12)" },
          // top: red 60-80
          { from: 60, to: 80, color: "rgba(239,68,68,0.12)" },
        ];

        bands.forEach((b) => {
          const y1 = yScale.getPixelForValue(b.from);
          const y2 = yScale.getPixelForValue(b.to);
          const top = Math.min(y1, y2);
          const height = Math.abs(y2 - y1);
          ctx.save();
          ctx.fillStyle = b.color;
          ctx.fillRect(left, top, right - left, height);
          ctx.restore();
        });
      },
    };
  }, []);

  useEffect(() => {
    fetch(
      "/data/Automatic_Water_Level_Recorder_(AWLR)_with_Data-_Jakarta.geojson"
    )
      .then((r) => r.json())
      .then((j) => setFeatures(j.features || []))
      .catch((e) => console.error("Failed to load AWLR geojson", e));
  }, []);

  // read query params (device_id or station) and auto-select when features load
  useEffect(() => {
    if (!location || !location.search) return;
    const params = new URLSearchParams(location.search);
    const qDevice = params.get("device_id");
    const qStation = params.get("station");
    const qStartDate = params.get("startDate");
    const qStartTime = params.get("startTime");
    const qEndDate = params.get("endDate");
    const qEndTime = params.get("endTime");

    if (qStation && features && features.length) {
      const found = features.find((f, idx) => {
        const p = f.properties || {};
        const stationName = p.AWLR_Name || p.Station || `Station ${idx + 1}`;
        return stationName === qStation;
      });
      if (found) setSelectedStation(qStation);
    }

    if (qDevice && features && features.length) {
      const found = features.find((f, idx) => {
        const p = f.properties || {};
        const id = p.Device_ID || p.Station_ID || `ID-${idx + 1}`;
        return String(id) === String(qDevice);
      });
      if (found) {
        const p = found.properties || {};
        const stationName = p.AWLR_Name || p.Station || "";
        if (stationName) setSelectedStation(stationName);
        setSelectedDeviceId(qDevice);
        setTimeout(() => handleSelectDevice(qDevice), 50);
      }
    }
    // populate date/time filters if present
    if (qStartDate) setStartDate(qStartDate);
    if (qStartTime) setStartTime(qStartTime);
    if (qEndDate) setEndDate(qEndDate);
    if (qEndTime) setEndTime(qEndTime);
  }, [location, features]);

  const rows = useMemo(() => objectToRows(features), [features]);

  const stationOptions = useMemo(() => {
    const names = rows.map((r) => r.station || "");
    return Array.from(new Set(names)).filter(Boolean);
  }, [rows]);

  // Pagination constants
  const rowsPerPage = 5;

  const visibleRows = useMemo(() => {
    let rs = rows;
    if (selectedStation) rs = rs.filter((r) => r.station === selectedStation);
    // Apply datetime range filter if provided
    if (startDate || startTime || endDate || endTime) {
      // build start/end ISO strings when possible
      const startISO = startDate
        ? startTime
          ? `${startDate}T${startTime}`
          : `${startDate}T00:00:00`
        : null;
      const endISO = endDate
        ? endTime
          ? `${endDate}T${endTime}`
          : `${endDate}T23:59:59`
        : null;

      const startTs = startISO ? Date.parse(startISO) : null;
      const endTs = endISO ? Date.parse(endISO) : null;

      rs = rs.filter((r) => {
        if (!r.timestamp) return false;
        const ts = Date.parse(r.timestamp);
        if (isNaN(ts)) {
          // try parsing date-only form
          const t2 = Date.parse(r.timestamp.split("T")[0]);
          if (isNaN(t2)) return false;
          if (startTs && t2 < startTs) return false;
          if (endTs && t2 > endTs) return false;
          return true;
        }
        if (startTs && ts < startTs) return false;
        if (endTs && ts > endTs) return false;
        return true;
      });
    }
    return rs;
  }, [rows, selectedStation]);

  // Calculate paginated data
  const totalPages = Math.ceil(visibleRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return visibleRows.slice(startIndex, startIndex + rowsPerPage);
  }, [visibleRows, currentPage, rowsPerPage]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStation, startDate, startTime, endDate, endTime]);

  const selectedStationData = useMemo(() => {
    if (!selectedStation) return null;
    return rows.find((r) => r.station === selectedStation) || null;
  }, [rows, selectedStation]);

  const stationMetrics = useMemo(() => {
    if (!selectedStation) return null;
    const devices = (features || []).filter((f, idx) => {
      const p = f.properties || {};
      const stationName = p.AWLR_Name || p.Station || `Station ${idx + 1}`;
      return stationName === selectedStation;
    });
    const deviceCount = devices.length;
    let devicesWithData = 0;
    const buckets = {};
    devices.forEach((f) => {
      const p = f.properties || {};
      const reading = p.Reading || {};
      const keys = Object.keys(reading || {});
      if (keys.length) devicesWithData++;
      keys.forEach((raw) => {
        const dateKey = (raw || "").split("T")[0];
        const v = reading[raw];
        if (v == null) return;
        if (!buckets[dateKey]) buckets[dateKey] = [];
        buckets[dateKey].push(Number(v));
      });
    });

    const dateKeys = Object.keys(buckets).sort((a, b) => {
      const ta = Date.parse(a);
      const tb = Date.parse(b);
      if (isNaN(ta) || isNaN(tb)) return a.localeCompare(b);
      return ta - tb;
    });

    const aggregated = dateKeys.map((d) => {
      const arr = buckets[d] || [];
      const sum = arr.reduce((s, x) => s + x, 0);
      const avg = arr.length ? sum / arr.length : 0;
      return { date: d, value: Number(avg.toFixed(2)) };
    });

    const last6 = aggregated.slice(-6);

    const completionPercent = deviceCount
      ? Math.round((devicesWithData / deviceCount) * 100)
      : 0;
    const avgRecorded = last6.length
      ? Number(
          (last6.reduce((s, x) => s + x.value, 0) / last6.length).toFixed(2)
        )
      : 0;
    const highAlertCount = last6.reduce(
      (c, x) => c + (x.value >= 5 ? 1 : 0),
      0
    );
    const lastHigh =
      [...aggregated].reverse().find((x) => x.value >= 5) || null;

    return {
      deviceCount,
      devicesWithData,
      completionPercent,
      avgRecorded,
      last6,
      highAlertCount,
      lastHighAlertDate: lastHigh ? lastHigh.date : null,
      lastHighValue: lastHigh ? lastHigh.value : null,
    };
  }, [features, selectedStation]);

  // NOTE: removed automatic limiting to last6 here. The full aggregated
  // series is computed when a station is selected (below) and the chart
  // will receive the full series but initialized to show the last 6 points
  // by providing `view: { min, max }` in the series object.

  function formatWeekday(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString(undefined, { weekday: "long" });
  }

  function formatDateDDMMYYYY(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  const deviceSeriesMap = useMemo(() => {
    const m = {};
    (features || []).forEach((f, idx) => {
      const p = f.properties || {};
      const id = p.Device_ID || p.Station_ID || `ID-${idx + 1}`;
      m[id] = p.Reading || {};
    });
    return m;
  }, [features]);

  function handleSelectDevice(id) {
    setSelectedDeviceId(id);
    const readingObj = deviceSeriesMap[id] || {};
    const dates = Object.keys(readingObj || {}).sort((a, b) => {
      const ta = Date.parse(a);
      const tb = Date.parse(b);
      if (isNaN(ta) || isNaN(tb)) return a.localeCompare(b);
      return ta - tb;
    });
    if (!dates.length) {
      setSelectedDeviceSeries({ labels: [], values: [] });
      return;
    }
    // full labels/values
    const labels = dates;
    const values = dates.map((d) =>
      readingObj[d] != null ? Number(readingObj[d]) : NaN
    );

    // build date filter range from UI inputs
    const startISO = startDate
      ? startTime
        ? `${startDate}T${startTime}`
        : `${startDate}T00:00:00`
      : null;
    const endISO = endDate
      ? endTime
        ? `${endDate}T${endTime}`
        : `${endDate}T23:59:59`
      : null;
    const startTs = startISO ? Date.parse(startISO) : null;
    const endTs = endISO ? Date.parse(endISO) : null;

    let minIdx = Math.max(0, labels.length - 6);
    let maxIdx = Math.max(0, labels.length - 1);
    if (startTs || endTs) {
      // find first/last indices matching the filter range
      const parsed = labels.map((d) => {
        const t = Date.parse(d);
        if (!isNaN(t)) return t;
        const t2 = Date.parse((d || "").split("T")[0]);
        return isNaN(t2) ? null : t2;
      });
      const first = parsed.findIndex(
        (t) => t != null && (startTs ? t >= startTs : true)
      );
      const last = parsed
        .map((t, i) => ({ t, i }))
        .reverse()
        .find((o) => o.t != null && (endTs ? o.t <= endTs : true));
      if (first !== -1 && last && last.i != null) {
        minIdx = first;
        maxIdx = last.i;
      }
    }

    setSelectedDeviceSeries({
      labels,
      values,
      view: { min: minIdx, max: maxIdx },
    });
  }

  useEffect(() => {
    if (!selectedStation) {
      setSelectedDeviceSeries({ labels: [], values: [] });
      setSelectedDeviceId("");
      return;
    }
    const buckets = {};
    (features || []).forEach((f, idx) => {
      const p = f.properties || {};
      const stationName = p.AWLR_Name || p.Station || `Station ${idx + 1}`;
      if (stationName !== selectedStation) return;
      const reading = p.Reading || {};
      Object.keys(reading || {}).forEach((d) => {
        const v = reading[d];
        if (v == null) return;
        if (!buckets[d]) buckets[d] = [];
        buckets[d].push(Number(v));
      });
    });

    const dates = Object.keys(buckets).sort((a, b) => {
      const ta = Date.parse(a);
      const tb = Date.parse(b);
      if (isNaN(ta) || isNaN(tb)) return a.localeCompare(b);
      return ta - tb;
    });
    if (!dates.length) {
      setSelectedDeviceSeries({ labels: [], values: [] });
      setSelectedDeviceId("");
      return;
    }

    const aggregated = dates.map((d) => {
      const arr = buckets[d] || [];
      const sum = arr.reduce((s, x) => s + x, 0);
      const avg = arr.length ? sum / arr.length : 0;
      return { date: d, value: Number(avg.toFixed(2)) };
    });

    // build full labels/values arrays (not limited to 6)
    const labels = aggregated.map((x) => x.date);
    const values = aggregated.map((x) => x.value);

    // default view: last 6 points
    let minIdx = Math.max(0, labels.length - 6);
    let maxIdx = Math.max(0, labels.length - 1);

    // build date filter range from UI inputs
    const startISO = startDate
      ? startTime
        ? `${startDate}T${startTime}`
        : `${startDate}T00:00:00`
      : null;
    const endISO = endDate
      ? endTime
        ? `${endDate}T${endTime}`
        : `${endDate}T23:59:59`
      : null;
    const startTs = startISO ? Date.parse(startISO) : null;
    const endTs = endISO ? Date.parse(endISO) : null;
    if (startTs || endTs) {
      const parsed = labels.map((d) => {
        const t = Date.parse(d);
        if (!isNaN(t)) return t;
        const t2 = Date.parse((d || "").split("T")[0]);
        return isNaN(t2) ? null : t2;
      });
      const first = parsed.findIndex(
        (t) => t != null && (startTs ? t >= startTs : true)
      );
      const lastObj = parsed
        .map((t, i) => ({ t, i }))
        .reverse()
        .find((o) => o.t != null && (endTs ? o.t <= endTs : true));
      if (first !== -1 && lastObj && lastObj.i != null) {
        minIdx = first;
        maxIdx = lastObj.i;
      }
    }

    setSelectedDeviceId(selectedStation);
    setSelectedDeviceSeries({
      labels,
      values,
      view: { min: minIdx, max: maxIdx },
    });
  }, [selectedStation, features, startDate, startTime, endDate, endTime]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    if (!selectedDeviceSeries || !selectedDeviceSeries.labels.length) return;

    const ctx = chartRef.current.getContext("2d");

    // use shared rygBackground plugin (defined with useMemo)

    // compute data-driven min/max so small values are visible
    const values = selectedDeviceSeries.values || [];
    const dataMin = values.length
      ? Math.min(...values.filter((v) => !Number.isNaN(v)))
      : 0;
    const dataMax = values.length
      ? Math.max(...values.filter((v) => !Number.isNaN(v)))
      : 0;
    // Fix y-axis to meters: max 2.0 meters and step of 0.25m. Keep min at 0.
    const yMin = 0;
    const yMax = 2.0;
    const view = selectedDeviceSeries.view;

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: selectedDeviceSeries.labels,
        datasets: [
          {
            label: vizMode === "mdpl" ? "MDPL" : "Level (m)",
            data: selectedDeviceSeries.values,
            borderColor: "#0ea5a4",
            backgroundColor: "rgba(14,165,164,0.08)",
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: selectedDeviceSeries.values.map((v) =>
              v >= yMax * 0.75
                ? "#ef4444"
                : v >= yMax * 0.5
                ? "#f59e0b"
                : "#10b981"
            ),
            fill: false,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: "Date" },
            ticks: { autoSkip: true },
            min: view ? view.min : undefined,
            max: view ? view.max : undefined,
          },
          y: {
            min: yMin,
            max: yMax,
            ticks: {
              // show ticks every 0.25 meters
              stepSize: 0.25,
            },
            title: { display: true, text: "Level (m)" },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              wheel: { enabled: true, mode: "x" },
              pinch: { enabled: true },
              mode: "x",
            },
          },
        },
      },
      plugins: [rygBackground],
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [selectedDeviceSeries]);

  // update chart label immediately when visualization mode changes
  useEffect(() => {
    if (!chartRef.current || !selectedDeviceSeries.labels.length) return;

    // Destroy and recreate the chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Recreate the chart with the same code as the main chart creation useEffect
    const values = selectedDeviceSeries.values || [];
    const dataMin = values.length
      ? Math.min(...values.filter((v) => !Number.isNaN(v)))
      : 0;
    const dataMax = values.length
      ? Math.max(...values.filter((v) => !Number.isNaN(v)))
      : 0;
    const yMin = 0;
    const yMax = 2.0;
    const view = selectedDeviceSeries.view;

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: selectedDeviceSeries.labels,
        datasets: [
          {
            label: vizMode === "mdpl" ? "MDPL" : "Level (m)",
            data: selectedDeviceSeries.values,
            borderColor: "#0ea5a4",
            backgroundColor: "rgba(14,165,164,0.08)",
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: selectedDeviceSeries.values.map((v) =>
              v >= yMax * 0.75
                ? "#ef4444"
                : v >= yMax * 0.5
                ? "#f59e0b"
                : "#10b981"
            ),
            fill: false,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: "Date" },
            ticks: { autoSkip: true },
            min: view ? view.min : undefined,
            max: view ? view.max : undefined,
          },
          y: {
            min: yMin,
            max: yMax,
            ticks: {
              stepSize: 0.25,
            },
            title: {
              display: true,
              text: vizMode === "mdpl" ? "MDPL" : "Level (m)",
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              wheel: { enabled: true, mode: "x" },
              pinch: { enabled: true },
              mode: "x",
            },
          },
        },
      },
      plugins: [rygBackground],
    });
  }, [vizMode, selectedDeviceSeries]);

  function downloadCSV() {
    const header = [
      "No",
      "Water Station",
      "City",
      "Kelurahan",
      "Kecamatan",
      "Catchment Name",
      "Device Condition",
      "Timestamp",
      "Reading",
      "Category",
    ];
    const lines = [header.join(",")];
    // export only the current page
    paginatedRows.forEach((r) => {
      const row = [
        r.no,
        `"${r.station.replace(/"/g, '""')}"`,
        `"${(r.city || "").replace(/"/g, '""')}"`,
        `"${(r.kelurahan || "").replace(/"/g, '""')}"`,
        `"${(r.kecamatan || "").replace(/"/g, '""')}"`,
        `"${(r.catchment || "").replace(/"/g, '""')}"`,
        `"${(r.device || "").replace(/"/g, '""')}"`,
        `"${(r.timestamp || "").replace(/"/g, '""')}"`,
        r.reading || "",
        r.category || "",
      ];
      lines.push(row.join(","));
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "awlr_water_data.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Pagination handlers
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/assets/logos/Water Level Data Icon.svg"
          alt="water"
          className="w-12 h-12"
          style={{ filter: "invert(0.6)" }}
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#636059]">
            Water Level Data
          </h1>
          <p className="text-sm text-[#636059]">
            Water Level profiles and related data
          </p>
        </div>
      </div>

      <div className="mb-2 text-xl font-semibold text-[#636059]">
        Filter Automatic Water Level Recorder (AWLR) Data
      </div>
      <div className="flex flex-wrap gap-3 mb-2 items-center">
        <select
          className="px-3 py-[6px] rounded-xl border"
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
        >
          <option value="">Select AWLR Station</option>
          {stationOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="px-2 py-1 border rounded-xl"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="time"
            className="px-2 py-1 border rounded-xl"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-[#636059]">To</div>
          <input
            type="date"
            className="px-2 py-1 border rounded-xl"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <input
            type="time"
            className="px-2 py-1 border rounded-xl"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-2 text-lg font-semibold text-[#636059]">
        Automatic Water Level Recorder (AWLR) Data
      </div>

      <div className="  p-2 mb-2">
        <div className="max-h-62 overflow-auto">
          <table className="w-full text-left text-sm table-fixed border-collapse">
            <thead>
              <tr className="text-xs text-[#636059]">
                <th className="pr-2 w-16 sticky top-0 border-r py-2 truncate">
                  Device Id
                </th>
                <th className="w-36 sticky top-0 border-r py-2 px-2 truncate">
                  Water Station
                </th>
                <th className="w-20 sticky top-0  border-r py-2 px-2 truncate">
                  City
                </th>
                <th className="w-20 sticky top-0  border-r py-2 px-2 truncate">
                  Kelurahan
                </th>
                <th className="w-20 sticky top-0  border-r py-2 px-2 truncate">
                  Kecamatan
                </th>
                <th className="w-28 sticky top-0  border-r py-2 px-2 truncate">
                  Catchment
                </th>
                <th className="w-28 sticky top-0  border-r py-2 px-2 truncate">
                  Device Condition
                </th>
                <th className="w-28 sticky top-0  border-r py-2 px-2 truncate">
                  Timestamp
                </th>
                <th className="w-20 sticky top-0  border-r py-2 px-2 truncate">
                  Reading
                </th>
                <th className="w-28 sticky top-0  text-center py-2 truncate">
                  Alert Threshold
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-4 text-center text-sm text-[#a49e92]"
                  >
                    No data loaded yet.
                  </td>
                </tr>
              )}
              {paginatedRows.map((r) => (
                <tr key={r.no}>
                  <td className="pr-2 py-2 border-r truncate text-sm">
                    {r.device_id}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.station}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.city}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.kelurahan}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.kecamatan}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.catchment}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    <span
                      className={`block truncate text-sm ${deviceConditionBadgeClass(
                        r.device
                      )}`}
                      title={r.device}
                    >
                      {r.device}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.timestamp}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.reading}
                  </td>
                  <td className="py-2 w-full">
                    <span
                      className={`block w-1/2 mx-auto text-center px-2 py-1 rounded-lg text-xs font-semibold ${categoryBadgeClass(
                        r.category
                      )}`}
                    >
                      {displayCategoryLabel(r.category)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={downloadCSV}
            className="px-3 py-2 rounded-xl bg-[#636059] text-white"
          >
            Download Data
          </button>
          {visibleRows.length > rowsPerPage && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#636059] text-white"
                }`}
              >
                Previous
              </button>

              <span className="text-sm text-[#636059]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#636059] text-white"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
        <div className="mt-3 border-t border-gray-200" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:flex-[3] flex-1 rounded-lg p-2 h-56 max-w-full lg:max-w-2xl">
          <div className="w-full h-full rounded-2xl p-2">
            {selectedDeviceId ? (
              <>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-lg font-bold text-[#636059]">
                    Data Visualization
                  </div>
                  {/* MDPL toggle on the right side */}
                </div>
                <div className="font-bold text-[#636059] mb-2 text-sm">
                  Real-time water level data over time (Hydrograph) from
                  station, located in keluarahan, kecamatan, Kota.
                </div>
                <div className="h-[calc(100%)]">
                  <canvas
                    ref={chartRef}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                <div className="flex flex-row justify-between">
                  {/* Legend container below the chart */}
                  <div className="mt-3 flex items-center gap-3 justify-start">
                    <div className="px-3 py-1 rounded-xl bg-green-600 text-white text-sm font-semibold">
                      Low
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-yellow-500 text-white text-sm font-semibold">
                      Medium
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-red-600 text-white text-sm font-semibold">
                      High
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#636059]">Meter</label>
                    <button
                      className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors ${
                        vizMode === "mdpl" ? "bg-[#636059]" : "bg-gray-300"
                      }`}
                      onClick={() =>
                        setVizMode((m) => (m === "mdpl" ? "normal" : "mdpl"))
                      }
                      aria-pressed={vizMode === "mdpl"}
                      title="Toggle MDPL mode"
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                          vizMode === "mdpl" ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <label className="text-sm text-[#636059]">MDPL</label>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-2xl flex items-center justify-center text-[#a49e92]">
                Select a Station from the dropdown to view the last 6 readings
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block w-px bg-gray-200 self-stretch" />

        <div className="w-[40rem] p-2">
          <div className="text-lg font-bold text-[#636059] mb-1 px-2">
            Summary
          </div>
          <div className="rounded-xl px-2 py-1 flex items-center justify-center text-2xl font-bold text-[#636059] mb-2">
            <div className="text-sm">
              {selectedStationData ? (
                <>
                  This is the summary for the Automatic Water Level Recorder
                  (AWLR) Station in the {selectedStationData.station},{" "}
                  {selectedStationData.city} {selectedStationData.kecamatan}
                </>
              ) : (
                <div>Select a station to see the summary</div>
              )}
            </div>
          </div>
          {stationMetrics && (
            <div className="flex gap-2">
              <div className="flex-1rounded-xl p-2">
                <div className="text-md font-bold text-[#636059]">
                  Recording Data
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059]">
                    Data
                    <br />
                    Completion
                  </div>
                  <div className="text-4xl font-bold text-[#636059] mt-3">
                    {stationMetrics.completionPercent + "%"}
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-200">
                  <div className="text-md font-bold text-[#636059] mt-4">
                    Threshold and Alert in Past 6
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059]">
                    High
                    <br />
                    Risk Alert
                  </div>
                  <div className="text-4xl font-bold text-[#636059] mt-3">
                    {stationMetrics.highAlertCount}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block w-px bg-gray-200 self-stretch z-50" />

              <div className="flex-1 rounded-xl p-2">
                <div className="text-md font-bold text-[#636059]">
                  Average Recorded Data
                </div>
                <div className="flex items-end gap-3 mt-2">
                  <div className="text-md  text-[#636059]">Average (m)</div>
                  <div className="text-4xl items-center font-bold text-[#636059] mt-3">
                    {stationMetrics.avgRecorded}
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-200" />
                <div className="text-md font-bold text-[#636059] mt-4">
                  Last High Alert Date
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059] flex flex-col">
                    <div className="font-semibold">
                      {formatWeekday(stationMetrics.lastHighAlertDate)}
                    </div>
                    <div className="text-sm">
                      {formatDateDDMMYYYY(stationMetrics.lastHighAlertDate)}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-[#636059] mt-3">
                    {stationMetrics.lastHighValue != null
                      ? stationMetrics.lastHighValue + " m"
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
