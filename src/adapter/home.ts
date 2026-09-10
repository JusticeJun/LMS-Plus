import type { HomeData } from '../models/home';
import { getCourses } from './courses';
import { getNotices } from './notices';
import { getSession } from './session';
export function getHomeData(): HomeData {
  const session = getSession();
  const courses = session.status === 'guest' ? [] : getCourses();
  return {
    session,
    courses: { status: courses.length ? 'ready' : 'pending', items: courses },
    notices: getNotices(),
    events: { status: 'pending', items: [] },
    todos: { status: 'pending', items: [] },
    messages: { status: 'pending', items: [] },
    notifications: { status: 'pending', items: [] },
  };
}

export function observeHome(onChange: (data: HomeData) => void): () => void {
  const source = document.getElementById('wrap');
  if (!source) return () => {};
  let previous = '';
  const update = () => {
    const data = getHomeData();
    const next = JSON.stringify(data);
    if (next !== previous) {
      previous = next;
      onChange(data);
    }
  };
  const observer = new MutationObserver(update);
  observer.observe(source, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['kj', 'class', 'href', 'src'],
  });
  update();
  return () => observer.disconnect();
}
