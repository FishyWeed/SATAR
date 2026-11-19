<script lang="ts">
	// Side card that explains the four data classes, from least to most sensitive.
	import { badge } from '#lib/ui.ts';

	let { title }: { title: string } = $props();
	const CLASSES = [
		['Public', 'Already public, such as the website and price list.'],
		['Internal', 'For staff only, such as meeting notes and guides.'],
		['Confidential', 'For some staff, such as contracts, payroll and plans.'],
		['Restricted', 'Most sensitive, such as IC numbers, health data and passwords.']
	];
</script>

<aside class="s-card s-stack" style="--_gap:14px">
	<h2 class="s-section-title">{title}</h2>
	<p class="s-muted" style="font-size:14px">From least to most sensitive. A tool approved for one class may also be used with any less sensitive class.</p>
	<div class="legend-list">
		{#each CLASSES as [name, text] (name)}<div>{@html badge(name)}<span>{text}</span></div>{/each}
	</div>
</aside>
