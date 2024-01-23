<template>
    <div class="resource" @click="$emit('onItemClicked', props.item.id)">
        <img :src="item.logoPath">
        <h4>{{ item.name }}</h4>
    </div>
</template>

<script setup lang="ts">
import type { Item } from '@/types';

const props = defineProps<{item: Item}>()
</script>

<style scoped>
.resource {
    border-color: black;
    border-width: 2px;
    border-style: solid;
    width: fit-content;
    border-radius: 10%;
    background-color: lightgray;
    overflow: hidden;
}

.resource:hover{
    cursor: pointer;
}

.resource > *{
    margin: auto;
}

.resource > img {
    width: 150px;
}

.resource > h4 {
    color: black;
    background-color: white;
    width: 100%;
    text-align: center;
}
</style>