import { Outlet } from "react-router-dom";

function App() {

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vite + React Starter</h1>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
      </button>

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
