<script setup lang="ts">
import type { Item, Receipe, Resource } from '@/types';
import { VueFlow, Position } from '@vue-flow/core'
import { onMounted, ref } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';


const props = defineProps<{item: Item}>()

const elements = ref<any>([])

onMounted(async () => {
  const {item} = props
  if(item){
    const {receipe} = item

    elements.value.push({
      id: '1',
      label: item.name,
      type: 'item',
      data: item,
      position: { x: 50, y: 0 },
    })

    receipe.resources?.map((resource, idx) => {
      const id = `2${idx}`
      elements.value.push({id:`1-${id}`, source: '1', target: id})
      elements.value.push({
          id,
          label: resource.name,
          type: 'resource',
          data: resource,
          position: {x:idx * 100, y: 200}
        })
      })
  }
})
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