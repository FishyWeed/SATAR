<script lang="ts">
	// Landing page (design system HeroScene, GlowCard and CurvedGallery). A signed-in user sees Open SATAR instead of Sign in and Get started.
	// Every link here reloads the page, so the scroll script of the landing page (static/js/landing.js) never runs on another page.
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// The gallery stays in view while the page scrolls past its track; the scroll position picks the card, in both directions.
	function scrollGallery() {
		const gal = document.querySelector<HTMLElement>('.inside [data-gallery]')!, track = document.querySelector<HTMLElement>('.inside__track')!;
		const vp = () => gal.querySelector<HTMLElement>('.s-gallery__viewport');
		const progress = () => Math.min(1, Math.max(0, (gal.getBoundingClientRect().bottom - track.getBoundingClientRect().top) / track.offsetHeight));
		const sync = () => { const v = vp(); if (v) v.scrollLeft = progress() * (v.scrollWidth - v.clientWidth); };
		// Scroll the page to card i, so the arrows, the keys and a click on a side card agree with the page scroll.
		const goTo = (i: number) => {
			const n = gal.querySelectorAll('.s-gallery__card').length, target = Math.min(n - 1, Math.max(0, i)) / Math.max(1, n - 1);
			const stuckBottom = parseFloat(getComputedStyle(gal).top) + gal.offsetHeight;
			window.scrollBy({ top: track.getBoundingClientRect().top - (stuckBottom - target * track.offsetHeight), behavior: 'smooth' });
		};
		const current = () => Math.round(progress() * (gal.querySelectorAll('.s-gallery__card').length - 1));
		// The wheel scrolls the page (and so the gallery), not the gallery alone.
		const wheel = (e: WheelEvent) => { if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) e.stopPropagation(); };
		const click = (e: MouseEvent) => {
			const t = e.target as HTMLElement, g = t.closest('[data-g]')?.getAttribute('data-g'), card = t.closest('.s-gallery__card');
			if (g === 'next' || g === 'prev') { e.stopPropagation(); goTo(current() + (g === 'next' ? 1 : -1)); }
			else if (card && !card.classList.contains('is-center')) { e.stopPropagation(); goTo([...gal.querySelectorAll('.s-gallery__card')].indexOf(card)); }
		};
		const KEYS: Record<string, (i: number) => number> = { ArrowRight: (i) => i + 1, ArrowLeft: (i) => i - 1, Home: () => 0, End: () => 99 };
		const key = (e: KeyboardEvent) => { if (KEYS[e.key]) { e.preventDefault(); e.stopPropagation(); goTo(KEYS[e.key](current())); } };
		gal.addEventListener('wheel', wheel, { capture: true });
		gal.addEventListener('click', click, { capture: true });
		gal.addEventListener('keydown', key, { capture: true });
		addEventListener('scroll', sync, { passive: true });
		addEventListener('resize', sync);
		requestAnimationFrame(sync);
		return () => {
			gal.removeEventListener('wheel', wheel, { capture: true });
			gal.removeEventListener('click', click, { capture: true });
			gal.removeEventListener('keydown', key, { capture: true });
			removeEventListener('scroll', sync);
			removeEventListener('resize', sync);
		};
	}

	// Back to top and skip to content without a #main in the URL (the page scrolls as if it was reloaded).
	let scrolled = $state(false);

	function toTop(e: MouseEvent) {
		e.preventDefault();
		window.scrollTo({ top: 0 });
	}
	function toMain(e: MouseEvent) {
		e.preventDefault();
		document.getElementById('main')?.focus();
	}

	onMount(() => {
		if (location.hash === '#main') history.replaceState(history.state, '', '/');
		document.body.classList.add('landing');
		const s = Object.assign(document.createElement('script'), { src: '/js/landing.js' });
		document.body.append(s);
		const stopGallery = scrollGallery();
		// The back-to-top button shows once the hero is out of view.
		const onScroll = () => (scrolled = scrollY > innerHeight);
		addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => { document.body.classList.remove('landing'); s.remove(); stopGallery(); removeEventListener('scroll', onScroll); };
	});
</script>

<svelte:head>
	<title>SATAR by Noctua · Keep watch over every AI tool your team uses</title>
	<meta name="description" content="SATAR, the Shadow AI Tool Approval Register by Noctua. Staff check which AI tools are approved, request new ones, and every decision is kept for audit." />
	<link rel="preload" href="/img/forest-mid.webp" as="image" />
	<link rel="stylesheet" href="/css/landing.css" />
</svelte:head>

<div data-sveltekit-reload style="display:contents">
<a class="s-skip" href="/" onclick={toMain}>Skip to content</a>

<!-- ============ Header ============ -->
<header class="s-pubheader" id="top">
	<a class="s-brand" href="/" onclick={toTop} aria-label="SATAR by Noctua, back to top">
		<img src="/img/logos/satar-mark-lumen.svg" alt="" style="height:22px" />
		<span class="s-brand__word">SATAR</span>
		<span class="brand-by">by Noctua</span>
	</a>
	<nav class="s-pubheader__links" aria-label="Sections">
		<a href="#problem">Shadow AI</a>
		<a href="#how">How it works</a>
		<a href="#features">Features</a>
		<a href="#roles">Roles</a>
	</nav>
	<div class="s-pubheader__end">
		{#if data.home}
			<a class="s-btn s-btn--primary" href={data.home}>Open SATAR</a>
		{:else}
			<a class="s-btn s-btn--ghost hide-phone" href="/login">Sign in</a>
			<a class="s-btn s-btn--primary" href="/signup">Get started</a>
		{/if}
	</div>
</header>

<main id="main" tabindex="-1">

<!-- ============ Hero: the forest at night ============ -->
<section class="hero" aria-labelledby="hero-title">
	<div class="scene" aria-hidden="true">
		<div class="scene__sky" data-speed="0.6"></div>
		<div class="scene__glow" data-speed="0.55" data-fade="1.1"></div>
		<img class="scene__layer scene__far" data-speed="0.5" data-scale="0.08" src="/img/forest-far.webp" srcset="/img/forest-far-sm.webp 1200w, /img/forest-far.webp 2400w" sizes="100vw" alt="" />
		<div class="rays" data-speed="0.46" data-fade="1.4">
			<i style="--x:-4deg;--w:7vw;--o:.55;--d:0s"></i><i style="--x:-11deg;--w:4vw;--o:.35;--d:-3s"></i><i style="--x:6deg;--w:9vw;--o:.5;--d:-6s"></i>
			<i style="--x:15deg;--w:3vw;--o:.3;--d:-2s"></i><i style="--x:-19deg;--w:5vw;--o:.25;--d:-8s"></i><i style="--x:24deg;--w:6vw;--o:.2;--d:-5s"></i><i style="--x:1deg;--w:2.5vw;--o:.7;--d:-1s"></i>
		</div>
		<div class="scene__fog scene__fog--1" data-speed="0.42"></div>
		<img class="scene__layer scene__mid" data-speed="0.32" data-scale="0.05" src="/img/forest-mid.webp" srcset="/img/forest-mid-sm.webp 1200w, /img/forest-mid.webp 2400w" sizes="100vw" alt="" />
		<div class="owl-flight" data-speed="0.28"><img src="/img/owl-flight.svg" alt="" /></div>
		<div class="scene__fog scene__fog--2" data-speed="0.2"></div>
		<img class="scene__layer scene__near" data-speed="0.12" data-scale="0.04" src="/img/forest-near.webp" srcset="/img/forest-near-sm.webp 1200w, /img/forest-near.webp 2400w" sizes="100vw" alt="" />
		<canvas class="motes" data-speed="0.3"></canvas>
		<div class="lantern"></div>
	</div>

	<!-- poster corner notes -->
	<div class="poster" aria-hidden="true" data-speed="0.15" data-fade="0.6">
		<span class="poster__tl">N° 01<br>Shadow AI</span>
		<span class="poster__tr">3.1390° N<br>101.6869° E</span>
		<span class="poster__bl">Kuala Lumpur<br>MMXXVI</span>
		<span class="poster__br"><span class="scroll-cue"><i></i></span>Scroll to enter</span>
		<svg class="spark spark--1" viewBox="0 0 24 24"><path d="M12 2c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10z"/></svg>
		<svg class="spark spark--2" viewBox="0 0 24 24"><path d="M12 2c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10z"/></svg>
	</div>

	<div class="hero__content" data-speed="0.34" data-fade="0.75">
		<p class="pill s-glass hero-in" style="--i:0"><span class="pill__dot"></span>Shadow AI Tool Approval Register</p>
		<h1 class="hero__title" id="hero-title">
			<span class="line hero-in" style="--i:1">Keep watch over</span>
			<span class="line hero-in" style="--i:2">every AI tool</span>
			<span class="line hero-in" style="--i:3"><em>your team uses.</em></span>
		</h1>
		<p class="hero__lede hero-in" style="--i:4">SATAR is the approval register for generative AI at work. Staff check what is approved, request what is new, and every decision is kept for audit.</p>
		<div class="hero__ctas hero-in" style="--i:5">
			{#if data.home}
				<a class="s-btn s-btn--primary s-btn--lg glow" href={data.home}>Open SATAR<svg class="s-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
			{:else}
				<a class="s-btn s-btn--primary s-btn--lg glow" href="/signup">Get started<svg class="s-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
				<a class="s-btn s-btn--glass s-btn--lg" href="/login">Sign in</a>
			{/if}
		</div>
	</div>
	<img class="scene__ground" data-speed="-0.12" src="/img/forest-ground.webp" srcset="/img/forest-ground-sm.webp 1200w, /img/forest-ground.webp 2400w" sizes="100vw" alt="" aria-hidden="true" />
</section>

<!-- ============ Product preview: through the window ============ -->
<section class="preview" aria-labelledby="preview-title">
	<div class="preview__intro s-reveal">
		<p class="s-eyebrow">The register</p>
		<h2 id="preview-title" class="preview__title">One place to see every AI tool, and what it is approved for.</h2>
	</div>
	<div class="window" id="window">
		<div class="window__frame">
			<div class="window__bar" aria-hidden="true"><span></span><span></span><span></span><b>satar.my/register</b></div>
			<img src="/img/shots/register-desktop.webp" width="2560" height="1600" alt="The SATAR AI tool register: a table of tools with their status, risk level and allowed data class, and a filter bar to search by keyword and category." loading="lazy" />
		</div>
		<div class="window__glint" aria-hidden="true"></div>
	</div>
</section>

<!-- ============ The problem ============ -->
<section class="problem" id="problem" aria-labelledby="problem-title">
	<svg class="orbit" data-speed="-0.06" aria-hidden="true" viewBox="0 0 800 800"><g fill="none" stroke="currentColor"><circle cx="400" cy="400" r="390" stroke-opacity=".08"/><circle cx="400" cy="400" r="300" stroke-opacity=".12"/><circle cx="400" cy="400" r="200" stroke-opacity=".16" stroke-dasharray="2 8"/><circle cx="400" cy="400" r="110" stroke-opacity=".22"/><circle cx="400" cy="400" r="34" stroke-opacity=".5"/><path d="M400 0v800M0 400h800" stroke-opacity=".06"/></g><circle cx="400" cy="400" r="6" fill="currentColor"/></svg>
	<div class="wrap">
		<header class="section-head s-reveal">
			<p class="s-eyebrow">In the dark</p>
			<h2 id="problem-title" class="display">Shadow AI is the AI <em>you cannot see.</em></h2>
			<p class="lede">Staff already use AI tools to write, translate and summarise. Most of it happens out of sight, with company data.</p>
		</header>
		<ol class="problems">
			<li class="problem-card s-reveal" style="--_d:0ms">
				<span class="num">01</span>
				<span class="problem-card__icon"><svg class="s-ic s-ic--lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1c.5-.1.9-.1 1.4-.1 6 0 9.5 7 9.5 7a16 16 0 0 1-3 3.8M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 7 9.5 7c1.8 0 3.4-.6 4.8-1.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg></span>
				<h3>No visibility of AI tools</h3>
				<p>Nobody knows which AI tools are in use, by whom, or for what work.</p>
			</li>
			<li class="problem-card s-reveal" style="--_d:120ms">
				<span class="num">02</span>
				<span class="problem-card__icon"><svg class="s-ic s-ic--lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/></svg></span>
				<h3>Leaks of confidential data</h3>
				<p>Contracts, payroll and customer details get pasted into tools that no one has checked.</p>
			</li>
			<li class="problem-card s-reveal" style="--_d:240ms">
				<span class="num">03</span>
				<span class="problem-card__icon"><svg class="s-ic s-ic--lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5z"/><path d="M14 3v5.5h5.5M9 13l6 6M15 13l-6 6"/></svg></span>
				<h3>No evidence for audits</h3>
				<p>When auditors or clients ask, there is no record of what was allowed, and why.</p>
			</li>
		</ol>
	</div>
</section>

<!-- ============ How it works ============ -->
<section class="how" id="how" aria-labelledby="how-title">
	<div class="how__beam" aria-hidden="true"></div>
	<div class="wrap">
		<header class="section-head s-reveal">
			<p class="s-eyebrow">Into the light</p>
			<h2 id="how-title" class="display">Three people. <em>One clear decision.</em></h2>
			<p class="lede">Every new tool passes two checks before anyone uses it at work.</p>
		</header>
		<div class="flow" id="flow">
			<div class="flow__line" aria-hidden="true"><i id="flowFill"></i></div>
			<ol class="flow__steps">
				<li class="flow-step s-reveal" style="--_d:0ms">
					<span class="flow-step__node" aria-hidden="true"><svg class="s-ic s-ic--lg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20.5c1.4-3.6 4.4-5.5 8-5.5s6.6 1.9 8 5.5"/></svg></span>
					<span class="num">Step 1 · Employee</span>
					<h3>Requests a tool</h3>
					<p>Searches the register first. If the tool is new, says what it is, why it is needed and which data it will touch.</p>
				</li>
				<li class="flow-step s-reveal" style="--_d:140ms">
					<span class="flow-step__node" aria-hidden="true"><svg class="s-ic s-ic--lg" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.3 3.6-5.2 6.5-5.2s5.5 1.9 6.5 5.2"/><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 15c2 .7 3.2 2.4 3.6 5"/></svg></span>
					<span class="num">Step 2 · Manager</span>
					<h3>Checks the need</h3>
					<p>Approves or rejects the request for the department, with a short reason the employee can read.</p>
				</li>
				<li class="flow-step s-reveal" style="--_d:280ms">
					<span class="flow-step__node" aria-hidden="true"><svg class="s-ic s-ic--lg" viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.6c0 4.6-3.1 8-7.5 9.4-4.4-1.4-7.5-4.8-7.5-9.4V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/></svg></span>
					<span class="num">Step 3 · Reviewer</span>
					<h3>Checks the risk</h3>
					<p>Sets the risk level and the most sensitive data allowed, then approves, rejects or bans the tool.</p>
				</li>
			</ol>
			<p class="flow__end s-reveal"><svg class="s-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5M12 7.5V12l3.2 2"/></svg>Every decision goes into the audit log.</p>
		</div>
	</div>
</section>

<!-- ============ Features ============ -->
<section class="features" id="features" aria-labelledby="features-title">
	<img class="features__bg" data-speed="-0.08" src="/img/forest-mid-sm.webp" alt="" aria-hidden="true" />
	<div class="wrap">
		<header class="section-head s-reveal">
			<p class="s-eyebrow">What you get</p>
			<h2 id="features-title" class="display">Everything a register <em>should keep.</em></h2>
		</header>
		<ul class="glow-grid">
			<li class="s-glowline s-reveal" style="--_d:0ms"><article class="s-glowcard s-glowcard--moss"><div class="s-glowcard__inner"><span class="s-glowcard__icon" aria-hidden="true"><svg class="s-ic" viewBox="0 0 24 24"><path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17.5" r="1"/></svg></span><h3 class="s-glowcard__title">AI tool register</h3><p class="s-glowcard__text">One list of every tool, with its status, risk level and conditions of use.</p><span class="s-glowcard__dust" aria-hidden="true"></span></div></article></li>
			<li class="s-glowline s-reveal" style="--_d:90ms"><article class="s-glowcard s-glowcard--lumen"><div class="s-glowcard__inner"><span class="s-glowcard__icon" aria-hidden="true"><svg class="s-ic" viewBox="0 0 24 24"><rect x="3" y="4" width="6.5" height="5" rx="1.5"/><rect x="14.5" y="4" width="6.5" height="5" rx="1.5"/><rect x="8.75" y="15" width="6.5" height="5" rx="1.5"/><path d="M6.2 9v2.5a1.5 1.5 0 0 0 1.5 1.5h8.6a1.5 1.5 0 0 0 1.5-1.5V9M12 13v2"/></svg></span><h3 class="s-glowcard__title">Two-step approval</h3><p class="s-glowcard__text">The Manager checks the business need. The Reviewer checks the data risk.</p><span class="s-glowcard__dust" aria-hidden="true"></span></div></article></li>
			<li class="s-glowline s-reveal" style="--_d:180ms"><article class="s-glowcard s-glowcard--dusk"><div class="s-glowcard__inner"><span class="s-glowcard__icon" aria-hidden="true"><svg class="s-ic" viewBox="0 0 24 24"><path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 12.5l9 4.8 9-4.8"/><path d="M3 16.5l9 4.8 9-4.8"/></svg></span><h3 class="s-glowcard__title">Data class limits</h3><p class="s-glowcard__text">Each tool shows the most sensitive data it may touch: Public, Internal, Confidential or Restricted.</p><span class="s-glowcard__dust" aria-hidden="true"></span></div></article></li>
			<li class="s-glowline s-reveal" style="--_d:0ms"><article class="s-glowcard s-glowcard--teal"><div class="s-glowcard__inner"><span class="s-glowcard__icon" aria-hidden="true"><svg class="s-ic" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg></span><h3 class="s-glowcard__title">Review dates</h3><p class="s-glowcard__text">Approvals expire. Overdue tools come back to the Reviewer for a fresh check.</p><span class="s-glowcard__dust" aria-hidden="true"></span></div></article></li>
			<li class="s-glowline s-reveal" style="--_d:90ms"><article class="s-glowcard s-glowcard--heather"><div class="s-glowcard__inner"><span class="s-glowcard__icon" aria-hidden="true"><svg class="s-ic" viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5M12 7.5V12l3.2 2"/></svg></span><h3 class="s-glowcard__title">Audit log</h3><p class="s-glowcard__text">Who decided what, when and why. Kept for compliance, never edited.</p><span class="s-glowcard__dust" aria-hidden="true"></span></div></article></li>
			<li class="s-glowline s-reveal" style="--_d:180ms"><article class="s-glowcard s-glowcard--ember"><div class="s-glowcard__inner"><span class="s-glowcard__icon" aria-hidden="true"><svg class="s-ic" viewBox="0 0 24 24"><path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/></svg></span><h3 class="s-glowcard__title">Reports</h3><p class="s-glowcard__text">Print the register, overdue reviews, the audit log or a summary by department.</p><span class="s-glowcard__dust" aria-hidden="true"></span></div></article></li>
		</ul>
	</div>
</section>

<!-- ============ Gallery ============ -->
<section class="inside" id="inside" aria-labelledby="inside-title">
	<div class="wrap">
		<header class="section-head section-head--center s-reveal">
			<p class="s-eyebrow">Inside SATAR</p>
			<h2 id="inside-title" class="display">Calm screens for <em>clear decisions.</em></h2>
			<p class="lede">Drag, scroll or use the arrows to look around the app.</p>
		</header>
	</div>
	<div class="s-gallery s-reveal" data-gallery aria-label="Screens from SATAR">
		<img src="/img/shots/employee-home.webp" alt="Employee home with stat cards and recent requests" data-caption="Employee home" />
		<img src="/img/shots/request-new.webp" alt="Form to request a new AI tool with a guide to the four data classes" data-caption="Request a tool" />
		<img src="/img/shots/request-detail.webp" alt="Request details with a four-step progress indicator" data-caption="Follow a request" />
		<img src="/img/shots/manager-review.webp" alt="Manager review with approve and reject choices" data-caption="Manager review" />
		<img src="/img/shots/risk-check.webp" alt="Reviewer risk check with risk level, data class and decision" data-caption="Risk check" />
		<img src="/img/shots/register.webp" alt="AI tool register on a phone" data-caption="Register on a phone" />
		<img src="/img/shots/tool-detail.webp" alt="Tool details showing the data class it is approved for" data-caption="Tool details" />
		<img src="/img/shots/admin.webp" alt="Administrator dashboard with a chart of tools by risk level" data-caption="Dashboard" />
		<img src="/img/shots/report.webp" alt="Printable AI tool register report" data-caption="Printable report" />
	</div>
	<div class="inside__track" aria-hidden="true"></div>
</section>

<!-- ============ Roles ============ -->
<section class="roles" id="roles" aria-labelledby="roles-title">
	<div class="wrap">
		<header class="section-head s-reveal">
			<p class="s-eyebrow">Who uses it</p>
			<h2 id="roles-title" class="display">A clear part <em>for everyone.</em></h2>
		</header>
		<ul class="role-grid">
			<li class="role s-reveal" style="--_d:0ms"><span class="role__n">I</span><h3>Employee</h3><p>Checks the register and requests the tools they need.</p></li>
			<li class="role s-reveal" style="--_d:80ms"><span class="role__n">II</span><h3>Manager</h3><p>Approves or rejects the requests of their department.</p></li>
			<li class="role s-reveal" style="--_d:160ms"><span class="role__n">III</span><h3>Reviewer</h3><p>Checks the data risk, then approves, rejects or bans a tool.</p></li>
			<li class="role s-reveal" style="--_d:240ms"><span class="role__n">IV</span><h3>Administrator</h3><p>Manages users, departments, the catalogue, the audit log and reports.</p></li>
		</ul>
	</div>
</section>

<!-- ============ Trust strip ============ -->
<section class="trust" aria-label="Guidelines">
	<div class="wrap trust__inner s-reveal">
		<svg class="s-ic s-ic--lg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 3v5.6c0 4.6-3.1 8-7.5 9.4-4.4-1.4-7.5-4.8-7.5-9.4V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/></svg>
		<p>Designed with Malaysia's <strong>National Guidelines on AI Governance and Ethics (AIGE)</strong> and the <strong>Personal Data Protection Act 2010 (PDPA)</strong> in mind.</p>
	</div>
</section>

<!-- ============ Final call to action: the path of light ============ -->
<section class="final" aria-labelledby="final-title">
	<div class="final__scene" aria-hidden="true">
		<img class="final__far" data-speed="-0.05" src="/img/forest-far-sm.webp" alt="" />
		<div class="final__shaft" id="shaft"><i></i></div>
		<img class="final__mid" data-speed="-0.1" src="/img/forest-mid-sm.webp" alt="" />
		<div class="final__path"><i></i></div>
		<!-- No parallax on this ground: it must stay on the section bottom, or a gap opens under it at the page end. -->
		<img class="final__ground" src="/img/forest-ground-sm.webp" alt="" />
	</div>
	<div class="final__content s-reveal">
		<img src="/img/logos/noctua-mark-lumen.svg" alt="" class="final__owl" />
		<h2 id="final-title" class="display">Create your organization's <em>register.</em></h2>
		<p class="lede">Set it up in a few minutes. Invite your team with a single-use link.</p>
		<a class="s-btn s-btn--primary s-btn--lg glow" href={data.home ?? '/signup'}>{data.home ? 'Open SATAR' : 'Get started'}<svg class="s-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
	</div>
</section>
</main>

<button class="s-btn s-btn--glass s-btn--icon to-top" class:is-shown={scrolled} type="button" onclick={toTop} aria-label="Back to top" tabindex={scrolled ? 0 : -1}>
	<svg class="s-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>
</button>

<!-- ============ Footer ============ -->
<footer class="s-footer">
	<div class="s-footer__inner">
		<div class="s-footer__brand">
			<img src="/img/logos/satar-logo-lumen.svg" alt="SATAR, Shadow AI Tool Approval Register" style="height:56px;width:auto" />
			<p>SATAR keeps a register of the generative AI tools your organization approves, with a two-step check and an audit log for compliance.</p>
			<a class="noctua-sig" href="/" onclick={toTop}><img src="/img/logos/noctua-logo-lumen.svg" alt="Noctua" style="height:32px;width:auto" /></a>
		</div>
		<div><h4>Product</h4><ul><li><a href="#how">How it works</a></li><li><a href="#features">Features</a></li><li><a href="#roles">Roles</a></li></ul></div>
		<div><h4>Account</h4><ul><li><a href="/login">Sign in</a></li><li><a href="/signup">Sign up</a></li></ul></div>
	</div>
	<div class="s-footer__base"><span>© 2026 Noctua. All rights reserved.</span><span>Made in Kuala Lumpur</span></div>
</footer>
</div>
