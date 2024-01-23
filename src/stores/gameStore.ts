import { createConveyer, createFactory, createMiner, defaultResource } from "@/gameData/gameWorld";
import { BuildingType, InteractionMode, type Building, type Conveyer, type Factory, type Miner, type Updatable } from "@/gameData/types";
import type { Item, Resource } from "@/types";
import { defineStore } from "pinia";
import { toRaw } from "vue";
import { v4 } from 'uuid'

// attempts to avoid having this much types errors with pinia

// function buildingDeepDesctructuring(building: Building){
//     return {
//         ...building,
//         displayData: {...building.displayData}, 
//         position: {...building.position},
//         output: {...building.output},
//     }
// }

// function deepConveyerDestructuring(conveyer: Conveyer){
//     const {from, to, displayData} = conveyer

//     return {
//         ...conveyer,
//         displayData: {...displayData},
//         from: {...buildingDeepDesctructuring(from)},
//         to: {
//             ...to, 
//             ...buildingDeepDesctructuring(to)
//         }
//     }
// }


interface State {
    entities: Map<string,{type: BuildingType, data: any}>,
    updatables: Map<string,Updatable>,
    selectedMode: InteractionMode,
    selectedBuild: BuildingType,
    selectedElement?: Factory | Miner,
    selectedFactory: Factory | undefined
}


export const gameStore = defineStore('gameStore', {
    state: (): State => {
        return{
            entities: new Map,
            updatables: new Map(),
            selectedMode: InteractionMode.INTERACT,
            selectedBuild: BuildingType.FACTORY,
            selectedElement: undefined,
            selectedFactory: undefined
        }
    },
    actions: {
        selectMode(mode: InteractionMode){          
            this.selectedMode = mode 
            this.selectedElement = undefined
            this.selectedFactory = undefined
        },
        disconnectConveyer(id: string){
            const conveyer = this.entities.get(id)
            if(conveyer && conveyer.type === BuildingType.CONVEYER){
                const { from, to } = conveyer.data
                debugger
                from.connectedConveyers.pop(id)
                to.connectedConveyers.pop(id)

                this.entities.delete(id)
                this.updatables.delete(id)
            }

            delete conveyer?.data
        },
        placeConveyer(from: Building, to: Factory){
            const uuid = v4()
            const conveyer = createConveyer(toRaw(from), toRaw(to))

            from.connectedConveyers.push(uuid)
            to.connectedConveyers.push(uuid)
            
            this.updatables.set(uuid, conveyer.updatable)
            this.entities.set(uuid, {type: BuildingType.CONVEYER, data: conveyer.data})
        },
        selectBuild(data: Factory | Miner, type: BuildingType){
            if(this.selectedMode === InteractionMode.CONVEYER){
              if(!this.selectedElement){
                this.selectedElement = data
              } else {
                if(type === BuildingType.FACTORY){
                    const element = this.selectedElement as Building
                    this.placeConveyer(element, data as Factory)
                }
                this.selectedElement = undefined
              }
            } else {
                this.selectedElement = data
                if(type === BuildingType.FACTORY) 
                {
                    this.selectedFactory = data as Factory
                }
            }
        },
        changeSelectedFactoryReceipe(item: Item){
            if(!this.selectedFactory) return
            this.selectedFactory.output = item
          
            let input: Item | Resource | undefined
          
            if(item.receipe.resources){
              input = item.receipe.resources[0]
            } else if(item.receipe.items) {
              input = item.receipe.items[0]
            }
          
            if(input) this.selectedFactory.input = input
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
            }
          }
          
    }
})