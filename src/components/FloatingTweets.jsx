import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDateFilter } from "../hooks/useDateFilter";

const FloatingTweets = () => {
  const { selectedDate, setSelectedDate } = useDateFilter();
  const [tweets, setTweets] = useState([]);
  const [filteredTweets, setFilteredTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await axios.get("/data/Tweet_Scraped_Data.json");
        setTweets(response.data);
        setFilteredTweets(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching tweets:", err);
        setError("Failed to load tweet data");
        setIsLoading(false);
      }
    };

    fetchTweets();
  }, []);

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterTweets = () => {
    if (!selectedDate) {
      setFilteredTweets(tweets);
      return;
    }

    const filtered = tweets.filter((tweet) => {
      const tweetDate = new Date(tweet.datetime).toISOString().split("T")[0];
      return tweetDate === selectedDate;
    });

    setFilteredTweets(filtered);
  };

  useEffect(() => {
    filterTweets();
  }, [selectedDate, tweets]);

  const extractLocation = (text) => {
    // Try to extract location from text
    const locationPatterns = [
      /(?:di|pada|daerah|kelurahan|kecamatan|jl\.?|jalan)\s+([A-Z][a-zA-Z\s,]+?)(?=\s|,|$|\.|\n)/i,
      /(?:di|pada|daerah|kelurahan|kecamatan|jl\.?|jalan)\s+([A-Z][a-zA-Z\s,]+?)(?=\s*[\.,]|\s+dan|$)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return "Location not specified";
  };

  if (isLoading) {
    return (
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 max-h-[80vh] overflow-y-auto z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Loading Tweets...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 max-h-[80vh] overflow-y-auto z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Error Loading Tweets</h2>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden z-10 transition-all duration-300"
      style={{
        width: isExpanded ? "350px" : "48px",
        height: isExpanded ? "60vh" : "48px",
        maxHeight: "400px",
        overflow: "hidden",
        top: "180px",
        right: "10px",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-[#636059] text-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold">
          {isExpanded ? "Social Media Reports" : "X"}
        </h2>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isExpanded && (
        <div
          className="p-4 overflow-y-auto"
          style={{ maxHeight: "calc(80vh - 56px)" }}
        >
          {/* Date Filter */}
          <div className="mb-4">
            <label
              htmlFor="date-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Date
            </label>
            <input
              type="date"
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Tweets List */}
          <div className="space-y-4">
            {filteredTweets.length > 0 ? (
              filteredTweets.map((tweet, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {tweet.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">
                          @{tweet.username}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(tweet.datetime)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{tweet.text}</p>
                      {tweet.location_name && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {tweet.location_name}
                        </div>
                      )}
                      {!tweet.location_name && (
                        <div className="mt-1 text-xs text-gray-500">
                          Location:{" "}
                          {extractLocation(tweet.text) || "Not specified"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No tweets found for the selected date.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingTweets;
