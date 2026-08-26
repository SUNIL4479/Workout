import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Field, Txt, Spacer, Row } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";
import { RootStackParamList } from "../navigation";

export default function SignInScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "SignIn">) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      Alert.alert("Sign in failed", err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
          <Txt size={28} bold>Welcome back</Txt>
          <Txt dim>Sign in to continue your journey.</Txt>
          <Spacer h={24} />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <Spacer />
          <Button title="Sign In" onPress={submit} loading={loading} />
          <Spacer />
          <Row style={{ justifyContent: "center" }}>
            <Txt dim size={13}>New here? </Txt>
            <Txt size={13} bold style={{ color: colors.accent }} onPress={() => navigation.replace("Onboarding")}>
              Create an account
            </Txt>
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
