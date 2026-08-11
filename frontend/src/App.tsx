import React, { useMemo, useState } from "react";
import { UserProfile, WorkoutPlan, Badge, WorkoutLog } from "./types";
import { WorkoutService } from "./services/workoutService";
import { computeBadges } from "./services/badgeService";
import { apiFetch } from "./services/api";

// Components
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./components/landing/LandingPage";
import { OnboardingModal } from "./components/auth/OnboardingModal";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { AIWorkoutBuilder } from "./components/workout/AIWorkoutBuilder";
import { ActiveWorkoutPlayer } from "./components/workout/ActiveWorkoutPlayer";
import { NutritionPlanner } from "./components/nutrition/NutritionPlanner";
import { FloatingChatWidget } from "./components/coach/FloatingChatWidget";
import { ProgressAnalytics } from "./components/analytics/ProgressAnalytics";
import { LeaderboardAndBadges } from "./components/gamification/LeaderboardAndBadges";
import { ScrollBackgroundAnimation } from "./components/ScrollBackgroundAnimation";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Badges are derived live from profile data (streaks, workouts, calories, weight progress).
  const badges: Badge[] = useMemo(() => (user ? computeBadges(user) : []), [user]);

  React.useEffect(() => {
    // Check auth session on mount
    apiFetch("auth/me")
      .then(async (res) => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`Auth check failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setUser(data.profile);
          setActiveTab("dashboard");
        }
      })
      .catch((err) => console.error("Auth check failed:", err))
      .finally(() => setIsLoadingAuth(false));
  }, []);

  const saveProfile = async (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    try {
      await apiFetch("auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: updatedProfile }),
      });
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  // Handlers
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setUser(newProfile);
    setShowOnboarding(false);
    setActiveTab("dashboard");
  };

  const handleLaunchWorkout = (workout: WorkoutPlan) => {
    setActiveWorkout(workout);
    setIsChatOpen(false);
  };

  const handleFinishWorkout = (caloriesBurned: number, minutesSpent: number) => {
    setActiveWorkout(null);
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const workoutLog: WorkoutLog = {
      id: `workout_${Date.now()}`,
      date: today,
      workoutTitle: activeWorkout?.title || "AI Guided Workout",
      minutes: minutesSpent,
      caloriesBurned,
      exercisesCompleted: activeWorkout ? activeWorkout.mainRoutine.length : 0,
      intensity: user.recommendedIntensity || "Moderate",
    };
    const updated = {
      ...user,
      xp: user.xp + 150,
      workoutLogs: [...(user.workoutLogs || []), workoutLog],
    };
    saveProfile(updated);
    setActiveTab("dashboard");
  };

  const handleUpdateWater = (amountMl: number) => {
    if (!user) return;
    const updated = {
      ...user,
      waterIntakeMl: user.waterIntakeMl + amountMl,
    };
    saveProfile(updated);
  };

  const handleUpdateWeight = (newWeightKg: number) => {
    if (!user) return;
    const heightM = user.heightCm / 100;
    const newBmi = parseFloat((newWeightKg / (heightM * heightM)).toFixed(1));
    const today = new Date().toISOString().split("T")[0];
    const existingLogs = user.weightLogs || [];
    const weightLogs = existingLogs.some((l) => l.date === today)
      ? existingLogs.map((l) => (l.date === today ? { ...l, weightKg: newWeightKg } : l))
      : [...existingLogs, { date: today, weightKg: newWeightKg }];
    const updated = {
      ...user,
      weightKg: newWeightKg,
      bmi: newBmi,
      weightLogs,
    };
    saveProfile(updated);
  };

  const recommendedWorkout = useMemo(
    () => (user ? WorkoutService.generatePersonalizedWorkout(user) : null),
    [user]
  );

  const showLanding = !user || activeTab === "landing";

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#050505]/70 flex items-center justify-center text-[#c6ff00] text-sm sm:text-base">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen text-slate-100 font-sans flex flex-col justify-between selection:bg-[#c6ff00] selection:text-black ${
        showLanding ? "bg-[#050505]/60" : "bg-black"
      }`}
    >
      {showLanding && <ScrollBackgroundAnimation />}
      <div className="relative z-10 flex flex-col flex-1 justify-between">
        <div>
          <Navbar
            user={user}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveWorkout(null);
              setActiveTab(tab);
            }}
            onOpenOnboarding={() => setShowOnboarding(true)}
          />

          <main className="pb-16">
            {/* Active Workout Player Mode */}
            {activeWorkout ? (
              <ActiveWorkoutPlayer
                workout={activeWorkout}
                onFinishWorkout={handleFinishWorkout}
                onExit={() => setActiveWorkout(null)}
              />
            ) : !user || activeTab === "landing" ? (
              <LandingPage
                onStartOnboarding={() => setShowOnboarding(true)}
                onExploreWorkouts={() => setShowOnboarding(true)}
              />
            ) : (
              <>
                {activeTab === "dashboard" && (
                  <DashboardOverview
                    user={user}
                    recommendedWorkout={recommendedWorkout!}
                    badges={badges}
                    onStartWorkout={handleLaunchWorkout}
                    onOpenChat={() => setIsChatOpen(true)}
                    onUpdateWater={handleUpdateWater}
                    onUpdateWeight={handleUpdateWeight}
                  />
                )}

                {activeTab === "workout_studio" && (
                  <AIWorkoutBuilder
                    user={user}
                    onLaunchWorkout={handleLaunchWorkout}
                  />
                )}

                {activeTab === "nutrition" && <NutritionPlanner user={user} />}

                {activeTab === "analytics" && <ProgressAnalytics user={user} saveProfile={saveProfile} />}

                {activeTab === "badges" && (
                  <LeaderboardAndBadges user={user} badges={badges} />
                )}
              </>
            )}
          </main>
        </div>

        <Footer />
      </div>

      {/* Floating AI Coach Chat Widget */}
      {!activeWorkout && (
        <FloatingChatWidget
          user={user}
          open={isChatOpen}
          onToggle={() => setIsChatOpen((prev) => !prev)}
        />
      )}

      {/* Onboarding / Profile Setup Modal */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};
