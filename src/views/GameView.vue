<script setup lang="ts">
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Receipe, Resource } from '@/types';
import { launchGame} from '@/gameData/gameWorld';
import ConveyerDisplay from '@/components/conveyerDisplay.vue';
import quantityDisplay from '@/components/quantityDisplay.vue';
import draggable from '@/components/draggable.vue'
import { ref, toRaw, watch, type VNodeRef } from 'vue';
import { InteractionMode, BuildingType } from '@/gameData/types';
import WindowComponent from '@/components/windowComponent.vue';
import SelectItem from '@/components/selectItem.vue';
import IconUI from '@/components/iconUI.vue';
import type windowComponentVue from '@/components/windowComponent.vue';

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


game.addEntity(BuildingType.MINER, {output: iron, coords: {x:50, y:50}})
game.addEntity(BuildingType.MINER, {output: cooper, coords: {x: 300, y: 300}})

game.addEntity(BuildingType.FACTORY, {coords: {x: 100, y: 500}})
game.addEntity(BuildingType.FACTORY, {coords: {x: 600, y: 300}})



let lastCamPos = {x: 0, y: 0}
function mouseDownHandler(event: MouseEvent){
  if(event.button === 0){
    if(game.selectedMode === InteractionMode.BUILD && game.selectedBuild !== BuildingType.CONVEYER){
      game.addEntity(game.selectedBuild, {coords:{x: event.offsetX, y: event.offsetY}})
    }
    else if(game.selectedMode === InteractionMode.CAMERA){
      game.resetSelectedElement()
      lastCamPos = {x: event.screenX, y: event.screenY}
      document.onmousemove = moveCamera
      document.onmouseup = () => document.onmousemove = null
    }
    else{
      console.log(`action selected: ${game.selectedMode}`)
    }
  }
}

function moveCamera(event: MouseEvent){
  const mouseMotion = {x: event.screenX - lastCamPos.x, y: event.screenY - lastCamPos.y}

  game.cameraLocation.x += mouseMotion.x
  game.cameraLocation.y += mouseMotion.y

  lastCamPos = {x: event.screenX, y: event.screenY}
}

watch(() => game.selectedElement, (value) => {
  if(value && game.selectedMode === InteractionMode.INTERACT){
    windowOpen.value = true
  }
})

function disconnectConveyersClicked() {
  if(!game.selectedElement) return
  const {selectedElement} = game
  const conveyersToDisconnect = toRaw(selectedElement.inputConveyerUid.concat(selectedElement.outputConveyerUid))
  conveyersToDisconnect.map((id: string) => {
      game.disconnectConveyer(id)
    })
  game.selectedElement.inputConveyerUid = []
  game.selectedElement.outputConveyerUid = []
}


const windowOpen= ref(false)
const inventoryWindowOpen = ref(false)

const hasOutput = [BuildingType.FACTORY, BuildingType.MINER, BuildingType.MERGER, BuildingType.SPLITTER]

</script>

<template>
  <div id="ui">
    <div style="background-color: lightgrey;">
      <h1>Mode sélectionné: {{ game.selectedMode }}</h1>
      <div id="iconDisplay">
        <IconUI :action-name="InteractionMode.BUILD" icon-path="icons/hammer.png" @icon-selected="game.selectMode(InteractionMode.BUILD)"></IconUI>
        <IconUI :action-name="InteractionMode.INTERACT" icon-path="icons/click.png" @icon-selected="game.selectMode(InteractionMode.INTERACT)"></IconUI>
        <IconUI :action-name="InteractionMode.MOVE" icon-path="icons/move.png" @icon-selected="game.selectMode(InteractionMode.MOVE)"></IconUI>
        <IconUI :action-name="InteractionMode.CAMERA" icon-path="icons/camera.png" @icon-selected="game.selectMode(InteractionMode.CAMERA)"></IconUI>
        <IconUI action-name="Stock" icon-path="icons/box.png" @icon-selected="inventoryWindowOpen = true"></IconUI>
      </div>
    </div>
    <div style="background-color: lightgrey;" v-if="game.selectedMode === InteractionMode.BUILD">
      <h1>Building sélectionné: {{ game.selectedBuild }}</h1>
      <ul>
        <li v-for="build in BuildingType" @click="game.selectedBuild = build">{{ build }}</li>
      </ul>
    </div>
  </div>

  <div class="gameWindow" @mousedown="mouseDownHandler($event)">
    <div class="camera" :style="{ left: game.cameraLocation.x + 'px', top:game.cameraLocation.y + 'px' }">
      <draggable v-for="({type, data}, index) in [...game.entities.values()].filter(({type}) => type !== BuildingType.CONVEYER)" :key="index"
                :height="data.displayData.height" 
                :width="data.displayData.width" 
                :left="data.position.x"
                :top="data.position.y"
                :disable="() => type === BuildingType.MINER || 
                          game.selectedMode !== InteractionMode.MOVE"
                @update-pos="({x, y}) => { data.position.x = x; data.position.y = y}">
        <div class="factory" @mousedown="game.selectElement(data, type)" :class="data === game.selectedElement ? 'buildingSelected' : ''">
          <factoryDisplay :display="data.displayData">
            <div class="BuildingInfos">
              <div v-if="(type === BuildingType.FACTORY) && data.input">
                <h3>In:</h3>
                <quantityDisplay
                  :logo-path="data.input.logoPath" 
                  :quantity="data.inQuantity" />
              </div>
    
              <div>
                <h3>Out{{ type === BuildingType.MERGER ? ' (merger) ' : type === BuildingType.SPLITTER ? ' (splitter)' : '' }}:</h3>
                <quantityDisplay v-if="data.output && hasOutput.includes(type)"
                  :logo-path="data.output.logoPath" 
                  :quantity="data.quantity" />
              </div>
            </div>
          </factoryDisplay>
        </div>
      </draggable>
  
      <ConveyerDisplay :conveyers="[...game.entities.values()].filter(({type}) => type === BuildingType.CONVEYER).map((conveyer) => conveyer.data.displayData)">
      </ConveyerDisplay>
    </div>
  </div>

  <draggable :disable="() => false" :height="0" :left="100" :top="100" :width="0">
    <WindowComponent v-model="windowOpen" left="10px" top="10px">
      <div style="background-color: orange;" @click="disconnectConveyersClicked">
        <h2>Disconnect conveyers</h2>
      </div>
      <SelectItem :ingredient-list="[ironIngot, cooperIngot]" @ingredient-selected="(item: Item) => { 
        if(game.selectedFactory) {
          game.changeSelectedFactoryReceipe(item)
        } else if (game.selectedElementType === BuildingType.MERGER || game.selectedElementType === BuildingType.SPLITTER) {
          game.changeSelectedLogisticItem(item)
        }}"></SelectItem>
      <SelectItem v-if="game.selectedElementType === BuildingType.MERGER || game.selectedElementType === BuildingType.SPLITTER" :ingredient-list="[iron, cooper]" @ingredient-selected="(resource: Resource) => { if(game.selectedElementType === BuildingType.MERGER || game.selectedElementType === BuildingType.SPLITTER) game.changeSelectedLogisticItem(resource)}"></SelectItem>
    </WindowComponent>
  </draggable>

  <WindowComponent v-model="inventoryWindowOpen" right="10px" top="10px">
    <div style="width: 400px; height: 100%;">

    </div>
    <ul>
      <li v-for="{item, quantity} in game.playerInventory.values()">
        {{ item.name }} : {{ quantity }}
      </li>
    </ul>
  </WindowComponent>
</template>

<style>
.gameWindow {
  position: relative;
  overflow: hidden;
  width: 100vh;
  height: 100vh;
}

.camera {
  position: absolute;
  width: 100%;
  height: 100%;
}

.factory {
  width: fit-content;
  height: fit-content;
}


#ui {
  position: absolute;
  left: 100px;
}

#iconDisplay {
  display: flex;
  flex-direction: row;
}

.BuildingInfos {
  display: flex;
  flex-direction: row;
  background-color: #4b4b4b;
  color: #EFEFEF;
  border-radius: 5px;
}

.BuildingInfos > div {
  margin: 5px;
  flex: 1;
}

.buildingSelected {
  border: solid #ff5a00 2px;
}

</style>
