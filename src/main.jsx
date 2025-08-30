import React from "react";
import ReactDOM from "react-dom/client";
import GermanCoachApp from "./index.jsx"; // or "./App.jsx" if renamed
import "./index.css"; // optional, if you have global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GermanCoachApp />
  </React.StrictMode>
);
