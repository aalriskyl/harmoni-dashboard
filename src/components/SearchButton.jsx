import React from "react";

const SearchButton = ({ onClick, hidden }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) onClick();
      try {
        console.debug("SearchButton: clicked (dummy)");
      } catch (err) {}
    }}
    className={`flex items-center justify-center p-1 rounded-lg transition-all ${"bg-[#f2f1ef] border-2 border-[#f2f1ef]"} hover:shadow-md`}
    title="Search"
    aria-label="Search"
  >
    <div className="w-8 h-8 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-8 h-8 transition-colors mr-1 ${
          hidden ? "opacity-0 pointer-events-none" : "opacity-80"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
        />
      </svg>
    </div>
  </button>
);

export default SearchButton;
