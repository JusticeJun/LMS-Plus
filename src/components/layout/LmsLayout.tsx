import type { ComponentProps, ReactNode } from 'react';
import { LmsHeader } from './LmsHeader';
import { LmsFooter } from './LmsFooter';
import '../../styles/index.css';

type LmsLayoutProps = {
  header: ComponentProps<typeof LmsHeader>;
  footer: ComponentProps<typeof LmsFooter>;
  children: ReactNode;
  overlays?: ReactNode;
  contentClassName?: string;
};

// Shared page chrome. Pages supply content and actions without duplicating the shell.
export function LmsLayout({
  header,
  footer,
  children,
  overlays,
  contentClassName,
}: LmsLayoutProps) {
  return (
    <div className="lp-shell">
      <a className="lp-skip" href="#lp-main">
        본문으로 건너뛰기
      </a>
      <LmsHeader {...header} />
      <main id="lp-main" className={contentClassName}>
        {children}
      </main>
      <LmsFooter {...footer} />
      {overlays}
    </div>
  );
}
