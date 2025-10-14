import React, { useEffect, useMemo, useState, useRef } from "react";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

function categoryFromReading(mm) {
  // simple thresholding: >50 Heavy, 20-50 Moderate, 0-20 Light, 0 Missing
  if (mm == null) return "No Data";
  if (mm >= 50) return "Heavy";
  if (mm >= 20) return "Moderate";
  if (mm > 0) return "Light";
  return "No Rain";
}

function categoryBadgeClass(category) {
  const c = (category || "").toLowerCase();
  if (c === "heavy" || c === "alert") return "bg-red-600 text-white font-bold";
  if (c === "moderate") return "bg-yellow-500 text-white font-bold";
  if (c === "light" || c === "no rain" || c === "good")
    return "bg-green-600 text-white font-bold";
  return "bg-gray-500 text-white font-bold";
}

function displayCategoryLabel(category) {
  const c = (category || "").toLowerCase();
  if (c === "heavy" || c === "alert") return "High";
  if (c === "moderate") return "Medium";
  if (c === "light") return "Low";
  if (c === "no rain") return "Low";
  if (c === "no data" || c === "nodata") return "No Data";
  return category || "Unknown";
}

// map device condition string to badge class (red/yellow/green)
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
  // default good/ok
  return "text-green-600 font-semibold";
}

function objectToRows(features) {
  // Map each feature to a station-level row: choose latest (max) date key from Reading
  return features.map((f, idx) => {
    const p = f.properties || {};
    const readingObj = p.Reading || {};
    // readingObj keys are dates like '2020-01-01'
    const dates = Object.keys(readingObj || {});
    let latestDate = null;
    let latestVal = null;
    if (dates.length) {
      // sort lexicographically (ISO date strings) and pick last
      latestDate = dates.sort()[dates.length - 1];
      latestVal = readingObj[latestDate];
    }

    return {
      device_id: p.Device_ID || p.Station_ID || `ID-${idx + 1}`,
      no: idx + 1,
      station: p.ARR_Name || p.Station || `Station ${idx + 1}`,
      city: p.Kota || p.Provinsi || "",
      kelurahan: p.Kelurahan || "",
      kecamatan: p.Kecamatan || "",
      catchment: p.Catchment_Name || p.Catchment || "",
      device: p.Device_Condition || p.Station_Condition || "Unknown",
      timestamp: latestDate ? `${latestDate} 00:00` : "",
      reading: latestVal != null ? `${latestVal} mm` : "",
      readingValue: latestVal,
      category: categoryFromReading(latestVal),
    };
  });
}

export default function RainLevelData() {
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
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    fetch("/data/Automatic_Rain_Recorder_(ARR)_with_Data-_Jakarta.geojson")
      .then((r) => r.json())
      .then((j) => {
        setFeatures(j.features || []);
      })
      .catch((e) => {
        console.error("Failed to load ARR geojson", e);
      });
  }, []);

  const rows = useMemo(() => objectToRows(features), [features]);

  const stationOptions = useMemo(() => {
    // unique station names for dropdown
    const names = rows.map((r) => r.station || "");
    return Array.from(new Set(names)).filter(Boolean);
  }, [rows]);

  const visibleRows = useMemo(() => {
    let rs = rows;
    if (selectedStation) rs = rs.filter((r) => r.station === selectedStation);
    // Apply datetime range filter if provided (matches water-level-data behavior)
    if (startDate || startTime || endDate || endTime) {
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

    return rs.slice(0, 1000);
  }, [rows, selectedStation, startDate, startTime, endDate, endTime]);

  // data for selected station (first matching row)
  const selectedStationData = useMemo(() => {
    if (!selectedStation) return null;
    return rows.find((r) => r.station === selectedStation) || null;
  }, [rows, selectedStation]);

  // compute station-level metrics and last 6 aggregated datapoints
  const stationMetrics = useMemo(() => {
    if (!selectedStation) return null;
    const devices = (features || []).filter((f, idx) => {
      const p = f.properties || {};
      const stationName = p.ARR_Name || p.Station || `Station ${idx + 1}`;
      return stationName === selectedStation;
    });
    const deviceCount = devices.length;
    let devicesWithData = 0;
    const buckets = {}; // dateKey -> array of values
    devices.forEach((f) => {
      const p = f.properties || {};
      const reading = p.Reading || {};
      const keys = Object.keys(reading || {});
      if (keys.length) devicesWithData++;
      keys.forEach((raw) => {
        // normalize to date-only (strip time) if present
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

    // metrics
    const completionPercent = deviceCount
      ? Math.round((devicesWithData / deviceCount) * 100)
      : 0;
    const avgRecorded = last6.length
      ? Number(
          (last6.reduce((s, x) => s + x.value, 0) / last6.length).toFixed(2)
        )
      : 0;
    const highAlertCount = last6.reduce(
      (c, x) => c + (x.value >= 50 ? 1 : 0),
      0
    );
    // find last date in aggregated with value >=50
    const lastHigh =
      [...aggregated].reverse().find((x) => x.value >= 50) || null;

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

  // when stationMetrics change, update selectedDeviceSeries so chart refreshes
  // NOTE: removed limiting to last6 here. The full aggregated series is
  // computed when a station is selected (below) and the chart will receive
  // the full series but initialized to show the last 6 points by default.

  function formatAlertDate(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    const weekday = dt.toLocaleDateString(undefined, { weekday: "long" });
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${weekday}, ${dd}-${mm}-${yyyy}`;
  }

  // return weekday name (e.g., Monday)
  function formatWeekday(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString(undefined, { weekday: "long" });
  }

  // return dd-mm-yyyy (e.g., 02-10-2025)
  function formatDateDDMMYYYY(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // create a map device_id -> reading object {date: value}
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

    setSelectedDeviceSeries({
      labels,
      values,
      view: { min: minIdx, max: maxIdx },
    });
  }

  // when a station is selected from dropdown, compute latest reading across its devices
  useEffect(() => {
    if (!selectedStation) {
      // clear selection
      setSelectedDeviceSeries({ labels: [], values: [] });
      // keep selectedDeviceId empty so header shows prompt
      setSelectedDeviceId("");
      return;
    }
    // Aggregate readings per date across all devices for this station.
    const buckets = {}; // date -> array of values
    (features || []).forEach((f, idx) => {
      const p = f.properties || {};
      const stationName = p.ARR_Name || p.Station || `Station ${idx + 1}`;
      if (stationName !== selectedStation) return;
      const reading = p.Reading || {};
      Object.keys(reading || {}).forEach((d) => {
        const v = reading[d];
        if (v == null) return;
        if (!buckets[d]) buckets[d] = [];
        buckets[d].push(Number(v));
      });
    });

    // sort by real time value (numeric) to avoid lexicographic issues and
    // produce the full aggregated series for the station (not only last6).
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

    // compute aggregated value per date (average)
    const aggregated = dates.map((d) => {
      const arr = buckets[d] || [];
      const sum = arr.reduce((s, x) => s + x, 0);
      const avg = arr.length ? sum / arr.length : 0;
      return { date: d, value: Number(avg.toFixed(2)) };
    });

    // build full labels/values arrays
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

  // render horizontal (inverted) bar chart when selectedDeviceSeries changes
  useEffect(() => {
    if (!chartRef.current) return;
    // destroy existing chart if present
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    if (!selectedDeviceSeries || !selectedDeviceSeries.labels.length) return;

    const ctx = chartRef.current.getContext("2d");
    const view = selectedDeviceSeries.view;
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: selectedDeviceSeries.labels,
        datasets: [
          {
            label: "Rain (mm)",
            data: selectedDeviceSeries.values,
            backgroundColor: selectedDeviceSeries.values.map((v) =>
              v >= 50 ? "#ef4444" : v >= 20 ? "#f59e0b" : "#10b981"
            ),
            borderRadius: 6,
            // tune bar sizing: make bars nearly adjacent by widening bars and removing gaps
            // set percentages to 1.0 and increase max thickness so bars touch or nearly touch
            maxBarThickness: 22,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
          },
        ],
      },
      options: {
        // vertical bars (default) but invert y-axis so larger values are toward the top
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: "Timestamp" },
            // if view is provided, set min/max as category indices so the
            // chart initially zooms to the last 6 datapoints
            min: view ? view.min : undefined,
            max: view ? view.max : undefined,
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Rain (mm)" },
            reverse: true, // invert axis so higher values appear at top
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
          zoom: {
            pan: { enabled: true, mode: "x" },
            zoom: {
              wheel: { enabled: true, mode: "x" },
              pinch: { enabled: true },
              mode: "x",
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [selectedDeviceSeries]);

  function downloadCSV() {
    const header = [
      "No",
      "Rain Station",
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
    visibleRows.forEach((r) => {
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
    a.download = "arr_rain_data.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full z-10">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/assets/logos/Rain Level Data Icon.svg"
          alt="rain"
          className="w-12 h-12"
          style={{ filter: "invert(0.6)" }}
        />
        <h1 className="text-2xl font-semibold text-[#636059]">
          Rain Level Data
        </h1>
      </div>
      {/* <hr className="w-full mb-4 " /> */}
      {/* Filter row */}
      <div className="mb-2 text-xl font-semibold text-[#636059]">
        Filter Automatic Rain Recorder (ARR) Data
      </div>
      <div className="flex flex-wrap gap-3 mb-2 items-center">
        <select
          className="px-3 py-2 rounded-xl bg-white border"
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
        >
          <option value="">Select ARR Station</option>
          {stationOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="px-3 py-2 rounded-xl bg-white border"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="time"
          className="px-3 py-2 rounded-xl bg-white border"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <span>to</span>
        <input
          type="date"
          className="px-3 py-2 rounded-xl bg-white border"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <input
          type="time"
          className="px-3 py-2 rounded-xl bg-white border"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {/* Table section */}
      <div className="  p-2 mb-2">
        {/* use table-fixed and remove horizontal scrolling; allow vertical scroll */}
        <div className="max-h-62 overflow-auto">
          <table className="w-full text-left text-sm table-fixed border-collapse">
            <thead>
              <tr className="text-xs text-[#636059]">
                <th className="pr-2 w-16 sticky top-0 bg-white border-r py-2 truncate">
                  Device Id
                </th>
                <th className="w-36 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Rain Station
                </th>
                <th className="w-20 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  City
                </th>
                <th className="w-20 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Kelurahan
                </th>
                <th className="w-20 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Kecamatan
                </th>
                <th className="w-28 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Catchment
                </th>
                <th className="w-28 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Device Condition
                </th>
                <th className="w-28 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Timestamp
                </th>
                <th className="w-20 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Reading
                </th>
                <th className="w-28 sticky top-0 bg-white text-center py-2 truncate">
                  Alert Threshold
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-4 text-center text-sm text-[#a49e92]"
                  >
                    No data loaded yet.
                  </td>
                </tr>
              )}
              {visibleRows.map((r) => (
                <tr key={r.no} className="">
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
                      className={`block w-1/2 mx-auto text-center px-2 py-1 rounded-xl text-xs font-semibold ${categoryBadgeClass(
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

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="px-3 py-2 rounded-xl bg-[#636059] text-white"
          >
            Download Data
          </button>
        </div>
        {/* horizontal divider below the download button */}
        <div className="mt-3 border-t border-gray-200" />
      </div>

      {/* Graph + Summary */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:flex-[3] flex-1 rounded-lg  p-2 h-56 max-w-full lg:max-w-2xl">
          <div className="w-full h-full rounded-2xl p-2">
            {selectedDeviceId ? (
              <>
                <div className="text-lg font-bold text-[#636059] mb-1">
                  Data Visualization
                </div>
                <div className="font-bold text-[#636059] mb-2 text-sm">
                  Real-time precipitation data over time (Hytograph) from
                  station, located in Kelurahan, Kecamatan, Kota.
                </div>
                <div className="h-[calc(100%)]">
                  <canvas
                    ref={chartRef}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                {/* Legend container below the chart */}
                <div className="mt-3 flex items-center gap-3 justify-start">
                  <div className="px-3 py-1 rounded-full bg-green-600 text-white text-sm font-semibold">
                    Low
                  </div>
                  <div className="px-3 py-1 rounded-full bg-yellow-500 text-white text-sm font-semibold">
                    Medium
                  </div>
                  <div className="px-3 py-1 rounded-full bg-red-600 text-white text-sm font-semibold">
                    High
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
        <div className="hidden lg:block w-px bg-gray-200 self-stretch z-50" />

        <div className="w-[40rem] p-2">
          <div className="text-lg font-bold text-[#636059] mb-1 px-2">
            Summary
          </div>
          <div className="rounded-xl px-2 py-1 flex items-center justify-center text-2xl font-bold text-[#636059] mb-2">
            <div className="text-sm">
              {selectedStationData ? (
                <>
                  This is the summary for the Automatic Rain Recorder (ARR)
                  Station in the {selectedStationData.station},{" "}
                  {selectedStationData.city} {selectedStationData.kecamatan}
                </>
              ) : (
                <div>Select a station to see the summary</div>
              )}
            </div>
          </div>
          {stationMetrics && (
            <div className="flex gap-2">
              {/* Left column: Data completion + Alerts */}
              <div className="flex-1 rounded-xl p-2">
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
                <div className="mt-3 border-t border-gray-200" />
                <div className="text-md font-bold text-[#636059] mt-4">
                  Threshold and Alert in Past 6
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
              <div className="hidden lg:block w-px bg-gray-200 self-stretch" />
              {/* Right column: Average + Last high alert value/date (styled like left) */}
              <div className="flex-1  rounded-xl p-2">
                <div className="text-md font-bold text-[#636059]">
                  Average Recorded Data
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059]">
                    Data
                    <br />
                    Completion
                  </div>
                  <div className="text-4xl font-bold text-[#636059] mt-3">
                    {stationMetrics.avgRecorded}mm
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
                      ? stationMetrics.lastHighValue + "mm"
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
