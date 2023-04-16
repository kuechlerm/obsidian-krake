<!-- with-border simulates the frame of the obsidian document; only used for testing in Storybook -->
<div class="p-2 overflow-hidden" class:with-border={!$$slots.default}>
    <div
        class="rounded-lg overflow-hidden bg-slate-300 bg-opacity-10
                border border-solid border-slate-600 border-opacity-30
                mt-4 shadow-md"
    >
        <slot />

        {#if !$$slots.default}
            <div class="p-4">TEST</div>
        {/if}
    </div>
</div>

<style lang="postcss">
    .with-border {
        @apply border border-solid border-black;
    }
</style>
