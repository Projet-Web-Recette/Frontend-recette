<template>
    <div class="quantityDisplay">
        <h1 >{{ quantity }}</h1>
        <img :src="logoPath">
    </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';

defineProps<{quantity: Ref<number>, logoPath: string}>()
</script>

<style>
.quantityDisplay {
    display: flex; 
    flex-direction: row; 
    background-color: white;
}

.quantityDisplay > h1 {
    width: fit-content;
}

.quantityDisplay > img {
    width: 50px;
}
</style>