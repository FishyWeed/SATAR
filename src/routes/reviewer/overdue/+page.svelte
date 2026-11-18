<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Overdue Reviews</h1>
{#if data.tools.length}
	<div class="table-wrap">
		<table>
			<thead><tr><th>Tool</th><th>Review date</th><th>Days overdue</th><th>Risk level</th><th></th></tr></thead>
			<tbody>
				{#each data.tools as t (t.id)}
					<tr>
						<td>{t.name}</td><td>{fmtDate(t.reviewDate)}</td><td>{t.daysOverdue}</td><td>{t.risk ?? '-'}</td>
						<td>{#if t.lastRequest}<a href="/reviewer/queue/{t.lastRequest}">Re-check</a>{/if}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="msg" role="status">No overdue tools</p>
{/if}
