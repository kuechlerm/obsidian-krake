<script lang="ts">
    import { Calendar } from 'tou-calendar';
    import Flyout from './Flyout.svelte';

    export let selectedDate: Date | undefined;
    export let target: string; // id
    export let show: boolean = false;
</script>

<Flyout {target} bind:show not_styled>
    <Calendar bind:selectedDate on:select />
</Flyout>
