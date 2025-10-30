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
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // Enhanced color and width scheme with maximum differentiation
  const getStyleByOrder = (order) => {
    const orderNum = Number(order) || 1;
    const clampedOrder = Math.min(8, Math.max(1, orderNum)); // Support up to order 8

    const styleScheme = {
      1: {
        color: "#1f77b4", // Blue - small streams
        width: 1.2,
        opacity: 0.7,
        label: "1st Order (Headwaters)",
        description: "Smallest tributaries without branches",
      },
      2: {
        color: "#ff7f0e", // Orange - medium streams
        width: 2.0,
        opacity: 0.8,
        label: "2nd Order",
        description: "Formed by joining 1st order streams",
      },
      3: {
        color: "#2ca02c", // Green - larger streams
        width: 3.0,
        opacity: 0.9,
        label: "3rd Order",
        description: "Medium tributaries",
      },
      4: {
        color: "#d62728", // Red - small rivers
        width: 4.0,
        opacity: 0.9,
        label: "4th Order",
        description: "Small rivers",
      },
      5: {
        color: "#9467bd", // Purple - medium rivers
        width: 5.0,
        opacity: 1.0,
        label: "5th Order",
        description: "Medium rivers",
      },
      6: {
        color: "#8c564b", // Brown - large rivers
        width: 6.0,
        opacity: 1.0,
        label: "6th Order",
        description: "Large rivers",
      },
      7: {
        color: "#e377c2", // Pink - very large rivers
        width: 7.0,
        opacity: 1.0,
        label: "7th Order",
        description: "Major rivers",
      },
      8: {
        color: "#7f7f7f", // Gray - largest rivers
        width: 8.0,
        opacity: 1.0,
        label: "8th Order",
        description: "Largest river systems",
      },
    };

    return (
      styleScheme[clampedOrder] || {
        color: "#636059",
        width: 1.0,
        opacity: 0.7,
        label: `Order ${clampedOrder}`,
        description: "River segment",
      }
    );
  };

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

        // Enhanced feature processing with order-based styling
        const featuresEnhanced = feats.map((f) => {
          const p = f.properties || {};
          let ord =
            p.Strahler || p.order || p.stream_order || p.Strahler_Order || 1;
          ord = Number(ord) || 1;
          const style = getStyleByOrder(ord);

          return {
            ...f,
            properties: {
              ...p,
              _color: style.color,
              _width: style.width,
              _opacity: style.opacity,
              _order: ord,
              _orderLabel: style.label,
              _orderDescription: style.description,
            },
          };
        });

        setFeatures(featuresEnhanced);

        // Initialize map if not already
        if (!mapRef.current && mapContainer.current) {
          const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: [106.82726262118713, -6.1749547950820505],
            zoom: 11,
            pitch: 0,
            bearing: 0,
            maxPitch: 0,
            interactive: true,
          });
          mapRef.current = map;

          // Disable rotation/tilt interactions
          map.dragRotate.disable();
          map.touchZoomRotate.disableRotation();

          map.on("load", () => {
            // Add source with enhanced features
            if (!map.getSource("jakarta-rivers")) {
              map.addSource("jakarta-rivers", {
                type: "geojson",
                data: { ...data, features: featuresEnhanced },
              });
            }

            // Main river line layer
            if (!map.getLayer("jakarta-rivers-line")) {
              map.addLayer({
                id: "jakarta-rivers-line",
                type: "line",
                source: "jakarta-rivers",
                paint: {
                  "line-color": ["get", "_color"],
                  "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    ["get", "_width"],
                    15,
                    ["*", ["get", "_width"], 1.5],
                    20,
                    ["*", ["get", "_width"], 2],
                  ],
                  "line-opacity": ["get", "_opacity"],
                  "line-cap": "round",
                  "line-join": "round",
                },
                layout: {
                  "line-cap": "round",
                  "line-join": "round",
                },
              });
            }

            // Add hover highlight layer
            if (!map.getLayer("jakarta-rivers-highlight")) {
              map.addLayer({
                id: "jakarta-rivers-highlight",
                type: "line",
                source: "jakarta-rivers",
                paint: {
                  "line-color": "#ffff00",
                  "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    ["+", ["get", "_width"], 2],
                    15,
                    ["+", ["get", "_width"], 3],
                    20,
                    ["+", ["get", "_width"], 4],
                  ],
                  "line-opacity": 0.8,
                  "line-blur": 1,
                },
                filter: ["==", "id", ""], // Initially hide all
              });
            }

            // Create enhanced legend
            const legend = document.createElement("div");
            legend.className = "map-legend";
            legend.style.cssText = `
              position: absolute;
              bottom: 20px;
              left: 20px;
              background: rgba(255, 255, 255, 0.95);
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              font-family: sans-serif;
              font-size: 12px;
              max-width: 280px;
              max-height: 400px;
              overflow-y: auto;
              border: 1px solid #ddd;
            `;

            let legendHTML = `
              <div style="font-weight: bold; margin-bottom: 12px; font-size: 14px; color: #333;">
                River Stream Order Classification
              </div>
              <div style="font-size: 11px; color: #666; margin-bottom: 15px; line-height: 1.3;">
                Strahler Stream Order: Higher numbers indicate larger river segments
              </div>
            `;

            // Get unique orders from actual data and sort them
            const uniqueOrders = [
              ...new Set(featuresEnhanced.map((f) => f.properties._order)),
            ].sort((a, b) => a - b);

            uniqueOrders.forEach((order) => {
              const style = getStyleByOrder(order);
              legendHTML += `
                <div style="display: flex; align-items: flex-start; margin-bottom: 8px; padding: 4px; border-radius: 4px; background: ${
                  hoveredFeature?.properties?._order === order
                    ? "#f0f8ff"
                    : "transparent"
                };">
                  <div style="flex-shrink: 0; width: 24px; height: ${
                    style.width
                  }px; background: ${
                style.color
              }; margin-right: 12px; margin-top: 2px; border-radius: 1px;"></div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: ${style.color};">${
                style.label
              }</div>
                    <div style="font-size: 10px; color: #666; line-height: 1.2;">${
                      style.description
                    }</div>
                    <div style="font-size: 9px; color: #999;">Width: ${
                      style.width
                    }px • Order: ${order}</div>
                  </div>
                </div>
              `;
            });

            legend.innerHTML = legendHTML;
            mapContainer.current.appendChild(legend);

            // Enhanced hover interactions
            const popup = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: false,
              maxWidth: "300px",
            });

            map.on("mousemove", "jakarta-rivers-line", (e) => {
              map.getCanvas().style.cursor = "pointer";
              const f = e.features && e.features[0];
              if (!f) return;

              setHoveredFeature(f);

              // Update highlight layer
              map.setFilter("jakarta-rivers-highlight", ["==", "id", f.id]);

              const props = f.properties || {};
              const name =
                props.name || props.NAME || props.River || "Unnamed River";
              const order = props._order || "-";
              const orderLabel = props._orderLabel || `Order ${order}`;
              const width = props._width || 1;
              const color = props._color || "#636059";

              const html = `
                <div style="min-width: 200px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #333;">${name}</div>
                  <div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <div style="width: 12px; height: ${width}px; background: ${color}; margin-right: 8px; border-radius: 1px;"></div>
                    <span style="font-weight: 600; color: ${color};">${orderLabel}</span>
                  </div>
                  <div style="font-size: 11px; color: #666; line-height: 1.3;">
                    <div>Stream Order: <strong>${order}</strong></div>
                    <div>Line Width: <strong>${width}px</strong></div>
                    ${
                      props._orderDescription
                        ? `<div style="margin-top: 4px; font-style: italic;">${props._orderDescription}</div>`
                        : ""
                    }
                  </div>
                </div>`;

              popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
            });

            map.on("mouseleave", "jakarta-rivers-line", () => {
              map.getCanvas().style.cursor = "";
              popup.remove();
              setHoveredFeature(null);
              map.setFilter("jakarta-rivers-highlight", ["==", "id", ""]);
            });
          });
        } else if (
          mapRef.current &&
          mapRef.current.getSource("jakarta-rivers")
        ) {
          // Update existing source
          const dataEnhanced = { ...data, features: featuresEnhanced };
          mapRef.current.getSource("jakarta-rivers").setData(dataEnhanced);
        }
      })
      .catch((err) => console.error("Failed to load rivers geojson:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  // Update legend when hover changes
  useEffect(() => {
    const legend = document.querySelector(".map-legend");
    if (!legend) return;

    const uniqueOrders = [
      ...new Set(features.map((f) => f.properties?._order)),
    ].sort((a, b) => a - b);

    let legendHTML = `
      <div style="font-weight: bold; margin-bottom: 12px; font-size: 14px; color: #333;">
        River Stream Order Classification
      </div>
      <div style="font-size: 11px; color: #666; margin-bottom: 15px; line-height: 1.3;">
        Strahler Stream Order: Higher numbers indicate larger river segments
      </div>
    `;

    uniqueOrders.forEach((order) => {
      const style = getStyleByOrder(order);
      legendHTML += `
        <div style="display: flex; align-items: flex-start; margin-bottom: 8px; padding: 4px; border-radius: 4px; background: ${
          hoveredFeature?.properties?._order === order
            ? "#f0f8ff"
            : "transparent"
        };">
          <div style="flex-shrink: 0; width: 24px; height: ${
            style.width
          }px; background: ${
        style.color
      }; margin-right: 12px; margin-top: 2px; border-radius: 1px;"></div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: ${style.color};">${
        style.label
      }</div>
            <div style="font-size: 10px; color: #666; line-height: 1.2;">${
              style.description
            }</div>
            <div style="font-size: 9px; color: #999;">Width: ${
              style.width
            }px • Order: ${order}</div>
          </div>
        </div>
      `;
    });

    legend.innerHTML = legendHTML;
  }, [hoveredFeature, features]);

  // Apply filters
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer || !map.getLayer("jakarta-rivers-line")) return;

    const filters = ["all"];
    if (selectedName) {
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
      map.setFilter(
        "jakarta-rivers-highlight",
        filters.length === 1
          ? ["==", "id", ""]
          : ["all", filters, ["!=", "id", ""]]
      );
    } catch (e) {
      console.warn("Filter error:", e);
    }
  }, [selectedName, selectedOrder]);

  const toggleVisibility = () => {
    const map = mapRef.current;
    setVisible((v) => {
      const nv = !v;
      if (map && map.getLayer && map.getLayer("jakarta-rivers-line")) {
        const visibility = nv ? "visible" : "none";
        map.setLayoutProperty("jakarta-rivers-line", "visibility", visibility);
        map.setLayoutProperty(
          "jakarta-rivers-highlight",
          "visibility",
          visibility
        );
      }
      return nv;
    });
  };

  // Download JSON
  const downloadJSON = () => {
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

    // Create GeoJSON structure
    const geoJSON = {
      type: "FeatureCollection",
      features: out.map((feature) => ({
        type: "Feature",
        properties: feature.properties,
        geometry: feature.geometry,
      })),
    };

    const jsonString = JSON.stringify(geoJSON, null, 2); // Pretty print with 2 spaces
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jakarta_rivers_${new Date().toISOString().slice(0, 10)}.json`;
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
            Jakarta rivers with distinct visual coding for stream orders
            (Strahler classification)
          </p>
        </div>
      </div>

      {/* Controls section with proper flex layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleVisibility}
            className="px-3 py-1 rounded-xl border bg-white hover:bg-gray-50 transition-colors"
          >
            {visible ? "Hide" : "Show"} Rivers
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">River name</label>
            <select
              className="px-3 py-1 border rounded-xl bg-white"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              <option value="">All Rivers</option>
              {names.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Stream order</label>
            <select
              className="px-3 py-1 border rounded-xl bg-white"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
            >
              <option value="">All Orders</option>
              {orders.map((o) => (
                <option key={o} value={o}>
                  Order {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Download button positioned at the far right */}
        <div className="flex items-center ml-auto">
          <button
            onClick={downloadJSON}
            className="px-4 py-2 rounded-xl bg-[#636059] text-white hover:bg-[#4a4843] transition-colors whitespace-nowrap"
          >
            Download Data
          </button>
        </div>
      </div>

      <div
        ref={mapContainer}
        className="w-full h-[620px] rounded-lg relative border border-gray-300"
      />
    </div>
  );
};

export default RiverPathData;
