<script lang="ts">
	import Msg from '#lib/Msg.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>Welcome, {data.user?.firstName}</h1>
<p class="muted">Your account is ready. Create your organization's register, or join your organization with the invite link from its Administrator.</p>
<Msg {form} />
<div class="choices">
	<form method="POST" action="?/create" class="card stack" novalidate>
		<h2>Create an organization</h2>
		<p class="muted">You become its Administrator. Then you invite your colleagues.</p>
		<label>Organization name <input name="orgName" maxlength="80" value={form && 'orgName' in form ? form.orgName : ''} /></label>
		<label>Your department <input name="depName" maxlength="50" placeholder="For example IT" value={form && 'depName' in form ? form.depName : ''} /></label>
		<div class="row"><button>Create organization</button></div>
	</form>
	<form method="POST" action="?/join" class="card stack" novalidate>
		<h2>Join an organization</h2>
		<p class="muted">An Administrator of your organization sends you an invite link. Open it, or paste it here.</p>
		<label>Invite link <input name="link" placeholder="https://…/join/…" value={form && 'link' in form ? form.link : ''} /></label>
		<div class="row"><button>Join</button></div>
	</form>
</div>
