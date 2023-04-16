<script lang="ts">
    import Button from './subcomponents/Button.svelte';

    export let migrate_db: () => Promise<void>;
</script>

<div class="p-4">
    <Button on:click={migrate_db} label="Migrate v1 DB" />
</div>
