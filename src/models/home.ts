import type { Course } from '../adapter/lmsAdapter';
export type Feed<T> = { status: 'ready' | 'pending' | 'loading' | 'error'; items: T[] };
export type Session = {
  status: 'guest' | 'authenticated' | 'unknown';
  name: string | null;
  photoUrl?: string;
};
export type TodoKind = '과제' | '온라인강의' | '시험' | '팀프로젝트' | '토론' | '설문' | '투표';
export type Todo = {
  id: string;
  title: string;
  course: string;
  kind: TodoKind;
  deadline: string;
  href?: string;
};
export type Notice = {
  id: string;
  title: string;
  date: string;
  category: string;
  href?: string;
  body?: string;
};
export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  description?: string;
};
export type InboxItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  unread: boolean;
};
export type CatalogItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  href?: string;
};
export type HomeData = {
  session: Session;
  courses: Feed<Course>;
  notices: Feed<Notice>;
  events: Feed<CalendarEvent>;
  todos: Feed<Todo>;
  messages: Feed<InboxItem>;
  notifications: Feed<InboxItem>;
  availableCourses?: Feed<CatalogItem>;
  publicCourses?: Feed<CatalogItem>;
  programs?: Feed<CatalogItem>;
};
export const pendingFeed = <T>(): Feed<T> => ({ status: 'pending', items: [] });
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function sortedTodos(items: Todo[]): Todo[] {
  const time = (value: string) => {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Infinity;
  };
  return [...items].sort((a, b) => time(a.deadline) - time(b.deadline));
}
