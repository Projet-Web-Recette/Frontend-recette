<template>
    <div class="resource">
        <img :src="resource.logoPath">
        <h4>{{ resource.name }}</h4>
    </div>
</template>

<script setup lang="ts">
import type { Resource } from '@/types';

const props = defineProps<{resource: Resource}>()
</script>

<style scoped>
.resource {
    border-color: black;
    border-width: 2px;
    border-style: solid;
    width: fit-content;
    background-color: lightgray;
}

.resource > *{
    margin: auto;
}

.resource > img {
    width: 150px;
}

.resource > h4 {
    color: orange;
    background-color: gray;
    width: 100%;
    text-align: center;
}
</style>