<template>
    <div class="window" v-if="visible" :style="{left, top, right, bottom}">
        <div class="header">
            <h3>{{ title }}</h3>
            <div>
                <img src="/icons/cross.png" id="close" @click="close">
            </div>
        </div>
        <div id="windowContent">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';

const props = defineProps<{
    left?: string,
    right?: string,
    top?: string,
    bottom?: string,
    title: string
}>()


const visible = defineModel({
    default: true,
    required: false
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

function open() {
    visible.value = true
}

function close() {
    visible.value = false
    emit('close')
}

</script>

<style>
.window {
    position: absolute;
    width: fit-content;
    height: fit-content;
    min-height: 50px;
    display: flex;
    flex-direction: column;
    background-color: #868686;
    color: #EFEFEF;
}

.header {
    display: flex;
    width: 100%;
    background-color: #494949;
    position: static;
}

.header > * {
    background-color: #868686;
}

.header > h3 {
    border-top-right-radius: 5px;
    margin-bottom: 0px;
    margin-top: 5px;
    padding: 5px;
}

.header > div {
    position: absolute;
    right: 0px;
}

#close {
    cursor: pointer;
    margin: auto;
    width: 50px;
    height: 50px;
    padding: 10px;
}

.windowContent{
    background-color: #868686;
}
</style>