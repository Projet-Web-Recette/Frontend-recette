<template>
    <div class="itemSelector">
        <div v-for="item in itemList" @click="emit('itemSelected', item)">
            <img :src="item.logoPath">
            <h1>{{ item.name }}</h1>
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