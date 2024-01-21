import type { Resource } from "@/types";
import type { Display, Miner, Updatable } from "./types";
import type { Ref } from "vue";

export class Minerclass implements Miner, Updatable{
    public tick: () => void;
    displayData: Display;
    output: Resource;
    rate: number;
    quantity: Ref<number>;

    constructor(infos: Miner) {
        const {displayData, output, quantity, rate} = infos
        this.displayData = displayData
        this.output = output
        this.quantity = quantity
        this.rate = rate

        this.tick = () => this.quantity.value = this.quantity.value + 1
    }
} 