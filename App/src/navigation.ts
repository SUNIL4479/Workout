import { WorkoutPlan } from "./types";

export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  Onboarding: undefined;
  Main: undefined;
  Player: { plan: WorkoutPlan };
  Chat: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Studio: undefined;
  Nutrition: undefined;
  Analytics: undefined;
  Badges: undefined;
  Profile: undefined;
};
