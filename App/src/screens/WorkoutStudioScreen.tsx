import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Button, Card, Chip, Field, Row, Spacer, Txt } from "../components/ui";
import { ExerciseGif } from "../components/ExerciseGif";
import { apiFetch } from "../api";
import { useAuth } from "../auth/AuthContext";
import { WorkoutService } from "../services/workoutService";
import { colors } from "../theme";
import { WorkoutPlan, Exercise } from "../types";
import { MainTabParamList } from "../navigation";

const VALID_ANIMATION_TYPES = ["pushup", "squat", "plank", "lunge", "jumping_jacks", "mountain_climbers", "burpees", "crunch", "stretching"];

const BODY_FOCUS_OPTIONS = [
  { key: "Full Body", label: "Full Body" },
  { key: "Arms", label: "Arms" },
  { key: "Chest", label: "Chest" },
  { key: "Legs", label: "Legs" },
  { key: "Shoulders", label: "Shoulders" },
  { key: "Back", label: "Back" },
];

const PRESETS = [
  "Full body strength",
  "Fat burn cardio",
  "Core & abs",
  "Beginner friendly",
  "Low-impact / knee safe",
  "Upper body",
  "Lower body",
];

export default function WorkoutStudioScreen(_props: BottomTabScreenProps<MainTabParamList, "Studio">) {
  const { user } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);

  const normalizeExercises = (list: any[]): Exercise[] =>
    (list || []).filter(Boolean).map((ex, i) => {
      const anim = VALID_ANIMATION_TYPES.includes(ex.animationType)
        ? ex.animationType
        : inferAnimation(ex.name);
      return {
        id: ex.id || `ex_${i}`,
        name: ex.name || `Exercise ${i + 1}`,
        targetMuscles: ex.targetMuscles || "Full Body",
        durationSec: ex.durationSec || undefined,
        reps: ex.reps || undefined,
        sets: ex.sets || 3,
        restSec: ex.restSec || 30,
        calories: ex.calories || 15,
        instructions: ex.instructions || "Follow the demo and maintain steady form.",
        safetyTips: ex.safetyTips || "Keep movements controlled.",
        formCues: ex.formCues || "Keep core tight.",
        animationType: anim,
        difficulty: ex.difficulty,
      };
    });

  const generate = async (p?: string, bodyFocus?: string) => {
    const query = (p ?? prompt).trim();
    if (!query) {
      Alert.alert("Describe your workout", "Tell the AI coach what you want to train today.");
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const res = await apiFetch<{ success: boolean; workout: any }>("ai/generate-workout", {
        method: "POST",
        body: JSON.stringify({ userPrompt: query, profile: user, bodyFocus }),
      });
      const w = res.workout || {};
      const workout: WorkoutPlan = {
        id: w.title?.replace(/\s+/g, "_").toLowerCase() || `ai_${Date.now()}`,
        title: w.title || "AI Generated Workout",
        description: w.description || "",
        category: w.category || "Full Body",
        totalMinutes: w.totalMinutes || user?.durationMin || 20,
        estimatedCalories: w.estimatedCalories || 180,
        difficulty: w.difficulty || "Beginner",
        safetyAdvice: w.safetyAdvice || "Listen to your body.",
        warmUp: normalizeExercises(w.warmUp),
        mainRoutine: normalizeExercises(w.mainRoutine),
        coolDown: normalizeExercises(w.coolDown),
      };
      setPlan(workout);
    } catch (err: any) {
      Alert.alert("Generation failed", err?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Txt size={24} bold>AI Workout Studio</Txt>
        <Txt dim size={13}>Describe your ideal session — the coach builds it for you.</Txt>
        <Spacer />
        <Field
          value={prompt}
          onChangeText={setPrompt}
          placeholder="e.g. 20 min full body, no equipment, target chest and core"
          multiline
          style={{ minHeight: 70, textAlignVertical: "top" }}
        />
        <Button title="Generate Workout" onPress={() => generate()} loading={loading} />
        <Spacer h={14} />
        <Txt dim size={12} bold style={{ textTransform: "uppercase" }}>Body Focus</Txt>
        <Spacer h={6} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {BODY_FOCUS_OPTIONS.map((bf) => (
            <Chip key={bf.key} label={bf.label} onPress={() => {
              if (!user) return;
              setPrompt(`${bf.key} focused workout`);
              setLoading(true);
              setPlan(null);
              setTimeout(() => {
                const w = WorkoutService.generateBodyPartWorkout(user, bf.key);
                setPlan(w);
                setLoading(false);
              }, 100);
            }} />
          ))}
        </View>
        <Spacer h={14} />
        <Txt dim size={12} bold style={{ textTransform: "uppercase" }}>Quick ideas</Txt>
        <Spacer h={6} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.map((p) => (
            <Chip key={p} label={p} onPress={() => { setPrompt(p); generate(p); }} />
          ))}
        </View>

        {plan && (
          <Card style={{ marginTop: 20 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Txt bold size={17}>{plan.title}</Txt>
                <Txt dim size={12}>{plan.totalMinutes} min · {plan.estimatedCalories} cal · {plan.difficulty}</Txt>
              </View>
            </Row>
            <Spacer h={4} />
            <Txt size={13}>{plan.description}</Txt>
            <Spacer h={4} />
            <Txt dim size={12}>⚠️ {plan.safetyAdvice}</Txt>
            <Spacer />

            <Txt bold size={14} style={{ color: colors.accent }}>Warm-up</Txt>
            {plan.warmUp.map((ex, i) => <ExerciseRow key={`warm_${ex.id}_${i}`} ex={ex} />)}
            <Spacer />
            <Txt bold size={14} style={{ color: colors.accent }}>Main routine</Txt>
            {plan.mainRoutine.map((ex, i) => <ExerciseRow key={`main_${ex.id}_${i}`} ex={ex} />)}
            <Spacer />
            <Txt bold size={14} style={{ color: colors.accent }}>Cool down</Txt>
            {plan.coolDown.map((ex, i) => <ExerciseRow key={`cool_${ex.id}_${i}`} ex={ex} />)}

            <Spacer />
            <Button title="Start This Workout" onPress={() => nav.navigate("Player", { plan })} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function inferAnimation(name?: string): Exercise["animationType"] {
  const n = (name || "").toLowerCase();
  if (n.includes("push") || n.includes("chest")) return "pushup";
  if (n.includes("squat") || n.includes("leg") || n.includes("lunge")) return "lunge";
  if (n.includes("plank") || n.includes("core") || n.includes("ab")) return "plank";
  if (n.includes("jump") || n.includes("jack")) return "jumping_jacks";
  if (n.includes("climb") || n.includes("mountain")) return "mountain_climbers";
  if (n.includes("burpee")) return "burpees";
  if (n.includes("crunch")) return "crunch";
  if (n.includes("stretch") || n.includes("cool")) return "stretching";
  return "pushup";
}

function ExerciseRow({ ex }: { ex: Exercise }) {
  return (
    <Row style={{ marginVertical: 6 }}>
      <ExerciseGif exerciseName={ex.name} animationType={ex.animationType} style={styles.rowGif} />
      <View style={{ flex: 1 }}>
        <Txt size={13} bold>{ex.name}</Txt>
        <Txt dim size={12}>
          {ex.sets} sets × {ex.reps ? `${ex.reps} reps` : ex.durationSec ? `${ex.durationSec}s` : "—"} · rest {ex.restSec}s
        </Txt>
        <Txt dim size={11} numberOfLines={2}>{ex.formCues}</Txt>
      </View>
    </Row>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  rowGif: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#1a1a1a" },
});
