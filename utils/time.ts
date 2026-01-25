/**
 * Calculates the duration between two ISO date strings and returns a formatted string.
 *
 * @param start - The start date ISO string.
 * @param end - The end date ISO string.
 * @returns A string representing the duration (e.g., "45m", "1h 30m", "2h").
 *
 * @example
 * formatDurationFromDates("2023-10-27T10:00:00Z", "2023-10-27T11:45:00Z");
 * // Output: "1h 45m"
 *
 * @usage
 * Used in:
 * - `WorkoutCard` (components/workout/WorkoutCard.tsx)
 * - `WorkoutDetailScreen` (app/(app)/workout/[id].tsx)
 */
export function formatDurationFromDates(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(ms / 60000);

  if (minutes < 60) return `${minutes}m`;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Returns a human-readable string representing how much time has passed since the given date.
 *
 * @param dateString - The past date ISO string.
 * @returns A string like "just now", "5m ago", "2h ago", "3d ago", "1mo ago".
 *
 * @example
 * formatTimeAgo("2023-10-27T09:00:00Z"); // Assuming now is 10:00:00Z
 * // Output: "1h ago"
 *
 * @usage
 * Used in:
 * - `WorkoutDetailScreen` (app/(app)/workout/[id].tsx)
 */
export function formatTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Formats a date into a detailed string with ordinal day suffix.
 *
 * @param date - A Date object or a value convertible to Date.
 * @returns Formatted date string (e.g., "Mon Dec 5th 2026 17:36").
 *
 * @example
 * formatDate(new Date("2026-12-05T17:36:00"));
 * // Output: "Mon Dec 5th 2026 17:36"
 *
 * @usage
 * Used in:
 * - `WorkoutCard` (components/workout/WorkoutCard.tsx)
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);

  const days: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName: string = days[d.getDay()];
  const month: string = months[d.getMonth()];
  const day: number = d.getDate();
  const year: number = d.getFullYear();

  const hours: string = String(d.getHours()).padStart(2, "0");
  const minutes: string = String(d.getMinutes()).padStart(2, "0");

  const getOrdinal = (n: number): string => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${dayName} ${month} ${day}${getOrdinal(day)} ${year} ${hours}:${minutes}`;
}

/**
 * Formats total seconds into MM:SS or HH:MM:SS format.
 *
 * @param totalSeconds - The total number of seconds.
 * @returns A formatted time string.
 *
 * @example
 * formatSeconds(65);
 * // Output: "1:05"
 *
 * formatSeconds(3665);
 * // Output: "1:01:05"
 *
 * @usage
 * Used in:
 * - `RestTimerSnack` (components/workout/RestTimerSnack.tsx)
 * - `ElapsedTime` (components/workout/ElapsedTime.tsx)
 */
export function formatSeconds(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Returns a date string in "YYYY-MM-DD" format.
 * Useful for using dates as map keys or comparing dates without time.
 *
 * @param date - The Date object to format.
 * @returns Date string in "YYYY-MM-DD".
 *
 * @example
 * toDateKey(new Date("2023-12-25T10:00:00"));
 * // Output: "2023-12-25"
 *
 * @usage
 * Used in:
 * - `HomeScreen` (app/(app)/(tabs)/home/index.tsx)
 */
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;

/**
 * Parses a UTC ISO string safely into a local Date object with time stripped (midnight).
 * Useful for ensuring date consistency across timezones when only the date part matters.
 *
 * @param iso - The ISO date string.
 * @returns A Date object representing the local date at midnight.
 *
 * @example
 * parseUTCToLocalDate("2023-11-15T14:30:00Z");
 * // Output: Wed Nov 15 2023 00:00:00 GMT... (Local equivalent of that date)
 *
 * @usage
 * Used in:
 * - `HomeScreen` (app/(app)/(tabs)/home/index.tsx)
 */
export const parseUTCToLocalDate = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
