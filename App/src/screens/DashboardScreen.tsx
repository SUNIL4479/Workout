import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <Card style={[styles.metricCard, { backgroundColor: color + "12", borderColor: color + "28" }]}>
      <View style={[styles.metricDot, { backgroundColor: color }]} />
      <Txt size={11} bold style={{ color, textTransform: "uppercase" }}>{label}</Txt>
      <Spacer h={4} />
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
        {/* TopAppBar - Frosted Glass Greeting */}
        <View style={styles.topAppBar}>
          <View style={styles.topAppBarContent}>
            <View>
              <Txt size={13} dim>{getGreeting()}</Txt>
              <Txt size={24} bold style={{ fontFamily: "Montserrat-Bold" }}>
                {user.name.split(" ")[0]}, Athlete
              </Txt>
            </View>
            <Pressable onPress={signOut}>
              <View style={styles.levelBadge}>
                <Txt size={12} bold style={{ color: colors.accent }}>LVL {user.level}</Txt>
                <Txt size={10} dim>{user.xp} XP</Txt>
              </View>
            </Pressable>
          </View>
        </View>
        <Spacer />

        <Row style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <MetricCard label="Streak" value={`${user.streakDays}`} sub="days in a row" color="#f97316" />
          </View>
          <View style={{ flex: 1 }}>
            <MetricCard label="Weight" value={`${user.weightKg} kg`} sub={user.bmiCategory || "Normal"} color="#0055ff" />
          </View>
        </Row>
        <Spacer h={8} />
        <Row style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <MetricCard label="Water" value={`${waterPct}%`} sub={`${(user.waterIntakeMl / 1000).toFixed(2)} / ${user.waterGoalLiters || 3} L`} color="#14b8a6" />
          </View>
          <View style={{ flex: 1 }}>
            <MetricCard label="Calories" value={`${caloriesToday}`} sub="burned today" color="#f59e0b" />
          </View>
        </Row>
        <Spacer />

        <Card style={styles.sectionBlue}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#0055ff" }]} />
            <Txt bold size={16} style={{ color: "#0055ff" }}>Body Focus</Txt>
          </Row>
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

        <Card style={styles.sectionPurple}>
          <View style={styles.workoutHeader}>
            <Txt bold size={16} style={{ color: "#8b5cf6" }}>
              {selectedBodyFocus ? `${selectedBodyFocus} Workout` : "Today's Workout"}
            </Txt>
            <Txt dim size={12}>{plan?.totalMinutes} min · {plan?.estimatedCalories} cal</Txt>
          </View>
          <Spacer h={6} />
          <Txt size={14} bold>{plan?.title}</Txt>
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

        {(user.dailyTodoTasks || []).length > 0 && (
          <Card style={styles.sectionAmber}>
            <Row style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#f59e0b" }]} />
              <Txt bold size={16} style={{ color: "#f59e0b" }}>Today's Tasks</Txt>
            </Row>
            <Spacer h={4} />
            {(user.dailyTodoTasks || []).map((t) => (
              <Row key={t.id} style={[styles.taskRow, t.completed && styles.taskRowDone]}>
                <View style={[styles.dot, t.completed && { backgroundColor: colors.green }]} />
                <Txt size={13} style={{ flex: 1, textDecorationLine: t.completed ? "line-through" : "none" }}>{t.title}</Txt>
                <Txt dim size={12}>{t.timeMin} min</Txt>
              </Row>
            ))}
          </Card>
        )}
        <Spacer />

        <Card style={styles.sectionTeal}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#14b8a6" }]} />
            <Txt bold size={16} style={{ color: "#14b8a6" }}>Hydration</Txt>
            <Txt dim size={12}>{waterPct}%</Txt>
          </Row>
          <Spacer h={8} />
          <Button title="+ 250 ml water" variant="ghost" onPress={() => updateWater(250).catch(() => undefined)} />
        </Card>
        <Spacer />

        <Row style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Pressable style={styles.actionBtnGreen} onPress={() => setWeightModal(true)}>
              <Txt size={14} bold style={{ color: "#fff" }}>⚖️ Log Weight</Txt>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Pressable style={styles.actionBtnPurple} onPress={() => nav.navigate("Chat")}>
              <Txt size={14} bold style={{ color: "#fff" }}>💬 Ask Coach</Txt>
            </Pressable>
          </View>
        </Row>
      </ScrollView>

      <Modal visible={weightModal} transparent animationType="fade" onRequestClose={() => setWeightModal(false)}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Txt bold size={18}>Log today's weight</Txt>
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
  topAppBar: {
    backgroundColor: colors.frostedBg,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topAppBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelBadge: {
    padding: 10,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  metricCard: { borderRadius: 14, paddingVertical: 14 },
  metricDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 6 },
  sectionBlue: { backgroundColor: "#e6f0ff", borderColor: "#bfdbfe" },
  sectionPurple: { backgroundColor: "#f5f3ff", borderColor: "#ddd6fe" },
  sectionTeal: { backgroundColor: "#f0fdfa", borderColor: "#ccfbf1" },
  sectionAmber: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  sectionHeader: { gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskRow: { marginVertical: 4 },
  taskRowDone: { opacity: 0.55 },
  exercisePreview: { width: 110, marginRight: 8 },
  exerciseGif: { width: 110, height: 110, borderRadius: 16, backgroundColor: colors.surface2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  actionBtnGreen: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  actionBtnPurple: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", padding: 24 },
  modalCard: { padding: 20 },
});
