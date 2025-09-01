import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import WelcomePopup from "./components/WelcomePopup.jsx";

function Root() {
  const [showWelcome, setShowWelcome] = useState(true);
  // Keep a synchronous global flag so other components can detect the welcome
  // overlay exists during initial render (helps on page refresh).
  if (typeof window !== "undefined") {
    window.__welcomeVisible = !!showWelcome;
  }
  return (
    <StrictMode>
      {showWelcome && (
        <WelcomePopup
          onDismiss={() => {
            setShowWelcome(false);
            if (typeof window !== "undefined") window.__welcomeVisible = false;
          }}
        />
      )}
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
