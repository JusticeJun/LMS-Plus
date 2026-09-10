import { HomeDialogs } from './HomeDialogs';
import { QuickMenu } from './QuickMenu';
import { NoticesCard } from './NoticesCard';
import { CoursesCard } from './CoursesCard';
import { TodoCard } from './TodoCard';
import { useHomeData } from './useHomeData';
import { useState } from 'react';
import { type Surface } from './types';
import { openCourse } from '../../adapter/courses';
import { login } from '../../adapter/session';
import { localDateKey } from '../../models/calendar';
import { type TodoKind } from '../../models/todo';
import { type HomeData } from '../../models/home';
import { type Notice } from '../../models/notice';
import heroPath from '../../assets/pknu-ocean-hero-v2.png';
import { assetUrl } from '../../assets';
import { CalendarCard } from './CalendarCard';
import { LmsLayout } from '../../components/layout/LmsLayout';
import { UniversityLinks } from './UniversityLinks';
import { HomeResources } from './HomeResources';
const hero = assetUrl(heroPath);
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
// initialData is a test boundary; production reads the adapter.
export function HomePage({
  initialData,
  onRestore,
}: {
  initialData?: HomeData;
  onRestore: () => void;
}) {
  const data = useHomeData(initialData);
  const [query, setQuery] = useState('');
  const [today] = useState(() => new Date());
  const [surface, setSurface] = useState<Surface | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [todoFilter, setTodoFilter] = useState<'전체' | TodoKind>('전체');
  const [noticeFilter, setNoticeFilter] = useState('전체');
  const open = (next: Surface) => {
    setNotice(null);
    setSurface(next);
  };
  const close = () => {
    setSurface(null);
    setNotice(null);
  };
  const goHome = () => {
    close();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const search = query.trim().toLocaleLowerCase();
  const selectNotice = (item: Notice) => {
    setNotice(item);
    setSurface('notices');
  };
  return (
    <LmsLayout
      contentClassName="lp-dashboard"
      header={{
        session: data.session,
        query,
        onQuery: setQuery,
        onMessages: () => open('messages'),
        onNotifications: () => open('notifications'),
        onProfile: () => open('profile'),
        onLogin: login,
        onHome: goHome,
        messageCount:
          data.messages.status === 'ready'
            ? data.messages.items.filter((item) => item.unread).length
            : null,
        notificationCount:
          data.notifications.status === 'ready'
            ? data.notifications.items.filter((item) => item.unread).length
            : null,
      }}
      footer={{ onAbout: () => open('about'), onHelp: () => open('faq'), onRestore }}
      overlays={
        <HomeDialogs
          surface={surface}
          notice={notice}
          data={data}
          search={search}
          noticeFilter={noticeFilter}
          todoFilter={todoFilter}
          setTodoFilter={setTodoFilter}
          setNotice={setNotice}
          selectNotice={selectNotice}
          open={open}
          close={close}
        />
      }
    >
      <section className="lp-hero" aria-label="부경대학교 바다 배너">
        <img
          src={hero}
          alt="바다를 품은, 더 큰 가능성으로. Beyond the Ocean, Toward a Better Tomorrow."
        />
        <time className="lp-hero-date" dateTime={localDateKey(today)}>
          {today.getFullYear()}. {today.getMonth() + 1}. {today.getDate()}. (
          {WEEKDAYS[today.getDay()]})
        </time>
      </section>
      <div className="lp-columns">
        <div className="lp-left">
          <CalendarCard
            today={today}
            initialEvents={data.events}
            sessionStatus={data.session.status}
            useProvidedEvents={Boolean(initialData)}
          />
          <CoursesCard
            data={data}
            search={search}
            onOpenCourse={(id) => {
              onRestore();
              openCourse(id);
            }}
          />
          <NoticesCard
            data={data}
            search={search}
            noticeFilter={noticeFilter}
            setNoticeFilter={setNoticeFilter}
            selectNotice={selectNotice}
            onMore={() => open('notices')}
          />
        </div>
        <aside className="lp-right">
          <TodoCard
            data={data}
            todoFilter={todoFilter}
            setTodoFilter={setTodoFilter}
            onMore={() => open('todos')}
          />
          <QuickMenu onOpen={open} />
          <UniversityLinks />
        </aside>
      </div>
      <HomeResources />
    </LmsLayout>
  );
}
