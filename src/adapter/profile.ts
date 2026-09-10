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
