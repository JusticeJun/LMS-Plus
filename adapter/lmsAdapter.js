function getCourses() {
    return [...document.querySelectorAll("em.sub_open")]
        .map(element => {
            const courseId = element.getAttribute("kj");

            if (!courseId) {
                return null;
            }

            const text = element.textContent
                .replace(/\s+/g, " ")
                .trim();

            const match = text.match(/^\[(.+?)\](.+?)\s*\(([^)]+)\)$/);

            return {
                courseId,
                name: match?.[2]?.trim() ?? text,
                campus: match?.[1]?.trim() ?? null,
                section: match?.[3]?.trim() ?? null
            };
        })
        .filter(Boolean);
}