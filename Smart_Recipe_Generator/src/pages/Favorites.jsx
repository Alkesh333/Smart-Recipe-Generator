import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Favorites() {
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
      } else {
        setSession(data.session);
        fetchFavorites(data.session.user.id);
      }
    });
  }, []);

  const fetchFavorites = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id, title, ingredients, steps, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const parsedData = (data || []).map((f) => ({
        ...f,
        expanded: false,
      }));

      setFavorites(parsedData);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      alert("Failed to fetch favorites.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setFavorites((prev) =>
      prev.map((fav) =>
        fav.id === id ? { ...fav, expanded: !fav.expanded } : fav
      )
    );
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading favorites...</p>;
  }

return (
  <div className="p-6 max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold mb-6 text-center">❤️ My Favorite Recipes</h2>

    {favorites.length === 0 ? (
      <p className="text-center text-gray-500">No favorites yet.</p>
    ) : (
      <div className="space-y-6">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="border border-gray-300 rounded-xl shadow-sm bg-white p-5 hover:shadow-md transition-shadow"
          >
            {/* Title */}
            <div className="flex justify-between items-center cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800">{fav.title}</h3>
              <button
                onClick={() => toggleExpand(fav.id)}
                className="text-gray-600 text-sm"
              >
                {fav.expanded ? "▲" : "▼"}
              </button>
            </div>

            {/* Added Date */}
            <p className="text-gray-600 text-sm mt-1">
              Added on {new Date(fav.created_at).toLocaleDateString()}
            </p>

            {/* Expanded Section */}
            {fav.expanded && (
              <div className="mt-4 text-gray-800 space-y-4 animate-fadeIn">
                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold mb-1 text-gray-800">
                    🧂 Ingredients:
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {fav.ingredients?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="font-semibold mb-1 text-gray-800">
                    👨‍🍳 Steps:
                  </h4>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1">
                    {fav.steps?.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
}
