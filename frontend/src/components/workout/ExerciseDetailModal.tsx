import React from "react";
import { Exercise, WorkoutPlan } from "../../types";
import { Exercise3DVisualizer } from "../3d/Exercise3DVisualizer";
import { X, Play, ShieldAlert, Dumbbell, Zap, Clock, Repeat, Flame, Layers, Info } from "lucide-react";

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onStartWorkout?: (workout: WorkoutPlan) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onStartWorkout,
}) => {
  if (!exercise) return null;

  const handleStartSingleExerciseWorkout = () => {
    if (!onStartWorkout) return;
    const customPlan: WorkoutPlan = {
      id: `plan_single_${exercise.id}_${Date.now()}`,
      title: `${exercise.name} Focused Workout`,
      description: `Targeted session focusing on ${exercise.targetMuscles} with ${exercise.sets || 3} sets of ${exercise.name}.`,
      bodyFocus: exercise.bodyFocus,
      category: "Muscle Sculpt",
      totalMinutes: Math.max(5, Math.round(((exercise.durationSec || 30) + exercise.restSec) * (exercise.sets || 3) / 60)),
      estimatedCalories: exercise.calories * (exercise.sets || 3),
      difficulty: exercise.difficulty || "Intermediate",
      safetyAdvice: exercise.safetyTips || "Maintain proper form throughout all reps.",
      warmUp: [],
      mainRoutine: [exercise],
      coolDown: [],
    };
    onStartWorkout(customPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f0f12] border border-[#22222a] rounded-[28px] max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#22222a] bg-[#14141a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c6ff00]/10 text-[#c6ff00] border border-[#c6ff00]/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-[10px] font-black uppercase tracking-wider border border-[#c6ff00]/30">
                {exercise.bodyFocus || "Body Focus"} Exercise
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">{exercise.name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1f1f28] hover:bg-[#2a2a38] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
          {/* 3D Motion Demonstration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-[#c6ff00] font-bold">
                <Zap className="w-4 h-4" /> Interactive 3D Motion Animation
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Looping Form Demo</span>
            </div>
            <Exercise3DVisualizer
              animationType={exercise.animationType}
              exerciseName={exercise.name}
              targetMuscles={exercise.targetMuscles}
              className="w-full h-64 sm:h-80 rounded-2xl border border-[#22222a]"
            />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#14141a] border border-[#22222a] text-center space-y-1">
              <Layers className="w-4 h-4 text-purple-400 mx-auto" />
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Sets</div>
              <div className="text-base sm:text-lg font-black text-white">{exercise.sets || 3} Sets</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#14141a] border border-[#22222a] text-center space-y-1">
              <Repeat className="w-4 h-4 text-[#c6ff00] mx-auto" />
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Work</div>
              <div className="text-base sm:text-lg font-black text-[#c6ff00]">
                {exercise.reps ? `${exercise.reps} Reps` : `${exercise.durationSec || 30}s Hold`}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#14141a] border border-[#22222a] text-center space-y-1">
              <Clock className="w-4 h-4 text-sky-400 mx-auto" />
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Rest Time</div>
              <div className="text-base sm:text-lg font-black text-sky-300">{exercise.restSec}s Rest</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#14141a] border border-[#22222a] text-center space-y-1">
              <Flame className="w-4 h-4 text-rose-400 mx-auto" />
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Burn</div>
              <div className="text-base sm:text-lg font-black text-rose-400">~{exercise.calories * (exercise.sets || 3)} kcal</div>
            </div>
          </div>

          {/* Target Muscles */}
          <div className="p-4 rounded-2xl bg-[#14141a] border border-[#22222a] space-y-1.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Muscle Group</div>
            <div className="text-sm font-semibold text-[#c6ff00]">{exercise.targetMuscles}</div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <span>How to Perform This Exercise</span>
            </h4>
            <div className="p-4 rounded-2xl bg-[#070709] border border-[#22222a] text-xs sm:text-sm text-slate-300 leading-relaxed">
              {exercise.instructions}
            </div>
          </div>

          {/* Form Cues & Safety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercise.formCues && (
              <div className="p-3.5 rounded-xl bg-[#c6ff00]/10 border border-[#c6ff00]/20 text-[#c6ff00] text-xs">
                <strong>Coach Form Cue:</strong> "{exercise.formCues}"
              </div>
            )}
            {exercise.safetyTips && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>Safety Advice:</strong> {exercise.safetyTips}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#22222a] bg-[#14141a] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-[#1f1f28] hover:bg-[#2a2a38] text-slate-300 font-bold text-xs sm:text-sm transition-colors"
          >
            Close Details
          </button>

          {onStartWorkout && (
            <button
              onClick={handleStartSingleExerciseWorkout}
              className="flex-1 py-3.5 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c6ff00]/20 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start Exercise Workout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
