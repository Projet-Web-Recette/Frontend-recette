<script setup lang="ts">
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Receipe, Resource } from '@/types';
import { createConveyer, createFactory, createMiner, launchGame} from '@/gameData/gameWorld';
import ConveyerDisplay from '@/components/conveyerDisplay.vue';
import quantityDisplay from '@/components/quantityDisplay.vue';
import draggable from '@/components/draggable.vue'
import { ref, toRaw, watch, type VNodeRef } from 'vue';
import { type ConveyerDisplayData, type Factory, type Miner, InteractionMode, BuildingType } from '@/gameData/types';
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


game.addEntity(BuildingType.MINER, {output: iron, coords: {x:0, y:0}})
game.addEntity(BuildingType.MINER, {output: cooper, coords: {x: 300, y: 300}})

game.addEntity(BuildingType.FACTORY, {output: ironIngot, coords: {x: 300, y: 300}})
game.addEntity(BuildingType.FACTORY, {output: ironIngot, coords: {x: 600, y: 300}})


const selectBuild = ref<'miner' | 'factory'>()

function mouseDownHandler(event: MouseEvent){
  if(event.button === 0){
    if(game.selectedMode === InteractionMode.BUILD){
      // game.addEntity({x: event.offsetX, y: event.offsetY})
    }
    else{
      console.log(`action selected: ${game.selectedMode}`)
    }
  }
}

watch(() => game.selectedFactory, (value) => {
  if(value && game.selectedMode === InteractionMode.INTERACT){
    windowOpen.value = true
  }
})


const windowOpen= ref(false)

</script>

<template>
  <div id="ui">
    <div style="background-color: lightgrey;">
      <h1>Mode sélectionné: {{ game.selectedMode }}</h1>
      <ul>
        <li v-for="mode in InteractionMode" @click.stop="game.selectMode(mode)">{{ mode }}</li>
      </ul>
    </div>

    <h1 @click="windowOpen = true" v-if="!windowOpen">Menu</h1>
  </div>


  <WindowComponent v-model="windowOpen">
    <SelectItem :item-list="[ironIngot, cooperIngot]" @item-selected="(item: Item) => { if(game.selectedFactory) game.changeSelectedFactoryReceipe(item)}"></SelectItem>
  </WindowComponent>

  <div class="gameWindow" @mousedown="mouseDownHandler($event)">

    <draggable v-for="({type, data}, index) in game.entities" :key="index"
              :height="data.displayData.height" 
              :width="data.displayData.width" 
              :left="data.position.x" 
              :top="data.position.y"
              :disable="() => game.selectedMode === InteractionMode.CONVEYER"
              @update-pos="({x, y}) => { data.position.x = x; data.position.y = y}">
      <div @click="game.selectItem(data, type)">
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

    <ConveyerDisplay :conveyers="game.conveyers.map((conveyer) => conveyer.displayData)">
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
