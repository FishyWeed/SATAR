<script lang="ts">
	import { page } from '$app/state';
	import Msg from '#lib/Msg.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let dialog = $state<HTMLDialogElement>();
	let copied = $state('');
	const link = (code: string) => `${page.url.origin}/join/${code}`;

	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = text;
	}
</script>

<h1>Users</h1>
<Msg {form} />
{#if form && 'link' in form && form.link}
	<div class="invite-box">
		<code>{form.link}</code>
		<button type="button" onclick={() => copy(String(form.link))}>{copied === form.link ? 'Copied' : 'Copy link'}</button>
		<p class="muted">The link works once and expires in 7 days.</p>
	</div>
{/if}
<p><button type="button" onclick={() => dialog?.showModal()}>Invite user</button></p>

<div class="table-wrap">
	<table>
		<thead><tr><th>Name</th><th>Email id</th><th>Role</th><th>Department</th><th>Active</th><th></th></tr></thead>
		<tbody>
			{#each data.users as u (u.id)}
				<tr>
					<td>{u.first} {u.last}</td><td>{u.email}</td><td>{u.role}</td><td>{u.department}</td><td>{u.active ? 'Yes' : 'No'}</td>
					<td><a href="/admin/users/{u.id}">Edit</a></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<h2>Open invites</h2>
{#if data.invites.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Role</th><th>Department</th><th>For email id</th><th>Expires</th><th></th><th></th></tr></thead>
			<tbody>
				{#each data.invites as i (i.id)}
					<tr>
						<td>{i.role}</td><td>{i.department}</td><td>{i.email ?? 'Anyone with the link'}</td><td>{fmtDate(i.expires)}</td>
						<td><button type="button" onclick={() => copy(link(i.code))}>{copied === link(i.code) ? 'Copied' : 'Copy link'}</button></td>
						<td><form method="POST" action="?/cancel"><input type="hidden" name="id" value={i.id} /><button>Cancel invite</button></form></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No open invites</p>
{/if}

<!-- Invite popup: role and department of the new member, and an optional email id lock. -->
<dialog bind:this={dialog} aria-labelledby="invite-title">
	<form method="POST" action="?/invite" class="stack" novalidate>
		<h2 id="invite-title">Invite user</h2>
		<label>Role
			<select name="role"><option value="">Select</option>{#each data.roles as r (r)}<option>{r}</option>{/each}</select>
		</label>
		<label>Department
			<select name="dep"><option value="">Select</option>{#each data.departments as d (d.dep_id)}<option value={d.dep_id}>{d.dep_name}</option>{/each}</select>
		</label>
		<label>Email id (optional: only this person can use the link) <input name="email" type="email" maxlength="60" /></label>
		<div class="row"><button>Create invite</button><button type="button" onclick={() => dialog?.close()}>Cancel</button></div>
	</form>
</dialog>
