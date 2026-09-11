import type { ReactNode } from 'react';
import { safeLmsHref } from '../../adapter/urls';
export function LmsLink({
  href,
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const safe = safeLmsHref(href);
  return safe ? (
    <a href={safe} className={className}>
      {children}
    </a>
  ) : (
    <span className={className}>{children}</span>
  );
}
