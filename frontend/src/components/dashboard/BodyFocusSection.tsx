import React, { useState } from "react";
import { BodyFocusCategory, Exercise, WorkoutPlan } from "../../types";
import { getExercisesByBodyFocusCategory, DEFAULT_WORKOUT_PLANS } from "../../data/exerciseLibrary";
import { ExerciseDetailModal } from "../workout/ExerciseDetailModal";
import { Exercise3DVisualizer } from "../3d/Exercise3DVisualizer";
import { Play, Dumbbell, Flame, Clock, Layers, Sparkles, ChevronRight, Info } from "lucide-react";

interface BodyFocusSectionProps {
  onStartWorkout: (workout: WorkoutPlan) => void;
}

export const BodyFocusSection: React.FC<BodyFocusSectionProps> = ({ onStartWorkout }) => {
  const [activeCategory, setActiveCategory] = useState<BodyFocusCategory>("Abs");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const categories: { id: BodyFocusCategory; label: string; icon: string; desc: string }[] = [
    { id: "Abs", label: "Abs", icon: "⚡", desc: "Core definition, obliques & abdominal strength" },
    { id: "Arms", label: "Arms", icon: "💪", desc: "Biceps peak, firm triceps & forearm stability" },
    { id: "Chest", label: "Chest", icon: "🛡️", desc: "Pectoral upper, lower & mid chest builder" },
    { id: "Legs", label: "Legs", icon: "🦵", desc: "Quads, glutes, hamstrings & calf elevation" },
    { id: "Shoulders", label: "Shoulders", icon: "🎯", desc: "Capped deltoids & rotator cuff mobility" },
  ];

  // Get all exercises specifically for active category (no 6-exercise limit!)
  const categoryExercises: Exercise[] = getExercisesByBodyFocusCategory(activeCategory);

  // Get primary category workout plan or generate a dynamic one
  const categoryWorkout: WorkoutPlan = DEFAULT_WORKOUT_PLANS.find(
    (w) => w.bodyFocus === activeCategory
  ) || {
    id: `${activeCategory.toLowerCase()}_focus_workout`,
    title: `${activeCategory} Sculpt & Shred Plan`,
    description: `Targeted routine specifically built for ${activeCategory.toLowerCase()} development.`,
    bodyFocus: activeCategory,
    category: "Muscle Sculpt",
    totalMinutes: 20,
    estimatedCalories: 180,
    difficulty: "Intermediate",
    safetyAdvice: `Maintain proper form during all ${activeCategory} exercises.`,
    warmUp: [],
    mainRoutine: categoryExercises,
    coolDown: [],
  };

  const handleStartCategoryWorkout = () => {
    // Ensure all category exercises are included in the workout
    const fullPlan: WorkoutPlan = {
      ...categoryWorkout,
      mainRoutine: categoryExercises.length > 0 ? categoryExercises : categoryWorkout.mainRoutine,
    };
    onStartWorkout(fullPlan);
  };

  return (
    <div className="bg-[#0b0b0e] border border-[#22222a] rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#c6ff00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold uppercase tracking-wider border border-[#c6ff00]/30 mb-2">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Target Muscle Focus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Body Focus</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Select a muscle group to view dedicated workouts and all relevant exercises.
          </p>
        </div>

        <button
          onClick={handleStartCategoryWorkout}
          className="px-6 py-3.5 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-[#c6ff00]/20 flex items-center justify-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Start {activeCategory} Workout ({categoryExercises.length} Exercises)</span>
        </button>
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none relative z-10">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2.5 whitespace-nowrap shrink-0 border ${
                isActive
                  ? "bg-[#c6ff00] text-black border-[#c6ff00] shadow-lg shadow-[#c6ff00]/20 scale-105"
                  : "bg-[#14141c] text-slate-300 hover:bg-[#1a1a24] hover:text-white border-[#22222a]"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? "bg-black text-[#c6ff00]" : "bg-[#22222a] text-slate-400"
                }`}
              >
                {getExercisesByBodyFocusCategory(cat.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Feature Card */}
      <div className="p-6 rounded-2xl bg-[#121218] border border-[#22222a] space-y-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#22222a] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold uppercase border border-[#c6ff00]/20">
                {activeCategory} Category Routine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {categoryWorkout.totalMinutes} Mins · ~{categoryWorkout.estimatedCalories} kcal
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">{categoryWorkout.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300">{categoryWorkout.description}</p>
          </div>

          <button
            onClick={handleStartCategoryWorkout}
            className="px-5 py-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#252533] border border-[#c6ff00]/40 text-[#c6ff00] text-xs font-bold flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-[#c6ff00]" />
            <span>Launch Full Routine</span>
          </button>
        </div>

        {/* Exercises Section Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c6ff00]" />
            <h4 className="text-sm font-extrabold text-white">
              All {activeCategory} Exercises ({categoryExercises.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">Click any exercise to view details & 3D demo</span>
        </div>

        {/* Dynamic Exercise Grid - Displays ALL Exercises in Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryExercises.map((ex, idx) => (
            <div
              key={ex.id || idx}
              onClick={() => setSelectedExercise(ex)}
              className="p-4 rounded-2xl bg-[#08080a] border border-[#22222a] hover:border-[#c6ff00]/60 hover:bg-[#14141c] cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#c6ff00]/10 border border-[#c6ff00]/20 text-[#c6ff00] text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h5 className="text-sm font-bold text-white group-hover:text-[#c6ff00] transition-colors">
                    {ex.name}
                  </h5>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#c6ff00] group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="text-xs text-slate-400 line-clamp-1">
                Target: <span className="text-slate-300 font-medium">{ex.targetMuscles}</span>
              </div>

              {/* Specs pill footer */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#1a1a24]">
                <span className="text-[#c6ff00] font-bold">
                  {ex.reps ? `${ex.reps} Reps × ${ex.sets || 3} Sets` : `${ex.durationSec || 30}s Hold`}
                </span>
                <span className="text-slate-400">{ex.restSec}s Rest</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onStartWorkout={onStartWorkout}
        />
      )}
    </div>
  );
};
