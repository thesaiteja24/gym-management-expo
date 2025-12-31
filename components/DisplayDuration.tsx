import { useEffect, useState } from "react";
import { Text } from "react-native";

type DisplayDurationProps = {
  startTime: Date;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
  }

  if (minutes > 0) {
    return `${pad(minutes)}m:${pad(seconds)}s`;
  }

  return `${pad(seconds)}s`;
}

export function DisplayDuration({ startTime }: DisplayDurationProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const elapsedMs = now - startTime.getTime();

  return (
    <Text className="text-lg font-semibold text-blue-500">
      {formatDuration(elapsedMs)}
    </Text>
  );
}
