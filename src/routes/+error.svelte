<script lang="ts">
	import { page } from '$app/state';
	import { icon } from '#lib/ui.ts';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head><title>{notFound ? page.error?.message : 'Something went wrong'} · SATAR</title></svelte:head>

<div class="s-errorpage">
	<div class="s-empty__art" style="width:96px;height:96px">{@html icon(notFound ? 'search' : 'alert-triangle', 's-ic--xl')}</div>
	<span class="s-errorpage__code">ERROR {page.status}</span>
	<h1>{notFound ? page.error?.message : 'Something went wrong'}</h1>
	<p>{notFound ? 'Check the link, or go back to your home page.' : page.error?.message}</p>
	<div class="s-btn-row" style="justify-content:center"><a class="s-btn s-btn--primary" href="/" data-sveltekit-reload>{@html icon('home')}Home</a></div>
</div>
