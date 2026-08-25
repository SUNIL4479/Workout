import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Card, ProgressBar, Row, Spacer, Txt } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { computeBadges, CATEGORY_META } from "../services/badgeService";
import { apiFetch } from "../api";
import { colors } from "../theme";
import { BadgeCategory, Badge } from "../types";
import { MainTabParamList } from "../navigation";

const CATEGORY_ORDER: BadgeCategory[] = ["milestone", "streak", "burn", "transform", "lifestyle", "rank"];

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

  const allBadges = computeBadges(user);
  const unlocked = allBadges.filter((b) => b.unlocked).length;

  const grouped = useMemo(() => {
    const map: Record<BadgeCategory, Badge[]> = {
      streak: [], milestone: [], burn: [], transform: [], lifestyle: [], rank: [],
    };
    for (const b of allBadges) map[b.category].push(b);
    return map;
  }, [allBadges]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Header */}
        <Txt size={24} bold>Achievements</Txt>
        <Txt dim size={13}>{unlocked} of {allBadges.length} unlocked</Txt>
        <Spacer />
        <View style={styles.progressOuter}>
          <View style={[styles.progressFill, { width: `${(unlocked / allBadges.length) * 100}%` }]} />
        </View>
        <Spacer h={24} />

        {/* Category sections */}
        {CATEGORY_ORDER.map((catKey) => {
          const meta = CATEGORY_META[catKey];
          const catBadges = grouped[catKey];
          if (catBadges.length === 0) return null;
          const catUnlocked = catBadges.filter((b) => b.unlocked).length;

          return (
            <View key={catKey} style={styles.categorySection}>
              {/* Category header */}
              <Row style={[styles.categoryHeader, { backgroundColor: meta.bg }]}>
                <View style={[styles.categoryDot, { backgroundColor: meta.color }]} />
                <Txt size={13} bold style={{ color: meta.color }}>{meta.label}</Txt>
                <Txt dim size={11}>{catUnlocked}/{catBadges.length}</Txt>
              </Row>

              {/* Badges row */}
              <View style={styles.grid}>
                {catBadges.map((b) => (
                  <View
                    key={b.id}
                    style={[
                      styles.badge,
                      { backgroundColor: meta.bg },
                      !b.unlocked && styles.badgeLocked,
                    ]}
                  >
                    <View style={[styles.badgeIcon, { backgroundColor: meta.color + "22", borderColor: meta.color + "44" }]}>
                      <Txt size={20}>{b.iconName}</Txt>
                      {b.unlocked && <View style={[styles.checkBadge, { backgroundColor: meta.color }]}>✓</View>}
                    </View>
                    <Txt size={10} bold style={{ textAlign: "center", marginTop: 6, color: colors.text }} numberOfLines={1}>
                      {b.name}
                    </Txt>
                    <Txt dim size={8} style={{ textAlign: "center", marginTop: 2 }} numberOfLines={2}>
                      {b.description}
                    </Txt>
                    <View style={{ marginTop: 6, width: "100%" }}>
                      <ProgressBar
                        value={b.progressPercent}
                        color={b.unlocked ? meta.color : colors.border}
                      />
                    </View>
                    <Txt dim size={8} style={{ marginTop: 2 }}>{b.progressPercent}%</Txt>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Leaderboard */}
        <Spacer />
        <Card style={styles.leaderboardCard}>
          <Txt bold size={16}>Leaderboard</Txt>
          <Spacer h={8} />
          {board.length === 0 ? (
            <Txt dim size={13}>Be the first to compete!</Txt>
          ) : (
            board.map((u, i) => (
              <Row key={u.id} style={[styles.boardRow, i === 0 && styles.boardRowTop]}>
                <View style={[styles.rankBadge, i === 0 && styles.rankBadgeGold]}>
                  <Txt bold size={12} style={{ color: i === 0 ? "#fff" : colors.text }}>{i + 1}</Txt>
                </View>
                <Txt size={13} style={{ flex: 1 }} numberOfLines={1}>
                  {u.id === user.id ? "You" : u.name}
                </Txt>
                <Txt bold size={12} style={{ color: colors.accent }}>{u.xp} XP</Txt>
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
  progressOuter: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  categorySection: { marginBottom: 16 },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    width: "31%",
    alignItems: "center",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  checkBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
  },
  leaderboardCard: { borderRadius: 16 },
  boardRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  boardRowTop: {
    backgroundColor: colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankBadgeGold: {
    backgroundColor: colors.accent,
  },
});
