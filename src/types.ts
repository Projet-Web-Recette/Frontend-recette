export interface Item {
    id: string,
    nom: string,
    logoChemin: string
}

export interface Recettes {
    id: string,
    nom: string,
    items: Item[],
    logoChemin: string
}

export interface Ressource {
    id: string,
    nom: string,
    qualite: 'pur' | 'normal' | 'impur',
    logoChemin: string
}