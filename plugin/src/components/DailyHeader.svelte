<script lang="ts">
	export let open: (direction: 'yesterday' | 'tomorrow') => void;
</script>

<div
	class="flex gap-4 items-center justify-center p-2 bg-neutral-300/20 text-neutral-600 rounded-lg"
>
	<div class="cursor-pointer hover:text-purple-600" on:click={() => open('yesterday')} on:keyup>
		&lt;&lt; Zurück
	</div>

	<div>||</div>

	<div class="cursor-pointer hover:text-purple-600" on:click={() => open('tomorrow')} on:keyup>
		Vor &gt;&gt;
	</div>
</div>
