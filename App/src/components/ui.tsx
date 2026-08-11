import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius } from "../theme";

// ---------- Text ----------

export function Txt({
  children,
  style,
  dim,
  bold,
  size,
  numberOfLines,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  dim?: boolean;
  bold?: boolean;
  size?: number;
  numberOfLines?: number;
  onPress?: () => void;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      onPress={onPress}
      style={[
        { color: dim ? colors.textDim : colors.text },
        bold && { fontWeight: "800" },
        size ? { fontSize: size } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ---------- Layout ----------

export function Spacer({ h = 8 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

export function Row({
  children,
  style,
  gap = 8,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>;
}

// ---------- Card ----------

export function Card({
  children,
  style,
  outline = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  outline?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        outline && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- Button ----------

export function Button({
  title,
  onPress,
  loading,
  variant = "primary",
  style,
  disabled,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "danger"
        ? "#2a1212"
        : colors.surface;
  const fg = variant === "primary" ? "#000" : variant === "danger" ? colors.red : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        (pressed || disabled || loading) && { opacity: 0.7 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

// ---------- Field ----------

export function Field({
  label,
  style,
  ...props
}: TextInputProps & { label?: string; style?: StyleProp<TextStyle> }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Txt dim size={12} bold style={{ marginBottom: 6, textTransform: "uppercase" }}>{label}</Txt> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

// ---------- Chip ----------

export function Chip({
  label,
  selected = false,
  onPress,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Text style={[styles.chipText, selected && { color: "#000" }]}>{label}</Text>
    </Pressable>
  );
}

// ---------- Progress bar ----------

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${pct}%`, backgroundColor: color || colors.accent },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#222",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
