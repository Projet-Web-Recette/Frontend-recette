<template>
    <div :style="noHover" class="resource">
        <img :src="machine.logoPath">
        <h4>{{ props.machine.name }}</h4>
    </div>
    <div v-if="isCreating">
        <Handle id="source" type="source" :position="Position.Top" :style="sourceHandleStyleSource"/>
        <Handle id="target" type="target" :position="Position.Bottom"  :style="sourceHandleStyleTarget"/>
    </div>
</template>

<script setup lang="ts">
import type { Machine } from '@/types';
import { computed } from 'vue';
import { Position, Handle } from '@vue-flow/core';

const props = defineProps<{machine: Machine, isCreating: boolean}>()

const sourceHandleStyleSource = computed(() => ({ 
    backgroundColor: 'green', 
    borderRadius: '10px' ,
    width: '10px',
    height: '10px'
}));

const sourceHandleStyleTarget = computed(() => ({ 
    backgroundColor: 'red', 
    borderRadius: '10px' ,
    width: '10px',
    height: '10px'
}));

const noHover = computed(() => (
    props.isCreating &&
    {
     pointerEvents: "none"
    }
))

</script>

<style scoped>
.resource {
    border-color: black;
    border-width: 2px;
    border-style: solid;
    width: fit-content;
    background-color: rgb(103, 99, 99);
}

.resource > *{
    margin: auto;
}

.resource:hover{
    border: 4px solid blue;
    transform: scale(1.2);
}


.resource > img {
    width: 150px;
}

.resource > h4 {
    color: red;
    background-color: rgb(208, 206, 206);
    width: 100%;
    text-align: center;
}
</style>