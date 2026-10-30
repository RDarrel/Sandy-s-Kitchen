import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";

export const formatNotificationTime = (date) => {
  const createdAt = new Date(date);
  const now = new Date();

  if (Number.isNaN(createdAt.getTime())) return "";

  const minutes = differenceInMinutes(now, createdAt);
  const hours = differenceInHours(now, createdAt);
  const days = differenceInDays(now, createdAt);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 2) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return format(createdAt, "MMM d, yyyy");
};
