import type { Course } from '../models/course';
export function getCourses(): Course[] {
  return [...document.querySelectorAll<HTMLElement>('#wrap em.sub_open[kj]')]
    .map((element) => {
      const courseId = element.getAttribute('kj');

      if (!courseId) {
        return null;
      }

      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();

      const match = text.match(/^\[(.+?)\](.+?)\s*\(([^)]+)\)$/);

      return {
        courseId,
        name: match?.[2]?.trim() ?? text,
        campus: match?.[1]?.trim() ?? null,
        section: match?.[3]?.trim() ?? null,
      };
    })
    .filter((course): course is Course => course !== null);
}

// Reuse the original node and its registered LMS handlers; never invent a route.
export function openCourse(courseId: string): void {
  const course = [...document.querySelectorAll<HTMLElement>('#wrap em.sub_open[kj]')].find(
    (element) => element.getAttribute('kj') === courseId,
  );
  course?.click();
}
