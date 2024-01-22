<template>
    <div class="convoyers">
        <svg height="100%" width="100%">
            <g v-for="({x1, x2, y1, y2}, index) in simplerConvoyers" :key="'conv' + index">
                <defs>
                    <linearGradient :id="`e${index}`" :x1="x1.value" :y1="y1.value" :x2="x2.value" :y2="y2.value" gradientUnits="userSpaceOnUse">
                        <stop stop-color="red" offset="0" />
                        <stop stop-color="steelblue" offset="1" />
                    </linearGradient>
                </defs>
        
                <line
                    :x1="x1.value" :y1="y1.value" :x2="x2.value" :y2="y2.value"
                    :style="{stroke:`url(#e${index})`, strokeWidth: 5}"
                ></line>
            </g>
        </svg>
    </div>
</template>

<script setup lang="ts">
import type { Convoyer } from '@/gameData/types';
import { computed } from 'vue';

const props = defineProps<{convoyers: Convoyer[]}>()

const simplerConvoyers = computed(() => props.convoyers.map((convoyer) => {
    const {x: x1, y: y1} = convoyer.from.displayData
    const {x: x2, y: y2} = convoyer.to.displayData

    return {x1, x2, y1, y2}
}))

</script>


<style>
.convoyers {
    width: 100%;
    height: 100%;
}
</style>