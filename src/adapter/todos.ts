import type { Feed } from '../models/feed';
import type { Todo, TodoKind } from '../models/todo';

const kinds: Record<string, TodoKind> = {
  lecture_weeks: '온라인강의',
  report: '과제',
  project: '팀프로젝트',
  discuss: '토론',
  test: '시험',
  survey: '설문',
  clicker: '투표',
};
const origin = 'https://lms.pknu.ac.kr';
const validTarget = (target: NonNullable<Todo['target']>) =>
  /^A\d+$/.test(target.courseKey) &&
  /^\d+$/.test(target.seq) &&
  Object.prototype.hasOwnProperty.call(kinds, target.category);

export function parseTodos(html: string): Feed<Todo> {
  const template = document.createElement('template');
  template.innerHTML = html;
  const source = template.content;
  const rows = [...source.querySelectorAll('.todo_wrap:not(.no_data)')];
  const error: Feed<Todo> = { status: 'error', items: [] };
  if (!rows.length && !source.querySelector('#no_data.todo_wrap.no_data')) return error;
  const items: Todo[] = [];
  for (const row of rows) {
    const action = row
      .getAttribute('onclick')
      ?.match(/^\s*goLecture\(\s*'([A-Za-z0-9]+)'\s*,\s*'(\d+)'\s*,\s*'([a-z_]+)'\s*\)\s*;?\s*$/);
    if (!action) return error;
    const target = { courseKey: action[1], seq: action[2], category: action[3] };
    if (!validTarget(target)) return error;
    const text = (selector: string) =>
      row.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
    const title = text('.todo_title');
    const course = text('.todo_subjt');
    const date = text('span.todo_date')?.match(/^(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2})$/);
    if (!title || !course || !date) return error;
    const [, year, month, day, hour, minute] = date;
    const check = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute));
    if (
      check.getUTCFullYear() !== +year ||
      check.getUTCMonth() !== +month - 1 ||
      check.getUTCDate() !== +day ||
      check.getUTCHours() !== +hour ||
      check.getUTCMinutes() !== +minute
    )
      return error;
    const id = `${target.courseKey}:${target.category}:${target.seq}`;
    if (items.some((item) => item.id === id)) return error;
    items.push({
      id,
      title,
      course,
      kind: kinds[target.category],
      deadline: `${year}-${month}-${day}T${hour}:${minute}:00+09:00`,
      target,
    });
  }
  return { status: 'ready', items };
}

export async function loadTodos(signal: AbortSignal): Promise<Feed<Todo>> {
  if (window.location.origin !== origin) return { status: 'error', items: [] };
  // Verified todoList() read request: empty course selection means all courses.
  const response = await fetch('/ilos/mp/todo_list.acl', {
    method: 'POST',
    credentials: 'same-origin',
    redirect: 'error',
    cache: 'no-store',
    signal,
    body: new URLSearchParams({ todoKjList: '', chk_cate: 'ALL', encoding: 'utf-8' }),
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html'))
    return { status: 'error', items: [] };
  const html = await response.text();
  return html.length > 2_000_000 ? { status: 'error', items: [] } : parseTodos(html);
}

export async function openTodo(
  target: NonNullable<Todo['target']>,
  signal: AbortSignal,
): Promise<void> {
  if (window.location.origin !== origin || !validTarget(target)) throw new Error('Invalid target');
  // Preserve the original goLecture permission check before navigation.
  const response = await fetch('/ilos/lo/st_room_auth_check2.acl', {
    method: 'POST',
    credentials: 'same-origin',
    redirect: 'error',
    cache: 'no-store',
    signal,
    body: new URLSearchParams({ returnData: 'json', ky: target.courseKey, encoding: 'utf-8' }),
  });
  if (!response.ok) throw new Error('Access check failed');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('isError' in data) || data.isError !== false)
    throw new Error('Access not confirmed');
  signal.throwIfAborted();
  window.location.assign(
    `${origin}/ilos/mp/todo_list_connect.acl?${new URLSearchParams({
      SEQ: target.seq,
      gubun: target.category,
      KJKEY: target.courseKey,
    })}`,
  );
}
