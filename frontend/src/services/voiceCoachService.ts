export interface VoiceCoachConfig {
  enabled: boolean;
  rate: number; // 0.8 to 1.2
  pitch: number; // 0.9 to 1.1
  volume: number; // 0.0 to 1.0
  voiceName?: string;
}

export class VoiceCoachService {
  private static synth: SpeechSynthesis | null = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  private static config: VoiceCoachConfig = {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  };

  static updateConfig(newConfig: Partial<VoiceCoachConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  static getConfig(): VoiceCoachConfig {
    return this.config;
  }

  static speak(text: string, force: boolean = false) {
    if (!this.config.enabled && !force) return;
    if (!this.synth) return;

    try {
      this.synth.cancel(); // Cancel any lingering speech to avoid queue backlog
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;

      const voices = this.synth.getVoices();
      if (this.config.voiceName) {
        const selected = voices.find((v) => v.name === this.config.voiceName);
        if (selected) utterance.voice = selected;
      } else {
        // Prefer natural English voice
        const englishVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel")));
        if (englishVoice) utterance.voice = englishVoice;
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn("VoiceCoachService speak error:", err);
    }
  }

  static announceExerciseStart(exerciseName: string, formCue: string) {
    this.speak(`Get ready for ${exerciseName}. Form cue: ${formCue}`);
  }

  static announceCountdown(num: number) {
    if (num > 0) {
      this.speak(`${num}`);
    } else {
      this.speak("Go! Begin movement!");
    }
  }

  static announceHalfway() {
    this.speak("Halfway through! Keep your core braced and maintain steady breathing.");
  }

  static announceFinalCountdown(sec: number) {
    if (sec === 10) this.speak("10 seconds remaining! Stay strong!");
    if (sec === 5) this.speak("Final 5 seconds! Finish strong!");
  }

  static announceRestStart(restSec: number) {
    this.speak(`Great work! Rest for ${restSec} seconds. Inhale deeply.`);
  }

  static announceWorkoutComplete() {
    this.speak("Workout complete! Outstanding performance today!");
  }

  static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
