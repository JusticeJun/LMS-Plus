import { useEffect, useState } from 'react';
import { loadAcademicCalendar } from '../adapter/calendar';
import { localDateKey, type CalendarEvent, type Feed, type Session } from '../models/home';
import { CardTitle, FeedState } from './HomeUi';
import { Icon } from './Icon';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarCardProps = {
  today: Date;
  initialEvents: Feed<CalendarEvent>;
  sessionStatus: Session['status'];
  useProvidedEvents: boolean;
};

export function CalendarCard({
  today,
  initialEvents,
  sessionStatus,
  useProvidedEvents,
}: CalendarCardProps) {
  const [academicEvents, setAcademicEvents] = useState(initialEvents);
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
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
  const year = month.getFullYear(),
    monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((firstDay + lastDate) / 7) * 7 },
    (_, i) => new Date(year, monthIndex, i - firstDay + 1),
  );
  const dayKey = localDateKey(selected);
  const events = academicEvents.items.filter(
    (event) => event.date <= dayKey && (event.endDate ?? event.date) >= dayKey,
  );
  return (
    <section className="lp-card lp-calendar">
      <div className="lp-card-heading">
        <CardTitle icon="calendar">학사일정</CardTitle>
        <div className="lp-month">
          <button
            className="lp-icon-button"
            aria-label="이전 달"
            onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
          >
            <Icon name="chevron" className="lp-rotate" />
          </button>
          <strong aria-live="polite">
            {year}년 {monthIndex + 1}월
          </strong>
          <button
            className="lp-icon-button"
            aria-label="다음 달"
            onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
          >
            <Icon name="chevron" />
          </button>
        </div>
        <button
          className="lp-outline"
          onClick={() => {
            setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
            setSelected(today);
          }}
        >
          오늘
        </button>
      </div>
      <div className="lp-calendar-body">
        <div className="lp-calendar-grid">
          {WEEKDAYS.map((day, i) => (
            <span
              key={day}
              className={`lp-weekday ${i === 0 ? 'is-sunday' : i === 6 ? 'is-saturday' : ''}`}
            >
              {day}
            </span>
          ))}
          {cells.map((date) => {
            const key = localDateKey(date);
            const hasEvent = academicEvents.items.some(
              (event) => event.date <= key && (event.endDate ?? event.date) >= key,
            );
            return (
              <button
                key={key}
                className={`lp-day ${date.getMonth() !== monthIndex ? 'is-outside' : ''} ${key === dayKey ? 'is-selected' : ''}`}
                aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일${hasEvent ? ', 일정 있음' : ''}`}
                aria-pressed={key === dayKey}
                aria-current={key === localDateKey(today) ? 'date' : undefined}
                onClick={() => {
                  setSelected(date);
                  setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                }}
              >
                <span>{date.getDate()}</span>
                {hasEvent && <i />}
              </button>
            );
          })}
        </div>
        <div className="lp-calendar-detail">
          <strong>
            {selected.getMonth() + 1}월 {selected.getDate()}일 ({WEEKDAYS[selected.getDay()]})
          </strong>
          {events.length ? (
            <ul>
              {events.map((event) => (
                <li key={event.id}>
                  <strong>{event.title}</strong>
                  {event.description && <p>{event.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <FeedState
              status={academicEvents.status}
              icon="calendar"
              title={
                academicEvents.status === 'ready'
                  ? '등록된 일정이 없어요'
                  : '일정을 준비하고 있어요'
              }
              description={
                academicEvents.status === 'ready'
                  ? '다른 날짜를 선택해 보세요.'
                  : '학사일정 연결을 기다리고 있어요.'
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
