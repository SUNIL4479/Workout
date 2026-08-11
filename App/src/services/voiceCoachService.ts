import * as Speech from "expo-speech";

// Voice Coach — Android/iOS TTS layer mirroring the web app's speech coach.
// Pauses timers while speaking and enforces a natural coaching cadence.

interface VoiceCoachConfig {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
}

const DEFAULT_CONFIG: VoiceCoachConfig = {
  enabled: true,
  rate: 0.95,
  pitch: 1.0,
  volume: 1.0,
};

let config: VoiceCoachConfig = { ...DEFAULT_CONFIG };

export class VoiceCoachService {
  static updateConfig(next: Partial<VoiceCoachConfig>) {
    config = { ...config, ...next };
  }

  static isEnabled() {
    return config.enabled;
  }

  static async speak(text: string, force: boolean = false): Promise<void> {
    if (!config.enabled && !force) return;
    try {
      await Speech.stop();
      Speech.speak(text, {
        language: "en-US",
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume,
        // Long sentences need a slower rate so cues aren't garbled.
        onError: () => console.warn("[VoiceCoach] speech error"),
      });
    } catch (err) {
      console.warn("[VoiceCoach] speak failed:", err);
    }
  }

  static async stop() {
    try {
      await Speech.stop();
    } catch {
      // ignore
    }
  }

  static prepareExercise(index: number, name: string, total: number) {
    return this.speak(`Exercise ${index + 1} of ${total}. ${name}. Begin when ready.`);
  }

  static getReadyCountdown() {
    return this.speak("Get ready. 3, 2, 1. Begin.");
  }

  static halfwayCue() {
    return this.speak("Halfway there. Keep pushing.");
  }

  static last10Seconds() {
    return this.speak("10 seconds remaining.");
  }

  static last5Seconds() {
    return this.speak("5. 4. 3. 2. 1.");
  }

  static restStarted(seconds: number) {
    return this.speak(`Rest for ${seconds} seconds. Breathe and shake it out.`);
  }

  static workoutComplete(calories: number) {
    return this.speak(`Great job. Workout complete. You burned about ${calories} calories.`);
  }

  static encourage() {
    return this.speak("You're doing great. Stay strong.");
  }
}
