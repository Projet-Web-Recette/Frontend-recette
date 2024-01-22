<template>
    <div class="convoyers">
        <svg height="100%" width="100%">
            <g v-for="({x1, x2, y1, y2}, index) in convoyers" :key="'conv' + index">
                <defs>
                    <linearGradient :id="`e${index}`" :x1="x1" :y1="y1" :x2="x2" :y2="y2" gradientUnits="userSpaceOnUse">
                        <stop stop-color="red" offset="0" />
                        <stop stop-color="steelblue" offset="1" />
                    </linearGradient>
                </defs>
        
                <line
                    :x1="x1" :y1="y1" :x2="x2" :y2="y2"
                    :style="{stroke:`url(#e${index})`, strokeWidth: 5}"
                ></line>
            </g>
        </svg>
    </div>
</template>

<script setup lang="ts">
import type { ConvoyerDisplayData } from '@/gameData/types';

defineProps<{convoyers: {x1: number, x2: number, y1: number, y2: number}[]}>()

</script>


<style>
.convoyers {
    width: 100%;
    height: 100%;
}
</style>