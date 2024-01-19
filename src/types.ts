export interface Item {
    id: string,
    name: string,
    logoPath: string
}

export interface Receipe {
    id: string,
    name: string,
    items: Item[],
    logoPath: string
}

export interface Resource {
    id?: string,
    name: string,
    quality: 'pur' | 'normal' | 'impur',
    logoPath: string
}