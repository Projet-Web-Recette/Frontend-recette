<script setup lang="ts">
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Machine, Receipe, Resource } from '@/types';
import { launchGame} from '@/gameData/gameWorld';
import ConveyerDisplay from '@/components/conveyerDisplay.vue';
import quantityDisplay from '@/components/quantityDisplay.vue';
import draggable from '@/components/draggable.vue'
import { ref, toRaw, watch, type VNodeRef } from 'vue';
import { InteractionMode, BuildingType, type Building } from '@/gameData/types';
import WindowComponent from '@/components/windowComponent.vue';
import SelectItem from '@/components/selectItem.vue';
import IconUI from '@/components/iconUI.vue';
import InventoryItem from '@/components/invetoryItem.vue';

const game = gameStore()

game.loadSave()

launchGame()


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

const hasOutput = [BuildingType.MERGER, BuildingType.SPLITTER]


function canDisplayInput(machineId: string, data: Building){
  const bg = game.buildingGeneral.get(machineId)
  const {inputs} = data
  const response = bg && bg.numberOfInputs > 0 && inputs && inputs.length > 0 && inputs[0].ingredient
  return response
}

</script>

<template>
  <div id="gameWindow">
    <div class="gameViewport" @mousedown="mouseDownHandler($event)">
      <div class="camera" :style="{ left: game.cameraLocation.x + 'px', top:game.cameraLocation.y + 'px', width: (1700-game.cameraLocation.x) + 'px' }">
        <draggable v-for="({type, data, machineId}, index) in [...game.entities.values()].filter(({type}) => type !== BuildingType.CONVEYER)" :key="index"
                  :height="data.displayData.height" 
                  :width="data.displayData.width" 
                  :left="data.position.x"
                  :top="data.position.y"
                  :disable="() => game.selectedMode !== InteractionMode.MOVE"
                  @update-pos="({x, y}) => { data.position.x = x; data.position.y = y}">
          <div class="factory" @mousedown="game.selectElement(data, type)" :class="data === game.selectedElement ? 'buildingSelected' : ''">
            <factoryDisplay :display="data.displayData">
              <div class="BuildingInfos">
                <div v-if="canDisplayInput(machineId + '', data)">
                  <p>In:</p>
                  <quantityDisplay v-for="input in data.inputs"
                    :logo-path="input.ingredient.logoPath" 
                    :quantity="input.quantity" />
                </div>
      
                <div>
                  <p>{{ type === BuildingType.MERGER ? ' (merger) ' : type === BuildingType.SPLITTER ? ' (splitter)' : '' }} Out:</p>
                  <quantityDisplay v-if="data.output"
                    :logo-path="data.output.logoPath" 
                    :quantity="data.outQuantity" />
                </div>
              </div>
            </factoryDisplay>
          </div>
        </draggable>
    
        <ConveyerDisplay :conveyers="[...game.entities.values()].filter(({type}) => type === BuildingType.CONVEYER).map((conveyer) => conveyer.data.displayData)">
        </ConveyerDisplay>
      </div>
  
      <WindowComponent v-model="inventoryWindowOpen" right="100px" top="0px" title="Inventory">
        <div class="inventory">
          <InventoryItem v-for="{data, quantity} in game.playerInventory.values()" :item="data" :quantity="quantity" />
        </div>
      </WindowComponent>
  
      <div id="ui">
        <div>
          <div id="iconDisplay">
            <IconUI :action-name="InteractionMode.BUILD" icon-path="icons/hammer.png" @icon-selected="game.selectMode(InteractionMode.BUILD)" :class="game.selectedMode === InteractionMode.BUILD ? 'iconSelected' : ''"></IconUI>
            <IconUI :action-name="InteractionMode.INTERACT" icon-path="icons/click.png" @icon-selected="game.selectMode(InteractionMode.INTERACT)" :class="game.selectedMode === InteractionMode.INTERACT ? 'iconSelected' : ''"></IconUI>
            <IconUI :action-name="InteractionMode.MOVE" icon-path="icons/move.png" @icon-selected="game.selectMode(InteractionMode.MOVE)" :class="game.selectedMode === InteractionMode.MOVE ? 'iconSelected' : ''"></IconUI>
            <IconUI :action-name="InteractionMode.CAMERA" icon-path="icons/camera.png" @icon-selected="game.selectMode(InteractionMode.CAMERA)" :class="game.selectedMode === InteractionMode.CAMERA ? 'iconSelected' : ''"></IconUI>
            <IconUI action-name="Stock" icon-path="icons/box.png" @icon-selected="inventoryWindowOpen = true"></IconUI>
          </div>
          <div style="background-color: lightgrey;" v-if="game.selectedMode === InteractionMode.BUILD">
            <h1>Building sélectionné: {{ game.selectedBuild === BuildingType.MACHINE ? game.selectedMachineBuild?.name : game.selectedBuild }}</h1>
            
            <div @click="game.selectedBuild = BuildingType.CONVEYER">
              <h1>CONVEYER</h1>
            </div>
            <div @click="game.selectedBuild = BuildingType.SPLITTER">
              <h1>SPLITTER</h1>
            </div>
            <div @click="game.selectedBuild = BuildingType.MERGER">
              <h1>MERGER</h1>
            </div>
            
            <div v-for="{machine} in game.buildingGeneral.values()" @click="() => {
                game.selectedBuild = BuildingType.MACHINE
                game.selectMachine(machine)
              }">
              <img :src="machine.logoPath" style="height: 80px;" />
              <p>{{ machine.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <draggable :disable="() => false" :height="0" :left="100" :top="100" :width="0">
    <WindowComponent v-model="windowOpen" left="10px" top="10px" title="Select output">
      <div style="min-width: 400px;">
        <div style="background-color: orange; cursor: pointer;width: fit-content;padding: 2px; margin: 5px;" @click="disconnectConveyersClicked">
          <h3>Disconnect conveyers</h3>
        </div>
        <SelectItem :ingredient-list="game.getItemListSelectedBuild()" @ingredient-selected="(item: Item) => { 
          if(game.selectedElement) {
            game.changeSelectedBuildingOutput(item)
          } else if (game.selectedElementType === BuildingType.MERGER || game.selectedElementType === BuildingType.SPLITTER) {
            game.changeSelectedLogisticItem(item)
          }}"></SelectItem>
        <SelectItem v-if="game.selectedElementType === BuildingType.MERGER || game.selectedElementType === BuildingType.SPLITTER" :ingredient-list="[iron, cooper]" @ingredient-selected="(resource: Resource) => { if(game.selectedElementType === BuildingType.MERGER || game.selectedElementType === BuildingType.SPLITTER) game.changeSelectedLogisticItem(resource)}"></SelectItem>
      </div>
    </WindowComponent>
  </draggable>


</template>

<style>
#gameWindow {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.gameViewport {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.camera {
  background-image: url("/src/assets/satysfactory_high.jpg");
  position: relative;
}

.factory {
  width: fit-content;
  height: fit-content;
}


#ui {
  position: absolute;
  left: 100px;
  top: 0px;
}

#iconDisplay {
  display: flex;
  flex-direction: row;
}

.iconSelected {
  background-color: #707070;
}

.BuildingInfos {
  display: flex;
  flex-direction: row;
  background-color: #4b4b4b;
  color: #EFEFEF;
  border-radius: 5px;
}

.BuildingInfos > div {
  margin: 3px;
  padding: 2px;
  border-radius: 5px;
  flex: 1;
  background-color: #707070;
}

.BuildingInfos > div > p {
  margin-bottom: 2px;
}

.buildingSelected {
  border: solid #ff5a00 2px;
}

.inventory {
  width: 400px; 
  height: 100%;
  margin: 5px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
}

</style>
