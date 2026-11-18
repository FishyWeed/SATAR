<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	// After a successful submit the form starts empty again.
	const v = $derived(form && 'error' in form ? form : null);
</script>

<h1>Submit Tool Request</h1>
<Msg {form} />
<form method="POST" class="stack" novalidate>
	<label>Tool name <input name="name" maxlength="60" value={v?.name ?? ''} /></label>
	<label>Vendor <input name="vendor" maxlength="60" value={v?.vendor ?? ''} /></label>
	<label>URL <input name="url" type="url" maxlength="200" placeholder="https://" value={v?.url ?? ''} /></label>
	<label>Category
		<select name="cat">
			<option value="">Select</option>
			{#each data.categories as c (c.cat_id)}<option value={c.cat_id} selected={c.cat_id === v?.cat}>{c.cat_name}</option>{/each}
		</select>
	</label>
	<label>Purpose <textarea name="purpose" maxlength="500">{v?.purpose ?? ''}</textarea></label>
	<label>Data class (the most sensitive data that the tool will receive)
		<select name="dataClass">
			<option value="">Select</option>
			{#each data.dataClasses as d (d)}<option selected={d === v?.dataClass}>{d}</option>{/each}
		</select>
	</label>
	<div class="row"><button>Submit request</button><a class="button" href="/employee">Cancel</a></div>
</form>
