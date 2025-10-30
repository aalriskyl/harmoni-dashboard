import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

const sampleTileBoundaries = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.82, -6.1755],
            [106.835, -6.1755],
            [106.835, -6.17],
            [106.82, -6.17],
            [106.82, -6.1755],
          ],
        ],
      },
      properties: {
        id: "tile-1",
        source: "DEMNAS",
        survey_date: "2021-05-12",
        resolution: "12 m",
        notes: "Public DEMNAS product",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.815, -6.176],
            [106.83, -6.176],
            [106.83, -6.171],
            [106.815, -6.171],
            [106.815, -6.176],
          ],
        ],
      },
      properties: {
        id: "tile-2",
        source: "LiDAR",
        survey_date: "2023-09-03",
        resolution: "1 m",
        notes: "High-resolution airborne LiDAR survey",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.824, -6.178],
            [106.839, -6.178],
            [106.839, -6.173],
            [106.824, -6.173],
            [106.824, -6.178],
          ],
        ],
      },
      properties: {
        id: "tile-3",
        source: "Terrestris",
        survey_date: "2022-02-20",
        resolution: "5 m",
        notes: "Converted terrain tiles from Terrestris repository",
      },
    },
  ],
};

const TopographyData = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  // Filters / UI state
  const [selectedDemSource, setSelectedDemSource] = useState("DEMNAS");
  // Use null to represent no date filter (equivalent to 'all')
  const [selectedSurveyDate, setSelectedSurveyDate] = useState(null);

  // The raster tile templates for each DEM source.
  // NOTE: These are placeholders — replace with real tile endpoints.
  const demRasters = {
    DEMNAS: {
      id: "demnas-raster",
      tiles: [
        // user should replace with real tiles or a tile server endpoint
        "https://tiles.example.com/demnas/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      opacity: 0.85,
    },
    LiDAR: {
      id: "lidar-raster",
      tiles: ["https://tiles.example.com/lidar/{z}/{x}/{y}.png"],
      tileSize: 256,
      opacity: 0.9,
    },
    Terrestris: {
      id: "terrestris-raster",
      tiles: ["https://tiles.example.com/terrestris/{z}/{x}/{y}.png"],
      tileSize: 256,
      opacity: 0.8,
    },
  };

  // Get unique survey dates from sample data (for potential UI hints)
  const surveyDates = Array.from(
    new Set(sampleTileBoundaries.features.map((f) => f.properties.survey_date))
  );

  // Get available DEM sources
  const demSources = [
    { value: "all", label: "Select DEM Source" },
    ...Object.keys(demRasters).map((source) => ({
      value: source,
      label: source,
    })),
  ];

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_TOKEN) {
      console.warn(
        "VITE_MAPBOX_ACCESS_TOKEN not provided. Mapbox features may not work without a token."
      );
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [106.82726262118713, -6.1749547950820505],
      zoom: 13,
      // force a strict bird's-eye (top-down) view
      pitch: 0,
      bearing: 0,
      // prevent user from tilting or rotating the camera
      maxPitch: 0,
      interactive: true,
    });
    mapRef.current = map;

    // Add navigation control but without the compass (no rotation)
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-left"
    );

    // Disable default drag rotate and touch rotate to keep birdview
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      // 1) Add Mapbox-provided raster-dem as a source and hillshade layer
      if (!map.getSource("mapbox-dem")) {
        try {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.terrain-rgb",
            tileSize: 512,
          });

          // hillshade layer on top of the base style
          map.addLayer(
            {
              id: "hillshade-layer",
              type: "hillshade",
              source: "mapbox-dem",
              paint: {
                "hillshade-exaggeration": 0.6,
                "hillshade-illumination-direction": 335,
              },
            },
            // place below labels if present
            "water"
          );
        } catch (e) {
          // ignore if mapbox account doesn't allow terrain source
          console.warn("Could not add raster-dem source for hillshade:", e);
        }
      }

      // 2) Add sample raster DEM layers (one per datasource). Only one visible at a time.
      Object.keys(demRasters).forEach((k) => {
        const config = demRasters[k];
        const sourceId = config.id;
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: "raster",
            tiles: config.tiles,
            tileSize: config.tileSize || 256,
          });
        }

        if (!map.getLayer(sourceId + "-layer")) {
          map.addLayer({
            id: sourceId + "-layer",
            type: "raster",
            source: sourceId,
            paint: { "raster-opacity": 0 }, // start invisible
          });
        }
      });

      // 3) Add vector overlay representing DEM tile boundaries (GeoJSON)
      if (!map.getSource("dem-tiles")) {
        map.addSource("dem-tiles", {
          type: "geojson",
          data: sampleTileBoundaries,
        });

        // fill layer for tiles
        map.addLayer({
          id: "dem-tiles-fill",
          type: "fill",
          source: "dem-tiles",
          paint: {
            "fill-color": [
              "match",
              ["get", "source"],
              "DEMNAS",
              "#f97316",
              "LiDAR",
              "#06b6d4",
              "Terrestris",
              "#a78bfa",
              "#888",
            ],
            "fill-opacity": 0.25,
          },
        });

        // outline
        map.addLayer({
          id: "dem-tiles-line",
          type: "line",
          source: "dem-tiles",
          paint: {
            "line-color": "#222",
            "line-width": 1.5,
          },
        });

        // Add a transparent circle layer for better hover hit area (optional)
        map.addLayer({
          id: "dem-tiles-hover-area",
          type: "fill",
          source: "dem-tiles",
          paint: { "fill-opacity": 0 },
        });
      }

      // Popup instance
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "custom-popup", // Add custom class for styling
      });

      // Hover handlers for vector layer
      map.on("mousemove", "dem-tiles-hover-area", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (!e.features || !e.features.length) return;
        const f = e.features[0];
        const props = f.properties || {};
        const html = `
          <div class="min-w-[200px] p-3">
            <div class="font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-200">
              DEM Source: ${props.source || "-"}
            </div>
            <div class="space-y-1 text-sm text-gray-600">
              <div class="flex justify-between">
                <span class="font-medium">Survey Date:</span>
                <span>${props.survey_date || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Resolution:</span>
                <span>${props.resolution || "-"}</span>
              </div>
              ${
                props.notes
                  ? `
                <div class="mt-2 pt-2 border-t border-gray-100">
                  <div class="font-medium text-gray-700 mb-1">Notes:</div>
                  <div class="text-gray-600 leading-relaxed">${props.notes}</div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        `;

        popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
      });

      map.on("mouseleave", "dem-tiles-hover-area", () => {
        map.getCanvas().style.cursor = "default";
        if (popupRef.current) popupRef.current.remove();
      });
    });

    // Add a small reset view control (top-right)
    const resetBtn = document.createElement("button");
    resetBtn.className =
      "mapboxgl-ctrl-icon hover:bg-gray-100 transition-colors duration-200";
    resetBtn.type = "button";
    resetBtn.title = "Reset bird's-eye view";
    resetBtn.innerHTML = "\u21BB"; // clockwise arrow
    resetBtn.onclick = () => {
      if (mapRef.current) {
        mapRef.current.easeTo({ pitch: 0, bearing: 0, zoom: 13 });
      }
    };

    const resetContainer = document.createElement("div");
    resetContainer.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    resetContainer.appendChild(resetBtn);
    map
      .getContainer()
      .querySelector(".mapboxgl-ctrl-top-right")
      ?.appendChild(resetContainer);

    return () => {
      try {
        if (popupRef.current) popupRef.current.remove();
        if (mapRef.current) mapRef.current.remove();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Toggle raster visibility when selectedDemSource changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    // Set all raster layers to 0 opacity, then enable the selected one
    Object.keys(demRasters).forEach((k) => {
      const layerId = demRasters[k].id + "-layer";
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, "raster-opacity", 0);
      }
    });

    // If the selectedDemSource is not "all", show it
    if (selectedDemSource !== "all" && demRasters[selectedDemSource]) {
      const layerId = demRasters[selectedDemSource].id + "-layer";
      if (map.getLayer(layerId)) {
        map.setPaintProperty(
          layerId,
          "raster-opacity",
          demRasters[selectedDemSource].opacity || 1
        );
      }
    }
  }, [selectedDemSource]);

  // Apply vector layer filters based on selectedDemSource and selectedSurveyDate
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    let filter = ["all"];

    // DEM Source filter
    if (selectedDemSource !== "all") {
      filter.push(["==", ["get", "source"], selectedDemSource]);
    }

    // Survey Date filter (selectedSurveyDate === null means no filter)
    if (selectedSurveyDate) {
      // map feature survey_date values are expected in YYYY-MM-DD format
      filter.push(["==", ["get", "survey_date"], selectedSurveyDate]);
    }

    // If no filters are applied, show all features
    if (filter.length === 1) {
      filter = true; // Show all features
    }

    try {
      if (map.getLayer("dem-tiles-fill"))
        map.setFilter("dem-tiles-fill", filter);
      if (map.getLayer("dem-tiles-line"))
        map.setFilter("dem-tiles-line", filter);
      if (map.getLayer("dem-tiles-hover-area"))
        map.setFilter("dem-tiles-hover-area", filter);
    } catch (e) {
      // ignore
    }
  }, [selectedDemSource, selectedSurveyDate]);

  // Simple CSV download for the sample tile metadata
  function downloadCSV() {
    try {
      const header = ["id", "source", "survey_date", "resolution", "notes"];
      const lines = [header.join(",")];
      (sampleTileBoundaries.features || []).forEach((f) => {
        const p = f.properties || {};
        const row = [
          p.id || "",
          p.source || "",
          p.survey_date || "",
          p.resolution || "",
          `"${(p.notes || "").replace(/"/g, '""')}"`,
        ];
        lines.push(row.join(","));
      });

      const blob = new Blob([lines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "topography_tiles.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate CSV", e);
    }
  }

  return (
    <div className="w-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/assets/logos/Topography Data Icon.svg"
            alt="cctv"
            className="w-12 h-12"
            style={{ filter: "invert(0.6)" }}
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-[#636059]">
              Topography Data
            </h1>
            <p className="text-sm text-[#636059]">
              Topography and related data
            </p>
          </div>
        </div>

        <div className="mb-2 text-xl font-semibold text-[#636059]">
          Filter Digital Elevation Model (DEM) Data
        </div>
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          {/* DEM Source Dropdown */}
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white min-w-[140px] hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              value={selectedDemSource}
              onChange={(e) => setSelectedDemSource(e.target.value)}
            >
              {demSources.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          {/* Survey Date Picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white min-w-[170px] hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              value={selectedSurveyDate || ""}
              onChange={(e) => {
                const v = e.target.value;
                // if empty string, treat as cleared
                setSelectedSurveyDate(v ? v : null);
              }}
            />

            <button
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200 font-medium text-gray-700 shadow-sm hover:shadow"
              onClick={() => setSelectedSurveyDate(null)}
              title="Clear date"
            >
              Clear
            </button>
          </div>

          {/* Download Data button moved out so `ml-auto` can push it to the right side of the toolbar */}
          <button
            onClick={() => {
              downloadCSV();
            }}
            className="ml-auto px-3 py-2 rounded-xl bg-[#636059] text-white"
          >
            Download Data
          </button>
        </div>
      </div>
      <div
        className="w-full p-0 h-[620px] rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
        ref={mapContainer}
      />
    </div>
  );
};

export default TopographyData;
