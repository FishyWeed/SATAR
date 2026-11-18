<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>AI Tool Register</h1>
<form method="GET" class="row">
	<label>Search keyword <input name="q" value={data.q} /></label>
	<label>Category
		<select name="cat">
			<option value="">All categories</option>
			{#each data.categories as c (c.cat_id)}<option value={c.cat_id} selected={c.cat_id === data.cat}>{c.cat_name}</option>{/each}
		</select>
	</label>
	<button>Search</button>
</form>
<br />
{#if data.error}
	<p class="msg error" role="alert">{data.error}</p>
{:else}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Category</th><th>Status</th><th>Risk level</th><th>Data class</th><th></th></tr></thead>
			<tbody>
				{#each data.tools as t (t.id)}
					<tr><td>{t.name}</td><td>{t.category}</td><td>{t.status}</td><td>{t.risk ?? '-'}</td><td>{t.dataClass ?? '-'}</td><td><a href="/register/{t.id}">View</a></td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
