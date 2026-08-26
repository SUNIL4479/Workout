import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Txt, Spacer } from "../components/ui";
import { RootStackParamList } from "../navigation";
import { colors } from "../theme";

export default function LandingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Landing">) {
  return (
    <LinearGradient colors={["#f7f9fb", "#e6f0ff"]} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
          <Txt size={40} bold style={{ letterSpacing: 1, fontFamily: "Montserrat-Bold" }}>FITIFY</Txt>
          <Txt dim size={16} style={{ textAlign: "center", marginTop: 8 }}>
            Your AI-powered home workout coach.
          </Txt>
          <Txt dim size={13} style={{ textAlign: "center", marginTop: 4 }}>
            Personalized plans · Voice guidance · Track your transformation
          </Txt>
        </View>

        <View style={styles.actions}>
          <Button title="Get Started" onPress={() => navigation.navigate("Onboarding")} />
          <Spacer />
          <Button
            title="I already have an account"
            variant="ghost"
            onPress={() => navigation.navigate("SignIn")}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 24 },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: 120, height: 120, marginBottom: 16 },
  actions: { marginBottom: 16 },
});
