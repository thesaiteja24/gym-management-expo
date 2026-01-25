export function formatDurationFromDates(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(ms / 60000);

  if (minutes < 60) return `${minutes}m`;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

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
 * Formats a date into the format: "Mon Dec 5th 2026 17:36"
 *
 * @param date - A Date object or a value convertible to Date
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date("2026-12-05T17:36:00"));
 * // "Mon Dec 5th 2026 17:36"
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

export function formatSeconds(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${m}:${String(s).padStart(2, "0")}`;
}
