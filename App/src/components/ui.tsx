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
import { colors, radius, font } from "../theme";

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
        { color: dim ? colors.textDim : colors.text, fontFamily: font.regular },
        bold && { fontFamily: font.bold },
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
        ? "#fef2f2"
        : colors.surface2;
  const fg =
    variant === "primary"
      ? "#ffffff"
      : variant === "danger"
        ? colors.red
        : colors.text;
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
      {label ? <Txt dim size={12} bold style={{ marginBottom: 6, textTransform: "uppercase", fontFamily: font.semiBold }}>{label}</Txt> : null}
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
      <Text style={[styles.chipText, selected && { color: "#ffffff" }]}>{label}</Text>
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
    borderRadius: radius.xl,
    padding: 16,
  },
  btn: {
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  btnText: {
    fontSize: 15,
    fontFamily: font.semiBold,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    fontFamily: font.regular,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: font.semiBold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});
