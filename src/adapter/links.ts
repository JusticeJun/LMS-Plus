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

// Public home navigation destinations verified on 2026-09-09.
export const homeResources = [
  {
    id: 'groups',
    title: '소모임',
    description: '함께 배우고 교류하는 공간',
    href: '/ilos/community/share_group_list_form.acl',
    icon: 'users',
  },
  {
    id: 'ocw',
    title: 'OCW · 열린 강의',
    description: '관심 있는 주제로 배움을 넓혀 보세요',
    href: '/ilos/ocw/courseware_list_form.acl',
    icon: 'play',
  },
  {
    id: 'qna',
    title: '질의응답',
    description: 'LMS 이용 중 궁금한 점을 확인하세요',
    href: '/ilos/community/qna_list_form.acl',
    icon: 'help',
  },
  {
    id: 'materials',
    title: '자료실',
    description: '학습과 이용에 필요한 자료를 찾아보세요',
    href: '/ilos/community/material_list_form.acl',
    icon: 'file',
  },
] as const;
