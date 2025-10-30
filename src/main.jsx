import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import WelcomePopup from "./components/WelcomePopup.jsx";
import DashboardLayout from "./pages/dashboard/layout.jsx";
import DashboardIndex from "./pages/dashboard/index.jsx";
import DashboardReports from "./pages/dashboard/reports.jsx";
import DashboardSettings from "./pages/dashboard/settings.jsx";
import RainLevelData from "./pages/dashboard/rain-level-data.jsx";
import WaterLevelData from "./pages/dashboard/water-level-data.jsx";
import CrossSectionData from "./pages/dashboard/cross-section-data.jsx";
import AlertOverview from "./pages/dashboard/alert-overview.jsx";
import CCTVData from "./pages/dashboard/cctv-data.jsx";
import TopographyData from "./pages/dashboard/topography-data.jsx";
import RiverPathData from "./pages/dashboard/river-path-data.jsx";
import APIPort from "./pages/dashboard/api-port.jsx";

function AppRoot() {
  const [showWelcome, setShowWelcome] = useState(true);
  // Keep a synchronous global flag so other components can detect the welcome
  // overlay exists during initial render (helps on page refresh).
  if (typeof window !== "undefined") {
    window.__welcomeVisible = !!showWelcome;
  }
  return (
    <StrictMode>
      {showWelcome && (
        <WelcomePopup
          onDismiss={() => {
            setShowWelcome(false);
            if (typeof window !== "undefined") window.__welcomeVisible = false;
          }}
        />
      )}
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/dashboard/*" element={<DashboardLayout />}>
        <Route index element={<DashboardIndex />} />
        <Route path="reports" element={<DashboardReports />} />
        <Route path="rain-report" element={<DashboardReports />} />
        <Route path="water-level-report" element={<DashboardReports />} />
        <Route path="flood-report" element={<DashboardReports />} />
        <Route path="rain-level-data" element={<RainLevelData />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="water-level-data" element={<WaterLevelData />} />
        <Route path="cross-section-data" element={<CrossSectionData />} />
        <Route path="alert-overview" element={<AlertOverview />} />
        <Route path="cctv-data" element={<CCTVData />} />
        <Route path="topography-data" element={<TopographyData />} />
        <Route path="river-path-data" element={<RiverPathData />} />
        <Route path="api-port" element={<APIPort />} />
      </Route>
      <Route path="/" element={<AppRoot />} />
    </Routes>
  </BrowserRouter>
);
