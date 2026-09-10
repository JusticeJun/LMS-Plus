import { FeedState } from '../../components/ui/FeedState';
import { Icon } from '../../components/ui/Icon';
import { LmsLink } from '../../components/ui/LmsLink';
import { login } from '../../adapter/session';
import type { HomeData } from '../../models/home';
import { sortedTodos, type TodoKind } from '../../models/todo';
const TODO_FILTERS = [
  '전체',
  '과제',
  '온라인강의',
  '시험',
  '팀프로젝트',
  '토론',
  '설문',
  '투표',
] as const;
const dateLabel = (date: string) => {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(value);
};

export function TodoList({
  data,
  filter,
  onFilter,
}: {
  data: Pick<HomeData, 'session' | 'todos'>;
  filter: '전체' | TodoKind;
  onFilter: (filter: '전체' | TodoKind) => void;
}) {
  const todos = sortedTodos(data.todos.items).filter(
    (item) => filter === '전체' || item.kind === filter,
  );
  const guest = data.session.status === 'guest';
  const todoTabs = (
    <div className="lp-tabs lp-todo-tabs" aria-label="학습 항목 유형">
      {TODO_FILTERS.map((kind) => (
        <button
          key={kind}
          className={filter === kind ? 'is-active' : ''}
          aria-pressed={filter === kind}
          onClick={() => onFilter(kind)}
        >
          {kind}
          {data.todos.status === 'ready' && (
            <span>
              {data.todos.items.filter((item) => kind === '전체' || item.kind === kind).length}
            </span>
          )}
        </button>
      ))}
    </div>
  );
  const todoList = (
    <>
      {guest ? (
        <div className="lp-login-state">
          <FeedState
            status="ready"
            icon="check"
            title="오늘의 할 일을 한눈에"
            description="로그인하면 나의 학습 항목을 확인할 수 있어요."
          />
          <button className="lp-primary" onClick={login}>
            로그인하기
            <Icon name="arrow" />
          </button>
        </div>
      ) : todos.length ? (
        <div className="lp-todo-list">
          {todos.map((item) => (
            <div key={item.id} className="lp-todo-row">
              <span
                className={`lp-kind ${item.kind === '시험' ? 'is-exam' : item.kind === '온라인강의' ? 'is-lecture' : ''}`}
              >
                {item.kind}
              </span>
              <div>
                <strong>
                  {item.href ? <LmsLink href={item.href}>{item.title}</LmsLink> : item.title}
                </strong>
                <p>{item.course}</p>
                <time dateTime={item.deadline}>{dateLabel(item.deadline)}</time>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <FeedState
          status={data.todos.status}
          icon="check"
          title={
            data.todos.status === 'ready' ? '남은 학습 항목이 없어요' : '나의 학습 일정이 모이는 곳'
          }
          description={
            data.todos.status === 'ready'
              ? '선택한 유형의 미완료 항목이 없습니다.'
              : '과제부터 온라인강의까지, 마감일 순으로 정리해 드릴게요.'
          }
        />
      )}
    </>
  );
  return (
    <>
      {todoTabs}
      {todoList}
    </>
  );
}
