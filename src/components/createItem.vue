<script setup lang="ts">
import type { Item, Receipe, Resource, Machine, Node } from '@/types';
import { VueFlow, useVueFlow, MarkerType, Position, Panel } from '@vue-flow/core'
import { onMounted, ref, watch, onUnmounted } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';
import MachineDetail from './machineDetail.vue';
import { getNormalizedId } from "@/helpers/utils";
import { generateUniqueId, translateNodeToType } from '@/helpers/utils';
import { createUserItem, createItemAdmin } from '@/helpers/api';
import {authenticationStore} from "@/stores/authenticationStore";
import CustomItemFormVue  from "./customItemForm.vue"
import { flashMessage } from '@smartweb/vue-flash-message';
import {
    MDBModal,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBBtn,
    MDBInput
} from 'mdb-vue-ui-kit';


const showQuantitySelectModal = ref<boolean>(false);

const emits = defineEmits(["cancel-creation"]);
const props = defineProps<{ addNode: Node }>();

const pendingFile = ref<any>(undefined);

const authentication = authenticationStore()

const { onConnect, addEdges, findNode, removeSelectedEdges, getSelectedEdges, removeSelectedNodes, getSelectedNodes } = useVueFlow();

/**
 * @description detect the key pressed to remove a node or edge on UI
 * @param event 
 */
function detectKey(event) {
    if (event.keyCode === 8 || event.keyCode === 46) {
        removeSelectedEdges(getSelectedEdges.value);
        removeSelectedNodes(getSelectedNodes.value);
    }
}

onMounted(() => {
    window.addEventListener("keydown", detectKey);
});

onUnmounted(() => {
    window.removeEventListener("keydown", detectKey);
})



watch(() => props.addNode, (node) => {

    node.id += generateUniqueId();
    
    addNodeToFlow(node);
});

/**
 * @description add a specific node to the flow
 */
function addNodeToFlow(node: any) {

    const object = translateNodeToType(node);

    nodes.value.push({
        id: object.id,
        label: object.name,
        type: node.type,
        data: object,
        position: { x: 500, y: 0 }
    });
}

const nodes = ref<any>([]);
const edges = ref<any>([]);

const sourceNodeGlobal = ref<any>();
const targetNodeGlobal = ref<any>();

const inputQuantity = ref<string>('');

const clickedButton = ref(false);

let paramsForActualNode: any = undefined;

/**
 * @description check if we can add a node to and from a specific node
 */
onConnect((params) => {
    const { source, sourceHandle, target, targetHandle } = params;

    params.updatable = true;

    if (sourceHandle === targetHandle) return;

    const sourceNode = findNode(source);

    const targetNode = findNode(target);

    if (!sourceNode || !targetNode) return;

    if (!verifNodeType(sourceNode, targetNode)) return;

    if (!verifNodeSmelterForRessource(sourceNode, targetNode)) return;

    if (!verifRessourceIsNotTarget(targetNode)) return;

    if (!verifOneEdgeForSourceNode(source)) return;

    if (!verifOneEdgeForTargetNode(targetNode)) return;

    sourceNodeGlobal.value = sourceNode;

    targetNodeGlobal.value = targetNode;

    showQuantitySelectModal.value = true;

    paramsForActualNode = params;

});

/**
 * @description add edge and check if quantity is correct
 */
function confirmQuantityForNode() {
    if (inputQuantity.value > '0' && inputQuantity.value !== '') {
        showQuantitySelectModal.value = false;
        paramsForActualNode.label = inputQuantity.value;
        inputQuantity.value = '';
        addEdges(paramsForActualNode);
    }
}

/**
 * @description get all sources edges
 * @param idNode 
 */
function getAllEdgesSourceForNode(idNode: string): any[] {
    return edges.value.filter((edge: any) => {
        if (edge.source === idNode) return edge;
    });
}

/**
 * @description get all targets edges
 * @param idNode 
 */
function getAllEdgesTargetForNode(idNode: string): any[] {
    return edges.value.filter((edge: any) => {
        if (edge.target === idNode) return edge;
    });
}

/**
 * @description checks that an item or resource can only be connected to one machine and that machines cannot be connected to each other
 * @param sourceNode 
 * @param targetNode 
 */
function verifNodeType(sourceNode: any, targetNode: any): boolean {
    if (sourceNode.type !== "machine") {
        if (targetNode.type !== "machine") return false;
    } else {
        if (targetNode.type === "machine") return false;
    }
    return true;
}

/**
 * @description checks that a resource can only be connected to a foundry
 * @param sourceNode 
 * @param targetNode 
 */
function verifNodeSmelterForRessource(sourceNode: any, targetNode: any): boolean {
    if (sourceNode.type === "ressource") {
        if (targetNode.data.name !== "Smelter") return false;
    }
    return true;
}

/**
 * @description checks that a resource cannot be a target node
 * @param targetNode 
 */
function verifRessourceIsNotTarget(targetNode: any): boolean {
    return targetNode.type === "ressource" ? false : true;
}

/**
 * @description verify that a simple node can only have one edge
 * @param idSourceNode 
 */
function verifOneEdgeForSourceNode(idSourceNode: string): boolean {
    const edgesSource = getAllEdgesSourceForNode(idSourceNode);
    return edgesSource.length === 0;
}

/**
 * @description verify that target node can either have one edge or 2 edge if it's an assembler machine
 * @param targetNode 
 */
function verifOneEdgeForTargetNode(targetNode: any): boolean {
    const edgesTarget = getAllEdgesTargetForNode(targetNode.id);

    if (targetNode.type === "machine")
        if (targetNode.data.name === "Assembler") return edgesTarget.length <= 1;

    return edgesTarget.length === 0;
}

/**
 * @description get all ressources nodes (leaf of the tree)
 */
function getAllNodesRessources(): any[] {
    return nodes.value.filter((node: any) => {
        if (node.type === "ressource") return node;
    });
}

/**
 * @description get all target nodes from a specific edge
 * @param edge 
 */
function getAllNodesTargetFromEdge(edge: any): any[] {
    return nodes.value.filter((node: any) => {
        if (node.id === edge.target) return node;
    });
}

/**
 * @description get all start nodes (ressources)
 */
function getAllNodesDepart(): any[] {
    return nodes.value.filter((node: any) => {
        let noEdgeTargetForNode = true;
        let edgeSourceForNode = false;
        for (let edge of edges.value) {
            if (edge.target === node.id) {
                noEdgeTargetForNode = false;
                break;
            }
            if (edge.source === node.id) edgeSourceForNode = true;
        }
        if (noEdgeTargetForNode && edgeSourceForNode) return node;
    });
}

/**
 * @description manage saving a specific item by the user
 */
function onSave() {
    if (nodes.value.length <= 1){
        flashMessage.show({
          type: 'info',
          title: "",
          text: 'You must have at least a machine connected to two nodes',
          image: './src/assets/flash-messages-logo/info.svg',
        });
        return;
    }
    const nodesDepart = getAllNodesDepart();

    if (nodesDepart.length === 0){
        flashMessage.show({
            type: 'info',
            title: "",
            text: 'You must have at least a machine connected to two nodes',
            image: './src/assets/flash-messages-logo/info.svg',
        });
        return;
    }

    const dataRequest = prepareArrayForSave(nodesDepart);

    dataRequest.sort((dataA, dataB) => {
        if (dataA.identifiantsIngredients.has(dataB.idItem)) return 1;
        else if (dataB.identifiantsIngredients.has(dataA.idItem)) return -1;
        else if (dataA.idMachine === "5") return 1;
        else if (dataB.idMachine === "5") return -1;
        else return 0;
    });

    if (authentication.isAdmin) saveCustomRecipeAdmin(dataRequest);
    else saveCustomRecipeUser(dataRequest);

    emits("cancel-creation");

    flashMessage.show({
        type: 'success',
        title: "",
        text: 'Recipe successfully saved',
        image: './src/assets/flash-messages-logo/success.svg',
      });
}


/**
 * @description save a custom admin recipe
 * @param recipe 
 */
async function saveCustomRecipeAdmin(recipe:any[]): Promise<void> {
    const item = recipe[0];

    const response = await createItemAdmin(item.nomItem, item.identifiantsIngredients, item.quantityProduced, item.idMachine, pendingFile.value);

    console.log(response);

}

/**
 * @description save a user recipe
 * @param recipe 
 */
async function saveCustomRecipeUser(recipe: any[]): Promise<void> {

    const mapPreviousIdToNewId = new Map();

    for (let ingredient of recipe) {

        if (ingredient.isCreatedFromRessource) {
            const response = await createUserItem(
                ingredient.nomItem,
                ingredient.identifiantsIngredients,
                ingredient.quantityProduced,
                ingredient.idMachine,
                ingredient.logoPath
            );

            let splitedId = response['@id'].split('/');
            mapPreviousIdToNewId.set(ingredient.idItem, splitedId[splitedId.length - 2]);

        } else {
            let idIngredientsCopy = new Map(ingredient.identifiantsIngredients);
            for(let [previousIdItem, quantityItem] of idIngredientsCopy.entries()) {
                
                ingredient.identifiantsIngredients.delete(previousIdItem);

                let newId = previousIdItem;

                if (mapPreviousIdToNewId.get(previousIdItem)) {
                    newId = mapPreviousIdToNewId.get(previousIdItem);
                }
                
                ingredient.identifiantsIngredients.set(newId, quantityItem);
            }


            const response = await createUserItem(
                ingredient.nomItem,
                ingredient.identifiantsIngredients,
                ingredient.quantityProduced,
                ingredient.idMachine,
                ingredient.logoPath
            );

            console.log(response);

            let splitedId = response['@id'].split('/');
            mapPreviousIdToNewId.set(ingredient.idItem, splitedId[splitedId.length - 2]);
        }

    }
}

/**
 * @description Goes through the tree and transforms it into a table that can be used to save it
 */
function prepareArrayForSave(nodesDepart: any[]): any[] {

    const dataForRequest = [];

    for (let nodeDepart of nodesDepart) {

        let edges = getAllEdgesSourceForNode(nodeDepart.id);

        let previousNode = nodeDepart;

        while (edges.length !== 0) {

            const edge = edges[0];

            const targetNode = getAllNodesTargetFromEdge(edge)[0];

            const edgeFromMachine = getAllEdgesSourceForNode(targetNode.id)[0];

            if (!edgeFromMachine) return [];

            const targetNodeParent = getAllNodesTargetFromEdge(edgeFromMachine)[0];


            if (targetNode.data.name === "Assembler") {

                let containCurrentNode = false;
                let dataToChange = undefined;

                for (let data of dataForRequest) {
                    if (data.idMachineNode === targetNode.id) {
                        containCurrentNode = true;
                        dataToChange = data;
                        break;
                    }
                }

                if (containCurrentNode) {
                    dataToChange?.identifiantsIngredients.set(getNormalizedId(previousNode.id), edge.label);
                } else {
                    const data = mapDataNode(previousNode, edge, targetNodeParent, targetNode, edgeFromMachine);
                    dataForRequest.push(data);
                }
            } else {
                const data = mapDataNode(previousNode, edge, targetNodeParent, targetNode, edgeFromMachine);
                dataForRequest.push(data);
            }

            edges = getAllEdgesSourceForNode(targetNodeParent.id);
            previousNode = targetNodeParent;
        }

    }

    return dataForRequest;

}

/**
 * @description Retrieves the data for an item in the tree (the item, its machine and its ingredient(s))
 */
function mapDataNode(previousNode: any, edge: any, targetNodeParent: any, targetNode: any, edgeFromMachine: any) {
    const mapIngredients = new Map<string, string>();

    mapIngredients.set(getNormalizedId(previousNode.id), edge.label);

    const data = {
        idItem: getNormalizedId(targetNodeParent.id),
        nomItem: targetNodeParent.data.name,
        identifiantsIngredients: mapIngredients,
        quantityProduced: edgeFromMachine.label,
        idMachine: getNormalizedId(targetNode.id),
        logoPath: targetNodeParent.data.logoPath,
        idMachineNode: targetNode.id,
        isCreatedFromRessource: previousNode.type === "ressource"
    }

    return data;
}

function button(){
    clickedButton.value = true;
}

/**
 * @description Create a custom node on ui from form data
 */
async function confirmModalCreationNode(data: any) {
    closeModalCreationNode();

    pendingFile.value = data.file;

    const logoPath = URL.createObjectURL(data.file);

    let newData = {
        id:"admin" + generateUniqueId(), 
        type:"item",
        name: data.name,
        logoPath: logoPath
    };
    addNodeToFlow(newData);
}

/**
 * @description close the modal
 */
function closeModalCreationNode() {
    clickedButton.value = false;
}

/**
 * @description handle exiting the recipe mode
 */
function onExit(){
    flashMessage.show({
        type: 'info',
        title: "",
        text: 'Exiting create recipe mode',
        image: './src/assets/flash-messages-logo/info.svg',
      });
    emits('cancel-creation');
}



</script>

<template>
    <VueFlow :min-zoom="0.2" v-model:edges="edges" v-model:nodes="nodes" class="interactionflow">
        <Panel position="bottom-right" class="save-restore-controls">
            <button v-if="authentication.isAdmin" style="background-color: #33a6b8" @click="button">create node</button>
            <button style="background-color: #ba3821" @click="onExit">exit</button>
            <button style="background-color: #33a6b8" @click="onSave">save recipe</button>
        </Panel>
        <template #node-ressource="{ data }">
            <ResourceDetail :isCreating="true" :resource="data"></ResourceDetail>
        </template>
        <template #node-item="{ data }">
            <ItemDetail :isCreating="true" :item="data"></ItemDetail>
        </template>
        <template #node-machine="{ data }">
            <MachineDetail :isCreating="true" :machine="data"></MachineDetail>
        </template>
    </VueFlow>


    <MDBModal id="showQuantitySelectModal" tabindex="-1" labelledby="showQuantitySelectModalLabel"
        v-model="showQuantitySelectModal">
        <MDBModalHeader>
            <MDBModalTitle id="exampleModalLabel"> Quantity choice between {{ sourceNodeGlobal.data.name }} => {{
                targetNodeGlobal.data.name }}</MDBModalTitle>
        </MDBModalHeader>
        <MDBModalBody>
            <MDBInput
                :label="sourceNodeGlobal.type === 'machine' ? 'select a quantity produced' : 'select a quantity needed to produce'"
                v-model="inputQuantity" />
        </MDBModalBody>
        <MDBModalFooter>
            <MDBBtn @click="confirmQuantityForNode" color="primary">Confirm</MDBBtn>
        </MDBModalFooter>
    </MDBModal>
    
    <CustomItemFormVue @closeModal="closeModalCreationNode" @confirmModal="confirmModalCreationNode" :show="clickedButton"></CustomItemFormVue>
</template>

<style>
.save-restore-controls {
    font-size: 20px
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
}
</style>