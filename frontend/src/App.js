import React, { useState } from "react";
import Home from "./pages/Home";
import ConnectServer from "./pages/ConnectServer";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("home");

  if (page === "home") {
    return (
      <Home
        goToConnect={() => setPage("connect")}
        goToDashboard={() => setPage("dashboard")}
      />
    );
  }

  if (page === "connect") {
    return <ConnectServer onBack={() => setPage("home")} />;
  }

  if (page === "dashboard") {
    return (
      <Dashboard
        goToHistory={() => alert("Luego hacemos historial")}
        goToSettings={() => alert("Luego hacemos ajustes")}
        goToConnect={() => setPage("connect")}
      />
    );
  }

  return null;
}

export default App;