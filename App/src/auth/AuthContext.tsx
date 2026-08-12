import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserProfile, WorkoutLog } from "../types";
import { apiFetch, clearToken, setToken } from "../api";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<UserProfile>;
  finishWorkout: (caloriesBurned: number, minutesSpent: number, workoutTitle: string, exercisesCompleted: number) => Promise<UserProfile>;
  updateWater: (amountMl: number) => Promise<UserProfile>;
  updateWeight: (newWeightKg: number) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const todayKey = () => new Date().toISOString().split("T")[0];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const res = await apiFetch<{ profile: UserProfile }>("auth/me");
    setUser(res.profile);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await import("../api").then((m) => m.getToken());
        if (!token) {
          if (!cancelled) setUser(null);
          return;
        }
        await refreshProfile();
      } catch {
        // Session expired or invalid — clear it.
        await clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ profile: UserProfile; sessionToken: string }>("auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.sessionToken) await setToken(res.sessionToken);
    setUser(res.profile);
    return res.profile;
  }, []);

  const signUp = useCallback(async (email: string, password: string, profile: Partial<UserProfile>) => {
    const res = await apiFetch<{ profile: UserProfile; sessionToken: string }>("auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, profile }),
    });
    if (res.sessionToken) await setToken(res.sessionToken);
    setUser(res.profile);
    return res.profile;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiFetch("auth/signout", { method: "POST" });
    } catch {
      // ignore
    }
    await clearToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      const next = { ...user, ...patch } as UserProfile;
      setUser(next);
      try {
        const res = await apiFetch<{ profile: UserProfile }>("auth/profile", {
          method: "PUT",
          body: JSON.stringify({ profile: next }),
        });
        setUser(res.profile);
        return res.profile;
      } catch (err) {
        setUser(user);
        throw err;
      }
    },
    [user]
  );

  const finishWorkout = useCallback(
    async (caloriesBurned: number, minutesSpent: number, workoutTitle: string, exercisesCompleted: number) => {
      if (!user) throw new Error("Not signed in");
      const log: WorkoutLog = {
        id: `workout_${Date.now()}`,
        date: todayKey(),
        workoutTitle,
        minutes: minutesSpent,
        caloriesBurned,
        exercisesCompleted,
        intensity: user.recommendedIntensity || "Moderate",
      };
      const newXp = user.xp + 150;
      return updateProfile({
        xp: newXp,
        level: Math.floor(newXp / 200) + 1,
        lastWorkoutDate: todayKey(),
        workoutLogs: [...(user.workoutLogs || []), log],
      });
    },
    [user, updateProfile]
  );

  const updateWater = useCallback(
    async (amountMl: number) => updateProfile({ waterIntakeMl: (user?.waterIntakeMl || 0) + amountMl }),
    [user, updateProfile]
  );

  const updateWeight = useCallback(
    async (newWeightKg: number) => {
      if (!user) throw new Error("Not signed in");
      const heightM = user.heightCm / 100;
      const newBmi = parseFloat((newWeightKg / (heightM * heightM)).toFixed(1));
      const existing = user.weightLogs || [];
      const weightLogs = existing.some((l) => l.date === todayKey())
        ? existing.map((l) => (l.date === todayKey() ? { ...l, weightKg: newWeightKg } : l))
        : [...existing, { date: todayKey(), weightKg: newWeightKg }];
      return updateProfile({ weightKg: newWeightKg, bmi: newBmi, weightLogs });
    },
    [user, updateProfile]
  );

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, updateProfile, finishWorkout, updateWater, updateWeight, refreshProfile }),
    [user, loading, signIn, signUp, signOut, updateProfile, finishWorkout, updateWater, updateWeight, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
