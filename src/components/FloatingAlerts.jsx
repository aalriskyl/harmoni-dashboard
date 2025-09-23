import React from "react";

// FloatingAlerts is rendered inside a portal and positioned by the parent DropdownPortal.
// Accepts an optional `className` and `style` to allow positioning by the portal wrapper.
export default function FloatingAlerts({ className = "", style = {} }) {
  const alerts = [
    {
      id: 1,
      title: "Road closure near DAS Ciliwung",
      level: "High",
      time: "2m ago",
    },
    { id: 2, title: "Pump station offline", level: "Medium", time: "10m ago" },
    { id: 3, title: "Heavy rain expected", level: "Low", time: "30m ago" },
  ];

  return (
    <div className={className} style={style} aria-live="polite">
      <div className="w-72 bg-white rounded-2xl shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-800">Alerts</h4>
          <button className="text-xs text-gray-500">View all</button>
        </div>

        <div className="space-y-2 max-h-64 overflow-auto">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 border border-gray-50"
            >
              <div
                className={`w-2 h-8 rounded-sm mt-1 flex-shrink-0 ${
                  a.level === "High"
                    ? "bg-red-500"
                    : a.level === "Medium"
                    ? "bg-yellow-400"
                    : "bg-green-400"
                }`}
                aria-hidden
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-800">
                    {a.title}
                  </div>
                  <div className="text-xs text-gray-400">{a.time}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Level: {a.level}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
