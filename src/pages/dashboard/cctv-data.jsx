import React from "react";

export default function CCTVData() {
  // sample YouTube video IDs to use as dummy streams
  const sampleVideos = [
    "dQw4w9WgXcQ",
    "M7lc1UVf-VE",
    "e-ORhEE9VVg",
    "kXYiU_JCYtU",
    "3JZ_D3ELwOQ",
    "LXb3EKWsInQ",
    "fJ9rUzIMcZQ",
  ];

  // create 6 dummy items with random video IDs
  const items = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: `CCTV Camera ${i + 1}`,
    kelurahan: `Kelurahan ${(i % 3) + 1}`,
    kota: `Kota ${(i % 2) + 1}`,
    timestamp: new Date().toLocaleString(),
    videoId: sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
  }));

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/assets/logos/CCTV Data Icon.svg"
          alt="cctv"
          className="w-12 h-12"
          style={{ filter: "invert(0.6)" }}
        />
        <h1 className="text-2xl font-semibold text-[#636059]">CCTV Data</h1>
      </div>

      <div className="mb-2 text-lg font-semibold text-[#636059]">
        Live CCTV feeds (dummy placeholders)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div
            key={it.id}
            className="relative  overflow-hidden h-full flex flex-col"
          >
            {/* overlay bar on top of the card (name left, kelurahan/kota right) */}
            <div className=" pt-2 pb-2 ">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#333] truncate">
                  {it.name}
                </div>
                <div className="text-sm text-[#636059] truncate">
                  {it.kelurahan}, {it.kota}
                </div>
              </div>
            </div>

            {/* video embed */}
            <div className="w-full h-60 bg-black/70 relative overflow-hidden">
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

            {/* bottom area with timestamp on the right */}
            <div className="mt-auto p-3 flex items-center justify-between text-sm text-[#636059]">
              <div />
              <div className="text-xs text-right text-gray-500">
                {it.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
