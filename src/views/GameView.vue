<script setup lang="ts">
import type { Miner, Factory } from '@/gameData/types';
import { authenticationStore } from '@/stores/authenticationStore';
import { gameStore } from '@/stores/gameStore';
import factoryDisplay from '@/components/factoryDisplay.vue'
import type { Item, Receipe, Resource } from '@/types';
import {Minerclass, ConvoyerClass} from '@/gameData/gameWorld';
import { ref } from 'vue';
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



const minerInterface: Miner = {
  displayData: {
    x: 0, 
    y: 0,
    width: 100,
    height: 200,
    src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/c/cf/Miner_Mk.1.png"
  },
  output: iron,
  rate: 20,
  quantity: ref(0),
  take: () => 0
}

const miner1 = new Minerclass(minerInterface)

const smelter1Q = ref(0)

const smelter1: Factory = {
  displayData: {
    src: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/4/45/Smelter.png",
    x: 300,
    y: 300,
    width: 100,
    height: 200,
  },
  input: iron,
  output: ironIngot,
  quantity: smelter1Q,
  rate: 10,
  give: (newQuantity: number) => {
    smelter1Q.value += newQuantity
    return 0
  },
  take: () => 0
}

const convoyer1 = new ConvoyerClass({from: miner1, to: smelter1})

game.addMiner(miner1)
game.addConvoyer(convoyer1)

setInterval(() => {
  game.tick()
}, 1000)



</script>

<template>
  <div class="gameWindow">
    <factoryDisplay :display="miner1.displayData">
      <div style="display: flex; flex-direction: row; background-color: white;">
        <h1 style="width: fit-content;">{{ miner1.quantity }}</h1>
        <img :src="miner1.output.logoPath" style="width: 50px;">
      </div>
    </factoryDisplay>

    <factoryDisplay :display="smelter1.displayData">
      <div style="display: flex; flex-direction: row; background-color: white;">
        <h1 style="width: fit-content;">{{ smelter1.quantity }}</h1>
        <img :src="smelter1.output.logoPath" style="width: 50px;">
      </div>
    </factoryDisplay>

    <ConvoyerDisplay :convoyer="convoyer1">
    </ConvoyerDisplay>
    <!-- <factoryDisplay :display="miner2.displayData"></factoryDisplay> -->
  </div>
</template>

<style>
.gameWindow {
  position: relative;
}


</style>
