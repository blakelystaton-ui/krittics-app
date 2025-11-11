import React from "react";
// Assuming you use react-router-dom for navigation
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Import your page components
import Queue from "./pages/Queue";
// NOTE: Assuming you have pages for / and /crew that need importing too!

// --- Dummy Header Component for Navigation ---
// This simple component defines the navigation links.
const Header = () => (
  <nav className="fixed top-0 left-0 w-full z-10 bg-gray-800 p-4 shadow-lg flex justify-between text-white">
    <div className="font-bold text-2xl text-red-500">Krittics</div>
    <div className="space-x-4 flex items-center">
      <Link to="/" className="hover:text-red-300 transition duration-150">
        Home
      </Link>
      <Link to="/crew" className="hover:text-red-300 transition duration-150">
        Crew
      </Link>
      {/* THIS IS THE LINK THAT MUST BE CORRECT: */}
      <Link
        to="/queue"
        className="hover:text-red-300 font-bold transition duration-150"
      >
        Queue
      </Link>
    </div>
  </nav>
);
// -----------------------------------------------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      {/* 1. The Header is outside the Routes so it persists across all pages */}
      <Header />

      {/* 2. The <Routes> block determines which component to render based on the URL */}
      <main className="pt-16 min-h-screen bg-gray-900">
        {" "}
        {/* Added top padding to clear fixed header */}
        <Routes>
          {/* Default Home Page Route */}
          <Route
            path="/"
            element={
              <h1 className="text-center pt-20 text-4xl text-white">
                Welcome Home
              </h1>
            }
          />

          {/* Crew Page Route (Example) */}
          <Route
            path="/crew"
            element={
              <h1 className="text-center pt-20 text-4xl text-white">
                The Crew Room
              </h1>
            }
          />

          {/* ********* THE CRITICAL NEW ROUTE ********* */}
          {/* This line maps the URL /queue to your Queue component. */}
          <Route path="/queue" element={<Queue />} />

          {/* Fallback Route: Catches all unmatched URLs and displays 404 */}
          <Route
            path="*"
            element={
              <h1 className="text-center pt-20 text-4xl text-red-500">
                404: Page Not Found!
              </h1>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
