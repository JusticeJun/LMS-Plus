import { useEffect, useState } from 'react';
import { loadAcademicCalendar } from '../../adapter/calendar';
import type { CalendarEvent } from '../../models/calendar';
import type { Feed } from '../../models/feed';
import type { Session } from '../../models/session';

export function useAcademicCalendar(
  month: Date,
  sessionStatus: Session['status'],
  initialEvents: Feed<CalendarEvent>,
  useProvidedEvents: boolean,
): Feed<CalendarEvent> {
  const [academicEvents, setAcademicEvents] = useState(initialEvents);
  useEffect(() => {
    if (useProvidedEvents) return;
    const controller = new AbortController();
    let active = true;
    setAcademicEvents({ status: 'loading', items: [] });
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    loadAcademicCalendar(month, controller.signal)
      .then((result) => {
        if (active) setAcademicEvents(result);
      })
      .catch(() => {
        if (active) setAcademicEvents({ status: 'error', items: [] });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [month, sessionStatus, useProvidedEvents]);
  return academicEvents;
}
