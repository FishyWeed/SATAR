<script lang="ts">
	// Shows the result of a form action: an error message, or a confirmation message.
	import Banner from '#lib/Banner.svelte';

	let { form }: { form?: { error?: string; message?: string } | null } = $props();
</script>

{#if form?.error}<Banner kind="error" title={form.error} />{/if}
{#if form?.message}<Banner kind="success" title={form.message} />{/if}
