<script lang="ts">
    import type { Move_File, Open_File, Write_Metadata } from 'src/types';
    import StepBack from '../icons/StepBack.svelte';
    import StepForward from '../icons/StepForward.svelte';
    import HeaderFrame from './HeaderFrame.svelte';
    import HeaderLists from './HeaderLists.svelte';
    import { add } from 'date-fns';

    export let date: Date;
    export let open_next: (direction: 'yesterday' | 'tomorrow') => void;
    export let open: Open_File;
    export let move_file: Move_File;
    export let write_metadata: Write_Metadata;
</script>

<HeaderFrame>
    <div class="space-y-4 p-4">
        <div class="flex gap-2 items-center justify-end text-slate-600">
            <div
                class="cursor-pointer hover:text-purple-600"
                on:click={() => open_next('yesterday')}
                on:keyup
            >
                <StepBack classes="w-6" />
            </div>

            <div
                class="cursor-pointer hover:text-purple-600"
                on:click={() => open_next('tomorrow')}
                on:keyup
            >
                <StepForward classes="w-6" />
            </div>
        </div>

        <div class="">
            <HeaderLists
                filter_info={{
                    do_date_before: add(date, { days: 1 }),
                    due_date_before: add(date, { days: 7 }),
                    done_on: date,
                }}
                {open}
                {move_file}
                {write_metadata}
            />
        </div>
    </div>
</HeaderFrame>
