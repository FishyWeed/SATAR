<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let dialog = $state<HTMLDialogElement>();
	let editing = $state<{ id: number; name: string } | null>(null);
	const catName = (id: number) => data.allCategories.find((c) => c.id === id)?.name ?? '-';

	function edit(c: { id: number; name: string }) {
		editing = c;
		dialog?.showModal();
	}
</script>

<h1>Catalogue</h1>
<Msg {form} />

<form method="GET" class="row" aria-label="Filter the catalogue">
	<label>Keyword <input name="q" value={data.q} placeholder="Category or tool name" /></label>
	<label>Category
		<select name="cat">
			<option value="">All categories</option>
			{#each data.allCategories as c (c.id)}<option value={c.id} selected={c.id === data.cat}>{c.name}</option>{/each}
		</select>
	</label>
	<label>Status
		<select name="status">
			<option value="">All statuses</option>
			{#each data.statuses as s (s)}<option selected={s === data.status}>{s}</option>{/each}
		</select>
	</label>
	<button>Filter</button>
	{#if data.q || data.cat || data.status}<a class="button" href="/admin/catalogue">Clear</a>{/if}
</form>

<h2>Categories</h2>
<form method="POST" action="?/add" class="row" novalidate>
	<label>Category name <input name="name" maxlength="50" value={form && 'name' in form ? form.name : ''} /></label>
	<button>Add category</button>
</form>
<br />
{#if data.categories.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Category name</th><th>Tools</th><th></th></tr></thead>
			<tbody>
				{#each data.categories as c (c.id)}
					<tr><td>{c.name}</td><td>{c.n}</td><td><button type="button" onclick={() => edit(c)}>Edit</button></td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No category matches the keyword</p>
{/if}

<h2>Tools</h2>
{#if data.tools.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Vendor</th><th>Category</th><th>Status</th><th>Risk level</th><th>Data class</th></tr></thead>
			<tbody>
				{#each data.tools as t (t.id)}
					<tr>
						<td><a href="/register/{t.id}">{t.name}</a></td><td>{t.vendor}</td><td>{t.category}</td>
						<td>{t.status}</td><td>{t.risk ?? '-'}</td><td>{t.dataClass ?? '-'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No tool found</p>
{/if}

<!-- Edit popup: the name of the category and the tools in it. -->
<dialog bind:this={dialog} aria-labelledby="edit-title">
	{#if editing}
		{#key editing.id}
			<form method="POST" action="?/edit" class="stack" novalidate>
				<h2 id="edit-title">Edit category</h2>
				<input type="hidden" name="id" value={editing.id} />
				<label>Category name <input name="name" maxlength="50" value={editing.name} /></label>
				<fieldset>
					<legend>Tools in this category</legend>
					<p class="muted">Tick a tool to put it in this category. A tool from another category moves here.</p>
					<div class="ticks">
						{#each data.allTools as t (t.id)}
							<label>
								<input type="checkbox" name="tools" value={t.id} checked={t.catId === editing.id} />
								{t.name}{#if t.catId !== editing.id}<span class="muted"> (now in {catName(t.catId)})</span>{/if}
							</label>
						{/each}
					</div>
				</fieldset>
				<label>Move the tools that you untick to
					<select name="moveTo">
						<option value="">Select</option>
						{#each data.allCategories.filter((c) => c.id !== editing?.id) as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
					</select>
				</label>
				<div class="row"><button>Save</button><button type="button" onclick={() => dialog?.close()}>Cancel</button></div>
			</form>
		{/key}
	{/if}
</dialog>
