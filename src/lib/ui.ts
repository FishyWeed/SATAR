// SATAR design system icons and badges (copied from static/js/satar.js), rendered on the server.
const P: Record<string, string> = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7l12.6 12.6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.3 3.6-5.2 6.5-5.2s5.5 1.9 6.5 5.2"/><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 15c2 .7 3.2 2.4 3.6 5"/>',
    shield: '<path d="M12 3l7.5 3v5.6c0 4.6-3.1 8-7.5 9.4-4.4-1.4-7.5-4.8-7.5-9.4V6z"/>',
    "shield-check": '<path d="M12 3l7.5 3v5.6c0 4.6-3.1 8-7.5 9.4-4.4-1.4-7.5-4.8-7.5-9.4V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5l-4.6-4.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "arrow-up-right": '<path d="M7 17L17 7M8 7h9v9"/>',
    "chevron-down": '<path d="M6 9l6 6 6-6"/>',
    "chevron-left": '<path d="M15 6l-6 6 6 6"/>',
    "chevron-right": '<path d="M9 6l6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    eye: '<path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M3 3l18 18"/><path d="M10.6 5.1c.5-.1.9-.1 1.4-.1 6 0 9.5 7 9.5 7a16 16 0 0 1-3 3.8M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 7 9.5 7c1.8 0 3.4-.6 4.8-1.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
    "alert-triangle": '<path d="M10.3 4.1L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 16.8v.1"/>',
    "alert-circle": '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.1"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="M8.3 12.3l2.5 2.5 4.9-5.1"/>',
    "x-circle": '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    "log-out": '<path d="M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5"/><path d="M16 16.5l4.5-4.5L16 7.5M20.5 12H10"/>',
    "log-in": '<path d="M14.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3.5"/><path d="M10 16.5l4.5-4.5L10 7.5M14.5 12H4"/>',
    printer: '<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    building: '<path d="M4.5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M15.5 9h2a2 2 0 0 1 2 2v10M3 21h18M8.5 7.5h3M8.5 11.5h3M8.5 15.5h3"/>',
    register: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17.5" r="1"/>',
    file: '<path d="M14 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5z"/><path d="M14 3v5.5h5.5M8.5 13h7M8.5 16.5h5"/>',
    home: '<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
    inbox: '<path d="M3.5 13.5L6.2 5h11.6l2.7 8.5v5a1.5 1.5 0 0 1-1.5 1.5h-14a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>',
    hourglass: '<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5 9 6 9 9s-9 4-9 9M16.5 3c0 5-9 6-9 9s9 4 9 9"/>',
    chart: '<path d="M4 20V11M10 20V5M16 20v-6.5M21.5 20h-19"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5M12 7.5V12l3.2 2"/>',
    tag: '<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.6 8.6a1.5 1.5 0 0 1 0 2.1l-6.7 6.7a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.4"/>',
    link: '<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    filter: '<path d="M4 5h16l-6.2 7.6V19l-3.6 1.8v-8.2z"/>',
    edit: '<path d="M4 20h4.2L19.5 8.7a2.1 2.1 0 0 0 0-3L18.3 4.5a2.1 2.1 0 0 0-3 0L4 15.8z"/><path d="M13.8 6l4.2 4.2"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5a2 2 0 0 0 2 1.5h7a2 2 0 0 0 2-1.5l1-12.5M9 7V4.5h6V7"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20.5 4v5h-5"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M4.5 20h15"/>',
    upload: '<path d="M12 16V5M7 9.5l5-5 5 5M4.5 20h15"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 15.5l-4.8-4.8-9.7 8.8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    layers: '<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 12.5l9 4.8 9-4.8"/><path d="M3 16.5l9 4.8 9-4.8"/>',
    gauge: '<path d="M3.5 17a8.5 8.5 0 1 1 17 0"/><path d="M12 17l4-5.5"/><circle cx="12" cy="17" r="1.3"/>',
    sparkle: '<path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
    external: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    eyeWatch: '<circle cx="8" cy="12" r="4.5"/><circle cx="16" cy="12" r="4.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>',
    database: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
    leak: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
    workflow: '<rect x="3" y="4" width="6.5" height="5" rx="1.5"/><rect x="14.5" y="4" width="6.5" height="5" rx="1.5"/><rect x="8.75" y="15" width="6.5" height="5" rx="1.5"/><path d="M6.2 9v2.5a1.5 1.5 0 0 0 1.5 1.5h8.6a1.5 1.5 0 0 0 1.5-1.5V9M12 13v2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    power: '<path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };

export function icon(name: string, cls = ''): string {
	return `<svg class="s-ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${P[name] ?? P.info}</svg>`;
}

// [modifier, icon, word, level, glyph]
const BADGE: Record<string, (string | number | null)[]> = {
    pending: ["pending", "clock", "Pending"],
    approved: ["approved", "check", "Approved"],
    rejected: ["rejected", "x", "Rejected"],
    banned: ["banned", "ban", "Banned"],
    "pending-manager": ["pm", "user", "Pending Manager"],
    "pending-reviewer": ["pr", "shield", "Pending Reviewer"],
    low: ["low", null, "Low", 1],
    medium: ["medium", null, "Medium", 2],
    high: ["high", null, "High", 3],
    public: ["public", null, "Public", 1, "pips"],
    internal: ["internal", null, "Internal", 2, "pips"],
    confidential: ["confidential", null, "Confidential", 3, "pips"],
    restricted: ["restricted", null, "Restricted", 4, "pips"],
    active: ["active", "dot", "Active"],
    inactive: ["inactive", "hollow", "Inactive"]
  };

// A status, risk, data class or account badge: colour, glyph and word. Accepts "Pending Manager", "approved", "High" and so on.
export function badge(kind: string | null | undefined, text?: string): string {
	if (!kind) return '<span class="s-muted">Not set</span>';
	const b = BADGE[kind.toLowerCase().replace(/\s+/g, '-')];
	if (!b) return `<span class="s-badge s-badge--neutral">${text ?? kind}</span>`;
	const glyph = b[1] === 'dot' ? '<span class="s-dot" aria-hidden="true"></span>'
		: b[1] === 'hollow' ? '<span class="s-dot s-dot--hollow" aria-hidden="true"></span>'
		: b[4] === 'pips' ? `<span class="s-pips" data-level="${b[3]}" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`
		: b[3] ? `<span class="s-bars3" data-level="${b[3]}" aria-hidden="true"><i></i><i></i><i></i></span>`
		: icon(String(b[1]), 's-ic--xs');
	return `<span class="s-badge s-badge--${b[0]}">${glyph}${text ?? b[2]}</span>`;
}
