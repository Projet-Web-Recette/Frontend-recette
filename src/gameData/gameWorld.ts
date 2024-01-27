import type { Item, Resource } from "@/types";
import type { Building, Conveyer, ConveyerDisplayData, BuildingGeneral, Display, Merger, Splitter, Updatable, Input } from "./types";
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

export function instanciateMachine(buildingInfo: BuildingGeneral, coords: {x: number, y: number}){
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

    const copper: Resource = {
        id: "8",
        logoPath: "https://webinfo.iutmontp.univ-montp2.fr/~royov/API-PLATFORM/public/media/logo/65afbc55227aa_Copper_Ore.webp",
        name: "Copper Ore"
    }
    

    const inputCount = items ? items.length ? items[0].quantityIngredients.length : 0: 0

    const machineInstance: Building = {
        buildingGeneral: buildingInfo,
        displayData,
        position: {x, y},

        outQuantity,
        outputConveyerUid: [],
        inputs: [],
        output: machine.name === 'foreuse1' ? copper : undefined,

        inputConveyerUid: [],
        canReceive: (ingredient) => false,
        
        rate: 20,
        take,
    }
    const machineLogic = generateDeltaLogic(machineInstance.rate)

    if(!inputCount){
        const machineUpdatable: Updatable = {
            tick: (delta) => {
                machineLogic.tick(delta)

                if(machineInstance.output && machineLogic.rateRespected()){
                    machineLogic.consumeOneRate()
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
                if(itemOutput?.quantityIngredients)
                {
                    itemOutput.quantityIngredients.map(({quantity, receipe}) => {
                        
                        const equivalent = machineInstance.inputs.find((value) => value.ingredient?.id === receipe.id)
                        if(equivalent && equivalent.quantity.value < quantity){
                            validateProduction = false
                        }
                    })
                } else {
                    validateProduction = false
                }
                

                if(validateProduction && machineInstance.output){
                    machineLogic.tick(delta)

                    if(machineLogic.rateRespected()){
                        machineLogic.consumeAllRate()
                        outQuantity.value += 1
                        inputs.forEach((input) => {
                            input.quantity.value -= 2
                        })
                    }
                }
            }
        }

        return {data: machineInstance, updatable: machineUpdatable}
    }

}


// export function createMiner(resource: Resource, coords: {x: number, y: number}){
//     const minerQuantity = ref(0) // quantity for miner
    
//     const x = ref(coords.x)
//     const y = ref(coords.y)

//     const displayData = {
//         width: 100,
//         height: 100,
//         src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/c/cf/Miner_Mk.1.png"
//     }

//     const minerData: Miner = {
//         displayData,
//         position: {
//             x,
//             y
//         },
//         output: resource,
//         rate: 120,
//         quantity: minerQuantity,
//         take: (quantity: number) => {
//             if(minerQuantity.value > quantity){
//                 minerQuantity.value -= quantity;
//                 return quantity
//             } else {
//                 const max = minerQuantity.value > 0 ? minerQuantity.value : 0
//                 minerQuantity.value -= max 
//                 return max
//             }
//         },
//         inputConveyerUid: [],
//         outputConveyerUid: []
//     }

//     const minerLogic = generateDeltaLogic(minerData.rate)

//     const minerUpdate: Updatable = {
//         tick(delta: number) {
//             minerLogic.tick(delta)

//             if(minerData.output && minerLogic.rateRespected()){
//                 minerLogic.consumeOneRate()
//                 minerData.quantity.value ++
//             }    
//         }
//     }

//     return {data: minerData, updatable: minerUpdate}
// }

// export function createFactory(output: Item | undefined = undefined, coords: {x: number, y: number}){
//     const smelterQuantity = ref(0)
//     const smelterInputQuantity = ref(0)

//     const x = ref(coords.x)
//     const y = ref(coords.y)

//     const displayData: Display = {
//         src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/4/45/Smelter.png",
//         width: 100,
//         height: 100,
//     }

//     let input: Item | Resource | undefined

//     if(output && output.receipe.resources){
//         input = output.receipe.resources[0]
//     }

//     const smelterData: Factory = {
//         displayData,
//         position: {
//             x,
//             y
//         },
//         input: input ? input : output,
//         output,
//         quantity: smelterQuantity,
//         inQuantity: smelterInputQuantity,
//         rate: 20,
//         give: (newQuantity: number) => {
//             smelterInputQuantity.value += newQuantity
//             return 0
//         },
//         take: (quantity: number) => {
//             if(smelterQuantity.value > quantity){
//                 smelterQuantity.value -= quantity;
//                 return quantity
//             } else {
//                 const max = smelterQuantity.value > 0 ? smelterQuantity.value : 0
//                 smelterQuantity.value -= max 
//                 return max
//             }
//         },
//         inputConveyerUid: [],
//         outputConveyerUid: []
//     }

//     const factoryLogic = generateDeltaLogic(smelterData.rate)

//     const smelterUpdatable: Updatable = {
//         tick: (delta) => {
//             if(smelterInputQuantity.value >= 2 && smelterData.output){
//                 factoryLogic.tick(delta)

//                 if(factoryLogic.rateRespected()){
//                     factoryLogic.consumeAllRate()
//                     smelterQuantity.value += 1
//                     smelterInputQuantity.value -= 2
//                 }

//             }
//         }
//     }

//     return {data: smelterData, updatable: smelterUpdatable}
// }

export function createMerger(output: Item | undefined = undefined, coords: {x: number, y: number}){
    const outQuantity = ref(0)

    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData: Display = {
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/a/aa/Conveyor_Merger.png",
        width: 50,
        height: 50,
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
        outQuantity,
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
    return {data: mergerData}
}

export function createSplitter(output: Item | undefined = undefined, coords: {x: number, y: number}){
    const inQuantity = ref(0)

    const x = ref(coords.x)
    const y = ref(coords.y)

    const displayData: Display = {
        src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/4/41/Conveyor_Splitter.png",
        width: 50,
        height: 50,
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
        inQuantity,
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

    const conveyerLogic = generateDeltaLogic(conveyerData.rate)

    const conveyerUpdate: Updatable = {
        tick: (delta) => {
            const {output} = conveyerData.from
            const {inputs, canReceive, give} = conveyerData.to
    
            if(!inputs || !output || !conveyerData.isEnabled){
                return
            }

            if(canReceive(output)){
                conveyerLogic.tick(delta)
                if(conveyerLogic.rateRespected()){
                    conveyerLogic.consumeOneRate()
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