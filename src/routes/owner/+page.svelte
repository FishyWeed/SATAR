<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>Organizations</h1>
<Msg {form} />
<div class="cards">
	<div class="card">Organizations<b>{data.totals.orgs}</b></div>
	<div class="card">Active<b>{data.totals.active}</b></div>
	<div class="card">Users in total<b>{data.totals.users}</b></div>
</div>
<form method="GET" class="row">
	<label>Organization name <input name="q" value={data.q} /></label>
	<button>Search</button>
</form>
<br />
{#if data.orgs.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Organization</th><th>Administrators</th><th>Users</th><th>Created</th><th>Active</th><th></th></tr></thead>
			<tbody>
				{#each data.orgs as o (o.id)}
					<tr>
						<td>{o.name}</td><td>{o.admins}</td><td>{o.users}</td><td>{fmtDate(o.created)}</td><td>{o.active ? 'Yes' : 'No'}</td>
						<td>
							<form method="POST" action="?/toggle" onsubmit={(e) => { if (!confirm(`${o.active ? 'Deactivate' : 'Reactivate'} ${o.name}?`)) e.preventDefault(); }}>
								<input type="hidden" name="id" value={o.id} /><button>{o.active ? 'Deactivate' : 'Reactivate'}</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No organization found</p>
{/if}
