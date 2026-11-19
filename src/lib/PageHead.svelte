<script lang="ts">
	// Page title (the one h1), a one-sentence description, an optional back link and actions.
	import type { Snippet } from 'svelte';
	import { icon } from '#lib/ui.ts';

	let { title, desc = '', back, children }: { title: string; desc?: string; back?: [href: string, label: string]; children?: Snippet } = $props();
</script>

<svelte:head><title>{title} · SATAR</title></svelte:head>

<header class="s-pagehead">
	<div class="s-pagehead__text">
		{#if back}<a class="s-link s-link--standalone s-link--back" href={back[0]}>{@html icon('arrow-left')}{back[1]}</a>{/if}
		<h1>{title}</h1>
		{#if desc}<p>{desc}</p>{/if}
	</div>
	{#if children}<div class="s-pagehead__actions">{@render children()}</div>{/if}
</header>
