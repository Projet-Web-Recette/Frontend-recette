<template>
    <div>
        <img :src="display.src" :style="{width: display.width + 'px', height: display.height + 'px'}">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import type { Display } from '../gameData/types';

defineProps<{display: Display}>()
</script>

<style scoped>
</style>