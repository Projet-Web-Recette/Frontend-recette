import type { Item, Resource } from "@/types";
import type { Conveyer, ConveyerDisplayData, Display, Factory, Miner, Updatable } from "./types";
import { gameStore } from "@/stores/gameStore";
import { ref } from "vue";

export const defaultResource: Resource = {
    logoPath: 'public/icons/nothing.png',
    name: 'nothing'
}

export const defaultItem: Item = {
    logoPath: 'public/icons/nothing.png',
    name: 'nothing',
    id: '',
    receipe:{
        id:'',
        items:[],
        resources: []
    }
}


export function createMiner(resource: Resource, coords: {x: number, y: number}){
    const minerQuantity = ref(0) // quantity for miner
    
    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData = {
        width: 100,
        height: 200,
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/c/cf/Miner_Mk.1.png"
    }

    const minerData: Miner = {
        displayData,
        position: {
            x,
            y
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
            if(minerData.output) minerData.quantity.value ++
        }
    }

    return {data: minerData, updatable: minerUpdate}
}

export function createFactory(output: Item | undefined = undefined, coords: {x: number, y: number}){
    const smelterQuantity = ref(0)
    const smelterInputQuantity = ref(0)

    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData: Display = {
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/4/45/Smelter.png",
        width: 100,
        height: 200,
    }

    let input: Item | Resource | undefined

    if(output && output.receipe.resources){
        input = output.receipe.resources[0]
    }

    const smelterData: Factory = {
        displayData,
        position: {
            x,
            y
        },
        input: input ? input : output,
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
            if(smelterInputQuantity.value >= 2 && smelterData.output){
                smelterQuantity.value += 1
                smelterInputQuantity.value -= 2
            }
        }
    }

    return {data: smelterData, updatable: smelterUpdatable}
}

export function createConveyer(from: Miner | Factory, to: Factory) {
    const conveyerDisplayData: ConveyerDisplayData = {
        x1: from.position.x,
        y1: from.position.y,
        x2: to.position.x,
        y2: to.position.y,
    }

    const conveyerData: Conveyer = {
        displayData: conveyerDisplayData,
        from,
        to
    }

    const conveyerUpdate: Updatable = {
        tick: () => {
            const {input} = conveyerData.to
            const {output} = conveyerData.from

            if(!input || !output) return
            if(input.name === output.name){
                if(conveyerData.from.quantity.value > 0){
                    const taken = conveyerData.from.take(1)
                    conveyerData.to.give(taken)
                }
            }
        }
    }

    return {data: conveyerData, updatable: conveyerUpdate}
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