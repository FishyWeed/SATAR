<script lang="ts">
	// A data table that scrolls by keyboard and turns into labelled cards on phones (md: on tablets too).
	import type { Snippet } from 'svelte';

	let { label, md = false, children }: { label: string; md?: boolean; children: Snippet } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (a wide table must scroll with the keyboard) -->
<div class="s-table-wrap" role="region" aria-label={label} tabindex="0">
	<table class="s-table s-table--stack" class:s-table--stack-md={md}>
		<caption class="s-sr">{label}</caption>
		{@render children()}
	</table>
</div>
