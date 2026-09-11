export type TodoKind = '과제' | '온라인강의' | '시험' | '팀프로젝트' | '토론' | '설문' | '투표';
export type Todo = {
  id: string;
  title: string;
  course: string;
  kind: TodoKind;
  deadline: string;
  href?: string;
  target?: { courseKey: string; seq: string; category: string };
};
export function sortedTodos(items: Todo[]): Todo[] {
  const time = (value: string) => {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Infinity;
  };
  return [...items].sort((a, b) => time(a.deadline) - time(b.deadline));
}

// LMS deadlines use Korea time. Count calendar days, not rounded 24-hour periods.
export function todoDday(deadline: string, now = new Date()): string | undefined {
  const end = Date.parse(deadline);
  if (!Number.isFinite(end) || !Number.isFinite(now.getTime())) return undefined;
  const koreaDay = (time: number) => Math.floor((time + 9 * 60 * 60 * 1000) / 86_400_000);
  const days = koreaDay(end) - koreaDay(now.getTime());
  return days === 0 ? 'D-day' : days > 0 ? `D-${days}` : `D+${-days}`;
}
