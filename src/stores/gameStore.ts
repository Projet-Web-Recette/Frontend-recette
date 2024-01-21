import type { ConvoyerClass, Minerclass } from "@/gameData/gameWorld";
import type { Miner, Updatable } from "@/gameData/types";
import { defineStore } from "pinia";

export const gameStore = defineStore('gameStore', {
    state: () => ({
        miners: [] as Minerclass[],
        convoyers: [] as any[],
        updatables: [] as Updatable[]
    }),
    actions: {
        addMiner(miner: Minerclass){
            const {displayData, output, quantity, rate, tick, take} = miner
            this.miners.push({
                displayData,
                output,
                rate,
                tick,
                take,
                quantity: quantity.value
            })

            this.updatables.push({tick: miner.tick})
        },
        addConvoyer(convoyer: ConvoyerClass){
            this.convoyers.push(convoyer)
            this.updatables.push({tick: convoyer.tick})
        },
        tick() {
            this.updatables.map((updatable) => {
                updatable.tick()
            })
        }
    }
})