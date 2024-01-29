import type { Item, Machine, Resource } from "@/types";
import { sendRequest } from "./api";

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

function translateResourceFromApi(resource: any): Resource {
    const { id, nomRessource, qualite, contentUrl } = resource
    return {
        id: id ? id : resource["@id"],
        name: nomRessource,
        logoPath: contentUrl
    }
}


export async function getAllItemsPatch(): Promise<Item[]> {
    const request = await sendRequest('items/?type=Items', 'GET', null, true);

    const items = request?.content["hydra:member"];

    return items.map((item: any) => translateItemFromApi(item))
}

export async function getItemsMachinePatch(idMachine: string): Promise<Item[]> {
    const requestItems = await sendRequest(`machines/${idMachine}/items?type=Items`, "GET", null, true);
    const requestUserItems = await sendRequest(`machines/${idMachine}/items?type=ItemsUser`, "GET", null, true);



    const items = requestItems?.content["hydra:member"].map((item: any) => translateItemFromApi(item));

    const userItems = requestUserItems?.content["hydra:member"].map((item: any) => translateItemFromApi(item));

    const array = [...items, ...userItems];

    return array;
}