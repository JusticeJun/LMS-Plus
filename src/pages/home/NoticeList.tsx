import { FeedState } from '../../components/ui/FeedState';
import { Icon } from '../../components/ui/Icon';
import type { HomeData } from '../../models/home';
import type { Notice } from '../../models/notice';
export function NoticeList({
  data,
  search,
  noticeFilter,
  onSelect,
  all = false,
}: {
  data: Pick<HomeData, 'notices'>;
  search: string;
  noticeFilter: string;
  onSelect: (notice: Notice) => void;
  all?: boolean;
}) {
  const notices = data.notices.items.filter(
    (item) =>
      item.title.toLocaleLowerCase().includes(search) &&
      (noticeFilter === '전체' || item.category === noticeFilter),
  );
  return (
    <>
      {notices.length ? (
        <div className="lp-notice-list">
          {notices.slice(0, all ? undefined : 5).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
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
}
