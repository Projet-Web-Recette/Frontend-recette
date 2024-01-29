<template>
    <div class="resource" @click="$emit('onMachineClicked', props.machine.id)">
        <img :src="machine.logoPath">
        <h4>{{ machine.name }}</h4>
    </div>
</template>

<script setup lang="ts">
import type { Machine } from '@/types';

const props = defineProps<{machine: Machine}>()
</script>

<style scoped>
.resource {
    border-color: black;
    border-width: 2px;
    border-style: solid;
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
    display: flex;
    justify-content: center;
    align-items: center;
    height: 45%;
}
</style>