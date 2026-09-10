import { ProfileAvatar } from './ProfileAvatar';
import type { Session } from '../models/home';
import { Icon } from './Icon';
import logo from '../assets/pknu-logo.png?inline';
import { login } from '../adapter/lmsAdapter';

export type Surface =
  | 'about'
  | 'ocw'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'courses'
  | 'faq'
  | 'notices'
  | 'todos'
  | 'programs';
type Props = {
  session: Session;
  query: string;
  onQuery: (value: string) => void;
  onOpen: (surface: Surface) => void;
  onHome: () => void;
  messageCount: number | null;
  notificationCount: number | null;
};
export function LmsHeader({
  session,
  query,
  onQuery,
  onOpen,
  onHome,
  messageCount,
  notificationCount,
}: Props) {
  return (
    <div className="lp-header-bar">
      <header className="lp-header">
        <button className="lp-brand" onClick={onHome} aria-label="LMS+ 홈">
          <img src={logo} alt="국립부경대학교" />
          <span>
            LMS<span className="lp-plus">+</span>
          </span>
        </button>
        <nav className="lp-nav" aria-label="주 메뉴">
          {['교육현황', '커뮤니티', '소개'].map((label) => (
            <button
              key={label}
              disabled
              title="페이지 연결 준비 중"
              aria-label={`${label} · 페이지 연결 준비 중`}
            >
              {label}
            </button>
          ))}
        </nav>
        <label className="lp-search">
          <Icon name="search" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            aria-label="수강과목 및 공지사항 검색"
            placeholder="수강과목, 공지사항 검색"
          />
        </label>
        <div className="lp-header-actions">
          <button
            className="lp-icon-button"
            aria-label="쪽지"
            title="쪽지"
            onClick={() => onOpen('messages')}
          >
            <Icon name="mail" />
            {messageCount !== null && messageCount > 0 && (
              <span className="lp-badge">{messageCount > 99 ? '99+' : messageCount}</span>
            )}
          </button>
          <button
            className="lp-icon-button"
            aria-label="알림"
            title="알림"
            onClick={() => onOpen('notifications')}
          >
            <Icon name="bell" />
            {notificationCount !== null && notificationCount > 0 && (
              <span className="lp-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
            )}
          </button>
          {session.status === 'guest' ? (
            <button className="lp-login" onClick={login}>
              <Icon name="login" />
              로그인
            </button>
          ) : (
            <button
              className="lp-profile"
              onClick={() => onOpen('profile')}
              aria-label={session.status === 'authenticated' ? '프로필' : '로그인 상태 확인'}
            >
              <ProfileAvatar session={session} />
              <span>
                {session.status === 'authenticated' ? (session.name ?? '내 프로필') : '계정'}
              </span>
              <Icon name="down" />
            </button>
          )}
        </div>
      </header>
    </div>
  );
}
