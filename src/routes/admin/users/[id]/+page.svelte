<script lang="ts">
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const u = $derived(data.edited);
	// After an error, show what the Administrator typed; otherwise the saved user.
	const v = $derived(form && 'error' in form ? form
		: { first: u.usr_f_name, last: u.usr_l_name, role: u.usr_role ?? '', dep: u.dep_id ?? 0, active: u.usr_active });
</script>

<PageHead title="Edit User" desc="{u.usr_f_name} {u.usr_l_name}" back={['/admin/users', 'Back to users']} />
<form method="POST" class="s-card s-form" novalidate>
	<Msg {form} />
	<div class="s-grid-2" style="gap:20px">
		<Field id="first" label="First name"><input class="s-input" id="first" name="first" maxlength="50" value={v.first} /></Field>
		<Field id="last" label="Last name"><input class="s-input" id="last" name="last" maxlength="50" value={v.last} /></Field>
	</div>
	<Field id="email" label="Email id" hint="People change their own email id.">
		<input class="s-input" id="email" value={u.usr_email} readonly aria-readonly="true" aria-describedby="email-hint" />
	</Field>
	<div class="s-grid-2" style="gap:20px">
		<Field id="role" label="Role">
			<select class="s-select" id="role" name="role"><option value="">Choose a role</option>{#each data.roles as r (r)}<option selected={r === v.role}>{r}</option>{/each}</select>
		</Field>
		<Field id="dep" label="Department">
			<select class="s-select" id="dep" name="dep"><option value="">Choose a department</option>{#each data.departments as d (d.dep_id)}<option value={d.dep_id} selected={d.dep_id === v.dep}>{d.dep_name}</option>{/each}</select>
		</Field>
	</div>
	<label class="s-check">
		<input type="checkbox" name="active" checked={v.active} />
		<span class="s-check__box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
		<span class="s-check__text">Active<small>Inactive users cannot sign in. Their decisions stay in the audit log.</small></span>
	</label>
	<div class="s-form-actions"><button class="s-btn s-btn--primary">Save user</button><a class="s-btn s-btn--secondary" href="/admin/users">Cancel</a></div>
</form>
