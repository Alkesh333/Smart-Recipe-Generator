import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

export default function Dashboard() {
    const [session, setSession] = useState(null);
    const [ingredients, setIngredients] = useState("");
    const [diet, setDiet] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("");
    const [maxCookingTime, setMaxCookingTime] = useState("");
    const [servings, setServings] = useState(1);
    const [aiRecipes, setAiRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);

    // Get current session
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                window.location.href = "/login";
            } else {
                setSession(data.session);
            }
        });
    }, []);

    const handleGenerateRecipes = async () => {
        if (!ingredients) return alert("Please enter some ingredients!");
        setLoading(true);
        setAiRecipes([]);
        setExpandedIndex(null);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
You are a recipe assistant.
Based on the ingredients: [${ingredients}]
and dietary preference: [${diet || "none"}],
generate **3 recipes**.

Filters:
- Difficulty: ${difficultyFilter || "any"}
- Max Cooking Time: ${maxCookingTime || "any"} minutes
- Serving Size: ${servings}

Each recipe should include:
- Title
- Ingredients (adjusted for ${servings} servings)
- Steps (detailed instructions)
- Difficulty level (easy, medium, hard)
- Nutritional information (calories, protein)

Return strictly in JSON format like this:
[
  {
    "title": "Recipe Title",
    "ingredients": ["..."],
    "steps": ["..."],
    "difficulty": "...",
    "calories": 250,
    "protein": 12
  },
  ...
]
`;

            const result = await model.generateContent(prompt);
            const text = await result.response.text();
            const cleaned = text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            setAiRecipes(parsed);
        } catch (err) {
            console.error("Gemini Error:", err);
            alert("Failed to generate recipes. Try again.");
        }

        setLoading(false);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">🍳 AI Recipe Recommender</h2>

            {/* Ingredients Input */}
            <div className="mb-4">
                <label className="block mb-2 font-semibold">Available Ingredients:</label>
                <input
                    type="text"
                    placeholder="e.g. eggs, tomato, cheese"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="border p-2 w-full rounded shadow-sm"
                />
            </div>

            {/* Dietary Preference */}
            <div className="mb-4">
                <label className="block mb-2 font-semibold">Dietary Preference:</label>
                <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="border p-2 w-full rounded shadow-sm"
                >
                    <option value="">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                    <option value="keto">Keto</option>
                </select>
            </div>

            {/* Filters */}
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2 font-semibold">Difficulty Filter:</label>
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="border p-2 w-full rounded shadow-sm"
                    >
                        <option value="">Any</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 font-semibold">Max Cooking Time (min):</label>
                    <input
                        type="number"
                        value={maxCookingTime}
                        onChange={(e) => setMaxCookingTime(e.target.value)}
                        className="border p-2 w-full rounded shadow-sm"
                        placeholder="e.g. 30"
                    />
                </div>
            </div>

            {/* Serving Size */}
            <div className="mb-4">
                <label className="block mb-2 font-semibold">Serving Size:</label>
                <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="border p-2 w-full rounded shadow-sm"
                    min={1}
                />
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerateRecipes}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition"
            >
                {loading ? "Generating..." : "Generate Recipes"}
            </button>

            {/* Recipes List */}
            {aiRecipes.length > 0 && (
                <div className="mt-8 space-y-6">
                    <h3 className="text-2xl font-semibold mb-4 text-center">✨ Suggested Recipes</h3>

                    {aiRecipes.map((recipe, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                        >
                            {/* Recipe Header */}
                            <div
                                className="p-4 cursor-pointer text-black hover:bg-gray-100 flex justify-between items-center transition"
                                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                            >
                                <h4 className="font-bold text-lg">{recipe.title}</h4>
                                <span className="text-black-600">{expandedIndex === index ? "▲" : "▼"}</span>
                            </div>

                            {expandedIndex === index && (
                                <div className="p-6 bg-black space-y-3">
                                    {/* Recipe Info */}
                                    <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
                                    <p><strong>Calories:</strong> {recipe.calories}</p>
                                    <p><strong>Protein:</strong> {recipe.protein}g</p>
                                    <p><strong>Servings:</strong> {servings}</p>

                                    {/* Ingredients */}
                                    <div>
                                        <p className="font-semibold mb-1">Ingredients:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {recipe.ingredients?.map((ing, i) => (
                                                <li key={i}>{ing}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Steps */}
                                    <div>
                                        <p className="font-semibold mb-1">Steps:</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            {recipe.steps?.map((step, i) => (
                                                <li key={i}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Add to Favorites Button */}
                                    <button
                                        onClick={async () => {
                                            if (!session) return alert("You must be logged in!");

                                            try {

                                                await supabase.from("favorites").insert([
                                                    {
                                                        user_id: session.user.id,
                                                        title: recipe.title || "Untitled Recipe",
                                                        ingredients: recipe.ingredients || [],
                                                        steps: recipe.steps || [],
                                                        created_at: new Date(),
                                                    },
                                                ]);

                                                console.log(`This is the fucking shit ${recipe.title}`)
                                                console.log(`This is the fucking shit2 ${recipe.ingredients}`)
                                                console.log(`This is the fucking shit3 ${recipe.steps}`)

                                                alert("Recipe added to favorites!");
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to add favorite.");
                                            }
                                        }}
                                        className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                                    >
                                        ❤️ Add to Favorites
                                    </button>


                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}