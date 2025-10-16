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
    const [selectedRecipe, setSelectedRecipe] = useState(null);

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

    const fallbackImages = [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1496412705862-e0088f16f791?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop",
    ];

    const getRecipeImage = (recipe) => {
        const title = (recipe?.title || "recipe").toLowerCase();
        const topIngredients = (recipe?.ingredients || []).slice(0, 3).join(", ");
        const query = encodeURIComponent(`${title}, ${topIngredients}, plated dish, food photography, high detail`);
        // Use Unsplash featured search for more query-specific images
        return `https://source.unsplash.com/featured/800x800?${query}`;
    };

    return (
        <div className="relative min-h-screen w-screen overflow-x-hidden text-gray-800">
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100" />
            {/* cute spinning veggies (PNG, higher contrast) */}
            <img
                src="https://img.icons8.com/color/240/carrot.png"
                alt="carrot"
                className="pointer-events-none select-none absolute left-6 top-10 hidden h-16 w-16 opacity-40 drop-shadow-xl [animation:spin_18s_linear_infinite] md:block"
            />
            <img
                src="https://img.icons8.com/color/240/tomato.png"
                alt="tomato"
                className="pointer-events-none select-none absolute right-12 top-28 hidden h-16 w-16 opacity-40 drop-shadow-xl [animation:spin_22s_linear_infinite] md:block"
            />
            <img
                src="https://img.icons8.com/color/240/broccoli.png"
                alt="broccoli"
                className="pointer-events-none select-none absolute left-24 bottom-10 hidden h-16 w-16 opacity-40 drop-shadow-xl [animation:spin_20s_linear_infinite] md:block"
            />

            <div className="mx-auto w-full max-w-4xl p-4 md:py-12">
                <h2 className="text-center text-3xl font-extrabold tracking-tight text-emerald-800">🍳  Recipe Recommender</h2>
                <p className="mt-1 text-center text-sm text-gray-700">Type your ingredients and let the kitchen magic happen.</p>
                <div className="mx-auto w-full max-w-md">

                {/* Ingredients Input */}
                <div className="mb-4">
                    <label className="mb-2 block font-semibold">Available Ingredients:</label>
                    <input
                        type="text"
                        placeholder="e.g. eggs, tomato, cheese"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 md:p-3 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                    />
                </div>

                {/* Dietary Preference */}
                <div className="mb-4">
                    <label className="mb-2 block font-semibold">Dietary Preference:</label>
                    <select
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 md:p-3 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="">None</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="gluten-free">Gluten-Free</option>
                        <option value="keto">Keto</option>
                    </select>
                </div>

                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block font-semibold">Difficulty Filter:</label>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 md:p-3 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="">Any</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block font-semibold">Max Cooking Time (min):</label>
                        <input
                            type="number"
                            value={maxCookingTime}
                            onChange={(e) => setMaxCookingTime(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 md:p-3 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                            placeholder="e.g. 30"
                        />
                    </div>
                </div>

                {/* Serving Size */}
                <div className="mb-6">
                    <label className="mb-2 block font-semibold">Serving Size:</label>
                    <input
                        type="number"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 md:p-3 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        min={1}
                    />
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerateRecipes}
                    disabled={loading}
                    className="mx-auto block w-full md:w-auto rounded-lg bg-gradient-to-r from-emerald-600 to-lime-600 px-5 py-2.5 text-base md:px-6 md:py-3 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-70"
                >
                    {loading ? (
                        <span className="inline-flex items-center gap-2">
                            <span className="text-xl drop-shadow animate-bounce">🔥</span>
                            Whisking ideas...
                        </span>
                    ) : (
                        "Generate Recipes"
                    )}
                </button>

                {loading && (
                    <div className="mt-3 flex items-center gap-2 text-amber-700">
                        <span className="text-2xl drop-shadow animate-pulse">🔥</span>
                        <span className="text-sm font-medium">Cooking in progress...</span>
                    </div>
                )}

                {/* Centered big fire while loading */}
                {loading && (
                    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <div className="rounded-full bg-white/70 p-6 md:p-10 shadow-2xl backdrop-blur">
                            <span className="block text-[96px] md:text-[140px] leading-none drop-shadow-xl animate-bounce">🔥</span>
                        </div>
                    </div>
                )}

                </div>

                {/* Recipes Grid */}
                {aiRecipes.length > 0 && (
                    <div className="mt-6 md:mt-8">
                        <h3 className="mb-4 text-center text-2xl font-semibold text-emerald-800">✨ Suggested Recipes</h3>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 justify-items-center">
                            {aiRecipes.map((recipe, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className="group relative w-full max-w-xs sm:max-w-sm mx-auto aspect-[4/3] overflow-hidden rounded-xl shadow-lg ring-1 ring-gray-200 transition hover:shadow-xl"
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
                                        <h4 className="text-lg font-bold text-white drop-shadow">{recipe.title}</h4>
                                        {recipe.difficulty && (
                                            <span className="mt-1 inline-block rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-medium text-white">
                                                {recipe.difficulty}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recipe Modal */}
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
                                    <p><strong>Protein:</strong> {selectedRecipe.protein}g</p>
                                    <p><strong>Servings:</strong> {servings}</p>
                                    <button
                                        onClick={async () => {
                                            if (!session) return alert("You must be logged in!");
                                            try {
                                                await supabase.from("favorites").insert([
                                                    {
                                                        user_id: session.user.id,
                                                        title: selectedRecipe.title || "Untitled Recipe",
                                                        ingredients: selectedRecipe.ingredients || [],
                                                        steps: selectedRecipe.steps || [],
                                                        created_at: new Date(),
                                                    },
                                                ]);
                                                alert("Recipe added to favorites!");
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to add favorite.");
                                            }
                                        }}
                                        className="mt-3 rounded bg-yellow-500 px-4 py-2 text-white transition hover:bg-yellow-600"
                                    >
                                        ❤️ Add to Favorites
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-1 font-semibold">Ingredients:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {selectedRecipe.ingredients?.map((ing, i) => (
                                                <li key={i}>{ing}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="mb-1 font-semibold">Steps:</p>
                                        <ol className="list-decimal list-inside space-y-1 max-h-56 overflow-auto pr-2">
                                            {selectedRecipe.steps?.map((step, i) => (
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