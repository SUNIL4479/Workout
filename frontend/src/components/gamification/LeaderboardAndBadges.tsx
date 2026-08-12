import React from "react";
import { UserProfile, Badge } from "../../types";
import { apiFetch } from "../../services/api";
import {
  Award,
  Flame,
  Zap,
  Trophy,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Dumbbell,
  Droplet,
  Medal,
  Scale,
  TrendingUp,
  Activity,
  Target,
  Crown,
} from "lucide-react";

const ICONS: Record<string, any> = {
  Award,
  Flame,
  Zap,
  Trophy,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Dumbbell,
  Droplet,
  Medal,
  Scale,
  TrendingUp,
  Activity,
  Target,
  Crown,
};

const GROUP_LABELS: { prefix: string; label: string }[] = [
  { prefix: "streak", label: "Streak" },
  { prefix: "transform", label: "Transformation" },
  { prefix: "workout", label: "Consistency" },
  { prefix: "calories", label: "Calorie Burn" },
  { prefix: "hydration", label: "Hydration" },
  { prefix: "xp", label: "XP" },
  { prefix: "level", label: "Level" },
];

const badgeGroup = (id: string) =>
  GROUP_LABELS.find((g) => id.startsWith(g.prefix))?.label || "Achievement";

interface LeaderboardAndBadgesProps {
  user: UserProfile;
  badges: Badge[];
}

export const LeaderboardAndBadges: React.FC<LeaderboardAndBadgesProps> = ({ user, badges }) => {
  const [leaderboardData, setLeaderboardData] = React.useState<any[]>([]);

  React.useEffect(() => {
    apiFetch("leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaderboardData(data.leaderboard);
        }
      })
      .catch((err) => console.error("Failed to fetch leaderboard", err));
  }, []);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const progress = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Gamification & Achievements</h1>
        <p className="text-slate-300 text-xs sm:text-sm">Level up, unlock trophies, and compete on the FitiFy Leaderboard.</p>
      </div>

      {/* Level Banner */}
      <div className="p-6 rounded-[24px] bg-[#0a0a0a] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#c6ff00]/10 text-[#c6ff00] text-xs font-bold uppercase border border-[#c6ff00]/30">
              Level {user.level} Iron Athlete
            </span>
            <span className="text-xs text-slate-400">{user.xp} Total XP</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-white">Keep the Streak Alive!</h2>
          <p className="text-xs sm:text-sm text-slate-400">Complete 1 workout daily to double your XP earnings.</p>
        </div>

        <div className="flex items-center gap-4 bg-[#111111] p-4 rounded-2xl border border-[#222222] shrink-0">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{user.streakDays} Days</div>
            <div className="text-xs text-slate-400">Active Fire Streak</div>
          </div>
        </div>
      </div>

      {/* Badges & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Badges Collection */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#c6ff00]" />
              <span>Achievement Trophies ({unlockedCount}/{badges.length})</span>
            </h3>
            <span className="text-xs font-bold text-[#c6ff00]">{progress}% Complete</span>
          </div>

          {/* Overall progress bar */}
          <div className="w-full h-2.5 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
            <div className="h-full bg-[#c6ff00] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const Icon = ICONS[badge.iconName] || Trophy;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    badge.unlocked
                      ? "bg-[#111111] border-[#c6ff00]/40 shadow-lg shadow-[#c6ff00]/10"
                      : "bg-[#050505] border-[#222222]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        badge.unlocked ? "bg-[#c6ff00]/20 text-[#c6ff00]" : "bg-[#1a1a1a] text-slate-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-black text-[#666666]">
                          {badgeGroup(badge.id)}
                        </span>
                        {badge.unlocked && <CheckCircle2 className="w-4 h-4 text-[#c6ff00] shrink-0" />}
                      </div>
                      <div className="text-sm font-bold text-white">
                        <span>{badge.name}</span>
                      </div>
                      <div className="text-xs text-slate-400">{badge.description}</div>

                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className={badge.unlocked ? "text-[#c6ff00] font-bold" : "text-slate-500"}>
                            {badge.unlocked ? "Unlocked" : "In progress"}
                          </span>
                          <span className="text-slate-400 font-mono">{Math.min(100, badge.progressPercent)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              badge.unlocked ? "bg-[#c6ff00]" : "bg-[#444444]"
                            }`}
                            style={{ width: `${Math.min(100, badge.progressPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Leaderboard */}
        <div className="lg:col-span-5 bg-[#111111] border border-[#222222] rounded-[24px] p-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c6ff00]" />
            <span>Weekly AI Leaderboard</span>
          </h3>

          <div className="space-y-2.5">
            {leaderboardData.map((item, index) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  item.id === user.id
                    ? "bg-[#c6ff00]/10 border-[#c6ff00]/40 font-bold text-white"
                    : "bg-[#050505] border-[#222222] text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center ${
                      index === 0
                        ? "bg-[#c6ff00] text-black"
                        : index === 1
                        ? "bg-slate-300 text-black"
                        : "bg-[#1a1a1a] text-slate-400 border border-[#222222]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold">{item.name} {item.id === user.id ? "(You)" : ""}</div>
                    <div className="text-[11px] text-slate-400">{item.streakDays} Day Streak 🔥</div>
                  </div>
                </div>

                <div className="text-sm font-mono font-bold text-[#c6ff00]">{item.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
