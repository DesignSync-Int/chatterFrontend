export const getTimeDifferenceInSeconds = (
  time1: string,
  time2: string
): number => {
  const date1 = new Date(time1);
  const date2 = new Date(time2);
  const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diffInMilliseconds / 1000);
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return `Today, ${time}`;
  } else {
    const formattedDate = date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${formattedDate}, ${time}`;
  }
};
