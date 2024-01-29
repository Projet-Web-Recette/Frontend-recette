import type { Item, Miner, Resource } from "@/types";
import { type Building, type Conveyer, type ConveyerDisplayData, type BuildingGeneral, type Display, type Merger, type Splitter, type Updatable, type Input, BuildingType } from "./types";
import { gameStore } from "@/stores/gameStore";
import { ref, watch } from "vue";

export const defaultItem: Item = {
    logoPath: 'public/icons/nothing.png',
    name: 'nothing',
    id: '',
    ingredients: [],
    machine: {
        logoPath: 'public/icons/nothing.png',
        name: 'nothing'
    },
    quantityIngredients: [],
    quantityProduced: '0'
}


export const splitterImg = 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/4/41/Conveyor_Splitter.png'
export const mergerImg = 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/a/aa/Conveyor_Merger.png'
export const conveyerImg = 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/c/c9/Conveyor_Belt_Mk.1.png'


export function instanciateMachine(buildingInfo: BuildingGeneral, coords: {x: number, y: number}, uuid: string, rate = 0){
    const {machine, items} = buildingInfo

    const x = ref(coords.x)
    const y = ref(coords.y)
    
    const displayData: Display = {
        width: 100,
        height: 100,
        src: machine.logoPath
    }
    
    
    const outQuantity = ref(0)

    const take = (quantity: number) => {
        if(outQuantity.value > quantity){
            outQuantity.value -= quantity;
            return quantity
        } else {
            const max = outQuantity.value > 0 ? outQuantity.value : 0
            outQuantity.value -= max 
            return max
        }
    }
    
    let inputCount = 0

    if(items && items.length){
        if((items[0] as Item).quantityIngredients)
        {
            inputCount = (items[0] as Item).quantityIngredients.length
        }
    }

    const machineInstance: Building = {
        buildingGeneral: buildingInfo,
        displayData,
        position: {x, y},

        uuid,

        outQuantity,
        outputConveyerUid: [],
        inputs: [],
        output: undefined,

        inputConveyerUid: [],
        canReceive: (ingredient) => false,
        
        rate: rate,
        take,
    }
    const machineLogic = generateDeltaLogic()

    if(!inputCount){
        const machineUpdatable: Updatable = {
            tick: (delta) => {
                machineLogic.tick(delta)

                if(machineInstance.output && machineLogic.rateRespected(machineInstance.rate)){
                    machineLogic.consumeOneRate(machineInstance.rate)
                    machineInstance.outQuantity.value ++
                }
            }
        }

        return {data: machineInstance, updatable: machineUpdatable}
    } else {

        const inputs: Input[] = []

        for(let i = 0; i<inputCount; i++){
            const quantity = ref(0)
            inputs.push({quantity})
        }

        machineInstance.inputs = inputs


        machineInstance.canReceive = (ingredient) => {
            const can = machineInstance.inputs.find((input) => input.ingredient?.id + '' === ingredient.id + '')
            return can ? true : false
        }

        machineInstance.give = (data: Item | Resource, newQuantity: number) => {
            let givenQuantity = 0
            
            machineInstance.inputs.forEach((infos) => {
                if(infos.ingredient && infos.ingredient.id + '' === data.id + ''){
                    infos.quantity.value += newQuantity
                    givenQuantity += newQuantity
                }
            })


            if(givenQuantity > newQuantity){console.log("give s'est donné plus de quantité que recu")}

            return givenQuantity
        }

        const machineUpdatable: Updatable = {
            tick: (delta) => {
                let validateProduction = true
                const itemOutput = machineInstance.output as Item | undefined
                let outputRate = machineInstance.rate
                if(itemOutput?.quantityIngredients)
                {
                    outputRate = Number.parseInt(itemOutput.quantityProduced)

                    itemOutput.quantityIngredients.map(({quantity, receipe}) => {                        
                        const equivalent = machineInstance.inputs.find((value) => value.ingredient?.id === receipe.id)
                        if(equivalent && equivalent.quantity.value < quantity / outputRate){
                            validateProduction = false
                        }
                    })
                } else {
                    validateProduction = false
                }


                if(validateProduction && machineInstance.output){
                    machineLogic.tick(delta)

                    if(machineLogic.rateRespected(machineInstance.rate)){
                        machineLogic.consumeAllRate()
                        outQuantity.value += 1
                        inputs.forEach((input) => {
                            const equivalent = itemOutput?.quantityIngredients.find((value) => value.receipe.id === input.ingredient?.id)
                            input.quantity.value -= equivalent? equivalent.quantity / outputRate : 1
                        })
                    }
                }
            }
        }

        return {data: machineInstance, updatable: machineUpdatable}
    }

}

export function createMerger(items: Item[], coords: {x: number, y: number}, uuid: string, output: Item | Resource |undefined){
    const outQuantity = ref(0)

    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData: Display = {
        src: mergerImg,
        width: 50,
        height: 50,
    }

    const buildingGeneral: BuildingGeneral = {
        items,
        numberOfInputs: 1,
        machine: {
            logoPath: mergerImg,
            name: 'merger'
        }
    }

    const mergerData: Merger = {
        buildingGeneral,
        displayData,
        position: {
            x,
            y
        },
        inputs: [],
        rate: 999,
        uuid,
        input: output ? output : undefined,
        outQuantity,
        canReceive: (ingredient) => false,
        give: (ingredient, newQuantity) => {
            outQuantity.value += newQuantity
            return 0
        },
        take: (takenQuantity) => {
            if(outQuantity.value > takenQuantity){
                outQuantity.value -= takenQuantity;
                return takenQuantity
            } else {
                const max = outQuantity.value > 0 ? outQuantity.value : 0
                outQuantity.value -= max 
                return max
            }
        },
        outputConveyerUid: [],
        inputConveyerUid: []
    }

    mergerData.canReceive = (element) => mergerData.output?.id === element.id

    return {data: mergerData}
}

export function createSplitter(items: Item[], coords: {x: number, y: number}, uuid: string){
    const inQuantity = ref(0)

    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData: Display = {
        src: splitterImg,
        width: 50,
        height: 50,
    }

    const buildingGeneral: BuildingGeneral = {
        items,
        numberOfInputs: 1,
        machine: {
            logoPath: splitterImg,
            name: 'merger'
        }
    }


    let input: Item | Resource | undefined

    let enabledConveyer = 0

    const splitterData: Splitter = {
        buildingGeneral,
        displayData,
        position: {
            x,
            y
        },
        input,
        inputs: [],
        canReceive: () => false,
        rate: 999,
        uuid,
        outQuantity: inQuantity, // absurd but to late to correct namming
        give: (ingredient, newQuantity) => {
            inQuantity.value += newQuantity
            return 0
        },
        take(takenQuantity) {
            if(this.disableConveyer && this.enableConveyer)
            {
                this.disableConveyer(this.outputConveyerUid[enabledConveyer])
                enabledConveyer = (enabledConveyer + 1) % (this.outputConveyerUid.length)
                this.enableConveyer(this.outputConveyerUid[enabledConveyer])
            }

            if(inQuantity.value > takenQuantity){
                inQuantity.value -= takenQuantity;
                return takenQuantity
            } else {
                const max = inQuantity.value > 0 ? inQuantity.value : 0
                inQuantity.value -= max 
                return max
            }
        },
        outputConveyerUid:[],
        inputConveyerUid: []
    }


    splitterData.canReceive = (element) => splitterData.output?.id === element.id

    return {data: splitterData}
}

export function createConveyer(from: Building, to: Building) {
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

    const conveyerLogic = generateDeltaLogic()

    const conveyerUpdate: Updatable = {
        tick: (delta) => {
            const {output} = conveyerData.from
            const {inputs, canReceive, give} = conveyerData.to
    
            if(!inputs || !output || !conveyerData.isEnabled){
                return
            }

            if(canReceive(output)){
                conveyerLogic.tick(delta)
                if(conveyerLogic.rateRespected(conveyerData.rate)){
                    conveyerLogic.consumeOneRate(conveyerData.rate)
                    if(give && conveyerData.from.outQuantity.value > 0 && output){
                        const taken = conveyerData.from.take(1)
                        give(output, taken)
                    }
                }
            }
        }
    }

    return {data: conveyerData, updatable: conveyerUpdate}
}

function generateDeltaLogic(){
    let timePassed = 0
    const rateRespected = (rate: number) => timePassed > 60 / rate * 1000
    
    function tick(delta: number){
        timePassed += delta
    }

    const consumeOneRate = (rate: number) => {
        timePassed -= 60 / rate * 1000;
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