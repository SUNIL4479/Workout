import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Button, Card, Field, Row, Spacer, Txt } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";
import { MainTabParamList } from "../navigation";

export default function ProfileScreen(_props: BottomTabScreenProps<MainTabParamList, "Profile">) {
  const { user, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [targetWeightInput, setTargetWeightInput] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const xpForNext = ((user.level || 1)) * 200;
  const xpInLevel = user.xp % xpForNext;
  const xpProgress = Math.round((xpInLevel / xpForNext) * 100);

  const startEdit = () => {
    setNameInput(user.name);
    setWeightInput(String(user.weightKg));
    setTargetWeightInput(String(user.targetWeightKg || ""));
    setEditing(true);
  };

  const saveProfile = async () => {
    const w = Number(weightInput);
    const tw = Number(targetWeightInput);
    if (!nameInput.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }
    setSaving(true);
    try {
      const patch: any = { name: nameInput.trim() };
      if (w > 0) {
        const heightM = user.heightCm / 100;
        patch.weightKg = w;
        patch.bmi = parseFloat((w / (heightM * heightM)).toFixed(1));
      }
      if (tw > 0) patch.targetWeightKg = tw;
      await updateProfile(patch);
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Failed", err?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Txt size={28} bold style={{ color: "#fff" }}>{initials}</Txt>
          </View>
          <Txt size={22} bold>{user.name}</Txt>
          <Txt dim size={13}>{user.email}</Txt>
        </View>
        <Spacer />

        {/* Quick stats row */}
        <Row style={{ gap: 8 }}>
          <Card style={[styles.quickStat, { backgroundColor: "#fff7ed" }]}>
            <Txt size={20}>🔥</Txt>
            <Txt bold size={16}>{user.streakDays}</Txt>
            <Txt dim size={10}>Streak</Txt>
          </Card>
          <Card style={[styles.quickStat, { backgroundColor: "#e6f0ff" }]}>
            <Txt size={20}>⭐</Txt>
            <Txt bold size={16}>{user.xp}</Txt>
            <Txt dim size={10}>XP</Txt>
          </Card>
          <Card style={[styles.quickStat, { backgroundColor: "#f5f3ff" }]}>
            <Txt size={20}>🛡️</Txt>
            <Txt bold size={16}>{user.level}</Txt>
            <Txt dim size={10}>Level</Txt>
          </Card>
        </Row>
        <Spacer />

        {/* XP Progress */}
        <Card style={styles.sectionBlue}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#0055ff" }]} />
            <Txt bold size={14} style={{ color: "#0055ff" }}>Level Progress</Txt>
            <Txt dim size={11}>{xpInLevel} / {xpForNext} XP</Txt>
          </Row>
          <Spacer h={8} />
          <View style={styles.progressOuter}>
            <View style={[styles.progressFill, { width: `${xpProgress}%` }]} />
          </View>
          <Spacer h={4} />
          <Txt dim size={11}>{xpForNext - xpInLevel} XP to Level {(user.level || 1) + 1}</Txt>
        </Card>
        <Spacer />

        {/* Personal Info */}
        <Card style={styles.sectionTeal}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#14b8a6" }]} />
            <Txt bold size={14} style={{ color: "#14b8a6" }}>Personal Info</Txt>
          </Row>
          <Spacer h={8} />
          <InfoRow label="Age" value={`${user.age} years`} />
          <InfoRow label="Gender" value={user.gender} />
          <InfoRow label="Height" value={`${user.heightCm} cm`} />
          <InfoRow label="Joined" value={new Date(user.joinedDate).toLocaleDateString()} />
        </Card>
        <Spacer />

        {/* Body Stats */}
        <Card style={styles.sectionPurple}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#8b5cf6" }]} />
            <Txt bold size={14} style={{ color: "#8b5cf6" }}>Body Stats</Txt>
          </Row>
          <Spacer h={8} />
          {editing ? (
            <>
              <Field label="Name" value={nameInput} onChangeText={setNameInput} />
              <Field label="Weight (kg)" value={weightInput} onChangeText={setWeightInput} keyboardType="numeric" />
              <Field label="Target Weight (kg)" value={targetWeightInput} onChangeText={setTargetWeightInput} keyboardType="numeric" />
            </>
          ) : (
            <>
              <InfoRow label="Weight" value={`${user.weightKg} kg`} />
              <InfoRow label="BMI" value={`${user.bmi || "—"} (${user.bmiCategory || "N/A"})`} />
              <InfoRow label="Target Weight" value={user.targetWeightKg ? `${user.targetWeightKg} kg` : "Not set"} />
              <InfoRow label="Body Type" value={user.bodyType || "Not assessed"} />
            </>
          )}
        </Card>
        <Spacer />

        {/* Fitness Profile */}
        <Card style={styles.sectionAmber}>
          <Row style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#f59e0b" }]} />
            <Txt bold size={14} style={{ color: "#f59e0b" }}>Fitness Profile</Txt>
          </Row>
          <Spacer h={8} />
          <InfoRow label="Goal" value={user.goal.replace(/_/g, " ")} />
          <InfoRow label="Target Body" value={user.targetBodyType || "Not set"} />
          <InfoRow label="Experience" value={user.experience} />
          <InfoRow label="Duration" value={`${user.durationMin} min / day`} />
          <InfoRow label="Intensity" value={user.recommendedIntensity || "Moderate"} />
          <InfoRow label="Diet" value={user.diet.replace(/_/g, " ")} />
          {user.medicalLimitations ? <InfoRow label="Limitations" value={user.medicalLimitations} /> : null}
        </Card>
        <Spacer />

        {/* Actions */}
        {editing ? (
          <Row style={{ gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Save" onPress={saveProfile} loading={saving} />
            </View>
          </Row>
        ) : (
          <>
            <Button title="Edit Profile" variant="ghost" onPress={startEdit} />
            <Spacer h={12} />
            <Pressable style={styles.signOutBtn} onPress={() => {
              Alert.alert("Sign out?", "You will need to sign in again.", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign out", style: "destructive", onPress: signOut },
              ]);
            }}>
              <Txt bold size={14} style={{ color: colors.red, textAlign: "center" }}>Sign Out</Txt>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={styles.infoRow}>
      <Txt dim size={12} style={{ width: 110 }}>{label}</Txt>
      <Txt size={13} bold style={{ flex: 1, textAlign: "right" }}>{value}</Txt>
    </Row>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  avatarSection: { alignItems: "center", paddingVertical: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
    gap: 2,
  },
  sectionBlue: { backgroundColor: "#e6f0ff", borderColor: "#bfdbfe" },
  sectionTeal: { backgroundColor: "#f0fdfa", borderColor: "#ccfbf1" },
  sectionPurple: { backgroundColor: "#f5f3ff", borderColor: "#ddd6fe" },
  sectionAmber: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
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
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: colors.red + "40",
    backgroundColor: colors.red + "0a",
    borderRadius: 14,
    paddingVertical: 14,
  },
});
