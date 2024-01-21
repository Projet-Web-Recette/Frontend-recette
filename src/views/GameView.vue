<script setup lang="ts">
import type { Miner } from '@/gameData/types';
import { authenticationStore } from '@/stores/authenticationStore';
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Resource } from '@/types';
import {Minerclass} from '@/gameData/gameWorld';
import { ref } from 'vue';


console.log(authenticationStore().isAdmin);

const game = gameStore()

const cooper = {
  id: 'rsc1',
  name: 'cuivre',
  logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/7/78/Copper_Ore.png'
} as Resource

const minerInterface: Miner = {
  displayData: {
    x: 0, 
    y: 0,
    src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/c/cf/Miner_Mk.1.png"
  },
  output: cooper,
  rate: 20,
  quantity: ref(0)
}

const miner1 = new Minerclass(minerInterface)

game.addMiner(miner1)

setInterval(() => {
  game.tick()
}, 1000)

// const miner2: Miner = {
//   displayData: {
//     x: 200, 
//     y: 50,
//     src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/c/cf/Miner_Mk.1.png"
//   },
//   output: cooper,
//   rate: 20,
//   quantity: 0
// }


</script>

<template>
  <div class="gameWindow">
    <factoryDisplay :display="miner1.displayData">
      <div style="display: flex; flex-direction: row; background-color: white;">
        <h1 style="width: fit-content;">{{ miner1.quantity }}</h1>
        <img :src="miner1.output.logoPath" style="width: 50px;">
      </div>
    </factoryDisplay>
    <!-- <factoryDisplay :display="miner2.displayData"></factoryDisplay> -->
  </div>
</template>

<style>
.gameWindow {
  position: relative;
}


</style>
