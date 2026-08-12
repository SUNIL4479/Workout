import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Chip, Row, Spacer, Txt } from "../components/ui";
import { apiFetch } from "../api";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";

interface Msg {
  role: "user" | "model";
  text: string;
}

const QUICK_QUESTIONS = [
  "How do I fix my form?",
  "What should I eat to build muscle?",
  "Motivate me!",
  "Knee pain — safer exercises?",
];

export default function CoachChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const history = messages.map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: content }]);
    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; reply: string }>("ai/coach-chat", {
        method: "POST",
        body: JSON.stringify({ message: content, history, profile: user }),
      });
      setMessages((prev) => [...prev, { role: "model", text: res.reply }]);
    } catch (err: any) {
      Alert.alert("Chat error", err?.message || "Could not reach your coach.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Txt size={20} bold>AI Coach</Txt>
        <Txt dim size={12}>Ask anything fitness — form, nutrition, motivation</Txt>
      </View>

      {messages.length === 0 ? (
        <View style={styles.empty}>
          <Txt size={44}>💬</Txt>
          <Spacer />
          <Txt dim size={14} style={{ textAlign: "center" }}>
            Your personal trainer is here 24/7. Try one of these:
          </Txt>
          <Spacer h={12} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {QUICK_QUESTIONS.map((q) => (
              <Chip key={q} label={q} onPress={() => send(q)} />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.coachBubble]}>
              <Txt size={14} style={{ color: item.role === "user" ? "#000" : colors.text }}>
                {item.text}
              </Txt>
            </View>
          )}
        />
      )}

      {loading ? (
        <Row style={{ justifyContent: "center", padding: 6 }}>
          <Txt dim size={12}>Coach is typing…</Txt>
        </Row>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Row style={styles.inputBar}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask your coach…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              onSubmitEditing={() => send()}
              multiline
            />
          </View>
          <Button title="Send" onPress={() => send()} loading={loading} style={{ paddingHorizontal: 16 }} />
        </Row>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 12, marginBottom: 8 },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.accent },
  coachBubble: { alignSelf: "flex-start", backgroundColor: colors.surface },
  inputBar: { padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  inputWrap: { flex: 1 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    maxHeight: 100,
  },
});
