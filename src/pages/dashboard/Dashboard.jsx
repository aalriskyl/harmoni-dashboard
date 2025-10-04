import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#636059]">Dashboard</h1>
      <p className="mt-2 text-[#636059]">This is the dashboard route.</p>
      <div className="mt-4">
        <Link to="/" className="text-[#636059] underline">
          Back to app
        </Link>
      </div>
    </div>
  );
}
