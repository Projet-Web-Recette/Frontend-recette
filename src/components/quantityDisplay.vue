<template>
    <div class="quantityDisplay">
        <p>{{ quantity }}</p>
        <img :src="logoPath">
    </div>
</template>

<script setup lang="ts">
defineProps<{quantity: number, logoPath: string}>()
</script>

<style>
.quantityDisplay {
    display: flex; 
    flex-direction: row;
}

.quantityDisplay > p {
    width: fit-content;
    margin: auto;
}

.quantityDisplay > img {
    width: 30px;
    margin: auto;
}
</style>