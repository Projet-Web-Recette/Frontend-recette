<script setup lang="ts">
import type { Item, Receipe, Resource } from '@/types';
import { VueFlow, Position, isNode } from '@vue-flow/core'
import { onMounted, ref } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';


const props = defineProps<{ item: Item }>()

const elements = ref<any>([])

const horizontalSpacing = 200; // Espacement horizontal entre les nœuds

const verticalSpacing = 300; // Espacement vertical entre les niveaux

let numberOfStage = 0;

onMounted(async () => {
  const { item } = props
  if (item) {
    const { ingredients } = item;

    numberOfStage = countNumberStage(ingredients);

    elements.value.push({
      id: item.id,
      label: item.name,
      type: 'item',
      data: item,
      position: { x: 500, y: 0 },
    });

    displayTreeStage(ingredients, item.id, 1, 500);
  }
});

function generateUniqueId() {
  return '_' + Math.random().toString(36).substring(2, 9);
}


function displayTreeStage(ingredients: any[], idItem: string, stage: number, parentX: number) {

  let index = 0;
  if (ingredients.length > 1) index = -1;
  
  
  for (let ingredient of ingredients) {

    let type = ingredient.ingredients ? "item" : "resource";

    ingredient.id += generateUniqueId();

    const x = parentX + index * (horizontalSpacing*(numberOfStage-stage));
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

    console.log(ingredients)


    elements.value.push({ id: `${idItem}${ingredient.id}`, source: idItem, target: ingredient.id });

    if (type === "item") {
      displayTreeStage(ingredient.ingredients, ingredient.id, stage+1, x);
    }

    
    index = 1;
  }
  
}

function countNumberStage(ingredients: any[]): number {
  if (!ingredients || ingredients.length === 0) {
    return 0;
  }

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