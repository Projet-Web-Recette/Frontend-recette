<template>
    <div class="window" v-if="visible">
        <div class="alignCross"></div>
        <img src="/icons/cross.png" id="close" @click="close">
        <div id="windowContent">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';


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
    left: 100px;
    top: 100px;
    display: flex;
    flex-direction: column;
    background-color: #868686;
    color: #EFEFEF;
}

#close {
    width: 40px;
    height: 40px;
    margin: 5px;
    margin-left: auto;
}

#windowContent {
}
</style>