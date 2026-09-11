export function showOriginalLms(): void {
  if (!document.getElementById('wrap')) return;
  document.body.classList.remove('lms-plus-home-page');
  const root = document.getElementById('lms-plus-root');
  if (root) {
    root.hidden = true;
    root.dispatchEvent(new Event('lms-plus:restore'));
  }
  const target = document.getElementById('wrap');
  target?.scrollIntoView({ block: 'start' });
}
