import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Button, Card, Chip, Field, Row, Spacer, Txt } from "../components/ui";
import { ExerciseGif } from "../components/ExerciseGif";
import { useAuth } from "../auth/AuthContext";
import { WorkoutService } from "../services/workoutService";
import { colors } from "../theme";
import { WorkoutPlan } from "../types";
import { MainTabParamList } from "../navigation";

const BODY_FOCUS_OPTIONS = [
  { key: "Full Body", label: "Full Body" },
  { key: "Arms", label: "Arms" },
  { key: "Chest", label: "Chest" },
  { key: "Legs", label: "Legs" },
  { key: "Shoulders", label: "Shoulders" },
  { key: "Back", label: "Back" },
];

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card style={styles.metricCard}>
      <Txt dim size={11} style={{ textTransform: "uppercase" }}>{label}</Txt>
      <Spacer h={6} />
      <Txt bold size={20}>{value}</Txt>
      {sub ? <Txt dim size={11}>{sub}</Txt> : null}
    </Card>
  );
}

export default function DashboardScreen(_props: BottomTabScreenProps<MainTabParamList, "Dashboard">) {
  const { user, updateWater, updateWeight, signOut } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const [weightModal, setWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [selectedBodyFocus, setSelectedBodyFocus] = useState<string | null>(null);
  const [bodyPartWorkout, setBodyPartWorkout] = useState<WorkoutPlan | null>(null);

  const localPlan = useMemo(() => (user ? WorkoutService.generatePersonalizedWorkout(user) : null), [user]);
  const plan = bodyPartWorkout || localPlan;

  const handleBodyFocus = (focus: typeof BODY_FOCUS_OPTIONS[number]) => {
    if (selectedBodyFocus === focus.key) {
      setSelectedBodyFocus(null);
      setBodyPartWorkout(null);
      return;
    }
    setSelectedBodyFocus(focus.key);
    if (!user) return;
    setBodyPartWorkout(WorkoutService.generateBodyPartWorkout(user, focus.key));
  };

  if (!user) return null;

  const caloriesToday = (user.workoutLogs || [])
    .filter((l) => l.date === new Date().toISOString().split("T")[0])
    .reduce((s, l) => s + (l.caloriesBurned || 0), 0);

  const waterPct = Math.min(100, Math.round((user.waterIntakeMl / ((user.waterGoalLiters || 3) * 1000)) * 100));

  const logWeight = async () => {
    const w = Number(weightInput);
    if (!w || w <= 0) {
      Alert.alert("Invalid weight", "Enter a positive number.");
      return;
    }
    try {
      await updateWeight(w);
      setWeightModal(false);
      setWeightInput("");
    } catch (err: any) {
      Alert.alert("Failed", err?.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Header */}
        <Row style={{ justifyContent: "space-between" }}>
          <View>
            <Txt size={24} bold>Hi, {user.name.split(" ")[0]}!</Txt>
            <Txt dim size={13}>Let’s get to work 💪</Txt>
          </View>
          <Pressable onPress={signOut}>
            <Card style={styles.levelBadge} outline={false}>
              <Txt size={12} style={{ color: colors.accent }} bold>LVL {user.level}</Txt>
              <Txt size={10} dim>{user.xp} XP</Txt>
            </Card>
          </Pressable>
        </Row>
        <Spacer />

        {/* Metrics */}
        <Row style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <MetricCard label="Streak" value={`${user.streakDays} 🔥`} sub="days in a row" />
          </View>
          <View style={{ flex: 1 }}>
            <MetricCard label="Weight" value={`${user.weightKg} kg`} sub={user.bmiCategory || "Normal"} />
          </View>
        </Row>
        <Spacer h={8} />
        <Row style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <MetricCard label="Water" value={`${waterPct}%`} sub={`${(user.waterIntakeMl / 1000).toFixed(2)} / ${user.waterGoalLiters || 3} L`} />
          </View>
          <View style={{ flex: 1 }}>
            <MetricCard label="Calories" value={`${caloriesToday}`} sub="burned today" />
          </View>
        </Row>
        <Spacer />

        {/* Body Focus */}
        <Card>
          <Txt bold size={16}>Body Focus</Txt>
          <Spacer h={2} />
          <Txt dim size={12}>Select a muscle group to target</Txt>
          <Spacer h={8} />
          <FlatList
            horizontal
            data={BODY_FOCUS_OPTIONS}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                label={item.label}
                selected={selectedBodyFocus === item.key}
                onPress={() => handleBodyFocus(item)}
                style={{ marginRight: 8 }}
              />
            )}
          />
        </Card>
        <Spacer />

        {/* Today's AI workout */}
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <Txt bold size={16}>{selectedBodyFocus ? `${selectedBodyFocus} Workout` : "Today's Workout"}</Txt>
            <Txt dim size={12}>{plan?.totalMinutes} min · {plan?.estimatedCalories} cal</Txt>
          </Row>
          <Spacer h={8} />
          <Txt size={13}>{plan?.title}</Txt>
          <Spacer h={4} />
          <Txt dim size={12}>{plan?.description}</Txt>
          <Spacer />
            <FlatList
              horizontal
              data={[
                ...(plan?.warmUp || []).map((ex) => ({ ...ex, _phase: "warm" })),
                ...(plan?.mainRoutine || []).map((ex) => ({ ...ex, _phase: "main" })),
                ...(plan?.coolDown || []).map((ex) => ({ ...ex, _phase: "cool" })),
              ]}
              keyExtractor={(ex) => `${ex._phase}_${ex.id}`}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.exercisePreview}>
                  <ExerciseGif
                    exerciseName={item.name}
                    animationType={item.animationType}
                    style={styles.exerciseGif}
                  />
                  <Txt size={11} numberOfLines={1} style={{ marginTop: 4 }}>{item.name}</Txt>
                </View>
              )}
            />
          <Spacer />
          <Button
            title="Start Workout"
            onPress={() => plan && nav.navigate("Player", { plan })}
          />
        </Card>
        <Spacer />

        {/* Daily tasks */}
        {(user.dailyTodoTasks || []).length > 0 && (
          <Card>
            <Txt bold size={16}>Today’s Tasks</Txt>
            <Spacer h={6} />
            {(user.dailyTodoTasks || []).map((t) => (
              <Row key={t.id} style={{ marginVertical: 4 }}>
                <View style={[styles.dot, t.completed && { backgroundColor: colors.accent }]} />
                <Txt size={13} style={{ flex: 1 }}>{t.title}</Txt>
                <Txt dim size={12}>{t.timeMin} min</Txt>
              </Row>
            ))}
          </Card>
        )}
        <Spacer />

        {/* Hydration */}
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <Txt bold size={16}>Hydration</Txt>
            <Txt dim size={12}>{waterPct}%</Txt>
          </Row>
          <Spacer h={8} />
          <Button title="+ 250 ml water" variant="ghost" onPress={() => updateWater(250).catch(() => undefined)} />
        </Card>
        <Spacer />

        {/* Quick actions */}
        <Row style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button title="Log Weight" variant="ghost" onPress={() => setWeightModal(true)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Ask Coach" variant="ghost" onPress={() => nav.navigate("Chat")} />
          </View>
        </Row>
      </ScrollView>

      <Modal visible={weightModal} transparent animationType="fade" onRequestClose={() => setWeightModal(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Txt bold size={18}>Log today’s weight</Txt>
            <Spacer />
            <Field
              label="Weight (kg)"
              value={weightInput}
              onChangeText={(v) => setWeightInput(v.replace(/[^0-9.]/g, ""))}
              keyboardType="numeric"
              placeholder="e.g. 68.5"
            />
            <Row style={{ gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="ghost" onPress={() => setWeightModal(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Save" onPress={logWeight} />
              </View>
            </Row>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  levelBadge: { padding: 10, alignItems: "center", borderRadius: 12, backgroundColor: colors.surface },
  metricCard: { borderRadius: 14 },
  exercisePreview: { width: 110, marginRight: 8 },
  exerciseGif: { width: 110, height: 110, borderRadius: 12, backgroundColor: "#1a1a1a" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#333" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  modalCard: { padding: 20 },
});
