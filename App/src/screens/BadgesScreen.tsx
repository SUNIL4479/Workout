import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Card, ProgressBar, Row, Spacer, Txt } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { computeBadges } from "../services/badgeService";
import { apiFetch } from "../api";
import { colors } from "../theme";
import { MainTabParamList } from "../navigation";

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streakDays: number;
}

export default function BadgesScreen(_props: BottomTabScreenProps<MainTabParamList, "Badges">) {
  const { user } = useAuth();
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    apiFetch<{ success: boolean; leaderboard: LeaderboardEntry[] }>("leaderboard")
      .then((res) => setBoard(res.leaderboard || []))
      .catch(() => undefined);
  }, []);

  if (!user) return null;

  const badges = computeBadges(user);
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Txt size={24} bold>Badges</Txt>
        <Txt dim size={13}>{unlocked} of {badges.length} unlocked</Txt>
        <Spacer />
        <ProgressBar value={(unlocked / badges.length) * 100} />
        <Spacer />

        <View style={styles.grid}>
          {badges.map((b) => (
            <Card key={b.id} style={[styles.badge, !b.unlocked && { opacity: 0.45 }]}>
              <View style={[styles.badgeIcon, b.unlocked && styles.badgeIconActive]}>
                <Txt size={22}>{b.iconName}</Txt>
              </View>
              <Txt size={11} bold style={{ textAlign: "center", marginTop: 6 }}>{b.name}</Txt>
              <Txt dim size={9} style={{ textAlign: "center", marginTop: 2 }} numberOfLines={3}>
                {b.description}
              </Txt>
              <View style={{ marginTop: 6, width: "100%" }}>
                <ProgressBar value={b.progressPercent} color={b.unlocked ? colors.accent : "#444"} />
              </View>
              <Txt dim size={9} style={{ marginTop: 4 }}>{b.progressPercent}%</Txt>
            </Card>
          ))}
        </View>

        <Spacer />
        <Card>
          <Txt bold size={16}>Leaderboard</Txt>
          <Spacer h={8} />
          {board.length === 0 ? (
            <Txt dim size={13}>Be the first to compete!</Txt>
          ) : (
            board.map((u, i) => (
              <Row key={u.id} style={{ marginVertical: 6 }}>
                <Txt bold size={14} style={{ color: i === 0 ? colors.accent : colors.textDim, width: 22 }}>
                  {i + 1}
                </Txt>
                <Txt size={13} style={{ flex: 1 }} numberOfLines={1}>
                  {u.id === user.id ? "You" : u.name}
                </Txt>
                <Txt dim size={12}>{u.xp} XP</Txt>
              </Row>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badge: {
    width: "31%",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 14,
    padding: 10,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIconActive: {
    backgroundColor: "#1f2600",
  },
});
