export type TodoKind = '과제' | '온라인강의' | '시험' | '팀프로젝트' | '토론' | '설문' | '투표';
export type Todo = {
  id: string;
  title: string;
  course: string;
  kind: TodoKind;
  deadline: string;
  href?: string;
};
export function sortedTodos(items: Todo[]): Todo[] {
  const time = (value: string) => {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : Infinity;
  };
  return [...items].sort((a, b) => time(a.deadline) - time(b.deadline));
}
