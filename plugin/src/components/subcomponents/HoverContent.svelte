<script lang="ts">
    let show_hover_content = false;

    function enter() {
        show_hover_content = true;
    }

    function leave() {
        show_hover_content = false;
    }
</script>

<div class="contents" on:mouseenter={enter} on:mouseleave={leave}>
    {#if show_hover_content}
        <slot name="hover_content" />
    {:else}
        <slot />
    {/if}
</div>
