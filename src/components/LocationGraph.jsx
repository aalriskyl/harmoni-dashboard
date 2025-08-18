import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const LocationGraph = ({ selectedPoint, onClose }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!selectedPoint) return;

    // Use actual data if available, otherwise use sample data
    let labels, data, yAxisLabel, thresholds;

    if (selectedPoint.type === "RainRecorder" && selectedPoint.rainfallData) {
      // For RainRecorder with rainfall data
      labels = selectedPoint.rainfallData.map((entry) => entry.formattedTime);
      data = selectedPoint.rainfallData.map((entry) => entry.rainfall);
      yAxisLabel = "Rainfall (mm)";

      // Adjust thresholds for rainfall (in mm)
      thresholds = {
        normal: 0.76,
        cautious: 1.5,
        alert: 1000, // Any value above 1.5 will be considered alert
      };
    } else {
      // Fallback to sample data
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      data = Array.from({ length: 24 }, () => (Math.random() * 2).toFixed(2));
      yAxisLabel = "Rainfall (mm)";
      thresholds = {
        normal: 0.76,
        cautious: 1.5,
        alert: 1000,
        severe: 369.26,
      };
    }

    // Create background colors based on thresholds
    const backgroundColors = data.map((value) => {
      if (value > thresholds.cautious) return "#ff0000"; // Alert (red)
      if (value > thresholds.normal) return "#ffff00"; // Cautious (yellow)
      return "#00C853"; // Normal (green)
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
            pointHoverRadius: 6,
            fill: false,
            tension: 0.1,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: {
          duration: 0,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: {
              size: 12,
              weight: "bold",
            },
            bodyFont: {
              size: 12,
            },
            padding: 10,
            cornerRadius: 4,
            displayColors: false,
            callbacks: {
              title: function (tooltipItems) {
                const dataIndex = tooltipItems[0].dataIndex;
                const date = new Date(
                  selectedPoint.rainfallData[dataIndex].time
                );
                const formattedDate = date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return `${formattedDate} ${formattedTime}`;
              },
              label: function (context) {
                return `Rainfall: ${context.raw.toFixed(2)} mm`;
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
              text: yAxisLabel,
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] mx-4 mb-4">
      <div className="w-full h-[300px] rounded-t-xl border border-gray-200 shadow-lg bg-white overflow-hidden">
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedPoint.type === "RainRecorder"
                ? "Rainfall Data"
                : "Discharge Curve"}{" "}
              - {selectedPoint.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close chart"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <div className="h-full w-full relative">
              <canvas
                ref={chartRef}
                role="img"
                className="w-full h-full"
              ></canvas>
            </div>
          </div>

          <div className="flex justify-center gap-3 items-center mt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#ff0000] rounded-[2px]"></div>
              <p className="text-[10px] text-[#777674]">Alert | </p>
              <p className="text-[10px] text-[#777674]">&gt; 1.5 mm</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#ffff00] rounded-[2px]"></div>
              <p className="text-[10px] text-[#777674]">Cautious | </p>
              <p className="text-[10px] text-[#777674]">0.76 - 1.5 mm</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#00C853] rounded-[2px]"></div>
              <p className="text-[10px] text-[#777674]">Normal | </p>
              <p className="text-[10px] text-[#777674]">&lt; 0.76 mm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationGraph;
