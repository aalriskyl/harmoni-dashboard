import React, { useEffect, useState } from "react";

const WelcomePopup = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    function handleOutside() {
      // No popup card present — any click/touch should dismiss the welcome overlay
      startDismiss();
    }

    function handleMenuClick() {
      startDismiss();
    }

    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("touchstart", handleOutside);
    window.addEventListener("menuSelect", handleMenuClick);

    // announce welcome shown and trigger fade-in on next tick
    window.__welcomeVisible = true;
    window.dispatchEvent(new CustomEvent("welcomeShown"));
    const t = setTimeout(() => setEntered(true), 20);

    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("menuSelect", handleMenuClick);
      clearTimeout(t);
    };
  }, []);

  function startDismiss() {
    setDismissing(true);
    // wait for animation
    setTimeout(() => {
      setVisible(false);
      // announce welcome hidden and clear global flag
      window.__welcomeVisible = false;
      window.dispatchEvent(new CustomEvent("welcomeHidden"));
      if (onDismiss) onDismiss();
    }, 420);
  }

  if (!visible) return null;

  return (
    <div
      id="welcome-overlay"
      className={`fixed inset-0 z-40 ${
        entered && !dismissing ? "animate-fade-in pointer-events-auto" : ""
      } ${dismissing ? "animate-fade-out pointer-events-none" : ""}`}
    >
      {/* welcoming shape (bottom-right) */}
      <div className="absolute right-0 -bottom-14 w-full h-auto  overflow-hidden pointer-events-none z-10">
        <img
          src="/assets/img/Welcoming_Shape _FEWS_Screen Mockup_Harmoni_01.png"
          alt="welcome_shape"
          className="w-full h-full object-cover object-bottom"
        />
      </div>
      <div className="absolute right-8 top-42 z-9999 h-full overflow-hidden pointer-events-none text-[62px]">
        <div className="flex flex-col items-end text-white leading-tight font">
          <h2 className="inline-block bg-[#636059] py-2 px-4 font-normal whitespace-nowrap self-end rounded-lg">
            Flood Prediction
          </h2>
          <h2 className="inline-block font-normal bg-[#a49d93] py-2 px-4 whitespace-nowrap self-end rounded-lg">
            in <span className="font-bold">Minutes</span>
          </h2>
        </div>
      </div>

      {/* logo on top of shape bottom-right, higher z */}
      <div className="absolute right-8 bottom-2 pointer-events-auto z-50">
        <img
          src="/assets/img/Logo_white.png"
          alt="logo"
          className="w-62 h-auto drop-shadow-lg text-white"
        />
      </div>

      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-8px); }
        }
        .animate-fade-in { animation: fadeIn 320ms ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-out { animation: fadeOut 420ms ease forwards; }
      `}</style>
    </div>
  );
};

export default WelcomePopup;
