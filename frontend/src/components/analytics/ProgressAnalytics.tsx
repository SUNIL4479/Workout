import React, { useState } from "react";
import { UserProfile } from "../../types";
import { Scale, TrendingUp, TrendingDown, Dumbbell, Sparkles } from "lucide-react";

interface ProgressAnalyticsProps {
  user: UserProfile;
  saveProfile: (profile: UserProfile) => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ user, saveProfile }) => {
  const [chestCm, setChestCm] = useState<number>(user.bodyMeasurements?.chestCm || 92);
  const [waistCm, setWaistCm] = useState<number>(user.bodyMeasurements?.waistCm || 78);
  const [hipCm, setHipCm] = useState<number>(user.bodyMeasurements?.hipCm || 95);
  const [bicepCm, setBicepCm] = useState<number>(user.bodyMeasurements?.bicepCm || 32);

  // Weight history is seeded at signup and grows every time the user logs a weigh-in.
  const fallbackDate = user.joinedDate || new Date().toISOString().split("T")[0];
  const weightHistory =
    user.weightLogs && user.weightLogs.length > 0
      ? user.weightLogs
      : [{ date: fallbackDate, weightKg: user.weightKg }];

  const startWeight = weightHistory[0].weightKg;
  const currentWeight = weightHistory[weightHistory.length - 1].weightKg;
  const totalChange = Math.round((currentWeight - startWeight) * 100) / 100;
  const bmi = user.bmi || parseFloat((currentWeight / Math.pow(user.heightCm / 100, 2)).toFixed(1));

  // Absolute weight range so every bar + the current-weight reference line share one scale.
  const minW = Math.floor(Math.min(...weightHistory.map((w) => w.weightKg)) - 1);
  const maxW = Math.ceil(Math.max(...weightHistory.map((w) => w.weightKg)) + 1);
  const rangeW = Math.max(1, maxW - minW);
  const currentPct = ((currentWeight - minW) / rangeW) * 100;

  const workoutCount = user.workoutLogs ? user.workoutLogs.length : 0;
  const workoutMins = user.workoutLogs ? user.workoutLogs.reduce((acc, log) => acc + log.minutes, 0) : 0;

  const lossGoal = user.goal === "weight_loss";
  const gainGoal = user.goal === "muscle_gain";
  const onTrack = totalChange === 0 ? null : (totalChange < 0 && lossGoal) || (totalChange > 0 && gainGoal);

  const handleUpdateMeasurements = (type: string, value: number) => {
    if (type === "chest") setChestCm(value);
    if (type === "waist") setWaistCm(value);
    if (type === "hip") setHipCm(value);
    if (type === "bicep") setBicepCm(value);

    const updatedUser = {
      ...user,
      bodyMeasurements: {
        ...user.bodyMeasurements,
        [type + "Cm"]: value,
      },
    };
    saveProfile(updatedUser);
  };

  const changeLabel = `${totalChange > 0 ? "+" : ""}${totalChange} kg`;
  const changeColor = onTrack === true ? "text-[#c6ff00]" : onTrack === false ? "text-red-400" : "text-slate-300";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Progress Analytics & Measurements</h1>
        <p className="text-slate-300 text-xs sm:text-sm">
          Real progress since your signup on {new Date(fallbackDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}.
        </p>
      </div>

      {/* Live Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-[#111111] border border-[#222222] rounded-[24px] p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Starting Weight</span>
            <Scale className="w-4 h-4 text-[#666666]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#c6ff00]">{startWeight} kg</div>
          <div className="text-[10px] sm:text-xs text-slate-400">Logged at signup</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-[24px] p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Current Weight</span>
            <Scale className="w-4 h-4 text-[#c6ff00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{currentWeight} kg</div>
          <div className="text-[10px] sm:text-xs text-slate-400">BMI {bmi} · {user.bmiCategory || "Normal"}</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-[24px] p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Total Change</span>
            {totalChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#c6ff00]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${changeColor}`}>{changeLabel}</div>
          <div className="text-[10px] sm:text-xs text-slate-400">
            Target {user.targetWeightKg ? `${user.targetWeightKg} kg` : "—"}
            {onTrack !== null && (
              <span className={onTrack ? " text-[#c6ff00]" : " text-red-400"}>
                {" "}· {onTrack ? "On track" : "Off track"}
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-[24px] p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-[#666666] font-semibold uppercase tracking-wider">Workouts Completed</span>
            <Dumbbell className="w-4 h-4 text-[#c6ff00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{workoutCount} Sessions</div>
          <div className="text-[10px] sm:text-xs text-slate-400">
            {workoutMins} min logged · Fitness Score {user.initialFitnessScore || "—"}
            <span className="flex items-center gap-1 text-[#c6ff00]">
              <Sparkles className="w-3 h-3" /> Level {user.level} · {user.xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Daily Weight Gain Chart & Body Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Weight Change Bar Chart */}
        <div className="lg:col-span-7 bg-[#111111] border border-[#222222] rounded-[24px] p-5 sm:p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#c6ff00]" />
            <span>Weight Progress vs Current</span>
          </h3>
          <p className="text-xs text-slate-400 -mt-2">
            Every bar is a recorded weigh-in. The dashed line is your current weight ({currentWeight} kg) — bars above
            it are heavier than today, bars below are lighter. Updated daily as you log your weight.
          </p>

          <div className="p-4 rounded-2xl bg-[#050505] border border-[#222222]">
            <div className="flex flex-col h-48 sm:h-52">
              {/* Weight labels */}
              <div className="h-5 flex items-end justify-between gap-2 sm:gap-3 px-2">
                {weightHistory.map((item, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] sm:text-xs font-bold text-slate-200 whitespace-nowrap">
                    {item.weightKg} kg
                  </span>
                ))}
              </div>

              {/* Bars + current-weight reference line */}
              <div className="relative flex-1 flex items-end justify-between gap-2 sm:gap-3 px-2">
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-[#c6ff00]/70 z-10"
                  style={{ bottom: `${currentPct}%` }}
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#c6ff00] bg-[#050505] px-1.5 py-px rounded border border-[#c6ff00]/30 whitespace-nowrap">
                    Current {currentWeight} kg
                  </span>
                </div>

                {weightHistory.map((item, i) => {
                  const hPct = ((item.weightKg - minW) / rangeW) * 100;
                  const above = item.weightKg > currentWeight;
                  const below = item.weightKg < currentWeight;
                  const good = lossGoal ? below : gainGoal ? above : true;
                  const color = !above && !below ? "bg-[#c6ff00]" : good ? "bg-[#c6ff00]/90" : "bg-red-500/80";
                  return (
                    <div key={i} className="flex-1 h-full flex items-end justify-center">
                      <div
                        className={`w-full max-w-6 rounded-t-md transition-all duration-500 ${color}`}
                        style={{ height: `${hPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Date labels */}
              <div className="h-5 flex items-start justify-between gap-2 sm:gap-3 px-2">
                {weightHistory.map((item, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] sm:text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#c6ff00]" /> On track vs. current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500/80" /> Off track vs. current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#c6ff00]/70 border-t-2 border-dashed border-[#c6ff00]" /> Current weight
            </span>
          </div>
        </div>

        {/* Body Measurements Log */}
        <div className="lg:col-span-5 bg-[#111111] border border-[#222222] rounded-[24px] p-5 sm:p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white">Body Circumference Logs</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Chest</span>
                <span className="text-[#c6ff00] font-bold">{chestCm} cm</span>
              </label>
              <input
                type="range"
                min="70"
                max="140"
                value={chestCm}
                onChange={(e) => handleUpdateMeasurements("chest", Number(e.target.value))}
                className="w-full accent-[#c6ff00] h-2 bg-[#1a1a1a] rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Waist</span>
                <span className="text-[#c6ff00] font-bold">{waistCm} cm</span>
              </label>
              <input
                type="range"
                min="50"
                max="130"
                value={waistCm}
                onChange={(e) => handleUpdateMeasurements("waist", Number(e.target.value))}
                className="w-full accent-[#c6ff00] h-2 bg-[#1a1a1a] rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Hips</span>
                <span className="text-[#c6ff00] font-bold">{hipCm} cm</span>
              </label>
              <input
                type="range"
                min="60"
                max="140"
                value={hipCm}
                onChange={(e) => handleUpdateMeasurements("hip", Number(e.target.value))}
                className="w-full accent-[#c6ff00] h-2 bg-[#1a1a1a] rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Biceps</span>
                <span className="text-[#c6ff00] font-bold">{bicepCm} cm</span>
              </label>
              <input
                type="range"
                min="20"
                max="55"
                value={bicepCm}
                onChange={(e) => handleUpdateMeasurements("bicep", Number(e.target.value))}
                className="w-full accent-[#c6ff00] h-2 bg-[#1a1a1a] rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
