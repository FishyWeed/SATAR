<script lang="ts">
	// The catalogue of AI tools for every member. The Administrator also has a Categories tab to add and edit
	// categories, in one popup. A click on a column heading sorts the tools; an Employee can request a tool from here.
	// The page has every tool and filters the list itself, so a change shows at once without a server load.
	import Banner from '#lib/Banner.svelte';
	import Empty from '#lib/Empty.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { keepInUrl } from '#lib/live.ts';
	import { DATA_CLASSES, MSG, RISKS, isRequestable } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const canRequest = $derived(data.user?.role === 'Employee');
	const isAdmin = $derived(data.user?.role === 'Administrator');
	// The filters start from the URL and change as the user types or chooses; keepInUrl writes them back into the URL.
	let q = $derived(data.q), cat = $derived(data.cat), status = $derived(data.status);
	const filtered = $derived(!!(q || cat || status));
	const key = $derived(q.trim().toLowerCase());
	const tooLong = $derived(key.length > 50);
	const tools = $derived(tooLong ? [] : data.tools.filter((t) => (!key || t.name.toLowerCase().includes(key))
		&& (!cat || (cat === 'none' ? !t.catIds.length : t.catIds.includes(Number(cat)))) && (!status || t.status === status)));
	const categories = $derived(tooLong ? [] : data.categories.filter((c) => !key || c.name.toLowerCase().includes(key)));
	$effect(() => keepInUrl(data.view === 'categories' ? { view: 'categories', q: q.trim() } : { q: q.trim(), cat, status }));
	function read(e: Event) {
		const f = new FormData(e.currentTarget as HTMLFormElement);
		[q, cat, status] = ['q', 'cat', 'status'].map((k) => String(f.get(k) ?? ''));
	}
	const clear = (e: Event) => { e.preventDefault(); q = cat = status = ''; };

	// Sorting on the page: by name first; a second click on the same heading turns the order round.
	// Risk and data class sort by level (Low to High, Public to Restricted); empty values stay last.
	const COLS = [['name', 'Tool'], ['categories', 'Categories'], ['status', 'Status'], ['risk', 'Risk'], ['dataClass', 'Data class']] as const;
	type Key = (typeof COLS)[number][0];
	let sort = $state<{ key: Key; dir: 1 | -1 }>({ key: 'name', dir: 1 });
	const sortBy = (key: Key) => (sort = { key, dir: sort.key === key ? (-sort.dir as 1 | -1) : 1 });
	const sorted = $derived.by(() => {
		const { key, dir } = sort;
		const val = (t: (typeof data.tools)[number]) => {
			const v = t[key];
			if (v == null || v === '-') return null;
			return key === 'risk' ? RISKS.indexOf(v as never) : key === 'dataClass' ? DATA_CLASSES.indexOf(v as never) : String(v);
		};
		return [...tools].sort((a, b) => {
			const x = val(a), y = val(b);
			if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
			return dir * (typeof x === 'number' ? x - (y as number) : x.localeCompare(y as string));
		});
	});

	// The popup: id 0 adds a new category, any other id edits that category.
	let dialog = $state<HTMLDialogElement>();
	let editing = $state<{ id: number; name: string } | null>(null);
	function open(c: { id: number; name: string }) {
		editing = c;
		if (dialog) window.SATAR.dialog(dialog).open();
	}
	// The other categories of a tool, shown next to its tick box.
	const others = (catIds: number[], id: number) =>
		data.allCategories.filter((c) => c.id !== id && catIds.includes(c.id)).map((c) => c.name).join(', ');
</script>

<PageHead title="Catalogue" desc="Check if a tool is approved before you use it. Approved tools show the most sensitive data you may use with them.">
	{#if canRequest}<a class="s-btn s-btn--primary" href="/requests/new">{@html icon('plus')}Request a tool</a>{/if}
	{#if isAdmin}<button class="s-btn s-btn--primary" type="button" id="addCategory" onclick={() => open({ id: 0, name: '' })}>{@html icon('plus')}Add category</button>{/if}
</PageHead>
<Msg {form} />
{#if tooLong}<Banner kind="error" title={MSG.keyword}><p>Use up to 50 characters.</p></Banner>{/if}

{#if isAdmin}
	<nav class="tabs" aria-label="Catalogue views">
		<a href="/catalogue" aria-current={data.view === 'tools' ? 'page' : undefined}>{@html icon('grid')}Tools</a>
		<a href="/catalogue?view=categories" aria-current={data.view === 'categories' ? 'page' : undefined}>{@html icon('tag')}Categories</a>
	</nav>
{/if}

<form oninput={read} onsubmit={(e) => e.preventDefault()} method="GET" class="s-filterbar" role="search" aria-label="Filter the catalogue" style="--_selects:{data.view === 'tools' ? 2 : 0}">
	{#if data.view === 'categories'}<input type="hidden" name="view" value="categories" />{/if}
	<Field id="q" label="Keyword"><input class="s-input" id="q" name="q" placeholder={data.view === 'tools' ? 'Tool name' : 'Category name'} value={q} /></Field>
	{#if data.view === 'tools'}
		<Field id="cat" label="Category">
			<select class="s-select" id="cat" name="cat">
				<option value="">All categories</option>
				<option value="none" selected={cat === 'none'}>None</option>
				{#each data.allCategories as c (c.id)}<option value={c.id} selected={String(c.id) === cat}>{c.name}</option>{/each}
			</select>
		</Field>
		<Field id="status" label="Status">
			<select class="s-select" id="status" name="status">
				<option value="">All statuses</option>
				{#each data.statuses as s (s)}<option selected={s === status}>{s}</option>{/each}
			</select>
		</Field>
	{/if}
	<div class="s-btn-row">
		<button class="s-btn s-btn--secondary">{@html icon('filter')}Search</button>
		{#if filtered}<a class="s-btn s-btn--tertiary" onclick={clear} href={data.view === 'tools' ? '/catalogue' : '/catalogue?view=categories'}>Clear</a>{/if}
	</div>
</form>

<section class="s-section">
	{#if data.view === 'tools'}
		{#if tools.length}
			<div class="s-section__head"><p class="s-muted s-num">{tools.length} tool{tools.length === 1 ? '' : 's'}</p></div>
			<TableWrap label="AI tools" md>
				<thead>
					<tr>
						{#each COLS as [key, label] (key)}
							<th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
								<button class="th-sort" type="button" onclick={() => sortBy(key)}>{label}{@html icon(sort.key === key && sort.dir === -1 ? 'chevron-down' : 'chevron-up', 's-ic--xs')}</button>
							</th>
						{/each}
						<th scope="col" class="s-actions"><span class="s-sr">Action</span></th>
					</tr>
				</thead>
				<tbody>
					{#each sorted as t (t.id)}
						<tr>
							<td data-label="Tool"><a href="/catalogue/{t.id}">{t.name}</a><span class="s-sub">{t.vendor}</span></td>
							<td data-label="Categories">{t.categories}</td>
							<td data-label="Status">{@html badge(t.status)}</td>
							<td data-label="Risk">{@html badge(t.risk)}</td>
							<td data-label="Data class">{@html badge(t.dataClass)}</td>
							<td data-label="Action" class="s-actions">
								<a class="s-btn s-btn--secondary s-btn--sm" href="/catalogue/{t.id}">View</a>
								{#if canRequest && isRequestable(t.status)}<a class="s-btn s-btn--primary s-btn--sm" href="/requests/new?tool={t.id}">Request</a>{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</TableWrap>
		{:else if !tooLong}
			<Empty title={MSG.noTool} text="Try another keyword, category or status. If the tool is new, request it.">
				{#if canRequest}<a class="s-btn s-btn--secondary s-btn--sm" href="/requests/new">{@html icon('plus')}Request a tool</a>{/if}
			</Empty>
		{/if}
	{:else if categories.length}
		<TableWrap label="Categories">
			<thead><tr><th scope="col">Category</th><th scope="col" class="is-num">Tools</th>{#if isAdmin}<th scope="col" class="s-actions"><span class="s-sr">Action</span></th>{/if}</tr></thead>
			<tbody>
				{#each categories as c (c.id)}
					<tr>
						<td data-label="Category"><a href="/catalogue?cat={c.id}">{c.name}</a></td><td data-label="Tools" class="is-num">{c.n}</td>
						{#if isAdmin}<td data-label="Action" class="s-actions"><button class="s-btn s-btn--secondary s-btn--sm" type="button" onclick={() => open(c)}>{@html icon('edit')}Edit</button></td>{/if}
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else if !tooLong}
		<Empty ic="tag" title="No category found" text="Try another keyword." />
	{/if}
</section>

<!-- Add or edit a category: its name and its tools. A tool can be in many categories. -->
<dialog class="s-dialog" bind:this={dialog} aria-labelledby="category-title">
	<div class="s-dialog__head">
		<h2 class="s-dialog__title" id="category-title">{editing?.id ? 'Edit category' : 'Add category'}</h2>
		<button class="s-btn s-btn--ghost s-btn--icon" type="button" data-close aria-label="Close">{@html icon('x', 's-ic--md')}</button>
	</div>
	{#if editing}
		{#key editing.id}
			<form method="POST" action={editing.id ? '?/edit' : '?/add'} novalidate>
				<div class="s-dialog__body">
					{#if editing.id}<input type="hidden" name="id" value={editing.id} />{/if}
					<Field id="categoryName" label="Category name"><input class="s-input" id="categoryName" name="name" maxlength="50" placeholder="For example, Video" value={editing.name} /></Field>
					<fieldset style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
						<legend class="s-label" style="margin-bottom:6px">Tools in this category</legend>
						<p class="s-muted" style="font-size:13px">A tool can be in many categories. A tool in no category shows "-".</p>
						<div class="s-checklist" role="group">
							{#each data.tools as t (t.id)}
								{@const also = others(t.catIds, editing.id)}
								<label class="s-check">
									<input type="checkbox" name="tools" value={t.id} checked={t.catIds.includes(editing.id)} />
									<span class="s-check__box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
									<span>{t.name}{#if also}<span class="s-note">({t.catIds.includes(editing.id) ? 'also in' : 'in'} {also})</span>{/if}</span>
								</label>
							{/each}
						</div>
					</fieldset>
				</div>
				<div class="s-dialog__foot"><button class="s-btn s-btn--secondary" type="button" data-close>Cancel</button><button class="s-btn s-btn--primary">{editing.id ? 'Save' : 'Confirm'}</button></div>
			</form>
		{/key}
	{/if}
</dialog>
