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
  const onImageLoad = (event: Event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.matches('#header img#user_photo, #header #user_photo img')
    )
      update();
  };
  observer.observe(source, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['kj', 'class', 'href', 'src', 'srcset', 'sizes', 'media'],
  });
  // currentSrc changes after resource selection without changing the src attribute.
  source.addEventListener('load', onImageLoad, true);
  update();
  return () => {
    observer.disconnect();
    source.removeEventListener('load', onImageLoad, true);
  };
}
