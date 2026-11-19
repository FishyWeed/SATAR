<script lang="ts">
	import NameList from '#lib/NameList.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<NameList title="Manage Departments" desc="Managers approve requests from their own department." label="Department name" countLabel="Users" rows={data.rows} {form} />
