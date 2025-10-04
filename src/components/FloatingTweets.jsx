import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDateFilter } from "../hooks/useDateFilter";

const FloatingTweets = ({ showWeather = false }) => {
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
        setTweets(response.data || []);
        setFilteredTweets(response.data || []);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load tweet data");
        setIsLoading(false);
      }
    };

    fetchTweets();
  }, []);

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "";
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
      if (!tweet.datetime) return false;
      const tweetDate = new Date(tweet.datetime).toISOString().split("T")[0];
      return tweetDate === selectedDate;
    });

    setFilteredTweets(filtered);
  };

  useEffect(() => {
    filterTweets();
  }, [selectedDate, tweets]);

  const extractLocation = (text) => {
    if (!text) return "Location not specified";
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
      <div className="absolute bg-white rounded-lg shadow-lg p-4 w-80 max-h-[80vh] overflow-y-auto z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Loading Tweets...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute bg-white rounded-lg shadow-lg p-4 w-80 max-h-[80vh] overflow-y-auto z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Error Loading Tweets</h2>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Always-visible small toggle button */}
      <div
        className="fixed z-50 right-7 top-[27vh]"
        style={{ width: "40px", height: "40px" }}
      >
        <button
          className="w-8 h-8 rounded-lg bg-[#636059] text-white shadow-lg flex items-center justify-center"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((s) => !s)}
          title={isExpanded ? "Close Tweets" : "Open Tweets"}
        >
          {"X"}
        </button>
      </div>

      {/* Panel that appears when expanded, positioned to the left of the button */}
      {isExpanded && (
        <div
          className="fixed bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden z-40 transition-all duration-300 right-[70px] top-[27vh]"
          style={{
            width: "350px",
            height: "60vh",
            maxHeight: "400px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            className="p-4 overflow-y-auto"
            style={{ maxHeight: "calc(80vh - 56px)" }}
          >
            <div>
              <label className="text-xl font-semibold mb-4 block">
                Recent Crowdsourced Tweets
              </label>
            </div>
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
                          {tweet.username
                            ? tweet.username.charAt(0).toUpperCase()
                            : "T"}
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
                        <p className="mt-1 text-sm text-gray-700">
                          {tweet.text}
                        </p>
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
        </div>
      )}
    </>
  );
};

export default FloatingTweets;
