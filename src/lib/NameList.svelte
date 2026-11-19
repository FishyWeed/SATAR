<script lang="ts">
	// The page of Manage Departments: an add form and a list where each name can be renamed.
	import Empty from '#lib/Empty.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { icon } from '#lib/ui.ts';

	let { title, desc, label, countLabel, rows, form }: {
		title: string; desc: string; label: string; countLabel: string;
		rows: { id: number; name: string; n: number }[];
		form?: { error?: string; message?: string; name?: string } | null;
	} = $props();
</script>

<PageHead {title} {desc} />
<Msg {form} />
<form method="POST" action="?/add" class="s-card inline-form" novalidate>
	<Field id="name" label={label}><input class="s-input" id="name" name="name" maxlength="50" placeholder="For example, Legal" value={form?.name ?? ''} /></Field>
	<button class="s-btn s-btn--primary">{@html icon('plus')}Add</button>
</form>
<section class="s-section">
	{#if rows.length}
		<TableWrap label={title}>
			<thead><tr><th scope="col">{label}</th><th scope="col" class="is-num">{countLabel}</th><th scope="col" class="s-actions">Rename</th></tr></thead>
			<tbody>
				{#each rows as r (r.id)}
					<tr>
						<td data-label={label}><b style="color:var(--text-strong);font-weight:550">{r.name}</b></td>
						<td data-label={countLabel} class="is-num">{r.n}</td>
						<td data-label="Rename" class="s-actions">
							<form method="POST" action="?/rename" class="rename" novalidate>
								<input type="hidden" name="id" value={r.id} />
								<label class="s-sr" for="rn{r.id}">New name of {r.name}</label>
								<input class="s-input" id="rn{r.id}" name="name" maxlength="50" value={r.name} />
								<button class="s-btn s-btn--secondary s-btn--sm">Save</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="building" title="No departments yet" text="Add the first one above." />
	{/if}
</section>
