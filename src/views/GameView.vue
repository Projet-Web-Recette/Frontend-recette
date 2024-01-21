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
import { Convoyer } from '@/gameData/types';


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


const smelter1 = createFactory(iron, ironIngot, {x:300, y:300})

const convoyer1 = createConvoyer(miner1.data, smelter1.data)

game.updatables.push(miner1.updatable)
game.updatables.push(smelter1.updatable)
game.updatables.push(convoyer1.updatable)


const conveyerList = ref<any[]>([])

conveyerList.value.push(convoyer1.data)

// game.miners.push(miner1.data)
// game.convoyers.push(convoyer1.data)


launchGame()

const gameWindowRef = ref<Element>()

</script>

<template>
  <div class="gameWindow">

    <draggable :height="miner1.data.displayData.height" 
                :width="miner1.data.displayData.width" 
                :left="miner1.data.displayData.x.value" 
                :top="miner1.data.displayData.y.value"
                @update-pos="({x, y}) => { miner1.data.displayData.x.value = x; miner1.data.displayData.y.value = y}">
      <factoryDisplay :display="miner1.data.displayData">
        <quantityDisplay 
          :logo-path="miner1.data.output.logoPath" 
          :quantity="miner1.data.quantity" />
      </factoryDisplay>
    </draggable>
    
    <draggable :height="smelter1.data.displayData.height" 
                :width="smelter1.data.displayData.width" 
                :left="smelter1.data.displayData.x.value" 
                :top="smelter1.data.displayData.y.value"
                @update-pos="({x, y}) => { smelter1.data.displayData.x.value = x; smelter1.data.displayData.y.value = y}">
      <factoryDisplay :display="smelter1.data.displayData">
        <div>
          <quantityDisplay 
            :logo-path="smelter1.data.input.logoPath" 
            :quantity="smelter1.data.inQuantity" />

          <quantityDisplay 
            :logo-path="smelter1.data.output.logoPath" 
            :quantity="smelter1.data.quantity" />

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
