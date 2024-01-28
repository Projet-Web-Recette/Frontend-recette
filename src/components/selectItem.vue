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
    flex-direction: row;
    padding: 5px;
}

.itemSelector > * {
    margin: 5px;
    cursor: pointer;
}

.itemSelector img {
    width: 50px;
    height: 50px;
}

.itemSelector p {
    width: 50px;
    font-size: 12px;
}
</style>