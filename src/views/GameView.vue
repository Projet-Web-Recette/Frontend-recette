<script setup lang="ts">
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Machine, Resource } from '@/types';
import { conveyerImg, launchGame, mergerImg, splitterImg} from '@/gameData/gameWorld';
import ConveyerDisplay from '@/components/conveyerDisplay.vue';
import quantityDisplay from '@/components/quantityDisplay.vue';
import draggable from '@/components/draggable.vue'
import { ref, toRaw, watch } from 'vue';
import { InteractionMode, BuildingType, type Building } from '@/gameData/types';
import WindowComponent from '@/components/windowComponent.vue';
import SelectItem from '@/components/selectItem.vue';
import IconUI from '@/components/iconUI.vue';
import InventoryItem from '@/components/invetoryItem.vue';

const game = gameStore()

game.loadGame()

launchGame()


let lastCamPos = {x: 0, y: 0}
function mouseDownHandler(event: MouseEvent){
  if(event.button === 0){
    if(game.selectedMode === InteractionMode.BUILD && game.selectedBuild !== BuildingType.CONVEYER){
      if(game.selectedMachineBuild?.id){
        game.addEntity(game.selectedBuild, {coords:{x: event.offsetX, y: event.offsetY}, buildingGeneral: game.buildingGeneral.get(game.selectedMachineBuild.id + "") as any})
      } else {
        game.addEntity(game.selectedBuild, {coords:{x: event.offsetX, y: event.offsetY}})
      }
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


function canDisplayInput(machineId: string, data: Building){
  const bg = game.buildingGeneral.get(machineId)
  const {inputs} = data
  const response = bg && bg.numberOfInputs > 0 && inputs && inputs.length > 0 && inputs[0].ingredient
  return response
}

const specialMachines: {name: string, type: BuildingType, iconPath: string}[] = [
  {name: 'Splitter', type: BuildingType.SPLITTER, iconPath: splitterImg},
  {name: 'Merger', type: BuildingType.MERGER, iconPath: mergerImg},
  {name: 'Conveyor', type: BuildingType.CONVEYER, iconPath: conveyerImg}
] 

</script>

<template>
  <div id="gameWindow">
    <div id="gameViewport" @mousedown="mouseDownHandler($event)">
      <div class="camera" :style="{ left: game.cameraLocation.x + 'px', top:game.cameraLocation.y + 'px', minWidth:'100vw', width: (2000-game.cameraLocation.x) + 'px'}">
        <draggable v-for="({type, data, machineId}, index) in [...game.entities.values()].filter(({type}) => type !== BuildingType.CONVEYER)" :key="index"
                  :height="data.displayData.height" 
                  :width="data.displayData.width" 
                  :left="data.position.x"
                  :top="data.position.y"
                  :disable="() => game.selectedMode !== InteractionMode.MOVE"
                  @update-pos="({x, y}) => { data.position.x = x; data.position.y = y}">
          <div class="factory" @mousedown="game.selectElement(data, type)" :class="data.uuid === game.selectedElement?.uuid ? 'buildingSelected' : ''">
            <factoryDisplay :display="data.displayData">
              <div class="BuildingInfos">
                <div v-if="canDisplayInput(machineId + '', data)">
                  <p>In:</p>
                  <quantityDisplay v-for="input in data.inputs"
                    :logo-path="input.ingredient.logoPath" 
                    :quantity="Math.round(input.quantity)" />
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
  
      <div id="ui" @mousedown.stop>
        <div>
          <div id="iconDisplay">
            <button @click="game.saveGame()" id="saveBtn">Save</button>
            <IconUI :action-name="InteractionMode.BUILD" icon-path="icons/hammer.png" @icon-selected="game.selectMode(InteractionMode.BUILD)" :class="game.selectedMode === InteractionMode.BUILD ? 'iconSelected' : ''"></IconUI>
            <IconUI :action-name="InteractionMode.INTERACT" icon-path="icons/click.png" @icon-selected="game.selectMode(InteractionMode.INTERACT)" :class="game.selectedMode === InteractionMode.INTERACT ? 'iconSelected' : ''"></IconUI>
            <IconUI :action-name="InteractionMode.MOVE" icon-path="icons/move.png" @icon-selected="game.selectMode(InteractionMode.MOVE)" :class="game.selectedMode === InteractionMode.MOVE ? 'iconSelected' : ''"></IconUI>
            <IconUI :action-name="InteractionMode.CAMERA" icon-path="icons/camera.png" @icon-selected="game.selectMode(InteractionMode.CAMERA)" :class="game.selectedMode === InteractionMode.CAMERA ? 'iconSelected' : ''"></IconUI>
            <IconUI :action-name="InteractionMode.DELETE" icon-path="icons/demolition.png" @icon-selected="game.selectMode(InteractionMode.DELETE)" :class="game.selectedMode === InteractionMode.DELETE ? 'iconSelected' : ''"></IconUI>
            <IconUI action-name="Stock" icon-path="icons/box.png" @icon-selected="inventoryWindowOpen = true"></IconUI>
          </div>
          <div id="buildingMenu" v-if="game.selectedMode === InteractionMode.BUILD" @mousedown.stop>
            <div id="buildingList">
              <div v-for="specialMachine in specialMachines" @click="game.selectedBuild = specialMachine.type" class="buildSelection" :class="{buildSelected: game.selectedBuild === specialMachine.type}">
                <img :src="specialMachine.iconPath" style="height: 80px;" />
                <p>{{ specialMachine.name }}</p>
              </div>
              
              <div v-for="{machine} in game.buildingGeneral.values()" @click="() => {
                  game.selectedBuild = BuildingType.MACHINE
                  game.selectMachine(machine)
                }" class="buildSelection" :class="{buildSelected: game.selectedMachineBuild?.id === machine.id && game.selectedBuild === BuildingType.MACHINE}" >
                <img :src="machine.logoPath" style="height: 80px;" />
                <p>{{ machine.name }}</p>
              </div>
            </div>
          </div>

          <WindowComponent v-model="windowOpen" left="10px" top="10px" title="Select output">
            <div style="min-width: 400px;">
              <div style="background-color: orange; cursor: pointer;width: fit-content;padding: 2px; margin: 5px;" @click="disconnectConveyersClicked">
                <h3>Disconnect conveyers</h3>
              </div>
              <div style="background-color: red; cursor: pointer;" @click="game.storeSelectedElementItem"><h3>Collect</h3></div>
              <SelectItem :ingredient-list="game.getItemListSelectedBuild()" @ingredient-selected="(item: Item) => {game.changeSelectedBuildingOutput(item)}"></SelectItem>
              <SelectItem v-if="game.selectedElementType === BuildingType.MERGER || game.selectedElementType === BuildingType.SPLITTER" :ingredient-list="game.allResources" @ingredient-selected="(resource: Resource) => {game.changeSelectedBuildingOutput(resource)}"></SelectItem>
            </div>
          </WindowComponent>
        </div>

        <div v-if="game.isProcessing" id="processing">
          <img :src="'src/assets/logo.png'" />
          <h1>Processing</h1>
        </div>
      </div>
    </div>
  </div>


</template>

<style>
#gameWindow {
  overflow: hidden;
  position: relative;
  width: 100vw;
  height: 100vh;
}

#gameViewport {
  overflow: hidden;
}

.camera {
  background-image: url("/src/assets/satysfactory_high.jpg");
  position: relative;
  height: fit-content;
  overflow: unset;
}

.factory {
  width: fit-content;
  height: fit-content;
}


#ui {
  position: absolute;
  left: 30px;
  top: 20px;
  width: 500px;
}

#saveBtn {
  background-color: orange;
  color: white;
  border-radius: 5px;
  padding: 2px;
}

#iconDisplay {
  display: flex;
  flex-direction: row;
}

.iconSelected {
  background-color: #707070;
}

#buildingMenu {
  background-color: lightgrey; 
  display: block; 
  height: 60%;
  margin-top: 10px;
  border-radius: 5px;
}

#buildingList {
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
}


.buildSelection {
  cursor: pointer;
  width: 100px;
  margin: 10px;
  color: white;
  background-color: #4b4b4b;
  border-radius: 5px;
}

.buildSelected {
  background-color: #ff5a00;
}

.buildSelection > * {
  margin: auto;
  text-align: center;
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

#processing {
  position: fixed;
  bottom: 50px;
  left: 50px;
  width: fit-content;
}

#processing > h1 {
  border-radius: 5px;
  padding: 7px;
  margin-bottom: 5px;
  background-color: white;
}

#processing > img {
  margin: auto;
  width: 50px;
  animation: rotation 2s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}

</style>
