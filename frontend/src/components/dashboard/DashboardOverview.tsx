import React, { useState } from "react";
import { UserProfile, WorkoutPlan, Badge } from "../../types";
import {
  Flame,
  Zap,
  Droplets,
  Award,
  Play,
  Plus,
  Scale,
  Sparkles,
  Dumbbell,
  Bot,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

interface DashboardOverviewProps {
  user: UserProfile;
  recommendedWorkout: WorkoutPlan;
  badges: Badge[];
  onStartWorkout: (workout: WorkoutPlan) => void;
  onOpenChat: () => void;
  onUpdateWater: (amountMl: number) => void;
  onUpdateWeight: (newWeightKg: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  recommendedWorkout,
  badges,
  onStartWorkout,
  onOpenChat,
  onUpdateWater,
  onUpdateWeight,
}) => {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(user.weightKg);

  // Daily AI To-Do List State
  const [todoTasks, setTodoTasks] = useState(
    user.dailyTodoTasks || []
  );

  const toggleTask = (taskId: string) => {
    setTodoTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = todoTasks.filter((t) => t.completed).length;

  const waterPercent = Math.min(
    100,
    Math.round((user.waterIntakeMl / ((user.waterGoalLiters || 3) * 1000)) * 100)
  );

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeight(Number(newWeight));
    setShowWeightModal(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      {/* Welcome Banner */}
      <div className="relative rounded-[24px] bg-[#0a0a0a] border border-[#222222] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c6ff00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold uppercase tracking-wider border border-[#c6ff00]/30">
                Level {user.level} Athlete
              </span>
              <span className="text-xs text-slate-400">XP: {user.xp} / 500</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Welcome back, <span className="text-[#c6ff00]">{user.name}</span>!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Your AI coach has optimized today's <span className="text-[#c6ff00] font-semibold">{recommendedWorkout.title}</span> session. Zero equipment required.
            </p>
          </div>

          {/* Quick Start Main CTA */}
          <button
            onClick={() => onStartWorkout(recommendedWorkout)}
            className="px-8 py-4 rounded-2xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-base shadow-xl shadow-[#c6ff00]/20 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 shrink-0"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Start Today's Workout</span>
          </button>
        </div>
      </div>

      {/* Top 4 Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Streak */}
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px] flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-[#666666] uppercase tracking-wider">Workout Streak</div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1 flex items-baseline gap-1.5">
              <span>{user.streakDays || 1}</span>
              <span className="text-xs font-normal text-[#666666]">Days Active</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
        </div>

        {/* Calories Burned */}
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px] flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-[#666666] uppercase tracking-wider">Est. Calories Burned</div>
            <div className="text-2xl sm:text-3xl font-bold text-[#c6ff00] mt-1 flex items-baseline gap-1.5">
              <span>{recommendedWorkout.estimatedCalories || 380}</span>
              <span className="text-xs font-normal text-[#666666]">kcal today</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#c6ff00]/10 border border-[#c6ff00]/30 flex items-center justify-center text-[#c6ff00]">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Water Intake */}
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px] flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-[#666666] uppercase tracking-wider">Water Hydration</div>
            <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-1 flex items-baseline gap-1.5">
              <span>{(user.waterIntakeMl / 1000).toFixed(1)}</span>
              <span className="text-xs font-normal text-[#666666]">/ {user.waterGoalLiters || 3.0} L</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Weight Tracker */}
        <div className="bg-[#111111] border border-[#222222] p-5 sm:p-6 rounded-[24px] flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold text-[#666666] uppercase tracking-wider">Current Weight</div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-400 mt-1 flex items-baseline gap-1.5">
              <span>{user.weightKg}</span>
              <span className="text-xs font-normal text-[#666666]">kg</span>
            </div>
          </div>
          <button
            onClick={() => setShowWeightModal(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 flex items-center justify-center text-purple-400 transition-colors"
            title="Log new weight"
          >
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Target Transformation Progress Card */}
      {user.targetBodyType && (
        <div className="p-6 rounded-[24px] bg-[#0a0a0a] border border-[#c6ff00]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-extrabold uppercase border border-[#c6ff00]/30">
                {user.transformationMonths || 5}-Month Transformation Target
              </span>
              <span className="text-xs text-slate-400 font-mono">Current: {user.bodyType || "Athletic"}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Target Goal: <span className="text-[#c6ff00]">{user.targetBodyType}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Daily home workout schedule maintained to complete your {user.transformationMonths || 5}-month transformation timeline safely without gym equipment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Streak Maintained</div>
              <div className="text-lg font-black text-[#c6ff00]">{user.streakDays || 1} Days Active</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Daily Workout To-Do List Section */}
      <div className="p-6 rounded-[24px] bg-[#111111] border border-[#222222] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222222] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c6ff00]">Today's Transformation Schedule</span>
              <span className="px-2 py-0.5 rounded-md bg-[#c6ff00]/20 text-[#c6ff00] text-[11px] font-bold">
                {completedCount} / {todoTasks.length} Done
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Daily AI Workout To-Do List</h3>
          </div>
          <div className="text-xs text-slate-400">
            Complete daily tasks to maintain your <strong className="text-[#c6ff00]">{user.streakDays || 1}-day streak</strong>!
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {todoTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${task.completed
                  ? "bg-[#c6ff00]/10 border-[#c6ff00] text-white"
                  : "bg-[#0a0a0a] border-[#222222] text-slate-300 hover:border-[#333333]"
                }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${task.completed ? "bg-[#c6ff00] text-black" : "border border-slate-600 bg-[#1a1a1a]"
                  }`}
              >
                {task.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className={`text-xs font-bold ${task.completed ? "line-through text-slate-400" : "text-white"}`}>
                  {task.title}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>⏱️ {task.timeMin} mins</span>
                  <span>• {task.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Scheduled Workout Card & Quick AI Features */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Workout Focus */}
        <div className="lg:col-span-8 bg-[#111111] border border-[#222222] rounded-[24px] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#c6ff00]/10 text-[#c6ff00]">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Today's Workout Program</h3>
                <p className="text-xs text-slate-400">AI Customized for {user.goal.replace("_", " ")}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-xs font-medium text-slate-300 border border-[#222222]">
              {recommendedWorkout.totalMinutes} Mins
            </span>
          </div>

          {/* Workout Card Details */}
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#222222] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-base sm:text-lg font-bold text-white">{recommendedWorkout.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{recommendedWorkout.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-semibold border border-[#c6ff00]/20">
                  {recommendedWorkout.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1a1a1a] text-slate-300 text-xs font-semibold border border-[#222222]">
                  ~{recommendedWorkout.estimatedCalories} kcal
                </span>
              </div>
            </div>

            {/* Exercise List Preview Pills */}
            <div className="space-y-2 pt-2 border-t border-[#222222]">
              <div className="text-xs font-semibold text-[#666666] uppercase tracking-wider">Exercise Plan Overview</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendedWorkout.mainRoutine.map((ex, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">{ex.name}</span>
                    <span className="text-[11px] text-[#c6ff00] font-mono">
                      {ex.reps ? `${ex.reps} reps` : `${ex.durationSec}s`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onStartWorkout(recommendedWorkout)}
                className="px-6 py-2.5 rounded-xl bg-[#c6ff00] hover:bg-[#b0e600] text-black font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Launch Guided Player</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Tools & Hydration Control */}
        <div className="lg:col-span-4 space-y-6">
          {/* Water Intake Controller */}
          <div className="bg-[#111111] border border-[#222222] rounded-[24px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-400" />
                <h4 className="text-base font-bold text-white">Daily Hydration Log</h4>
              </div>
              <span className="text-xs font-bold text-[#c6ff00]">{waterPercent}%</span>
            </div>

            {/* Hydration Progress Bar */}
            <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c6ff00] transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center pt-2 gap-2">
              <button
                onClick={() => onUpdateWater(250)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] border border-[#222222] text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+250 ml</span>
              </button>
              <button
                onClick={() => onUpdateWater(500)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] border border-[#222222] text-[#c6ff00] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+500 ml</span>
              </button>
            </div>
          </div>

          {/* Quick AI Tools Card */}
          <div className="bg-[#111111] border border-[#222222] rounded-[24px] p-6 space-y-3">
            <h4 className="text-base font-bold text-white">AI Studio Quick Tools</h4>

            <button
              onClick={onOpenChat}
              className="w-full p-3.5 rounded-2xl bg-[#1a1a1a] hover:bg-[#222222] border border-[#222222] text-left flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#c6ff00]/10 text-[#c6ff00]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-[#c6ff00]">24/7 AI Trainer Chat</div>
                  <div className="text-xs text-slate-400">Ask questions & modify workouts</div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-[#c6ff00]" />
            </button>
          </div>
        </div>
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Log Current Weight</h3>
            <form onSubmit={handleWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Weight in Kilograms (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full bg-[#050505] border border-[#222222] rounded-xl p-3 text-white font-bold"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1a1a] text-xs text-slate-300 border border-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c6ff00] text-black font-bold text-xs"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
