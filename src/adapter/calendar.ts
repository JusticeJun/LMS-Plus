import type { CalendarEvent } from '../models/calendar';
import type { Feed } from '../models/feed';

function normalizedDate(value: string): string | undefined {
  const match = value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  )
    return undefined;
  return `${year}-${month}-${day}`;
}

export function parseAcademicCalendar(html: string): Feed<CalendarEvent> {
  // Detached template content is inert: never attach server markup or run scripts.
  const template = document.createElement('template');
  template.innerHTML = html;
  const list = template.content.querySelector('#shedule_list_form .schedule_view_list_form');
  if (!list) return { status: 'error', items: [] };
  const items: CalendarEvent[] = [];
  for (const heading of list.querySelectorAll('.schedule-show-control.schedule_view_list_box')) {
    if (!heading.querySelector('img[alt="학사일정"]')) continue;
    const title = heading.querySelector('div > span')?.textContent?.trim();
    const detail = heading.nextElementSibling;
    const range = detail?.matches('.schedule_view_detail_box')
      ? detail
          .querySelector('.schedule_view_txt')
          ?.textContent?.trim()
          .split(/\s*~\s*/)
      : undefined;
    const date = range?.[0] && normalizedDate(range[0]);
    const endDate = range?.[1] ? normalizedDate(range[1]) : date;
    if (!title || !date || !endDate || endDate < date || (range?.length ?? 0) > 2)
      return { status: 'error', items: [] };
    items.push({ id: `${date}:${endDate}:${title}`, title, date, endDate });
  }
  return { status: 'ready', items };
}

export async function loadAcademicCalendar(
  month: Date,
  signal: AbortSignal,
): Promise<Feed<CalendarEvent>> {
  if (window.location.origin !== 'https://lms.pknu.ac.kr') return { status: 'error', items: [] };
  const year = String(month.getFullYear());
  const number = String(month.getMonth() + 1).padStart(2, '0');
  // Verified read-only request from LMS main_calendar.js. No setting/write endpoint.
  const response = await fetch('/ilos/main/main_schedule_list.acl', {
    method: 'POST',
    credentials: 'same-origin',
    redirect: 'error',
    cache: 'no-store',
    signal,
    body: new URLSearchParams({
      year,
      month: number,
      day: '01',
      viewDt: year + number,
      encoding: 'utf-8',
    }),
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html'))
    return { status: 'error', items: [] };
  const html = await response.text();
  if (html.length > 2_000_000) return { status: 'error', items: [] };
  return parseAcademicCalendar(html);
}
