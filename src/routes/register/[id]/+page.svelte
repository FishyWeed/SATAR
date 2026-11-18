<script lang="ts">
	import { fmtDate } from '#lib/rules.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived(data.tool);
</script>

<h1>Tool Details</h1>
<dl>
	<dt>Tool name</dt><dd>{t.tol_name}</dd>
	<dt>Vendor</dt><dd>{t.tol_vendor}</dd>
	<dt>URL</dt><dd><a href={t.tol_url} rel="noopener noreferrer" target="_blank">{t.tol_url}</a></dd>
	<dt>Category</dt><dd>{t.category}</dd>
	<dt>Status</dt><dd>{t.tol_status}</dd>
	<dt>Risk level</dt><dd>{t.tol_risk ?? '-'}</dd>
	<dt>Allowed data class</dt><dd>{t.tol_data_class ?? '-'}</dd>
	<dt>Conditions of use</dt><dd>{t.tol_conditions ?? '-'}</dd>
	<dt>Next review date</dt><dd>{fmtDate(t.tol_review_date)}</dd>
</dl>
<p><a class="button" href="/register">Back to register</a></p>
