<template>
    <div class="resource">
        <img :src="resource.logoPath">
        <h4>{{ resource.name }}</h4>
    </div>
    <div v-if="isCreating">
        <Handle id="source" type="source" :position="Position.Top" :style="sourceHandleStyleSource"/>
    </div>
</template>

<script setup lang="ts">
import type { Resource } from '@/types';
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps<{resource: Resource, isCreating: boolean}>()


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