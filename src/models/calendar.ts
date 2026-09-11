export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  description?: string;
};
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
