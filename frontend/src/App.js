import React, { useState } from "react";
import ConnectServer from "./pages/ConnectServer";

function App() {
  const [page, setPage] = useState("connect");

  if (page === "connect") {
    return <ConnectServer onBack={() => setPage("home")} />;
  }

  return (
    <div style={{ padding: 40, color: "white", background: "#111827", minHeight: "100vh" }}>
      <h1>Pantalla principal</h1>
      <button onClick={() => setPage("connect")}>Ir a conectar servidor</button>
    </div>
  );
}

export default App;