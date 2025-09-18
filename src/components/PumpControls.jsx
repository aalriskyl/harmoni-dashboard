/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
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
            ? "brightness(0) saturate(120%) invert(96%) sepia(8%) saturate(260%) hue-rotate(343deg) brightness(100%) contrast(110%)"
            : "brightness(0) saturate(120%) invert(36%) sepia(6%) saturate(1300%) hue-rotate(349deg) brightness(96%) contrast(100%)",
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
  const containerClass = `fixed right-[35px] top-[57%] transform -translate-y-1/2 z-10 flex flex-col transition-all duration-200 ${
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

  // Inject select/option styling used by the Data Explorer dropdowns
  useEffect(() => {
    const styleId = "pumpcontrols-select-style";
    if (document.getElementById(styleId)) return;
    const s = document.createElement("style");
    s.id = styleId;
    s.textContent = `
      /* PumpControls: more consistent select/option visuals */
      .pump-select { 
        -webkit-appearance: none; 
        -moz-appearance: none; 
        appearance: none; 
        background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%); 
        background-position: calc(100% - 0.75rem) calc(50% - 0.15rem), calc(100% - 0.5rem) calc(50% - 0.15rem); 
        background-size: 6px 6px, 6px 6px; 
        background-repeat: no-repeat; 
      }
      .pump-select:focus { outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
      /* Option styling (may be ignored by some browsers) */
      .pump-select option { padding: 0.5rem 0.75rem; color: #111827; background: #ffffff; }
    `;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);
  // Refs + open state for custom dropdowns (dataset + location columns)
  const datasetRef = useRef(null);
  const kotaRef = useRef(null);
  const kecRef = useRef(null);
  const kelRef = useRef(null);
  const [openDataset, setOpenDataset] = useState(false);
  const [openKota, setOpenKota] = useState(false);
  const [openKec, setOpenKec] = useState(false);
  const [openKel, setOpenKel] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (datasetRef.current && !datasetRef.current.contains(e.target))
        setOpenDataset(false);
      if (kotaRef.current && !kotaRef.current.contains(e.target))
        setOpenKota(false);
      if (kecRef.current && !kecRef.current.contains(e.target))
        setOpenKec(false);
      if (kelRef.current && !kelRef.current.contains(e.target))
        setOpenKel(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
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
  const deviceTypeLabel =
    datasets.find((d) => d.key === selectedDataset)?.label || "Devices";
  const locationLabel = `${selectedKota || "All Kota"}, ${
    selectedKecamatan || "All Kecamatan"
  }, ${selectedKelurahan || "All Kelurahan"}`;

  return (
    <>
      <div className={containerClass} aria-hidden={hidden}>
        <div style={scaledContainerStyle}>
          <SearchButton onClick={toggleSearch} hidden={hidden} />
        </div>
        {dataExplorerVisible && (
          <div
            className="fixed z-40 right-12 bg-white shadow-md max-w-[360px]"
            style={{
              borderRadius: 12,
              padding: "1rem",
              // top: searchOpen ? "306px" : "306px",
              width: searchOpen ? 360 : 360,
              maxWidth: "90vw",
            }}
          >
            {/* Shared header and filter controls (render once) */}
            <div className="mb-3 overflow-y-hidden">
              <p className="text-xl font-semibold">Data Explorer</p>
              <p className="block text-sm text-black font-medium mt-2">
                {searchOpen
                  ? `${deviceTypeLabel} in ${locationLabel}`
                  : "Search and filter monitoring data based on type and location."}
              </p>
            </div>

            <div className={searchOpen ? "hidden mb-4" : "block"}>
              <label className="text-sm text-gray-700 block mb-1">
                Select monitoring element:
              </label>
              <div className="relative mt-1" ref={datasetRef}>
                <button
                  type="button"
                  onClick={() => setOpenDataset((s) => !s)}
                  className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-3"
                >
                  <span className="block truncate">
                    {datasets.find((d) => d.key === selectedDataset)?.label ||
                      "Select dataset"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
                {openDataset && (
                  <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {datasets.map((d) => (
                      <div
                        key={d.key}
                        className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                        onClick={() => {
                          setSelectedDataset(d.key);
                          setOpenDataset(false);
                        }}
                      >
                        <span className="block truncate font-normal">
                          {d.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700">Select location:</p>
              <div className="space-y-2">
                <div ref={kotaRef}>
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => setOpenKota((s) => !s)}
                      className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <span className="block truncate">
                        {selectedKota || "Kota"}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </button>
                    {openKota && (
                      <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        <div
                          className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                          onClick={() => {
                            setSelectedKota("");
                            setOpenKota(false);
                          }}
                        >
                          <span className="block truncate font-normal">
                            All Kota
                          </span>
                        </div>
                        {kotaOptions.map((k) => (
                          <div
                            key={k}
                            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                            onClick={() => {
                              setSelectedKota(k);
                              setOpenKota(false);
                            }}
                          >
                            <span className="block truncate font-normal">
                              {k}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="flex-1" ref={kecRef}>
                    <div className="relative mt-1">
                      <button
                        type="button"
                        onClick={() => setOpenKec((s) => !s)}
                        className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <span className="block truncate">
                          {selectedKecamatan || "Kecamatan"}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </button>
                      {openKec && (
                        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          <div
                            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                            onClick={() => {
                              setSelectedKecamatan("");
                              setOpenKec(false);
                            }}
                          >
                            <span className="block truncate font-normal">
                              All Kecamatan
                            </span>
                          </div>
                          {kecamatanOptions.map((k) => (
                            <div
                              key={k}
                              className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                              onClick={() => {
                                setSelectedKecamatan(k);
                                setOpenKec(false);
                              }}
                            >
                              <span className="block truncate font-normal">
                                {k}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1" ref={kelRef}>
                    <div className="relative mt-1">
                      <button
                        type="button"
                        onClick={() => setOpenKel((s) => !s)}
                        className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <span className="block truncate">
                          {selectedKelurahan || "Kelurahan"}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </button>
                      {openKel && (
                        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          <div
                            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                            onClick={() => {
                              setSelectedKelurahan("");
                              setOpenKel(false);
                            }}
                          >
                            <span className="block truncate font-normal">
                              All Kelurahan
                            </span>
                          </div>
                          {kelurahanOptions.map((k) => (
                            <div
                              key={k}
                              className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                              onClick={() => {
                                setSelectedKelurahan(k);
                                setOpenKel(false);
                              }}
                            >
                              <span className="block truncate font-normal">
                                {k}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsed: only show Find Data button */}
            <div className={searchOpen ? "hidden" : "block"}>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="w-full py-2 rounded-md bg-[#636059] text-white font-semibold"
                >
                  Find Data
                </button>
              </div>
            </div>

            {/* Expanded: header + results (only results are toggled) */}
            <div className={searchOpen ? "block" : "hidden"}>
              <div className="my-4">
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="w-full py-2 rounded-md bg-[#636059] text-white font-medium"
                  aria-label="Close search"
                >
                  Stop Filtering
                </button>
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: searchOpen ? "50vh" : "auto" }}
              >
                <div className="">
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
                    .slice(0, 20)
                    .map((f, idx) => {
                      const p = f.properties || {};
                      const title =
                        p.AWLR_Name ||
                        p.Pompa ||
                        p.Name ||
                        p.AWRL_Name ||
                        p.Device_ID ||
                        `Feature ${idx + 1}`;
                      const id =
                        p.Device_ID ||
                        p.DeviceId ||
                        p.Pompa ||
                        p.id ||
                        `id-${idx}`;
                      const reading =
                        p.Reading ||
                        p.reading ||
                        p.Capacity ||
                        p["Reading_(+6hr)"] ||
                        "N/A";
                      const iconSrc =
                        selectedDataset === "ARR"
                          ? "/assets/img/rain-gauge-icon.svg"
                          : selectedDataset === "AWLR"
                          ? "/assets/img/water-level-icon.svg"
                          : "/assets/img/pump-icon.svg";

                      // derive status value and color class
                      let statusValue = null;
                      const dc =
                        p.Device_Condition ||
                        p.device_condition ||
                        p.deviceCondition;
                      if (dc !== undefined && dc !== null) {
                        if (typeof dc === "string" || typeof dc === "number") {
                          statusValue = String(dc);
                        } else if (typeof dc === "object") {
                          const prefer = [
                            "Condition",
                            "condition",
                            "Status",
                            "status",
                            "State",
                            "state",
                            "Online",
                            "online",
                          ];
                          for (const k of prefer) {
                            if (k in dc) {
                              const v = dc[k];
                              if (
                                typeof v === "string" ||
                                typeof v === "number"
                              ) {
                                statusValue = String(v);
                                break;
                              }
                            }
                          }
                          if (!statusValue) {
                            try {
                              const json = JSON.stringify(dc);
                              statusValue =
                                json.length > 60
                                  ? json.slice(0, 57) + "..."
                                  : json;
                            } catch (e) {
                              // ignore
                            }
                          }
                        }
                      }
                      if (!statusValue) {
                        const statusCandidates = [
                          p.Status,
                          p.status,
                          p.Online,
                          p.online,
                          p.State,
                        ];
                        const st = statusCandidates.find(
                          (s) => typeof s === "string" || typeof s === "number"
                        );
                        if (st) statusValue = String(st);
                      }
                      const statusText = statusValue
                        ? `Status: ${statusValue}`
                        : "Status: unknown";
                      const s = (statusValue || "").toLowerCase();
                      let statusColorClass = "text-gray-600";
                      if (
                        s.includes("good") ||
                        s.includes("ok") ||
                        s.includes("online") ||
                        s.includes("operational") ||
                        s.includes("normal") ||
                        s.includes("available")
                      ) {
                        statusColorClass = "text-green-600";
                      } else if (
                        s.includes("poor") ||
                        s.includes("bad") ||
                        s.includes("offline") ||
                        s.includes("broken") ||
                        s.includes("fault") ||
                        s.includes("no") ||
                        s.includes("fail")
                      ) {
                        statusColorClass = "text-red-600";
                      } else if (
                        s.includes("warn") ||
                        s.includes("partial") ||
                        s.includes("maintenance") ||
                        s.includes("unknown") ||
                        s.includes("degraded")
                      ) {
                        statusColorClass = "text-yellow-600";
                      }

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
                                  const first = g.coordinates[0];
                                  coords = Array.isArray(first[0])
                                    ? first[0]
                                    : first;
                                }
                              }
                              if (!coords) {
                                if (p.longitude && p.latitude)
                                  coords = [p.longitude, p.latitude];
                                else if (
                                  (p.Longitude || p.Lon || p.lon) &&
                                  (p.Latitude || p.Lat || p.lat)
                                )
                                  coords = [
                                    p.Longitude || p.Lon || p.lon,
                                    p.Latitude || p.Lat || p.lat,
                                  ];
                              }
                              if (
                                coords &&
                                Array.isArray(coords) &&
                                coords.length >= 2
                              )
                                window.dispatchEvent(
                                  new CustomEvent("feature:focus", {
                                    detail: {
                                      coordinates: coords,
                                      zoom: 17,
                                      id,
                                    },
                                  })
                                );
                            } catch (err) {
                              console.warn("feature focus failed", err);
                            }
                          }}
                          className="p-3 bg-gray-100 rounded mb-3 cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white rounded shadow">
                              <img
                                src={iconSrc}
                                alt="icon"
                                className="w-6 h-6"
                              />
                            </div>
                            <div className="text-sm w-full">
                              <div className="font-semibold truncate">
                                {title}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1 items-center">
                                  <div className="text-gray-700">Device ID</div>
                                  <div className="truncate">: {id}</div>

                                  <div className="text-gray-700">Reading</div>
                                  <div className="truncate">
                                    : {formatReading(reading)} m
                                  </div>

                                  {p["Reading_(+6hr)"] ||
                                  p["Reading (+6hr)"] ? (
                                    <>
                                      <div className="text-gray-700">
                                        Reading (+6hr)
                                      </div>
                                      <div className="truncate">
                                        :{" "}
                                        {formatReading(
                                          p["Reading_(+6hr)"] ||
                                            p["Reading (+6hr)"]
                                        )}
                                      </div>
                                    </>
                                  ) : null}

                                  <div className="text-gray-700">Status</div>
                                  <div
                                    className={`font-medium ${statusColorClass} truncate`}
                                  >
                                    : {statusText.replace(/^Status:\s*/i, "")}
                                  </div>
                                </div>
                              </div>
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
              </div>
            </div>
          </div>
        )}
        <div style={scaledContainerStyle} className="flex flex-col gap-2">
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
      </div>
    </>
  );
};

export default PumpControls;
