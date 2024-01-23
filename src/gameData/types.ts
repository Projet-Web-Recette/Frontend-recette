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

export interface Building {
    displayData: Display,
    position: PositionData,
    output?: Resource | Item,
    rate: number,
    quantity: Ref<number>,
    take: (quantity: number) => number,
    connectedConveyers: Array<string>
}

export interface Miner extends Building {
    output: Resource,
}

export interface Factory extends Building {
    input?: Resource | Item,
    inQuantity: Ref<number>,
    give: (quantity: number) => number
}

export interface Conveyer {
    displayData: ConveyerDisplayData,
    from: Building,
    to: Factory
}

export interface ConveyerDisplayData {
    x1: Ref<number>,
    y1: Ref<number>,
    x2: Ref<number>,
    y2: Ref<number>
}


export enum BuildingType {
    MINER = 'miner',
    FACTORY = 'factory',
    CONVEYER = 'conveyer'
}

export enum InteractionMode {
    BUILD = 'build',
    INTERACT = 'interact',
    MOVE = 'move'
}