import React, { useEffect, useMemo, useState, useRef } from "react";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

function objectToRows(features) {
  return (features || []).map((f, idx) => {
    const p = f.properties || {};
    const profile = p.Cross_Section_Profile || [];

    // derive fields requested by user; use available property names or fallback
    const measurementType = p.Measurement_Type || p.Topography_Method || "";
    // measurement year may be in Topography_Date (year) or in Model_CalibrationDate
    const measurementYear = p.Topography_Date
      ? String(p.Topography_Date)
      : p.Measurement_Year
      ? String(p.Measurement_Year)
      : "";

    // design flood level not always present; try common names
    const designFloodLevel =
      p.Design_Flood_Level ||
      p.Design_Flood_m ||
      p.Design_Flood ||
      p.Return_Period ||
      "";

    const strahlerOrder = p.Strahler_Order || p.Strahler || "";

    // calibration year: try Model_CalibrationDate (YYYY-mm-dd) or Calibration_Year
    let calibrationYear = "";
    if (p.Model_CalibrationDate) {
      const d = new Date(p.Model_CalibrationDate);
      if (!isNaN(d)) calibrationYear = String(d.getFullYear());
      else calibrationYear = String(p.Model_CalibrationDate).slice(0, 4);
    } else if (p.Calibration_Year) calibrationYear = String(p.Calibration_Year);

    const calibrationMethod = p.Methodology || p.Calibration_Method || "";

    return {
      id: p.Cross_Section_ID || `XS-${idx + 1}`,
      no: idx + 1,
      river: p.River_Name || "",
      crossSectionId: p.Cross_Section_ID || "",
      measurementType,
      measurementYear,
      catchment: p.Catchment_Name || "",
      designFloodLevel,
      strahlerOrder,
      calibrationYear,
      calibrationMethod,
      manager: p.Manager || "",
      simulatedDate: p.Simulated_Date || "",
      simulatedRain: p.Simulated_Rain_mm || null,
      waterDepth: p.Water_Depth_m || null,
      profile,
      rawProperties: p,
    };
  });
}

export default function CrossSectionData() {
  const [features, setFeatures] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [filterMeasurementType, setFilterMeasurementType] = useState("");
  const [filterMeasurementYear, setFilterMeasurementYear] = useState("");
  const [selectedSeries, setSelectedSeries] = useState({
    data: [],
    view: null,
  });
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    fetch("/data/Cross_Section_Sungai_Ciliwung_001_DKI_Jakarta.geojson")
      .then((r) => r.json())
      .then((j) => setFeatures(j.features || []))
      .catch((e) => console.error("Failed to load cross-section geojson", e));
  }, []);

  const rows = useMemo(() => objectToRows(features), [features]);

  // sectionOptions will be derived after filteredRows is declared below

  // compute unique measurement types and years for filter selects
  const measurementTypeOptions = useMemo(() => {
    return Array.from(
      new Set(rows.map((r) => r.measurementType || "").filter(Boolean))
    );
  }, [rows]);

  const measurementYearOptions = useMemo(() => {
    return Array.from(
      new Set(rows.map((r) => r.measurementYear || "").filter(Boolean))
    ).sort();
  }, [rows]);

  // apply measurement filters to rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterMeasurementType && r.measurementType !== filterMeasurementType)
        return false;
      if (filterMeasurementYear && r.measurementYear !== filterMeasurementYear)
        return false;
      return true;
    });
  }, [rows, filterMeasurementType, filterMeasurementYear]);

  const visibleRows = useMemo(
    () => filteredRows.slice(0, 1000),
    [filteredRows]
  );

  const sectionOptions = useMemo(() => {
    const names = filteredRows.map((r) => r.id || "");
    return Array.from(new Set(names)).filter(Boolean);
  }, [filteredRows]);

  const selectedSectionData = useMemo(() => {
    if (!selectedSection) return null;
    return rows.find((r) => r.id === selectedSection) || null;
  }, [rows, selectedSection]);

  // if selectedSection is filtered out by measurement filters, clear it
  useEffect(() => {
    if (!selectedSection) return;
    const exists = filteredRows.some((r) => r.id === selectedSection);
    if (!exists) setSelectedSection("");
  }, [
    filterMeasurementType,
    filterMeasurementYear,
    filteredRows,
    selectedSection,
  ]);

  // compute simple metrics for the selected cross section to show in the summary
  const sectionMetrics = useMemo(() => {
    if (!selectedSectionData) return null;

    const profile = Array.isArray(selectedSectionData.profile)
      ? selectedSectionData.profile
      : [];

    const stations = profile
      .map((pt) => ({ station: Number(pt.station), depth: Number(pt.depth) }))
      .filter((pt) => Number.isFinite(pt.station) && Number.isFinite(pt.depth))
      .sort((a, b) => a.station - b.station);

    const pointCount = stations.length;
    const depths = stations.map((s) => s.depth);
    const avgDepth = pointCount
      ? Number(depths.reduce((a, b) => a + b, 0) / pointCount).toFixed(2)
      : null;
    const maxDepth = pointCount ? Number(Math.max(...depths)).toFixed(2) : null;

    // count points exceeding design flood level (if numeric)
    const dfl = parseFloat(selectedSectionData.designFloodLevel);
    const highAlerts = Number.isFinite(dfl)
      ? depths.filter((d) => d >= dfl).length
      : 0;

    return {
      pointCount,
      avgDepth: avgDepth !== null ? avgDepth : null,
      maxDepth: maxDepth !== null ? maxDepth : null,
      highAlerts,
    };
  }, [selectedSectionData]);

  // when a section is selected, build full profile data points and default view
  useEffect(() => {
    if (!selectedSection) {
      setSelectedSeries({ data: [], view: null });
      return;
    }
    const row = rows.find((r) => r.id === selectedSection);
    if (!row || !Array.isArray(row.profile) || row.profile.length === 0) {
      setSelectedSeries({ data: [], view: null });
      return;
    }

    // normalize and sort by station
    const stations = row.profile
      .map((pt) => ({ station: Number(pt.station), depth: Number(pt.depth) }))
      .filter((pt) => Number.isFinite(pt.station) && Number.isFinite(pt.depth))
      .sort((a, b) => a.station - b.station);

    const dataPoints = stations.map((s) => ({ x: s.station, y: s.depth }));

    // default view: zoom to last 6 stations (x values). For spatial profiles this
    // will show the downstream portion by default but the user can pan/zoom.
    const xVals = stations.map((s) => s.station);
    const maxX = xVals[xVals.length - 1];
    const minX = xVals[Math.max(0, xVals.length - 6)] ?? xVals[0];

    setSelectedSeries({ data: dataPoints, view: { min: minX, max: maxX } });
  }, [selectedSection, rows]);

  // build chart
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    if (!selectedSeries || !selectedSeries.data || !selectedSeries.data.length)
      return;

    const ctx = chartRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Cross Section",
            data: selectedSeries.data,
            parsing: false,
            borderColor: "#339af0",
            backgroundColor: "rgba(80,150,255,0.35)",
            fill: true,
            pointRadius: 3,
            tension: 0.3,
          },
        ],
      },
      options: {
        parsing: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `Station: ${ctx.parsed.x} m, Depth: ${ctx.parsed.y} m`,
            },
          },
          zoom: {
            // Disable chart interactions (no panning/zooming)
            pan: { enabled: false, mode: "x" },
            zoom: {
              wheel: { enabled: false, mode: "x" },
              pinch: { enabled: false },
              mode: "x",
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            title: { display: true, text: "Station (m)" },
            grid: { display: false },
            // Always start X axis at 0 so station 0 (if present) is visible
            min: 0,
            max: selectedSeries.view ? selectedSeries.view.max : undefined,
          },
          y: {
            type: "linear",
            reverse: true,
            title: { display: true, text: "Depth (m)" },
            grid: { display: false },
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
  }, [selectedSeries]);

  function downloadCSV() {
    const header = [
      "ID",
      "River Name",
      "Cross Section ID",
      "Measurement Type",
      "Measurement Year",
      "Catchment Name",
      "Design Flood Level",
      "Strahler Order",
      "Calibration Year",
      "Calibration Method",
    ];
    const lines = [header.join(",")];
    visibleRows.forEach((r) => {
      const row = [
        `"${(r.id || "").replace(/"/g, '""')}"`,
        `"${(r.river || "").replace(/"/g, '""')}"`,
        `"${(r.crossSectionId || "").replace(/"/g, '""')}"`,
        `"${(r.measurementType || "").replace(/"/g, '""')}"`,
        `"${(r.measurementYear || "").replace(/"/g, '""')}"`,
        `"${(r.catchment || "").replace(/"/g, '""')}"`,
        `"${(r.designFloodLevel || "").toString().replace(/"/g, '""')}"`,
        `"${(r.strahlerOrder || "").replace(/"/g, '""')}"`,
        `"${(r.calibrationYear || "").replace(/"/g, '""')}"`,
        `"${(r.calibrationMethod || "").replace(/"/g, '""')}"`,
      ];
      lines.push(row.join(","));
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cross_section_data.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full z-10">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/assets/img/River_Cross_Section_Icon.svg"
          alt="cross"
          className="w-12 h-12"
          style={{ filter: "invert(0.4)" }}
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#636059]">
            Cross Section Data
          </h1>
          <p className="text-sm text-[#636059]">
            River cross-section profiles and related data
          </p>
        </div>
      </div>

      <div className="mb-2 text-xl font-semibold text-[#636059]">
        Filter Cross Section Data
      </div>
      <div className="flex flex-wrap gap-3 mb-2 items-center">
        <select
          className="px-3 py-2 rounded-xl bg-white border"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="">Select Cross Section</option>
          {sectionOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 rounded-xl bg-white border"
          value={filterMeasurementYear}
          onChange={(e) => setFilterMeasurementYear(e.target.value)}
        >
          <option value="">Select Measurement Year</option>
          {measurementYearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-2 rounded-xl bg-white border"
          value={filterMeasurementType}
          onChange={(e) => setFilterMeasurementType(e.target.value)}
        >
          <option value="">Select Measurement Types</option>
          {measurementTypeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="p-2 mb-2">
        <div className="max-h-62 overflow-auto">
          <table className="w-full text-left text-sm table-fixed border-collapse">
            <thead>
              <tr className="text-xs text-[#636059]">
                <th className="pr-2 w-12 sticky top-0 bg-white border-r py-2 truncate">
                  No
                </th>
                <th className="w-32 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  River Name
                </th>
                <th className="w-28 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Cross Section ID
                </th>
                <th className="w-28 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Measurement Type
                </th>
                <th className="w-20 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Measurement Year
                </th>
                <th className="w-36 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Catchment Name
                </th>
                <th className="w-28 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Design Flood
                </th>
                <th className="w-20 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Strahler Order
                </th>
                <th className="w-24 sticky top-0 bg-white border-r py-2 px-2 truncate">
                  Calibration Year
                </th>
                <th className="w-36 sticky top-0 bg-white py-2 px-2 truncate">
                  Calibration Method
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
                <tr key={r.no}>
                  <td className="pr-2 py-2 border-r truncate text-sm">
                    {r.no}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.river}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.crossSectionId}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.measurementType}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.measurementYear}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.catchment}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.designFloodLevel}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.strahlerOrder || "3rd Order"}
                  </td>
                  <td className="py-2 px-2 border-r truncate text-sm">
                    {r.calibrationYear}
                  </td>
                  <td className="py-2 px-2 w-full text-sm">
                    {r.calibrationMethod}
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
        <div className="mt-3 border-t border-gray-200" />
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:flex-[3] flex-1 rounded-lg p-2 h-56 max-w-full lg:max-w-2xl">
          <div className="w-full h-full rounded-2xl p-2">
            {selectedSeries &&
            selectedSeries.data &&
            selectedSeries.data.length ? (
              <>
                <div className="text-lg font-bold text-[#636059] mb-1">
                  Data Visualization
                </div>
                <div className="font-bold text-[#636059] mb-2 text-sm">
                  River cross-section profile at {selectedSection}, showing the
                  channel shape and surrounding banks.
                </div>
                <div className="h-[calc(100%)]">
                  <canvas
                    ref={chartRef}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-2xl flex items-center justify-center text-[#a49e92]">
                Select a Cross Section to view the profile
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block w-px bg-gray-200 self-stretch" />

        <div className="w-[40rem] p-2">
          <div className="text-lg font-bold text-[#636059] mb-1 px-2">
            Summary
          </div>
          <div className="rounded-xl py-1 flex items-center px-2 text-2xl font-bold text-[#636059] mb-2">
            <div className="text-sm">
              {selectedSectionData ? (
                <>
                  This is the summary for the Cross Section in the{" "}
                  <span className="font-semibold">
                    {selectedSectionData.river || "N/A"}
                  </span>{" "}
                  catchment{" "}
                  <span className="font-semibold">
                    {selectedSectionData.catchment || "N/A"}
                  </span>
                </>
              ) : (
                <div>Select a cross section to see the summary</div>
              )}
            </div>
          </div>
          {sectionMetrics && (
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl p-2">
                <div className="text-md font-bold text-[#636059]">
                  Recording Data
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059]">
                    Data
                    <br />
                    Points
                  </div>
                  <div className="text-4xl font-bold text-[#636059] mt-3">
                    {sectionMetrics.pointCount}
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-200" />
                <div className="text-md font-bold text-[#636059] mt-4">
                  Threshold and Alert
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059]">
                    High
                    <br />
                    Risk Alert
                  </div>
                  <div className="text-4xl font-bold text-[#636059] mt-3">
                    {sectionMetrics.highAlerts}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block w-px bg-gray-200 self-stretch" />
              <div className="flex-1 rounded-xl p-2">
                <div className="text-md font-bold text-[#636059]">
                  Average & Max Depth
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059]">Average (m)</div>
                  <div className="text-4xl font-bold text-[#636059] mt-3">
                    {sectionMetrics.avgDepth != null
                      ? sectionMetrics.avgDepth + " m"
                      : "-"}
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-200" />
                <div className="text-md font-bold text-[#636059] mt-4">
                  Max Depth
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-md text-[#636059] flex flex-col">
                    <div className="font-semibold">
                      {sectionMetrics.maxDepth != null
                        ? sectionMetrics.maxDepth + " m"
                        : "-"}
                    </div>
                    <div className="text-sm">
                      Strahler Order:{" "}
                      <span className="font-semibold">
                        {selectedSectionData.strahlerOrder || "N/A"}
                      </span>
                    </div>
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
