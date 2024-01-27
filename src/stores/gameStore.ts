import { createConveyer, createMerger, createSplitter, instanciateMachine } from "@/gameData/gameWorld";
import { BuildingType, InteractionMode, type Building, type BuildingGeneral, type Merger, type PositionData, type Splitter, type Updatable } from "@/gameData/types";
import type { Item, Machine, Miner, Resource } from "@/types";
import { defineStore } from "pinia";
import { isRef, ref, toRaw } from "vue";
import { v4 } from 'uuid'
import { getAllItems, getAllMachines, getItemsByMachine, getResources, sendRequest } from "@/helpers/api";
import { rand, useLocalStorage } from "@vueuse/core";

interface State {
    entities: Map<string,{type: BuildingType, data: any, machineId?: string}>,
    updatables: Map<string,Updatable>,
    selectedMode: InteractionMode,
    selectedBuild: BuildingType,
    selectedMachineBuild?: Machine,
    selectedElement?: Building,
    selectedElementType?: BuildingType,
    selectedFactory?: Building,
    cameraLocation: PositionData,
    playerInventory: Map<string, {data: Item | Resource, quantity: number}>,
    buildingGeneral: Map<string, BuildingGeneral>,
    allItems: Item[],
    allResources: Resource[],
    save: Map<string, {
        type: BuildingType, 
        infos: {
            output?: Item | Resource, 
            machineId?: string
            uuidFrom?: string, 
            uuidTo?: string}
        }>
}


export const gameStore = defineStore('gameStore', {
    state: (): State => {
        return{
            entities: new Map(),
            updatables: new Map(),
            selectedMode: InteractionMode.INTERACT,
            selectedBuild: BuildingType.CONVEYER,
            selectedMachineBuild: undefined,
            selectedElement: undefined,
            selectedElementType: undefined,
            cameraLocation: {x: ref(-800), y: ref(-1000)},
            playerInventory: new Map(),
            buildingGeneral: useLocalStorage("buildingGeneral", new Map()).value,
            allItems: [],
            allResources: [],
            save: useLocalStorage("save", new Map()).value
        }
    },
    actions: {
        async loadGame(){
            this.allItems = await getAllItems()
            this.allResources = await getResources()

            const machines = await getAllMachines()

            const buildingGeneral = await Promise.all(machines.map(async (machine) => {
                if(machine.id)
                {
                    const items = await getItemsByMachine(machine.id)

                    const numberOfInputs = items.length > 0 ? items[0].ingredients.length : 0
                    
                    return {items, machine, numberOfInputs }
                }
            }))


            const request = await sendRequest('foreuses', 'GET', undefined, true)
    
            const response = request?.content["hydra:member"];

            const miners: Miner[] = response.map((value: any) => {
                const {id, contentUrl, nom, tauxProdForeuse, type} = value
                return {
                    id,
                    logoPath: contentUrl, 
                    name: nom, 
                    rate: tauxProdForeuse, 
                    type
                } as Miner 
            })

            const miner1 = miners.find((miner) => miner.type === 'mk1')

            const minerBuildingGeneral: BuildingGeneral = {
                items: this.allResources,
                machine: miner1 as Machine,
                numberOfInputs: 0
            }

            const validPosition: {x: number, y: number}[] = [
                {x: 600, y: 1600},
                {x: 2000, y: 1800},
                {x: 1400, y: 1700},
                // {x: 800, y: 2200},
                // {x: 1200, y: 2400},
            ]

            let idx = 0
            
            if(miner1){
                this.allResources.forEach((resource) => {
                    this.addEntity(BuildingType.MACHINE, {output: resource, coords: validPosition[idx], buildingGeneral: minerBuildingGeneral})
                    idx = (idx + 1) % validPosition.length
                })
            }



            buildingGeneral.map((infos) => {
                if(infos)
                this.buildingGeneral.set(infos.machine.id + '', infos)
            })

            // this.save.set('test', {infos: {uuidFrom: 'je', uuidTo: 'tu'}, type: BuildingType.CONVEYER})

            // if(this.save.size){
            //     const saveIterator = this.save.entries()
            //     for(const [id, {infos, type}] of saveIterator){
            //         if(type === BuildingType.MACHINE){

            //         }
            //     }
            // }
        },
        selectMode(mode: InteractionMode){          
            this.selectedMode = mode 
            this.resetSelectedElement()
        },
        selectMachine(machine: Machine){
            this.selectedMachineBuild = machine
        },
        disconnectConveyer(id: string){
            const conveyer = this.entities.get(id)
            if(conveyer && conveyer.type === BuildingType.CONVEYER){
                const { from, to } = conveyer.data
                from.outputConveyerUid.pop(id)
                to.inputConveyerUid.pop(id)

                this.entities.delete(id)
                this.updatables.delete(id)
            }

            delete conveyer?.data
        },
        placeConveyer(from: Building, to: Building){
            const uuid = v4()
            const conveyer = createConveyer(toRaw(from), toRaw(to))

            from.outputConveyerUid.push(uuid)
            to.inputConveyerUid.push(uuid)
            
            this.updatables.set(uuid, conveyer.updatable)
            this.entities.set(uuid, {type: BuildingType.CONVEYER, data: conveyer.data})
        },
        changeSelectedBuildingOutput(element: Item | Resource){
            const type = this.selectedElementType
            if(type === BuildingType.MERGER && this.selectedElement){
                const selectedElement = this.selectedElement as Merger
                selectedElement.output = element
                selectedElement.input = element
            } else if(type === BuildingType.SPLITTER && this.selectedElement){
                const selectedElement = this.selectedElement as Splitter
                selectedElement.output = element
                selectedElement.input = element
            } else {
                if(!this.selectedElement || this.selectedElement.output?.id === element.id) return

                if(this.selectedElement.output){
                    this.storeItem(this.selectedElement.output as Resource|Item, this.selectedElement.outQuantity)
                }

                this.selectedElement.output = element
            
                const elementItem = element as Item
                if(elementItem.quantityIngredients){
                    for(let i=0; i<elementItem.quantityIngredients.length; i++){
                        this.selectedElement.inputs[i].ingredient = elementItem.quantityIngredients[i].receipe
                        this.selectedElement.inputs[i].quantity = 0
                    }

                    this.selectedElement.rate = Number.parseInt(elementItem.quantityProduced)

                    console.log(this.selectedElement.rate)
                }

                
                this.selectedElement.outQuantity = 0
            }
        },
        addEntity(type: BuildingType, infos: {
            output?: Resource | Item, 
            coords: {x: number, y:number},
            buildingGeneral: BuildingGeneral})
        {
            const {output, coords} = infos
            const uuid = v4()
            if(type === BuildingType.MACHINE){
                const {buildingGeneral} = infos
                const machine = instanciateMachine(buildingGeneral, coords, uuid)
                this.updatables.set(uuid, machine.updatable)
                
                const entityInfos = {data: machine.data, type, machineId: buildingGeneral.machine.id ?? ''}

                this.entities.set(uuid, entityInfos)
                
                if(output){
                    this.selectElement(entityInfos.data, type)
                    this.changeSelectedBuildingOutput(output)
                    this.resetSelectedElement()
                }
            } else if (type === BuildingType.MERGER){
                const merger = createMerger(this.allItems, coords, uuid)
                this.entities.set(uuid, {data: merger.data, type})
            } else if (type === BuildingType.SPLITTER){
                const splitter = createSplitter(this.allItems, coords, uuid)

                const changeConveyerState = (id: string, status: boolean) => {
                    const infos = this.entities.get(id)
                    if(infos && infos.type === BuildingType.CONVEYER){
                        infos.data.isEnabled = status
                    }
                }
                splitter.data.disableConveyer = (id) => changeConveyerState(id, false)
                splitter.data.enableConveyer = (id) => changeConveyerState(id, true)

                this.entities.set(uuid, {data: splitter.data, type: BuildingType.SPLITTER})

            }
          },
          selectElement(element: Building, type: BuildingType){
            if(this.selectedMode === InteractionMode.BUILD && this.selectedBuild === BuildingType.CONVEYER && this.selectedElement){
                if(type !== BuildingType.CONVEYER){
                    this.placeConveyer(this.selectedElement, element)
                }
                this.resetSelectedElement()
            } else {
                this.selectedElement = element
                this.selectedElementType = type
            }

          },
          resetSelectedElement(){
            this.selectedElement = undefined
            this.selectedElementType = undefined
            this.selectedFactory = undefined
          },
          storeItem(data: Item | Resource, quantity: number){
            const infos = this.playerInventory.get(data.id)
            if(infos){
                infos.quantity += quantity
                this.playerInventory.set(data.id, infos)
            } else {
                this.playerInventory.set(data.id, {data, quantity})
            }
          },
          canTakeItemQuantity(item: Item, quantity: number){
            const infos = this.playerInventory.get(item.id)
            return infos && infos.quantity >= quantity
          },
          takeItemQuantity(item: Item, quantity: number) {
            const infos = this.playerInventory.get(item.id)
            if(infos && infos.quantity >= quantity){
                infos.quantity -= quantity
                this.playerInventory.set(item.id, infos)
            } else {
                throw Error(`can not take this item (${item.name}) or this quantity (${quantity})`)
            }
          },
          getItemListSelectedBuild(): Item[]{
            const machineId = this.selectedElement?.buildingGeneral.machine.id
            if(this.selectedElementType === BuildingType.MERGER || this.selectedElementType === BuildingType.SPLITTER){
                return this.allItems
            }
            else if(machineId){
                return this.buildingGeneral.get(machineId + '')?.items as Item[]
            } else {
                return []
            }
          }
          
    }
})