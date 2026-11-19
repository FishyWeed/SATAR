<script lang="ts">
	// Empty state: why the list is empty and what to do next. The title carries role="status" for the unit tests.
	import type { Snippet } from 'svelte';
	import { icon } from '#lib/ui.ts';

	let { ic = 'search', title, text = '', children }: { ic?: string; title: string; text?: string; children?: Snippet } = $props();
</script>

<div class="s-card">
	<div class="s-empty">
		<div class="s-empty__art">{@html icon(ic, 's-ic--xl')}</div>
		<p class="s-empty__title" role="status">{title}</p>
		{#if text}<p>{text}</p>{/if}
		{@render children?.()}
	</div>
</div>
