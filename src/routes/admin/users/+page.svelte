<script lang="ts">
	import { page } from '$app/state';
	import Empty from '#lib/Empty.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let dialog = $state<HTMLDialogElement>();
	let editDialog = $state<HTMLDialogElement>();
	type Row = PageProps['data']['users'][number];
	let editing = $state<Row | null>(null);
	function edit(u: Row) {
		editing = u;
		if (editDialog) window.SATAR.dialog(editDialog).open();
	}
	const link = (code: string) => `${page.url.origin}/join/${code}`;
	const openInvite = () => dialog && window.SATAR.dialog(dialog).open();

	// Cancelling an invite stops its link, so it asks first.
	function confirmCancel(e: SubmitEvent) {
		const f = e.currentTarget as HTMLFormElement;
		if (f.dataset.confirmed) return;
		e.preventDefault();
		window.SATAR.confirm({ title: 'Cancel this invite?', body: 'The link stops working. You can create a new one later.', confirm: 'Cancel invite', cancel: 'Keep invite' })
			.then((ok) => { if (ok) { f.dataset.confirmed = '1'; f.requestSubmit(); } });
	}
</script>

<PageHead title="Users" desc="People in your organization, their roles and open invites.">
	<button class="s-btn s-btn--primary" type="button" id="inviteBtn" onclick={openInvite}>{@html icon('plus')}Invite user</button>
</PageHead>
<Msg {form} />
{#if form && 'link' in form && form.link}
	<div class="s-card" style="margin-bottom:24px">
		<div class="s-linkbox">
			<span class="s-label">Invite link</span>
			<div class="s-linkbox__row">
				<code>{form.link}</code>
				<button class="s-btn s-btn--secondary s-copy" type="button" data-copy={form.link}>{@html icon('copy')}Copy</button>
				<span class="s-sr" aria-live="polite"></span>
			</div>
			<div class="s-linkbox__meta"><span>{@html icon('calendar', 's-ic--xs')}Expires in 7 days</span><span>{@html icon('lock', 's-ic--xs')}Single use</span></div>
		</div>
	</div>
{/if}

<TableWrap label="Users" md>
	<thead><tr><th scope="col">Name</th><th scope="col">Email id</th><th scope="col">Role</th><th scope="col">Department</th><th scope="col">Status</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
	<tbody>
		{#each data.users as u (u.id)}
			<tr>
				<td data-label="Name"><b style="color:var(--text-strong);font-weight:550">{u.first} {u.last}</b></td><td data-label="Email id">{u.email}</td>
				<td data-label="Role">{u.role}</td><td data-label="Department">{u.department}</td>
				<td data-label="Status">{@html badge(u.active ? 'active' : 'inactive')}</td>
				<td data-label="Action" class="s-actions"><button class="s-btn s-btn--secondary s-btn--sm" type="button" data-edit-user onclick={() => edit(u)}>{@html icon('edit')}Edit</button></td>
			</tr>
		{/each}
	</tbody>
</TableWrap>

<section class="s-section">
	<div class="s-section__head"><h2 class="s-section-title">Open invites</h2></div>
	{#if data.invites.length}
		<TableWrap label="Open invites" md>
			<thead><tr><th scope="col">Role</th><th scope="col">Department</th><th scope="col">Email lock</th><th scope="col">Expires</th><th scope="col" class="s-actions"><span class="s-sr">Actions</span></th></tr></thead>
			<tbody>
				{#each data.invites as i (i.id)}
					<tr>
						<td data-label="Role">{i.role}</td><td data-label="Department">{i.department}</td>
						<td data-label="Email lock">{#if i.email}<span class="s-row" style="--_gap:6px">{@html icon('lock', 's-ic--xs')}{i.email}</span>{:else}<span class="s-muted">Anyone with the link</span>{/if}</td>
						<td data-label="Expires">{fmtDate(i.expires)}</td>
						<td data-label="Actions" class="s-actions">
							<form method="POST" action="?/cancel" class="s-row" style="justify-content:flex-end;--_gap:6px" onsubmit={confirmCancel}>
								<button class="s-btn s-btn--secondary s-btn--sm s-copy" type="button" data-copy={link(i.code)}>{@html icon('copy')}Copy link</button>
								<input type="hidden" name="id" value={i.id} /><button class="s-btn s-btn--tertiary s-btn--sm">Cancel invite</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="link" title="No open invites" text="Invite people with a single-use link.">
			<button class="s-btn s-btn--secondary" type="button" onclick={openInvite}>{@html icon('plus')}Invite user</button>
		</Empty>
	{/if}
</section>

<!-- Edit user popup: name, role, department and status. The email id belongs to the person's own account. -->
<dialog class="s-dialog" bind:this={editDialog} aria-labelledby="edit-title">
	<div class="s-dialog__head">
		<h2 class="s-dialog__title" id="edit-title">Edit user</h2>
		<button class="s-btn s-btn--ghost s-btn--icon" type="button" data-close aria-label="Close">{@html icon('x', 's-ic--md')}</button>
	</div>
	{#if editing}
		{#key editing.id}
			<form method="POST" action="?/edit" novalidate>
				<div class="s-dialog__body">
					<input type="hidden" name="id" value={editing.id} />
					<div class="s-grid-2" style="gap:16px">
						<Field id="first" label="First name"><input class="s-input" id="first" name="first" maxlength="50" value={editing.first} /></Field>
						<Field id="last" label="Last name"><input class="s-input" id="last" name="last" maxlength="50" value={editing.last} /></Field>
					</div>
					<Field id="email" label="Email id" hint="People change their own email id.">
						<input class="s-input" id="email" value={editing.email} readonly aria-readonly="true" aria-describedby="email-hint" />
					</Field>
					<div class="s-grid-2" style="gap:16px">
						<Field id="editRole" label="Role">
							<select class="s-select" id="editRole" name="role"><option value="">Choose a role</option>{#each data.roles as r (r)}<option selected={r === editing.role}>{r}</option>{/each}</select>
						</Field>
						<Field id="editDep" label="Department">
							<select class="s-select" id="editDep" name="dep"><option value="">Choose a department</option>{#each data.departments as d (d.dep_id)}<option value={d.dep_id} selected={d.dep_id === editing.depId}>{d.dep_name}</option>{/each}</select>
						</Field>
					</div>
					<label class="s-check">
						<input type="checkbox" name="active" checked={editing.active} />
						<span class="s-check__box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
						<span class="s-check__text">Active<small>Inactive users cannot sign in. Their decisions stay in the audit log.</small></span>
					</label>
				</div>
				<div class="s-dialog__foot"><button class="s-btn s-btn--secondary" type="button" data-close>Cancel</button><button class="s-btn s-btn--primary">Save user</button></div>
			</form>
		{/key}
	{/if}
</dialog>

<!-- Invite popup: role and department of the new member, and an optional email id lock. -->
<dialog class="s-dialog" bind:this={dialog} aria-labelledby="invite-title">
	<div class="s-dialog__head">
		<h2 class="s-dialog__title" id="invite-title">Invite user</h2>
		<button class="s-btn s-btn--ghost s-btn--icon" type="button" data-close aria-label="Close">{@html icon('x', 's-ic--md')}</button>
	</div>
	<form method="POST" action="?/invite" novalidate>
		<div class="s-dialog__body">
			<p class="s-muted" style="font-size:14px">Create a single-use link. Send it to the person by email or chat.</p>
			<Field id="role" label="Role">
				<select class="s-select" id="role" name="role"><option value="">Choose a role</option>{#each data.roles as r (r)}<option>{r}</option>{/each}</select>
			</Field>
			<Field id="dep" label="Department">
				<select class="s-select" id="dep" name="dep"><option value="">Choose a department</option>{#each data.departments as d (d.dep_id)}<option value={d.dep_id}>{d.dep_name}</option>{/each}</select>
			</Field>
			<Field id="inviteEmail" label="Email id" optional hint="Only this email id can use the link.">
				<input class="s-input" id="inviteEmail" name="email" type="email" maxlength="60" aria-describedby="inviteEmail-hint" />
			</Field>
		</div>
		<div class="s-dialog__foot"><button class="s-btn s-btn--secondary" type="button" data-close>Cancel</button><button class="s-btn s-btn--primary">Create invite</button></div>
	</form>
</dialog>
