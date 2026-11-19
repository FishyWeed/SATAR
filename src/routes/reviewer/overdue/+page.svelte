<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import TableWrap from '#lib/TableWrap.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHead title="Overdue Reviews" desc="Approved tools past their review date. Oldest first. Check each one again." />
{#if data.tools.length}
	<TableWrap label="Overdue reviews" md>
		<thead><tr><th scope="col">Tool</th><th scope="col">Review date</th><th scope="col" class="is-num">Days overdue</th><th scope="col">Risk</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
		<tbody>
			{#each data.tools as t (t.id)}
				<tr>
					<td data-label="Tool"><a href="/register/{t.id}">{t.name}</a></td><td data-label="Review date">{fmtDate(t.reviewDate)}</td>
					<td data-label="Days overdue" class="is-num"><b style="color:{t.daysOverdue > 30 ? 'var(--error-fg)' : 'var(--warning-fg)'}">{t.daysOverdue}</b></td>
					<td data-label="Risk">{@html badge(t.risk)}</td>
					<td data-label="Action" class="s-actions">{#if t.lastRequest}<a class="s-btn s-btn--secondary s-btn--sm" href="/reviewer/queue/{t.lastRequest}">{@html icon('refresh')}Re-check</a>{/if}</td>
				</tr>
			{/each}
		</tbody>
	</TableWrap>
{:else}
	<Empty ic="check-circle" title="No overdue tools" text="Every approved tool is within its review date." />
{/if}
