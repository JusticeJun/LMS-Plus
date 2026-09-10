import { FeedState } from '../../components/ui/FeedState';
import { Icon } from '../../components/ui/Icon';
import { LmsLink } from '../../components/ui/LmsLink';
import type { HomeData } from '../../models/home';
import { Dialog } from '../../components/ui/Dialog';
import type { Notice } from '../../models/notice';
import type { TodoKind } from '../../models/todo';
import type { Surface } from './types';
import { HomeDialogContent } from './dialogs/HomeDialogContent';
import { TodoList } from './TodoList';
import { NoticeList } from './NoticeList';
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

export function HomeDialogs({
  surface,
  notice,
  data,
  search,
  noticeFilter,
  todoFilter,
  setTodoFilter,
  setNotice,
  selectNotice,
  open,
  close,
}: {
  surface: Surface | null;
  notice: Notice | null;
  data: HomeData;
  search: string;
  noticeFilter: string;
  todoFilter: '전체' | TodoKind;
  setTodoFilter: (filter: '전체' | TodoKind) => void;
  setNotice: (notice: Notice | null) => void;
  selectNotice: (notice: Notice) => void;
  open: (surface: Surface) => void;
  close: () => void;
}) {
  return (
    surface && (
      <Dialog title={notice ? notice.title : TITLES[surface]} onClose={close}>
        {surface === 'todos' ? (
          <>
            <TodoList data={data} filter={todoFilter} onFilter={setTodoFilter} />
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
            <>
              <NoticeList
                data={data}
                search={search}
                noticeFilter={noticeFilter}
                onSelect={selectNotice}
                all
              />
            </>
          )
        ) : (
          <HomeDialogContent
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
  );
}
