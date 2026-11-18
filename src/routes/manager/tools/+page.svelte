<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Department Tools</h1>
{#if data.tools.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Status</th><th>Risk level</th><th>Data class</th><th>Users</th></tr></thead>
			<tbody>
				{#each data.tools as t (t.id)}
					<tr><td><a href="/register/{t.id}">{t.name}</a></td><td>{t.status}</td><td>{t.risk ?? '-'}</td><td>{t.dataClass ?? '-'}</td><td>{t.users}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No tools yet</p>
{/if}
