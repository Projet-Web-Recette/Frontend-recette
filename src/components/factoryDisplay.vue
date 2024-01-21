<template>
    <div class="factoryDisplay" :style="{
        left: (display.x - display.width / 2) + 'px', 
        top: (display.y - display.height / 2) + 'px', 
        width: display.width + 'px',
        height: display.height + 'px'}">
        <img :src="display.src">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import type { Display } from '../gameData/types';

const props = defineProps<{display: Display}>()
</script>

<style scoped>
.factoryDisplay {
    position: absolute;
}
</style>