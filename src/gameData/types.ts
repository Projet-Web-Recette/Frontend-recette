import type { Item, Resource } from "@/types"
import type { Ref } from "vue"

export interface Display {
    src: string,
    width: number,
    height: number,
    x: number,
    y: number
}

export interface Updatable {
    tick: (delta: number) => void
}

export interface Miner {
    displayData: Display,
    output: Resource,
    rate: number,
    quantity: Ref<number>,
    take: (quantity: number) => number
}

export interface Factory {
    displayData: Display,
    input: Resource | Item,
    output: Resource,
    rate: number,
    inQuantity: Ref<number>,
    quantity: Ref<number>,
    take: (quantity: number) => number
    give: (quantity: number) => number
}

export interface Convoyer {
    from: Miner | Factory,
    to: Factory
}