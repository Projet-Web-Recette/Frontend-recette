<script setup lang="ts">
import { authenticationStore } from '@/stores/authenticationStore';
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Receipe, Resource } from '@/types';
import { createConvoyer, createFactory, createMiner, launchGame} from '@/gameData/gameWorld';
import ConvoyerDisplay from '@/components/convoyerDisplay.vue';
import quantityDisplay from '@/components/quantityDisplay.vue';
import draggable from '@/components/draggable.vue'
import { ref } from 'vue';
import { Convoyer, type Display } from '@/gameData/types';


console.log(authenticationStore().isAdmin);

const game = gameStore()

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

const convoyer1 = createConvoyer(miner1.data, smelter1.data)

game.updatables.push(miner1.updatable)
game.updatables.push(miner2.updatable)
game.updatables.push(smelter1.updatable)
game.updatables.push(convoyer1.updatable)

const entities = ref<{type: string, displayData: Display, data: any}[]>([
  {type: 'miner', displayData: miner1.data.displayData, data: miner1.data},
  {type: 'miner', displayData: miner2.data.displayData, data: miner2.data},
  {type: 'factory', displayData: smelter1.data.displayData, data: smelter1.data}
])
const convoyerList = ref<any[]>([])

convoyerList.value.push(convoyer1.data)

// game.miners.push(miner1.data)
// game.convoyers.push(convoyer1.data)


launchGame()

const gameWindowRef = ref<Element>()

function addEntity(event: MouseEvent){
  const miner = createMiner(iron, {x: event.x, y: event.y})
  game.updatables.push(miner.updatable)
  const  {height, width, src, x, y} = miner.data.displayData
  entities.value.push({type: 'miner', data: miner.data, displayData:{height, src, width, x:x.value, y:y.value}})
}

</script>

<template>
  <div class="gameWindow" @mousedown="addEntity($event)" v-if="entities">

    <draggable v-for="({displayData, type, data}, index) in entities" :key="index"
              :height="displayData.height" 
              :width="displayData.width" 
              :left="displayData.x" 
              :top="displayData.y"
              @update-pos="({x, y}) => { displayData.x = x; displayData.y = y}">
      <factoryDisplay :display="displayData">
        <div>
          <quantityDisplay v-if="type === 'factory'"
            :logo-path="data.input.logoPath" 
            :quantity="data.inQuantity" />

          <quantityDisplay v-if="type === 'miner' || type === 'factory'"
            :logo-path="data.output.logoPath" 
            :quantity="data.quantity" />

        </div>
      </factoryDisplay>
    </draggable>

    <ConvoyerDisplay :convoyers="[convoyer1.data]">
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
