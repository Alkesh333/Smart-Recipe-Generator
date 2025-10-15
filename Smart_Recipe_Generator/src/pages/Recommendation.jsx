import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

export default function Recommendation() {
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Step 1: Fetch session and favorites
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
        .select("title")
        .eq("user_id", userId);

      if (error) throw error;
      setFavorites(data.map((item) => item.title));
    } catch (err) {
      console.error("Error fetching favorites:", err);
      alert("Failed to fetch favorites.");
    }
  };

  // Step 2: Generate Similar Recipes from Gemini
  const generateRecommendations = async () => {
    if (favorites.length === 0) {
      return alert("You have no favorite recipes to base recommendations on!");
    }

    setLoading(true);
    setRecommendedRecipes([]);
    setSelectedRecipe(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
You are an expert chef AI.
Given the following favorite recipes: 
${favorites.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Generate **5 new recipe ideas** that are similar in flavor, cuisine, or ingredients to these favorites.
Each recipe should include:
- Title
- Ingredients (as a list)
- Steps (as a list)
- Difficulty (easy, medium, hard)
- Calories (approximate)
- Protein (grams)

Return strictly in JSON format like:
[
  {
    "title": "Recipe Name",
    "ingredients": ["..."],
    "steps": ["..."],
    "difficulty": "easy",
    "calories": 250,
    "protein": 10
  }
]
`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setRecommendedRecipes(parsed);
    } catch (err) {
      console.error("Gemini Error:", err);
      alert("Failed to generate recommendations. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fallbackImages = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=800&auto=format&fit=crop",
  ];

  const getRecipeImage = (recipe) => {
    const title = (recipe?.title || "recipe").toLowerCase();
    const topIngredients = (recipe?.ingredients || []).slice(0, 3).join(", ");
    const query = encodeURIComponent(`${title}, ${topIngredients}, plated dish, food photography`);
    return `https://source.unsplash.com/featured/800x800?${query}`;
  };

return (
<div className="relative min-h-screen w-full bg-gradient-to-br from-yellow-50 to-orange-50">
  <div className="max-w-5xl mx-auto px-4 pt-2 pb-4 md:px-6 md:pt-3 md:pb-6">
    <h2 className="mt-0 text-3xl font-extrabold mb-3 md:mb-4 text-center text-emerald-800 animate-bounce">🍳 Recipe Recommendations</h2>

  {/* Favorites Summary */}
<div className="mb-3 md:mb-4 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
  <h3 className="font-semibold mb-3 text-gray-900 text-lg">🍲 Your Favorite Recipes</h3>

  {favorites.length === 0 ? (
    <p className="text-gray-500">No favorites found.</p>
  ) : (
    <ul className="list-disc list-inside text-gray-800 space-y-1">
      {favorites.map((title, i) => (
        <li key={i}>{title}</li>
      ))}
    </ul>
  )}
</div>


  {/* Generate Button */}
  <button
    onClick={generateRecommendations}
    disabled={loading}
    className="mt-0 bg-green-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-green-700 transition"
  >
    {loading ? <span className="text-xl drop-shadow animate-bounce">🔥</span> : "Generate Similar Recipes"}
  </button>

  {loading && (
    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="rounded-full bg-white/70 p-6 md:p-10 shadow-2xl backdrop-blur">
        <span className="block text-[96px] md:text-[140px] leading-none drop-shadow-xl animate-bounce">🔥</span>
      </div>
    </div>
  )}

  {/* Recommendations Grid */}
  {recommendedRecipes.length > 0 && (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4 text-center text-emerald-800">✨ AI Recommended Recipes</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {recommendedRecipes.map((recipe, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedRecipe(recipe)}
            className="group relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200 transition hover:shadow-xl cursor-pointer"
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
              <h4 className="text-lg font-bold text-white drop-shadow">🍲 {recipe.title}</h4>
              {recipe.difficulty && (
                <span className="mt-1 inline-block rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-800">
                  {recipe.difficulty}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )}

  {/* Modal */}
  {selectedRecipe && (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedRecipe(null)} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col animate-fadeIn">
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
            <h3 className="text-2xl font-extrabold text-white drop-shadow">🍲 {selectedRecipe.title}</h3>
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 overflow-y-auto">
          <div className="space-y-2">
            <p className="text-gray-700"><strong>🧂 Ingredients</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-800">
              {selectedRecipe.ingredients?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700"><strong>🥄 Steps</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-gray-800 max-h-56 overflow-auto pr-2">
              {selectedRecipe.steps?.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )}
  </div>
</div>
  )
}
