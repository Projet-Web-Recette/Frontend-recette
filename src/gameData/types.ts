import type { Item, Machine, Resource } from "@/types"
import type { Ref } from "vue"

export interface Display {
    src: string,
    width: number,
    height: number
}

export interface Updatable {
    timePassed?: number,
    tick: (delta: number) => void
}

export interface PositionData {
    x: Ref<number>,
    y: Ref<number>
}

export interface BuildingGeneral {
    machine: Machine,
    items: Item[] | Resource[],
    numberOfInputs: number
}

export interface Building {
    buildingGeneral: BuildingGeneral,
    displayData: Display,
    position: PositionData,

    uuid: string,

    rate: number,
    output?: Resource | Item,
    outQuantity: Ref<number>,
    take: (quantity: number) => number,
    outputConveyerUid: Array<string>,
    
    inputs: Input[]
    give?: (ingredient: Item |Resource, quantity: number) => number
    canReceive: (ingredient: Item | Resource) => boolean
    inputConveyerUid: Array<string>, // doesn't apply interface segregation
}

export interface Input {
    ingredient?: Item | Resource,
    quantity: Ref<number>
}

export interface Merger extends Building {
    input?: Resource | Item,
    buidlingGeneral?: undefined
}

export interface Splitter extends Building {
    input?: Resource | Item,
    disableConveyer?: (id: string) => void,
    enableConveyer?: (id: string) => void
}

export interface Conveyer {
    displayData: ConveyerDisplayData,
    from: Building,
    to: Building,
    rate: number,
    isEnabled: boolean
}

export interface ConveyerDisplayData {
    x1: Ref<number>,
    y1: Ref<number>,
    x2: Ref<number>,
    y2: Ref<number>
}


export enum BuildingType {
    MACHINE = 'machine',
    CONVEYER = 'conveyer',
    MERGER = 'merger',
    SPLITTER = 'splitter'
}

export enum InteractionMode {
    BUILD = 'build',
    INTERACT = 'interact',
    MOVE = 'move',
    CAMERA = 'camera',
    DELETE = 'delete'
}

export interface SaveFormat {
    machines: SaveMachine[],
    conveyers: {
        idFrom: string,
        idTo: string
    }[],
    mergers: SaveBuilding[],
    splitters: SaveBuilding[],
    inventory: {
        idItem: string,
        quantity: number
    }[]
}

export interface SaveBuilding {
    uuid: string,
    idOutput?: string,
    position: {x: number, y: number}
}

export interface SaveMachine extends SaveBuilding {
    idMachine: string,
}