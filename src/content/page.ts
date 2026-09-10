export type LmsPage = 'home' | 'unknown';
export function detectPage(): LmsPage {
  return window.top === window.self &&
    window.location.origin === 'https://lms.pknu.ac.kr' &&
    window.location.pathname === '/ilos/main/main_form.acl'
    ? 'home'
    : 'unknown';
}
