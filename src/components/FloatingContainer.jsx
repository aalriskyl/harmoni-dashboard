import React from "react";

const FloatingContainer = () => {
  return (
    <div className="fixed left-8 top-65 w-80 bg-white/90 rounded-2xl shadow-lg z-30">
      <div className="flex flex-col p-4 space-y-3">
        <div className="flex flex-col gap-2 overflow-hidden p-2 h-fit sm:h-full relative">
          <div className="w-full gap-1">
            <div className="flex items-center gap-2">
              <p className="text-[#161414] text-xl font-semibold">
                Flood Warning
              </p>
              <div className="relative" data-headlessui-state="">
                <div
                  className="inline-flex w-full"
                  role="button"
                  id="headlessui-popover-button-v-0-0-53"
                  aria-expanded="false"
                  data-headlessui-state=""
                >
                  <button
                    type="button"
                    className="focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0 font-medium rounded-md gap-x-1.5 p-1.5 dark:text-primary-400 hover:bg-primary-50 disabled:bg-transparent aria-disabled:bg-transparent dark:hover:bg-primary-950 dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 inline-flex items-center text-grey-700 text-[13px]"
                  >
                    <span
                      className="iconify i-material-symbols-light:help-outline flex-shrink-0 h-3.5 w-3.5 text-gray-500"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[#665e5e] text-[11px]">
              A Series of Early Flood Warnings Disseminated Through Multi-Mode
              Information.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-1 mb-1">
            {/* Normal Status */}
            <div className="p-1 rounded-xxs bg-white/70 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-brand-100 hover:bg-opacity-90">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-grey-200 text-grey-950">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="w-3 h-3 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">7</p>
                    <p className="text-[10px] font-medium">Normal</p>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 10"
                  className="w-3 h-3 text-gray-500 transition-all ease-in-out duration-200"
                >
                  <g fill="#000" clipPath="url(#i-1248217607__a)">
                    <path d="M3 .75v8.5h.75V.75H3Z" />
                    <path d="M1.25.75v8.5H2V.75h-.75Z" />
                    <path d="m4.75 1.092 3.616 3.616a.425.425 0 0 1 0 .59L4.752 8.91l.59.589 3.613-3.614a1.281 1.281 0 0 0 0-1.768L5.34.502l-.589.59Z" />
                  </g>
                  <defs>
                    <clipPath id="i-1248217607__a">
                      <path fill="#fff" d="M0 10V0h10v10z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Siaga Status */}
            <div className="p-1 rounded-xxs bg-white/70 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-brand-100 hover:bg-opacity-90">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-[#EC8819] text-grey-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="w-3 h-3 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">0</p>
                    <p className="text-[10px] font-medium">Siaga</p>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 10"
                  className="w-3 h-3 text-gray-500 transition-all ease-in-out duration-200"
                >
                  <g fill="#000" clipPath="url(#i-1248217607__a)">
                    <path d="M3 .75v8.5h.75V.75H3Z" />
                    <path d="M1.25.75v8.5H2V.75h-.75Z" />
                    <path d="m4.75 1.092 3.616 3.616a.425.425 0 0 1 0 .59L4.752 8.91l.59.589 3.613-3.614a1.281 1.281 0 0 0 0-1.768L5.34.502l-.589.59Z" />
                  </g>
                  <defs>
                    <clipPath id="i-1248217607__a">
                      <path fill="#fff" d="M0 10V0h10v10z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Waspada Status */}
            <div className="p-1 rounded-xxs bg-white/70 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-brand-100 hover:bg-opacity-90">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-[#E7EE46] text-grey-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="w-3 h-3 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">0</p>
                    <p className="text-[10px] font-medium">Waspada</p>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 10"
                  className="w-3 h-3 text-gray-500 transition-all ease-in-out duration-200"
                >
                  <g fill="#000" clipPath="url(#i-1248217607__a)">
                    <path d="M3 .75v8.5h.75V.75H3Z" />
                    <path d="M1.25.75v8.5H2V.75h-.75Z" />
                    <path d="m4.75 1.092 3.616 3.616a.425.425 0 0 1 0 .59L4.752 8.91l.59.589 3.613-3.614a1.281 1.281 0 0 0 0-1.768L5.34.502l-.589.59Z" />
                  </g>
                  <defs>
                    <clipPath id="i-1248217607__a">
                      <path fill="#fff" d="M0 10V0h10v10z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Awas Status */}
            <div className="p-1 rounded-xxs bg-white/70 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-brand-100 hover:bg-opacity-90">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-[#F03D3B] text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="w-3 h-3 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">0</p>
                    <p className="text-[10px] font-medium">Awas</p>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 10"
                  className="w-3 h-3 text-gray-500 transition-all ease-in-out duration-200"
                >
                  <g fill="#000" clipPath="url(#i-1248217607__a)">
                    <path d="M3 .75v8.5h.75V.75H3Z" />
                    <path d="M1.25.75v8.5H2V.75h-.75Z" />
                    <path d="m4.75 1.092 3.616 3.616a.425.425 0 0 1 0 .59L4.752 8.91l.59.589 3.613-3.614a1.281 1.281 0 0 0 0-1.768L5.34.502l-.589.59Z" />
                  </g>
                  <defs>
                    <clipPath id="i-1248217607__a">
                      <path fill="#fff" d="M0 10V0h10v10z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Banjir Status */}
            <div className="p-1 rounded-xxs bg-white/70 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-brand-100 hover:bg-opacity-90">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="rounded-xxs py-1 px-2 flex gap-2 items-center bg-[#B518FA] text-grey-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                      className="w-3 h-3 flex-shrink-0"
                    >
                      <path
                        fill="#353332"
                        d="M10 16.667A6.674 6.674 0 0 1 3.333 10c.313-8.823 13.022-8.82 13.333 0A6.674 6.674 0 0 1 10 16.667ZM10 5c-6.608.21-6.607 9.79 0 10 6.607-.21 6.606-9.79 0-10Zm.833 1.667H9.166v4.166h1.667V6.667Zm0 5H9.166v1.666h1.667v-1.666ZM20 10a10.022 10.022 0 0 0-2.286-6.364l-1.286 1.061a8.377 8.377 0 0 1 0 10.605l1.286 1.062A10.022 10.022 0 0 0 20 10ZM3.57 15.303a8.377 8.377 0 0 1 0-10.606L2.286 3.636a10.054 10.054 0 0 0 0 12.728l1.285-1.062Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">0</p>
                    <p className="text-[10px] font-medium">Banjir</p>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 10"
                  className="w-3 h-3 text-gray-500 transition-all ease-in-out duration-200"
                >
                  <g fill="#000" clipPath="url(#i-1248217607__a)">
                    <path d="M3 .75v8.5h.75V.75H3Z" />
                    <path d="M1.25.75v8.5H2V.75h-.75Z" />
                    <path d="m4.75 1.092 3.616 3.616a.425.425 0 0 1 0 .59L4.752 8.91l.59.589 3.613-3.614a1.281 1.281 0 0 0 0-1.768L5.34.502l-.589.59Z" />
                  </g>
                  <defs>
                    <clipPath id="i-1248217607__a">
                      <path fill="#fff" d="M0 10V0h10v10z" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1 sm:overflow-y-scroll space-y-2" />
        </div>
      </div>
    </div>
  );
};

export default FloatingContainer;
