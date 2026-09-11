import { CardTitle } from '../../components/ui/CardTitle';
import { Icon } from '../../components/ui/Icon';
import type { HomeData } from '../../models/home';
import { TodoList } from './TodoList';
import type { TodoKind } from '../../models/todo';
export function TodoCard({
  data,
  todoFilter,
  setTodoFilter,
  onMore,
}: {
  data: Pick<HomeData, 'session' | 'todos'>;
  todoFilter: '전체' | TodoKind;
  setTodoFilter: (filter: '전체' | TodoKind) => void;
  onMore: () => void;
}) {
  return (
    <section className="lp-card lp-todo">
      <div className="lp-card-heading">
        <CardTitle icon="check">To-do</CardTitle>
        <button className="lp-text-button" onClick={onMore}>
          전체보기
          <Icon name="chevron" />
        </button>
      </div>
      <TodoList data={data} filter={todoFilter} onFilter={setTodoFilter} />
    </section>
  );
}
