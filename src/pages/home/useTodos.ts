import { useEffect, useState } from 'react';
import { loadTodos } from '../../adapter/todos';
import type { Feed } from '../../models/feed';
import type { Todo } from '../../models/todo';
import type { Session } from '../../models/session';

export function useTodos(status: Session['status'], provided?: Feed<Todo>): Feed<Todo> {
  const [feed, setFeed] = useState<Feed<Todo>>({ status: 'pending', items: [] });
  useEffect(() => {
    if (provided || status !== 'authenticated') return;
    let active = true;
    const controller = new AbortController();
    setFeed({ status: 'loading', items: [] });
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    loadTodos(controller.signal)
      .then((result) => {
        if (active) setFeed(result);
      })
      .catch(() => {
        if (active) setFeed({ status: 'error', items: [] });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [status, provided]);
  return provided ?? (status === 'authenticated' ? feed : { status: 'pending', items: [] });
}
