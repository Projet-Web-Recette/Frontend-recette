import type { Resource } from "@/types";
import type { Convoyer, Display, Factory, Miner, Updatable } from "./types";
import { watch, type Ref } from "vue";

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

        this.tick = () => this.quantity.value += 1
    }

    take(quantity: number): number {
        if(this.quantity.value > quantity){
            this.quantity.value -= quantity;
            return quantity
        }
        else {
            return this.quantity.value > 0 ? this.quantity.value : 0
        }
    }
}


export class ConvoyerClass implements Convoyer, Updatable{
    from: Miner | Factory;
    to: Factory;
    tick: () => void;

    constructor(convoyer: Convoyer){
        this.from = convoyer.from
        this.to = convoyer.to
        
        this.tick = () => {
            if(this.from.quantity.value > 0){
                const taken = this.from.take(1)
                this.to.give(taken)
            }
        }
    }
}