import { LmsLink } from '../../../components/ui/LmsLink';
import { useState } from 'react';
import type { HomeData } from '../../../models/home';
import { FeedState } from '../../../components/ui/FeedState';
import { Icon } from '../../../components/ui/Icon';

export function CatalogContent({
  surface,
  data,
}: {
  surface: 'courses' | 'ocw' | 'programs';
  data: HomeData;
}) {
  const [catalogQuery, setCatalogQuery] = useState('');
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
