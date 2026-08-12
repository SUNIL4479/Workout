import React, { useState } from "react";
import { StyleProp, ImageStyle } from "react-native";
import { Image } from "expo-image";
import { EXERCISE_DB_CATALOG, getExerciseDBGif } from "../services/exerciseGifs";

const FALLBACK_GIF = EXERCISE_DB_CATALOG.pushup.gifUrl;

// Renders the correct ExerciseDB GIF for an exercise, with graceful fallback.
export function ExerciseGif({
  exerciseName,
  animationType,
  targetMuscles,
  style,
}: {
  exerciseName: string;
  animationType?: string;
  targetMuscles?: string;
  style?: StyleProp<ImageStyle>;
}) {
  const [brokenUris, setBrokenUris] = useState<string[]>([]);
  const uri = getExerciseDBGif(exerciseName, animationType, targetMuscles).gifUrl;
  const displayUri = brokenUris.includes(uri) ? FALLBACK_GIF : uri;

  return (
    <Image
      source={{ uri: displayUri }}
      style={style}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      placeholder={FALLBACK_GIF}
      onError={() => setBrokenUris((prev) => [...prev, uri])}
    />
  );
}
