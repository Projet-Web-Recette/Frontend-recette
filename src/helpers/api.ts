import type { SaveFormat } from "@/gameData/types"
import { authenticationStore } from "@/stores/authenticationStore"
import { type HttpRequest, type Item, type Resource, type Machine, HttpErrors } from "@/types"
import { isRuntimeOnly } from "vue"

const baseUrl = 'https://webinfo.iutmontp.univ-montp2.fr/~royov/API-PLATFORM/public/api'
const baseUrl2 = 'https://webinfo.iutmontp.univ-montp2.fr/~bordl/API-PLATFORM-main/API-PLATFORM/public/api'

function translateResourceFromApi(resource: any): Resource {
    const { id, nomRessource, qualite, contentUrl } = resource
    return {
        id: id ? id : resource["@id"],
        name: nomRessource,
        quality: qualite,
        logoPath: contentUrl
    }
}

function translateResourceToApi(resource: Resource): any {
    const { id, name, quality, logoPath } = resource
    return {
        id,
        nomRessource: name,
        qualite: quality,
        contentUrl: logoPath
    }
}


function translateItemFromApi(item: any): Item {
    const { id, nomItem, contentUrl, ingredients, quantityProduced, machine, quantitesIngredients } = item;


    let machineTranslate:Machine = undefined;

    if (machine) {
        machineTranslate = {
            id: machine.id,
            name: machine.nom,
            logoPath: machine.contentUrl
        }
    }
    
    return {
        id: id ? id : item["@id"],
        name: nomItem,
        logoPath: contentUrl,
        quantityProduced: quantityProduced,
        machine: machineTranslate,
        quantityIngredients: quantitesIngredients ? quantitesIngredients.map(({quantite, recette}) => {
            let ingredient
            if(recette.nomRessource){
                ingredient = translateResourceFromApi(recette)
            } else {
                ingredient = translateItemFromApi(recette)
            }
            return {quantity: quantite, receipe: ingredient}}) : [],
        ingredients: ingredients ? translateArrayIngredients(ingredients) : []
    }
}


function translateArrayIngredients(ingredients: any[]) {
    return ingredients.map((ingredient) => {
        if (ingredient.ingredients) return translateItemFromApi(ingredient);
        else return translateResourceFromApi(ingredient);
    });
}

function translateMachineFromApi(machine: any): Machine {
    const {id, nom, contentUrl} = machine;
    return {
        id,
        name: nom,
        logoPath: contentUrl
    }
}

export async function sendRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH', payload?: any, useJWT = false) {
    let token = {}
    let request = {} as HttpRequest

    if (useJWT) {

        const authentication = authenticationStore()

        if (!authentication.isAuthenticated) return

        token = {
            'Authorization': `Bearer ${authentication.JWT}`
        }
    }

    request.method = method
    request.headers = {
        'Content-Type': method === 'PATCH' ? 'application/merge-patch+json' : 'application/json',
        ...token
    }

    if (payload) {
        request.body = JSON.stringify({ ...payload })
    }


    const response = await fetch(`${baseUrl}/${endpoint}`, request)

    const result = { status: response.status, content: await response.json() }
    return result
}


export async function getResources(): Promise<Resource[]> {
    const request = await sendRequest('ressources', 'GET', null, true);


    const ressources = request?.content["hydra:member"];


    return ressources.map((ressource:any) => translateResourceFromApi(ressource));
}

export async function getItem(idItem: Number): Promise<Item> {
    const request = await sendRequest(`items/${idItem}`, "GET", null, true);

    const item = request?.content;

    return translateItemFromApi(item);
}

export async function getAllItems(): Promise<Item[]> {
    const request = await sendRequest('items?type=Items', 'GET', null, true);

    const items = request?.content["hydra:member"];

    return items.map((item: any) => translateItemFromApi(item))
}

export async function getAllRecipesFromItem(idItem: string) {
    const request = await sendRequest(`items/${idItem}/recettes`, "GET", null, true);

    const item = request?.content;

    return item.ingredientsOf;
}

export async function getAllMachines(): Promise<Machine[]>{
    const request = await sendRequest(`machines`, "GET", null, true);

    const machines = request?.content["hydra:member"];

    return machines.map((machine: any) => translateMachineFromApi(machine))
}

export async function getMachine(idMachine: Number): Promise<Machine> {
    const request = await sendRequest(`machines/${idMachine}`, 'GET', null, true);

    const machine = request?.content;

    return translateMachineFromApi(machine);
}

export async function getItemsByMachine(idMachine: string): Promise<Item[]> {
    const request = await sendRequest(`machines/${idMachine}/items?type=Items`, 'GET', null, true);

    const items = request?.content["hydra:member"];
    
    return items.map((item: any) => translateItemFromApi(item))
}

export async function saveGameData(save: SaveFormat){
    const request = await sendRequest(`user_inventories`, 'POST', {data: save}, true)

    if(request?.status !== HttpErrors.CREATED)
    {
        console.error(request?.content)
    }
}

export async function updateSave(save: SaveFormat){
    const authentication = authenticationStore()
    if(!authentication.userId) return undefined

    const request = await sendRequest(`user_inventories/${authentication.userId}/inventory`, 'PATCH', {data: save}, true)

    if(request?.status !== HttpErrors.SUCCESS)
    {
        console.error(request?.content)
    }
}

export async function retreiveGameData() {
    const authentication = authenticationStore()
    if(!authentication.userId) return undefined

    const request = await sendRequest(`user_inventories/${authentication.userId}/inventory`, 'GET', undefined, true)

    if(request?.status !== HttpErrors.SUCCESS){
        return undefined
    } else {
        const {data} = request?.content
        return data
    }
}