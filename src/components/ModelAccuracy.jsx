import React, { useEffect, useState } from "react";

export default function ModelAccuracy({ initialAccuracy = 0.87 }) {
  const [accuracy, setAccuracy] = useState(() => Number(initialAccuracy) || 0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("modelAccuracyUpdate", {
          detail: { accuracy, lastUpdated },
        })
      );
    } catch (e) {
      // ignore
    }
  }, [accuracy, lastUpdated]);

  const refreshAccuracy = () => {
    const delta = (Math.random() - 0.5) * 0.02;
    const next = Math.max(
      0,
      Math.min(1, Number((accuracy + delta).toFixed(3)))
    );
    setAccuracy(next);
    setLastUpdated(new Date());
  };

  function formatPercent(v) {
    return "82%";
  }

  return (
    <div
      role="region"
      aria-label="Model Accuracy"
      className="fixed bottom-20 left-[24rem] z-50 pointer-events-none flex justify-center items-start"
    >
      <div className="pointer-events-auto gap-4 flex flex-row text-center">
        <div className="text-sm bg-white rounded-md  px-2 py-2 font-semibold text-gray-800">
          Last Calibration: 28-02-2023
        </div>
        <div className="text-sm bg-white rounded-lg  px-2 py-2 font-semibold text-gray-800">
          Model Accuracy : {formatPercent(accuracy)}
        </div>
      </div>
    </div>
  );
}
