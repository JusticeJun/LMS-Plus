import { CardTitle } from '../../components/ui/CardTitle';
import { Icon } from '../../components/ui/Icon';
import type { HomeData } from '../../models/home';
import { NoticeList } from './NoticeList';
import type { Notice } from '../../models/notice';
export function NoticesCard({
  data,
  search,
  noticeFilter,
  setNoticeFilter,
  selectNotice,
  onMore,
}: {
  data: Pick<HomeData, 'notices'>;
  search: string;
  noticeFilter: string;
  setNoticeFilter: (filter: string) => void;
  selectNotice: (notice: Notice) => void;
  onMore: () => void;
}) {
  const categories = ['전체', ...new Set(data.notices.items.map((item) => item.category))];
  return (
    <section className="lp-card lp-notices">
      <div className="lp-card-heading">
        <CardTitle icon="megaphone">공지사항</CardTitle>
        <button className="lp-text-button" onClick={onMore}>
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
      <NoticeList data={data} search={search} noticeFilter={noticeFilter} onSelect={selectNotice} />
    </section>
  );
}
