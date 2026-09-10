const LMS_ORIGIN = 'https://lms.pknu.ac.kr';

// Model data is not trusted as a URL. Allow navigation to LMS forms only.
export function safeLmsHref(value: string | undefined): string | undefined {
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return undefined;
  try {
    const url = new URL(value, LMS_ORIGIN);
    if (url.origin !== LMS_ORIGIN || url.username || url.password) return undefined;
    if (!/^\/ilos\/[a-z0-9_/-]+(?:_form|\/introduce)\.acl$/.test(url.pathname)) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
