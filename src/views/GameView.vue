<script setup lang="ts">
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Receipe, Resource } from '@/types';
import { createConveyer, createFactory, createMiner, launchGame} from '@/gameData/gameWorld';
import ConveyerDisplay from '@/components/conveyerDisplay.vue';
import quantityDisplay from '@/components/quantityDisplay.vue';
import draggable from '@/components/draggable.vue'
import { ref, toRaw, watch, type VNodeRef } from 'vue';
import { type ConveyerDisplayData, type Factory, type Miner, InteractionMode } from '@/gameData/types';
import WindowComponent from '@/components/windowComponent.vue';
import SelectItem from '@/components/selectItem.vue';


const game = gameStore()
launchGame()

const iron: Resource = {
    id: 'rsc2',
    name: 'Fer',
    logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/8/87/Iron_Ore.png'
}

const cooper: Resource = {
    id: 'rsc1',
    name: 'cuivre',
    logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/7/78/Copper_Ore.png'
}

const ironIngotReceipe: Receipe = {
    id: 'rcp1',
    resources: [iron]
}

const ironIngot: Item = {
    id: 'itm1',
    logoPath: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/0/0a/Iron_Ingot.png",
    name: "Lingot de fer",
    receipe: ironIngotReceipe
}

const cooperIngotReceipe: Receipe = {
    id: 'rcp2',
    resources: [cooper]
}

const cooperIngot: Item = {
    id: 'itm2',
    logoPath: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/0/00/Copper_Ingot.png",
    name: "Lingot de cuivre",
    receipe: cooperIngotReceipe
}


const miner1 = createMiner(iron, {x: 0, y: 0})
const miner2 = createMiner(cooper, {x: 300, y: 300})


const smelter1 = createFactory(ironIngot, {x:300, y:300})
const smelter2 = createFactory(ironIngot, {x:600, y:300})

const conveyer1 = createConveyer(miner1.data, smelter1.data)
const conveyer2 = createConveyer(miner2.data, smelter2.data)

game.updatables.push(miner1.updatable)
game.updatables.push(miner2.updatable)
game.updatables.push(smelter1.updatable)
game.updatables.push(smelter2.updatable)
game.updatables.push(conveyer1.updatable)

const entities = ref<{type: string, data: any}[]>([
  {type: 'miner', data: miner1.data},
  {type: 'miner', data: miner2.data},
  {type: 'factory', data: smelter1.data},
  {type: 'factory', data: smelter2.data}
])
const conveyerList = ref<ConveyerDisplayData[]>([])

conveyerList.value.push(conveyer1.data.displayData)

const selectedMode = ref<InteractionMode>()
const selectBuild = ref<'miner' | 'factory'>()

watch(() => selectedMode.value, (value) => {
  selectedElement = undefined
  selectedFactory = undefined
})

function addEntity(event: MouseEvent){
  const miner = createMiner(iron, {x: event.offsetX, y: event.offsetY})
  game.updatables.push(miner.updatable)
  entities.value.push({type: 'miner', data: miner.data})
}

function mouseDownHandler(event: MouseEvent){
  if(event.button === 0){
    if(selectedMode.value === InteractionMode.BUILD){
      addEntity(event)
    }
    else{
      console.log(`action selected: ${selectedMode.value}`)
    }
  }
}

function placeConveyer(from: Factory | Miner, to: Factory){
  const conveyer = createConveyer(from, to)
  game.updatables.push(conveyer.updatable)
  conveyerList.value.push(conveyer.data.displayData)
}

let selectedElement: Factory | Miner | undefined
let selectedFactory: Factory | undefined

function selectItem(data: Factory | Miner, type: string){
  if(selectedMode.value === 'conveyer'){
    if(!selectedElement){
      selectedElement = data
    } else {
      if(type === 'factory'){
        placeConveyer(toRaw(selectedElement), toRaw(data) as Factory)
      }
      selectedElement = undefined
    }
  } else {
    selectedElement = data
    if(type === 'factory') selectedFactory = data as Factory
    selectResourceWindow.value = true
  }
}

function changeFactoryReceipe(factory: Factory, item: Item){
  factory.output = item

  let input: Item | Resource | undefined

  if(item.receipe.resources){
    input = item.receipe.resources[0]
  } else if(item.receipe.items) {
    input = item.receipe.items[0]
  }

  if(input) factory.input	= input
}

const selectResourceWindow = ref(false)


const windowOpen= ref(true)

</script>

<template>
  <div id="ui">
    <div style="background-color: lightgrey;">
      <h1>Mode sélectionné: {{ selectedMode }}</h1>
      <ul>
        <li v-for="mode in InteractionMode" @click.stop="selectedMode = mode">{{ mode }}</li>
      </ul>
    </div>

    <h1 @click="windowOpen = true" v-if="!windowOpen">Menu</h1>
  </div>


  <WindowComponent v-model="selectResourceWindow">
    <SelectItem :item-list="[ironIngot, cooperIngot]" @item-selected="(item: Item) => { if(selectedFactory) changeFactoryReceipe(selectedFactory, item)}"></SelectItem>
  </WindowComponent>

  <div class="gameWindow" @mousedown="mouseDownHandler($event)" v-if="entities">

    <draggable v-for="({type, data}, index) in entities" :key="index"
              :height="data.displayData.height" 
              :width="data.displayData.width" 
              :left="data.position.x" 
              :top="data.position.y"
              :disable="() => selectedMode === 'conveyer'"
              @update-pos="({x, y}) => { data.position.x = x; data.position.y = y}">
      <div @click="selectItem(data, type)">
        <factoryDisplay :display="data.displayData">
          <div>
            <quantityDisplay v-if="type === 'factory'"
              :logo-path="data.input.logoPath" 
              :quantity="data.inQuantity" />
  
            <quantityDisplay v-if="type === 'miner' || type === 'factory'"
              :logo-path="data.output.logoPath" 
              :quantity="data.quantity" />
  
          </div>
        </factoryDisplay>
      </div>
    </draggable>

    <ConveyerDisplay :conveyers="(conveyerList)">
    </ConveyerDisplay>
    <!-- <factoryDisplay :display="miner2.displayData"></factoryDisplay> -->
  </div>
</template>

<style>
.gameWindow {
  position: relative;
  overflow: hidden;
  width: 100vh;
  height: 100vh;
}


#ui {
  position: absolute;
  left: 100px;
}

</style>
