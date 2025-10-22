import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function Sidebar() {
  const [isReportOpen, setIsReportOpen] = useState(false);

  const toggleReport = () => {
    setIsReportOpen(!isReportOpen);
  };

  return (
    <aside className="w-64 bg-[#afa99e] text-white h-auto p-4 flex flex-col">
      <div className="text-xl font-bold mb-4">MAIN FUNCTION</div>

      <nav className="flex flex-col gap-2">
        <Link
          to="/"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/FEWS Platform Icon.svg"
            alt="FEWS"
            className="w-4 h-4"
          />
          <span>FEWS Platform</span>
        </Link>

        <Link
          to="/dashboard/alert-overview"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/Alert Overview Icon.svg"
            alt="Alerts"
            className="w-4 h-4"
          />
          <span>Alert Overview</span>
        </Link>

        <Link
          to="/dashboard/rain-level-data"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/Rain Level Data Icon.svg"
            alt="Rain"
            className="w-4 h-4"
          />
          <span>Rain Level Data</span>
        </Link>

        <Link
          to="/dashboard/water-level-data"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/Water Level Data Icon.svg"
            alt="Water"
            className="w-4 h-4"
          />
          <span>Water Level Data</span>
        </Link>

        <Link
          to="/dashboard/cross-section-data"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/Cross Section Data Icon.svg"
            alt="Cross Section"
            className="w-4 h-4"
          />
          <span>Cross Section Data</span>
        </Link>

        <Link
          to="/dashboard/pump-station-data"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/Pump Station Data Icon.svg"
            alt="Pumps"
            className="w-4 h-4"
          />
          <span>Pump Station Data</span>
        </Link>

        <Link
          to="/dashboard/river-path-data"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/River Path Data Icon.svg"
            alt="River"
            className="w-4 h-4"
          />
          <span>River Path Data</span>
        </Link>

        <Link
          to="/dashboard/topography-data"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/Topography Data Icon.svg"
            alt="Topography"
            className="w-4 h-4"
          />
          <span>Topography Data</span>
        </Link>

        <Link
          to="/dashboard/cctv-data"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/CCTV Data Icon.svg"
            alt="CCTV"
            className="w-4 h-4"
          />
          <span>CCTV Data</span>
        </Link>

        {/* Collapsible Report Section */}
        <div className="flex flex-col">
          <button
            onClick={toggleReport}
            className="flex items-center justify-between gap-3 py-2 px-3 rounded hover:bg-[#555149] w-full text-left"
          >
            <div className="flex items-center gap-3">
              <img
                src="/assets/logos/Flood Report Data Icon.svg"
                alt="Report"
                className="w-4 h-4"
              />
              <span>Report</span>
            </div>
            {isReportOpen ? (
              <FaChevronDown className="w-3 h-3" />
            ) : (
              <FaChevronRight className="w-3 h-3" />
            )}
          </button>

          {isReportOpen && (
            <div className="ml-6 mt-1 flex flex-col gap-1">
              <Link
                to="/dashboard/flood-report"
                className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149] text-sm"
              >
                <span>Flood Report</span>
              </Link>
              <Link
                to="/dashboard/rain-report"
                className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149] text-sm"
              >
                <span>Rain Report</span>
              </Link>
              <Link
                to="/dashboard/water-level-report"
                className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149] text-sm"
              >
                <span>Water Level Report</span>
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/dashboard/api-port"
          className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
        >
          <img
            src="/assets/logos/API Port Icon.svg"
            alt="API Port"
            className="w-4 h-4"
          />
          <span>API Port</span>
        </Link>
      </nav>

      <div className="border-t border-white/20 mt-4 pt-3">
        <div className="text-xl font-bold mb-4">SYSTEM INFORMATION</div>
        <nav className="flex flex-col gap-2">
          <Link
            to="/dashboard/chain-of-command"
            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
          >
            <img
              src="/assets/logos/Chain of Command Icon.svg"
              alt="Chain"
              className="w-4 h-4"
            />
            <span>Chain of Command</span>
          </Link>
          <Link
            to="/dashboard/fews-concept"
            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
          >
            <img
              src="/assets/logos/FEWS Concept Icon.svg"
              alt="FEWS Concept"
              className="w-4 h-4"
            />
            <span>FEWS Concept</span>
          </Link>
          <Link
            to="/dashboard/about-bbws"
            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#555149]"
          >
            <img
              src="/assets/logos/About Icon.svg"
              alt="About"
              className="w-4 h-4"
            />
            <span>About BBWS</span>
          </Link>
        </nav>
      </div>

      <div className="text-xs text-white/70 pt-2">Version Beta - Harmoni</div>
    </aside>
  );
}
