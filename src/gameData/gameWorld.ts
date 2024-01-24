import type { Item, Resource } from "@/types";
import type { Building, Conveyer, ConveyerDisplayData, Display, Factory, Merger, Miner, Splitter, Updatable } from "./types";
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
        rate: 120,
        quantity: minerQuantity,
        take: (quantity: number) => {
            if(minerQuantity.value > quantity){
                minerQuantity.value -= quantity;
                return quantity
            } else {
                const max = minerQuantity.value > 0 ? minerQuantity.value : 0
                minerQuantity.value -= max 
                return max
            }
        },
        inputConveyerUid: [],
        outputConveyerUid: []
    }

    const minerLogic = generateDeltaLogic(minerData.rate)

    const minerUpdate: Updatable = {
        tick(delta: number) {
            minerLogic.tick(delta)

            if(minerData.output && minerLogic.rateRespected()){
                minerLogic.consumeOneRate()
                minerData.quantity.value ++
            }    
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
        rate: 20,
        give: (newQuantity: number) => {
            smelterInputQuantity.value += newQuantity
            return 0
        },
        take: (quantity: number) => {
            if(smelterQuantity.value > quantity){
                smelterQuantity.value -= quantity;
                return quantity
            } else {
                const max = smelterQuantity.value > 0 ? smelterQuantity.value : 0
                smelterQuantity.value -= max 
                return max
            }
        },
        inputConveyerUid: [],
        outputConveyerUid: []
    }

    const factoryLogic = generateDeltaLogic(smelterData.rate)

    const smelterUpdatable: Updatable = {
        tick: (delta) => {
            if(smelterInputQuantity.value >= 2 && smelterData.output){
                factoryLogic.tick(delta)

                if(factoryLogic.rateRespected()){
                    factoryLogic.consumeAllRate()
                    smelterQuantity.value += 1
                    smelterInputQuantity.value -= 2
                }

            }
        }
    }

    return {data: smelterData, updatable: smelterUpdatable}
}

export function createMerger(output: Item | undefined = undefined, coords: {x: number, y: number}){
    const quantity = ref(0)

    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData: Display = {
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/a/aa/Conveyor_Merger.png",
        width: 100,
        height: 100,
    }

    let input: Item | Resource | undefined

    if(output){
        input = output
    }

    const mergerData: Merger = {
        displayData,
        position: {
            x,
            y
        },
        input,
        output,
        quantity,
        give: (newQuantity: number) => {
            quantity.value += newQuantity
            return 0
        },
        take: (takenQuantity) => {
            if(quantity.value > takenQuantity){
                quantity.value -= takenQuantity;
                return takenQuantity
            } else {
                const max = quantity.value > 0 ? quantity.value : 0
                quantity.value -= max 
                return max
            }
        },
        outputConveyerUid: [],
        inputConveyerUid: []
    }
    return {data: mergerData}
}

export function createSplitter(output: Item | undefined = undefined, coords: {x: number, y: number}){
    const quantity = ref(0)

    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData: Display = {
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/4/41/Conveyor_Splitter.png",
        width: 100,
        height: 100,
    }

    let input: Item | Resource | undefined

    if(output){
        input = output
    }

    let enabledConveyer = 0

    const splitterData: Splitter = {
        displayData,
        position: {
            x,
            y
        },
        input,
        output,
        quantity,
        give: (newQuantity: number) => {
            quantity.value += newQuantity
            return 0
        },
        take(takenQuantity) {
            if(this.disableConveyer && this.enableConveyer)
            {
                this.disableConveyer(this.outputConveyerUid[enabledConveyer])
                enabledConveyer = (enabledConveyer + 1) % (this.outputConveyerUid.length)
                this.enableConveyer(this.outputConveyerUid[enabledConveyer])
            }

            if(quantity.value > takenQuantity){
                quantity.value -= takenQuantity;
                return takenQuantity
            } else {
                const max = quantity.value > 0 ? quantity.value : 0
                quantity.value -= max 
                return max
            }
        },
        outputConveyerUid:[],
        inputConveyerUid: []
    }
    return {data: splitterData}
}

export function createConveyer(from: Building, to: Factory | Merger) {
    const conveyerDisplayData: ConveyerDisplayData = {
        x1: from.position.x,
        y1: from.position.y,
        x2: to.position.x,
        y2: to.position.y,
    }

    const conveyerData: Conveyer = {
        displayData: conveyerDisplayData,
        from,
        to,
        rate: 60,
        isEnabled: true
    }

    const conveyerLogic = generateDeltaLogic(conveyerData.rate)

    const conveyerUpdate: Updatable = {
        tick: (delta) => {
            const {output} = conveyerData.from
            const {input} = conveyerData.to
    
            if(!input || !output || !conveyerData.isEnabled){
                return
            }

            if(input.name === output.name){
                conveyerLogic.tick(delta)
                if(conveyerLogic.rateRespected()){
                    conveyerLogic.consumeOneRate()
                    if(conveyerData.from.quantity.value > 0){
                        const taken = conveyerData.from.take(1)
                        conveyerData.to.give(taken)
                    }
                }
            }
        }
    }

    return {data: conveyerData, updatable: conveyerUpdate}
}

function generateDeltaLogic(rate: number){
    let timePassed = 0
    const tickToTake = 60 / rate * 1000
    const rateRespected = () => timePassed > tickToTake
    
    function tick(delta: number){
        timePassed += delta
    }

    const consumeOneRate = () => {
        timePassed -= tickToTake; 
        timePassed = timePassed < 0 ? 0 : timePassed
    }

    const consumeAllRate = () => {
        timePassed = 0
    }

    return {rateRespected, tick, consumeOneRate, consumeAllRate}
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

export const tickRate = 60

export function launchGame() {
    setInterval(tick, 1000 / 60)
}