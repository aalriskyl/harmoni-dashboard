/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import SearchButton from "./SearchButton";

const CrossSectionButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Cross Sections"
    aria-label="Toggle Cross Sections"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/River_Cross_Section_Icon.svg"
        alt="Cross Sections"
        className={`w-8 h-8 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(120%) invert(96%) sepia(8%) saturate(260%) hue-rotate(343deg) brightness(100%) contrast(110%)" // stronger for active
            : "brightness(0) saturate(120%) invert(36%) sepia(6%) saturate(1300%) hue-rotate(349deg) brightness(96%) contrast(100%)", // stronger for inactive
        }}
      />
    </div>
  </button>
);

const RiverBodyButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Rivers"
    aria-label="Toggle Rivers"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/River_Body_Icon.svg"
        alt="Rivers"
        className={`w-8 h-8 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(120%) invert(96%) sepia(8%) saturate(260%) hue-rotate(343deg) brightness(100%) contrast(110%)"
            : "brightness(0) saturate(120%) invert(36%) sepia(6%) saturate(1300%) hue-rotate(349deg) brightness(96%) contrast(100%)",
        }}
      />
    </div>
  </button>
);

const PumpButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Pumps"
    aria-label="Toggle Pumps"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/pump-icon.svg"
        alt="Pumps"
        className={`w-8 h-8 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(120%) invert(96%) sepia(8%) saturate(260%) hue-rotate(343deg) brightness(100%) contrast(110%)"
            : "brightness(0) saturate(120%) invert(36%) sepia(6%) saturate(1300%) hue-rotate(349deg) brightness(96%) contrast(100%)",
        }}
      />
    </div>
  </button>
);

const WaterLevelButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059] "
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Water Levels"
    aria-label="Toggle Water Levels"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/water-level-icon.svg"
        alt="Water Levels"
        className={`w-8 h-8 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(120%) invert(96%) sepia(8%) saturate(260%) hue-rotate(343deg) brightness(100%) contrast(110%)"
            : "brightness(0) saturate(120%) invert(36%) sepia(6%) saturate(1300%) hue-rotate(349deg) brightness(96%) contrast(100%)",
        }}
      />
    </div>
  </button>
);

const RainRecorderButton = ({ isActive, onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${
      isActive
        ? "bg-[#636059] border-2 border-[#636059]"
        : "bg-[#f2f1ef] border-2 border-[#f2f1ef]"
    } hover:shadow-md`}
    title="Rain Recorders"
    aria-label="Toggle Rain Recorders"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <img
        src="/assets/img/rain-gauge-icon.svg"
        alt="Rain Recorders"
        className={`w-8 h-8 transition-colors ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          filter: hidden
            ? undefined
            : isActive
            ? "brightness(0) saturate(120%) invert(96%) sepia(8%) saturate(260%) hue-rotate(343deg) brightness(100%) contrast(110%)"
            : "brightness(0) saturate(120%) invert(36%) sepia(6%) saturate(1300%) hue-rotate(349deg) brightness(96%) contrast(100%)",
        }}
      />
    </div>
  </button>
);

const PumpControls = ({
  showPumps = true,
  showWaterLevels = true,
  showRainRecorders = true,
  showRivers = true,
  showCrossSections = true,
  onTogglePumps,
  onToggleWaterLevels,
  onToggleRainRecorders,
  onToggleRivers,
  onToggleCrossSections,
}) => {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.__welcomeVisible) return true;
    // fallback: check if overlay element exists in DOM (refresh case)
    try {
      return !!document.getElementById("welcome-overlay");
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    function onShow() {
      setHidden(true);
    }
    function onHide() {
      setHidden(false);
    }
    window.addEventListener("welcomeShown", onShow);
    window.addEventListener("welcomeHidden", onHide);
    const onEnsure = () => {
      // best-effort unhide when map indicates it's settled
      setHidden(false);
    };
    window.addEventListener("ensureControlsVisible", onEnsure);
    return () => {
      window.removeEventListener("welcomeShown", onShow);
      window.removeEventListener("welcomeHidden", onHide);
      window.removeEventListener("ensureControlsVisible", onEnsure);
    };
  }, []);
  const containerClass = `fixed right-[35px] top-[57%] transform -translate-y-1/2 z-10 flex flex-col gap-3 transition-all duration-200 ${
    hidden
      ? "opacity-0 pointer-events-none scale-95 translate-x-2"
      : "opacity-100 pointer-events-auto scale-100"
  }`;
  // scale pump controls to 75%
  const scaledContainerStyle = {
    transform: hidden ? undefined : "scale(0.75)",
    transformOrigin: "top right",
  };

  // search panel open state (full-height container shown to the left of controls)
  const [searchOpen, setSearchOpen] = useState(false);

  // control whether the Data Explorer container (collapsed or expanded) is visible
  const [dataExplorerVisible, setDataExplorerVisible] = useState(false);

  // Search icon toggles show/hide of the Data Explorer container only
  const toggleSearch = () => {
    setDataExplorerVisible((v) => {
      const next = !v;
      if (next) {
        // ensure controls visible when showing the container
        setHidden(false);
      }
      return next;
    });
  };

  // dataset + location dropdown state
  const datasets = [
    {
      key: "ARR",
      label: "Automatic Rain Recorder (ARR)",
      file: "/data/Automatic_Rain_Recorder_(ARR)_with_Data-_Jakarta.geojson",
    },
    {
      key: "AWLR",
      label: "Automatic Water Level Recorder (AWLR)",
      file: "/data/Automatic_Water_Level_Recorder_(AWLR)_with_Data-_Jakarta.geojson",
    },
    {
      key: "WATERPUMP",
      label: "Waterpump Stasioner",
      file: "/data/Waterpump_Stasioner_EPSG_4326.geojson",
    },
  ];
  const [selectedDataset, setSelectedDataset] = useState(datasets[1].key); // default AWLR
  const [features, setFeatures] = useState([]);
  const [kotaOptions, setKotaOptions] = useState([]);
  const [kecamatanOptions, setKecamatanOptions] = useState([]);
  const [kelurahanOptions, setKelurahanOptions] = useState([]);
  const [selectedKota, setSelectedKota] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");

  useEffect(() => {
    // fetch selected dataset geojson and extract location fields
    const ds = datasets.find((d) => d.key === selectedDataset);
    if (!ds || typeof window === "undefined") return;
    let cancelled = false;
    fetch(ds.file)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const feats = Array.isArray(json.features) ? json.features : [];
        setFeatures(feats);
        const kotaSet = new Set();
        const kecSet = new Set();
        const kelSet = new Set();
        feats.forEach((f) => {
          const p = f.properties || {};
          if (p.Kota) kotaSet.add(p.Kota);
          if (p.Kecamatan) kecSet.add(p.Kecamatan);
          if (p.Kelurahan) kelSet.add(p.Kelurahan);
          // some files might use different keys (city, kecamatan, kelurahan)
          if (p.kota) kotaSet.add(p.kota);
          if (p.kecamatan) kecSet.add(p.kecamatan);
          if (p.kelurahan) kelSet.add(p.kelurahan);
        });
        const kotaArr = Array.from(kotaSet).filter(Boolean).sort();
        const kecArr = Array.from(kecSet).filter(Boolean).sort();
        const kelArr = Array.from(kelSet).filter(Boolean).sort();
        setKotaOptions(kotaArr);
        setKecamatanOptions(kecArr);
        setKelurahanOptions(kelArr);
        // reset selections
        setSelectedKota("");
        setSelectedKecamatan("");
        setSelectedKelurahan("");
      })
      .catch(() => {
        setFeatures([]);
        setKotaOptions([]);
        setKecamatanOptions([]);
        setKelurahanOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDataset]);

  // cascade: when selectedKota changes, filter kecamatan options
  useEffect(() => {
    if (!selectedKota) {
      // show all
      const kecSet = new Set();
      features.forEach((f) => {
        const p = f.properties || {};
        if (p.Kecamatan) kecSet.add(p.Kecamatan);
        if (p.kecamatan) kecSet.add(p.kecamatan);
      });
      setKecamatanOptions(Array.from(kecSet).filter(Boolean).sort());
      return;
    }
    const kecSet = new Set();
    features.forEach((f) => {
      const p = f.properties || {};
      if (
        (p.Kota === selectedKota || p.kota === selectedKota) &&
        (p.Kecamatan || p.kecamatan)
      ) {
        if (p.Kecamatan) kecSet.add(p.Kecamatan);
        if (p.kecamatan) kecSet.add(p.kecamatan);
      }
    });
    setKecamatanOptions(Array.from(kecSet).filter(Boolean).sort());
    setSelectedKecamatan("");
    setSelectedKelurahan("");
  }, [selectedKota, features]);

  useEffect(() => {
    if (!selectedKecamatan) {
      const kelSet = new Set();
      features.forEach((f) => {
        const p = f.properties || {};
        if (p.Kelurahan) kelSet.add(p.Kelurahan);
        if (p.kelurahan) kelSet.add(p.kelurahan);
      });
      setKelurahanOptions(Array.from(kelSet).filter(Boolean).sort());
      return;
    }
    const kelSet = new Set();
    features.forEach((f) => {
      const p = f.properties || {};
      if (
        (p.Kecamatan === selectedKecamatan ||
          p.kecamatan === selectedKecamatan) &&
        (p.Kelurahan || p.kelurahan)
      ) {
        if (p.Kelurahan) kelSet.add(p.Kelurahan);
        if (p.kelurahan) kelSet.add(p.kelurahan);
      }
    });
    setKelurahanOptions(Array.from(kelSet).filter(Boolean).sort());
    setSelectedKelurahan("");
  }, [selectedKecamatan, features]);

  // inject global CSS to scale Mapbox built-in controls to 75%
  useEffect(() => {
    const styleId = "mapbox-ctrl-scale-style";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .mapboxgl-ctrl {
        transform: scale(0.75) !important;
        transform-origin: top right !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);
  // SearchButton component imported from ./SearchButton

  // format reading values for display (handles primitives, arrays, objects)
  const formatReading = (r) => {
    if (r === null || typeof r === "undefined") return "N/A";
    if (
      typeof r === "string" ||
      typeof r === "number" ||
      typeof r === "boolean"
    )
      return String(r);
    if (Array.isArray(r)) return r.map((it) => formatReading(it)).join(", ");
    if (typeof r === "object") {
      // common fields to try
      const prefer = [
        "value",
        "val",
        "reading",
        "Reading",
        "Capacity",
        "capacity",
        "amount",
        "level",
      ];
      for (const k of prefer) {
        if (k in r && (typeof r[k] === "string" || typeof r[k] === "number"))
          return String(r[k]);
      }
      // fallback: first primitive child
      for (const v of Object.values(r)) {
        if (typeof v === "string" || typeof v === "number") return String(v);
      }
      // last resort: JSON stringify (safe try)
      try {
        return JSON.stringify(r);
      } catch (e) {
        return "[object]";
      }
    }
    return String(r);
  };

  return (
    <>
      {/* Full-height search panel (100% height) rendered unscaled to the left of the controls */}
      {/* Collapsed search card when closed (small card like reference image) */}
      {dataExplorerVisible && !searchOpen && (
        <div
          className="fixed z-40 right-[80px] top-[60.3%] transform -translate-y-1/2  bg-white shadow-md"
          style={{ borderRadius: 12, padding: "0.75rem" }}
        >
          <div className="mb-2">
            <p className="text-lg font-semibold">Data Explorer</p>
            <hr className="mt-2 mb-2 border-gray-300" />
            <p className="text-sm text-black font-medium">
              Search and filter monitoring data based on type and location.
            </p>
          </div>
          <div className="mt-3">
            <label className="text-sm text-gray-700 block mb-1">
              Select dataset
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full p-2 rounded bg-white border border-gray-200 mb-3 text-sm"
            >
              {datasets.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>

            <p className="text-sm text-gray-700">Select location:</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Kota</label>
                <select
                  value={selectedKota}
                  onChange={(e) => setSelectedKota(e.target.value)}
                  className="w-full p-2 rounded bg-white border border-gray-200 text-sm"
                >
                  <option value="">-- all kota --</option>
                  {kotaOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row gap-2">
                <div>
                  <label className="text-xs text-gray-500">Kecamatan</label>
                  <select
                    value={selectedKecamatan}
                    onChange={(e) => setSelectedKecamatan(e.target.value)}
                    className="w-full p-2 rounded bg-white border border-gray-200 text-sm"
                  >
                    <option value="">-- all kecamatan --</option>
                    {kecamatanOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Kelurahan</label>
                  <select
                    value={selectedKelurahan}
                    onChange={(e) => setSelectedKelurahan(e.target.value)}
                    className="w-full p-2 rounded bg-white border border-gray-200 text-sm"
                  >
                    <option value="">-- all kelurahan --</option>
                    {kelurahanOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full py-2 rounded-full bg-[#636059] text-white font-semibold"
            >
              Find Data
            </button>
          </div>
        </div>
      )}

      {/* Full-height expanded search panel when opened */}
      {dataExplorerVisible && searchOpen && (
        <div
          className="fixed z-40 right-[80px] top-[37.5%] h-auto max-h-[490px] max-w-[360px] w-full bg-white rounded-xl"
          style={{
            padding: "1rem",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header section - fixed */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Data Explorer
            </h3>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              aria-label="Close search"
            >
              ✕
            </button>
          </div>

          {/* Filter controls section - fixed */}
          <div className="text-sm text-gray-700 mb-4">
            <p className="mb-3">
              Search and filter monitoring data based on type and location.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700 block mb-1">
                  Select dataset
                </label>
                <select
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="w-full p-2 rounded bg-white border border-gray-200 text-sm"
                >
                  {datasets.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Kota</label>
                <select
                  value={selectedKota}
                  onChange={(e) => setSelectedKota(e.target.value)}
                  className="w-full p-2 rounded bg-white border border-gray-200 text-sm"
                >
                  <option value="">-- all kota --</option>
                  {kotaOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row gap-2">
                <div>
                  <label className="text-sm text-gray-700 block mb-1">
                    Kecamatan
                  </label>
                  <select
                    value={selectedKecamatan}
                    onChange={(e) => setSelectedKecamatan(e.target.value)}
                    className="w-full p-2 rounded bg-white border border-gray-200 text-sm"
                  >
                    <option value="">-- all kecamatan --</option>
                    {kecamatanOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">
                    Kelurahan
                  </label>
                  <select
                    value={selectedKelurahan}
                    onChange={(e) => setSelectedKelurahan(e.target.value)}
                    className="w-full p-2 rounded bg-white border border-gray-200 text-sm"
                  >
                    <option value="">-- all kelurahan --</option>
                    {kelurahanOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card list section - scrollable */}
          <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
            <div className="mt-6">
              {/** render matching features from the loaded geojson */}
              {features
                .filter((f) => {
                  const p = f.properties || {};
                  if (
                    selectedKota &&
                    !(p.Kota === selectedKota || p.kota === selectedKota)
                  )
                    return false;
                  if (
                    selectedKecamatan &&
                    !(
                      p.Kecamatan === selectedKecamatan ||
                      p.kecamatan === selectedKecamatan
                    )
                  )
                    return false;
                  if (
                    selectedKelurahan &&
                    !(
                      p.Kelurahan === selectedKelurahan ||
                      p.kelurahan === selectedKelurahan
                    )
                  )
                    return false;
                  return true;
                })
                .slice(0, 20) // limit results
                .map((f, idx) => {
                  const p = f.properties || {};
                  // pick sensible display fields
                  const title =
                    p.AWLR_Name ||
                    p.Pompa ||
                    p.Name ||
                    p.AWRL_Name ||
                    p.Device_ID ||
                    `Feature ${idx + 1}`;
                  const id =
                    p.Device_ID || p.DeviceId || p.Pompa || p.id || `id-${idx}`;
                  const reading =
                    p.Reading ||
                    p.reading ||
                    p.Capacity ||
                    p["Reading_(+6hr)"] ||
                    "N/A";
                  // choose icon based on selected dataset
                  const iconSrc =
                    selectedDataset === "ARR"
                      ? "/assets/img/rain-gauge-icon.svg"
                      : selectedDataset === "AWLR"
                      ? "/assets/img/water-level-icon.svg"
                      : "/assets/img/pump-icon.svg";

                  return (
                    <div
                      key={idx}
                      role="button"
                      title={`Zoom to ${title}`}
                      onClick={() => {
                        try {
                          let coords = null;
                          if (f && f.geometry) {
                            const g = f.geometry;
                            if (g.type === "Point") coords = g.coordinates;
                            else if (Array.isArray(g.coordinates)) {
                              // line or polygon: take first coord fallback
                              const first = g.coordinates[0];
                              coords = Array.isArray(first[0])
                                ? first[0]
                                : first;
                            }
                          }
                          // try common property fallbacks
                          if (!coords) {
                            if (p.longitude && p.latitude)
                              coords = [p.longitude, p.latitude];
                            else if (
                              (p.Longitude || p.Lon || p.lon) &&
                              (p.Latitude || p.Lat || p.lat)
                            ) {
                              coords = [
                                p.Longitude || p.Lon || p.lon,
                                p.Latitude || p.Lat || p.lat,
                              ];
                            }
                          }
                          if (
                            coords &&
                            Array.isArray(coords) &&
                            coords.length >= 2
                          ) {
                            window.dispatchEvent(
                              new CustomEvent("feature:focus", {
                                detail: { coordinates: coords, zoom: 17, id },
                              })
                            );
                          }
                        } catch (err) {
                          console.warn("feature focus failed", err);
                        }
                      }}
                      className="p-3 bg-gray-100 rounded mb-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white rounded shadow">
                          <img src={iconSrc} alt="icon" className="w-6 h-6" />
                        </div>
                        <div className="text-sm w-full">
                          <div className="font-semibold">{title}</div>
                          <div className="text-xs text-gray-600">
                            Device ID: {id}
                          </div>
                          {reading !== "N/A" && (
                            <div className="text-xs text-gray-600">
                              Reading: {formatReading(reading)}
                            </div>
                          )}
                          {p.Kota && (
                            <div className="text-xs text-gray-600">
                              Kota: {p.Kota}
                            </div>
                          )}
                          {p.Kecamatan && (
                            <div className="text-xs text-gray-600">
                              Kecamatan: {p.Kecamatan}
                            </div>
                          )}
                          {p.Kelurahan && (
                            <div className="text-xs text-gray-600">
                              Kelurahan: {p.Kelurahan}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              {features.length === 0 && (
                <div className="p-3 text-sm text-gray-600">
                  No data loaded for the selected dataset.
                </div>
              )}
            </div>
            {/* kept a single placeholder example card for UX */}
            <div className="p-4 bg-gray-100 rounded mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded shadow">
                  ☁️
                </div>
                <div className="text-sm">
                  <div>Example device card (UI placeholder)</div>
                  <div className="text-xs text-gray-600">
                    Use real data by selecting a dataset
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={containerClass}
        aria-hidden={hidden}
        style={scaledContainerStyle}
      >
        <SearchButton onClick={toggleSearch} hidden={hidden} />
        <PumpButton
          isActive={showPumps}
          onClick={() => onTogglePumps()}
          hidden={hidden}
        />
        <WaterLevelButton
          isActive={showWaterLevels}
          onClick={() => onToggleWaterLevels()}
          hidden={hidden}
        />
        <RainRecorderButton
          isActive={showRainRecorders}
          onClick={() => onToggleRainRecorders()}
          hidden={hidden}
        />
        <RiverBodyButton
          isActive={showRivers}
          onClick={() => onToggleRivers()}
          hidden={hidden}
        />
        <CrossSectionButton
          isActive={showCrossSections}
          onClick={() => onToggleCrossSections()}
          hidden={hidden}
        />
      </div>
    </>
  );
};

export default PumpControls;
