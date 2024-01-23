import { createConveyer, createFactory, createMiner, defaultResource } from "@/gameData/gameWorld";
import { BuildingType, InteractionMode, type Building, type Conveyer, type Factory, type Miner, type Updatable } from "@/gameData/types";
import type { Item, Resource } from "@/types";
import { defineStore } from "pinia";
import { toRaw } from "vue";

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
    entities: Array<{type: BuildingType, data: any}>,
    miners: Miner[],
    conveyers: Conveyer[],
    updatables: Updatable[],
    selectedMode: InteractionMode,
    selectedBuild: BuildingType,
    selectedElement?: Factory | Miner,
    selectedFactory: Factory | undefined
}


export const gameStore = defineStore('gameStore', {
    state: (): State => {
        return{
            entities: [],
            miners: [],
            conveyers: [],
            updatables: [],
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
        placeConveyer(from: Building, to: Factory){
            const conveyer = createConveyer(toRaw(from), toRaw(to))
            this.updatables.push(conveyer.updatable)
            this.conveyers.push(conveyer.data)
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
            if(type === BuildingType.MINER){
                const miner = createMiner(output ? output : defaultResource, coords)
                this.updatables.push(miner.updatable)
                this.miners.push(miner.data)
                this.entities.push({data: miner.data, type})
            } else if (type === BuildingType.FACTORY){
                const factory = createFactory(output as Item, coords)
                this.updatables.push(factory.updatable)
                this.entities.push({data: factory.data, type})
            }
          }
          
    }
})