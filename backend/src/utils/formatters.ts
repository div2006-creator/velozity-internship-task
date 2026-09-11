export function formatStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    COMPLETED: 'Completed',
    BLOCKED: 'Blocked',
    PLANNING: 'Planning',
    ON_HOLD: 'On Hold',
    CANCELLED: 'Cancelled',
  };

  return statusMap[status] || status;
}

export function formatActivityFeedWording(
  userName: string,
  taskTitle: string,
  oldStatus: string,
  newStatus: string
): string {
  const oldFormatted = formatStatusLabel(oldStatus);
  const newFormatted = formatStatusLabel(newStatus);
  return `${userName} moved ${taskTitle} from ${oldFormatted} → ${newFormatted}`;
}
