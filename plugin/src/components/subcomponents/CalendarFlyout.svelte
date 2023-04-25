<script lang="ts">
    import { Calendar } from 'tou-calendar';
    import Flyout from './Flyout.svelte';

    export let selectedDate: Date | undefined;
    export let target_element: HTMLElement;
    export let show: boolean = false;
</script>

<Flyout {target_element} bind:show not_styled>
    <Calendar bind:selectedDate on:select />
</Flyout>
