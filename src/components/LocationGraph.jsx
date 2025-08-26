import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const LocationGraph = ({
  selectedPoint,
  onClose,
  data = {},
  dataType = "ARR",
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [yAxisLabel, setYAxisLabel] = useState("");

  // Determine data type and set up chart configuration
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      setChartData([]);
      setHasData(false);
      return;
    }

    try {
      console.log(`Processing ${dataType} data:`, data);

      // Extract all valid dates and values based on data type
      const validEntries = Object.entries(data)
        .map(([date, value]) => {
          // Parse the date string (format: YYYY-MM-DD)
          const [year, month, day] = date.split("-").map(Number);
          const dateObj = new Date(year, month - 1, day); // month is 0-indexed in JS
          const isValidDate = !isNaN(dateObj.getTime());
          const isValidValue =
            value !== null && value !== undefined && value !== "";

          return {
            originalDate: date,
            dateObj: isValidDate ? dateObj : null,
            value: isValidValue ? Number(value) : null,
            isValid: isValidDate && isValidValue,
          };
        })
        .filter((entry) => entry.isValid);

      console.log("Valid entries found:", validEntries);

      // Filter data for 2020 only
      const year2020Data = validEntries.filter(
        (entry) => entry.dateObj.getFullYear() === 2020
      );

      console.log("2020 data:", year2020Data);

      if (year2020Data.length === 0) {
        setChartData([]);
        setHasData(false);
        return;
      }

      // Calculate monthly averages for 2020
      const monthlyAverages = Array(12)
        .fill(null)
        .map(() => []);

      year2020Data.forEach((entry) => {
        const month = entry.dateObj.getMonth(); // 0-11
        monthlyAverages[month].push(entry.value);
      });

      const monthlyValues = monthlyAverages.map((monthData) => {
        if (monthData.length === 0) return null;
        return monthData.reduce((sum, val) => sum + val, 0) / monthData.length;
      });

      console.log("Monthly averages for 2020:", monthlyValues);
      setChartData(monthlyValues);
      setHasData(monthlyValues.some((val) => val !== null && val > 0));

      // Set chart labels based on data type
      if (dataType === "ARR") {
        setChartTitle("Precipitation");
        setYAxisLabel("Precipitation (mm)");
      } else if (dataType === "AWLR") {
        setChartTitle("Water Level");
        setYAxisLabel("Water Level (m)");
      }
    } catch (error) {
      console.error(`Error processing ${dataType} data:`, error);
      setChartData([]);
      setHasData(false);
    }
  }, [data, dataType]);

  // Create chart when data changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (!chartRef.current || !selectedPoint || chartData.length === 0) {
      return;
    }

    const ctx = chartRef.current.getContext("2d");

    // Check if we have data
    if (!hasData) {
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `No ${dataType.toLowerCase()} data available for 2020`,
        chartRef.current.width / 2,
        chartRef.current.height / 2
      );
      return;
    }

    // Create chart with monthly data
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: `Monthly ${chartTitle}`,
            data: chartData,
            borderColor:
              dataType === "ARR" ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)",
            backgroundColor:
              dataType === "ARR"
                ? "rgba(59, 130, 246, 0.1)"
                : "rgba(16, 185, 129, 0.1)",
            tension: 0.2,
            fill: true,
            pointBackgroundColor:
              dataType === "ARR" ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor:
              dataType === "ARR" ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)",
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `2020 Monthly ${chartTitle} for ${
              selectedPoint.properties?.Nama_Pos ||
              selectedPoint.title ||
              "Selected Location"
            }`,
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                const unit = dataType === "ARR" ? "mm" : "m";
                return `${chartTitle}: ${
                  value !== null ? value.toFixed(1) + unit : "No data"
                }`;
              },
              title: function (context) {
                const monthNames = [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ];
                return `${monthNames[context[0].dataIndex]} 2020`;
              },
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxisLabel,
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, selectedPoint, hasData, dataType, chartTitle, yAxisLabel]);

  if (!selectedPoint) return null;

  return (
    <div className="h-[250px] z-10 absolute bottom-0 sm:bottom-2 left-3 sm:left-6 w-[calc(100%-24px)] sm:w-[calc(100%-48px)] rounded-[12px] border border-black/10 overflow-hidden bg-[#F4F3F1]">
      <div className="p-3 flex flex-col h-full">
        <div className="flex justify-between items-center">
          <p className="text-[#161414] text-xs font-medium">
            {selectedPoint.properties?.Nama_Pos ||
              selectedPoint.title ||
              "Location Data"}
          </p>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="flex items-center flex-grow">
          <div className="h-[184px] w-full relative mt-2">
            <canvas ref={chartRef} role="img" className="w-full h-full" />
          </div>
        </div>

        <div className="flex justify-center gap-3 items-center mt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#B518FA] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Flood | </p>
            <p className="text-[10px] text-[#777674]"> &gt; 239.13</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#ff0000] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Severe | </p>
            <p className="text-[10px] text-[#777674]">213.75 - 239.13</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#ffa500] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Alert | </p>
            <p className="text-[10px] text-[#777674]">184.36 - 213.75</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#ffff00] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Caution | </p>
            <p className="text-[10px] text-[#777674]">100.55 - 184.36</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#C8FAF9] rounded-[2px]"></div>
            <p className="text-[10px] text-[#777674]">Normal | </p>
            <p className="text-[10px] text-[#777674]"> &lt;100.55</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationGraph;
