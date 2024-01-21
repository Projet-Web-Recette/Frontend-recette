<template>
    <div class="factoryDisplay" :style="{left:display.x + 'px', top:display.y + 'px'}">
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