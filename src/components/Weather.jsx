import React from "react";

const Weather = () => {
  return (
    <div
      className="fixed left-8 right-8 top-24 z-20 bg-white/90 rounded-2xl shadow-lg p-4"
      style={{
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="w-full h-full p-2 mx-2 flex items-center gap-2">
        <div className="flex flex-col justify-around gap-1 pr-2 border-r border-white/40 h-full">
          <div className="relative" data-headlessui-state="">
            <div
              id="headlessui-listbox-button-v-0-0-16"
              aria-haspopup="listbox"
              aria-expanded="false"
              data-headlessui-state=""
              role="button"
              className="flex items-center w-full"
            >
              <button
                className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 h-7 w-full font-medium inline-flex items-center text-left cursor-default rounded-xs text-xs gap-x-1.5 px-2.5 py-1.5 shadow-sm dark:bg-white/30 text-gray-900 dark:text-black ring-1 ring-inset dark:ring-gray-700 dark:focus:ring-primary-400 bg-transparent ring-grey-500 focus:ring-1 focus:ring-grey-500 pe-8"
                type="button"
              >
                <span className="block truncate">Kulon Progo</span>
                <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-2.5">
                  <span
                    className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 dark:text-gray-500 text-grey-800 h-4 w-4"
                    aria-hidden="true"
                  ></span>
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative" data-headlessui-state="">
              <div
                id="headlessui-combobox-button-v-0-0-17"
                tabIndex="-1"
                aria-haspopup="listbox"
                aria-expanded="false"
                data-headlessui-state=""
                role="button"
                className="flex items-center w-full"
              >
                <button
                  className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 h-7 w-full font-medium inline-flex items-center text-left cursor-default rounded-xs text-xs gap-x-1.5 px-2.5 py-1.5 shadow-sm dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset dark:ring-gray-700 dark:focus:ring-primary-400 bg-transparent ring-grey-500 focus:ring-1 focus:ring-grey-500 pe-8"
                  type="button"
                >
                  <span className="block truncate">Kalibawang</span>
                  <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-2.5">
                    <span
                      className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 dark:text-gray-500 text-grey-800 h-4 w-4"
                      aria-hidden="true"
                    ></span>
                  </span>
                </button>
              </div>
            </div>

            <div className="relative" data-headlessui-state="">
              <div
                id="headlessui-combobox-button-v-0-0-18"
                tabIndex="-1"
                aria-haspopup="listbox"
                aria-expanded="false"
                data-headlessui-state=""
                role="button"
                className="flex items-center w-full"
              >
                <button
                  className="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 h-7 w-full font-medium inline-flex items-center text-left cursor-default rounded-xs text-xs gap-x-1.5 px-2.5 py-1.5 shadow-sm dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset dark:ring-gray-700 dark:focus:ring-primary-400 bg-transparent ring-grey-500 focus:ring-1 focus:ring-grey-500 pe-8"
                  type="button"
                >
                  <span className="block truncate">Banjararum</span>
                  <span className="absolute inset-y-0 end-0 flex items-center pointer-events-none px-2.5">
                    <span
                      className="iconify i-heroicons:chevron-down-20-solid flex-shrink-0 dark:text-gray-500 text-grey-800 h-4 w-4"
                      aria-hidden="true"
                    ></span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-1 justify-between">
            <button className="text-brand-500 border-brand-200 bg-grey-50 w-[70px] border rounded-xs text-2xs font-medium p-1">
              6 Agu
            </button>
            <button className="text-grey-800 border-grey-500 bg-transparent w-[70px] border rounded-xs text-2xs font-medium p-1">
              7 Agu
            </button>
            <button className="text-grey-800 border-grey-500 bg-transparent w-[70px] border rounded-xs text-2xs font-medium p-1">
              8 Agu
            </button>
          </div>
        </div>

        <div className="flex-1 w-full h-full flex gap-1 overflow-x-auto">
          <div className="w-48 min-w-48 h-full bg-grey-50 rounded-sm py-1 px-2 divine-y-2 text-2xs">
            <div>
              <p>20.00 WIB</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-grey-950">
                  21 ºC{" "}
                  <span className="text-xs text-grey-500 font-normal">
                    Sunny
                  </span>
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="nuxt-icon--fill #F36A1D w-4 h-4"
                  style={{ color: "rgb(243, 106, 29)" }}
                >
                  <g clipPath="url(#i1614757057__a)">
                    <path
                      fill="#F36A1D"
                      d="M8 11.333a3.335 3.335 0 0 1 0-6.666 3.335 3.335 0 0 1 0 6.666ZM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm.667-6H7.333v3.333h1.334V0Zm0 12.667H7.333V16h1.334v-3.333ZM3.333 7.333H0v1.334h3.333V7.333Zm12.667 0h-3.333v1.334H16V7.333Zm-1.873-4.52-.94-.94-2.36 2.36.94.94 2.36-2.36Zm-8.954 8.96-.94-.94-2.36 2.36.94.94 2.36-2.36Zm0-7.54-2.36-2.36-.94.94 2.36 2.36.94-.94Zm8.96 8.96-2.36-2.36-.94.94 2.36 2.36.94-.94Z"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="i1614757057__a">
                      <path fill="#fff" d="M0 0h16v16H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="border-b border-grey-200 w-full my-1"></div>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <g clipPath="url(#i-568641931__a)">
                    <path
                      fill="#000"
                      d="M6 12a5 5 0 0 1-3.536-8.535L6 .007 9.53 3.46a5.007 5.007 0 0 1-1.617 8.16 4.968 4.968 0 0 1-1.914.38ZM6 1.406l-2.833 2.77a4 4 0 1 0 5.661-.004L6 1.406ZM4.5 5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Zm3 3a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM4.217 9h1.166l2.4-4H6.617l-2.4 4Z"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="i-568641931__a">
                      <path fill="#fff" d="M0 0h12v12H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
                <p>95</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 13 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <path
                    fill="#000"
                    d="M9.68 5.293 7.034 2.646l-.706.707L8.974 6 6.329 8.646l.708.707 2.642-2.646a1 1 0 0 0 0-1.414Z"
                  ></path>
                  <path
                    fill="#000"
                    d="m6.535 5.646-3-3-.706.707L5.474 6 2.829 8.646l.708.707 3-3a.5.5 0 0 0-.002-.707Z"
                  ></path>
                </svg>
                <p>W</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <path
                    fill="#000"
                    d="M12 1v1H0V1h12ZM0 11h4v-1H0v1Zm0-4.5h8v-1H0v1Z"
                  ></path>
                </svg>
                <p>0.9km/hour</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <path
                    fill="#B4B2AF"
                    d="M11.91 5.59C11.471 4.63 9.75 1.5 6 1.5S.528 4.63.09 5.59a.984.984 0 0 0 0 .82C.527 7.37 2.25 10.5 6 10.5s5.471-3.13 5.91-4.09a.984.984 0 0 0 0-.82ZM6 9.5c-3.154 0-4.625-2.683-5-3.495C1.375 5.183 2.846 2.5 6 2.5c3.146 0 4.618 2.671 5 3.5-.382.829-1.854 3.5-5 3.5Z"
                  ></path>
                  <path
                    fill="#B4B2AF"
                    d="M6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
                  ></path>
                </svg>
                <p>&lt; 9 km</p>
              </div>
            </div>
          </div>

          <div className="w-48 min-w-48 h-full bg-grey-50 rounded-sm py-1 px-2 divine-y-2 text-2xs">
            <div>
              <p>23.00 WIB</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-grey-950">
                  21 ºC{" "}
                  <span className="text-xs text-grey-500 font-normal">
                    Sunny
                  </span>
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 16"
                  className="nuxt-icon--fill #F36A1D w-4 h-4"
                  style={{ color: "rgb(243, 106, 29)" }}
                >
                  <g clipPath="url(#i1614757057__a)">
                    <path
                      fill="#F36A1D"
                      d="M8 11.333a3.335 3.335 0 0 1 0-6.666 3.335 3.335 0 0 1 0 6.666ZM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm.667-6H7.333v3.333h1.334V0Zm0 12.667H7.333V16h1.334v-3.333ZM3.333 7.333H0v1.334h3.333V7.333Zm12.667 0h-3.333v1.334H16V7.333Zm-1.873-4.52-.94-.94-2.36 2.36.94.94 2.36-2.36Zm-8.954 8.96-.94-.94-2.36 2.36.94.94 2.36-2.36Zm0-7.54-2.36-2.36-.94.94 2.36 2.36.94-.94Zm8.96 8.96-2.36-2.36-.94.94 2.36 2.36.94-.94Z"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="i1614757057__a">
                      <path fill="#fff" d="M0 0h16v16H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="border-b border-grey-200 w-full my-1"></div>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <g clipPath="url(#i-568641931__a)">
                    <path
                      fill="#000"
                      d="M6 12a5 5 0 0 1-3.536-8.535L6 .007 9.53 3.46a5.007 5.007 0 0 1-1.617 8.16 4.968 4.968 0 0 1-1.914.38ZM6 1.406l-2.833 2.77a4 4 0 1 0 5.661-.004L6 1.406ZM4.5 5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Zm3 3a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM4.217 9h1.166l2.4-4H6.617l-2.4 4Z"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="i-568641931__a">
                      <path fill="#fff" d="M0 0h12v12H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
                <p>94</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 13 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <path
                    fill="#000"
                    d="M9.68 5.293 7.034 2.646l-.706.707L8.974 6 6.329 8.646l.708.707 2.642-2.646a1 1 0 0 0 0-1.414Z"
                  ></path>
                  <path
                    fill="#000"
                    d="m6.535 5.646-3-3-.706.707L5.474 6 2.829 8.646l.708.707 3-3a.5.5 0 0 0-.002-.707Z"
                  ></path>
                </svg>
                <p>E</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <path
                    fill="#000"
                    d="M12 1v1H0V1h12ZM0 11h4v-1H0v1Zm0-4.5h8v-1H0v1Z"
                  ></path>
                </svg>
                <p>2km/hour</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 12"
                  className="nuxt-icon--fill w-3 h-3 text-black/30"
                >
                  <path
                    fill="#B4B2AF"
                    d="M11.91 5.59C11.471 4.63 9.75 1.5 6 1.5S.528 4.63.09 5.59a.984.984 0 0 0 0 .82C.527 7.37 2.25 10.5 6 10.5s5.471-3.13 5.91-4.09a.984.984 0 0 0 0-.82ZM6 9.5c-3.154 0-4.625-2.683-5-3.495C1.375 5.183 2.846 2.5 6 2.5c3.146 0 4.618 2.671 5 3.5-.382.829-1.854 3.5-5 3.5Z"
                  ></path>
                  <path
                    fill="#B4B2AF"
                    d="M6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
                  ></path>
                </svg>
                <p>&lt; 8 km</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
