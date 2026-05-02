import React, { useState } from "react";
import ConnectServer from "./pages/ConnectServer";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("connect");

  if (page === "connect") {
    return <ConnectServer onConnected={() => setPage("dashboard")} />;
  }

  if (page === "dashboard") {
    return <Dashboard goToConnect={() => setPage("connect")} />;
  }

  return null;
}

export default App;