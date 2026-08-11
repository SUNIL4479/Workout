import React, { useState, useEffect, useRef } from "react";
import { WorkoutPlan, Exercise } from "../../types";
import { Exercise3DVisualizer } from "../3d/Exercise3DVisualizer";
import { VoiceCoachService } from "../../services/voiceCoachService";
import { WorkoutService } from "../../services/workoutService";
import confetti from "canvas-confetti";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  Award,
  CheckCircle2,
  X,
  Flame,
  Star,
  Activity,
  Smile,
  Zap,
} from "lucide-react";

interface ActiveWorkoutPlayerProps {
  workout: WorkoutPlan;
  onFinishWorkout: (caloriesBurned: number, minutesSpent: number) => void;
  onExit: () => void;
}

export const ActiveWorkoutPlayer: React.FC<ActiveWorkoutPlayerProps> = ({
  workout,
  onFinishWorkout,
  onExit,
}) => {
  const allExercises = React.useMemo(
    () => [...workout.warmUp, ...workout.mainRoutine, ...workout.coolDown],
    [workout]
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentExercise: Exercise = allExercises[currentIndex] || workout.mainRoutine[0];

  const [isResting, setIsResting] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPreparing, setIsPreparing] = useState<boolean>(true);
  const [prepareSec, setPrepareSec] = useState<number>(5);
  const [timerSec, setTimerSec] = useState<number>(currentExercise.durationSec || (currentExercise.reps ? 45 : 30));
  const [restSec, setRestSec] = useState<number>(currentExercise.restSec || 20);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);
  // Guards the rest->next-exercise transition so it can never fire twice for one rest session.
  const restAdvancedRef = React.useRef<boolean>(false);

  // Performance adaptation state
  const [userRating, setUserRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [energyLevel, setEnergyLevel] = useState<"Low" | "Medium" | "High">("Medium");
  const [soreness, setSoreness] = useState<string>("");

  useEffect(() => {
    VoiceCoachService.updateConfig({ enabled: voiceEnabled });
  }, [voiceEnabled]);

  // Pre-workout "Get Ready" phase: demo GIF of the first exercise + countdown + voice intro.
  useEffect(() => {
    if (!isPreparing) return;
    const first = allExercises[0];
    if (first) {
      VoiceCoachService.speak(`Get ready for ${first.name}!`, true);
    }
    // Decrement once per second; cleanup on prepare end so it never loops.
    const interval = setInterval(() => {
      setPrepareSec((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPreparing]);

  // Speak countdown numbers (3-2-1) and finish prep. Numbers only start at 3 so the
  // "Get ready for ..." intro is not cut off immediately.
  useEffect(() => {
    if (!isPreparing) return;
    if (prepareSec === 0) {
      setIsPreparing(false);
      setIsPlaying(true);
      VoiceCoachService.announceCountdown(0);
    } else if (prepareSec <= 3) {
      VoiceCoachService.announceCountdown(prepareSec);
    }
  }, [prepareSec, isPreparing]);

  // Atomic exercise switch: set the target exercise AND its timers in one batch so
  // no intermediate render ever exists where currentIndex has advanced but timerSec is
  // still 0 (which used to make the exercise-hits-0 effect start a rest and skip the
  // newly selected exercise after "Skip Rest" / "Skip" / manual selection).
  const selectExercise = (index: number) => {
    const next = allExercises[index];
    if (!next) return;
    setCurrentIndex(index);
    setIsResting(false);
    setIsPlaying(true);
    setTimerSec(next.durationSec || (next.reps ? 45 : 30));
    setRestSec(next.restSec || 20);
  };

  // Announce the start of the newly selected exercise (fires whenever currentIndex changes).
  useEffect(() => {
    if (!isPreparing) {
      VoiceCoachService.announceExerciseStart(currentExercise.name, currentExercise.formCues);
    }
  }, [currentIndex]);

  // Main Exercise & Rest Timer Hook (pure 1-second ticks only)
  useEffect(() => {
    if (!isPlaying || isPreparing || completed) return;

    const interval = setInterval(() => {
      if (isResting) {
        setRestSec((prev) => prev - 1);
      } else {
        setTimerSec((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isResting, completed, isPreparing]);

  // Exercise timer hits 0 -> start rest interval. Resets the advance guard so the
  // upcoming rest session can advance exactly once.
  useEffect(() => {
    if (isResting || isPreparing || completed) return;
    if (timerSec <= 0) {
      restAdvancedRef.current = false;
      const rest = currentExercise.restSec || 20;
      setIsResting(true);
      setRestSec(rest);
      VoiceCoachService.announceRestStart(rest);
    }
  }, [timerSec, isResting, isPreparing, completed, currentExercise]);

  // Rest timer hits 0 -> advance to next exercise. Guarded so a re-render (e.g. the
  // currentIndex dep changing right after the advance) can never advance twice.
  useEffect(() => {
    if (!isResting || isPreparing || completed) return;
    if (restSec <= 0) {
      if (restAdvancedRef.current) return;
      restAdvancedRef.current = true;
      if (currentIndex < allExercises.length - 1) {
        selectExercise(currentIndex + 1);
      } else {
        triggerCompletion();
      }
    }
  }, [restSec, isResting, isPreparing, completed, currentIndex, allExercises.length]);

  // In-exercise voice announcements
  useEffect(() => {
    if (isResting || isPreparing || completed) return;
    if (timerSec === 15) VoiceCoachService.announceHalfway();
    if (timerSec === 10) VoiceCoachService.announceFinalCountdown(10);
    if (timerSec === 5) VoiceCoachService.announceFinalCountdown(5);
  }, [timerSec, isResting, isPreparing, completed]);

  // Rest countdown voice cue
  useEffect(() => {
    if (!isResting || isPreparing || completed) return;
    if (restSec === 3) VoiceCoachService.announceCountdown(3);
  }, [restSec, isResting, isPreparing, completed]);

  const triggerCompletion = () => {
    setCompleted(true);
    setIsPlaying(false);
    VoiceCoachService.announceWorkoutComplete();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleClaimAndSubmitPerformance = () => {
    // Record performance history for AI adaptation
    WorkoutService.recordWorkoutPerformance({
      workoutId: workout.id,
      completedReps: allExercises.length * 10,
      skippedExercisesCount: 0,
      totalDurationMin: workout.totalMinutes,
      userRating,
      energyLevel,
      sorenessFeedback: soreness,
      completedAt: new Date().toISOString(),
    });

    onFinishWorkout(workout.estimatedCalories, workout.totalMinutes);
  };

  const handleSkipRest = () => {
    if (currentIndex < allExercises.length - 1) {
      selectExercise(currentIndex + 1);
    } else {
      triggerCompletion();
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < allExercises.length - 1) {
      selectExercise(currentIndex + 1);
    } else {
      triggerCompletion();
    }
  };

  const handlePrevExercise = () => {
    if (currentIndex > 0) {
      selectExercise(currentIndex - 1);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / allExercises.length) * 100);

  if (completed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-[#111111] border border-[#c6ff00]/40 rounded-[28px] p-8 max-w-lg w-full text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-[#c6ff00]/20 text-[#c6ff00] border border-[#c6ff00]/40 flex items-center justify-center mx-auto">
            <Award className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white">Workout Complete! 🎉</h2>
            <p className="text-slate-300 text-sm">
              Outstanding effort finishing <span className="text-[#c6ff00] font-bold">{workout.title}</span>.
            </p>
          </div>

          {/* AI Performance Adaptation Feedback Collector */}
          <div className="p-5 rounded-2xl bg-[#08080a] border border-[#222226] text-left space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c6ff00]" />
              <span className="text-xs font-black text-white uppercase tracking-wider">AI Workout Performance Collector</span>
            </div>

            {/* Rating Stars (1 = Too Easy, 3 = Optimal, 5 = Too Hard) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">How hard was this workout?</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { r: 1, label: "Too Easy" },
                  { r: 2, label: "Easy" },
                  { r: 3, label: "Optimal" },
                  { r: 4, label: "Hard" },
                  { r: 5, label: "Too Hard" },
                ].map((item) => (
                  <button
                    key={item.r}
                    onClick={() => setUserRating(item.r as any)}
                    className={`py-2.5 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold flex flex-col items-center gap-1 transition-all border ${
                      userRating === item.r
                        ? "bg-[#c6ff00] text-black border-[#c6ff00] font-extrabold"
                        : "bg-[#141418] text-slate-400 border-[#222226] hover:text-white"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${userRating === item.r ? "fill-black text-black" : ""}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Post-workout energy level:</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Low", "Medium", "High"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setEnergyLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      energyLevel === lvl
                        ? "bg-[#18200a] text-[#c6ff00] border-[#c6ff00]"
                        : "bg-[#141418] text-slate-400 border-[#222226]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#050505] border border-[#222222]">
            <div>
              <div className="text-xs text-slate-400">Calories Burned</div>
              <div className="text-xl font-bold text-[#c6ff00]">~{workout.estimatedCalories} kcal</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">XP Earned</div>
              <div className="text-xl font-bold text-white">+150 XP</div>
            </div>
          </div>

          <button
            onClick={handleClaimAndSubmitPerformance}
            className="w-full py-4 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-extrabold text-base shadow-xl transition-all hover:scale-[1.02]"
          >
            Adapt Next Workout & Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-white">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2.5 sm:p-3 rounded-xl bg-[#111111] border border-[#222222] hover:bg-[#1a1a1a] text-slate-400 hover:text-white transition-colors"
            title="Exit Workout"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">{workout.title}</h2>
            <div className="text-xs sm:text-sm text-slate-400">
              Exercise {currentIndex + 1} of {allExercises.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-3 rounded-xl border transition-colors ${
              voiceEnabled
                ? "bg-[#c6ff00]/20 border-[#c6ff00]/40 text-[#c6ff00]"
                : "bg-[#111111] border-[#222222] text-slate-500"
            }`}
            title="Toggle Voice Coach"
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
        <div
          className="h-full bg-[#c6ff00] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Get Ready Screen / Rest Overlay / Active Exercise */}
      {isPreparing ? (
        <div className="p-5 sm:p-8 bg-[#111111] border border-[#c6ff00]/40 rounded-[24px] space-y-6 shadow-2xl animate-fade-in">
          <div className="text-center space-y-1.5">
            <div className="text-[10px] sm:text-xs font-semibold uppercase text-[#c6ff00] tracking-widest">
              Get Ready
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Up Next: <span className="text-[#c6ff00]">{allExercises[0]?.name}</span>
            </h2>
          </div>

          <div className="w-full max-w-xl mx-auto">
            <Exercise3DVisualizer
              animationType={allExercises[0]?.animationType}
              exerciseName={allExercises[0]?.name}
              targetMuscles={allExercises[0]?.targetMuscles}
              isPlaying={true}
              className="w-full h-60 sm:h-72 lg:h-80"
            />
          </div>

          <div className="text-center space-y-1">
            <div className="text-7xl sm:text-8xl font-black text-white font-mono">{prepareSec}</div>
            <div className="text-xs sm:text-sm text-slate-400">
              Study the form, then follow along when the timer hits zero.
            </div>
          </div>
        </div>
      ) : isResting ? (
        <div className="p-6 sm:p-10 bg-[#111111] border border-[#c6ff00]/40 rounded-[24px] text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="text-xs sm:text-sm font-semibold uppercase text-[#c6ff00] tracking-widest">
            Rest Interval
          </div>

          <div className="text-6xl sm:text-8xl font-black text-white font-mono">{restSec}s</div>

          <p className="text-slate-300 text-xs sm:text-sm">
            Up Next: <span className="text-[#c6ff00] font-bold">{allExercises[currentIndex + 1]?.name || "Final Stretch"}</span>
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setRestSec((prev) => prev + 10)}
              className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] text-slate-200 text-xs sm:text-sm font-bold border border-[#222222]"
            >
              +10s Rest
            </button>
            <button
              onClick={handleSkipRest}
              className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-xs sm:text-sm flex items-center gap-2"
            >
              <span>Skip Rest</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Workout Plan Exercise Selector */}
          <div className="bg-[#111111] border border-[#222222] p-4 rounded-[20px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#c6ff00]" />
                <span>Workout Plan Exercises — Select to View Motion Demonstration:</span>
              </span>
              <span className="text-xs font-mono text-[#c6ff00] font-bold">
                {currentIndex + 1} / {allExercises.length}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {allExercises.map((ex, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => selectExercise(idx)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-[#c6ff00] text-black shadow-lg shadow-[#c6ff00]/25 border border-[#c6ff00]"
                        : "bg-[#18181c] text-slate-300 hover:bg-[#222226] hover:text-white border border-[#2a2a30]"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center ${
                      isActive ? "bg-black text-[#c6ff00]" : "bg-[#25252b] text-slate-400"
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{ex.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Exercise 3D Omni Visualizer */}
            <div className="lg:col-span-7">
              <Exercise3DVisualizer
                animationType={currentExercise.animationType}
                exerciseName={currentExercise.name}
                targetMuscles={currentExercise.targetMuscles}
                isPlaying={isPlaying}
                className="w-full h-80 sm:h-[440px] lg:h-[500px]"
              />
            </div>

          {/* Right Exercise Player Controls & Timer */}
          <div className="lg:col-span-5 space-y-6 bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px]">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold uppercase border border-[#c6ff00]/20">
                {currentExercise.targetMuscles}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2">{currentExercise.name}</h3>
            </div>

            {/* Timer or Rep Count Display */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#050505] border border-[#222222] text-center space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                {currentExercise.reps ? "Target Repetitions" : "Timer Remaining"}
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#c6ff00] font-mono">
                {currentExercise.reps ? `${currentExercise.reps} REPS` : `${timerSec}s`}
              </div>
            </div>

            {/* Form Cue Box */}
            <div className="p-3.5 rounded-2xl bg-[#c6ff00]/10 border border-[#c6ff00]/20 text-[#c6ff00] text-xs sm:text-sm">
              <strong>Coach Cue:</strong> "{currentExercise.formCues}"
            </div>

            {/* Safety Tip Box */}
            {currentExercise.safetyTips && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{currentExercise.safetyTips}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 gap-2">
              <button
                onClick={handlePrevExercise}
                disabled={currentIndex === 0}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#1a1a1a] border border-[#222222] hover:bg-[#222222] disabled:opacity-30 text-slate-200"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 px-8 py-4 sm:py-5 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-base sm:text-lg shadow-lg shadow-[#c6ff00]/20 flex items-center justify-center gap-2"
              >
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-black" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black text-black" />}
                <span>{isPlaying ? "Pause" : "Resume"}</span>
              </button>

              <button
                onClick={handleNextExercise}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#1a1a1a] border border-[#222222] hover:bg-[#222222] text-slate-200"
                title="Next exercise"
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
