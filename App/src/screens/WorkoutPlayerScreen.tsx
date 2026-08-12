import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Row, Spacer, Txt, ProgressBar } from "../components/ui";
import { ExerciseGif } from "../components/ExerciseGif";
import { useAuth } from "../auth/AuthContext";
import { WorkoutService, WorkoutPerformanceFeedback } from "../services/workoutService";
import { VoiceCoachService } from "../services/voiceCoachService";
import { colors } from "../theme";
import { Exercise } from "../types";
import { RootStackParamList } from "../navigation";

type Phase = { type: "exercise"; ex: Exercise } | { type: "rest"; seconds: number };

function buildQueue(warmUp: Exercise[], main: Exercise[], coolDown: Exercise[]): Phase[] {
  const queue: Phase[] = [];
  const push = (list: Exercise[]) => {
    list.forEach((ex, i) => {
      queue.push({ type: "exercise", ex });
      if (i < list.length - 1) queue.push({ type: "rest", seconds: ex.restSec || 30 });
    });
  };
  push(warmUp);
  push(main);
  push(coolDown);
  return queue;
}

interface RunnerProps {
  phase: Phase;
  index: number;
  total: number;
  running: boolean;
  onAdvance: () => void;
  onToggleRunning: () => void;
}

function PhaseRunner({ phase, index, total, running, onAdvance, onToggleRunning }: RunnerProps) {
  const ex = phase.type === "exercise" ? phase.ex : null;
  const timedSeconds = phase.type === "rest" ? phase.seconds : ex?.durationSec || null;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(timedSeconds);
  const [repCount, setRepCount] = useState(0);

  useEffect(() => {
    if (phase.type === "exercise") {
      VoiceCoachService.prepareExercise(index + 1, ex!.name, total);
    } else {
      VoiceCoachService.restStarted(phase.seconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running || timedSeconds === null) return;
    const halfSpoken = { value: false };
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return s;
        const next = s - 1;
        if (phase.type === "exercise" && timedSeconds) {
          if (!halfSpoken.value && next <= timedSeconds / 2 && next > 5) {
            halfSpoken.value = true;
            VoiceCoachService.halfwayCue();
          }
          if (next === 10) VoiceCoachService.last10Seconds();
          if (next <= 5 && next > 0) VoiceCoachService.speak(String(next));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, timedSeconds, phase.type]);

  useEffect(() => {
    if (secondsLeft === 0) onAdvance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const isRepBased = phase.type === "exercise" && timedSeconds === null;
  const targetReps = ex?.reps || 10;
  const progress = isRepBased
    ? Math.min(100, (repCount / targetReps) * 100)
    : timedSeconds
      ? Math.min(100, ((timedSeconds - (secondsLeft ?? timedSeconds)) / timedSeconds) * 100)
      : 0;

  return (
    <>
      <Card style={styles.stage} outline={false}>
        {phase.type === "exercise" ? (
          <ExerciseGif
            exerciseName={ex!.name}
            animationType={ex!.animationType}
            targetMuscles={ex!.targetMuscles}
            style={styles.stageGif}
          />
        ) : (
          <View style={[styles.stageGif, styles.restStage]}>
            <Txt size={44}>Rest</Txt>
          </View>
        )}
      </Card>
      <Spacer />
      <Txt size={26} bold style={{ textAlign: "center" }}>
        {phase.type === "exercise" ? ex!.name : "Rest"}
      </Txt>
      <Txt dim size={13} style={{ textAlign: "center", marginTop: 4 }}>
        {phase.type === "exercise"
          ? isRepBased
            ? `${targetReps} reps x ${ex!.sets}`
            : `${ex!.durationSec}s hold`
          : `${phase.seconds}s breather`}
      </Txt>
      <Spacer />
      <Card outline={false} style={styles.actionArea}>
        {phase.type === "rest" ? (
          <View style={{ alignItems: "center" }}>
            <Txt size={56} bold>{secondsLeft ?? phase.seconds}</Txt>
            <Button title="Skip rest" variant="ghost" onPress={onAdvance} />
          </View>
        ) : isRepBased ? (
          <View style={{ alignItems: "center" }}>
            <Row style={{ gap: 24, justifyContent: "center" }}>
              <Pressable onPress={() => setRepCount((r) => Math.max(0, r - 1))} style={styles.counterBtn}>
                <Txt size={34} style={{ color: colors.accent }}>-</Txt>
              </Pressable>
              <Txt size={64} bold>{repCount}</Txt>
              <Pressable
                onPress={() => {
                  const next = repCount + 1;
                  setRepCount(next);
                  if (next === targetReps) VoiceCoachService.speak("Great job. Set complete.");
                }}
                style={styles.counterBtn}
              >
                <Txt size={34} style={{ color: colors.accent }}>+</Txt>
              </Pressable>
            </Row>
            <Txt dim size={12}>Target: {targetReps} reps</Txt>
            <Spacer h={10} />
            <Button title={repCount >= targetReps ? "Next Exercise" : "Skip to Next"} onPress={onAdvance} />
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Txt size={56} bold>{secondsLeft ?? ex!.durationSec}</Txt>
            <Row style={{ gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button title={running ? "Pause" : "Resume"} variant="ghost" onPress={onToggleRunning} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Skip" variant="ghost" onPress={onAdvance} />
              </View>
            </Row>
          </View>
        )}
      </Card>
      <Spacer />
      <ProgressBar value={progress} />
      {phase.type === "exercise" ? (
        <>
          <Spacer h={8} />
          <Txt dim size={12} style={{ textAlign: "center" }}>{ex!.formCues}</Txt>
          <Txt dim size={12} style={{ textAlign: "center", marginTop: 4 }}>
            {ex!.instructions?.slice(0, 90)}
          </Txt>
        </>
      ) : null}
    </>
  );
}

export default function WorkoutPlayerScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Player">) {
  const { plan } = route.params;
  const { user, finishWorkout } = useAuth();

  const queue = useMemo(
    () => buildQueue(plan.warmUp || [], plan.mainRoutine || [], plan.coolDown || []),
    [plan]
  );

  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const [feedback, setFeedback] = useState<1 | 3 | 5 | null>(null);
  const [saving, setSaving] = useState(false);

  const advance = () => {
    if (index + 1 >= queue.length) {
      setRunning(false);
      setDone(true);
      VoiceCoachService.workoutComplete(plan.estimatedCalories);
      return;
    }
    setIndex((i) => i + 1);
  };

  const quit = () => {
    Alert.alert("End workout?", "Progress will be lost.", [
      { text: "Keep going", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: () => {
          VoiceCoachService.stop();
          navigation.goBack();
        },
      },
    ]);
  };

  const recordPerformance = async () => {
    setSaving(true);
    const elapsedMs = Date.now() - new Date(startedAt).getTime();
    const totalMinutes = Math.max(1, Math.round(elapsedMs / 60000));
    const energy =
      (user?.recommendedIntensity || "").toLowerCase().includes("gentle") ||
      (user?.recommendedIntensity || "").toLowerCase().includes("moderate")
        ? "Medium"
        : "High";

    const perf: WorkoutPerformanceFeedback = {
      workoutId: plan.id,
      completedReps: 0,
      skippedExercisesCount: 0,
      totalDurationMin: totalMinutes,
      userRating: feedback || 3,
      energyLevel: energy,
      completedAt: new Date().toISOString(),
    };
    WorkoutService.recordWorkoutPerformance(perf);

    try {
      await finishWorkout(plan.estimatedCalories, totalMinutes, plan.title, queue.length);
    } catch (err: any) {
      Alert.alert("Warning", err?.message || "Could not sync to server.");
    } finally {
      setSaving(false);
      navigation.popToTop();
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Txt size={30} bold>Workout complete!</Txt>
          <Spacer h={8} />
          <Txt dim>+150 XP · {plan.estimatedCalories} calories</Txt>
          <Spacer h={24} />
          <Txt dim size={13}>How did that feel?</Txt>
          <Spacer h={8} />
          <Row style={{ justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <Button title="Too Easy" variant={feedback === 1 ? "primary" : "ghost"} onPress={() => setFeedback(1)} />
            <Button title="Optimal" variant={feedback === 3 ? "primary" : "ghost"} onPress={() => setFeedback(3)} />
            <Button title="Too Hard" variant={feedback === 5 ? "primary" : "ghost"} onPress={() => setFeedback(5)} />
          </Row>
          <Spacer h={24} />
          <Button title="Finish and Save" onPress={recordPerformance} loading={saving} />
        </View>
      </SafeAreaView>
    );
  }

  if (!queue[index]) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.player}>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt dim size={13}>Exercise {index + 1} / {queue.length}</Txt>
          <Pressable onPress={quit}>
            <Txt size={14} style={{ color: colors.red }} bold>Quit</Txt>
          </Pressable>
        </Row>
        <Spacer />
        <PhaseRunner
          key={index}
          phase={queue[index]}
          index={index}
          total={queue.length}
          running={running}
          onAdvance={advance}
          onToggleRunning={() => setRunning((r) => !r)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  player: { flex: 1, padding: 20 },
  stage: { borderRadius: 20, overflow: "hidden", backgroundColor: "#0a0a0a" },
  stageGif: { width: "100%", height: 260, backgroundColor: "#0a0a0a" },
  restStage: { alignItems: "center", justifyContent: "center" },
  actionArea: { alignItems: "center", backgroundColor: colors.surface2, paddingVertical: 20 },
  counterBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, justifyContent: "center", padding: 24 },
});
