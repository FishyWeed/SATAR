<script lang="ts">
	import DataClasses from '#lib/DataClasses.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	// After a successful submit the form starts empty again.
	const v = $derived(form && 'error' in form ? form : null);
</script>

<PageHead title="Submit Tool Request" desc="Tell us what the tool is and why you need it. Your Manager checks the need, then a Reviewer checks the risk." back={['/requests', 'Back to my requests']} />
<div class="two-col">
	<form method="POST" class="s-card s-form" novalidate style="max-width:none">
		<Msg {form} />
		<Field id="name" label="Tool name"><input class="s-input" id="name" name="name" maxlength="60" placeholder="For example, Otter.ai" value={v?.name ?? ''} /></Field>
		<div class="s-grid-2" style="gap:20px">
			<Field id="vendor" label="Vendor"><input class="s-input" id="vendor" name="vendor" maxlength="60" placeholder="Company that makes it" value={v?.vendor ?? ''} /></Field>
			<Field id="url" label="URL"><input class="s-input" id="url" name="url" type="url" inputmode="url" maxlength="200" placeholder="https://" value={v?.url ?? ''} /></Field>
		</div>
		<Field id="cat" label="Category">
			<select class="s-select" id="cat" name="cat">
				<option value="">Choose a category</option>
				{#each data.categories as c (c.cat_id)}<option value={c.cat_id} selected={c.cat_id === v?.cat}>{c.cat_name}</option>{/each}
			</select>
		</Field>
		<div class="s-field" data-counter>
			<label class="s-label" for="purpose">Purpose</label>
			<p class="s-hint" id="purpose-hint">What work will you do with it? Who benefits?</p>
			<textarea class="s-textarea" id="purpose" name="purpose" rows="4" maxlength="500" aria-describedby="purpose-hint">{v?.purpose ?? ''}</textarea>
			<div class="s-field-foot"><span class="s-count" aria-live="polite"></span></div>
		</div>
		<Field id="dataClass" label="Most sensitive data you will use" hint="See the four classes on the right.">
			<select class="s-select" id="dataClass" name="dataClass" aria-describedby="dataClass-hint">
				<option value="">Choose a data class</option>
				{#each data.dataClasses as d (d)}<option selected={d === v?.dataClass}>{d}</option>{/each}
			</select>
		</Field>
		<div class="s-form-actions"><button class="s-btn s-btn--primary">Submit request</button><a class="s-btn s-btn--secondary" href="/employee">Cancel</a></div>
	</form>
	<DataClasses title="Choosing a data class" />
</div>
