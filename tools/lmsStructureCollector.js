(() => {
    const VERSION = "2.2";

    const MAX_TEXT = 160;
    const MAX_HANDLER = 300;

    // Values that should never appear in a raw survey.
    const SENSITIVE_NAME_RE =
        /(password|passwd|pwd|token|csrf|session|jsession|auth|authorization|secret|credential)/i;

    // Attribute / input names that are interesting as LMS identifiers.
    // DOM "id" itself is deliberately NOT included.
    const LMS_IDENTIFIER_NAME_RE =
        /^(kj.*|.*kj.*|.*course.*|.*subject.*|.*room.*|.*year.*|.*term.*|returnuri)$/i;

    // Calendar-generated IDs such as 9_4, 10_2, 9_4_0.
    const GENERATED_DATE_ID_RE = /^\d{1,2}_\d{1,2}(?:_\d+)?$/;

    /*
     * IDs that contain concrete runtime object identifiers.
     *
     * Example:
     *   commentbox_8787853
     *   progress8787853
     *   wrtExplain_8787853
     *
     * We preserve the structural prefix but remove the concrete identifier.
     */
    const DYNAMIC_ID_PATTERNS = [
        /^(commentbox)_\d+$/i,
        /^(progress)\d+$/i,
        /^(bar)\d+$/i,
        /^(wrtExplain)_\d+$/i,
        /^(cmmt_ins)_\d+$/i,
        /^(uploadForm\d*)_\d+$/i,
        /^(file\d*)_\d+$/i
    ];

    function normalize(value) {
        return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function truncate(value, max = MAX_TEXT) {
        const text = String(value ?? "");
        return text.length <= max ? text : `${text.slice(0, max)}…`;
    }

    function tag(element) {
        return element.tagName.toLowerCase();
    }

    function isSensitiveName(name) {
        return SENSITIVE_NAME_RE.test(name ?? "");
    }

    function sanitizeDomId(id) {
        if (!id) {
            return "";
        }

        for (const pattern of DYNAMIC_ID_PATTERNS) {
            const match = id.match(pattern);

            if (match) {
                return `${match[1]}_[IDENTIFIER]`;
            }
        }

        return id;
    }

    /*
     * Remove concrete query-string values from JavaScript snippets while
     * retaining endpoint and parameter names.
     *
     * Example:
     *
     *   /list.acl?SCH_KEY=abc&start=1
     *
     * becomes:
     *
     *   /list.acl?SCH_KEY=[REDACTED]&start=[REDACTED]
     */
    function sanitizeQueryValuesInText(raw) {
        if (!raw) {
            return raw;
        }

        return String(raw).replace(
            /([?&][A-Za-z0-9_.-]+)=([^&'"\s)]*)/g,
            (_, prefix) => `${prefix}=[REDACTED]`
        );
    }

    /*
     * Inline handlers can contain values that normal attribute masking misses:
     *
     *   eclassRoom('A20263104605105')
     *
     * We want:
     *
     *   eclassRoom('[IDENTIFIER]')
     *
     * Query-string values and concrete dates are also removed because their
     * values do not add integration knowledge.
     */
    function sanitizeHandler(raw) {
        if (!raw) {
            return null;
        }

        let value = String(raw);

        // Query-string values embedded inside JavaScript.
        value = sanitizeQueryValuesInText(value);

        // Known PKNU course-key-like values.
        value = value.replace(
            /(['"])(A\d{10,})\1/gi,
            "$1[IDENTIFIER]$1"
        );

        // Common long opaque/alphanumeric identifier arguments.
        value = value.replace(
            /(['"])(?=[A-Za-z0-9_-]{12,}\1)(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]+\1/g,
            "$1[IDENTIFIER]$1"
        );

        // YYYY-M-D / YYYY-MM-DD.
        value = value.replace(
            /(['"])\d{4}-\d{1,2}-\d{1,2}\1/g,
            "$1[DATE]$1"
        );

        // Obvious session/auth-related assignments.
        value = value.replace(
            /(token|session|jsessionid|authorization|auth)\s*[:=]\s*(['"])[^'"]+\2/gi,
            "$1=$2[REDACTED]$2"
        );

        return truncate(value, MAX_HANDLER);
    }

    function shortSelector(element) {
        const elementTag = tag(element);

        // Keep stable DOM IDs, but sanitize runtime-generated identifiers.
        if (element.id && !GENERATED_DATE_ID_RE.test(element.id)) {
            const safeId = sanitizeDomId(element.id);
            return `${elementTag}#${CSS.escape(safeId)}`;
        }

        const classes = [...element.classList]
            .filter(Boolean)
            .slice(0, 3);

        if (classes.length) {
            return `${elementTag}.${classes
                .map(value => CSS.escape(value))
                .join(".")}`;
        }

        return elementTag;
    }

    function domPath(element, maxDepth = 5) {
        const parts = [];
        let current = element;

        while (
            current &&
            current instanceof Element &&
            current !== document.documentElement &&
            parts.length < maxDepth
        ) {
            parts.unshift(shortSelector(current));
            current = current.parentElement;
        }

        return parts.join(" > ");
    }

    function ownText(element) {
        return truncate(
            normalize(
                [...element.childNodes]
                    .filter(node => node.nodeType === Node.TEXT_NODE)
                    .map(node => node.textContent)
                    .join(" ")
            )
        );
    }

    function urlShape(raw) {
        if (!raw) {
            return null;
        }

        const trimmed = raw.trim();

        // Don't pretend JavaScript hrefs are URLs.
        if (
            /^javascript:/i.test(trimmed) ||
            /^[a-zA-Z_$][\w$]*\s*\(/.test(trimmed)
        ) {
            return {
                kind: "javascript",
                expression: sanitizeHandler(
                    trimmed.replace(/^javascript:/i, "")
                )
            };
        }

        try {
            const url = new URL(trimmed, location.href);

            return {
                kind: "url",
                origin:
                    url.origin === location.origin
                        ? "[same-origin]"
                        : url.origin,
                pathname: url.pathname,
                queryParameterNames: [
                    ...new Set([...url.searchParams.keys()])
                ]
            };
        } catch {
            return {
                kind: "unknown",
                value: "[UNPARSED]"
            };
        }
    }

    function attributes(element) {
        const result = {};

        for (const attr of element.attributes) {
            const name = attr.name.toLowerCase();

            if (
                name === "style" ||
                name.startsWith("on") ||
                name === "value"
            ) {
                continue;
            }

            // Runtime-generated DOM identifiers must not leak through attrs.
            if (name === "id") {
                result[name] = sanitizeDomId(attr.value);
                continue;
            }

            if (name === "href" || name === "src" || name === "action") {
                result[name] = urlShape(attr.value);
                continue;
            }

            if (isSensitiveName(name)) {
                result[name] = "[REDACTED]";
                continue;
            }

            if (LMS_IDENTIFIER_NAME_RE.test(name)) {
                result[name] = attr.value
                    ? "[VALUE_PRESENT]"
                    : "";
                continue;
            }

            result[name] = truncate(attr.value, 250);
        }

        return result;
    }

    function describe(element) {
        const result = {
            tag: tag(element),
            selector: shortSelector(element),
            path: domPath(element)
        };

        const text = ownText(element);

        if (text) {
            result.ownText = text;
        }

        const attrs = attributes(element);

        if (Object.keys(attrs).length) {
            result.attributes = attrs;
        }

        return result;
    }

    function dedupe(items) {
        const seen = new Set();

        return items.filter(item => {
            const key = JSON.stringify(item);

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    }

    // ---------------------------------------------------------
    // Page
    // ---------------------------------------------------------

    function collectPage() {
        return {
            title: document.title,
            origin: "[same-origin]",
            pathname: location.pathname,
            queryParameterNames: [
                ...new Set(
                    [...new URL(location.href).searchParams.keys()]
                )
            ]
        };
    }

    // ---------------------------------------------------------
    // Layout
    // ---------------------------------------------------------

    function isMajorContainer(element) {
        if (
            ![
                "DIV",
                "MAIN",
                "SECTION",
                "ASIDE",
                "HEADER",
                "FOOTER",
                "NAV"
            ].includes(element.tagName)
        ) {
            return false;
        }

        // Ignore calendar-generated day/event nodes.
        if (
            element.id &&
            GENERATED_DATE_ID_RE.test(element.id)
        ) {
            return false;
        }

        if (element.id) {
            return true;
        }

        const classes = [...element.classList].join(" ");

        return /(container|content|wrap|main|header|footer|sidebar|menu|nav|panel|modal|popup|dialog|widget|course|subject|schedule|notice|todo|notification|leftarea|rightarea|box)/i.test(
            classes
        );
    }

    function collectLayout() {
        return dedupe(
            [...document.querySelectorAll(
                "div, main, section, aside, header, footer, nav"
            )]
                .filter(isMajorContainer)
                .map(describe)
        );
    }

    // ---------------------------------------------------------
    // Repeated structures
    // ---------------------------------------------------------

    function collectRepeatedStructures() {
        return [...document.querySelectorAll(
            "ul, ol, table, tbody, dl"
        )]
            .map(container => {
                const children = [...container.children];

                if (children.length < 2) {
                    return null;
                }

                const groups = new Map();

                for (const child of children) {
                    const signature = [
                        child.tagName,
                        [...child.classList].sort().join(".")
                    ].join("|");

                    if (!groups.has(signature)) {
                        groups.set(signature, []);
                    }

                    groups.get(signature).push(child);
                }

                const repeated = [...groups.entries()]
                    .filter(([, elements]) => elements.length >= 2)
                    .map(([signature, elements]) => ({
                        signature,
                        count: elements.length,
                        sample: elements.slice(0, 2).map(describe)
                    }));

                if (!repeated.length) {
                    return null;
                }

                return {
                    container: describe(container),
                    repeated
                };
            })
            .filter(Boolean);
    }

    // ---------------------------------------------------------
    // Forms
    // ---------------------------------------------------------

    function collectForms() {
        return [...document.forms].map(form => ({
            element: describe(form),
            method: (form.method || "get").toUpperCase(),
            action: urlShape(form.action),

            controls: [...form.elements]
                .filter(
                    element =>
                        element instanceof HTMLElement &&
                        [
                            "INPUT",
                            "SELECT",
                            "TEXTAREA",
                            "BUTTON"
                        ].includes(element.tagName)
                )
                .map(element => {
                    const name = element.getAttribute("name");

                    return {
                        tag: tag(element),
                        type: element.getAttribute("type"),
                        id: element.id
                            ? sanitizeDomId(element.id)
                            : null,
                        name,
                        valueState:
                            element instanceof HTMLInputElement &&
                            element.type === "hidden"
                                ? element.value
                                    ? "[VALUE_PRESENT]"
                                    : "[EMPTY]"
                                : undefined
                    };
                })
        }));
    }

    // ---------------------------------------------------------
    // Links
    // ---------------------------------------------------------

    function collectLinks() {
        return dedupe(
            [...document.querySelectorAll("a[href]")].map(link => ({
                selector: shortSelector(link),
                path: domPath(link),
                text: truncate(normalize(link.textContent)),
                href: urlShape(link.getAttribute("href")),
                target: link.getAttribute("target"),
                onclick: sanitizeHandler(
                    link.getAttribute("onclick")
                )
            }))
        );
    }

    // ---------------------------------------------------------
    // Inline behavior
    // ---------------------------------------------------------

    function collectInlineHandlers() {
        const handlerNames = [
            "onclick",
            "onchange",
            "onsubmit",
            "oninput",
            "onload"
        ];

        const items = [...document.querySelectorAll("*")]
            .map(element => {
                // Calendar cells all express the same behavior.
                if (
                    element.matches("table.main-Schedule td") &&
                    element.hasAttribute("onclick")
                ) {
                    return null;
                }

                const handlers = {};

                for (const name of handlerNames) {
                    const raw = element.getAttribute(name);

                    if (raw) {
                        handlers[name] = sanitizeHandler(raw);
                    }
                }

                if (!Object.keys(handlers).length) {
                    return null;
                }

                return {
                    element: describe(element),
                    handlers
                };
            })
            .filter(Boolean);

        /*
         * Represent the entire calendar date grid once instead of recording
         * dozens of equivalent date-cell handlers.
         */
        const calendarCells = [
            ...document.querySelectorAll(
                "table.main-Schedule td[onclick]"
            )
        ];

        if (calendarCells.length) {
            items.push({
                elementPattern: "table.main-Schedule td",
                count: calendarCells.length,
                handlers: {
                    onclick: sanitizeHandler(
                        calendarCells[0].getAttribute("onclick")
                    )
                }
            });
        }

        return dedupe(items);
    }

    // ---------------------------------------------------------
    // LMS identifier candidates
    // ---------------------------------------------------------

    function collectIdentifierCandidates() {
        const result = [];

        for (const element of document.querySelectorAll("*")) {
            const found = {};

            for (const attr of element.attributes) {
                const name = attr.name;

                if (
                    name === "id" ||
                    name === "class" ||
                    name === "href"
                ) {
                    continue;
                }

                if (
                    LMS_IDENTIFIER_NAME_RE.test(name) ||
                    isSensitiveName(name)
                ) {
                    found[name] = isSensitiveName(name)
                        ? "[REDACTED]"
                        : attr.value
                            ? "[VALUE_PRESENT]"
                            : "";
                }
            }

            /*
             * Hidden inputs often reveal useful parameter names such as:
             *
             *   KJ_KEY
             *   KJ_YEAR
             *   KJ_TERM
             *   returnURI
             *
             * Only the presence of a value is retained.
             */
            if (
                element instanceof HTMLInputElement &&
                element.type === "hidden" &&
                element.name &&
                LMS_IDENTIFIER_NAME_RE.test(element.name)
            ) {
                found[`input:${element.name}`] =
                    element.value
                        ? "[VALUE_PRESENT]"
                        : "";
            }

            if (Object.keys(found).length) {
                result.push({
                    element: shortSelector(element),
                    path: domPath(element),
                    attributes: found
                });
            }
        }

        return dedupe(result);
    }

    // ---------------------------------------------------------
    // Interactive containers
    // ---------------------------------------------------------

    function collectInteractiveContainers() {
        const selector = [
            '[role="dialog"]',
            "dialog",
            "iframe",
            '[id*="pop" i]',
            '[class*="modal" i]',
            '[id*="modal" i]',
            '[class*="dialog" i]',
            '[id*="dialog" i]',
            '[id*="todo" i]',
            '[id*="notification" i]'
        ].join(",");

        return dedupe(
            [...document.querySelectorAll(selector)].map(describe)
        );
    }

    // ---------------------------------------------------------
    // Tables
    // ---------------------------------------------------------

    function collectTables() {
        return [...document.querySelectorAll("table")].map(table => ({
            element: describe(table),
            rowCount: table.rows.length,
            columnCounts: [...table.rows]
                .slice(0, 10)
                .map(row => row.cells.length),
            headers: [...table.querySelectorAll("th")]
                .slice(0, 20)
                .map(header =>
                    truncate(normalize(header.textContent))
                )
        }));
    }

    // ---------------------------------------------------------
    // Resources
    // ---------------------------------------------------------

    function collectResources() {
        return {
            stylesheets: dedupe(
                [...document.querySelectorAll(
                    'link[rel="stylesheet"][href]'
                )].map(link =>
                    urlShape(link.getAttribute("href"))
                )
            ),

            scripts: dedupe(
                [...document.querySelectorAll("script[src]")].map(
                    script => urlShape(script.getAttribute("src"))
                )
            )
        };
    }

    // ---------------------------------------------------------
    // Report
    // ---------------------------------------------------------

    const report = {
        collector: {
            name: "LMS+ PKNU LMS Structure Collector",
            version: VERSION,
            capturedAt: new Date().toISOString(),
            note:
                "Temporary local inspection output. Raw captures must not be committed."
        },

        page: collectPage(),
        layout: collectLayout(),
        repeatedStructures: collectRepeatedStructures(),
        forms: collectForms(),
        links: collectLinks(),
        inlineHandlers: collectInlineHandlers(),
        identifierCandidates: collectIdentifierCandidates(),
        interactiveContainers: collectInteractiveContainers(),
        tables: collectTables(),
        resources: collectResources()
    };

    const json = JSON.stringify(report, null, 2);

    console.log(report);

    console.log(
        `LMS+ survey v${VERSION} complete: ${Math.round(
            json.length / 1024
        )} KB`
    );

    if (typeof copy === "function") {
        copy(json);
        console.log("JSON copied to clipboard.");
    } else {
        console.log(json);
    }

    return report;
})();