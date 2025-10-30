import React, { useEffect, useMemo, useState } from "react";

const DATA_PATHS = {
  rain: "/data/Automatic_Rain_Recorder_(ARR)_with_Data-_Jakarta.geojson",
  water:
    "/data/Automatic_Water_Level_Recorder_(AWLR)_with_Data-_Jakarta.geojson",
};

function guessStationNameProp(props) {
  return (
    props.ARR_Name ||
    props.AWLR_Name ||
    props.Station_Name ||
    props.Name ||
    props.name ||
    props.Device_ID
  );
}

export default function ReportForm({ type = "rain", title }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  // form fields
  const [stationId, setStationId] = useState("");
  const [kota, setKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [manager, setManager] = useState("");
  const [riverRegion, setRiverRegion] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [reading, setReading] = useState("");
  const [operatorName, setOperatorName] = useState("");

  useEffect(() => {
    // load dataset if we have a path for this type
    const path = DATA_PATHS[type];
    if (!path) {
      setFeatures([]);
      return;
    }
    setLoading(true);
    fetch(path)
      .then((r) => r.json())
      .then((j) => {
        const feats = j.features || [];
        setFeatures(feats);
      })
      .catch((e) => {
        console.warn("Could not load dataset", e);
        setFeatures([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const stationOptions = useMemo(() => {
    return features.map((f, i) => {
      const props = f.properties || {};
      const name = guessStationNameProp(props) || `Station ${i + 1}`;
      // use device id or index as id
      const id = props.Device_ID || props.DeviceId || props.id || name;
      return { id, name, props };
    });
  }, [features]);

  // derive unique lists for Kota/Kecamatan/Kelurahan
  const kotaOptions = useMemo(() => {
    const s = new Set(
      features
        .map(
          (f) =>
            f.properties?.Kota ||
            f.properties?.Provinsi ||
            f.properties?.City ||
            ""
        )
        .filter(Boolean)
    );
    return Array.from(s);
  }, [features]);
  const kecOptions = useMemo(() => {
    const s = new Set(
      features
        .map((f) => f.properties?.Kecamatan || f.properties?.District || "")
        .filter(Boolean)
    );
    return Array.from(s);
  }, [features]);
  const kelOptions = useMemo(() => {
    const s = new Set(
      features
        .map((f) => f.properties?.Kelurahan || f.properties?.Village || "")
        .filter(Boolean)
    );
    return Array.from(s);
  }, [features]);

  // manager options (try a few common property names)
  const managerOptions = useMemo(() => {
    const s = new Set(
      features
        .map(
          (f) =>
            f.properties?.Manager ||
            f.properties?.Operator ||
            f.properties?.PIC ||
            ""
        )
        .filter(Boolean)
    );
    return Array.from(s);
  }, [features]);

  // river/region options
  const riverOptions = useMemo(() => {
    const s = new Set(
      features
        .map(
          (f) =>
            f.properties?.River_Region ||
            f.properties?.Sungai ||
            f.properties?.RiverName ||
            f.properties?.Region ||
            ""
        )
        .filter(Boolean)
    );
    return Array.from(s);
  }, [features]);

  useEffect(() => {
    // when station changes, auto-fill the location fields
    if (!stationId) return;
    const found = stationOptions.find((s) => s.id === stationId);
    if (!found) return;
    const p = found.props || {};
    setKota(p.Kota || p.Provinsi || p.City || "");
    setKecamatan(p.Kecamatan || p.District || "");
    setKelurahan(p.Kelurahan || p.Village || "");
    // auto-fill manager and riverRegion if available
    setManager(p.Manager || p.Operator || p.PIC || "");
    setRiverRegion(p.River_Region || p.Sungai || p.RiverName || p.Region || "");
  }, [stationId, stationOptions]);

  const onSubmit = (e) => {
    e.preventDefault();
    // basic validation: timestamp and operator required; reading must be numeric (0 allowed)
    if (!timestamp || operatorName === "") {
      alert("Please fill timestamp and operator name.");
      return;
    }

    if (reading === "") {
      alert("Please provide a reading (numeric). 0 is allowed.");
      return;
    }

    const readingNum = parseFloat(reading);
    if (Number.isNaN(readingNum)) {
      alert("Reading must be a valid number.");
      return;
    }

    const payload = {
      type,
      stationId: stationId || null,
      kota,
      kecamatan,
      kelurahan,
      manager,
      riverRegion,
      timestamp,
      reading: readingNum,
      operatorName,
      submittedAt: new Date().toISOString(),
    };

    // For now, download payload as JSON to simulate submit.
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${type}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert(
      "Report prepared and downloaded (JSON). Replace with API call to submit to server."
    );
    // reset minimal fields
    setTimestamp("");
    setReading("");
    setOperatorName("");
    setManager("");
    setRiverRegion("");
  };

  return (
    <div className="p-4 bg-white">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={
            type === "rain"
              ? "/assets/logos/Rain Level Data Icon.svg"
              : type === "water"
              ? "/assets/logos/Water Level Data Icon.svg"
              : "/assets/logos/Flood Data Icon.svg"
          }
          alt="type"
          className="w-10 h-10"
          style={{ filter: "invert(0.6)" }}
        />
        <div>
          <h2 className="text-2xl font-semibold text-[#636059] mb-0">
            {title || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`}
          </h2>
          <div className="text-sm text-gray-600">
            {`Manual ${
              type === "rain"
                ? "Rain"
                : type === "water"
                ? "Water Level"
                : "Flood"
            } data report`}
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading station data…</div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-xl">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Nama Stasiun</span>
            <select
              className="px-3 py-2 rounded-xl border"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            >
              <option value="">-- Pilih Stasiun --</option>
              {stationOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Kota</span>
              <select
                className={`px-3 py-2 rounded-xl border ${
                  stationId
                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                    : "bg-white"
                }`}
                value={kota}
                onChange={(e) => setKota(e.target.value)}
                disabled={!!stationId}
                title={
                  stationId
                    ? "Locked because a station is selected"
                    : "Select kota"
                }
              >
                <option value="">-- Kota --</option>
                {kotaOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Kecamatan</span>
              <select
                className={`px-3 py-2 rounded-xl border ${
                  stationId
                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                    : "bg-white"
                }`}
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                disabled={!!stationId}
                title={
                  stationId
                    ? "Locked because a station is selected"
                    : "Select kecamatan"
                }
              >
                <option value="">-- Kecamatan --</option>
                {kecOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Kelurahan</span>
              <select
                className={`px-3 py-2 rounded-xl border ${
                  stationId
                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                    : "bg-white"
                }`}
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                disabled={!!stationId}
                title={
                  stationId
                    ? "Locked because a station is selected"
                    : "Select kelurahan"
                }
              >
                <option value="">-- Kelurahan --</option>
                {kelOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Manager and River Region placed below Kota/Kecamatan/Kelurahan as requested */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Manager</span>
              <select
                className={`px-3 py-2 rounded-xl border ${
                  stationId
                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                    : "bg-white"
                }`}
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                disabled={!!stationId}
                title={
                  stationId
                    ? "Locked because a station is selected"
                    : "Select manager"
                }
              >
                <option value="">-- Manager --</option>
                {managerOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">River Region</span>
              <select
                className={`px-3 py-2 rounded-xl border ${
                  stationId
                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                    : "bg-white"
                }`}
                value={riverRegion}
                onChange={(e) => setRiverRegion(e.target.value)}
                disabled={!!stationId}
                title={
                  stationId
                    ? "Locked because a station is selected"
                    : "Select river region"
                }
              >
                <option value="">-- River Region --</option>
                {riverOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">
              Timestamp (tanggal waktu)
            </span>
            <input
              type="datetime-local"
              className="px-3 py-2 rounded-xl border"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Reading</span>
            <input
              type="number"
              step="any"
              className="px-3 py-2 rounded-xl border"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Nama Operator</span>
            <input
              type="text"
              className="px-3 py-2 rounded-xl border"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              className="px-4 py-2 bg-[#636059] text-white rounded-xl"
              type="submit"
            >
              Submit
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded-xl"
              onClick={() => {
                // reset form
                setStationId("");
                setKota("");
                setKecamatan("");
                setKelurahan("");
                setManager("");
                setRiverRegion("");
                setTimestamp("");
                setReading("");
                setOperatorName("");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
