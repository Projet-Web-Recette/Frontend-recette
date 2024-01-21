<template>
    <div class="convoyer" :style="{
        left: convoyer.from.displayData.x + 'px', 
        top: convoyer.from.displayData.y + 'px'}">
        <svg height="400" width="400">
            <line 
                :x1="convoyer.from.displayData.x" :x2="convoyer.to.displayData.x"
                :y1="convoyer.from.displayData.y" :y2="convoyer.to.displayData.y"
                style="stroke: black; stroke-width: 2;"
            ></line>
        </svg>
    </div>
</template>

<script setup lang="ts">
import type { Convoyer } from '@/gameData/types';

const props = defineProps<{convoyer: Convoyer}>()

</script>


<style>
.convoyer {
    position: absolute;
}
</style>