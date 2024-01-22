<script setup lang="ts">
import { authenticationStore } from '@/stores/authenticationStore';
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Receipe, Resource } from '@/types';
import { createConvoyer, createFactory, createMiner, launchGame} from '@/gameData/gameWorld';
import ConvoyerDisplay from '@/components/convoyerDisplay.vue';
import quantityDisplay from '@/components/quantityDisplay.vue';
import draggable from '@/components/draggable.vue'
import { ref, toRaw, type VNodeRef } from 'vue';
import type { ConvoyerDisplayData, Factory, Miner } from '@/gameData/types';


const game = gameStore()
launchGame()

const iron: Resource = {
    id: 'rsc2',
    name: 'Fer',
    logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/8/87/Iron_Ore.png'
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


const miner1 = createMiner(iron, {x: 0, y: 0})
const miner2 = createMiner(iron, {x: 300, y: 300})


const smelter1 = createFactory(iron, ironIngot, {x:300, y:300})
const smelter2 = createFactory(iron, ironIngot, {x:600, y:300})

const convoyer1 = createConvoyer(miner1.data, smelter1.data)
const convoyer2 = createConvoyer(miner2.data, smelter2.data)

game.updatables.push(miner1.updatable)
game.updatables.push(miner2.updatable)
game.updatables.push(smelter1.updatable)
game.updatables.push(smelter2.updatable)
game.updatables.push(convoyer1.updatable)

const entities = ref<{type: string, data: any}[]>([
  {type: 'miner', data: miner1.data},
  {type: 'miner', data: miner2.data},
  {type: 'factory', data: smelter1.data},
  {type: 'factory', data: smelter2.data}
])
const convoyerList = ref<ConvoyerDisplayData[]>([])

convoyerList.value.push(convoyer1.data.displayData)

// game.miners.push(miner1.data)
// game.convoyers.push(convoyer1.data)


const gameWindowRef = ref<VNodeRef>()

const selectedMode = ref<'conveyer' | 'place'>()

function addEntity(event: MouseEvent){
  const miner = createMiner(iron, {x: event.offsetX, y: event.offsetY})
  game.updatables.push(miner.updatable)
  entities.value.push({type: 'miner', data: miner.data})
}

function mouseDownHandler(event: MouseEvent){
  if(event.button === 0){
    if(selectedMode.value === 'place'){
      addEntity(event)
    }
    else if(selectedMode.value !== 'conveyer'){
      console.error('action unknown')
    }
  }
}

function placeConveyer(from: Factory | Miner, to: Factory){
  const conveyerTest = createConvoyer(toRaw(from), toRaw(to))
  const convoyer = createConvoyer(from, to)
  game.updatables.push(conveyerTest.updatable)
  convoyerList.value.push(conveyerTest.data.displayData)
}

let selectedElement: Factory | Miner | undefined

function selectItem(data: Factory | Miner, type: string){
  console.log(data)
  if(selectedMode.value === 'conveyer'){
    if(!selectedElement){
      selectedElement = data
    } else {
      if(type === 'factory'){
        placeConveyer(selectedElement, data as Factory)
      }
      selectedElement = undefined
    }
  }
}

</script>

<template>
  <div>
    <h1>Mode sélectionné: {{ selectedMode }}</h1>
    <ul>
      <li @click.stop="() => selectedMode = 'place'">Placer</li>
      <li @click.stop="() => selectedMode = 'conveyer'">Conveyer</li>
    </ul>
  </div>
  <div class="gameWindow" @mousedown="mouseDownHandler($event)" v-if="entities" :ref="gameWindowRef">

    <draggable v-for="({type, data}, index) in entities" :key="index"
              :height="data.displayData.height" 
              :width="data.displayData.width" 
              :left="data.position.x" 
              :top="data.position.y"
              :disable="() => selectedMode === 'conveyer'"
              @update-pos="({x, y}) => { data.position.x = x; data.position.y = y}">
      <div @click="selectItem(data, type)" >
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

    <ConvoyerDisplay :convoyers="(convoyerList)">
    </ConvoyerDisplay>
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


</style>
