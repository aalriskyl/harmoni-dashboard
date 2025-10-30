import React, { useState } from "react";

export default function CCTVData() {
  // sample YouTube video IDs to use as dummy streams
  const sampleVideos = [
    { id: "dQw4w9WgXcQ", name: "Never Gonna Give You Up" },
    { id: "M7lc1UVf-VE", name: "Python Introduction" },
    { id: "e-ORhEE9VVg", name: "Blank Space" },
    { id: "kXYiU_JCYtU", name: "Learn JavaScript" },
    { id: "3JZ_D3ELwOQ", name: "What Does The Fox Say" },
    { id: "LXb3EKWsInQ", name: "Tokyo Drift" },
    { id: "fJ9rUzIMcZQ", name: "Don't Stop Believin" },
  ];

  // Initial state for each CCTV camera with random videos
  const initialItems = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: `CCTV Camera ${i + 1}`,
    kelurahan: `Kelurahan ${(i % 3) + 1}`,
    kota: `Kota ${(i % 2) + 1}`,
    timestamp: new Date().toLocaleString(),
    videoId: sampleVideos[Math.floor(Math.random() * sampleVideos.length)].id,
  }));

  const [items, setItems] = useState(initialItems);

  const handleVideoChange = (cameraId, newVideoId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cameraId
          ? {
              ...item,
              videoId: newVideoId,
              timestamp: new Date().toLocaleString(),
            }
          : item
      )
    );
  };

  // Filter items to only show those that don't have "none" selected
  const activeItems = items.filter((item) => item.videoId !== "none");

  // Calculate grid columns based on number of active items
  const getGridCols = () => {
    const count = activeItems.length;
    if (count === 0) return "grid-cols-1";
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 lg:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  // Calculate video height based on number of active items
  const getVideoHeight = () => {
    const count = activeItems.length;
    if (count <= 2) return "h-[450px]"; // Larger height for 1-2 videos
    if (count <= 4) return "h-80"; // Medium height for 3-4 videos
    return "h-60"; // Default height for 5-6 videos
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/assets/logos/CCTV Data Icon.svg"
          alt="cctv"
          className="w-12 h-12"
          style={{ filter: "invert(0.6)" }}
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#636059]">CCTV Data</h1>
          <p className="text-sm text-[#636059]">
            CCTV profiles and related data
          </p>
        </div>
      </div>

      <div className="flex flex-row flex-wrap gap-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col min-w-[200px]">
            <label
              htmlFor={`cctv-${item.id}`}
              className="text-sm font-medium text-[#636059] mb-1"
            >
              {item.name}
            </label>
            <select
              id={`cctv-${item.id}`}
              value={item.videoId}
              onChange={(e) => handleVideoChange(item.id, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="none">None</option>
              {sampleVideos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mb-4 text-sm text-[#636059]">
        Showing {activeItems.length} of {items.length} cameras
      </div>

      <div className={`grid ${getGridCols()} gap-4`}>
        {activeItems.map((it) => (
          <div
            key={it.id}
            className="relative overflow-hidden h-full flex flex-col border border-gray-200 rounded-lg"
          >
            {/* overlay bar on top of the card (name left, kelurahan/kota right) */}
            <div className="pt-2 pb-2 px-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#333] truncate">
                  {it.name}
                </div>
                <div className="text-sm text-[#636059] truncate">
                  {it.kelurahan}, {it.kota}
                </div>
              </div>
            </div>

            {/* video embed with dynamic height */}
            <div
              className={`w-full ${getVideoHeight()} bg-black/70 relative overflow-hidden`}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${it.videoId}?rel=0&modestbranding=1`}
                title={`YouTube video ${it.name}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* bottom area with timestamp and selected video name */}
            <div className="mt-auto p-3 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-[#636059]">
                <div className="text-xs text-gray-500 truncate">
                  {sampleVideos.find((video) => video.id === it.videoId)?.name}
                </div>
                <div className="text-xs text-right text-gray-500 whitespace-nowrap">
                  {it.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">No cameras selected</div>
          <div className="text-gray-400 text-sm">
            Select videos from the dropdowns above to display CCTV feeds
          </div>
        </div>
      )}
    </div>
  );
}
