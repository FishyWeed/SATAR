<script lang="ts">
	// Stat cards of a home page or dashboard. A card with href links to its list.
	import { icon } from '#lib/ui.ts';

	let { items }: { items: { label: string; value: number; icon: string; href?: string }[] } = $props();
</script>

<div class="s-stats">
	{#each items as s (s.label)}
		<svelte:element this={s.href ? 'a' : 'div'} class="s-stat" class:s-stat--link={s.href} href={s.href} style={s.href ? 'text-decoration:none' : undefined}>
			<span class="s-stat__label">{@html icon(s.icon, 's-ic--md')}{s.label}</span>
			<span class="s-stat__value">{s.value}</span>
		</svelte:element>
	{/each}
</div>
