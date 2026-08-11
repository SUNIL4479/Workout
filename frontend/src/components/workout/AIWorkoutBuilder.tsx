import React, { useState } from "react";
import { UserProfile, WorkoutPlan, Exercise } from "../../types";
import { apiFetch } from "../../services/api";
import { Exercise3DVisualizer } from "../3d/Exercise3DVisualizer";
import { Sparkles, Play, Bot, Loader2, Dumbbell, ShieldCheck, Flame, Clock, Zap, Eye, CheckCircle2 } from "lucide-react";

interface AIWorkoutBuilderProps {
  user: UserProfile;
  onLaunchWorkout: (workout: WorkoutPlan) => void;
}

export const AIWorkoutBuilder: React.FC<AIWorkoutBuilderProps> = ({ user, onLaunchWorkout }) => {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);

  const quickPills = [
    "15-Min Knee-Friendly Fat Burn",
    "Chest & Triceps Sculpt (No Equipment)",
    "Ab & Core Waist Shredder",
    "Desk Worker Posture & Back Fix",
    "Low-Impact Full Body Energy",
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await apiFetch("ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: finalPrompt,
          profile: user,
        }),
      });

      const data = await res.json();
      if (data.success && data.workout) {
        const workoutData: WorkoutPlan = {
          id: "wo_" + Date.now(),
          title: data.workout.title || "Custom AI Workout",
          description: data.workout.description || "Personalized zero-equipment routine.",
          category: data.workout.category || "Full Body",
          totalMinutes: data.workout.totalMinutes || 20,
          estimatedCalories: data.workout.estimatedCalories || 160,
          difficulty: data.workout.difficulty || "Intermediate",
          safetyAdvice: data.workout.safetyAdvice || "Land softly and maintain proper breathing.",
          warmUp: data.workout.warmUp || [],
          mainRoutine: data.workout.mainRoutine || [],
          coolDown: data.workout.coolDown || [],
        };

        setGeneratedWorkout(workoutData);
      } else {
        setErrorMsg("Could not generate custom workout. Please try again.");
      }
    } catch (err) {
      console.error("AI Workout Generation Error:", err);
      setErrorMsg("Connection issue. Please verify network or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/20">
          <Bot className="w-4 h-4" />
          <span>Generative AI Routine Architect</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">AI Home Workout Studio</h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
          Describe what you want to work on today, your time limit, or any soreness/pain. Gemini will construct a zero-equipment routine tailored to your body.
        </p>
      </div>

      {/* Input Box & Quick Pills */}
      <div className="bg-[#111111] border border-[#222222] rounded-[24px] p-6 space-y-4 shadow-xl">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider">
            Ask AI to Build a Workout
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Build a 15 minute chest and abs workout. I have a minor right knee strain so avoid heavy jumps.'"
              className="w-full bg-[#050505] border border-[#222222] focus:border-[#c6ff00] rounded-2xl p-4 text-white text-sm outline-none transition-colors pr-12"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="absolute bottom-3 right-3 px-5 py-2.5 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] disabled:opacity-50 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Generate Routine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="space-y-2 pt-2">
          <span className="text-xs text-[#666666] font-medium uppercase tracking-wider">Quick Suggestions:</span>
          <div className="flex flex-wrap gap-2">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(pill);
                  handleGenerate(pill);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0a0a0a] border border-[#222222] hover:border-[#c6ff00]/50 hover:bg-[#1a1a1a] text-slate-300 hover:text-[#c6ff00] text-xs transition-all"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 bg-[#111111] border border-[#222222] rounded-[24px] text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#c6ff00]/30 border-t-[#c6ff00] animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-200">
            Synthesizing exercises, rest intervals & joint safety warnings...
          </div>
        </div>
      )}

      {/* Generated Routine Card Result */}
      {generatedWorkout && !loading && (
        <div className="bg-[#111111] border border-[#c6ff00]/40 rounded-[24px] p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold uppercase border border-[#c6ff00]/30">
                  {generatedWorkout.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-slate-300 text-xs font-bold uppercase border border-[#222222]">
                  {generatedWorkout.difficulty}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{generatedWorkout.title}</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">{generatedWorkout.description}</p>
            </div>

            <button
              onClick={() => onLaunchWorkout(generatedWorkout)}
              className="px-8 py-4 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-base shadow-xl shadow-[#c6ff00]/20 transition-all hover:scale-105 flex items-center justify-center gap-3 shrink-0"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Start Workout Now</span>
            </button>
          </div>

          {/* Key Metrics Header */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-[#050505] border border-[#222222]">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#c6ff00]" />
              <div>
                <div className="text-xs text-slate-400">Duration</div>
                <div className="text-sm font-bold text-white">{generatedWorkout.totalMinutes} Mins</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs text-slate-400">Est. Calories</div>
                <div className="text-sm font-bold text-white">~{generatedWorkout.estimatedCalories} kcal</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400">Safety Status</div>
                <div className="text-sm font-bold text-emerald-300">Injury Filter Active</div>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          {generatedWorkout.safetyAdvice && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span><strong>Coach Safety Warning:</strong> {generatedWorkout.safetyAdvice}</span>
            </div>
          )}

          {/* Motion Demonstration Preview for Selected Workout Exercise */}
          {generatedWorkout.mainRoutine.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#c6ff00]" />
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Exercise Form Demonstration:{" "}
                    <span className="text-[#c6ff00]">
                      {generatedWorkout.mainRoutine[selectedPreviewIndex]?.name || generatedWorkout.mainRoutine[0].name}
                    </span>
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Select any exercise below to preview motion demonstration
                </span>
              </div>

              <Exercise3DVisualizer
                animationType={
                  generatedWorkout.mainRoutine[selectedPreviewIndex]?.animationType ||
                  generatedWorkout.mainRoutine[0].animationType
                }
                exerciseName={
                  generatedWorkout.mainRoutine[selectedPreviewIndex]?.name ||
                  generatedWorkout.mainRoutine[0].name
                }
                targetMuscles={
                  generatedWorkout.mainRoutine[selectedPreviewIndex]?.targetMuscles ||
                  generatedWorkout.mainRoutine[0].targetMuscles
                }
                className="w-full h-80 sm:h-[440px] lg:h-[500px]"
              />
            </div>
          )}

          {/* Exercise List in Routine */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              Routine Exercises ({generatedWorkout.mainRoutine.length}) — Click to preview 3D posture:
            </h3>
            <div className="space-y-3">
              {generatedWorkout.mainRoutine.map((ex, idx) => {
                const isSelected = selectedPreviewIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPreviewIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#161d08] border-[#c6ff00] shadow-lg shadow-[#c6ff00]/10"
                        : "bg-[#050505] border-[#222222] hover:border-[#444444]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-mono flex items-center justify-center border ${
                            isSelected
                              ? "bg-[#c6ff00] text-black border-[#c6ff00] font-black"
                              : "bg-[#1a1a1a] text-[#c6ff00] border-[#222222]"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span>{ex.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-[#c6ff00]/20 text-[#c6ff00] text-[10px] font-black uppercase">
                            Active 3D Pose
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">Target: {ex.targetMuscles}</div>
                      <div className="text-xs text-slate-300 italic">"{ex.formCues}"</div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-[#c6ff00]">
                      {ex.reps ? <span>{ex.reps} Reps × {ex.sets || 3} Sets</span> : <span>{ex.durationSec}s Hold</span>}
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-400">{ex.restSec}s Rest</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
