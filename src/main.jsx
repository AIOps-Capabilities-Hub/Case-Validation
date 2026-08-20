import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createMockFetch } from "./mockApi.js";

const mockMode = [true, "true", "1", "yes"].includes(
  import.meta.env.VITE_MOCK_MODE,
);

if (mockMode) {
  window.fetch = createMockFetch();
  console.info(
    "%c[Case Validation] Mock mode enabled — all API calls are simulated.",
    "color: #a855f7; font-weight: bold;",
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
