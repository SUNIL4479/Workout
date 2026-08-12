import React, { useEffect, useState } from "react";
import { AnimationType } from "../../types";
import {
  getExerciseDBGif,
  fetchLiveExerciseDBList,
  EXERCISE_DB_CATALOG,
  ExerciseDBItem,
} from "../../data/exerciseGifs";
import { Pause, Info, Sparkles, ImageOff } from "lucide-react";

interface Exercise3DVisualizerProps {
  animationType: AnimationType;
  exerciseName: string;
  targetMuscles: string;
  isPlaying?: boolean;
  className?: string;
}

export const Exercise3DVisualizer: React.FC<Exercise3DVisualizerProps> = ({
  animationType,
  exerciseName,
  targetMuscles,
  isPlaying = true,
  className = "w-full h-80 md:h-96",
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [imgFallbackLevel, setImgFallbackLevel] = useState(0);

  useEffect(() => {
    fetchLiveExerciseDBList();
  }, []);

  // Retrieve matched ExerciseDB item
  const exerciseDbData: ExerciseDBItem = getExerciseDBGif(exerciseName, animationType, targetMuscles);

  // Fallback chain: primary gif -> curated catalog gif -> placeholder panel (never a broken icon)
  const fallbackItem: ExerciseDBItem = (animationType && EXERCISE_DB_CATALOG[animationType])
    ? EXERCISE_DB_CATALOG[animationType]
    : EXERCISE_DB_CATALOG.pushup;
  const gifCandidates: string[] = [exerciseDbData.gifUrl, fallbackItem.gifUrl];
  const showPlaceholder = imgFallbackLevel >= gifCandidates.length;
  const activeGifUrl = gifCandidates[Math.min(imgFallbackLevel, gifCandidates.length - 1)];
  const handleImgError = () => setImgFallbackLevel((level) => level + 1);

  return (
    <div className={`relative rounded-[28px] overflow-hidden border border-[#222222] bg-[#080808] shadow-2xl flex flex-col ${className}`}>
      {/* Top Header Status Bar */}
      <div className="bg-[#121215] border-b border-[#222222] px-4 py-2.5 sm:py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c6ff00] animate-ping" />
          <span className="text-[11px] sm:text-xs font-black text-[#c6ff00] uppercase tracking-wider">Exercise Motion Demonstration</span>
        </div>

        <div className="text-[10px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#c6ff00]" />
          <span>ExerciseDB Verified Form</span>
        </div>
      </div>

      {/* Primary Display Area */}
      <div className="relative w-full h-full flex items-center justify-center bg-radial from-[#15251a] via-[#080f0a] to-[#050505]">
        {showPlaceholder ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#222222] text-slate-500">
              <ImageOff className="w-8 h-8" />
            </div>
            <div className="text-xs font-bold text-slate-300">{exerciseName}</div>
            <div className="text-[10px] text-slate-500 max-w-xs">
              Motion demonstration unavailable. Follow the form cues below and the AI voice coach.
            </div>
          </div>
        ) : (
          <img
            src={activeGifUrl}
            alt={exerciseName}
            onError={handleImgError}
            className="w-full h-full object-contain max-h-[460px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] p-4"
          />
        )}

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="p-4 rounded-full bg-black/80 border border-[#c6ff00] text-[#c6ff00] shadow-xl">
              <Pause className="w-8 h-8" />
            </div>
          </div>
        )}

        {/* Bottom Exercise Meta Box */}
        <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md border border-[#222222] p-3 rounded-2xl flex items-center justify-between z-10">
          <div>
            <div className="text-xs sm:text-sm font-black text-white">{exerciseName}</div>
            <div className="text-[10px] sm:text-xs font-semibold text-[#c6ff00] flex items-center gap-2">
              <span>Target: {exerciseDbData.target}</span>
              <span className="hidden sm:inline">• Equipment: {exerciseDbData.equipment}</span>
            </div>
          </div>

          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] text-slate-300 text-[10px] sm:text-xs font-bold border border-[#333333] flex items-center gap-1 transition-colors shrink-0"
          >
            <Info className="w-3 h-3 text-[#c6ff00]" />
            <span>{showInstructions ? "Hide Form" : "Form Steps"}</span>
          </button>
        </div>

        {showInstructions && exerciseDbData.instructions && (
          <div className="absolute inset-x-3 bottom-16 bg-[#0f0f0f]/95 border border-[#c6ff00]/40 rounded-2xl p-4 text-xs space-y-2 z-20 backdrop-blur-md shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#222222] pb-1.5">
              <span className="font-extrabold text-[#c6ff00]">ExerciseDB Form Cues</span>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-slate-400 hover:text-white text-[10px] uppercase font-bold"
              >
                Close
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
              {exerciseDbData.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
