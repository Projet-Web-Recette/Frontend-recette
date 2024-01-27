export interface Item {
    id: string,
    name: string,
    logoPath: string,
    quantityProduced: string,
    machine: Machine,
    ingredients: any[],
    quantityIngredients: {receipe: Resource | Item, quantity: number}[]
}

export interface Receipe {
    id: string,
    items?: Item[],
    resources?: Resource[],
    machine?: undefined
}


export interface Resource {
    id: string,
    name: string,
    quality?: 'pur' | 'normal' | 'impur',
    logoPath: string
}

export interface Machine {
    id?: string,
    name: string,
    logoPath: string
}

export interface Miner extends Machine {
    rate: number,
    type: string
}


export interface LoginInformations {
    login: string,
    password: string
}


export enum HttpErrors {
    SUCCESS = 200,
    CREATED = 201,
    UNAUTHORIZED = 401
}

export interface HttpRequest {
    method: 'GET' | 'POST',
    headers: {[key: string]: string},
    body?: string
}