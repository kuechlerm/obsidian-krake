<script lang="ts">
    import Overview from './structure/Overview.svelte';

    export let open: (file_path: string) => void;
    export let move_file: (from_path: string, to_path: string) => Promise<void>;
</script>

<Overview {open} {move_file} />
