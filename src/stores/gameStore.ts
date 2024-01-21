import type { Minerclass } from "@/gameData/gameWorld";
import type { Miner } from "@/gameData/types";
import { defineStore } from "pinia";

export const gameStore = defineStore('gameStore', {
    state: () => ({
        miners: [] as Minerclass[] 
    }),
    actions: {
        addMiner(miner: Minerclass){
            const {displayData, output, quantity, rate, tick} = miner
            this.miners.push({
                displayData,
                output,
                rate,
                tick,
                quantity: quantity.value
            })
        },
        tick() {
            this.miners.map((miner) => {
                if(miner.tick)
                    miner.tick()
            })
        }
    }
})