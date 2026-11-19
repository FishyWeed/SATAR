<script lang="ts">
	import Field from '#lib/Field.svelte';
	import Msg from '#lib/Msg.svelte';
	import { icon } from '#lib/ui.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Welcome · SATAR</title></svelte:head>

<div class="welcome-head">
	<span class="s-eyebrow">Set up</span>
	<h1>Welcome, {data.user?.firstName}</h1>
	<p>Your account is ready. Create your organization's register, or join your organization with the invite link from its Administrator.</p>
</div>
<Msg {form} />
<div class="glow-pair">
	<div class="s-glowline s-reveal">
		<section class="s-glowcard s-glowcard--moss" aria-labelledby="c1">
			<div class="s-glowcard__inner">
				<span class="s-glowcard__icon" aria-hidden="true">{@html icon('building')}</span>
				<h2 class="s-glowcard__title" id="c1">Create an organization</h2>
				<p class="s-glowcard__text">You become its Administrator. Then you invite your colleagues.</p>
				<form method="POST" action="?/create" class="s-glowcard__body" novalidate>
					<Field id="orgName" label="Organization name"><input class="s-input" id="orgName" name="orgName" maxlength="80" placeholder="For example, Acme Sdn Bhd" value={form && 'orgName' in form ? form.orgName : ''} /></Field>
					<Field id="depName" label="Your department"><input class="s-input" id="depName" name="depName" maxlength="50" placeholder="For example, IT" value={form && 'depName' in form ? form.depName : ''} /></Field>
					<div class="s-glowcard__actions"><button class="s-btn s-btn--light">{@html icon('sparkle')}Create organization</button></div>
				</form>
				<span class="s-glowcard__dust" aria-hidden="true"></span>
			</div>
		</section>
	</div>
	<div class="s-glowline s-reveal" style="--_d:90ms">
		<section class="s-glowcard s-glowcard--dusk" aria-labelledby="c2">
			<div class="s-glowcard__inner">
				<span class="s-glowcard__icon" aria-hidden="true">{@html icon('link')}</span>
				<h2 class="s-glowcard__title" id="c2">Join an organization</h2>
				<p class="s-glowcard__text">An Administrator of your organization sends you an invite link. Open it, or paste it here.</p>
				<form method="POST" action="?/join" class="s-glowcard__body" novalidate>
					<Field id="link" label="Invite link"><input class="s-input" id="link" name="link" placeholder="https://…/join/…" value={form && 'link' in form ? form.link : ''} /></Field>
					<div class="s-glowcard__actions"><button class="s-btn s-btn--light">{@html icon('log-in')}Join</button></div>
				</form>
				<span class="s-glowcard__dust" aria-hidden="true"></span>
			</div>
		</section>
	</div>
</div>
