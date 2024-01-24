
<template>
    <VueSideBar :is-creating="isCreatingItem" @menuItemClicked="menuItemClicked" @on-machine-emit="machineSelected" @on-ressource-emit="ressourceSelected" @on-item-emit="itemSelected" @search-input-emit="searchItem"
        :items="items" :machines="machines" :ressources="ressources"/>

    <div id="receipe">
        <ItemReceipeVue v-if="itemReceipe && !isCreatingItem" @on-item-selected-for-recipe="itemSelectedForRecipe"
            :key="keyRender" :item="itemReceipe"></ItemReceipeVue>
        <CreateItem :add-node="addNode" v-if="isCreatingItem"></CreateItem>
    </div>
</template>


<script setup lang="ts">
import ItemReceipeVue from '@/components/ItemReceipe.vue';
import CreateItem from '@/components/createItem.vue';
import type { Item, Machine, Resource } from '@/types';
import { getItem, getAllItems, getAllRecipesFromItem, getAllMachines, getResources, getMachine } from '@/helpers/api';
import { onMounted, ref } from 'vue';
import VueSideBar from "../components/Sidebar.vue";

let itemsApi: Item[] = [];
let machinesApi: Machine[] = [];
let ressourcesApi: Ressource[] = [];

const isCreatingItem = ref<Boolean>(false);

const items = ref<Item[]>([]);

const machines = ref<Machine[]>([]);
const ressources = ref<Resource[]>([]);

const keyRender = ref<string>('');

const itemReceipe = ref<Item>();

const addNode = ref<{
    id:string;
    type:string
}>();


onMounted(async () => {

    itemsApi = await getAllItems();

    machinesApi = await getAllMachines();

    ressourcesApi = await getResources();

    items.value = itemsApi;

    machines.value = machinesApi;

    ressources.value = ressourcesApi;

});

async function itemSelected(idItem: number) {
    const item = await getItem(idItem);
    keyRender.value = item.name;
    itemReceipe.value = item;

    addNode.value = {
        id: idItem,
        type: "item"
    }

}

async function machineSelected(idMachine: number) {
    const machine = await getMachine(idMachine);
    keyRender.value = machine.name;


    addNode.value = {
        id: `${idMachine}`,
        type: "machine"
    }
}

async function ressourceSelected(idRessource: number) {
    addNode.value = {
        id: `${idRessource}`,
        type: "ressource"
    }
}

function menuItemClicked(link: string) {
    switch (link) {
        case "createItem":
            isCreatingItem.value = true;
            break;
    }
}



function searchItem(stringSearch: string) {
    items.value = itemsApi.filter((item: Item) => {
        if (item.name.toLocaleLowerCase().includes(stringSearch.toLocaleLowerCase())) return item;
    });

    machines.value = machinesApi.filter((machine: Machine) => {
        if (machine.name.toLocaleLowerCase().includes(stringSearch.toLocaleLowerCase())) return machine;
    });

    ressources.value = ressourcesApi.filter((ressource: Resource) => {
        if (ressource.name.toLocaleLowerCase().includes(stringSearch.toLocaleLowerCase())) return ressource;
    })
}


async function itemSelectedForRecipe(idItemCode: string) {
    const idItem = idItemCode.split("_")[0];

    let itemRecipes = await getAllRecipesFromItem(idItem);

    let arrayIdItems = getAllId(itemRecipes);

    items.value = itemsApi.filter((item: Item) => {
        if (arrayIdItems.includes(item.id)) return item;
    });
}


/**
 * @description Récupère tous les identifiants des items contenus dans la recette de l'item courante
 */
function getAllId(itemsRecipes: any[], ids: string[] = []): string[] {
    for (let item of itemsRecipes) {
        if (item.ingredientsOf.length === 0) {
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