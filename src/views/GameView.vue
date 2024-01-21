<script setup lang="ts">
import { authenticationStore } from '@/stores/authenticationStore';
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Receipe, Resource } from '@/types';
import { createConvoyer, createFactory, createMiner, launchGame} from '@/gameData/gameWorld';
import ConvoyerDisplay from '@/components/convoyerDisplay.vue';


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



// game.miners.push(miner1.data)
// game.convoyers.push(convoyer1.data)


launchGame()




</script>

<template>
  <div class="gameWindow">
    <factoryDisplay :display="miner1.data.displayData">
      <div style="display: flex; flex-direction: row; background-color: white;">
        <h1 style="width: fit-content;">{{ miner1.data.quantity }}</h1>
        <img :src="miner1.data.output.logoPath" style="width: 50px;">
      </div>
      <h1 style="color: white;" >+ 1</h1>
    </factoryDisplay>

    <factoryDisplay :display="smelter1.data.displayData">
      <div style="display: flex; flex-direction: row; background-color: white;">
        <h1 style="width: fit-content;">{{ smelter1.data.quantity }}</h1>
        <img :src="smelter1.data.output.logoPath" style="width: 50px;">
      </div>
    </factoryDisplay>

    <ConvoyerDisplay :convoyer="convoyer1.data">
    </ConvoyerDisplay>
    <!-- <factoryDisplay :display="miner2.displayData"></factoryDisplay> -->
  </div>
</template>

<style>
.gameWindow {
  position: relative;
}


</style>
