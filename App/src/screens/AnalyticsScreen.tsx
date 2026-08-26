import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";
import { Card, Row, Spacer, Txt } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";
import { MainTabParamList } from "../navigation";

export default function AnalyticsScreen(_props: BottomTabScreenProps<MainTabParamList, "Analytics">) {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const logs = user?.workoutLogs || [];
    return {
      workouts: logs.length,
      minutes: logs.reduce((s, l) => s + (l.minutes || 0), 0),
      calories: logs.reduce((s, l) => s + (l.caloriesBurned || 0), 0),
      recent: logs.slice(-7),
    };
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Txt size={24} bold>Analytics</Txt>
        <Txt dim size={13}>Your progress at a glance.</Txt>
        <Spacer />

        {/* Stat summary cards */}
        <Row style={{ gap: 8 }}>
          <Card style={[styles.statCard, { backgroundColor: "#e6f0ff", borderColor: "#bfdbfe" }]}>
            <View style={[styles.statDot, { backgroundColor: "#0055ff" }]} />
            <Txt bold size={22} style={{ color: "#0055ff" }}>{stats.workouts}</Txt>
            <Txt size={11} bold style={{ color: "#0055ff" }}>Workouts</Txt>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: "#f5f3ff", borderColor: "#ddd6fe" }]}>
            <View style={[styles.statDot, { backgroundColor: "#8b5cf6" }]} />
            <Txt bold size={22} style={{ color: "#8b5cf6" }}>{stats.minutes}</Txt>
            <Txt size={11} bold style={{ color: "#8b5cf6" }}>Minutes</Txt>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
            <View style={[styles.statDot, { backgroundColor: "#f59e0b" }]} />
            <Txt bold size={22} style={{ color: "#f59e0b" }}>{stats.calories}</Txt>
            <Txt size={11} bold style={{ color: "#f59e0b" }}>Calories</Txt>
          </Card>
        </Row>
        <Spacer />

        {/* Body metrics */}
        <Card style={styles.sectionTeal}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#14b8a6" }]} />
            <Txt bold size={16} style={{ color: "#14b8a6" }}>Body Metrics</Txt>
          </Row>
          <Spacer h={10} />
          <View style={styles.metricsGrid}>
            <MetricTile label="BMI" value={`${user.bmi || "—"}`} sub={user.bmiCategory || ""} color="#0055ff" />
            <MetricTile label="Weight" value={`${user.weightKg}`} unit="kg" sub={user.targetWeightKg ? `target ${user.targetWeightKg} kg` : ""} color="#8b5cf6" />
            <MetricTile label="Goal" value={user.goal.replace(/_/g, " ")} sub={user.targetBodyType || ""} color="#f97316" />
            <MetricTile label="Intensity" value={user.recommendedIntensity || "Moderate"} sub={user.experience} color="#10b981" />
          </View>
        </Card>
        <Spacer />

        {/* Calories chart */}
        {stats.recent.length > 0 ? (
          <Card style={styles.sectionAmber}>
            <Row style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#f59e0b" }]} />
              <Txt bold size={16} style={{ color: "#f59e0b" }}>Recent Calories Burned</Txt>
            </Row>
            <Spacer h={12} />
            <CaloriesChart data={stats.recent.map((l) => l.caloriesBurned || 0)} />
            <Spacer h={8} />
            <Txt dim size={11} style={{ textAlign: "center" }}>Last {stats.recent.length} workout{stats.recent.length > 1 ? "s" : ""}</Txt>
          </Card>
        ) : (
          <Card style={styles.sectionAmber}>
            <Txt size={14} dim>Complete your first workout to see charts here.</Txt>
          </Card>
        )}
        <Spacer />

        {/* Transformation */}
        <Card style={styles.sectionPurple}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#8b5cf6" }]} />
            <Txt bold size={16} style={{ color: "#8b5cf6" }}>Transformation</Txt>
          </Row>
          <Spacer h={8} />
          <Txt size={13}>
            Targeting a{" "}
            <Txt bold style={{ color: colors.accent }}>{user.targetBodyType || "toned physique"}</Txt>
            {" "}over {user.transformationMonths || 5} months. Stay consistent with daily sessions.
          </Txt>
          <Spacer h={8} />
          <View style={styles.streakRow}>
            <Txt size={13}>🔥 Current streak: <Txt bold>{user.streakDays} days</Txt></Txt>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricTile({ label, value, unit, sub, color }: { label: string; value: string; unit?: string; sub?: string; color: string }) {
  return (
    <View style={[styles.metricTile, { borderLeftColor: color }]}>
      <Txt size={10} bold style={{ color, textTransform: "uppercase" }}>{label}</Txt>
      <Txt bold size={15}>{value}{unit ? ` ${unit}` : ""}</Txt>
      {sub ? <Txt dim size={10}>{sub}</Txt> : null}
    </View>
  );
}

function CaloriesChart({ data }: { data: number[] }) {
  const width = 320;
  const height = 160;
  const pad = 8;
  const max = Math.max(...data, 1);
  const bw = (width - pad * 2) / data.length;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Line x1={0} y1={height - 20} x2={width} y2={height - 20} stroke={colors.border} strokeWidth={1} />
      {data.map((v, i) => {
        const h = (v / max) * (height - 40);
        const x = pad + i * bw + bw * 0.15;
        return (
          <Rect
            key={i}
            x={x}
            y={height - 20 - h}
            width={bw * 0.7}
            height={h}
            rx={6}
            fill={i % 2 === 0 ? "#f59e0b" : "#f97316"}
            opacity={0.85}
          />
        );
      })}
      {data.length > 1 && (
        <SvgText x={4} y={12} fill={colors.textMuted} fontSize={10}>
          {max} kcal max
        </SvgText>
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statCard: { flex: 1, alignItems: "center", borderRadius: 16, paddingVertical: 16 },
  statDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 6 },
  sectionTeal: { backgroundColor: "#f0fdfa", borderColor: "#ccfbf1" },
  sectionAmber: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  sectionPurple: { backgroundColor: "#f5f3ff", borderColor: "#ddd6fe" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricTile: {
    minWidth: "47%",
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
  },
  streakRow: {
    backgroundColor: "#fff7ed",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
