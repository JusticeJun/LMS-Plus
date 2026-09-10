import { createRoot } from 'react-dom/client';
import { detectPage } from './page';
import { HomePage } from '../pages/home/HomePage';
import { useEffect } from 'react';
import { showOriginalLms } from './lifecycle';

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
    root.render(<EnhancedHome />);
  } catch {
    showOriginalLms();
    element.remove();
  }
}

function EnhancedHome() {
  useEffect(() => {
    document.body.classList.add('lms-plus-home-page');
    return () => document.body.classList.remove('lms-plus-home-page');
  }, []);
  return <HomePage onRestore={showOriginalLms} />;
}
