import React, { useState } from "react";
import { UserProfile, MealPlan } from "../../types";
import { apiFetch } from "../../services/api";
import { Activity, Apple, Sparkles, Loader2, RefreshCw, Droplets, Utensils, CheckCircle2 } from "lucide-react";

interface NutritionPlannerProps {
  user: UserProfile;
}

export const NutritionPlanner: React.FC<NutritionPlannerProps> = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    dailyCalories: user.calorieTarget || 2100,
    proteinGrams: Math.round(user.weightKg * 1.8),
    carbsGrams: Math.round(user.weightKg * 3),
    fatsGrams: Math.round(user.weightKg * 0.9),
    waterLiters: user.waterGoalLiters || 3.0,
    meals: {
      breakfast: {
        name: "High-Protein Berry Oatmeal Bowl",
        calories: 420,
        protein: "28g Protein",
        description: "Rolled oats simmered with chia seeds, scoop of whey/plant protein, fresh blueberries & almonds.",
        ingredients: ["Rolled Oats (60g)", "Protein Powder (30g)", "Chia Seeds (1 tbsp)", "Fresh Berries", "Almonds (15g)"],
      },
      lunch: {
        name: "Grilled Chicken/Tofu Quinoa Power Salad",
        calories: 580,
        protein: "42g Protein",
        description: "Fluffy quinoa topped with grilled chicken or crispy tofu, avocado, cucumber, pumpkin seeds & olive oil dressing.",
        ingredients: ["Grilled Protein (180g)", "Quinoa (1 cup cooked)", "Mixed Greens", "Avocado (1/2)", "Extra Virgin Olive Oil"],
      },
      snack: {
        name: "Greek Yogurt & Walnut Cup",
        calories: 240,
        protein: "18g Protein",
        description: "Unsweetened Greek yogurt drizzled with raw honey and crushed walnuts.",
        ingredients: ["Greek Yogurt (200g)", "Walnuts (15g)", "Raw Honey (1 tsp)"],
      },
      dinner: {
        name: "Baked Salmon/Lentil Medley with Roasted Veggies",
        calories: 620,
        protein: "38g Protein",
        description: "Herb-baked salmon or seasoned brown lentils served with steamed broccoli, carrots, and sweet potato mash.",
        ingredients: ["Wild Salmon or Lentils (200g)", "Sweet Potato (150g)", "Steamed Broccoli", "Garlic & Olive Oil"],
      },
    },
    coachTip: "Prioritize 25-30g of protein in every main meal to maximize muscle recovery and sustain metabolic satiety.",
  });

  const handleGenerateMealPlan = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("ai/generate-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: user }),
      });
      const data = await res.json();
      if (data.success && data.mealPlan) {
        setMealPlan(data.mealPlan);
      }
    } catch (err) {
      console.error("Error generating meal plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold border border-[#c6ff00]/30">
            <Apple className="w-4 h-4 text-[#c6ff00]" />
            <span>AI Smart Nutrition Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1">Daily Meal & Macro Planner</h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            AI-designed nutrition plans aligned with your dietary preference ({user.diet.toUpperCase()}) and fitness goal.
          </p>
        </div>

        <button
          onClick={handleGenerateMealPlan}
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-xs shadow-lg flex items-center gap-2 self-start md:self-auto hover:scale-105 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Customizing Meals...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>Regenerate AI Meal Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Macro Target Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px]">
          <div className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Daily Calories</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{mealPlan.dailyCalories} kcal</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px]">
          <div className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Protein Target</div>
          <div className="text-2xl sm:text-3xl font-bold text-[#c6ff00] mt-1">{mealPlan.proteinGrams}g</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px]">
          <div className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Carbohydrates</div>
          <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-1">{mealPlan.carbsGrams}g</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px]">
          <div className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Healthy Fats</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">{mealPlan.fatsGrams}g</div>
        </div>
      </div>

      {/* Coach Tip Banner */}
      {mealPlan.coachTip && (
        <div className="p-4 rounded-2xl bg-[#c6ff00]/10 border border-[#c6ff00]/20 text-[#c6ff00] text-xs flex items-center gap-3">
          <Activity className="w-5 h-5 shrink-0" />
          <span><strong>AI Nutrition Insight:</strong> {mealPlan.coachTip}</span>
        </div>
      )}

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Breakfast", meal: mealPlan.meals.breakfast, icon: "🌅" },
          { title: "Lunch", meal: mealPlan.meals.lunch, icon: "☀️" },
          { title: "Dinner", meal: mealPlan.meals.dinner, icon: "🌙" },
          { title: "Snack", meal: mealPlan.meals.snack, icon: "🥑" },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#222222] rounded-[24px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold border border-[#c6ff00]/20">
                  {item.meal.calories} kcal
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1a1a1a] text-slate-300 text-xs font-bold border border-[#222222]">
                  {item.meal.protein}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">{item.meal.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.meal.description}</p>
            </div>

            <div className="pt-3 border-t border-[#222222] space-y-1.5">
              <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                Key Ingredients
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.meal.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#050505] border border-[#222222] text-slate-300 text-xs">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
