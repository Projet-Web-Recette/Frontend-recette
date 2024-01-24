<script setup lang="ts">
import type { Item, Receipe, Resource } from '@/types';
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { onMounted, ref } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';
import MachineDetail from './machineDetail.vue'

const vueFlow = useVueFlow();

const nodesDraggable = ref(false)

const props = defineProps<{ item: Item }>()

const elements = ref<any>([]);

let horizontalSpacing = 150; // Espacement horizontal entre les nœuds

const verticalSpacing = 300; // Espacement vertical entre les niveaux

let numberOfStage = 0;

let numberOfDoubleItems = 0;

let numberItems = 0;


onMounted(async () => {
  const { item } = props
  if (item) {
    const { ingredients, machine } = item;

    numberOfStage = countNumberStage(ingredients);

    horizontalSpacing += numberOfDoubleItems*10;

    item.id += generateUniqueId();
    machine.id += generateUniqueId();

    elements.value.push({
      id: item.id,
      label: item.name,
      type: 'item',
      data: item,
      position: { x: 500, y: 0 },
    });

    console.log(machine)

    elements.value.push({
      id: machine.id,
      label: machine.name,
      type: 'machine',
      data: machine,
      position: {x:500, y:300}
    });

    


    displayTreeStage(ingredients, item.id, 1, 500, 50);

    vueFlow.onPaneReady((instance) => instance.fitView());
  }
});

function generateUniqueId() {
  return '_' + Math.random().toString(36).substring(2, 9);
}


function displayTreeStage(ingredients: any[], idItem: string, stage: number, parentX: number, reducerStageSpacing: number) {

  let index = 0;
  if (ingredients.length > 1) index = -1;
  
  
  for (let ingredient of ingredients) {

    let type = ingredient.ingredients ? "item" : "resource";

    ingredient.id += generateUniqueId();

    const x = parentX + index * ((horizontalSpacing-reducerStageSpacing)*(numberOfStage-stage));
    const y = stage * verticalSpacing;

    const pos = {
      x: x,
      y: y
    }


    elements.value.push({
      id: ingredient.id,
      label: ingredient.name,
      type: type,
      data: ingredient,
      position: pos,
    });


    elements.value.push({ id: `${idItem}${ingredient.id}`, source: idItem, target: ingredient.id, markerStart: MarkerType.ArrowClosed});

    if (type === "item") {
      displayTreeStage(ingredient.ingredients, ingredient.id, stage+1, x, reducerStageSpacing+reducerStageSpacing);
    }

    
    index = 1;
  }
  
}

function countNumberStage(ingredients: any[]): number {
  if (!ingredients || ingredients.length === 0) {
    return 0;
  }

  if (ingredients.length > 1) numberOfDoubleItems++;
  numberItems += ingredients.length;

  let maxDepth = 0;

  for (let ingredient of ingredients) {
    let depth = 1;

    if (ingredient.ingredients && ingredient.ingredients.length > 0) {
      depth += countNumberStage(ingredient.ingredients);
    }

    maxDepth = Math.max(maxDepth, depth);
  }

  return maxDepth;
}




</script>

<template>
  <VueFlow :min-zoom="0.2" :nodes-draggable="nodesDraggable" v-model="elements" class="basicflow">
    <template #node-resource="{ data }">
      <ResourceDetail :resource="data"></ResourceDetail>
    </template>
    <template #node-item="{ data }">
      <ItemDetail :item="data" @onItemClicked="$emit('on-item-selected-for-recipe', $event)"></ItemDetail>
    </template>
    <template #node-machine="{ data }">
      <MachineDetail :machine="data"></MachineDetail>
    </template>
  </VueFlow>
</template>

<style>
@import "@vue-flow/core/dist/style.css";

.vue-flow__edge-path {
  stroke: red;
  stroke-width: 4px;
}
</style>