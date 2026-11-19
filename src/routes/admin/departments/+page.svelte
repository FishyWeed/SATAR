<script lang="ts">
	// Manage Departments: an add form, and a list where Edit opens a popup to rename a department and choose its users.
	import Empty from '#lib/Empty.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let dialog = $state<HTMLDialogElement>();
	let editing = $state<{ id: number; name: string } | null>(null);
	const depName = (id: number | null) => data.rows.find((r) => r.id === id)?.name ?? '-';

	function edit(d: { id: number; name: string }) {
		editing = d;
		if (dialog) window.SATAR.dialog(dialog).open();
	}
</script>

<PageHead title="Manage Departments" desc="Managers approve requests from their own department." />
<Msg {form} />
<form method="POST" action="?/add" class="s-card inline-form" novalidate>
	<Field id="name" label="Department name"><input class="s-input" id="name" name="name" maxlength="50" placeholder="For example, Legal" value={form && 'name' in form ? form.name : ''} /></Field>
	<button class="s-btn s-btn--primary">{@html icon('plus')}Add</button>
</form>
<section class="s-section">
	{#if data.rows.length}
		<TableWrap label="Manage Departments">
			<thead><tr><th scope="col">Department name</th><th scope="col" class="is-num">Users</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
			<tbody>
				{#each data.rows as r (r.id)}
					<tr>
						<td data-label="Department name"><b style="color:var(--text-strong);font-weight:550">{r.name}</b></td>
						<td data-label="Users" class="is-num">{r.n}</td>
						<td data-label="Action" class="s-actions"><button class="s-btn s-btn--secondary s-btn--sm" type="button" onclick={() => edit(r)}>{@html icon('edit')}Edit</button></td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="building" title="No departments yet" text="Add the first one above." />
	{/if}
</section>

<!-- Edit popup: the name of the department and the users in it. -->
<dialog class="s-dialog" bind:this={dialog} aria-labelledby="edit-title">
	<div class="s-dialog__head">
		<h2 class="s-dialog__title" id="edit-title">Edit department</h2>
		<button class="s-btn s-btn--ghost s-btn--icon" type="button" data-close aria-label="Close">{@html icon('x', 's-ic--md')}</button>
	</div>
	{#if editing}
		{#key editing.id}
			<form method="POST" action="?/edit" novalidate>
				<div class="s-dialog__body">
					<input type="hidden" name="id" value={editing.id} />
					<Field id="editName" label="Department name"><input class="s-input" id="editName" name="name" maxlength="50" value={editing.name} /></Field>
					<fieldset style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">
						<legend class="s-label" style="margin-bottom:6px">Users in this department</legend>
						<p class="s-muted" style="font-size:13px">Tick a user to put them in this department. A user from another department moves here.</p>
						<div class="s-checklist" role="group">
							{#each data.users as u (u.id)}
								<label class="s-check">
									<input type="checkbox" name="users" value={u.id} checked={u.depId === editing.id} />
									<span class="s-check__box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
									<span>{u.name} <span class="s-note">({u.role}{#if u.depId !== editing.id}, now in {depName(u.depId)}{/if})</span></span>
								</label>
							{/each}
						</div>
					</fieldset>
					<Field id="moveTo" label="Move the users that you untick to">
						<select class="s-select" id="moveTo" name="moveTo">
							<option value="">Choose a department</option>
							{#each data.rows.filter((r) => r.id !== editing?.id) as r (r.id)}<option value={r.id}>{r.name}</option>{/each}
						</select>
					</Field>
				</div>
				<div class="s-dialog__foot"><button class="s-btn s-btn--secondary" type="button" data-close>Cancel</button><button class="s-btn s-btn--primary">Save</button></div>
			</form>
		{/key}
	{/if}
</dialog>
