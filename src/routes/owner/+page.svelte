<script lang="ts">
	import Empty from '#lib/Empty.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import Stats from '#lib/Stats.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';
	import TableWrap from '#lib/TableWrap.svelte';

	let { data, form }: PageProps = $props();

	// Deactivating or reactivating an organization changes who can sign in, so it asks first.
	function confirmToggle(e: SubmitEvent, o: { name: string; users: number; active: boolean }) {
		const f = e.currentTarget as HTMLFormElement;
		if (f.dataset.confirmed) return;
		e.preventDefault();
		const opts = o.active
			? { title: `Deactivate ${o.name}?`, body: `Its ${o.users} users cannot sign in until you reactivate it. No data is deleted.`, confirm: 'Deactivate' }
			: { title: `Reactivate ${o.name}?`, body: 'Its users can sign in again.', confirm: 'Reactivate', danger: false };
		window.SATAR.confirm(opts).then((ok) => { if (ok) { f.dataset.confirmed = '1'; f.requestSubmit(); } });
	}
</script>

<PageHead title="Organizations" desc="Every organization on SATAR. You see their size, not the data inside them." />
<Msg {form} />
<Stats items={[
	{ label: 'Organizations', value: data.totals.orgs, icon: 'building' },
	{ label: 'Active', value: data.totals.active, icon: 'check-circle' },
	{ label: 'Users in total', value: data.totals.users, icon: 'users' }
]} />
<section class="s-section">
	<form method="GET" class="s-search" role="search">
		<div class="s-input-group">
			<span class="s-input-lead">{@html icon('search')}</span>
			<label class="s-sr" for="q">Search organizations by name</label>
			<input class="s-input" id="q" name="q" placeholder="Search by name" value={data.q} />
		</div>
		<button class="s-btn s-btn--secondary">Search</button>
	</form>
	{#if data.orgs.length}
		<TableWrap label="Organizations" md>
			<thead><tr><th scope="col">Organization</th><th scope="col">Administrators</th><th scope="col" class="is-num">Users</th><th scope="col">Created</th><th scope="col">Status</th><th scope="col" class="s-actions"><span class="s-sr">Action</span></th></tr></thead>
			<tbody>
				{#each data.orgs as o (o.id)}
					<tr>
						<td data-label="Organization"><b style="color:var(--text-strong);font-weight:550">{o.name}</b></td><td data-label="Administrators">{o.admins}</td>
						<td data-label="Users" class="is-num">{o.users}</td><td data-label="Created">{fmtDate(o.created)}</td>
						<td data-label="Status">{@html badge(o.active ? 'active' : 'inactive')}</td>
						<td data-label="Action" class="s-actions">
							<form method="POST" action="?/toggle" onsubmit={(e) => confirmToggle(e, o)}>
								<input type="hidden" name="id" value={o.id} />
								<button class="s-btn s-btn--secondary s-btn--sm">{@html icon(o.active ? 'power' : 'refresh')}{o.active ? 'Deactivate' : 'Reactivate'}</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</TableWrap>
	{:else}
		<Empty ic="building" title="No organization found" text="Check the spelling of the name." />
	{/if}
</section>
