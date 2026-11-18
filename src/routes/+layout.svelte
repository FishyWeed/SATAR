<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import '#lib/app.css';
	import type { Role } from '#lib/rules.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The menu of each role, as in the wireframes (section 7.0.7).
	const MENU: Record<Role, [string, string][]> = {
		Employee: [['Home', '/employee'], ['Register', '/register'], ['My Requests', '/requests']],
		Manager: [['Home', '/manager'], ['Requests', '/manager/requests'], ['Tools', '/manager/tools'], ['Register', '/register']],
		Reviewer: [['Home', '/reviewer'], ['Review Queue', '/reviewer/queue'], ['Overdue', '/reviewer/overdue'], ['Register', '/register']],
		Administrator: [['Dashboard', '/admin'], ['Users', '/admin/users'], ['Departments', '/admin/departments'], ['Categories', '/admin/categories'], ['Audit', '/admin/audit'], ['Reports', '/admin/reports']]
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
			{#each MENU[data.user.role] as [label, href] (href)}<a {href}>{label}</a>{/each}
			<a href="/profile">Profile</a>
		</nav>
		<span class="who">{data.user.firstName} ({data.user.role})</span>
	{/if}
</header>

<main>
	{@render children()}
</main>
