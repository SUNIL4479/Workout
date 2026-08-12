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

        <Row style={{ gap: 8 }}>
          <Card style={styles.statCard}><Txt bold size={22}>{stats.workouts}</Txt><Txt dim size={11}>Workouts</Txt></Card>
          <Card style={styles.statCard}><Txt bold size={22}>{stats.minutes}</Txt><Txt dim size={11}>Minutes</Txt></Card>
          <Card style={styles.statCard}><Txt bold size={22}>{stats.calories}</Txt><Txt dim size={11}>Calories</Txt></Card>
        </Row>
        <Spacer />

        <Card>
          <Txt bold size={16}>Body metrics</Txt>
          <Spacer h={10} />
          <Row style={{ flexWrap: "wrap", gap: 12 }}>
            <Stat label="BMI" value={`${user.bmi || "—"}`} sub={user.bmiCategory || ""} />
            <Stat label="Weight" value={`${user.weightKg} kg`} sub={user.targetWeightKg ? `target ${user.targetWeightKg} kg` : ""} />
            <Stat label="Goal" value={user.goal.replace(/_/g, " ")} sub={user.targetBodyType || ""} />
            <Stat label="Intensity" value={user.recommendedIntensity || "Moderate"} sub={user.experience} />
          </Row>
        </Card>
        <Spacer />

        {stats.recent.length > 0 ? (
          <Card>
            <Txt bold size={16}>Recent calories burned</Txt>
            <Spacer h={12} />
            <CaloriesChart data={stats.recent.map((l) => l.caloriesBurned || 0)} />
            <Spacer h={8} />
            <Txt dim size={11} style={{ textAlign: "center" }}>Last {stats.recent.length} workout{stats.recent.length > 1 ? "s" : ""}</Txt>
          </Card>
        ) : (
          <Card>
            <Txt size={14} dim>Complete your first workout to see charts here.</Txt>
          </Card>
        )}
        <Spacer />

        <Card>
          <Txt bold size={16}>Transformation</Txt>
          <Spacer h={8} />
          <Txt size={13} dim>
            You’re targeting a <Txt bold style={{ color: colors.accent }}>{user.targetBodyType || "toned physique"}</Txt>
            {" "}over {user.transformationMonths || 5} months. Stay consistent with daily sessions.
          </Txt>
          <Spacer h={4} />
          <Txt size={13} dim>🔥 Current streak: {user.streakDays} days</Txt>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={{ minWidth: 100 }}>
      <Txt dim size={11} style={{ textTransform: "uppercase" }}>{label}</Txt>
      <Txt bold size={15}>{value}</Txt>
      {sub ? <Txt dim size={11}>{sub}</Txt> : null}
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
      <Line x1={0} y1={height - 20} x2={width} y2={height - 20} stroke="#222" strokeWidth={1} />
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
            rx={4}
            fill={colors.accent}
            opacity={0.85}
          />
        );
      })}
      {data.length > 1 && (
        <SvgText x={4} y={12} fill="#666" fontSize={10}>
          {max} kcal max
        </SvgText>
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statCard: { flex: 1, alignItems: "center", borderRadius: 14, paddingVertical: 16 },
});
