<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { badge } from '#lib/ui.ts';
	import type { PageProps } from './$types';
	import TableWrap from '#lib/TableWrap.svelte';

	let { data }: PageProps = $props();
</script>

<PageHead title="Department Tools" desc="Tools that people in your department requested." />
{#if data.tools.length}
	<TableWrap label="Department tools" md>
		<thead><tr><th scope="col">Tool</th><th scope="col">Status</th><th scope="col">Risk</th><th scope="col">Data class</th><th scope="col" class="is-num">Users</th></tr></thead>
		<tbody>
			{#each data.tools as t (t.id)}
				<tr>
					<td data-label="Tool"><a href="/register/{t.id}">{t.name}</a></td><td data-label="Status">{@html badge(t.status)}</td>
					<td data-label="Risk">{@html badge(t.risk)}</td><td data-label="Data class">{@html badge(t.dataClass)}</td><td data-label="Users" class="is-num">{t.users}</td>
				</tr>
			{/each}
		</tbody>
	</TableWrap>
{:else}
	<Empty ic="grid" title="No tools yet" text="Tools that your department requests show here." />
{/if}
