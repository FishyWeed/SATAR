<script lang="ts">
	import Banner from '#lib/Banner.svelte';
	import DataClasses from '#lib/DataClasses.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { fmtDate } from '#lib/rules.ts';
	import { badge, icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived(data.tool);
</script>

<PageHead title="Tool Details" desc="{t.tol_name} by {t.tol_vendor}" back={['/catalogue', 'Back to catalogue']} />
<div class="two-col">
	<div class="s-stack" style="--_gap:24px">
		{#if t.tol_status === 'Approved' && t.tol_data_class}
			<div class="s-highlight">
				<span class="s-highlight__icon">{@html icon('shield-check', 's-ic--lg')}</span>
				<div class="s-highlight__text">Approved for data up to<strong>{t.tol_data_class}</strong>Never use more sensitive data with this tool.</div>
			</div>
		{:else if t.tol_status === 'Banned'}
			<Banner kind="error" title="This tool is banned"><p>Do not use it for any work.</p></Banner>
		{:else if t.tol_status === 'Rejected'}
			<Banner kind="warning" title="This tool is not approved"><p>Do not use it for work.</p></Banner>
		{:else}
			<Banner kind="info" title="This tool is waiting for a decision"><p>Do not use it for work until it is approved.</p></Banner>
		{/if}
		<div class="s-card">
			<dl class="s-dl">
				<div><dt>Tool name</dt><dd>{t.tol_name}</dd></div>
				<div><dt>Vendor</dt><dd>{t.tol_vendor}</dd></div>
				<div><dt>URL</dt><dd><a class="s-link" href={t.tol_url} rel="noopener noreferrer" target="_blank">{t.tol_url.replace(/^https?:\/\//, '')}{@html icon('external', 's-ic--xs')}</a></dd></div>
				<div><dt>Categories</dt><dd>{t.categories}</dd></div>
				<div><dt>Status</dt><dd>{@html badge(t.tol_status)}</dd></div>
				<div><dt>Risk level</dt><dd>{@html badge(t.tol_risk)}</dd></div>
				<div><dt>Allowed data class</dt><dd>{@html badge(t.tol_data_class)}</dd></div>
				<div><dt>Conditions of use</dt><dd>{t.tol_conditions ?? 'Not set'}</dd></div>
				<div><dt>Next review date</dt><dd>{t.tol_review_date ? fmtDate(t.tol_review_date) : 'Not set'}</dd></div>
			</dl>
		</div>
	</div>
	<DataClasses title="The four data classes" />
</div>
