<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import '#lib/app.css';
	import type { UserRole } from '#lib/rules.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The menu of each role, as in the wireframes (section 7.0.7).
	const MENU: Record<UserRole, [string, string][]> = {
		Owner: [['Organizations', '/owner']],
		Employee: [['Home', '/employee'], ['Register', '/register'], ['My Requests', '/requests']],
		Manager: [['Home', '/manager'], ['Requests', '/manager/requests'], ['Tools', '/manager/tools'], ['Register', '/register']],
		Reviewer: [['Home', '/reviewer'], ['Review Queue', '/reviewer/queue'], ['Overdue', '/reviewer/overdue'], ['Register', '/register']],
		Administrator: [['Dashboard', '/admin'], ['Users', '/admin/users'], ['Departments', '/admin/departments'], ['Catalogue', '/admin/catalogue'], ['Audit', '/admin/audit'], ['Reports', '/admin/reports']]
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SATAR</title>
</svelte:head>

<header class="bar">
	<a class="brand" href="/">SATAR</a>
	{#if data.user}
		<nav>
			{#each data.user.role ? MENU[data.user.role] : [['Welcome', '/welcome']] as [label, href] (href)}<a {href}>{label}</a>{/each}
			<a href="/profile">Profile</a>
		</nav>
		<span class="who">{data.user.firstName}{data.user.role ? ` (${data.user.role})` : ''}{data.user.orgName ? ` · ${data.user.orgName}` : ''}</span>
	{:else}
		<nav class="public"><a href="/login">Sign in</a><a class="button" href="/signup">Get started</a></nav>
	{/if}
</header>

<main>
	{@render children()}
</main>
