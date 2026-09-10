import type { Session } from '../models/session';
import { getCourses } from './courses';
// Only reuse an image already supplied by the LMS header; never construct a user URL.
export function safeProfileImageUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value, 'https://lms.pknu.ac.kr/ilos/main/main_form.acl');
    if (url.origin !== 'https://lms.pknu.ac.kr' || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function getProfileImageUrl(): string | undefined {
  const image = document.querySelector<HTMLImageElement>(
    '#header img#user_photo, #header #user_photo img',
  );
  return safeProfileImageUrl(image?.getAttribute('src') ?? undefined);
}

// Verified public header and notice markup, inspected 2026-09-09.
// Absence of a login button alone is never proof of authentication.
export function getSession(): Session {
  if (document.querySelector('#header li.header_login.login-btn-color'))
    return { status: 'guest', name: null };
  const user = document.querySelector('#header #user');
  if (user || document.querySelector('#header .header_logout') || getCourses().length > 0) {
    return {
      status: 'authenticated',
      photoUrl: getProfileImageUrl(),
      name: user?.textContent?.replace(/\s+/g, ' ').trim() || null,
    };
  }
  return { status: 'unknown', name: null };
}

export function login(): void {
  window.location.assign('https://lms.pknu.ac.kr/ilos/main/member/login_form.acl');
}
