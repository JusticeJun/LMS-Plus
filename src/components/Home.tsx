import { useEffect, useState } from 'react';
import { type Surface } from './LmsHeader';
import { CardTitle, Dialog, FeedState } from './HomeUi';
import { Icon } from './Icon';
import { HomeSurface } from './HomeSurface';
import { getHomeData, observeHome, openCourse, login } from '../adapter/lmsAdapter';
import {
  localDateKey,
  sortedTodos,
  type HomeData,
  type Notice,
  type TodoKind,
} from '../models/home';
import heroPath from '../assets/pknu-ocean-hero-v2.png';
import { assetUrl } from '../assets';
import { LmsLink } from './LmsLink';
import { CalendarCard } from './CalendarCard';
import { LmsLayout } from './LmsLayout';
import { UniversityLinks } from './UniversityLinks';
import { HomeResources } from './HomeResources';
const hero = assetUrl(heroPath);
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const TODO_FILTERS = [
  '전체',
  '과제',
  '온라인강의',
  '시험',
  '팀프로젝트',
  '토론',
  '설문',
  '투표',
] as const;
const TITLES: Record<Surface, string> = {
  about: 'LMS+ 소개',
  ocw: 'OCW · 열린 강의',
  messages: '쪽지',
  notifications: '알림',
  profile: '내 프로필',
  courses: '개설과목',
  faq: '자주 묻는 질문',
  notices: '공지사항',
  todos: '전체 To-do',
  programs: '비교과 프로그램',
};
const dateLabel = (date: string) => {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(value);
};

// initialData is a test boundary; production reads the adapter.
export function Home({ initialData }: { initialData?: HomeData } = {}) {
  const [data, setData] = useState(() => initialData ?? getHomeData());
  const [query, setQuery] = useState('');
  const [today] = useState(() => new Date());
  const [surface, setSurface] = useState<Surface | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [todoFilter, setTodoFilter] = useState<'전체' | TodoKind>('전체');
  const [noticeFilter, setNoticeFilter] = useState('전체');
  useEffect(() => (initialData ? undefined : observeHome(setData)), [initialData]);
  useEffect(() => {
    if (initialData) return;
    document.body.classList.add('lms-plus-home-page');
    return () => document.body.classList.remove('lms-plus-home-page');
  }, [initialData]);
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
  const courses = data.courses.items.filter((course) =>
    course.name.toLocaleLowerCase().includes(search),
  );
  const notices = data.notices.items.filter(
    (item) =>
      item.title.toLocaleLowerCase().includes(search) &&
      (noticeFilter === '전체' || item.category === noticeFilter),
  );
  const categories = ['전체', ...new Set(data.notices.items.map((item) => item.category))];
  const todos = sortedTodos(data.todos.items).filter(
    (item) => todoFilter === '전체' || item.kind === todoFilter,
  );
  const guest = data.session.status === 'guest';
  const todoTabs = (
    <div className="lp-tabs lp-todo-tabs" aria-label="학습 항목 유형">
      {TODO_FILTERS.map((kind) => (
        <button
          key={kind}
          className={todoFilter === kind ? 'is-active' : ''}
          aria-pressed={todoFilter === kind}
          onClick={() => setTodoFilter(kind)}
        >
          {kind}
          {data.todos.status === 'ready' && (
            <span>
              {data.todos.items.filter((item) => kind === '전체' || item.kind === kind).length}
            </span>
          )}
        </button>
      ))}
    </div>
  );
  const todoList = (
    <>
      {guest ? (
        <div className="lp-login-state">
          <FeedState
            status="ready"
            icon="check"
            title="오늘의 할 일을 한눈에"
            description="로그인하면 나의 학습 항목을 확인할 수 있어요."
          />
          <button className="lp-primary" onClick={login}>
            로그인하기
            <Icon name="arrow" />
          </button>
        </div>
      ) : todos.length ? (
        <div className="lp-todo-list">
          {todos.map((item) => (
            <div key={item.id} className="lp-todo-row">
              <span
                className={`lp-kind ${item.kind === '시험' ? 'is-exam' : item.kind === '온라인강의' ? 'is-lecture' : ''}`}
              >
                {item.kind}
              </span>
              <div>
                <strong>
                  {item.href ? <LmsLink href={item.href}>{item.title}</LmsLink> : item.title}
                </strong>
                <p>{item.course}</p>
                <time dateTime={item.deadline}>{dateLabel(item.deadline)}</time>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <FeedState
          status={data.todos.status}
          icon="check"
          title={
            data.todos.status === 'ready' ? '남은 학습 항목이 없어요' : '나의 학습 일정이 모이는 곳'
          }
          description={
            data.todos.status === 'ready'
              ? '선택한 유형의 미완료 항목이 없습니다.'
              : '과제부터 온라인강의까지, 마감일 순으로 정리해 드릴게요.'
          }
        />
      )}
    </>
  );
  const noticeList = (all = false) => (
    <>
      {notices.length ? (
        <div className="lp-notice-list">
          {notices.slice(0, all ? undefined : 5).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setNotice(item);
                setSurface('notices');
              }}
            >
              <span className="lp-notice-dot" />
              <span>{item.title}</span>
              <time>{item.date}</time>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
      ) : (
        <FeedState
          status={data.notices.status}
          icon="megaphone"
          title={
            search
              ? '검색 결과가 없어요'
              : data.notices.status === 'ready'
                ? '등록된 공지사항이 없어요'
                : '학교의 새로운 소식을 기다리고 있어요'
          }
          description={
            search
              ? '다른 검색어로 찾아보세요.'
              : '공지사항이 연결되면 이곳에서 바로 확인할 수 있어요.'
          }
        />
      )}
    </>
  );
  return (
    <LmsLayout
      contentClassName="lp-dashboard"
      header={{
        session: data.session,
        query,
        onQuery: setQuery,
        onOpen: open,
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
      footer={{ onAbout: () => open('about'), onHelp: () => open('faq') }}
      overlays={
        surface && (
          <Dialog title={notice ? notice.title : TITLES[surface]} onClose={close}>
            {surface === 'todos' ? (
              <>
                {todoTabs}
                {todoList}
              </>
            ) : surface === 'notices' ? (
              notice ? (
                <article className="lp-notice-detail">
                  <button className="lp-text-button" onClick={() => setNotice(null)}>
                    <Icon name="chevron" className="lp-rotate" />
                    목록으로
                  </button>
                  <p className="lp-muted">
                    {notice.category} · {notice.date}
                  </p>
                  {notice.body ? (
                    <p>{notice.body}</p>
                  ) : (
                    <FeedState
                      status="pending"
                      icon="file"
                      title="공지 본문 연결을 준비하고 있어요"
                      description="제목과 게시일은 현재 LMS의 실제 정보입니다."
                    />
                  )}
                  {notice.href && (
                    <LmsLink className="lp-outline" href={notice.href}>
                      공지 본문 열기
                      <Icon name="external" />
                    </LmsLink>
                  )}
                </article>
              ) : (
                <>{noticeList(true)}</>
              )
            ) : (
              <HomeSurface
                key={surface}
                surface={surface}
                data={data}
                onOpen={open}
                onHome={() => {
                  close();
                  document
                    .getElementById('lp-courses')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            )}
          </Dialog>
        )
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
          <section className="lp-card lp-courses" id="lp-courses">
            <div className="lp-card-heading">
              <CardTitle icon="book">내 수강과목</CardTitle>
              {data.courses.status === 'ready' && (
                <span className="lp-soft-pill">{data.courses.items.length}개 과목</span>
              )}
            </div>
            {guest ? (
              <div className="lp-login-state">
                <FeedState
                  status="ready"
                  icon="book"
                  title="나의 강의실, 더 가까이"
                  description="로그인하고 이번 학기 수강과목을 만나보세요."
                />
                <button className="lp-primary" onClick={login}>
                  로그인하기
                  <Icon name="arrow" />
                </button>
              </div>
            ) : courses.length ? (
              <div className="lp-course-list">
                {courses.map((course, index) => (
                  <button
                    className="lp-course-row"
                    key={`${course.courseId}-${index}`}
                    onClick={() => openCourse(course.courseId)}
                  >
                    <strong>{course.name}</strong>
                    <span>
                      {[course.campus, course.section && `${course.section} 분반`]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <Icon name="chevron" />
                  </button>
                ))}
              </div>
            ) : (
              <FeedState
                status={data.courses.status}
                icon="book"
                title={
                  search
                    ? '검색 결과가 없어요'
                    : data.courses.status === 'ready'
                      ? '수강과목이 없어요'
                      : '수강과목을 준비하고 있어요'
                }
                description={
                  search
                    ? '과목 이름을 다시 확인해 주세요.'
                    : data.courses.status === 'ready'
                      ? '현재 등록된 수강과목이 없습니다.'
                      : '나의 강의실을 이곳에 모아 보여드릴게요.'
                }
              />
            )}
          </section>
          <section className="lp-card lp-notices">
            <div className="lp-card-heading">
              <CardTitle icon="megaphone">공지사항</CardTitle>
              <button className="lp-text-button" onClick={() => open('notices')}>
                더보기
                <Icon name="chevron" />
              </button>
            </div>
            <div className="lp-tabs" aria-label="공지 유형">
              {categories.map((category) => (
                <button
                  key={category}
                  className={noticeFilter === category ? 'is-active' : ''}
                  aria-pressed={noticeFilter === category}
                  onClick={() => setNoticeFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            {noticeList()}
          </section>
        </div>
        <aside className="lp-right">
          <section className="lp-card lp-todo">
            <div className="lp-card-heading">
              <CardTitle icon="check">To-do</CardTitle>
              <button className="lp-text-button" onClick={() => open('todos')}>
                전체보기
                <Icon name="chevron" />
              </button>
            </div>
            {todoTabs}
            {todoList}
          </section>
          <section className="lp-card lp-quick">
            <div className="lp-card-heading">
              <CardTitle icon="grid">Quick Menu</CardTitle>
            </div>
            <div className="lp-quick-grid">
              <button onClick={() => open('profile')}>
                <Icon name="user" />
                <strong>마이페이지</strong>
                <span>내 학습 정보</span>
              </button>
              <button onClick={() => open('courses')}>
                <Icon name="book" />
                <strong>개설과목</strong>
                <span>강의 찾아보기</span>
              </button>
              <button onClick={() => open('faq')}>
                <Icon name="help" />
                <strong>FAQ</strong>
                <span>자주 묻는 질문</span>
              </button>
            </div>
          </section>
          <UniversityLinks />
        </aside>
      </div>
      <HomeResources />
    </LmsLayout>
  );
}
