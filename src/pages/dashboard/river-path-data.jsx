import React, { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

const RiverPathData = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [features, setFeatures] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");

  // Derived lists for filters
  const names = useMemo(() => {
    const s = new Set();
    features.forEach((f) => {
      const n =
        f.properties?.name || f.properties?.NAME || f.properties?.River || "";
      if (n) s.add(n);
    });
    return Array.from(s).sort();
  }, [features]);

  const orders = useMemo(() => {
    const s = new Set();
    features.forEach((f) => {
      const p = f.properties || {};
      const ord =
        p.Strahler || p.order || p.stream_order || p.Strahler_Order || null;
      if (ord !== null && ord !== undefined && ord !== "") s.add(String(ord));
    });
    return Array.from(s).sort((a, b) => Number(a) - Number(b));
  }, [features]);

  // Load GeoJSON and add to map
  useEffect(() => {
    let cancelled = false;
    fetch("/data/Batas_Sungai_DKI_Jakarta.geojson")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const feats = data?.features || [];
        setFeatures(feats);

        // init map if not already
        if (!mapRef.current && mapContainer.current) {
          const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: [106.82726262118713, -6.1749547950820505],
            zoom: 11,
          });
          mapRef.current = map;

          map.on("load", () => {
            // add source
            if (!map.getSource("jakarta-rivers")) {
              map.addSource("jakarta-rivers", {
                type: "geojson",
                data: data,
              });
            }

            // line layer
            if (!map.getLayer("jakarta-rivers-line")) {
              map.addLayer({
                id: "jakarta-rivers-line",
                type: "line",
                source: "jakarta-rivers",
                paint: {
                  "line-color": "#0369a1",
                  "line-width": [
                    "interpolate",
                    ["linear"],
                    ["coalesce", ["to-number", ["get", "Strahler"]], 1],
                    1,
                    1.5,
                    2,
                    2.5,
                    3,
                    3.5,
                    4,
                    4.5,
                    5,
                    6,
                  ],
                  "line-opacity": 0.9,
                },
              });
            }

            // simple hover popup
            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
            });
            map.on("mousemove", "jakarta-rivers-line", (e) => {
              map.getCanvas().style.cursor = "pointer";
              const f = e.features && e.features[0];
              if (!f) return;
              const props = f.properties || {};
              const name = props.name || props.NAME || props.River || "Unknown";
              const ord =
                props.Strahler ||
                props.order ||
                props.stream_order ||
                props.Strahler_Order ||
                "-";
              const html = `<div style=\"min-width:140px;\"><strong>${name}</strong><div style=\"font-size:12px;\">Order: ${ord}</div></div>`;
              popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
            });
            map.on("mouseleave", "jakarta-rivers-line", () => {
              map.getCanvas().style.cursor = "";
              popup.remove();
            });
          });
        } else if (
          mapRef.current &&
          mapRef.current.getSource("jakarta-rivers")
        ) {
          mapRef.current.getSource("jakarta-rivers").setData(data);
        }
      })
      .catch((err) => console.error("Failed to load rivers geojson:", err));

    return () => {
      cancelled = true;
      // do not remove map here to allow reuse if user navigates away; small app-level map lifecycle
    };
  }, []);

  // Apply filters by setting a filter expression on the line layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer || !map.getLayer("jakarta-rivers-line")) return;

    const filters = ["all"]; // start with all
    if (selectedName) {
      // match any of name-like properties
      filters.push([
        "any",
        ["==", ["get", "name"], selectedName],
        ["==", ["get", "NAME"], selectedName],
        ["==", ["get", "River"], selectedName],
      ]);
    }
    if (selectedOrder) {
      filters.push([
        "==",
        [
          "to-string",
          [
            "coalesce",
            ["get", "Strahler"],
            ["get", "order"],
            ["get", "stream_order"],
            ["get", "Strahler_Order"],
            "",
          ],
        ],
        String(selectedOrder),
      ]);
    }

    try {
      map.setFilter(
        "jakarta-rivers-line",
        filters.length === 1 ? null : filters
      );
    } catch (e) {
      // ignore
    }
  }, [selectedName, selectedOrder]);

  const toggleVisibility = () => {
    const map = mapRef.current;
    setVisible((v) => {
      const nv = !v;
      if (map && map.getLayer && map.getLayer("jakarta-rivers-line")) {
        map.setLayoutProperty(
          "jakarta-rivers-line",
          "visibility",
          nv ? "visible" : "none"
        );
      }
      return nv;
    });
  };

  // Download CSV (Excel-friendly). Flatten properties and include coordinates as WKT-like LINESTRING
  const downloadCSV = () => {
    const map = mapRef.current;
    // Use current filter to derive visible features from the stored features array
    let out = features.slice();
    if (selectedName)
      out = out.filter((f) => {
        const n =
          f.properties?.name || f.properties?.NAME || f.properties?.River || "";
        return n === selectedName;
      });
    if (selectedOrder)
      out = out.filter((f) => {
        const p = f.properties || {};
        const ord =
          p.Strahler || p.order || p.stream_order || p.Strahler_Order || null;
        return String(ord) === String(selectedOrder);
      });

    if (!out.length) {
      alert("No features to download for the current filters.");
      return;
    }

    // Build CSV header from union of property keys
    const allKeys = new Set();
    out.forEach((f) =>
      Object.keys(f.properties || {}).forEach((k) => allKeys.add(k))
    );
    const keys = Array.from(allKeys);

    const rows = [];
    // header
    rows.push(["id", ...keys, "geometry"]);

    out.forEach((f, idx) => {
      const props = f.properties || {};
      const geom = f.geometry || {};
      let geomText = "";
      if (geom.type === "LineString") {
        const coords = geom.coordinates.map((c) => `${c[0]} ${c[1]}`).join(",");
        geomText = `LINESTRING(${coords})`;
      } else if (geom.type === "MultiLineString") {
        const parts = geom.coordinates
          .map((part) => `(${part.map((c) => `${c[0]} ${c[1]}`).join(",")})`)
          .join(",");
        geomText = `MULTILINESTRING(${parts})`;
      } else {
        geomText = JSON.stringify(geom.coordinates || "");
      }

      const row = [
        f.id || idx,
        ...keys.map((k) => {
          let v = props[k];
          if (v === undefined || v === null) return "";
          // escape quotes
          return String(v).replace(/"/g, '""');
        }),
        geomText.replace(/"/g, '""'),
      ];
      rows.push(row);
    });

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jakarta_rivers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/assets/logos/River Path Data Icon.svg"
          alt="cctv"
          className="w-12 h-12"
          style={{ filter: "invert(0.6)" }}
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#636059]">River Paths</h1>
          <p className="text-sm text-[#636059]">
            Jakarta river vector layer with filters and downloads
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVisibility}
            className="px-3 py-1 rounded-xl border bg-white"
          >
            {visible ? "Hide" : "Show"} Rivers
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">River name</label>
          <select
            className="px-3 py-1 border rounded-xl"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            <option value="">All</option>
            {names.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">River order</label>
          <select
            className="px-3 py-1 border rounded-xl"
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
          >
            <option value="">All</option>
            {orders.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="px-3 py-1 rounded-xl border bg-white"
          >
            Download Excel (CSV)
          </button>
        </div>
      </div>

      <div ref={mapContainer} className="w-full h-[620px] rounded-lg" />
    </div>
  );
};

export default RiverPathData;
