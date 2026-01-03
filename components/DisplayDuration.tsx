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
   Helpers
-------------------------------------------------- */

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) return `${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
  if (minutes > 0) return `${pad(minutes)}m:${pad(seconds)}s`;
  return `${pad(seconds)}s`;
}

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
    totalSeconds = Math.floor((now - props.startTime.getTime()) / 1000);
  } else {
    const base = props.baseSeconds ?? 0;
    const running =
      runningSince != null ? Math.floor((now - runningSince) / 1000) : 0;

    totalSeconds = base + running;
  }

  return (
    <Text className={`text-lg font-semibold ${props.textColor ?? ""}`}>
      {formatDuration(totalSeconds)}
    </Text>
  );
}
