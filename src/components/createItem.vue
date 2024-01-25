<script setup lang="ts">
import type { Item, Receipe, Resource, Machine } from '@/types';
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { onMounted, ref, watch } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';
import MachineDetail from './machineDetail.vue';

const props = defineProps<{
    addNode: { id: string; type: string }
}>();

watch(() => props.addNode, (node) => {
    console.log(node);

    //TODO Recup node correspondant au type avec les requêtes GET
});

const elements = ref<any>([]);

</script>

<template>
    <VueFlow :min-zoom="0.2" v-model="elements" class="basicflow">
        <template #node-resource="{ data }">
            <ResourceDetail :resource="data"></ResourceDetail>
        </template>
        <template #node-item="{ data }">
            <ItemDetail :item="data"></ItemDetail>
        </template>
        <template #node-machine="{ data }">
            <MachineDetail :machine="data"></MachineDetail>
        </template>
    </VueFlow>
</template>

<style>
.save-restore-controls {
    font-size: 12px
}

.save-restore-controls button {
    margin-left: 5px;
    padding: 5px;
    border-radius: 5px;
    font-weight: 700;
    text-transform: uppercase;
    color: #fff;
    -webkit-box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, .3);
    box-shadow: 0 5px 10px #0000004d;
    cursor: pointer
}

.save-restore-controls button:hover {
    transform: scale(105%);
    transition: .25s all ease-in-out
}</style>