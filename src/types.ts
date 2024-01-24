export interface Item {
    id: string,
    name: string,
    logoPath: string,
    quantityProduced: string,
    machine: Machine,
    ingredients: any[],
    quantityIngredients: any[]
}

export interface Receipe {
    id: string,
    items?: Item[],
    resources?: Resource[],
    machine?: undefined
}


export interface Resource {
    id?: string,
    name: string,
    quality?: 'pur' | 'normal' | 'impur',
    logoPath: string
}

export interface Machine {
    id?: string,
    name: string,
    logoPath: string
}


export interface LoginInformations {
    login: string,
    password: string
}


export enum HttpErrors {
    SUCCESS = 200,
    CREATED = 201
}

export interface HttpRequest {
    method: 'GET' | 'POST',
    headers: {[key: string]: string},
    body?: string
}