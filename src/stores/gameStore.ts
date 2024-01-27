import { createConveyer, createMerger, createSplitter, instanciateMachine } from "@/gameData/gameWorld";
import { BuildingType, InteractionMode, type Building, type BuildingGeneral, type Merger, type PositionData, type Splitter, type Updatable } from "@/gameData/types";
import type { Item, Machine, Resource } from "@/types";
import { defineStore } from "pinia";
import { isRef, ref, toRaw } from "vue";
import { v4 } from 'uuid'
import { getAllMachines, getItemsByMachine } from "@/helpers/api";
import { useLocalStorage } from "@vueuse/core";

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
    buildingGeneral: Map<string, BuildingGeneral>
}


export const gameStore = defineStore('gameStore', {
    state: (): State => {
        return{
            entities: new Map,
            updatables: new Map(),
            selectedMode: InteractionMode.INTERACT,
            selectedBuild: BuildingType.CONVEYER,
            selectedMachineBuild: undefined,
            selectedElement: undefined,
            selectedElementType: undefined,
            cameraLocation: {x: ref(0), y: ref(0)},
            playerInventory: new Map(),
            buildingGeneral: useLocalStorage("buildingGeneral", new Map()).value
        }
    },
    actions: {
        async loadSave(){
            const machines = await getAllMachines()

            const buildingGeneral = await Promise.all(machines.map(async (machine) => {
                if(machine.id)
                {
                    const items = await getItemsByMachine(machine.id)

                    const numberOfInputs = items.length > 0 ? items[0].ingredients.length : 0
                    
                    return {items, machine, numberOfInputs }
                }
            }))

            buildingGeneral.map((infos) => {
                if(infos)
                this.buildingGeneral.set(infos.machine.id + '', infos)
            })
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
                }
                
                this.selectedElement.outQuantity = 0
            }
        },
        addEntity(type: BuildingType, infos: {
            output?: Resource | Item, 
            coords: {x: number, y:number}})
        {
            const {output, coords} = infos
            const uuid = v4()
            if(type === BuildingType.MACHINE && this.selectedMachineBuild?.id){
                const buildingGeneral = this.buildingGeneral.get(this.selectedMachineBuild.id + "")
                if(buildingGeneral){
                    const machine = instanciateMachine(buildingGeneral, coords)
                    if(machine.data.buildingGeneral.machine.id === 'foreuse1'){
                        const copper: Resource = {
                            id: "7",
                            logoPath: "https://webinfo.iutmontp.univ-montp2.fr/~royov/API-PLATFORM/public/media/logo/65afbbe40b6a3_Iron_Ore.webp",
                            name: "Iron Ore"
                        }
                        machine.data.output = copper
                    }
                    this.updatables.set(uuid, machine.updatable)
                    
                    this.entities.set(uuid, {data: machine.data, type, machineId: buildingGeneral.machine.id ?? ''})
                }
            } else if (type === BuildingType.FACTORY){
                const factory = createFactory(output as Item, coords)
                this.updatables.set(uuid, factory.updatable)
                this.entities.set(uuid, {data: factory.data, type})
            } else if (type === BuildingType.MERGER){
                const merger = createMerger(undefined, coords)
                this.entities.set(uuid, {data: merger.data, type})
            } else if (type === BuildingType.SPLITTER){
                const splitter = createSplitter(undefined, coords)

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
                if(type === BuildingType.MACHINE || type === BuildingType.MERGER || type === BuildingType.SPLITTER){
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
            if(machineId){
                return this.buildingGeneral.get(machineId + '')?.items as Item[]
            } else {
                return []
            }
          }
          
    }
})