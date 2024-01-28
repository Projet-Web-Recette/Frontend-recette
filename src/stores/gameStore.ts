import { createConveyer, createMerger, createSplitter, instanciateMachine } from "@/gameData/gameWorld";
import { BuildingType, InteractionMode, type Building, type BuildingGeneral, type Merger, type PositionData, type SaveFormat, type Splitter, type Updatable } from "@/gameData/types";
import type { Item, Machine, Miner, Resource } from "@/types";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { v4 } from 'uuid'
import { getAllItems, getAllMachines, getItemsMachine, getResources, retreiveGameData, saveGameData, sendRequest, updateSave } from "@/helpers/api";
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
    buildingGeneral: Map<string, BuildingGeneral>,
    allItems: Item[],
    allResources: Resource[],
    allMachines: Resource[],
    isProcessing: boolean
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
            allMachines: [],
            isProcessing: false
        }
    },
    actions: {
        async saveGame() {
            try {
                this.isProcessing = true
                
                const save: SaveFormat = {
                    conveyers: [], inventory: [], machines: [], mergers: [], splitters: []
                }
    
                this.entities.forEach((entity, key) => {
                    if(entity.type === BuildingType.MACHINE && entity.machineId){
                        let idOutput = undefined
                        if(entity.data.output?.id){idOutput = entity.data.output?.id}
    
                        
                        const {position} = entity.data
                        save.machines.push({
                            uuid: key,
                            idMachine: entity.machineId,
                            idOutput,
                            position
                        })
                    } else if (entity.type === BuildingType.CONVEYER){
                        save.conveyers.push({
                            idFrom: entity.data.from.uuid, 
                            idTo: entity.data.to.uuid})
                    } else if (entity.type === BuildingType.MERGER){
                        save.mergers.push({
                            position: entity.data.position,
                            uuid: key,
                            idOutput: entity.data.input?.id ?? undefined
                        })
                    } else if (entity.type === BuildingType.SPLITTER){
                        save.splitters.push({
                            position: entity.data.position,
                            uuid: key,
                            idOutput: entity.data.input?.id ?? undefined
                        })
                    }
                })
    
                this.playerInventory.forEach((value, id) => {
                    const {data, quantity} = value
                    save.inventory.push({idItem: data.id, quantity})
                })
    
                if(await retreiveGameData()){
                    updateSave(save)
                } else {
                    saveGameData(save)
                }
            } catch(error){
                console.error(error)
            } 
            finally {
                this.isProcessing = false
            }
        },
        async loadGame(){
            try {
                this.isProcessing = true

                this.allItems = await getAllItems()
                this.allResources = await getResources()
    
    
                this.allMachines = await getAllMachines()
    
                const buildingGeneral = await Promise.all(this.allMachines.map(async (machine) => {
                    if(machine.id)
                    {
                        const items = await getItemsMachine(machine.id)
    
                        const numberOfInputs = items.length > 0 ? items[0].ingredients.length : 0
                        
                        return {items, machine, numberOfInputs }
                    }
                }))
    
    
                const previousSave = await retreiveGameData() as SaveFormat
                const hasSave = previousSave && previousSave.conveyers.length > 0 && previousSave.machines.length > 0 && previousSave.mergers.length > 0 && previousSave.splitters.length > 0
                if(hasSave){
                    previousSave.machines.forEach((machine) => {
                        const general = buildingGeneral.find((bg) => bg?.machine.id === machine.idMachine)
                        const item = general?.items.find((item) => item.id + '' === machine.idOutput + '')
                        const resource = this.allResources.find((resource) => resource.id + '' === machine.idOutput + '')
    
                        if(general){
                            this.addEntity(BuildingType.MACHINE, {output: item ? item : resource, buildingGeneral: general, coords: machine.position, id: machine.uuid})
                        }else {
                            console.error('cant load entity from save')
                        }
                    })
    
                    previousSave.mergers.forEach((merger) => {
                        const {position, uuid, idOutput} = merger
    
                        const item = this.allItems.find((item) => item.id +'' === idOutput +'')
                        const resource = this.allResources.find((resource) => resource.id +'' === idOutput +'')
    
                        const mergerInstance = createMerger(this.allItems, position, uuid, item ? item : resource)
                        this.entities.set(uuid, {data: mergerInstance.data, type: BuildingType.MERGER})
    
                        if(item || resource){
                            this.selectElement(mergerInstance.data, BuildingType.MERGER)
                            this.changeSelectedBuildingOutput(item ? item : resource)
                            this.resetSelectedElement()
                        }
                    })
    
                    previousSave.splitters.forEach((splitter) => {
                        const {position, uuid, idOutput} = splitter
    
                        const item = this.allItems.find((item) => item.id +'' === idOutput +'')
                        const resource = this.allResources.find((resource) => resource.id +'' === idOutput +'')
    
                        const splitterInstance = createSplitter(this.allItems, position, uuid)
                        this.entities.set(uuid, {data: splitterInstance.data, type: BuildingType.SPLITTER})
    
    
                        if(item || resource){
                            this.selectElement(splitterInstance.data, BuildingType.SPLITTER)
                            this.changeSelectedBuildingOutput(item ? item : resource)
                            this.resetSelectedElement()
                        }
                    })
    
    
                    previousSave.conveyers.forEach((conveyer) => {
                        const from = this.entities.get(conveyer.idFrom)?.data
                        const to = this.entities.get(conveyer.idTo)?.data
    
                        if(from && to){
                            this.placeConveyer(from, to)
                        }
                    })
    
                    previousSave.inventory.forEach((invent) => {
                        const item = this.allItems.find((i) => i.id + '' === invent.idItem + '')
                        
                        if(item) this.storeItem(item, invent.quantity)
                    })
    
                } else {
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
                        {x: 800, y: 2200},
                        {x: 1200, y: 2400},
                    ]
    
                    let idx = 0
                    
                    if(miner1){
                        this.allResources.forEach((resource) => {
                            this.addEntity(BuildingType.MACHINE, {output: resource, coords: validPosition[idx], buildingGeneral: minerBuildingGeneral})
                            idx = (idx + 1) % validPosition.length
                        })
                    }
                }
    
    
    
                buildingGeneral.map((infos) => {
                    if(infos)
                    this.buildingGeneral.set(infos.machine.id + '', infos)
                })
            } catch (error){
                console.error(error)
            } finally {
                this.isProcessing = false
            }
            
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
                if(this.selectedElement.output?.id === element.id) return

                if(this.selectedElement.output){
                    this.storeItem(this.selectedElement.output as Resource|Item, this.selectedElement.outQuantity)
                }
                
                const selectedElement = this.selectedElement as Merger
                this.selectedElement.outQuantity = 0
                selectedElement.output = element
                selectedElement.input = element
            } else if(type === BuildingType.SPLITTER && this.selectedElement){
                if(this.selectedElement.output?.id === element.id) return

                if(this.selectedElement.output){
                    this.storeItem(this.selectedElement.output as Resource|Item, this.selectedElement.outQuantity)
                }
                
                const selectedElement = this.selectedElement as Splitter
                this.selectedElement.outQuantity = 0
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
            buildingGeneral?: BuildingGeneral,
            id?: string})
        {
            const {output, coords, id, buildingGeneral} = infos
            
            
            let uuid = id ? id : v4()
            while(this.entities.has(uuid)){
                uuid = v4()
            }

            

            if(type === BuildingType.MACHINE && buildingGeneral){
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
                const merger = createMerger(this.allItems, coords, uuid, output)
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
            if(this.selectedMode === InteractionMode.DELETE){
                this.deleteBuilding(element)
            } else if(this.selectedMode === InteractionMode.BUILD && this.selectedBuild === BuildingType.CONVEYER && this.selectedElement){
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
          },
          storeSelectedElementItem() {
            if(this.selectedElement && this.selectedElement.output){
                this.storeItem(this.selectedElement.output, this.selectedElement.outQuantity)
                this.selectedElement.outQuantity = 0
            }
          },
          deleteBuilding(building: Building){
            building.inputConveyerUid.concat(building.outputConveyerUid).forEach((id) => {
                this.disconnectConveyer(id)
            })
            this.entities.delete(building.uuid)
          }
    }
})