export function getServerUrl() {
  return (
    localStorage.getItem("serverUrl") ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000"
  );
}