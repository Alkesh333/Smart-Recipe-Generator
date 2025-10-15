import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const fallbackImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1496412705862-e0088f16f791?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop",
];

const getRecipeImage = (recipe) => {
  const title = (recipe?.title || "recipe").toLowerCase();
  const topIngredients = (Array.isArray(recipe.ingredients) ? recipe.ingredients : (recipe.ingredients || "").split(",")).slice(0, 3).join(", ");
  const query = encodeURIComponent(`${title}, ${topIngredients}, plated dish, food photography, high detail`);
  return `https://source.unsplash.com/featured/800x800?${query}`;
};

const normalizeList = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return raw.split(",").map(s => s.trim()).filter(Boolean);
  return [];
};

export default function Top20Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("recipes")
          .select("title, ingredients, steps, calories, difficulty")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        setRecipes(data || []);
      } catch (err) {
        console.error("Error fetching top recipes:", err);
        alert("Failed to fetch top recipes.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden text-gray-800">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100" />
      <div className="mx-auto w-full max-w-4xl p-4 md:py-12">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-emerald-800">🏆 Top 20 Recipes</h2>
        <p className="mt-1 text-center text-sm text-gray-700">Our most recent and trending community picks!</p>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <span className="text-6xl animate-bounce drop-shadow">🔥</span>
            <p className="mt-4 text-lg text-gray-500 animate-pulse">Loading top recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <p className="text-center mt-8 text-gray-500">No recipes available.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedRecipe(recipe)}
                className="group relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-lg ring-1 ring-gray-200 bg-white transition hover:shadow-xl"
              >
                <img
                  src={getRecipeImage(recipe)}
                  alt={recipe.title || "Recipe"}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = fallbackImages[index % fallbackImages.length]; }}
                  loading={index < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <h3 className="text-lg font-bold text-white drop-shadow">{index + 1}. {recipe.title}</h3>
                  {recipe.difficulty && (
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-medium text-white">
                      {recipe.difficulty}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal for recipe details */}
        {selectedRecipe && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedRecipe(null)} />
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
              <div className="relative h-40 sm:h-60 w-full">
                <img
                  src={getRecipeImage(selectedRecipe)}
                  alt={selectedRecipe.title || "Recipe image"}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.src = fallbackImages[0]; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow hover:bg-white"
                >
                  Close
                </button>
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-2xl font-extrabold text-white drop-shadow">{selectedRecipe.title}</h3>
                </div>
              </div>
              <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 overflow-y-auto">
                <div className="space-y-2">
                  <p><strong>Difficulty:</strong> {selectedRecipe.difficulty}</p>
                  <p><strong>Calories:</strong> {selectedRecipe.calories}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 font-semibold">Ingredients:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {normalizeList(selectedRecipe.ingredients).map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 font-semibold">Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 max-h-56 overflow-auto pr-2">
                      {normalizeList(selectedRecipe.steps).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
