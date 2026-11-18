<script lang="ts">
	// The shared page of Manage Departments and Manage Categories: an add form and a list where each name can be renamed.
	import Msg from '#lib/Msg.svelte';

	let { title, label, countLabel, rows, form }: {
		title: string; label: string; countLabel: string;
		rows: { id: number; name: string; n: number }[];
		form?: { error?: string; message?: string; name?: string } | null;
	} = $props();
</script>

<h1>{title}</h1>
<Msg {form} />
<form method="POST" action="?/add" class="row" novalidate>
	<label>{label} <input name="name" maxlength="50" value={form?.name ?? ''} /></label>
	<button>Add</button>
</form>
<br />
<div class="table-wrap">
	<table>
		<thead><tr><th>{label}</th><th>{countLabel}</th><th>Rename</th></tr></thead>
		<tbody>
			{#each rows as r (r.id)}
				<tr>
					<td>{r.name}</td><td>{r.n}</td>
					<td>
						<form method="POST" action="?/rename" class="row" novalidate>
							<input type="hidden" name="id" value={r.id} />
							<input name="name" maxlength="50" value={r.name} aria-label="New name of {r.name}" />
							<button>Save</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
