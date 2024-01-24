import { createConveyer, createFactory, createMerger, createMiner, createSplitter, defaultResource } from "@/gameData/gameWorld";
import { BuildingType, InteractionMode, type Building, type Conveyer, type Factory, type Merger, type Miner, type PositionData, type Updatable } from "@/gameData/types";
import type { Item, Resource } from "@/types";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { v4 } from 'uuid'

interface State {
    entities: Map<string,{type: BuildingType, data: any}>,
    updatables: Map<string,Updatable>,
    selectedMode: InteractionMode,
    selectedBuild: BuildingType,
    selectedElement?: Factory | Miner | Merger,
    selectedElementType?: BuildingType,
    selectedFactory: Factory | undefined,
    cameraLocation: PositionData,
    playerInventory: Map<string, {item: Item, quantity: number}>
}


export const gameStore = defineStore('gameStore', {
    state: (): State => {
        return{
            entities: new Map,
            updatables: new Map(),
            selectedMode: InteractionMode.INTERACT,
            selectedBuild: BuildingType.FACTORY,
            selectedElement: undefined,
            selectedElementType: undefined,
            selectedFactory: undefined,
            cameraLocation: {x: ref(0), y: ref(0)},
            playerInventory: new Map()
        }
    },
    actions: {
        selectMode(mode: InteractionMode){          
            this.selectedMode = mode 
            this.resetSelectedElement()
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
        placeConveyer(from: Building, to: Factory | Merger){
            const uuid = v4()
            const conveyer = createConveyer(toRaw(from), toRaw(to))

            from.outputConveyerUid.push(uuid)
            to.inputConveyerUid.push(uuid)
            
            this.updatables.set(uuid, conveyer.updatable)
            this.entities.set(uuid, {type: BuildingType.CONVEYER, data: conveyer.data})
        },
        changeSelectedFactoryReceipe(item: Item){
            if(!this.selectedFactory || this.selectedFactory.output === item) return
            
            if(this.selectedFactory.output)
                this.storeItem(this.selectedFactory.output as Item, this.selectedFactory.quantity)
            
            this.selectedFactory.output = item
            let newInput: Item | Resource | undefined
          
            if(item.receipe.resources){
              newInput = item.receipe.resources[0]
            } else if(item.receipe.items) {
              newInput = item.receipe.items[0]
            }

            this.selectedFactory.inQuantity = 0
            this.selectedFactory.quantity = 0
          
            if(newInput) this.selectedFactory.input = newInput
        },
        changeSelectedLogisticItem(element: Item | Resource){
            if(
                (   this.selectedElementType === BuildingType.MERGER || 
                    this.selectedElementType === BuildingType.SPLITTER ) && 
                this.selectedElement
                ){
                this.selectedElement.output = element
                this.selectedElement.input = element
            }
        },
        addEntity(type: BuildingType, infos: {
            output?: Resource | Item, 
            coords: {x: number, y:number}})
        {
            const {output, coords} = infos
            const uuid = v4()
            if(type === BuildingType.MINER){
                const miner = createMiner(output ? output : defaultResource, coords)
                this.updatables.set(uuid, miner.updatable)
                
                this.entities.set(uuid, {data: miner.data, type})
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
                if(type === BuildingType.FACTORY || type === BuildingType.MERGER || type === BuildingType.SPLITTER){
                    this.placeConveyer(this.selectedElement, element)
                }
                this.resetSelectedElement()
            } else {
                this.selectedElement = element
                this.selectedElementType = type
                if(type === BuildingType.FACTORY){
                    this.selectedFactory = element
                }
            }

          },
          resetSelectedElement(){
            this.selectedElement = undefined
            this.selectedElementType = undefined
            this.selectedFactory = undefined
          },
          storeItem(item: Item, quantity: number){
            const infos = this.playerInventory.get(item.id)
            if(infos){
                infos.quantity += quantity
                this.playerInventory.set(item.id, infos)
            } else {
                this.playerInventory.set(item.id, {item, quantity})
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
          }
          
    }
})