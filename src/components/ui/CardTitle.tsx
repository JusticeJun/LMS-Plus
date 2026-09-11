import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
export function CardTitle({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className="lp-card-title">
      <Icon name={icon} />
      <h2>{children}</h2>
    </div>
  );
}
