<script lang="ts">
	// A labelled form field. The page gives the control (with class s-input, s-select or s-textarea and the same id).
	import type { Snippet } from 'svelte';

	let { id, label, hint = '', optional = false, children }: { id: string; label: string; hint?: string; optional?: boolean; children: Snippet } = $props();
</script>

<div class="s-field">
	<label class="s-label" for={id}>{label}{#if optional}&nbsp;<span class="s-opt">(optional)</span>{/if}</label>
	{@render children()}
	{#if hint}<div class="s-field-foot"><p class="s-hint" id="{id}-hint">{hint}</p></div>{/if}
</div>
