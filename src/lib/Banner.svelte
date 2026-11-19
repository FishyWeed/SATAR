<script lang="ts">
	// A form-level message. The title is in its own <p>, so the unit tests can read it after role="alert" or role="status".
	import type { Snippet } from 'svelte';
	import { icon } from '#lib/ui.ts';

	let { kind, title, children }: { kind: 'success' | 'error' | 'warning' | 'info'; title: string; children?: Snippet } = $props();
	const ICON = { success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle', info: 'info' };
</script>

<div class="s-banner s-banner--{kind}" role={kind === 'success' || kind === 'info' ? 'status' : 'alert'}>
	{@html icon(ICON[kind], 's-ic--md s-banner__icon')}
	<div class="s-banner__body"><p><strong>{title}</strong></p>{@render children?.()}</div>
</div>
