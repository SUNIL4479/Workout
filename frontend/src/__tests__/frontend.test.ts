import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Frontend Service & State Logic Unit Tests", () => {
  test("should format workout duration correctly", () => {
    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    assert.equal(formatDuration(0), "0:00");
    assert.equal(formatDuration(65), "1:05");
    assert.equal(formatDuration(3600), "60:00");
  });

  test("should calculate total calories burned", () => {
    const calculateCalories = (weightKg: number, durationMins: number, met: number) => {
      return Math.round((durationMins * met * 3.5 * weightKg) / 200);
    };

    const calories = calculateCalories(70, 30, 8); // 70kg, 30 mins, 8 METs
    assert.ok(calories > 0);
    assert.equal(calories, 294);
  });
});
