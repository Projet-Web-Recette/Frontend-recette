import type { Item, Resource } from "@/types";
import type { Convoyer, Factory, Miner, Updatable } from "./types";
import { gameStore } from "@/stores/gameStore";
import { ref } from "vue";


export function createMiner(resource: Resource, coords: {x: number, y: number}){
    const minerQuantity = ref(0) // quantity for miner
    const minerData: Miner = {
    displayData: {
        x: coords.x,
        y: coords.y,
        width: 100,
        height: 200,
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/c/cf/Miner_Mk.1.png"
    },
    output: resource,
    rate: 20,
    quantity: minerQuantity,
    take: (quantity: number) => {
        if(minerQuantity.value > quantity){
            minerQuantity.value -= quantity;
            return quantity
        } else {
            return minerQuantity.value > 0 ? minerQuantity.value : 0
        }
    }
    }

    const minerUpdate: Updatable = {
        tick(delta: number) {
            minerData.quantity.value ++
        }
    }

    return {data: minerData, updatable: minerUpdate}
}

export function createFactory(input: Resource | Item, output: Item, coords: {x: number, y: number}){
    const smelterQuantity = ref(0)
    const smelterInputQuantity = ref(0)

    const smelterData: Factory = {
    displayData: {
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/4/45/Smelter.png",
        x: coords.x,
        y: coords.y,
        width: 100,
        height: 200,
    },
    input,
    output,
    quantity: smelterQuantity,
    inQuantity: smelterInputQuantity,
    rate: 10,
    give: (newQuantity: number) => {
        smelterInputQuantity.value += newQuantity
        return 0
    },
    take: () => 0,
    }

    const smelterUpdatable: Updatable = {
        tick: () => {
            if(smelterInputQuantity.value >= 2){
                smelterQuantity.value += 1
                smelterInputQuantity.value -= 2
            }
        }
    }

    return {data: smelterData, updatable: smelterUpdatable}
}

export function createConvoyer(from: Miner | Factory, to: Factory) {
    const convoyerData: Convoyer = {
        from,
        to
    }

    const convoyerUpdate: Updatable = {
        tick: () => {
            if(convoyerData.from.quantity.value > 0){
                const taken = convoyerData.from.take(1)
                convoyerData.to.give(taken)
            }
        }
    }

    return {data: convoyerData, updatable: convoyerUpdate}
}


let lastTime = Date.now()
function tick(){
    const game = gameStore()
    const {updatables} = game

    updatables.forEach((updatable) => {
        updatable.tick(Date.now() - lastTime)
    })
    lastTime = Date.now()
}

export function launchGame() {
    setInterval(tick, 1000)
}