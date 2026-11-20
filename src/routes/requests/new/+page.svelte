<script lang="ts">
	import DataClasses from '#lib/DataClasses.svelte';
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import PageHead from '#lib/PageHead.svelte';
	import { icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	// After a successful submit the form starts empty again.
	const v = $derived(form && 'error' in form ? form : null);
	// Existing: a tool from the catalogue (preset by its Request button). New: a tool that is not in the register yet.
	// The form posts without JavaScript too, so the page loads again with the mode of the last submit.
	// svelte-ignore state_referenced_locally
	let mode = $state(form && 'error' in form ? form.mode : data.mode);
	const toolId = $derived(v ? v.tool : data.preset);
</script>

<PageHead title="Submit Tool Request" desc="Request a tool from the catalogue, or a new tool. Your Manager checks the need, then a Reviewer checks the risk." back={['/requests', 'Back to my requests']} />
<div class="two-col">
	<form method="POST" class="s-card s-form" novalidate style="max-width:none">
		<Msg {form} />
		<fieldset class="s-choices">
			<legend class="s-label">Tool</legend>
			<label class="s-choice"><input type="radio" name="mode" value="existing" bind:group={mode} /><span class="s-choice__icon">{@html icon('grid')}</span><span class="s-choice__label">Existing tool<small>A tool in the catalogue</small></span></label>
			<label class="s-choice"><input type="radio" name="mode" value="new" bind:group={mode} /><span class="s-choice__icon">{@html icon('plus')}</span><span class="s-choice__label">New tool<small>Not in the catalogue yet</small></span></label>
		</fieldset>
		{#if mode === 'existing'}
			<Field id="tool" label="Tool name" hint={data.tools.length ? 'Approved tools are already allowed. Banned tools cannot be requested.' : 'No catalogue tool can be requested now: approved tools are already allowed and banned tools are not. Choose New tool.'}>
				<select class="s-select" id="tool" name="tool" aria-describedby="tool-hint">
					<option value="">Choose a tool</option>
					{#each data.tools as t (t.id)}<option value={t.id} selected={t.id === toolId}>{t.name} ({t.vendor}) - {t.status}</option>{/each}
				</select>
			</Field>
		{:else}
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
		{/if}
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
