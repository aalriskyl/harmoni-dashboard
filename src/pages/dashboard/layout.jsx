import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-white text-[#636059] flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto z-50">
          <Outlet />
        </main>
      </div>
      <div className="z-10">
        <Footer />
      </div>
    </div>
  );
}
