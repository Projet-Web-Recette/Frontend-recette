import type { Item, Resource } from "@/types"
import type { Ref } from "vue"

export interface Display {
    src: string,
    width: number,
    height: number
}

export interface Updatable {
    tick: (delta: number) => void
}

export interface PositionData {
    x: Ref<number>,
    y: Ref<number>
}

export interface Miner {
    displayData: Display,
    position: PositionData,
    output: Resource,
    rate: number,
    quantity: Ref<number>,
    take: (quantity: number) => number
}

export interface Factory {
    displayData: Display,
    position: PositionData,
    input: Resource | Item,
    output: Resource,
    rate: number,
    inQuantity: Ref<number>,
    quantity: Ref<number>,
    take: (quantity: number) => number
    give: (quantity: number) => number
}

export interface Conveyer {
    displayData: ConveyerDisplayData,
    from: Miner | Factory,
    to: Factory
}

export interface ConveyerDisplayData {
    x1: Ref<number>,
    y1: Ref<number>,
    x2: Ref<number>,
    y2: Ref<number>
}