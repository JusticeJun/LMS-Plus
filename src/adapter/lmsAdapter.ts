import { getProfileImageUrl } from './profile';
import { safeLmsHref } from './links';
export type Course = {
  courseId: string;
  name: string;
  campus: string | null;
  section: string | null;
};

export function getCourses(): Course[] {
  return [...document.querySelectorAll<HTMLElement>('#wrap em.sub_open[kj]')]
    .map((element) => {
      const courseId = element.getAttribute('kj');

      if (!courseId) {
        return null;
      }

      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();

      const match = text.match(/^\[(.+?)\](.+?)\s*\(([^)]+)\)$/);

      return {
        courseId,
        name: match?.[2]?.trim() ?? text,
        campus: match?.[1]?.trim() ?? null,
        section: match?.[3]?.trim() ?? null,
      };
    })
    .filter((course): course is Course => course !== null);
}

// Reuse the original node and its registered LMS handlers; never invent a route.
export function openCourse(courseId: string): void {
  const course = [...document.querySelectorAll<HTMLElement>('#wrap em.sub_open[kj]')].find(
    (element) => element.getAttribute('kj') === courseId,
  );
  showOriginalLms();
  course?.click();
}

export function showOriginalLms(): void {
  if (!document.getElementById('wrap')) return;
  document.body.classList.remove('lms-plus-home-page');
  const root = document.getElementById('lms-plus-root');
  if (root) {
    root.hidden = true;
    root.dispatchEvent(new Event('lms-plus:restore'));
  }
  const target = document.getElementById('wrap');
  target?.scrollIntoView({ block: 'start' });
}

// Verified public header and notice markup, inspected 2026-09-09.
// Absence of a login button alone is never proof of authentication.
export function getSession(): import('../models/home').Session {
  if (document.querySelector('#header li.header_login.login-btn-color'))
    return { status: 'guest', name: null };
  const user = document.querySelector('#header #user');
  if (user || document.querySelector('#header .header_logout') || getCourses().length > 0) {
    return {
      status: 'authenticated',
      photoUrl: getProfileImageUrl(),
      name: user?.textContent?.replace(/\s+/g, ' ').trim() || null,
    };
  }
  return { status: 'unknown', name: null };
}

export function login(): void {
  window.location.assign('https://lms.pknu.ac.kr/ilos/main/member/login_form.acl');
}

export function getNotices(): import('../models/home').Feed<import('../models/home').Notice> {
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>(
      '#contentsIndex .index-leftarea02 a.site-link[href*="/ilos/community/notice_view_form.acl?"]',
    ),
  ];
  const seen = new Set<string>();
  const items = links.flatMap((link) => {
    const href = safeLmsHref(link.getAttribute('href') ?? undefined);
    if (!href || new URL(href).pathname !== '/ilos/community/notice_view_form.acl') return [];
    const title = link.textContent?.replace(/\s+/g, ' ').trim();
    if (!href || !title || seen.has(href)) return [];
    seen.add(href);
    return [
      {
        id: href,
        title,
        href,
        category: title.match(/^\[([^\]]+)\]/)?.[1] ?? '일반',
        date: link.closest('li')?.querySelector('.date')?.textContent?.trim() ?? '',
      },
    ];
  });
  return { status: items.length ? 'ready' : 'pending', items };
}

export function getHomeData(): import('../models/home').HomeData {
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

export function observeHome(
  onChange: (data: import('../models/home').HomeData) => void,
): () => void {
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
