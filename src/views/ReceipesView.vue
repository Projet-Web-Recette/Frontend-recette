
<template>
    <VueSideBar :currentLink="currentLink" :is-creating="isCreatingItem" @menuItemClicked="menuItemClicked" @on-machine-emit="machineSelected" @on-ressource-emit="ressourceSelected" @on-item-emit="itemSelected" @search-input-emit="searchItem"
        :items="items" :machines="machines" :ressources="ressources"/>

    <div id="receipe">
        <ItemReceipeVue v-if="itemReceipe && !isCreatingItem" @on-item-selected-for-recipe="itemSelectedForRecipe" @on-machine-selected-for-recipe="machineSelectedForRecipe"
            :key="keyRender" :item="itemReceipe"></ItemReceipeVue>
        <CreateItem :add-node="addNode" v-if="isCreatingItem" @cancel-creation="cancelCreation"></CreateItem>
    </div>
</template>


<script setup lang="ts">
import ItemReceipeVue from '@/components/ItemReceipe.vue';
import CreateItem from '@/components/createItem.vue';
import type { Item, Machine, Resource, Node } from '@/types';
import { getItem, getAllItems, getAllRecipesFromItem, getAllMachines, getResources, getMachine, getRessource, getItemsMachine, getAllItemsUser } from '@/helpers/api';
import { onMounted, ref } from 'vue';
import VueSideBar from "../components/Sidebar.vue";
import { flashMessage } from '@smartweb/vue-flash-message';

let itemsApi: Item[] = [];
let machinesApi: Machine[] = [];
let ressourcesApi: Resource[] = [];

const currentLink = ref<string>();

const isCreatingItem = ref<Boolean>(false);

const items = ref<Item[]>([]);

const machines = ref<Machine[]>([]);
const ressources = ref<Resource[]>([]);

const keyRender = ref<string>('');

const itemReceipe = ref<Item>();

const addNode = ref<Node>();


onMounted(async () => {
    itemsApi = await getAllItems();
    machinesApi = await getAllMachines();
    ressourcesApi = await getResources();

    items.value = itemsApi;
    machines.value = machinesApi;
    ressources.value = ressourcesApi;
});

async function itemSelected(idItem: string) {
    const item = await getItem(idItem);
    keyRender.value = item.id;
    itemReceipe.value = item;

    addNode.value = {
        id: idItem,
        type: "item",
        name: item.name,
        logoPath: item.logoPath,
        isCreating: true
    }

}

async function machineSelected(idMachine: string) {
    const machine = await getMachine(idMachine);

    addNode.value = {
        id: `${idMachine}`,
        type: "machine",
        name: machine.name,
        logoPath: machine.logoPath,
        isCreating: true
    }
}

async function ressourceSelected(idRessource: string) {

    const ressource = await getRessource(idRessource);

    addNode.value = {
        id: `${idRessource}`,
        type: "ressource",
        name: ressource.name,
        logoPath: ressource.logoPath,
        isCreating: true
    }
}

async function menuItemClicked(link: string) {
    switch (link) {
        case "createItem":
            isCreatingItem.value = true;
            currentLink.value = "Création d'un item"
            break;
        case "Items":
            itemsApi = await getAllItems();
            items.value = itemsApi;
            if (!isCreatingItem.value)  currentLink.value = "Tous les items"
            break;
        case "myItems": 
            itemsApi = await getAllItemsUser();
            items.value = itemsApi;
            if (!isCreatingItem.value) currentLink.value = "Mes items"
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

async function machineSelectedForRecipe(idMachineCode: string) {
    const idMachine = idMachineCode.split("_")[0];

    let itemRecipes = await getItemsMachine(idMachine);

    let arrayIdItems = getAllIdForMachine(itemRecipes);

    items.value = itemsApi.filter((item: Item) => {
        if (arrayIdItems.includes(item.id)) return item;
    });
}


function getAllIdForMachine(items: any[], ids: string[] = []): string[] {
    for(let item of items){
        ids.push(item.id);
        continue;
    }
    return ids;
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

function cancelCreation(){
    isCreatingItem.value = false;
    menuItemClicked("myItems");
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