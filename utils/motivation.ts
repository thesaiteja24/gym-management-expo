export type MotivationCategory =
  | "progress"
  | "streak"
  | "consistency"
  | "recovery"
  | "neutral";

export interface MotivationInput {
  weeklyVolume: number;
  lastWeekVolume: number;
  streakDays: number;
  workoutsThisWeek: number;
  daysSinceLastWorkout: number;
  prCount?: number; // Optional: if we track PRs directly
}

export interface MotivationResult {
  text: string;
  category: MotivationCategory;
}

/**
 * Determines the motivational line based on a strict priority system.
 * Priority: Progress > Streak > Consistency > Recovery > Neutral
 */
export function getMotivationLine(input: MotivationInput): MotivationResult {
  // 1. Progress-based
  // Triggered when: PR detected OR volume increased > 5% vs last week
  const volumeGrowth =
    input.lastWeekVolume > 0
      ? (input.weeklyVolume - input.lastWeekVolume) / input.lastWeekVolume
      : 0;

  if ((input.prCount && input.prCount > 0) || volumeGrowth > 0.05) {
    if (input.prCount && input.prCount > 0) {
      return { text: "💪 New personal best detected", category: "progress" };
    }
    return { text: "💪 Stronger than last week", category: "progress" };
  }

  // 2. Streak-based
  // Triggered when: Streak >= 2 days
  if (input.streakDays >= 2) {
    // Deterministic rotation based on streak number to avoid flicker but give variety
    const streakMessages = [
      `🗓 ${input.streakDays}-day training streak`,
      "Momentum is building",
      "Keep the streak alive",
    ];
    return {
      text: streakMessages[input.streakDays % streakMessages.length],
      category: "streak",
    };
  }

  // 3. Consistency-based (Default for active users)
  // Triggered when: >= 1 workout this week
  if (input.workoutsThisWeek >= 1) {
    if (input.workoutsThisWeek === 1) {
      return { text: "One workout at a time", category: "consistency" };
    }
    const consistencyMessages = [
      `🔥 ${input.workoutsThisWeek} workouts this week`,
      "Consistency beats intensity",
      "Showing up is 90%",
    ];
    // Rotate based on workout count
    return {
      text: consistencyMessages[
        input.workoutsThisWeek % consistencyMessages.length
      ],
      category: "consistency",
    };
  }

  // 4. Recovery / Return-positive
  // Triggered when: Gap > 7 days or just returned
  if (input.daysSinceLastWorkout > 7) {
    return { text: "Rest is part of training", category: "recovery" };
  }
  if (input.daysSinceLastWorkout > 3) {
    return { text: "Ready to get back at it?", category: "recovery" };
  }

  // 5. Neutral / Onboarding (Fallback)
  return { text: "Let’s get started", category: "neutral" };
}
