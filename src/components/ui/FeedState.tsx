import { Icon, type IconName } from './Icon';
import type { Feed } from '../../models/feed';
export function FeedState({
  status,
  icon,
  title,
  description,
}: {
  status: Feed<unknown>['status'];
  icon: IconName;
  title?: string;
  description?: string;
}) {
  if (status === 'loading')
    return (
      <div className="lp-loading" role="status" aria-label="불러오는 중">
        <span />
        <span />
        <span />
        <p>불러오는 중이에요</p>
      </div>
    );
  return (
    <div className="lp-empty" role="status">
      <span className="lp-empty-icon">
        <Icon name={status === 'error' ? 'info' : icon} />
      </span>
      <strong>
        {status === 'error'
          ? '정보를 불러오지 못했어요'
          : (title ??
            (status === 'ready' ? '표시할 항목이 없어요' : '곧 이곳에서 확인할 수 있어요'))}
      </strong>
      <p>
        {description ??
          (status === 'error'
            ? '잠시 후 페이지를 새로고침해 주세요.'
            : status === 'ready'
              ? '새로운 항목이 등록되면 표시됩니다.'
              : '정보 연결을 준비하고 있어요.')}
      </p>
      {status === 'pending' && <span className="lp-status-pill">연동 준비 중</span>}
    </div>
  );
}
