<script lang="ts">
    export let migrate_db: () => Promise<void>;
</script>

<div class="p-4">
    <button on:click={migrate_db} class="cursor-pointer">Migrate v1 DB</button>
</div>
