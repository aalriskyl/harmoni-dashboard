import React from "react";

const MapToolbox = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main Toolbox */}
      <div className="flex gap-2 bg-white/40 backdrop-blur-md rounded-xs p-2 shadow-lg transition-all duration-1000 ease-in-out">
        {/* First Button */}
        <div
          data-headlessui-state=""
          className="relative inline-block text-left transition-all duration-500 ease-in-out"
        >
          <div>
            <div className="relative inline-flex">
              <button
                id="headlessui-menu-button-v-0-0-56"
                type="button"
                aria-haspopup="menu"
                aria-expanded="false"
                data-headlessui-state=""
                className="bg-transparent enabled:hover:bg-white dark:enabled:hover:bg-white text-grey-700 dark:text-grey-200 disabled:hover:bg-transparent inline-flex w-full items-center h-9 gap-3 rounded-xxs px-2 py-2 text-sm font-normal focus:outline-none disabled:text-grey-700 dark:disabled:text-grey-200 transition-all duration-500 ease-in-out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                  className="nuxt-icon--fill w-4 h-4"
                >
                  <g clipPath="url(#i1383077152__a)">
                    <path
                      fill="#E2E1DF"
                      d="M5.833 0c-.965 0-1.75.785-1.75 1.75v10.5c0 .965.785 1.75 1.75 1.75h4.083V0H5.833Zm0 12.833a.584.584 0 0 1-.583-.583V1.75c0-.322.261-.583.583-.583H8.75v1.75H7v1.166h1.75V5.25H7v1.167h1.75v1.166H7V8.75h1.75v1.167H7v1.166h1.75v1.75H5.833Z"
                    />
                  </g>
                  <defs>
                    <clipPath id="i1383077152__a">
                      <path fill="#fff" d="M0 0h14v14H0z" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Second Button */}
        <div
          data-headlessui-state=""
          className="relative inline-block text-left transition-all duration-500 ease-in-out"
        >
          <div>
            <div className="relative inline-flex">
              <button
                id="headlessui-menu-button-v-0-0-58"
                type="button"
                aria-haspopup="menu"
                aria-expanded="false"
                data-headlessui-state=""
                className="bg-transparent enabled:hover:bg-white dark:enabled:hover:bg-white text-grey-700 dark:text-grey-200 disabled:hover:bg-transparent inline-flex w-full items-center h-9 gap-3 rounded-xxs px-2 py-2 text-sm font-normal focus:outline-none disabled:text-grey-700 dark:disabled:text-grey-200 transition-all duration-500 ease-in-out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 16"
                  className="nuxt-icon--fill w-4 h-4"
                >
                  <g clipPath="url(#i-850769012__a)">
                    <path
                      fill="#fff"
                      d="m14.502.778-.014-.005-1.81-.6a3.345 3.345 0 0 0-1.933-.052L7.028 1.2c-.455.12-.938.078-1.366-.12L5.33.925A3.333 3.333 0 0 0 .716 4v8.05a3.342 3.342 0 0 0 2.4 3.2l1.912.6c.323.1.66.15.997.15.301.004.601-.037.89-.12l3.867-1.067a2 2 0 0 1 1.078.008l1.562.451a2.666 2.666 0 0 0 3.294-2.591V3.917A3.34 3.34 0 0 0 14.502.778ZM3.5 13.973a2.008 2.008 0 0 1-1.451-1.923V4a1.969 1.969 0 0 1 .89-1.667A2 2 0 0 1 4.05 2c.254 0 .506.05.741.148 0 0 .497.213.592.247V14.56L3.5 13.973Zm3.216.578V2.586c.226-.012.45-.047.67-.103l3.33-.968v11.952l-4 1.084Zm8.666-1.87a1.334 1.334 0 0 1-1.622 1.302l-1.711-.482V1.383l2.012.653a2.004 2.004 0 0 1 1.321 1.881v8.764Z"
                    />
                  </g>
                  <defs>
                    <clipPath id="i-850769012__a">
                      <path fill="#fff" d="M.716 0h16v16h-16z" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar - appears above the main toolbox */}
      <div className="fixed bottom-20 right-4 z-50 transition-all ease-in-out duration-300">
        <div className="flex flex-col gap-2 bg-white/40 backdrop-blur-md rounded-xs p-2 shadow-lg">
          {/* Zoom In Button */}
          <div className="relative inline-flex">
            <button className="bg-transparent hover:bg-white p-2 rounded-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                className="nuxt-icon--fill w-5 h-5 text-grey-700"
              >
                <g clipPath="url(#i76119588__a)">
                  <path
                    fill="#F9F8F7"
                    d="M20 9.167h-9.167V0H9.167v9.167H0v1.666h9.167V20h1.666v-9.167H20V9.167Z"
                  />
                </g>
                <defs>
                  <clipPath id="i76119588__a">
                    <path fill="#fff" d="M0 0h20v20H0z" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>

          {/* Zoom Out Button */}
          <div className="relative inline-flex">
            <button className="bg-transparent hover:bg-grey-50 p-2 rounded-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                className="nuxt-icon--fill w-5 h-5 text-grey-700"
              >
                <g clipPath="url(#i1789476484__a)">
                  <path
                    fill="#F9F8F7"
                    d="M19.167 9.167H.833a.833.833 0 1 0 0 1.666h18.334a.833.833 0 0 0 0-1.666Z"
                  />
                </g>
                <defs>
                  <clipPath id="i1789476484__a">
                    <path fill="#fff" d="M0 0h20v20H0z" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>

          {/* Compass Button */}
          <div className="relative inline-flex">
            <button className="bg-transparent hover:bg-grey-50 p-2 rounded-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                className="nuxt-icon--fill w-5 h-5 text-grey-700"
              >
                <g
                  fill="#F9F8F7"
                  fillRule="evenodd"
                  clipPath="url(#i948746121__a)"
                  clipRule="evenodd"
                >
                  <path d="M10 6.667a3.333 3.333 0 1 0 0 6.666 3.333 3.333 0 0 0 0-6.666ZM8.333 10a1.667 1.667 0 1 1 3.334 0 1.667 1.667 0 0 1-3.334 0Z" />
                  <path d="M10 0c.46 0 .833.373.833.833v1.713a7.503 7.503 0 0 1 6.621 6.62h1.713a.833.833 0 0 1 0 1.667h-1.713a7.503 7.503 0 0 1-6.62 6.621v1.713a.833.833 0 0 1-1.667 0v-1.713a7.503 7.503 0 0 1-6.621-6.62H.833a.833.833 0 1 1 0-1.667h1.713a7.503 7.503 0 0 1 6.62-6.621V.833C9.167.373 9.54 0 10 0Zm5.833 10a5.833 5.833 0 1 0-11.666 0 5.833 5.833 0 0 0 11.666 0Z" />
                </g>
                <defs>
                  <clipPath id="i948746121__a">
                    <path fill="#fff" d="M0 0h20v20H0z" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>

          {/* Location Button */}
          <div className="relative inline-flex">
            <button className="bg-transparent hover:bg-white p-2 rounded-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                className="nuxt-icon--fill w-5 h-5 text-[#353332]"
              >
                <g clipPath="url(#i936713256__a)">
                  <path
                    fill="#F9F8F7"
                    d="M15.833 20H15a.833.833 0 0 1 0-1.667h.833a2.5 2.5 0 0 0 2.5-2.5V15A.833.833 0 0 1 20 15v.833A4.172 4.172 0 0 1 15.833 20ZM20 5v-.833A4.172 4.172 0 0 0 15.833 0H15a.833.833 0 0 0 0 1.667h.833a2.5 2.5 0 0 1 2.5 2.5V5A.833.833 0 0 0 20 5ZM5.833 19.167A.833.833 0 0 0 5 18.333h-.833a2.5 2.5 0 0 1-2.5-2.5V15A.833.833 0 0 0 0 15v.833A4.172 4.172 0 0 0 4.167 20H5a.833.833 0 0 0 .833-.833ZM1.667 5v-.833a2.5 2.5 0 0 1 2.5-2.5H5A.833.833 0 0 0 5 0h-.833A4.172 4.172 0 0 0 0 4.167V5a.833.833 0 0 0 1.667 0Zm11.666 5a3.334 3.334 0 1 0-6.667 0 3.334 3.334 0 0 0 6.667 0Zm-1.666 0a1.667 1.667 0 1 1-3.335 0 1.667 1.667 0 0 1 3.335 0Z"
                  />
                </g>
                <defs>
                  <clipPath id="i936713256__a">
                    <path fill="#fff" d="M0 0h20v20H0z" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>

          {/* Layer Button */}
          <div className="relative inline-flex">
            <button className="bg-transparent hover:bg-white p-2 rounded-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
                className="nuxt-icon--fill w-5 h-5 text-grey-700"
                style={{
                  transform: "rotate(0deg)",
                  transitionProperty: "all",
                  transitionDuration: "1000ms",
                }}
              >
                <g clipPath="url(#i15040060__a)">
                  <path
                    fill="#F9F8F7"
                    d="M2.929 2.929a10 10 0 1 0 14.142 0 10.011 10.011 0 0 0-14.142 0Zm12.964 12.964a8.333 8.333 0 1 1 0-11.786 8.342 8.342 0 0 1 0 11.786Zm-10.589-2.34a1.62 1.62 0 0 0 1.918.322l2.782-1.2 2.763 1.173a1.652 1.652 0 0 0 1.939-.304l.008-.008a1.658 1.658 0 0 0 .262-2.004L10 3.047l-4.965 8.516a1.652 1.652 0 0 0 .27 1.99ZM10 6.348l3.527 6.018-3.53-1.504-3.436 1.483-.08.047L10 6.347Z"
                  />
                </g>
                <defs>
                  <clipPath id="i15040060__a">
                    <path fill="#fff" d="M0 0h20v20H0z" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapToolbox;
