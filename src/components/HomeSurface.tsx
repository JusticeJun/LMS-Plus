import { ProfileAvatar } from './ProfileAvatar';
import { LmsLink } from './LmsLink';
import { useState } from 'react';
import type { HomeData } from '../models/home';
import type { Surface } from './LmsHeader';
import { FeedState } from './HomeUi';
import { Icon } from './Icon';
import { login } from '../adapter/lmsAdapter';
import logo from '../assets/pknu-logo.png?inline';

export function HomeSurface({
  surface,
  data,
  onOpen,
  onHome,
}: {
  surface: Surface;
  data: HomeData;
  onOpen: (surface: Surface) => void;
  onHome: () => void;
}) {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const guest = data.session.status === 'guest';
  if (surface === 'about')
    return (
      <div className="lp-about">
        <img src={logo} alt="국립부경대학교" />
        <span className="lp-status-pill">LMS+</span>
        <h3>학습에 더 가까운 일상</h3>
        <p>
          필요한 정보를 찾아다니는 시간을 줄이고,
          <br />
          나의 대학 생활을 한눈에 살펴보세요.
        </p>
        <div className="lp-feature-grid">
          <div>
            <Icon name="calendar" />
            <strong>일정을 한눈에</strong>
            <p>학사일정과 마감일을 가까이</p>
          </div>
          <div>
            <Icon name="book" />
            <strong>강의실을 한곳에</strong>
            <p>수강과목으로 빠르게 이동</p>
          </div>
          <div>
            <Icon name="check" />
            <strong>할 일을 차례대로</strong>
            <p>나의 학습 흐름을 이어가기</p>
          </div>
        </div>
        <p className="lp-muted">
          LMS+는 비공식 확장 프로그램입니다. 학교 계정의 인증과 학습 기록은 Smart-LMS가 관리합니다.
        </p>
      </div>
    );
  if (surface === 'messages' || surface === 'notifications') {
    const feed = surface === 'messages' ? data.messages : data.notifications;
    const items = feed.items.filter((item) => !unreadOnly || item.unread);
    return (
      <>
        <div className="lp-tabs">
          <button
            className={!unreadOnly ? 'is-active' : ''}
            aria-pressed={!unreadOnly}
            onClick={() => setUnreadOnly(false)}
          >
            전체
          </button>
          <button
            className={unreadOnly ? 'is-active' : ''}
            aria-pressed={unreadOnly}
            onClick={() => setUnreadOnly(true)}
          >
            읽지 않음
          </button>
        </div>
        {guest ? (
          <div className="lp-login-state">
            <FeedState
              status="ready"
              icon={surface === 'messages' ? 'mail' : 'bell'}
              title="로그인이 필요해요"
              description="로그인하고 나에게 도착한 소식을 확인해 보세요."
            />
            <button className="lp-primary" onClick={login}>
              로그인하기
            </button>
          </div>
        ) : items.length ? (
          items.map((item) => (
            <article className="lp-inbox-item" key={item.id}>
              <strong>
                {item.unread && <i className="lp-unread-dot" />}
                {item.title}
              </strong>
              <p>{item.description}</p>
              <time>{item.date}</time>
            </article>
          ))
        ) : (
          <FeedState
            status={feed.status}
            icon={surface === 'messages' ? 'mail' : 'bell'}
            title={
              feed.status === 'ready'
                ? '새로운 소식이 없어요'
                : `${surface === 'messages' ? '쪽지함' : '알림함'}을 준비하고 있어요`
            }
            description="나에게 도착한 소식을 이곳에서 확인할 수 있어요."
          />
        )}
      </>
    );
  }
  if (surface === 'profile')
    return (
      <div className="lp-account">
        <ProfileAvatar session={data.session} large />
        <h3>
          {guest
            ? 'LMS+에 오신 것을 환영해요'
            : data.session.status === 'authenticated'
              ? (data.session.name ?? '내 프로필')
              : '계정 정보를 확인하고 있어요'}
        </h3>
        <p>
          {guest
            ? '학교 계정으로 로그인하고 나의 학습을 시작하세요.'
            : data.session.status === 'authenticated'
              ? 'Smart-LMS에 로그인되어 있어요.'
              : '로그인 상태가 확인되면 프로필이 표시됩니다.'}
        </p>
        {guest ? (
          <button className="lp-primary" onClick={login}>
            학교 계정으로 로그인
            <Icon name="login" />
          </button>
        ) : (
          <div className="lp-feature-grid">
            <button onClick={onHome}>
              <Icon name="book" />내 수강과목
            </button>
            <button onClick={() => onOpen('todos')}>
              <Icon name="check" />
              나의 To-do
            </button>
          </div>
        )}
      </div>
    );
  if (surface === 'faq')
    return (
      <div className="lp-faq">
        {[
          [
            'LMS+는 어떤 서비스인가요?',
            '국립부경대학교 Smart-LMS의 사용성을 개선하는 비공식 Chrome 확장 프로그램입니다.',
          ],
          [
            '학교 계정은 어디에서 로그인하나요?',
            '상단 로그인 버튼을 누르면 학교 Smart-LMS의 로그인 화면으로 이동합니다. LMS+는 비밀번호나 세션 쿠키를 별도로 저장하지 않습니다.',
          ],
          [
            '연동 준비 중은 무슨 뜻인가요?',
            '해당 정보의 연결이 아직 완료되지 않았다는 뜻입니다. 일정이나 과제가 없다는 의미는 아닙니다.',
          ],
          [
            '기존 LMS 화면도 사용할 수 있나요?',
            '화면 하단의 원본 LMS 보기를 누르면 기존 화면으로 돌아갈 수 있습니다. 새로고침하면 LMS+ 화면이 다시 적용됩니다.',
          ],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <Icon name="down" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    );
  const feed = (surface === 'courses'
    ? data.availableCourses
    : surface === 'ocw'
      ? data.publicCourses
      : data.programs) ?? { status: 'pending' as const, items: [] };
  const items = feed.items.filter((item) =>
    `${item.title} ${item.subtitle ?? ''} ${item.category ?? ''}`
      .toLocaleLowerCase()
      .includes(catalogQuery.trim().toLocaleLowerCase()),
  );
  return (
    <>
      <label className="lp-catalog-search">
        <Icon name="search" />
        <input
          type="search"
          value={catalogQuery}
          onChange={(event) => setCatalogQuery(event.target.value)}
          placeholder={surface === 'programs' ? '프로그램 검색' : '강의명으로 검색'}
          aria-label={surface === 'programs' ? '프로그램 검색' : '강의 검색'}
        />
      </label>
      {items.length ? (
        <div className="lp-catalog-list">
          {items.map((item) => (
            <article key={item.id}>
              <div className="lp-catalog-heading">
                <Icon name={surface === 'programs' ? 'file' : 'book'} />
                <h3>{item.title}</h3>
                {item.category && <span className="lp-soft-pill">{item.category}</span>}
              </div>
              {item.subtitle && <p>{item.subtitle}</p>}
              {item.description && <p>{item.description}</p>}
              {item.href && (
                <LmsLink className="lp-text-button" href={item.href}>
                  자세히 보기
                  <Icon name="chevron" />
                </LmsLink>
              )}
            </article>
          ))}
        </div>
      ) : (
        <FeedState
          status={feed.status}
          icon={surface === 'programs' ? 'file' : 'book'}
          title={
            catalogQuery
              ? '검색 결과가 없어요'
              : feed.status === 'ready'
                ? '등록된 항목이 없어요'
                : surface === 'courses'
                  ? '새로운 배움을 찾아보세요'
                  : surface === 'ocw'
                    ? '누구에게나 열린 배움'
                    : '강의실 밖으로 넓어지는 경험'
          }
          description={
            catalogQuery
              ? '다른 검색어로 찾아보세요.'
              : feed.status === 'ready'
                ? '새로운 항목이 등록되면 표시됩니다.'
                : '정보가 연결되면 이곳에서 검색하고 확인할 수 있어요.'
          }
        />
      )}
    </>
  );
}
