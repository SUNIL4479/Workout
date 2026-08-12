import { Badge } from "../types";

export const INITIAL_BADGES: Badge[] = [
  {
    id: "first_sweat",
    name: "First Sweat",
    description: "Complete your very first AI-guided workout session.",
    iconName: "Flame",
    unlocked: true,
    unlockedAt: "Day 1",
    progressPercent: 100,
  },
  {
    id: "hydration_hero",
    name: "Hydration Hero",
    description: "Reach 100% of your daily water intake goal.",
    iconName: "Droplets",
    unlocked: false,
    progressPercent: 65,
  },
  {
    id: "streak_warrior",
    name: "7-Day Warrior",
    description: "Maintain a 7-day uninterrupted workout streak.",
    iconName: "Zap",
    unlocked: false,
    progressPercent: 28,
  },
  {
    id: "century_club",
    name: "500 Calorie Crusher",
    description: "Burn 500 total calories through AI home workouts.",
    iconName: "Trophy",
    unlocked: false,
    progressPercent: 45,
  },
  {
    id: "nutrition_master",
    name: "Macro Mastermind",
    description: "Follow your AI meal plan for 3 consecutive days.",
    iconName: "Apple",
    unlocked: false,
    progressPercent: 33,
  },
];
