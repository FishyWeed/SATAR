<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const u = $derived(data.user!);
</script>

<h1>My Profile</h1>
<dl>
	<dt>Name</dt><dd>{u.firstName} {u.lastName}</dd>
	<dt>Email id</dt><dd>{u.email}</dd>
	<dt>Role</dt><dd>{u.role ?? '-'}</dd>
	<dt>Department</dt><dd>{data.department}</dd>
	<dt>Organization</dt><dd>{u.orgName ?? (u.role === 'Owner' ? 'SATAR platform' : '-')}</dd>
</dl>
<form method="POST" action="?/signout" class="row">
	<a class="button" href="/reset-password">Change password</a>
	<button>Sign out</button>
</form>
