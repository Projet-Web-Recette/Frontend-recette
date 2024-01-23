<template>
    <div class="itemSelector">
        <div v-for="item in itemList" @click="emit('itemSelected', item)">
            <img :src="item.logoPath">
            <p>{{ item.name }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Item } from '@/types';

const props = defineProps<{itemList: Item[]}>()


const emit = defineEmits<{
  (e: 'itemSelected', item: Item): void
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