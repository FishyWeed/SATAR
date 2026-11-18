<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const most = $derived(Math.max(1, ...data.risk.map((r) => r.n)));
</script>

<h1>Administrator Dashboard</h1>
<div class="cards">
	{#each data.status as s (s.label)}<div class="card">{s.label}<b>{s.n}</b></div>{/each}
</div>
<h2>Tools by risk level</h2>
<div class="bars">
	{#each data.risk as r (r.label)}
		<div><span>{r.label}</span><span class="bar-fill" style="width: {(r.n / most) * 60}%"></span><span>{r.n}</span></div>
	{/each}
</div>
