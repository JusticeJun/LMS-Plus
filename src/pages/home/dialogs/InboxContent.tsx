import { useState } from 'react';
import type { HomeData } from '../../../models/home';
import { FeedState } from '../../../components/ui/FeedState';
import { login } from '../../../adapter/session';

export function InboxContent({
  surface,
  data,
}: {
  surface: 'messages' | 'notifications';
  data: HomeData;
}) {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const guest = data.session.status === 'guest';

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
