<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const u = $derived(data.edited);
	// After an error, show what the Administrator typed; otherwise the saved user.
	const v = $derived(form && 'error' in form ? form
		: { first: u.usr_f_name, last: u.usr_l_name, role: u.usr_role ?? '', dep: u.dep_id ?? 0, active: u.usr_active });
</script>

<h1>Edit User</h1>
<Msg {form} />
<form method="POST" class="stack" novalidate>
	<label>First name <input name="first" maxlength="50" value={v.first} /></label>
	<label>Last name <input name="last" maxlength="50" value={v.last} /></label>
	<label>Email id <input value={u.usr_email} readonly aria-readonly="true" /></label>
	<label>Role
		<select name="role"><option value="">Select</option>{#each data.roles as r (r)}<option selected={r === v.role}>{r}</option>{/each}</select>
	</label>
	<label>Department
		<select name="dep"><option value="">Select</option>{#each data.departments as d (d.dep_id)}<option value={d.dep_id} selected={d.dep_id === v.dep}>{d.dep_name}</option>{/each}</select>
	</label>
	<label class="radio"><input type="checkbox" name="active" checked={v.active} /> Active (the user can sign in)</label>
	<div class="row"><button>Save user</button><a class="button" href="/admin/users">Cancel</a></div>
</form>
