<script lang="ts">
    import { computePosition, flip, shift, offset } from '@floating-ui/dom';
    import clickOutside from './actions';
    import Portal from './Portal.svelte';

    export let target: string; // id
    export let show: boolean = false;

    // damit click-handler nicht direkt feuert
    let init = false;

    const calc = (flyout_element: HTMLElement) => {
        const target_element = document.getElementById(target);
        if (!target_element) return;

        computePosition(target_element, flyout_element, {
            placement: 'bottom',
            middleware: [offset(6), flip(), shift({ padding: 5 })],
        }).then(({ x, y }) => {
            Object.assign(flyout_element.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });

        return {
            destroy: () => (init = false),
        };
    };

    const click_outside = () => {
        if (!init) {
            init = true;
            return;
        }
        show = false;
    };
</script>

{#if show}
    <Portal>
        <div
            use:calc
            use:clickOutside={click_outside}
            class="absolute w-max border border-solid border-neutral-700 rounded-lg bg-neutral-300 px-2 py-1"
        >
            <slot />
        </div>
    </Portal>
{/if}
