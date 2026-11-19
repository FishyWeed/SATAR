<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHead title="My Requests" desc="Follow each request from your Manager to the Reviewer.">
	<a class="s-btn s-btn--primary" href="/requests/new">{@html icon('plus')}New request</a>
</PageHead>
{#if data.requests.length}
	<TableWrap label="My requests" md>
		<thead><tr><th scope="col">Tool</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col">Manager note</th><th scope="col">Reviewer note</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
		<tbody>
			{#each data.requests as r (r.id)}
				<tr>
					<td data-label="Tool"><a href="/requests/{r.id}">{r.tool}</a></td>
					<td data-label="Date">{fmtDate(r.date)}</td>
					<td data-label="Status">{@html badge(r.status)}</td>
					<td data-label="Manager note">{#if r.mgrNote}{r.mgrNote}{:else}<span class="s-muted">None yet</span>{/if}</td>
					<td data-label="Reviewer note">{#if r.revNote}{r.revNote}{:else}<span class="s-muted">None yet</span>{/if}</td>
					<td data-label="Action" class="s-actions"><a class="s-btn s-btn--secondary s-btn--sm" href="/requests/{r.id}">View</a></td>
				</tr>
			{/each}
		</tbody>
	</TableWrap>
{:else}
	<Empty ic="inbox" title="You have no requests yet" text="Request a tool when the one you need is not in the register.">
		<a class="s-btn s-btn--primary" href="/requests/new">{@html icon('plus')}New request</a>
	</Empty>
{/if}
