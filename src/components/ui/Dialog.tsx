import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
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
