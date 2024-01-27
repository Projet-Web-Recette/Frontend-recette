import { authenticationStore } from "@/stores/authenticationStore"
import type { HttpRequest, Item, Resource, Machine } from "@/types"
import { isRuntimeOnly } from "vue"

const baseUrl = 'https://webinfo.iutmontp.univ-montp2.fr/~royov/API-PLATFORM/public/api'
const baseUrl2 = 'https://webinfo.iutmontp.univ-montp2.fr/~bordl/API-PLATFORM-main/API-PLATFORM/public/api'

function translateResourceFromApi(resource: any): Resource {
    const { id, nomRessource, qualite, contentUrl } = resource
    return {
        id: id ? id : resource["@id"],
        name: nomRessource,
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
        quantityIngredients: quantitesIngredients,
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

export async function sendRequest(endpoint: string, method: 'GET' | 'POST', payload?: any, useJWT = false, isMultipart = false) {
    let token = {}
    let request = {} as HttpRequest

    if (useJWT) {

        const authentication = authenticationStore()

        //console.log(authentication.JWT)

        if (!authentication.isAuthenticated) return

        token = {
            'Authorization': `Bearer ${authentication.JWT}`
        }
    }
    
    const contentType = isMultipart ? "" : {'Content-Type': 'application/json'}

    request.method = method
    request.headers = {
        ...contentType,
        ...token
    }

    if (payload) {

        if (isMultipart) {

            request.body = payload;

        } else {
            request.body = JSON.stringify({ ...payload })
        }
    }

   // console.log(request)

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
    const request = await sendRequest('items/?type=Items', 'GET', null, true);

    const items = request?.content["hydra:member"];

    return items.map((item: any) => translateItemFromApi(item))
}

export async function getAllItemsUser(): Promise<Item[]> {
    const request = await sendRequest('items/?type=ItemsUser', 'GET', null, true);

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

export async function getMachine(idMachine: string): Promise<Machine> {
    const request = await sendRequest(`machines/${idMachine}`, 'GET', null, true);

    const machine = request?.content;

    return translateMachineFromApi(machine);
}

export async function getRessource(idRessource: string): Promise<Resource> {
    const request = await sendRequest(`ressources/${idRessource}`, "GET", null, true);

    const ressource = request?.content;

    return translateResourceFromApi(ressource);
}


export async function createUserItem(nameItem:string, idIngredients: Map<string,string>, quantityProduced: string, idMachine: string, logoPath: string){
    let logo = logoPath.split("/");
    let nomFichier = logo[logo.length-1];
    const dataItem = {
        "nomItem":nameItem,
        "identifiantsIngredient":Object.fromEntries(idIngredients),
        "quantityProduced":quantityProduced,
        "idMachine":idMachine,
        "urlPath": nomFichier
    };
    const request = await sendRequest(`items_users`, "POST", dataItem, true);

    return request?.content;
}

export async function getItemsMachine(idMachine: string): Promise<Item[]> {
    const requestItems = await sendRequest(`machines/${idMachine}/items?type=Items`, "GET", null, true);
    const requestUserItems = await sendRequest(`machines/${idMachine}/items?type=ItemsUser`, "GET", null, true);



    const items = requestItems?.content["hydra:member"];

    const userItems = requestUserItems?.content["hydra:member"];

    const array = [...items, ...userItems];

    return array;
}

export async function createItemAdmin(nameItem: string, idIngredients: Map<string, string>, quantityProduced: string, idMachine: string, file: any) {
    const formData = new FormData();

    formData.append("nomItem", nameItem);
    formData.append("identifiantsIngredient", JSON.stringify(Object.fromEntries(idIngredients)));
    formData.append("quantityProduced", quantityProduced);
    formData.append("idMachine", idMachine);
    formData.append("file", file);

    const request = await sendRequest("items", "POST", formData, true, true);

    return request;
}