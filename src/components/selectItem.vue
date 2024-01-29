<template>
    <div class="itemSelector">
        <div v-for="ingredient in ingredientList" @click="emit('ingredientSelected', ingredient)">
            <img :src="ingredient.logoPath">
            <p>{{ ingredient.name }}</p>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends Resource | Item">
import type { Item, Resource } from '@/types';

const props = defineProps<{ingredientList: Array<T>}>()


const emit = defineEmits<{
  (e: 'ingredientSelected', ingredient: T): void
}>()

</script>

<style>
.itemSelector {
    display: flex;
    flex-flow: wrap;
    padding: 5px;
}

.itemSelector > * {
    margin: 5px;
    cursor: pointer;
    background-color: #4b4b4b;
    border-radius: 5px;
    width: 70px;
}

.itemSelector img {
    width: 50px;
    height: 50px;
    margin: auto;
}

.itemSelector p {
    width: 100%;
    font-size: 12px;
    text-align: center;
}
</style>