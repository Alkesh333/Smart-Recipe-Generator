import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Top20Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

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

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Loading top recipes...
      </p>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">
        🏆 Top 20 Recipes
      </h2>

      {recipes.length === 0 ? (
        <p className="text-center text-gray-500">No recipes available.</p>
      ) : (
        <div className="space-y-6">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-xl shadow-sm bg-white p-5 hover:shadow-md transition-shadow"
            >
              {/* Title */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {index + 1}. {recipe.title}
                </h3>
                <span className="text-gray-600">
                  {expandedIndex === index ? "▲" : "▼"}
                </span>
              </div>

              {/* Collapsible Content */}
              {expandedIndex === index && (
                <div className="mt-4 text-gray-800 space-y-4 animate-fadeIn">
                  {/* Info */}
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Difficulty:</strong> {recipe.difficulty}
                    </p>
                    <p>
                      <strong>Calories:</strong> {recipe.calories}
                    </p>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-800">
                      🧂 Ingredients:
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {recipe.ingredients?.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-800">
                      👨‍🍳 Steps:
                    </h4>
                    <ol className="list-decimal list-inside text-gray-700 space-y-1">
                      {recipe.steps?.map((step, i) => (
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
