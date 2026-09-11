import { useEffect, useState } from 'react';
import { getHomeData, observeHome } from '../../adapter/home';
import type { HomeData } from '../../models/home';
import { useTodos } from './useTodos';

// Tests may supply data; the extension observes the original LMS document.
export function useHomeData(initialData?: HomeData): HomeData {
  const [data, setData] = useState(() => initialData ?? getHomeData());
  useEffect(() => (initialData ? undefined : observeHome(setData)), [initialData]);
  const todos = useTodos(data.session.status, initialData?.todos);
  return { ...data, todos };
}
