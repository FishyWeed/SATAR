<script lang="ts">
	// Shows the result of a form action: an error message, or a confirmation message.
	let { form }: { form?: { error?: string; message?: string } | null } = $props();
</script>

{#if form?.error}<p class="msg error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="msg" role="status">{form.message}</p>{/if}
