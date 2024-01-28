<template>
    <div class="iconUI" @click="emit('iconSelected')">
        <h3>{{ actionName }}</h3>
        <img :src="iconPath">
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    actionName: string,
    iconPath: string
}>()

const emit = defineEmits<{
  (e: 'iconSelected'): void
}>()

</script>

<style>
.iconUI {
    display: flex;
    flex-direction: column;
    padding: 5px;
    margin: 5px;
    color: #EFEFEF;
    background-color: #222222;
    width: 80px;
    cursor: pointer;
}

.iconUI > * {
    margin: auto;
    opacity: 100%;
}

.iconUI > h3 {
    border-bottom: solid #ff5a00 3px;
    font-size: 20px;
    width: 100%;
    text-align: center;
}

.iconUI > img {
    margin-top: 5px;
    width: 50px;
    height: 50px;
}
</style>