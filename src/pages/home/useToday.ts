import { useEffect, useState } from 'react';
import { localDateKey } from '../../models/calendar';

export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    let timeout: number;
    const refresh = () => {
      window.clearTimeout(timeout);
      const now = new Date();
      setToday((previous) => (localDateKey(previous) === localDateKey(now) ? previous : now));
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timeout = window.setTimeout(refresh, midnight.getTime() - now.getTime());
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return today;
}
