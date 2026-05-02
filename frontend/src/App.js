import React, { useState } from "react";
import Home from "./pages/Home";
import ConnectServer from "./pages/ConnectServer";

function App() {
  const [page, setPage] = useState("home");

  if (page === "home") {
    return <Home goToConnect={() => setPage("connect")} />;
  }

  if (page === "connect") {
    return <ConnectServer onBack={() => setPage("home")} />;
  }

  return null;
}

export default App;