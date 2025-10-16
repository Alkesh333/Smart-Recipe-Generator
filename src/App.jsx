import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import Recommendation from "./pages/Recommendation";
import Top20Recipes from "./pages/Top20Recipes";
import Navbar from "./components/Navbar";

// Handles signing out and redirecting to login
function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    const run = async () => {
      try {
        await supabase.auth.signOut();
      } finally {
        navigate("/login");
      }
    };
    run();
  }, [navigate]);
  return null;
}

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

    return () => {
      if (listener && listener.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/top20" element={<Top20Recipes />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
