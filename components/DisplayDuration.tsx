import { formatSeconds } from "@/utils/time";
import { useEffect, useState } from "react";
import { Text } from "react-native";

/* --------------------------------------------------
   Types
-------------------------------------------------- */

type WallClockProps = {
  startTime: Date;
  textColor?: string;
};

type AccumulatedProps = {
  baseSeconds?: number;
  runningSince?: number | null;
  textColor?: string;
};

type DisplayDurationProps = WallClockProps | AccumulatedProps;

/* --------------------------------------------------
   Component
-------------------------------------------------- */

export function DisplayDuration(props: DisplayDurationProps) {
  const [now, setNow] = useState(Date.now());

  const isWallClock = "startTime" in props;
  const runningSince = !isWallClock ? props.runningSince : null;

  useEffect(() => {
    // Tick only when needed
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
    <Text className={`text-lg font-semibold ${props.textColor ?? ""}`}>
      {formatSeconds(totalSeconds)}
    </Text>
  );
}
