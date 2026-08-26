import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Chip, Field, ProgressBar, Row, Spacer, Txt } from "../components/ui";
import { apiFetch } from "../api";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";
import {
  UserProfile,
  FitnessGoal,
  ExperienceLevel,
  DietaryPreference,
} from "../types";
import { RootStackParamList } from "../navigation";

const GOALS: FitnessGoal[] = ["weight_loss", "muscle_gain", "tone_sculpt", "endurance", "general_fitness"];
const LEVELS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const DIETS: DietaryPreference[] = ["omnivore", "vegetarian", "vegan", "keto", "high_protein"];
const GENDERS: UserProfile["gender"][] = ["Male", "Female", "Non-Binary"];
const BODY_TYPES = ["Lean", "Fatty / Overweight", "Medium Sized / Athletic"];
const TARGET_BODY_TYPES = ["Ripped Shredded Abs", "Athletic Muscular Mass", "Slim & Lean Toned", "Flat Belly & Fat Burn"];
const DURATIONS = [15, 20, 30, 45];

const calculateSuggestedMonths = (
  bodyType: string,
  targetBodyType: string
): number => {
  if (bodyType === "Fatty / Overweight" && targetBodyType === "Ripped Shredded Abs") return 6;
  if (bodyType === "Fatty / Overweight" && targetBodyType === "Slim & Lean Toned") return 5;
  if (bodyType === "Lean" && targetBodyType === "Athletic Muscular Mass") return 6;
  if (bodyType === "Lean" && targetBodyType === "Ripped Shredded Abs") return 5;
  if (bodyType === "Medium Sized / Athletic" && targetBodyType === "Ripped Shredded Abs") return 4;
  return 5;
};

export default function OnboardingScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Onboarding">) {
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("26");
  const [gender, setGender] = useState<UserProfile["gender"]>("Female");
  const [heightCm, setHeightCm] = useState("168");
  const [weightKg, setWeightKg] = useState("64");
  const [targetWeightKg, setTargetWeightKg] = useState("58");
  const [bodyType, setBodyType] = useState(BODY_TYPES[2]);
  const [targetBodyType, setTargetBodyType] = useState(TARGET_BODY_TYPES[0]);
  const [goal, setGoal] = useState<FitnessGoal>("weight_loss");
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [durationMin, setDurationMin] = useState(30);
  const [diet, setDiet] = useState<DietaryPreference>("omnivore");
  const [medicalLimitations, setMedicalLimitations] = useState("");

  const suggestedMonths = useMemo(
    () => calculateSuggestedMonths(bodyType, targetBodyType),
    [bodyType, targetBodyType]
  );

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!name.trim()) return "Please enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
      if (password.length < 6) return "Password must be at least 6 characters long.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    if (step === 2) {
      if (!Number(heightCm) || !Number(weightKg)) return "Enter valid height and weight.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      Alert.alert("Almost there", err);
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const finish = async () => {
    setLoading(true);
    try {
      const ai = await apiFetch<{ success: boolean; profile: any }>("ai/fitness-profile", {
        method: "POST",
        body: JSON.stringify({
          name: name || "Fitness Athlete",
          age: Number(age),
          gender,
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          goal,
          experience,
          durationMin,
          diet,
          medicalLimitations,
          bodyType,
          targetBodyType,
        }),
      });

      const aiData = ai.profile || {};
      const initialTasks = [
        { id: "task_1", title: `Day 1: ${durationMin}-Min ${targetBodyType} Foundation`, timeMin: durationMin, category: "Full Body", targetMuscle: "Core & Major Muscles", completed: false },
        { id: "task_2", title: "Hydration: Drink 3.0L Water", timeMin: 5, category: "Habit", targetMuscle: "Hydration", completed: false },
        { id: "task_3", title: "Post-Workout Light Stretching", timeMin: 10, category: "Flexibility", targetMuscle: "Full Body Joints", completed: false },
      ];

      const profile: UserProfile = {
        id: "temp_id",
        name: name || "Fitness Athlete",
        email: email.trim().toLowerCase(),
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : Number(weightKg) - 5,
        goal,
        experience,
        durationMin,
        diet,
        medicalLimitations,
        bmi: aiData.bmi || parseFloat((Number(weightKg) / Math.pow(Number(heightCm) / 100, 2)).toFixed(1)),
        bmiCategory: aiData.bmiCategory || "Normal",
        bodyType,
        targetBodyType,
        transformationMonths: suggestedMonths,
        calorieTarget: aiData.dailyCalories || 2000,
        waterGoalLiters: aiData.waterGoalLiters || 3.0,
        recommendedIntensity: aiData.recommendedIntensity || "Moderate",
        initialFitnessScore: aiData.initialFitnessScore || 80,
        xp: 0,
        level: 1,
        streakDays: 0,
        waterIntakeMl: 0,
        joinedDate: new Date().toISOString().split("T")[0],
        weightLogs: [{ date: new Date().toISOString().split("T")[0], weightKg: Number(weightKg) }],
        dailyTodoTasks: initialTasks,
      };

      await signUp(email.trim(), password, profile);
    } catch (err: any) {
      Alert.alert("Sign up failed", err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt size={22} bold>Step {Math.min(step + 1, 6)} of 6</Txt>
          {step > 0 ? (
            <Txt size={13} bold style={{ color: colors.accent }} onPress={() => setStep((s) => s - 1)}>
              Back
            </Txt>
          ) : null}
        </Row>
        <Spacer h={10} />
        <ProgressBar value={((step + 1) / 6) * 100} />

        <ScrollView style={{ flex: 1, marginTop: 20 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          {step === 0 && (
            <View>
              <Txt size={20} bold>Create your account</Txt>
              <Spacer />
              <Field label="Full name" value={name} onChangeText={setName} placeholder="Fitness Athlete" />
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
              <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" secureTextEntry />
            </View>
          )}

          {step === 1 && (
            <View>
              <Txt size={20} bold>About you</Txt>
              <Spacer />
              <Txt dim size={13} bold style={{ textTransform: "uppercase", marginBottom: 8 }}>Gender</Txt>
              <Row style={{ flexWrap: "wrap", gap: 8 }}>
                {GENDERS.map((g) => (
                  <Chip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
                ))}
              </Row>
              <Spacer />
              <Field label="Age" value={age} onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
            </View>
          )}

          {step === 2 && (
            <View>
              <Txt size={20} bold>Your body stats</Txt>
              <Spacer />
              <Field label="Height (cm)" value={heightCm} onChangeText={(v) => setHeightCm(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric" />
              <Field label="Current weight (kg)" value={weightKg} onChangeText={(v) => setWeightKg(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric" />
              <Field label="Target weight (kg)" value={targetWeightKg} onChangeText={(v) => setTargetWeightKg(v.replace(/[^0-9.]/g, ""))} keyboardType="numeric" />
            </View>
          )}

          {step === 3 && (
            <View>
              <Txt size={20} bold>Your body transformation</Txt>
              <Spacer />
              <Txt dim size={13} bold style={{ textTransform: "uppercase", marginBottom: 8 }}>Current body type</Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {BODY_TYPES.map((b) => (
                  <Chip key={b} label={b} selected={bodyType === b} onPress={() => setBodyType(b)} />
                ))}
              </View>
              <Spacer />
              <Txt dim size={13} bold style={{ textTransform: "uppercase", marginBottom: 8 }}>Target body type</Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {TARGET_BODY_TYPES.map((b) => (
                  <Chip key={b} label={b} selected={targetBodyType === b} onPress={() => setTargetBodyType(b)} />
                ))}
              </View>
              <Spacer />
              <Txt dim size={13}>Estimated transformation: <Txt bold style={{ color: colors.accent }}>{suggestedMonths} months</Txt></Txt>
            </View>
          )}

          {step === 4 && (
            <View>
              <Txt size={20} bold>Your training plan</Txt>
              <Spacer />
              <Txt dim size={13} bold style={{ textTransform: "uppercase", marginBottom: 8 }}>Primary goal</Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {GOALS.map((g) => (
                  <Chip key={g} label={g.replace(/_/g, " ")} selected={goal === g} onPress={() => setGoal(g)} />
                ))}
              </View>
              <Spacer />
              <Txt dim size={13} bold style={{ textTransform: "uppercase", marginBottom: 8 }}>Experience</Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {LEVELS.map((l) => (
                  <Chip key={l} label={l} selected={experience === l} onPress={() => setExperience(l)} />
                ))}
              </View>
              <Spacer />
              <Txt dim size={13} bold style={{ textTransform: "uppercase", marginBottom: 8 }}>Minutes per session</Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {DURATIONS.map((d) => (
                  <Chip key={d} label={`${d} min`} selected={durationMin === d} onPress={() => setDurationMin(d)} />
                ))}
              </View>
              <Spacer />
              <Txt dim size={13} bold style={{ textTransform: "uppercase", marginBottom: 8 }}>Diet preference</Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {DIETS.map((d) => (
                  <Chip key={d} label={d.replace(/_/g, " ")} selected={diet === d} onPress={() => setDiet(d)} />
                ))}
              </View>
            </View>
          )}

          {step === 5 && (
            <View>
              <Txt size={20} bold>Health & safety</Txt>
              <Spacer />
              <Field
                label="Medical limitations or injuries (optional)"
                value={medicalLimitations}
                onChangeText={setMedicalLimitations}
                placeholder="e.g. knee pain, lower back issues"
                multiline
              />
              <Txt dim size={13}>
                Your AI coach will automatically exclude or modify exercises that stress
                your limitations. All plans are equipment-free and home-safe.
              </Txt>
            </View>
          )}
        </ScrollView>

        <View>
          <Button
            title={step === 5 ? "Create My AI Plan" : "Continue"}
            onPress={step === 5 ? finish : next}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
