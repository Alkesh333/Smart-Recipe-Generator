import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden text-gray-800">
      {/* Top-left big heading */}
      <div className="fixed top-20 left-4 z-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-emerald-800 drop-shadow">
          WELCOME CHEF!
        </h1>
      </div>

      {/* Cooking-themed background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100" />
      <img
        src="https://img.icons8.com/color/240/carrot.png"
        alt="carrot"
        className="pointer-events-none select-none fixed left-6 top-10 hidden h-16 w-16 opacity-40 drop-shadow-xl [animation:spin_18s_linear_infinite] md:block"
      />
      <img
        src="https://img.icons8.com/color/240/tomato.png"
        alt="tomato"
        className="pointer-events-none select-none fixed right-12 top-28 hidden h-16 w-16 opacity-40 drop-shadow-xl [animation:spin_22s_linear_infinite] md:block"
      />
      <img
        src="https://img.icons8.com/color/240/broccoli.png"
        alt="broccoli"
        className="pointer-events-none select-none fixed left-24 bottom-10 hidden h-16 w-16 opacity-40 drop-shadow-xl [animation:spin_20s_linear_infinite] md:block"
      />

      {/* Center the form vertically with equal spacing */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* Big Smart Recipe Title, moved vertically up */}
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 mt-[-3rem] text-emerald-700 text-center drop-shadow">
          Smart Recipes
        </h2>
        <div className="w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Login</h3>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 w-full mb-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 w-full mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}
