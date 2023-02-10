<script lang="ts">
	function portal(node: HTMLElement) {
		function update() {
			document.body.appendChild(node);
			node.hidden = false;
		}

		function destroy() {
			if (node.parentNode) {
				// Child tells parent to remove itself
				node.parentNode.removeChild(node);
			}
		}

		update();

		return {
			update,
			destroy,
		};
	}
</script>

<div use:portal hidden class="h-full w-full">
	<slot />
</div>
