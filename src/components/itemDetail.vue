<template>
    <div :style="noHover" class="resource" @click="$emit('onItemClicked', props.item.id)">
        <img :src="item.logoPath">
        <h4>{{ item.name }}</h4>
    </div>
    <div v-if="isCreating">
        <Handle id="source" type="source" :position="Position.Top" :style="sourceHandleStyleSource"/>
        <Handle id="target" type="target" :position="Position.Bottom"  :style="sourceHandleStyleTarget"/>
    </div>
</template>

<script setup lang="ts">
import type { Item } from '@/types';
import { Position, Handle } from '@vue-flow/core';
import { computed } from 'vue';

const props = defineProps<{item: Item, isCreating: boolean}>()

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
    background-color: lightgray;
}

.resource > *{
    margin: auto;
}

.resource:hover{
    border: 4px solid green;
    transform: scale(1.2);
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