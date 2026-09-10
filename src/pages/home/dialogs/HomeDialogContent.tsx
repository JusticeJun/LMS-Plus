import type { HomeData } from '../../../models/home';
import type { Surface } from '../types';
import { AboutContent } from './AboutContent';
import { FaqContent } from './FaqContent';
import { InboxContent } from './InboxContent';
import { ProfileContent } from './ProfileContent';
import { CatalogContent } from './CatalogContent';

export function HomeDialogContent({
  surface,
  data,
  onOpen,
  onHome,
}: {
  surface: Exclude<Surface, 'todos' | 'notices'>;
  data: HomeData;
  onOpen: (surface: Surface) => void;
  onHome: () => void;
}) {
  switch (surface) {
    case 'about':
      return <AboutContent />;
    case 'faq':
      return <FaqContent />;
    case 'messages':
    case 'notifications':
      return <InboxContent surface={surface} data={data} />;
    case 'profile':
      return <ProfileContent data={data} onOpen={onOpen} onHome={onHome} />;
    case 'courses':
    case 'ocw':
    case 'programs':
      return <CatalogContent surface={surface} data={data} />;
  }
}
