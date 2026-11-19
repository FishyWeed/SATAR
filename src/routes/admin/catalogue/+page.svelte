<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { liveFilter } from '#lib/live.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let dialog = $state<HTMLDialogElement>();
	let editing = $state<{ id: number; name: string } | null>(null);
	const catName = (id: number) => data.allCategories.find((c) => c.id === id)?.name ?? '-';

	function edit(c: { id: number; name: string }) {
		editing = c;
		if (dialog) window.SATAR.dialog(dialog).open();
	}
</script>

<PageHead title="Catalogue" desc="Categories group the tools in the register." />
<Msg {form} />

<form use:liveFilter data-sveltekit-reset="false" data-sveltekit-replacestate method="GET" class="s-filterbar" role="search" aria-label="Filter the catalogue" style="--_selects:2">
	<Field id="q" label="Keyword"><input class="s-input" id="q" name="q" value={data.q} placeholder="Category or tool name" /></Field>
	<Field id="cat" label="Category">
		<select class="s-select" id="cat" name="cat">
			<option value="">All categories</option>
			{#each data.allCategories as c (c.id)}<option value={c.id} selected={c.id === data.cat}>{c.name}</option>{/each}
		</select>
	</Field>
	<Field id="status" label="Status">
		<select class="s-select" id="status" name="status">
			<option value="">All statuses</option>
			{#each data.statuses as s (s)}<option selected={s === data.status}>{s}</option>{/each}
		</select>
	</Field>
	<div class="s-btn-row">
		<button class="s-btn s-btn--secondary">{@html icon('filter')}Filter</button>
		{#if data.q || data.cat || data.status}<a class="s-btn s-btn--tertiary" href="/admin/catalogue">Clear</a>{/if}
	</div>
</form>

<section class="s-section">
	<div class="s-section__head"><h2 class="s-section-title">Categories</h2></div>
	<form method="POST" action="?/add" class="inline-form" novalidate style="margin-bottom:16px">
		<Field id="name" label="Category name"><input class="s-input" id="name" name="name" maxlength="50" placeholder="For example, Video" value={form && 'name' in form ? form.name : ''} /></Field>
		<button class="s-btn s-btn--secondary">{@html icon('plus')}Add category</button>
	</form>
	{#if data.categories.length}
		<TableWrap label="Categories">
			<thead><tr><th scope="col">Category</th><th scope="col" class="is-num">Tools</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
			<tbody>
				{#each data.categories as c (c.id)}
					<tr>
						<td data-label="Category"><b style="color:var(--text-strong);font-weight:550">{c.name}</b></td><td data-label="Tools" class="is-num">{c.n}</td>
						<td data-label="Action" class="s-actions"><button class="s-btn s-btn--secondary s-btn--sm" type="button" onclick={() => edit(c)}>{@html icon('edit')}Edit</button></td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="tag" title="No category matches the keyword" />
	{/if}
</section>

<section class="s-section">
	<div class="s-section__head"><h2 class="s-section-title">Tools</h2></div>
	{#if data.tools.length}
		<TableWrap label="Tools" md>
			<thead><tr><th scope="col">Tool</th><th scope="col">Vendor</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Risk</th><th scope="col">Data class</th></tr></thead>
			<tbody>
				{#each data.tools as t (t.id)}
					<tr>
						<td data-label="Tool"><a href="/register/{t.id}">{t.name}</a></td><td data-label="Vendor">{t.vendor}</td><td data-label="Category">{t.category}</td>
						<td data-label="Status">{@html badge(t.status)}</td><td data-label="Risk">{@html badge(t.risk)}</td><td data-label="Data class">{@html badge(t.dataClass)}</td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty title="No tool found" text="Try another keyword, category or status." />
	{/if}
</section>

<!-- Edit popup: the name of the category and the tools in it. -->
<dialog class="s-dialog" bind:this={dialog} aria-labelledby="edit-title">
	<div class="s-dialog__head">
		<h2 class="s-dialog__title" id="edit-title">Edit category</h2>
		<button class="s-btn s-btn--ghost s-btn--icon" type="button" data-close aria-label="Close">{@html icon('x', 's-ic--md')}</button>
	</div>
	{#if editing}
		{#key editing.id}
			<form method="POST" action="?/edit" novalidate>
				<div class="s-dialog__body">
					<input type="hidden" name="id" value={editing.id} />
					<Field id="editName" label="Category name"><input class="s-input" id="editName" name="name" maxlength="50" value={editing.name} /></Field>
					<fieldset style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
						<legend class="s-label" style="margin-bottom:6px">Tools in this category</legend>
						<p class="s-muted" style="font-size:13px">Tick a tool to put it in this category. A tool from another category moves here.</p>
						<div class="s-checklist" role="group">
							{#each data.allTools as t (t.id)}
								<label class="s-check">
									<input type="checkbox" name="tools" value={t.id} checked={t.catId === editing.id} />
									<span class="s-check__box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
									<span>{t.name}{#if t.catId !== editing.id}<span class="s-note">(now in {catName(t.catId)})</span>{/if}</span>
								</label>
							{/each}
						</div>
					</fieldset>
					<Field id="moveTo" label="Move the tools that you untick to">
						<select class="s-select" id="moveTo" name="moveTo">
							<option value="">Choose a category</option>
							{#each data.allCategories.filter((c) => c.id !== editing?.id) as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
						</select>
					</Field>
				</div>
				<div class="s-dialog__foot"><button class="s-btn s-btn--secondary" type="button" data-close>Cancel</button><button class="s-btn s-btn--primary">Save</button></div>
			</form>
		{/key}
	{/if}
</dialog>
