<script setup lang="ts">
import type { Item, Receipe, Resource } from '@/types';
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { onMounted, ref } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';
import MachineDetail from './machineDetail.vue';
import { generateUniqueId } from '@/helpers/utils';

const vueFlow = useVueFlow();

const nodesDraggable = ref(false)

const props = defineProps<{ item: Item }>()

const elements = ref<any>([]);

let horizontalSpacing = 150; // Espacement horizontal entre les nœuds

const verticalSpacing = 600; // Espacement vertical entre les niveaux

let numberOfStage = 0;

let numberOfDoubleItems = 0;

let numberItems = 0;


onMounted(async () => {
  const { item } = props
  if (item) {
    const { ingredients, machine, quantityIngredients } = item;

    numberOfStage = countNumberStage(ingredients);

    horizontalSpacing += numberOfDoubleItems * 10;

    item.id += generateUniqueId();
    machine.id += generateUniqueId();

    elements.value.push({
      id: item.id,
      label: item.name,
      type: 'item',
      data: item,
      position: { x: 500, y: 0 },
    });



    elements.value.push({
      id: machine.id,
      label: machine.name,
      type: 'machine',
      data: machine,
      position: { x: 500, y: 300 }
    });


    elements.value.push({ id: `${item.id}${machine.id}`, label: item.quantityProduced, source: item.id, target: machine.id, markerStart: MarkerType.ArrowClosed });



    displayTreeStage(ingredients, quantityIngredients, machine.id, 1, 500, 1);

    vueFlow.onPaneReady((instance) => instance.fitView());
  }
});



/**
 * @description Affiche l'arbre d'ingrédient et de machine associés 
 * @param ingredients 
 * @param idItem 
 * @param stage 
 * @param parentX 
 * @param reducerStageSpacing 
 */
function displayTreeStage(ingredients: any[], quantityIngredients: any[], idItem: string, stage: number, parentX: number, reducerStageSpacing: number) {

  let index = 0;
  if (ingredients.length > 1) index = -1;

  

  for (let i = 0; i < ingredients.length; i++) {


    let ingredient = ingredients[i];
    let quantiteIngredient = quantityIngredients[i];

    let type = ingredient.ingredients ? "item" : "resource";

    ingredient.id += generateUniqueId();

    const x = parentX + index * ((horizontalSpacing - 1.2 * reducerStageSpacing) * (numberOfStage - stage));
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

  
    elements.value.push({ id: `${idItem}${ingredient.id}`, label: `${quantiteIngredient.quantite}`, source: idItem, target: ingredient.id, markerStart: MarkerType.ArrowClosed });


    if (type === "item") {
      const machine = ingredient.machine;

      machine.id += generateUniqueId();

      elements.value.push({
        id: machine.id,
        label: machine.name,
        type: 'machine',
        data: machine,
        position: { x: x, y: y + 300 }
      });

      elements.value.push({ id: `${ingredient.id}${machine.id}`, label: ingredient.quantityProduced, source: ingredient.id, target: machine.id, markerStart: MarkerType.ArrowClosed });


      displayTreeStage(ingredient.ingredients, quantiteIngredient.recette.quantitesIngredients, machine.id, stage + 1, x, reducerStageSpacing + 20 * stage);
    }




    index = 1;
  }





}

/**
 * @description compte le nombre d'étage de l'arbre d'ingrédients
 * @param ingredients 
 */
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
      <ResourceDetail :isCreating="false" :resource="data"></ResourceDetail>
    </template>
    <template #node-item="{ data }">
      <ItemDetail :isCreating="false" :item="data" @onItemClicked="$emit('on-item-selected-for-recipe', $event)"></ItemDetail>
    </template>
    <template #node-machine="{ data }">
      <MachineDetail :isCreating="false" :machine="data" @onMachineClicked="$emit('on-machine-selected-for-recipe', $event)"></MachineDetail>
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