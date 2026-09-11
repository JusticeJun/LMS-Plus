import type { Feed } from '../models/feed';
import type { Notice } from '../models/notice';
import { safeLmsHref } from './urls';
export function getNotices(): Feed<Notice> {
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
