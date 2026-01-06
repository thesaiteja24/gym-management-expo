import { formatSeconds } from "@/utils/time";
import { useEffect, useState } from "react";
import { Text } from "react-native";

/* --------------------------------------------------
   Types
-------------------------------------------------- */

interface WallClockProps {
  /**
   * Start time of the timer.
   * If provided, the component runs in wall-clock mode,
   * showing the time elapsed since this Date.
   */
  startTime: Date;

  /**
   * Optional text styling for the displayed timer.
   * Can be Tailwind classes or React Native styles.
   */
  textClassName?: string;
}

interface AccumulatedProps {
  /**
   * Base duration in seconds already accumulated.
   */
  baseSeconds?: number;

  /**
   * Timestamp in milliseconds when the timer started running.
   * If provided, the timer will increment from baseSeconds.
   */
  runningSince?: number | null;

  /** Optional text styling for the displayed timer */
  textClassName?: string;
}

/** Props for the ElapsedTime component, either wall clock or accumulated mode */
export type ElapsedTimeProps = WallClockProps | AccumulatedProps;

/* --------------------------------------------------
   Component
-------------------------------------------------- */

/**
 * ElapsedTime
 *
 * A live-updating timer component that displays elapsed time in `hh:mm:ss` format.
 *
 * Modes:
 * - **Wall Clock Mode**: Provide `startTime` to show the time elapsed since that date.
 * - **Accumulated Mode**: Provide `baseSeconds` and optionally `runningSince` to show accumulated time.
 *
 * Updates every second if the timer is running.
 *
 * @example
 * // Wall Clock mode
 * <ElapsedTime startTime={new Date()} textClassName="text-lg font-bold" />
 *
 * @example
 * // Accumulated mode
 * <ElapsedTime baseSeconds={120} runningSince={Date.now()} textClassName="text-blue-500" />
 */
export function ElapsedTime(props: ElapsedTimeProps) {
  const [now, setNow] = useState(Date.now());

  // Determine if we're in wall clock mode
  const isWallClock = "startTime" in props;
  const runningSince = !isWallClock ? props.runningSince : null;

  useEffect(() => {
    // Only update every second if running
    if (!isWallClock && !runningSince) return;

    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [isWallClock, runningSince]);

  let totalSeconds = 0;

  if (isWallClock) {
    totalSeconds = Math.max(
      0,
      Math.floor((now - props.startTime.getTime()) / 1000),
    );
  } else {
    const base = props.baseSeconds ?? 0;
    const running =
      runningSince != null
        ? Math.max(0, Math.floor((now - runningSince) / 1000))
        : 0;

    totalSeconds = base + running;
  }

  return (
    <Text
      className={
        props.textClassName ??
        "text-lg font-semibold text-black dark:text-white"
      }
    >
      {formatSeconds(totalSeconds)}
    </Text>
  );
}
