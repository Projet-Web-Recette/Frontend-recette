<template>
    <div>
        <img :src="display.src">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import type { Display } from '../gameData/types';

defineProps<{display: Display}>()
</script>

<style scoped>
</style>