<script lang="ts">
    import HoverContent from './HoverContent.svelte';
</script>

<div
    class="w-56 h-28 grid place-content-center border border-solid border-black"
>
    <HoverContent>
        <div class="bg-green-300">Default Content</div>

        <div slot="hover_content">Hover Content</div>
    </HoverContent>
</div>
