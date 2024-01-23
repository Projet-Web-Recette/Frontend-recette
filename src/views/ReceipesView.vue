
<template>
    <VueSideBar @on-item-emit="itemSelected" @search-input-emit="searchItem" :items="items" />

    <div v-if="itemReceipe" id="receipe">
        <ItemReceipeVue @on-item-selected-for-recipe="itemSelectedForRecipe" :key="keyRender" :item="itemReceipe"></ItemReceipeVue>
    </div>
</template>


<script setup lang="ts">
import ItemReceipeVue from '@/components/ItemReceipe.vue';
import type { Item } from '@/types';
import { getItem, getAllItems, getAllRecipesFromItem } from '@/helpers/api';
import { onMounted, ref } from 'vue';
import VueSideBar from "../components/Sidebar.vue";

let itemsApi:Item[] = [];
const items = ref<Item[]>([]);
const itemReceipe = ref<Item>();

const keyRender = ref<string>('');



onMounted(async () => {

    itemsApi = await getAllItems();

    for (let item of itemsApi) {
        items.value.push(item);
    }
});

async function itemSelected(idItem: number) {
    const item = await getItem(idItem);
    keyRender.value = item.name;
    itemReceipe.value = item;
}


function searchItem(stringSearch: string) {
    items.value = itemsApi.filter((item:Item) => {
        if (item.name.toLocaleLowerCase().includes(stringSearch.toLocaleLowerCase())) return item;
    });
}


async function itemSelectedForRecipe(idItemCode: string) {
  const idItem = idItemCode.split("_")[0];

  let itemRecipes = await getAllRecipesFromItem(idItem);

  let arrayIdItems = getAllId(itemRecipes);

  items.value = itemsApi.filter((item:Item) => {
    if (arrayIdItems.includes(item.id)) return item;
  });
}


/**
 * @description Récupère tous les identifiants des items contenus dans la recette de l'item courante
 */
function getAllId(itemsRecipes : any[], ids: string[] = []): string[]{
    for(let item of itemsRecipes){
        if(item.ingredientsOf.length === 0){
            ids.push(item.id);
            continue;
        }
        ids.push(item.id);
         getAllId(item.ingredientsOf, ids);
    }
    return ids;
}


</script>

<style scoped>
#receipe {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background-color: lightcyan;
}

.sidebar.open {
    width: 500px;
}
</style>