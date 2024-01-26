<script setup lang="ts">
import type { Item, Receipe, Resource, Machine, Node } from '@/types';
import { VueFlow, useVueFlow, MarkerType, Position, Panel } from '@vue-flow/core'
import { onMounted, ref, watch, onUnmounted } from 'vue';
import ResourceDetail from './ResourceDetail.vue';
import ItemDetail from './itemDetail.vue';
import MachineDetail from './machineDetail.vue';
import { getNormalizedId } from "@/helpers/utils";
import { generateUniqueId, translateNodeToType } from '@/helpers/utils';
import { createUserItem } from '@/helpers/api';
import {
    MDBModal,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBBtn,
    MDBInput
} from 'mdb-vue-ui-kit';


const showQuantitySelectModal = ref(false);

const props = defineProps<{ addNode: Node }>();

const { onConnect, addEdges, findNode, removeSelectedEdges, getSelectedEdges, removeSelectedNodes, getSelectedNodes } = useVueFlow();

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

    const object = translateNodeToType(node);

    nodes.value.push({
        id: object.id,
        label: object.name,
        type: node.type,
        data: object,
        position: { x: 500, y: 0 }
    });

});

const nodes = ref<any>([]);
const edges = ref<any>([]);

const sourceNodeGlobal = ref<any>();
const targetNodeGlobal = ref<any>();

const inputQuantity = ref<string>('');

let paramsForActualNode: any = undefined;

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

function confirmQuantityForNode() {
    if (inputQuantity.value > '0' && inputQuantity.value !== '') {
        showQuantitySelectModal.value = false;
        paramsForActualNode.label = inputQuantity.value;
        inputQuantity.value = '';
        addEdges(paramsForActualNode);
    }
}

function getAllEdgesSourceForNode(idNode: string): any[] {
    return edges.value.filter((edge: any) => {
        if (edge.source === idNode) return edge;
    });
}

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
 * 
 * @param idSourceNode 
 */
function verifOneEdgeForSourceNode(idSourceNode: string): boolean {
    const edgesSource = getAllEdgesSourceForNode(idSourceNode);
    return edgesSource.length === 0;
}

/**
 * 
 * @param targetNode 
 */
function verifOneEdgeForTargetNode(targetNode: any): boolean {
    const edgesTarget = getAllEdgesTargetForNode(targetNode.id);

    if (targetNode.type === "machine")
        if (targetNode.data.name === "Assembler") return edgesTarget.length <= 1;

    return edgesTarget.length === 0;
}


function getAllNodesRessources(): any[] {
    return nodes.value.filter((node: any) => {
        if (node.type === "ressource") return node;
    });
}

function getAllNodesTargetFromEdge(edge: any): any[] {
    return nodes.value.filter((node: any) => {
        if (node.id === edge.target) return node;
    });
}


function onSave() {
    if (nodes.value.length <= 1) return;

    const ressources = getAllNodesRessources();

    if (ressources.length === 0) return;


    const dataRequest = prepareArrayForSave(ressources);

    dataRequest.sort((dataA, dataB) => {
        if (dataA.identifiantsIngredients.has(dataB.idItem)) return 1;
        else if (dataB.identifiantsIngredients.has(dataA.idItem)) return -1;
        else if (dataA.idMachine === "5") return 1;
        else if (dataB.idMachine === "5") return -1;
        else return 0;
    });

    saveCustomRecipeUser(dataRequest);

    //TODO LORS DU FOR POUR LE TABLEAU DE DATA REQUEST IL FAUT CHANGER LES ID DES ITEMS PAR RAPPORT A CEUX ATTRIBUER PAR LA TABLE USERITEMS SAUF POUR LES RESSOURCES



}

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
                ingredient.identifiantsIngredients.set(mapPreviousIdToNewId.get(previousIdItem), quantityItem);
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
 * 
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
 * @description Récupère les données d'un item dans l'arbre (l'item, sa machine et son/ses ingrédients)
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











</script>

<template>
    <VueFlow :min-zoom="0.2" v-model:edges="edges" v-model:nodes="nodes" class="interactionflow">
        <Panel position="bottom-right" class="save-restore-controls">
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