import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Favorites() {
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFav, setSelectedFav] = useState(null);

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

  const fallbackImages = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=800&auto=format&fit=crop",
  ];

  const getRecipeImage = (fav) => {
    const title = (fav?.title || "recipe").toLowerCase();
    const topIngredients = (Array.isArray(fav.ingredients) ? fav.ingredients : (fav.ingredients || "").split(",")).slice(0, 3).join(", ");
    const query = encodeURIComponent(`${title}, ${topIngredients}, plated dish, food photography`);
    return `https://source.unsplash.com/featured/800x800?${query}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-emerald-800 animate-bounce">
          🍳 My Favorite Recipes
        </h2>

        {loading ? (
          <div className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div className="rounded-full bg-white/70 p-6 md:p-10 shadow-2xl backdrop-blur flex flex-col items-center">
              <span className="block text-[96px] md:text-[140px] leading-none drop-shadow-xl animate-bounce">🔥</span>
              <div className="mt-4 text-lg text-gray-600 font-semibold text-center animate-pulse">
                Loading favorites...
              </div>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <p className="text-center text-gray-500">No favorites yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {favorites.map((fav, index) => (
              <button
                key={fav.id}
                type="button"
                onClick={() => setSelectedFav(fav)}
                className="group relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200 transition hover:shadow-xl cursor-pointer"
              >
                <img
                  src={getRecipeImage(fav)}
                  alt={fav.title || "Recipe"}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = fallbackImages[index % fallbackImages.length]; }}
                  loading={index < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <h4 className="text-lg font-bold text-white drop-shadow">🍲 {fav.title}</h4>
                  <span className="mt-1 inline-block rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-800">
                    Added {new Date(fav.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal with details */}
      {selectedFav && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedFav(null)} />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col animate-fadeIn">
            <div className="relative h-40 sm:h-60 w-full">
              <img
                src={getRecipeImage(selectedFav)}
                alt={selectedFav.title || "Recipe image"}
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.src = fallbackImages[0]; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedFav(null)}
                className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow hover:bg-white"
              >
                Close
              </button>
              <div className="absolute bottom-3 left-3">
                <h3 className="text-2xl font-extrabold text-white drop-shadow">🍲 {selectedFav.title}</h3>
              </div>
            </div>
            <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 overflow-y-auto">
              <div className="space-y-2">
                <p className="text-gray-700"><strong>🧂 Ingredients</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-800">
                  {(Array.isArray(selectedFav.ingredients) ? selectedFav.ingredients : (selectedFav.ingredients || "").split(",")).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700"><strong>🥄 Steps</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-gray-800 max-h-56 overflow-auto pr-2">
                  {(Array.isArray(selectedFav.steps) ? selectedFav.steps : (selectedFav.steps || "").split(",")).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
