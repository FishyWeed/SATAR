<script lang="ts">
	import { page } from '$app/state';
</script>

<h1>{page.status === 404 ? page.error?.message : 'Something went wrong'}</h1>
<p class="muted">{page.status === 404 ? 'Check the link, or go back to your home page.' : page.error?.message}</p>
<a class="button" href="/">Home</a>
