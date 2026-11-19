import { goto } from '$app/navigation';

// Live filter for a GET search form: 300 ms after the last change it loads the filtered page, so the list updates as the
// user types. The field keeps the focus and the cursor. The form keeps its button (and Enter) for browsers without JavaScript.
export function liveFilter(form: HTMLFormElement) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const run = async () => {
		const field = document.activeElement instanceof HTMLInputElement && form.contains(document.activeElement) ? document.activeElement : null;
		const caret = field?.selectionStart ?? null;
		const query = new URLSearchParams([...new FormData(form)].map(([k, v]) => [k, String(v)])).toString();
		await goto(`${location.pathname}${query ? `?${query}` : ''}`, { reset: false, replaceState: true });
		// The page re-renders after the load, so find the field again by its id and put the cursor back.
		const again = field?.id ? (document.getElementById(field.id) as HTMLInputElement | null) : null;
		if (again && document.activeElement !== again) {
			again.focus();
			if (caret !== null) again.setSelectionRange(caret, caret);
		}
	};
	const onInput = () => {
		clearTimeout(timer);
		timer = setTimeout(run, 300);
	};
	form.addEventListener('input', onInput);
	return {
		destroy() {
			clearTimeout(timer);
			form.removeEventListener('input', onInput);
		}
	};
}
