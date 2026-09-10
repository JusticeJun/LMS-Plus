import { useEffect, useRef, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import type { Feed } from '../models/home';

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

export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="lp-dialog"
      aria-labelledby="lp-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="lp-dialog-header">
        <h2 id="lp-dialog-title">{title}</h2>
        <button className="lp-icon-button" aria-label="닫기" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <div className="lp-dialog-body">{children}</div>
    </dialog>
  );
}
export function CardTitle({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className="lp-card-title">
      <Icon name={icon} />
      <h2>{children}</h2>
    </div>
  );
}
