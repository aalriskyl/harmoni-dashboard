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

  useEffect(() => {
    // when station changes, auto-fill the location fields
    if (!stationId) return;
    const found = stationOptions.find((s) => s.id === stationId);
    if (!found) return;
    const p = found.props || {};
    setKota(p.Kota || p.Provinsi || p.City || "");
    setKecamatan(p.Kecamatan || p.District || "");
    setKelurahan(p.Kelurahan || p.Village || "");
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
  };

  return (
    <div className="p-4 bg-white">
      <h2 className="text-2xl font-semibold text-[#636059] mb-3">
        {title || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`}
      </h2>

      {loading ? (
        <div>Loading station data…</div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-xl">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Nama Stasiun</span>
            <select
              className="px-3 py-2 rounded border"
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
                className={`px-3 py-2 rounded border ${
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
                className={`px-3 py-2 rounded border ${
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
                className={`px-3 py-2 rounded border ${
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

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">
              Timestamp (tanggal waktu)
            </span>
            <input
              type="datetime-local"
              className="px-3 py-2 rounded border"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Reading</span>
            <input
              type="number"
              step="any"
              className="px-3 py-2 rounded border"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Nama Operator</span>
            <input
              type="text"
              className="px-3 py-2 rounded border"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              className="px-4 py-2 bg-[#636059] text-white rounded"
              type="submit"
            >
              Submit
            </button>
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={() => {
                // reset form
                setStationId("");
                setKota("");
                setKecamatan("");
                setKelurahan("");
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
