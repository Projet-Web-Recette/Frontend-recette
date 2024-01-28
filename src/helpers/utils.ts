import type { Item, Receipe, Resource, Machine, Node } from '@/types';


/**
 * @description Génère un id aléatoire
 */
export function generateUniqueId() {
    return '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * @description Converti le node en un objet de type Item, ressource ou machine
 * @param node 
 * @returns 
 */
export function translateNodeToType(node: Node): Item | Resource | Machine {
    if (node.type === "item") {
        return {
            id: node.id,
            name: node.name,
            logoPath: node.logoPath,
            quantityProduced: undefined,
            machine: undefined,
            ingredients: undefined,
            quantityIngredients: undefined
        }
    }
    return {
        id: node.id,
        name: node.name,
        logoPath: node.logoPath
    }
}


export function getNormalizedId(id: string): string {
    return id.split("_")[0];
}