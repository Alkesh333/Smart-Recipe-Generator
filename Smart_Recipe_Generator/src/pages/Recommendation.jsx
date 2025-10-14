import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

export default function Recommendation() {
  const [session, setSession] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

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
    setExpandedIndex(null);

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

  return (
<div className="p-6 max-w-4xl mx-auto">
  <h2 className="text-3xl font-bold mb-6 text-center">🍽 Recipe Recommendations</h2>

  {/* Favorites Summary */}
<div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
  <h3 className="font-semibold mb-3 text-gray-900 text-lg">Your Favorite Recipes:</h3>

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
    className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-green-700 transition"
  >
    {loading ? "Generating..." : "Generate Similar Recipes"}
  </button>

  {/* Recommendations List */}
  {recommendedRecipes.length > 0 && (
    <div className="mt-8 space-y-6">
      <h3 className="text-2xl font-bold mb-4 text-center">
        ✨ AI Recommended Recipes
      </h3>

      {recommendedRecipes.map((recipe, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-xl shadow-sm bg-white p-5 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <h4 className="text-xl font-semibold text-gray-800">
              {index + 1}. {recipe.title}
            </h4>
            <span className="text-gray-600">
              {expandedIndex === index ? "▲" : "▼"}
            </span>
          </div>

          {/* Collapsible Content */}
          {expandedIndex === index && (
            <div className="mt-4 text-gray-800 space-y-4 animate-fadeIn">
              {/* Info */}
              <div className="text-sm text-gray-600">
                {recipe.difficulty && (
                  <p>
                    <strong>Difficulty:</strong> {recipe.difficulty}
                  </p>
                )}
                {recipe.calories && (
                  <p>
                    <strong>Calories:</strong> {recipe.calories}
                  </p>
                )}
                {recipe.protein && (
                  <p>
                    <strong>Protein:</strong> {recipe.protein}g
                  </p>
                )}
              </div>

              {/* Ingredients */}
              {recipe.ingredients?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1 text-gray-800">
                    🧂 Ingredients:
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              {recipe.steps?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1 text-gray-800">
                    👨‍🍳 Steps:
                  </h4>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1">
                    {recipe.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
  )
}
