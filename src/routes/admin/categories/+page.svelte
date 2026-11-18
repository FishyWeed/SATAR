<script lang="ts">
	import NameList from '#lib/NameList.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<NameList title="Manage Categories" label="Category name" countLabel="Tools" rows={data.rows} {form} />
