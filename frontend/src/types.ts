export type FitnessGoal =
  | "weight_loss"
  | "muscle_gain"
  | "tone_sculpt"
  | "endurance"
  | "general_fitness";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type DietaryPreference =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "high_protein";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: "Male" | "Female" | "Non-Binary";
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  durationMin: number;
  diet: DietaryPreference;
  medicalLimitations?: string;
  bmi?: number;
  bmiCategory?: string;
  bodyType?: "Lean" | "Fatty / Overweight" | "Medium Sized / Athletic" | string;
  targetBodyType?: "Ripped Shredded Abs" | "Athletic Muscular Mass" | "Slim & Lean Toned" | "Flat Belly & Fat Burn" | string;
  transformationMonths?: number;
  targetWeightKg?: number;
  dailyTodoTasks?: {
    id: string;
    title: string;
    timeMin: number;
    category: string;
    targetMuscle: string;
    completed: boolean;
  }[];
  calorieTarget?: number;
  waterGoalLiters?: number;
  recommendedIntensity?: string;
  initialFitnessScore?: number;
  xp: number;
  level: number;
  streakDays: number;
  lastWorkoutDate?: string;
  waterIntakeMl: number;
  joinedDate: string;
  workoutLogs?: WorkoutLog[];
  weightLogs?: WeightLog[];
  bodyMeasurements?: {
    chestCm?: number;
    waistCm?: number;
    hipCm?: number;
    bicepCm?: number;
  };
}

export type AnimationType =
  | "pushup"
  | "squat"
  | "plank"
  | "lunge"
  | "jumping_jacks"
  | "mountain_climbers"
  | "burpees"
  | "burpee"
  | "crunch"
  | "stretching";

export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string;
  durationSec?: number;
  reps?: number;
  sets?: number;
  restSec: number;
  calories: number;
  instructions: string;
  safetyTips: string;
  formCues: string;
  animationType: AnimationType;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  category: "Fat Burn" | "Muscle Sculpt" | "Core & ABS" | "Flexibility" | "Full Body" | "Strength";
  totalMinutes: number;
  estimatedCalories: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  safetyAdvice: string;
  warmUp: Exercise[];
  mainRoutine: Exercise[];
  coolDown: Exercise[];
}

export interface Meal {
  name: string;
  calories: number;
  protein: string;
  description: string;
  ingredients: string[];
}

export interface MealPlan {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  waterLiters: number;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
  coachTip: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutTitle: string;
  minutes: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  intensity: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export interface WeightLog {
  date: string;
  weightKg: number;
  bodyFatPercent?: number;
}
