import React from "react";
import { Link, useLocation } from "react-router-dom";
import ReportForm from "./components/ReportForm";

export default function DashboardReports() {
  const location = useLocation();
  const path = location.pathname || "";
  // path example: /dashboard/rain-report
  const last = path.split("/").filter(Boolean).pop() || "reports";

  // Map route to type prop for ReportForm
  let type = null;
  if (last === "rain-report") type = "rain";
  else if (last === "water-level-report") type = "water";
  else if (last === "flood-report") type = "water"; // flood uses water dataset for now

  if (!type) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-[#636059]">Reports</h2>
        <p className="mt-2">Choose a report type:</p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to="/dashboard/rain-report"
            className="px-3 py-2 rounded bg-gray-100 w-max"
          >
            Rain Report
          </Link>
          <Link
            to="/dashboard/water-level-report"
            className="px-3 py-2 rounded bg-gray-100 w-max"
          >
            Water Level Report
          </Link>
          <Link
            to="/dashboard/flood-report"
            className="px-3 py-2 rounded bg-gray-100 w-max"
          >
            Flood Report
          </Link>
        </div>
      </div>
    );
  }

  // Friendly title mapping
  const titleMap = {
    rain: "Rain Data Report",
    water: "Water Level Data Report",
    flood: "Flood Data Report",
  };
  const title = titleMap[type] || `${type} Data Report`;

  return (
    <div className="flex">
      <div className="w-2/3">
        <ReportForm type={type} title={title} />
      </div>
      <div className="w-1/3 pl-6"></div>
    </div>
  );
}
