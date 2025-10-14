import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Recommendation from "./pages/Recommendation";
import Top20Recipes from "./pages/Top20Recipes";
import GeminiImage from "./pages/GeminiImage";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get the current session on mount
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        {!session && (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/signup" className="mr-4">Signup</Link>
          </>
        )}
        {session && (
          <>
            <Link to="/dashboard" className="mr-4">Dashboard</Link>
            <Link to="/favorites" className="mr-4">Favorite</Link>
            <Link to="/recommendation" className="mr-4">Recommendation</Link>
            <Link to="/Top20Recipes" className="mr-4">Top 20 Recipes</Link>
            <Link to="/GeminiImage">Gemini Image</Link>
            <button
              className="ml-4 text-red-500"
              onClick={async () => await supabase.auth.signOut()}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/Top20Recipes" element={<Top20Recipes />} />
        <Route path="/GeminiImage" element={<GeminiImage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
