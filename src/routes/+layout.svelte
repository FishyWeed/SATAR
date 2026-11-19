<script lang="ts">
	import '#lib/app.css';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { UserRole } from '#lib/rules.ts';
	import { icon } from '#lib/ui.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The menu of each role: [href, icon, label] (design system AppShell).
	const MENU: Record<UserRole, [string, string, string][]> = {
		Owner: [['/owner', 'building', 'Organizations']],
		Employee: [['/employee', 'home', 'Home'], ['/register', 'register', 'AI tool register'], ['/requests', 'inbox', 'My requests']],
		Manager: [['/manager', 'home', 'Home'], ['/manager/requests', 'inbox', 'Department requests'], ['/manager/tools', 'grid', 'Department tools'], ['/register', 'register', 'AI tool register']],
		Reviewer: [['/reviewer', 'home', 'Home'], ['/reviewer/queue', 'shield-check', 'Risk review queue'], ['/reviewer/overdue', 'hourglass', 'Overdue reviews'], ['/register', 'register', 'AI tool register']],
		Administrator: [['/admin', 'chart', 'Dashboard'], ['/admin/users', 'users', 'Users'], ['/admin/departments', 'building', 'Departments'], ['/admin/catalogue', 'tag', 'Catalogue'], ['/admin/audit', 'history', 'Audit log'], ['/admin/reports', 'file', 'Reports'], ['/register', 'register', 'Register']]
	};
	const AUTH = ['/login', '/signup', '/signup/check-email', '/forgot-password', '/reset-password'];

	const path = $derived(page.url.pathname);
	const user = $derived(data.user);
	const kind = $derived(path === '/' ? 'landing' : AUTH.includes(path) ? 'auth' : user?.role ? 'app' : 'bare');
	const menu = $derived(user?.role ? MENU[user.role] : []);
	// The current menu item: the longest href that starts the path.
	const current = $derived(menu.map((m) => m[0]).filter((h) => path === h || path.startsWith(h + '/')).sort((a, b) => b.length - a.length)[0]);
	const initials = $derived(user ? (user.firstName[0] ?? '') + (user.lastName[0] ?? '') : '');
	const org = $derived(user?.orgName ?? (user?.role === 'Owner' ? 'SATAR platform' : ''));

	let day = $state(false);
	let drawerEl = $state<HTMLElement>();
	let drawer: { open(): void; close(): void } | undefined;
	let menuOpen = $state(false);
	const mark = $derived(`/img/logos/satar-mark-${day ? 'canopy' : 'lumen'}.svg`);

	function toggleTheme() {
		day = window.SATAR.theme(day ? 'night' : 'day') === 'day';
	}
	function openDrawer() {
		menuOpen = true;
		drawer?.open();
	}

	// After each page change: wire the design system behaviours of the new page and the phone menu.
	afterNavigate(() => {
		day = document.documentElement.dataset.theme === 'day';
		window.SATAR.hydrate(document);
		window.SATAR.reveal(document);
		if (drawerEl && !drawer) drawer = window.SATAR.drawer(drawerEl);
		if (!drawerEl) drawer = undefined;
	});
</script>

{#snippet brand(href: string)}
	<a class="s-brand" {href} aria-label="SATAR home" data-sveltekit-reload={href === '/' ? '' : undefined}><img src={mark} alt="" style="height:22px" /><span class="s-brand__word">SATAR</span></a>
{/snippet}

{#if kind === 'landing'}
	{@render children()}
{:else if kind === 'auth'}
	<a class="s-skip" href="#main">Skip to content</a>
	<div class="s-auth">
		<div class="s-auth__art" aria-hidden="true">
			<div class="auth-art">
				<div class="bg"></div>
				<img src="/img/forest-far-sm.webp" alt="" /><div class="rays"></div>
				<img src="/img/forest-mid-sm.webp" alt="" /><img src="/img/forest-near-sm.webp" alt="" /><img src="/img/forest-ground-sm.webp" alt="" />
				<a class="brand" href="/" tabindex="-1" data-sveltekit-reload><img src="/img/logos/satar-logo-lumen.svg" alt="" /></a>
				<div class="quote"><p>Keep watch over every AI tool <em>your team uses.</em></p><span class="s-eyebrow">Noctua · Shadow AI Tool Approval Register</span></div>
			</div>
		</div>
		<main class="s-auth__panel view" id="main" tabindex="-1">
			<div class="auth-top">{@render brand('/')}</div>
			{@render children()}
		</main>
	</div>
{:else if kind === 'app' && user}
	<a class="s-skip" href="#main">Skip to content</a>
	<div class="s-shell">
		<header class="s-topbar">
			<button class="s-btn s-btn--ghost s-btn--icon s-menu-btn" type="button" aria-label="Open menu" aria-controls="drawer" aria-expanded={menuOpen} onclick={openDrawer}>{@html icon('menu', 's-ic--md')}</button>
			{@render brand('/')}
			<nav class="s-nav" aria-label="{user.role} menu">
				{#each menu as [href, ic, label] (href)}<a {href} aria-current={href === current ? 'page' : undefined}>{@html icon(ic, 's-ic--md')}{label}</a>{/each}
			</nav>
			<div class="s-topbar__end">
				<button class="s-btn s-btn--ghost s-btn--icon" type="button" aria-label="Switch to {day ? 'night' : 'day'} theme" onclick={toggleTheme}>{@html icon(day ? 'moon' : 'sun', 's-ic--md')}</button>
				<div class="s-user">
					<button class="s-user__btn" type="button" data-menu aria-controls="userMenu" aria-expanded="false" aria-haspopup="true">
						<span class="s-avatar" aria-hidden="true">{initials}</span>
						<span class="s-user__meta"><b>{user.firstName} {user.lastName}</b><span>{user.role}</span></span>
						{@html icon('chevron-down', 's-muted')}<span class="s-sr">Open user menu</span>
					</button>
					<div class="s-menu" id="userMenu" hidden>
						<div class="s-menu__head"><b>{user.firstName} {user.lastName}</b><span>{user.role}</span><span>{org}</span></div>
						<a class="s-menu__item" href="/profile">{@html icon('user')}My profile</a>
						<div class="s-menu__sep"></div>
						<form method="POST" action="/profile?/signout"><button class="s-menu__item">{@html icon('log-out')}Sign out</button></form>
					</div>
				</div>
			</div>
		</header>
		<div class="s-drawer__scrim"></div>
		<aside class="s-drawer" id="drawer" aria-label="Menu" bind:this={drawerEl} ontransitionend={() => { if (!drawerEl?.classList.contains('is-open')) menuOpen = false; }}>
			<div class="s-drawer__head">
				<span class="s-brand"><img src={mark} alt="" style="height:22px" /><span class="s-brand__word">SATAR</span></span>
				<button class="s-btn s-btn--ghost s-btn--icon" type="button" data-close aria-label="Close menu" onclick={() => drawer?.close()}>{@html icon('x', 's-ic--md')}</button>
			</div>
			<p class="s-eyebrow" style="padding:4px 12px 8px">{user.role}{org ? ` · ${org}` : ''}</p>
			<nav>{#each menu as [href, ic, label] (href)}<a {href} aria-current={href === current ? 'page' : undefined}>{@html icon(ic, 's-ic--md')}{label}</a>{/each}</nav>
			<div style="margin-top:auto;border-top:1px solid var(--border);padding-top:8px">
				<nav>
					<a href="/profile">{@html icon('user', 's-ic--md')}My profile</a>
					<form method="POST" action="/profile?/signout"><button>{@html icon('log-out', 's-ic--md')}Sign out</button></form>
				</nav>
			</div>
		</aside>
		<main class="s-main view" id="main" tabindex="-1">{@render children()}</main>
	</div>
{:else}
	<a class="s-skip" href="#main">Skip to content</a>
	<header class="s-topbar">
		{@render brand('/')}
		<div class="s-topbar__end">
			{#if user}
				<form method="POST" action="/profile?/signout"><button class="s-btn s-btn--ghost">{@html icon('log-out')}Sign out</button></form>
			{:else}
				<a class="s-btn s-btn--ghost" href="/login">Sign in</a><a class="s-btn s-btn--primary" href="/signup">Get started</a>
			{/if}
		</div>
	</header>
	<main class="s-main view" id="main" tabindex="-1">{@render children()}</main>
{/if}
