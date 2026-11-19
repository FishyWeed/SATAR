<script lang="ts">
	import Banner from '#lib/Banner.svelte';
	import Empty from '#lib/Empty.svelte';
	import Field from '#lib/Field.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { MSG } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';
	import TableWrap from '#lib/TableWrap.svelte';

	let { data }: PageProps = $props();
	const canRequest = $derived(data.user?.role === 'Employee');
</script>

<PageHead title="AI Tool Register" desc="Check if a tool is approved before you use it. Approved tools show the most sensitive data you may use with them.">
	{#if canRequest}<a class="s-btn s-btn--primary" href="/requests/new">{@html icon('plus')}Request a tool</a>{/if}
</PageHead>
{#if data.error && data.error !== MSG.noTool}<Banner kind="error" title={data.error}><p>Use up to 50 characters.</p></Banner>{/if}
<form method="GET" class="s-filterbar" role="search" style="--_selects:1">
	<Field id="q" label="Keyword"><input class="s-input" id="q" name="q" placeholder="Tool name" value={data.q} /></Field>
	<Field id="cat" label="Category">
		<select class="s-select" id="cat" name="cat">
			<option value="">All categories</option>
			{#each data.categories as c (c.cat_id)}<option value={c.cat_id} selected={c.cat_id === data.cat}>{c.cat_name}</option>{/each}
		</select>
	</Field>
	<div class="s-btn-row">
		<button class="s-btn s-btn--secondary">{@html icon('filter')}Search</button>
		{#if data.q || data.cat}<a class="s-btn s-btn--tertiary" href="/register">Clear</a>{/if}
	</div>
</form>
<section class="s-section">
	{#if data.tools.length}
		<div class="s-section__head"><p class="s-muted s-num">{data.tools.length} tool{data.tools.length === 1 ? '' : 's'}</p></div>
		<TableWrap label="AI tools" md>
			<thead><tr><th scope="col">Tool</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Risk</th><th scope="col">Data class</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
			<tbody>
				{#each data.tools as t (t.id)}
					<tr>
						<td data-label="Tool"><a href="/register/{t.id}">{t.name}</a><span class="s-sub">{t.vendor}</span></td>
						<td data-label="Category">{t.category}</td>
						<td data-label="Status">{@html badge(t.status)}</td>
						<td data-label="Risk">{@html badge(t.risk)}</td>
						<td data-label="Data class">{@html badge(t.dataClass)}</td>
						<td data-label="Action" class="s-actions"><a class="s-btn s-btn--secondary s-btn--sm" href="/register/{t.id}">View</a></td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else if data.error === MSG.noTool}
		<Empty title={data.error} text="Try another keyword or category. If the tool is new, request it.">
			{#if canRequest}<a class="s-btn s-btn--secondary s-btn--sm" href="/requests/new">{@html icon('plus')}Request a tool</a>{/if}
		</Empty>
	{/if}
</section>
