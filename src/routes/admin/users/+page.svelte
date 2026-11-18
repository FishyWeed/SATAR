<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Manage Users</h1>
<p><a class="button" href="/admin/users/new">Add user</a></p>
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
