import { useEffect, useState } from 'react';
import { getHomeData, observeHome } from '../../adapter/home';
import type { HomeData } from '../../models/home';

// Tests may supply data; the extension observes the original LMS document.
export function useHomeData(initialData?: HomeData): HomeData {
  const [data, setData] = useState(() => initialData ?? getHomeData());
  useEffect(() => (initialData ? undefined : observeHome(setData)), [initialData]);
  return data;
}
