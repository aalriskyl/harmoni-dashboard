import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LocationGraph = ({ selectedPoint, onClose }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!selectedPoint) return;

    // Sample data for the chart
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const data = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 400)
    );

    // Define threshold ranges
    const thresholds = {
      normal: 202.25,
      caution: 303.25,
      alert: 338.68,
      severe: 369.26,
    };

    // Create background colors based on thresholds
    const backgroundColors = data.map((value) => {
      if (value > thresholds.severe) return "#B518FA"; // Flood
      if (value > thresholds.alert) return "#ff0000"; // Severe
      if (value > thresholds.caution) return "#ffa500"; // Alert
      if (value > thresholds.normal) return "#ffff00"; // Caution
      return "#C8FAF9"; // Normal
    });

    const ctx = chartRef.current.getContext("2d");

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            borderColor: "#4B5563",
            borderWidth: 1,
            pointBackgroundColor: backgroundColors,
            pointBorderColor: "#000",
            pointBorderWidth: 0.5,
            pointRadius: 4,
            pointHoverRadius: 5,
            fill: false,
            tension: 0.1,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Discharge: ${context.raw.toFixed(2)} m³/s`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
              font: {
                size: 8,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#E0E0E0",
            },
            ticks: {
              font: {
                size: 8,
              },
            },
            title: {
              display: true,
              text: "Discharge (m³/s)",
              font: {
                size: 10,
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [selectedPoint]);

  if (!selectedPoint) return null;

  return (
    <div className="h-[250px] z-100 absolute bottom-0 sm:bottom-2 left-3 sm:left-6 w-[calc(100%-24px)] sm:w-[calc(100%-48px)] rounded-[12px] border border-black/10 overflow-hidden bg-[#F4F3F1]">
      <div className="p-3 flex flex-col">
        <div className="flex justify-between items-center">
          <p className="text-[#161414] text-xs font-medium">
            Discharge Curve - {selectedPoint.title}
          </p>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex items-center">
          <div className="h-[184px] w-full relative mt-2">
            <canvas ref={chartRef} role="img"></canvas>
          </div>
        </div>

        <div className="flex justify-center gap-3 items-center mt-1 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#B518FA] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Flood | </p>
            <p className="text-[10px] text-[#777674]"> &gt; 369.26</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#ff0000] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Severe | </p>
            <p className="text-[10px] text-[#777674]">338.68 - 369.26</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#ffa500] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Alert | </p>
            <p className="text-[10px] text-[#777674]">303.25 - 338.68</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#ffff00] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Caution | </p>
            <p className="text-[10px] text-[#777674]">202.25 - 303.25</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#C8FAF9] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Normal | </p>
            <p className="text-[10px] text-[#777674]"> &lt;202.25</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationGraph;
