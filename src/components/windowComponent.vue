<template>
    <div class="window" v-if="visible">
        <div id="close" @click="close"></div>
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
    left: 0;
    display: flex;
    flex-direction: column;
    background-color: white;
}

#close {
    width: 50px;
    height: 50px;
    background-color: red;
}

#windowContent {
}
</style>