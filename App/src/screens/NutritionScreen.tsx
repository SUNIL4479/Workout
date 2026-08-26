import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Button, Card, Row, Spacer, Txt } from "../components/ui";
import { apiFetch } from "../api";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme";
import { MainTabParamList } from "../navigation";

interface AiMealPlan {
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
  waterLiters?: number;
  coachTip?: string;
  meals?: {
    breakfast?: any;
    lunch?: any;
    dinner?: any;
    snack?: any;
  };
}

const MEAL_ORDER: { key: keyof NonNullable<AiMealPlan["meals"]>; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "🌅" },
  { key: "lunch", label: "Lunch", icon: "☀️" },
  { key: "snack", label: "Snack", icon: "🍎" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
];

export default function NutritionScreen(_props: BottomTabScreenProps<MainTabParamList, "Nutrition">) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AiMealPlan | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; mealPlan: AiMealPlan }>("ai/generate-nutrition", {
        method: "POST",
        body: JSON.stringify({ profile: user }),
      });
      setPlan(res.mealPlan || {});
    } catch (err: any) {
      Alert.alert("Generation failed", err?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Txt size={24} bold>Nutrition Plan</Txt>
        <Txt dim size={13}>Personalized daily meals from your AI nutritionist.</Txt>
        <Spacer />

        {!plan ? (
          <Card>
            <Txt size={14} dim>
              Get a full day of meals matched to your {user?.goal?.replace(/_/g, " ") || "fitness"} goal
              and {user?.diet?.replace(/_/g, " ") || "omnivore"} diet.
            </Txt>
            <Spacer />
            <Button title="Generate Meal Plan" onPress={generate} loading={loading} />
          </Card>
        ) : (
          <>
            {/* Macros */}
            <Card style={styles.macroCard}>
              <Row style={{ justifyContent: "space-between" }}>
                <Macro label="Calories" value={`${plan.dailyCalories || user?.calorieTarget || 2000}`} />
                <Macro label="Protein" value={`${plan.proteinGrams || "—"} g`} />
                <Macro label="Carbs" value={`${plan.carbsGrams || "—"} g`} />
                <Macro label="Fats" value={`${plan.fatsGrams || "—"} g`} />
              </Row>
              {plan.waterLiters ? (
                <Txt dim size={12} style={{ marginTop: 8 }}>💧 {plan.waterLiters} L water goal</Txt>
              ) : null}
            </Card>
            <Spacer />

            {MEAL_ORDER.map(({ key, label, icon }) => {
              const meal = plan.meals?.[key];
              if (!meal) return null;
              return (
                <Card key={key} style={{ marginBottom: 8 }}>
                  <Row style={{ gap: 8 }}>
                    <Txt size={18}>{icon}</Txt>
                    <Txt bold size={15}>{label}</Txt>
                    <Txt dim size={12}>{meal.calories ? `${meal.calories} kcal` : ""}</Txt>
                  </Row>
                  <Spacer h={6} />
                  <Txt size={14} bold>{meal.name}</Txt>
                  {meal.protein ? <Txt dim size={12}>Protein: {meal.protein}</Txt> : null}
                  <Spacer h={4} />
                  <Txt size={13} dim>{meal.description}</Txt>
                  {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? (
                    <View style={{ marginTop: 6 }}>
                      {meal.ingredients.map((ing: string) => (
                        <Txt key={ing} size={12} dim>• {ing}</Txt>
                      ))}
                    </View>
                  ) : null}
                </Card>
              );
            })}

            {plan.coachTip ? (
              <Card style={{ borderColor: colors.accent, backgroundColor: colors.accentLight }}>
                <Txt size={13} bold style={{ color: colors.accent }}>Coach tip</Txt>
                <Txt size={13}>{plan.coachTip}</Txt>
              </Card>
            ) : null}

            <Spacer />
            <Button title="Regenerate" variant="ghost" onPress={generate} loading={loading} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Txt bold size={16}>{value}</Txt>
      <Txt dim size={11} style={{ textTransform: "uppercase" }}>{label}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  macroCard: { alignItems: "center" },
});
