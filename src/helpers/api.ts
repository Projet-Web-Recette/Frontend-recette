import type { SaveFormat } from "@/gameData/types"
import { authenticationStore } from "@/stores/authenticationStore"
import { type HttpRequest, type Item, type Resource, type Machine, HttpErrors } from "@/types"
import { flashMessage } from "@smartweb/vue-flash-message"
import router from "@/router"
import { md5 } from "js-md5"

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

async function handleErrors(response: Response) {
    if (!response.ok) {
        await response.json().
            then(object => {
            flashMessage.show({
                type: 'error',
                title: "",
                text: object.message,
                image: '/src/assets/flash-messages-logo/error.svg',
                });
        })

        if(response.status === HttpErrors.UNAUTHORIZED){
            router.push({path: 'login'})
        }
        
        throw new Error(response.status+"");
    }
    return response;
}

export async function sendRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH', payload?: any, useJWT = false, isMultipart = false) {

    let token = {}
    let request = {} as HttpRequest

    if (useJWT) {

        const authentication = authenticationStore()

        if (!authentication.isAuthenticated) return

        token = {
            'Authorization': `Bearer ${authentication.JWT}`
        }
    }
    
    const contentType = isMultipart ? "" : {'Content-Type': method === 'PATCH' ? 'application/merge-patch+json' : 'application/json'}

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

    await handleErrors(response);

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
        let result = data as SaveFormat
        result.initialized = result.initialized ? result.initialized : false
        return data
    }
}

export async function getUserAvatar(email: string){
    const hashed = md5(email)

    const request = {} as HttpRequest

    const contentType = {'Content-Type': 'application/json'}

    request.method = 'GET'
    request.headers = {
        ...contentType,
        'Sec-Fetch-Mode': 'no-cors'
    }

    const response = await fetch(`https://webinfo.iutmontp.univ-montp2.fr/~cazauxl/MyAvatar/public/avatar/${hashed}`, request)

    const result = { status: response.status, content: await response.json() }
    return result
}