import type { Resource } from "@/types"
import type { Ref } from "vue"

export interface Display {
    src: string,
    x: number,
    y: number
}

export interface Updatable {
    tick: () => void
}

export interface Miner {
    displayData: Display,
    output: Resource,
    rate: number,
    quantity: Ref<number>
}