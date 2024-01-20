<script setup lang="ts">
import type { Item, Receipe, Resource } from '@/types';
import { VueFlow, Position } from '@vue-flow/core'
import { ref } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';


const item=ref<Item>()

const ironOre: Resource = {
    id: 'rsc2',
    name: 'Fer',
    logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/8/87/Iron_Ore.png'
}

const ironIngotReceipe: Receipe = {
        id: 'rcp1',
        resources: [ironOre]
    }

const ironIngot: Item = {
    id: 'itm1',
    logoPath: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/0/0a/Iron_Ingot.png",
    name: "Lingot de fer",
    receipe: ironIngotReceipe
}

const elements = ref([
  {
    id: '1',
    label: 'iron ore',
    type: 'resource',
    data: ironOre,
    position: { x: 50, y: 0 },
  },
  {
    id: '2',
    label: 'iron ingot',
    type: 'item',
    data: ironIngot,
    position: { x: 50, y: 200 },
  },
  { id: 'e1-2', source: '1', target: '2' }
])
</script>

<template>
  <VueFlow v-model="elements" class="basicflow">
    <template #node-resource="{ data }">
        <ResourceDetail :resource="data"></ResourceDetail>
    </template>
    <template #node-item="{ data }">
        <ItemDetail :item="data"></ItemDetail>
    </template>
  </VueFlow>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
</style>