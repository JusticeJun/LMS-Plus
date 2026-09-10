import { createRoot } from 'react-dom/client';
import { detectPage } from './page';
import { Home } from '../components/Home';
import { showOriginalLms } from '../adapter/lmsAdapter';

if (
  detectPage() === 'home' &&
  document.querySelector('#wrap #contentsIndex') &&
  !document.getElementById('lms-plus-root')
) {
  const element = document.createElement('div');
  element.id = 'lms-plus-root';
  document.body.prepend(element);
  try {
    const root = createRoot(element, { onUncaughtError: () => showOriginalLms() });
    element.addEventListener(
      'lms-plus:restore',
      () =>
        queueMicrotask(() => {
          root.unmount();
          element.remove();
        }),
      { once: true },
    );
    root.render(<Home />);
  } catch {
    showOriginalLms();
    element.remove();
  }
}
