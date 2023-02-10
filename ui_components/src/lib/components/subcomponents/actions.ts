export default function clickOutside(
	node: HTMLElement,
	onEventFunction: (e: Event) => void | Promise<void>,
) {
	const handleClick = (event: Event) => {
		const path = event.composedPath();

		if (!path.includes(node)) {
			onEventFunction(event);
		}
	};

	document.addEventListener('click', handleClick);

	return {
		destroy() {
			document.removeEventListener('click', handleClick);
		},
	};
}
